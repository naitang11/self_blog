// 文章数据（从全局 articles.js 加载）
// loadArticles 从 articles.js 全局变量读取文章列表

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
        card.innerHTML = `
            <h2><a href="article.html?id=${article.id}">${article.title}</a></h2>
            <div class="meta">
                <span class="date">${article.date}</span> |
                <span class="read-time">${article.readTime}</span>
            </div>
            <p>${article.excerpt}</p>
            <div class="tags">
                ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        `;
        list.appendChild(card);
    });

    const filteredCountEl = document.getElementById('filteredCount');
    if (filteredCountEl) filteredCountEl.textContent = String(items.length);
}

function updateHomeStats() {
    const articleCountEl = document.getElementById('articleCount');
    if (articleCountEl) articleCountEl.textContent = String(articles.length);

    const tagCountEl = document.getElementById('tagCount');
    if (tagCountEl) {
        const tagSet = new Set();
        articles.forEach(article => article.tags.forEach(tag => tagSet.add(tag)));
        tagCountEl.textContent = String(tagSet.size);
    }
}

// 从全局 articles.js 变量获取文章列表
function loadArticles() {
    if (!Array.isArray(articles)) return;
    renderArticles(articles);
    updateHomeStats();
}

// 搜索功能
function searchArticles(query) {
    if (!Array.isArray(articles)) return;
    const filtered = articles.filter(a =>
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
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    loadArticles();
    setupSearch();
    setupThemeToggle();
});
