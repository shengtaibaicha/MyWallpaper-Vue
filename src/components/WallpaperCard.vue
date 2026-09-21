<template>
  <article class="wallpaper-card">
    <button class="wallpaper-card__image-button" type="button" @click="emit('preview', wallpaper)">
      <img
        v-if="!imageFailed"
        class="wallpaper-card__image"
        :src="mediaUrl(wallpaper.fileId, 'thumbnail')"
        :alt="wallpaper.fileTitle || '壁纸预览'"
        loading="lazy"
        @error="imageFailed = true"
      >
      <span v-else class="wallpaper-card__fallback" role="img" aria-label="图片暂时无法显示">图片暂不可用</span>
    </button>
    <div class="wallpaper-card__meta">
      <div class="wallpaper-card__copy">
        <strong>{{ wallpaper.fileTitle || '未命名壁纸' }}</strong>
        <span>{{ formattedSize }}</span>
      </div>
      <button
        v-if="favoriteEnabled"
        class="favorite-button"
        :class="{ 'favorite-button--active': wallpaper.collect }"
        type="button"
        :aria-label="wallpaper.collect ? '取消收藏' : '收藏壁纸'"
        @click="emit('favorite', wallpaper)"
      >
        <span aria-hidden="true">{{ wallpaper.collect ? '♥' : '♡' }}</span>
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import type { Wallpaper } from '../types/api'
import { mediaUrl } from '../utils/media'

const props = withDefaults(defineProps<{ wallpaper: Wallpaper; favoriteEnabled?: boolean }>(), { favoriteEnabled: true })
const emit = defineEmits<{ preview: [wallpaper: Wallpaper]; favorite: [wallpaper: Wallpaper] }>()
const imageFailed = ref(false)
const formattedSize = computed(() => props.wallpaper.fileSize > 0 ? `${(props.wallpaper.fileSize / 1024 / 1024).toFixed(1)} MB` : '高清壁纸')
</script>

<style scoped>
.wallpaper-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: 0 1px 0 rgb(255 255 255 / 70%);
  transition: transform var(--motion-normal), box-shadow var(--motion-normal);
}
.wallpaper-card:hover,
.wallpaper-card:focus-within { transform: translateY(-3px); box-shadow: var(--shadow-sm); }
.wallpaper-card__image-button { width: 100%; aspect-ratio: 4 / 5; display: block; overflow: hidden; border: 0; padding: 0; background: #e9e9e5; cursor: zoom-in; }
.wallpaper-card__image { width: 100%; height: 100%; display: block; object-fit: cover; transition: transform 450ms ease; }
.wallpaper-card:hover .wallpaper-card__image { transform: scale(1.025); }
.wallpaper-card__fallback { width: 100%; height: 100%; display: grid; place-items: center; color: var(--color-muted); font-size: 13px; }
.wallpaper-card__meta { min-height: 64px; display: flex; align-items: center; gap: 8px; padding: 11px 12px 12px 14px; }
.wallpaper-card__copy { min-width: 0; display: grid; gap: 3px; }
.wallpaper-card__copy strong { overflow: hidden; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.wallpaper-card__copy span { color: var(--color-muted); font-size: 12px; }
.favorite-button { width: 38px; height: 38px; flex: 0 0 auto; margin-left: auto; border: 0; border-radius: 50%; color: #6e7178; background: transparent; cursor: pointer; font-size: 22px; }
.favorite-button:hover { background: #f2f2ef; }
.favorite-button--active { color: #d94252; }
@media (hover: none) { .favorite-button { background: #f2f2ef; } }
</style>
