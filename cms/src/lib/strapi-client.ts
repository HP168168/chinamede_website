/**
 * Strapi REST 客户端（官方 API，不使用数据库直连）。
 *
 * 为什么走 HTTP 而不是直接操作数据库：
 * - 内容工厂需要能被定时任务/CI 在任意机器上调用，不依赖 Strapi 与 SQLite 文件；
 * - Strapi 服务常驻时，直连数据库会造成 SQLite 写锁竞争。
 */

export interface StrapiClientOptions {
  baseUrl: string;
  /** 写操作需要 Token；只读查询可留空 */
  token?: string;
  timeoutMs?: number;
}

export class StrapiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: string,
  ) {
    super(message);
    this.name = 'StrapiRequestError';
  }
}

export type QueryValue = string | number | boolean | null | undefined | QueryObject | QueryValue[];
export interface QueryObject {
  [key: string]: QueryValue;
}

/**
 * JSON 字段：内部结构由我们完全掌控（JSON-LD 节点），
 * 其中形如 `"@type": ["Organization"]` 的数组必须原样保留，
 * 不能被当成可重复字符串字段编码。
 */
const OPAQUE_JSON_FIELDS = new Set(['siteNodes', 'pageNodes']);

/**
 * 可重复字符串字段（tags / aliases / cities / meta / outcomes.jobs 等）在 REST 层的约定：
 * - 写入时必须传 JSON 字符串，传数组会报「must be a string type」；
 * - 空数组同样会被拒绝。
 * 组件是嵌套结构，所以递归处理；统一在客户端入口转换，调用方可以直接传 string[]。
 */
function encodeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    if (value.length === 0) return undefined;
    if (value.every((item) => typeof item === 'string')) return JSON.stringify(value);
    return value.map((item) => encodeValue(item));
  }

  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      const encoded = encodeValue(item);
      if (encoded !== undefined) result[key] = encoded;
    }
    return result;
  }

  return value;
}

export function toStrapiData(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    if (OPAQUE_JSON_FIELDS.has(key)) {
      result[key] = value;
      continue;
    }

    const encoded = encodeValue(value);
    if (encoded !== undefined) result[key] = encoded;
  }

  return result;
}

/** 读取可重复字符串字段：兼容 JSON 字符串与数组两种返回形态 */
export function parseStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
  if (typeof value !== 'string' || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string');
    }
  } catch {
    // 非 JSON：按单值处理，便于人工在后台直接填中文顿号分隔的内容
  }

  return value
    .split(/[,，、\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/** 把 Strapi 的嵌套查询对象序列化成 filters[...] 形式 */
function toQueryPairs(params: QueryObject, prefix = ''): string[] {
  const pairs: string[] = [];

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    const path = prefix ? `${prefix}[${key}]` : key;

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item !== null && typeof item === 'object') {
          pairs.push(...toQueryPairs(item as QueryObject, `${path}[${index}]`));
        } else {
          pairs.push(`${encodeURIComponent(`${path}[${index}]`)}=${encodeURIComponent(String(item))}`);
        }
      });
    } else if (typeof value === 'object') {
      pairs.push(...toQueryPairs(value as QueryObject, path));
    } else {
      pairs.push(`${encodeURIComponent(path)}=${encodeURIComponent(String(value))}`);
    }
  }

  return pairs;
}

/** 把 Strapi 的错误体压缩成一行提示，便于脚本日志定位问题 */
function describeErrorBody(text: string): string {
  if (!text) return '';
  try {
    const payload = JSON.parse(text) as {
      error?: { message?: string; details?: unknown };
    };
    const message = payload.error?.message;
    const details = payload.error?.details;
    if (!message) return '';
    const detailText = details ? `｜${JSON.stringify(details).slice(0, 300)}` : '';
    return `：${message}${detailText}`;
  } catch {
    return `：${text.slice(0, 300)}`;
  }
}

export class StrapiClient {
  private readonly baseUrl: string;
  private readonly token?: string;
  private readonly timeoutMs: number;

  constructor(options: StrapiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.token = options.token;
    this.timeoutMs = options.timeoutMs ?? 30000;
  }

  private async request<T>(
    path: string,
    init: { method: string; body?: unknown; query?: QueryObject } = { method: 'GET' },
  ): Promise<T> {
    const query = init.query ? toQueryPairs(init.query).join('&') : '';
    const url = `${this.baseUrl}/api/${path.replace(/^\/+/, '')}${query ? `?${query}` : ''}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: init.method,
        headers: {
          'Content-Type': 'application/json',
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
        signal: controller.signal,
      });

      const text = await response.text();

      if (!response.ok) {
        throw new StrapiRequestError(
          `Strapi 请求失败（${init.method} ${url}）：HTTP ${response.status}${describeErrorBody(text)}`,
          response.status,
          text,
        );
      }

      return (text ? JSON.parse(text) : {}) as T;
    } finally {
      clearTimeout(timer);
    }
  }

  /** 查询集合（自动分页拉全量，最多 500 条一次） */
  async list<T = Record<string, unknown>>(plural: string, query: QueryObject = {}): Promise<T[]> {
    const result = await this.request<{ data: T[] }>(plural, {
      method: 'GET',
      query: { 'pagination[pageSize]': 500, ...query },
    });
    return result.data ?? [];
  }

  /**
   * 新建条目。
   * query 常用 `{ status: 'draft' }`：Strapi 的 Content API 默认把新条目直接发布，
   * 内容工厂要求产物停留在草稿，必须显式指定。
   */
  async create<T = Record<string, unknown>>(
    plural: string,
    data: Record<string, unknown>,
    query: QueryObject = {},
  ): Promise<T> {
    const result = await this.request<{ data: T }>(plural, {
      method: 'POST',
      body: { data: toStrapiData(data) },
      query,
    });
    return result.data;
  }

  async update<T = Record<string, unknown>>(
    plural: string,
    documentId: string,
    data: Record<string, unknown>,
    query: QueryObject = {},
  ): Promise<T> {
    const result = await this.request<{ data: T }>(`${plural}/${documentId}`, {
      method: 'PUT',
      body: { data: toStrapiData(data) },
      query,
    });
    return result.data;
  }

  /** 单类型：读取（不存在时返回 null，Strapi 对空单类型返回 404） */
  async findSingle<T = Record<string, unknown>>(singular: string, query: QueryObject = {}): Promise<T | null> {
    try {
      const result = await this.request<{ data: T | null }>(singular, { method: 'GET', query });
      return result.data ?? null;
    } catch (error) {
      if (error instanceof StrapiRequestError && error.status === 404) return null;
      throw error;
    }
  }

  /** 单类型：写入（Strapi 单类型用 PUT 更新，不存在则创建） */
  async upsertSingle<T = Record<string, unknown>>(
    singular: string,
    data: Record<string, unknown>,
  ): Promise<T> {
    const result = await this.request<{ data: T }>(singular, { method: 'PUT', body: { data: toStrapiData(data) } });
    return result.data;
  }

  /** 健康检查：判断服务是否可达 */
  async ping(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/_health`, { method: 'GET' });
      return response.ok || response.status === 204;
    } catch {
      return false;
    }
  }
}

/** 按官网运行时约定把 Strapi 媒体地址转成站内路径 */
export function mediaUrlToLocalPath(url?: string | null, fallback?: string | null): string {
  if (!url) return fallback ?? '';
  // Strapi 返回 /uploads/<文件名>，官网构建时会把文件同步到 public/images/
  if (url.startsWith('/uploads/')) {
    return `/images/${url.slice('/uploads/'.length)}`;
  }
  return url;
}
