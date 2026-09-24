/**
 * 内容工厂与知识库的公共类型定义。
 */

/* ------------------------------ 内容工厂配置 ------------------------------ */

export interface AiConfig {
  /** 供应商标识，目前仅实现 openai 兼容协议 */
  provider: string;
  /** 兼容协议的基础地址，如 https://api.deepseek.com/v1 */
  baseUrl: string;
  /** 模型名，如 deepseek-chat */
  model: string;
  /** 密钥，未配置时只有 ai:preview 可用 */
  apiKey: string;
  /** 单次运行最多生成篇数 */
  dailyLimit: number;
  /** 单篇失败重试次数上限 */
  maxRetries: number;
  /** 单次请求超时（毫秒） */
  timeoutMs: number;
  /** Strapi 服务地址 */
  strapiUrl: string;
  /** 只读 API Token（知识库/任务读取；未配置写入令牌时作为回退） */
  readToken: string;
  /** 具备写入权限的 API Token（生成草稿、回写任务状态） */
  writeToken: string;
  /** 官网基准地址 */
  siteUrl: string;
}

/* --------------------------------- 知识库 -------------------------------- */

export interface KbFact {
  label: string;
  value: string;
  year?: string;
  source?: string;
}

export interface KbQa {
  question: string;
  answer: string;
}

export interface KbSource {
  label: string;
  url?: string;
  note?: string;
}

export interface KbPoint {
  text: string;
}

/** 从 Strapi 拉取到的知识条目原始记录 */
export interface KbEntryRecord {
  documentId: string;
  title: string;
  slug: string;
  aliases?: string[] | null;
  category?: string | null;
  topic?: string | null;
  points?: KbPoint[] | null;
  facts?: KbFact[] | null;
  qa?: KbQa[] | null;
  citation?: string | null;
  sources?: KbSource[] | null;
  tags?: string[] | null;
  credibility?: string | null;
  relatedCourses?: { title?: string; slug?: string }[] | null;
}

/** 任务上关联的知识条目引用（只带定位字段，素材内容另行拉取） */
export interface KbEntryRef {
  documentId: string;
  slug?: string;
}

/** 检索层返回的知识片段 */
export interface KbSnippet {
  documentId: string;
  title: string;
  category: string;
  topic?: string;
  points: string[];
  facts: KbFact[];
  qa: KbQa[];
  citation?: string;
  sources: KbSource[];
  credibility?: string;
  /** 匹配得分，越大越相关 */
  score: number;
}

/**
 * 知识检索接口。
 *
 * 当前由关键词/标签匹配实现（KeywordKbRetriever）；
 * 后续接入向量检索时，只需提供新的实现并替换工厂函数，
 * 生成流程与页面均无需改动。
 */
export interface KbRetriever {
  search(input: { query: string; keywords?: string[]; limit?: number }): Promise<KbSnippet[]>;
}

/* -------------------------------- 生成流程 ------------------------------- */

export interface InternalLink {
  title: string;
  url: string;
}

export interface GenerateInput {
  /** 选题/标题方向 */
  topic: string;
  /** 目标关键词 */
  targetKeywords: string[];
  /** 目标读者 */
  audience: string;
  /** 语气风格 */
  tone: string;
  /** 目标字数 */
  wordCount: number;
  /** 知识库素材 */
  snippets: KbSnippet[];
  /** 可用的站内链接（内链用） */
  internalLinks: InternalLink[];
  /** 品牌事实（来自站点设置的 llms 分组） */
  brandFacts: string[];
  /** 站点名称与基准地址 */
  siteName: string;
  siteUrl: string;
  /**
   * 运营在后台选定的提示词。作为「本次写作要求」注入系统提示的附加段落，
   * 只影响写作侧重点，**不改变输出必须是 JSON 的契约**。
   */
  promptTemplate?: { title: string; content: string } | null;
}

export interface GeneratedSeo {
  title: string;
  description: string;
  keywords: string;
  canonical?: string;
}

export interface GeneratedArticle {
  title: string;
  slug: string;
  summary: string;
  /** 正文 HTML */
  content: string;
  seo: GeneratedSeo;
  /** 可直接被引用的答案段落 */
  answerBlocks: KbQa[];
  /** 关键数据要点 */
  keyFacts: { label: string; value: string }[];
  faq: KbQa[];
  sources: KbSource[];
  relatedLinks: InternalLink[];
  tags: string[];
}

export interface AiProvider {
  readonly name: string;
  generateArticle(input: GenerateInput): Promise<GeneratedArticle>;
  /**
   * 围绕一个核心种子词批量扩展五类关键词。
   * 返回的是**模型原始产出的分组**，清洗与去重由调用方负责（见 lib/ai/keywords.ts）。
   */
  generateKeywords(input: KeywordExpandInput): Promise<Record<KeywordCategory, string[]>>;
}

/* --------------------------------- 校验 --------------------------------- */

export interface ValidationResult {
  ok: boolean;
  score: number;
  issues: string[];
}

/* ------------------------------- 定时任务 ------------------------------- */

export type GenerationMode = 'ai' | 'manual';
export type GenerationStatus = 'pending' | 'running' | 'done' | 'failed' | 'cancelled';

export interface GenerationTaskRecord {
  documentId: string;
  title: string;
  mode: GenerationMode;
  topic?: string | null;
  wordCount?: number | null;
  audience?: string | null;
  tone?: string | null;
  targetKeywords?: string | null;
  runStatus: GenerationStatus;
  retries?: number | null;
  log?: string | null;
  requestedBy?: string | null;
  /** 关联知识条目（AI 模式的事实来源）；为空时使用全部已发布条目 */
  entries?: KbEntryRef[] | null;
  /**
   * 关键词类型与具体关键词。三个字段都必须可选：
   * previewTask 在没指定任务时会现场合成一个 record（只填少量字段）。
   */
  keywordCategory?: KeywordCategory | null;
  keyword?: { documentId: string; word: string } | null;
  promptTemplate?: { documentId: string; title: string; content: string } | null;
}

/* ------------------------------ 关键词 ------------------------------ */

/** 五类关键词的取值；显示名与生成规则见 lib/ai/keywords.ts */
export type KeywordCategory = 'core' | 'brand' | 'scene' | 'region' | 'longtail';

/** 分类定义：显示名 + 写进提示词的解释 + 单次产出的建议上限 */
export interface KeywordCategoryMeta {
  key: KeywordCategory;
  label: string;
  hint: string;
  max: number;
}

/** AI 批量扩词的入参 */
export interface KeywordExpandInput {
  /** 核心种子词 */
  seedWord: string;
  /** 可选城市：区域词只能从这里取，避免模型自造本地没有的地区 */
  cities: string[];
  /** 库中已有的词，用于让模型避开重复 */
  existingWords: string[];
  /** 每类条数上限，未指定的类用 classification 里的默认值 */
  perCategory: Partial<Record<KeywordCategory, number>>;
}

/* ------------------------------- 站点设置 ------------------------------- */

export interface SiteConfigRecord {
  name?: string;
  baseUrl?: string;
  llmsIntro?: string | null;
  llmsFacts?: string[] | null;
  llmsCitation?: string | null;
}
