import type { GenerateInput, GeneratedArticle, ValidationResult } from './types';

/**
 * SEO / GEO 硬性校验。
 *
 * 通过校验的稿件才允许写入草稿，否则任务标记失败并记录原因，
 * 避免「看起来像文章、但拿不到搜索与 AI 引用」的低质内容进入内容库。
 */

const CN_CHAR = /[\u4e00-\u9fa5]/g;

function countChars(text: string): number {
  return (text ?? '').replace(/\s+/g, '').length;
}

function countChinese(text: string): number {
  return (text ?? '').match(CN_CHAR)?.length ?? 0;
}

function stripHtml(html: string): string {
  return (html ?? '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function validateArticle(
  article: GeneratedArticle,
  input: Pick<GenerateInput, 'targetKeywords' | 'wordCount'>,
  brandNames: string[],
): ValidationResult {
  const issues: string[] = [];
  // 阻断项：结构/GEO 完整性缺失，必须改好才能入库；提醒项：只扣分与提示，不阻断写入
  const blocking: string[] = [];
  let score = 100;

  const deduct = (points: number, message: string, isBlocking = true) => {
    issues.push(message);
    if (isBlocking) blocking.push(message);
    score -= points;
  };

  /* ---------------------------------- 标题 --------------------------------- */
  const titleLength = countChars(article.title);
  if (titleLength < 15) {
    deduct(6, `标题过短（${titleLength} 字），建议 15-40 字并包含目标关键词`, false);
  } else if (titleLength > 40) {
    deduct(4, `标题过长（${titleLength} 字），建议控制在 40 字内`, false);
  }

  /* ---------------------------------- 摘要 --------------------------------- */
  const summaryLength = countChars(article.summary);
  if (summaryLength < 60) {
    deduct(6, `摘要过短（${summaryLength} 字），建议 60-160 字`, false);
  } else if (summaryLength > 160) {
    deduct(4, `摘要过长（${summaryLength} 字），建议控制在 160 字内`, false);
  }

  /* ---------------------------------- slug --------------------------------- */
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) {
    deduct(10, `slug 不合规：「${article.slug}」，只允许小写字母、数字与连字符`);
  }

  /* ---------------------------------- 正文 --------------------------------- */
  const plain = stripHtml(article.content);
  const plainLength = plain.length;
  const minLength = Math.max(600, Math.floor((input.wordCount || 1200) * 0.6));

  if (plainLength < minLength) {
    deduct(10, `正文过短（${plainLength} 字），少于目标字数的 60%（期望 ≥ ${minLength}）`);
  }

  const chineseRatio = countChinese(plain) / Math.max(plainLength, 1);
  if (chineseRatio < 0.5) {
    deduct(5, '正文中文占比偏低，请检查是否输出了英文或代码块内容', false);
  }

  /* -------------------------- GEO：答案段落（关键项） ------------------------- */
  if (!article.answerBlocks || article.answerBlocks.length === 0) {
    deduct(15, '缺少「答案段落」：AI 引用时最需要的就是直接给出结论的段落');
  } else {
    const first = article.answerBlocks[0];
    const answerLength = countChars(first?.answer ?? '');
    if (answerLength < 40) {
      deduct(6, `首个答案段落过短（${answerLength} 字），建议 40-120 字说清结论`, false);
    }
    // 答案段落必须真实出现在正文里（避免正文与结构化字段两张皮）
    const probe = (first?.answer ?? '').replace(/\s+/g, '').slice(0, 12);
    if (probe && !plain.replace(/\s+/g, '').includes(probe)) {
      deduct(10, '答案段落未出现在正文中：请让正文开头段落与「答案段落」保持一致');
    }
  }

  /* --------------------------- GEO：数据要点与问答 --------------------------- */
  if ((article.keyFacts ?? []).length < 2) {
    deduct(6, '关键数据少于 2 条，AI 引用时缺少可摘录的事实依据');
  }
  if ((article.faq ?? []).length < 3) {
    deduct(6, 'FAQ 少于 3 条，无法生成完整的 FAQPage 结构化数据');
  }

  /* ------------------------------- 来源与内链 ------------------------------- */
  if ((article.sources ?? []).length < 1) {
    deduct(6, '缺少引用来源，可信度不足');
  }
  if ((article.relatedLinks ?? []).length < 2) {
    deduct(6, '相关阅读内链少于 2 条');
  }

  const anchorCount = (article.content.match(/<a\s[^>]*href=/gi) ?? []).length;
  if (anchorCount < 2) {
    deduct(6, `正文内链过少（${anchorCount} 条），请在正文中自然插入至少 2 条站内链接`);
  }

  /* -------------------------------- 品牌实体 ------------------------------- */
  const hasBrand = brandNames
    .filter(Boolean)
    .some((name) => plain.includes(name) || article.content.includes(name));
  if (!hasBrand) {
    deduct(6, `正文未出现品牌实体名称（${brandNames.filter(Boolean).join(' 或 ')}）`);
  }

  /* -------------------------------- 目标关键词 ------------------------------- */
  const keywords = (input.targetKeywords ?? []).filter(Boolean);
  if (keywords.length > 0) {
    const missing = keywords.filter(
      (keyword) => !plain.includes(keyword) && !article.seo.keywords.includes(keyword),
    );
    if (missing.length === keywords.length) {
      deduct(8, `目标关键词完全未使用：${keywords.join('、')}`);
    } else if (missing.length > 0) {
      deduct(3, `部分目标关键词未使用：${missing.join('、')}`, false);
    }
  }

  /* --------------------------------- SEO 字段 ------------------------------- */
  if (countChars(article.seo?.title ?? '') === 0) {
    deduct(8, '缺少 SEO 标题');
  }
  if (countChars(article.seo?.description ?? '') < 40) {
    deduct(6, 'SEO 摘要过短（建议 40-160 字）', false);
  }

  const finalScore = Math.max(0, Math.min(100, score));
  // 通过条件：无阻断项且得分 ≥ 85；提醒项只影响得分，不阻断入库
  return { ok: finalScore >= 85 && blocking.length === 0, score: finalScore, issues };
}
