import { startScheduler, stopScheduler } from './lib/schedule/scheduler';
import { configureContentEditViews } from './lib/admin/edit-view';
import { adminJwtPolicy } from './lib/admin-jwt-policy';

/**
 * Strapi 应用生命周期钩子。
 *
 * 1. 把官网需要的内容类型对「公开角色」开放读取。
 *    这样本地开发即使没配 API Token，`astro build` 也能直接拉到内容；
 *    生产环境仍建议在后台生成一个只读 API Token 交给构建机使用。
 * 2. 编辑页增效：把 schema 里的中文说明同步进后台、系统回写字段设为只读或隐藏
 *    （覆盖定时任务、关键词、提示词三类，规则见 src/lib/admin/edit-view.ts）。
 * 3. 启动内容工厂的内嵌调度器（手动 / 自动 / 定时三种生成方式的执行侧）。
 *
 * 任何失败都不阻断服务启动（官网构建还有快照兜底）。
 */

const PUBLIC_READ_ACTIONS: string[] = [
  // 集合类型：列表 + 详情
  'api::course.course.find',
  'api::course.course.findOne',
  'api::course-category.course-category.find',
  'api::course-category.course-category.findOne',
  'api::teacher.teacher.find',
  'api::teacher.teacher.findOne',
  'api::teacher-level.teacher-level.find',
  'api::teacher-level.teacher-level.findOne',
  'api::news-item.news-item.find',
  'api::news-item.news-item.findOne',
  'api::campus.campus.find',
  'api::campus.campus.findOne',
  'api::article.article.find',
  'api::article.article.findOne',
  'api::faq.faq.find',
  'api::faq.faq.findOne',
  'api::guide.guide.find',
  'api::guide.guide.findOne',
  'api::showcase-section.showcase-section.find',
  'api::showcase-section.showcase-section.findOne',
  // 单类型：只有 find
  'api::site-config.site-config.find',
  'api::navigation.navigation.find',
  'api::page-seo.page-seo.find',
  'api::schema-data.schema-data.find',
];

async function grantPublicReadPermissions(strapi: any) {
  const publicRole = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  if (!publicRole) {
    strapi.log.warn('[meidi-cms] 未找到 public 角色，跳过公开读取权限初始化');
    return;
  }

  const rows = await strapi.db
    .query('plugin::users-permissions.permission')
    .findMany({ where: { role: publicRole.id } });

  const granted = new Set<string>((rows ?? []).map((row: any) => row.action));
  const missing = PUBLIC_READ_ACTIONS.filter((action) => !granted.has(action));

  if (missing.length === 0) return;

  for (const action of missing) {
    await strapi.db
      .query('plugin::users-permissions.permission')
      .create({ data: { action, role: publicRole.id } });
  }

  strapi.log.info(`[meidi-cms] 已开放 ${missing.length} 项公开读取权限`);
}

/**
 * 关闭媒体库的「体积优化」。
 *
 * 该开关存放在插件配置存储里（plugins.ts 里的同名键不会被读取），
 * 上传插件启动时会默认写成 true，也就是用 sharp 以 quality 80 重编码原图。
 * 对本项目有两个实际影响：
 *   1. 客服微信二维码被二次压缩会影响识别率；
 *   2. 官网构建前的媒体同步按「远程大小 == 本地大小」判断是否需要重新下载，
 *      原图被改写后就永远对不上，每次构建都会重复下载。
 * 运营若要改回来：后台 → 设置 → 媒体库 → 打开「启用体积优化」。
 */
async function disableUploadSizeOptimization(strapi: any) {
  const store = strapi.store({ type: 'plugin', name: 'upload', key: 'settings' });
  const settings = (await store.get({})) as Record<string, unknown> | null;

  if (settings?.sizeOptimization === false) return;

  await store.set({ value: { ...(settings ?? {}), sizeOptimization: false } });
  strapi.log.info('[meidi-cms] 已关闭媒体库体积优化，媒体文件保持原始字节');
}

export default {
  /**
   * 注册服务端自定义字段，与 src/admin/app.ts 的前端注册同名同类型。
   * Strapi 启动时会把该字段的 type 由 customField 还原成这里声明的类型，
   * 因此服务端校验、列表过滤等行为与普通字段一致；漏注册会直接启动报错。
   */
  register({ strapi }: { strapi: any }) {
    strapi.customFields.register({
      name: 'radio-enum',
      type: 'enumeration',
    });

    // 「执行时间」：前端是「周期 + 时间」控件，底层仍是字符串（cron 表达式）
    strapi.customFields.register({
      name: 'cron-schedule',
      type: 'string',
    });

    // 「提示词正文」：前端是 Markdown 编辑器（左右分栏实时预览），
    // 底层必须是 text——string 是 varchar(255)，装不下 Markdown 正文
    strapi.customFields.register({
      name: 'markdown',
      type: 'text',
    });

    // 「内容工厂」后台接口的鉴权策略：解析后台登录态（admin JWT）。
    //
    // 为什么在这里手动 add、而不是把文件放进 src/policies/ 目录：
    // 那个目录是**新建**的，而 dev 的增量编译不会监听新建目录，
    // 文件永远进不了 dist，运行时就会报「Policy global::admin-jwt not found」
    // 并让服务反复重启失败（这个坑踩了两次）。
    // register() 早于 bootstrap() 里的 initRouting()，此刻注册必然能被路由解析到。
    //
    // 命名空间写 `global::`，与 Strapi 对 src/policies 的约定保持一致，
    // 所以路由里的写法不变，仍是 `policies: ['global::admin-jwt']`。
    strapi.get('policies').add('global::', {
      'admin-jwt': adminJwtPolicy,
    });
  },

  async bootstrap({ strapi }) {
    try {
      await grantPublicReadPermissions(strapi);
    } catch (error) {
      strapi.log.warn(`[meidi-cms] 公开读取权限初始化跳过：${(error as Error).message}`);
    }

    try {
      await disableUploadSizeOptimization(strapi);
    } catch (error) {
      strapi.log.warn(`[meidi-cms] 媒体库设置初始化跳过：${(error as Error).message}`);
    }

    try {
      await configureContentEditViews(strapi);
    } catch (error) {
      strapi.log.warn(`[meidi-cms] 编辑页优化跳过：${(error as Error).message}`);
    }

    try {
      await startScheduler(strapi);
    } catch (error) {
      strapi.log.warn(`[meidi-cms] 内容工厂调度器启动失败：${(error as Error).message}`);
    }
  },

  destroy() {
    stopScheduler();
  },
};
