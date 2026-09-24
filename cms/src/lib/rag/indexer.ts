import type { KbEntryRecord } from '../ai/types';
import { embedTexts, type EmbeddingConfig } from './embedding';
import type { KbVectorStore } from './vector-store';

/**
 * 知识条目 → 分片 → 向量 → 入库。
 *
 * 切片原则：**按语义完整性切，不按字数硬切**。
 * 一条知识条目本来就是结构化的（要点 / 数据 / 问答），
 * 直接把每种结构作为一个分片，检索命中时能整块交给模型，
 * 比按 500 字窗口滑动切出来的碎片可读性高得多，也更利于被 AI 原样引用。
 */

export interface KbChunkDraft {
  section: string;
  text: string;
}

/**
 * 安全取字符串数组。
 * 可重复字段在 Strapi 返回里可能是 null / 单值，类型声明却写的是 string[]，
 * 直接 .join 会在运行期炸掉——索引这种旁路功能绝不能因为脏数据把主流程带崩。
 */
function asList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

const BATCH_SIZE = 10;

/** 把一条知识条目切成若干语义完整的分片 */
export function chunkEntry(entry: KbEntryRecord): KbChunkDraft[] {
  const chunks: KbChunkDraft[] = [];
  const title = entry.title ?? '';

  // 概览：标题 + 主题 + 别名 + 标签 + 可被引用时的标准表述
  const aliases = asList(entry.aliases);
  const tags = asList(entry.tags);

  const overview = [
    `【${title}】`,
    entry.topic,
    aliases.length ? `别名：${aliases.join('、')}` : '',
    tags.length ? `标签：${tags.join('、')}` : '',
    entry.citation ? `引用表述：${entry.citation}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  if (overview.trim()) chunks.push({ section: 'overview', text: overview });

  const points = (entry.points ?? []).map((point) => point.text).filter(Boolean);
  if (points.length > 0) {
    chunks.push({
      section: 'points',
      text: [`【${title}】要点`, ...points.map((text) => `- ${text}`)].join('\n'),
    });
  }

  const facts = (entry.facts ?? [])
    .map((fact) => {
      const parts = [fact.label, fact.value].filter(Boolean).join('：');
      const meta = [fact.year ? `${fact.year}年` : '', fact.source ? `来源：${fact.source}` : '']
        .filter(Boolean)
        .join('，');
      return meta ? `${parts}（${meta}）` : parts;
    })
    .filter(Boolean);

  if (facts.length > 0) {
    chunks.push({
      section: 'facts',
      text: [`【${title}】关键数据`, ...facts.map((text) => `- ${text}`)].join('\n'),
    });
  }

  // 问答逐条成片：用户搜索意图往往就是一个问题，整条命中最好用
  (entry.qa ?? []).forEach((item, index) => {
    const question = item.question ?? '';
    const answer = item.answer ?? '';
    if (!question && !answer) return;
    chunks.push({
      section: `qa-${index + 1}`,
      text: [`【${title}】`, `问：${question}`, `答：${answer}`].join('\n'),
    });
  });

  return chunks;
}

interface IndexOptions {
  logger?: (message: string) => void;
  onProgress?: (done: number, total: number) => void;
}

export interface IndexReport {
  entries: number;
  chunks: number;
  failed: number;
}

/**
 * 建立/重建索引。
 *
 * 单条失败不影响其他条目——索引是「增强」而不是「前提」，
 * 缺几条只会让这些条目的向量召回变弱，关键词检索仍在。
 */
export async function indexEntries(
  entries: KbEntryRecord[],
  store: KbVectorStore,
  config: EmbeddingConfig,
  options: IndexOptions = {},
): Promise<IndexReport> {
  const logger = options.logger ?? (() => undefined);
  const report: IndexReport = { entries: 0, chunks: 0, failed: 0 };

  const pending: { entry: KbEntryRecord; chunk: KbChunkDraft; index: number }[] = [];
  const entryChunks = new Map<string, KbChunkDraft[]>();

  for (const entry of entries) {
    const chunks = chunkEntry(entry);
    if (chunks.length === 0) continue;
    entryChunks.set(entry.documentId, chunks);
    chunks.forEach((chunk, index) => pending.push({ entry, chunk, index }));
  }

  const updatedAt = new Date().toISOString();

  for (let start = 0; start < pending.length; start += BATCH_SIZE) {
    const batch = pending.slice(start, start + BATCH_SIZE);

    try {
      // 分片文本前面带上条目标题，避免「要点」「关键数据」这类通用词干扰语义
      const vectors = await embedTexts(batch.map((item) => item.chunk.text), config);

      batch.forEach((item, offset) => {
        store.upsert({
          entryDocumentId: item.entry.documentId,
          entrySlug: item.entry.slug,
          entryTitle: item.entry.title ?? '',
          chunkIndex: item.index,
          section: item.chunk.section,
          text: item.chunk.text,
          vector: vectors[offset],
          updatedAt,
        });
        report.chunks += 1;
      });
    } catch (error) {
      report.failed += batch.length;
      logger(`分片向量化失败（${batch.length} 条）：${(error as Error).message}`);
    }

    options.onProgress?.(Math.min(start + BATCH_SIZE, pending.length), pending.length);
  }

  for (const entry of entries) {
    const chunks = entryChunks.get(entry.documentId);
    if (!chunks) continue;
    report.entries += 1;
  }

  return report;
}

/** 单条索引（后台保存某条知识后调用） */
export async function indexEntry(
  entry: KbEntryRecord,
  store: KbVectorStore,
  config: EmbeddingConfig,
): Promise<number> {
  const chunks = chunkEntry(entry);
  if (chunks.length === 0) {
    store.deleteByEntry(entry.documentId);
    return 0;
  }

  const vectors = await embedTexts(chunks.map((chunk) => chunk.text), config);
  const updatedAt = new Date().toISOString();

  chunks.forEach((chunk, index) => {
    store.upsert({
      entryDocumentId: entry.documentId,
      entrySlug: entry.slug,
      entryTitle: entry.title ?? '',
      chunkIndex: index,
      section: chunk.section,
      text: chunk.text,
      vector: vectors[index],
      updatedAt,
    });
  });

  return chunks.length;
}

/** 移除索引（条目删除或取消发布） */
export function removeEntry(entryDocumentId: string, store: KbVectorStore): void {
  store.deleteByEntry(entryDocumentId);
}
