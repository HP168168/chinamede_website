---
name: 全站Schema结构化数据补齐
overview: 为美迪时代教育官网 16 个页面补齐 JSON-LD 结构化数据：扩展 build.js 实现全站共享 Schema（Organization/6校区 LocalBusiness/WebSite）统一注入，并为课程、问答、指南、师资、联系等页面手写页面级 Schema（Course / FAQPage / Article / Person / BreadcrumbList 等），所有字段严格取自现有页面或待用户补充的真值，禁止编造，最后做 JSON 合法性与引用一致性校验。
todos:
  - id: extend-build
    content: 扩展 build.js 新增 schema PART 并修复跳转桩误注入风险
    status: completed
  - id: shared-schema
    content: 用 [skill:geo-schema] 编写 partials/schema.html 机构与校区共享数据
    status: completed
    dependencies:
      - extend-build
  - id: course-teacher-schema
    content: 为课程页加 8 个 Course、师资页加 8 个 Person
    status: completed
    dependencies:
      - shared-schema
  - id: faq-article-schema
    content: 为问答页加 FAQPage、三篇指南加 Article 与面包屑
    status: completed
    dependencies:
      - shared-schema
  - id: rest-page-schema
    content: 为联系/品牌/报名等 9 个页面补齐页面级 Schema 与 BreadcrumbList
    status: completed
    dependencies:
      - shared-schema
  - id: validate-deliver
    content: 校验全部 JSON-LD 合法性、复跑构建并输出待补数据清单
    status: completed
    dependencies:
      - course-teacher-schema
      - faq-article-schema
      - rest-page-schema
---

## 需求背景

用户要求从 SEO/GEO 视角诊断全站并讨论优化方向。经体检后确认：**本轮只做「全站 Schema 结构化数据补齐」**，其余三类（GEO 内容答案块改造、技术基础修复、校区落地页）本轮不做。

## 核心目标

为全站 16 个页面补齐 JSON-LD 结构化数据，让搜索引擎与 AI 大模型（ChatGPT、豆包、DeepSeek、Perplexity、Google AI Overviews）以结构化方式读取机构、课程、问答、文章、讲师、校区等事实，提升富媒体结果与 AI 引用概率。

## 范围边界

- 做：Organization/EducationalOrganization、6 校区 LocalBusiness、WebSite、Course（8 门）、FAQPage、Article（3 篇指南）、Person（8 位讲师）、BreadcrumbList、ContactPage/AboutPage/CollectionPage/WebPage
- 不做：页面文案改写、样式调整、sitemap.xml、robots.txt、llms.txt、301 跳转、图片懒加载、站外品牌布局

## 关键约束（硬性）

所有 Schema 字段必须取自页面现有内容或用户提供的真值，**禁止编造**地址、电话、发布日期、价格、就业数据、履历链接。缺失字段一律省略，交付时给出《待补充数据清单》：① 6 校区详细地址与校区电话（用户已确认可公开，尚未提供）② 3 篇指南真实发布日期 ③ 官网在各平台的主页 URL（用于 sameAs）④ 讲师可公开履历/作品链接（可选）

## 技术栈

- 站点形态：纯静态 HTML + `css/style.css` + `js/main.js`
- 构建：`build.js`（Node.js 脚本，把 `partials/header.html`、`partials/footer.html` 注入全站页面）
- 结构化数据：JSON-LD（schema.org 词汇），内嵌 `<script type="application/ld+json">`
- 校验：一次性 Node 脚本（JSON.parse + `@id` 引用一致性检查），headless Chrome 抽查渲染 DOM

## 实现方案

**1. 共享 Schema 走构建注入（DRY）**
新增 `partials/schema.html`，扩展 `build.js` 增加第三个 PART，在 `</head>` 前以「保留匹配文本」的方式插入。Organization、WebSite、6 校区 LocalBusiness 只维护一份，全站复用；页面级 Schema 则手写进各页 `<head>`。

**2. @id 引用体系**
统一使用 `https://www.chinamede.com/#organization`、`#website`、`#campus-guangzhou` 等锚点 id，页面级 Schema 通过 `{"@id": "https://www.chinamede.com/#organization"}` 引用，避免实体重复声明与不一致。

**3. 必须规避的两个坑**

- `build.js` 的 `main()` 当前只要 header/footer 任一匹配就 `matched=true`；根目录 14 个跳转桩（brand.html 等，约 430B，含 `</head>`）会被 schema PART 误注入。需改为「header 与 footer 都匹配才处理」，或显式把这些桩文件加入 SKIP_FILES
- `inject()` 当前是整体替换匹配区块，新增 PART 必须支持 `keep` 模式（block 插在匹配文本之前），否则会把 `</head>` 吃掉

**4. 取舍说明**

- 为什么扩展 build.js 而非 16 页各写一遍：Organization/校区信息变更时只需改一处，避免 N 处漂移（DRY）；代价是改动构建脚本，改动面小且向后兼容（原有两个 PART 行为不变）
- 为什么 news/business 列表不加 Article：列表项 `href="#"` 无真实详情页，加 Article 会产出无 URL 的无效结构化数据，本轮跳过并注明「补详情页后可扩展」
- 为什么指南文章的日期留空：页面无发布日期，编造会构成错误信息（且 Google 对日期不一致敏感），缺失字段省略优于假数据

**5. 性能与影响面**

- JSON-LD 为 `type="application/ld+json"`，浏览器不执行、不渲染，无 CLS/渲染开销
- 体积：共享块约 2-3KB；课程页 8 门 Course 约 8-12KB；其余页面约 1-2KB。均为文本，Gzip 后可忽略
- 不改动任何 DOM 结构与样式，页面视觉零影响

## 执行要点

- 课程数据从 `courses/index.html` 现取：`course-main-title`（班型名）、`price-main/amount`（价格）、`course-stat-bar`（天数/课时）、`course-desc-highlight`（描述）、`stage-module-list`（模块名+课时，映射为 `teaches` 或 `hasPart`）
- FAQ 从 `faq/index.html` 逐条现取：`button.faq-question > span` 为问题，`.faq-answer-inner` 为答案，答案文本须与页面正文逐字一致
- 讲师从 `teachers/index.html` 现取：`teacher-card > h3`（姓名）、`.title`（jobTitle）、`p`（description），`worksFor` 引用 #organization
- 面包屑：14 个含 `page-banner > .breadcrumb` 的页面统一加 `BreadcrumbList`（index.html 与 404.html 无面包屑，不加）
- 校验后必须 `node build.js` 复跑，确认「15 个页面更新、14 个跳转桩跳过、404.html 跳过」，临时校验脚本跑完删除

## 目录结构

```
d:/traes/meidi-website/
├── build.js                       # [MODIFY] 新增 schema PART（find:/([ \t]*)<\/head>/, keep:true）；inject() 支持 keep 模式；main() 收紧为 header+footer 均匹配才处理，避免 14 个跳转桩被注入 schema
├── partials/
│   └── schema.html                # [NEW] 全站共享 JSON-LD：EducationalOrganization（@id #organization，含 legalName/foundingDate 2011/telephone 400-800-4459/address/areaServed/sameAs 待补）+ 6 校区 subOrganization（LocalBusiness，地址待补）+ WebSite（@id #website，publisher 引用 #organization，inLanguage zh-CN）
├── courses/index.html             # [MODIFY] head 内加 ItemList + 8 × Course（name/description/provider/offers price+CNY/timeRequired/teaches/educationalCredentialAwarded）+ BreadcrumbList
├── faq/index.html                 # [MODIFY] head 内加 FAQPage + 逐条 Question/Answer + BreadcrumbList
├── knowledge/guide-geo.html        # [MODIFY] head 内加 Article（datePublished 待补则省略）+ BreadcrumbList
├── knowledge/guide-newmedia.html   # [MODIFY] 同上
├── knowledge/guide-shortvideo.html # [MODIFY] 同上
├── knowledge/index.html           # [MODIFY] head 内加 CollectionPage + ItemList（3 篇指南）+ BreadcrumbList
├── teachers/index.html            # [MODIFY] head 内加 ItemList + 8 × Person（name/jobTitle/description/worksFor/knowsAbout）+ BreadcrumbList
├── contact/index.html             # [MODIFY] head 内加 ContactPage + ContactPoint（400-800-4459，contactType 招生咨询）+ BreadcrumbList
├── brand/index.html               # [MODIFY] head 内加 AboutPage + BreadcrumbList
├── enroll.html                    # [MODIFY] head 内加 WebPage（报名/试听预约）+ BreadcrumbList
├── students/index.html            # [MODIFY] head 内加 WebPage/CollectionPage + BreadcrumbList（学员案例不做 Review，避免无真实评价数据）
├── industry/index.html            # [MODIFY] head 内加 WebPage + BreadcrumbList
├── news/index.html                # [MODIFY] 仅 BreadcrumbList（列表项无详情页 URL，本轮不加 Article）
├── business/index.html            # [MODIFY] 仅 BreadcrumbList（同上）
└── index.html                     # [MODIFY] head 内加 WebPage（无面包屑）+ 可选指向课程的 ItemList
```

## 关键代码结构

```js
// build.js：新增第三个 PART，在 </head> 前插入（保留 </head>）
const PARTS = [
  { name: 'header', file: 'header.html', find: /([ \t]*)<header class="header">[\s\S]*?<\/header>/ },
  { name: 'footer', file: 'footer.html', find: /([ \t]*)<footer class="footer">[\s\S]*?<\/footer>/ },
  { name: 'schema', file: 'schema.html', find: /([ \t]*)<\/head>/, keep: true }
];

// inject() 需支持 keep：keep 为 true 时把 block 插在匹配文本之前，而非替换它
//   return html.replace(part.find, part.keep ? (m) => block + '\n' + m : () => block);
// main() 收紧：仅当 header 与 footer 都匹配时才处理该页面（含 schema 注入），
//   否则 14 个根目录跳转桩会被误注入 schema
```

```
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": "https://www.chinamede.com/#organization",
      "name": "美迪时代教育",
      "legalName": "广州美迪教育科技有限公司",
      "url": "https://www.chinamede.com/",
      "foundingDate": "2011",
      "telephone": "400-800-4459",
      "areaServed": ["广州", "深圳", "佛山", "东莞", "中山", "江门"],
      "subOrganization": [
        { "@type": "LocalBusiness", "@id": "https://www.chinamede.com/#campus-guangzhou", "name": "美迪时代教育广州校区", "address": "待补充", "telephone": "待补充" }
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://www.chinamede.com/#website",
      "url": "https://www.chinamede.com/",
      "publisher": { "@id": "https://www.chinamede.com/#organization" },
      "inLanguage": "zh-CN"
    }
  ]
}
```

## Agent Extensions

### Skill

- **geo-schema**
- 用途：按 GEO 视角审计并生成结构化数据，用于确定本轮应部署的 Schema 类型、必需/推荐字段与 AI 可发现性最佳实践，指导 Organization、Course、FAQPage、Article、Person、LocalBusiness 的字段设计
- 预期结果：产出符合 schema.org 规范、面向 AI 引用优化的 JSON-LD 字段清单与可校验的标记方案，避免缺字段或字段误用