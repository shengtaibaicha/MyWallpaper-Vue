import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
// 路由组件
import router from './router'
/* 引入createPinia，用于创建pinia */
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// toast组件
import Toast from 'vue-toastification'
// 引入默认样式
import 'vue-toastification/dist/index.css'

// 懒加载组件
import VueLazyload from 'vue-lazyload'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
app.use(router).use(pinia).use(ElementPlus).mount('#app')
// 注册插件，可配置全局默认选项
app.use(Toast, {
  position: 'top-center', // 默认位置（top-right/top-left/bottom-right等）
  timeout: 3000, // 默认自动关闭时间（毫秒），设为false则不自动关闭
  closeOnClick: true, // 点击通知时关闭
  pauseOnHover: true // 鼠标悬停时暂停计时
})

app.use(VueLazyload, {
  preLoad: 1.3,  // 预加载比例（视口外 1.3 倍高度的图片提前加载）
  error: 'error.png',  // 加载失败时显示的图片
  loading: 'loading1.gif',  // 加载中显示的占位图
  attempt: 1  // 加载失败重试次数
})
