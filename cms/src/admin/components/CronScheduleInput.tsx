/**
 * 自定义字段「执行时间」（global::cron-schedule）的输入组件。
 *
 * 为什么需要它：定时任务的排期原来是让人手写 cron（如 "0 10 * * 1"），
 * 运营既看不出含义、又容易写错（"0 17 23 9 *" 是「每年 9 月 23 日」这种坑）。
 * 这里把它换成「周期下拉 + 时间下拉 + 星期按钮组」，一眼就能读懂和改。
 *
 * 关键点：UI 只是外壳，**存进数据库的仍然是同一个 cron 字符串**，
 * 所以调度器、lifecycles、CLI 全都无需改动；反过来，无法用「周期 + 时间」
 * 表达的频率（如「每 30 分钟」这类带步长的写法）会落到「自定义表达式」，
 * 原样保留，不丢能力。
 *
 * 与后台表单的约定（依据 Strapi 5.54 的 InputRenderer.js 与 Form.js）：
 *   1. props 里的 label / hint 已经是翻译好的字符串，直接用；
 *   2. 提交值必须通过 onChange({ target: { name, value, type } }) 回传，
 *      type 不能含 "checkbox"（Form.js 对 checkbox 类型做取反），也不能传空串
 *      （会被转成 null），因此这里固定用 "text"；
 *   3. 组件保持受控：每次交互都基于「当前值 + 本次改动」重新生成完整 cron 再回传。
 */
import { Box, Field, Flex, SingleSelect, SingleSelectOption, TextInput, Typography } from '@strapi/design-system';
import * as React from 'react';

/** 星期按钮：中文习惯「一…日」，值是 cron 的周字段（0 = 周日） */
const DAY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '1', label: '一' },
  { value: '2', label: '二' },
  { value: '3', label: '三' },
  { value: '4', label: '四' },
  { value: '5', label: '五' },
  { value: '6', label: '六' },
  { value: '0', label: '日' },
];

/** 时间下拉：每 30 分钟一档，共 48 档 */
const TIME_OPTIONS: string[] = Array.from({ length: 48 }, (_, index) => {
  const hour = String(Math.floor(index / 2)).padStart(2, '0');
  return `${hour}:${index % 2 === 0 ? '00' : '30'}`;
});

const DEFAULT_TIME = '18:00';

type Cycle = 'day' | 'week' | 'month' | 'custom';

interface Schedule {
  cycle: Cycle;
  time: string;
  /** cron 周字段值，如 ['1', '3'] */
  days: string[];
  /** 自定义表达式原文 */
  raw: string;
}

/** 把 cron 反解成 UI 状态；表达不了的落到 custom 并原样保留 */
function parse(value: string | null | undefined): Schedule {
  const raw = (value ?? '').trim();
  if (!raw) return { cycle: 'day', time: DEFAULT_TIME, days: ['1'], raw: '' };

  const parts = raw.split(/\s+/);
  if (parts.length !== 5) return { cycle: 'custom', time: DEFAULT_TIME, days: ['1'], raw };

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  const isNumber = (text: string) => /^\d{1,2}$/.test(text);

  // 只认「数字 时/分 + 每月 + 通配月」这一族，其余交给自定义模式
  if (!isNumber(minute) || !isNumber(hour) || month !== '*') {
    return { cycle: 'custom', time: DEFAULT_TIME, days: ['1'], raw };
  }

  const minutes = Number(minute);
  const hours = Number(hour);
  if (minutes > 59 || hours > 23) return { cycle: 'custom', time: DEFAULT_TIME, days: ['1'], raw };

  const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  if (dayOfMonth === '*' && dayOfWeek === '*') return { cycle: 'day', time, days: ['1'], raw };

  if (dayOfMonth === '*' && /^[0-7](,[0-7])*$/.test(dayOfWeek)) {
    const days = [...new Set(dayOfWeek.split(',').map((item) => (item === '7' ? '0' : item)))].sort();
    if (days.length > 0) return { cycle: 'week', time, days, raw };
  }

  if (/^\d{1,2}$/.test(dayOfMonth) && dayOfWeek === '*') {
    return { cycle: 'month', time, days: ['1'], raw };
  }

  return { cycle: 'custom', time, days: ['1'], raw };
}

/** UI 状态拼回 cron（自定义模式直接用原文） */
function build({ cycle, time, days, raw }: Schedule): string {
  if (cycle === 'custom') return raw;

  const [hour, minute] = time.split(':');
  const prefix = `${Number(minute)} ${Number(hour)}`;

  if (cycle === 'week') return `${prefix} * * ${(days.length > 0 ? days : ['1']).join(',')}`;
  if (cycle === 'month') return `${prefix} 1 * *`;
  return `${prefix} * * *`;
}

interface CronScheduleInputProps {
  name: string;
  value?: string | null;
  label?: string;
  hint?: string;
  error?: string | boolean;
  required?: boolean;
  disabled?: boolean;
  onChange: (event: { target: { name: string; value: string; type: string } }) => void;
}

const CronScheduleInput = ({
  name,
  value,
  label,
  hint,
  error,
  required = false,
  disabled = false,
  onChange,
}: CronScheduleInputProps) => {
  const schedule = React.useMemo(() => parse(value), [value]);
  const { cycle, time, days, raw } = schedule;

  const commit = (patch: Partial<Schedule>) => {
    const next: Schedule = { ...schedule, ...patch };
    onChange({ target: { name, value: build(next), type: 'text' } });
  };

  const toggleDay = (day: string) => {
    const nextDays = days.includes(day)
      ? days.filter((item) => item !== day)
      : [...days, day].sort();
    // 至少保留一天：全取消会让表达式变成非法的空周字段
    commit({ days: nextDays.length > 0 ? nextDays : [day] });
  };

  const isWeek = cycle === 'week';
  const preview = (value ?? '').trim() || build(schedule);

  return (
    <Field.Root name={name} id={name} error={error} hint={hint} required={required}>
      <Field.Label>{label}</Field.Label>

      <Flex gap={2} alignItems="flex-start" wrap="wrap">
        <Box style={{ minWidth: 160 }}>
          <SingleSelect
            value={cycle}
            disabled={disabled}
            aria-label="执行周期"
            onChange={(next: string | number) => commit({ cycle: String(next) as Cycle })}
          >
            <SingleSelectOption value="day">每天</SingleSelectOption>
            <SingleSelectOption value="week">每周</SingleSelectOption>
            <SingleSelectOption value="month">每月 1 日</SingleSelectOption>
            <SingleSelectOption value="custom">自定义表达式</SingleSelectOption>
          </SingleSelect>
        </Box>

        {cycle === 'custom' ? (
          <Box grow={1} style={{ minWidth: 220 }}>
            <TextInput
              value={raw}
              disabled={disabled}
              placeholder="0 10 * * 1"
              aria-label="cron 表达式"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => commit({ raw: event.target.value })}
            />
          </Box>
        ) : (
          <Box style={{ minWidth: 140 }}>
            <SingleSelect
              value={time}
              disabled={disabled}
              aria-label="执行时间"
              onChange={(next: string | number) => commit({ time: String(next) })}
            >
              {TIME_OPTIONS.map((item) => (
                <SingleSelectOption key={item} value={item}>
                  {item}
                </SingleSelectOption>
              ))}
            </SingleSelect>
          </Box>
        )}
      </Flex>

      {isWeek && (
        <Flex gap={1} paddingTop={3} wrap="wrap">
          {DAY_OPTIONS.map(({ value: day, label: dayLabel }) => {
            const active = days.includes(day);
            return (
              <button
                key={day}
                type="button"
                disabled={disabled}
                aria-label={`星期${dayLabel}`}
                aria-pressed={active}
                onClick={() => toggleDay(day)}
                style={{
                  width: 32,
                  height: 32,
                  padding: 0,
                  borderRadius: '50%',
                  border: 'none',
                  fontSize: 14,
                  lineHeight: '32px',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.5 : 1,
                  background: active ? '#212134' : '#eaeaef',
                  color: active ? '#ffffff' : '#666687',
                }}
              >
                {dayLabel}
              </button>
            );
          })}
        </Flex>
      )}

      <Box paddingTop={2}>
        <Typography variant="pi" textColor="neutral600">
          {cycle === 'custom'
            ? '5 段格式：分 时 日 月 周，例如 0 10 * * 1 表示每周一 10:00'
            : `保存的表达式：${preview}`}
        </Typography>
      </Box>

      <Field.Hint />
      <Field.Error />
    </Field.Root>
  );
};

export default CronScheduleInput;
