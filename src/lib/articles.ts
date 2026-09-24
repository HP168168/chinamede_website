// 文章（AI 内容工厂产物）列表分页与相关阅读的公共逻辑
// 列表页与分页页共用同一份常量与切片函数，避免两处分页规则不一致
import type { Article } from '../types/content';

/** 每页文章数 */
export const ARTICLES_PAGE_SIZE = 12;

/** 总页数（无文章时仍保留 1 页，列表页展示空状态） */
export function totalArticlePages(count: number): number {
  return Math.max(1, Math.ceil(count / ARTICLES_PAGE_SIZE));
}

/** 取第 pageNumber 页（从 1 开始）的文章 */
export function sliceArticles(articles: Article[], pageNumber: number): Article[] {
  const start = (pageNumber - 1) * ARTICLES_PAGE_SIZE;
  return articles.slice(start, start + ARTICLES_PAGE_SIZE);
}

export interface RelatedArticle {
  label: string;
  href: string;
  summary: string;
  external: boolean;
}

/**
 * 相关阅读：优先用后台配置的内链，不足时用同标签文章、再退到最新文章补齐。
 * 保证每篇文章至少能拿到若干条站内内链，利于 AI 抓取与用户站内流转。
 */
export function relatedArticles(article: Article, all: Article[], limit = 3): RelatedArticle[] {
  const byHref = new Map(all.map((item) => [`/articles/${item.slug}/`, item]));

  const links: RelatedArticle[] = article.relatedLinks.slice(0, limit).map((link) => {
    const matched = byHref.get(link.href);
    return {
      label: link.label,
      href: link.href,
      summary: matched?.summary ?? '',
      external: link.external ?? /^https?:\/\//.test(link.href),
    };
  });

  if (links.length >= limit) return links;

  const tags = new Set(article.tags);
  const others = all.filter((item) => item.slug !== article.slug);
  const picked = [...others.filter((item) => item.tags.some((tag) => tags.has(tag))), ...others]
    .filter((item, index, list) => list.findIndex((x) => x.slug === item.slug) === index)
    .filter((item) => !links.some((link) => link.href === `/articles/${item.slug}/`))
    .slice(0, limit - links.length)
    .map((item) => ({
      label: item.title,
      href: `/articles/${item.slug}/`,
      summary: item.summary,
      external: false,
    }));

  return [...links, ...picked];
}
