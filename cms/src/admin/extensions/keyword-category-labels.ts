/**
 * 五类关键词的中文显示（核心词 / 品牌词 / 场景词 / 区域词 / 长尾词）。
 *
 * 与 generation-task-enum-labels 完全同源的手法：Strapi 只能翻译枚举「字段的标签」，
 * 候选项与回显值一律是 schema 里的英文值，没有值级翻译键，因此做 DOM 级替换。
 *
 * 生效范围：关键词自身的内容类型页，以及任务计划页（那里也有同一套分类可选）。
 * 只替换**整段文本完全相等**的节点，因此不会误伤页面上恰好出现 core / brand 这类英文单词的地方。
 *
 * ⚠️ 必须遵守的一条规则：改显示文本前先把英文原值固化到 option 的 value 属性。
 * 原生 select 在 option 没有 value 时把显示文本当提交值，改了文本就等于改了提交值。
 */
const TARGET_SLUGS = ['api::keyword.keyword', 'api::generation-task.generation-task'];

const VALUE_LABELS: Record<string, string> = {
  core: '核心词',
  brand: '品牌词',
  scene: '场景词',
  region: '区域词',
  longtail: '长尾词',
};

/** 中文 -> 原值：用于反查，也用于离开目标页面时还原 */
const LABEL_VALUES: Record<string, string> = Object.fromEntries(
  Object.entries(VALUE_LABELS).map(([value, label]) => [label, value]),
);

/**
 * 自定义下拉（非原生 select）里要找的控件：触发器与展开后的候选项。
 * 候选项渲染在挂在 body 下的 portal 里，所以从 document 找。
 */
const CONTROL_SELECTOR = '[role="combobox"], [aria-haspopup="listbox"], [role="option"], [role="listbox"]';

/**
 * 内容区选择器。
 *
 * ⚠️ 这一条是必须的：**列表页的分类列是表格单元格里的纯文本**，
 * 既不是 option 也不是 role=option 的控件，只靠上面的选择器根本扫不到——
 * 表现就是列表页一直显示 core / scene 这类英文值（编辑页下拉却正常）。
 * 限定在 main 内，不碰侧边栏与通知区；替换规则仍是「整段文本完全相等」，
 * 因此不会误伤恰好含这些英文单词的其他内容。
 */
const MAIN_SELECTOR = 'main, [role="main"], table';

const isTargetPage = () => TARGET_SLUGS.some((slug) => window.location.pathname.includes(slug));

/**
 * 固化 option 的 value 属性。
 * 判断「是否已固化」必须用 getAttribute('value')——没有该属性时 option.value
 * 返回的是显示文本，会被误判成已固化，漏掉的正好是最关键的第一次。
 */
const pinOptionValue = (option: HTMLOptionElement) => {
  const text = (option.textContent ?? '').trim();
  const original = LABEL_VALUES[text] ?? text;
  if (!VALUE_LABELS[original]) return;
  if (option.getAttribute('value') !== original) {
    option.setAttribute('value', original);
  }
};

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
        current.nodeValue = raw.replace(text, LABEL_VALUES[text]);
      }
    }

    current = walker.nextNode() as Text | null;
  }
};

let applying = false;

const applyCategoryLabels = () => {
  if (typeof document === 'undefined' || applying) return;

  applying = true;

  try {
    const active = isTargetPage();

    document.querySelectorAll('option').forEach((element) => {
      const option = element as HTMLOptionElement;
      pinOptionValue(option);
      translate(option, active);
    });

    // 候选项渲染在挂到 body 下的 portal 里，因此从 document 找
    document.querySelectorAll(CONTROL_SELECTOR).forEach((control) => {
      translate(control, active);
    });

    // 内容区：列表页的分类列是纯文本，不在任何下拉控件内。
    // 只在目标页面扫——非目标页面上没有要替换的值，白跑一遍浪费。
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

/** 安装全局监听（幂等）。同步执行 + 重入保护，不用 rAF 延迟：后台标签页不推进帧，rAF 会被无限推迟。 */
export const installKeywordCategoryLabels = () => {
  if (installed || typeof document === 'undefined') return;

  installed = true;
  applyCategoryLabels();

  const observer = new MutationObserver(() => {
    applyCategoryLabels();
  });

  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
};

export default installKeywordCategoryLabels;
