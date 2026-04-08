// ============================================================
// 散人的博客 - app.js
// 职责：主题切换、滚动效果、文章加载渲染
// ============================================================

// ---------------------- 全局状态 ----------------------
let articles = [];           // 文章索引数据
let currentTag = '全部';      // 当前标签筛选

// ---------------------- 主题 ----------------------
function getStoredTheme() {
  return localStorage.getItem('theme') || 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.classList.toggle('dark', theme === 'dark');
  }
}

function initTheme() {
  applyTheme(getStoredTheme());
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }
}

// ---------------------- 滚动效果 ----------------------
function initScrollEffects() {
  const navbar = document.getElementById('navbar');
  const progressBar = document.getElementById('progressBar');
  const backToTop = document.getElementById('backToTop');

  const onScroll = () => {
    const scrollY = window.scrollY;
    if (navbar) navbar.classList.toggle('scrolled', scrollY > 20);
    if (progressBar) {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = docH > 0 ? (scrollY / docH * 100) + '%' : '0%';
    }
    if (backToTop) backToTop.classList.toggle('visible', scrollY > 400);
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 移动端菜单
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
  }
}

// ---------------------- 文章加载 ----------------------
async function loadArticleIndex() {
  try {
    const res = await fetch('./articles/index.json');
    if (!res.ok) throw new Error('Failed to load _index.json');
    const data = await res.json();
    return Array.isArray(data) ? data : (data.articles || []);
  } catch (err) {
    console.warn('文章索引加载失败:', err);
    return [];
  }
}

function buildArticleCard(article) {
  const tagsHtml = (article.tags || []).map(t =>
    `<span class="article-tag" data-tag="${t}">${t}</span>`
  ).join('');

  return `
    <article class="article-card" onclick="location.href='article.html?id=${article.id}'">
      <div class="article-meta-top">
        <span class="article-date">${article.date || ''}</span>
        <span class="article-reading-time">${article.readTime || '1'} 分钟</span>
      </div>
      <h2 class="article-title">${article.title}</h2>
      <p class="article-summary">${article.excerpt || ''}</p>
      <div class="article-footer">
        <div class="article-tags">${tagsHtml}</div>
        <span class="read-more">
          阅读全文
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </span>
      </div>
    </article>
  `;
}

function renderArticles(articleList) {
  const container = document.getElementById('articlesGrid');
  if (!container) return;

  // 更新统计
  const filteredCount = document.getElementById('filteredCount');
  if (filteredCount) filteredCount.textContent = articleList.length;

  if (articleList.length === 0) {
    container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:60px 0;grid-column:1/-1;">暂无文章</p>';
    return;
  }

  container.innerHTML = articleList.map(buildArticleCard).join('');
}

function filterArticles() {
  const filtered = currentTag === '全部'
    ? articles
    : articles.filter(a => (a.tags || []).includes(currentTag));
  renderArticles(filtered);
}

// ---------------------- 动态生成标签按钮 ----------------------
function buildTagButtons() {
  const tagsList = document.getElementById('tagsList');
  if (!tagsList) return;

  // 收集所有标签
  const tagSet = new Set();
  if (Array.isArray(articles)) {
    articles.forEach(a => (a.tags || []).forEach(t => tagSet.add(t)));
  }
  const allTags = ['全部', ...Array.from(tagSet).sort()];

  const iconAll = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`;

  tagsList.innerHTML = allTags.map(tag => {
    const active = tag === currentTag ? 'active' : '';
    const icon = tag === '全部' ? iconAll : '';
    return `<button class="tag-btn ${active}" data-tag="${tag}">${icon}${tag}</button>`;
  }).join('');

  // 重新绑定点击事件
  setupTagFilter();

  // 更新标签数量
  const tagCount = document.getElementById('tagCount');
  if (tagCount) tagCount.textContent = allTags.length - 1;
}

function setupTagFilter() {
  const tagBtns = document.querySelectorAll('.tag-btn');
  tagBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentTag = btn.dataset.tag;
      tagBtns.forEach(b => b.classList.toggle('active', b === btn));
      filterArticles();
    });
  });
}

// ---------------------- 搜索 ----------------------
function setupSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { filterArticles(); return; }
    const filtered = articles.filter(a =>
      a.title.toLowerCase().includes(q) ||
      (a.excerpt || '').toLowerCase().includes(q) ||
      (a.tags || []).some(t => t.toLowerCase().includes(q))
    );
    renderArticles(filtered);
  });
}

// ---------------------- 初始化 ----------------------
async function init() {
  initTheme();
  initScrollEffects();
  setupSearch();

  articles = await loadArticleIndex();
  buildTagButtons();       // 先生成标签按钮
  filterArticles();        // 再渲染文章

  // 更新文章数
  const articleCount = document.getElementById('articleCount');
  if (articleCount) articleCount.textContent = articles.length;
}

// 仅在首页执行
if (document.getElementById('articlesGrid')) {
  init();
} else {
  initTheme();
  initScrollEffects();
}
