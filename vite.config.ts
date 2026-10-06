import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // 将接口和媒体请求转发到本地 Go 网关，保留 /wallpaper 路径。
      '/wallpaper': {
        target: 'http://127.0.0.1:8888',
        changeOrigin: true,
      },
    },
  },
})
