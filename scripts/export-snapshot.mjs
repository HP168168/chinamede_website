#!/usr/bin/env node
// 内容快照导出：把 CMS 上已发布的内容导出为 src/data/__snapshot__/*.json
//
// 为什么需要：
//   1. 兜底 —— CMS 不可用或未配置 STRAPI_URL 时，官网取数层自动降级读快照，离线也能构建；
//   2. 可回滚 —— 快照入库，任何一步出问题都能退回迁移前的内容状态；
//   3. 可审计 —— 构建前 diff 快照即可看出内容发生了什么变化。
//
// 取数清单来自 src/lib/strapi-sources.json（与运行时取数共用同一份定义，避免两处漂移）。
//
// 用法：
//   npm run cms:snapshot          # 导出快照
//   npm run cms:snapshot -- --check   # 只连通性自检，不写文件

import fs from 'node:fs';
import path from 'node:path';
import { cmsFetch, readCmsEnv } from './lib/cms-env.mjs';

const ROOT = process.cwd();
const SOURCES_FILE = path.join(ROOT, 'src', 'lib', 'strapi-sources.json');
const OUTPUT_DIR = path.join(ROOT, 'src', 'data', '__snapshot__');

const checkOnly = process.argv.includes('--check');

function loadSources() {
  const raw = JSON.parse(fs.readFileSync(SOURCES_FILE, 'utf8'));
  return Object.entries(raw).filter(([key, value]) => !key.startsWith('_') && value && typeof value === 'object');
}

function buildUrl(baseUrl, spec) {
  const query = spec.kind === 'collection' ? `status=published&${spec.query}` : spec.query;
  const search = new URLSearchParams(query);
  return `${baseUrl}/api/${spec.path}${search.toString() ? `?${search.toString()}` : ''}`;
}

async function main() {
  const { baseUrl, token } = readCmsEnv();
  const sources = loadSources();

  if (!baseUrl) {
    console.error('未配置 STRAPI_URL。');
    console.error('请先在 cms/.env 或环境变量中配置 STRAPI_URL（与 STRAPI_READONLY_TOKEN），再执行 npm run cms:snapshot。');
    process.exitCode = 1;
    return;
  }

  console.log(`内容快照${checkOnly ? '自检' : '导出'}：${baseUrl}`);
  if (!token) console.log('提示：未配置 STRAPI_READONLY_TOKEN，只能读取公开内容。');

  if (!checkOnly) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const summary = [];
  let failures = 0;

  for (const [key, spec] of sources) {
    const url = buildUrl(baseUrl, spec);

    try {
      const response = await cmsFetch(url, { token });
      if (!response.ok) {
        failures += 1;
        summary.push({ key, count: 0, status: `HTTP ${response.status}` });
        continue;
      }

      const body = await response.json();
      const data = body?.data ?? null;
      const count = Array.isArray(data) ? data.length : data ? 1 : 0;

      if (!checkOnly) {
        fs.writeFileSync(
          path.join(OUTPUT_DIR, `${key}.json`),
          `${JSON.stringify({ exportedAt: new Date().toISOString(), source: url, data }, null, 2)}\n`,
          'utf8',
        );
      }

      summary.push({ key, count, status: 'OK' });
    } catch (error) {
      failures += 1;
      summary.push({ key, count: 0, status: error.name === 'AbortError' ? '超时' : error.message });
    }
  }

  const width = Math.max(...summary.map((item) => item.key.length), 8);
  for (const item of summary) {
    const mark = item.status === 'OK' ? '  ' : '!!';
    console.log(`${mark} ${item.key.padEnd(width + 2, ' ')}${String(item.count).padStart(4, ' ')} 条  ${item.status}`);
  }

  if (failures > 0) {
    console.error(`\n有 ${failures} 项导出失败。若为「无内容」属正常（例如文章还没发布）；其余请检查 CMS 是否启动、令牌是否有效。`);
    process.exitCode = 1;
    return;
  }

  console.log(checkOnly ? '\n自检通过。' : `\n快照已写入 ${path.relative(ROOT, OUTPUT_DIR)}`);
  if (!checkOnly) console.log('快照文件请一并提交，作为离线构建与回滚依据。');
}

main().catch((error) => {
  console.error(`\n快照导出失败：${error.message}`);
  process.exitCode = 1;
});
