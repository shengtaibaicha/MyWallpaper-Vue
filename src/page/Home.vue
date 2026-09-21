<template>
  <div class="page-shell home-page">
    <section class="hero" aria-labelledby="hero-title">
      <p class="hero__eyebrow">CURATED FOR YOUR SCREEN</p>
      <h1 id="hero-title">给日常一点留白。</h1>
      <p>精选自然、建筑与抽象影像，为你的每一块屏幕找到恰到好处的背景。</p>
      <label class="search-box">
        <span aria-hidden="true">⌕</span>
        <span class="sr-only">搜索壁纸</span>
        <input v-model="searchQuery" type="search" placeholder="搜索你想看到的画面" autocomplete="off">
        <button v-if="searchQuery" type="button" aria-label="清空搜索" @click="searchQuery = ''">×</button>
      </label>
    </section>

    <section class="catalog" aria-label="壁纸画廊">
      <div class="catalog__bar">
        <div class="category-list" aria-label="壁纸分类">
          <button type="button" :class="{ active: selectedTag === null }" @click="selectTag(null)">全部</button>
          <button v-for="tag in tags" :key="tag.tagId" type="button" :class="{ active: selectedTag === tag.tagId }" @click="selectTag(tag.tagId)">
            {{ tag.tagName }}
          </button>
        </div>
        <span class="catalog__count">{{ total }} 张作品</span>
      </div>

      <LoadingGrid v-if="loading" />
      <EmptyState
        v-else-if="errorMessage"
        title="画廊暂时没有加载出来"
        :description="errorMessage"
        action-label="重新加载"
        @action="loadWallpapers"
      />
      <EmptyState
        v-else-if="wallpapers.length === 0"
        title="没有找到匹配的壁纸"
        description="试试其他关键词或分类。"
        action-label="查看全部"
        @action="resetFilters"
      />
      <div v-else class="gallery-grid">
        <WallpaperCard
          v-for="wallpaper in wallpapers"
          :key="wallpaper.fileId"
          :wallpaper="wallpaper"
          @preview="preview = $event"
          @favorite="handleFavorite"
        />
      </div>

      <AppPagination :current="currentPage" :pages="totalPages" @change="changePage" />
    </section>

    <WallpaperPreview :wallpaper="preview" @close="preview = null" @download="downloadWallpaper" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import { Download, getCollections, getImagesPage, getImagesPageName, toggleFavorite } from '../api/File'
import { getImagesPageByTag, getTags } from '../api/Tag'
import { getUserInfo } from '../api/User'
import AppPagination from '../components/AppPagination.vue'
import EmptyState from '../components/EmptyState.vue'
import LoadingGrid from '../components/LoadingGrid.vue'
import WallpaperCard from '../components/WallpaperCard.vue'
import WallpaperPreview from '../components/WallpaperPreview.vue'
import { useUserStore } from '../store/useUser'
import type { Tag, Wallpaper } from '../types/api'
import { triggerBlobDownload } from '../utils/download'
import { getErrorMessage } from '../utils/errors'

const store = useUserStore()
const router = useRouter()
const route = useRoute()
const toast = useToast()
const wallpapers = ref<Wallpaper[]>([])
const tags = ref<Tag[]>([])
const collectionIDs = ref(new Set<string>())
const selectedTag = ref<number | null>(null)
const searchQuery = ref('')
const currentPage = ref(1)
const totalPages = ref(0)
const total = ref(0)
const pageSize = 15
const loading = ref(true)
const errorMessage = ref('')
const preview = ref<Wallpaper | null>(null)
let searchTimer: ReturnType<typeof setTimeout> | undefined
let requestSequence = 0

// mergeCollections 将当前用户收藏集合合并到公开壁纸数据。
function mergeCollections(records: Wallpaper[]): Wallpaper[] {
  return records.map((wallpaper) => ({ ...wallpaper, collect: collectionIDs.value.has(wallpaper.fileId) }))
}

// loadWallpapers 根据搜索、标签与页码加载当前画廊。
async function loadWallpapers(): Promise<void> {
  const sequence = ++requestSequence
  loading.value = true
  errorMessage.value = ''
  try {
    const query = searchQuery.value.trim()
    const response = query
      ? await getImagesPageName(currentPage.value, pageSize, query)
      : selectedTag.value !== null
        ? await getImagesPageByTag(currentPage.value, pageSize, selectedTag.value)
        : await getImagesPage(currentPage.value, pageSize)
    if (sequence !== requestSequence) return
    const page = response.data.data
    wallpapers.value = mergeCollections(page.records)
    currentPage.value = page.current
    totalPages.value = page.pages
    total.value = page.total
  } catch (error) {
    if (sequence === requestSequence) {
      wallpapers.value = []
      errorMessage.value = '暂时无法连接壁纸服务，请稍后重试。'
    }
  } finally {
    if (sequence === requestSequence) loading.value = false
  }
}

// loadTags 加载公开分类，失败时保留“全部”入口。
async function loadTags(): Promise<void> {
  try {
    tags.value = (await getTags()).data.data
  } catch {
    tags.value = []
  }
}

// confirmSession 向服务端确认会话并加载用户收藏。
async function confirmSession(): Promise<void> {
  if (!store.isAuthenticated) return
  try {
    const info = (await getUserInfo()).data.data
    store.setUser({ userName: info.userName, role: info.role, userAvatar: info.userAvatar })
    const ids = (await getCollections()).data.data.fileIds
    collectionIDs.value = new Set(ids)
  } catch {
    store.clearSession()
    collectionIDs.value.clear()
  }
}

// selectTag 切换分类并从第一页重新加载。
function selectTag(tagID: number | null): void {
  selectedTag.value = selectedTag.value === tagID && tagID !== null ? null : tagID
  searchQuery.value = ''
  currentPage.value = 1
  void loadWallpapers()
}

// resetFilters 清空搜索与分类条件。
function resetFilters(): void {
  searchQuery.value = ''
  selectedTag.value = null
  currentPage.value = 1
  void loadWallpapers()
}

// changePage 切换页码并滚动画廊顶部。
function changePage(page: number): void {
  currentPage.value = page
  void loadWallpapers()
  window.scrollTo({ top: 360, behavior: 'smooth' })
}

// handleFavorite 登录后切换收藏并同步本地集合。
async function handleFavorite(wallpaper: Wallpaper): Promise<void> {
  if (!store.isAuthenticated) {
    await router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  try {
    await toggleFavorite(wallpaper.fileId)
    if (collectionIDs.value.has(wallpaper.fileId)) collectionIDs.value.delete(wallpaper.fileId)
    else collectionIDs.value.add(wallpaper.fileId)
    wallpaper.collect = collectionIDs.value.has(wallpaper.fileId)
    toast.success(wallpaper.collect ? '已加入收藏' : '已取消收藏')
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

// downloadWallpaper 下载原图并确保释放浏览器临时地址。
async function downloadWallpaper(wallpaper: Wallpaper): Promise<void> {
  if (!store.isAuthenticated) {
    preview.value = null
    await router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  try {
    const response = await Download(wallpaper.fileName)
    triggerBlobDownload(response.data, response.headers['content-disposition'] as string | undefined)
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

watch(searchQuery, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    selectedTag.value = null
    currentPage.value = 1
    void loadWallpapers()
  }, 320)
})

onMounted(async () => {
  await Promise.all([loadTags(), confirmSession()])
  await loadWallpapers()
})

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<style scoped>
.home-page { padding-top: 0; }
.hero { max-width: 820px; margin: 0 auto; padding: 88px 0 74px; text-align: center; }
.hero__eyebrow { margin: 0 0 18px; color: var(--color-accent); font-size: 12px; font-weight: 750; letter-spacing: 0.16em; }
.hero h1 { margin: 0; font-size: clamp(42px, 7vw, 78px); line-height: 0.98; letter-spacing: -0.055em; }
.hero > p:not(.hero__eyebrow) { max-width: 620px; margin: 24px auto 32px; color: var(--color-muted); font-size: clamp(16px, 2vw, 20px); line-height: 1.7; }
.search-box { max-width: 560px; height: 58px; margin: 0 auto; display: flex; align-items: center; gap: 12px; border: 1px solid var(--color-border); border-radius: var(--radius-pill); padding: 0 18px; background: rgb(255 255 255 / 86%); box-shadow: var(--shadow-sm); }
.search-box > span:first-child { color: var(--color-muted); font-size: 26px; transform: rotate(-20deg); }
.search-box input { min-width: 0; flex: 1; border: 0; outline: 0; color: var(--color-text); background: transparent; font-size: 16px; }
.search-box button { width: 32px; height: 32px; border: 0; border-radius: 50%; color: var(--color-muted); background: var(--color-surface-soft); cursor: pointer; }
.catalog__bar { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 24px; }
.category-list { display: flex; gap: 8px; overflow-x: auto; padding: 4px; scrollbar-width: none; }
.category-list::-webkit-scrollbar { display: none; }
.category-list button { flex: 0 0 auto; min-height: 40px; border: 1px solid var(--color-border); border-radius: var(--radius-pill); padding: 0 16px; color: var(--color-muted); background: rgb(255 255 255 / 72%); cursor: pointer; }
.category-list button.active { border-color: #17191d; color: #fff; background: #17191d; }
.catalog__count { flex: 0 0 auto; color: var(--color-muted); font-size: 13px; }
@media (max-width: 640px) {
  .hero { padding: 58px 8px 46px; }
  .hero h1 { font-size: 46px; }
  .hero h1 { overflow-wrap: anywhere; font-size: clamp(36px, 10.5vw, 42px); line-height: 1.08; }
  .hero > p:not(.hero__eyebrow) { margin-block: 18px 25px; font-size: 15px; }
  .catalog__bar { align-items: flex-start; flex-direction: column; gap: 10px; }
  .category-list { width: calc(100vw - 20px); margin-left: -4px; }
  .catalog__count { padding-left: 4px; }
}
</style>
