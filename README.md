# Swarm-Orca 研究网站

独立的 Astro + MDX 静态网站，当前为公开预览版。所有文章与摄影都是编辑示例，不代表正式研究结论或能力验收。

- 网站：https://runrunliuliu.github.io/swarm-orca-site/
- 网站源码：https://github.com/runrunliuliu/swarm-orca-site
- 项目源码：https://github.com/runrunliuliu/swarm-orca

## 本地运行

需要满足 Astro 引擎要求的 Node.js（本次环境为 26.7.0）。

```bash
npm ci
npm run dev
```

打开终端输出的网址，通常为 http://127.0.0.1:4321。服务只监听本机。

```bash
npm run check
npm run build
npm run preview -- --port 4321
npm test
npm run test:base
```

浏览器测试需要本机 Google Chrome，或设置 `CHROME_PATH` 为浏览器可执行文件。`npm test` 在运行中的预览上检查页面、主题、响应式溢出、链接、搜索与展开组件，并保存截图至忽略目录 `artifacts/`。可用 `PREVIEW_URL` 指定测试地址。

## 内容结构

- `src/content/research/*.mdx`：文章，新增文件自动出现在列表。
- `src/content.config.ts`：元数据校验。
- `src/pages/research/[id].astro`：长文模板与自动目录。
- `src/components/EvidenceDemo.astro`：仅本地浏览器运行的概念示例。
- `src/styles/global.css`：排版与跟随系统的明暗主题。
- `public/images/`：本地图片，不在访问时请求图片服务。

新文章参考已有 frontmatter。`sample: true` 默认开启，正文渲染审核提醒。日期为编辑示例日期，阅读时长为编辑估计。文件名即 URL，应在发布前确定。

## 设计约定

研究型出版排版，使用原生 CSS，没有套用组件库。设计技能引导了克制的单色强调、方形布局、低动效和阅读宽度。Geist 拉丁字体随站点托管，中文使用系统字体。封面是摄影占位，不是产品截图；正式宣传应替换为已审核的架构图或实验图。

## GitHub Pages 发布

`.github/workflows/deploy.yml` 在推送至 `main` 或手动触发时发布。仓库 Settings → Pages 的 Source 应为 GitHub Actions。

流水线使用固定版本的 Actions 和 Node.js 26.7.0，通过 `npm ci` 安装锁定依赖，运行类型检查、静态构建和子路径链接检查，只上传 `dist/`，不上传源码、依赖或本地测试产物。构建任务只有读取代码权限，部署任务才有 Pages 写权限。不需要配置个人访问令牌或业务 API 密钥。

```bash
# 与线上一致的构建（链接和静态资源均适配子路径）
SITE_URL=https://runrunliuliu.github.io BASE_PATH=/swarm-orca-site/ npm run build
```

`SITE_URL` 决定 canonical 与社交分享图片的域名；未设置时不输出虚构域名。当前模板固定 `noindex, nofollow`，正式宣传前必须审核示例内容、署名与公开证据，再显式开放索引。`noindex` 不是访问控制，公开预览的网址仍可被任何人访问。不要上传私有配置、运行日志、密钥或未经审核的素材。

本地浏览器测试：`npm test`（需先运行预览服务）。线上浏览器测试：`PREVIEW_URL=https://runrunliuliu.github.io/swarm-orca-site/ npm test`。CI 不运行完整浏览器矩阵，发布后需另行执行。

后续更新：修改 MDX → 本地检查和预览 → 提交并推送 `main` → 在 Actions 检查部署结果。回滚时，对需要撤销的提交执行经审查的 `git revert` 并推送，重新部署；不要强推或重写历史。首次发布没有上一版可回滚，如需下线，应在 Pages 设置中取消发布。

## 素材来源

两张图片下载自 Unsplash 图片服务，2026-11-18 用作视觉占位。对应的 `*-small.webp` 为同一来源的 640px 移动端版本。已核对 [Unsplash License](https://unsplash.com/license)：允许网站中使用，不要求署名；不得将未作显著修改的图片单独出售，也不得用于复制竞品图片服务。此处保留原图来源，不推测尚未核实的摄影师姓名。正式研究文章应换成自有图解或经审核的实验图。

- `public/images/ocean.jpg`：[图片来源](https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1600&q=80)
- `public/images/coast.jpg`：[图片来源](https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80)

版式参考研究型博客的一般阅读结构，没有复制参考站点源码、文字或图表。

Geist 字体来自 `@fontsource/geist`，其版权声明与 SIL Open Font License 随静态站点一起发布于 `public/licenses/geist.txt`。

## 已知依赖风险

2026-11-18 的 `npm audit` 报告 14 个高危依赖条目，来自同一 `picomatch` ReDoS 公告的传递影响。当前 npm 最新版 4.0.7 仍在影响范围内，[上游公告](https://github.com/advisories/GHSA-fc5q-39xc-vjpf)尚无修复版本。没有执行会回退框架的 `npm audit fix --force`。

发布前再次审计，结果仍为同一公告影响的 14 个高危依赖条目。本网站输出静态 HTML，浏览器搜索只用字符串匹配，不接收用户 glob；该依赖用于构建/开发工具链，不在 Pages 服务器运行。本地预览仅监听本机。自动部署只由 `main` 推送或手动操作触发，不执行外部 PR。不要向构建工具输入不可信 glob 或执行未审查的外部 MDX；后续发布仍需重新审计并跟进上游修复。这些限制不等于漏洞已修复。
