/**
 * 读取后台登录令牌（admin JWT）。
 *
 * ⚠️ 必须同时覆盖两个存储位置，这是踩过坑之后写下的，别退回只读一个：
 * @strapi/admin 依据「登录时有没有勾『记住我』」决定存哪里，见
 * node_modules/@strapi/admin/dist/admin/admin/src/utils/getFetchClient.js：
 *
 *   - 勾了「记住我」：localStorage['jwtToken'] = JSON.stringify(token)
 *   - 没勾（会话模式）：cookie 'jwtToken' = token
 *
 * 第一版只读了 localStorage，于是没勾「记住我」的账号拿到的是空串，
 * 请求被 admin::isAuthenticatedAdmin 拒掉，界面报
 * 「Missing or invalid credentials」——排查时很容易误以为是权限配置问题。
 *
 * 还有两个容易踩的点：
 *   1. localStorage 里存的是 **JSON 字符串**（带引号）。直接把原值塞进
 *      Authorization 头，会把引号一起发出去，同样被拒，必须 JSON.parse 还原。
 *   2. 浏览器隐私模式下访问 localStorage 可能直接抛异常，所以要 try 住。
 *
 * cookie 名与 storage 键名都是 'jwtToken'（可被 admin.auth.cookie.name 配置覆盖，
 * 本项目未覆盖，用默认值）。若将来改了该配置，这里要同步。
 */
const STORAGE_KEY = 'jwtToken';

function readFromLocalStorage(): string {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return '';

    // 正常路径：写入侧做过 JSON.stringify
    try {
      const parsed: unknown = JSON.parse(stored);
      if (typeof parsed === 'string' && parsed) return parsed;
    } catch {
      // 不是合法 JSON（更早的版本直接存原文）：继续走下面的兜底
    }

    const raw = stored.replace(/^"|"$/g, '');
    return raw && raw !== 'null' ? raw : '';
  } catch {
    return '';
  }
}

function readFromCookie(): string {
  try {
    const prefix = `${STORAGE_KEY}=`;
    const hit = document.cookie.split('; ').find((item) => item.startsWith(prefix));
    if (!hit) return '';

    const value = decodeURIComponent(hit.slice(prefix.length));
    return value && value !== 'null' ? value : '';
  } catch {
    return '';
  }
}

/**
 * 取 admin JWT。两处都拿不到时返回空串，调用方需要显式处理——
 * 空 token 发出去只会得到 401/403，不如提前给出「请重新登录」的提示。
 */
export function getAdminToken(): string {
  return getAdminTokenWithSource().token;
}

export type AdminTokenSource = 'localStorage' | 'cookie' | 'none';

export interface AdminTokenResult {
  token: string;
  source: AdminTokenSource;
}

/**
 * 连同「从哪里取到的」一起返回。
 *
 * 用途是诊断：鉴权失败时把它写进用户可见的提示里，
 * 就能区分「压根没取到令牌」和「取到了但服务端不认（已过期 / 类型不对）」这两种完全不同的故障，
 * 不必要求使用者打开控制台去翻。长度也不是令牌本身，可以安全地显示出来。
 */
export function getAdminTokenWithSource(): AdminTokenResult {
  const fromStorage = readFromLocalStorage();
  if (fromStorage) return { token: fromStorage, source: 'localStorage' };

  const fromCookie = readFromCookie();
  if (fromCookie) return { token: fromCookie, source: 'cookie' };

  return { token: '', source: 'none' };
}

export default getAdminToken;
