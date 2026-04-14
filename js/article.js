// 文章数据（硬编码，因为 GitHub Pages 不支持运行时请求 JSON）
const ARTICLES = {
  1: {
    id: 1,
    title: '欢迎来到我的博客',
    date: '2026-04-09',
    tags: ['随笔'],
    readTime: '1 分钟',
    prev: null,
    next: 2,
    content: `
# 欢迎来到我的博客

这是我的第一个博客文章，用来测试博客功能是否正常。

## 关于这个博客

这个博客是我用 AI 助手从零开始搭建的。

主要用来记录一些技术笔记和日常思考。

## 技术栈

- 前端：HTML + CSS + JavaScript
- 部署：GitHub Pages
- 图床：SM.MS

---
*首发于 2026-04-09*
    `
  },
  2: {
    id: 2,
    title: 'Python 入门指南',
    date: '2026-04-09',
    tags: ['技术', 'Python'],
    readTime: '5 分钟',
    prev: 1,
    next: 3,
    content: `
# Python 入门指南

Python 是一门简单易学的编程语言，适合初学者。

## 基本语法

### 变量

~~~python
name = "Alice"
age = 25
~~~

### 条件语句

~~~python
if age >= 18:
    print("成年")
else:
    print("未成年")
~~~

### 循环

~~~python
for i in range(5):
    print(i)
~~~

## 为什么学 Python

1. 语法简单
2. 生态丰富
3. 应用广泛

---
*首发于 2026-04-09*
    `
  },
  3: {
    id: 3,
    title: '为什么 AI 是未来',
    date: '2026-04-09',
    tags: ['技术', 'AI'],
    readTime: '3 分钟',
    prev: 2,
    next: 4,
    content: `
# 为什么 AI 是未来

AI 正在改变各行各业。

## 应用场景

- 医疗：辅助诊断
- 金融：风险评估
- 教育：个性化学习
- 娱乐：游戏 AI

## AI 能做什么

现在的 AI 已经可以：

- 写作、翻译
- 生成图片
- 写代码
- 回答问题

---
*首发于 2026-04-09*
    `
  },
  4: {
    id: 4,
    title: '从零搭个人博客：我都干了什么',
    date: '2026-04-08',
    tags: ['技术', '复盘'],
    readTime: '3 分钟',
    prev: 3,
    next: 5,
    content: `
# 从零搭个人博客：我都干了什么

用 AI 助手从零搭了一个个人博客，记录一下过程、遇到的问题和解决方案。

## 技术选型

- 纯原生 HTML + CSS + JS，无框架
- marked.js 渲染 Markdown
- highlight.js 代码高亮
- highlight.js 代码高亮
- 部署在 GitHub Pages

## 遇到的问题

### 1. 文章加载失败

GitHub Pages 不给 JSON 文件设置 UTF-8 编码，导致中文乱码。

**解决：** 把 JSON 改成 JS 变量文件，浏览器正确处理编码。

### 2. CORS 跨域

API 部署在 Railway，前端在 GitHub Pages，不同域名请求会触发跨域。

**解决：** Railway API 配置了 \`Access-Control-Allow-Origin: *\` 允许所有来源。

### 3. 域名 DNS 丢失

\`blog.selfai.cn\` 的 DNS 记录丢失，目前用 GitHub Pages 原生地址访问。

## 总结

动手搭一个博客比想象中简单，AI 助手帮了大忙。

---
*首发于 2026-04-08*
    `
  },
  5: {
    id: 5,
    title: '段子书屋的技术内幕',
    date: '2026-04-10',
    tags: ['技术', '复盘'],
    readTime: '3 分钟',
    prev: 4,
    next: 6,
    content: `
# 段子书屋的技术内幕

今天把段子书屋的加载失败问题修好了，借机把整个架构梳理一下，顺便记录这次踩的坑。

---

## 段子书屋是什么

一个供网友发布和浏览段子的独立页面，类似于一个极简版的微博。

---

## 技术架构

整个系统分两层：**前端** + **后端 API**。

### 前端（GitHub Pages）

纯原生 HTML + CSS + JS，没有任何框架。

核心文件：

- \`jokes.html\` — 页面骨架
- \`js/jokes.js\` — 所有交互逻辑
- \`css/jokes.css\` — 样式，支持深色/浅色主题

技术选型：
- 无框架（Vanilla JS）
- API 请求用原生 fetch

### 后端 API（Railway）

跑在 Railway 上的 Node.js + Express REST API。

服务器端文件：
- \`server/index.js\` — Express 服务器

接口：

| 接口 | 方法 | 作用 |
|------|------|------|
| \`/api/jokes\` | GET | 获取所有段子 |
| \`/api/jokes\` | POST | 发布新段子 |
| \`/api/jokes/:id\` | DELETE | 删除段子 |
| \`/api/jokes/:id/like\` | POST | 点赞/取消点赞 |

数据存在 **SQLite** 数据库。

---

## 数据流

\`\`\`
用户打开 jokes.html
       ↓
jokes.js 调用 fetch 请求
       ↓
Railway API (selfblog-production.up.railway.app)
       ↓
SQLite 数据库读写
\`\`\`

---

## 这次踩的坑

### 坑一：API_BASE 用相对路径

**问题现象：** 段子书屋页面一直显示"加载失败"。

**根本原因：** \`jokes.js\` 里的 \`API_BASE = ''\`，使用相对路径 \`/api/jokes\`。但 GitHub Pages 是纯静态托管，没有后端服务器，所有 \`/api/*\` 请求都会 404。

**解决：** 把 \`API_BASE\` 改成 Railway 完整地址：

~~~js
const API_BASE = 'https://selfblog-production.up.railway.app';
~~~

**教训：** 记清楚托管方式很重要。静态托管（GitHub Pages/Vercel）没有后端，必须用完整 API URL。

### 坑二：记错了托管地址

**问题现象：** 一开始以为博客在 \`blog.selfai.cn\`（Vercel），查了半天 DNS。

**根本原因：** 记忆里的信息和实际不符。实际托管在 \`naitang11.github.io/self_blog/\`（GitHub Pages）。

**解决：** 先用 \`curl\` 或浏览器验证实际地址，再排查问题。

**教训：** 每次排查前先确认「网站到底在哪」，不要依赖记忆。

---

## 域名 DNS 丢失（待解决）

\`blog.selfai.cn\` 这个域名目前 DNS 记录已丢失（NS 服务器是 DNSPod，但域名找不到）。不影响使用，GitHub Pages 地址正常。

---

## 反思

1. **静态托管 + 外部 API 是常用组合**，但要注意 API 地址必须用完整 URL，不能用相对路径。
2. **记忆不可靠，写到文件里才可靠**。这次 MEMORY.md 里的信息过时了，导致走了弯路。
3. **先验证再排查**，确认了地址正确再动手修。

---
*首发于 2026-04-10*
    `
  },
  6: {
    id: 6,
    title: '最后一片叶子',
    date: '2026-04-10',
    tags: ['故事'],
    readTime: '1 分钟',
    prev: 5,
    next: 7,
    content: `
# 最后一片叶子

十五年前的老社区，有一棵银杏树。

每年十一月，满树金黄。住在这里的老人说，这棵树是建楼那年种下的，比所有人都老。

社区里有个女孩叫小秋，刚上初一。她每天放学都会路过这棵树，停下来看一会儿。同学们笑她，她不在乎。

那年秋天，银杏叶黄得比往年早。医生说，老人撑不过十一月。

女孩不知道该怎么办。她听说，如果叶子不落完，人就不会走。于是她每天早上去用细线把叶子绑住，阻止它们掉落。

老人最终还是走了。走的那天，最后一片叶子刚好落下。

后来小秋才知道，那棵树是老人年轻时种下的。她绑住的不是叶子，是自己的执念。

但那片最后落下的叶子，她留了下来，夹在书里。

---
*首发于 2026-04-10*
    `
  },
  7: {
    id: 7,
    title: '程序员小王的一天',
    date: '2026-04-14',
    tags: ['故事', '日常'],
    readTime: '1 分钟',
    prev: 6,
    next: null,
    content: `
# 程序员小王的一天

早上到公司，发现服务器挂了。

联系运维，运维说网络问题。
联系网络，网络说服务器问题。
联系机房，机房说欠费了。

小王交完钱，服务器好了。

这一天，小王主要干了三件事：背锅、催款、写周报。

---
*首发于 2026-04-14*
    `
  }
};

// 主题相关
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcon();
}

function sanitizeHtml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Remove dangerous elements entirely.
    doc.querySelectorAll('script, iframe, object, embed, link, style, meta').forEach(el => el.remove());

    // Strip inline event handlers and javascript: URLs.
    doc.querySelectorAll('*').forEach(el => {
        Array.from(el.attributes).forEach(attr => {
            const name = attr.name.toLowerCase();
            const value = (attr.value || '').trim().toLowerCase();
            const isScriptUrl = (name === 'href' || name === 'src') && value.startsWith('javascript:');
            const isHtmlDataUrl = (name === 'href' || name === 'src') && value.startsWith('data:text/html');

            if (name.startsWith('on') || isScriptUrl || isHtmlDataUrl) {
                el.removeAttribute(attr.name);
            }
        });
    });

    return doc.body.innerHTML;
}

// 加载文章详情
function loadArticleDetail() {
    const articleBody = document.getElementById('articleBody');
    const articleTitle = document.getElementById('articleTitle');

    try {
        const params = new URLSearchParams(window.location.search);
        const id = parseInt(params.get('id'), 10);
        const article = ARTICLES[id];

        if (!article) {
            if (articleTitle) articleTitle.textContent = '文章不存在';
            if (articleBody) articleBody.innerHTML = '<div class="error">文章不存在</div>';
            return;
        }

        // 渲染文章
        const content = sanitizeHtml(marked.parse(article.content));
        if (articleTitle) articleTitle.textContent = article.title;
        if (articleBody) {
            articleBody.innerHTML = `
                <article class="article">
                    <h1>${article.title}</h1>
                    <div class="meta">
                        <span class="date">${article.date}</span> |
                        <span class="read-time">${article.readTime}</span>
                    </div>
                    <div class="tags">
                        ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="content">${content}</div>
                    <div class="pagination">
                        ${article.prev ? `<a href="article.html?id=${article.prev}" class="prev">← 上一篇</a>` : '<span></span>'}
                        ${article.next ? `<a href="article.html?id=${article.next}" class="next">下一篇 →</a>` : '<span></span>'}
                    </div>
                </article>
            `;
        }

        // 代码高亮
        if (typeof hljs !== 'undefined') {
            document.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
            });
        }

        // 更新主题图标
        if (typeof updateThemeIcon === 'function') {
            updateThemeIcon();
        }
    } catch (error) {
        if (articleTitle) articleTitle.textContent = '加载失败';
        if (articleBody) {
            articleBody.innerHTML = '<div class="error">文章加载失败，请稍后重试</div>';
        }
        console.error('loadArticleDetail error:', error);
    }
}

// 初始化
function initArticlePage() {
    loadArticleDetail();
    if (typeof setupThemeToggle === 'function') {
        setupThemeToggle();
    }
}

// DOMContentLoaded 时初始化（处理页面直接打开的情况）
function onDOMReady(fn) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fn);
    } else {
        fn();
    }
}

// 兼容两种加载方式：
// 1. 静态 <script src="article.js"> 直接在 DOMContentLoaded 前加载
// 2. 动态创建 <script> 在 marked.js 之后加载（此时 readyState 已不是 loading）
onDOMReady(initArticlePage);
