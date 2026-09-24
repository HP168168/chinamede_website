/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';
import { loadDotEnv, envString } from '../src/lib/env';
import { StrapiClient } from '../src/lib/strapi-client';

/**
 * 内容导出：把内容工厂相关的内容与全部已发布内容导出为 JSON 快照。
 *
 * 用途：
 * - 备份：数据库或误操作出问题时，可从 JSON 人工核对与回填；
 * - 离线：不可访问 Strapi 时，用导出的 JSON 做人工撰写与内容校对；
 * - 审计：发布前对比导出结果，确认文章确实处于草稿/已发布状态。
 *
 * 用法（在 cms 目录执行）：
 *   npm run export:content                 # 导出到 cms/backup/<时间戳>/
 *   npm run export:content -- --with-draft # 连同草稿一起导出（默认只导已发布）
 */

/** 导出范围：集合类型的复数名与单类型名 */
const COLLECTIONS = [
  'course-categories',
  'courses',
  'teacher-levels',
  'teachers',
  'showcase-sections',
  'campuses',
  'news-items',
  'faqs',
  'guides',
  'articles',
  'kb-entries',
  'generation-tasks',
];

const SINGLE_TYPES = ['site-config', 'navigation', 'page-seo', 'schema-data'];

/** 各类型的 populate 参数：组件需要显式 populate，可重复字符串字段不能 populate */
const POPULATE: Record<string, string> = {
  courses:
    'populate[category][fields][0]=code&populate[cover]=true&populate[metaTags]=true&populate[price]=true&populate[stats]=true&populate[curriculum][populate][0]=modules&populate[practice]=true&populate[outcomes]=true&populate[faq]=true&populate[seo]=true',
  'teacher-levels': '',
  teachers: '',
  'showcase-sections': 'populate[items]=true',
  campuses: '',
  'news-items': '',
  faqs: '',
  guides: 'populate[seo]=true',
  articles:
    'populate[cover][populate][0]=image&populate[seo]=true&populate[answerBlocks]=true&populate[keyFacts]=true&populate[faq]=true&populate[sources]=true&populate[relatedLinks]=true&populate[kbEntries][fields][0]=slug',
  'kb-entries':
    'populate[points]=true&populate[facts]=true&populate[qa]=true&populate[sources]=true&populate[attachments]=true&populate[relatedCourses][fields][0]=slug',
  'generation-tasks': 'populate[entries][fields][0]=slug&populate[result][fields][0]=slug',
  'course-categories': '',
  'site-config': 'populate[logo]=true&populate[ogImage]=true&populate[wechatQr]=true',
  navigation: 'populate[nav]=true&populate[footerGroups][populate][0]=links',
  'page-seo': 'populate[entries][populate][0]=seo',
  'schema-data': '',
};

async function main(): Promise<void> {
  loadDotEnv();

  const withDraft = process.argv.includes('--with-draft');
  const baseUrl = envString('STRAPI_URL', 'http://localhost:1337').replace(/\/+$/, '');
  const token = envString('STRAPI_WRITE_TOKEN', '') || envString('STRAPI_READONLY_TOKEN', '');

  const client = new StrapiClient({ baseUrl, token, timeoutMs: 120000 });
  if (!(await client.ping())) {
    console.error(`无法连接 Strapi（${baseUrl}），请先启动 npm run develop。`);
    process.exitCode = 1;
    return;
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outputDir = path.join(process.cwd(), 'backup', stamp);
  fs.mkdirSync(outputDir, { recursive: true });

  const manifest: Record<string, number> = {};

  for (const plural of COLLECTIONS) {
    const statuses = withDraft ? (['published', 'draft'] as const) : (['published'] as const);

    for (const status of statuses) {
      const query = POPULATE[plural] ?? '';
      const url = `${baseUrl}/api/${plural}?status=${status}&pagination[pageSize]=500${query ? `&${query}` : ''}`;
      const response = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });

      if (!response.ok) {
        console.error(`  ! 导出失败（${plural}/${status}）：HTTP ${response.status}`);
        continue;
      }

      const body = (await response.json()) as { data: unknown[] };
      const name = withDraft ? `${plural}.${status}.json` : `${plural}.json`;
      fs.writeFileSync(path.join(outputDir, name), JSON.stringify(body.data ?? [], null, 2), 'utf8');
      manifest[`${plural}${withDraft ? ` (${status})` : ''}`] = (body.data ?? []).length;
    }
  }

  for (const singular of SINGLE_TYPES) {
    const query = POPULATE[singular] ?? '';
    const response = await fetch(`${baseUrl}/api/${singular}${query ? `?${query}` : ''}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (response.status === 404) {
      manifest[singular] = 0;
      continue;
    }
    if (!response.ok) {
      console.error(`  ! 导出失败（${singular}）：HTTP ${response.status}`);
      continue;
    }

    const body = (await response.json()) as { data: unknown };
    fs.writeFileSync(path.join(outputDir, `${singular}.json`), JSON.stringify(body.data, null, 2), 'utf8');
    manifest[singular] = body.data ? 1 : 0;
  }

  fs.writeFileSync(
    path.join(outputDir, 'manifest.json'),
    JSON.stringify({ exportedAt: new Date().toISOString(), baseUrl, withDraft, counts: manifest }, null, 2),
    'utf8',
  );

  console.log(`已导出到 ${outputDir}`);
  const width = Math.max(...Object.keys(manifest).map((key) => key.length), 6);
  for (const [name, count] of Object.entries(manifest)) {
    console.log(`  ${name.padEnd(width + 2, ' ')}${count}`);
  }
}

main().catch((error: unknown) => {
  console.error('');
  console.error(`导出失败：${(error as Error).message}`);
  process.exitCode = 1;
});
