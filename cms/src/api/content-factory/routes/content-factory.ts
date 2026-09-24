/**
 * 内容工厂的自定义路由（不属于任何内容类型，只提供操作入口）。
 *
 * ⚠️ 鉴权走 `auth: false` + 自定义策略 `global::admin-jwt`，
 * 而不是内置的 `admin::isAuthenticatedAdmin`。原因写在
 * src/lib/admin-jwt-policy.ts 的头部，这里简述：
 *
 *   1. `src/api/**` 下的路由类型被 Strapi 写死为 content-api
 *      （register-routes.js 里 `router.type = 'content-api'`），
 *      在文件里写 `type: 'admin'` 会被直接忽略——试过，无效。
 *   2. content-api 类型只挂 api-token / users-permissions 策略，
 *      **不会解析 admin 的 JWT**，所以后台按钮永远收到 401
 *      「Missing or invalid credentials」。
 *
 * `auth: false` 并不代表接口公开：认证完全由该策略负责，
 * 校验不过会抛 401，仍然只有登录后台的人能调用。
 */
export default {
  routes: [
    {
      // 后台「立即生成」按钮触发的手动生成
      method: 'POST',
      path: '/content-factory/tasks/:documentId/run',
      handler: 'content-factory.runTask',
      config: {
        auth: false,
        policies: ['global::admin-jwt'],
      },
    },
    {
      // 内容工厂运行状态（调度器是否启用、下次执行时间等）
      method: 'GET',
      path: '/content-factory/status',
      handler: 'content-factory.status',
      config: {
        auth: false,
        policies: ['global::admin-jwt'],
      },
    },
    {
      // 关键词库：围绕核心种子词批量扩词。模型调用同步等待结果，
      // 耗时通常在十几秒到一分钟，前端弹窗在此期间显示加载态。
      method: 'POST',
      path: '/content-factory/keywords/expand',
      handler: 'content-factory.expandKeywords',
      config: {
        auth: false,
        policies: ['global::admin-jwt'],
      },
    },
  ],
};
