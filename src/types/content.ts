// 官网内容类型定义
// 与 cms/ 中 Strapi 内容模型一一对应（字段名保持一致，页面改造面最小）
// 迁移自原 src/data/*.ts 的接口定义，并新增文章（AI 内容工厂产物）相关类型

/* ------------------------------- 站点设置 ------------------------------- */

/** 站点设置（Strapi 单类型 site-config） */
export interface SiteConfig {
  name: string;
  legalName: string;
  slogan: string;
  /** 站点基准地址：canonical / OG / JSON-LD / llms.txt 统一读此字段 */
  url: string;
  telephone: string;
  telephoneHref: string;
  serviceHours: string;
  foundedYear: string;
  cities: string[];
  campusCount: number;
  campusDisplay: string;
  address: string;
  icp: string;
  icpUrl: string;
  logo: string;
  logoAlt: string;
  ogImage: string;
  ogImageWidth: number;
  ogImageHeight: number;
  description: string;
  generator: string;
  author: string;
  copyright: string;
  knowsAbout: string[];
  /** 官方主页链接（sameAs）：写入 Organization 结构化数据，便于 AI 识别同一实体 */
  sameAs: string[];
  /** 客服微信二维码（站内路径，构建前由 sync-media 同步） */
  wechatQr: string;
  wechatQrAlt: string;
  /** 客服手机号（与微信同号），改号无需改代码 */
  wechatPhone: string;
  wechatPhoneLabel: string;
  wechatScanTip: string;
  llmsIntro: string;
  llmsFacts: string[];
  llmsCitation: string;
}

/* ------------------------------ 导航与页脚 ------------------------------ */

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterGroup {
  title: string;
  links: NavLink[];
}

export interface NavigationData {
  nav: NavLink[];
  footerGroups: FooterGroup[];
  footerIntro: string;
  footerContacts: string[];
  footerBottom: string[];
}

/* ------------------------------ 页面 SEO ------------------------------- */

export interface PageSeo {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
}

/* ------------------------------ 结构化数据 ------------------------------ */

export interface SchemaData {
  /** 站点级节点：组织实体、站点实体 */
  siteNodes: Record<string, unknown>[];
  /** 页面级节点：按路由分组 */
  pageNodes: Record<string, Record<string, unknown>[]>;
}

/* -------------------------------- 课程 -------------------------------- */

export interface CourseModule {
  name: string;
  hour: string;
  highlight: boolean;
}

export interface CourseStage {
  badge: string;
  title: string;
  subtitle: string;
  modules: CourseModule[];
}

export interface CourseFaq {
  id: string;
  question: string;
  answer: string;
}

export interface CourseCover {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Course {
  slug: string;
  order: number;
  code: string;
  category: string;
  title: string;
  subtitle: string;
  mainTitle: string;
  cover: CourseCover;
  badge: string;
  metaTags: { text: string; cls: string }[];
  price: { amount: string; currency: string; origin: string; save: string };
  stats: { text: string; highlight: boolean }[];
  descHighlight: string;
  curriculum: CourseStage[];
  practice: { title: string; text: string };
  outcomes: { jobs: string[]; targets: string[] };
  tags: string[];
  faq: CourseFaq[];
  seo: { title: string; description: string; keywords: string };
}

export interface CourseCategory {
  code: string;
  name: string;
  order: number;
  description: string;
}

/* -------------------------------- 师资 -------------------------------- */

export interface Teacher {
  avatar: string;
  /**
   * 形象照站内路径：来自后台上传的「形象照」媒体（构建期同步到 /images/teachers/），
   * 未上传时回退为默认占位头像（DEFAULT_TEACHER_PHOTO）
   */
  photo: string;
  name: string;
  title: string;
  desc: string;
  /** 所属师资层级编码，如 L1 / L2 / L3 / M：取关联关系的 levelCode，关系缺失时回退历史字符串字段 */
  levelCode: string;
  /** 所属师资层级名称：取「师资层级」主表的 name，页面直接展示；关系缺失时为空 */
  levelName: string;
  /** 后台排序序号 */
  order: number;
}

export interface TeacherLevel {
  code: string;
  gradient: string;
  name: string;
  desc: string;
  meta: string[];
  /** 后台排序序号 */
  order: number;
}

/* ------------------------------ 学员风采 ------------------------------ */

export interface ShowcaseItem {
  emoji: string;
  title: string;
  desc: string;
}

export interface ShowcaseSection {
  id: string;
  title: string;
  subtitle: string;
  items: ShowcaseItem[];
}

/* -------------------------------- 校区 -------------------------------- */

export interface Campus {
  id: string;
  name: string;
  /** 联系我们页卡片标题，如 广州（总校）· 越秀区 · 三元里校区 */
  displayTitle: string;
  /** 城市筛选代码，如 gz / sz / fs / dg / zs / jm */
  cityCode: string;
  telephone: string;
  streetAddress: string;
  locality: string;
  region: string;
  city: string;
  /** 交通指引（结构化数据用） */
  traffic: string;
  /** 交通指引（联系我们页展示用） */
  trafficDisplay: string;
  /** 校区实景照片（站内路径，构建前由 sync-media 同步） */
  cover: CourseCover;
}

/* ---------------------------- 机构动态 / 商业资讯 ---------------------------- */

export type NewsChannel = 'news' | 'business';

export interface NewsItem {
  documentId: string;
  channel: NewsChannel;
  emoji: string;
  date: string;
  title: string;
  summary: string;
  order: number;
}

/* ------------------------------ 美迪问答 ------------------------------ */

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  defaultOpen: boolean;
}

/* ------------------------------ 知识百科 ------------------------------ */

export interface GuideSeo {
  title: string;
  description: string;
  keywords: string;
  canonical?: string;
}

export interface Guide {
  slug: string;
  title: string;
  subtitle: string;
  /** 列表页卡片图标，如 📱 */
  emoji: string;
  /** 列表页卡片分类标签，如「转行攻略 · 新媒体运营」 */
  categoryLabel: string;
  /** 列表页卡片摘要 */
  summary: string;
  /** 正文 HTML 片段（含 table / blockquote，逐字保留） */
  content: string;
  seo: GuideSeo;
}

/* ------------------------- 文章（AI 内容工厂产物） ------------------------- */

export interface ArticleSeo {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
}

/** GEO 答案段落：可直接被搜索引擎与 AI 引用的结论 */
export interface ArticleAnswerBlock {
  question: string;
  answer: string;
}

/** GEO 关键数据要点 */
export interface ArticleKeyFact {
  label: string;
  value: string;
}

export interface ArticleFaq {
  question: string;
  answer: string;
}

export interface ArticleSource {
  label: string;
  url: string;
}

export interface Article {
  slug: string;
  title: string;
  summary: string;
  /** 正文 HTML 片段 */
  content: string;
  cover?: CourseCover;
  tags: string[];
  author: string;
  /** 发布日期（YYYY-MM-DD） */
  date: string;
  /** 最近更新时间（YYYY-MM-DD） */
  updatedAt: string;
  targetKeywords: string;
  seo: ArticleSeo;
  answerBlocks: ArticleAnswerBlock[];
  keyFacts: ArticleKeyFact[];
  faq: ArticleFaq[];
  sources: ArticleSource[];
  relatedLinks: NavLink[];
  geoScore?: number;
}
