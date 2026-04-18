# 功能文档 (function.md)

本文档记录博客的所有功能模块，便于维护和开发参考。

---

## 📷 图片集 (Photos Gallery)

### 功能概述
图片上传与展示功能，基于 Cloudinary 对象存储，支持拖拽上传、网格展示、灯箱预览。

### 技术栈
- **前端**：Vanilla JS + CSS Grid
- **后端**：Node.js + Express + Multer + Cloudinary SDK
- **存储**：Cloudinary（云端对象存储）

### 文件结构
```
├── photos.html          # 图片集页面
├── js/photos.js         # 前端逻辑
├── css/photos.css       # 页面样式
└── server/index.js      # 后端上传接口
```

### API 端点

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/api/upload` | 上传图片 | 无 |
| DELETE | `/api/upload/:publicId` | 删除图片 | 需管理员密钥 |

### 请求示例

**上传图片**
```bash
curl -X POST https://selfblog-production.up.railway.app/api/upload \
  -F "image=@photo.jpg"
```

**响应**
```json
{
  "url": "https://res.cloudinary.com/xxx/image/upload/vxxx/photo.jpg",
  "public_id": "blog_photos/xxx",
  "width": 1920,
  "height": 1080
}
```

### 环境变量

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary 云名称 |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API Secret |

### 功能特性
- [x] 拖拽上传
- [x] 点击上传
- [x] 图片网格展示
- [x] 灯箱大图预览（支持键盘导航）
- [x] 删除图片
- [x] 响应式布局
- [x] 主题切换适配

### 数据存储
- **元数据**：LocalStorage（本地浏览器）
- **图片文件**：Cloudinary CDN

> 注意：元数据存储在浏览器 LocalStorage 中，清除浏览器缓存会导致数据丢失。图片文件本身存储在 Cloudinary，不受影响。

### 相关链接
- Cloudinary 控制台：https://cloudinary.com/console
- 在线地址：https://selfblog-production.up.railway.app/photos.html

---

## 🎭 段子屋 (Jokes)

### 功能概述
段子展示与互动功能，支持点赞和后台管理。

### 技术栈
- **前端**：Vanilla JS + CSS
- **后端**：Node.js + Express + PostgreSQL
- **存储**：Railway PostgreSQL

### API 端点

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/jokes` | 获取所有段子 |
| POST | `/api/jokes` | 发布段子 |
| POST | `/api/jokes/:id/like` | 点赞 |
| DELETE | `/api/jokes/:id` | 删除段子 |

### 数据库表

**jokes**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| content | TEXT | 段子内容 |
| likes | INTEGER | 点赞数 |
| created_at | TIMESTAMP | 创建时间 |

**joke_likes**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| joke_id | INTEGER | 外键 |
| ip_address | VARCHAR | 用户 IP |
| created_at | TIMESTAMP | 点赞时间 |

### 相关链接
- 在线地址：https://selfblog-production.up.railway.app/jokes.html

---

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2026-04-18 | v2.0 | 新增图片集功能，支持 Cloudinary 上传 |

---
