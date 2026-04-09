(function () {
  const API_BASE = '';  // 同源，生产环境由 server/index.js 提供

  // DOM
  const jokesList = document.getElementById('jokesList');
  const jokeInput = document.getElementById('jokeInput');
  const postBtn = document.getElementById('postBtn');
  const toast = document.getElementById('toast');

  // 主题切换
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const html = document.documentElement;
      const isDark = html.getAttribute('data-theme') === 'dark';
      html.setAttribute('data-theme', isDark ? 'light' : 'dark');
      localStorage.setItem('theme', isDark ? 'light' : 'dark');
      updateThemeIcons(!isDark);
    });

    function updateThemeIcons(isDark) {
      document.querySelectorAll('.icon-sun').forEach(el => el.style.display = isDark ? 'block' : 'none');
      document.querySelectorAll('.icon-moon').forEach(el => el.style.display = isDark ? 'none' : 'block');
    }

    const savedTheme = localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme === 'dark');
  }

  // Toast
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // 转义 HTML
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // 渲染
  function renderJokes(jokes) {
    if (!jokes || jokes.length === 0) {
      jokesList.innerHTML = `
        <div class="jokes-empty">
          <div class="jokes-empty-icon">🤫</div>
          <p>还没有段子，来发一条？</p>
        </div>`;
      return;
    }

    jokesList.innerHTML = jokes.map(j => `
      <div class="joke-card" data-id="${j.id}">
        <div class="joke-content">${escapeHtml(j.content)}</div>
        <div class="joke-meta">
          <span class="joke-date">${j.date}</span>
          <div class="joke-actions">
            <button class="joke-delete" data-id="${j.id}" title="删除">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
              </svg>
            </button>
            <button class="joke-like ${j.liked ? 'liked' : ''}" data-id="${j.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="${j.liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span>${j.likes || 0}</span>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // 加载
  async function loadJokes() {
    try {
      const res = await fetch(`${API_BASE}/api/jokes`);
      const jokes = await res.json();
      renderJokes(jokes);
    } catch (err) {
      jokesList.innerHTML = `
        <div class="jokes-empty">
          <div class="jokes-empty-icon">😵</div>
          <p>加载失败，请稍后刷新重试</p>
        </div>`;
      console.error('加载段子失败:', err);
    }
  }

  // 发布
  async function postJoke() {
    const content = jokeInput.value.trim();
    if (!content) return;

    postBtn.disabled = true;
    postBtn.textContent = '发布中...';

    try {
      const res = await fetch(`${API_BASE}/api/jokes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (!res.ok) throw new Error('发布失败');
      showToast('发布成功 🎉');
      jokeInput.value = '';
      await loadJokes();
    } catch (err) {
      showToast('发布失败，请重试');
      console.error(err);
    } finally {
      postBtn.disabled = false;
      postBtn.textContent = '发布';
    }
  }

  // 删除
  async function handleDelete(e) {
    const btn = e.target.closest('.joke-delete');
    if (!btn) return;
    if (!confirm('确定删除这条段子？')) return;

    const id = btn.dataset.id;
    try {
      const res = await fetch(`${API_BASE}/api/jokes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('删除失败');
      btn.closest('.joke-card').remove();

      if (document.querySelectorAll('.joke-card').length === 0) {
        jokesList.innerHTML = `
          <div class="jokes-empty">
            <div class="jokes-empty-icon">🤫</div>
            <p>还没有段子，来发一条？</p>
          </div>`;
      }
    } catch (err) {
      showToast('删除失败，请重试');
      console.error(err);
    }
  }

  // 点赞
  async function handleLike(e) {
    const btn = e.target.closest('.joke-like');
    if (!btn) return;

    const id = btn.dataset.id;
    try {
      const res = await fetch(`${API_BASE}/api/jokes/${id}/like`, { method: 'POST' });
      const data = await res.json();
      btn.classList.toggle('liked', data.liked === 1);
      btn.querySelector('svg').setAttribute('fill', data.liked ? 'currentColor' : 'none');
      btn.querySelector('span').textContent = data.likes;
    } catch (err) {
      console.error('点赞失败:', err);
    }
  }

  // 事件
  postBtn.addEventListener('click', postJoke);
  jokesList.addEventListener('click', e => { handleLike(e); handleDelete(e); });
  jokeInput.addEventListener('keydown', e => { if (e.key === 'Enter' && e.ctrlKey) postJoke(); });

  loadJokes();
})();
