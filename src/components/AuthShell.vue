<template>
  <main class="auth-page">
    <section class="auth-shell surface">
      <div class="auth-art" aria-hidden="true">
        <div class="auth-art__orb auth-art__orb--one" />
        <div class="auth-art__orb auth-art__orb--two" />
        <div class="auth-art__copy">
          <span>白茶壁纸</span>
          <p>一张好壁纸，<br>让屏幕安静下来。</p>
        </div>
      </div>
      <div class="auth-panel">
        <header>
          <p class="auth-panel__eyebrow">WELCOME</p>
          <h1>{{ title }}</h1>
          <p>{{ subtitle }}</p>
        </header>
        <slot />
        <footer><slot name="footer" /></footer>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
defineProps<{ title: string; subtitle: string }>()
</script>

<style scoped>
.auth-page { width: 100%; min-height: calc(100vh - 68px); display: grid; grid-template-columns: minmax(0, 1fr); place-items: center; overflow: hidden; padding: 38px 20px; }
.auth-shell { width: 100%; max-width: 960px; min-width: 0; min-height: 610px; display: grid; grid-template-columns: minmax(0, .95fr) minmax(0, 1.05fr); overflow: hidden; }
.auth-art { position: relative; overflow: hidden; margin: 10px; border-radius: 20px; color: #fff; background: linear-gradient(155deg, #14233f 0%, #2764bf 52%, #a8c9f9 100%); }
.auth-art::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, transparent, rgb(7 19 39 / 35%)); }
.auth-art__orb { position: absolute; border-radius: 50%; background: rgb(255 255 255 / 25%); filter: blur(2px); }
.auth-art__orb--one { width: 290px; height: 290px; top: -60px; right: -90px; }
.auth-art__orb--two { width: 180px; height: 180px; left: -70px; bottom: 90px; background: rgb(255 230 179 / 32%); }
.auth-art__copy { position: absolute; inset: auto 34px 38px; z-index: 1; }
.auth-art__copy span { font-size: 13px; font-weight: 700; letter-spacing: 0.16em; }
.auth-art__copy p { margin: 14px 0 0; font-size: 34px; font-weight: 650; line-height: 1.2; letter-spacing: -0.04em; }
.auth-panel { min-width: 0; align-self: center; padding: 54px 62px; }
.auth-panel header { margin-bottom: 30px; }
.auth-panel__eyebrow { margin: 0 0 12px !important; color: var(--color-accent) !important; font-size: 11px !important; font-weight: 750; letter-spacing: 0.16em; }
.auth-panel h1 { margin: 0 0 10px; font-size: 36px; letter-spacing: -0.04em; }
.auth-panel header p { margin: 0; color: var(--color-muted); line-height: 1.6; }
.auth-panel footer { margin-top: 24px; color: var(--color-muted); text-align: center; font-size: 14px; }
.auth-panel footer :deep(a) { color: var(--color-accent); text-decoration: none; font-weight: 650; }
@media (max-width: 900px) {
  .auth-shell { max-width: 520px; min-height: auto; grid-template-columns: 1fr; }
  .auth-art { display: none; }
  .auth-panel { padding: 44px 38px; }
}
@media (max-width: 420px) {
  .auth-page { padding: 18px 10px; }
  .auth-panel { padding: 34px 20px; }
  .auth-panel h1 { font-size: 31px; }
}
</style>
