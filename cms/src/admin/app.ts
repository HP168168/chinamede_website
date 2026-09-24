/**
 * 管理面板定制入口。
 *
 * 中文化的两步法第一步：把简体中文（zh-Hans）加入可选界面语言。
 * `en` 是 Strapi 的回退语言且不可移除，因此这里只做“新增”。
 * 翻译改动后需要重新构建管理面板（npm run build）才会生效。
 *
 * 第二步由使用者完成：登录后进入 个人资料 → 体验(Experience) → 界面语言，
 * 选择「简体中文」并保存。
 */
import { installCourseCoverThumbnail } from './extensions/course-cover-thumbnail';
import { installGenerationTaskCreateLabel } from './extensions/generation-task-create-label';
import { installHideMarketplace } from './extensions/hide-marketplace';
import { installKeywordCategoryLabels } from './extensions/keyword-category-labels';
import { installKeywordCreateLabel } from './extensions/keyword-create-label';
import { installUserContentTypeLabel } from './extensions/user-content-type-label';
import { installKeywordGenerateButton } from './extensions/keyword-generate-button';
import { installGenerationTaskEnumLabels } from './extensions/generation-task-enum-labels';
import { installGenerationTaskRunButton } from './extensions/generation-task-run-button';
import { installGenerationTaskScheduleOnly } from './extensions/generation-task-schedule-only';
import fieldLabels from './translations/field-labels';
import uiAdmin from './translations/ui-admin';
import uiContentManager from './translations/ui-content-manager';
import uiContentTypeBuilder from './translations/ui-content-type-builder';
import uiMediaLibrary from './translations/ui-media-library';
import uiPluginsMisc from './translations/ui-plugins-misc';
import uiTours from './translations/ui-tours';

export default {
  /**
   * 注册自定义字段（前端侧）：
   * 把「生成模式」这类候选值很少的字段渲染成单选（Radio），而不是下拉。
   * 字段在 schema.json 里声明为 customField: "global::radio-enum"，
   * 服务端同名注册见 src/index.ts，两边的 name / type 必须一致。
   */
  register(app: any) {
    app.customFields.register({
      name: 'radio-enum',
      type: 'enumeration',
      intlLabel: {
        id: 'global.radio-enum.label',
        defaultMessage: '单选枚举（Radio）',
      },
      intlDescription: {
        id: 'global.radio-enum.description',
        defaultMessage: '把候选值以单选按钮呈现，候选值取自字段的枚举定义',
      },
      components: {
        Input: async () => import('./components/RadioEnumInput'),
      },
      // 让这个字段类型在「内容类型构建器」里也能配置候选值/默认值/必填
      options: {
        base: [
          {
            name: 'enum',
            type: 'text-area-enum',
            intlLabel: { id: 'global.radio-enum.options.enum.label', defaultMessage: '候选值' },
            description: {
              id: 'global.radio-enum.options.enum.description',
              defaultMessage: '可选值列表，界面上按这里的顺序呈现',
            },
          },
          {
            name: 'default',
            type: 'text',
            intlLabel: { id: 'global.radio-enum.options.default.label', defaultMessage: '默认值' },
            description: {
              id: 'global.radio-enum.options.default.description',
              defaultMessage: '新建条目时的初始选中值',
            },
          },
          {
            name: 'required',
            type: 'checkbox',
            intlLabel: { id: 'global.radio-enum.options.required.label', defaultMessage: '必填' },
            description: {
              id: 'global.radio-enum.options.required.description',
              defaultMessage: '开启后该字段必须选择',
            },
          },
        ],
      },
    });

    /**
     * 「执行时间」：任务计划的排期不再是手写 cron，而是「周期 + 时间 + 星期」的控件。
     * 存进数据库的仍是同一个 cron 字符串，因此调度器 / lifecycles / CLI 都不用改；
     * 表达不了的频率（如每 30 分钟）在控件里选「自定义表达式」手写。
     * schema.json 里声明为 customField: "global::cron-schedule"，服务端同名注册见 src/index.ts。
     */
    app.customFields.register({
      name: 'cron-schedule',
      type: 'string',
      intlLabel: {
        id: 'global.cron-schedule.label',
        defaultMessage: '执行时间',
      },
      intlDescription: {
        id: 'global.cron-schedule.description',
        defaultMessage: '选择执行周期与时间，保存为 cron 表达式',
      },
      components: {
        Input: async () => import('./components/CronScheduleInput'),
      },
    });

    /**
     * 「提示词正文」：普通的 text 类型在后台是多行文本框，写 Markdown 看不出层级。
     * 这里换成左右分栏编辑器，左边写源码、右边实时预览排版效果。
     * 存入数据库的仍是 Markdown 源码，渲染成 HTML 是生成提示词时的事。
     * schema.json 里声明为 customField: "global::markdown"，
     * 服务端同名注册见 src/index.ts，底层类型是 text（不是 string）。
     */
    app.customFields.register({
      name: 'markdown',
      type: 'text',
      intlLabel: {
        id: 'global.markdown.label',
        defaultMessage: 'Markdown 编辑器',
      },
      intlDescription: {
        id: 'global.markdown.description',
        defaultMessage: '支持 Markdown 的编辑器，左侧写源码、右侧实时预览',
      },
      components: {
        Input: async () => import('./components/MarkdownInput'),
      },
    });
  },
  config: {
    locales: ['zh-Hans'],
    // 官方简体中文包（zh-Hans）并不完整：管理面板 919 条英文键里只有 655 条有中文，
    // 各插件（内容管理器 / 媒体库 / 内容类型构建器 / 国际化 / 邮件）缺得更多，
    // 缺的键在界面上会直接回退成英文，所以在这里按模块补齐。
    //
    // 键名与官方语言包一致；插件串需要带插件前缀，例如：
    //   content-manager.actions.edit.label、upload.sidebar.title、
    //   i18n.Settings.locales.row.id、content-manager.content-types.<UID>.<字段名>
    // 改动后需重启/重新构建管理面板才会生效。
    translations: {
      'zh-Hans': {
        ...fieldLabels,
        ...uiAdmin,
        ...uiContentManager,
        ...uiContentTypeBuilder,
        ...uiMediaLibrary,
        ...uiPluginsMisc,
        ...uiTours,
        'app.components.LeftMenu.navbrand.title': '美迪时代内容管理后台',
        'app.components.LeftMenu.navbrand.workplace': '内容管理平台',
        'Auth.form.welcome.title': '欢迎回来',
        'Auth.form.welcome.subtitle': '登录美迪时代教育内容管理后台',
        // 官方简体中文包缺失的首页串（en 697 条 / zh-Hans 489 条），不补则首页回退英文
        'HomePage.header.title': '你好，{name}',
        'HomePage.header.subtitle': '欢迎使用美迪时代内容后台',
        'HomePage.widget.loading': '正在加载小部件内容',
        'HomePage.widget.error': '小部件内容加载失败。',
        'HomePage.addWidget.title': '添加小部件',
        'HomePage.addWidget.noWidgetsAvailable': '暂无可添加的小部件',
        'HomePage.addWidget.button': '添加小部件',
        'HomePage.widget.delete': '删除',
        'HomePage.widget.drag': '拖动排序',
      },
    },
  },
  /**
   * 管理面板的界面微调清单。前九处按内容类型定向、只在自己那一页生效（DOM 监听）；
   * 第 10 处是全局的（注入一条样式规则，对所有页面生效）。
   * 1. 「任务计划」列表页的「新建条目」按钮 → 「创建任务」
   *    （该文案来自全局键，注入区只能新增内容、替换不了它）
   * 2. 「课程」列表页的封面列 → 26px 圆形缩略图，与「校区」封面列一致
   *    （课程封面存的是官网站内路径，media 的缩略图渲染器用不到）
   * 3. 「任务计划」编辑页 → 「立即生成」按钮
   *    （手动生成的入口，调 /api/content-factory/tasks/:id/run）
   * 4. 「任务计划」的「触发方式」下拉 → now/queue/schedule 显示为中文
   *    （枚举值没有翻译键，只能改显示文本，提交的仍是英文值）
   * 5. 「任务计划」编辑页 → 「执行时间」只在触发方式为「定时自动生成」时显示
   *    （另外两种触发方式用不到 cron；而 metadatas 的 visible 是静态的，
   *     且 Strapi 对不可见字段根本不渲染，做不了"按需显示"，所以只能 DOM 控制）
   * 6. 「关键词库」列表页 → 注入「AI 批量扩词」按钮与弹窗
   * 7. 五类关键词的英文值（core/brand/…）→ 下拉与列表里显示中文
   * 8. 「关键词库」列表页与新建页的「新建条目」→ 「新增关键词」
   *    （与第 1 条同因：文案来自全局键，只能在这一页做替换）
   * 9. 左侧导航里 users-permissions 自带的 User 内容类型 → 「用户」
   *    （插件自带内容类型，显示名走不了翻译键，只能按链接 href 定向替换）
   * 10. 隐藏左侧导航的「市场」入口（全局）
   *    （该菜单项硬编码在 @strapi/admin 的 useMenu 里，没有配置可移除；它指向外部站点，
   *      对本项目没有用处，还带一个插件更新的角标）
   */
  bootstrap() {
    installHideMarketplace();
    installGenerationTaskCreateLabel();
    installCourseCoverThumbnail();
    installGenerationTaskRunButton();
    installGenerationTaskEnumLabels();
    installGenerationTaskScheduleOnly();
    installKeywordGenerateButton();
    installKeywordCategoryLabels();
    installKeywordCreateLabel();
    installUserContentTypeLabel();
  },
};
