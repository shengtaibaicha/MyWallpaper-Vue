<template>
  <main class="page-shell admin-page">
    <header class="admin-header">
      <div>
        <p>CONTROL CENTER</p>
        <h1>内容与用户管理</h1>
        <span>审核公开内容，维护社区账号状态。</span>
      </div>
      <div class="summary-cards">
        <StatCard label="文件总数" :value="fileTotal" />
        <StatCard label="用户总数" :value="userTotal" />
      </div>
    </header>

    <nav class="workspace-tabs" aria-label="管理模块">
      <button type="button" :class="{ active: activeTab === 'files' }" @click="switchTab('files')">文件管理</button>
      <button type="button" :class="{ active: activeTab === 'users' }" @click="switchTab('users')">用户管理</button>
    </nav>

    <section v-if="activeTab === 'files'" aria-labelledby="files-title">
      <div class="toolbar surface">
        <div class="segmented" aria-label="审核状态筛选">
          <button v-for="option in fileFilters" :key="option.value" type="button" :class="{ active: fileFilter === option.value }" @click="setFileFilter(option.value)">{{ option.label }}</button>
        </div>
        <label class="toolbar-search">
          <span class="sr-only">搜索当前页文件</span>
          <input v-model="fileSearch" class="field" type="search" placeholder="搜索当前页文件名">
        </label>
      </div>

      <LoadingGrid v-if="fileLoading" :count="8" />
      <EmptyState v-else-if="fileError" title="文件列表加载失败" :description="fileError" action-label="重试" @action="loadFiles" />
      <EmptyState v-else-if="visibleFiles.length === 0" title="没有匹配的文件" description="调整筛选条件或搜索词后再试。" />
      <div v-else class="admin-file-grid">
        <article v-for="wallpaper in visibleFiles" :key="wallpaper.fileId" class="admin-file-card">
          <div class="admin-file-card__visual">
            <img :src="mediaUrl(wallpaper.fileId, 'thumbnail')" :alt="wallpaper.fileTitle" loading="lazy">
            <StatusBadge :status="wallpaper.status" />
          </div>
          <div class="admin-file-card__body">
            <strong>{{ wallpaper.fileTitle }}</strong>
            <span>{{ formatDate(wallpaper.uploadTime) }} · {{ formatBytes(wallpaper.fileSize) }}</span>
            <div class="card-actions">
              <button type="button" @click="preview = wallpaper">预览</button>
              <button type="button" @click="requestAudit(wallpaper)">{{ wallpaper.status === '已审核' ? '撤回审核' : '通过审核' }}</button>
              <button class="danger-text" type="button" @click="requestDelete(wallpaper)">删除</button>
            </div>
          </div>
        </article>
      </div>
      <AppPagination :current="filePage" :pages="filePages" @change="changeFilePage" />
    </section>

    <section v-else aria-labelledby="users-title">
      <div class="toolbar surface">
        <div class="segmented" aria-label="用户角色筛选">
          <button v-for="option in userFilters" :key="option.value" type="button" :class="{ active: userFilter === option.value }" @click="setUserFilter(option.value)">{{ option.label }}</button>
        </div>
        <label class="toolbar-search">
          <span class="sr-only">搜索当前页用户</span>
          <input v-model="userSearch" class="field" type="search" placeholder="搜索当前页用户名或邮箱">
        </label>
      </div>

      <div v-if="userLoading" class="user-loading" aria-busy="true">正在加载用户…</div>
      <EmptyState v-else-if="userError" title="用户列表加载失败" :description="userError" action-label="重试" @action="loadUsers" />
      <EmptyState v-else-if="visibleUsers.length === 0" title="没有匹配的用户" description="调整筛选或搜索条件后再试。" />
      <div v-else class="user-list">
        <article v-for="user in visibleUsers" :key="user.userId" class="user-row surface">
          <div class="user-avatar" aria-hidden="true">{{ user.userName.charAt(0).toUpperCase() }}</div>
          <div class="user-row__identity">
            <strong>{{ user.userName }}</strong>
            <span>{{ user.userEmail }}</span>
          </div>
          <div class="user-row__meta">
            <StatusBadge :status="user.enable" />
            <span>{{ roleLabel(user.role) }}</span>
            <span>{{ formatDate(user.joinDate) }}</span>
          </div>
          <button v-if="canManage(user)" class="button-secondary" type="button" @click="requestUserStatus(user)">
            {{ user.enable ? '禁用账号' : '恢复账号' }}
          </button>
          <small v-else>不可操作</small>
        </article>
      </div>
      <AppPagination :current="userPage" :pages="userPages" @change="changeUserPage" />
    </section>

    <WallpaperPreview :wallpaper="preview" @close="preview = null" @download="downloadWallpaper" />
    <ConfirmDialog
      :open="confirmation !== null"
      :title="confirmation?.title ?? ''"
      :description="confirmation?.description ?? ''"
      :confirm-label="confirmation?.confirmLabel ?? '确认'"
      :danger="confirmation?.danger ?? false"
      @cancel="confirmation = null"
      @confirm="confirmMutation"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import { AdminPage, getUserList, updateFileAuditStatus, userStatus } from '../api/Admin'
import { Download, deleteWallpaper } from '../api/File'
import { getUserInfo } from '../api/User'
import AppPagination from '../components/AppPagination.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import EmptyState from '../components/EmptyState.vue'
import LoadingGrid from '../components/LoadingGrid.vue'
import StatCard from '../components/StatCard.vue'
import StatusBadge from '../components/StatusBadge.vue'
import WallpaperPreview from '../components/WallpaperPreview.vue'
import { useUserStore } from '../store/useUser'
import type { AdminUser, Wallpaper } from '../types/api'
import { triggerBlobDownload } from '../utils/download'
import { getErrorMessage } from '../utils/errors'
import { mediaUrl } from '../utils/media'

type AdminTab = 'files' | 'users'
type FileFilter = 'all' | 'audited' | 'unaudited'
type UserFilter = 'all' | 'admin' | 'user'
type Confirmation = { title: string; description: string; confirmLabel: string; danger: boolean; run: () => Promise<void> }

const router = useRouter()
const toast = useToast()
const store = useUserStore()
const activeTab = ref<AdminTab>('files')
const role = ref('')
const files = ref<Wallpaper[]>([])
const filePage = ref(1)
const filePages = ref(0)
const fileTotal = ref(0)
const fileFilter = ref<FileFilter>('all')
const fileSearch = ref('')
const fileLoading = ref(false)
const fileError = ref('')
const users = ref<AdminUser[]>([])
const userPage = ref(1)
const userPages = ref(0)
const userTotal = ref(0)
const userFilter = ref<UserFilter>('all')
const userSearch = ref('')
const userLoading = ref(false)
const userError = ref('')
const preview = ref<Wallpaper | null>(null)
const confirmation = ref<Confirmation | null>(null)
const fileFilters: { label: string; value: FileFilter }[] = [{ label: '全部', value: 'all' }, { label: '已审核', value: 'audited' }, { label: '待审核', value: 'unaudited' }]
const userFilters: { label: string; value: UserFilter }[] = [{ label: '全部', value: 'all' }, { label: '管理员', value: 'admin' }, { label: '普通用户', value: 'user' }]
const visibleFiles = computed(() => {
  const query = fileSearch.value.trim().toLowerCase()
  return query ? files.value.filter((file) => file.fileTitle.toLowerCase().includes(query)) : files.value
})
const visibleUsers = computed(() => {
  const query = userSearch.value.trim().toLowerCase()
  return query ? users.value.filter((user) => `${user.userName} ${user.userEmail}`.toLowerCase().includes(query)) : users.value
})

// formatDate 将服务端时间转换为本地短日期。
function formatDate(value: string): string {
  return new Intl.DateTimeFormat('zh-CN').format(new Date(value))
}

// formatBytes 将文件体积格式化为 MiB。
function formatBytes(value: number): string {
  return `${(value / 1024 / 1024).toFixed(1)} MiB`
}

// roleLabel 将角色代码映射为中文标签。
function roleLabel(value: string): string {
  if (value === 'superAdmin') return '超级管理员'
  if (value === 'admin') return '管理员'
  return '普通用户'
}

// switchTab 切换工作区并按需加载数据。
function switchTab(tab: AdminTab): void {
  activeTab.value = tab
  if (tab === 'files') void loadFiles()
  else void loadUsers()
}

// setFileFilter 更新文件筛选并回到第一页。
function setFileFilter(filter: FileFilter): void {
  fileFilter.value = filter
  filePage.value = 1
  void loadFiles()
}

// setUserFilter 更新用户筛选并回到第一页。
function setUserFilter(filter: UserFilter): void {
  userFilter.value = filter
  userPage.value = 1
  void loadUsers()
}

// loadFiles 加载后台文件分页。
async function loadFiles(): Promise<void> {
  fileLoading.value = true
  fileError.value = ''
  try {
    const page = (await AdminPage(filePage.value, 12, fileFilter.value)).data.data
    files.value = page.records
    filePage.value = page.current
    filePages.value = page.pages
    fileTotal.value = page.total
  } catch (error) {
    fileError.value = getErrorMessage(error)
  } finally {
    fileLoading.value = false
  }
}

// loadUsers 加载后台用户分页。
async function loadUsers(): Promise<void> {
  userLoading.value = true
  userError.value = ''
  try {
    const page = (await getUserList(userPage.value, 10, userFilter.value)).data.data
    users.value = page.records
    userPage.value = page.current
    userPages.value = page.pages
    userTotal.value = page.total
  } catch (error) {
    userError.value = getErrorMessage(error)
  } finally {
    userLoading.value = false
  }
}

// changeFilePage 切换文件页码。
function changeFilePage(page: number): void { filePage.value = page; void loadFiles() }

// changeUserPage 切换用户页码。
function changeUserPage(page: number): void { userPage.value = page; void loadUsers() }

// performAudit 更新审核状态并刷新文件列表。
async function performAudit(wallpaper: Wallpaper): Promise<void> {
  await updateFileAuditStatus(wallpaper.fileId, wallpaper.status)
  toast.success(wallpaper.status === '已审核' ? '已撤回公开审核' : '壁纸已通过审核')
  await loadFiles()
}

// requestAudit 对审核撤回要求确认，新审核直接执行。
function requestAudit(wallpaper: Wallpaper): void {
  if (wallpaper.status !== '已审核') {
    void performAudit(wallpaper).catch((error) => toast.error(getErrorMessage(error)))
    return
  }
  confirmation.value = {
    title: '撤回公开审核？',
    description: `“${wallpaper.fileTitle}”将立即从公开画廊中隐藏。`,
    confirmLabel: '撤回审核', danger: true,
    run: () => performAudit(wallpaper),
  }
}

// requestDelete 请求确认后永久移除文件记录。
function requestDelete(wallpaper: Wallpaper): void {
  confirmation.value = {
    title: '删除这张壁纸？', description: `“${wallpaper.fileTitle}”将无法再被访问。`, confirmLabel: '确认删除', danger: true,
    run: async () => { await deleteWallpaper(wallpaper.fileId); preview.value = null; await loadFiles() },
  }
}

// canManage 判断当前管理员是否有权切换目标用户状态。
function canManage(user: AdminUser): boolean {
  return (role.value === 'superAdmin' && user.role !== 'superAdmin') || (role.value === 'admin' && user.role === 'user')
}

// toggleUserStatus 切换用户状态并刷新列表。
async function toggleUserStatus(user: AdminUser): Promise<void> {
  await userStatus(user.userId)
  toast.success(user.enable ? '账号已禁用' : '账号已恢复')
  await loadUsers()
}

// requestUserStatus 对禁用操作要求确认，恢复操作直接执行。
function requestUserStatus(user: AdminUser): void {
  if (!user.enable) {
    void toggleUserStatus(user).catch((error) => toast.error(getErrorMessage(error)))
    return
  }
  confirmation.value = {
    title: '禁用这个账号？', description: `${user.userName} 的现有登录会话会立即失效。`, confirmLabel: '确认禁用', danger: true,
    run: () => toggleUserStatus(user),
  }
}

// confirmMutation 执行当前确认动作并统一处理错误。
async function confirmMutation(): Promise<void> {
  const action = confirmation.value
  confirmation.value = null
  if (!action) return
  try { await action.run() } catch (error) { toast.error(getErrorMessage(error)) }
}

// downloadWallpaper 下载管理员预览的原始文件。
async function downloadWallpaper(wallpaper: Wallpaper): Promise<void> {
  try {
    const response = await Download(wallpaper.fileName)
    triggerBlobDownload(response.data, response.headers['content-disposition'] as string | undefined)
  } catch (error) { toast.error(getErrorMessage(error)) }
}

// initialize 验证管理员身份并加载首屏数据。
async function initialize(): Promise<void> {
  try {
    const info = (await getUserInfo()).data.data
    role.value = info.role
    store.setUser({ userName: info.userName, role: info.role, userAvatar: info.userAvatar })
    if (info.role !== 'admin' && info.role !== 'superAdmin') {
      await router.replace('/home')
      return
    }
    await Promise.all([loadFiles(), loadUsers()])
  } catch (error) {
    store.clearSession()
    toast.error(getErrorMessage(error))
    await router.replace('/login')
  }
}

onMounted(initialize)
</script>

<style scoped>
.admin-header { display: flex; align-items: end; justify-content: space-between; gap: 28px; margin-bottom: 28px; }
.admin-header > div:first-child > p { margin: 0 0 10px; color: var(--color-accent); font-size: 11px; font-weight: 750; letter-spacing: .16em; }
.admin-header h1 { margin: 0 0 9px; font-size: clamp(36px, 5vw, 58px); letter-spacing: -.05em; }
.admin-header > div:first-child > span { color: var(--color-muted); }
.summary-cards { min-width: 310px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.workspace-tabs { width: fit-content; display: flex; gap: 5px; margin-bottom: 20px; border-radius: var(--radius-pill); padding: 5px; background: #eaeae7; }
.workspace-tabs button,
.segmented button { border: 0; border-radius: var(--radius-pill); color: var(--color-muted); background: transparent; cursor: pointer; }
.workspace-tabs button { min-height: 42px; padding: 0 20px; }
.workspace-tabs button.active,
.segmented button.active { color: var(--color-text); background: #fff; box-shadow: 0 1px 4px rgb(15 18 23 / 10%); }
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-bottom: 20px; border-radius: 20px; padding: 10px; }
.segmented { display: flex; gap: 4px; }
.segmented button { min-height: 38px; padding: 0 14px; }
.toolbar-search { width: min(320px, 100%); }
.toolbar-search .field { min-height: 42px; }
.admin-file-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.admin-file-card { min-width: 0; overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: #fff; }
.admin-file-card__visual { position: relative; aspect-ratio: 4 / 3; overflow: hidden; background: #e9e9e6; }
.admin-file-card__visual img { width: 100%; height: 100%; object-fit: cover; }
.admin-file-card__visual :deep(.status-badge) { position: absolute; top: 10px; left: 10px; }
.admin-file-card__body { display: grid; gap: 7px; padding: 14px; }
.admin-file-card__body strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.admin-file-card__body > span { color: var(--color-muted); font-size: 12px; }
.card-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; margin-top: 5px; }
.card-actions button { min-height: 34px; border: 0; border-radius: 10px; color: #4f535a; background: #f1f1ee; cursor: pointer; font-size: 12px; }
.card-actions .danger-text { color: var(--color-danger); }
.user-list { display: grid; gap: 10px; }
.user-row { display: grid; grid-template-columns: auto minmax(160px, 1.2fr) minmax(230px, 1fr) auto; gap: 16px; align-items: center; padding: 15px 18px; border-radius: 18px; }
.user-avatar { width: 42px; height: 42px; display: grid; place-items: center; border-radius: 14px; color: #fff; background: #333840; font-weight: 700; }
.user-row__identity { min-width: 0; display: grid; gap: 3px; }
.user-row__identity span { overflow: hidden; color: var(--color-muted); text-overflow: ellipsis; white-space: nowrap; font-size: 13px; }
.user-row__meta { display: flex; align-items: center; gap: 10px; color: var(--color-muted); font-size: 12px; }
.user-row > small { color: var(--color-muted); text-align: right; }
.user-loading { min-height: 240px; display: grid; place-items: center; color: var(--color-muted); }
@media (max-width: 1000px) { .admin-file-grid { grid-template-columns: repeat(3, 1fr); } .user-row { grid-template-columns: auto 1fr auto; } .user-row__meta { grid-column: 2; } .user-row > button, .user-row > small { grid-column: 3; grid-row: 1 / 3; } }
@media (max-width: 740px) { .admin-header { align-items: stretch; flex-direction: column; } .summary-cards { min-width: 0; } .toolbar { align-items: stretch; flex-direction: column; } .segmented, .toolbar-search { width: 100%; } .segmented button { flex: 1; padding-inline: 8px; } .admin-file-grid { grid-template-columns: repeat(2, 1fr); } .user-row { grid-template-columns: auto 1fr; } .user-row__meta, .user-row > button, .user-row > small { grid-column: 1 / -1; grid-row: auto; } .user-row > button { width: 100%; } }
@media (max-width: 390px) { .admin-file-grid { grid-template-columns: 1fr; } .card-actions { grid-template-columns: 1fr; } }
</style>
