# 美迪时代教育官网 · SEO / GEO 上线部署清单

> 本文件是上线操作手册，不属于网站运行必需文件，部署后可保留或删除。

## 一、文件总览

| 类别 | 文件 | 用途 |
|---|---|---|
| 页面 | index.html / brand.html / courses.html / industry.html / teachers.html / students.html / faq.html / news.html / business.html / contact.html | 原有 10 大栏目页（已完成 SEO/GEO 改造） |
| 新增页面 | knowledge.html（知识百科）、guide-newmedia.html / guide-geo.html / guide-shortvideo.html（长尾文章）、enroll.html（免费报名）、404.html | 面向 SEO 长尾词与 GEO 内容体系 |
| 样式/脚本 | css/style.css、js/main.js | 独立文件，所有页面统一引用 |
| 爬虫配置 | robots.txt | 声明欢迎所有搜索引擎与 AI 爬虫（GPTBot/ClaudeBot/PerplexityBot 等），附 sitemap 地址 |
| 网站地图 | sitemap.xml | 15 个可收录页面，含优先级与更新频率 |
| GEO 配置 | llms.txt、llms-full.txt | 供 AI 大模型读取的站点说明与完整机构事实（GEO 核心） |
| PWA/图标 | site.webmanifest、favicon.svg、images/og-cover.png | 浏览器图标、社交媒体分享卡片 |

## 二、上线前必须确认的事

1. **替换域名占位符**：全站使用 `https://www.chinamede.com` 作为规范地址。
   - 如最终域名不同，需全局替换以下文件中的域名：所有 `.html`（canonical/OG/JSON-LD）、`robots.txt`、`sitemap.xml`、`llms.txt`、`llms-full.txt`、`site.webmanifest`。
   - 确保域名开通 HTTPS（Let's Encrypt 免费证书即可）。
2. **全站使用绝对地址的规范 URL**（已配置 canonical，可防止重复收录）。
3. **服务器配置**：
   - 404 页面指向 `/404.html`（Nginx: `error_page 404 /404.html;`）。
   - 开启 gzip 压缩与浏览器缓存。
   - 建议把 `index.html` 设为默认首页。

## 三、搜索引擎收录提交（SEO）

| 平台 | 入口 | 提交内容 |
|---|---|---|
| 百度搜索资源平台 | ziyuan.baidu.com | 验证站点 → 提交 sitemap.xml → 抓取诊断 |
| 必应网站管理员工具 | bing.com/webmasters | 导入或提交 sitemap.xml |
| Google Search Console | search.google.com/search-console | 提交 sitemap.xml |
| 搜狗站长平台 | zhanzhang.sogou.com | 提交网址与 sitemap |
| 360 站长平台 | zhanzhang.so.com | 提交网址 |

- 各平台验证方式建议使用「文件验证」，把平台给的验证 html 文件放到网站根目录即可。
- 百度收录新站较慢（2 周-2 个月），可在百度平台做「新站保护」加速。

## 四、GEO（AI 引擎优化）已做与待做

**已内置：**
- `robots.txt` 明确欢迎 GPTBot、OAI-SearchBot、ClaudeBot、PerplexityBot、Google-Extended、Applebot-Extended、meta-externalagent 等 AI 爬虫。
- 根目录 `llms.txt` / `llms-full.txt`：向大模型提供结构化的机构事实、课程体系、FAQ、引用规范。
- 全站 JSON-LD 结构化数据：EducationalOrganization、Course×8、FAQPage（12问）、Article×3、BreadcrumbList、WebSite。
- 定义式内容（"什么是GEO/什么是AIGC/什么是新媒体运营"）与问答式内容，便于 AI 直接引用。

**上线后持续要做：**
1. 在百科类平台（百度百科、抖音百科等）建立/更新"美迪时代教育"词条，保持名称、业务、电话与官网一致（AI 高度依赖全网一致性）。
2. 保持官网内容月度更新（机构动态、知识百科各发 2-4 篇），AI 更信任持续更新的站点。
3. 积累第三方权威背书：新闻媒体报道、行业榜单、学员真实评价。
4. 定期在豆包/DeepSeek/Kimi/ChatGPT 中提问"美迪时代教育""广州职业技能培训哪家好"等，观察是否被引用，并针对性补充内容。
5. 保证 400 电话、公司主体名称在所有平台完全一致（NAP 一致性）。

## 五、内容运营建议（长期 SEO）

- 知识百科每月新增 2-4 篇长尾文章（"XX 怎么学""XX 薪资""XX 和 XX 的区别"句式）。
- 每篇新文章上线后：更新 `sitemap.xml` 的 lastmod，并在百度/必应提交新链接。
- 机构动态发布真实活动，配真实照片（注意加 alt 描述）。
- FAQ 页随业务变化持续补充新问答（页面内的 JSON-LD 同步更新）。

## 六、验收检查（已完成）

- [x] 16 个页面全部具备 title / description / keywords / canonical / OG / JSON-LD
- [x] 404 页面 noindex，不进 sitemap
- [x] robots.txt 欢迎 AI 爬虫 + 声明 sitemap
- [x] sitemap.xml 覆盖全部 15 个可收录页面
- [x] llms.txt / llms-full.txt 含完整机构事实与 12 条 FAQ
- [x] favicon.svg / og-cover.png / site.webmanifest 就绪
- [x] 全站导航互通，新增栏目（知识百科/免费报名）已接入全部页面导航与页脚
