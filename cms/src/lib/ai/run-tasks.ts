import { createKbRetriever } from '../kb/retriever';
import { assertAiReady, assertStrapiWriteReady, loadAiConfig } from './config';
import { categoryLabel, pickKeyword } from './keywords';
import { buildArticlePrompt, renderPromptPreview } from './prompt';
import { createAiProvider } from './provider';
import { validateArticle } from './validate';
import { parseStringList, StrapiClient } from '../strapi-client';
import type { QueryObject } from '../strapi-client';
import type {
  AiConfig,
  GenerateInput,
  GeneratedArticle,
  GenerationTaskRecord,
  InternalLink,
  KbEntryRecord,
  KbSnippet,
} from './types';

/**
 * AI 内容工厂主流程。
 *
 * 一条任务的生命周期：
 *   pending → running → （生成 → 校验 → 写草稿）→ done
 *                     ↘ 失败 → failed（保留日志，可重跑）
 *
 * 设计约束：
 * - 只产出草稿（不设置 publishedAt），上线必须由人在后台确认，避免 AI 直接对外；
 * - 校验不通过不落库，避免低质内容污染内容库；
 * - 全部通过 REST API 操作，脚本可在任意机器上被定时任务调用。
 */

const PLURAL = {
  tasks: 'generation-tasks',
  articles: 'articles',
  kbEntries: 'kb-entries',
  courses: 'courses',
  guides: 'guides',
  keywords: 'keywords',
  promptTemplates: 'prompt-templates',
} as const;

const SITE_CONFIG = 'site-config';

/** 静态页面内链池：AI 需要在正文里自然插入站内链接 */
const STATIC_LINKS: InternalLink[] = [
  { title: '课程总览', url: '/courses/' },
  { title: '师资力量', url: '/teachers/' },
  { title: '学员风采', url: '/students/' },
  { title: '常见问题', url: '/faq/' },
  { title: '联系我们', url: '/contact/' },
  { title: '预约试听报名', url: '/enroll/' },
  { title: '知识百科', url: '/knowledge/' },
  { title: '机构动态', url: '/news/' },
];

export interface RunLogger {
  (message: string): void;
}

export interface RunOptions {
  /** 只执行指定任务（documentId） */
  taskId?: string;
  /** 本次运行最多处理的任务数 */
  limit?: number;
  /** 只演练：调用模型与校验，但不写入 Strapi */
  dryRun?: boolean;
  /** 忽略运行窗口限制 */
  force?: boolean;
  logger?: RunLogger;
}

export interface TaskRunResult {
  taskId: string;
  title: string;
  status: 'done' | 'failed' | 'skipped';
  articleSlug?: string;
  score?: number;
  issues: string[];
  message: string;
}

export interface RunSummary {
  scanned: number;
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  results: TaskRunResult[];
}

/* ------------------------------- 工具函数 ------------------------------- */

const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value.trim() : fallback;

// 可重复字符串字段经 REST 往返后可能是「数组」也可能是「JSON 字符串」，统一交给 parseStringList
const asStringArray = (value: unknown): string[] => parseStringList(value);

const asRecordArray = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value) ? (value.filter((item) => item && typeof item === 'object') as Record<string, unknown>[]) : [];

/** 中文标题无法直接转 slug，退化为日期序号，由人工在后台修正 */
function fallbackSlug(prefix = 'draft'): string {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate(),
  ).padStart(2, '0')}`;
  return `${prefix}-${stamp}-${Math.random().toString(36).slice(2, 6)}`;
}

function parseKeywords(raw?: string | null): string[] {
  return (raw ?? '')
    .split(/[,，、;；\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * 运行窗口约束：AI_RUN_WINDOW=09:00-21:00。
 * 未配置则不限；配置后窗口外的批量运行会被跳过（单篇手动执行可用 --force 绕过）。
 */
function insideRunWindow(): { ok: boolean; reason?: string } {
  const raw = process.env.AI_RUN_WINDOW?.trim();
  if (!raw) return { ok: true };

  const match = /^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/.exec(raw);
  if (!match) {
    return { ok: true, reason: `AI_RUN_WINDOW 格式无法识别（${raw}），已忽略该限制` };
  }

  const [, fromH, fromM, toH, toM] = match;
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const start = Number(fromH) * 60 + Number(fromM);
  const end = Number(toH) * 60 + Number(toM);

  const inside = start <= end ? minutes >= start && minutes <= end : minutes >= start || minutes <= end;
  return inside ? { ok: true } : { ok: false, reason: `当前时间不在运行窗口 ${raw} 内` };
}

/* ------------------------------ 数据读取层 ------------------------------ */

function createClient(config: AiConfig): StrapiClient {
  return new StrapiClient({
    baseUrl: config.strapiUrl,
    // 写入令牌权限更全，优先使用；只配了只读令牌时至少保证预览/自检可用
    token: config.writeToken || config.readToken,
    timeoutMs: Math.max(config.timeoutMs, 30000),
  });
}

interface SiteContext {
  siteName: string;
  siteUrl: string;
  brandFacts: string[];
  brandNames: string[];
}

async function loadSiteContext(client: StrapiClient, config: AiConfig): Promise<SiteContext> {
  let record: Record<string, unknown> | null = null;
  try {
    record = await client.findSingle<Record<string, unknown>>(SITE_CONFIG, {
      populate: { logo: true, ogImage: true, wechatQr: true },
    });
  } catch {
    record = null;
  }

  const siteName = asString(record?.name) || '美迪时代教育';
  const siteUrl = (asString(record?.baseUrl) || config.siteUrl).replace(/\/+$/, '');
  const brandFacts = asStringArray(record?.llmsFacts);
  const brandNames = [siteName, asString(record?.legalName), '美迪时代', '美迪时代教育'].filter(Boolean);

  return { siteName, siteUrl, brandFacts, brandNames: Array.from(new Set(brandNames)) };
}

/** 拉取全部已发布知识条目（一次构建/一次运行只拉一次） */
async function loadKbEntries(client: StrapiClient): Promise<KbEntryRecord[]> {
  const raw = await client.list<Record<string, unknown>>(PLURAL.kbEntries, {
    status: 'published',
    populate: {
      points: true,
      facts: true,
      qa: true,
      sources: true,
      // 课程没有 slug 字段（前端路由用的是 code），这里按 code 取，否则整个查询会被 Strapi 判为非法参数
      relatedCourses: { fields: ['title', 'code'] },
    },
  });

  return raw.map((entry) => ({
    documentId: asString(entry.documentId),
    title: asString(entry.title),
    slug: asString(entry.slug),
    aliases: asStringArray(entry.aliases),
    category: asString(entry.category) || 'other',
    topic: asString(entry.topic),
    points: asRecordArray(entry.points).map((point) => ({ text: asString(point.text) })),
    facts: asRecordArray(entry.facts).map((fact) => ({
      label: asString(fact.label),
      value: asString(fact.value),
      year: asString(fact.year) || undefined,
      source: asString(fact.source) || undefined,
    })),
    qa: asRecordArray(entry.qa).map((qa) => ({
      question: asString(qa.question),
      answer: asString(qa.answer),
    })),
    citation: asString(entry.citation) || null,
    sources: asRecordArray(entry.sources).map((source) => ({
      label: asString(source.label),
      url: asString(source.url) || undefined,
      note: asString(source.note) || undefined,
    })),
    tags: asStringArray(entry.tags),
    credibility: asString(entry.credibility) || null,
    relatedCourses: asRecordArray(entry.relatedCourses).map((course) => ({
      title: asString(course.title),
      slug: asString(course.slug),
    })),
  }));
}

/** 组装可供 AI 引用的站内链接池 */
async function loadInternalLinks(client: StrapiClient): Promise<InternalLink[]> {
  const links: InternalLink[] = [...STATIC_LINKS];

  const safeList = async (
    plural: string,
    query: QueryObject,
    toLink: (record: Record<string, unknown>) => InternalLink | null,
  ): Promise<void> => {
    try {
      const records = await client.list<Record<string, unknown>>(plural, query);
      records.forEach((record) => {
        const link = toLink(record);
        if (link) links.push(link);
      });
    } catch {
      // 单个来源失败不影响整体生成
    }
  };

  await safeList(PLURAL.courses, { status: 'published' }, (record) => {
    // 课程没有 slug：前端 /courses/ 详情页用的是 code（见官网 src/lib/strapi.ts 的 courses 取数）
    const slug = asString(record.slug) || asString(record.code);
    const title = asString(record.title) || asString(record.mainTitle);
    return slug && title ? { title, url: `/courses/${slug}/` } : null;
  });

  await safeList(PLURAL.guides, { status: 'published' }, (record) => {
    const slug = asString(record.slug);
    const title = asString(record.title);
    return slug && title ? { title, url: `/knowledge/${slug}/` } : null;
  });

  await safeList(PLURAL.articles, { status: 'published' }, (record) => {
    const slug = asString(record.slug);
    const title = asString(record.title);
    return slug && title ? { title, url: `/articles/${slug}/` } : null;
  });

  // 去重（同标题同地址只保留一条）
  const seen = new Set<string>();
  return links.filter((link) => {
    const key = `${link.title}|${link.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** 待处理任务（含关联知识条目的 documentId 列表） */
async function loadPendingTasks(client: StrapiClient, taskId?: string): Promise<GenerationTaskRecord[]> {
  // keyword / promptTemplate 是关系字段，不 populate 只能拿到 id 拿不到正文；
  // keywordCategory 是标量枚举，无需 populate
  const populate: QueryObject = {
    entries: { fields: ['documentId', 'slug'] },
    keyword: { fields: ['documentId', 'word', 'usageCount'] },
    promptTemplate: { fields: ['documentId', 'title', 'content'] },
  };

  if (taskId) {
    const records = await client.list<Record<string, unknown>>(PLURAL.tasks, {
      filters: { documentId: { $eq: taskId } },
      populate,
    });
    return records.map(toTaskRecord);
  }

  const records = await client.list<Record<string, unknown>>(PLURAL.tasks, {
    filters: { runStatus: { $eq: 'pending' } },
    sort: ['plannedDate:asc', 'createdAt:asc'],
    populate,
  });
  return records.map(toTaskRecord);
}

function toTaskRecord(record: Record<string, unknown>): GenerationTaskRecord {
  const entries = asRecordArray(record.entries);
  // 关系字段在 REST 里是对象或缺失：用同一个归一化手段取出来
  const keyword = asRecordArray([record.keyword])[0];
  const promptTemplate = asRecordArray([record.promptTemplate])[0];

  return {
    documentId: asString(record.documentId),
    title: asString(record.title),
    mode: (asString(record.mode) || 'ai') as GenerationTaskRecord['mode'],
    topic: asString(record.topic) || null,
    wordCount: typeof record.wordCount === 'number' ? record.wordCount : 1200,
    audience: asString(record.audience) || null,
    tone: asString(record.tone) || null,
    targetKeywords: asString(record.targetKeywords) || null,
    runStatus: (asString(record.runStatus) || 'pending') as GenerationTaskRecord['runStatus'],
    retries: typeof record.retries === 'number' ? record.retries : 0,
    log: asString(record.log) || null,
    requestedBy: asString(record.requestedBy) || null,
    entries: entries.map((entry) => ({
      documentId: asString(entry.documentId),
      slug: asString(entry.slug) || undefined,
    })),
    keywordCategory: (asString(record.keywordCategory) ||
      null) as GenerationTaskRecord['keywordCategory'],
    keyword: keyword?.documentId
      ? { documentId: asString(keyword.documentId), word: asString(keyword.word) }
      : null,
    promptTemplate: promptTemplate?.documentId
      ? {
          documentId: asString(promptTemplate.documentId),
          title: asString(promptTemplate.title),
          content: asString(promptTemplate.content),
        }
      : null,
  };
}

/* -------------------------------- 写回层 -------------------------------- */

async function markTask(client: StrapiClient, taskId: string, data: Record<string, unknown>): Promise<void> {
  await client.update(PLURAL.tasks, taskId, data);
}

function mergeLog(previous: string | null | undefined, entries: string[]): string {
  const head = previous?.trim() ? `${previous.trim()}\n` : '';
  const body = entries.filter(Boolean).join('\n');
  const merged = `${head}${body}`;
  // 保留最近 8000 字符，避免日志字段无限膨胀
  return merged.length > 8000 ? merged.slice(merged.length - 8000) : merged;
}

/* ---------------------------- 输入解析层 -------------------------------- */

interface ResolvedTaskInput {
  /** 参与创作的目标关键词：自动取到的词 + 手填的目标关键词（去重） */
  keywords: string[];
  /** 本次使用的提示词；没有则为 null */
  promptTemplate: GenerateInput['promptTemplate'];
  /** 实际采用的关键词（决定是否回写使用计数） */
  picked: { documentId: string; word: string } | null;
  /** 决策说明，写进任务日志便于复盘「为什么选这个词」 */
  reasons: string[];
}

/**
 * 统一解析一次任务的关键词与提示词。
 *
 * 「手动生成 / 自动生成 / 定时生成」三种触发方式之所以行为一致，
 * 靠的就是**所有入口都先经过这里**，再进入「检索知识库 → 拼提示词 → 调模型」——
 * 调度器 tick、后台「立即生成」按钮、CLI 三条路径没有各自的取词分支，差异只剩下触发时机。
 *
 * 处理顺序与降级：
 *   1. 指定了具体词       → 用它；
 *   2. 只指定了分类       → 在该类下自动取一个（最少使用优先，同计数随机）：
 *      - 该类下没有可用词、或读词失败 → 回退到手填的目标关键词；
 *   3. 两者都没指定       → 只用目标关键词，与改造前逐字节一致（老任务零回归）。
 *
 * ⚠️ 第 3 条是刻意为之：把词并进 keywords 会同时改变知识库检索的打分
 * （keywords 的权重是 query 的 3-4 倍）与 SEO 校验的关键词覆盖扣分，
 * 只有用户明确要用关键词库时才该发生。
 */
async function resolveTaskInput(
  client: StrapiClient,
  task: GenerationTaskRecord,
): Promise<ResolvedTaskInput> {
  const manual = parseKeywords(task.targetKeywords);

  if (!task.keywordCategory && !task.keyword) {
    return { keywords: manual, promptTemplate: null, picked: null, reasons: [] };
  }

  const reasons: string[] = [];
  let picked: { documentId: string; word: string } | null = null;

  if (task.keyword?.word) {
    picked = { documentId: task.keyword.documentId, word: task.keyword.word };
    reasons.push(`使用指定关键词「${picked.word}」`);
  } else if (task.keywordCategory) {
    const label = categoryLabel(task.keywordCategory);

    try {
      const rows = await client.list<Record<string, unknown>>(PLURAL.keywords, {
        filters: { category: { $eq: task.keywordCategory }, enabled: { $eq: true } },
        fields: ['documentId', 'word', 'usageCount'],
      });

      const decision = pickKeyword({
        candidates: rows.map((row) => ({
          documentId: asString(row.documentId),
          word: asString(row.word),
          usageCount: typeof row.usageCount === 'number' ? row.usageCount : 0,
        })),
      });

      if (decision) {
        picked = decision.picked;
        reasons.push(`关键词库自动取词（${label}）：${decision.reason}`);
      } else {
        reasons.push(`「${label}」分类下没有启用的词条，回退到手填的目标关键词`);
      }
    } catch (error) {
      reasons.push(`读取关键词库失败（${(error as Error).message}），回退到手填的目标关键词`);
    }
  }

  // 去重且保持顺序：先自动取到的词，再手填词
  const keywords = [...(picked ? [picked.word] : []), ...manual].filter(
    (item, index, all) => Boolean(item) && all.indexOf(item) === index,
  );

  return {
    keywords,
    promptTemplate: task.promptTemplate?.content
      ? { title: task.promptTemplate.title, content: task.promptTemplate.content }
      : null,
    picked,
    reasons,
  };
}

/**
 * 成稿之后回写关键词的热度。
 *
 * 只在**真正入库成功之后**调用（演练与人工骨架不计数），否则失败任务会污染
 * 「最少使用优先」的排序依据。计数失败不影响已经完成的稿件，因此只记录不抛出。
 *
 * REST 层没有自增接口，只能读改写；调度器与 CLI 理论上可能并发，
 * 偶发丢失一次计数只会让「优先挑冷门词」略微失准，不值得为此引入锁。
 */
async function markKeywordUsed(
  client: StrapiClient,
  keyword: { documentId: string; word: string },
  log: (message: string) => void,
): Promise<void> {
  try {
    const rows = await client.list<Record<string, unknown>>(PLURAL.keywords, {
      filters: { documentId: { $eq: keyword.documentId } },
      fields: ['documentId', 'usageCount'],
    });

    const current = typeof rows[0]?.usageCount === 'number' ? (rows[0].usageCount as number) : 0;

    await client.update(PLURAL.keywords, keyword.documentId, {
      usageCount: current + 1,
      lastUsedAt: new Date().toISOString(),
    });
  } catch (error) {
    log(`关键词使用计数回写失败（不影响本次成稿）：${(error as Error).message}`);
  }
}

interface StoredArticle {
  documentId: string;
  slug: string;
}

/** 已占用的 slug：草稿与已发布都要算，否则会撞唯一约束 */
async function existingSlugs(client: StrapiClient): Promise<Set<string>> {
  const slugs = new Set<string>();

  for (const status of ['published', 'draft'] as const) {
    try {
      const records = await client.list<Record<string, unknown>>(PLURAL.articles, {
        fields: ['slug'],
        status,
      });
      records.forEach((record) => {
        const slug = asString(record.slug);
        if (slug) slugs.add(slug);
      });
    } catch {
      // 忽略：取不到时退化为不做去重（唯一约束会兜底报错）
    }
  }

  return slugs;
}

function uniqueSlug(slug: string, taken: Set<string>): string {
  if (!taken.has(slug)) return slug;
  let index = 2;
  while (taken.has(`${slug}-${index}`)) index += 1;
  return `${slug}-${index}`;
}

/**
 * 把模型产物映射为 Strapi 文章模型字段。
 * 空数组与可重复字符串字段的编码由 StrapiClient 统一处理，这里保持原始形态即可。
 */
function toArticlePayload(input: {
  article: GeneratedArticle;
  task: GenerationTaskRecord;
  slug: string;
  score: number | null;
  siteName: string;
  siteUrl: string;
  kbDocumentIds: string[];
  /** 本次使用的关键词与提示词（回挂到文章用于追溯，可空） */
  keywordDocumentId?: string | null;
  promptTemplateDocumentId?: string | null;
}): Record<string, unknown> {
  const {
    article,
    task,
    slug,
    score,
    siteName,
    siteUrl,
    kbDocumentIds,
    keywordDocumentId,
    promptTemplateDocumentId,
  } = input;

  const payload: Record<string, unknown> = {
    title: article.title,
    slug,
    summary: article.summary,
    content: article.content,
    tags: article.tags,
    author: siteName,
    source: 'ai',
    targetKeywords: task.targetKeywords ?? '',
    seo: {
      title: article.seo.title || article.title,
      description: article.seo.description || article.summary,
      keywords: article.seo.keywords,
      canonical: article.seo.canonical || `${siteUrl}/articles/${slug}/`,
    },
    answerBlocks: article.answerBlocks.map((block) => ({ question: block.question, answer: block.answer })),
    keyFacts: article.keyFacts.map((fact) => ({ label: fact.label, value: fact.value })),
    faq: article.faq.map((item) => ({ question: item.question, answer: item.answer })),
    sources: article.sources.map((source) => ({ label: source.label, url: source.url ?? '' })),
    relatedLinks: article.relatedLinks.map((link) => ({ label: link.title, href: link.url })),
  };

  if (score !== null) payload.geoScore = score;
  if (kbDocumentIds.length) {
    payload.kbEntries = { connect: kbDocumentIds.map((documentId) => ({ documentId })) };
  }
  // manyToOne 与 manyToMany 用同一套 connect 编码，差别只是数组里放一个还是多个
  if (keywordDocumentId) {
    payload.keyword = { connect: [{ documentId: keywordDocumentId }] };
  }
  if (promptTemplateDocumentId) {
    payload.promptTemplate = { connect: [{ documentId: promptTemplateDocumentId }] };
  }

  return payload;
}

/**
 * 人工模式：只生成带 SEO/GEO 字段模板的空草稿骨架。
 * 数值、问答、来源一律留空，由撰写人填写，避免脚本编造内容。
 */
function buildManualSkeleton(input: {
  task: GenerationTaskRecord;
  slug: string;
  siteName: string;
  siteUrl: string;
}): Record<string, unknown> {
  const { task, slug, siteName, siteUrl } = input;
  const topic = task.topic || task.title;

  const content = [
    '<p>【答案段落模板】用 2-4 句话直接给出结论，不铺垫；这段会被搜索引擎与 AI 直接引用，写完后请原样复制到「答案段落」字段。</p>',
    '',
    '<h2>一、核心结论</h2>',
    '<p>待补充：先讲结果，再讲原因。</p>',
    '',
    '<h2>二、关键数据</h2>',
    '<ul>',
    '  <li>指标名：数值（年份，来源）—— 数据必须来自知识库条目，不得编造。</li>',
    '</ul>',
    '',
    '<h2>三、常见问题</h2>',
    '<h3>问题一？</h3>',
    '<p>待补充。</p>',
    '',
    '<h2>四、下一步建议</h2>',
    '<p>可引导到 <a href="/courses/">课程总览</a> 或 <a href="/enroll/">预约试听</a>。</p>',
    '',
    '<p>正文内链至少 2 条（从「相关阅读」字段挑选站内路径）。</p>',
  ].join('\n');

  return {
    title: `【待撰写】${topic}`.slice(0, 60),
    slug,
    summary: '待补充：60-160 字摘要，用于文章列表与 llms.txt。',
    content,
    tags: [],
    author: siteName,
    source: 'manual',
    targetKeywords: task.targetKeywords ?? '',
    seo: {
      title: topic.slice(0, 40),
      description: '待补充：SEO 描述 60-160 字，包含目标关键词。',
      keywords: task.targetKeywords ?? '',
      canonical: `${siteUrl}/articles/${slug}/`,
    },
    answerBlocks: [],
    keyFacts: [],
    faq: [],
    sources: [],
    relatedLinks: [],
  };
}

/* ------------------------------- 主流程 -------------------------------- */

export interface ExecutionDeps {
  client: StrapiClient;
  config: AiConfig;
  site: SiteContext;
  logger: RunLogger;
}

/** 执行单个任务：生成 → 校验 → 落库 → 回写状态 */
export async function executeTask(
  task: GenerationTaskRecord,
  deps: ExecutionDeps,
  options: { dryRun?: boolean } = {},
): Promise<TaskRunResult> {
  const { client, config, site, logger } = deps;
  const logLines: string[] = [];
  const log = (message: string) => {
    const line = `[${new Date().toISOString()}] ${message}`;
    logLines.push(line);
    logger(line);
  };

  const base: TaskRunResult = {
    taskId: task.documentId,
    title: task.title,
    status: 'failed',
    issues: [],
    message: '',
  };

  if (!options.dryRun) {
    await markTask(client, task.documentId, {
      runStatus: 'running',
      log: mergeLog(task.log, [`[${new Date().toISOString()}] 开始执行（模式：${task.mode}）`]),
    });
  }

  try {
    const allEntries = await loadKbEntries(client);
    const scopedIds = (task.entries ?? []).map((entry) => entry.documentId).filter(Boolean);
    const scoped = scopedIds.length
      ? allEntries.filter((entry) => scopedIds.includes(entry.documentId))
      : allEntries;

    log(`知识库：共 ${allEntries.length} 条，本次可用 ${scoped.length} 条`);

    const taken = await existingSlugs(client);

    /* --------------------------- 人工模式：空骨架 --------------------------- */
    if (task.mode === 'manual') {
      const slug = uniqueSlug(fallbackSlug('draft'), taken);
      const payload = buildManualSkeleton({ task, slug, siteName: site.siteName, siteUrl: site.siteUrl });

      if (options.dryRun) {
        log(`[演练] 将创建人工骨架草稿：${slug}`);
        return { ...base, status: 'done', articleSlug: slug, message: '演练完成（未落库）' };
      }

      const created = await client.create<StoredArticle>(PLURAL.articles, payload, { status: 'draft' });
      log(`已创建人工骨架草稿：${created.slug}（documentId=${created.documentId}）`);
      log('提示：请补充正文、答案段落、关键数据与 FAQ，并改写 slug 后再发布。');

      await markTask(client, task.documentId, {
        runStatus: 'done',
        result: { connect: [{ documentId: created.documentId }] },
        log: mergeLog(task.log, logLines),
      });

      return { ...base, status: 'done', articleSlug: created.slug, message: '人工骨架已生成' };
    }

    /* ----------------------------- AI 模式成稿 ----------------------------- */
    if (scoped.length === 0) {
      throw new Error('知识库中没有可用条目（kb-entries 为空或全部为草稿），无法生成可信内容');
    }

    const retriever = createKbRetriever(scoped);
    const topic = task.topic || task.title;

    // 取词与提示词的唯一入口：自动 / 手动 / 定时三种触发共用同一套解析，
    // 差异只在「谁来触发、什么时候触发」，不在这里
    const resolved = await resolveTaskInput(client, task);
    resolved.reasons.forEach((reason) => log(reason));
    const keywords = resolved.keywords;

    const snippets: KbSnippet[] = await retriever.search({
      query: [topic, ...keywords].join(' '),
      keywords,
      limit: 6,
    });
    log(`命中素材 ${snippets.length} 条：${snippets.map((snippet) => snippet.title).join('、')}`);

    const internalLinks = await loadInternalLinks(client);
    if (!config.apiKey) assertAiReady(config);

    const input: GenerateInput = {
      topic,
      targetKeywords: keywords,
      audience: task.audience || '零基础想转行就业的求职者',
      tone: task.tone || '专业、务实、口语化',
      wordCount: task.wordCount || 1200,
      snippets,
      internalLinks,
      brandFacts: site.brandFacts,
      siteName: site.siteName,
      siteUrl: site.siteUrl,
      promptTemplate: resolved.promptTemplate,
    };

    if (resolved.promptTemplate) {
      log(`叠加本次写作要求：${resolved.promptTemplate.title}`);
    }

    const provider = createAiProvider(config);
    log(`调用模型 ${provider.name} 生成成稿……`);
    const article = await provider.generateArticle(input);
    log(`模型返回：${article.title}（正文 ${article.content.length} 字符）`);

    const validation = validateArticle(article, { targetKeywords: keywords, wordCount: input.wordCount }, site.brandNames);
    log(`SEO/GEO 校验得分 ${validation.score}${validation.ok ? '（通过）' : '（未通过）'}`);
    validation.issues.forEach((issue) => log(`  · ${issue}`));

    if (!validation.ok) {
      if (!options.dryRun) {
        await markTask(client, task.documentId, {
          runStatus: 'failed',
          retries: (task.retries ?? 0) + 1,
          log: mergeLog(task.log, logLines),
        });
      }
      return {
        ...base,
        status: 'failed',
        score: validation.score,
        issues: validation.issues,
        message: 'SEO/GEO 校验未通过，稿件未入库',
      };
    }

    const slug = uniqueSlug(article.slug || fallbackSlug('article'), taken);
    const payload = toArticlePayload({
      article,
      task,
      slug,
      score: validation.score,
      siteName: site.siteName,
      siteUrl: site.siteUrl,
      kbDocumentIds: snippets.map((snippet) => snippet.documentId).filter(Boolean),
      keywordDocumentId: resolved.picked?.documentId ?? null,
      promptTemplateDocumentId: task.promptTemplate?.documentId ?? null,
    });

    if (options.dryRun) {
      log(`[演练] 校验通过，将创建草稿：${slug}（不回写关键词使用次数）`);
      return {
        ...base,
        status: 'done',
        articleSlug: slug,
        score: validation.score,
        message: '演练完成（未落库）',
      };
    }

    const created = await client.create<StoredArticle>(PLURAL.articles, payload, { status: 'draft' });
    log(`已创建文章草稿：${created.slug}（等待人工确认发布）`);

    // 只有真正成稿才计数：失败任务不该污染「最少使用优先」的排序依据
    if (resolved.picked) {
      await markKeywordUsed(client, resolved.picked, log);
    }

    await markTask(client, task.documentId, {
      runStatus: 'done',
      // 成功后重试计数归零：否则下次手动「立即生成」失败时会沿用历史次数，
      // 一失败就被判定为「重试耗尽」而停用任务（见 scheduler 的 exhausted 判断）
      retries: 0,
      result: { connect: [{ documentId: created.documentId }] },
      log: mergeLog(task.log, logLines),
    });

    return {
      ...base,
      status: 'done',
      articleSlug: created.slug,
      score: validation.score,
      message: '草稿已生成，待人工发布',
    };
  } catch (error) {
    const message = (error as Error).message;
    log(`执行失败：${message}`);

    const retries = (task.retries ?? 0) + 1;
    const maxRetries = Math.max(1, config.maxRetries);
    const exhausted = retries >= maxRetries;

    if (!options.dryRun) {
      try {
        await markTask(client, task.documentId, {
          runStatus: exhausted ? 'failed' : 'pending',
          retries,
          log: mergeLog(task.log, logLines),
        });
      } catch (writeError) {
        logger(`回写任务状态失败：${(writeError as Error).message}`);
      }
    }

    return {
      ...base,
      status: 'failed',
      message: exhausted ? `${message}（已重试 ${retries} 次，标记失败）` : `${message}（第 ${retries} 次失败，保留待重试）`,
    };
  }
}

/** 批量执行：扫描待处理任务，按限额逐条处理 */
export async function runTasks(options: RunOptions = {}): Promise<RunSummary> {
  const logger = options.logger ?? ((message: string) => console.log(message));
  const config = loadAiConfig();

  if (!options.dryRun && !options.taskId) assertStrapiWriteReady(config);

  const client = createClient(config);
  const reachable = await client.ping();
  if (!reachable) {
    throw new Error(
      `无法连接 Strapi（${config.strapiUrl}）。请确认后台已启动（npm run develop），或检查 STRAPI_URL。`,
    );
  }

  const window = insideRunWindow();
  if (!window.ok && !options.force && !options.taskId) {
    logger(`跳过本轮执行：${window.reason}（如需强制执行，加 --force）`);
    return { scanned: 0, processed: 0, succeeded: 0, failed: 0, skipped: 0, results: [] };
  }
  if (window.reason) logger(window.reason);

  const site = await loadSiteContext(client, config);
  logger(`站点：${site.siteName}（${site.siteUrl}）｜品牌事实 ${site.brandFacts.length} 条`);

  const tasks = await loadPendingTasks(client, options.taskId);
  if (tasks.length === 0) {
    logger(options.taskId ? `未找到任务 ${options.taskId}` : '没有待处理任务（runStatus = pending）');
    return { scanned: 0, processed: 0, succeeded: 0, failed: 0, skipped: 0, results: [] };
  }

  const limit = Math.max(1, options.limit ?? config.dailyLimit);
  const queue = tasks.slice(0, limit);
  logger(`待处理任务 ${tasks.length} 条，本轮执行 ${queue.length} 条（限额 ${limit}）`);

  const summary: RunSummary = {
    scanned: tasks.length,
    processed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    results: [],
  };

  const deps: ExecutionDeps = { client, config, site, logger };

  for (const task of queue) {
    logger('');
    logger(`── 任务 ${task.documentId}｜${task.title}｜模式 ${task.mode} ──`);

    // 只有当任务本身是 pending（或未做状态校验的单篇执行）时才继续
    if (task.runStatus !== 'pending' && !options.taskId) {
      summary.skipped += 1;
      summary.results.push({
        taskId: task.documentId,
        title: task.title,
        status: 'skipped',
        issues: [],
        message: `状态为 ${task.runStatus}，跳过`,
      });
      continue;
    }

    const result = await executeTask(task, deps, { dryRun: options.dryRun });
    summary.processed += 1;
    if (result.status === 'done') summary.succeeded += 1;
    else summary.failed += 1;
    summary.results.push(result);
  }

  logger('');
  logger(
    `本轮结束：成功 ${summary.succeeded}｜失败 ${summary.failed}｜跳过 ${summary.skipped}（共扫描 ${summary.scanned} 条）`,
  );

  return summary;
}

/* -------------------------------- 预览模式 ------------------------------- */

export interface PreviewOptions {
  taskId?: string;
  topic?: string;
  keywords?: string;
  wordCount?: number;
  limit?: number;
  logger?: RunLogger;
}

/**
 * 只组装 Prompt 并打印，不调用模型、不写库。
 * 用途：没有密钥时自检素材与提示词，或人工确认「模型会看到什么」。
 */
export async function previewTask(options: PreviewOptions = {}): Promise<void> {
  const logger = options.logger ?? ((message: string) => console.log(message));
  const config = loadAiConfig();
  const client = createClient(config);

  const reachable = await client.ping();
  if (!reachable) {
    throw new Error(
      `无法连接 Strapi（${config.strapiUrl}）。请确认后台已启动（npm run develop），或检查 STRAPI_URL。`,
    );
  }

  const site = await loadSiteContext(client, config);

  let task: GenerationTaskRecord | undefined;
  if (options.taskId) {
    const tasks = await loadPendingTasks(client, options.taskId);
    task = tasks[0];
    if (!task) throw new Error(`未找到任务 ${options.taskId}`);
  } else if (options.topic) {
    task = {
      documentId: 'preview',
      title: options.topic,
      mode: 'ai',
      topic: options.topic,
      wordCount: options.wordCount ?? 1200,
      audience: '零基础想转行就业的求职者',
      tone: '专业、务实、口语化',
      targetKeywords: options.keywords ?? options.topic,
      runStatus: 'pending',
    };
  } else {
    const pending = await loadPendingTasks(client);
    task = pending[0];
    if (!task) {
      throw new Error('没有待处理任务。可用 --topic "选题" 直接预览，或先在后台创建任务计划。');
    }
  }

  const allEntries = await loadKbEntries(client);
  const scopedIds = (task.entries ?? []).map((entry) => entry.documentId).filter(Boolean);
  const scoped = scopedIds.length ? allEntries.filter((entry) => scopedIds.includes(entry.documentId)) : allEntries;

  // 与 executeTask 共用同一套解析：预览看到的必须就是实际生成会用的
  const resolved = await resolveTaskInput(client, task);
  const keywords = resolved.keywords;
  const topic = task.topic || task.title;
  const retriever = createKbRetriever(scoped);
  const snippets = await retriever.search({
    query: [topic, ...keywords].join(' '),
    keywords,
    limit: options.limit ?? 6,
  });
  const internalLinks = await loadInternalLinks(client);

  const input: GenerateInput = {
    topic,
    targetKeywords: keywords,
    audience: task.audience || '零基础想转行就业的求职者',
    tone: task.tone || '专业、务实、口语化',
    wordCount: task.wordCount || 1200,
    snippets,
    internalLinks: internalLinks.slice(0, 20),
    brandFacts: site.brandFacts,
    siteName: site.siteName,
    siteUrl: site.siteUrl,
    promptTemplate: resolved.promptTemplate,
  };

  const prompt = buildArticlePrompt(input);

  logger(`任务：${task.title}（${task.documentId}）｜模式 ${task.mode}`);
  resolved.reasons.forEach((reason) => logger(`  · ${reason}`));
  logger(`站点：${site.siteName}（${site.siteUrl}）`);
  logger(`命中素材 ${snippets.length} 条｜可用内链 ${internalLinks.length} 条｜品牌事实 ${site.brandFacts.length} 条`);
  logger('');
  logger(renderPromptPreview(prompt));

  if (!config.apiKey) {
    logger('');
    logger('提示：当前未配置 AI_API_KEY，仅预览提示词，未调用模型。');
  }
}

/* ------------------------------- 环境自检 ------------------------------- */

export interface CheckItem {
  name: string;
  ok: boolean;
  detail: string;
}

/** 上线前自检：Strapi、Token、模型配置、知识库素材是否就绪 */
export async function checkEnvironment(): Promise<CheckItem[]> {
  const config = loadAiConfig();
  const items: CheckItem[] = [];

  const client = createClient(config);

  const reachable = await client.ping();
  items.push({
    name: 'Strapi 服务',
    ok: reachable,
    detail: reachable ? `已连接 ${config.strapiUrl}` : `无法连接 ${config.strapiUrl}，请先 npm run develop`,
  });

  items.push({
    name: '写入 Token',
    ok: Boolean(config.writeToken),
    detail: config.writeToken
      ? '已配置 STRAPI_WRITE_TOKEN'
      : `未配置：生成结果无法写回后台（后台 → 设置 → API 令牌 → 新建 Full access 令牌）。${
          config.readToken ? '已用只读令牌回退，仅预览/自检可用' : ''
        }`,
  });

  items.push({
    name: 'AI 模型',
    ok: Boolean(config.apiKey),
    detail: config.apiKey
      ? `${config.provider}｜${config.model}｜${config.baseUrl}`
      : '未配置 AI_API_KEY：ai:run 无法执行，ai:preview 仍可用',
  });

  const window = insideRunWindow();
  items.push({
    name: '运行窗口',
    ok: window.ok,
    detail: process.env.AI_RUN_WINDOW?.trim() ? `AI_RUN_WINDOW=${process.env.AI_RUN_WINDOW}` : '未限制',
  });

  if (reachable) {
    try {
      const entries = await loadKbEntries(client);
      items.push({
        name: '知识库',
        ok: entries.length > 0,
        detail:
          entries.length > 0
            ? `已发布 ${entries.length} 条知识条目`
            : '没有已发布的知识条目：AI 模式会因缺少事实依据而拒绝出稿',
      });
    } catch (error) {
      items.push({ name: '知识库', ok: false, detail: `读取失败：${(error as Error).message}` });
    }

    try {
      const tasks = await loadPendingTasks(client);
      items.push({
        name: '生成任务',
        ok: true,
        detail: tasks.length > 0 ? `待处理 ${tasks.length} 条` : '暂无待处理任务',
      });
    } catch (error) {
      items.push({ name: '生成任务', ok: false, detail: `读取失败：${(error as Error).message}` });
    }
  }

  return items;
}
