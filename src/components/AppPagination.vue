<template>
  <nav v-if="pages > 1" class="pagination" aria-label="分页">
    <button type="button" :disabled="current <= 1" @click="emit('change', current - 1)">上一页</button>
    <span>{{ current }} / {{ pages }}</span>
    <button type="button" :disabled="current >= pages" @click="emit('change', current + 1)">下一页</button>
  </nav>
</template>

<script setup lang="ts">
defineProps<{ current: number; pages: number }>()
const emit = defineEmits<{ change: [page: number] }>()
</script>

<style scoped>
.pagination { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 36px; }
.pagination button { min-height: 42px; border: 1px solid var(--color-border); border-radius: var(--radius-pill); padding: 0 17px; color: var(--color-text); background: var(--color-surface); cursor: pointer; }
.pagination span { min-width: 58px; color: var(--color-muted); text-align: center; font-size: 14px; }
</style>
