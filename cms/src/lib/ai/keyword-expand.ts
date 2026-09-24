/**
 * AI 批量扩词的执行流程：读已有词 → 调模型 → 清洗 → 落库。
 *
 * 为什么单独一个文件：keywords.ts 是纯逻辑（分类标准、清洗、随机），不碰数据库也不碰网络，
 * 方便单独推理与验证；凡是要读写 Strapi 的部分集中在这里。
 *
 * 两个入口共用同一个「核心」：
 *   - expandKeywords()         后台专用，用进程内的 strapi.documents 读写；
 *   - expandKeywordsViaRest()  CLI 专用，用 REST 客户端读写（脚本在独立进程里，拿不到 strapi）。
 * 两者只在「怎么读写库」上不同，AI 调用与清洗（computeKeywordCandidates）完全一致——
 * 否则后台手工造词与脚本批量造词会慢慢长出两套行为差异。
 */
import type { StrapiClient } from '../strapi-client';
import { assertAiReady, loadAiConfig } from './config';
import {
  KEYWORD_CATEGORIES,
  KEYWORD_CATEGORY_KEYS,
  categoryLabel,
  cleanWords,
  normalizeWord,
} from './keywords';
import { createAiProvider } from './provider';
import type { KeywordCategory } from './types';

const KEYWORDS = 'api::keyword.keyword';
const CAMPUSES = 'api::campus.campus';

/** REST 里的集合名（进程内用上面的 UID，两套命名并存是 Strapi 的既有约定） */
const REST_KEYWORDS = 'keywords';
const REST_CAMPUSES = 'campuses';

export interface ExpandKeywordsInput {
  strapi: any;
  /** 核心种子词，如「口腔修复」 */
  seedWord: string;
  /** 只扩这几类；不传则五类全扩 */
  categories?: KeywordCategory[];
  /** 每类条数上限；不传则用各类的默认上限 */
  perCategory?: Partial<Record<KeywordCategory, number>>;
  /** 只看不写：返回模型产出但不入库，便于先探一眼质量再决定 */
  dryRun?: boolean;
  logger?: (message: string) => void;
}

export interface ExpandKeywordsResult {
  created: Array<{ word: string; category: KeywordCategory; categoryLabel: string }>;
  /** 被清洗掉的条数（空词、超长、与已有词重复） */
  skipped: number;
  /** 各类实际产出数量（含 dryRun） */
  byCategory: Record<string, number>;
  dryRun: boolean;
}

/** 过滤出合法分类；未指定则五类全要 */
function filterCategories(categories?: KeywordCategory[]): KeywordCategory[] {
  if (!categories || categories.length === 0) return KEYWORD_CATEGORY_KEYS;
  return KEYWORD_CATEGORY_KEYS.filter((key) => (categories as string[]).includes(key));
}

/** 组装每类条数：调用方指定的优先，否则用分类自带的默认上限 */
function buildQuota(
  targets: KeywordCategory[],
  perCategory?: Partial<Record<KeywordCategory, number>>,
): Partial<Record<KeywordCategory, number>> {
  const quota: Partial<Record<KeywordCategory, number>> = {};

  for (const key of targets) {
    const asked = perCategory?.[key];
    const fallback = KEYWORD_CATEGORIES.find((item) => item.key === key)?.max ?? 10;
    quota[key] = asked && asked > 0 ? Math.min(asked, 60) : fallback;
  }

  return quota;
}

/** 已有词列表 -> 「原词 + 归一化集合」：前者喂给模型让它避开，后者用于本地二次去重 */
function toExisting(words: string[]): { words: string[]; taken: Set<string> } {
  const cleaned = words.map((item) => (item ?? '').trim()).filter(Boolean);
  return { words: cleaned, taken: new Set(cleaned.map(normalizeWord)) };
}

/**
 * 扩词的核心：调模型 + 清洗去重，**不落库**。
 *
 * 返回的是可以直接入库的词（已按分类分组、已跨类去重、已排除库内已有词），
 * 落库方式由调用方决定。
 */
export async function computeKeywordCandidates(input: {
  seedWord: string;
  targets: KeywordCategory[];
  perCategory?: Partial<Record<KeywordCategory, number>>;
  existingWords: string[];
  cities: string[];
  logger?: (message: string) => void;
}): Promise<{
  words: Array<{ word: string; category: KeywordCategory; categoryLabel: string }>;
  byCategory: Record<string, number>;
  skipped: number;
}> {
  const logger = input.logger ?? (() => {});
  const existing = toExisting(input.existingWords);
  const config = loadAiConfig();
  assertAiReady(config);

  logger(
    `AI 批量扩词：种子词「${input.seedWord}」，目标 ${input.targets.length} 类，库内已有 ${existing.words.length} 个词，可选城市 ${input.cities.length} 个`,
  );

  const provider = createAiProvider(config);
  const groups = await provider.generateKeywords({
    seedWord: input.seedWord,
    cities: input.cities,
    existingWords: existing.words,
    perCategory: buildQuota(input.targets, input.perCategory),
  });

  // 跨类共用一个 taken：同一个词不应既当核心词又当场景词
  const taken = existing.taken;
  const words: Array<{ word: string; category: KeywordCategory; categoryLabel: string }> = [];
  const byCategory: Record<string, number> = {};
  let skipped = 0;

  for (const category of input.targets) {
    const { accepted, skipped: rejected } = cleanWords(groups[category] ?? [], taken);
    skipped += rejected;
    byCategory[category] = accepted.length;

    accepted.forEach((word) => words.push({ word, category, categoryLabel: categoryLabel(category) }));
  }

  return { words, byCategory, skipped };
}

/** 后台专用：用进程内的 strapi 读写 */
export async function expandKeywords(input: ExpandKeywordsInput): Promise<ExpandKeywordsResult> {
  const seed = (input.seedWord ?? '').trim();
  if (!seed) throw new Error('请先填写核心关键词');

  const targets = filterCategories(input.categories);
  if (targets.length === 0) {
    throw new Error('请至少选择一个关键词分类');
  }

  const logger = input.logger ?? (() => {});

  // 库里已有的词：既用于让模型避开，也用于本地二次去重（模型不一定严格遵守）
  let existingWords: string[] = [];
  try {
    const rows = await input.strapi.documents(KEYWORDS).findMany({ fields: ['word'], limit: 1000 });
    existingWords = (rows ?? []).map((row: { word?: string }) => row.word ?? '');
  } catch {
    existingWords = [];
  }

  // 可选城市取自现有校区：这是「AI 生成 + 本地清洗」方案的关键补丁，
  // 纯靠模型想城市，必然产出本地压根不覆盖的地区，区域词就废了
  let cities: string[] = [];
  try {
    const rows = await input.strapi.documents(CAMPUSES).findMany({ fields: ['city'], limit: 200 });
    cities = [...new Set((rows as Array<{ city?: string }>).map((row) => (row.city ?? '').trim()).filter(Boolean))];
  } catch {
    cities = [];
  }

  const computed = await computeKeywordCandidates({
    seedWord: seed,
    targets,
    perCategory: input.perCategory,
    existingWords,
    cities,
    logger,
  });

  if (!input.dryRun) {
    for (const item of computed.words) {
      await input.strapi.documents(KEYWORDS).create({
        data: { word: item.word, category: item.category, enabled: true, seedWord: seed },
      });
    }
  }

  const total = computed.words.length;
  logger(
    input.dryRun
      ? `AI 批量扩词（预览）：产出 ${total} 个词，跳过 ${computed.skipped} 个，未入库`
      : `AI 批量扩词完成：新增 ${total} 个词，跳过 ${computed.skipped} 个`,
  );

  return { created: computed.words, skipped: computed.skipped, byCategory: computed.byCategory, dryRun: Boolean(input.dryRun) };
}

/** CLI 专用：用 REST 客户端读写（需要 STRAPI_WRITE_TOKEN 才写得上） */
export async function expandKeywordsViaRest(input: {
  client: StrapiClient;
  seedWord: string;
  categories?: KeywordCategory[];
  perCategory?: Partial<Record<KeywordCategory, number>>;
  dryRun?: boolean;
  logger?: (message: string) => void;
}): Promise<ExpandKeywordsResult> {
  const seed = (input.seedWord ?? '').trim();
  if (!seed) throw new Error('请先填写核心关键词，例如：--seed "口腔修复"');

  const targets = filterCategories(input.categories);
  const logger = input.logger ?? (() => {});

  const rows = await input.client.list<Record<string, unknown>>(REST_KEYWORDS, { fields: ['word'] });
  const existingWords = rows.map((row) => String(row.word ?? ''));

  let cities: string[] = [];
  try {
    const campuses = await input.client.list<Record<string, unknown>>(REST_CAMPUSES, { fields: ['city'] });
    cities = [...new Set(campuses.map((row) => String(row.city ?? '').trim()).filter(Boolean))];
  } catch {
    cities = [];
  }

  const computed = await computeKeywordCandidates({
    seedWord: seed,
    targets,
    perCategory: input.perCategory,
    existingWords,
    cities,
    logger,
  });

  if (!input.dryRun) {
    for (const item of computed.words) {
      await input.client.create(REST_KEYWORDS, {
        word: item.word,
        category: item.category,
        enabled: true,
        seedWord: seed,
      });
    }
  }

  logger(
    input.dryRun
      ? `AI 批量扩词（演练）：产出 ${computed.words.length} 个词，未入库`
      : `AI 批量扩词完成：新增 ${computed.words.length} 个词`,
  );

  return {
    created: computed.words,
    skipped: computed.skipped,
    byCategory: computed.byCategory,
    dryRun: Boolean(input.dryRun),
  };
}
