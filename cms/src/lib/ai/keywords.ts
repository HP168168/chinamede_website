/**
 * 关键词库：五类分类标准、清洗去重、随机取词，以及 AI 批量扩词的提示词。
 *
 * 这个文件是「关键词」的语义地基——后台显示、AI 扩词、任务随机取词三处共用同一份
 * KEYWORD_CATEGORIES，避免改了一处忘了另一处（分类标准和 generateKeywords 的输入
 * 结构必须严格对应，否则模型返回的类名会对不上）。
 */
import type { KeywordCategory, KeywordCategoryMeta } from './types';

/**
 * 五类关键词的定义。
 *
 * `hint` 会原样写进发给模型的提示词，因此这里的措辞直接决定产出质量：
 * 写得越具体，模型跑偏的概率越低。`max` 是模型被要求产出的**上限**，
 * 实际返回多少由模型决定，清洗后还会再降。
 */
export const KEYWORD_CATEGORIES: KeywordCategoryMeta[] = [
  {
    key: 'core',
    label: '核心词',
    hint: '业务主干词，用户搜索时直指主营业务，通常是 2-4 个字的品类词',
    max: 12,
  },
  {
    key: 'brand',
    label: '品牌词',
    hint: '包含品牌名（美迪）或其常见叫法、别称的组合词',
    max: 12,
  },
  {
    key: 'scene',
    label: '场景词',
    hint: '人群、学习阶段、需求意图与品类词的组合，如「零基础学口腔修复」',
    max: 15,
  },
  {
    key: 'region',
    label: '区域词',
    hint: '带城市或地区限定的词，城市必须取自给定的可选城市，不得自造',
    max: 15,
  },
  {
    key: 'longtail',
    label: '长尾词',
    hint: '六字以上的具体问法或组合，竞争小、意图明确，如「口腔修复工艺毕业后能干什么」',
    max: 20,
  },
];

/** 分类取值 -> 定义，供快速查表 */
const CATEGORY_MAP: Record<string, KeywordCategoryMeta> = Object.fromEntries(
  KEYWORD_CATEGORIES.map((item) => [item.key, item]),
);

export const KEYWORD_CATEGORY_KEYS: KeywordCategory[] = KEYWORD_CATEGORIES.map((item) => item.key);

/** 判断取值是否为合法分类（模型返回脏数据时用） */
export function isKeywordCategory(value: unknown): value is KeywordCategory {
  return typeof value === 'string' && value in CATEGORY_MAP;
}

export function categoryLabel(key: string): string {
  return CATEGORY_MAP[key]?.label ?? key;
}

/**
 * 归一化：把同一个词的不同写法折成同一个 key，便于比较。
 * 去掉两端空白与常见分隔符——全角空格、中英文逗号这类差异不应被当成两个词。
 */
export function normalizeWord(word: string): string {
  return word.trim().replace(/[\s,，、;；:：/]+/g, '').toLowerCase();
}

/**
 * 清洗模型产出的词。
 *
 * 三道过滤：空值 → 长度异常（超过 30 字多半是模型把一句话塞了进来）
 * → 与已给 pool 重复（含跨类去重：同一个词不应同时是核心词和场景词）。
 * 返回的是**已去重且保留顺序**的结果，重复多次不会影响最终数量之外的正确性。
 */
export function cleanWords(
  words: string[],
  taken: Set<string> = new Set(),
): { accepted: string[]; skipped: number } {
  const accepted: string[] = [];
  let skipped = 0;

  for (const raw of words) {
    const word = (raw ?? '').replace(/^[-·•*]+\s*/, '').trim();
    const key = normalizeWord(word);

    if (!key || word.length > 30 || key.length < 2) {
      skipped++;
      continue;
    }
    if (taken.has(key)) {
      skipped++;
      continue;
    }

    taken.add(key);
    accepted.push(word);
  }

  return { accepted, skipped };
}

/**
 * 统一取词：指定了就用指定的，否则按分类随机挑一个。
 *
 * 随机不是纯随机——先在候选里取「使用次数最少」的一批（阶梯截断），再在其中随机。
 * 纯随机会让热门词被反复选中、冷门词永不见天日，导致一段时间内的选题高度同质；
 * 「最少使用优先」用极小的代价换来选题的多样性，且结果是确定的一批：出了问题
 * 能复盘「为什么候选是这几个」。
 *
 * @returns 选中的词与选中理由（写进任务日志），候选为空时返回 null 由调用方兜底
 */
export function pickKeyword(input: {
  explicit?: { documentId: string; word: string } | null;
  candidates: Array<{ documentId: string; word: string; usageCount: number }>;
  random?: () => number;
}): { picked: { documentId: string; word: string }; reason: string } | null {
  if (input.explicit?.word) {
    return { picked: { documentId: input.explicit.documentId, word: input.explicit.word }, reason: '编辑器指定' };
  }

  if (input.candidates.length === 0) return null;

  const counts = input.candidates.map((item) => item.usageCount ?? 0);
  const minimum = Math.min(...counts);
  const fresh = input.candidates.filter((item) => (item.usageCount ?? 0) === minimum);

  const random = input.random ?? Math.random;
  // random() 理论上可能返回 1，取 min 兜住越界，避免得到 undefined
  const index = Math.min(fresh.length - 1, Math.floor(random() * fresh.length));
  const picked = fresh[index];

  return {
    picked: { documentId: picked.documentId, word: picked.word },
    reason: `${fresh.length} 个候选使用次数同为最少（${minimum} 次），随机取「${picked.word}」`,
  };
}

/** 供 AI 扩词使用的 system 提示：定义分类并约束输出为 JSON */
export function buildKeywordSystemPrompt(): string {
  return [
    '你是中文 SEO 与 SEM 顾问，擅长围绕一个核心业务词扩展出成体系的关键词矩阵。',
    '',
    '【任务】',
    '围绕给定的核心种子词，按下面五类各产出若干条关键词：',
    ...KEYWORD_CATEGORIES.map((item) => `- ${item.key}（${item.label}）：${item.hint}`),
    '',
    '【硬性约束】',
    '1. 只输出合法的 JSON 对象，不要输出 markdown 代码块标记，不要输出任何解释文字。',
    '2. JSON 的键必须是上面五个类名（core / brand / scene / region / longtail），值的类型是字符串数组。',
    '3. 区域词的城市必须来自给定的「可选城市」列表，绝不能虚构不在列表中的地区。',
    '4. 同一类名下不得重复；不同类之间也不要出现完全相同的词。',
    '5. 每条词 2-20 个汉字，必须是自然搜索用语，不要堆砌、不要写成句子。',
    '6. 五类总共不超过 60 条；某一类确实想不到就给空数组，不要凑数。',
    '',
    '【输出格式】',
    '{"core":["..."],"brand":["..."],"scene":["..."],"region":["..."],"longtail":["..."]}',
  ].join('\n');
}

/** 供 AI 扩词使用的 user 提示：给出种子词、城市、已有词与每类条数 */
export function buildKeywordUserPrompt(input: {
  seedWord: string;
  cities: string[];
  existingWords: string[];
  perCategory: Partial<Record<KeywordCategory, number>>;
}): string {
  const lines = [`核心种子词：${input.seedWord}`];

  lines.push(
    input.cities.length
      ? `可选城市（区域词只能从这里取）：${input.cities.join('、')}`
      : '可选城市：（未提供，区域词请省略，输出空数组）',
  );

  lines.push(
    input.existingWords.length
      ? `已存在、不要重复的关键词（共 ${input.existingWords.length} 条）：${input.existingWords.slice(0, 120).join('、')}`
      : '已存在的关键词：无',
  );

  const quotas = KEYWORD_CATEGORIES.map((item) => {
    const asked = input.perCategory[item.key];
    return `${item.key}：${asked && asked > 0 ? asked : item.max} 条以内`;
  });
  lines.push(`各类条数上限：${quotas.join('；')}`);

  lines.push('', '请按要求输出 JSON。');
  return lines.join('\n');
}
