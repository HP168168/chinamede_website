#!/usr/bin/env node
// 媒体同步：构建前把 CMS 媒体库里「被页面引用的图片」下载到 public/images/
//
// 为什么不在页面里直接引用 CMS 的图片地址：
//   1. CMS 临时不可用不会导致图片 404，官网产物自包含；
//   2. OG 图与 JSON-LD 需要绝对地址且尺寸稳定，走站内路径更可控；
//   3. 二次构建按「文件存在 + 大小一致」跳过下载，近乎零成本。
//
// 目标路径来自内容里的 fallbackPath / logoPath / ogImagePath / wechatQrPath，
// 讲师形象照没有单独的路径字段，统一落到 /images/teachers/<媒体文件名>；
// 因此运营替换媒体库图片后，重新同步即可覆盖同名文件，无需改代码。
//
// 用法：
//   node scripts/sync-media.mjs            # 按需同步（默认，构建前自动执行）
//   node scripts/sync-media.mjs --force    # 强制重新下载
//   node scripts/sync-media.mjs --check    # 只报告差异，不下载

import fs from 'node:fs';
import path from 'node:path';
import { cmsFetch, readCmsEnv } from './lib/cms-env.mjs';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');

const force = process.argv.includes('--force');
const checkOnly = process.argv.includes('--check');

/** 媒体 URL → 文件名：兼容 CDN 绝对地址与带查询串的地址 */
function mediaFileName(url) {
  return path.posix.basename(String(url).split('?')[0].split('#')[0]);
}

/** 收集「远程地址 → 站内路径」的映射 */
function collectPairs(coursesPayload, siteConfig, campusesPayload, teachersPayload) {
  const pairs = [];

  const push = (remoteUrl, localPath) => {
    if (!remoteUrl || !localPath) return;
    pairs.push({ remoteUrl, localPath });
  };

  (coursesPayload?.data ?? []).forEach((course) => {
    const cover = course?.cover;
    // 课程封面是「封面组件」，媒体挂在 image 字段上；兼容历史数据直接挂在 url
    if (cover?.image?.url) push(cover.image.url, cover.fallbackPath);
    else if (cover?.url) push(cover.url, cover.fallbackPath);
  });

  (campusesPayload?.data ?? []).forEach((campus) => {
    if (campus?.cover?.url) push(campus.cover.url, campus.coverPath);
  });

  (teachersPayload?.data ?? []).forEach((teacher) => {
    // 讲师形象照：媒体 URL 的文件名（含 hash，天然唯一）直接作为站内文件名，
    // 与 src/lib/strapi.ts 的 mediaToLocalPath 是同一套规则，改一处要同步改另一处
    const url = teacher?.photo?.url;
    if (url) push(url, `/images/teachers/${mediaFileName(url)}`);
  });

  const site = siteConfig?.data;
  if (site) {
    push(site.logo?.url, site.logoPath);
    push(site.ogImage?.url, site.ogImagePath);
    push(site.wechatQr?.url, site.wechatQrPath);
  }

  // 同一目标路径去重（后出现的以先出现的为准）
  const seen = new Set();
  return pairs.filter((pair) => {
    if (seen.has(pair.localPath)) return false;
    seen.add(pair.localPath);
    return true;
  });
}

/** 远程文件大小（取不到返回 undefined，视为需要下载） */
async function remoteSize(url, token) {
  try {
    const response = await cmsFetch(url, { token, method: 'HEAD' });
    if (!response.ok) return undefined;
    const length = Number(response.headers.get('content-length'));
    return Number.isFinite(length) && length > 0 ? length : undefined;
  } catch {
    return undefined;
  }
}

async function download(url, targetPath, token) {
  const response = await cmsFetch(url, { token, timeoutMs: 60000 });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });

  const tempPath = `${targetPath}.download`;
  fs.writeFileSync(tempPath, buffer);
  fs.renameSync(tempPath, targetPath);
  return buffer.length;
}

async function main() {
  const { baseUrl, token } = readCmsEnv();

  if (!baseUrl) {
    console.log('未配置 STRAPI_URL，跳过媒体同步（使用仓库内现有图片）。');
    return;
  }

  const endpoints = [
    `${baseUrl}/api/courses?status=published&pagination[pageSize]=200&populate[cover][populate][0]=image`,
    `${baseUrl}/api/site-config?populate[logo]=true&populate[ogImage]=true&populate[wechatQr]=true`,
    `${baseUrl}/api/campuses?status=published&pagination[pageSize]=200&populate[cover]=true`,
    `${baseUrl}/api/teachers?status=published&pagination[pageSize]=200&populate[photo]=true`,
  ];

  let payloads;
  try {
    payloads = await Promise.all(
      endpoints.map(async (url) => {
        const response = await cmsFetch(url, { token });
        if (!response.ok) throw new Error(`${url} → HTTP ${response.status}`);
        return response.json();
      }),
    );
  } catch (error) {
    console.warn(`媒体同步跳过：${error.message}（构建继续使用仓库内现有图片）`);
    return;
  }

  const pairs = collectPairs(payloads[0], payloads[1], payloads[2], payloads[3]);
  if (pairs.length === 0) {
    console.log('CMS 中没有可同步的图片（媒体字段为空），使用仓库内现有图片。');
    return;
  }

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const { remoteUrl, localPath } of pairs) {
    const targetPath = path.join(PUBLIC_DIR, localPath.replace(/^\/+/, ''));
    const url = remoteUrl.startsWith('http') ? remoteUrl : `${baseUrl}${remoteUrl}`;

    const exists = fs.existsSync(targetPath);
    const localBytes = exists ? fs.statSync(targetPath).size : 0;

    if (!force && exists) {
      const size = await remoteSize(url, token);
      if (size !== undefined && size === localBytes) {
        skipped += 1;
        continue;
      }
    }

    if (checkOnly) {
      console.log(`  ~ 需要更新：${localPath}`);
      downloaded += 1;
      continue;
    }

    try {
      const bytes = await download(url, targetPath, token);
      console.log(`  ↓ ${localPath}（${Math.round(bytes / 1024)} KB）`);
      downloaded += 1;
    } catch (error) {
      console.error(`  ✗ ${localPath} 下载失败：${error.message}`);
      failed += 1;
    }
  }

  console.log(
    `媒体同步${checkOnly ? '自检' : '完成'}：更新 ${downloaded} 个，跳过 ${skipped} 个（内容一致）${
      failed ? `，失败 ${failed} 个` : ''
    }`,
  );

  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.warn(`媒体同步异常，已忽略：${error.message}`);
});
