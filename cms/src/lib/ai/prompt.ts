import type { GenerateInput, KbSnippet } from './types';

/**
 * 提示词构建。
 *
 * 设计要点：
 * - 品牌事实、写作规范、知识素材全部显式给出，避免模型自由发挥编造数据；
 * - GEO 规范写进系统提示（答案先行、数据要点、问答对、内链、引用来源），
 *   与 validate.ts 的校验项一一对应，形成「写—检」闭环；
 * - 输出固定为 JSON，字段与 Strapi 文章模型对齐，落库时无需二次翻译。
 */

export interface BuiltPrompt {
  system: string;
  user: string;
}

const OUTPUT_SCHEMA = `{
  "title": "文章标题，15-40 字，自然包含目标关键词",
  "slug": "英文小写连字符 slug，如 ai-xinmeiti-jiuye-qianjing",
  "summary": "摘要，60-160 字，用于列表与 llms.txt",
  "content": "正文 HTML 片段（只用 h2/h3/p/ul/li/strong/a/table 标签，不要 html/head/body 外层标签）",
  "seo": {
    "title": "SEO 标题，可与文章标题不同，建议 20-30 字",
    "description": "SEO 描述，60-160 字",
    "keywords": "目标关键词，英文逗号分隔"
  },
  "answerBlocks": [
    { "question": "用户会直接问的问题", "answer": "2-4 句直给结论的答案，必须与正文开头段落一致" }
  ],
  "keyFacts": [{ "label": "指标名", "value": "数值或结论" }],
  "faq": [{ "question": "问题", "answer": "答案" }],
  "sources": [{ "label": "来源名称", "url": "来源链接（可留空）" }],
  "relatedLinks": [{ "title": "站内相关页面标题", "url": "站内链接，如 /courses/" }],
  "tags": ["标签1", "标签2"]
}`;

function renderSnippets(snippets: KbSnippet[]): string {
  if (snippets.length === 0) {
    return '（本次没有匹配到知识条目，请只做定性表述，禁止编造任何具体数字与案例。）';
  }

  return snippets
    .map((snippet, index) => {
      const lines: string[] = [`【素材 ${index + 1}】${snippet.title}（分类：${snippet.category}）`];

      if (snippet.topic) lines.push(`主题：${snippet.topic}`);
      if (snippet.points.length) {
        lines.push('关键要点：');
        snippet.points.forEach((point) => lines.push(`  - ${point}`));
      }
      if (snippet.facts.length) {
        lines.push('数据点（必须原样使用，不得改动数值）：');
        snippet.facts.forEach((fact) =>
          lines.push(
            `  - ${fact.label}：${fact.value}${fact.year ? `（${fact.year}）` : ''}${
              fact.source ? ` 来源：${fact.source}` : ''
            }`,
          ),
        );
      }
      if (snippet.qa.length) {
        lines.push('已有问答：');
        snippet.qa.forEach((qa) => lines.push(`  - Q: ${qa.question}\n    A: ${qa.answer}`));
      }
      if (snippet.citation) lines.push(`推荐引用表述：${snippet.citation}`);
      if (snippet.sources.length) {
        lines.push('来源出处：');
        snippet.sources.forEach((source) =>
          lines.push(`  - ${source.label}${source.url ? `（${source.url}）` : ''}`),
        );
      }
      if (snippet.credibility) lines.push(`可信度说明：${snippet.credibility}`);

      return lines.join('\n');
    })
    .join('\n\n');
}

export function buildArticlePrompt(input: GenerateInput): BuiltPrompt {
  const brandFacts = input.brandFacts.filter(Boolean);
  const keywords = input.targetKeywords.filter(Boolean);
  const links = input.internalLinks.filter((link) => link?.url);

  const system = [
    `你是「${input.siteName}」官网的资深中文内容编辑，同时精通 SEO 与 GEO（生成式引擎优化）。`,
    '你的内容会被搜索引擎抓取，也会被 DeepSeek、豆包、ChatGPT 等 AI 直接引用，因此必须做到结论明确、事实可核、来源可查。',
    '',
    '【品牌事实（唯一可信的品牌信息来源，与此冲突的内容一律以这里为准）】',
    ...(brandFacts.length
      ? brandFacts.map((fact) => `- ${fact.replace(/^\s*[-·•、]\s*/, '')}`)
      : ['- （未配置品牌事实，请只做行业通识表述）']),
    '',
    '【写作规范】',
    '1. 开篇 2-4 句话直接给出结论，不铺垫、不寒暄——这段会成为 AI 引用的「答案段落」。',
    '2. 正文用 h2/h3 分节，每节只讲一个观点，段落不超过 4 行。',
    '3. 所有具体数字、时间、案例必须来自给定素材；素材没有的，改用定性描述，严禁编造。',
    '4. 单独用一节列出关键数据（对应 keyFacts），数值必须与素材完全一致。',
    '5. 单独用一节给出至少 3 组问答（对应 faq），问题要贴近用户真实搜索用语。',
    '6. 正文中至少自然插入 2 条站内链接（从「可用站内链接」中挑选，用 <a href="...">锚文本</a> 形式）。',
    '7. 结尾给出下一步行动建议（了解课程、预约试听等），但不得承诺就业结果或收益。',
    '8. 全篇使用简体中文，专业、务实、口语化，避免营销腔与夸张形容词。',
    '',
    /**
     * 运营在后台选定的提示词，作为「本次写作要求」插在这里。
     *
     * 位置是刻意的：在写作规范之后、输出要求之前——
     * 输出契约（只输出 JSON）必须紧贴提示词结尾，中间隔得越远，
     * 模型越容易顺势把 Markdown 正文当成要复用格式的正餐。
     * 它是补充意图而不是替换，因此不参与 OUTPUT_SCHEMA 的任何改动。
     */
    ...(input.promptTemplate?.content
      ? [
          '【本次写作要求（由运营在后台选定，优先级高于上面的通用规范）】',
          input.promptTemplate.content.trim(),
          '',
        ]
      : []),
    '【输出要求】',
    '只输出一个合法的 JSON 对象，不要输出 markdown 代码块标记，不要输出任何解释文字。',
    'JSON 结构如下（字段名必须完全一致）：',
    OUTPUT_SCHEMA,
  ].join('\n');

  const user = [
    `选题方向：${input.topic}`,
    `目标关键词：${keywords.length ? keywords.join('、') : '（未指定，请围绕选题自行判断）'}`,
    `目标读者：${input.audience}`,
    `语气风格：${input.tone}`,
    `目标字数：约 ${input.wordCount} 字（正文纯文本字数）`,
    `站点地址：${input.siteUrl}`,
    '',
    '【可用站内链接】',
    links.length
      ? links.map((link) => `- ${link.title} → ${link.url}`).join('\n')
      : '- （无可用链接，可省略正文内链，但 relatedLinks 需给出 2 条站内路径）',
    '',
    '【知识库素材】',
    renderSnippets(input.snippets),
    '',
    '请基于以上素材撰写文章，并按要求输出 JSON。',
  ].join('\n');

  return { system, user };
}

/** 供 ai:preview 使用：把提示词渲染成可读文本 */
export function renderPromptPreview(prompt: BuiltPrompt): string {
  return [
    '================ 系统提示（System）================',
    prompt.system,
    '',
    '================ 用户提示（User）================',
    prompt.user,
  ].join('\n');
}
