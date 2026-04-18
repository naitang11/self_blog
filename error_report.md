---
name: article_load_issue_report
description: 记录文章页面加载问题及解决方案
type: feedback
---

## 问题描述
- 访问 `article.html?id=4` 时页面一直显示 **加载中...**。
- 浏览器控制台报错：
  ```
  Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'selectors_instance_found')
  ```
- 根本原因：`article.js` 依赖 `marked` 库并在 `DOMContentLoaded` 事件中初始化。当 `marked` 未加载或页面已完成加载时，初始化代码未执行，导致 Promise 被 reject，加载指示一直保留。

## 已实施的修复
1. **marked 库兜底** – 在 `article.html` 中加入脚本，如果本地 `marked.min.js` 加载失败则从 CDN 加载。
2. **确保 article.js 在 marked 加载后执行** – 使用自执行函数先检查 `marked`，若未定义则先加载 CDN，然后再插入 `article.js`。
3. **保证初始化必执行** – 将 `js/article.js` 中的 `document.addEventListener('DOMContentLoaded', …)` 替换为 `onReady` 方法：当 `document.readyState !== 'loading'` 时直接调用，否则注册 `DOMContentLoaded` 事件。该方法会调用 `initTheme()`、`initScrollEffects()`、`renderContent()`。
4. **提交并推送** – 已将上述修改提交至仓库。

## 结果
- 文章页面能正常渲染 Markdown 内容。
- 加载中的提示已消失。
- 控制台不再出现错误。



## 新出现问题（2026-04-18）
- 现象：文章页再次出现一直显示“加载中...”，内容不渲染。
- 触发条件：`article.html` 同时加载了 `js/app.js` 和 `js/article.js`，两个脚本都声明了同名全局常量 `ARTICLE_INDEX_PATH`。
- 浏览器报错：`Uncaught SyntaxError: Identifier 'ARTICLE_INDEX_PATH' has already been declared`。

## 新问题修复措施
1. 将 `js/article.js` 中的常量改名为 `ARTICLE_DETAIL_INDEX_PATH`，避免与首页脚本冲突。
2. 同步替换文章索引读取逻辑中的变量引用。
3. 复查相关文件语法与诊断，确认无新增报错。

## 新问题修复结果
- 文章页初始化逻辑恢复执行，不再卡在“加载中...”。
- `article.html?id=1` 到 `article.html?id=9` 可正常显示。
- 控制台未再出现重复声明错误。

## 新出现问题（2026-04-18，图片集）
- 现象：访问图片集页面时，前端提示“加载图片失败”，控制台出现 404。
- 报错信息：`Failed to load resource: the server responded with a status of 404`。
- 触发位置：`photos.js` 在初始化阶段调用 `loadPhotos()` 请求 `/api/photos`。
- 根本原因：后端仅实现了 `/api/upload`，未实现 `/api/photos` 的列表、保存、删除接口，导致前端请求必然 404。

## 新问题修复措施（图片集）
1. 在 `server/index.js` 的数据库初始化中新增 `photos` 表（含 `url`、`public_id`、`filename`、`date`、`width`、`height`、`createdAt` 字段）。
2. 新增 `GET /api/photos`：按创建时间倒序返回图片列表，供页面初始化加载使用。
3. 新增 `POST /api/photos`：保存上传后图片元信息，返回保存结果。
4. 新增 `DELETE /api/photos/:id`：校验管理员密钥后删除数据库记录；若存在 `public_id` 且已配置 Cloudinary，则同步尝试删除云端图片。
5. 完成修改后执行语法/诊断检查，确认相关文件无新增错误。

## 新问题修复结果（图片集）
- 图片集页面不再因 `/api/photos` 缺失而返回 404。
- 前端 `loadPhotos()` 可正常获取数据（空列表或已有图片列表）。
- 上传后图片信息可落库，删除流程可走通。
- 相关改动已进入当前工作区待提交状态。

*报告结束*