import type { KbEntryRecord } from '../../../../lib/ai/types';
import { loadEmbeddingConfig } from '../../../../lib/rag/embedding';
import { indexEntry, removeEntry } from '../../../../lib/rag/indexer';
import { openKbVectorStore } from '../../../../lib/rag/vector-store';

/**
 * 知识条目的自动索引。
 *
 * 后台保存/发布一条知识条目后，立刻把这条的向量算出来写进向量库，
 * 运营不需要记得「还得去跑一次索引命令」。
 *
 * 两条原则：
 *   1. 索引失败绝不影响保存——向量检索是增强项，不是前置条件；
 *   2. 只有已发布的内容才进索引，草稿不算（检索侧也只取 published）。
 */

const AUTO_INDEX = (process.env.KB_AUTO_INDEX ?? 'true').trim() !== 'false';

function toKbEntry(record: Record<string, unknown>): KbEntryRecord {
  const asString = (value: unknown) => (typeof value === 'string' ? value : '');
  const asArray = (value: unknown) => (Array.isArray(value) ? (value as Record<string, unknown>[]) : []);

  return {
    documentId: asString(record.documentId),
    title: asString(record.title),
    slug: asString(record.slug),
    aliases: Array.isArray(record.aliases) ? (record.aliases as string[]) : [],
    category: asString(record.category) || 'other',
    topic: asString(record.topic),
    tags: Array.isArray(record.tags) ? (record.tags as string[]) : [],
    citation: asString(record.citation) || undefined,
    credibility: asString(record.credibility) || undefined,
    points: asArray(record.points)
      .map((point) => ({ text: asString(point.text) }))
      .filter((point) => point.text),
    facts: asArray(record.facts).map((fact) => ({
      label: asString(fact.label),
      value: asString(fact.value),
      year: asString(fact.year) || undefined,
      source: asString(fact.source) || undefined,
    })),
    qa: asArray(record.qa).map((item) => ({
      question: asString(item.question),
      answer: asString(item.answer),
    })),
    sources: asArray(record.sources).map((source) => ({
      label: asString(source.label),
      url: asString(source.url) || undefined,
      note: asString(source.note) || undefined,
    })),
  } as KbEntryRecord;
}

async function syncEntry(record: Record<string, unknown> | null | undefined): Promise<void> {
  if (!AUTO_INDEX || !record) return;

  const store = openKbVectorStore();
  if (!store) return;

  try {
    if (!record.publishedAt) {
      // 变成草稿（取消发布）：从索引里摘掉
      removeEntry(String(record.documentId ?? ''), store);
      return;
    }

    await indexEntry(toKbEntry(record), store, loadEmbeddingConfig());
  } catch (error) {
    // 索引失败只记日志：后台保存必须成功，向量检索缺失时会自动降级到关键词
    console.warn(`[kb] 知识条目索引失败（${record.title ?? record.documentId}）：${(error as Error).message}`);
  } finally {
    store.close();
  }
}

export default {
  async afterCreate(event: { result?: Record<string, unknown> }) {
    await syncEntry(event.result);
  },

  async afterUpdate(event: { result?: Record<string, unknown> }) {
    await syncEntry(event.result);
  },

  async afterDelete(event: { result?: Record<string, unknown> }) {
    if (!event.result) return;
    const store = openKbVectorStore();
    if (!store) return;
    try {
      removeEntry(String(event.result.documentId ?? ''), store);
    } finally {
      store.close();
    }
  },
};
