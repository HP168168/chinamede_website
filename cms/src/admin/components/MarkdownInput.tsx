/**
 * 自定义字段「Markdown 编辑器」（global::markdown）的输入组件。
 *
 * 为什么需要它：提示词的正文是一段有层次结构的写作要求（分节、列表、示例），
 * 用普通多行文本框写既看不出层级，也容易漏写格式。这里换成左右分栏的编辑器：
 * 左边写 Markdown，右边实时预览排版结果。
 *
 * 关键点：**存进数据库的仍然是 Markdown 源码本身**（底层类型是 text），
 * 渲染成 HTML 是生成提示词时的事，因此这里不做任何格式转换，所见即所存。
 *
 * 与后台表单的约定（依据 Strapi 5.54 的 InputRenderer.js 与 Form.js）：
 *   1. props 里的 label / hint 已经是翻译好的字符串，直接用；
 *   2. 提交值必须通过 onChange({ target: { name, value, type } }) 回传，
 *      type 不能含 "checkbox"（Form.js 对 checkbox 类型做取反），也不能传空串
 *      （会被转成 null），因此这里固定用 "text"；值缺失时回传空字符串。
 */
import '@uiw/react-md-editor/markdown-editor.css';
import { Box, Field } from '@strapi/design-system';
import MDEditor from '@uiw/react-md-editor';
import * as React from 'react';

interface MarkdownInputProps {
  name: string;
  value?: string | null;
  label?: string;
  hint?: string;
  error?: string | boolean;
  required?: boolean;
  disabled?: boolean;
  onChange: (event: { target: { name: string; value: string; type: string } }) => void;
}

const MarkdownInput = ({
  name,
  value,
  label,
  hint,
  error,
  required = false,
  disabled = false,
  onChange,
}: MarkdownInputProps) => {
  return (
    <Field.Root name={name} id={name} error={error} hint={hint} required={required}>
      <Field.Label>{label}</Field.Label>

      {/*
        编辑器自带明暗两套配色，这里固定为亮色：
        后台主题由使用者切换，跟着变会偶尔出现文字与背景同色的情况，
        固定亮色可以彻底避开这类问题，也不必改动 Strapi 的主题变量。
      */}
      <Box data-color-mode="light" style={{ borderRadius: 4, overflow: 'hidden', maxWidth: '100%' }}>
        <MDEditor
          value={value ?? ''}
          height={420}
          preview="live"
          textareaProps={{ disabled }}
          onChange={(next?: string) => onChange({ target: { name, value: next ?? '', type: 'text' } })}
        />
      </Box>

      <Field.Hint />
      <Field.Error />
    </Field.Root>
  );
};

export default MarkdownInput;
