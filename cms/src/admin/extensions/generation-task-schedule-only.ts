/**
 * 「执行时间」只在「触发方式 = 定时自动生成」时显示。
 *
 * 为什么需要它：
 * 触发方式是手动生成 / 自动生成时，「执行时间」（cron）既不参与生成、也不会被调度器读取，
 * 留在表单里只会让人困惑（"我填了它怎么没生效"）。所以非定时模式下把它整块隐藏，
 * 只在选了「定时自动生成」时才出现，表单看上去就是"选哪种就填哪种"。
 *
 * 为什么不用内容管理器的配置：
 * metadatas[field].edit.visible 是**静态**的——它一关就是全局关，
 * 而且 Strapi 对 visible=false 的字段是**根本不渲染**（不是 CSS 隐藏），
 * 之后没法再"按需显示"。因此只能走渲染后的 DOM 控制：先渲染、再判断要不要藏起来。
 *
 * 定位方式刻意不依赖 class：styled-components 生成的类名是构建期哈希（如 sc-bdvwhi gqBWyv），
 * 每次构建都可能变。这里用两个稳定锚点：
 *   1. 锚点一（找字段）：label[for="scheduleCron"]——自定义字段组件里 Field.Root 传了 id，
 *      于是能用标准的 label/for 关联精确定位到「执行时间」本身；
 *   2. 锚点二（找容器）：从 label 往上找第一个"父元素是 grid 布局"的节点，
 *      编辑页每个字段都是布局网格里的一个单元，藏它就是藏整个输入块（含说明文字）。
 *
 * ⚠️ 安全原则：宁可不隐藏，也不能误伤整个表单。
 * 容器判定加了三条收敛条件（必须是 grid 单元、内部只能有这一个字段标签、不得越过 form），
 * 一旦找不到符合条件的节点就什么都不做——效果退化为"字段一直显示"，不会破坏页面。
 *
 * 「触发方式」的值怎么读：
 * 它是内容管理器的自定义下拉（role=combobox），DOM 里没有 name=trigger 的 input，
 * 唯一能读的是它回显的文本；而这段文本会被 enum-labels 扩展换成中文（界面切成英文时是原值），
 * 所以两种写法都认，再统一反查成英文原值。
 *
 * 注意：文件保持 .ts（不含 JSX），与 admin 目录下其他扩展一致。
 */
import { TRIGGER_VALUE_LABELS } from './generation-task-enum-labels';

/** 目标内容类型 UID，与 URL 中的 slug 一致 */
const TARGET_SLUG = 'api::generation-task.generation-task';

/** 「执行时间」字段名，也是 Field.Root 的 id，即 label 的 for 值 */
const FIELD_NAME = 'scheduleCron';

/** 需要显示的那个触发方式取值 */
const SCHEDULE_VALUE = 'schedule';

/** 隐藏标记：既用作幂等判断，也便于人工排查（页面上线后才能确认逻辑是否生效） */
const HIDDEN_MARK = 'data-meidi-schedule-field-hidden';

/**
 * 下拉回显文本 -> 触发方式原值。
 * 英文原值与中文显示都登记：界面语言不同（中文面板 / 英文面板）时都能反查。
 */
const TEXT_TO_TRIGGER: Record<string, string> = Object.fromEntries(
  Object.entries(TRIGGER_VALUE_LABELS).flatMap(([value, label]) => [
    [value, value],
    [label, value],
  ]),
);

const isTargetPage = () => window.location.pathname.includes(TARGET_SLUG);

/**
 * 读取「触发方式」的当前选中值，读不到返回 null（此时不改动任何东西）。
 *
 * 只认 TEXT_TO_TRIGGER 里登记过的文本：这个集合在本项目是唯一的
 * （其他下拉的回显是标题、日期、时间等，不会撞），因此不会串到别的字段。
 */
function readTrigger(): string | null {
  const comboboxes = document.querySelectorAll('[role="combobox"]');

  for (const combobox of Array.from(comboboxes)) {
    const text = (combobox.textContent ?? '').trim();
    const value = TEXT_TO_TRIGGER[text];
    if (value) return value;
  }

  return null;
}

/**
 * 从标签往上找「字段所在的网格单元」。
 *
 * 判定条件（三条都要满足）：
 *   1. 它的父元素确实是 grid 布局——编辑页每个字段各占一个单元；
 *   2. 它内部只有一个字段标签——说明这是某个字段自己的单元，而不是包了很多字段的表单容器；
 *   3. 没有越过 form——越过就说明前面几层都不是目标，继续往上只会越抓越大。
 */
function findFieldCell(label: Element): HTMLElement | null {
  let current = label.parentElement;

  while (current && current !== document.body && current.tagName !== 'FORM') {
    const parent = current.parentElement;
    if (!parent) return null;

    const isGridChild = window.getComputedStyle(parent).display.includes('grid');
    const hasSingleFieldLabel = current.querySelectorAll('label').length <= 1;

    if (isGridChild && hasSingleFieldLabel) return current;

    current = parent;
  }

  return null;
}

/** 重入保护：我们自己改 DOM 也会触发 observer，避免回调里再进一层 */
let applying = false;

const applyScheduleFieldVisibility = () => {
  if (typeof document === 'undefined' || applying) {
    return;
  }

  applying = true;

  try {
    if (!isTargetPage()) return;

    const label = document.querySelector(`label[for="${FIELD_NAME}"]`);
    if (!label) return;

    const trigger = readTrigger();
    if (trigger === null) return;

    const cell = findFieldCell(label);
    if (!cell) return;

    const shouldShow = trigger === SCHEDULE_VALUE;
    const hidden = cell.getAttribute(HIDDEN_MARK) === 'true';

    // 幂等：状态没变就不动 DOM，避免每次 observer 回调都触发一次重排
    if (shouldShow === !hidden) return;

    if (shouldShow) {
      cell.removeAttribute(HIDDEN_MARK);
      cell.style.removeProperty('display');
    } else {
      cell.setAttribute(HIDDEN_MARK, 'true');
      cell.style.setProperty('display', 'none');
    }
  } finally {
    applying = false;
  }
};

let installed = false;

/**
 * 安装全局监听（幂等，可重复调用）。
 *
 * 监听 characterData 是因为「触发方式」改变的只是下拉里的文本节点，
 * 它既不会新增、也不会删除元素；漏掉这一项就捕捉不到切换动作。
 * 这里与 enum-labels 一样刻意不用 requestAnimationFrame 延迟：
 * 无渲染帧的环境（后台标签页）会推迟到永不执行。
 */
export const installGenerationTaskScheduleOnly = () => {
  if (installed || typeof document === 'undefined') {
    return;
  }

  installed = true;
  applyScheduleFieldVisibility();

  const observer = new MutationObserver(() => {
    applyScheduleFieldVisibility();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
};

export default installGenerationTaskScheduleOnly;
