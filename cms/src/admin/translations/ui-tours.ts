/**
 * 首页「引导教程」的中文串（键前缀 `tours.`）。
 *
 * 背景：官方简体中文包（`@strapi/admin` 的 zh-Hans）完全没有 `tours.*` 系列
 * （英文包 59 条，中文包 0 条），所以登录后的首页那块「Discover your application!
 * / Your tasks / 三步引导」在中文界面下会整块回退成英文。这里按官方英文包的键名补齐。
 *
 * 维护约定（与 `ui-admin.ts` 一致）：
 * - 键名必须与官方英文包一致（en.json.js 中的 tours.*）。
 * - 占位符 `{currentStep}`、`{tourLength}`、`{completed}`、`{spacer}` 必须原样保留。
 * - 值里的 HTML（`<p>`、`<ul>`、`<a>`）是渲染用的，必须原样保留。
 * - 值用中文引号「」而不是英文单引号，避免转义。
 * - 每条必须写成 `'键': '值',` 的单行形式：`check-admin-i18n.ts` 按行正则解析，折行会漏统计。
 */
const uiTours: Record<string, string> = {
  // ── 引导教程总览（首页卡片） ────────────────────────────────────
  'tours.overview.title': '探索你的应用！',
  'tours.overview.subtitle': '跟随引导教程，充分用好 Strapi。',
  'tours.overview.close': '关闭引导教程',
  'tours.overview.close.description': '确定要关闭引导教程吗？',
  'tours.overview.tasks': '你的任务',
  'tours.overview.completed': '已完成 {completed}%',
  'tours.overview.tour.link': '开始',
  'tours.overview.tour.done': '完成',

  // ── 引导教程的三个任务项 ────────────────────────────────────────
  'tours.overview.contentTypeBuilder.label': '创建数据结构',
  'tours.overview.contentManager.label': '创建并发布内容',
  'tours.overview.apiTokens.label': '复制 API 令牌',
  'tours.overview.strapiCloud.label': '把应用部署到 Strapi Cloud',
  'tours.overview.strapiCloud.link': '阅读文档',

  // ── 个人资料里的引导教程设置 ────────────────────────────────────
  'tours.profile.title': '引导教程',
  'tours.profile.description': '你可以随时重置引导教程。',
  'tours.profile.reset': '重置引导教程',
  'tours.profile.notification.success.reset': '引导教程已重置',

  // ── 引导气泡的通用操作 ──────────────────────────────────────────
  'tours.stepCount': '第 {currentStep} 步，共 {tourLength} 步',
  'tours.skip': '跳过',
  'tours.next': '下一步',
  'tours.gotIt': '知道了',

  // ── 任务一：内容类型构建器 ──────────────────────────────────────
  'tours.contentTypeBuilder.Introduction.title': '欢迎使用内容类型构建器！',
  'tours.contentTypeBuilder.Introduction.content': '在这里你可以用集合类型、单类型和可复用组件来创建和管理应用的数据结构。我们开始吧！',
  'tours.contentTypeBuilder.AIChat.title': '准备开始吧！',
  'tours.contentTypeBuilder.AIChat.content': '<p>如果对内容类型构建器或 Strapi 有任何疑问，可以在这里提问。</p><p>Strapi AI 能按你的需求生成对应的模型结构，例如直接提出这些要求：<ul><li>日期选择器</li><li>邮箱和密码字段</li><li>任意类型的媒体</li><li>UID</li></ul></p><p>别犹豫，试试看吧！</p>',
  'tours.contentTypeBuilder.CollectionTypes.title': '集合类型',
  'tours.contentTypeBuilder.CollectionTypes.content': '管理多条内容就靠它 —— 比如博客文章或商品。',
  'tours.contentTypeBuilder.SingleTypes.title': '单类型',
  'tours.contentTypeBuilder.SingleTypes.content': '适合首页、站点设置这类只有一条的内容。',
  'tours.contentTypeBuilder.Components.title': '组件',
  'tours.contentTypeBuilder.Components.content': '一次创建，到处复用。按钮、卡片、轮播这类元素都适合做成组件。',
  'tours.contentTypeBuilder.YourTurn.title': '轮到你了 —— 动手搭建吧！',
  'tours.contentTypeBuilder.YourTurn.content': '试着创建一个集合类型或单类型：点击「+」按钮，填写名称，点「继续」，接下来按引导操作即可。',
  'tours.contentTypeBuilder.AddFields.title': '添加字段，让内容类型活起来',
  'tours.contentTypeBuilder.AddFields.content': '先添加第一个字段 —— 比如名称、图片或关联关系。内容类型得先有结构，才能承载内容。',
  'tours.contentTypeBuilder.Save.title': '别忘了保存！',
  'tours.contentTypeBuilder.Save.content': '点击「保存」按钮确认内容类型，避免白做。就快完成了！',
  'tours.contentTypeBuilder.Finish.title': '第一步：完成！🎉',
  'tours.contentTypeBuilder.Finish.content': '你已经建好第一个内容类型了！接下来去内容管理器添加条目吧！',

  // ── 任务二：内容管理器 ──────────────────────────────────────────
  'tours.contentManager.Introduction.title': '内容管理器',
  'tours.contentManager.Introduction.content': '创建并管理集合类型和单类型中的内容。',
  'tours.contentManager.CreateNewEntry.title': '新建条目',
  'tours.contentManager.CreateNewEntry.content': '点击「新建条目」按钮，为这个集合类型创建并发布一条新内容。',
  'tours.contentManager.Fields.title': '字段',
  'tours.contentManager.Fields.content': '先填写你在内容类型构建器中创建的字段。',
  'tours.contentManager.Publish.title': '发布',
  'tours.contentManager.Publish.content': '然后点击「发布」按钮，让内容通过内容 API 对外可用。',
  'tours.contentManager.FinalStep.title': '该配置 API 令牌了！',
  'tours.contentManager.FinalStep.content': '条目已经创建并发布，接下来配置一个 API 令牌来管理内容访问权限。',

  // ── 任务三：API 令牌 ────────────────────────────────────────────
  'tours.apiTokens.Introduction.title': '最后是 API 令牌',
  'tours.apiTokens.Introduction.content': '用可精细配置的权限来控制 API 访问。',
  'tours.apiTokens.ManageAPIToken.title': '管理 API 令牌',
  'tours.apiTokens.ManageAPIToken.content': '点击「铅笔」图标查看并修改已有的 API 令牌。',
  'tours.apiTokens.ViewAPIToken.title': '查看 API 令牌',
  'tours.apiTokens.ViewAPIToken.content': '点击「查看令牌」按钮查看你的 API 令牌。',
  'tours.apiTokens.CopyAPIToken.title': '复制 API 令牌',
  'tours.apiTokens.CopyAPIToken.content': '点击「复制」按钮保存你的 API 令牌，请求应用接口时需要用到它。{spacer}还有疑问？了解<a>API 令牌</a>的更多用法。',
  'tours.apiTokens.FinalStep.title': '恭喜，可以部署你的应用了！',
  'tours.apiTokens.FinalStep.content': '部署应用、向外界分享内容所需的一切都已就绪。',
};

export default uiTours;
