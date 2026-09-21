<template>
  <div class="gallery-grid" aria-label="正在加载壁纸" aria-busy="true">
    <div v-for="index in count" :key="index" class="loading-card"><span /></div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ count?: number }>(), { count: 10 })
</script>

<style scoped>
.loading-card { overflow: hidden; border-radius: var(--radius-md); background: var(--color-surface); }
.loading-card span { display: block; aspect-ratio: 4 / 5; background: linear-gradient(100deg, #e9e9e6 20%, #f7f7f4 38%, #e9e9e6 56%); background-size: 220% 100%; animation: shimmer 1.4s infinite linear; }
@keyframes shimmer { to { background-position-x: -220%; } }
</style>
