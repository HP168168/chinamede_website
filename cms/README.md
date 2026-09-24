# 美迪时代教育 · 内容后台（Strapi 5）

官网（Astro 静态站）的唯一内容源，同时承担**知识库**与**AI 内容工厂**。
独立工程，与官网各自安装依赖、各自部署，互不影响。

---

## 1. 环境要求

| 项 | 要求 | 本机现状 |
| --- | --- | --- |
| Node.js | `>=20 <=26`（建议 22 LTS，见 `.nvmrc`） | v24.12.0（满足） |
| npm | `>=6` | 11.6.2 |
| 数据库 | 默认 SQLite（零配置），可切 MySQL / Postgres | SQLite `.tmp/data.db` |

> 官网构建用 Node 24、本工程用 Node 22 并不冲突：两者是各自独立的 `npm install`。

---

## 2. 首次启动

```powershell
cd cms
copy .env.example .env      # 已存在 .env 则跳过
npm install
npm run develop             # 开发模式，改动自动重启
```

启动后访问 <http://localhost:1337/admin> 创建第一个管理员账号（该账号即超级管理员）。

生产模式：

```powershell
npm run build     # 构建管理面板
npm run start     # 以生产模式启动
```

`.env` 里的 `APP_KEYS`、`ADMIN_JWT_SECRET`、`API_TOKEN_SALT`、`TRANSFER_TOKEN_SALT`、
`ENCRYPTION_KEY`、`JWT_SECRET` 必须是随机值，**不要提交到仓库**（已在 `.gitignore` 中）。

---

## 3. 中文界面（两步法）

**第一步（已完成，工程自带）**：`src/admin/app.ts` 中已启用简体中文：

```ts
config: {
  locales: ['zh-Hans'],
  translations: { 'zh-Hans': { /* 少量系统串覆盖 */ } },
}
```

- Strapi 5.54 已内置 `zh-Hans` 语言包，无需自行准备翻译文件。
- `en` 是回退语言且不可移除，因此这里是「新增」而不是「替换」。
- 修改 `src/admin/app.ts` 或 `src/admin/translations/*.ts` 后，管理面板由 Vite 重新编译，
  浏览器**硬刷新（Ctrl+F5）**即可生效；生产环境需 `npm run build`。
- 官方中文包并不完整：管理面板英文 919 键里只有 655 键有中文，各插件（内容管理器、媒体库、
  内容类型构建器、国际化、邮件）缺得更多，缺的键在界面上会**直接回退成英文**（菜单、按钮、
  弹窗提示都能看到）。因此按模块补齐，统一放在 `src/admin/translations/`：

| 文件 | 内容 | 条数 |
| --- | --- | --- |
| `field-labels.ts` | 自定义字段的中文显示名 | 62 |
| `ui-admin.ts` | 左侧主菜单、设置页、通用按钮与提示 | 179 |
| `ui-content-manager.ts` | 内容列表 / 编辑页的按钮、状态、弹窗 | 251 |
| `ui-media-library.ts` | 媒体库的文件夹、筛选、批量操作 | 222 |
| `ui-content-type-builder.ts` | 内容类型构建器 | 30 |
| `ui-plugins-misc.ts` | 国际化、邮件设置、用户与权限 | 49 |
| `ui-tours.ts` | 首页「引导教程」（`tours.*`，官方中文包一条都没有） | 59 |

- 键名必须与官方英文包一致：插件串要带插件前缀（如 `content-manager.actions.edit.label`、
  `upload.sidebar.title`、`i18n.Settings.locales.row.id`），英文原文到各包的
  `node_modules/@strapi/<包名>/dist/admin/translations/en.json.js` 里查；自定义字段显示名的键格式为
  `content-manager.content-types.<内容类型 UID>.<字段名>`。
- 带 ICU 占位符的串（`{name}`、`{count, plural, ...}`）结构必须与英文一致，否则界面会显示 `{xxx}`。
  改完务必跑一次 **`npm run check:i18n`**（校验键名真实存在、占位符结构一致、键未重复定义）。

**第二步（每个账号做一次，最容易漏的一步）**：登录后台 → 右上角头像 → **个人资料** →
**体验** → **界面语言** → 选择「简体中文」→ 保存。

> 这一步不做，账号的 `prefered_language` 就是空值，**整个面板都会是英文**，
> `config.locales` 里准备的简体中文包完全用不上（表现为「翻译写了却没变化」）。
> 界面语言存在 `admin_users.prefered_language` 列；当前账号 `1783322568@qq.com` 已设为 `zh-Hans`。

> ⚠️ 不要往 `src/admin/extensions/translations/` 放文件：该目录的语义是「定义一门语言」，
> 文件名即语言代码，且由浏览器侧动态 `import`。放一个同名的 `zh-Hans.json`
> 会顶掉 Strapi 内置的简体中文包；文件一旦有 JSON 语法错误，管理面板直接 500 无法加载。
> 补翻译请写在 `app.ts` 的 `config.translations` 或 `translations/*.ts` 里。

---

## 4. 目录结构

```
cms/
├── config/                 # 服务、数据库、管理面板、中间件、插件配置
├── src/
│   ├── api/                # 内容类型（schema/controller/service/route）
│   ├── components/         # 可复用字段组（SEO、问答项、课程大纲…）
│   ├── admin/app.ts        # 管理面板定制（语言设置 + 汇总各中文串模块）
│   ├── admin/translations/  # 中文串：field-labels（字段名）+ ui-*（菜单、按钮、提示）
│   ├── lib/ai/             # AI 内容工厂：Provider、Prompt、校验、执行流程、CLI
│   ├── lib/kb/             # 知识检索层（当前关键词匹配，预留向量检索）
│   └── index.ts            # 启动钩子（开放公开读取权限）
├── scripts/                # 内容导入导出脚本；check-admin-i18n.ts 校验后台中文串
├── public/uploads/         # 媒体库文件（不入库，需单独备份）
└── .tmp/data.db            # SQLite 数据库（不入库，需单独备份）
```

---

## 5. 内容模型一览

**集合类型（12）**：课程、课程分类、师资、师资层级、校区、动态与资讯、知识百科、
美迪问答、展示区块（学员风采等分组：就业学员 / 学生活动 / 学生作品）、文章、
**知识条目**（知识库）、**定时任务**（内容工厂）。

**单类型（4）**：站点设置（含微信二维码、客服手机、全国热线、备案号、品牌事实、llms 文案）、
导航与页脚、页面 SEO、结构化数据。

> 没有单独的「学员案例」类型：学员风采由**展示区块** + 展示条目组件承载，
> 每个区块一个栏目（就业学员 / 学生活动 / 学生作品），条目字段为图标、标题与说明。

所有字段显示名与提示均为中文，运营无需英文基础。

---

## 6. 官网对接

### 6.1 API Token（一键生成）

内容工厂与官网构建都需要令牌。推荐用脚本一键创建并写回 `.env`：

```powershell
# 先停止 npm run develop，避免 SQLite 写锁冲突
npm run init:tokens              # 已存在则复用，只补齐 .env 里的空值
npm run init:tokens -- --force   # 吊销旧令牌并重新生成
```

脚本会创建两个令牌：

| 令牌名 | 类型 | 写入变量 | 用途 |
| --- | --- | --- | --- |
| `website-readonly` | 只读 | `STRAPI_READONLY_TOKEN` | 官网构建、快照导出 |
| `content-factory` | Full access | `STRAPI_WRITE_TOKEN` | 生成草稿、回写任务状态、内容导入 |

也可以手工创建：后台 → **设置 → API 令牌 → 新建令牌**。

官网构建时通过 `STRAPI_URL` + `STRAPI_READONLY_TOKEN` 拉取内容；
两者缺失或后台不可达时，官网会自动降级读取 `src/data/__snapshot__/*.json` 快照，
保证离线也能构建。

### 6.2 内容更新后自动重建官网

后台 → **设置 → Webhooks → 新建**：

| 项 | 值 |
| --- | --- |
| 名称 | 官网重建 |
| URL | `https://api.github.com/repos/<owner>/<repo>/dispatches` |
| 触发事件 | 勾选 `Entry` 的 publish / unpublish / delete |
| 请求头 | `Authorization: Bearer <GitHub Token>`、`Accept: application/vnd.github+json` |

要点：

- GitHub Token 用**细粒度令牌**，只授予该仓库 `Contents: Read and write`（`repository_dispatch` 需要写权限），
  过期时间建议一年并记录续期提醒。
- `.github/workflows/deploy.yml` 已增加 `repository_dispatch: types: [cms-publish]`，
  Webhook 请求体会被 GitHub 自动补上 `event_type`，因此 **不需要手写 body**；
  如需自定义（例如带 `{"event_type":"cms-publish"}`）也可在「请求体」里填。
- Webhook 是「发布动作」触发的，AI 内容工厂写的是**草稿**，不会触发重建 —— 这是有意设计：
  先人工校对 → 发布 → 官网重建，避免半成品上线。
- Webhook 只负责「叫醒」构建；构建时能否拉到最新内容取决于
  `STRAPI_URL` 公网可达 + 仓库 Secrets 里的 `STRAPI_TOKEN` 是否有效。

GitHub 侧需要配置的 Secrets / Variables（**仓库 → Settings → Secrets and variables → Actions**）：

| 名称 | 类型 | 用途 |
| --- | --- | --- |
| `STRAPI_URL` | Secret | 站点构建与内容工厂访问的后台地址 |
| `STRAPI_TOKEN` | Secret | 官网构建用的**只读**令牌 |
| `STRAPI_WRITE_TOKEN` | Secret | 内容工厂写草稿用的令牌（仅 AI 工作流使用） |
| `AI_API_KEY` | Secret | 模型密钥 |
| `AI_BASE_URL` | Variable | 如 `https://api.deepseek.com/v1` |
| `AI_MODEL` | Variable | 如 `deepseek-chat` |
| `AI_DAILY_LIMIT` | Variable | 定时生成上限 |
| `AI_SCHEDULE_ENABLED` | Variable | `true` 才按点自动生成，手动运行不受限 |
| `SITE_URL` | Variable | 需要覆盖站点基准地址时设置（可选） |

> 未配置 `STRAPI_URL` / `STRAPI_TOKEN` 时官网构建会打印一条提示并**自动降级读快照**
> `src/data/__snapshot__/*.json`，因此云端第一次接入 CMS 前也能正常出站。

---

## 7. AI 内容工厂

### 7.1 工作方式

1. 在后台维护**知识条目**（关键要点、数据点、常见问题、可引用表述、来源、附件）。
2. 在后台创建**生成任务**，选择模式：
   - `AI 生成`：按知识条目 + 目标关键词成稿，产出带完整 SEO/GEO 字段的**草稿**；
   - `人工撰写`：只生成带字段模板的空草稿骨架，由人填正文。
3. 执行任务（定时或手动）→ 生成结果写入文章草稿。
4. 人工在后台校对 → 发布 → Webhook 触发官网重建。

**两种模式都不会自动上线**，必须人工确认发布。

### 7.2 配置模型（密钥后补即可）

```dotenv
AI_PROVIDER=openai-compatible        # 统一走 OpenAI 兼容协议
AI_BASE_URL=https://api.deepseek.com/v1
AI_MODEL=deepseek-chat
AI_API_KEY=                          # 未填时只有 ai:preview 可用
AI_DAILY_LIMIT=3                     # 单次运行最多生成篇数
AI_MAX_RETRIES=2                     # 单篇失败重试次数上限
AI_TIMEOUT_MS=120000                 # 单次请求超时（毫秒）
AI_RUN_WINDOW=                       # 批量生成时间窗口，如 09:00-21:00；留空不限
KB_RETRIEVER=keyword                 # 知识检索实现：keyword（默认）| vector（预留）
STRAPI_WRITE_TOKEN=                  # 内容工厂写入令牌，用 init:tokens 生成
```

DeepSeek / 通义千问（兼容模式）/ OpenAI 只需替换 `AI_BASE_URL` 与 `AI_MODEL`。

### 7.3 命令

```powershell
npm run ai:check                                # 环境自检：服务、令牌、模型、知识库、任务
npm run ai:preview                              # 打印下一个待处理任务将发送的 Prompt（不调用模型）
npm run ai:preview -- --topic "选题" --keywords "关键词1,关键词2"
npm run ai:run                                  # 批量执行「待处理」任务（受 AI_DAILY_LIMIT / AI_RUN_WINDOW 约束）
npm run ai:run -- --limit 1 --dry-run           # 演练：调用模型与校验，但不写入后台
npm run ai:run:once -- --task <documentId>      # 手动执行单篇（任务列表里的 documentId）
```

未配置 `AI_API_KEY` 时，`ai:run` 会给出可操作的中文提示，`ai:preview` 与 `ai:check` 仍可正常使用。

执行结果（成功/失败、校验得分、问题清单）会写回任务的「执行日志」字段，
运营在后台即可看到每次生成发生了什么。

### 7.4 SEO / GEO 硬性校验

生成的稿件通过校验才会写入草稿，否则任务标记失败并把问题清单写进「执行日志」。
校验分两类（实现在 `cms/src/lib/ai/validate.ts`）：

**阻断项（任一不过即不入库）**

- slug 不合规（只允许小写字母、数字与连字符）；
- 正文过短（少于目标字数的 60%，最低 600 字）；
- 缺少**答案段落**，或答案段落没有真实出现在正文里（避免正文与结构化字段两张皮）；
- FAQ 问答对 < 3、关键数据 < 2、引用来源 < 1；
- 内链 < 2（结构化字段与正文 `<a>` 各算一次）；
- 正文未出现品牌实体全称；
- 目标关键词**全部**未使用、缺少 SEO 标题。

**提醒项（只扣分与提示，不阻断）**

- 标题 15–40 字、摘要 60–160 字、SEO 摘要 40–160 字；
- 首个答案段落建议 40–120 字；正文中文占比 < 50%；
- 目标关键词**部分**未使用。

最终得分需 ≥ 85 分。得分与问题清单都会写回任务的「执行日志」，运营可在后台复核。

### 7.5 定时自动生成

`deploy/scheduler/` 下提供三种现成方案：

| 方案 | 文件 | 适用 |
| --- | --- | --- |
| Windows 任务计划 | `task-scheduler.xml` + `run-ai.ps1` | 本机/内网 Windows 服务器 |
| Linux crontab | `crontab.example` | Linux 服务器 |
| GitHub Actions | `.github/workflows/ai-generate.yml` | 无自有服务器 |

手动路径与定时路径**共用同一个 CLI**，行为完全一致。

---

## 8. 备份与恢复

需要备份的有三处：

```
cms/.tmp/data.db          # SQLite 数据库（切 MySQL 则备份数据库）
cms/public/uploads/       # 媒体库文件
cms/backup/               # export:content 导出的 JSON 快照（可选，便于人工比对与回填）
```

恢复：停止服务 → 覆盖上述两项 → 启动服务。

---

## 9. 内容迁移脚本

历史内容（2000+ 行课程大纲、13 个校区、3 篇知识百科长文等）已复制为迁移源副本：

```
cms/scripts/seed-data/*.ts            # 原 src/data/*.ts
cms/scripts/seed-data/knowledge/*.html # 原 src/content/knowledge/*.html（含表格与引用块）
```

```powershell
npm run import:content                 # 全量导入（可重复执行，不会产生重复数据）
npm run import:content -- --no-kb      # 只导入内容，不生成知识库初始素材
npm run import:content -- --skip-media # 跳过媒体上传（离线环境 / 不装图片）
npm run export:content                 # 导出全部已发布内容为 JSON 快照到 cms/backup/
npm run export:content -- --with-draft # 连同草稿一起导出（发布前核对用）
```

导入行为：

- **幂等**：按业务唯一键（`slug` / `code` / `faqId` / `campusId` / `sectionId` / `title`）查找，
  存在则整篇覆盖、不存在则新建并发布；草稿与已发布两个版本同步写入，
  避免后台默认展示的草稿版本还是旧内容。
- **媒体**：课程封面、Logo、OG 图、客服微信二维码会上传到媒体库（按文件名去重），
  同时保留 `fallbackPath`，官网构建前再把图片同步到 `public/images/`，做到自包含。
- **知识库初始素材**：从机构概况、官方问答原文、课程信息与价格政策派生 22 条知识条目，
  全部标注来源与核实日期，作为 AI 生成文章的事实基准，运营可在后台继续修订
  （脚本按 `slug` 幂等更新，改过标题也不会重复创建）。
- 结束时打印「新建 / 更新」统计报告，便于与迁移前条目数比对。

---

## 10. 上线与运维

### 10.1 部署形态

后台与官网**分开部署**，互不影响：

| 角色 | 部署 | 说明 |
| --- | --- | --- |
| 官网 | GitHub Pages（现有 `deploy.yml`）或 Nginx 静态托管 | 只读构建产物 `dist/` |
| 后台 | 一台常驻服务器 / 容器（`npm run build` + `npm run start`） | 需要公网可达，供构建期取数与 Webhook 回调 |
| 定时生成 | 任务计划 / crontab / GitHub Actions 任选一种 | 三者共用同一个 CLI，行为一致 |

后台部署步骤：

```bash
cd cms
npm ci --omit=dev
npm run build          # 构建管理面板（改 admin/app.ts 或字段显示名后必须重建）
NODE_ENV=production npm run start
```

生产环境要点：

- 反向代理开启 HTTPS，并把上传体积上限调到 ≥ 20MB（媒体库用）。
- 需要持久化的目录：`.tmp/`（SQLite 库）、`public/uploads/`（媒体库）、`.env`。
  容器部署时把这三个挂载出来，否则重建容器会丢数据。
- 生产库建议切 MySQL / Postgres（改 `config/database.ts` 与 `.env` 的 `DATABASE_*`）。
- 首次启动后到 <http://<域名>/admin> 创建管理员，再执行 `npm run init:tokens` 生成两个令牌。

### 10.2 日常运维清单

| 周期 | 动作 |
| --- | --- |
| 每次内容大改 | 官网仓库执行 `npm run cms:snapshot` 刷新离线快照并提交，保证 CI 有兜底数据 |
| 每日 | 看「生成任务」的执行日志：失败任务按要求补知识条目后重跑 |
| 每周 | 核对知识条目的「最后核实日期」，过期数据点先更正再让 AI 引用 |
| 每月 | 备份 `.tmp/data.db` + `public/uploads/`；检查 AI 额度消耗与生成质量抽检 |
| 每季度 | 抽查已发布文章的事实准确性（热线、价格、政策类必查） |

### 10.3 故障排查

| 现象 | 原因与处理 |
| --- | --- |
| 后台起不来，报数据库锁 | 同时跑了两个 `npm run develop`，或 SQLite 被其他进程占用；关掉多余进程再启动 |
| 整个界面都是英文 | 账号的界面语言没设：`admin_users.prefered_language` 为空时面板一律按英文渲染，翻译写得再多也不显示。个人资料 → 体验 → 界面语言 → 简体中文 |
| 只有少数菜单/按钮是英文 | 官方中文包缺该键（各插件缺得最多），补在 `src/admin/translations/ui-*.ts`，改完硬刷新（Ctrl+F5）；生产环境要 `npm run build` |
| 界面出现 `{xxx}` 之类占位符 | 中文串的 ICU 占位符结构与英文不一致，跑 `npm run check:i18n` 定位 |
| 界面又变英文了 | 登录账号的界面语言被改回英文；或往 `src/admin/extensions/translations/` 放了同名 `zh-Hans.json` 顶掉了官方语言包（补翻译请写在 `translations/*.ts`） |
| 后台白屏 / 日志报 `Failed to parse JSON file` | `src/admin/extensions/translations/` 下的语言包 JSON 语法有误，该文件由浏览器动态 import，一处语法错就整面板 500；把它移出该目录，翻译改放 `translations/*.ts` |
| 后台改了字段却看不到中文标签 | 改的是 `src/admin/translations/field-labels.ts`，需要**重建管理面板**（`npm run build`）或硬刷新开发服务器页面 |
| 首页仍有英文（如 Welcome to your administration panel） | 官方中文包缺该键，已在 `translations/ui-admin.ts` 补 `HomePage.*`；确认界面语言已设，然后强制刷新浏览器（Ctrl+F5）清掉旧前端缓存 |
| 首页引导块是英文（Discover your application! / Your tasks） | 官方中文包里 `tours.*` 一条都没有（英文 59 条 / 中文 0 条），已在 `translations/ui-tours.ts` 补齐；想再看一遍引导：个人资料 → 体验 → 「重置引导教程」 |
| 启动日志 `Error cleaning dist dir ... trash operation` | 本机回收站不可用导致 Strapi 的 safe-delete 失败，非致命（后续步骤照常）。注意别在后台上行期间手工删 `cms/dist`，会触发重启；要清理先停后台 |
| 浏览器控制台 `/favicon.ico` 500 | 后台根目录缺 `favicon.png`；从官网资源复制一份：`Copy-Item public\android-chrome-192x192.png cms\favicon.png` |
| 官网构建仍显示旧内容 | 快照没刷新 + `STRAPI_URL`/`STRAPI_TOKEN` 缺失导致降级；补密钥或执行 `npm run cms:snapshot` 后重新构建 |
| 官网图片 404 | 媒体同步失败；检查 `public/images/` 与后台媒体库是否可访问，重跑构建前同步 |
| `ai:check` 提示连不上后台 | 后台未启动或 `STRAPI_URL` 写错；本地先确认 `curl http://localhost:1337/_health` 返回 200 |
| `ai:run` 报未配置密钥 | 填 `AI_API_KEY`；只有 `ai:check` / `ai:preview` 可以在无密钥时使用 |
| AI 稿件总被判校验失败 | 看任务「执行日志」里的问题清单：通常是知识条目太少导致数字与问答不够，先补知识条目再重跑 |
| Webhook 没触发构建 | GitHub Token 权限不足或已过期；到仓库 Actions 页面看有没有 `repository_dispatch` 记录 |

