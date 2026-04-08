// ===== 管理后台逻辑 =====

const STORAGE_KEY = 'blog_articles';
const SAVE_BTN = document.getElementById('saveBtn');
const TITLE_INPUT = document.getElementById('articleTitle');
const TAGS_CONTAINER = document.getElementById('tagsContainer');
const TAG_INPUT = document.getElementById('tagInput');
const EXCERPT_INPUT = document.getElementById('articleExcerpt');
const READTIME_INPUT = document.getElementById('articleReadTime');
const EDITOR = document.getElementById('editor');
const PREVIEW = document.getElementById('previewContent');
const STATUS_MSG = document.getElementById('statusMsg');

// 当前编辑状态
let currentId = null; // null = 新文章
let tagList = [];

// ===== 文章数据读写 =====

function getArticles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveArticles(articles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
}

function generateId(articles) {
  return articles.length > 0 ? Math.max(...articles.map(a => a.id)) + 1 : 1;
}

// ===== Toast 通知 =====

function showToast(msg, type = 'default') {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// ===== 标签输入 =====

function renderTags() {
  TAGS_CONTAINER.innerHTML = '';
  tagList.forEach(tag => {
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.innerHTML = `${escapeHtml(tag)}<span class="remove-tag" onclick="removeTag('${escapeHtml(tag)}')">&times;</span>`;
    TAGS_CONTAINER.appendChild(chip);
  });
}

function addTag(tag) {
  tag = tag.trim().replace(/，/g, ',');
  const parts = tag.split(',').map(t => t.trim()).filter(Boolean);
  parts.forEach(t => {
    if (t && !tagList.includes(t) && tagList.length < 5) {
      tagList.push(t);
    }
  });
  renderTags();
}

function removeTag(tag) {
  tagList = tagList.filter(t => t !== tag);
  renderTags();
}

TAGS_CONTAINER.addEventListener('click', () => TAG_INPUT.focus());

TAG_INPUT.addEventListener('keydown', e => {
  if (['Enter', ',', '，'].includes(e.key)) {
    e.preventDefault();
    addTag(TAG_INPUT.value);
    TAG_INPUT.value = '';
  }
  if (e.key === 'Backspace' && !TAG_INPUT.value && tagList.length > 0) {
    tagList.pop();
    renderTags();
  }
});

// ===== Markdown 简易渲染 =====

function renderMarkdown(text) {
  if (!text) return '<p style="color:var(--text-secondary);font-style:italic">预览区域</p>';
  
  // 分离 frontmatter 和正文
  let body = text;
  
  body = body
    // 代码块
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`;
    })
    // 行内代码
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // 标题
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // 引用
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // 粗体、斜体
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // 图片
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px">')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // 水平线
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--border);margin:1.5em 0">')
    // 列表
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    // 包裹未成列表的段落
    .split(/\n{2,}/)
    .map(block => {
      block = block.trim();
      if (!block) return '';
      if (block.startsWith('<')) return block;
      // 处理单行列表
      if (block.match(/^<li>/)) return `<ul>${block}</ul>`;
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');
  
  return body;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ===== 保存文章 =====

function getFormData() {
  return {
    title: TITLE_INPUT.value.trim(),
    excerpt: EXCERPT_INPUT.value.trim(),
    tags: [...tagList],
    readTime: READTIME_INPUT.value.trim() || estimateReadTime(EDITOR.value),
    content: EDITOR.value,
  };
}

function validate() {
  if (!TITLE_INPUT.value.trim()) {
    showToast('请输入文章标题', 'error');
    TITLE_INPUT.focus();
    return false;
  }
  if (!EDITOR.value.trim()) {
    showToast('请输入文章内容', 'error');
    EDITOR.focus();
    return false;
  }
  return true;
}

function doSave() {
  if (!validate()) return;
  
  const articles = getArticles();
  const data = getFormData();
  
  if (currentId) {
    // 更新
    const idx = articles.findIndex(a => a.id === currentId);
    if (idx !== -1) {
      articles[idx] = { ...articles[idx], ...data, date: new Date().toISOString().split('T')[0] };
    }
    showToast('文章已更新', 'success');
  } else {
    // 新建
    articles.unshift({
      id: generateId(articles),
      date: new Date().toISOString().split('T')[0],
      featured: articles.length === 0,
      ...data
    });
    showToast('文章已发布', 'success');
    currentId = articles[0].id;
    updateUrl();
  }
  
  saveArticles(articles);
  updateStats();
}

SAVE_BTN.addEventListener('click', doSave);

// ===== 加载文章到编辑 =====

function loadArticle(id) {
  const articles = getArticles();
  const article = articles.find(a => a.id === id);
  if (!article) return;
  
  currentId = id;
  TITLE_INPUT.value = article.title;
  EXCERPT_INPUT.value = article.excerpt || '';
  READTIME_INPUT.value = article.readTime || '';
  EDITOR.value = article.content || '';
  tagList = [...(article.tags || [])];
  renderTags();
  updatePreview();
  updateUrl();
  STATUS_MSG.textContent = `正在编辑：${article.title}`;
}

// ===== 新文章 =====

function newArticle() {
  currentId = null;
  TITLE_INPUT.value = '';
  EXCERPT_INPUT.value = '';
  READTIME_INPUT.value = '';
  EDITOR.value = '';
  tagList = [];
  renderTags();
  updatePreview();
  history.pushState({}, '', window.location.pathname);
  STATUS_MSG.textContent = '撰写新文章';
}

// ===== 文章列表 =====

function renderTable() {
  const articles = getArticles();
  const tbody = document.getElementById('articleTableBody');
  const view = document.getElementById('listView');
  const empty = document.getElementById('emptyState');
  
  if (articles.length === 0) {
    view.style.display = 'none';
    empty.style.display = 'block';
    return;
  }
  
  view.style.display = 'block';
  empty.style.display = 'none';
  
  tbody.innerHTML = articles.map(a => `
    <tr>
      <td class="col-title">
        <a href="#" onclick="editArticle(${a.id});return false" style="color:var(--text);text-decoration:none">${escapeHtml(a.title)}</a>
      </td>
      <td class="col-date" style="color:var(--text-secondary);font-size:13px">${a.date}</td>
      <td class="col-tags">
        ${(a.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
      </td>
      <td class="col-readtime" style="color:var(--text-secondary);font-size:13px">${a.readTime || '-'}</td>
      <td class="col-actions">
        <button class="btn-icon" onclick="editArticle(${a.id})" title="编辑">✏️</button>
        <button class="btn-icon" onclick="deleteArticle(${a.id})" title="删除">🗑️</button>
      </td>
    </tr>
  `).join('');
  
  updateStats();
}

function editArticle(id) {
  showView('editor');
  loadArticle(id);
}

function deleteArticle(id) {
  const articles = getArticles();
  const article = articles.find(a => a.id === id);
  if (!article) return;
  
  showModal(`确定要删除《${article.title}》吗？`, () => {
    saveArticles(articles.filter(a => a.id !== id));
    showToast('已删除', 'success');
    renderTable();
    if (currentId === id) newArticle();
  });
}

// ===== 导出 =====

function exportJSON() {
  const articles = getArticles();
  if (articles.length === 0) {
    showToast('没有文章可导出', 'error');
    return;
  }
  
  const json = JSON.stringify(articles, null, 2);
  downloadFile('blog-articles.json', json, 'application/json');
  showToast(`已导出 ${articles.length} 篇文章`, 'success');
}

function exportHTML() {
  const articles = getArticles();
  if (articles.length === 0) {
    showToast('没有文章可导出', 'error');
    return;
  }
  
  // 生成静态 JS 文件
  const jsContent = `// 博客文章数据 (由管理后台导出)\nconst SAMPLE_ARTICLES = ${JSON.stringify(articles, null, 2)};`;
  downloadFile('articles.js', jsContent, 'text/javascript');
  showToast(`已导出 ${articles.length} 篇文章的 JS 文件`, 'success');
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function copyJSON() {
  const articles = getArticles();
  navigator.clipboard.writeText(JSON.stringify(articles, null, 2)).then(() => {
    showToast('已复制到剪贴板', 'success');
  }).catch(() => {
    showToast('复制失败，手动复制吧', 'error');
  });
}

// ===== 工具 =====

function updatePreview() {
  PREVIEW.innerHTML = renderMarkdown(EDITOR.value);
}

function updateUrl() {
  const url = currentId ? `${window.location.pathname}?id=${currentId}` : window.location.pathname;
  history.replaceState({}, '', url);
}

function updateStats() {
  const articles = getArticles();
  document.getElementById('statCount').textContent = articles.length;
  const totalWords = articles.reduce((acc, a) => acc + (a.content || '').length, 0);
  document.getElementById('statWords').textContent = Math.round(totalWords / 2).toLocaleString();
}

function estimateReadTime(text) {
  const count = (text || '').replace(/[#*`>\-\[\]!]/g, '').length;
  const minutes = Math.max(1, Math.round(count / 400));
  return `${minutes} 分钟`;
}

function showModal(message, onConfirm) {
  const old = document.querySelector('.modal-overlay');
  if (old) old.remove();
  
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h3>确认删除</h3>
      <p>${message}</p>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="modalCancel">取消</button>
        <button class="btn btn-danger" id="modalConfirm">删除</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  
  overlay.querySelector('#modalCancel').onclick = () => overlay.remove();
  overlay.querySelector('#modalConfirm').onclick = () => {
    overlay.remove();
    onConfirm();
  };
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
}

function showView(view) {
  document.getElementById('listView').style.display = view === 'list' ? 'block' : 'none';
  document.getElementById('editorView').style.display = view === 'editor' ? 'flex' : 'none';
  
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.view === view);
  });
}

// ===== 事件绑定 =====

EDITOR.addEventListener('input', () => {
  updatePreview();
  // 自动更新阅读时间
  if (!READTIME_INPUT.value || READTIME_INPUT.dataset.auto === 'true') {
    READTIME_INPUT.value = estimateReadTime(EDITOR.value);
    READTIME_INPUT.dataset.auto = 'true';
  }
});

READTIME_INPUT.addEventListener('input', () => {
  READTIME_INPUT.dataset.auto = 'false';
});

// 快捷键：Ctrl+S 保存
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    doSave();
  }
});

// ===== 初始化 =====

function init() {
  // 检查 URL 参数
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));
  
  if (id) {
    showView('editor');
    loadArticle(id);
  } else {
    showView('list');
    newArticle();
  }
  
  renderTable();
  updatePreview();
  
  document.getElementById('newArticleBtn').onclick = () => {
    newArticle();
    showView('editor');
  };
  
  document.getElementById('backToListBtn').onclick = () => {
    showView('list');
    renderTable();
  };
}

init();
