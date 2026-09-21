<template>
  <div class="app-shell">
    <AppHeader />
    <main class="app-main">
      <RouterView @refresh="handleRefresh" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'

import AppHeader from './components/AppHeader.vue'

const router = useRouter()

// handleRefresh 通过客户端路由返回首页，避免整页重新加载。
function handleRefresh(): void {
  void router.push('/home')
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.app-main {
  min-height: calc(100vh - 68px);
}

@media (max-width: 700px) {
  .app-main {
    min-height: calc(100vh - 58px);
    padding-bottom: 76px;
  }
}
</style>
