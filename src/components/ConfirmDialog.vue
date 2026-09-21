<template>
  <Teleport to="body">
    <div v-if="open" class="confirm-backdrop" @mousedown.self="emit('cancel')">
      <section ref="dialog" class="confirm-dialog" role="alertdialog" aria-modal="true" :aria-labelledby="titleId" :aria-describedby="descriptionId" tabindex="-1" @keydown="trapFocus">
        <span class="confirm-dialog__icon" :class="{ danger }" aria-hidden="true">{{ danger ? '!' : '?' }}</span>
        <h2 :id="titleId">{{ title }}</h2>
        <p :id="descriptionId">{{ description }}</p>
        <div class="confirm-dialog__actions">
          <button ref="cancelButton" class="button-secondary" type="button" @click="emit('cancel')">取消</button>
          <button :class="danger ? 'button-danger' : 'button-primary'" type="button" @click="emit('confirm')">{{ confirmLabel }}</button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

const props = withDefaults(defineProps<{ open: boolean; title: string; description: string; confirmLabel?: string; danger?: boolean }>(), {
  confirmLabel: '确认',
  danger: false,
})
const emit = defineEmits<{ confirm: []; cancel: [] }>()
const dialog = ref<HTMLElement | null>(null)
const cancelButton = ref<HTMLButtonElement | null>(null)
const titleId = `confirm-title-${Math.random().toString(36).slice(2)}`
const descriptionId = `confirm-description-${Math.random().toString(36).slice(2)}`

// trapFocus 将 Tab 键焦点限制在确认对话框内。
function trapFocus(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    emit('cancel')
    return
  }
  if (event.key !== 'Tab' || !dialog.value) return
  const focusable = Array.from(dialog.value.querySelectorAll<HTMLElement>('button:not(:disabled)'))
  if (focusable.length === 0) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}

watch(() => props.open, async (open) => {
  if (!open) return
  await nextTick()
  cancelButton.value?.focus()
})
</script>

<style scoped>
.confirm-backdrop { position: fixed; inset: 0; z-index: 120; display: grid; place-items: center; padding: 20px; background: rgb(12 14 18 / 58%); backdrop-filter: blur(12px); }
.confirm-dialog { width: min(440px, 100%); border-radius: 24px; padding: 28px; background: #fff; box-shadow: var(--shadow-lg); text-align: center; }
.confirm-dialog__icon { width: 48px; height: 48px; display: grid; place-items: center; margin: 0 auto 17px; border-radius: 50%; color: var(--color-accent); background: var(--color-accent-soft); font-size: 22px; font-weight: 750; }
.confirm-dialog__icon.danger { color: var(--color-danger); background: #fde9e9; }
.confirm-dialog h2 { margin: 0 0 9px; font-size: 22px; }
.confirm-dialog p { margin: 0; color: var(--color-muted); line-height: 1.6; }
.confirm-dialog__actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 25px; }
</style>
