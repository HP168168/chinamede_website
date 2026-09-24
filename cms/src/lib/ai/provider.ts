import { buildArticlePrompt } from './prompt';
import { buildKeywordSystemPrompt, buildKeywordUserPrompt, isKeywordCategory } from './keywords';
import type {
  AiConfig,
  AiProvider,
  GenerateInput,
  GeneratedArticle,
  KeywordCategory,
  KeywordExpandInput,
} from './types';

/**
 * 统一 Provider：默认实现 OpenAI 兼容协议。
 * DeepSeek / 通义千问（兼容模式）/ OpenAI / 本地 vLLM 均通过
 * AI_BASE_URL + AI_MODEL 切换，代码无需改动。
 */

/** 从模型输出里提取 JSON（容忍 markdown 代码块与前后解释文字） */
export function extractJson(text: string): unknown {
  const withoutFence = text
    .replace(/^\s*```(?:json)?/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const start = withoutFence.indexOf('{');
  const end = withoutFence.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('输出中找不到 JSON 对象');
  }

  return JSON.parse(withoutFence.slice(start, end + 1));
}

const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value.trim() : fallback;

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

function normalizeQaList(value: unknown): { question: string; answer: string }[] {
  return asArray(value)
    .map((item) => {
      const record = item as Record<string, unknown>;
      return {
        question: asString(record?.question),
        answer: asString(record?.answer),
      };
    })
    .filter((item) => item.question && item.answer);
}

/** 把模型返回的任意对象规范化为 GeneratedArticle，缺失字段兜底为空 */
export function normalizeArticle(raw: unknown): GeneratedArticle {
  if (!raw || typeof raw !== 'object') {
    throw new Error('模型返回的不是对象');
  }
  const value = raw as Record<string, unknown>;
  const seo = (value.seo ?? {}) as Record<string, unknown>;

  const article: GeneratedArticle = {
    title: asString(value.title),
    slug: asString(value.slug).toLowerCase(),
    summary: asString(value.summary),
    content: asString(value.content),
    seo: {
      title: asString(seo.title) || asString(value.title),
      description: asString(seo.description) || asString(value.summary),
      keywords: asString(seo.keywords),
      canonical: asString(seo.canonical) || undefined,
    },
    answerBlocks: normalizeQaList(value.answerBlocks),
    keyFacts: asArray(value.keyFacts)
      .map((item) => {
        const record = item as Record<string, unknown>;
        return { label: asString(record?.label), value: asString(record?.value) };
      })
      .filter((item) => item.label && item.value),
    faq: normalizeQaList(value.faq),
    sources: asArray(value.sources)
      .map((item) => {
        const record = item as Record<string, unknown>;
        return { label: asString(record?.label), url: asString(record?.url) || undefined };
      })
      .filter((item) => item.label),
    relatedLinks: asArray(value.relatedLinks)
      .map((item) => {
        const record = item as Record<string, unknown>;
        return { title: asString(record?.title), url: asString(record?.url) };
      })
      .filter((item) => item.title && item.url),
    tags: asArray(value.tags).map((tag) => asString(tag)).filter(Boolean),
  };

  if (!article.title) throw new Error('模型输出缺少标题');
  if (!article.content) throw new Error('模型输出缺少正文');
  if (!article.slug) {
    article.slug = `article-${Date.now()}`;
  }

  return article;
}

/** 把模型返回的分组规范化：多余的键丢弃、缺失的类补空数组、值一律转成字符串数组 */
export function normalizeKeywordGroups(raw: unknown): Record<KeywordCategory, string[]> {
  if (!raw || typeof raw !== 'object') {
    throw new Error('模型返回的不是对象');
  }

  const value = raw as Record<string, unknown>;
  const groups = {} as Record<KeywordCategory, string[]>;

  for (const key of Object.keys(value)) {
    if (!isKeywordCategory(key)) continue;
    groups[key] = asArray(value[key]).map((item) => asString(item)).filter(Boolean);
  }

  return groups;
}

export class OpenAiCompatibleProvider implements AiProvider {
  readonly name: string;

  constructor(private readonly config: AiConfig) {
    this.name = `${config.provider}:${config.model}`;
  }

  /**
   * 发起一次对话并返回模型原文。
   *
   * 文章生成与关键词扩词都走这里：差别只有温度与长度上限——
   * 写文章要稳（低温度），扩词要发散（高温度）。
   */
  private async complete(
    system: string,
    user: string,
    options: { temperature?: number; maxTokens?: number } = {},
  ): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetch(
        `${this.config.baseUrl.replace(/\/+$/, '')}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            model: this.config.model,
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: user },
            ],
            temperature: options.temperature ?? 0.6,
            max_tokens: options.maxTokens ?? 4096,
          }),
          signal: controller.signal,
        },
      );

      const text = await response.text();
      if (!response.ok) {
        throw new Error(`模型接口返回 HTTP ${response.status}：${text.slice(0, 400)}`);
      }

      const payload = JSON.parse(text) as {
        choices?: { message?: { content?: string } }[];
        error?: { message?: string };
      };

      if (payload.error?.message) {
        throw new Error(`模型接口报错：${payload.error.message}`);
      }

      const content = payload.choices?.[0]?.message?.content;
      if (!content) throw new Error('模型未返回任何内容');

      return content;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`模型请求超时（${this.config.timeoutMs}ms），可通过 AI_TIMEOUT_MS 调整`);
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  async generateArticle(input: GenerateInput): Promise<GeneratedArticle> {
    const prompt = buildArticlePrompt(input);

    // 首次解析失败时追加一次「修正输出格式」的重试，提升长文本任务的成稿率
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const user =
        attempt === 0
          ? prompt.user
          : `${prompt.user}\n\n【重要】上一次输出无法解析为 JSON。请重新输出，且只输出一个合法 JSON 对象，不要任何额外文字或代码块标记。`;

      const raw = await this.complete(prompt.system, user);
      try {
        return normalizeArticle(extractJson(raw));
      } catch (error) {
        if (attempt === 1) {
          throw new Error(`模型输出无法解析：${(error as Error).message}`);
        }
      }
    }

    throw new Error('模型输出无法解析');
  }

  async generateKeywords(input: KeywordExpandInput): Promise<Record<KeywordCategory, string[]>> {
    const system = buildKeywordSystemPrompt();
    const user = buildKeywordUserPrompt(input);

    // 扩词要的是多样性，温度比写文章略高；同样保留一次「只输出 JSON」的重试
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const raw = await this.complete(
        system,
        attempt === 0
          ? user
          : `${user}\n\n【重要】上一次输出无法解析为 JSON。请重新输出，且只输出一个合法 JSON 对象，不要任何额外文字或代码块标记。`,
        { temperature: 0.9, maxTokens: 2048 },
      );

      try {
        return normalizeKeywordGroups(extractJson(raw));
      } catch (error) {
        if (attempt === 1) {
          throw new Error(`模型输出的关键词无法解析：${(error as Error).message}`);
        }
      }
    }

    throw new Error('模型输出的关键词无法解析');
  }
}

/** Provider 工厂：后续接入其它协议时在此扩展 */
export function createAiProvider(config: AiConfig): AiProvider {
  switch (config.provider) {
    case 'openai-compatible':
    case 'openai':
    case 'deepseek':
    case 'qwen':
      return new OpenAiCompatibleProvider(config);
    default:
      throw new Error(
        `未知的 AI_PROVIDER：「${config.provider}」。目前支持 openai-compatible（DeepSeek / 通义 / OpenAI 均可用）。`,
      );
  }
}
