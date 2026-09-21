import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
// 路由组件
import router from './router'
/* 引入createPinia，用于创建pinia */
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// toast组件
import Toast from 'vue-toastification'
// 引入默认样式
import 'vue-toastification/dist/index.css'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
app.use(pinia).use(router)
// 注册插件，可配置全局默认选项
app.use(Toast, {
  position: 'top-center', // 默认位置（top-right/top-left/bottom-right等）
  timeout: 3000, // 默认自动关闭时间（毫秒），设为false则不自动关闭
  closeOnClick: true, // 点击通知时关闭
  pauseOnHover: true // 鼠标悬停时暂停计时
})

app.mount('#app')
