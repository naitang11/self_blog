# 个人博客 - 设计与实现规范 (SPEC)

## 1. 项目定位

这是一个偏极客风的个人博客项目，当前由两部分组成：

1. 文章博客（首页 + 文章页 + 关于页）
2. 段子屋（独立页面 + 后端 API + PostgreSQL）

设计基调保持简洁、可读、克制；实现策略优先保证可用性和维护成本。

---

## 2. 当前架构

### 2.1 前端

- 技术：HTML5 + CSS3 + Vanilla JS
- 页面：`index.html`、`article.html`、`about.html`、`jokes.html`、`admin.html`
- 第三方库：
  - `marked`（Markdown 解析）
  - `highlight.js`（代码高亮）

### 2.2 后端

- 技术：Node.js + Express
- 数据库：PostgreSQL（`pg`）
- 主要能力：段子数据读写、点赞、删除、发布限流

### 2.3 运行方式

- 开发：前端静态服务 + Node API 并行启动
- 生产：Node 进程可同时托管 API 和静态资源

`package.json` 脚本：

- `npm run dev`：并行启动前后端
- `npm run server`：启动 API
- `npm run client`：启动静态站点（3000 端口）
- `npm start`：生产模式启动服务

---

## 3. 页面与模块

### 3.1 首页 (`index.html`)

- 展示文章列表（来自 `articles.js` 全局变量）
- 搜索：按标题 / 摘要 / 标签做前端过滤
- 显示统计：文章数、标签数
- 主题切换：`data-theme` + `localStorage('theme')`

### 3.2 文章页 (`article.html`)

- 通过 `id` 读取 `js/article.js` 中内置 `ARTICLES` 数据
- Markdown 渲染 + 代码高亮
- 显示元信息（日期、阅读时间、标签）
- 支持上一篇 / 下一篇导航

说明：页面中已预留目录、评论区和进度条容器，但当前 `js/article.js` 版本未完整接入这些交互逻辑。

### 3.3 段子页 (`jokes.html`)

- 通过 `js/jokes.js` 请求后端 API
- 支持发布段子、点赞/取消点赞、删除段子
- 使用本地缓存（TTL 5 分钟）降低重复请求
- 主题状态当前独立使用 `localStorage('dark-mode')`

### 3.4 关于页 (`about.html`)

- 个人介绍、技能、里程碑、联系方式
- 继承全站主题样式

### 3.5 管理页 (`admin.html`)

- 本地文章编辑与预览
- 文章数据存储在浏览器 `localStorage`
- 可导出 JSON/JS 数据文件

说明：管理页是本地内容管理工具，不直接写入服务器数据库。

---

## 4. 数据模型

### 4.1 文章数据（前端静态）

当前采用 JS 常量数据源，而非运行时读取 `articles/*.md`：

- 列表：`articles.js` 中 `const articles = [...]`
- 详情：`js/article.js` 中 `const ARTICLES = {...}`

文章字段示例：

```js
{
  id: 1,
  title: "欢迎来到我的博客",
  date: "2026-04-09",
  tags: ["随笔"],
  excerpt: "这是我的第一个博客文章...",
  readTime: "1 min"
}
```

### 4.2 段子数据（后端 PostgreSQL）

表：

- `jokes`
  - `id`、`content`、`date`、`likes`、`liked`、`createdAt`
- `joke_likes`
  - `id`、`joke_id`、`ip`、`createdAt`
  - `UNIQUE (joke_id, ip)` 防重复点赞

---

## 5. API 规范（段子系统）

基础路径：`/api/jokes`

1. `GET /api/jokes`
- 作用：获取段子列表
- 返回：包含当前 IP 的 `liked` 状态

2. `POST /api/jokes`
- 作用：发布段子
- 请求体：`{ content, date? }`
- 约束：
  - 内容不能为空
  - 最长 500 字
  - IP 限流：5 分钟最多 5 条

3. `DELETE /api/jokes/:id`
- 作用：删除段子
- 鉴权：请求头 `x-admin-secret`

4. `POST /api/jokes/:id/like`
- 作用：点赞/取消点赞
- 规则：同一 IP 二次点击则取消点赞

---

## 6. 功能状态

### 6.1 已实现

- 首页文章渲染
- 首页搜索过滤（标题/摘要/标签）
- 主题切换与持久化（首页/文章/关于）
- 文章 Markdown 渲染与代码高亮
- 文章上一篇/下一篇导航
- 段子系统 API（发布/删除/点赞/列表）
- 段子页本地缓存与限流提示

### 6.2 部分实现

- 标签系统：有标签展示，但首页筛选交互尚未完整接入
- 主题系统：主站与段子页使用了不同的存储键（`theme` 与 `dark-mode`）
- 文章页结构：目录、评论区、进度条容器已在 HTML 预留，但当前脚本未完全启用

### 6.3 未实现或暂缓

- 基于 `articles/*.md` + front-matter + `articles/index.json` 的运行时加载
- Electron 打包与桌面端文章管理
- 图片懒加载、首屏 CSS 内联、长列表虚拟滚动

---

## 7. 已知问题与一致性差异

1. 文章数据存在双源维护（`articles.js` 与 `js/article.js`），有同步成本。
2. 内容文案中仍有“SQLite”描述，但后端实际已是 PostgreSQL。
3. 测试脚本中的标签选择器与当前标签值可能不一致（例如“全部”与 `data-tag="all"`）。

---

## 8. 后续迭代建议

1. 统一文章数据源（优先保留一种，避免重复维护）。
2. 恢复并接入文章页目录、评论、阅读进度逻辑（可参考历史 `article_fixed.js`）。
3. 统一全站主题存储策略，减少页面间行为差异。
4. 决策是否继续走“纯静态导出”路线，还是恢复 `md + index.json` 内容流水线。
5. 补充最小回归测试：主页渲染、文章加载、段子 API 可用性。

---

_最后更新：2026-04-15_
