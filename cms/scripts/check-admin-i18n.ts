/**
 * 校验后台管理面板的中文串（`src/admin/translations/*.ts` 与 `src/admin/app.ts`）。
 *
 * 为什么需要：管理面板的界面串是「键名 + 翻译」的形式，错一个键名或 ICU 占位符，
 * 界面上就会各自回退成英文或直接显示 `{xxx}`，肉眼很难发现。本脚本做六件事：
 *   1. 键名必须在官方英文包里真实存在（插件串按运行时前缀 `content-manager.` 等拼接）；
 *   2. ICU 占位符结构必须与英文完全一致（变量名、plural/select 类型、分支数、`#` 个数）；
 *   3. 键不得跨文件重复定义；
 *   4. 每个 schema 字段（内容类型 + 组件）都要有中文标签键，且值里要有中文；
 *   5. 列出「覆盖了官方已有中文」的键，便于确认品牌串是有意为之；
 *   6. 列出「官方英文有、官方中文缺、我们也没补」的界面串缺口（写明细到 .tmp/i18n-gaps.txt）。
 *
 * 用法：npm run check:i18n
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const requireCjs = createRequire(path.join(process.cwd(), 'package.json'));

/** 官方语言包位置与运行时键前缀（插件串注册时会拼上插件 id） */
const PACKAGES: Array<[name: string, dir: string, prefix: string]> = [
  ['admin', 'node_modules/@strapi/admin/dist/admin/admin/src/translations', ''],
  ['content-manager', 'node_modules/@strapi/content-manager/dist/admin/translations', 'content-manager.'],
  ['content-type-builder', 'node_modules/@strapi/content-type-builder/dist/admin/translations', 'content-type-builder.'],
  ['upload', 'node_modules/@strapi/upload/dist/admin/translations', 'upload.'],
  ['i18n', 'node_modules/@strapi/i18n/dist/admin/translations', 'i18n.'],
  ['email', 'node_modules/@strapi/email/dist/admin/translations', 'email.'],
  ['users-permissions', 'node_modules/@strapi/plugin-users-permissions/dist/admin/translations', 'users-permissions.'],
];

/**
 * 运行时代码里真实引用、但官方英文包没有收录的键。
 *
 * Strapi 的 formatMessage 会带 `defaultMessage` 兜底，所以这类键没翻译时界面显示的是
 * 硬编码英文（例如列表页表头 STATUS），而不是键名本身 —— 也就是说它确实是有效键，
 * 只是没有英文原文可供比对。因此不参与「键名是否存在于官方英文包」的校验。
 *
 * 每条都要注明来源，便于升级 Strapi 后复查（官方哪天补进英文包就可以从这里移除）。
 */
const RUNTIME_ONLY_KEYS = new Set([
  // @strapi/content-manager/dist/admin/pages/ListView/ListViewPage.js —— 列表页「文档状态」列的表头
  'content-manager.containers.list.table-headers.status',
  // 左侧导航的插件显示名：来自插件硬编码的 displayName，官方语言包（en / zh-Hans）都没有这个键。
  // 按 Strapi 的 <插件id>.plugin.name 约定补上即可生效，已在界面验证（显示「内容管理器」）。
  'content-manager.plugin.name',
]);

const TRANSLATION_DIR = 'src/admin/translations';
const APP_FILE = 'src/admin/app.ts';
/** 字段标签由代码生成，需要用模块求值的方式读取（行正则读不到生成结果） */
const GENERATED_FILES = new Set([path.join(TRANSLATION_DIR, 'field-labels.ts')]);
const GAPS_FILE = '.tmp/i18n-gaps.txt';

type Entry = { key: string; value: string; line: number };

function readLocalePack(file: string): Record<string, string> {
  if (!fs.existsSync(file)) return {};
  const mod = requireCjs(path.resolve(file));
  return (mod.default ?? mod) as Record<string, string>;
}

/** 从 TS 源码里按行抽取 `'键': '值',` 形式的中文串 */
function readTranslationFile(file: string): Entry[] {
  const entries: Entry[] = [];
  fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .forEach((line, index) => {
      const match = /^\s*'((?:[^'\\]|\\.)*)':\s*'((?:[^'\\]|\\.)*)',\s*$/.exec(line);
      if (match) {
        // 键名里也可能带转义引号（官方语言包自身就有这类键，如
        // `...uniqueField.v5.willBeDisabled'`），两边都要还原成真实字符再比对
        entries.push({
          key: match[1].replace(/\\'/g, "'"),
          value: match[2].replace(/\\'/g, "'"),
          line: index + 1,
        });
      }
    });
  return entries;
}

/** 直接求值模块，拿到所有键值（用于生成式配置文件） */
async function readGeneratedEntries(file: string): Promise<Entry[]> {
  const mod = await import(pathToFileURL(path.resolve(file)).href);
  const object = (mod.default ?? mod) as Record<string, string>;
  return Object.entries(object).map(([key, value]) => ({ key, value: String(value), line: 0 }));
}

/** 取出 `{...}` 形式的 ICU 片段（含嵌套） */
function placeholders(text: string): string[] {
  const found: string[] = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== '{') continue;
    let depth = 0;
    let j = i;
    for (; j < text.length; j++) {
      if (text[j] === '{') depth++;
      else if (text[j] === '}' && --depth === 0) break;
    }
    found.push(text.slice(i, j + 1));
    i = j;
  }
  return found;
}

/** 占位符结构指纹：变量名 + ICU 类型 + 分支数 + `#` 个数（忽略具体文案） */
function signature(text: string): string {
  return placeholders(text)
    .map((token) => {
      const parts = token.slice(1, -1).split(',');
      const name = parts[0].trim();
      const type = parts.length > 1 ? parts[1].trim() : '';
      const hashes = (token.match(/#/g) ?? []).length;
      const blocks = (token.match(/\{/g) ?? []).length - 1;
      return `${name}|${type}|${blocks}|${hashes}`;
    })
    .sort()
    .join(' + ');
}

/**
 * 枚举所有 schema 字段，得出「字段标签」的合法键与期望来源。
 *
 * 两类键（管理面板源码里的构造规则）：
 *   内容类型字段 `content-manager.content-types.<UID>.<字段>`，
 *   组件子字段   `content-manager.components.<UID>.<字段>`。
 * 官方语言包里没有这两类键，所以它们不会出现在 en 映射里，需要单独放行。
 */
function collectSchemaFields(): { keys: Map<string, string>; uids: number } {
  const keys = new Map<string, string>();
  let uids = 0;

  const add = (scope: string, uid: string, attributes: Record<string, unknown>) => {
    uids++;
    for (const field of Object.keys(attributes)) {
      keys.set(`content-manager.${scope}.${uid}.${field}`, `${uid}.${field}`);
    }
  };

  const apiRoot = path.join('src', 'api');
  if (fs.existsSync(apiRoot)) {
    for (const api of fs.readdirSync(apiRoot)) {
      const dir = path.join(apiRoot, api, 'content-types');
      if (!fs.existsSync(dir)) continue;
      for (const name of fs.readdirSync(dir)) {
        const file = path.join(dir, name, 'schema.json');
        if (!fs.existsSync(file)) continue;
        const schema = JSON.parse(fs.readFileSync(file, 'utf8')) as { attributes?: Record<string, unknown> };
        add('content-types', `api::${api}.${api}`, schema.attributes ?? {});
      }
    }
  }

  const componentRoot = path.join('src', 'components');
  const walk = (dir: string) => {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) {
        walk(full);
        continue;
      }
      if (!item.name.endsWith('.json')) continue;
      const uid = path
        .relative(componentRoot, full)
        .replace(/\\/g, '/')
        .replace(/\.json$/, '')
        .split('/')
        .join('.');
      const schema = JSON.parse(fs.readFileSync(full, 'utf8')) as { attributes?: Record<string, unknown> };
      add('components', uid, schema.attributes ?? {});
    }
  };
  if (fs.existsSync(componentRoot)) walk(componentRoot);

  return { keys, uids };
}

/** 中文（含常用全角标点）检测：用于发现「只是把英文名抄了一遍」的字段标签 */
function hasChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

async function main() {
  const en = new Map<string, string>();
  const zhOfficial = new Map<string, string>();
  for (const [, dir, prefix] of PACKAGES) {
    for (const [key, value] of Object.entries(readLocalePack(path.join(dir, 'en.json.js')))) {
      en.set(prefix + key, value);
    }
    for (const [key, value] of Object.entries(readLocalePack(path.join(dir, 'zh-Hans.json.js')))) {
      zhOfficial.set(prefix + key, value);
    }
  }

  const files = [
    ...fs
      .readdirSync(TRANSLATION_DIR)
      .filter((name) => name.endsWith('.ts'))
      .map((name) => path.join(TRANSLATION_DIR, name)),
    APP_FILE,
  ];

  const schema = collectSchemaFields();
  const definedAt = new Map<string, string>();
  const definedValues = new Map<string, string>();
  const unknownKeys: string[] = [];
  const placeholderMismatches: string[] = [];
  const duplicates: string[] = [];
  const shadowed: string[] = [];
  const englishValues: string[] = [];
  let total = 0;

  for (const file of files) {
    const entries = GENERATED_FILES.has(path.join(file))
      ? await readGeneratedEntries(file)
      : readTranslationFile(file);

    entries.forEach(({ key, value, line }) => {
      total++;
      const where = line > 0 ? `${file}:${line}` : `${file}（生成）`;

      if (definedAt.has(key)) duplicates.push(`${where}  ${key}（另一处：${definedAt.get(key)}）`);
      else definedAt.set(key, where);
      definedValues.set(key, value);

      // 字段标签键来自 schema 枚举，官方语言包没有，因此单独放行
      if (!en.has(key)) {
        const exempt = schema.keys.has(key) || RUNTIME_ONLY_KEYS.has(key);
        if (!exempt) unknownKeys.push(`${where}  ${key}`);
        return;
      }

      const english = en.get(key) as string;
      if (signature(english) !== signature(value)) {
        placeholderMismatches.push(`${where}  ${key}\n      英文：${english}\n      中文：${value}`);
      }
      if (zhOfficial.has(key)) {
        shadowed.push(`${where}  ${key}\n      官方中文「${zhOfficial.get(key)}」 -> 我们改成「${value}」`);
      }
    });
  }

  // [4] schema 字段标签完整性：每个字段都必须有键，且值里要有中文
  const missingFieldLabels: string[] = [];
  for (const [key, label] of schema.keys) {
    const where = definedAt.get(key);
    if (!where) missingFieldLabels.push(`${label}   缺键 ${key}`);
    else if (!hasChinese(definedValues.get(key) ?? '')) englishValues.push(`${where}  ${key}`);
  }

  // [6] 官方英文有、官方中文缺、我们也未覆盖的界面串
  const gaps: string[] = [];
  for (const [key, english] of en) {
    if (zhOfficial.has(key) || definedAt.has(key)) continue;
    gaps.push(`${key}\t${english.replace(/\s+/g, ' ')}`);
  }
  fs.writeFileSync(GAPS_FILE, gaps.map((line) => line.split('\t').join('  =  ')).join('\n'), 'utf8');

  const gapGroups = new Map<string, number>();
  for (const line of gaps) {
    const key = line.split('\t')[0];
    const parts = key.split('.');
    const group = parts.slice(0, 3).join('.');
    gapGroups.set(group, (gapGroups.get(group) ?? 0) + 1);
  }
  const topGaps = [...gapGroups.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);

  console.log(`\n合计 ${total} 条，覆盖 ${definedAt.size} 个唯一键`);
  console.log(`schema 字段标签：${schema.keys.size} 个字段 / ${schema.uids} 个内容类型与组件`);

  console.log(`\n[1] 官方英文包里不存在的键（多半是拼写错误）：${unknownKeys.length} 条`);
  unknownKeys.forEach((line) => console.log('  ' + line));
  console.log(`\n[2] 占位符与英文不一致：${placeholderMismatches.length} 条`);
  placeholderMismatches.forEach((line) => console.log('  ' + line));
  console.log(`\n[3] 重复定义的键：${duplicates.length} 条`);
  duplicates.forEach((line) => console.log('  ' + line));
  console.log(`\n[4] 缺中文标签的 schema 字段：${missingFieldLabels.length} 条`);
  missingFieldLabels.forEach((line) => console.log('  ' + line));
  console.log(`\n[5] 字段标签值疑似未翻译（不含中文）：${englishValues.length} 条`);
  englishValues.forEach((line) => console.log('  ' + line));
  console.log(`\n[6] 覆盖官方已有中文的键（信息：品牌串属于有意覆盖）：${shadowed.length} 条`);
  shadowed.forEach((line) => console.log('  ' + line));
  console.log(`\n[7] 官方英文有、官方中文缺、我们未补的界面串：${gaps.length} 条（明细：${GAPS_FILE}）`);
  topGaps.forEach(([group, count]) => console.log(`  ${String(count).padStart(4)}  ${group}`));

  const failed = unknownKeys.length + placeholderMismatches.length + duplicates.length;
  const incomplete = missingFieldLabels.length + englishValues.length;
  console.log(
    failed === 0
      ? `\n校验通过${incomplete === 0 ? '，字段标签无遗漏。' : `，但字段标签仍有 ${incomplete} 处待处理。`}`
      : `\n校验失败：${failed} 处问题需要修正。`,
  );
  if (incomplete > 0 && failed === 0) {
    console.log(`（字段标签缺口不会阻塞提交，但请在 src/admin/translations/field-labels.ts 里补齐）`);
  }
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
