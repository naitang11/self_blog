(function () {
  const JOKES_FILE = 'articles/jokes.json';
  const STORAGE_KEY = 'blog_jokes_local';

  // DOM
  const jokesList = document.getElementById('jokesList');
  const jokeInput = document.getElementById('jokeInput');
  const postBtn = document.getElementById('postBtn');
  const toast = document.getElementById('toast');

  // 主题切换（从 style.css 复用）
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

  // 获取段子（含本地新增的）
  function getJokes() {
    const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return local;
  }

  // 渲染段子
  function renderJokes(jokes) {
    if (jokes.length === 0) {
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
          <button class="joke-like ${j.liked ? 'liked' : ''}" data-id="${j.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="${j.liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span>${j.likes || 0}</span>
          </button>
        </div>
      </div>
    `).join('');
  }

  // 加载初始数据
  async function loadJokes() {
    try {
      const res = await fetch(JOKES_FILE);
      const fileJokes = await res.json();
      const localJokes = getJokes();

      // 合并：文件里的 + 本地新增的（去重）
      const fileIds = new Set(fileJokes.map(j => j.id));
      const newOnes = localJokes.filter(j => !fileIds.has(j.id));
      const merged = [...fileJokes, ...newOnes].sort((a, b) => new Date(b.date) - new Date(a.date));

      renderJokes(merged);
    } catch {
      // 文件加载失败，只显示本地
      renderJokes(getJokes());
    }
  }

  // 发布
  async function postJoke() {
    const content = jokeInput.value.trim();
    if (!content) return;

    postBtn.disabled = true;
    postBtn.textContent = '发布中...';

    const newJoke = {
      id: Date.now(),
      content,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      liked: false,
      isLocal: true
    };

    // 保存到 localStorage
    const local = getJokes();
    local.unshift(newJoke);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(local));

    // 更新 UI
    jokeInput.value = '';
    renderJokes(local);
    showToast('发布成功 🎉');

    postBtn.disabled = false;
    postBtn.textContent = '发布';

    // 尝试追加到文件（可选，失败无所谓）
    try {
      const res = await fetch(JOKES_FILE);
      const fileJokes = await res.json();
      fileJokes.push({ ...newJoke, isLocal: undefined });
      // 注意：浏览器无法直接写文件，这里只是预留接口
      // 实际需要服务端支持才能真正写入文件
    } catch (_) {
      // ignore
    }
  }

  // 点赞
  function handleLike(e) {
    const btn = e.target.closest('.joke-like');
    if (!btn) return;
    const id = parseInt(btn.dataset.id);
    const local = getJokes();
    const joke = local.find(j => j.id === id);
    if (!joke) return;

    joke.liked = !joke.liked;
    joke.likes = (joke.likes || 0) + (joke.liked ? 1 : -1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(local));

    btn.classList.toggle('liked', joke.liked);
    btn.querySelector('svg').setAttribute('fill', joke.liked ? 'currentColor' : 'none');
    btn.querySelector('span').textContent = joke.likes;
  }

  // 工具
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // 事件
  postBtn.addEventListener('click', postJoke);
  jokesList.addEventListener('click', handleLike);

  jokeInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.ctrlKey) postJoke();
  });

  // 启动
  loadJokes();
})();
