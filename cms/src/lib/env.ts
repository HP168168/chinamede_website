import fs from 'node:fs';
import path from 'node:path';

/**
 * 极简 .env 读取（不引入额外依赖）。
 * 脚本（tsx 运行）不会经过 Strapi 的 dotenv 初始化，因此需要自行加载。
 * 已存在的系统环境变量优先级更高，不会被 .env 覆盖。
 */

let loaded = false;

export function loadDotEnv(file: string = path.join(process.cwd(), '.env')): void {
  if (loaded) return;
  loaded = true;
  if (!fs.existsSync(file)) return;

  const text = fs.readFileSync(file, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined || process.env[key] === '') {
      process.env[key] = value;
    }
  }
}

export function envString(key: string, fallback = ''): string {
  loadDotEnv();
  const value = process.env[key];
  return value === undefined || value === '' ? fallback : value;
}

export function envInt(key: string, fallback: number): number {
  const value = envString(key, '');
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}
