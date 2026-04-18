'use strict';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3001'
  : '';

// 图片数据（内存存储，上传时添加到数组）
let photos = [];
let currentIndex = 0;

// DOM 元素
const $ = id => document.getElementById(id);
const uploadZone = $('uploadZone');
const fileInput = $('fileInput');
const uploadStatus = $('uploadStatus');
const photoGrid = $('photoGrid');
const photoCount = $('photoCount');
const emptyState = $('emptyState');
const lightbox = $('lightbox');
const lightboxImg = $('lightboxImg');
const lightboxInfo = $('lightboxInfo');
const lightboxClose = $('lightboxClose');
const lightboxPrev = $('lightboxPrev');
const lightboxNext = $('lightboxNext');
const toast = $('toast');

// ==================== 工具函数 ====================

function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getToday() {
  return formatDate(new Date());
}

// ==================== 上传功能 ====================

function initUpload() {
  // 点击上传
  uploadZone.addEventListener('click', () => fileInput.click());

  // 文件选择
  fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) handleUpload(file);
  });

  // 拖拽上传
  uploadZone.addEventListener('dragover', e => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
  });

  uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleUpload(file);
    } else {
      showToast('请上传图片文件', 'error');
    }
  });
}

async function handleUpload(file) {
  if (file.size > 10 * 1024 * 1024) {
    showToast('图片太大，最大支持 10MB', 'error');
    return;
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    showToast('不支持的图片格式', 'error');
    return;
  }

  uploadStatus.innerHTML = `<span class="progress"><span class="progress-bar" id="uploadProgress"></span></span> 上传中...`;
  uploadStatus.className = 'upload-status';

  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || '上传失败');
    }

    const data = await res.json();

    // 添加到本地数据
    const photo = {
      id: Date.now(),
      url: data.url,
      public_id: data.public_id || null,
      filename: file.name,
      date: getToday(),
      width: data.width,
      height: data.height,
    };
    photos.unshift(photo);
    savePhotos();
    renderPhotos();

    uploadStatus.innerHTML = '✅ 上传成功！';
    uploadStatus.className = 'upload-status success';
    showToast('上传成功！');

    // 清空 input
    fileInput.value = '';

    // 3秒后清除状态
    setTimeout(() => {
      uploadStatus.innerHTML = '';
    }, 3000);
  } catch (err) {
    uploadStatus.innerHTML = `❌ ${err.message}`;
    uploadStatus.className = 'upload-status error';
    showToast(err.message, 'error');
  }
}

// ==================== 照片管理 ====================

function loadPhotos() {
  try {
    const saved = localStorage.getItem('blog_photos');
    if (saved) {
      photos = JSON.parse(saved);
    }
  } catch (e) {
    console.error('加载图片失败:', e);
  }
}

function savePhotos() {
  try {
    localStorage.setItem('blog_photos', JSON.stringify(photos));
  } catch (e) {
    console.error('保存图片失败:', e);
  }
}

function renderPhotos() {
  photoCount.textContent = `${photos.length} 张`;

  if (photos.length === 0) {
    photoGrid.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  photoGrid.innerHTML = photos.map((photo, index) => `
    <div class="photo-card" data-index="${index}">
      <img src="${photo.url}" alt="${photo.filename}" loading="lazy">
      <div class="photo-card-info">
        <span class="photo-date">${photo.date}</span>
        <button class="photo-delete" data-index="${index}" title="删除">🗑️</button>
      </div>
    </div>
  `).join('');

  // 绑定点击事件
  photoGrid.querySelectorAll('.photo-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.classList.contains('photo-delete')) {
        e.stopPropagation();
        return;
      }
      openLightbox(parseInt(card.dataset.index));
    });
  });

  photoGrid.querySelectorAll('.photo-delete').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      deletePhoto(parseInt(btn.dataset.index));
    });
  });
}

async function deletePhoto(index) {
  const photo = photos[index];
  if (!photo) return;

  if (!confirm('确定要删除这张图片吗？')) return;

  try {
    // 如果有 public_id，尝试从 Cloudinary 删除
    if (photo.public_id) {
      const res = await fetch(`${API_BASE}/api/upload/${photo.public_id}`, {
        method: 'DELETE',
        headers: { 'x-admin-secret': prompt('请输入管理员密钥：') || '' },
      });
      if (!res.ok && res.status !== 400) {
        // 400 表示未配置 Cloudinary，非致命错误
        throw new Error('删除失败');
      }
    }

    photos.splice(index, 1);
    savePhotos();
    renderPhotos();
    showToast('已删除');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ==================== 灯箱预览 ====================

function openLightbox(index) {
  currentIndex = index;
  updateLightbox();
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function updateLightbox() {
  const photo = photos[currentIndex];
  if (!photo) return;

  lightboxImg.src = photo.url;
  lightboxImg.alt = photo.filename;
  lightboxInfo.textContent = `${photo.date} · ${photo.filename}`;

  lightboxPrev.style.display = currentIndex > 0 ? '' : 'none';
  lightboxNext.style.display = currentIndex < photos.length - 1 ? '' : 'none';
}

function initLightbox() {
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateLightbox();
    }
  });
  lightboxNext.addEventListener('click', () => {
    if (currentIndex < photos.length - 1) {
      currentIndex++;
      updateLightbox();
    }
  });

  // ESC 关闭
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
    if (e.key === 'ArrowLeft' && lightbox.classList.contains('active') && currentIndex > 0) {
      currentIndex--;
      updateLightbox();
    }
    if (e.key === 'ArrowRight' && lightbox.classList.contains('active') && currentIndex < photos.length - 1) {
      currentIndex++;
      updateLightbox();
    }
  });

  // 点击背景关闭
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
}

// ==================== 主题切换 ====================

function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    $('themeIcon').textContent = '☀️';
  }
}

$('themeToggle').addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  $('themeIcon').textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
});

// ==================== 初始化 ====================

function init() {
  initTheme();
  loadPhotos();
  renderPhotos();
  initUpload();
  initLightbox();
}

document.addEventListener('DOMContentLoaded', init);
