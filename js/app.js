const ARTICLE_INDEX_PATH = 'articles/index.json';
let articleData = [];

async function fetchArticleIndex() {
    const response = await fetch(ARTICLE_INDEX_PATH, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`加载文章索引失败: ${response.status}`);
    }
    return response.json();
}

function getArticleListEl() {
    return document.getElementById('articlesGrid') || document.getElementById('article-list');
}

function renderArticles(items) {
    const list = getArticleListEl();
    if (!list) return;

    list.innerHTML = '';
    if (!items || items.length === 0) {
        list.innerHTML = '<div class="empty">没有找到相关文章</div>';
        const filteredCountEl = document.getElementById('filteredCount');
        if (filteredCountEl) filteredCountEl.textContent = '0';
        return;
    }

    items.forEach(article => {
        const card = document.createElement('div');
        card.className = 'article-card';
        card.setAttribute('data-url', `article.html?id=${article.id}`);
        card.innerHTML = `
            <h2 class="card-title"><a href="article.html?id=${article.id}">${article.title}</a></h2>
            <div class="card-excerpt">${article.excerpt}</div>
            <div class="card-tags">
                ${article.tags.map(tag => `<span class="card-tag">${tag}</span>`).join('')}
            </div>
            <div class="card-meta">
                <span class="date">${article.date}</span>
                <span class="read-time">${article.readTime}</span>
            </div>
        `;
        list.appendChild(card);
    });

    const filteredCountEl = document.getElementById('filteredCount');
    if (filteredCountEl) filteredCountEl.textContent = String(items.length);
}

function updateHomeStats() {
    const articleCountEl = document.getElementById('articleCount');
    if (articleCountEl) articleCountEl.textContent = String(articleData.length);

    const tagCountEl = document.getElementById('tagCount');
    if (tagCountEl) {
        const tagSet = new Set();
        articleData.forEach(article => article.tags.forEach(tag => tagSet.add(tag)));
        tagCountEl.textContent = String(tagSet.size);
    }
}

function showLoadError() {
    const list = getArticleListEl();
    if (!list) return;

    list.innerHTML = '<div class="empty">文章列表加载失败，请稍后重试</div>';
    const filteredCountEl = document.getElementById('filteredCount');
    if (filteredCountEl) filteredCountEl.textContent = '0';
}

async function loadArticles() {
    const loaded = await fetchArticleIndex();
    articleData = Array.isArray(loaded) ? loaded : [];
    renderArticles(articleData);
    updateHomeStats();
}

// 搜索功能
function searchArticles(query) {
    if (!Array.isArray(articleData)) return;
    const filtered = articleData.filter(a =>
        a.title.includes(query) || a.excerpt.includes(query) || a.tags.some(t => t.includes(query))
    );
    renderArticles(filtered);
}

function setupSearch() {
    const bindInput = (input) => {
        if (!input) return;
        input.addEventListener('input', () => {
            searchArticles(input.value.trim());
        });
    };

    bindInput(document.getElementById('searchInput'));
    bindInput(document.getElementById('mobileSearchInput'));
}

function setupArticleCardNavigation() {
    const list = getArticleListEl();
    if (!list) return;

    list.addEventListener('click', (e) => {
        const targetLink = e.target.closest('a');
        if (targetLink) return;

        const card = e.target.closest('.article-card');
        if (!card) return;

        const url = card.getAttribute('data-url');
        if (url) window.location.href = url;
    });
}

// 主题相关
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcon();
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
}

function updateThemeIcon() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    // Prefer SVG icons used by current pages; keep <i> fallback for legacy markup.
    const sun = document.querySelector('.theme-toggle .icon-sun');
    const moon = document.querySelector('.theme-toggle .icon-moon');
    if (sun && moon) {
        sun.style.display = isDark ? 'inline' : 'none';
        moon.style.display = isDark ? 'none' : 'inline';
        return;
    }

    const icon = document.querySelector('.theme-toggle i');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function setupThemeToggle() {
    const btn = document.querySelector('.theme-toggle');
    if (btn) {
        btn.addEventListener('click', toggleTheme);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    try {
        await loadArticles();
    } catch (error) {
        showLoadError();
        console.error('loadArticles error:', error);
    }

    setupSearch();
    setupArticleCardNavigation();
    setupThemeToggle();
});
