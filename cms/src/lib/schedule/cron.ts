/**
 * 极简 cron 解析与「下次执行时间」计算（零第三方依赖）。
 *
 * 只支持标准 5 段：分 时 日 月 周，语法覆盖通配符、步长（星号加斜杠与步长值）、
 * 单值、范围、范围加步长，以及英文逗号分隔的枚举。
 * 不提供秒级与 @yearly 这类别名——本项目的调度粒度是分钟级，够用且更好验证。
 *
 * 时区由 Intl 处理：cron 表达式按目标时区的「墙上时间」求值，
 * 计算结果换算回 UTC 时间戳，因此跨夏令时的时区也能得到正确时刻。
 * 不传时区（传空）时按运行环境的默认时区计算：后台不再让人填时区，
 * 定时任务就跟着这台机器走。
 */

export interface CronSpec {
  minutes: number[];
  hours: number[];
  daysOfMonth: number[];
  months: number[];
  /** 0 = 周日 … 6 = 周六 */
  daysOfWeek: number[];
  /** 日/周字段原本是否为 `*`：cron 语义下两者都非 `*` 时取「或」关系 */
  domAny: boolean;
  dowAny: boolean;
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/** 解析单个字段，返回升序去重后的取值集合 */
function parseField(raw: string, min: number, max: number, label: string): number[] {
  const values = new Set<number>();

  for (const piece of raw.split(',')) {
    const part = piece.trim();
    if (!part) throw new Error(`cron ${label} 字段含空片段：${raw}`);

    const [rangeText, stepText] = part.split('/');
    const step = stepText === undefined ? 1 : Number.parseInt(stepText, 10);
    if (!Number.isInteger(step) || step < 1) {
      throw new Error(`cron ${label} 字段步长非法：${part}`);
    }

    let start = min;
    let end = max;

    if (rangeText !== '*') {
      const bounds = rangeText.split('-');
      if (bounds.length === 1) {
        start = Number.parseInt(bounds[0], 10);
        // `a/n` 等价 `a-max/n`；单独的 `a` 表示只在该值触发
        end = stepText === undefined ? start : max;
      } else if (bounds.length === 2) {
        start = Number.parseInt(bounds[0], 10);
        end = Number.parseInt(bounds[1], 10);
      } else {
        throw new Error(`cron ${label} 字段范围非法：${part}`);
      }
    }

    if (!Number.isInteger(start) || !Number.isInteger(end)) {
      throw new Error(`cron ${label} 字段不是整数：${part}`);
    }
    if (start < min || end > max || start > end) {
      throw new Error(`cron ${label} 字段越界（${min}-${max}）：${part}`);
    }

    for (let value = start; value <= end; value += step) values.add(value);
  }

  if (values.size === 0) throw new Error(`cron ${label} 字段无有效取值：${raw}`);
  return [...values].sort((a, b) => a - b);
}

/** 解析 cron 表达式；非法时抛出带字段名的错误（可直接回显到后台表单） */
export function parseCron(expression: string): CronSpec {
  const expr = (expression ?? '').trim();
  const fields = expr.split(/\s+/);

  if (fields.length !== 5) {
    throw new Error(`cron 表达式需为 5 段（分 时 日 月 周），当前 ${fields.length} 段：${expr}`);
  }

  const [minuteText, hourText, domText, monthText, dowText] = fields;

  // 周日既可以是 0 也可以是 7，统一成 0
  const daysOfWeek = parseField(dowText, 0, 7, '周').map((day) => (day === 7 ? 0 : day));

  return {
    minutes: parseField(minuteText, 0, 59, '分钟'),
    hours: parseField(hourText, 0, 23, '小时'),
    daysOfMonth: parseField(domText, 1, 31, '日'),
    months: parseField(monthText, 1, 12, '月'),
    daysOfWeek: [...new Set(daysOfWeek)].sort((a, b) => a - b),
    domAny: domText.trim() === '*',
    dowAny: dowText.trim() === '*',
  };
}

/** 表达式是否合法（不抛异常，供表单与调度器快速判断） */
export function isValidCron(expression: string): boolean {
  try {
    parseCron(expression);
    return true;
  } catch {
    return false;
  }
}

/** 时区字符串能否被运行时识别（如 Asia/Shanghai） */
export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}

interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: number;
}

/**
 * 运行环境的默认时区（IANA 名，如 Asia/Shanghai）。
 *
 * 定时任务不再由人工填时区：cron 一律按这台机器的时区解释，
 * 写「每周一 10:00」就是操作者电脑上的 10:00。
 */
export function systemTimeZone(): string {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return zone && isValidTimeZone(zone) ? zone : 'UTC';
  } catch {
    return 'UTC';
  }
}

const FORMATTERS = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  // 空时区 = 本机时区
  const zone = timeZone || systemTimeZone();
  const cached = FORMATTERS.get(zone);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short',
  });
  FORMATTERS.set(timeZone, formatter);
  return formatter;
}

/** 取某个时刻在目标时区的「墙上时间」分量 */
function zonedParts(date: Date, timeZone: string): ZonedParts {
  const parts = formatterFor(timeZone).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? '';

  const weekdayText = read('weekday');
  const weekday = WEEKDAY_INDEX[weekdayText];

  return {
    year: Number.parseInt(read('year'), 10),
    month: Number.parseInt(read('month'), 10),
    day: Number.parseInt(read('day'), 10),
    // hour12: false 在部分运行时会用 24 表示午夜
    hour: Number.parseInt(read('hour'), 10) % 24,
    minute: Number.parseInt(read('minute'), 10),
    second: Number.parseInt(read('second'), 10),
    weekday: Number.isInteger(weekday) ? weekday : 0,
  };
}

/** 目标时区相对 UTC 的偏移（毫秒），用「墙上时间 - UTC 时间」反推 */
function zoneOffsetMs(date: Date, timeZone: string): number {
  const p = zonedParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - (date.getTime() - date.getMilliseconds());
}

/** 把目标时区的墙上时间换算成 UTC 时间戳（对夏令时做一次校正） */
function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): number {
  const guess = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  const firstOffset = zoneOffsetMs(new Date(guess), timeZone);
  const firstPass = guess - firstOffset;
  const secondOffset = zoneOffsetMs(new Date(firstPass), timeZone);
  return secondOffset === firstOffset ? firstPass : guess - secondOffset;
}

function dayMatches(spec: CronSpec, p: ZonedParts): boolean {
  if (spec.domAny && spec.dowAny) return true;
  if (spec.domAny) return spec.daysOfWeek.includes(p.weekday);
  if (spec.dowAny) return spec.daysOfMonth.includes(p.day);
  return spec.daysOfMonth.includes(p.day) || spec.daysOfWeek.includes(p.weekday);
}

/**
 * 计算下次触发时刻（UTC Date）。
 *
 * 搜索按「月 → 日 → 小时 → 分钟」分层推进，避免逐分钟暴力扫描；
 * 最坏情况（如每年 2 月 29 日）也只做几千次比较。找不到（理论上不会发生）返回 null。
 */
export function nextRunAt(
  expression: string,
  from: Date = new Date(),
  // 留空 = 本机时区（见 systemTimeZone）
  timeZone = '',
): Date | null {
  const spec = parseCron(expression);

  // 从下一整分钟开始，避免把「刚刚过去的这一分钟」当成下次执行时间
  let ts = Math.floor(from.getTime() / 60000) * 60000 + 60000;

  // 最多向前找 5 年，覆盖 2 月 29 日这类稀疏表达式
  const limitTs = ts + 5 * 366 * 24 * 60 * 60 * 1000;

  while (ts <= limitTs) {
    const p = zonedParts(new Date(ts), timeZone);

    if (!spec.months.includes(p.month)) {
      // 跳到下个月 1 号 00:00
      const nextMonth = p.month === 12 ? 1 : p.month + 1;
      const nextYear = p.month === 12 ? p.year + 1 : p.year;
      ts = zonedTimeToUtc(nextYear, nextMonth, 1, 0, 0, timeZone);
      continue;
    }

    if (!dayMatches(spec, p)) {
      // 跳到次日 00:00（用 UTC 加一天再对齐到当地零点，兼容跨月跨年）
      const nextDayUtc = Date.UTC(p.year, p.month - 1, p.day + 1, 0, 0, 0, 0);
      ts = zonedTimeToUtc(
        zonedParts(new Date(nextDayUtc), 'UTC').year,
        zonedParts(new Date(nextDayUtc), 'UTC').month,
        zonedParts(new Date(nextDayUtc), 'UTC').day,
        0,
        0,
        timeZone,
      );
      continue;
    }

    if (!spec.hours.includes(p.hour)) {
      ts += (60 - p.minute) * 60000;
      continue;
    }

    if (!spec.minutes.includes(p.minute)) {
      ts += 60000;
      continue;
    }

    return new Date(ts);
  }

  return null;
}

/**
 * 判断取值集合是否为「从 0 开始、步长固定、铺满 [0, max)」的等差序列。
 * 是则返回步长，否则返回 null（用于把步长型表达式描述成「每 30 分钟」而不是「每天 00:30」）。
 */
function uniformStep(values: number[], max: number): number | null {
  if (values.length < 2) return null;
  if (values[0] !== 0) return null;

  const step = values[1] - values[0];
  if (step < 1) return null;

  for (let i = 1; i < values.length; i += 1) {
    if (values[i] - values[i - 1] !== step) return null;
  }
  if (values[values.length - 1] + step > max) return null;

  return step;
}

/** 人类可读的中文说明，供后台列表展示（如「每周一 10:00」） */
export function describeCron(expression: string): string {
  let spec: CronSpec;
  try {
    spec = parseCron(expression);
  } catch (error) {
    return `（无效表达式：${(error as Error).message}）`;
  }

  // 「全天 + 等间隔分钟」应描述成「每 N 分钟」，而不是 misleading 的「每天 00:00」
  const minuteStep = uniformStep(spec.minutes, 60);
  if (minuteStep && spec.hours.length === 24 && spec.months.length === 12 && spec.domAny && spec.dowAny) {
    return minuteStep === 1 ? '每分钟' : `每 ${minuteStep} 分钟`;
  }

  const time = `${String(spec.hours[0]).padStart(2, '0')}:${String(spec.minutes[0]).padStart(2, '0')}`;
  const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  if (!spec.domAny && spec.dowAny) {
    return `每月 ${spec.daysOfMonth.join('、')} 日 ${time}`;
  }
  if (spec.domAny && !spec.dowAny) {
    return `每${spec.daysOfWeek.map((d) => weekNames[d]).join('、')} ${time}`;
  }
  if (!spec.domAny && !spec.dowAny) {
    return `每月 ${spec.daysOfMonth.join('、')} 日或每${spec.daysOfWeek
      .map((d) => weekNames[d])
      .join('、')} ${time}`;
  }
  return `每天 ${time}`;
}
