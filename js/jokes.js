// 段子屋 JS
// API_BASE 必须设置为 Railway 完整 URL，不能用相对路径（GitHub Pages 无后端）
const API_BASE = 'https://selfblog-production.up.railway.app';

// 本地缓存键
const CACHE_KEY = 'jokes_cache';
const CACHE_TIME_KEY = 'jokes_cache_time';
const JOKES_CACHE_TTL = 5 * 60 * 1000; // 缓存 5 分钟

// DOM 元素
const list = document.getElementById('jokes-list');
const form = document.getElementById('joke-form');
const input = document.getElementById('joke-input');
const toggleDark = document.getElementById('toggle-dark');

// 管理员密钥（仅删除时使用，不填则不能删除）
let adminSecret = localStorage.getItem('jokes_admin_secret') || '';

// 初始化
(async function init() {
  // 读取缓存
  const cached = loadCache();
  if (cached) {
    renderJokes(cached);
  }

  // 拉取最新
  try {
    const jokes = await fetchJokes();
    saveCache(jokes);
    renderJokes(jokes);
  } catch (e) {
    console.error('拉取段子失败:', e);
  }

  // 主题
  if (localStorage.getItem('dark-mode') === '1') {
    document.body.classList.add('dark');
  }
})();

// 事件：发段子
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const content = input.value.trim();
  if (!content) return;

  const btn = form.querySelector('button');
  btn.disabled = true;
  btn.textContent = '发布中...';

  try {
    const res = await fetch(API_BASE + '/api/jokes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 429) {
        alert(`发布太频繁，请 ${data.retryAfter} 秒后再试`);
      } else {
        alert(data.error || '发布失败');
      }
      return;
    }

    input.value = '';

    // 成功后刷新列表
    const jokes = await fetchJokes();
    saveCache(jokes);
    renderJokes(jokes);

    // 显示剩余次数提示
    if (data.remaining !== undefined && data.remaining < 5) {
      showToast(`发布成功，本轮剩余 ${data.remaining} 次`);
    }
  } catch (e) {
    alert('网络错误，请重试');
  } finally {
    btn.disabled = false;
    btn.textContent = '发布';
  }
});

// 事件：深色模式切换
toggleDark?.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('dark-mode', document.body.classList.contains('dark') ? '1' : '0');
});

// --- 数据层 ---

async function fetchJokes() {
  const res = await fetch(API_BASE + '/api/jokes');
  if (!res.ok) throw new Error('请求失败');
  return res.json();
}

async function deleteJoke(id) {
  // 如果还没设置密钥，提示设置
  if (!adminSecret) {
    adminSecret = prompt('请输入管理员密钥（删除段子用）：');
    if (!adminSecret) return;
    localStorage.setItem('jokes_admin_secret', adminSecret);
  }

  const res = await fetch(`${API_BASE}/api/jokes/${id}`, {
    method: 'DELETE',
    headers: { 'x-admin-secret': adminSecret },
  });

  if (res.status === 403) {
    // 密钥错误，清除并重新提示
    alert('密钥错误，无法删除');
    adminSecret = '';
    localStorage.removeItem('jokes_admin_secret');
    return;
  }

  if (!res.ok) throw new Error('删除失败');
}

async function toggleLike(id) {
  const res = await fetch(`${API_BASE}/api/jokes/${id}/like`, { method: 'POST' });
  if (!res.ok) throw new Error('点赞失败');
  const data = await res.json();

  // 更新本地缓存中的点赞状态
  const cached = loadCache();
  if (cached) {
    const joke = cached.find(j => j.id === id);
    if (joke) {
      joke.liked = data.liked;
      joke.likes = data.likes;
      saveCache(cached);
    }
  }

  // 重新渲染
  const jokes = await fetchJokes();
  saveCache(jokes);
  renderJokes(jokes);
}

// --- 渲染 ---

function renderJokes(jokes) {
  if (!list) return;

  if (jokes.length === 0) {
    list.innerHTML = '<p class="empty">还没有段子，快来抢沙发！</p>';
    return;
  }

  list.innerHTML = jokes.map(joke => `
    <div class="joke-card" id="joke-${joke.id}">
      <p class="joke-content">${escapeHtml(joke.content)}</p>
      <div class="joke-meta">
        <span class="joke-date">${joke.date || ''}</span>
        <div class="joke-actions">
          <button class="like-btn ${joke.liked ? 'liked' : ''}" onclick="toggleLike(${joke.id})">
            ${joke.liked ? '❤️' : '🤍'} ${joke.likes || 0}
          </button>
          <button class="delete-btn" onclick="confirmDelete(${joke.id})">🗑️</button>
        </div>
      </div>
    </div>
  `).join('');
}

// --- 工具 ---

function confirmDelete(id) {
  if (!confirm('确定删除这条段子？')) return;
  deleteJoke(id).then(() => {
    // 从缓存移除
    const cached = loadCache();
    if (cached) {
      const filtered = cached.filter(j => j.id !== id);
      saveCache(filtered);
      renderJokes(filtered);
    }
    // 重新拉取确保一致
    fetchJokes().then(jokes => {
      saveCache(jokes);
      renderJokes(jokes);
    });
  }).catch(e => {
    alert('删除失败：' + e.message);
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function saveCache(jokes) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(jokes));
    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
  } catch (e) {}
}

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const time = parseInt(localStorage.getItem(CACHE_TIME_KEY) || '0');
    if (!raw || Date.now() - time > JOKES_CACHE_TTL) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
