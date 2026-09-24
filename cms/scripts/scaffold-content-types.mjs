#!/usr/bin/env node
/**
 * 内容建模脚本（仅在初始化阶段使用）
 * ================================================================
 * 作用：按下面的定义一次性生成 Strapi 的内容类型与组件骨架
 *      - src/components/<分类>/<名称>.json
 *      - src/api/<类型>/content-types/<类型>/schema.json
 *      - src/api/<类型>/controllers|services|routes/<类型>.ts
 *
 * 使用：node scripts/scaffold-content-types.mjs
 *
 * ⚠️ 注意：模型定型后请通过后台「内容类型生成器」可视化维护，
 *    不要重跑本脚本（会覆盖后台里手改的字段）。本脚本保留仅为
 *    记录初始建模意图、便于在全新环境重建一份等价的 Strapi 工程。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const writeJson = (file, data) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
};

const writeText = (file, text) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text, 'utf8');
};

/* ------------------------------------------------------------------ */
/* 一、公共字段片段                                                     */
/* ------------------------------------------------------------------ */

const seoComponent = {
  title: { type: 'string', required: true, description: 'SEO 标题，建议 15-40 字' },
  description: { type: 'text', description: 'SEO 摘要，建议 60-160 字' },
  keywords: { type: 'text', description: '关键词，英文逗号分隔' },
  canonical: { type: 'string', description: '规范链接，留空则用站点基准地址自动生成' },
};

const coverComponent = {
  image: { type: 'media', multiple: false, allowedTypes: ['images'], description: '封面图，从媒体库选择' },
  fallbackPath: { type: 'string', description: '静态回退路径，如 /images/xxx.webp（迁移期兼容用）' },
  alt: { type: 'string', description: '图片替代文本（无障碍与 SEO 必填）' },
  width: { type: 'integer' },
  height: { type: 'integer' },
};

const linkComponent = {
  label: { type: 'string', required: true },
  href: { type: 'string', required: true },
  external: { type: 'boolean', default: false },
};

/* ------------------------------------------------------------------ */
/* 二、组件定义                                                         */
/* ------------------------------------------------------------------ */

const components = {
  shared: {
    seo: { displayName: 'SEO 元信息', icon: 'search', attributes: seoComponent },
    cover: { displayName: '封面', icon: 'picture', attributes: coverComponent },
    link: { displayName: '链接', icon: 'link', attributes: linkComponent },
    'footer-group': {
      displayName: '页脚分组',
      icon: 'layer-group',
      attributes: {
        title: { type: 'string', required: true },
        links: { type: 'component', component: 'shared.link', repeatable: true },
      },
    },
    'faq-item': {
      displayName: '问答项',
      icon: 'question',
      attributes: {
        question: { type: 'string', required: true, description: '问题' },
        answer: { type: 'text', required: true, description: '答案' },
      },
    },
    'stat-item': {
      displayName: '数据项',
      icon: 'chart-bubble',
      attributes: {
        text: { type: 'string', required: true, description: '如：💼 22天带薪实习闭环独有' },
        highlight: { type: 'boolean', default: false, description: '是否高亮显示' },
      },
    },
    'meta-tag': {
      displayName: '标签',
      icon: 'price-tag',
      attributes: {
        text: { type: 'string', required: true },
        cls: { type: 'string', description: '样式类名，如 tag-blue' },
      },
    },
    'showcase-item': {
      displayName: '展示条目',
      icon: 'grid',
      attributes: {
        emoji: { type: 'string', description: '图标（emoji）' },
        title: { type: 'string', required: true },
        desc: { type: 'text' },
      },
    },
    'route-seo': {
      displayName: '路由 SEO',
      icon: 'globe',
      attributes: {
        route: { type: 'string', required: true, description: '路由路径，如 /courses/ 或 /contact/' },
        seo: { type: 'component', component: 'shared.seo', repeatable: false },
      },
    },
  },
  course: {
    price: {
      displayName: '课程价格',
      icon: 'shopping-cart',
      attributes: {
        amount: { type: 'string', description: '现价（含千分位，如 13,800）' },
        currency: { type: 'string', default: '¥' },
        origin: { type: 'string', description: '原价说明' },
        save: { type: 'string', description: '优惠说明' },
      },
    },
    module: {
      displayName: '课程模块',
      icon: 'book',
      attributes: {
        name: { type: 'string', required: true, description: '模块名称，如 AI工具应用' },
        hour: { type: 'string', description: '课时，如 18课时' },
        highlight: { type: 'boolean', default: false, description: '是否重点模块' },
      },
    },
    stage: {
      displayName: '课程阶段',
      icon: 'layer',
      attributes: {
        badge: { type: 'string', description: '阶段编号，如 01' },
        title: { type: 'string', required: true },
        subtitle: { type: 'string' },
        modules: { type: 'component', component: 'course.module', repeatable: true },
      },
    },
    practice: {
      displayName: '实训说明',
      icon: 'cog',
      attributes: {
        title: { type: 'string' },
        text: { type: 'text' },
      },
    },
    outcomes: {
      displayName: '就业方向',
      icon: 'briefcase',
      attributes: {
        jobs: { type: 'string', repeatable: true, description: '可从事岗位' },
        targets: { type: 'string', repeatable: true, description: '适合人群' },
      },
    },
  },
  kb: {
    point: {
      displayName: '知识要点',
      icon: 'bullet-list',
      attributes: {
        text: { type: 'text', required: true, description: '一条可独立成立的知识要点' },
      },
    },
    fact: {
      displayName: '数据点',
      icon: 'chart-pie',
      attributes: {
        label: { type: 'string', required: true, description: '指标名，如 应届生平均起薪' },
        value: { type: 'string', required: true, description: '数值或结论' },
        year: { type: 'string', description: '数据年份' },
        source: { type: 'string', description: '数据来源' },
      },
    },
    source: {
      displayName: '来源出处',
      icon: 'external-link',
      attributes: {
        label: { type: 'string', required: true },
        url: { type: 'string' },
        note: { type: 'text' },
      },
    },
  },
  geo: {
    'answer-block': {
      displayName: '答案段落',
      icon: 'message',
      attributes: {
        question: { type: 'string', required: true, description: '用户会问的问题' },
        answer: { type: 'text', required: true, description: '可直接被引用的答案，2-4 句说清结论' },
      },
    },
    'key-fact': {
      displayName: '关键数据',
      icon: 'database',
      attributes: {
        label: { type: 'string', required: true },
        value: { type: 'string', required: true },
      },
    },
    source: {
      displayName: '引用来源',
      icon: 'link',
      attributes: {
        label: { type: 'string', required: true },
        url: { type: 'string' },
      },
    },
  },
};

/* ------------------------------------------------------------------ */
/* 三、内容类型定义                                                     */
/* ------------------------------------------------------------------ */

const collectionTypes = {
  'course-category': {
    displayName: '课程分类',
    singularName: 'course-category',
    pluralName: 'course-categories',
    collectionName: 'course_categories',
    draftAndPublish: true,
    description: '课程所属方向，如 AI、跨境电商',
    attributes: {
      code: { type: 'string', required: true, unique: true, description: '分类标识，如 ai' },
      name: { type: 'string', required: true, description: '分类名称，如 AI 就业方向' },
      order: { type: 'integer', default: 0 },
      description: { type: 'text' },
    },
  },
  course: {
    displayName: '课程',
    singularName: 'course',
    pluralName: 'courses',
    collectionName: 'courses',
    draftAndPublish: true,
    description: '就业班课程，含大纲、价格、问答与 SEO',
    attributes: {
      slug: { type: 'string', required: true, unique: true, description: 'URL 标识，小写英文与连字符' },
      order: { type: 'integer', default: 0, description: '列表排序，越小越靠前' },
      code: { type: 'string', description: '课程编号，如 N1' },
      title: { type: 'string', required: true },
      subtitle: { type: 'string' },
      mainTitle: { type: 'string', description: '详情页主标题' },
      category: { type: 'relation', relation: 'manyToOne', target: 'api::course-category.course-category' },
      cover: { type: 'component', component: 'shared.cover', repeatable: false },
      badge: { type: 'string' },
      metaTags: { type: 'component', component: 'shared.meta-tag', repeatable: true },
      price: { type: 'component', component: 'course.price', repeatable: false },
      stats: { type: 'component', component: 'shared.stat-item', repeatable: true },
      descHighlight: { type: 'text', description: '课程亮点，可含简单 HTML' },
      curriculum: { type: 'component', component: 'course.stage', repeatable: true },
      practice: { type: 'component', component: 'course.practice', repeatable: false },
      outcomes: { type: 'component', component: 'course.outcomes', repeatable: false },
      tags: { type: 'string', repeatable: true },
      faq: { type: 'component', component: 'shared.faq-item', repeatable: true },
      seo: { type: 'component', component: 'shared.seo', repeatable: false },
    },
  },
  teacher: {
    displayName: '师资',
    singularName: 'teacher',
    pluralName: 'teachers',
    collectionName: 'teachers',
    draftAndPublish: true,
    attributes: {
      avatar: { type: 'string', description: '头像（emoji 或图片地址）' },
      name: { type: 'string', required: true },
      title: { type: 'string', description: '职务/学科头衔' },
      desc: { type: 'text' },
      levelCode: { type: 'string', description: '对应师资层级编码，如 L1/L2/L3/M' },
      order: { type: 'integer', default: 0 },
    },
  },
  'teacher-level': {
    displayName: '师资层级',
    singularName: 'teacher-level',
    pluralName: 'teacher-levels',
    collectionName: 'teacher_levels',
    draftAndPublish: true,
    attributes: {
      code: { type: 'string', required: true, unique: true, description: '层级编码，如 L1' },
      name: { type: 'string', required: true },
      gradient: { type: 'string', description: '卡片渐变样式，如 linear-gradient(135deg,#0066FF,#5B9AFF)' },
      desc: { type: 'text' },
      meta: { type: 'string', repeatable: true, description: '层级特征标签' },
      order: { type: 'integer', default: 0 },
    },
  },
  'showcase-section': {
    displayName: '展示区块',
    singularName: 'showcase-section',
    pluralName: 'showcase-sections',
    collectionName: 'showcase_sections',
    draftAndPublish: true,
    description: '学员风采等分组展示，如就业学员 / 学生活动 / 学生作品',
    attributes: {
      sectionId: { type: 'string', required: true, unique: true, description: '区块标识，如 employment' },
      title: { type: 'string', required: true },
      subtitle: { type: 'string' },
      items: { type: 'component', component: 'shared.showcase-item', repeatable: true },
      order: { type: 'integer', default: 0 },
    },
  },
  campus: {
    displayName: '校区',
    singularName: 'campus',
    pluralName: 'campuses',
    collectionName: 'campuses',
    draftAndPublish: true,
    attributes: {
      campusId: { type: 'string', required: true, unique: true, description: '校区标识，如 campus-gz-sanyuanli' },
      name: { type: 'string', required: true },
      telephone: { type: 'string', description: '校区电话' },
      streetAddress: { type: 'string' },
      locality: { type: 'string', description: '带“市”，如 广州市' },
      region: { type: 'string', description: '如 广东省' },
      city: { type: 'string', description: '不带“市”，如 广州' },
      traffic: { type: 'text', description: '交通指引' },
      order: { type: 'integer', default: 0 },
    },
  },
  'news-item': {
    displayName: '动态与资讯',
    singularName: 'news-item',
    pluralName: 'news-items',
    collectionName: 'news_items',
    draftAndPublish: true,
    description: '机构动态与商业资讯，列表展示的短条目',
    attributes: {
      title: { type: 'string', required: true },
      channel: {
        type: 'enumeration',
        enum: ['news', 'business'],
        default: 'news',
        required: true,
        description: '所属栏目：news = 机构动态（/news/）；business = 商业资讯（/business/）',
      },
      dateText: { type: 'string', description: '机构动态填日期（2026-09-01）；商业资讯填分类名（如 行业趋势）' },
      emoji: { type: 'string' },
      summary: { type: 'text' },
      order: { type: 'integer', default: 0 },
    },
  },
  faq: {
    displayName: '美迪问答',
    singularName: 'faq',
    pluralName: 'faqs',
    collectionName: 'faqs',
    draftAndPublish: true,
    attributes: {
      faqId: { type: 'string', required: true, unique: true, description: '问答标识，如 faq-1' },
      question: { type: 'string', required: true },
      answer: { type: 'text', required: true },
      defaultOpen: { type: 'boolean', default: false, description: '页面是否默认展开' },
      order: { type: 'integer', default: 0 },
    },
  },
  guide: {
    displayName: '知识百科',
    singularName: 'guide',
    pluralName: 'guides',
    collectionName: 'guides',
    draftAndPublish: true,
    description: '长文教程，正文为 HTML（支持表格、引用块）',
    attributes: {
      slug: { type: 'string', required: true, unique: true },
      title: { type: 'string', required: true },
      subtitle: { type: 'string' },
      content: { type: 'text', description: '正文 HTML，可用表格与引用块' },
      seo: { type: 'component', component: 'shared.seo', repeatable: false },
      order: { type: 'integer', default: 0 },
    },
  },
  article: {
    displayName: '文章',
    singularName: 'article',
    pluralName: 'articles',
    collectionName: 'articles',
    draftAndPublish: true,
    description: 'AI 生成或人工撰写的内容文章，发布后进入 /articles/',
    attributes: {
      title: { type: 'string', required: true },
      slug: { type: 'string', required: true, unique: true, description: 'URL 标识，小写英文与连字符' },
      summary: { type: 'text', description: '摘要，用于列表与 llms.txt' },
      content: { type: 'text', description: '正文 HTML' },
      cover: { type: 'component', component: 'shared.cover', repeatable: false },
      tags: { type: 'string', repeatable: true },
      author: { type: 'string', default: '美迪时代教育' },
      source: {
        type: 'enumeration',
        enum: ['ai', 'manual'],
        default: 'manual',
        required: true,
        description: '内容来源：ai = AI 生成；manual = 人工撰写',
      },
      targetKeywords: { type: 'string', description: '目标关键词，英文逗号分隔' },
      seo: { type: 'component', component: 'shared.seo', repeatable: false },
      answerBlocks: { type: 'component', component: 'geo.answer-block', repeatable: true, description: '答案段落：AI 引用时最可能直接摘录的部分' },
      keyFacts: { type: 'component', component: 'geo.key-fact', repeatable: true, description: '关键数据要点' },
      faq: { type: 'component', component: 'shared.faq-item', repeatable: true },
      sources: { type: 'component', component: 'geo.source', repeatable: true, description: '引用来源，提升可信度' },
      relatedLinks: { type: 'component', component: 'shared.link', repeatable: true, description: '相关阅读内链' },
      kbEntries: {
        type: 'relation',
        relation: 'manyToMany',
        target: 'api::kb-entry.kb-entry',
        description: '成稿所依据的知识条目',
      },
      geoScore: { type: 'integer', description: 'GEO 自检得分（0-100）' },
    },
  },
  'kb-entry': {
    displayName: '知识条目',
    singularName: 'kb-entry',
    pluralName: 'kb-entries',
    collectionName: 'kb_entries',
    draftAndPublish: true,
    description: '知识库：文章生成的事实基准，含要点、数据、问答与来源',
    attributes: {
      title: { type: 'string', required: true },
      slug: { type: 'string', required: true, unique: true },
      aliases: { type: 'string', repeatable: true, description: '同义词/别名，用于检索匹配' },
      category: {
        type: 'enumeration',
        enum: ['course', 'industry', 'role', 'policy', 'data', 'faq', 'other'],
        default: 'course',
        required: true,
        description: '知识分类：course = 课程信息；industry = 行业趋势；role = 岗位认知；policy = 政策法规；data = 数据统计；faq = 常见问题；other = 其他',
      },
      topic: { type: 'text', description: '主题一句话说明，供选题与推送' },
      points: { type: 'component', component: 'kb.point', repeatable: true, description: '关键要点' },
      facts: { type: 'component', component: 'kb.fact', repeatable: true, description: '数据点（含年份与来源）' },
      qa: { type: 'component', component: 'shared.faq-item', repeatable: true, description: '常见问答' },
      citation: { type: 'text', description: '希望被引用时的标准表述' },
      sources: { type: 'component', component: 'kb.source', repeatable: true },
      relatedCourses: { type: 'relation', relation: 'manyToMany', target: 'api::course.course' },
      tags: { type: 'string', repeatable: true },
      attachments: { type: 'media', multiple: true, description: '原始文档归档（PDF/Word 等），供后续 RAG 接入' },
      credibility: { type: 'text', description: '可信度说明：口径、适用范围与免责' },
      lastVerified: { type: 'date', description: '最后核实日期' },
    },
  },
  'generation-task': {
    displayName: '生成任务',
    singularName: 'generation-task',
    pluralName: 'generation-tasks',
    collectionName: 'generation_tasks',
    draftAndPublish: false,
    description: '内容工厂任务单：选择模式与素材后由脚本执行，产出文章草稿',
    attributes: {
      title: { type: 'string', required: true, description: '任务名称，如 2026-09 GEO 选题第一批' },
      mode: {
        type: 'enumeration',
        enum: ['ai', 'manual'],
        default: 'ai',
        required: true,
        description: '生成模式：ai = AI 生成（模型成稿）；manual = 人工撰写（只生成字段模板空草稿）',
      },
      target: {
        type: 'enumeration',
        enum: ['article', 'guide', 'news'],
        default: 'article',
        required: true,
        description: '目标栏目：article = 文章（/articles/）；guide = 知识百科；news = 机构动态',
      },
      entries: {
        type: 'relation',
        relation: 'manyToMany',
        target: 'api::kb-entry.kb-entry',
        description: '关联知识条目（AI 模式的事实来源）',
      },
      topic: { type: 'string', description: '选题/标题方向，留空则由知识条目自动推导' },
      count: { type: 'integer', default: 1, min: 1, max: 10, description: '本次生成篇数' },
      wordCount: { type: 'integer', default: 1200, description: '目标字数' },
      audience: { type: 'string', default: '零基础想转行就业的求职者' },
      tone: { type: 'string', default: '专业、务实、口语化' },
      targetKeywords: { type: 'string', description: '目标关键词，英文逗号分隔' },
      plannedDate: { type: 'date', description: '计划执行日期' },
      runStatus: {
        type: 'enumeration',
        enum: ['pending', 'running', 'done', 'failed', 'cancelled'],
        default: 'pending',
        required: true,
        description: '执行状态：pending = 待处理；running = 生成中；done = 已完成；failed = 失败；cancelled = 已取消',
      },
      retries: { type: 'integer', default: 0, description: '已重试次数' },
      result: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::article.article',
        description: '生成的最后一篇文章',
      },
      log: { type: 'text', description: '执行日志（脚本回写）' },
      requestedBy: { type: 'string', description: '申请人' },
    },
  },
};

const singleTypes = {
  'site-config': {
    displayName: '站点设置',
    singularName: 'site-config',
    pluralName: 'site-configs',
    collectionName: 'site_configs',
    draftAndPublish: false,
    description: '官网基础信息、联系方式与 llms 文案',
    attributes: {
      name: { type: 'string', required: true },
      legalName: { type: 'string' },
      slogan: { type: 'string' },
      baseUrl: { type: 'string', required: true, description: '站点基准地址，canonical/OG/JSON-LD/llms.txt 统一使用' },
      telephone: { type: 'string', description: '全国热线展示文本，如 400-800-4459' },
      telephoneHref: { type: 'string', description: '拨号链接，如 tel:4008004459' },
      serviceHours: { type: 'string' },
      foundedYear: { type: 'string' },
      cities: { type: 'string', repeatable: true },
      campusCount: { type: 'integer' },
      campusDisplay: { type: 'string', description: '如 6城13个直营校区' },
      address: { type: 'string' },
      icp: { type: 'string' },
      icpUrl: { type: 'string' },
      logo: { type: 'media', multiple: false, allowedTypes: ['images'] },
      logoPath: { type: 'string', description: '静态回退路径，如 /images/logo_3.png' },
      logoAlt: { type: 'string' },
      ogImage: { type: 'media', multiple: false, allowedTypes: ['images'] },
      ogImagePath: { type: 'string' },
      ogImageWidth: { type: 'integer' },
      ogImageHeight: { type: 'integer' },
      description: { type: 'text' },
      generator: { type: 'string' },
      author: { type: 'string' },
      copyright: { type: 'string' },
      knowsAbout: { type: 'string', repeatable: true },
      wechatQr: { type: 'media', multiple: false, allowedTypes: ['images'], description: '客服微信二维码，官网联系/报名页展示' },
      wechatQrPath: { type: 'string', description: '静态回退路径，默认 /images/wechat_qrcode.png' },
      wechatQrAlt: { type: 'string' },
      wechatPhone: { type: 'string', description: '客服手机号（微信同号）' },
      wechatPhoneLabel: { type: 'string', description: '如 手机/微信同号' },
      wechatScanTip: { type: 'text', description: '扫码提示文案' },
      llmsIntro: { type: 'text', description: 'llms.txt 品牌介绍段' },
      llmsFacts: { type: 'string', repeatable: true, description: 'llms.txt 品牌事实条目' },
      llmsCitation: { type: 'text', description: 'llms.txt 引用规范' },
    },
  },
  navigation: {
    displayName: '导航与页脚',
    singularName: 'navigation',
    pluralName: 'navigations',
    collectionName: 'navigations',
    draftAndPublish: false,
    attributes: {
      nav: { type: 'component', component: 'shared.link', repeatable: true, description: '顶部主导航' },
      footerGroups: { type: 'component', component: 'shared.footer-group', repeatable: true },
      footerIntro: { type: 'text' },
      footerContacts: { type: 'string', repeatable: true },
      footerBottom: { type: 'string', repeatable: true },
    },
  },
  'page-seo': {
    displayName: '页面 SEO',
    singularName: 'page-seo',
    pluralName: 'page-seos',
    collectionName: 'page_seos',
    draftAndPublish: false,
    attributes: {
      entries: { type: 'component', component: 'shared.route-seo', repeatable: true, description: '按路由维护各页面元信息' },
    },
  },
  'schema-data': {
    displayName: '结构化数据',
    singularName: 'schema-data',
    pluralName: 'schema-datas',
    collectionName: 'schema_datas',
    draftAndPublish: false,
    description: 'JSON-LD 节点：站点级节点与按路由的页面级节点',
    attributes: {
      siteNodes: { type: 'json', description: '站点级节点数组（Organization / WebSite）' },
      pageNodes: { type: 'json', description: '以路由为键的页面级节点字典' },
    },
  },
};

/* ------------------------------------------------------------------ */
/* 四、生成文件                                                         */
/* ------------------------------------------------------------------ */

const controllerTpl = (uid) => `import { factories } from '@strapi/strapi';

export default factories.createCoreController('${uid}');
`;

const serviceTpl = (uid) => `import { factories } from '@strapi/strapi';

export default factories.createCoreService('${uid}');
`;

const routeTpl = (uid) => `import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('${uid}');
`;

let componentCount = 0;
for (const [category, items] of Object.entries(components)) {
  for (const [name, def] of Object.entries(items)) {
    const file = path.join(ROOT, 'src', 'components', category, `${name}.json`);
    writeJson(file, {
      collectionName: `components_${category}_${name.replace(/-/g, '_')}s`,
      info: {
        displayName: def.displayName,
        ...(def.description ? { description: def.description } : {}),
        ...(def.icon ? { icon: def.icon } : {}),
      },
      ...(def.options ? { options: def.options } : {}),
      attributes: def.attributes,
    });
    componentCount += 1;
  }
}

const scaffoldApi = (dirName, def, kind) => {
  const uid = `api::${def.singularName}.${def.singularName}`;
  const base = path.join(ROOT, 'src', 'api', dirName);

  writeJson(path.join(base, 'content-types', def.singularName, 'schema.json'), {
    kind,
    collectionName: def.collectionName,
    info: {
      singularName: def.singularName,
      pluralName: def.pluralName,
      displayName: def.displayName,
      ...(def.description ? { description: def.description } : {}),
    },
    options: {
      draftAndPublish: Boolean(def.draftAndPublish),
    },
    pluginOptions: {},
    attributes: def.attributes,
  });

  writeText(path.join(base, 'controllers', `${def.singularName}.ts`), controllerTpl(uid));
  writeText(path.join(base, 'services', `${def.singularName}.ts`), serviceTpl(uid));
  writeText(path.join(base, 'routes', `${def.singularName}.ts`), routeTpl(uid));
};

for (const [dirName, def] of Object.entries(collectionTypes)) {
  scaffoldApi(dirName, def, 'collectionType');
}

for (const [dirName, def] of Object.entries(singleTypes)) {
  scaffoldApi(dirName, def, 'singleType');
}

console.log(`组件 ${componentCount} 个、集合 ${Object.keys(collectionTypes).length} 个、单类型 ${Object.keys(singleTypes).length} 个，已生成。`);
