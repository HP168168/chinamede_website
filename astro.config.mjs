import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 美迪时代教育官网 - Astro 静态站配置
// 说明：
//   output: 'static'        纯静态 SSG，产物 dist 直接交给 Nginx / GitHub Pages
//   build.format: directory 保持与现网一致的 xxx/index.html 目录式 clean URL
//   trailingSlash: always   目录形式统一带尾斜杠，避免重复 URL
//   compressHTML: true      Astro 7 默认改为 'jsx'，会吃掉中文与行内元素之间的空格，
//                           这里显式回到旧行为，保证中文排版与旧站一致
export default defineConfig({
  site: 'https://www.chinamede.com',
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
