// 文章数据
const ARTICLES = {
  1: {
    id: 1,
    title: '使用 Vercel 部署静态网站',
    date: '2026-04-08',
    tags: ['Vercel', '部署'],
    readTime: '1 分钟',
    prev: null,
    next: 2,
    content: `在使用 Vercel 部署静态网站之前，需要准备以下工具：

1. **Node.js** - 用于运行 Vercel CLI
2. **Git** - 用于将代码推送到仓库
3. **Vercel 账号** - 可以使用 GitHub 账号登录

## 安装 Vercel CLI

打开终端，运行以下命令安装 Vercel CLI：

\`\`\`bash
npm install -g vercel
\`\`\`

## 部署步骤

### 1. 登录 Vercel

在终端中运行以下命令登录：

\`\`\`bash
vercel login
\`\`\`

### 2. 初始化项目

进入项目目录，运行：

\`\`\`bash
vercel
\`\`\`

按照提示输入项目名称和其他配置。

### 3. 部署到生产环境

当您准备好部署到生产环境时，运行：

\`\`\`bash
vercel --prod
\`\`\`

## 绑定域名

在 Vercel 控制台中，可以轻松地绑定自定义域名。

前往项目设置 → Domains，添加您的域名即可。

## 自动部署

当您推送代码到 GitHub 时，Vercel 会自动重新部署网站。

---

部署从未如此简单！`
  },
  2: {
    id: 2,
    title: 'CSS 变量实现主题切换',
    date: '2026-04-08',
    tags: ['CSS', '前端'],
    readTime: '2 分钟',
    prev: 1,
    next: 3,
    content: `使用 CSS 变量可以轻松实现主题切换功能。

## CSS 变量基础

CSS 变量使用 \`--\` 前缀定义：

\`\`\`css
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
}
\`\`\`

## 暗色主题

在 \`data-theme="dark"\` 属性下覆盖变量：

\`\`\`css
[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
}
\`\`\`

## JavaScript 切换

\`\`\`javascript
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}
\`\`\`

## 本地存储

使用 localStorage 保存用户偏好：

\`\`\`javascript
// 页面加载时
const saved = localStorage.getItem('theme');
if (saved) {
  document.documentElement.setAttribute('data-theme', saved);
}
\`\`\`

这样用户的选择会被记住，下次访问时自动应用。`
  },
  3: {
    id: 3,
    title: 'Markdown 测试',
    date: '2026-04-08',
    tags: ['测试'],
    readTime: '1 分钟',
    prev: 2,
    next: 4,
    content: `# Markdown 测试

这是一篇测试文章，用于验证 Markdown 渲染是否正常工作。

## 标题

支持多级标题。

### 三级标题

#### 四级标题

## 列表

### 无序列表

- 苹果
- 香蕉
- 橙子

### 有序列表

1. 第一步
2. 第二步
3. 第三步

## 代码块

### 行内代码

这是 \`行内代码\` 示例。

### 代码块

\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
\`\`\`

## 引用

> 这是一段引用文本。
> 可以有多行。

## 链接

[我的博客](https://blog.selfai.cn)

## 图片

![占位图片](https://via.placeholder.com/400x200)

---

测试完成！`
  },
  4: {
    id: 4,
    title: '从零搭个人博客：我都干了什么',
    date: '2026-04-08',
    tags: ['技术', '复盘'],
    readTime: '3 分钟',
    prev: 3,
    next: null,
    content: `# 从零搭个人博客：我都干了什么

## 前言

从零开始搭了一个个人博客，部署在 Vercel 上。

写这个博客的主要目的是记录自己的学习过程，方便以后回顾。所以内容主要涉及技术方面，也会夹杂一些其他有趣的东西。

## 技术栈

- **前端**: HTML + CSS + JavaScript（无框架）
- **后端**: 无（纯静态页面）
- **部署**: Vercel
- **域名**: 阿里云

## 搭建过程

### 1. 初始化项目

创建一个项目文件夹，初始化 Git 仓库。

### 2. 编写页面

写了三个页面：

- \`index.html\` - 首页，展示文章列表
- \`article.html\` - 文章页，展示单篇文章内容
- \`about.html\` - 关于页

### 3. CSS 样式

使用 CSS 变量实现主题切换（亮色/暗色），通过 localStorage 保存用户偏好。

### 4. JavaScript 功能

- 文章列表渲染
- 文章内容加载（支持 Markdown）
- 主题切换

### 5. 部署

推送到 GitHub，连接 Vercel 自动部署。

### 6. 域名配置

在阿里云购买域名，配置 DNS 解析到 Vercel。

## 遇到的问题

### CSS 样式问题

早期版本使用 CDN 加载 CSS，遇到过加载慢或失败的问题。后来改为本地存储。

### Markdown 渲染

使用 marked.js 库解析 Markdown。代码高亮使用 highlight.js。

### 主题切换

使用 CSS 变量的 \`data-theme\` 属性实现。暗色主题通过给 html 标签添加 \`data-theme="dark"\` 属性触发。

## 后续计划

- [ ] 完善文章内容
- [ ] 优化页面样式
- [ ] 添加更多功能（如搜索、标签筛选）
- [ ] 移动端适配

## 总结

搭个人博客不难，难的是坚持写下去。希望能坚持下去吧。

---

*首发于 2026-04-08*`
  }
};

// 主题相关
function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  }
}

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

// 滚动效果
function initScrollEffects() {
  const header = document.querySelector('header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll <= 0) {
      header.classList.remove('hidden');
      return;
    }

    if (currentScroll > lastScroll && currentScroll > 100) {
      header.classList.add('hidden');
    } else {
      header.classList.remove('hidden');
    }

    lastScroll = currentScroll;
  });
}

// 获取 URL 参数
function getArticleId() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('id')) || 1;
}

// 获取文章内容
function getArticleContent(article) {
  if (article.content) {
    return marked.parse(article.content);
  }
  return '<p>文章内容加载失败</p>';
}

// 加载文章
function loadArticle(id) {
  return new Promise((resolve, reject) => {
    const article = ARTICLES[id];
    if (!article) {
      reject(new Error('文章不存在'));
      return;
    }

    if (article.content) {
      resolve(article);
    } else {
      reject(new Error('文章内容为空'));
    }
  });
}

// 渲染文章
function renderArticle(article) {
  const titleEl = document.getElementById('articleTitle');
  const tagsEl = document.getElementById('articleTags');
  const bodyEl = document.getElementById('articleBody');

  if (titleEl) titleEl.textContent = article.title;

  if (tagsEl) {
    tagsEl.innerHTML = article.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
  }

  if (bodyEl) {
    bodyEl.innerHTML = getArticleContent(article);
    renderTOC();
  }
}

// 渲染目录
function renderTOC() {
  const tocNav = document.getElementById('tocNav');
  if (!tocNav) return;

  const headings = document.querySelectorAll('#articleBody h2, #articleBody h3');
  if (headings.length === 0) {
    tocNav.innerHTML = '';
    return;
  }

  let toc = '<ul>';
  headings.forEach((heading, index) => {
    const id = `heading-${index}`;
    heading.id = id;
    const level = heading.tagName === 'H2' ? '2' : '3';
    toc += `<li class="toc-${level}"><a href="#${id}">${heading.textContent}</a></li>`;
  });
  toc += '</ul>';

  tocNav.innerHTML = toc;
}

// 初始化内容
function renderContent() {
  const id = getArticleId();
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const contentEl = document.getElementById('articleContent');

  loadArticle(id)
    .then(article => {
      renderArticle(article);
      if (loadingEl) loadingEl.style.display = 'none';
      if (contentEl) contentEl.style.display = 'block';
    })
    .catch(error => {
      console.error('加载文章失败:', error);
      if (loadingEl) loadingEl.style.display = 'none';
      if (errorEl) {
        errorEl.style.display = 'flex';
        errorEl.querySelector('p').textContent = '文章加载失败，请稍后重试。';
      }
    });
}

// 初始化
function onReady() {
  initTheme();
  initScrollEffects();
  renderContent();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onReady);
} else {
  onReady();
}
