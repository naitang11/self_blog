const ARTICLE_INDEX_PATH = 'articles/index.json';

function onDOMReady(fn) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fn);
    } else {
        fn();
    }
}

function sanitizeHtml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    doc.querySelectorAll('script, iframe, object, embed, link, style, meta').forEach((el) => el.remove());

    doc.querySelectorAll('*').forEach((el) => {
        Array.from(el.attributes).forEach((attr) => {
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

function getArticleId() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'), 10);
    return Number.isInteger(id) && id > 0 ? id : 1;
}

async function fetchJson(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`请求失败: ${url} (${response.status})`);
    }
    return response.json();
}

async function fetchText(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`请求失败: ${url} (${response.status})`);
    }
    return response.text();
}

function findNeighbors(sortedArticles, targetId) {
    const index = sortedArticles.findIndex((item) => item.id === targetId);
    if (index < 0) {
        return { current: null, prev: null, next: null };
    }

    return {
        current: sortedArticles[index],
        prev: index > 0 ? sortedArticles[index - 1] : null,
        next: index < sortedArticles.length - 1 ? sortedArticles[index + 1] : null,
    };
}

function renderNotFound() {
    const articleTitle = document.getElementById('articleTitle');
    const articleBody = document.getElementById('articleBody');

    if (articleTitle) articleTitle.textContent = '文章不存在';
    if (articleBody) articleBody.innerHTML = '<div class="error">文章不存在</div>';
}

function renderLoadError(error) {
    const articleTitle = document.getElementById('articleTitle');
    const articleBody = document.getElementById('articleBody');

    if (articleTitle) articleTitle.textContent = '加载失败';
    if (articleBody) articleBody.innerHTML = '<div class="error">文章加载失败，请稍后重试</div>';

    console.error('loadArticleDetail error:', error);
}

function toMarkedHtml(markdown) {
    if (typeof marked === 'undefined') {
        const escaped = markdown
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        return `<pre>${escaped}</pre>`;
    }

    return marked.parse(markdown);
}

function renderArticle(meta, markdown, prev, next) {
    const articleTitle = document.getElementById('articleTitle');
    const articleBody = document.getElementById('articleBody');

    const safeTags = Array.isArray(meta.tags) ? meta.tags : [];
    const readTime = meta.readTime || '未知';
    const html = sanitizeHtml(toMarkedHtml(markdown));

    if (articleTitle) articleTitle.textContent = meta.title;

    if (articleBody) {
        articleBody.innerHTML = `
            <article class="article">
                <h1>${meta.title}</h1>
                <div class="meta">
                    <span class="date">${meta.date}</span> |
                    <span class="read-time">${readTime}</span>
                </div>
                <div class="tags">
                    ${safeTags.map((tag) => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="content">${html}</div>
                <div class="pagination">
                    ${prev ? `<a href="article.html?id=${prev.id}" class="prev">← 上一篇</a>` : '<span></span>'}
                    ${next ? `<a href="article.html?id=${next.id}" class="next">下一篇 →</a>` : '<span></span>'}
                </div>
            </article>
        `;
    }

    document.title = `${meta.title} - 散人的博客`;

    if (typeof hljs !== 'undefined') {
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    }

    if (typeof updateThemeIcon === 'function') {
        updateThemeIcon();
    }
}

async function loadArticleDetail() {
    const id = getArticleId();

    const articleList = await fetchJson(ARTICLE_INDEX_PATH);
    const sortedArticles = Array.isArray(articleList)
        ? [...articleList].sort((a, b) => a.id - b.id)
        : [];

    const { current, prev, next } = findNeighbors(sortedArticles, id);
    if (!current) {
        renderNotFound();
        return;
    }

    const markdown = await fetchText(`articles/${current.id}.md`);
    renderArticle(current, markdown, prev, next);
}

async function initArticlePage() {
    try {
        await loadArticleDetail();
    } catch (error) {
        renderLoadError(error);
    }

    if (typeof setupThemeToggle === 'function') {
        setupThemeToggle();
    }
}

onDOMReady(initArticlePage);
