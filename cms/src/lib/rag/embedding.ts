/**
 * 向量化（embedding）客户端。
 *
 * 只走「OpenAI 兼容」的 /embeddings 接口——国内主流厂商都提供这种兼容端点，
 * 因此不需要为每家写一套 SDK：换厂商只改环境变量。
 *
 *   通义千问  EMBEDDING_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
 *             EMBEDDING_MODEL=text-embedding-v3
 *   智谱      EMBEDDING_BASE_URL=https://open.bigmodel.cn/api/paas/v4
 *             EMBEDDING_MODEL=embedding-3
 *   OpenAI    EMBEDDING_BASE_URL=https://api.openai.com/v1
 *             EMBEDDING_MODEL=text-embedding-3-small
 */

const DEFAULT_TIMEOUT_MS = 30000;

export interface EmbeddingConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  /** 手动指定维度；留空则按首次返回推断 */
  dimension?: number;
  timeoutMs: number;
}

function env(name: string, fallback = ''): string {
  const value = process.env[name];
  return value === undefined || value.trim() === '' ? fallback : value.trim();
}

export function loadEmbeddingConfig(): EmbeddingConfig {
  const dimension = Number.parseInt(env('EMBEDDING_DIM', ''), 10);
  return {
    // 默认与内容工厂一致走 DeepSeek 生态；没有 embedding 端点时用户需自行指定
    baseUrl: env('EMBEDDING_BASE_URL', 'https://dashscope.aliyuncs.com/compatible-mode/v1').replace(
      /\/+$/,
      '',
    ),
    apiKey: env('EMBEDDING_API_KEY', env('AI_API_KEY', '')),
    model: env('EMBEDDING_MODEL', 'text-embedding-v3'),
    dimension: Number.isFinite(dimension) && dimension > 0 ? dimension : undefined,
    timeoutMs: Number.parseInt(env('EMBEDDING_TIMEOUT_MS', String(DEFAULT_TIMEOUT_MS)), 10) || DEFAULT_TIMEOUT_MS,
  };
}

export function assertEmbeddingReady(config: EmbeddingConfig): void {
  if (config.apiKey) return;
  throw new Error(
    [
      '未配置向量化密钥，无法建立知识库索引。',
      '',
      '请在 cms/.env 中补充（任选一家你已开通的厂商）：',
      '  EMBEDDING_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1',
      '  EMBEDDING_MODEL=text-embedding-v3',
      '  EMBEDDING_API_KEY=<你的密钥>',
      '',
      '未配置时内容工厂会自动退回关键词检索（KB_RETRIEVER=keyword），功能不受影响。',
    ].join('\n'),
  );
}

interface EmbeddingResponse {
  data?: { embedding?: number[] }[];
}

/** 批量向量化；返回与输入顺序一致的结果 */
export async function embedTexts(texts: string[], config: EmbeddingConfig): Promise<number[][]> {
  if (texts.length === 0) return [];

  assertEmbeddingReady(config);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(`${config.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        input: texts,
        ...(config.dimension ? { dimensions: config.dimension } : {}),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`向量化接口返回 ${response.status}：${detail.slice(0, 300)}`);
    }

    const payload = (await response.json()) as EmbeddingResponse;
    const vectors = (payload.data ?? []).map((item) => item.embedding ?? []);

    if (vectors.length !== texts.length) {
      throw new Error(
        `向量化返回的条数（${vectors.length}）与输入（${texts.length}）不一致，请检查 ${config.model} 的返回格式`,
      );
    }
    if (vectors.some((vector) => vector.length === 0)) {
      throw new Error('向量化返回了空向量，请检查模型名与密钥是否匹配');
    }

    return vectors;
  } finally {
    clearTimeout(timer);
  }
}

/** 单条向量化（检索时的查询向量） */
export async function embedQuery(text: string, config: EmbeddingConfig): Promise<number[]> {
  const [vector] = await embedTexts([text], config);
  return vector ?? [];
}

/** 余弦相似度：值域 [-1, 1]，越大越相关 */
export function cosineSimilarity(a: number[], b: number[]): number {
  const length = Math.min(a.length, b.length);
  if (length === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
