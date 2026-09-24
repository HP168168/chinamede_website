// 官网构建期取数层（唯一通信入口）
//
// 设计要点：
// 1. 一个内容类型一次构建只请求一次（模块级 Promise 缓存），详情页 getStaticPaths 复用列表缓存；
// 2. STRAPI_URL 未配置或请求失败时自动降级读取 src/data/__snapshot__ 快照，保证离线/CI 均可构建；
// 3. 页面只消费归一化后的领域对象，字段形状与迁移前的 src/data/*.ts 保持一致，页面改造面最小；
// 4. 媒体统一使用站内路径（fallbackPath），图片由 scripts/sync-media.mjs 在构建前同步，避免 CMS 不可用时 404。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sources from './strapi-sources.json';
import type {
  Article,
  ArticleAnswerBlock,
  ArticleFaq,
  ArticleKeyFact,
  ArticleSeo,
  ArticleSource,
  Campus,
  Course,
  CourseCategory,
  CourseCover,
  FaqItem,
  FooterGroup,
  Guide,
  NavLink,
  NavigationData,
  NewsItem,
  PageSeo,
  SchemaData,
  ShowcaseSection,
  SiteConfig,
  Teacher,
  TeacherLevel,
} from '../types/content';

/* ------------------------------ 环境与快照 ------------------------------ */

type SourceKind = 'single' | 'collection';
interface SourceSpec {
  kind: SourceKind;
  path: string;
  query: string;
}

const SOURCES = sources as unknown as Record<string, SourceSpec | string>;

// astro build 会把本模块打包进 dist/.prerender/chunks，此时 import.meta.url 指向产物目录，
// 因此优先按运行目录（项目根）定位快照，源码直跑（脚本自测）时再回退到模块相对路径
const SNAPSHOT_DIR = (() => {
  const candidates = [
    path.resolve(process.cwd(), 'src', 'data', '__snapshot__'),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', '__snapshot__'),
  ];
  return candidates.find((dir) => fs.existsSync(dir)) ?? candidates[0];
})();

function readEnv(name: string): string {
  // Astro/Vite 会把服务端变量注入 import.meta.env；纯 Node 环境（脚本自测）下该对象不存在
  const meta = (import.meta as unknown as { env?: Record<string, unknown> }).env ?? {};
  const fromMeta = meta[name];
  if (typeof fromMeta === 'string' && fromMeta.trim()) return fromMeta.trim();

  const fromProcess = process.env[name];
  return typeof fromProcess === 'string' ? fromProcess.trim() : '';
}

const STRAPI_URL = readEnv('STRAPI_URL').replace(/\/+$/, '');
const STRAPI_TOKEN = readEnv('STRAPI_TOKEN') || readEnv('STRAPI_READONLY_TOKEN');

/** 降级提示只打印一次，避免刷屏 */
const warned = new Set<string>();
function warnOnce(key: string, message: string): void {
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(message);
}

function readSnapshot(key: string): unknown | undefined {
  const file = path.join(SNAPSHOT_DIR, `${key}.json`);
  if (!fs.existsSync(file)) return undefined;
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as { data?: unknown };
    // 快照统一存 Strapi 原始响应，便于与 API 走同一套归一化逻辑
    return parsed?.data ?? parsed;
  } catch (error) {
    warnOnce(`snap-${key}`, `快照解析失败（${key}）：${(error as Error).message}`);
    return undefined;
  }
}

/**
 * 取原始数据：优先 CMS，失败或未配置时读快照。
 * 返回值形状与 Strapi REST 响应中的 data 字段一致。
 */
async function loadRaw(key: string): Promise<unknown> {
  const spec = SOURCES[key];
  if (!spec || typeof spec === 'string') throw new Error(`未定义的取数来源：${key}`);

  if (STRAPI_URL) {
    const search = new URLSearchParams(spec.kind === 'collection' ? `status=published&${spec.query}` : spec.query);
    const url = `${STRAPI_URL}/api/${spec.path}${search.toString() ? `?${search.toString()}` : ''}`;

    try {
      const response = await fetch(url, {
        headers: STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {},
      });

      if (response.ok) {
        const body = (await response.json()) as { data?: unknown };
        if (body?.data !== undefined && body.data !== null) return body.data;
        warnOnce(`empty-${key}`, `CMS 中「${spec.path}」暂无已发布内容，改用快照`);
      } else {
        warnOnce(`http-${key}`, `拉取「${spec.path}」失败（HTTP ${response.status}），改用快照`);
      }
    } catch (error) {
      warnOnce(`net-${key}`, `连接 CMS 失败（${(error as Error).message}），改用快照`);
    }
  } else {
    warnOnce('no-cms', '未配置 STRAPI_URL，官网使用本地快照构建（如需实时内容请配置 STRAPI_URL 与 STRAPI_TOKEN）');
  }

  const snapshot = readSnapshot(key);
  if (snapshot !== undefined) return snapshot;

  throw new Error(
    `无法获取内容「${key}」：CMS 未配置或不可用，且缺少快照 src/data/__snapshot__/${key}.json。请先运行 npm run cms:snapshot 生成快照。`,
  );
}

/** 模块级缓存：同一个内容类型在一次构建中只请求一次 */
const cache = new Map<string, Promise<unknown>>();
function cached<T>(key: string, loader: () => Promise<T>): Promise<T> {
  if (!cache.has(key)) cache.set(key, loader());
  return cache.get(key) as Promise<T>;
}

/* -------------------------------- 值转换 -------------------------------- */

type Row = Record<string, unknown>;

const isRow = (value: unknown): value is Row => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const rows = (value: unknown): Row[] => (Array.isArray(value) ? value.filter(isRow) : []);

function str(value: unknown, fallback = ''): string {
  if (typeof value === 'string' && value.trim()) return value;
  if (typeof value === 'number') return String(value);
  return fallback;
}

function num(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return fallback;
}

function bool(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

/**
 * 可重复字符串字段在 REST 层是 JSON 字符串（如 '["a","b"]'），
 * 也兼容后台直接填「顿号分隔」的写法。
 */
export function parseStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
  if (typeof value !== 'string' || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    // 非 JSON：按分隔符拆分
  }

  return value
    .split(/[,，、\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/** ISO 时间 → YYYY-MM-DD */
export function formatDate(value: unknown): string {
  const text = str(value);
  if (!text) return '';
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

/** 站内相对路径 → 绝对地址（canonical / OG / JSON-LD / llms.txt 共用） */
export function absoluteUrl(pathname: string, site: Pick<SiteConfig, 'url'>): string {
  if (/^https?:\/\//i.test(pathname)) return pathname;
  const base = site.url.replace(/\/+$/, '');
  const suffix = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${base}${suffix}`;
}

/** 师资形象照的站内目录（与 scripts/sync-media.mjs 的同步目标保持一致） */
const TEACHER_PHOTO_DIR = '/images/teachers/';

/** 未上传形象照时的默认占位头像 */
export const DEFAULT_TEACHER_PHOTO = `${TEACHER_PHOTO_DIR}default-avatar.svg`;

/**
 * 后台上传的媒体 → 站内路径。
 * 构建期 scripts/sync-media.mjs 会把媒体文件下载到 dir 下的同名文件，
 * 两边共用「文件名取自媒体 URL」这一套规则：改这里要同步改那个脚本。
 */
function mediaToLocalPath(value: unknown, dir: string): string {
  const url = str(value);
  const fileName = url.split('?')[0].split('#')[0].split('/').filter(Boolean).pop();
  return fileName ? `${dir}${fileName}` : '';
}

/** 媒体字段 → 站内路径：统一走 fallbackPath，保证站点自包含 */
function coverFrom(value: unknown, fallbackSrc: string, fallbackAlt: string): CourseCover {
  const cover = isRow(value) ? value : {};
  return {
    src: str(cover.fallbackPath, fallbackSrc),
    alt: str(cover.alt, fallbackAlt),
    width: num(cover.width, 1200),
    height: num(cover.height, 675),
  };
}

/* ------------------------------ 站点设置 ------------------------------ */

/**
 * 站点设置的兜底默认值：仅当后台某个字段留空时使用，
 * 取值与迁移前 src/data/site.ts 一致，保证后台半填充状态下站点仍可正常构建。
 */
const SITE_DEFAULTS: SiteConfig = {
  name: '美迪时代教育',
  legalName: '广州美迪教育科技有限公司',
  slogan: '让职业就业更简单',
  url: 'https://www.chinamede.com',
  telephone: '400-800-4459',
  telephoneHref: 'tel:4008004459',
  serviceHours: '8:00 - 23:00',
  foundedYear: '2011',
  cities: ['广州', '深圳', '佛山', '东莞', '中山', '江门'],
  campusCount: 13,
  campusDisplay: '6城13个直营校区',
  address: '广州市越秀区三元里大道217号民生商业大厦3—4楼',
  icp: '粤ICP备15034320号-7',
  icpUrl: 'https://beian.miit.gov.cn/',
  logo: '/images/logo_3.png',
  logoAlt: '美迪时代教育',
  ogImage: '/images/og-cover.png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  description:
    '美迪时代教育隶属于广州美迪教育科技有限公司，2011 年创立，专注成人职业技能就业培训，在广州、深圳、佛山、东莞、中山、江门 6 大城市设有 13 个直营校区。',
  generator: 'MedE Education Website',
  author: '美迪时代教育',
  copyright: '© 2026 美迪时代教育 版权所有',
  knowsAbout: [],
  sameAs: [],
  wechatQr: '/images/wechat_qrcode.png',
  wechatQrAlt: '美迪时代教育课程顾问微信二维码',
  wechatPhone: '18922386984',
  wechatPhoneLabel: '手机 / 微信同号（支持一键拨打与微信搜索）',
  wechatScanTip: '微信扫一扫二维码，一对一专属课程顾问在线解答',
  llmsIntro: '',
  llmsFacts: [],
  llmsCitation: '',
};

export function getSiteConfig(): Promise<SiteConfig> {
  return cached('siteConfig', async () => {
    const value = await loadRaw('siteConfig');
    const raw: Row = isRow(value) ? value : {};

    return {
      name: str(raw.name, SITE_DEFAULTS.name),
      legalName: str(raw.legalName, SITE_DEFAULTS.legalName),
      slogan: str(raw.slogan, SITE_DEFAULTS.slogan),
      url: str(raw.baseUrl, SITE_DEFAULTS.url).replace(/\/+$/, ''),
      telephone: str(raw.telephone, SITE_DEFAULTS.telephone),
      telephoneHref: str(raw.telephoneHref, SITE_DEFAULTS.telephoneHref),
      serviceHours: str(raw.serviceHours, SITE_DEFAULTS.serviceHours),
      foundedYear: str(raw.foundedYear, SITE_DEFAULTS.foundedYear),
      cities: parseStringList(raw.cities).length ? parseStringList(raw.cities) : SITE_DEFAULTS.cities,
      campusCount: num(raw.campusCount, SITE_DEFAULTS.campusCount),
      campusDisplay: str(raw.campusDisplay, SITE_DEFAULTS.campusDisplay),
      address: str(raw.address, SITE_DEFAULTS.address),
      icp: str(raw.icp, SITE_DEFAULTS.icp),
      icpUrl: str(raw.icpUrl, SITE_DEFAULTS.icpUrl),
      logo: str(raw.logoPath, SITE_DEFAULTS.logo),
      logoAlt: str(raw.logoAlt, SITE_DEFAULTS.logoAlt),
      ogImage: str(raw.ogImagePath, SITE_DEFAULTS.ogImage),
      ogImageWidth: num(raw.ogImageWidth, SITE_DEFAULTS.ogImageWidth),
      ogImageHeight: num(raw.ogImageHeight, SITE_DEFAULTS.ogImageHeight),
      description: str(raw.description, SITE_DEFAULTS.description),
      generator: str(raw.generator, SITE_DEFAULTS.generator),
      author: str(raw.author, SITE_DEFAULTS.author),
      copyright: str(raw.copyright, SITE_DEFAULTS.copyright),
      knowsAbout: parseStringList(raw.knowsAbout),
      sameAs: parseStringList(raw.sameAs),
      wechatQr: str(raw.wechatQrPath, SITE_DEFAULTS.wechatQr),
      wechatQrAlt: str(raw.wechatQrAlt, SITE_DEFAULTS.wechatQrAlt),
      wechatPhone: str(raw.wechatPhone, SITE_DEFAULTS.wechatPhone),
      wechatPhoneLabel: str(raw.wechatPhoneLabel, SITE_DEFAULTS.wechatPhoneLabel),
      wechatScanTip: str(raw.wechatScanTip, SITE_DEFAULTS.wechatScanTip),
      llmsIntro: str(raw.llmsIntro, SITE_DEFAULTS.llmsIntro),
      llmsFacts: parseStringList(raw.llmsFacts),
      llmsCitation: str(raw.llmsCitation, SITE_DEFAULTS.llmsCitation),
    };
  });
}

/* ------------------------------ 导航与页脚 ------------------------------ */

const NAV_DEFAULTS: NavigationData = {
  nav: [
    { label: '首页', href: '/' },
    { label: '课程中心', href: '/courses/' },
  ],
  footerGroups: [],
  footerIntro: '',
  footerContacts: [],
  footerBottom: [],
};

function toLinks(value: unknown): NavLink[] {
  return rows(value)
    .map((link) => ({ label: str(link.label), href: str(link.href), external: bool(link.external) }))
    .filter((link) => link.label && link.href);
}

export function getNavigation(): Promise<NavigationData> {
  return cached('navigation', async () => {
    const rawValue = await loadRaw('navigation');
    const raw = isRow(rawValue) ? rawValue : {};

    const nav = toLinks(raw.nav);
    const footerGroups: FooterGroup[] = rows(raw.footerGroups)
      .map((group) => ({ title: str(group.title), links: toLinks(group.links) }))
      .filter((group) => group.title && group.links.length);

    return {
      nav: nav.length ? nav : NAV_DEFAULTS.nav,
      footerGroups,
      footerIntro: str(raw.footerIntro),
      footerContacts: parseStringList(raw.footerContacts),
      footerBottom: parseStringList(raw.footerBottom),
    };
  });
}

/* ------------------------------ 页面 SEO ------------------------------- */

export function getPageSeo(): Promise<Record<string, PageSeo>> {
  return cached('pageSeo', async () => {
    const rawValue = await loadRaw('pageSeo');
    const raw = isRow(rawValue) ? rawValue : {};

    const result: Record<string, PageSeo> = {};
    rows(raw.entries).forEach((entry) => {
      const route = str(entry.route);
      const seo = isRow(entry.seo) ? entry.seo : {};
      if (!route) return;
      result[route] = {
        title: str(seo.title),
        description: str(seo.description),
        keywords: str(seo.keywords),
        canonical: str(seo.canonical) || undefined,
      };
    });
    return result;
  });
}

/**
 * 按路由取页面 SEO，页面统一用它替换原先的 pageSeo['/x/'] 写法。
 * 路由缺失时给出站点级兜底值并提示一次，避免因为漏配一个页面就中断整站构建。
 */
export async function getSeoFor(route: string): Promise<PageSeo> {
  const all = await getPageSeo();
  const entry = all[route];

  if (!entry || !entry.title) {
    warnOnce(`seo-${route}`, `后台「页面 SEO」缺少路由 ${route}，已使用站点默认值兜底`);
    const site = await getSiteConfig();
    return { title: site.name, description: site.description };
  }

  return entry;
}

/* ------------------------------ 结构化数据 ------------------------------ */

export function getSchemaData(): Promise<SchemaData> {
  return cached('schemaData', async () => {
    const rawValue = await loadRaw('schemaData');
    const raw = isRow(rawValue) ? rawValue : {};

    const pageNodes: Record<string, Record<string, unknown>[]> = {};
    if (isRow(raw.pageNodes)) {
      Object.entries(raw.pageNodes).forEach(([route, nodes]) => {
        if (Array.isArray(nodes)) pageNodes[route] = nodes.filter(isRow);
      });
    }

    return {
      siteNodes: Array.isArray(raw.siteNodes) ? raw.siteNodes.filter(isRow) : [],
      pageNodes,
    };
  });
}

/* -------------------------------- 课程 -------------------------------- */

export function getCourseCategories(): Promise<CourseCategory[]> {
  return cached('courseCategories', async () =>
    rows(await loadRaw('courseCategories')).map((row) => ({
      code: str(row.code),
      name: str(row.name),
      order: num(row.order),
      description: str(row.description),
    })),
  );
}

export function getCourses(): Promise<Course[]> {
  return cached('courses', async () => {
    return rows(await loadRaw('courses')).map((row) => {
      const category = isRow(row.category) ? row.category : {};
      // 课程内容类型没有 slug 字段，路由标识是 code（如 n1-ai-newmedia）；
      // 后台将来若补上 slug 字段，则以 slug 为准
      const slug = str(row.slug, str(row.code));
      const price = isRow(row.price) ? row.price : {};
      const practice = isRow(row.practice) ? row.practice : {};
      const outcomes = isRow(row.outcomes) ? row.outcomes : {};
      const seo = isRow(row.seo) ? row.seo : {};

      return {
        slug,
        order: num(row.order),
        code: str(row.code),
        category: str(category.code, str(row.categoryCode)),
        title: str(row.title),
        subtitle: str(row.subtitle),
        mainTitle: str(row.mainTitle, str(row.title)),
        cover: coverFrom(row.cover, '/images/og-cover.png', str(row.title)),
        badge: str(row.badge),
        metaTags: rows(row.metaTags).map((tag) => ({ text: str(tag.text), cls: str(tag.cls) })),
        price: {
          amount: str(price.amount),
          currency: str(price.currency, '¥'),
          origin: str(price.origin),
          save: str(price.save),
        },
        stats: rows(row.stats).map((stat) => ({ text: str(stat.text), highlight: bool(stat.highlight) })),
        descHighlight: str(row.descHighlight),
        curriculum: rows(row.curriculum).map((stage) => ({
          badge: str(stage.badge),
          title: str(stage.title),
          subtitle: str(stage.subtitle),
          modules: rows(stage.modules).map((module) => ({
            name: str(module.name),
            hour: str(module.hour),
            highlight: bool(module.highlight),
          })),
        })),
        practice: { title: str(practice.title), text: str(practice.text) },
        outcomes: { jobs: parseStringList(outcomes.jobs), targets: parseStringList(outcomes.targets) },
        tags: parseStringList(row.tags),
        faq: rows(row.faq).map((item, index) => ({
          id: `faq-${index + 1}`,
          question: str(item.question),
          answer: str(item.answer),
        })),
        seo: {
          title: str(seo.title, str(row.title)),
          description: str(seo.description),
          keywords: str(seo.keywords),
        },
      } satisfies Course;
    });
  });
}

/* -------------------------------- 师资 -------------------------------- */

export function getTeacherLevels(): Promise<TeacherLevel[]> {
  return cached('teacherLevels', async () =>
    rows(await loadRaw('teacherLevels')).map((row) => ({
      // 后台这个字段叫 levelCode（不是 code）：前端统一映射为内部字段 code
      code: str(row.levelCode, str(row.code)),
      gradient: str(row.gradient),
      name: str(row.name),
      desc: str(row.desc),
      meta: parseStringList(row.meta),
      order: num(row.order),
    })),
  );
}

export function getTeachers(): Promise<Teacher[]> {
  return cached('teachers', async () => {
    const list = rows(await loadRaw('teachers')).map((row) => {
      // 头像优先级：后台上传的形象照 → avatar 里填的图片地址 → 默认占位头像。
      // avatar 历史上存的是 emoji（不能当图片用），因此不再直接渲染，统一由占位图兜底。
      const avatar = str(row.avatar);
      const uploaded = mediaToLocalPath(isRow(row.photo) ? row.photo.url : '', TEACHER_PHOTO_DIR);
      // 所属层级以「师资 → 师资层级」关联关系为准，历史字符串字段只作迁移兜底
      const level = isRow(row.level) ? row.level : {};

      return {
        avatar,
        photo: uploaded || (/^(?:\/|https?:\/\/)/i.test(avatar) ? avatar : DEFAULT_TEACHER_PHOTO),
        name: str(row.name),
        title: str(row.title),
        desc: str(row.desc),
        levelCode: str(level.levelCode, str(row.levelCode)),
        levelName: str(level.name),
        order: num(row.order),
      } satisfies Teacher;
    });

    // REST 已按 order 升序返回，这里再兜一次排序，
    // 保证后台没填 order（默认 0）时渲染顺序也稳定，不与同名讲师穿插
    return list.sort((a, b) => a.order - b.order);
  });
}

/**
 * 讲师按师资层级分组：分组顺序取后台「师资层级」的 order，
 * 组内保持后台 order；未在后台标记层级（levelCode 为空或层级不存在）的讲师
 * 归入末位的一组（level 为 undefined），页面可据此渲染兜底标题。
 *
 * 与 groupCampusesByCity 同套路：讲师只存层级编码字符串，join 放在前端做，
 * 不必在后台引入 relation，也不影响已发布数据。
 */
export function groupTeachersByLevel(
  teachers: Teacher[],
  levels: TeacherLevel[],
): { level?: TeacherLevel; teachers: Teacher[] }[] {
  const index = new Map(levels.map((level, position) => [level.code, position]));
  const buckets: Teacher[][] = levels.map(() => []);
  const unclassified: Teacher[] = [];

  teachers.forEach((teacher) => {
    const position = teacher.levelCode ? index.get(teacher.levelCode) : undefined;
    if (position === undefined) unclassified.push(teacher);
    else buckets[position].push(teacher);
  });

  return [
    ...levels
      .map((level, position) => ({ level, teachers: buckets[position] }))
      .filter((group) => group.teachers.length > 0),
    ...(unclassified.length > 0 ? [{ level: undefined, teachers: unclassified }] : []),
  ];
}

/* ------------------------------ 学员风采 ------------------------------ */

export function getShowcaseSections(): Promise<ShowcaseSection[]> {
  return cached('showcaseSections', async () =>
    rows(await loadRaw('showcaseSections')).map((row) => ({
      id: str(row.sectionId, str(row.id)),
      title: str(row.title),
      subtitle: str(row.subtitle),
      items: rows(row.items).map((item) => ({
        emoji: str(item.emoji, '🎓'),
        title: str(item.title),
        desc: str(item.desc),
      })),
    })),
  );
}

/* -------------------------------- 校区 -------------------------------- */

export function getCampuses(): Promise<Campus[]> {
  return cached('campuses', async () =>
    rows(await loadRaw('campuses')).map((row) => {
      const name = str(row.name);
      return {
        id: str(row.campusId, str(row.id)),
        name,
        displayTitle: str(row.displayTitle, name),
        cityCode: str(row.cityCode),
        telephone: str(row.telephone),
        streetAddress: str(row.streetAddress),
        locality: str(row.locality),
        region: str(row.region),
        city: str(row.city),
        traffic: str(row.traffic),
        trafficDisplay: str(row.trafficDisplay, str(row.traffic)),
        cover: {
          src: str(row.coverPath, '/images/og-cover.png'),
          alt: str(row.coverAlt, name),
          // 校区实景照片规格固定，避免为宽高单独建字段
          width: 1080,
          height: 720,
        },
      } satisfies Campus;
    }),
  );
}

/**
 * 按城市分组：分组顺序取站点设置的 cities（与联系我们页筛选标签顺序一致），
 * 组内保持后台 order 顺序，页面据此渲染筛选标签与卡片列表。
 */
export function groupCampusesByCity(
  campuses: Campus[],
  cityOrder: string[],
): { city: string; cityCode: string; campuses: Campus[] }[] {
  const order = cityOrder.length ? cityOrder : [...new Set(campuses.map((campus) => campus.city))];

  return order
    .map((city) => {
      const items = campuses.filter((campus) => campus.city === city);
      return { city, cityCode: items[0]?.cityCode ?? '', campuses: items };
    })
    .filter((group) => group.campuses.length > 0);
}

/* -------------------------- 机构动态 / 商业资讯 -------------------------- */

export function getNewsItems(): Promise<NewsItem[]> {
  return cached('newsItems', async () =>
    rows(await loadRaw('newsItems')).map((row) => ({
      documentId: str(row.documentId, str(row.id)),
      channel: str(row.channel) === 'business' ? 'business' : 'news',
      emoji: str(row.emoji, '📰'),
      date: str(row.dateText),
      title: str(row.title),
      summary: str(row.summary),
      order: num(row.order),
    })),
  );
}

/* ------------------------------ 美迪问答 ------------------------------ */

export function getFaqs(): Promise<FaqItem[]> {
  return cached('faqs', async () =>
    rows(await loadRaw('faqs')).map((row, index) => ({
      id: str(row.faqId, str(row.id, `faq-${index + 1}`)),
      question: str(row.question),
      answer: str(row.answer),
      defaultOpen: bool(row.defaultOpen),
    })),
  );
}

/* ------------------------------ 知识百科 ------------------------------ */

export function getGuides(): Promise<Guide[]> {
  return cached('guides', async () =>
    rows(await loadRaw('guides')).map((row) => {
      const seo = isRow(row.seo) ? row.seo : {};
      return {
        slug: str(row.slug),
        title: str(row.title),
        subtitle: str(row.subtitle),
        emoji: str(row.emoji, '📘'),
        categoryLabel: str(row.categoryLabel),
        summary: str(row.summary, str(row.subtitle)),
        content: str(row.content),
        seo: {
          title: str(seo.title, str(row.title)),
          description: str(seo.description),
          keywords: str(seo.keywords),
          canonical: str(seo.canonical) || undefined,
        },
      } satisfies Guide;
    }),
  );
}

/* ----------------------------- 文章（内容工厂） ----------------------------- */

function toAnswerBlocks(value: unknown): ArticleAnswerBlock[] {
  return rows(value)
    .map((item) => ({ question: str(item.question), answer: str(item.answer) }))
    .filter((item) => item.answer);
}

function toKeyFacts(value: unknown): ArticleKeyFact[] {
  return rows(value)
    .map((item) => ({ label: str(item.label), value: str(item.value) }))
    .filter((item) => item.label && item.value);
}

function toArticleFaq(value: unknown): ArticleFaq[] {
  return rows(value)
    .map((item) => ({ question: str(item.question), answer: str(item.answer) }))
    .filter((item) => item.question && item.answer);
}

function toArticleSources(value: unknown): ArticleSource[] {
  return rows(value)
    .map((item) => ({ label: str(item.label), url: str(item.url) }))
    .filter((item) => item.label);
}

/** 已发布文章，按发布时间倒序（CMS 已排序，这里兜底） */
export function getArticles(): Promise<Article[]> {
  return cached('articles', async () => {
    const list = rows(await loadRaw('articles')).map((row) => {
      const seo = isRow(row.seo) ? row.seo : {};
      const slug = str(row.slug);

      return {
        slug,
        title: str(row.title),
        summary: str(row.summary),
        content: str(row.content),
        cover: isRow(row.cover) && str(row.cover.fallbackPath)
          ? coverFrom(row.cover, '/images/og-cover.png', str(row.title))
          : undefined,
        tags: parseStringList(row.tags),
        author: str(row.author, '美迪时代教育'),
        date: formatDate(row.publishedAt),
        updatedAt: formatDate(row.updatedAt),
        targetKeywords: str(row.targetKeywords),
        seo: {
          title: str(seo.title, str(row.title)),
          description: str(seo.description, str(row.summary)),
          keywords: str(seo.keywords),
          canonical: str(seo.canonical) || `/articles/${slug}/`,
        } satisfies ArticleSeo,
        answerBlocks: toAnswerBlocks(row.answerBlocks),
        keyFacts: toKeyFacts(row.keyFacts),
        faq: toArticleFaq(row.faq),
        sources: toArticleSources(row.sources),
        relatedLinks: toLinks(row.relatedLinks),
        geoScore: typeof row.geoScore === 'number' ? row.geoScore : undefined,
      } satisfies Article;
    });

    return list
      .filter((article) => article.slug && article.title)
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  });
}

/** 文章按标签/关键词取相关阅读（列表页与详情页共用） */
export function pickRelatedArticles(articles: Article[], current: Article, limit = 3): Article[] {
  const keywords = new Set([...current.tags, ...current.seo.keywords.split(/[,，、\s]+/).filter(Boolean)]);
  return articles
    .filter((article) => article.slug !== current.slug)
    .map((article) => {
      const pool = [...article.tags, ...article.seo.keywords.split(/[,，、\s]+/).filter(Boolean)];
      const score = pool.filter((item) => keywords.has(item)).length;
      return { article, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.article);
}
