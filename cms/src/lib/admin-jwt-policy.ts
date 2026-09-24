import { errors } from '@strapi/utils';

/**
 * 让「内容工厂」的自定义接口接受后台登录态（admin JWT）。
 *
 * ── 为什么需要这个文件 ──
 *
 * 这些接口是给后台按钮用的（「立即生成」「AI 批量扩词」），调用方带的是
 * 后台登录拿到的 JWT。但 Strapi 的认证策略是**按路由类型挑选**的
 * （见 @strapi/core 的 createAuthentication：`strategies[route.info.type]`），
 * 而路由类型在 register-routes.js 里被写死：
 *
 *     // admin 路由： router.type = router.type || 'admin';
 *     // 插件路由：  router.type = router.type ?? 'admin';
 *     // API 路由：  router.type = 'content-api';     ← 强制，改不动
 *
 * 也就是说 `src/api/**` 下的路由**永远是 content-api 类型**，只会走
 * api-token / users-permissions 策略，**永远不会解析 admin 的 JWT**。
 * 而 `admin::isAuthenticatedAdmin` 这个 policy 的实现只有一行
 * `Boolean(ctx.state.isAuthenticated)`——它只负责「读」这个标记，
 * 不负责「写」，光配它并不能把 admin 身份认出来。
 *
 * 结果就是：后台按钮拿到的永远是 401「Missing or invalid credentials」，
 * 哪怕浏览器里的 token 完全正常、admin 自己的请求也都正常。
 *
 * ── 做法 ──
 *
 * 把 admin 那套校验「移植」成一个 content-api 也能用的策略函数，
 * 在路由上以 `auth: false` + `policies: [adminJwtPolicy]` 显式启用。
 * 校验逻辑与 @strapi/admin 的 strategies/admin.js 保持一致：
 * 交给 sessionManager 验签 → 要求会话仍然活跃 → 要求管理员账号是启用状态。
 *
 * 之所以不直接 import 官方那个策略对象：@strapi/admin 的 package.json
 * 用 exports 限制了子路径，`require('@strapi/admin/dist/...')` 会报
 * ERR_PACKAGE_PATH_NOT_EXPORTED，拿不到。
 */

/** 从 Authorization 头里取出 Bearer token；格式不对返回 null */
function readBearerToken(ctx: any): string | null {
  const authorization: string | undefined = ctx?.request?.header?.authorization;
  if (!authorization) return null;

  const parts = authorization.split(/\s+/);
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return null;

  return parts[1] || null;
}

/**
 * 校验 admin JWT 并写入 `ctx.state`，使后续 policy（如 admin::isAuthenticatedAdmin）
 * 与需要 `ctx.state.user` 的逻辑都能正常工作。
 */
async function authenticateAdmin(ctx: any, strapi: any): Promise<any> {
  const token = readBearerToken(ctx);
  if (!token) {
    throw new errors.UnauthorizedError('缺少或格式不对的 Authorization 头');
  }

  // sessionManager 由 Strapi 5 的会话功能提供，负责 access token 的签发与校验
  const sessionManager = strapi?.sessionManager;
  if (typeof sessionManager !== 'function') {
    throw new errors.UnauthorizedError('服务端未启用会话管理，无法校验后台登录态');
  }

  const adminSessions = sessionManager('admin');
  const result = adminSessions?.validateAccessToken?.(token);

  if (!result?.isValid) {
    throw new errors.UnauthorizedError('后台登录令牌已失效，请重新登录后再试');
  }

  // 令牌签名有效还不够：会话可能已被登出或过期
  const isActive = await adminSessions.isSessionActive(result.payload?.sessionId);
  if (!isActive) {
    throw new errors.UnauthorizedError('登录会话已过期，请重新登录后再试');
  }

  // 与官方策略一致：字符串形式的数字 id 要转回数字，否则查不到用户
  const rawUserId = result.payload?.userId;
  const numericUserId = Number(rawUserId);
  const userId =
    Number.isFinite(numericUserId) && String(numericUserId) === rawUserId ? numericUserId : rawUserId;

  const user = await strapi.db.query('admin::user').findOne({
    where: { id: userId },
    populate: ['roles'],
  });

  if (!user || user.isActive !== true) {
    throw new errors.UnauthorizedError('后台账号不存在或已被停用');
  }

  // 写回 state，行为与官方 admin 策略保持一致
  ctx.state.isAuthenticated = true;
  ctx.state.user = user;
  ctx.state.session = { id: result.payload?.sessionId };
  ctx.state.userAbility = await strapi.service('admin::permission').engine.generateUserAbility(user);

  return { authenticated: true, credentials: user, ability: ctx.state.userAbility };
}

/**
 * 路由策略（policy）入口。
 *
 * 抛 UnauthorizedError 而不是返回 false：前者给出 401 与具体原因，
 * 后者只会变成一句笼统的 403，对排查没有任何帮助——这一点是有过教训的。
 */
export const adminJwtPolicy = async (ctx: any, _config: unknown, { strapi }: any) => {
  try {
    await authenticateAdmin(ctx, strapi);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    strapi?.log?.warn(`[content-factory] 后台接口鉴权失败：${message}`);
    throw error;
  }
};

export default adminJwtPolicy;
