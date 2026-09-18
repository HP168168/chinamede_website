#!/usr/bin/env node
/**
 * 美迪时代教育官网 - 静态页面「头尾公共模块」构建脚本
 *
 * 用法：
 *   node build.js
 *
 * 作用：
 *   1. 把 partials/header.html（顶部导航）和 partials/footer.html（页脚 + 回到顶部按钮）
 *   注入全站每个页面里由标记包裹的区域：
 *
 *     <!-- INCLUDE:header -->
 *     ...本脚本生成，请勿手改，改了也会被下次构建覆盖...
 *     <!-- /INCLUDE:header -->
 *
 * 幂等：重复执行只会把标记之间的内容刷新为 partial 的最新内容，不会重复叠加。
 * 安全：标记区域之外的页面正文（banner、课程、表单等）一律不动。
 *
 *   2. 把 partials/schema.html（全站共享的 JSON-LD 结构化数据：机构、校区、站点）
 *      统一插入每个页面的 </head> 之前（keep 模式：保留 </head>，只在其前面插入）。
 *
 * 今后修改全站头尾或结构化数据：只改 partials/ 下的文件，再执行一次 node build.js。
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PARTIAL_DIR = path.join(ROOT, 'partials');

// 不参与构建的目录
const SKIP_DIRS = ['images', 'css', 'js', 'node_modules', '.git', 'partials', '.codebuddy'];
// 不参与构建的文件：404 页用的是精简版头尾（导航更少、无电话区），单独维护
const SKIP_FILES = ['404.html'];

const PARTS = [
  {
    name: 'header',
    file: 'header.html',
    find: /([ \t]*)<header class="header">[\s\S]*?<\/header>/
  },
  {
    name: 'footer',
    file: 'footer.html',
    find: /([ \t]*)<footer class="footer">[\s\S]*?<\/footer>/
  },
  // 结构化数据：keep:true 表示"在匹配到的 </head> 之前插入"，而不是替换掉它
  {
    name: 'schema',
    file: 'schema.html',
    find: /([ \t]*)<\/head>/,
    keep: true
  }
];

function walk(dir, out) {
  out = out || [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.includes(entry.name)) walk(full, out);
    } else if (entry.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

function readPartial(file) {
  const full = path.join(PARTIAL_DIR, file);
  if (!fs.existsSync(full)) {
    throw new Error('缺少公共模块文件：partials/' + file);
  }
  return fs.readFileSync(full, 'utf8').replace(/\r\n/g, '\n').replace(/\s+$/, '');
}

function detectEol(text) {
  return text.indexOf('\r\n') !== -1 ? '\r\n' : '\n';
}

function stripMarkers(html, name) {
  // 先整行删掉该模块遗留的所有 INCLUDE 标记（含重复残留），再重新包裹，保证幂等
  const re = new RegExp('(?:\\r?\\n)?[ \\t]*<!-- \\/?INCLUDE:' + name + ' -->', 'g');
  return html.replace(re, '');
}

function stripBlock(html, name) {
  // keep 模式专用：连标记之间的内容一并删掉。
  // 只删标记的话，旧的结构化数据会残留，每次构建叠加一份。
  const re = new RegExp(
    '(?:\\r?\\n)?[ \\t]*<!-- INCLUDE:' + name + ' -->[\\s\\S]*?<!-- \\/INCLUDE:' + name + ' -->',
    'g'
  );
  return html.replace(re, '');
}

function inject(html, part, partialText) {
  html = part.keep ? stripBlock(html, part.name) : stripMarkers(html, part.name);
  const matched = html.match(part.find);
  if (!matched) return null;
  const indent = matched[1] || '';
  const block = [
    indent + '<!-- INCLUDE:' + part.name + ' -->',
    partialText,
    indent + '<!-- /INCLUDE:' + part.name + ' -->'
  ].join('\n');
  return html.replace(part.find, function (m) {
    // keep 模式：把模块插在匹配文本（如 </head>）之前，匹配文本本身保留
    return part.keep ? block + '\n' + m : block;
  });
}

function removeStrayBackToTop(html) {
  // 页脚公共模块里已包含回到顶部按钮，删掉标记区域之外残留的旧按钮
  const start = html.indexOf('<!-- INCLUDE:footer -->');
  const end = html.indexOf('<!-- /INCLUDE:footer -->');
  // 末尾的 \r?\n? 一并吃掉，避免删掉旧按钮后留下越积越多的空行
  const re = /(?:\r?\n[ \t]*<!-- 回到顶部 -->)?\r?\n[ \t]*<a href="#" class="back-to-top"[^>]*>[^<]*<\/a>\r?\n?/g;

  let out = '';
  let cursor = 0;
  let m;
  while ((m = re.exec(html)) !== null) {
    const insideFooter = start !== -1 && end !== -1 && m.index > start && m.index < end;
    if (insideFooter) continue;
    out += html.slice(cursor, m.index);
    cursor = m.index + m[0].length;
  }
  out += html.slice(cursor);
  return out;
}

function main() {
  const partials = {};
  PARTS.forEach(function (part) { partials[part.name] = readPartial(part.file); });

  const stats = { updated: [], unchanged: [], skipped: [] };

  walk(ROOT).forEach(function (file) {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');

    if (SKIP_FILES.includes(rel)) {
      stats.skipped.push(rel + '（精简版头尾，保持独立）');
      return;
    }

    const original = fs.readFileSync(file, 'utf8');
    let html = original;
    const done = {};

    PARTS.forEach(function (part) {
      // schema 只注入给"既有头又有尾"的正式页面：
      // 根目录那批跳转桩只有 </head> 没有头尾区块，不能往里塞结构化数据
      if (part.name === 'schema' && !(done.header && done.footer)) return;
      const next = inject(html, part, partials[part.name]);
      if (next === null) return;
      done[part.name] = true;
      html = next;
    });

    if (!done.header || !done.footer) {
      stats.skipped.push(rel + '（无头尾区域，如跳转页）');
      return;
    }

    html = removeStrayBackToTop(html);

    // 先按原文件的行尾风格归一化，再比较，避免 CRLF/LF 差异造成"假改动"
    const output = html.split(/\r?\n/).join(detectEol(original));
    if (output === original) {
      stats.unchanged.push(rel);
      return;
    }

    fs.writeFileSync(file, output, 'utf8');
    stats.updated.push(rel);
  });

  console.log('已写入头部/页脚公共模块与结构化数据：' + stats.updated.length + ' 个页面');
  stats.updated.forEach(function (rel) { console.log('  [更新] ' + rel); });
  if (stats.unchanged.length) {
    console.log('内容已是最新，无需改动：' + stats.unchanged.length + ' 个页面');
    stats.unchanged.forEach(function (rel) { console.log('  [一致] ' + rel); });
  }
  if (stats.skipped.length) {
    console.log('跳过：' + stats.skipped.length + ' 个页面');
    stats.skipped.forEach(function (rel) { console.log('  [跳过] ' + rel); });
  }
}

main();
