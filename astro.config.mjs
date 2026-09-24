import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * 站点基准地址的唯一来源是后台「站点设置 → 站点基准地址」。
 * sitemap 在配置阶段就需要绝对地址，无法等待构建期取数，因此这里读取内容快照
 * （npm run cms:snapshot 生成，与 CMS 同源）并支持用环境变量覆盖。
 * canonical、OG、JSON-LD、llms.txt 由 src/lib/strapi.ts 读同一字段，四处保持一致。
 */
function resolveSiteUrl() {
  const fromEnv = process.env.SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, '');

  try {
    const snapshot = path.resolve('src', 'data', '__snapshot__', 'siteConfig.json');
    const baseUrl = JSON.parse(fs.readFileSync(snapshot, 'utf8'))?.data?.baseUrl;
    if (typeof baseUrl === 'string' && baseUrl.trim()) return baseUrl.trim().replace(/\/+$/, '');
  } catch {
    // 快照缺失时回退到线上主域，保证首次克隆也能构建
  }

  return 'https://www.chinamede.com';
}

// 美迪时代教育官网 - Astro 静态站配置
// 说明：
//   output: 'static'        纯静态 SSG，产物 dist 直接交给 Nginx / GitHub Pages
//   build.format: directory 保持与现网一致的 xxx/index.html 目录式 clean URL
//   trailingSlash: always   目录形式统一带尾斜杠，避免重复 URL
//   compressHTML: true      Astro 7 默认改为 'jsx'，会吃掉中文与行内元素之间的空格，
//                           这里显式回到旧行为，保证中文排版与旧站一致
export default defineConfig({
  site: resolveSiteUrl(),
  output: 'static',
  build: { format: 'directory' },
  trailingSlash: 'always',
  compressHTML: true,
  integrations: [
    sitemap({
      // 排除非页面端点与 404，保持与旧站 sitemap 收录范围一致
      filter: (page) => !page.includes('llms') && !page.includes('404'),
    }),
  ],
});
