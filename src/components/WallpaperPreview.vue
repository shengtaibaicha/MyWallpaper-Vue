<template>
  <Teleport to="body">
    <Transition name="preview-fade">
      <div v-if="wallpaper" class="preview-backdrop" @mousedown.self="emit('close')">
        <section ref="dialog" class="preview-dialog" role="dialog" aria-modal="true" :aria-label="`预览 ${wallpaper.fileTitle}`" tabindex="-1">
          <button class="preview-close" type="button" aria-label="关闭预览" @click="emit('close')">×</button>
          <div class="preview-visual">
            <img :src="mediaUrl(wallpaper.fileId, 'original')" :alt="wallpaper.fileTitle || '壁纸原图'">
          </div>
          <div class="preview-footer">
            <div>
              <h2>{{ wallpaper.fileTitle || '未命名壁纸' }}</h2>
              <p>{{ wallpaper.number }} 次下载 · {{ formatDate(wallpaper.uploadTime) }}</p>
            </div>
            <div class="preview-actions">
              <button v-if="showAudit" class="button-secondary" type="button" @click="emit('audit', wallpaper)">{{ auditLabel }}</button>
              <button v-if="showDelete" class="button-danger" type="button" @click="emit('delete', wallpaper)">删除</button>
              <button class="button-primary" type="button" @click="emit('download', wallpaper)">下载原图</button>
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { Wallpaper } from '../types/api'
import { mediaUrl } from '../utils/media'

const props = withDefaults(defineProps<{ wallpaper: Wallpaper | null; showDelete?: boolean; showAudit?: boolean; auditLabel?: string }>(), {
  showDelete: false,
  showAudit: false,
  auditLabel: '切换审核状态',
})
const emit = defineEmits<{ close: []; download: [wallpaper: Wallpaper]; delete: [wallpaper: Wallpaper]; audit: [wallpaper: Wallpaper] }>()
const dialog = ref<HTMLElement | null>(null)
let previousFocus: HTMLElement | null = null

// formatDate 将时间格式化为简洁的本地日期。
function formatDate(value: string): string {
  if (!value) return '日期未知'
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value))
}

// handleKeydown 支持 Escape 关闭预览。
function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && props.wallpaper) emit('close')
}

watch(() => props.wallpaper, async (wallpaper) => {
  if (wallpaper) {
    previousFocus = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    await nextTick()
    dialog.value?.focus()
  } else {
    document.body.style.overflow = ''
    previousFocus?.focus()
    previousFocus = null
  }
})

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
  previousFocus?.focus()
})
</script>

<style scoped>
.preview-backdrop { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 24px; background: rgb(10 12 16 / 68%); backdrop-filter: blur(18px); }
.preview-dialog { width: min(1120px, 100%); max-height: calc(100vh - 48px); overflow: auto; position: relative; border-radius: 24px; background: #fff; box-shadow: var(--shadow-lg); }
.preview-close { position: absolute; top: 14px; right: 14px; z-index: 2; width: 42px; height: 42px; border: 0; border-radius: 50%; color: #fff; background: rgb(8 10 14 / 58%); cursor: pointer; font-size: 25px; }
.preview-visual { min-height: 280px; display: grid; place-items: center; overflow: hidden; border-radius: 24px 24px 0 0; background: #111318; }
.preview-visual img { width: 100%; max-height: calc(100vh - 190px); display: block; object-fit: contain; }
.preview-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 20px 22px; }
.preview-footer h2 { margin: 0 0 5px; font-size: 20px; }
.preview-footer p { margin: 0; color: var(--color-muted); font-size: 13px; }
.preview-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
.preview-fade-enter-active,
.preview-fade-leave-active { transition: opacity var(--motion-normal); }
.preview-fade-enter-from,
.preview-fade-leave-to { opacity: 0; }
@media (max-width: 640px) {
  .preview-backdrop { padding: 10px; }
  .preview-dialog { max-height: calc(100vh - 20px); border-radius: 18px; }
  .preview-footer { align-items: stretch; flex-direction: column; }
  .preview-actions { justify-content: stretch; }
  .preview-actions button { flex: 1; }
}
</style>
