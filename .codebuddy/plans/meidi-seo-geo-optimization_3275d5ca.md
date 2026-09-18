---
name: meidi-seo-geo-optimization
overview: 对美迪时代教育官网执行 SEO/GEO 优化：先统一全站事实口径并增强结构化数据/性能/Title，再把 courses 单页拆分为 8 个独立课程页并提供 Nginx 301 配置。不含城市页与 GEO 监测。
todos:
  - id: fact-unify
    content: 统一全站事实口径：修 og:site_name 错别字、法人名、6城13校区表述、咨询时间，同步 llms.txt 与 llms-full.txt
    status: completed
  - id: schema-boost
    content: 用 [skill:geo-schema] 审计并增强结构化数据：补 datePublished/dateModified、Course location 与 hasCourseInstance、FAQPage 逐问 @id+url、sameAs 占位
    status: completed
    dependencies:
      - fact-unify
  - id: perf-pass
    content: 优化加载性能：全站图片补 width/height 与 lazy、首屏图 preload、生成 style.min.css 并按 ?v= 机制切换
    status: completed
  - id: meta-normalize
    content: 规范化 15 页 Title 与 Description：统一分隔符与品牌后缀，重排核心长尾词布局
    status: completed
    dependencies:
      - fact-unify
  - id: course-pages
    content: 用 [subagent:code-explorer] 定位课程块后拆分 8 个独立课程页，补 内链、sitemap 与 llms 链接
    status: completed
    dependencies:
      - schema-boost
      - perf-pass
      - meta-normalize
  - id: nginx-301
    content: 输出 deploy/nginx-redirects.conf，为 11 个根目录跳转桩配置真正的服务端 301
    status: completed
  - id: final-audit
    content: 用 [skill:geo-technical] 与 [skill:geo-llmstxt] 做终验：执行 node build.js 并复核全站一致性
    status: completed
    dependencies:
      - course-pages
      - nginx-301
      - fact-unify
---

## 用户需求

对美迪时代教育官网（静态站，15 个正式页面 + 11 个跳转桩）执行 SEO 与 GEO 优化。用户已完成诊断讨论并确认范围，现在进入方案阶段。用户原始要求：先讨论清楚再实施，不动代码直到达成一致。

## 本轮纳入范围（用户已确认）

1. **事实口径统一**：修复 og:site_name 错别字、法人名、校区数量、咨询时间四处自相矛盾的表述（含 llms.txt / llms-full.txt / 结构化数据）
2. **结构化数据增强**：补 datePublished / dateModified / Course 的 location 与 hasCourseInstance / FAQPage 每问独立 @id 与 url / sameAs 占位
3. **性能优化**：全站图片补 width/height 与 loading="lazy"、首屏图 preload、CSS 压缩
4. **Title / Description 规范化**：15 页统一品牌后缀与分隔符，补核心长尾词布局
5. **Nginx 301**：为根目录 11 个跳转桩输出真正的服务端 301 配置
6. **8 个课程独立页**：将 courses 单页的 8 个课程块拆为独立 URL

## 明确不做

- 城市 / 13 校区落地页
- GEO 量化监测基线
- 站外资产铺设（暂无第三方平台，sameAs 仅留结构化占位）

## 约束

- 涉及就业、薪资、退费的文案必须保持现有广告法合规底色（不承诺"包就业""月入过万"）
- 任何 partials/ 修改后必须执行 node build.js 同步到 15 个页面
- 咨询时间最终取值需用户确认（当前存在 8:00-23:00 与 9:00-21:00 两套）

## 技术栈

沿用现有静态站技术，不引入任何构建框架：静态 HTML + `css/style.css` + `js/main.js` + `build.js`（Node.js 原生 fs 的 partial 注入脚本）+ 自建 Nginx/Apache。

## 实施方案

### 总体策略

按"事实层 → 机器可读层 → 性能层 → 内容层 → 索引层"由内向外推进。事实口径是所有优化的地基：AI 实体对齐失败会让后续结构化数据投入全部失效，因此排在最前。

### 关键技术决策

**1. partials 驱动，一处修改全站生效**

全站结构化数据与头尾由三个 partial 通过 `build.js` 注入：`partials/schema.html`（插到 `</head>` 前，keep 模式）、`partials/header.html`、`partials/footer.html`。因此全站级的 para

- datePublished/dateModified
- sameAs 占位
- 图片 width/height 与 lazy（header/footer 的 logo）
- 电话服务时间

都应改在 partials 里，避免逐页手改 15 份导致的漂移。**每次改完必须执行 `node build.js`**，脚本幂等，重复执行安全。

**2. 事实口径以"最小惊讶 + 最细颗粒"取值**

- 法人名：以 footer 与 schema 现行值 `广州美迪教育科技有限公司` 为准（出现次数最多且与备案主体一致），修改 llms.txt 第 41 行
- 校区数：保留"6 城 13 个直营校区"这一更精确的口径，llms.txt / llms-full.txt 同步升级，并补一行"即在广州、深圳、佛山、东莞、中山、江门 6 座城市开设 13 个直营校区"，同时消解"6"与"13"的表面冲突
- og:site_name：修 `faq/index.html` 第 24 行多出的"时代"
- 咨询时间：以 partials/header.html 的 8:00-23:00 为准（面向用户的公开承诺），同步 llms.txt / llms-full.txt / schema 的 OpeningHoursSpecification

**3. 8 个课程页：目录式 URL，符合现有约定**

站点已确立目录式约定（`/brand/index.html`、`/courses/index.html`），因此课程页采用 `/courses/n1-ai-newmedia/index.html` 形态而非 `.html` 文件，与现有结构一致且对 Nginx 友好。

旧 URL 保留策略：`/courses/` 依然是完整的课程总览页（保留 8 个完整课程块），不减肥为摘要页。理由是 courses 页已有丰富的 Course 结构化数据与良好内容深度，删内容会造成 SEO 回退；新生成的 8 个详情页各自获得独立 title/description/canonical/Course LD/FAQ 区块，与总览页通过 canonical 与内链形成补充而非重复的集合关系。这是损失最小、无回退风险的拆法。

**4. 结构化数据：只做增量，不动已验证结构**

现有 JSON-LD 已通过 Even

- Course 的 offers.price、timeRequired、teaches
- FAQPage、BreadcrumbList、Person
- 13 个校区 LocalBusiness

应完整保留。本轮只做加法：

- 页面级 `WebPage` / `Article` 补 `datePublished` + `dateModified`
- `Course` 补 `location`（@id 引用已有校区节点）+ `hasCourseInstance`
- `FAQPage` 每个 `Question` 补独立 `@id` 与 `url` 锚点，让 AI 可精确到单问引用
- 组织节点加 `sameAs` 占位（注释标注待回填），因用户确认暂无站外资产

**5. 性能：优先做零风险的两项**

- 全站 `<img>` 补 `width`/`height` + `loading="lazy"`，首屏 hero/banner/logo 除外（避免负向 LCP）
- CSS 生成压缩版 `style.min.css`，通过现有 `?v=` 版本号机制切换，不改动引入方式的骨架

暂不做的：字体子集化、图片再压缩（收益/风险比低，且与 prompted 文案资产无关）。

### 复杂度与性能

- `build.js` 复杂度 O(文件数 × 模块数)，15 页无性能顾虑
- 新增 8 页后全站 23 个 URL，sitemap 与 llms 需同步，均已纳入同一任务避免遗漏
- 图片 width/height 消除 CLS；lazy 减少首屏请求数

## 目录结构

```
meidi-website/
├── partials/
│   ├── schema.html          # [MODIFY] 全站共享 JSON-LD：统一法人名与 6城13校区表述；OpeningHours 08:00-23:00；组织节点加 sameAs 占位注释；WebSite 补 search 动作（如适用）
│   ├── header.html          # [MODIFY] 第34行电话时间口径核对；logo 图补 width/height；导航链接保持不变
│   └── footer.html          # [MODIFY] logo 图补 width/height；机构简介保留
├── css/
│   ├── style.css            # [MODIFY] 图片尺寸相关样式配合；保留可读版作为源
│   └── style.min.css        # [NEW] 压缩版，通过现有 ?v= 版本号机制切换引用
├── courses/
│   ├── index.html           # [MODIFY] 保留 8 个完整课程块；8 张封面图补 width/height/lazy；课程卡链接改为指向各自独立页；Title/Desc 重排
│   ├── n1-ai-newmedia/
│   │   └── index.html       # [NEW] N1 AI新媒体运营师就业班独立页
│   ├── n2-ai-visual-design/
│   │   └── index.html       # [NEW] N2 AI视觉设计师就业班独立页
│   ├── n3-short-video/
│   │   └── index.html       # [NEW] N3 商业短视频创作师就业班独立页
│   ├── n4-aigc/
│   │   └── index.html       # [NEW] N4 AIGC全能就业班独立页（价格 22800 单独强调）
│   ├── n5-ai-drama/
│   │   └── index.html       # [NEW] N5 AI短剧漫剧创作师就业班独立页
│   ├── n6-amazon/
│   │   └── index.html       # [NEW] N6 亚马逊高阶运营实战班独立页
│   ├── n7-tiktok/
│   │   └── index.html       # [NEW] N7 TikTok营销实战班独立页
│   └── n8-overseas-smm/
│       └── index.html       # [NEW] N8 海外社媒运营专员就业班独立页
├── index.html               # [MODIFY] 6 门热门课 cards 链接指向各自独立页；ItemList 的 url 用锚点
├── faq/index.html           # [MODIFY] 修 og:site_name 错别字；FAQPage 每问补独立 @id 与 url 锚点
├── knowledge/guide-*.html   # [MODIFY] 3 篇攻略的 Article 补 datePublished/dateModified
├── {brand,business,contact,industry,news,students,teachers}/index.html  # [MODIFY] 图片 lazy/尺寸；Title/Desc 规范化
├── enroll.html              # [MODIFY] 同上
├── sitemap.xml              # [MODIFY] 新增 8 条课程页 URL，lastmod 按真实日期
├── llms.txt                 # [MODIFY] 法人名、6城13校区、咨询时间三项统一；课程列表改为指向 8 个独立页 URL
├── llms-full.txt            # [MODIFY] 同上三项
├── deploy/
│   └── nginx-redirects.conf # [NEW] 11 个根目录跳转桩的 return 301 规则 + CSS/long-cache 建议，供服务端 include
└── build.js                 # [MODIFY] 无需改逻辑；确认新目录能被 walk() 遍历到即 scripts 可注入头尾与 schema
```

课程页统一模板结构（每页至少 4 个功能区块，保证不出现薄内容）：

```
page-banner（h1 + 面包屑，面包屑含 首页 / 培训课程 / 本课）
  → 课程概览（封面图 + 天数/课时/学费/班型速览表）
  → 阶段化课程大纲（沿用原 echelons 可视化结构）
  → 就业岗位与适合人群双栏
  → 认证与退费/就业服务说明（复用已合规表述）
  → FAQ 区块（3-5 问，FAQPage 结构化）
  → CTA（免费试听 + 热线）
```

## 实施注意事项（防回退）

- **partials 改动后必须 `node build.js`**，否则 15 个页面仍是旧内容；脚本幂等可重复执行
- 新目录 `courses/n*/` 不在 `build.js` 的 SKIP_DIRS 中，`walk()` 会自动遍历，新建页面只需写一次可由脚本补 header/footer/schema 的骨架；写入时务必保证页面含 `<header class="header">` 与 `<footer class="footer">` 区块，否则会被判定为跳转桩而跳过 schema 注入
- 价格、天数、课时必须与 `courses/index.html` 现有 Course JSON-LD 完全一致，不得出现两套数据
- 所有新增文案禁止使用"包就业""保证就业""月入过万"等表述，沿用 faq 现有"不是承诺包就业，而是合同化就业服务清单"的合规话术
- 图片加 `loading="lazy"` 时排除首屏：hero 图、page-banner 图、header/footer logo
- CSS 切换压缩版时保留 `style.css` 源文件，避免丧失可维护性

## Agent Extensions

### Skill

- **geo-schema**
- Purpose: 对全站 JSON-LD 做结构化数据审计并生成/校验增量（datePublished/dateModified、Course location 与 hasCourseInstance、FAQPage 逐问 @id+url、sameAs 占位）
- Expected outcome: 输出各页面 schema 校验结论（Google Rich Results Test / 百度结构化数据校验零警告），以及可粘贴的增量 JSON-LD 片段

- **geo-technical**
- Purpose: 对改造后的站点做 SEO/GEO 技术项复核（AI 爬虫可达性、robots.txt、canonical 一致性、图片尺寸与懒加载、性能优化点）
- Expected outcome: 输出技术问题清单与修复验证结果，确认 8 个新课程页与 Nginx 301 规则生效前后无误伤

- **geo-llmstxt**
- Purpose: 校验并更新 llms.txt / llms-full.txt，使其与页面事实、新增课程页 URL 保持一致
- Expected outcome: 输出口径一致的 llms.txt 与 llms-full.txt，实体名称、校区数量、咨询时间、8 门课程链接均无冲突

### SubAgent

- **code-explorer**
- Purpose: 在拆分 8 个课程页前精确定位 `courses/index.html` 中每块课程内容的起止行、图片路径与阶段结构，避免复制遗漏
- Expected outcome: 输出 8 个课程块的精确行区间与资源清单