# TOOLS.md - 博客项目工具和经验

## Railway 部署经验

### 教训：问题排查原则
**案例**：photos API 返回 404，我怀疑 Railway 缓存/部署问题，实际上是代码本身就缺接口（/api/photos GET/POST/DELETE 没实现）。

**原则**：
1. **先查代码，后疑部署** — 发现 404 时，先确认代码是否真的实现了对应路由，再怀疑 Railway
2. **看实际响应，不猜结论** — 直接 fetch 验证 API 返回，不凭 commit hash 推断
3. **编辑后验证** — 推代码后要确认实际运行效果

### Railway 排查顺序
1. 看 Deploy Logs 找启动错误
2. 确认端口绑定 (0.0.0.0)
3. 确认依赖安装 (npm install)
4. 确认环境变量 (PORT)
5. API 连通性测试 (curl/fetch)

---

## 项目结构
- `server/` — Node.js 后端（Railway 部署）
- `server/public/` — Railway 静态文件（需手动同步）
- `server/index.js` — 后端入口

## 环境变量
- `DATABASE_URL` — PostgreSQL (Railway)
- `CLOUDINARY_*` — 图片存储
- `ADMIN_SECRET` — 删除操作密码
- `NODE_ENV=production`
- `PORT` — 监听端口

## API 端点
- `/api/photos` — GET(列表) / POST(保存) / DELETE(删除)
- `/api/upload` — POST(上传图片)
- `/api/jokes` — 段子 CRUD

## GitHub 仓库
https://github.com/naitang11/self_blog

## Railway 项目
https://railway.app/project/selfblog
