# 白茶壁纸前端

Vue 3、TypeScript 与 Vite 构建的浅色响应式壁纸站。

## 本地开发

```bash
npm ci
npm run dev
```

生产构建：

```bash
npm run build
```

前端使用同源 `/wallpaper/*` API 与媒体地址。部署时请由 Web 服务器把该路径反向代理到 Go Gateway HTTP 服务；不要向浏览器公开 User RPC、File RPC、MySQL、Redis 或 MinIO 端口。开发环境如需跨端口运行，也应通过 Vite 或本地反向代理保持 `/wallpaper` 路径不变。
