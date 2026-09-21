<template>
  <section class="empty-state" role="status">
    <span class="empty-state__icon" aria-hidden="true">◌</span>
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    <button v-if="actionLabel" class="button-secondary" type="button" @click="emit('action')">{{ actionLabel }}</button>
  </section>
</template>

<script setup lang="ts">
defineProps<{ title: string; description: string; actionLabel?: string }>()
const emit = defineEmits<{ action: [] }>()
</script>

<style scoped>
.empty-state { min-height: 320px; display: grid; place-items: center; align-content: center; gap: 10px; padding: 40px 20px; text-align: center; }
.empty-state__icon { width: 54px; height: 54px; display: grid; place-items: center; border-radius: 50%; color: var(--color-accent); background: var(--color-accent-soft); font-size: 30px; }
.empty-state h2 { margin: 8px 0 0; font-size: 21px; }
.empty-state p { max-width: 420px; margin: 0 0 8px; color: var(--color-muted); }
</style>
