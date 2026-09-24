/**
 * 关键词列表页的「AI 批量扩词」入口。
 *
 * 锚点用「新建条目」链接的 href（指向 /create）：列表页必有，且不依赖界面语言，
 * 比按按钮文案查找稳得多。取其父容器作为动作区。
 *
 * 弹窗是 React 组件（components/KeywordGenerateDialog.tsx），这里是 .ts 不含 JSX，
 * 因此用 createRoot + createElement 挂载，与 admin 目录下其它扩展保持一致的约定。
 *
 * 组件用静态 import 引入，不走 `await import(...)`：
 * 弹窗本身很轻，省不下多少体积，但动态 import 的失败路径是「静默无反应」，
 * 排查代价远高于收益（曾出现过点按钮毫无反应、控制台干净的情况）。
 */
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import KeywordGenerateDialog from '../components/KeywordGenerateDialog';

const TARGET_SLUG = 'api::keyword.keyword';
const WRAPPER_ID = 'meidi-keyword-expand-root';
const BUTTON_ID = 'meidi-keyword-expand-button';

/** 列表页：路径里出现该内容类型且后面没有 documentId 段 */
const isListView = () => {
  if (!window.location.pathname.includes(TARGET_SLUG)) return false;
  const tail = window.location.pathname.split(TARGET_SLUG)[1] ?? '';
  return tail === '' || tail === '/';
};

function findActionBar(): Element | null {
  const link = Array.from(document.querySelectorAll('a')).find((item) => {
    const href = item.getAttribute('href') ?? '';
    return href.includes(TARGET_SLUG) && href.endsWith('/create');
  });
  return link?.parentElement ?? null;
}

let root: ReturnType<typeof createRoot> | null = null;
let requested = false;

/**
 * 把弹窗渲染到 body 下自建的容器；重复调用只会重渲染同一个根节点。
 *
 * 这里刻意用**静态** import（而不是 `await import(...)`）：
 * 动态 import 是异步的，失败时异常会落在无人接管的 promise 上，
 * 表现就是「点按钮毫无反应、控制台也不报错」——排查成本极高。
 * 静态 import 由打包器在构建期解析，路径写错会直接构建失败，
 * 不会留到运行时才以静默方式炸掉。
 */
function renderDialog() {
  let holder = document.getElementById(WRAPPER_ID);
  if (!holder) {
    holder = document.createElement('div');
    holder.id = WRAPPER_ID;
    document.body.appendChild(holder);
  }

  root = root ?? createRoot(holder);
  root.render(
    React.createElement(KeywordGenerateDialog, {
      open: requested,
      onClose: () => {
        requested = false;
        renderDialog();
      },
    }),
  );

  // 渲染兜底：React 渲染期的错误不会同步抛出来（并发渲染），
  // 一旦发生，现象和「点了没反应」一模一样。下一轮事件循环后容器仍是空的就说明没渲染出来。
  window.setTimeout(() => {
    if (requested && holder && holder.childElementCount === 0) {
      reportFailure(new Error('弹窗组件没有渲染出任何内容，请查看控制台（F12）的报错'));
    }
  }, 300);
}

/** 统一的失败提示：把异常变成用户和开发者都能看见的东西，而不是静默无反应 */
function reportFailure(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error('[keyword-expand] 扩词弹窗打开失败', error);
  window.alert(`扩词弹窗打开失败：${message}\n\n详细信息见浏览器控制台（F12 → Console）。`);
}

function createButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.id = BUTTON_ID;
  button.type = 'button';
  button.textContent = 'AI 批量扩词';
  button.title = '围绕一个核心关键词，一次性生成五类关键词';
  button.style.cssText = [
    'margin-left:8px',
    'padding:8px 16px',
    'border:1px solid #4945ff',
    'border-radius:4px',
    'background:#ffffff',
    'color:#4945ff',
    'font-size:0.875rem',
    'font-weight:600',
    'line-height:1.25rem',
    'cursor:pointer',
    // 动作区是 flex 容器，按钮不加这两条会被压成很窄的一条、文字竖着折行
    'white-space:nowrap',
    'flex-shrink:0',
  ].join(';');

  // 刻意不在这里绑 click：见 delegateClicks() 的说明（按钮节点会被 Strapi 重渲染换掉）
  return button;
}

let delegated = false;

/**
 * 点击处理走**事件委托**，绑在 document 上且只绑一次。
 *
 * 为什么不直接绑在按钮自己身上：这个按钮是我们 append 进 Strapi 那棵 React 树的**外来节点**，
 * 它每次重渲染都可能把按钮移除，随后 MutationObserver 又把它重建出来——新节点上自然没有旧监听器。
 * 更麻烦的是节点可能在 mousedown 与 mouseup 之间被换掉，此时浏览器干脆不会派发 click。
 * 表现完全一致：按钮看得见，点下去毫无反应。
 * 委托到 document 之后，节点怎么被换都不影响事件的送达。
 *
 * 用捕获阶段（第三个参数 true）是为了不受其它 handler 的 stopPropagation 影响。
 */
function delegateClicks() {
  if (delegated || typeof document === 'undefined') return;

  delegated = true;
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target as Element | null;
      if (!target || typeof target.closest !== 'function') return;
      if (!target.closest(`#${BUTTON_ID}`)) return;

      requested = true;
      try {
        renderDialog();
      } catch (error) {
        // 同步抛出的错误（如容器不可用）在这里兜住，避免点击无反应且无提示
        requested = false;
        reportFailure(error);
      }
    },
    true,
  );
}

const applyButton = () => {
  if (!isListView()) return;

  const actions = findActionBar();
  if (!actions) return;
  if (actions.querySelector(`#${BUTTON_ID}`)) return;

  actions.appendChild(createButton());
};

let installed = false;

export const installKeywordGenerateButton = () => {
  if (installed || typeof document === 'undefined') return;

  installed = true;
  delegateClicks();
  applyButton();

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      applyButton();
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
};

export default installKeywordGenerateButton;
