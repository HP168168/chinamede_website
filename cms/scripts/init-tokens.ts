/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';
import { createStrapi } from '@strapi/strapi';

/**
 * 一键初始化 API 令牌。
 *
 * 为什么需要它：官网构建脚本（astro build / 快照导出）需要只读令牌，
 * 内容工厂（ai:run / 导入脚本）需要写入令牌；在后台手工创建容易漏配，
 * 且令牌明文只在创建时显示一次。本脚本直接调用 Strapi 的令牌服务创建，
 * 并把明文写回 cms/.env（该文件不入版本库）。
 *
 * 用法：
 *   npm run init:tokens            # 已存在则复用，只补齐 .env 里的空值
 *   npm run init:tokens -- --force # 重新生成令牌（旧的立即失效）
 *
 * 注意：请先停止 npm run develop，避免 SQLite 写锁冲突。
 */

interface TokenSpec {
  name: string;
  description: string;
  type: 'read-only' | 'full-access';
  envKey: string;
}

const TOKEN_SPECS: TokenSpec[] = [
  {
    name: 'website-readonly',
    description: '官网构建只读令牌：仅读取已发布内容',
    type: 'read-only',
    envKey: 'STRAPI_READONLY_TOKEN',
  },
  {
    name: 'content-factory',
    description: '内容工厂写入令牌：生成文章草稿、回写任务状态',
    type: 'full-access',
    envKey: 'STRAPI_WRITE_TOKEN',
  },
];

function mask(token: string): string {
  if (token.length <= 12) return '*'.repeat(token.length);
  return `${token.slice(0, 6)}…${token.slice(-4)}`;
}

/** 读取 .env 中某个键的当前值 */
function readEnvValue(envText: string, key: string): string {
  const match = new RegExp(`^${key}=(.*)$`, 'm').exec(envText);
  return match ? match[1].trim() : '';
}

/** 写入/更新 .env 中的键值（保留其它内容与顺序） */
function writeEnvValues(envPath: string, values: Record<string, string>): void {
  let text = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

  for (const [key, value] of Object.entries(values)) {
    const pattern = new RegExp(`^${key}=.*$`, 'm');
    if (pattern.test(text)) {
      text = text.replace(pattern, `${key}=${value}`);
    } else {
      text = `${text.replace(/\s*$/, '')}\n${key}=${value}\n`;
    }
  }

  fs.writeFileSync(envPath, text, 'utf8');
}

async function main(): Promise<void> {
  const force = process.argv.includes('--force');
  const appDir = process.cwd();
  const envPath = path.join(appDir, '.env');

  if (!fs.existsSync(envPath)) {
    console.error('未找到 cms/.env，请先复制 .env.example 为 .env（npm run init:tokens 需要在 cms 目录执行）。');
    process.exitCode = 1;
    return;
  }

  console.log('正在启动 Strapi（不监听端口，仅初始化服务）……');
  const app = await (createStrapi as any)({ appDir, distDir: path.join(appDir, 'dist') }).load();
  const tokenService = app.service('admin::api-token-content-api');

  const envText = fs.readFileSync(envPath, 'utf8');
  const updates: Record<string, string> = {};
  const summary: string[] = [];

  try {
    for (const spec of TOKEN_SPECS) {
      const existing = await tokenService.getByName(spec.name, { includeDecryptedKey: true });
      const currentValue = readEnvValue(envText, spec.envKey);

      let accessKey: string | undefined = existing?.accessKey;

      if (force && existing) {
        await tokenService.revoke(existing.id);
        accessKey = undefined;
      }

      if (!accessKey) {
        const created = await tokenService.create({
          name: spec.name,
          description: spec.description,
          type: spec.type,
          lifespan: null,
        });
        accessKey = created.accessKey as string;
        summary.push(`  [新建] ${spec.name}（${spec.type}）→ ${spec.envKey}=${mask(accessKey)}`);
      } else {
        summary.push(`  [复用] ${spec.name}（${spec.type}）→ ${spec.envKey}=${mask(accessKey)}`);
      }

      if (force || !currentValue) {
        updates[spec.envKey] = accessKey as string;
      }
    }
  } finally {
    await app.destroy();
  }

  if (Object.keys(updates).length > 0) {
    writeEnvValues(envPath, updates);
    console.log(`已更新 ${Object.keys(updates).length} 个密钥到 cms/.env`);
  } else {
    console.log('cms/.env 中的令牌已是最新，无需修改（如需重置请加 --force）。');
  }

  console.log('API 令牌状态：');
  summary.forEach((line) => console.log(line));
  console.log('');
  console.log('下一步：npm run import:content 导入现有内容，或 npm run ai:check 自检内容工厂。');
}

main().catch((error: unknown) => {
  console.error('');
  console.error(`初始化令牌失败：${(error as Error).message}`);
  process.exitCode = 1;
});
