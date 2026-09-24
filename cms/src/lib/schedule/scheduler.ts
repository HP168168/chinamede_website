import { loadDotEnv } from '../env';
import { runTasks } from '../ai/run-tasks';
import { isValidCron, nextRunAt, systemTimeZone } from './cron';

/**
 * 内嵌调度器：让「三种生成方式」在 CMS 进程里自己跑起来。
 *
 *   now      手动生成    —— 后台点「立即生成」后任务落为 pending，调度器巡检到就立刻执行
 *   queue    自动生成    —— 任务排队，每隔 N 小时批量消费一次（受 AI_DAILY_LIMIT 约束）
 *   schedule 定时自动生成 —— 每个任务自带 cron，到点执行，执行后自动排下一次
 *
 * 为什么不用外部 crontab：现有 CLI 已经在 crontab / GitHub Actions 里跑得很好，
 * 但那要求任务「有一个外部触发器」，后台改了 cron 还得同步改系统计划任务。
 * 这里是互补关系：内嵌调度器负责「任务自己声明的时间」，外部 CLI 仍可继续用。
 * 两者同时开启不会重复出稿——任务执行时会被置为 running，且执行完才排下一次。
 *
 * 开关：SCHEDULER_ENABLED（默认 true）、SCHEDULER_TICK_SEC（默认 60）、
 *       SCHEDULER_QUEUE_INTERVAL_HOURS（默认 20，即约一天批量消费一次队列）。
 */

const TASKS = 'api::generation-task.generation-task';
const STORE_KEY = 'scheduler';

let timer: ReturnType<typeof setInterval> | null = null;
let running = false;

interface SchedulerState {
  lastBatchAt?: string;
  lastTickAt?: string;
}

function readFlag(name: string, fallback: string): string {
  const value = process.env[name];
  return value === undefined || value.trim() === '' ? fallback : value.trim();
}

async function loadState(strapi: any): Promise<SchedulerState> {
  const store = strapi.store({ type: 'plugin', name: 'content-factory', key: STORE_KEY });
  return ((await store.get({})) as SchedulerState | null) ?? {};
}

async function saveState(strapi: any, state: SchedulerState): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'content-factory', key: STORE_KEY });
  await store.set({ value: state });
}

async function findTasks(strapi: any, filters: Record<string, unknown>, limit = 20) {
  return strapi.documents(TASKS).findMany({ filters, limit });
}

/** 执行一次任务：先确保是 pending（runTasks 只执行 pending），再交给现有执行器 */
async function executeTask(
  strapi: any,
  task: { documentId: string; title?: string },
  logger: (message: string) => void,
): Promise<void> {
  // runStatus 是业务字段（schema.json 中声明的枚举），生成类型里被排除，故断言
  await strapi.documents(TASKS).update({
    documentId: task.documentId,
    data: { runStatus: 'pending' } as any,
  });

  const summary = await runTasks({
    taskId: task.documentId,
    limit: 1,
    force: true,
    logger,
  });

  const first = summary.results?.[0];
  logger(
    first
      ? `任务完成：${task.title ?? task.documentId} → ${first.status}${first.articleSlug ? `（${first.articleSlug}）` : ''}`
      : `任务结束：${task.title ?? task.documentId}（无结果）`,
  );
}

/** 手动生成：后台点了「立即生成」的任务 */
async function runManualTasks(strapi: any, logger: (message: string) => void): Promise<void> {
  const pending = await findTasks(strapi, { trigger: 'now', runStatus: 'pending' }, 5);
  for (const task of pending ?? []) {
    logger(`手动生成：${task.title}`);
    await executeTask(strapi, task, logger);
  }
}

/** 定时自动生成：到点的任务执行并排下一次 */
async function runScheduledTasks(strapi: any, logger: (message: string) => void): Promise<void> {
  const due = await findTasks(
    strapi,
    {
      trigger: 'schedule',
      enabled: true,
      runStatus: 'pending',
      nextRunAt: { $lte: new Date().toISOString() },
    },
    10,
  );

  for (const task of due ?? []) {
    const cron = (task.scheduleCron ?? '').trim();
    if (!isValidCron(cron)) {
      logger(`跳过定时任务 ${task.title}：cron 无效（${cron || '空'}）`);
      continue;
    }

    // 时区按运行环境统一计算（后台已不再暴露该字段），历史任务也一并跟随
    const timezone = systemTimeZone();
    logger(`定时自动生成：${task.title}（${cron} @ ${timezone}）`);

    await executeTask(strapi, task, logger);

    // 执行后重排：成功或「还允许重试」都排下一次；重试耗尽则停用，避免无限失败循环
    const fresh = await strapi.documents(TASKS).findOne({ documentId: task.documentId });
    const exhausted = fresh?.runStatus === 'failed';
    const next = nextRunAt(cron, new Date(), timezone);

    await strapi.documents(TASKS).update({
      documentId: task.documentId,
      data: {
        runStatus: exhausted ? 'failed' : 'pending',
        enabled: !exhausted,
        lastRunAt: new Date().toISOString(),
        nextRunAt: next ? next.toISOString() : null,
        log: exhausted
          ? `${fresh?.log ?? ''}\n重试次数已用尽，已停用该任务计划，请检查后手动恢复。`.trim()
          : fresh?.log,
      } as any,
    });

    logger(
      exhausted
        ? `任务 ${task.title} 重试耗尽，已停用`
        : `任务 ${task.title} 下次执行：${next ? next.toISOString() : '（无法计算）'}`,
    );
  }
}

/** 自动生成：队列批量消费，按小时间隔节流，避免每 tick 都调模型 */
async function runQueueBatch(strapi: any, logger: (message: string) => void): Promise<void> {
  const pending = await findTasks(strapi, { trigger: 'queue', enabled: true, runStatus: 'pending' }, 100);
  if (!pending || pending.length === 0) return;

  const intervalHours = Number.parseFloat(readFlag('SCHEDULER_QUEUE_INTERVAL_HOURS', '20'));
  const state = await loadState(strapi);

  if (state.lastBatchAt) {
    const elapsedHours = (Date.now() - new Date(state.lastBatchAt).getTime()) / 3600000;
    if (elapsedHours < intervalHours) return;
  }

  logger(`自动生成：批量消费队列 ${pending.length} 条`);
  await runTasks({ logger });

  await saveState(strapi, {
    ...state,
    lastBatchAt: new Date().toISOString(),
    lastTickAt: new Date().toISOString(),
  });
}

async function tick(strapi: any): Promise<void> {
  if (running) return;
  running = true;

  const logger = (message: string) => strapi.log.info(`[content-factory] ${message}`);

  try {
    await runManualTasks(strapi, logger);
    await runScheduledTasks(strapi, logger);
    await runQueueBatch(strapi, logger);
    await saveState(strapi, { ...(await loadState(strapi)), lastTickAt: new Date().toISOString() });
  } catch (error) {
    strapi.log.error(`[content-factory] 调度巡检失败：${(error as Error).message}`);
  } finally {
    running = false;
  }
}

export async function startScheduler(strapi: any): Promise<void> {
  if (readFlag('SCHEDULER_ENABLED', 'true') !== 'true') {
    strapi.log.info('[content-factory] 内嵌调度器未启用（SCHEDULER_ENABLED 不为 true）');
    return;
  }

  // 环境变量可能由 CLI 场景写入 cms/.env，Strapi 启动时已加载，这里兜底一次
  loadDotEnv();

  const tickSeconds = Number.parseInt(readFlag('SCHEDULER_TICK_SEC', '60'), 10) || 60;
  strapi.log.info(`[content-factory] 内嵌调度器已启动，每 ${tickSeconds} 秒巡检一次`);

  timer = setInterval(() => {
    void tick(strapi);
  }, tickSeconds * 1000);

  // 启动后先巡检一次，避免重启后要等一个周期
  void tick(strapi);
}

export function stopScheduler(): void {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
}
