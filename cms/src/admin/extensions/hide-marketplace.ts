/**
 * 隐藏左侧导航的「市场」（Marketplace）入口。
 *
 * 为什么只能从样式上隐藏：这个菜单项硬编码在 @strapi/admin 的 useMenu hook 里
 * （generalSectionLinks 的 useState 初始值），既不是插件注册的菜单、也就不会经过
 * 插件菜单那套权限过滤，Strapi 也没有提供移除单项菜单的配置。它指向外部站点
 * （useMenu 里写死 https://market.strapi.io），对本项目没有用处，还带一个插件
 * 更新的角标，所以直接不显示。
 *
 * 为什么连 <li> 一起隐藏：<a> 外面套着 <li>（Flex tag="li"），导航项之间的间距由
 * 父容器的 gap 控制，只隐藏 <a> 会在「媒体库」和「内容类型构建器」之间留下空档。
 *
 * 为什么用样式而不是 DOM 监听：隐藏是纯静态的，注入一条规则即可长期生效，
 * 不像改文案那样会被 React 重渲染冲掉，也就不需要 MutationObserver 反复执行。
 *
 * 为什么拆成两条规则：CSS 中同一条规则的选择器列表只要有一个不被解析，
 * 整条规则都会被丢弃。:has() 在旧浏览器上不认，拆开能保证第一条兜底生效。
 * 另外 :has() 里用的是后代选择器而非子选择器：<a> 外面还包了一层 Tooltip 的 <span>。
 */
const STYLE_ELEMENT_ID = 'meidi-hide-marketplace';

/** 这个前缀足够特异：后台没有别的链接指向插件市场 */
const MARKETPLACE_HREF_PREFIX = 'https://market.strapi.io';

/** 安装隐藏样式（幂等）。注入的是全局样式，对所有页面生效。 */
export const installHideMarketplace = () => {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ELEMENT_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  style.textContent = [
    `a[href^="${MARKETPLACE_HREF_PREFIX}"] { display: none !important; }`,
    `li:has(a[href^="${MARKETPLACE_HREF_PREFIX}"]) { display: none !important; }`,
  ].join('\n');

  document.head.appendChild(style);
};

export default installHideMarketplace;
