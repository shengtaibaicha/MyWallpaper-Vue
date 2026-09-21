<template><span class="status-badge" :class="toneClass">{{ label }}</span></template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ status: string | number | boolean }>()
const label = computed(() => {
  if (props.status === 1 || props.status === true) return '正常'
  if (props.status === 0 || props.status === false) return '已禁用'
  return String(props.status)
})
const toneClass = computed(() => {
  const value = label.value
  if (value === '已审核' || value === '正常') return 'status-badge--success'
  if (value === '未审核') return 'status-badge--warning'
  if (value === '已禁用') return 'status-badge--danger'
  return 'status-badge--neutral'
})
</script>

<style scoped>
.status-badge { width: fit-content; display: inline-flex; align-items: center; border-radius: var(--radius-pill); padding: 5px 9px; font-size: 11px; font-weight: 700; }
.status-badge--success { color: #246640; background: #e5f6eb; }
.status-badge--warning { color: #775c1e; background: #fff1c9; }
.status-badge--danger { color: #8d3035; background: #fde8e9; }
.status-badge--neutral { color: #5e6269; background: #ededeb; }
</style>
