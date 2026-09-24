/**
 * 课程列表页的「封面」列改成缩略图显示（只影响 api::course.course）。
 *
 * 为什么需要它：课程封面是 shared.cover 组件，字段 fallbackPath 存的是官网站内路径
 * （如 /images/courses/hwsmyyzyjyb.webp），列表页默认只能把这串路径当文本显示；
 * 校区封面是 media 类型，列表页由 content-manager 的 MediaSingle 渲染成 26px 圆形小图
 * （design-system Avatar.Item）。课程这边需要比它更大、能一眼认出画面，
 * 所以按封面原图 4:3 的比例渲染成缩略图（见 THUMB_WIDTH / THUMB_HEIGHT）。
 *
 * 图片能否访问：路径指向官网仓库 public/images，CMS 自己的 public/ 是空的，
 * 所以 src/middlewares/site-images.ts 把官网 public 挂到了 CMS 的 /images 前缀下。
 *
 * 与 generation-task-create-label.ts 同套路：DOM 监听 + MutationObserver，
 * 因为列表页分页、排序、筛选都会重建单元格节点，改一次会被 React 覆盖回去。
 */

/** 目标内容类型 UID */
const TARGET_SLUG = 'api::course.course';
/** 我们插入的缩略图标记，用于识别与还原 */
const THUMB_ATTR = 'data-course-cover-thumb';
/** 封面路径：站内 /images/... 或完整 http(s) 图片地址 */
const IMAGE_PATH =
  /^(?:\/images\/|https?:\/\/)[^\s"'<>]+\.(?:webp|avif|png|jpe?g|gif|svg)$/i;

/** 已经确认取不到的路径：记下来，避免反复替换又回退造成抖动 */
const failedPaths = new Set<string>();

/**
 * 缩略图尺寸（px）。课程封面原图约 806×604，比例 4:3，
 * 所以按 4:3 设定，配合 object-fit: cover 既放得大又不会变形；
 * 想更大/更小改这两个值即可（保持 4:3 比例画面最完整）。
 */
const THUMB_WIDTH = 72;
const THUMB_HEIGHT = 54;

const isCourseListView = () =>
  window.location.pathname.includes(TARGET_SLUG) &&
  !/\/create\/?$/.test(window.location.pathname);

/** 4:3 圆角缩略图：撑满单元格宽度、居中裁切、加载前先占位避免跳动 */
const styleThumbnail = (image: HTMLImageElement) => {
  image.style.width = `${THUMB_WIDTH}px`;
  image.style.height = `${THUMB_HEIGHT}px`;
  image.style.objectFit = 'cover';
  image.style.borderRadius = '4px';
  image.style.display = 'block';
  image.style.backgroundColor = 'var(--strapi-neutral-150, #f6f6f9)';
};

/** 离开课程列表页时把缩略图还原成原来的路径文本 */
const restoreThumbnails = (root: Element) => {
  root.querySelectorAll(`img[${THUMB_ATTR}]`).forEach((image) => {
    const path = image.getAttribute(THUMB_ATTR);

    if (path) {
      image.replaceWith(document.createTextNode(path));
    }
  });
};

const applyCourseCoverThumbnail = () => {
  const root = document.querySelector('main');
  if (!root) {
    return;
  }

  if (!isCourseListView()) {
    restoreThumbnails(root);
    return;
  }

  const cells: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();

  while (current) {
    const text = current.nodeValue?.trim();

    // 只处理表格单元格里的路径文本，避免误伤表单、筛选器等位置
    if (
      text &&
      IMAGE_PATH.test(text) &&
      current.parentElement?.closest('td, th')
    ) {
      cells.push(current as Text);
    }

    current = walker.nextNode();
  }

  cells.forEach((textNode) => {
    const path = textNode.nodeValue?.trim();
    if (!path || failedPaths.has(path)) {
      return;
    }

    const image = document.createElement('img');
    image.setAttribute(THUMB_ATTR, path);
    image.src = path;
    // 原路径保留成 tooltip/alt，鼠标悬停仍能看到它指向哪个文件
    image.alt = path;
    image.title = path;
    image.loading = 'lazy';
    styleThumbnail(image);
    image.addEventListener('error', () => {
      // 图取不到（例如 CMS 目录旁没有官网 public）时退回路径文本，不留裂图
      failedPaths.add(path);
      image.replaceWith(document.createTextNode(path));
    });

    textNode.parentNode?.replaceChild(image, textNode);
  });
};

let installed = false;

/**
 * 安装全局监听（幂等，可重复调用）。
 * 监听挂在 body 上：admin 的 <main> 会随页面切换重建，挂在它身上会失效。
 */
export const installCourseCoverThumbnail = () => {
  if (installed || typeof document === 'undefined') {
    return;
  }

  installed = true;
  applyCourseCoverThumbnail();

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) {
      return;
    }

    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      applyCourseCoverThumbnail();
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
};

export default installCourseCoverThumbnail;
