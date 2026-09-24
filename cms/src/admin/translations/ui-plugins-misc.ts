/**
 * 其余启用的插件界面中文串：国际化的语言切换、邮件设置、用户与权限。
 *
 * 键名前缀：运行时分别为 `i18n.`、`email.`、`users-permissions.`。
 * 取自各自 `dist/admin/translations/en.json.js` 中官方缺中文的键。
 */
const uiPluginsMisc: Record<string, string> = {
  // ── 国际化（i18n） ────────────────────────────────────────────────
  'i18n.actions.select-locale': '选择语言',
  'i18n.actions.delete.label': '删除条目（{locale}）',
  'i18n.actions.delete.dialog.title': '确认',
  'i18n.actions.delete.dialog.body': '确定要删除该语言吗？',
  'i18n.CMEditViewCopyLocale.cancel-text': '不，取消',
  'i18n.CMEditViewCopyLocale.dialog.title': '确认',
  'i18n.CMEditViewCopyLocale.dialog.field.label': '语言',
  'i18n.CMEditViewCopyLocale.dialog.field.placeholder': '选择一种语言…',
  'i18n.CMEditViewBulkLocale.publish-title': '发布多个语言版本',
  'i18n.CMEditViewBulkLocale.unpublish-title': '取消发布多个语言版本',
  'i18n.CMEditViewBulkLocale.status': '状态',
  'i18n.CMEditViewBulkLocale.publication-status': '发布状态',
  'i18n.CMEditViewBulkLocale.continue-confirmation': '确定要继续吗？',
  'i18n.CMEditViewAITranslation.status-aria-label': 'AI 翻译状态',
  'i18n.CMEditViewAITranslation.job-completed': 'AI 翻译已成功完成！',
  'i18n.CMEditViewAITranslation.job-failed': 'AI 翻译失败，请重试。',
  'i18n.CMEditViewLocalePicker.locale.create': '创建 <bold>{locale}</bold> 语言',
  'i18n.CMEditViewLocalePicker.locale.ai-translations': 'AI 翻译：',
  'i18n.CMListView.popover.display-locales.label': '显示已翻译的语言',
  'i18n.CMListView.popover.display-locales.more': '{locales} 等 {count} 个',
  'i18n.Settings.aiLocalizations.label': 'AI 翻译',
  'i18n.Settings.locales.default': '默认',
  'i18n.Settings.locales.list.sort.default': '按默认语言排序',
  'i18n.Settings.locales.list.sort.displayName': '按显示名称排序',
  'i18n.Settings.locales.list.sort.id': '按 ID 排序',
  'i18n.Settings.locales.modal.create.code.error': '请选择一种语言',
  'i18n.Settings.locales.modal.create.name.error.min': '语言显示名称不能超过 50 个字符。',
  'i18n.Settings.locales.modal.create.name.error.required': '请为该语言填写显示名称',
  'i18n.Settings.locales.row.displayName': '显示名称',
  'i18n.Settings.locales.row.id': 'ID',
  'i18n.list-view.table.header.label': '可用于',

  // ── 邮件设置（email） ─────────────────────────────────────────────
  'email.Settings.email.plugin.button.verify': '测试连接',
  'email.Settings.email.plugin.label.senderName': '默认发件人名称',
  'email.Settings.email.plugin.label.replyToName': '默认回复人名称',
  'email.Settings.email.plugin.label.verifyConnection': '连接状态',
  'email.Settings.email.plugin.status.connected': '已连接',
  'email.Settings.email.plugin.status.error': '错误',
  'email.Settings.email.plugin.placeholder.defaultFrom': '例如：美迪时代 <no-reply@example.com>',
  'email.Settings.email.plugin.placeholder.defaultReplyTo': '例如：美迪时代 <example@example.com>',
  'email.Settings.email.plugin.placeholder.testAddress': '例如：developer@example.com',
  'email.Settings.email.plugin.notification.data.loaded': '邮件设置数据已加载',
  'email.Settings.email.plugin.notification.config.error': '获取邮件配置失败',
  'email.Settings.email.plugin.notification.test.success': '邮件测试成功，请检查 {to} 邮箱',
  'email.Settings.email.plugin.notification.test.error': '向 {to} 发送测试邮件失败',
  'email.Settings.email.plugin.notification.verify.success': '连接校验成功',
  'email.Settings.email.plugin.notification.verify.error': '连接校验失败',
  'email.components.Input.error.validation.email': '这不是有效的邮箱地址',

  // ── 用户与权限（users-permissions） ───────────────────────────────
  'users-permissions.Email.template.reset_password': '重置密码',
  'users-permissions.Settings.roles.created': '角色已创建',

  // ── 国际化（i18n）：删除、复制语言、AI 翻译 ────────────────────────
  'i18n.actions.delete.error': '删除文档语言时出错。',
  'i18n.CMEditViewCopyLocale.dialog.body': '当前内容将被所选语言的内容覆盖并替换为：',
  'i18n.CMEditViewBulkLocale.draft-relation-warning': '有些语言关联了草稿条目。发布它们可能会在你的应用中留下失效链接。',
  'i18n.CMEditViewAITranslation.status-title': '{enabled, select, true {AI 翻译已开启} false {AI 翻译已关闭} other {AI 翻译已关闭}}',
  'i18n.CMEditViewAITranslation.status-description': '每次你在默认语言中保存修改时，我们的 AI 都会自动翻译所有语言的内容。',
  'i18n.CMEditViewAITranslation.settings-link': '{enabled, select, true {在设置中关闭} false {在设置中开启} other {在设置中开启}}',
  'i18n.Settings.list.actions.publishAdditionalInfos': '这会同时发布各语言的生效版本<em>（来自国际化插件）</em>',
  'i18n.Settings.list.actions.unpublishAdditionalInfos': '这会同时取消发布各语言的生效版本<em>（来自国际化插件）</em>',
  'i18n.Settings.aiLocalizations.description': '每次你在内容管理器里保存时，AI 都会用默认语言自动翻译其它所有语言。',

  // ── 邮件设置（email）：服务商能力 ─────────────────────────────────
  'email.Settings.capabilities.title': '服务商能力',
  'email.Settings.capabilities.subtitle': '当前 SMTP 配置与已启用的功能',
  'email.Settings.capabilities.label.smtpServer': 'SMTP 服务器',
  'email.Settings.capabilities.label.encryption': '加密方式',
  'email.Settings.capabilities.label.authType': '认证方式',
  'email.Settings.capabilities.label.poolStatus': '连接池状态',
  'email.Settings.capabilities.label.features': '已启用功能',
  'email.Settings.capabilities.poolStatus.idle': '空闲',
  'email.Settings.capabilities.poolStatus.active': '活跃',
  'email.Settings.capabilities.feature.dkim': 'DKIM',
  'email.Settings.capabilities.feature.pool': '连接池',
  'email.Settings.capabilities.feature.rateLimiting': '限流',
  'email.Settings.capabilities.feature.oauth2': 'OAuth2',
  'email.Settings.capabilities.feature.requireTLS': '强制 TLS',
};

export default uiPluginsMisc;
