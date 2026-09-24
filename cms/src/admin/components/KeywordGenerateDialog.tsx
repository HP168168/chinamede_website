/**
 * 关键词列表页的「AI 批量扩词」弹窗。
 *
 * 为什么它作为一个 React 组件存在、而不是直接用 DOM 拼：
 * 这个交互有输入、多选、校验、加载态、结果列表五类状态，用 DOM 手动同步状态很容易漏，
 * 而它是被同目录的 keyword-generate-button 扩展从窗口里挂上来的，不依赖 Strapi 的注入区。
 *
 * ⚠️ 界面**刻意全部使用原生 HTML 元素 + Strapi 设计系统的色值**，不引 @strapi/design-system 组件。
 * 原因是有过一次实打实的线上报错，记录下来避免以后有人"顺手优化"回去：
 *
 *   这个弹窗挂在 createRoot() 自建的独立 React root 上，**不在 Strapi 的 Provider 树内**。
 *   design-system 的组件都是 styled-components，渲染时要读 theme（theme.spaces[3] 这类），
 *   而独立 root 里没有 ThemeProvider，theme 是 undefined，于是渲染直接抛：
 *     TypeError: Cannot read properties of undefined (reading '3')
 *   现象是「点按钮毫无反应、Console 只有一行红字」，排查成本很高。
 *
 * 试过的补救与结论：DesignSystemProvider 只注入 locale / theme，
 * 而 TextInput / SingleSelect 这类表单组件还依赖 Field 等 context，逐个补齐不现实；
 * 官方注入区（content-manager 的 listView.actions）虽然能让组件回到 Provider 树内，
 * 但要改造整套挂载方式，对"只想要一个弹窗"而言不划算。
 * 结论：独立 root 里的浮层，用原生控件 + 设计系统色值最稳，视觉仍然一致。
 *
 * 下面这些色值取自 @strapi/design-system 打包产物（dist/index.mjs）里的 lightTheme，
 * 与后台其它部分逐字一致；改主题时需要同步核对。
 *
 * 提交走 /api/content-factory/keywords/expand，带 admin 自己的 JWT；
 * 后端鉴权由自定义 policy 解析（原因见 src/lib/admin-jwt-policy.ts 的头部说明）。
 *
 * 关闭时会刷新列表（仅当本次确实写入过新词），实现见 utils/refresh-content-list.ts。
 */
import * as React from 'react';
import { KEYWORD_CATEGORIES } from '../../lib/ai/keywords';
import { getAdminTokenWithSource } from '../utils/admin-token';
import { refreshContentList } from '../utils/refresh-content-list';

interface KeywordGenerateDialogProps {
  open: boolean;
  onClose: () => void;
}

/** 每类条数：留空 = 用各类的默认上限 */
const QUOTA_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'default', label: '按各类默认上限' },
  { value: '5', label: '每类最多 5 条' },
  { value: '10', label: '每类最多 10 条' },
  { value: '15', label: '每类最多 15 条' },
];

interface ExpandResult {
  created: Array<{ word: string; category: string; categoryLabel: string }>;
  skipped: number;
  byCategory: Record<string, number>;
  dryRun: boolean;
}

const STYLE_ID = 'meidi-keyword-dialog-styles';

/**
 * 浮层样式集中在这里，用类名而不是满屏 inline style：
 * inline style 写不了 :hover / :focus，而按钮与输入框没有悬停反馈会显得很"死"。
 */
const DIALOG_CSS = `
.meidi-kw-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:48px 16px;overflow-y:auto;background:rgba(25,27,43,.55)}
.meidi-kw-card{width:620px;max-width:100%;padding:24px;border-radius:4px;background:#ffffff;box-shadow:0 2px 15px rgba(33,33,52,.1)}
.meidi-kw-title{margin:0;color:#32324d;font-size:1rem;font-weight:600;line-height:1.5}
.meidi-kw-desc{margin:0;color:#666687;font-size:.75rem;line-height:1.4}
.meidi-kw-field{display:flex;flex-direction:column;gap:8px}
.meidi-kw-label{color:#32324d;font-size:.75rem;font-weight:600;line-height:1.4}
.meidi-kw-input,.meidi-kw-select{width:100%;height:40px;padding:0 12px;border:1px solid #dcdce4;border-radius:4px;background:#ffffff;color:#32324d;font-size:.875rem;line-height:1.25rem;box-sizing:border-box}
.meidi-kw-select{cursor:pointer}
.meidi-kw-input:focus,.meidi-kw-select:focus{outline:none;border-color:#4945ff;box-shadow:0 0 0 2px #f0f0ff}
.meidi-kw-input:disabled,.meidi-kw-select:disabled{background:#f6f6f9;cursor:not-allowed}
.meidi-kw-check{display:flex;align-items:center;gap:6px;color:#32324d;font-size:.75rem;line-height:1.4;cursor:pointer}
.meidi-kw-check input{cursor:inherit;margin:0}
.meidi-kw-checks{display:flex;flex-wrap:wrap;gap:16px}
.meidi-kw-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:4px}
.meidi-kw-btn{padding:8px 16px;border-radius:4px;font-size:.875rem;font-weight:600;line-height:1.25rem;cursor:pointer;white-space:nowrap}
.meidi-kw-btn:disabled{cursor:not-allowed}
.meidi-kw-btn-secondary{border:1px solid #dcdce4;background:#ffffff;color:#32324d}
.meidi-kw-btn-secondary:hover:not(:disabled){background:#f6f6f9}
.meidi-kw-btn-primary{border:none;background:#4945ff;color:#ffffff}
.meidi-kw-btn-primary:hover:not(:disabled){background:#271fe0}
.meidi-kw-btn-primary:disabled{background:#7b79ff}
.meidi-kw-error{color:#d02b20;font-size:.75rem;line-height:1.4}
.meidi-kw-success{color:#328048;font-size:.75rem;line-height:1.4}
.meidi-kw-group{display:flex;flex-direction:column;gap:4px}
.meidi-kw-group-name{color:#32324d;font-size:.75rem;font-weight:600;line-height:1.4}
.meidi-kw-group-words{color:#666687;font-size:.75rem;line-height:1.4}
`;

/** 注入样式表（幂等，只插一次） */
function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;

  const tag = document.createElement('style');
  tag.id = STYLE_ID;
  tag.textContent = DIALOG_CSS;
  document.head.appendChild(tag);
}

const KeywordGenerateDialog = ({ open, onClose }: KeywordGenerateDialogProps) => {
  const [seedWord, setSeedWord] = React.useState('');
  const [quota, setQuota] = React.useState('default');
  const [dryRun, setDryRun] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [result, setResult] = React.useState<ExpandResult | null>(null);
  const [selected, setSelected] = React.useState<string[]>(
    KEYWORD_CATEGORIES.map((item) => item.key),
  );

  const inputRef = React.useRef<HTMLInputElement>(null);

  // 本次打开期间是否真的写入过新词。只有写入了才值得刷新列表——
  // 打开看一眼又关掉，不该产生一次多余的列表请求。
  const wroteRef = React.useRef(false);

  /**
   * 所有关闭路径（按钮 / 点击遮罩 / Esc）的唯一出口，别处不要直接调 onClose。
   *
   * 关闭前先刷新列表（仅当本次确实写了新词）：新生成的词应当立刻出现在列表上，
   * 不该让用户自己再按一次 F5。
   *
   * newestFirst 的用意：列表默认按 id 升序，新写入的词 id 最大、只会落在最后一页，
   * 光刷新的话用户在当前页依然看不见，刷新就白做了。所以仅在「有新增」时把视图切到
   * 最新优先 + 第 1 页（筛选条件原样保留，不动用户正在用的过滤）。
   */
  const closeDialog = React.useCallback(() => {
    if (wroteRef.current) {
      wroteRef.current = false;
      refreshContentList({ newestFirst: true });
    }
    onClose();
  }, [onClose]);

  // 每次打开都回到干净状态，避免上一次的结果残留
  React.useEffect(() => {
    if (!open) return;
    setError('');
    setResult(null);
    setBusy(false);
    wroteRef.current = false;
  }, [open]);

  // 打开时把光标放进输入框，少一次点击
  React.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // 注入浮层样式（幂等）。放 effect 里而不是渲染期间，渲染应保持无副作用
  React.useEffect(() => {
    ensureStyles();
  }, []);

  // Esc 关闭；生成中不响应，避免误关丢失结果
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) closeDialog();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, busy, closeDialog]);

  const toggleCategory = (key: string) => {
    setSelected((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  };

  const submit = async () => {
    const seed = seedWord.trim();
    if (!seed) {
      setError('请先填写核心关键词');
      return;
    }
    if (selected.length === 0) {
      setError('请至少选择一个分类');
      return;
    }

    setBusy(true);
    setError('');
    setResult(null);

    try {
      const perCategory: Record<string, number> = {};
      if (quota !== 'default') {
        selected.forEach((key) => {
          perCategory[key] = Number(quota);
        });
      }

      const { token, source } = getAdminTokenWithSource();
      if (!token) {
        // 空 token 发出去只会得到 401/403，不如在这里直接说清
        setError('未取到登录令牌，请刷新页面或退出重新登录后再试');
        return;
      }

      // 前缀仍是 /api：src/api 下的路由被 Strapi 固定为 content-api 类型，改不成 admin；
      // 后台登录态改由后端 policy 自己解析（见 src/lib/admin-jwt-policy.ts）。
      const response = await fetch('/api/content-factory/keywords/expand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ seedWord: seed, categories: selected, perCategory, dryRun }),
      });

      const payload = (await response.json().catch(() => null)) as unknown;

      if (!response.ok) {
        const message =
          (payload as { error?: { message?: string } })?.error?.message ??
          `请求失败（HTTP ${response.status}）`;
        // 带上令牌来源与长度：区分「压根没取到」和「取到了但服务端不认（过期 / 类型不符）」
        setError(`${message}（令牌来源：${source}，长度 ${token.length}）`);
        return;
      }

      const parsed = payload as ExpandResult;
      setResult(parsed);
      // 只有真正落库（非 dry-run）且确实写了词，关闭时才有刷新的必要
      if (!parsed.dryRun && parsed.created.length > 0) wroteRef.current = true;
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const grouped = React.useMemo(() => {
    const map = new Map<string, string[]>();
    (result?.created ?? []).forEach((item) => {
      const list = map.get(item.category) ?? [];
      list.push(item.word);
      map.set(item.category, list);
    });
    return map;
  }, [result]);

  // ⚠️ 提前返回必须放在**所有 hook 之后**：否则 open 由 true 变 false 时
  // useMemo 会被跳过，hook 数量前后不一致，React 直接抛
  // "Rendered fewer hooks than expected"（独立 root 没有 error boundary，会整块崩掉）。
  if (!open) return null;

  ensureStyles();

  return (
    // 遮罩层：固定定位 + 高 z-index，保证盖在后台任何内容之上
    <div
      className="meidi-kw-overlay"
      onClick={(event: React.MouseEvent) => {
        if (event.target === event.currentTarget && !busy) closeDialog();
      }}
    >
      <div className="meidi-kw-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p className="meidi-kw-title">AI 批量扩词</p>
        <p className="meidi-kw-desc">
          围绕一个核心关键词，一次性扩展出五类关键词。已存在的词会自动跳过，重复点击不会产生重复词条。
        </p>

        <div className="meidi-kw-field">
          <label className="meidi-kw-label" htmlFor="meidi-kw-seed">
            核心关键词
          </label>
          <input
            id="meidi-kw-seed"
            ref={inputRef}
            className="meidi-kw-input"
            value={seedWord}
            disabled={busy}
            placeholder="如：口腔修复"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSeedWord(event.target.value)}
          />
        </div>

        <div className="meidi-kw-field">
          <span className="meidi-kw-label">要生成的分类</span>
          <div className="meidi-kw-checks">
            {KEYWORD_CATEGORIES.map((item) => (
              <label key={item.key} className="meidi-kw-check" title={item.hint}>
                <input
                  type="checkbox"
                  disabled={busy}
                  checked={selected.includes(item.key)}
                  onChange={() => toggleCategory(item.key)}
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>

        <div className="meidi-kw-field">
          <label className="meidi-kw-label" htmlFor="meidi-kw-quota">
            每类条数
          </label>
          <select
            id="meidi-kw-quota"
            className="meidi-kw-select"
            value={quota}
            disabled={busy}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setQuota(event.target.value)}
          >
            {QUOTA_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <label className="meidi-kw-check">
          <input type="checkbox" disabled={busy} checked={dryRun} onChange={() => setDryRun((v) => !v)} />
          只看不写（预览产出，不入库）
        </label>

        {error && <p className="meidi-kw-error">{error}</p>}

        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p className="meidi-kw-success">
              {result.dryRun
                ? `预览完成：共 ${result.created.length} 个词，未入库`
                : `已入库 ${result.created.length} 个词`}
              {result.skipped > 0 ? `，跳过 ${result.skipped} 个（重复或不合法）` : ''}
            </p>

            {KEYWORD_CATEGORIES.filter((item) => grouped.has(item.key)).map((item) => (
              <div key={item.key} className="meidi-kw-group">
                <span className="meidi-kw-group-name">
                  {item.label}（{(grouped.get(item.key) ?? []).length}）
                </span>
                <span className="meidi-kw-group-words">{(grouped.get(item.key) ?? []).join('、')}</span>
              </div>
            ))}
          </div>
        )}

        <div className="meidi-kw-actions">
          <button
            type="button"
            className="meidi-kw-btn meidi-kw-btn-secondary"
            disabled={busy}
            onClick={closeDialog}
          >
            {result ? '关闭' : '取消'}
          </button>
          <button
            type="button"
            className="meidi-kw-btn meidi-kw-btn-primary"
            disabled={busy}
            onClick={() => {
              void submit();
            }}
          >
            {busy ? '模型生成中…' : '开始生成'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeywordGenerateDialog;
