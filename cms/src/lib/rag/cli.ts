import { loadDotEnv } from '../env';
import { loadAiConfig } from '../ai/config';
import { StrapiClient } from '../strapi-client';
import type { KbEntryRecord } from '../ai/types';
import { assertEmbeddingReady, loadEmbeddingConfig } from './embedding';
import { indexEntries } from './indexer';
import { openKbVectorStore } from './vector-store';

/**
 * 知识库索引命令行入口。
 *
 *   npm run kb:index           全量重建索引（按当前已发布的知识条目）
 *   npm run kb:status          查看向量库规模与配置状态
 *   npm run kb:clear           清空向量库
 *
 * 日常不需要手动执行：后台保存/发布知识条目时会自动索引该条。
 * 这个入口用于「首次接入」「换了 embedding 模型」「怀疑索引脏了」这几种情况。
 */

const PLURAL = 'kb-entries';

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item)) : [];
}

/** 把 Strapi 返回的原始记录映射成知识条目（只保留检索与生成需要的字段） */
function toKbEntry(record: Record<string, unknown>): KbEntryRecord {
  return {
    documentId: asString(record.documentId),
    title: asString(record.title),
    slug: asString(record.slug),
    aliases: asStringArray(record.aliases),
    category: asString(record.category) || 'other',
    topic: asString(record.topic),
    tags: asStringArray(record.tags),
    citation: asString(record.citation) || undefined,
    credibility: asString(record.credibility) || undefined,
    points: asRecordArray(record.points)
      .map((point) => ({ text: asString(point.text) }))
      .filter((point) => point.text),
    facts: asRecordArray(record.facts).map((fact) => ({
      label: asString(fact.label),
      value: asString(fact.value),
      year: asString(fact.year) || undefined,
      source: asString(fact.source) || undefined,
    })),
    qa: asRecordArray(record.qa).map((item) => ({
      question: asString(item.question),
      answer: asString(item.answer),
    })),
    sources: asRecordArray(record.sources).map((source) => ({
      label: asString(source.label),
      url: asString(source.url) || undefined,
      note: asString(source.note) || undefined,
    })),
  } as KbEntryRecord;
}

async function fetchPublishedEntries(): Promise<KbEntryRecord[]> {
  const config = loadAiConfig();
  if (!config.readToken && !process.env.STRAPI_TOKEN) {
    throw new Error('未配置只读 Token（STRAPI_READONLY_TOKEN），无法读取知识条目');
  }

  // 与内容工厂读取侧一致：优先用写令牌（权限更全），只配了只读令牌时也能查询
  const client = new StrapiClient({
    baseUrl: config.strapiUrl,
    token: config.writeToken || config.readToken,
    timeoutMs: 30000,
  });
  const raw = await client.list<Record<string, unknown>>(PLURAL, {
    status: 'published',
    populate: {
      points: true,
      facts: true,
      qa: true,
      sources: true,
    },
  });

  return raw.map(toKbEntry);
}

async function commandIndex(): Promise<void> {
  const store = openKbVectorStore();
  if (!store) throw new Error('向量库打开失败，请检查 cms/.tmp 目录是否可写');

  const embedding = loadEmbeddingConfig();
  assertEmbeddingReady(embedding);

  const entries = await fetchPublishedEntries();
  console.log(`已发布知识条目 ${entries.length} 条，开始重建索引…`);

  store.clear();

  const report = await indexEntries(entries, store, embedding, {
    logger: (message) => console.warn(`  ${message}`),
    onProgress: (done, total) => {
      if (done % 20 === 0 || done === total) console.log(`  进度 ${done}/${total}`);
    },
  });

  console.log(
    `索引完成：条目 ${report.entries} 条，分片 ${report.chunks} 个，失败 ${report.failed} 个；向量库现有 ${store.count()} 个分片`,
  );
  store.close();
}

async function commandStatus(): Promise<void> {
  const store = openKbVectorStore();
  const embedding = loadEmbeddingConfig();

  console.log('知识库索引状态：');
  console.log(`  检索模式 KB_RETRIEVER = ${(process.env.KB_RETRIEVER ?? 'keyword').trim() || 'keyword'}`);
  console.log(`  向量库文件 = ${(process.env.KB_VECTOR_DB ?? '').trim() || 'cms/.tmp/kb-vectors.db（默认）'}`);
  console.log(`  分片数 = ${store ? store.count() : '（无法打开）'}`);
  console.log(`  embedding = ${embedding.model} @ ${embedding.baseUrl}`);
  console.log(`  密钥 = ${embedding.apiKey ? '已配置' : '未配置'}`);

  if (store) store.close();
}

async function commandClear(): Promise<void> {
  const store = openKbVectorStore();
  if (!store) throw new Error('向量库打开失败');
  const before = store.count();
  store.clear();
  console.log(`已清空 ${before} 个分片`);
  store.close();
}

function usage(): void {
  console.log(['知识库索引', '', '用法：', '  npm run kb:index    全量重建索引', '  npm run kb:status   查看状态', '  npm run kb:clear    清空'].join('\n'));
}

async function main(): Promise<void> {
  const command = process.argv[2] ?? 'status';
  switch (command) {
    case 'index':
      await commandIndex();
      return;
    case 'status':
      await commandStatus();
      return;
    case 'clear':
      await commandClear();
      return;
    default:
      usage();
  }
}

loadDotEnv();

main().catch((error: unknown) => {
  console.error('');
  console.error((error as Error).message);
  process.exitCode = 1;
});
