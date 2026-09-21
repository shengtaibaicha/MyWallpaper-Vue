<template>
  <main class="page-shell upload-page">
    <header class="page-heading">
      <p>UPLOAD STUDIO</p>
      <h1>分享一幅好画面。</h1>
      <span>支持 JPEG、PNG，单张不超过 30 MiB，一次最多 4 张。</span>
    </header>

    <div class="upload-layout">
      <section class="upload-composer surface">
        <label
          class="drop-zone"
          :class="{ 'drop-zone--active': dragActive }"
          for="wallpaper-files"
          @dragover.prevent="dragActive = true"
          @dragleave.prevent="dragActive = false"
          @drop.prevent="handleDrop"
        >
          <span class="drop-zone__icon" aria-hidden="true">＋</span>
          <strong>拖放图片到这里</strong>
          <span>或者点击浏览本地文件</span>
          <input id="wallpaper-files" type="file" multiple accept="image/jpeg,image/png" :disabled="uploading" @change="handlePicker">
        </label>

        <label class="category-field">
          <span>统一分类</span>
          <select v-model.number="selectedTag" class="field" :disabled="uploading || tagsLoading">
            <option :value="0">请选择壁纸分类</option>
            <option v-for="tag in tags" :key="tag.tagId" :value="tag.tagId">{{ tag.tagName }}</option>
          </select>
        </label>

        <p v-if="message" class="upload-message" :class="{ 'upload-message--error': hasError }" role="status">{{ message }}</p>
        <button class="button-primary upload-submit" type="button" :disabled="uploading || items.length === 0 || selectedTag === 0" @click="uploadAll">
          {{ uploading ? '正在依次上传…' : `上传 ${items.length || ''} 张壁纸` }}
        </button>
      </section>

      <section class="queue" aria-label="待上传文件">
        <div class="queue__heading">
          <h2>上传队列</h2>
          <span>{{ items.length }} / 4</span>
        </div>
        <EmptyState v-if="items.length === 0" title="还没有选择图片" description="选择后会在这里看到缩略图和上传进度。" />
        <article v-for="(item, index) in items" v-else :key="item.id" class="queue-item surface">
          <img :src="item.previewUrl" :alt="item.file.name">
          <div class="queue-item__body">
            <strong>{{ item.file.name }}</strong>
            <span>{{ formatBytes(item.file.size) }} · {{ item.status }}</span>
            <div class="progress-track" :aria-label="`上传进度 ${item.progress}%`">
              <span :style="{ width: `${item.progress}%` }" />
            </div>
            <p v-if="item.error">{{ item.error }}</p>
          </div>
          <button type="button" aria-label="移除文件" :disabled="uploading" @click="removeItem(index)">×</button>
        </article>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

import { Upload } from '../api/File'
import { getTags } from '../api/Tag'
import { getUserInfo } from '../api/User'
import EmptyState from '../components/EmptyState.vue'
import { useUserStore } from '../store/useUser'
import type { Tag } from '../types/api'
import { getErrorMessage } from '../utils/errors'
import { validateUploadFiles } from '../utils/upload'

interface UploadItem {
  id: string
  file: File
  previewUrl: string
  progress: number
  status: '等待上传' | '上传中' | '上传成功' | '上传失败'
  error: string
}

const store = useUserStore()
const items = ref<UploadItem[]>([])
const tags = ref<Tag[]>([])
const selectedTag = ref(0)
const dragActive = ref(false)
const uploading = ref(false)
const tagsLoading = ref(true)
const message = ref('')
const hasError = ref(false)

// formatBytes 将字节数转换为简洁的文件体积文本。
function formatBytes(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MiB`
}

// addFiles 校验并加入文件，同时创建可回收的本地预览地址。
function addFiles(selected: File[]): void {
  const combined = [...items.value.map((item) => item.file), ...selected]
  const validation = validateUploadFiles(combined)
  if (validation) {
    message.value = validation
    hasError.value = true
    return
  }
  for (const file of selected) {
    items.value.push({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
      status: '等待上传',
      error: '',
    })
  }
  message.value = ''
  hasError.value = false
}

// handlePicker 处理原生文件选择器结果。
function handlePicker(event: Event): void {
  const input = event.target as HTMLInputElement
  addFiles(Array.from(input.files ?? []))
  input.value = ''
}

// handleDrop 处理拖放文件并恢复视觉状态。
function handleDrop(event: DragEvent): void {
  dragActive.value = false
  addFiles(Array.from(event.dataTransfer?.files ?? []))
}

// removeItem 移除队列项并释放本地预览地址。
function removeItem(index: number): void {
  const [removed] = items.value.splice(index, 1)
  if (removed) URL.revokeObjectURL(removed.previewUrl)
}

// uploadAll 顺序上传队列并保留每个文件的独立结果。
async function uploadAll(): Promise<void> {
  if (!selectedTag.value || uploading.value) return
  uploading.value = true
  let failures = 0
  for (const item of items.value) {
	if (item.status === '上传成功') continue
    item.status = '上传中'
    item.error = ''
    const form = new FormData()
    form.append('file', item.file)
    form.append('tagId', String(selectedTag.value))
    try {
      await Upload(form, (event) => {
        item.progress = event.total ? Math.min(99, Math.round((event.loaded / event.total) * 100)) : Math.min(90, item.progress + 5)
      })
      item.progress = 100
      item.status = '上传成功'
    } catch (error) {
      failures++
      item.status = '上传失败'
      item.error = getErrorMessage(error)
    }
  }
  uploading.value = false
  hasError.value = failures > 0
  message.value = failures ? `${items.value.length - failures} 张上传成功，${failures} 张失败，可检查后重试。` : '全部上传成功，审核通过后会出现在公开画廊。'
}

// initializePage 确认会话并加载分类。
async function initializePage(): Promise<void> {
  try {
    const info = (await getUserInfo()).data.data
    store.setUser({ userName: info.userName, role: info.role, userAvatar: info.userAvatar })
    tags.value = (await getTags()).data.data
  } catch (error) {
    hasError.value = true
    message.value = getErrorMessage(error)
  } finally {
    tagsLoading.value = false
  }
}

onMounted(initializePage)
onBeforeUnmount(() => items.value.forEach((item) => URL.revokeObjectURL(item.previewUrl)))
</script>

<style scoped>
.page-heading { max-width: 760px; margin-bottom: 38px; }
.page-heading p { margin: 0 0 12px; color: var(--color-accent); font-size: 11px; font-weight: 750; letter-spacing: .16em; }
.page-heading h1 { margin: 0 0 12px; font-size: clamp(38px, 6vw, 64px); letter-spacing: -.05em; }
.page-heading span { color: var(--color-muted); font-size: 17px; }
.upload-layout { display: grid; grid-template-columns: minmax(300px, .8fr) minmax(0, 1.2fr); gap: 22px; align-items: start; }
.upload-composer { position: sticky; top: 92px; padding: 18px; }
.drop-zone { min-height: 300px; display: grid; place-items: center; align-content: center; gap: 10px; border: 1.5px dashed #b9bdc5; border-radius: 20px; color: var(--color-muted); background: #fafaf8; text-align: center; cursor: pointer; transition: border-color var(--motion-fast), background var(--motion-fast); }
.drop-zone--active { border-color: var(--color-accent); background: var(--color-accent-soft); }
.drop-zone__icon { width: 52px; height: 52px; display: grid; place-items: center; border-radius: 50%; color: #fff; background: #17191d; font-size: 29px; }
.drop-zone strong { margin-top: 8px; color: var(--color-text); font-size: 18px; }
.drop-zone input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.category-field { display: grid; gap: 8px; margin-top: 18px; color: #42454b; font-size: 14px; font-weight: 620; }
.upload-submit { width: 100%; margin-top: 18px; }
.upload-message { margin: 15px 4px 0; color: #2d7b4a; font-size: 13px; line-height: 1.5; }
.upload-message--error { color: var(--color-danger); }
.queue__heading { display: flex; align-items: center; justify-content: space-between; margin: 4px 4px 16px; }
.queue__heading h2 { margin: 0; font-size: 20px; }
.queue__heading span { color: var(--color-muted); font-size: 13px; }
.queue-item { display: grid; grid-template-columns: 112px minmax(0, 1fr) 38px; gap: 16px; align-items: center; padding: 12px; margin-bottom: 12px; border-radius: 20px; }
.queue-item > img { width: 112px; height: 90px; border-radius: 14px; object-fit: cover; }
.queue-item__body { min-width: 0; display: grid; gap: 7px; }
.queue-item__body strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.queue-item__body > span { color: var(--color-muted); font-size: 12px; }
.queue-item__body p { margin: 0; color: var(--color-danger); font-size: 12px; }
.progress-track { height: 5px; overflow: hidden; border-radius: 99px; background: #e7e7e3; }
.progress-track span { height: 100%; display: block; border-radius: inherit; background: var(--color-accent); transition: width var(--motion-fast); }
.queue-item > button { width: 34px; height: 34px; border: 0; border-radius: 50%; color: var(--color-muted); background: var(--color-surface-soft); cursor: pointer; }
@media (max-width: 780px) { .upload-layout { grid-template-columns: 1fr; } .upload-composer { position: static; } }
@media (max-width: 420px) { .drop-zone { min-height: 230px; } .queue-item { grid-template-columns: 76px minmax(0, 1fr) 32px; gap: 10px; } .queue-item > img { width: 76px; height: 76px; } }
</style>
