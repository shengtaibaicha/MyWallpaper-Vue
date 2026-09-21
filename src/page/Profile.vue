<template>
  <main class="page-shell profile-page">
    <section class="identity surface">
      <div class="avatar" aria-hidden="true">{{ initial }}</div>
      <div class="identity__copy">
        <p>MY LIBRARY</p>
        <h1>{{ profile?.userName || '个人中心' }}</h1>
        <span>{{ profile?.userEmail }} · 加入于 {{ joinedAt }}</span>
      </div>
      <button class="button-secondary" type="button" @click="logout">退出登录</button>
    </section>

    <section class="stats" aria-label="账户统计">
      <StatCard label="已上传" :value="profile?.uploadNumber ?? 0" hint="包含待审核作品" />
      <StatCard label="已收藏" :value="profile?.collectNumber ?? 0" hint="你的灵感清单" />
      <StatCard label="已下载" :value="profile?.downloadNumber ?? 0" hint="保存到本地的次数" />
    </section>

    <section class="library" aria-labelledby="library-title">
      <div class="section-heading">
        <div>
          <p>YOUR WORK</p>
          <h2 id="library-title">上传的壁纸</h2>
        </div>
        <RouterLink class="button-primary upload-link" to="/upload">上传新作品</RouterLink>
      </div>

      <LoadingGrid v-if="loading" :count="8" />
      <EmptyState v-else-if="errorMessage" title="个人资料加载失败" :description="errorMessage" action-label="重试" @action="initialize" />
      <EmptyState v-else-if="wallpapers.length === 0" title="还没有上传作品" description="你的第一张壁纸会从这里开始。" action-label="去上传" @action="router.push('/upload')" />
      <div v-else class="gallery-grid">
        <div v-for="wallpaper in wallpapers" :key="wallpaper.fileId" class="profile-card">
          <span class="status-chip" :class="{ 'status-chip--approved': wallpaper.status === '已审核' }">{{ wallpaper.status }}</span>
          <WallpaperCard :wallpaper="wallpaper" :favorite-enabled="false" @preview="preview = $event" />
        </div>
      </div>
      <AppPagination :current="currentPage" :pages="totalPages" @change="changePage" />
    </section>

    <WallpaperPreview
      :wallpaper="preview"
      show-delete
      @close="preview = null"
      @download="downloadWallpaper"
      @delete="deleteSelected"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import { Download, deleteWallpaper, getUserWallpapers } from '../api/File'
import { getUserInfo } from '../api/User'
import AppPagination from '../components/AppPagination.vue'
import EmptyState from '../components/EmptyState.vue'
import LoadingGrid from '../components/LoadingGrid.vue'
import StatCard from '../components/StatCard.vue'
import WallpaperCard from '../components/WallpaperCard.vue'
import WallpaperPreview from '../components/WallpaperPreview.vue'
import { useUserStore } from '../store/useUser'
import type { UserInfo, Wallpaper } from '../types/api'
import { triggerBlobDownload } from '../utils/download'
import { getErrorMessage } from '../utils/errors'

const store = useUserStore()
const router = useRouter()
const toast = useToast()
const profile = ref<UserInfo | null>(null)
const wallpapers = ref<Wallpaper[]>([])
const preview = ref<Wallpaper | null>(null)
const currentPage = ref(1)
const totalPages = ref(0)
const pageSize = 10
const loading = ref(true)
const errorMessage = ref('')
const initial = computed(() => (profile.value?.userName.trim().charAt(0) || '白').toUpperCase())
const joinedAt = computed(() => profile.value?.joinDate ? new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long' }).format(new Date(profile.value.joinDate)) : '—')

// loadProfile 加载用户资料并同步导航所需快照。
async function loadProfile(): Promise<void> {
  const data = (await getUserInfo()).data.data
  profile.value = data
  store.setUser({ userName: data.userName, role: data.role, userAvatar: data.userAvatar })
}

// loadWallpapers 加载当前用户上传作品分页。
async function loadWallpapers(): Promise<void> {
  const page = (await getUserWallpapers(currentPage.value, pageSize)).data.data
  wallpapers.value = page.records
  currentPage.value = page.current
  totalPages.value = page.pages
}

// initialize 初始化个人资料和作品列表。
async function initialize(): Promise<void> {
  loading.value = true
  errorMessage.value = ''
  try {
    await Promise.all([loadProfile(), loadWallpapers()])
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    loading.value = false
  }
}

// changePage 切换个人作品页码。
function changePage(page: number): void {
  currentPage.value = page
  void initialize()
}

// downloadWallpaper 下载当前预览的原始文件。
async function downloadWallpaper(wallpaper: Wallpaper): Promise<void> {
  try {
    const response = await Download(wallpaper.fileName)
    triggerBlobDownload(response.data, response.headers['content-disposition'] as string | undefined)
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

// deleteSelected 确认后删除作品并刷新资料统计。
async function deleteSelected(wallpaper: Wallpaper): Promise<void> {
  if (!window.confirm(`确定删除“${wallpaper.fileTitle}”吗？此操作无法撤销。`)) return
  try {
    await deleteWallpaper(wallpaper.fileId)
    preview.value = null
    toast.success('壁纸已删除')
    await initialize()
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

// logout 清除会话并返回首页。
function logout(): void {
  store.clearSession()
  void router.push('/home')
}

onMounted(initialize)
</script>

<style scoped>
.identity { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 22px; align-items: center; padding: 28px; }
.avatar { width: 88px; height: 88px; display: grid; place-items: center; border-radius: 28px; color: #fff; background: linear-gradient(145deg, #1b1d22, #4b5361); font-size: 34px; font-weight: 700; box-shadow: inset 0 1px rgb(255 255 255 / 20%); }
.identity__copy { min-width: 0; }
.identity__copy p,
.section-heading p { margin: 0 0 8px; color: var(--color-accent); font-size: 11px; font-weight: 750; letter-spacing: .16em; }
.identity__copy h1 { margin: 0 0 7px; font-size: 32px; letter-spacing: -.04em; }
.identity__copy span { color: var(--color-muted); }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 20px 0 56px; }
.section-heading { display: flex; align-items: end; justify-content: space-between; gap: 16px; margin-bottom: 22px; }
.section-heading h2 { margin: 0; font-size: 30px; letter-spacing: -.04em; }
.upload-link { display: inline-flex; align-items: center; color: #fff; text-decoration: none; }
.profile-card { min-width: 0; position: relative; }
.status-chip { position: absolute; top: 10px; left: 10px; z-index: 2; border-radius: var(--radius-pill); padding: 6px 9px; color: #795f23; background: rgb(255 241 199 / 92%); backdrop-filter: blur(10px); font-size: 11px; font-weight: 700; }
.status-chip--approved { color: #25633d; background: rgb(220 246 229 / 92%); }
@media (max-width: 700px) { .identity { grid-template-columns: auto 1fr; padding: 20px; } .identity > button { grid-column: 1 / -1; } .avatar { width: 68px; height: 68px; border-radius: 21px; } .stats { grid-template-columns: 1fr; margin-bottom: 40px; } }
@media (max-width: 420px) { .section-heading { align-items: stretch; flex-direction: column; } .upload-link { justify-content: center; } }
</style>
