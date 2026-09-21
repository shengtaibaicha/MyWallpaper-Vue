<template>
  <header class="app-header">
    <div class="app-header__inner">
      <RouterLink class="brand" to="/home" aria-label="白茶壁纸首页">
        <span class="brand__mark" aria-hidden="true">白</span>
        <span class="brand__name">白茶壁纸</span>
      </RouterLink>

      <nav class="primary-nav" aria-label="主导航">
        <RouterLink to="/home">发现</RouterLink>
        <RouterLink v-if="store.isAuthenticated" to="/upload">上传</RouterLink>
        <RouterLink v-if="isAdmin" to="/admin">管理</RouterLink>
      </nav>

      <div class="account-actions">
        <template v-if="store.isAuthenticated">
          <RouterLink class="profile-link" to="/profile">{{ store.user?.userName || '个人中心' }}</RouterLink>
          <button class="text-button" type="button" @click="logout">退出</button>
        </template>
        <template v-else>
          <RouterLink class="text-link" to="/login">登录</RouterLink>
          <RouterLink class="primary-link" to="/register">创建账号</RouterLink>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { useUserStore } from '../store/useUser'

const store = useUserStore()
const router = useRouter()
const isAdmin = computed(() => store.user?.role === 'admin' || store.user?.role === 'superAdmin')

// logout 清空本地会话并返回首页。
function logout(): void {
  store.clearSession()
  void router.push('/home')
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid rgb(20 24 31 / 8%);
  background: rgb(250 250 248 / 82%);
  backdrop-filter: saturate(180%) blur(22px);
}

.app-header__inner {
  width: min(100% - 32px, 1240px);
  min-height: 68px;
  margin-inline: auto;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 24px;
}

.brand,
.primary-nav,
.account-actions {
  display: flex;
  align-items: center;
}

.brand {
  width: fit-content;
  gap: 10px;
  color: #161719;
  text-decoration: none;
  font-weight: 680;
  letter-spacing: -0.02em;
}

.brand__mark {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  color: white;
  background: #17191d;
  font-size: 14px;
}

.primary-nav {
  gap: 8px;
}

.primary-nav a,
.text-link,
.profile-link,
.text-button {
  border: 0;
  border-radius: 999px;
  padding: 9px 13px;
  color: #64676e;
  background: transparent;
  text-decoration: none;
  font: inherit;
  cursor: pointer;
}

.primary-nav a:hover,
.primary-nav a.router-link-active,
.text-link:hover,
.profile-link:hover,
.text-button:hover {
  color: #17191d;
  background: rgb(22 23 25 / 6%);
}

.account-actions {
  justify-content: flex-end;
  gap: 4px;
  white-space: nowrap;
}

.primary-link {
  border-radius: 999px;
  padding: 10px 16px;
  color: white;
  background: #1769e0;
  text-decoration: none;
  font-weight: 620;
}

a:focus-visible,
button:focus-visible {
  outline: 3px solid rgb(23 105 224 / 28%);
  outline-offset: 2px;
}

@media (max-width: 700px) {
  .app-header__inner {
    width: min(100% - 20px, 1240px);
    min-height: 58px;
    grid-template-columns: 1fr auto;
    gap: 8px;
  }

  .brand__name,
  .profile-link,
  .text-button {
    display: none;
  }

  .primary-nav {
    position: fixed;
    left: 50%;
    bottom: 12px;
    transform: translateX(-50%);
    z-index: 60;
    padding: 6px;
    border: 1px solid rgb(20 24 31 / 10%);
    border-radius: 999px;
    background: rgb(255 255 255 / 92%);
    box-shadow: 0 12px 36px rgb(23 27 34 / 14%);
    backdrop-filter: blur(18px);
  }

  .account-actions {
    grid-column: 2;
  }
}
</style>
