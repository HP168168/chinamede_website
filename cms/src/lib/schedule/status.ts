/**
 * 调度状态概览：给后台与排查用。
 * 回答三个问题——调度器开没开、队列里压了多少、下一个定时任务几点跑。
 */

import { systemTimeZone } from './cron';

const TASKS = 'api::generation-task.generation-task';

function readFlag(name: string, fallback: string): string {
  const value = process.env[name];
  return value === undefined || value.trim() === '' ? fallback : value.trim();
}

export async function loadStateSummary(strapi: any) {
  const [manual, queue, scheduled] = await Promise.all([
    strapi.documents(TASKS).findMany({ filters: { trigger: 'now', runStatus: 'pending' }, limit: 100 }),
    strapi
      .documents(TASKS)
      .findMany({ filters: { trigger: 'queue', enabled: true, runStatus: 'pending' }, limit: 100 }),
    strapi
      .documents(TASKS)
      .findMany({ filters: { trigger: 'schedule', enabled: true }, limit: 100 }),
  ]);

  const store = strapi.store({ type: 'plugin', name: 'content-factory', key: 'scheduler' });
  const state = (await store.get({})) as { lastTickAt?: string; lastBatchAt?: string } | null;

  const upcoming = (scheduled ?? [])
    .filter((task: any) => Boolean(task.nextRunAt))
    .sort((a: any, b: any) => String(a.nextRunAt).localeCompare(String(b.nextRunAt)))
    .slice(0, 5)
    .map((task: any) => ({
      documentId: task.documentId,
      title: task.title,
      nextRunAt: task.nextRunAt,
      cron: task.scheduleCron,
      timezone: systemTimeZone(),
    }));

  return {
    schedulerEnabled: readFlag('SCHEDULER_ENABLED', 'true') === 'true',
    tickSeconds: Number.parseInt(readFlag('SCHEDULER_TICK_SEC', '60'), 10) || 60,
    queueIntervalHours: Number.parseFloat(readFlag('SCHEDULER_QUEUE_INTERVAL_HOURS', '20')) || 20,
    lastTickAt: state?.lastTickAt ?? null,
    lastBatchAt: state?.lastBatchAt ?? null,
    counts: {
      manualPending: (manual ?? []).length,
      queuePending: (queue ?? []).length,
      scheduledEnabled: (scheduled ?? []).length,
    },
    upcoming,
    now: new Date().toISOString(),
  };
}
