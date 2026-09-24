import { errors } from '@strapi/utils';
import { isValidCron, nextRunAt, systemTimeZone } from '../../../../lib/schedule/cron';

/**
 * 定时任务的排期维护与写入校验。
 *
 * 两件事：
 *   1. trigger=schedule 时校验 cron——否则任务会静静地永不执行；
 *   2. 顺手算出 nextRunAt 写回，让后台列表能直接看到「下次几点跑」；
 *      切回手动/自动生成时把排期清掉，避免调度器误判。
 *
 * 时区不再由人工填写：一律取运行环境的默认时区（systemTimeZone）并写回字段，
 * 所以 cron 里的「10:00」就是这台机器上的 10:00。
 *
 * nextRunAt 的日常维护由调度器负责（每次执行后重排下一次），
 * 这里只保证「新建 / 改了 cron」的时刻它是正确的。
 */

/**
 * 抛出可回显到后台表单的错误。
 * ValidationError 会被 Strapi 转成 400 并带上消息；
 * 直接 throw new Error 只会得到 500 Internal Server Error，运营看不出哪里填错了。
 */
function badRequest(message: string): never {
  throw new errors.ValidationError(message);
}

interface TaskDraft {
  trigger?: string;
  scheduleCron?: string | null;
  timezone?: string | null;
  nextRunAt?: string | Date | null;
}

function scheduleNextRun(cron: string, timezone: string): string | null {
  return nextRunAt(cron, new Date(), timezone)?.toISOString() ?? null;
}

function validate(data: TaskDraft | undefined, partial: boolean): void {
  if (!data) return;

  // 局部更新（如调度器只回写 status / lastRunAt）时，没有排期字段就无需校验
  const trigger = data.trigger;
  if (partial && trigger === undefined && data.scheduleCron === undefined) return;

  if (trigger !== undefined && trigger !== 'schedule') {
    // 切回手动/自动生成：清掉排期
    data.nextRunAt = null;
    return;
  }

  if (trigger === 'schedule' || (!partial && data.scheduleCron)) {
    const cron = (data.scheduleCron ?? '').trim();

    if (trigger === 'schedule' && !cron) {
      badRequest('触发方式为「定时自动生成」时，请先在「执行时间」里选择周期与时间');
    }
    if (!cron) return;
    if (!isValidCron(cron)) {
      badRequest(
        `执行时间无效：${cron}。应为 5 段（分 时 日 月 周），如 0 10 * * 1 表示每周一 10:00`,
      );
    }

    // 时区由系统按运行环境决定，不再接受人工输入
    data.timezone = systemTimeZone();
    data.nextRunAt = scheduleNextRun(cron, data.timezone);
  }
}

export default {
  async beforeCreate(event: { params: { data?: TaskDraft } }) {
    validate(event.params?.data, false);
  },

  async beforeUpdate(event: { params: { data?: TaskDraft } }) {
    validate(event.params?.data, true);
  },
};
