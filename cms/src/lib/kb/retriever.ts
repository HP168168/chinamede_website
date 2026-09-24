import type { KbEntryRecord, KbRetriever, KbSnippet } from '../ai/types';
import { cosineSimilarity, embedQuery, loadEmbeddingConfig, type EmbeddingConfig } from '../rag/embedding';
import { openKbVectorStore, type KbVectorStore, type StoredChunk } from '../rag/vector-store';

/**
 * 知识检索层：把「从知识库取素材」这件事收口到一个接口后面。
 *
 * 三种实现，用 KB_RETRIEVER 环境变量切换：
 *   keyword（默认）  关键词/标签打分，零依赖、零成本，始终可用
 *   vector | hybrid  向量检索（内嵌 SQLite 向量表 + 云 embedding），hybrid 会与关键词结果融合
 *   remote           调用外部知识库（如 ima），需要配置端点
 *
 * 设计上的硬要求：**检索失败必须降级，不能让生成流程中断**。
 * 向量库没建、embedding 密钥没配、外部知识库超时，都应该退回关键词检索并给一条提示，
 * 而不是抛错让整批任务失败。
 */

/** 极简中文分词：按非字母数字汉字切分，并保留 2 字以上的连续片段 */
function tokenize(text: string): string[] {
  const normalized = text.toLowerCase().replace(/[^\p{Script=Han}a-z0-9]+/gu, ' ');
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const grams: string[] = [];

  for (const token of tokens) {
    if (/^[a-z0-9]+$/.test(token)) {
      grams.push(token);
      continue;
    }
    // 中文：整段 + 二元组，兼顾准确与召回
    grams.push(token);
    for (let i = 0; i < token.length - 1; i += 1) {
      grams.push(token.slice(i, i + 2));
    }
  }

  return grams;
}

/** 安全取字符串数组（可重复字段在 Strapi 返回里可能是 null 或单值） */
function asList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function scoreEntry(entry: KbEntryRecord, queryTokens: string[], keywordTokens: string[]): number {
  const haystack = [
    entry.title,
    entry.topic ?? '',
    asList(entry.aliases).join(' '),
    asList(entry.tags).join(' '),
    (entry.points ?? []).map((p) => p.text).join(' '),
    (entry.facts ?? []).map((f) => `${f.label} ${f.value}`).join(' '),
    (entry.qa ?? []).map((q) => `${q.question} ${q.answer}`).join(' '),
  ]
    .join(' ')
    .toLowerCase();

  if (!haystack) return 0;

  let score = 0;
  const titleLower = entry.title.toLowerCase();

  for (const token of queryTokens) {
    if (haystack.includes(token)) score += 1;
    if (titleLower.includes(token)) score += 2;
  }
  // 目标关键词命中权重更高：直接决定文章与搜索意图的相关性
  for (const token of keywordTokens) {
    if (haystack.includes(token)) score += 3;
    if (titleLower.includes(token)) score += 4;
  }

  // 有明确来源与可引用表述的条目优先，提升生成内容的可信度
  if (entry.citation) score += 1;
  if ((entry.sources ?? []).length > 0) score += 1;

  return score;
}

function toSnippet(entry: KbEntryRecord, score: number): KbSnippet {
  return {
    documentId: entry.documentId,
    title: entry.title,
    category: entry.category ?? 'other',
    topic: entry.topic ?? undefined,
    points: (entry.points ?? []).map((p) => p.text).filter(Boolean),
    facts: entry.facts ?? [],
    qa: entry.qa ?? [],
    citation: entry.citation ?? undefined,
    sources: entry.sources ?? [],
    credibility: entry.credibility ?? undefined,
    score,
  };
}

/** 条目已被删除但向量库里还有分片时的兜底片段 */
function toFallbackSnippet(chunk: StoredChunk, score: number): KbSnippet {
  return {
    documentId: chunk.entryDocumentId,
    title: chunk.entryTitle,
    category: 'other',
    topic: undefined,
    points: [chunk.text],
    facts: [],
    qa: [],
    citation: undefined,
    sources: [],
    credibility: undefined,
    score,
  };
}

export class KeywordKbRetriever implements KbRetriever {
  constructor(private readonly entries: KbEntryRecord[]) {}

  async search(input: { query: string; keywords?: string[]; limit?: number }): Promise<KbSnippet[]> {
    const limit = input.limit ?? 6;
    const queryTokens = tokenize(input.query);
    const keywordTokens = tokenize((input.keywords ?? []).join(' '));

    const scored = this.entries
      .map((entry) => ({ entry, score: scoreEntry(entry, queryTokens, keywordTokens) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    // 全部未命中时退回前 N 条，保证「知识库为空/关键词生僻」也能出稿
    const picked = scored.length > 0 ? scored.slice(0, limit) : this.entries.slice(0, limit);

    return picked.map((item) => toSnippet(item.entry, item.score));
  }
}

/** 纯向量检索：语义相近但用词完全不同的条目也能召回 */
export class VectorKbRetriever implements KbRetriever {
  constructor(
    private readonly entries: KbEntryRecord[],
    private readonly store: KbVectorStore,
    private readonly config: EmbeddingConfig,
  ) {}

  async search(input: { query: string; keywords?: string[]; limit?: number }): Promise<KbSnippet[]> {
    const limit = input.limit ?? 6;
    const queryText = [input.query, (input.keywords ?? []).join(' ')].filter(Boolean).join(' ').trim();

    const chunks = this.store.all();
    if (chunks.length === 0) {
      throw new Error('向量库为空，请先执行知识库索引（npm run kb:index）');
    }

    const vector = await embedQuery(queryText || input.query, this.config);
    if (vector.length === 0) throw new Error('查询向量为空');

    // 同一条目的多个分片取最高分，避免一条目占满结果
    const best = new Map<string, { score: number; chunk: StoredChunk }>();
    for (const chunk of chunks) {
      const score = cosineSimilarity(vector, Array.from(chunk.vector));
      const previous = best.get(chunk.entryDocumentId);
      if (!previous || score > previous.score) best.set(chunk.entryDocumentId, { score, chunk });
    }

    return [...best.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ score, chunk }) => this.toResult(chunk, score));
  }

  private toResult(chunk: StoredChunk, score: number): KbSnippet {
    const entry = this.entries.find((item) => item.documentId === chunk.entryDocumentId);
    return entry ? toSnippet(entry, score) : toFallbackSnippet(chunk, score);
  }
}

/**
 * 混合检索（推荐）：向量负责「语义相关」，关键词负责「术语精确命中」。
 * 任一侧不可用都会自动降级，绝不让生成流程因为没有向量库而中断。
 */
export class HybridKbRetriever implements KbRetriever {
  private readonly keyword: KeywordKbRetriever;
  private readonly vector: VectorKbRetriever | null;

  constructor(
    private readonly entries: KbEntryRecord[],
    store: KbVectorStore | null,
    config: EmbeddingConfig,
  ) {
    this.keyword = new KeywordKbRetriever(entries);
    this.vector = store ? new VectorKbRetriever(entries, store, config) : null;
  }

  async search(input: { query: string; keywords?: string[]; limit?: number }): Promise<KbSnippet[]> {
    const limit = input.limit ?? 6;

    const keywordHits = await this.keyword.search({ ...input, limit: limit * 3 });
    const keywordScores = new Map(keywordHits.map((snippet) => [snippet.documentId, snippet.score]));
    const keywordMax = Math.max(1, ...keywordScores.values());

    let vectorScores = new Map<string, number>();
    if (this.vector) {
      try {
        const hits = await this.vector.search({ ...input, limit: limit * 3 });
        vectorScores = new Map(hits.map((snippet) => [snippet.documentId, snippet.score]));
      } catch (error) {
        console.warn(`[kb] 向量检索不可用，本轮退回关键词检索：${(error as Error).message}`);
      }
    }

    if (vectorScores.size === 0) return keywordHits.slice(0, limit);

    const candidates = new Set([...keywordScores.keys(), ...vectorScores.keys()]);
    const ranked = [...candidates]
      .map((documentId) => {
        const vectorScore = vectorScores.get(documentId) ?? 0;
        const keywordScore = (keywordScores.get(documentId) ?? 0) / keywordMax;
        // 语义为主、术语命中为辅：7:3 的比例在「同义改写」和「专有名词」之间取得平衡
        return { documentId, score: vectorScore * 0.7 + keywordScore * 0.3 };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return ranked
      .map(({ documentId, score }) => {
        const entry = this.entries.find((item) => item.documentId === documentId);
        return entry ? toSnippet(entry, score) : null;
      })
      .filter((snippet): snippet is KbSnippet => snippet !== null);
  }
}

/**
 * 外部知识库适配器（如 ima 知识库）。
 *
 * 只约定一件事：POST 端点，请求体 { query, keywords, limit }，
 * 响应里能找到一组结果（results / data / list 任一），每条含文本（text / content / snippet）。
 * 命中结果若能在本地知识条目里按标题/ID 对上，就补全成结构化片段；
 * 对不上则以纯文本片段参与生成——至少不会丢掉外部知识。
 */
export class RemoteKbRetriever implements KbRetriever {
  private readonly endpoint: string;
  private readonly token: string;
  private readonly timeoutMs: number;

  constructor(private readonly entries: KbEntryRecord[]) {
    this.endpoint = (process.env.EXTERNAL_KB_ENDPOINT ?? '').trim();
    this.token = (process.env.EXTERNAL_KB_TOKEN ?? '').trim();
    this.timeoutMs =
      Number.parseInt(process.env.EXTERNAL_KB_TIMEOUT_MS ?? '10000', 10) || 10000;
  }

  get configured(): boolean {
    return this.endpoint !== '';
  }

  async search(input: { query: string; keywords?: string[]; limit?: number }): Promise<KbSnippet[]> {
    if (!this.configured) {
      throw new Error('未配置 EXTERNAL_KB_ENDPOINT，外部知识库不可用');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: JSON.stringify({
          query: input.query,
          keywords: input.keywords ?? [],
          limit: input.limit ?? 6,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`外部知识库返回 ${response.status}`);
      }

      const payload = (await response.json()) as Record<string, unknown>;
      const list = (payload.results ?? payload.data ?? payload.list ?? []) as Record<string, unknown>[];

      return list
        .map((item, index) => this.toSnippet(item, index, list.length))
        .filter((snippet): snippet is KbSnippet => snippet !== null)
        .slice(0, input.limit ?? 6);
    } finally {
      clearTimeout(timer);
    }
  }

  private toSnippet(item: Record<string, unknown>, index: number, total: number): KbSnippet | null {
    const text = String(item.text ?? item.content ?? item.snippet ?? item.answer ?? '').trim();
    const title = String(item.title ?? item.name ?? '').trim();
    if (!text && !title) return null;

    // 能在本地知识条目里对上就用结构化的（含要点/数据/来源，更利于被引用）
    const docId = String(item.documentId ?? item.id ?? '').trim();
    const local = this.entries.find(
      (entry) => (docId && entry.documentId === docId) || (title && entry.title === title),
    );

    // 远程没给分数就按返回顺序递减，保证排序稳定
    const raw = Number(item.score);
    const score = Number.isFinite(raw) ? raw : (total - index) / Math.max(1, total);

    if (local) return toSnippet(local, score);

    return {
      documentId: docId || `remote-${index}`,
      title: title || text.slice(0, 20),
      category: 'other',
      topic: undefined,
      points: [text],
      facts: [],
      qa: [],
      citation: undefined,
      sources: [],
      credibility: '来自外部知识库',
      score,
    };
  }
}

/**
 * 检索器工厂：按 KB_RETRIEVER 选择实现，任何一步失败都退回关键词检索。
 *
 *   keyword  纯关键词（默认，零配置）
 *   vector   向量检索（向量库为空时降级）
 *   hybrid   向量 + 关键词融合（推荐）
 *   remote   外部知识库（如 ima），未配置端点时降级
 */
export function createKbRetriever(entries: KbEntryRecord[]): KbRetriever {
  const mode = (process.env.KB_RETRIEVER ?? 'keyword').trim().toLowerCase();
  const keyword = new KeywordKbRetriever(entries);

  if (mode === 'remote') {
    const remote = new RemoteKbRetriever(entries);
    if (remote.configured) return remote;
    console.warn('[kb] KB_RETRIEVER=remote 但未配置 EXTERNAL_KB_ENDPOINT，退回关键词检索');
    return keyword;
  }

  if (mode === 'vector' || mode === 'hybrid') {
    const store = openKbVectorStore();
    if (!store) {
      console.warn('[kb] 向量库打开失败，退回关键词检索');
      return keyword;
    }

    const config = loadEmbeddingConfig();
    return mode === 'vector'
      ? new VectorKbRetriever(entries, store, config)
      : new HybridKbRetriever(entries, store, config);
  }

  return keyword;
}
