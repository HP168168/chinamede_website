/**
 * 左侧导航里 users-permissions 插件自带的「User」内容类型 → 「用户」。
 *
 * 为什么只能改 DOM：这个内容类型是插件自带的，显示名取自插件 schema 的 displayName，
 * 我们改不了；而内容类型显示名的翻译键（content-manager.content-types.<uid>）
 * 实测对它无效（补了键界面仍是 User），所以沿用项目既有的定向替换手法。
 *
 * 为什么按链接 href 定位而不是按文本：页面别处也可能出现「User」这个词
 * （筛选器、关系字段等），只改指向该内容类型的那一个链接，避免误伤。
 *
 * 注意：文件保持 .ts（不含 JSX），这样不会被 CMS 根目录那份未开启 jsx 的 tsconfig 卡住。
 */
const TARGET_HREF = 'plugin::users-permissions.user';
const SOURCE_LABEL = 'User';
const CUSTOM_LABEL = '用户';

const applyUserLabel = () => {
  document.querySelectorAll(`a[href*="${TARGET_HREF}"]`).forEach((link) => {
    const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
    let current = walker.nextNode() as Text | null;

    while (current) {
      if ((current.nodeValue ?? '').trim() === SOURCE_LABEL) {
        current.nodeValue = CUSTOM_LABEL;
      }
      current = walker.nextNode() as Text | null;
    }
  });
};

let installed = false;

/** 安装全局监听（幂等）。监听挂 body：admin 的导航会随页面切换重建。 */
export const installUserContentTypeLabel = () => {
  if (installed || typeof document === 'undefined') {
    return;
  }

  installed = true;
  applyUserLabel();

  const observer = new MutationObserver(() => {
    applyUserLabel();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
};

export default installUserContentTypeLabel;
