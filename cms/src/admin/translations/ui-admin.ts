/**
 * 管理面板框架层的中文串：左侧主菜单、设置页、通用按钮与提示。
 *
 * 背景：Strapi 5.54 自带的简体中文包（`@strapi/admin` 的 zh-Hans）只有 655 条，
 * 英文包 919 条，缺的这部分在界面上会回退成英文（菜单项、按钮、弹窗提示）。
 * 这里把「界面上看得见」的缺口补齐，由 `app.ts` 合并进 `config.translations['zh-Hans']`。
 *
 * 维护约定：
 * - 键名必须与官方英文包一致（`node_modules/@strapi/admin/dist/admin/admin/src/translations/en.json.js`）。
 * - 带占位符的串（`{name}`、`{count}` 等）占位符必须原样保留。
 * - 纯示例值（如 `_blank, _self` 这类候选值）不翻译，保持原样。
 * - 只补官方缺的，官方已有的键不重复写（重复会被官方包覆盖或覆盖官方包，难以排查）。
 */
const uiAdmin: Record<string, string> = {
  // ── 首页小部件（app.ts 里已有的 HomePage.* 不在此重复） ──────────────
  'HomePage.widget.no-data': '暂无内容',
  'HomePage.widget.no-permissions': '你没有查看该小部件的权限',

  // ── 通用词 ────────────────────────────────────────────────────────
  'global.home': '首页',
  'global.error': '出错了',
  'global.more': '更多',
  'global.new': '新建',
  'global.learn-more': '了解更多',
  'global.last-change.undo': '撤销上一步',
  'global.last-change.redo': '重做上一步',
  'global.last-changes.discard': '放弃未保存的更改',
  'global.localeToggle.label': '选择界面语言',
  // ── 官方中文包「有」这些键、但值本身仍是英文 ─────────────────────
  // 这类缺口不会被 check:i18n 的「官方中文缺」检查发现（因为键确实存在），
  // 只能靠界面排查捞出来：用户列表的状态列、设置菜单的 Webhook 等。
  // 注：下面三个 active 官方译作「激活」，这里统一成「已启用」，与列表状态列口径一致。
  'Auth.form.active.label': '已启用',
  'app.containers.Users.EditPage.form.active.label': '已启用',
  'Settings.permissions.users.active': '已启用',
  'Settings.webhooks.title': 'Webhook 钩子',
  'Settings.webhooks.singular': '事件钩子',
  'global.profile.settings': '个人资料设置',
  'global.sessions.active-devices': '活跃设备',
  'global.fullname': '{firstname} {lastname}',

  // ── 应用级提示 ────────────────────────────────────────────────────
  'app.confirm.body': '确定吗？',
  'app.utils.refresh': '刷新',
  'app.utils.update-filter': '更新筛选条件',
  'app.utils.published': '已发布',
  'app.utils.ready-to-publish': '可发布',
  'app.utils.already-published': '已发布',
  'app.utils.ready-to-publish-changes': '可发布更改',
  'app.utils.ready-to-unpublish-changes': '可取消发布',
  'app.session.ended.title': '会话已结束',
  'app.error.chunk.title': '该页面加载失败',
  'app.error.chunk.reload': '重新加载页面',
  'app.HeaderLayout.docLink.label': '查看官方文档',
  'noPreview': '暂无预览',

  // ── 通用组件 ──────────────────────────────────────────────────────
  'app.components.Select.placeholder': '请选择',
  'app.components.ToggleCheckbox.enabled-label': '已启用',
  'app.components.ToggleCheckbox.disabled-label': '已禁用',
  'components.ViewSettings.tooltip': '视图设置',
  'components.premiumFeature.title': '付费功能',

  // ── 筛选条件运算符 ─────────────────────────────────────────────────
  'components.FilterOptions.FILTER_TYPES.$eqi': '等于（不区分大小写）',
  'components.FilterOptions.FILTER_TYPES.$nei': '不等于（不区分大小写）',
  'components.FilterOptions.FILTER_TYPES.$containsi': '包含（不区分大小写）',
  'components.FilterOptions.FILTER_TYPES.$notContainsi': '不包含（不区分大小写）',
  'components.FilterOptions.FILTER_TYPES.$startsWithi': '以…开头（不区分大小写）',
  'components.FilterOptions.FILTER_TYPES.$endsWithi': '以…结尾（不区分大小写）',

  // ── 表单校验提示 ───────────────────────────────────────────────────
  'components.Input.error.validation.string': '这不是有效的文本。',
  'components.Input.error.validation.combobox.invalid': '提供的值无效',
  'components.Input.error.contain.maxBytes': '密码必须少于 73 个字节',
  'components.Input.error.validation.required.withField': '{field} 为必填项。',
  'components.Input.error.validation.email.withField': '{field} 不是有效的邮箱地址',
  'components.Input.error.validation.json.withField': '{field} 不符合 JSON 格式',
  'components.Input.error.validation.lowercase.withField': '{field} 必须为小写字符串',
  'components.Input.error.validation.regex.withField': '{field} 不符合正则要求。',
  'components.Input.error.validation.unique.withField': '{field} 已被使用。',
  'components.Input.error.validation.min.withField': '{field} 过小。',
  'components.Input.error.validation.max.withField': '{field} 过大。',
  'components.Input.error.validation.minLength.withField': '{field} 过短。',
  'components.Input.error.validation.maxLength.withField': '{field} 过长。',
  'components.Input.error.validation.minSupMax.withField': '{field} 不能超出上限',

  // ── 富文本区块编辑器 ───────────────────────────────────────────────
  'components.Blocks.modifiers.bold': '加粗',
  'components.Blocks.modifiers.italic': '斜体',
  'components.Blocks.modifiers.underline': '下划线',
  'components.Blocks.modifiers.strikethrough': '删除线',
  'components.Blocks.modifiers.code': '行内代码',
  'components.Blocks.link': '链接',
  'components.Blocks.expand': '展开',
  'components.Blocks.collapse': '收起',
  'components.Blocks.popover.text': '文字',
  'components.Blocks.popover.text.placeholder': '输入链接文字',
  'components.Blocks.popover.link': '链接',
  'components.Blocks.popover.link.placeholder': '粘贴链接',
  'components.Blocks.popover.link.rel': 'Rel（可选）',
  'components.Blocks.popover.link.rel.placeholder': 'noopener, nofollow, noreferrer',
  'components.Blocks.popover.link.target': 'Target（可选）',
  'components.Blocks.popover.link.target.placeholder': '_blank, _self, _parent, _top',
  'components.Blocks.popover.link.error': '请输入有效的链接',
  'components.Blocks.popover.edit': '编辑',
  'components.Blocks.popover.remove': '移除',
  'components.Blocks.blocks.selectBlock': '选择区块',
  'components.Blocks.blocks.text': '文本',
  'components.Blocks.blocks.heading1': '标题 1',
  'components.Blocks.blocks.heading2': '标题 2',
  'components.Blocks.blocks.heading3': '标题 3',
  'components.Blocks.blocks.heading4': '标题 4',
  'components.Blocks.blocks.heading5': '标题 5',
  'components.Blocks.blocks.heading6': '标题 6',
  'components.Blocks.blocks.code': '代码块',
  'components.Blocks.blocks.code.languageLabel': '选择语言',
  'components.Blocks.blocks.quote': '引用',
  'components.Blocks.blocks.image': '图片',
  'components.Blocks.blocks.unorderedList': '无序列表',
  'components.Blocks.blocks.orderedList': '有序列表',
  'components.Blocks.dnd.reorder': '{item} 已移动。编辑器中的新位置：{position}。',
  'components.Wysiwyg.blocks.code': '代码',

  // ── 设置：管理令牌 / API 令牌 ───────────────────────────────────────
  'Settings.adminTokens.title': '管理令牌',
  'Settings.adminTokens.create': '新建管理令牌',
  'Settings.adminTokens.addFirstToken': '创建你的第一个管理令牌',
  'Settings.adminTokens.createPage.title': '新建管理令牌',
  'Settings.adminTokens.editPage.title': '编辑管理令牌',
  'Settings.adminTokens.emptyStateLayout': '你还没有任何内容…',
  'Settings.adminTokens.ListView.headers.name': '名称',
  'Settings.adminTokens.ListView.headers.description': '描述',
  'Settings.adminTokens.ListView.headers.createdAt': '创建时间',
  'Settings.adminTokens.ListView.headers.lastUsedAt': '最近使用',
  'Settings.adminTokens.ListView.headers.owner': '归属',
  'Settings.tokens.copy.title': '令牌',
  'Settings.tokens.form.owner': '归属',
  'Settings.apiTokens.copy.lastWarning': '复制你的令牌',
  'notification.success.adminTokenCreated': '管理令牌创建成功',
  'notification.success.adminTokenEdited': '管理令牌修改成功',

  // ── 设置：活跃设备（会话） ──────────────────────────────────────────
  'Settings.sessions.title': '活跃设备',
  'Settings.sessions.device': '设备',
  'Settings.sessions.loginAt': '登录时间',
  'Settings.sessions.lastActiveAt': '最近使用',
  'Settings.sessions.actions': '操作',
  'Settings.sessions.current': '本次设备',
  'Settings.sessions.unknownDevice': '未知设备',
  'Settings.sessions.revoke': '结束会话',
  'Settings.sessions.revoke.success': '会话已结束',
  'Settings.sessions.revokeOthers': '退出其他设备',
  'Settings.sessions.revokeOthers.success': '其他会话已结束',
  'Settings.sessions.revokeAll': '退出所有设备',

  // ── 设置：个人资料 ─────────────────────────────────────────────────
  'Settings.profile.form.section.experience.mode.option-system-label': '跟随系统设置',

  // ── 设置：审计日志（企业版，界面上出现概率低，一并补上） ──────────────
  'Settings.permissions.auditLogs.audit-log.export': '导出审计日志',
  'Settings.permissions.auditLogs.listview.export': '导出为 CSV',
  'Settings.permissions.auditLogs.listview.export.error': '导出失败，请重试。',
  'Settings.permissions.auditLogs.listview.export.error.forbidden': '你没有导出审计日志的权限。',
  'Settings.permissions.auditLogs.listview.export.error.tooLarge': '表格过大，无法导出。请添加筛选条件后重试。',
  'Settings.permissions.auditLogs.listview.export.progress.title': '正在导出审计日志',
  'Settings.permissions.auditLogs.listview.export.ready.title': '导出完成',
  'Settings.permissions.auditLogs.listview.export.ready.download': '下载 CSV',
  'Settings.permissions.auditLogs.locale.create': '创建语言',
  'Settings.permissions.auditLogs.locale.update': '修改语言',
  'Settings.permissions.auditLogs.locale.delete': '删除语言',
  'Settings.permissions.auditLogs.locale.default.update': '修改默认语言',
  'Settings.permissions.auditLogs.release.create': '创建发布',
  'Settings.permissions.auditLogs.release.update': '修改发布',
  'Settings.permissions.auditLogs.release.delete': '删除发布',
  'Settings.permissions.auditLogs.release.trigger': '触发发布',
  'Settings.permissions.auditLogs.release.entry.add': '向发布添加条目',
  'Settings.permissions.auditLogs.release.entry.update': '修改发布中的条目',
  'Settings.permissions.auditLogs.release.entry.remove': '从发布中移除条目',
  'Settings.permissions.auditLogs.release.settings.update': '修改发布设置',

  // ── 套餐 / 试用期相关弹窗 ───────────────────────────────────────────
  'Settings.application.plan-title': '当前套餐',
  'Settings.content-history.title': '内容历史',
  'Settings.page.purchase.upgrade.cta': '升级',
  'Settings.page.purchase.learn-more.cta': '了解更多',
  'Settings.page.PurchaseSSO.description': '为团队简化登录认证',
  'Settings.page.PurchaseSSO.perks1': '统一认证',
  'Settings.page.PurchaseSSO.perks2': '更强的安全性',
  'Settings.page.PurchaseSSO.perks3': '支持 Webhook',
  'Settings.page.PurchaseAudit-logs.description': '与团队一起追踪和审阅改动',
  'Settings.page.PurchaseAudit-logs.perks1': '轻松追踪改动',
  'Settings.page.PurchaseAudit-logs.perks2': '便捷审阅改动',
  'Settings.page.PurchaseAudit-logs.perks3': '满足安全与合规要求',
  'Settings.page.PurchaseContent-history.description': '一键还原内容改动',
  'Settings.page.PurchaseContent-history.perks1': '浏览内容历史',
  'Settings.page.PurchaseContent-history.perks2': '一键还原改动',
  'Settings.page.PurchaseContent-history.perks3': '跨语言追踪改动',
  'app.components.FreeTrialEndedModal.title': '试用期已结束',
  'app.components.FreeTrialEndedModal.notice.title': '请注意：',
  'app.components.FreeTrialEndedModal.notice.item1': '降级后将失去上述功能的访问权限。',
  'app.components.FreeTrialEndedModal.notice.item2': '文档版本历史将被删除。',
  'app.components.FreeTrialEndedModal.notice.item3': '所有发布记录将被清空。',
  'app.components.FreeTrialEndedModal.button.downgrade': '降级到社区版',
  'app.components.FreeTrialEndedModal.button.upgrade': '继续使用 Growth 套餐',
  'app.components.FreeTrialWelcomeModal.title': '很高兴你的加入',
  'app.components.FreeTrialWelcomeModal.button': '开始体验',
  'app.components.LeftMenu.trialCountdown.endsAt': '试用期将于 {date} 结束。',
  'app.components.LeftMenu.trialCountdown.endedAt': '试用期已于 {date} 结束。',
  'app.components.UpsellBanner.intro': 'Growth 套餐功能：',
  'app.components.UpsellBanner.button': '立即升级',
  'app.components.UpsellBanner.close': '关闭横幅。',
  'app.components.UpsellBanner.reopen': '重新打开横幅。',

  // ── 媒体库新版上线横幅 / 问卷 ───────────────────────────────────────
  'app.components.MediaLibraryBanner.intro': '全新媒体库上线',
  'app.components.MediaLibraryBanner.text.enabled': '你正在使用全新版本。',
  'app.components.MediaLibraryBanner.button': '文档',
  'app.components.MediaLibraryBanner.button.enabled': '阅读博客文章',
  'app.components.MediaLibraryBanner.close': '关闭横幅。',
  'app.components.NpsSurvey.feedback-question': '你对改进有什么建议吗？',
  'app.components.NpsSurvey.feedback-response': '非常感谢你的反馈！',
  'app.components.NpsSurvey.submit-feedback': '提交反馈',
  'app.components.NpsSurvey.dismiss-survey-label': '关闭问卷',
  'app.components.NpsSurvey.select-rating': '选择评分',
  'app.components.NpsSurvey.no-recommendation': '完全不可能',
  'app.components.NpsSurvey.happy-to-recommend': '极有可能',

  // ── 后台报错 / 会话 / 试用期 ─────────────────────────────────────
  'app.error.chunk.message': '后台无法加载某个界面。这通常发生在服务正在启动或连接中断时。请刷新页面重试。如果你刚部署过新版本，可能需要强制刷新以加载最新版本。',
  'app.session.ended.unsaved': '你的会话已结束且无法恢复。退出登录后，未保存的更改将会丢失。',
  'app.components.FreeTrialEndedModal.description': '你对 Growth 套餐功能（内容历史、发布、单点登录 SSO）的访问权限已过期。',
  'app.components.FreeTrialEndedModal.notice.item4': '如果降级，请务必设置一个 root 管理员密码，以保留对后台的访问权限。',
  'app.components.FreeTrialWelcomeModal.description1': '接下来的 30 天，你可以完整使用内容历史、发布、单点登录（SSO）等高级功能 —— 探索 Strapi CMS 所需的全部能力。',
  'app.components.FreeTrialWelcomeModal.description2': '利用这段时间自由地搭建、定制并测试你的内容工作流！',
  'app.components.NpsSurvey.banner-title': '你有多大可能把 Strapi 推荐给朋友或同事？',
  'app.components.MediaLibraryBanner.text': '查看文档，了解如何切换到新版本。',
  'app.components.UpsellBanner.text': '在试用期内，你可以体验内容历史、发布和单点登录（SSO）等高级工具。',

  // ── 区块编辑器（Blocks）拖拽说明 ──────────────────────────────────
  'components.Blocks.dnd.instruction': '要调整区块顺序，请同时按下 Command 或 Control、Shift 与上下方向键',

  // ── 设置：会话管理 ────────────────────────────────────────────────
  'Settings.sessions.subtitle': '以下是当前登录到你账号的设备与会话。',
  'Settings.sessions.revoke.confirm': '确定要结束该会话吗？该设备需要重新登录。',
  'Settings.sessions.revoke.confirmCurrent': '这是你当前正在使用的设备。结束该会话会把你登出。',
  'Settings.sessions.revokeOthers.confirm': '确定吗？这会结束其它所有活动会话，你将保持在本设备登录状态。',
  'Settings.sessions.revokeAll.confirm': '确定吗？这会结束所有活动会话（包括当前会话），你需要重新登录。',

  // ── 设置：API 令牌 / 权限 / 单点登录 / 内容历史 ────────────────────
  'Settings.adminTokens.description': '用于以编程方式访问后台功能的令牌列表',
  'Settings.roles.form.permissions.locales.validation': '{count, plural, one {{actions} 操作必须至少应用于一种语言。} other {{actions} 操作必须至少应用于一种语言。}}',
  'Settings.permissions.auditLogs.listview.export.leave': '确定要离开吗？正在进行的导出将被取消。',
  'Settings.permissions.auditLogs.listview.export.progress.caption': '正在准备导出 —— {fetched, number}/{total, plural, one {# 条事件} other {# 条事件}}',
  'Settings.permissions.auditLogs.not-available': '审计日志属于付费版功能。升级后可获得可搜索、可筛选的全部活动记录。',
  'Settings.sso.not-available': 'SSO 属于付费版功能。升级后可为后台配置额外的登录与注册方式。',
  'Settings.content-history.description': '更全面地掌控内容生命周期的每一步。',
  'Settings.content-history.not-available': '内容历史属于付费版功能。升级后可完全掌控内容的生命周期。',

  // 5.55 新增：审计日志里记录的令牌操作
  'Settings.permissions.auditLogs.token.create': '创建令牌',
  'Settings.permissions.auditLogs.token.delete': '删除令牌',
  'Settings.permissions.auditLogs.token.regenerate': '重新生成令牌',
  'Settings.permissions.auditLogs.token.update': '更新令牌',

  // ── 首页小部件 ────────────────────────────────────────────────────
  'widget.key-statistics.title': '项目统计',
  'widget.key-statistics.list.admins': '管理员',
  'widget.key-statistics.list.apiTokens': 'API 令牌',
  'widget.key-statistics.list.assets': '素材',
  'widget.key-statistics.list.components': '组件',
  'widget.key-statistics.list.contentTypes': '内容类型',
  'widget.key-statistics.list.entries': '条目',
  'widget.key-statistics.list.locales': '语言',
  'widget.key-statistics.list.webhooks': 'Webhook',
  'widget.last-activity.title': '最近活动',
  'widget.last-activity.no-activity': '暂无活动',
  'widget.last-activity.link': '打开审计日志',
  'widget.profile.title': '个人资料',
};

export default uiAdmin;
