/**
 * 「关键词库」内容类型的界面文案微调（只影响 api::keyword.keyword）。
 *
 * 覆盖两处：
 * 1. 列表页头部的「新建条目」按钮 → 「新增关键词」
 * 2. 新建页的大标题「新建条目」→ 「新增关键词」
 *
 * 为什么不动翻译：这两处分别来自全局键
 * `content-manager.HeaderLayout.button.label-add-entry` 与
 * `content-manager.containers.edit.title.new`，十几个集合类型共用，
 * 直接改翻译会把「课程」「校区」等一起改掉；而 Strapi 的注入区（listView.actions 等）
 * 只能往页面里加东西，替换不了 header 里的按钮和标题。
 * 所以沿用 generation-task-create-label 的退路：装一个 DOM 监听，
 * 只在这一个内容类型的页面上替换，离开该页时还原。
 *
 * 与「任务计划」那份同源但保持独立文件：两者 UID 与文案都不同，
 * 合并成一个通用函数反而要引入配置层，各自独立更易读、改动互不影响。
 *
 * 实现细节（踩过的坑，与那一份相同）：
 * 1. design-system 的 Button 把 children 包进 Typography/<span>，文本节点在按钮的孙节点上，
 *    最终 DOM 形如 <a href="..."><span aria-hidden><svg/></span><span>新建条目</span></a>，
 *    所以必须遍历整棵子树，不能只看 a/button 的直接子节点。
 * 2. header 是 sticky 布局，滚动与重新渲染都会重建节点、把手改的文本覆盖回去，
 *    所以用 MutationObserver 持续套用。
 *
 * 注意：文件保持 .ts（不含 JSX），这样不会被 CMS 根目录那份未开启 jsx 的 tsconfig 卡住；
 * admin 源码实际由 Vite 打包，不受影响。
 */
import uiContentManager from '../translations/ui-content-manager';

/** 目标内容类型 UID，与 URL 中的 slug 一致 */
const TARGET_SLUG = 'api::keyword.keyword';
/** 目标页面上要显示的说法 */
const CUSTOM_LABEL = '新增关键词';

/**
 * 「新建条目」的默认值。
 * 列表页按钮与新建页标题走的是两个不同的翻译键，取值可能不同（如英文界面），
 * 所以两个都收进来；还原时统一用第一个，因为中文包里两者文案相同，
 * 而真正需要还原的场景只有「SPA 切换页面时 React 复用了同一个文本节点」。
 */
const SOURCE_TEXTS = [
  uiContentManager['content-manager.HeaderLayout.button.label-add-entry'] ?? '新建条目',
  uiContentManager['content-manager.containers.edit.title.new'] ?? '新建条目',
];
const RESTORE_TEXT = SOURCE_TEXTS[0];
const SOURCE_SET = new Set(SOURCE_TEXTS);

const isTargetPage = () => window.location.pathname.includes(TARGET_SLUG);

const applyCreateLabel = () => {
  // 只改主内容区，避免误伤引导层（tour）等挂在 body 下的同名文案
  const root = document.querySelector('main');
  if (!root) {
    return;
  }

  const active = isTargetPage();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode() as Text | null;

  while (current) {
    const raw = current.nodeValue ?? '';
    const text = raw.trim();

    if (text) {
      if (active && SOURCE_SET.has(text)) {
        current.nodeValue = raw.replace(text, CUSTOM_LABEL);
      } else if (!active && text === CUSTOM_LABEL) {
        // 离开目标页面时还原，其他内容类型始终显示原文案
        current.nodeValue = raw.replace(text, RESTORE_TEXT);
      }
    }

    current = walker.nextNode() as Text | null;
  }
};

let installed = false;
let applying = false;

/**
 * 安装全局监听（幂等，可重复调用）。
 * 监听挂在 body 上：admin 的 <main> 会随页面切换重建，挂在它身上会失效。
 * 同步执行 + 重入保护，不用 rAF 延迟：后台标签页不推进帧，rAF 会被无限推迟。
 */
export const installKeywordCreateLabel = () => {
  if (installed || typeof document === 'undefined') {
    return;
  }

  installed = true;
  applyCreateLabel();

  const observer = new MutationObserver(() => {
    if (applying) return;
    applying = true;
    try {
      applyCreateLabel();
    } finally {
      applying = false;
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
};

export default installKeywordCreateLabel;
