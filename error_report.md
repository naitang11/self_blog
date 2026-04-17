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

*报告结束*