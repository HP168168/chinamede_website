/**
 * 让内容列表页重新拉取数据（局部刷新，不整页重载）。
 *
 * 为什么需要自己造这个轮子：扩词弹窗挂在自建的 React root 上，**不在 Strapi 的
 * Provider 树内**，拿不到列表页的数据客户端，也就没有现成的 refetch 可调
 * （同因见 components/KeywordGenerateDialog.tsx 头部对独立 root 的说明）。
 *
 * 但列表页的数据源是 URL：content-manager 用 useQueryParams 从 location.search
 * 解析 page / pageSize / sort / filters，查询串一变就以新的 key 重新请求。
 * 所以「改地址 + 通知路由」等价于刷新。
 *
 * ⚠️ 两个细节不能省，都是试错换来的：
 *
 *   1. **必须原样带回 window.history.state 再 replaceState**。
 *      react-router 的 history 把导航序号（idx）和本次导航的 key 存在 history.state 里，
 *      自己造一个空 state 会打乱它的内部记录，轻则控制台告警、重则路由状态错乱。
 *
 *   2. **必须手动 dispatchEvent('popstate')**。
 *      规范里 pushState / replaceState **不会**派发 popstate，只调历史 API 是
 *      完全静默的 —— 这正是「地址明明改了、界面毫无变化」最常见的原因。
 *
 * 用 replaceState 而非 pushState：这只是数据刷新，不该在浏览器历史里留痕，
 * 否则用户连点几次「后退」会一直退在同一个页面的不同时间戳上。
 */

/** 刷新用的哨兵参数：不参与任何筛选，只为让查询串发生变化 */
const REFRESH_PARAM = '_meidiRefresh';

interface RefreshOptions {
  /**
   * 是否把视图切到「最新优先 + 第 1 页」。
   *
   * 默认列表按 id 升序排，新写入的词条 id 最大，会落在**最后一页**——
   * 那样即使刷新了，用户在当前页也看不到刚生成的词，刷新就失去意义。
   * 因此仅有新增时要打开这个开关（只改排序与页码，**保留用户已有的筛选条件**）。
   */
  newestFirst?: boolean;
}

export function refreshContentList(options: RefreshOptions = {}): void {
  if (typeof window === 'undefined') return;

  const { newestFirst = false } = options;

  try {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    if (newestFirst) {
      params.set('sort', 'id:DESC');
      params.set('page', '1');
    }

    // 值取时间戳：连续两次刷新也能产生不同的查询串，避免第二次被当成「没变化」而跳过
    params.set(REFRESH_PARAM, String(Date.now()));

    // URLSearchParams 会把 `:` 编码成 %3A，而 Strapi 自己用 qs.stringify(..., { encode: false })
    // 生成的是未编码的 `id:DESC`。两者都能被 qs.parse 正确解析，这里还原冒号只是为了地址栏可读、
    // 并和后台其它链接长得一致（否则用户看到一串 %3A，容易以为哪里坏了）。
    url.search = params.toString().replace(/%3A/gi, ':');

    const state = window.history.state;
    window.history.replaceState(state, '', url.toString());
    window.dispatchEvent(new PopStateEvent('popstate', { state }));
  } catch (error) {
    // 刷新失败不该牵连别的事（弹窗要照常关闭），留一条日志便于排查
    console.warn('[admin] 列表刷新失败，可手动按 F5 重新加载', error);
  }
}

export default refreshContentList;
