// ===== 文章页逻辑 =====

// 文章数据
const ARTICLES = {
  1: {
    id: 1,
    title: '我的博客诞生记',
    date: '2026-04-08',
    tags: ['随笔'],
    readTime: '3 分钟',
    prev: null,
    next: 2,
    content: `
终于，博客上线了。

说实话，这个博客从想法到落地，中间拖了挺久。作为一个写代码的人，一直想有个自己的地方写点东西。不是为了 SEO，不是为了流量，就是单纯想有个角落可以安放那些乱七八糟的想法。

## 为什么是自己搭？

市面上的博客平台挺多的，WordPress、Hexo、Hugo... 每个都挺好。但最后还是决定自己从头写一个，主要有几个原因：

1. **可控性** — 用别人的平台，总有种寄人篱下的感觉。万一哪天服务挂了、收费了、倒闭了，文章就跟着没了
2. **简洁性** — 我不需要评论系统、不需要数据分析、不需要各种花里胡哨的功能。就是一个干净的页面，让我安心写字
3. **学习性** — 工作中天天用框架，偶尔也想试试纯手工搭建是什么感觉

## 技术选型

没用任何框架，就三个文件走天下：

- \`index.html\` — 首页
- \`article.html\` — 文章页
- \`about.html\` — 关于页

样式用原生 CSS，交互用原生 JavaScript。深色模式、响应式、搜索功能都是自己写的，没有依赖任何库。

说实话，比想象中要简单。

## 写点什么呢？

目前计划写这几类内容：

- **技术笔记** — 工作中踩的坑、学到的东西
- **读书感悟** — 读过的书写写读后感
- **生活杂谈** — 乱七八糟的思考

---

就是这样，从零到有，花了一晚上。

如果你恰好看到了这里，欢迎留言。
`
  },
  2: {
    id: 2,
    title: '用 Vanilla JS 搭博客：比框架更自由的体验',
    date: '2026-04-07',
    tags: ['技术', '前端'],
    readTime: '8 分钟',
    prev: 1,
    next: 3,
    content: `
说起搭博客，大多数人第一反应是 Hexo、Hugo 或者直接用 WordPress。这些工具都很成熟，但有时候我就是想用最原始的方式做点东西。

这篇文章记录一下我是怎么用纯 HTML + CSS + JS 搞定一个完整博客的。

## 为什么不用框架？

不是说框架不好。React/Vue 都很强大，但有时候：

- 写一个简单页面要配一堆环境
- 打个包出来好几 MB
- 想改个小功能要翻半天文档

对于一个个人博客来说，有点杀鸡用牛刀的感觉。

而且，用原生 JS 写东西有种奇怪的乐趣。就像骑自行车，虽然没有摩托车快，但每一步都是自己踩出来的。

## 功能实现

### 1. 深色模式

用 CSS 变量配合 \`localStorage\` 实现：

\`\`\`javascript
const saved = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const theme = saved || (prefersDark ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', theme);
\`\`\`

切换时只需要改 \`data-theme\` 属性，所有颜色自动同步。

### 2. 搜索功能

搜索框监听 \`input\` 事件，实时过滤文章列表：

\`\`\`javascript
input.addEventListener('input', () => {
  const q = input.value.trim().toLowerCase();
  const filtered = articles.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.excerpt.toLowerCase().includes(q)
  );
  renderResults(filtered);
});
\`\`\`

### 3. 目录导航

用 \`marked\` 库解析 Markdown，然后用正则提取 \`h2\`/\`h3\` 标签生成目录。

\`\`\`javascript
marked.setOptions({ highlight: true });
const html = marked.parse(content);
\`\`\`

### 4. 评论系统

用 \`localStorage\` 存储评论数据，简单够用：

\`\`\`javascript
function saveComment(articleId, comment) {
  const all = JSON.parse(localStorage.getItem('comments') || '{}');
  all[articleId] = all[articleId] || [];
  all[articleId].push(comment);
  localStorage.setItem('comments', JSON.stringify(all));
}
\`\`\`

## 性能怎么样？

没有打包、没有压缩、没有 tree shaking。打开页面就一个 HTML 文件 + 一个 CSS + 一个 JS，加起来不到 50KB。

比那些动不动几百 KB 的 SPA 轻多了。

## 写在最后

用框架写代码是工作，用原生 JS 写东西是玩。

有时候玩一玩挺好的，能把那些被框架藏起来的底层逻辑看清楚一点。

---

完整代码在 [GitHub](https://github.com) 上，有兴趣可以看看。
`
  },
  3: {
    id: 3,
    title: '程序员书单：那些改变我思维的书',
    date: '2026-04-05',
    tags: ['分享', '生活'],
    readTime: '12 分钟',
    prev: 2,
    next: null,
    content: `
书是这个时代性价比最高的学习方式。一本书几十块钱，能买到作者几十年的经验。

作为一个写代码的人，这几年读了不少书，有些看完就忘了，有些真的改变了我看世界的方式。分享几本觉得值得反复读的：

## 《代码大全》

别被名字骗了，这不是一本讲"代码大全"的书。

它是关于**如何编写优秀代码**的百科全书。从变量命名到函数设计，从代码格式到团队协作，方方面面都讲透了。

看这本书最大的收获是：原来写代码真的有"好坏"之分，而好代码是可以修炼出来的。

> " Leave no lint." — 代码整洁是门艺术

## 《计算机程序的构造和解释》(SICP)

这本书很难，但我强烈建议每个计算机专业的人都去试试。

它讲的不是某一种语言、某一种技术，而是**计算的思维**。看完之后你会发现，编程语言只是工具，核心是你脑子里那个"计算模型"。

## 《Unix 编程艺术》

Unix 设计哲学影响了整整一代程序员：

- 每个程序只做一件事
- 输出可以成为另一个程序的输入
- 一切皆文件

这些原则放到今天依然适用。云原生、容器化、微服务...背后都是 Unix 精神的延续。

## 《设计心理学》

这本书不是技术书，但每个做产品的程序员都应该读。

它讲的是人如何感知世界、理解事物。懂了这些，你写的界面才不会反人类。

## 《活着》

最后推荐一本闲书。

余华的《活着》，讲的是一个农民一生的故事。看完你会觉得，自己那点加班、那点压力，真的不算什么。

---

以上就是我目前的书单。有些在读，有些打算读，如果你有觉得好的，欢迎推荐。
`
  }
};

// ===== 获取 URL 参数 =====
function getArticleId() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('id')) || 1;
}

// ===== 加载文章 =====
function loadArticle(id) {
  const article = ARTICLES[id];
  if (!article) {
    // 文章不存在，显示 404
    document.getElementById('articleTitle').textContent = '文章不存在';
    document.getElementById('articleBody').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <div class="empty-state-text">找不到这篇文章</div>
        <a href="index.html" class="back-link">返回首页</a>
      </div>
    `;
    return;
  }
  return article;
}

// ===== 渲染文章 =====
function renderArticle(article) {
  // 渲染标签
  const tagsEl = document.getElementById('articleTags');
  tagsEl.innerHTML = article.tags.map(tag =>
    `<span class="article-tag">${tag}</span>`
  ).join('');

  // 渲染标题和元信息
  document.getElementById('articleTitle').textContent = article.title;
  document.getElementById('articleDate').querySelector('span').textContent = article.date;
  document.getElementById('articleReadTime').querySelector('span').textContent = article.readTime;

  // 渲染正文
  const bodyEl = document.getElementById('articleBody');
  marked.setOptions({
    highlight: function(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    },
    breaks: true,
    gfm: true
  });
  bodyEl.innerHTML = marked.parse(article.content);

  // 更新目录
  renderTOC(article.id, article.content);

  // 渲染上下篇导航
  renderArticleNav(article);

  // 更新页面标题
  document.title = `${article.title} - 散人的博客`;
}

// ===== 渲染目录 =====
function renderTOC(articleId, content) {
  const tocNav = document.getElementById('tocNav');
  const headings = content.match(/^#{2,4}\s+.+$/gm) || [];

  if (headings.length === 0) {
    tocNav.innerHTML = '<div class="toc-empty">暂无目录</div>';
    return;
  }

  const tocItems = headings.map(h => {
    const level = h.match(/^#+/)[0].length;
    const text = h.replace(/^#+\s+/, '');
    const id = text.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9]/g, '-');
    return { level, text, id };
  });

  tocNav.innerHTML = `
    <ul class="toc-list">
      ${tocItems.map(item => `
        <li class="toc-item">
          <a href="#${item.id}" class="toc-link level-${item.level}" data-id="${item.id}">
            ${item.text}
          </a>
        </li>
      `).join('')}
    </ul>
  `;

  // 为 heading 添加 id
  const bodyEl = document.getElementById('articleBody');
  tocItems.forEach(item => {
    const heading = bodyEl.querySelector(`:contains("${item.text}")`);
    if (heading) {
      heading.id = item.id;
    }
  });
}

// ===== 渲染上下篇导航 =====
function renderArticleNav(article) {
  const navPrev = document.getElementById('navPrev');
  const navNext = document.getElementById('navNext');
  const prevTitle = document.getElementById('navPrevTitle');
  const nextTitle = document.getElementById('navNextTitle');

  if (article.prev) {
    prevTitle.textContent = ARTICLES[article.prev].title;
    navPrev.href = `article.html?id=${article.prev}`;
  } else {
    navPrev.style.visibility = 'hidden';
  }

  if (article.next) {
    nextTitle.textContent = ARTICLES[article.next].title;
    navNext.href = `article.html?id=${article.next}`;
  } else {
    navNext.style.visibility = 'hidden';
  }
}

// ===== 评论功能 =====
function initComments(articleId) {
  const input = document.getElementById('commentInput');
  const authorInput = document.getElementById('commentAuthor');
  const submitBtn = document.getElementById('commentSubmit');
  const listEl = document.getElementById('commentsList');
  const countEl = document.getElementById('commentsCount');

  // 加载评论
  function loadComments() {
    const all = JSON.parse(localStorage.getItem('blog_comments') || '{}');
    return all[articleId] || [];
  }

  // 保存评论
  function saveComments(comments) {
    const all = JSON.parse(localStorage.getItem('blog_comments') || '{}');
    all[articleId] = comments;
    localStorage.setItem('blog_comments', JSON.stringify(all));
  }

  // 渲染评论
  function renderComments() {
    const comments = loadComments();
    countEl.textContent = `(${comments.length})`;

    if (comments.length === 0) {
      listEl.innerHTML = '<div class="comments-empty">还没有评论，来抢沙发吧！</div>';
      return;
    }

    listEl.innerHTML = comments.map((c, i) => `
      <div class="comment-item" data-index="${i}">
        <div class="comment-header">
          <div class="comment-author-wrap">
            <div class="comment-avatar">${c.name.charAt(0).toUpperCase()}</div>
            <span class="comment-name">${escapeHtml(c.name)}</span>
            <span class="comment-date">${c.date}</span>
          </div>
        </div>
        <div class="comment-content">${escapeHtml(c.content)}</div>
      </div>
    `).join('');
  }

  // HTML 转义
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 提交评论
  submitBtn.addEventListener('click', () => {
    const content = input.value.trim();
    const name = authorInput.value.trim() || '匿名';

    if (!content) {
      input.focus();
      return;
    }

    const comments = loadComments();
    comments.push({
      name,
      content,
      date: new Date().toLocaleDateString('zh-CN')
    });

    saveComments(comments);
    input.value = '';
    renderComments();
  });

  renderComments();
}

// ===== 目录滚动高亮 =====
function initTOCScrollspy() {
  const links = document.querySelectorAll('.toc-link');
  if (links.length === 0) return;

  const headings = Array.from(document.querySelectorAll('.article-body h2, .article-body h3, .article-body h4'));

  window.addEventListener('scroll', () => {
    let current = '';
    headings.forEach(heading => {
      if (heading.getBoundingClientRect().top <= 100) {
        current = heading.id;
      }
    });

    links.forEach(link => {
      link.classList.toggle('active', link.dataset.id === current);
    });
  }, { passive: true });
}

// ===== 进度条 =====
function initProgress() {
  const bar = document.getElementById('progressBar');
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  const articleId = getArticleId();
  const article = loadArticle(articleId);

  if (article) {
    renderArticle(article);
    initComments(articleId);
    initTOCScrollspy();
  }

  initProgress();
  initBackToTop();
  initTheme();

  // 深色模式切换时更新代码高亮主题
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.attributeName === 'data-theme') {
        updateHljsTheme();
      }
    });
  });
  observer.observe(document.documentElement, { attributes: true });

  function updateHljsTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.getElementById('hljs-light').disabled = isDark;
    document.getElementById('hljs-dark').disabled = !isDark;
  }
});
