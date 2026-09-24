/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';
import { loadDotEnv, envString } from '../src/lib/env';
import { StrapiClient } from '../src/lib/strapi-client';
import type { QueryObject } from '../src/lib/strapi-client';

import { courses } from './seed-data/courses';
import { campuses } from './seed-data/campuses';
import { faqs } from './seed-data/faqs';
import { guides } from './seed-data/guides';
import { news } from './seed-data/news';
import { business } from './seed-data/business';
import { studentSections } from './seed-data/students';
import { teachers } from './seed-data/teachers';
import { teacherLevels } from './seed-data/teacherLevels';
import { nav, footerGroups, footerIntro, footerContacts, footerBottom } from './seed-data/navigation';
import { pageSeo } from './seed-data/pageSeo';
import { pageSchema } from './seed-data/pageSchema';
import { organizationSchema, websiteSchema } from './seed-data/siteSchema';
import { keywords } from './seed-data/keywords';
import { promptTemplates } from './seed-data/promptTemplates';
import { site } from './seed-data/site';
import { llmsIntro, llmsFacts, llmsCitation } from './seed-data/llms';

/**
 * 现有本地数据 → Strapi 幂等导入。
 *
 * 数据来源：scripts/seed-data/*.ts 与 scripts/seed-data/knowledge/*.html
 * （迁移前 src/data/*.ts 与 src/content/knowledge/*.html 的副本，校验通过后原文件删除）
 *
 * 幂等策略：按业务唯一键（slug / code / faqId / campusId / sectionId / title）查找，
 * 存在则整篇覆盖（草稿与已发布两个版本都写，避免后台看到过期草稿），
 * 不存在则新建并直接发布。可反复执行不产生重复数据。
 *
 * 用法（在 cms 目录执行，需先 npm run develop 且配好 STRAPI_WRITE_TOKEN）：
 *   npm run import:content              # 全量导入 + 生成知识库初始素材
 *   npm run import:content -- --no-kb   # 只导入内容，不生成知识库素材
 *   npm run import:content -- --skip-media   # 跳过媒体上传（离线环境）
 */

const KB_ENABLED = !process.argv.includes('--no-kb');
const SKIP_MEDIA = process.argv.includes('--skip-media');

const CMS_ROOT = process.cwd();
const SITE_ROOT = path.resolve(CMS_ROOT, '..');
const PUBLIC_IMAGES = path.join(SITE_ROOT, 'public', 'images');
const SEED_DIR = path.join(CMS_ROOT, 'scripts', 'seed-data');

/* ------------------------------------------------------------------ */
/* 小工具                                                              */
/* ------------------------------------------------------------------ */

type Row = Record<string, unknown>;

const stats: Record<string, { created: number; updated: number }> = {};
let failureCount = 0;

function bump(kind: string, action: 'created' | 'updated'): void {
  stats[kind] ??= { created: 0, updated: 0 };
  stats[kind][action] += 1;
}

function log(message: string): void {
  console.log(message);
}

/** 剔除 undefined 与空数组：Strapi 对可重复字符串字段的空数组会报错 */
function clean<T extends Row>(payload: T): Row {
  const result: Row = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    result[key] = value;
  }
  return result;
}

/** 把 JSON-LD 里的硬编码域名统一为站点基准地址，避免三处不一致 */
function rewriteBaseUrl<T>(value: T, from: string, to: string): T {
  const text = JSON.stringify(value).split(from).join(to);
  return JSON.parse(text) as T;
}

/* ------------------------------------------------------------------ */
/* 媒体上传                                                            */
/* ------------------------------------------------------------------ */

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
};

interface UploadedFile {
  id: number;
  name: string;
  url: string;
}

class MediaLibrary {
  private readonly cache = new Map<string, UploadedFile>();

  constructor(
    private readonly client: StrapiClient,
    private readonly token: string,
  ) {}

  /** 预载媒体库里已有的文件，按文件名去重，重复导入不会重复上传 */
  async warmUp(): Promise<void> {
    if (SKIP_MEDIA) return;
    try {
      const response = await fetch(`${envString('STRAPI_URL', 'http://localhost:1337')}/api/upload/files`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      if (!response.ok) return;
      const files = (await response.json()) as UploadedFile[];
      files.forEach((file) => {
        if (file?.name) this.cache.set(file.name, file);
      });
      log(`媒体库已有 ${files.length} 个文件`);
    } catch {
      log('未能读取媒体库清单，将按需上传');
    }
  }

  /**
   * 按站内路径（如 /images/courses/xmtyysjyb.webp）确保文件已入库，
   * 返回媒体 id；文件缺失或跳过上传时返回 undefined。
   */
  async ensure(webPath: string | undefined, alt: string): Promise<number | undefined> {
    if (!webPath || SKIP_MEDIA) return undefined;

    const name = path.basename(webPath).replace(/\.[^.]+$/, '');
    const cached = this.cache.get(name);
    if (cached) return cached.id;

    const localPath = path.join(PUBLIC_IMAGES, webPath.replace(/^\/?images\//, ''));
    if (!fs.existsSync(localPath)) {
      log(`  ! 本地缺少图片，跳过上传：${webPath}`);
      return undefined;
    }

    const ext = path.extname(localPath).toLowerCase();
    const form = new FormData();
    form.append('files', new Blob([fs.readFileSync(localPath)], { type: MIME_BY_EXT[ext] ?? 'application/octet-stream' }), path.basename(localPath));
    form.append('fileInfo', JSON.stringify({ name, alternativeText: alt }));

    const response = await fetch(`${envString('STRAPI_URL', 'http://localhost:1337')}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}` },
      body: form,
    });

    if (!response.ok) {
      log(`  ! 上传失败（HTTP ${response.status}）：${webPath}`);
      return undefined;
    }

    const [file] = (await response.json()) as UploadedFile[];
    if (file) this.cache.set(name, file);
    return file?.id;
  }
}

/* ------------------------------------------------------------------ */
/* 幂等写入                                                            */
/* ------------------------------------------------------------------ */

interface UpsertOptions {
  plural: string;
  label: string;
  /** 业务唯一字段，如 slug；单类型不需要 */
  uniqueField?: string;
  uniqueValue?: string;
  /** 集合类型默认 true：新建时直接发布，更新时草稿与已发布同步 */
  draftAndPublish?: boolean;
  data: Row;
}

/** 按业务唯一键查找（草稿与已发布都找，避免把订阅项误建为重复数据） */
async function findExisting(
  client: StrapiClient,
  plural: string,
  uniqueField: string,
  uniqueValue: string,
): Promise<string | undefined> {
  const filters: QueryObject = { [uniqueField]: { $eq: uniqueValue } };

  for (const status of ['published', 'draft'] as const) {
    const rows = await client.list<Row>(plural, { filters, status, fields: ['documentId'] });
    const documentId = rows[0]?.documentId;
    if (typeof documentId === 'string') return documentId;
  }
  return undefined;
}

/** 幂等 upsert，返回 documentId */
async function upsert(client: StrapiClient, options: UpsertOptions): Promise<string | undefined> {
  const { plural, label, uniqueField, uniqueValue, draftAndPublish = true, data } = options;

  try {
    const existing = uniqueField && uniqueValue ? await findExisting(client, plural, uniqueField, uniqueValue) : undefined;

    if (!existing) {
      const created = await client.create<Row>(plural, clean(data), draftAndPublish ? { status: 'published' } : {});
      bump(label, 'created');
      return created.documentId as string;
    }

    await client.update(plural, existing, clean(data), draftAndPublish ? { status: 'published' } : {});
    if (draftAndPublish) {
      // 后台默认展示草稿版本，两个版本一起写才不会出现「后台看到的还是旧内容」
      await client.update(plural, existing, clean(data), { status: 'draft' });
    }
    bump(label, 'updated');
    return existing;
  } catch (error) {
    failureCount += 1;
    log(`  ✗ ${label} 导入失败：${(error as Error).message}`);
    return undefined;
  }
}

/** 单类型整体覆盖 */
async function upsertSingle(client: StrapiClient, singular: string, label: string, data: Row): Promise<void> {
  try {
    await client.upsertSingle(singular, clean(data));
    bump(label, 'updated');
  } catch (error) {
    failureCount += 1;
    log(`  ✗ ${label} 导入失败：${(error as Error).message}`);
  }
}

/* ------------------------------------------------------------------ */
/* 业务数据映射                                                        */
/* ------------------------------------------------------------------ */

/** 课程分类：现有数据只有 ai / crossborder 两个标识 */
const COURSE_CATEGORIES = [
  {
    code: 'ai',
    name: 'AI 就业方向',
    order: 1,
    description: 'AI新媒体运营、AI视觉设计、商业短视频、AIGC全能、AI短剧漫剧等 AI 长期就业班',
  },
  {
    code: 'crossborder',
    name: '跨境电商方向',
    order: 2,
    description: '亚马逊高阶运营、TikTok 营销、海外社媒运营等跨境短期强化班',
  },
];

interface ImportContext {
  client: StrapiClient;
  media: MediaLibrary;
  courseIds: Map<string, string>;
}

async function importCourseCategories(ctx: ImportContext): Promise<Map<string, string>> {
  log('▸ 课程分类');
  const categoryIds = new Map<string, string>();

  for (const category of COURSE_CATEGORIES) {
    const documentId = await upsert(ctx.client, {
      plural: 'course-categories',
      label: '课程分类',
      uniqueField: 'code',
      uniqueValue: category.code,
      data: category,
    });
    if (documentId) categoryIds.set(category.code, documentId);
  }

  return categoryIds;
}

async function importCourses(ctx: ImportContext, categoryIds: Map<string, string>): Promise<void> {
  log('▸ 课程');
  for (const course of courses) {
    const coverImage = await ctx.media.ensure(course.cover.src, course.cover.alt);
    const categoryId = categoryIds.get(course.category);

    const documentId = await upsert(ctx.client, {
      plural: 'courses',
      label: '课程',
      uniqueField: 'slug',
      uniqueValue: course.slug,
      data: {
        slug: course.slug,
        order: course.order,
        code: course.code,
        title: course.title,
        subtitle: course.subtitle,
        mainTitle: course.mainTitle,
        badge: course.badge,
        descHighlight: course.descHighlight,
        tags: course.tags,
        ...(categoryId ? { category: { connect: [{ documentId: categoryId }] } } : {}),
        cover: clean({
          image: coverImage,
          fallbackPath: course.cover.src,
          alt: course.cover.alt,
          width: course.cover.width,
          height: course.cover.height,
        }),
        metaTags: course.metaTags.map((tag) => ({ text: tag.text, cls: tag.cls })),
        price: { ...course.price },
        stats: course.stats.map((stat) => ({ text: stat.text, highlight: stat.highlight })),
        curriculum: course.curriculum.map((stage) => ({
          badge: stage.badge,
          title: stage.title,
          subtitle: stage.subtitle,
          modules: stage.modules.map((module) => ({
            name: module.name,
            hour: module.hour,
            highlight: module.highlight,
          })),
        })),
        practice: { ...course.practice },
        outcomes: { jobs: course.outcomes.jobs, targets: course.outcomes.targets },
        faq: course.faq.map((item) => ({ question: item.question, answer: item.answer })),
        seo: { ...course.seo },
      },
    });

    if (documentId) ctx.courseIds.set(course.slug, documentId);
  }
}

async function importTeacherLevels(ctx: ImportContext): Promise<void> {
  log('▸ 师资层级');
  for (const [index, level] of teacherLevels.entries()) {
    await upsert(ctx.client, {
      plural: 'teacher-levels',
      label: '师资层级',
      uniqueField: 'code',
      uniqueValue: level.code,
      data: {
        code: level.code,
        name: level.name,
        gradient: level.gradient,
        desc: level.desc,
        meta: level.meta,
        order: index + 1,
      },
    });
  }
}

async function importTeachers(ctx: ImportContext): Promise<void> {
  log('▸ 师资');
  for (const [index, teacher] of teachers.entries()) {
    await upsert(ctx.client, {
      plural: 'teachers',
      label: '师资',
      uniqueField: 'name',
      uniqueValue: teacher.name,
      data: {
        avatar: teacher.avatar,
        name: teacher.name,
        title: teacher.title,
        desc: teacher.desc,
        order: index + 1,
      },
    });
  }
}

async function importShowcaseSections(ctx: ImportContext): Promise<void> {
  log('▸ 学员风采展示区块');
  for (const [index, section] of studentSections.entries()) {
    await upsert(ctx.client, {
      plural: 'showcase-sections',
      label: '展示区块',
      uniqueField: 'sectionId',
      uniqueValue: section.id,
      data: {
        sectionId: section.id,
        title: section.title,
        subtitle: section.subtitle,
        order: index + 1,
        items: section.items.map((item) => ({ emoji: item.emoji, title: item.title, desc: item.desc })),
      },
    });
  }
}

/**
 * 联系我们页的校区卡片展示信息（城市筛选代码、卡片标题、页面展示用交通指引、实景照片）。
 * 这些内容原先硬编码在 src/pages/contact/index.astro 中，导入后由后台维护，
 * 运营调整校区文案或换照片都无需改代码。
 * 注意：traffic 字段（结构化数据用）与 trafficDisplay（页面展示用）文案历来不同，
 * 这里各自保留，保证页面与 JSON-LD 都与迁移前逐字一致。
 */
const CAMPUS_META: Record<
  string,
  { cityCode: string; displayTitle: string; trafficDisplay: string; cover: string; coverAlt: string }
> = {
  'campus-gz-sanyuanli': {
    cityCode: 'gz',
    displayTitle: '广州（总校）· 越秀区 · 三元里校区',
    trafficDisplay: '地铁 2 号线三元里站 A1 出口；公交三元里站（约 50 米）、桂花岗站（约 500 米）',
    cover: '/images/campuscover/gz_syl.webp',
    coverAlt: '美迪时代教育广州三元里校区（总部）实景',
  },
  'campus-gz-kecun': {
    cityCode: 'gz',
    displayTitle: '广州（分校）· 海珠区 · 客村校区',
    trafficDisplay: '地铁 3 号线客村站 D 出口；公交珠影站',
    cover: '/images/campuscover/gz_kecun.webp',
    coverAlt: '美迪时代教育广州客村校区实景',
  },
  'campus-gz-huashi': {
    cityCode: 'gz',
    displayTitle: '广州（分校）· 天河区 · 华师校区',
    trafficDisplay: '地铁 3 号线 / 11 号线华师站 C 出口；公交师大后门站（约 50 米）',
    cover: '/images/campuscover/gz_hs.webp',
    coverAlt: '美迪时代教育广州华师校区实景',
  },
  'campus-gz-nanzhou': {
    cityCode: 'gz',
    displayTitle: '广州（分校）· 海珠区 · 南洲校区',
    trafficDisplay: '地铁 2 号线南洲站 A 出口',
    cover: '/images/campuscover/gz_nz.webp',
    coverAlt: '美迪时代教育广州南洲校区实景',
  },
  'campus-sz-wuhe': {
    cityCode: 'sz',
    displayTitle: '深圳（总校）· 龙岗区 · 五和校区',
    trafficDisplay: '深圳地铁 5 号线 / 10 号线五和站 D1 出口；公交五和地铁站',
    cover: '/images/campuscover/sz_wh.webp',
    coverAlt: '美迪时代教育深圳五和校区（深圳总部）实景',
  },
  'campus-sz-ailian': {
    cityCode: 'sz',
    displayTitle: '深圳（分校）· 龙岗区 · 爱联校区',
    trafficDisplay: '深圳地铁 3 号线爱联站 D 出口；公交中粮祥云站',
    cover: '/images/campuscover/sz_lh.webp',
    coverAlt: '美迪时代教育深圳爱联校区实景',
  },
  'campus-sz-fuyong': {
    cityCode: 'sz',
    displayTitle: '深圳（分校）· 宝安区 · 福永校区',
    trafficDisplay: '深圳地铁 11 号线 / 12 号线福永站 F 出口；公交福永地铁站1站',
    cover: '/images/campuscover/sz_fy.webp',
    coverAlt: '美迪时代教育深圳福永校区实景',
  },
  'campus-fs-ronggui': {
    cityCode: 'fs',
    displayTitle: '佛山 · 顺德区 · 容桂校区',
    trafficDisplay: '公交百昌大厦站（约 80 米）、幸福居委会站（约 178 米）、旧桂洲医院站（约 100 米）',
    cover: '/images/campuscover/fs_rg.webp',
    coverAlt: '美迪时代教育佛山容桂校区实景',
  },
  'campus-fs-zumiao': {
    cityCode: 'fs',
    displayTitle: '佛山 · 禅城区 · 祖庙校区',
    trafficDisplay: '地铁广佛线祖庙站 D 出口（约 20 米）；公交祖庙站（约 20 米）',
    cover: '/images/campuscover/fs_cc.webp',
    coverAlt: '美迪时代教育佛山祖庙校区实景',
  },
  'campus-dg-dongcheng': {
    cityCode: 'dg',
    displayTitle: '东莞 · 东城区 · 东城校区',
    trafficDisplay: '东莞地铁 2 号线东城站 A 出口（出站左转约 30 米）；公交东城地铁站、香槟时代站、世博广场站',
    cover: '/images/campuscover/dg_dc.webp',
    coverAlt: '美迪时代教育东莞东城校区实景',
  },
  'campus-dg-houjie': {
    cityCode: 'dg',
    displayTitle: '东莞 · 厚街镇 · 厚街校区',
    trafficDisplay: '东莞地铁 2 号线寮厦站 A 出口（步行约 200 米）；公交寮厦路口站（步行约 100 米）',
    cover: '/images/campuscover/dg_hj.webp',
    coverAlt: '美迪时代教育东莞厚街校区实景',
  },
  'campus-zs-xiaolan': {
    cityCode: 'zs',
    displayTitle: '中山 · 小榄镇 · 小榄校区',
    trafficDisplay: '公交小榄大信公交站',
    cover: '/images/campuscover/zs_xl.webp',
    coverAlt: '美迪时代教育中山小榄校区实景',
  },
  'campus-jm-jianghai': {
    cityCode: 'jm',
    displayTitle: '江门 · 江海区 · 江海校区',
    trafficDisplay: '公交 117 路（连海路南方向）至龙溪湖公园站，步行约 60 米进园区即达',
    cover: '/images/campuscover/jm_jh.webp',
    coverAlt: '美迪时代教育江门江海校区实景',
  },
};

async function importCampuses(ctx: ImportContext): Promise<void> {
  log('▸ 校区');
  for (const [index, campus] of campuses.entries()) {
    const meta = CAMPUS_META[campus.id];
    if (!meta) log(`  ! 校区缺少展示信息配置：${campus.id}`);

    const coverId = meta ? await ctx.media.ensure(meta.cover, meta.coverAlt) : undefined;

    await upsert(ctx.client, {
      plural: 'campuses',
      label: '校区',
      uniqueField: 'campusId',
      uniqueValue: campus.id,
      data: {
        campusId: campus.id,
        name: campus.name,
        displayTitle: meta?.displayTitle,
        cityCode: meta?.cityCode,
        telephone: campus.telephone,
        streetAddress: campus.streetAddress,
        locality: campus.locality,
        region: campus.region,
        city: campus.city,
        traffic: campus.traffic,
        trafficDisplay: meta?.trafficDisplay,
        cover: coverId,
        coverPath: meta?.cover,
        coverAlt: meta?.coverAlt,
        order: index + 1,
      },
    });
  }
}

async function importNewsItems(ctx: ImportContext): Promise<void> {
  log('▸ 机构动态 / 商业资讯');
  for (const [index, item] of news.entries()) {
    await upsert(ctx.client, {
      plural: 'news-items',
      label: '机构动态',
      uniqueField: 'title',
      uniqueValue: item.title,
      data: {
        title: item.title,
        channel: 'news',
        dateText: item.date,
        emoji: item.emoji,
        summary: item.summary,
        order: index + 1,
      },
    });
  }

  for (const [index, item] of business.entries()) {
    await upsert(ctx.client, {
      plural: 'news-items',
      label: '商业资讯',
      uniqueField: 'title',
      uniqueValue: item.title,
      data: {
        title: item.title,
        channel: 'business',
        dateText: item.date,
        emoji: item.emoji,
        summary: item.summary,
        order: index + 1,
      },
    });
  }
}

async function importFaqs(ctx: ImportContext): Promise<void> {
  log('▸ 美迪问答');
  for (const [index, item] of faqs.entries()) {
    await upsert(ctx.client, {
      plural: 'faqs',
      label: '美迪问答',
      uniqueField: 'faqId',
      uniqueValue: item.id,
      data: {
        faqId: item.id,
        question: item.question,
        answer: item.answer,
        defaultOpen: item.defaultOpen,
        order: index + 1,
      },
    });
  }
}

/**
 * 知识百科列表页卡片的展示信息（顺序、图标、分类标签、摘要）。
 * 这些内容原先硬编码在 src/pages/knowledge/index.astro 中，导入后由后台维护，
 * 运营可以直接在后台调整顺序与文案，无需改代码。
 */
const GUIDE_LIST_META: Record<string, { sort: number; emoji: string; categoryLabel: string; summary: string }> = {
  'guide-newmedia': {
    sort: 1,
    emoji: '📱',
    categoryLabel: '转行攻略 · 新媒体运营',
    summary:
      '从月薪3千到月薪过万的完整路径：岗位认知、技能清单、作品集准备、求职面试、入职后前90天怎么干，一篇讲透。',
  },
  'guide-geo': {
    sort: 2,
    emoji: '🤖',
    categoryLabel: 'AI 与 AIGC · 获客',
    summary:
      '当用户开始在豆包、DeepSeek、ChatGPT里问"哪家培训机构好"，SEO正在被GEO取代。企业如何让AI推荐你？个人如何抓住GEO岗位红利？',
  },
  'guide-shortvideo': {
    sort: 3,
    emoji: '🎬',
    categoryLabel: '短视频 · 短剧 · 就业前景',
    summary:
      '短视频用户超10亿、短剧市场规模破500亿，剪辑、运营、投流、编剧岗位缺口持续扩大。普通人入行还有机会吗？薪资多少？',
  },
};

async function importGuides(ctx: ImportContext): Promise<void> {
  log('▸ 知识百科（长文，正文为 HTML）');
  for (const [index, guide] of guides.entries()) {
    const htmlPath = path.join(SEED_DIR, 'knowledge', `${guide.slug}.html`);
    const content = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf8') : '';
    if (!content) log(`  ! 未找到正文文件：${guide.slug}.html`);

    const listMeta = GUIDE_LIST_META[guide.slug];

    await upsert(ctx.client, {
      plural: 'guides',
      label: '知识百科',
      uniqueField: 'slug',
      uniqueValue: guide.slug,
      data: {
        slug: guide.slug,
        title: guide.title,
        subtitle: guide.subtitle,
        emoji: listMeta?.emoji ?? '📘',
        categoryLabel: listMeta?.categoryLabel ?? '',
        summary: listMeta?.summary ?? guide.subtitle,
        content,
        seo: { ...guide.seo },
        order: listMeta?.sort ?? index + 1,
      },
    });
  }
}

async function importSiteConfig(ctx: ImportContext): Promise<void> {
  log('▸ 站点设置');
  const logoId = await ctx.media.ensure(site.logo, site.logoAlt);
  const ogImageId = await ctx.media.ensure(site.ogImage, site.name);
  const wechatQrId = await ctx.media.ensure('/images/wechat_qrcode.png', '美迪时代教育课程顾问微信二维码');

  await upsertSingle(ctx.client, 'site-config', '站点设置', {
    name: site.name,
    legalName: site.legalName,
    slogan: site.slogan,
    baseUrl: site.url,
    telephone: site.telephone,
    telephoneHref: site.telephoneHref,
    serviceHours: site.serviceHours,
    foundedYear: site.foundedYear,
    cities: site.cities,
    campusCount: site.campusCount,
    campusDisplay: site.campusDisplay,
    address: site.address,
    icp: site.icp,
    icpUrl: site.icpUrl,
    logo: logoId,
    logoPath: site.logo,
    logoAlt: site.logoAlt,
    ogImage: ogImageId,
    ogImagePath: site.ogImage,
    ogImageWidth: site.ogImageWidth,
    ogImageHeight: site.ogImageHeight,
    description: site.description,
    generator: site.generator,
    author: site.author,
    copyright: site.copyright,
    knowsAbout: site.knowsAbout,
    wechatQr: wechatQrId,
    wechatQrPath: '/images/wechat_qrcode.png',
    wechatQrAlt: '美迪时代教育课程顾问微信二维码',
    wechatPhone: '18922386984',
    wechatPhoneLabel: '手机 / 微信同号（支持一键拨打与微信搜索）',
    wechatScanTip: '微信扫一扫二维码，一对一专属课程顾问在线解答',
    llmsIntro,
    llmsFacts,
    llmsCitation,
  });
}

async function importNavigation(ctx: ImportContext): Promise<void> {
  log('▸ 导航与页脚');
  await upsertSingle(ctx.client, 'navigation', '导航与页脚', {
    nav: nav.map((link) => ({ label: link.label, href: link.href, external: false })),
    footerGroups: footerGroups.map((group) => ({
      title: group.title,
      links: group.links.map((link) => ({ label: link.label, href: link.href, external: false })),
    })),
    footerIntro,
    footerContacts,
    footerBottom,
  });
}

async function importPageSeo(ctx: ImportContext): Promise<void> {
  log('▸ 页面 SEO');
  await upsertSingle(ctx.client, 'page-seo', '页面 SEO', {
    entries: Object.entries(pageSeo).map(([route, seo]) => ({
      route,
      seo: { title: seo.title, description: seo.description, keywords: seo.keywords ?? '' },
    })),
  });
}

async function importSchemaData(ctx: ImportContext): Promise<void> {
  log('▸ 结构化数据');
  const from = 'https://www.chinamede.com';
  const base = site.url.replace(/\/+$/, '');
  const pageNodes: Record<string, unknown[]> = {};
  for (const [route, nodes] of Object.entries(pageSchema)) {
    pageNodes[route] = rewriteBaseUrl(nodes, from, base);
  }

  await upsertSingle(ctx.client, 'schema-data', '结构化数据', {
    siteNodes: rewriteBaseUrl([organizationSchema, websiteSchema], from, base),
    pageNodes,
  });
}

/* ------------------------------------------------------------------ */
/* 知识库初始素材                                                      */
/* ------------------------------------------------------------------ */

/**
 * 从现有结构化内容派生第一批知识条目。
 * 这些条目是 AI 生成文章的事实来源，全部有原文可追溯（站点介绍、课程信息、官方问答），
 * 运营可在后台继续补充与修正，脚本按 slug 幂等更新。
 */
function buildKbEntries(): Row[] {
  const today = new Date().toISOString().slice(0, 10);
  const entries: Row[] = [];

  entries.push({
    title: '美迪时代教育机构概况',
    slug: 'kb-institution-overview',
    aliases: ['美迪时代教育', '广州美迪教育科技有限公司', '美迪简介', '机构资质'],
    category: 'other',
    topic: '机构主体、规模、校区布局与教学模式等基础事实',
    points: [
      { text: `机构全称：${site.legalName}，品牌名 ${site.name}，${site.foundedYear} 年创立。` },
      { text: `校区布局：${site.campusDisplay}，覆盖${site.cities.join('、')}。` },
      { text: '教学模式：线下直营校区小班面授 + 线上录播回放，三师制（班主任 + 授课老师 + 就业老师）。' },
      { text: '就业服务：长期班标配 22 天带薪岗位实习，提供简历诊断、模拟面试、企业内推与五年就业推荐。' },
      { text: `培训方向：${site.knowsAbout.join('、')}。` },
    ],
    facts: [
      { label: '成立年份', value: site.foundedYear, year: site.foundedYear, source: '官网品牌介绍' },
      { label: '直营校区数量', value: `${site.campusCount} 个`, year: '2026', source: '官网联系我们页' },
      { label: '覆盖城市数', value: `${site.cities.length} 座（${site.cities.join('、')}）`, year: '2026', source: '官网联系我们页' },
      { label: '全国服务热线', value: site.telephone, year: '2026', source: '官网页脚' },
      { label: '服务时间', value: site.serviceHours, year: '2026', source: '官网页脚' },
    ],
    qa: [
      { question: '美迪时代教育是什么机构？', answer: site.description },
      {
        question: '美迪时代教育有哪些校区？',
        answer: `${site.campusDisplay}，覆盖${site.cities.join('、')}，学员可就近选择校区学习。具体地址可拨打 ${site.telephone} 咨询。`,
      },
    ],
    citation: `美迪时代教育（${site.legalName}）${site.foundedYear} 年创立，专注成人职业技能就业培训，在${site.cities.join('、')} ${site.cities.length} 座城市开设 ${site.campusCount} 个直营校区。`,
    sources: [{ label: '美迪时代教育官网', url: `${site.url}/brand/`, note: '品牌介绍页' }],
    tags: ['机构介绍', '校区', '教学模式', '就业服务'],
    credibility: '数据来自官网页面，口径以官网当期公示为准。',
    lastVerified: today,
  });

  for (const [index, item] of faqs.entries()) {
    entries.push({
      title: `官方问答：${item.question}`,
      slug: `kb-faq-${item.id}`,
      aliases: [item.question],
      category: 'faq',
      topic: item.question,
      points: [{ text: item.answer.replace(/<[^>]+>/g, '') }],
      qa: [{ question: item.question, answer: item.answer }],
      citation: item.answer,
      sources: [{ label: '美迪时代教育官网 · 美迪问答', url: `${site.url}/faq/`, note: `第 ${index + 1} 条` }],
      tags: ['官方问答', 'faq'],
      credibility: '官方口径，直接引用官网问答原文。',
      lastVerified: today,
    });
  }

  for (const course of courses) {
    const stageHours = course.curriculum
      .flatMap((stage) => stage.modules)
      .map((module) => `${module.name} ${module.hour}`)
      .join('；');

    entries.push({
      title: `${course.code} ${course.title}课程信息`,
      slug: `kb-course-${course.slug}`,
      aliases: [course.title, course.code, course.mainTitle],
      category: 'course',
      topic: `${course.subtitle}｜${course.badge}`,
      points: [
        { text: course.descHighlight.replace(/<[^>]+>/g, '') },
        ...course.stats.map((stat) => ({ text: stat.text })),
        { text: `课程结构：${course.curriculum.map((stage) => `${stage.title}（${stage.modules.length} 个模块）`).join('、')}。` },
        { text: `可从事岗位：${course.outcomes.jobs.join('、')}。` },
        { text: `适合人群：${course.outcomes.targets.join('、')}。` },
        { text: `实训安排：${course.practice.title}——${course.practice.text}` },
        { text: `模块与课时：${stageHours}。` },
      ],
      facts: [
        { label: `${course.code} 课程价格`, value: `${course.price.currency}${course.price.amount}`, year: '2026', source: '官网课程详情页' },
        { label: `${course.code} 优惠说明`, value: course.price.save, year: '2026', source: '官网课程详情页' },
        { label: `${course.code} 原价对照`, value: course.price.origin, year: '2026', source: '官网课程详情页' },
      ],
      qa: course.faq.map((item) => ({ question: item.question, answer: item.answer })),
      citation: `${course.code} ${course.title}：${course.subtitle}，学费 ${course.price.currency}${course.price.amount}。`,
      sources: [{ label: `官网课程详情页 · ${course.code}`, url: `${site.url}/courses/${course.slug}/`, note: '课程信息与价格' }],
      relatedCourses: course.slug,
      tags: [course.code, '课程信息', course.category, ...course.tags],
      credibility: '课程信息与价格为官网当期公示内容，价格调整时须同步更新。',
      lastVerified: today,
    });
  }

  entries.push({
    title: '学费、退费与就业保障口径',
    slug: 'kb-pricing-refund-policy',
    aliases: ['学费多少', '能不能退费', '就业保障', '包就业'],
    category: 'policy',
    topic: '价格区间、退费规则与就业服务边界（合规话术基准）',
    points: [
      { text: 'AI 长期班价格区间 12,800 - 15,800 元，全能班（N4）22,800 元；跨境短期班 10,800 - 13,800 元。' },
      { text: '严格执行合同约定的分段退费公式：开课前可全额退费；开课后按未消耗课时 + 已发生服务成本退费，审批不超过 15 个工作日。' },
      { text: '不承诺“包就业”“100% 安排上岗”，以合同化就业服务清单替代：简历诊断 ≥2 次、模拟面试 ≥2 轮、企业内推、作品集指导、结业后五年内不限次就业推荐。' },
      { text: '禁止使用“包就业”“保底月薪”“月入过万”等违规话术。' },
    ],
    facts: [
      { label: 'AI 长期班学费区间', value: '12,800 - 15,800 元', year: '2026', source: '官网美迪问答' },
      { label: '跨境短期班学费区间', value: '10,800 - 13,800 元', year: '2026', source: '官网美迪问答' },
      { label: '退费审批时长', value: '不超过 15 个工作日', year: '2026', source: '官网美迪问答' },
    ],
    qa: [
      { question: '美迪的学费是多少？', answer: 'AI 长期班价格区间为 12,800 - 15,800 元（N4 全能班 22,800 元），跨境短期班为 10,800 - 13,800 元，官网明码标价，费用包含课程、教材、实训、实习与就业指导等核心服务。' },
      { question: '中途不想学了可以退费吗？', answer: '可以。开课前可全额退费；开课后按未消耗课时与已发生服务成本分段退费，审批不超过 15 个工作日，退费流程有 5 个节点短信同步。' },
    ],
    citation: '美迪时代教育官网明码标价，AI 长期班 12,800 - 15,800 元、跨境短期班 10,800 - 13,800 元，退费按合同分段公式执行，审批不超过 15 个工作日。',
    sources: [{ label: '官网美迪问答', url: `${site.url}/faq/`, note: '学费与退费政策' }],
    tags: ['学费', '退费', '合规', '就业保障'],
    credibility: '价格与政策以合同与官网当期公示为准，撰写文章时不得夸大。',
    lastVerified: today,
  });

  return entries;
}

/**
 * 关键词库与提示词库的起步数据。
 *
 * 与其他集合的处理刻意不同：**已存在就跳过，不覆盖**。
 * 因为这两类数据后面是由人和系统在用的——
 * 关键词的 usageCount / lastUsedAt 由生成器回写，决定「优先挑冷门词」的顺序，
 * 被重新导入清零会破坏排序依据；提示词正文运营很可能已经改过。
 * 这里只负责「第一次打开后台就有东西可看」，之后交给人工维护。
 */
async function importKeywords(ctx: ImportContext): Promise<void> {
  log('▸ 关键词库');

  let added = 0;
  for (const item of keywords) {
    const existing = await findExisting(ctx.client, 'keywords', 'word', item.word);
    if (existing) continue;

    await upsert(ctx.client, {
      plural: 'keywords',
      label: '关键词',
      draftAndPublish: false,
      data: {
        word: item.word,
        category: item.category,
        enabled: true,
        // 不传 usageCount / lastUsedAt：新建时取 schema 默认值，也不覆盖已有值
        note: item.note ?? '',
      },
    });
    added += 1;
  }

  log(`  ✓ 关键词库已就绪（本次新增 ${added} 个，共 ${keywords.length} 个示范词）`);
}

async function importPromptTemplates(ctx: ImportContext): Promise<void> {
  log('▸ 提示词库');

  let added = 0;
  for (const item of promptTemplates) {
    const existing = await findExisting(ctx.client, 'prompt-templates', 'title', item.title);
    if (existing) continue;

    await upsert(ctx.client, {
      plural: 'prompt-templates',
      label: '提示词',
      draftAndPublish: false,
      data: {
        title: item.title,
        description: item.description,
        content: item.content,
        enabled: item.enabled,
      },
    });
    added += 1;
  }

  log(`  ✓ 提示词库已就绪（本次新增 ${added} 条，共 ${promptTemplates.length} 条示范）`);
}

async function importKbEntries(ctx: ImportContext): Promise<void> {
  log('▸ 知识库初始素材');
  for (const entry of buildKbEntries()) {
    const { relatedCourses, ...rest } = entry as Row & { relatedCourses?: string };
    const relatedId = relatedCourses ? ctx.courseIds.get(relatedCourses) : undefined;

    await upsert(ctx.client, {
      plural: 'kb-entries',
      label: '知识条目',
      uniqueField: 'slug',
      uniqueValue: entry.slug as string,
      data: {
        ...rest,
        ...(relatedId ? { relatedCourses: { connect: [{ documentId: relatedId }] } } : {}),
      },
    });
  }
}

/* ------------------------------------------------------------------ */
/* 主流程                                                              */
/* ------------------------------------------------------------------ */

function printReport(): void {
  log('');
  log('导入统计（类型：新建 / 更新）');
  const width = Math.max(...Object.keys(stats).map((key) => key.length), 6);
  for (const [label, value] of Object.entries(stats)) {
    log(`  ${label.padEnd(width + 2, '　')}${value.created} / ${value.updated}`);
  }
  if (failureCount > 0) {
    log('');
    log(`有 ${failureCount} 处导入失败，请检查上方日志。`);
  }
}

async function main(): Promise<void> {
  loadDotEnv();

  const baseUrl = envString('STRAPI_URL', 'http://localhost:1337').replace(/\/+$/, '');
  const token = envString('STRAPI_WRITE_TOKEN', '') || envString('STRAPI_READONLY_TOKEN', '');

  if (!token) {
    console.error('未配置 STRAPI_WRITE_TOKEN，请先执行 npm run init:tokens。');
    process.exitCode = 1;
    return;
  }

  const client = new StrapiClient({ baseUrl, token, timeoutMs: 120000 });
  if (!(await client.ping())) {
    console.error(`无法连接 Strapi（${baseUrl}），请先启动 npm run develop。`);
    process.exitCode = 1;
    return;
  }

  log(`开始导入到 ${baseUrl}`);
  if (SKIP_MEDIA) log('（--skip-media：跳过媒体上传）');
  if (!KB_ENABLED) log('（--no-kb：跳过知识库素材）');
  log('');

  const media = new MediaLibrary(client, token);
  await media.warmUp();

  const ctx: ImportContext = { client, media, courseIds: new Map() };

  const categoryIds = await importCourseCategories(ctx);
  await importCourses(ctx, categoryIds);
  await importTeacherLevels(ctx);
  await importTeachers(ctx);
  await importShowcaseSections(ctx);
  await importCampuses(ctx);
  await importNewsItems(ctx);
  await importFaqs(ctx);
  await importGuides(ctx);
  await importSiteConfig(ctx);
  await importNavigation(ctx);
  await importPageSeo(ctx);
  await importSchemaData(ctx);
  // 内容生产的起步资产：关键词、提示词、知识库素材
  await importKeywords(ctx);
  await importPromptTemplates(ctx);
  if (KB_ENABLED) await importKbEntries(ctx);

  printReport();

  if (failureCount > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error('');
  console.error(`导入失败：${(error as Error).message}`);
  process.exitCode = 1;
});
