/**
 * 「任务计划」页面的枚举值中文显示。
 *
 * 背景：Strapi 只支持翻译枚举字段的「标签」（trigger → 触发方式），
 * 下拉里的候选项与回显值一律是 schema 里声明的英文值（now / queue / schedule）。
 * 管理面板 dist 中只构造字段标签键（见 translations/field-labels.ts 的说明），
 * 没有值级翻译键，所以这里沿用同目录两个扩展的做法：DOM 监听 + MutationObserver。
 *
 * ⚠️ 必须遵守的一条规则：改显示文本之前，先把英文原值固化到原生 option 的 value 属性。
 * 原生 select 在 option 没有 value 属性时，浏览器会把「显示文本」当作提交值，
 * 一旦把文本改成中文，提交给后端的就是「待处理」这类中文值。
 * pinOptionValue() 就是为此加的防御：它把英文原值写进 value 属性后，显示文本怎么改都不影响提交值。
 *
 * 补充（2026-09 排查记录）：这个字段原先叫 status，后台保存总是报 `Invalid status`（HTTP 400）。
 * 当时的根因并不是这里的文本替换，而是**字段名撞了 Strapi 的保留参数**：
 * content-manager 会把请求体里的 status 当作文档的草稿/发布状态校验（只接受 draft/published），
 * 于是业务值被拒收并从请求体里剥离。字段已重命名为 runStatus（见 schema.json），冲突消失。
 * pinOptionValue 与此无关，仍保留——它是防止「改文本影响提交值」的通用保险。
 *
 * 定位方式刻意不依赖「label 与控件的关联结构」（各版本 DOM 差异大），
 * 换成三条更稳的约束：
 *   1. 只在任务计划相关页面生效；
 *   2. 只替换下面登记过的值；
 *   3. 原生 option 走 pin 后的文本替换，自定义下拉走 role 选择器。
 * 目前登记了三处：
 *   - 触发方式 trigger：now / queue / schedule（编辑页下拉 + 列表页文本）
 *   - 执行状态 runStatus：pending / running / done / failed / cancelled（同上）
 *   - 生成模式 mode：ai / manual——该字段已改为自定义字段，编辑页由
 *     components/RadioEnumInput.tsx 直接显示中文单选，这里只负责列表页的文本
 *     （列表里是纯文本且不可编辑，替换文本不会影响提交值）。
 * 这几个枚举在项目里只有这几个字段在用，因此扫描不会误伤其他控件。
 *
 * 注意：文件保持 .ts（不含 JSX），与 admin 目录下其他扩展一致。
 */

/** 目标内容类型 UID，与 URL 中的 slug 一致 */
const TARGET_SLUG = 'api::generation-task.generation-task';

/**
 * 触发方式（trigger）的候选值。
 *
 * 单独导出是因为「执行时间」字段的显隐也依赖它：
 * extensions/generation-task-schedule-only.ts 要按当前选中的是哪个值来决定显隐，
 * 而本文件负责把它们显示成中文，两边共用同一张表，避免改了一处忘了另一处。
 */
export const TRIGGER_VALUE_LABELS: Record<string, string> = {
  now: '手动生成',
  queue: '自动生成',
  schedule: '定时自动生成',
};

/** 原值 -> 中文显示（只有登记在这里的值会被替换） */
const VALUE_LABELS: Record<string, string> = {
  ...TRIGGER_VALUE_LABELS,
  // 生成模式（mode）：编辑页由 RadioEnumInput 组件显示中文，这里供列表页文本使用
  ai: 'AI 生成',
  manual: '人工撰写',
  // 执行状态（runStatus）：与 schema.json 里 description 的说法保持一致
  pending: '待处理',
  running: '生成中',
  done: '已完成',
  failed: '失败',
  cancelled: '已取消',
};

/** 中文显示 -> 原值：用来反查英文原值，也用于离开任务计划页面时还原 */
const LABEL_VALUES: Record<string, string> = Object.fromEntries(
  Object.entries(VALUE_LABELS).map(([value, label]) => [label, value])
);

/**
 * 自定义下拉（非原生 select 的实现）里要找的控件：
 * - `[role="combobox"]` / `[aria-haspopup="listbox"]` 下拉触发器，回显当前选中值；
 * - `[role="option"]` 展开后的候选项。
 *
 * 触发器写两个选择器是因为不同版本用的属性不完全一致。
 * 原生 select 不在此列，它的选项由下面的 option 分支单独处理。
 */
const CONTROL_SELECTOR =
  '[role="combobox"], [aria-haspopup="listbox"], [role="option"], [role="listbox"]';

/**
 * 内容区选择器。
 *
 * ⚠️ 补这一条的原因（2026-09 修复）：**列表页的枚举列是表格单元格里的纯文本**，
 * 不在 option 也不在 role=option 的控件里，只靠上面的选择器扫不到，
 * 于是列表页长期显示 now / done 这类英文值，而编辑页下拉却是中文。
 * 限定在 main 内扫描，不碰侧边栏与通知区；替换规则仍是「整段文本完全相等」，
 * 这些枚举值在项目里只有本内容类型在用，不会误伤。
 */
const MAIN_SELECTOR = 'main, [role="main"], table';

const isTargetPage = () => window.location.pathname.includes(TARGET_SLUG);

/**
 * 把原生 option 的「文本值」固化到 value 属性。
 *
 * 这一步是安全的保证，不是优化：option 若无 value 属性，浏览器用显示文本当提交值，
 * 改了文本就等于改了提交给后端的值。固化后 value 恒为英文，显示文本随便改。
 *
 * ⚠️ 判断「是否已固化」必须用 getAttribute('value')，不能用 option.value：
 * 没有 value 属性时，option.value 的 getter 返回的是显示文本，
 * 正好与英文原值相等，会被误判成「已经固化过」而跳过——漏掉的偏偏是最关键的第一次，
 * 于是文本改成中文后提交值就跟着变成中文（保存时 Invalid status）。
 */
const pinOptionValue = (option: HTMLOptionElement) => {
  const text = (option.textContent ?? '').trim();
  // 文本是中文时反查英文原值；文本是英文时，它本身就是原值
  const original = LABEL_VALUES[text] ?? text;

  if (!VALUE_LABELS[original]) {
    // 不在登记表里的值（如「生成模式」的 ai/manual）一律不碰
    return;
  }

  if (option.getAttribute('value') !== original) {
    option.setAttribute('value', original);
  }
};

/** 替换单个控件内的文本节点（候选项的文字就在控件自身内，扫自己即可） */
const translate = (control: Element, active: boolean) => {
  const walker = document.createTreeWalker(control, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode() as Text | null;

  while (current) {
    const raw = current.nodeValue ?? '';
    const text = raw.trim();

    if (text) {
      if (active && VALUE_LABELS[text]) {
        current.nodeValue = raw.replace(text, VALUE_LABELS[text]);
      } else if (!active && LABEL_VALUES[text]) {
        // 已经离开任务计划页：把残留的中文改回原值
        current.nodeValue = raw.replace(text, LABEL_VALUES[text]);
      }
    }

    current = walker.nextNode() as Text | null;
  }
};

/** 重入保护：我们自己改 DOM 也会触发 observer，避免回调里再进一层 */
let applying = false;

const applyEnumLabels = () => {
  if (typeof document === 'undefined' || applying) {
    return;
  }

  applying = true;

  try {
    const active = isTargetPage();

    // 1. 原生 option（select 的下拉项）：先固化 value，再改显示文本。
    //    pin 与页面无关地执行：它只对登记过的值生效，对其他内容类型的下拉没有影响。
    document.querySelectorAll('option').forEach((element) => {
      const option = element as HTMLOptionElement;
      pinOptionValue(option);
      translate(option, active);
    });

    // 2. 自定义下拉：触发器回显的当前值与展开后的候选项。
    //    候选项渲染在挂在 body 下的 portal 里（不在 main 内），所以从 document 找。
    document.querySelectorAll(CONTROL_SELECTOR).forEach((control) => {
      translate(control, active);
    });

    // 3. 内容区：列表页的枚举列是纯文本，不在下拉控件内。
    //    只在目标页面扫——非目标页面上不存在这些值。
    if (active) {
      document.querySelectorAll(MAIN_SELECTOR).forEach((main) => {
        translate(main, true);
      });
    }
  } finally {
    applying = false;
  }
};

let installed = false;

/**
 * 安装全局监听（幂等，可重复调用）。
 * 监听挂在 body 上：下拉展开、选中后重渲染都会重建节点，需要持续套用；
 * 若文本已经是目标文案则不动它，因此不会与 observer 形成循环。
 *
 * 这里刻意**不用 requestAnimationFrame 延迟**（同目录另外两个扩展用了 rAF）：
 * 无渲染帧的环境（后台标签页、无头浏览器）不推进帧，重跑会被无限期推迟，
 * 表现为「切走页面后中文没还原」。同步执行 + 重入保护即可，代价是每次 DOM
 * 变更多跑一次 applyEnumLabels（幂等、开销可以忽略）。
 */
export const installGenerationTaskEnumLabels = () => {
  if (installed || typeof document === 'undefined') {
    return;
  }

  installed = true;
  applyEnumLabels();

  const observer = new MutationObserver(() => {
    applyEnumLabels();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
};

export default installGenerationTaskEnumLabels;
