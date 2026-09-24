// CMS 连接参数解析：优先环境变量，其次仓库根 .env，最后 cms/.env
// 供 export-snapshot.mjs 与 sync-media.mjs 共用
import fs from 'node:fs';
import path from 'node:path';

export function readCmsEnv() {
  const root = process.cwd();
  const parsed = {};

  for (const file of [path.join(root, '.env'), path.join(root, 'cms', '.env')]) {
    if (!fs.existsSync(file)) continue;

    for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      if (!/^\s*[A-Za-z_][A-Za-z0-9_]*\s*=/.test(line)) continue;
      const index = line.indexOf('=');
      const key = line.slice(0, index).trim();
      const value = line
        .slice(index + 1)
        .trim()
        .replace(/^["']|["']$/g, '');
      if (value) parsed[key] = value;
    }
  }

  const baseUrl = (process.env.STRAPI_URL || parsed.STRAPI_URL || '').replace(/\/+$/, '');

  /** 只读令牌：快照导出与媒体同步只需要读权限 */
  const token =
    process.env.STRAPI_TOKEN ||
    process.env.STRAPI_READONLY_TOKEN ||
    parsed.STRAPI_TOKEN ||
    parsed.STRAPI_READONLY_TOKEN ||
    '';

  /** 写入令牌：仅需要写后台的脚本使用（如手工维护脚本） */
  const writeToken =
    process.env.STRAPI_WRITE_TOKEN ||
    parsed.STRAPI_WRITE_TOKEN ||
    '';

  return { baseUrl, token, writeToken };
}

/** 带鉴权的 fetch，超时可控 */
export async function cmsFetch(url, { token, timeoutMs = 20000, ...init } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
}
