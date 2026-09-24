/**
 * 「任务计划」内容类型的界面文案微调（只影响 api::generation-task.generation-task）。
 *
 * 覆盖两处：
 * 1. 列表页头部的「新建条目」按钮 → 「创建任务」
 * 2. 新建页的大标题「新建条目」→ 「创建任务」
 *
 * 为什么不动翻译：这两处分别来自全局键
 * `content-manager.HeaderLayout.button.label-add-entry` 与
 * `content-manager.containers.edit.title.new`，13 个集合类型共用，
 * 直接改翻译会把其他类型一起改掉；而 Strapi 的注入区（listView.actions 等）
 * 只能往页面里加东西，无法替换 header 里的按钮和标题。
 * 所以这里退一步：管理面板启动时装一个 DOM 监听，只在这一个内容类型的页面上做替换，
 * 离开该页时还原。
 *
 * 实现细节（踩过的坑）：
 * 1. design-system 的 Button 会把 children 包进 Typography/<span>，文本节点在按钮的孙节点上，
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
const TARGET_SLUG = 'api::generation-task.generation-task';
/** 目标页面上要显示的说法 */
const CUSTOM_LABEL = '创建任务';

/** 列表页：/content-manager/collection-types/api::generation-task.generation-task */
const isListView = () =>
  window.location.pathname.includes(TARGET_SLUG) &&
  !/\/create\/?$/.test(window.location.pathname);

/** 新建页：上面那个路径 + /create */
const isCreateView = () =>
  window.location.pathname.includes(TARGET_SLUG) &&
  /\/create\/?$/.test(window.location.pathname);

const isInsideButton = (node: Text) =>
  Boolean(node.parentElement?.closest('a, button, [role="button"]'));

interface LabelRule {
  /** 该处文案的默认值（取自翻译源，避免两处各写一份） */
  from: string;
  /** 文本节点是否属于这处文案 */
  scope: (node: Text) => boolean;
  /** 当前页面是否应该显示成「创建任务」 */
  active: () => boolean;
}

const RULES: LabelRule[] = [
  {
    // 列表页头部与空状态的「新建条目」按钮
    from:
      uiContentManager['content-manager.HeaderLayout.button.label-add-entry'] ??
      '新建条目',
    scope: isInsideButton,
    active: isListView,
  },
  {
    // 新建页的大标题（不在按钮里）
    from:
      uiContentManager['content-manager.containers.edit.title.new'] ?? '新建条目',
    scope: (node) => !isInsideButton(node),
    active: isCreateView,
  },
];

const applyCreateLabel = () => {
  // 只改主内容区，避免误伤引导层（tour）等挂在 body 下的同名文案
  const root = document.querySelector('main');
  if (!root) {
    return;
  }

  const texts: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();

  while (current) {
    texts.push(current as Text);
    current = walker.nextNode();
  }

  texts.forEach((node) => {
    const text = node.nodeValue?.trim();
    if (!text) {
      return;
    }

    const rule = RULES.find(
      (item) => item.scope(node) && (text === item.from || text === CUSTOM_LABEL)
    );
    if (!rule) {
      return;
    }

    if (rule.active()) {
      if (text !== CUSTOM_LABEL) {
        node.nodeValue = CUSTOM_LABEL;
      }
    } else if (text === CUSTOM_LABEL) {
      // 离开目标页面时还原，其他内容类型始终显示原文案
      node.nodeValue = rule.from;
    }
  });
};

let installed = false;

/**
 * 安装全局监听（幂等，可重复调用）。
 * 监听挂在 body 上：admin 的 <main> 会随页面切换重建，挂在它身上会失效。
 */
export const installGenerationTaskCreateLabel = () => {
  if (installed || typeof document === 'undefined') {
    return;
  }

  installed = true;
  applyCreateLabel();

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) {
      return;
    }

    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      applyCreateLabel();
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
};

export default installGenerationTaskCreateLabel;
