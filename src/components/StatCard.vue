<template>
  <article class="stat-card">
    <span>{{ label }}</span>
    <strong>{{ value }}</strong>
    <small v-if="hint">{{ hint }}</small>
  </article>
</template>

<script setup lang="ts">
defineProps<{ label: string; value: number | string; hint?: string }>()
</script>

<style scoped>
.stat-card { min-width: 0; display: grid; gap: 6px; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 20px; background: var(--color-surface); }
.stat-card span { color: var(--color-muted); font-size: 13px; }
.stat-card strong { font-size: 30px; letter-spacing: -.04em; }
.stat-card small { color: #92959b; font-size: 12px; }
</style>
