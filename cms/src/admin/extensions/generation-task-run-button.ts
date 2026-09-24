/**
 * 「任务计划」编辑页的「立即生成」按钮（手动生成的入口）。
 *
 * 后台原本只能把任务存成待处理，再等外部计划任务或调度器巡检；
 * 有了这个按钮，运营打开任务点一下就能立刻出一稿。
 *
 * 实现方式与 generation-task-create-label 一致：DOM 监听 + MutationObserver。
 * 之所以不用注入区（injection zones）：Strapi 的内容管理器编辑页
 * 没有提供「头部动作区」的注入点，注入区只能加在列表页 actions 等少数位置。
 *
 * 动作区的定位经历过一次变更（2026-09 升级 Strapi 5.55.0 时）：
 * 旧做法是 `main header` + `[class*="ActionButton"]`，两者都依赖 Strapi 的渲染细节；
 * 5.55.0 的编辑页不再输出 `<header>` 标签（页面里 header 数为 0），按钮随之消失。
 * 现在改用「保存」按钮作为锚点——它是每篇编辑页都有、且中英文都可识别的稳定元素，
 * 取它的父容器作为动作区；找不到就不注入，而不是随便挂到某个节点上。
 *
 * 请求直接打本站 /api，带上 admin 自己的 JWT——
 * 后端路由用 admin::isAuthenticatedAdmin 校验，未登录或令牌失效会返回 403。
 *
 * 注意：文件保持 .ts（不含 JSX），与 admin 目录下其他扩展一致。
 */

import { getAdminTokenWithSource } from '../utils/admin-token';

const TARGET_SLUG = 'api::generation-task.generation-task';
const BUTTON_ID = 'meidi-generation-run-button';

/** 从编辑页 URL 取 documentId；新建页（/create）返回 null */
function getDocumentId(): string | null {
  const matched = window.location.pathname.match(
    /collection-types\/api::generation-task\.generation-task\/([^/]+)/,
  );
  if (!matched) return null;

  const id = decodeURIComponent(matched[1]);
  return id === 'create' ? null : id;
}

function isEditView(): boolean {
  return window.location.pathname.includes(TARGET_SLUG) && getDocumentId() !== null;
}

function createButton(documentId: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.id = BUTTON_ID;
  button.type = 'button';
  button.textContent = '立即生成';
  button.title = '按本任务的配置立刻生成一稿（结果写入「执行日志」与「生成的最后一篇文章」）';
  button.style.cssText = [
    'margin-left:8px',
    'padding:8px 16px',
    'border:none',
    'border-radius:4px',
    'background:#4945ff',
    'color:#fff',
    'font-size:0.875rem',
    'font-weight:600',
    'line-height:1.25rem',
    'cursor:pointer',
  ].join(';');

  const run = async () => {
    const original = button.textContent ?? '立即生成';
    button.disabled = true;
    button.style.opacity = '0.6';
    button.textContent = '已提交，生成中…';

    try {
      const { token, source } = getAdminTokenWithSource();
      if (!token) {
        // 空 token 发出去只会得到 401/403，不如在这里直接说清
        button.textContent = '登录状态异常，请重新登录';
        button.title = '未取到登录令牌（localStorage 与 cookie 里都没有 jwtToken）';
        button.disabled = false;
        button.style.opacity = '1';
        return;
      }

      const response = await fetch(`/api/content-factory/tasks/${documentId}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.ok || response.status === 202) {
        button.textContent = '已开始生成，稍后刷新查看';
        // 生成是异步写库，等几秒刷新就能看到状态与日志
        window.setTimeout(() => window.location.reload(), 4000);
        return;
      }

      const detail = await response.json().catch(() => null);
      const message =
        (detail as { error?: { message?: string } } | null)?.error?.message ??
        `请求失败（HTTP ${response.status}）`;
      button.textContent = '生成失败，点击重试';
      // 带上令牌来源与长度，便于区分「没取到令牌」和「取到了但服务端不认」
      button.title = `${message}（令牌来源：${source}，长度 ${token.length}）`;
      button.disabled = false;
      button.style.opacity = '1';
      void original;
    } catch (error) {
      button.textContent = '生成失败，点击重试';
      button.title = (error as Error).message;
      button.disabled = false;
      button.style.opacity = '1';
    }
  };

  button.addEventListener('click', () => {
    void run();
  });

  return button;
}

/**
 * 编辑页头部的「保存」按钮文案。
 * 中文 / 英文都登记：管理面板的界面语言可变，两种界面下都要能找到（与
 * generation-task-enum-labels 处理枚举的做法一致）。
 */
const SAVE_BUTTON_TEXTS = ['保存', 'Save'];

/**
 * 定位编辑页的动作区（按钮要插入的地方）。
 *
 * 新版 admin 不再渲染 `<header>`，改以「保存」按钮为锚点：它在任何编辑页都存在，
 * 父容器恰好就是标题行右侧的动作区。两个版本都兼容——先按按钮找，找不到再退回旧结构。
 */
function findActionBar(): Element | null {
  const buttons = Array.from(document.querySelectorAll('button'));

  for (const text of SAVE_BUTTON_TEXTS) {
    const save = buttons.find((button) => (button.textContent ?? '').trim() === text);
    if (save?.parentElement) return save.parentElement;
  }

  return document.querySelector('main header');
}

const applyRunButton = () => {
  if (!isEditView()) return;

  const documentId = getDocumentId();
  if (!documentId) return;

  const actions = findActionBar();
  if (!actions) return;

  if (actions.querySelector(`#${BUTTON_ID}`)) return;

  actions.appendChild(createButton(documentId));
};

let installed = false;

export const installGenerationTaskRunButton = () => {
  if (installed || typeof document === 'undefined') return;

  installed = true;
  applyRunButton();

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      applyRunButton();
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
};

export default installGenerationTaskRunButton;
