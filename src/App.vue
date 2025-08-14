<template>
  <div class="app-container">
    <header class="header">
      <div class="header-content">
        <RouterLink replace to="/" class="title-link">
          <h1 class="title">生态白茶壁纸站</h1>
        </RouterLink>
        <div class="auth-buttons">
          <RouterLink  v-if="!login" to="/upload" class="btn upload-btn">上传</RouterLink>
          <RouterLink v-if="login" replace to="/login" class="btn login-btn">登录</RouterLink>
          <RouterLink v-if="!login" replace to="/profile" class="btn login-btn">已登录</RouterLink>
          <RouterLink v-if="login" replace to="/register" class="btn register-btn">注册</RouterLink>
        </div>
      </div>
    </header>
    <main class="main-content">
      <router-view @refresh="handleRefresh"/>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useUserStore } from './store/useUser';
import { useRouter } from 'vue-router';

const login = ref(true)
const router = useRouter()

const handleRefresh = async () => {
  // 执行刷新逻辑（例如重新获取数据）
  await router.replace("/")
  location.reload() // 刷新整个页面
}

const store = useUserStore()
onMounted(() => {
  if (store.token == '') {
    login.value = true
  } else {
    login.value = false
  }
})
</script>

<style scoped>
.app-container {
  width: 100%; 
  margin: 0;
  padding: 0;
  background: linear-gradient(to right, #e6f7ff, #b3e0ff); /* 浅蓝色渐变背景 */
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-areas: 
    "header"
    "main";
}

.header {
  grid-area: header;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #eee;
  padding: 10px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  min-height: 70px;
}

.title-link {
  text-decoration: none;
}

.title {
  text-align: left;
  color: #2c3e50; 
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.auth-buttons {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.login-btn {
  background-color: transparent;
  color: #42b983;
  border: 1px solid #42b983;
}

.login-btn:hover {
  background-color: rgba(66, 185, 131, 0.1);
}

.register-btn {
  background-color: #42b983;
  color: white;
  border: 1px solid #42b983;
}

.upload-btn {
  background-color: #409eff;
  color: white;
  border: 3px solid #2860b3 !important;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.3);
  outline: none;
  border-radius: 4px;
}

.upload-btn:hover {
  background-color: #337ecc;
  border-color: #337ecc;
}

.register-btn:hover {
  background-color: #359469;
}

@media (max-width: 768px) {
  .app-container {
    padding: 0;
  }
  
  .header-content {
    padding: 10px;
    min-height: 60px;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .title {
    font-size: 1.2rem;
  }
  
  .auth-buttons {
    gap: 5px;
    align-self: flex-end;
    margin-top: 5px;
  }
  
  .btn {
    padding: 6px 12px;
    font-size: 0.7rem;
  }
  
  .main-content {
    padding: 8px;
  }
}
</style>
