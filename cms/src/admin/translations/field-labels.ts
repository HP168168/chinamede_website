/**
 * 后台「字段显示名」中文标签（简体中文）。
 *
 * 覆盖两类键，规则来自管理面板源码（dist 中只有这两处构造字段标签键）：
 *   1. 内容类型字段（列表页表头 + 编辑页表单标签）
 *      `content-manager.content-types.<内容类型 UID>.<字段名>`
 *      —— @strapi/content-manager/dist/admin/pages/ListView/ListViewPage.js、
 *         pages/EditView/components/FormLayout.js
 *   2. 组件子字段（编辑页里组件内部的字段标签）
 *      `content-manager.components.<组件 UID>.<字段名>`
 *      —— pages/EditView/components/FormInputs/Component/NonRepeatable.js
 *
 * 注意：官方语言包里**没有**这两类键（只有 content-manager.components.<界面串> 这种插件 UI 文案），
 * 所以字段名不会因为切到简体中文而自动汉化 —— 标签一律回退成 schema 里的英文名。
 * 也就是说：每个想在后台显示中文的字段，都必须在这里登记，漏一条界面上就是英文。
 *
 * 组织方式（避免同名同义字段各写一套译法）：
 *   TERMS             公共术语表，同名段默认同译；
 *   CONTENT_TYPE_FIELDS / COMPONENT_FIELDS  声明各自需要中文的字段（顺序与后台表单一致）；
 *   OVERRIDES         只处理「同名不同义」的特例，例如 teacher.title 是「职称」、
 *                     shared.seo.title 是「SEO 标题」、course.title 是「完整标题」。
 *
 * 完整性由 `npm run check:i18n` 校验：它会读本文件生成的键，并与所有 schema.json 的字段逐一比对。
 */
const TERMS: Record<string, string> = {
  title: '标题',
  subtitle: '副标题',
  name: '名称',
  order: '排序号',
  code: '编码',
  description: '描述',
  slug: 'URL 标识',
  summary: '摘要',
  content: '正文内容',
  cover: '封面',
  tags: '标签',
  author: '作者',
  source: '来源',
  seo: 'SEO 设置',
  faq: '常见问答',
  sources: '引用来源',
  telephone: '联系电话',
  locality: '所在区县',
  region: '省份',
  city: '城市',
  traffic: '交通信息',
  mode: '生成模式',
  entries: '条目',
  topic: '主题',
  audience: '目标受众',
  tone: '语气风格',
  status: '状态',
  runStatus: '状态',
  retries: '重试次数',
  result: '生成结果',
  log: '执行日志',
  aliases: '别名',
  category: '分类',
  question: '问题',
  answer: '答案',
  points: '要点',
  facts: '事实数据',
  qa: '问答对',
  citation: '引用说明',
  attachments: '附件',
  credibility: '可信度评级',
  nav: '主导航',
  channel: '发布渠道',
  emoji: '图标',
  items: '展示条目',
  slogan: '品牌口号',
  cities: '服务城市',
  address: '详细地址',
  icp: '备案号',
  logo: 'Logo 图片',
  generator: '生成工具',
  copyright: '版权声明',
  avatar: '头像',
  gradient: '渐变样式',
  meta: '附加信息',
  desc: '简要说明',
  hour: '课时',
  highlight: '高亮说明',
  jobs: '就业方向',
  targets: '培养目标',
  amount: '价格金额',
  currency: '货币单位',
  origin: '原价',
  save: '优惠金额',
  label: '标签文字',
  value: '数值',
  year: '年份',
  image: '图片',
  fallbackPath: '备用图片路径',
  alt: '替代文本',
  width: '宽度',
  height: '高度',
  links: '链接列表',
  href: '跳转地址',
  external: '新窗口打开',
  text: '文字内容',
  cls: '样式类名',
  route: '页面路径',
  keywords: '关键词',
  canonical: '规范链接',
  badge: '角标',
  price: '课程价格',
  stats: '数据统计',
  curriculum: '课程大纲',
  practice: '实训说明',
  outcomes: '就业方向',
};

/** 内容类型字段（键：content-manager.content-types.<UID>.<字段>） */
const CONTENT_TYPE_FIELDS: Record<string, string[]> = {
  'api::article.article': [
    'title', 'slug', 'summary', 'content', 'cover', 'tags', 'author', 'source',
    'targetKeywords', 'seo', 'answerBlocks', 'keyFacts', 'faq', 'sources',
    'relatedLinks', 'kbEntries', 'keyword', 'promptTemplate', 'geoScore',
  ],
  'api::campus.campus': [
    'campusId', 'name', 'displayTitle', 'cityCode', 'telephone', 'streetAddress',
    'locality', 'region', 'city', 'traffic', 'trafficDisplay', 'cover',
    'coverPath', 'coverAlt', 'order',
  ],
  'api::course.course': [
    'order', 'code', 'title', 'subtitle', 'mainTitle', 'category', 'cover', 'badge',
    'metaTags', 'price', 'stats', 'descHighlight', 'curriculum', 'practice',
    'outcomes', 'tags', 'faq', 'seo',
  ],
  'api::course-category.course-category': ['code', 'name', 'order', 'description'],
  'api::faq.faq': ['faqId', 'question', 'answer', 'defaultOpen', 'order'],
  'api::generation-task.generation-task': [
    'title', 'mode', 'trigger', 'scheduleCron', 'timezone', 'enabled',
    'nextRunAt', 'lastRunAt', 'entries', 'topic', 'wordCount', 'audience', 'tone',
    'targetKeywords', 'keywordCategory', 'keyword', 'promptTemplate',
    'plannedDate', 'runStatus', 'retries', 'result', 'log', 'requestedBy',
  ],
  'api::guide.guide': [
    'slug', 'title', 'subtitle', 'emoji', 'categoryLabel', 'summary', 'content', 'seo', 'order',
  ],
  'api::kb-entry.kb-entry': [
    'title', 'slug', 'aliases', 'category', 'topic', 'points', 'facts', 'qa',
    'citation', 'sources', 'relatedCourses', 'tags', 'attachments', 'credibility', 'lastVerified',
  ],
  'api::keyword.keyword': [
    'word', 'category', 'enabled', 'usageCount', 'lastUsedAt', 'seedWord', 'note',
  ],
  'api::navigation.navigation': [
    'nav', 'footerGroups', 'footerIntro', 'footerContacts', 'footerBottom',
  ],
  'api::news-item.news-item': ['title', 'channel', 'dateText', 'emoji', 'summary', 'order'],
  'api::page-seo.page-seo': ['entries'],
  'api::prompt-template.prompt-template': ['title', 'description', 'content', 'enabled'],
  'api::schema-data.schema-data': ['siteNodes', 'pageNodes'],
  'api::showcase-section.showcase-section': ['sectionId', 'title', 'subtitle', 'items', 'order'],
  'api::site-config.site-config': [
    'name', 'legalName', 'slogan', 'baseUrl', 'telephone', 'telephoneHref', 'serviceHours',
    'foundedYear', 'cities', 'campusCount', 'campusDisplay', 'address', 'icp', 'icpUrl',
    'logo', 'logoPath', 'logoAlt', 'ogImage', 'ogImagePath', 'ogImageWidth', 'ogImageHeight',
    'description', 'generator', 'author', 'copyright', 'knowsAbout', 'sameAs',
    'wechatQr', 'wechatQrPath', 'wechatQrAlt', 'wechatPhone', 'wechatPhoneLabel',
    'wechatScanTip', 'llmsIntro', 'llmsFacts', 'llmsCitation',
  ],
  'api::teacher.teacher': ['avatar', 'photo', 'name', 'title', 'desc', 'levelCode', 'level', 'order'],
  'api::teacher-level.teacher-level': [
    'levelCode', 'name', 'gradient', 'desc', 'meta', 'order', 'teachers',
  ],
};

/** 组件子字段（键：content-manager.components.<组件 UID>.<字段>） */
const COMPONENT_FIELDS: Record<string, string[]> = {
  'course.module': ['name', 'hour', 'highlight'],
  'course.outcomes': ['jobs', 'targets'],
  'course.practice': ['title', 'text'],
  'course.price': ['amount', 'currency', 'origin', 'save'],
  'course.stage': ['badge', 'title', 'subtitle', 'modules'],
  'geo.answer-block': ['question', 'answer'],
  'geo.key-fact': ['label', 'value'],
  'geo.source': ['label', 'url'],
  'kb.fact': ['label', 'value', 'year', 'source'],
  'kb.point': ['text'],
  'kb.source': ['label', 'url', 'note'],
  'shared.cover': ['image', 'fallbackPath', 'alt', 'width', 'height'],
  'shared.faq-item': ['question', 'answer'],
  'shared.footer-group': ['title', 'links'],
  'shared.link': ['label', 'href', 'external'],
  'shared.meta-tag': ['text', 'cls'],
  'shared.route-seo': ['route', 'seo'],
  'shared.seo': ['title', 'description', 'keywords', 'canonical'],
  'shared.showcase-item': ['emoji', 'title', 'desc'],
  'shared.stat-item': ['text', 'highlight'],
};

/** 特例：同名不同义（键为 `content-types.<UID>.<字段>` 或 `components.<UID>.<字段>`） */
const OVERRIDES: Record<string, string> = {
  // ── 文章 ──
  'content-types.api::article.article.title': '文章标题',
  'content-types.api::article.article.summary': '文章摘要',
  'content-types.api::article.article.targetKeywords': '目标关键词',
  'content-types.api::article.article.answerBlocks': '答案段落',
  'content-types.api::article.article.keyFacts': '关键数据要点',
  'content-types.api::article.article.relatedLinks': '相关阅读内链',
  'content-types.api::article.article.kbEntries': '引用知识条目',
  'content-types.api::article.article.keyword': '本次使用的关键词',
  'content-types.api::article.article.promptTemplate': '本次使用的提示词',
  'content-types.api::article.article.geoScore': 'GEO 校验得分',

  // ── 校区 ──
  'content-types.api::campus.campus.campusId': '校区标识',
  'content-types.api::campus.campus.name': '校区名称',
  'content-types.api::campus.campus.displayTitle': '卡片标题',
  'content-types.api::campus.campus.cityCode': '城市筛选代码',
  'content-types.api::campus.campus.streetAddress': '街道地址',
  'content-types.api::campus.campus.traffic': '交通指引',
  'content-types.api::campus.campus.trafficDisplay': '交通指引（页面展示）',
  'content-types.api::campus.campus.cover': '校区实景照片',
  'content-types.api::campus.campus.coverPath': '照片站内路径',
  'content-types.api::campus.campus.coverAlt': '照片替代文本',

  // ── 课程 ──
  'content-types.api::course.course.title': '完整标题',
  'content-types.api::course.course.mainTitle': '完整标题',
  'content-types.api::course.course.metaTags': '标题标签',
  'content-types.api::course.course.descHighlight': '高亮描述',
  'content-types.api::course.course.category': '课程分类',

  // ── 课程分类 ──
  'content-types.api::course-category.course-category.name': '分类名称',
  'content-types.api::course-category.course-category.description': '分类说明',

  // ── 美迪问答 ──
  'content-types.api::faq.faq.faqId': '问答标识',
  'content-types.api::faq.faq.defaultOpen': '默认展开',

  // ── 任务计划 ──
  'content-types.api::generation-task.generation-task.title': '任务标题',
  'content-types.api::generation-task.generation-task.trigger': '触发方式',
  'content-types.api::generation-task.generation-task.scheduleCron': '执行时间',
  'content-types.api::generation-task.generation-task.timezone': '时区',
  'content-types.api::generation-task.generation-task.enabled': '启用',
  'content-types.api::generation-task.generation-task.nextRunAt': '下次执行时间',
  'content-types.api::generation-task.generation-task.lastRunAt': '上次执行时间',
  'content-types.api::generation-task.generation-task.entries': '关联知识条目',
  'content-types.api::generation-task.generation-task.targetKeywords': '目标关键词',
  'content-types.api::generation-task.generation-task.keywordCategory': '关键词类型',
  'content-types.api::generation-task.generation-task.keyword': '指定关键词',
  'content-types.api::generation-task.generation-task.promptTemplate': '使用提示词',
  'content-types.api::generation-task.generation-task.wordCount': '目标字数',
  'content-types.api::generation-task.generation-task.plannedDate': '计划执行日',
  'content-types.api::generation-task.generation-task.requestedBy': '提出人',

  // ── 知识百科 ──
  'content-types.api::guide.guide.title': '词条标题',
  'content-types.api::guide.guide.subtitle': '词条副标题',
  'content-types.api::guide.guide.emoji': '列表图标',
  'content-types.api::guide.guide.categoryLabel': '列表分类标签',
  'content-types.api::guide.guide.summary': '列表摘要',

  // ── 知识条目 ──
  'content-types.api::kb-entry.kb-entry.title': '条目标题',
  'content-types.api::kb-entry.kb-entry.relatedCourses': '关联课程',
  'content-types.api::kb-entry.kb-entry.lastVerified': '最后核实日期',

  // ── 关键词 ──
  'content-types.api::keyword.keyword.word': '关键词',
  'content-types.api::keyword.keyword.category': '关键词分类',
  'content-types.api::keyword.keyword.enabled': '启用',
  'content-types.api::keyword.keyword.usageCount': '使用次数',
  'content-types.api::keyword.keyword.lastUsedAt': '最近使用时间',
  'content-types.api::keyword.keyword.seedWord': '来源种子词',
  'content-types.api::keyword.keyword.note': '备注',

  // ── 提示词 ──
  'content-types.api::prompt-template.prompt-template.title': '提示词名称',
  'content-types.api::prompt-template.prompt-template.description': '用途说明',
  'content-types.api::prompt-template.prompt-template.content': '提示词正文',
  'content-types.api::prompt-template.prompt-template.enabled': '启用',

  // ── 导航与页脚 ──
  'content-types.api::navigation.navigation.footerGroups': '页脚分组',
  'content-types.api::navigation.navigation.footerIntro': '页脚简介',
  'content-types.api::navigation.navigation.footerContacts': '页脚联系方式',
  'content-types.api::navigation.navigation.footerBottom': '页脚版权信息',

  // ── 动态与资讯 ──
  'content-types.api::news-item.news-item.title': '资讯标题',
  'content-types.api::news-item.news-item.summary': '资讯摘要',
  'content-types.api::news-item.news-item.dateText': '日期或分类',
  'content-types.api::news-item.news-item.emoji': '列表图标',

  // ── 页面 SEO ──
  'content-types.api::page-seo.page-seo.entries': '页面条目',

  // ── 结构化数据 ──
  'content-types.api::schema-data.schema-data.siteNodes': '站点级节点',
  'content-types.api::schema-data.schema-data.pageNodes': '页面级节点',

  // ── 展示区块 ──
  'content-types.api::showcase-section.showcase-section.sectionId': '区块标识',
  'content-types.api::showcase-section.showcase-section.title': '区块标题',
  'content-types.api::showcase-section.showcase-section.subtitle': '区块副标题',

  // ── 站点设置 ──
  'content-types.api::site-config.site-config.name': '站点名称',
  'content-types.api::site-config.site-config.legalName': '机构全称',
  'content-types.api::site-config.site-config.telephone': '客服电话',
  'content-types.api::site-config.site-config.telephoneHref': '热线拨打链接',
  'content-types.api::site-config.site-config.serviceHours': '服务时间',
  'content-types.api::site-config.site-config.foundedYear': '创立年份',
  'content-types.api::site-config.site-config.campusCount': '校区数量',
  'content-types.api::site-config.site-config.campusDisplay': '校区布局文案',
  'content-types.api::site-config.site-config.icpUrl': '备案查询地址',
  'content-types.api::site-config.site-config.baseUrl': '站点基准地址',
  'content-types.api::site-config.site-config.logo': '站点 Logo',
  'content-types.api::site-config.site-config.logoPath': 'Logo 站内路径',
  'content-types.api::site-config.site-config.logoAlt': 'Logo 替代文本',
  'content-types.api::site-config.site-config.ogImage': '分享图',
  'content-types.api::site-config.site-config.ogImagePath': '分享图站内路径',
  'content-types.api::site-config.site-config.ogImageWidth': '分享图宽度',
  'content-types.api::site-config.site-config.ogImageHeight': '分享图高度',
  'content-types.api::site-config.site-config.description': '站点简介',
  'content-types.api::site-config.site-config.author': '主办方',
  'content-types.api::site-config.site-config.knowsAbout': '品牌专长领域',
  'content-types.api::site-config.site-config.sameAs': '官方主页链接',
  'content-types.api::site-config.site-config.wechatQr': '客服微信二维码',
  'content-types.api::site-config.site-config.wechatQrPath': '二维码站内路径',
  'content-types.api::site-config.site-config.wechatQrAlt': '二维码替代文本',
  'content-types.api::site-config.site-config.wechatPhone': '客服手机号',
  'content-types.api::site-config.site-config.wechatPhoneLabel': '手机号说明',
  'content-types.api::site-config.site-config.wechatScanTip': '扫码提示',
  'content-types.api::site-config.site-config.llmsIntro': 'AI 摘要简介',
  'content-types.api::site-config.site-config.llmsFacts': '品牌事实',
  'content-types.api::site-config.site-config.llmsCitation': '引用规范',

  // ── 师资 ──
  'content-types.api::teacher.teacher.avatar': '讲师头像',
  'content-types.api::teacher.teacher.photo': '形象照',
  'content-types.api::teacher.teacher.name': '姓名',
  'content-types.api::teacher.teacher.title': '职称',
  'content-types.api::teacher.teacher.desc': '讲师简介',
  'content-types.api::teacher.teacher.levelCode': '层级代码（历史字段）',
  'content-types.api::teacher.teacher.level': '所属层级',

  // ── 师资层级 ──
  'content-types.api::teacher-level.teacher-level.levelCode': '层级代码',
  'content-types.api::teacher-level.teacher-level.name': '层级名称',
  'content-types.api::teacher-level.teacher-level.desc': '层级说明',
  'content-types.api::teacher-level.teacher-level.teachers': '该层级讲师',

  // ── 组件：课程 ──
  'components.course.module.name': '模块名称',
  'components.course.stage.title': '阶段标题',
  'components.course.stage.subtitle': '阶段副标题',
  'components.course.stage.badge': '阶段角标',
  'components.course.stage.modules': '课程模块',
  'components.course.practice.title': '实训标题',

  // ── 组件：知识库 ──
  'components.kb.source.url': '链接地址',
  'components.kb.source.note': '备注',
  'components.kb.fact.source': '数据来源',

  // ── 组件：通用 ──
  'components.geo.source.url': '链接地址',
  'components.shared.footer-group.title': '分组标题',
  'components.shared.seo.title': 'SEO 标题',
  'components.shared.seo.description': 'SEO 描述',
  'components.shared.showcase-item.title': '条目标题',
  'components.shared.showcase-item.desc': '条目说明',
  'components.shared.stat-item.highlight': '高亮文字',
};

const fieldLabels: Record<string, string> = {};

for (const [uid, fields] of Object.entries(CONTENT_TYPE_FIELDS)) {
  for (const field of fields) {
    const value = OVERRIDES[`content-types.${uid}.${field}`] ?? TERMS[field];
    if (value) fieldLabels[`content-manager.content-types.${uid}.${field}`] = value;
  }
}

for (const [uid, fields] of Object.entries(COMPONENT_FIELDS)) {
  for (const field of fields) {
    const value = OVERRIDES[`components.${uid}.${field}`] ?? TERMS[field];
    if (value) fieldLabels[`content-manager.components.${uid}.${field}`] = value;
  }
}

export default fieldLabels;
export { COMPONENT_FIELDS, CONTENT_TYPE_FIELDS, OVERRIDES, TERMS };
