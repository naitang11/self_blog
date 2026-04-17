# 功能更新记录

更新时间：2026-04-18

## 本次新增与调整
1. 文章详情页改为动态读取内容。
   - 先读取 `articles/index.json` 获取文章元数据。
   - 再按文章 id 读取 `articles/{id}.md` 渲染正文。

2. 首页文章列表统一数据源。
   - 首页由 `js/app.js` 直接请求 `articles/index.json`。
   - 移除首页对 `articles.js` 的直接依赖，避免双数据源不一致。

3. 文章页脚本冲突修复。
   - 解决 `js/app.js` 与 `js/article.js` 常量重名冲突。
   - 将文章页索引常量调整为 `ARTICLE_DETAIL_INDEX_PATH`。

4. 冲突残留清理。
   - 清理 `articles/index.json`、`articles/9.md`、`articles.js` 中遗留的合并冲突标记。
   - 恢复文章加载链路稳定性。

## 当前效果
- 首页可正常加载文章列表。
- 文章详情页可正常渲染 Markdown 内容。
- 页面不再长期停留“加载中...”。

## 后续建议
1. 新增文章时仅维护两处：`articles/index.json` 与对应 `articles/{id}.md`。
2. 提交前执行一次冲突标记检查，避免 `<<<<<<<`、`=======`、`>>>>>>>` 进入主分支。
3. 若继续扩展功能，建议将文章加载与渲染逻辑抽出为公共模块，减少重复代码。
