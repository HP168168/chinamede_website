/**
 * 自定义字段「单选枚举」（global::radio-enum）的输入组件。
 *
 * 为什么需要它：「生成模式」只有 AI 生成 / 人工撰写两个候选值，下拉控件既多一次点击，
 * 也不能一眼看出可选范围。Strapi 没有「把内置枚举字段渲染成单选」的开关，
 * 官方支持的扩展点是自定义字段（customField）——字段自带 Input 组件。
 * 所以 schema.json 里 mode 声明为 customField，由本组件用 Radio 呈现。
 *
 * 与后台表单的约定（依据 Strapi 5.54 的 InputRenderer.js 与 Form.js）：
 *   1. props 里的 label / hint 已经是翻译好的字符串（本版本不传 intlLabel）；
 *   2. 提交值必须通过 onChange({ target: { name, value, type } }) 回传。
 *      type 不能含 "checkbox"（Form.js 对 checkbox 类型做取反），也不能传空串
 *      （会被转成 null），因此这里固定用 "radio"；
 *   3. 候选值取 attribute.enum——服务端启动时会把 customField 的 type 还原成底层
 *      类型 enumeration，enum 仍在 attribute 上。未登记文案的值回退显示原值，
 *      所以本组件不绑定具体业务字段。
 */
import { Field, Radio } from '@strapi/design-system';
import * as React from 'react';

/** 候选值 -> 显示文案。未登记的值原样显示。 */
const VALUE_LABELS: Record<string, string> = {
  ai: 'AI 生成',
  manual: '人工撰写',
};

interface RadioEnumInputProps {
  name: string;
  value?: string | null;
  label?: string;
  hint?: string;
  error?: string | boolean;
  required?: boolean;
  disabled?: boolean;
  attribute?: { enum?: unknown; default?: string };
  onChange: (event: { target: { name: string; value: string; type: string } }) => void;
}

const RadioEnumInput = ({
  name,
  value,
  label,
  hint,
  error,
  required = false,
  disabled = false,
  attribute,
  onChange,
}: RadioEnumInputProps) => {
  const values = React.useMemo<string[]>(() => {
    const declared = attribute?.enum;
    if (Array.isArray(declared)) {
      return declared.filter((item): item is string => typeof item === 'string');
    }
    return typeof declared === 'string' ? [declared] : [];
  }, [attribute]);

  // 新建且尚无值时依次回退：字段默认值 -> 第一个候选值
  const current = value || attribute?.default || values[0] || '';

  return (
    <Field.Root name={name} id={name} error={error} hint={hint} required={required}>
      <Field.Label>{label}</Field.Label>
      <Radio.Group
        value={current}
        disabled={disabled}
        onValueChange={(next: string) => onChange({ target: { name, value: next, type: 'radio' } })}
      >
        {values.map((item) => (
          <Radio.Item key={item} value={item}>
            {VALUE_LABELS[item] ?? item}
          </Radio.Item>
        ))}
      </Radio.Group>
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  );
};

export default RadioEnumInput;
