<template>
  <AuthShell title="创建账号" subtitle="几步完成注册，开始建立属于你的壁纸收藏。">
    <form class="auth-form" novalidate @submit.prevent="submitRegister">
      <label>
        <span>用户名</span>
        <input v-model="username" class="field" type="text" autocomplete="username" placeholder="3–24 位字母、数字或下划线">
      </label>
      <label>
        <span>邮箱</span>
        <input v-model="email" class="field" type="email" autocomplete="email" placeholder="name@example.com">
      </label>
      <div class="password-grid">
        <label>
          <span>密码</span>
          <input v-model="password" class="field" type="password" autocomplete="new-password" placeholder="至少 6 位">
        </label>
        <label>
          <span>确认密码</span>
          <input v-model="passwordConfirm" class="field" type="password" autocomplete="new-password" placeholder="再次输入">
        </label>
      </div>
      <label>
        <span>验证码</span>
        <div class="captcha-row">
          <input v-model="code" class="field" type="text" inputmode="numeric" autocomplete="off" placeholder="6 位验证码">
          <button class="captcha-button" type="button" :disabled="captchaLoading" aria-label="刷新验证码" @click="loadCaptcha">
            <img v-if="captchaUrl" :src="captchaUrl" alt="验证码，点击刷新">
            <span v-else>{{ captchaLoading ? '加载中' : '刷新' }}</span>
          </button>
        </div>
      </label>
      <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
      <button class="button-primary submit-button" type="submit" :disabled="submitting">
        {{ submitting ? '正在创建…' : '创建账号' }}
      </button>
    </form>
    <template #footer>已经有账号？<RouterLink to="/login">直接登录</RouterLink></template>
  </AuthShell>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { getKaptcha } from '../api/File'
import { userRegister } from '../api/User'
import AuthShell from '../components/AuthShell.vue'
import { useUserStore } from '../store/useUser'
import { getErrorMessage } from '../utils/errors'

const store = useUserStore()
const router = useRouter()
const username = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const code = ref('')
const captchaUrl = ref('')
const captchaLoading = ref(false)
const submitting = ref(false)
const formError = ref('')

// loadCaptcha 刷新注册验证码及其一次性 Redis 键。
async function loadCaptcha(): Promise<void> {
  captchaLoading.value = true
  try {
    const response = await getKaptcha()
    captchaUrl.value = response.data.data
    store.redisKey = String(response.headers['rediskey'] ?? '')
    code.value = ''
  } catch (error) {
    formError.value = getErrorMessage(error)
  } finally {
    captchaLoading.value = false
  }
}

// validateForm 返回首个可见的注册表单错误。
function validateForm(): string {
  const normalizedName = username.value.trim()
  const normalizedEmail = email.value.trim()
  if (!/^[A-Za-z0-9_]{3,24}$/.test(normalizedName)) return '用户名需为 3–24 位字母、数字或下划线。'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return '请输入有效的邮箱地址。'
  if (password.value.length < 6) return '密码至少需要 6 位。'
  if (password.value !== passwordConfirm.value) return '两次输入的密码不一致。'
  if (!code.value.trim()) return '请输入验证码。'
  return ''
}

// submitRegister 校验并提交注册，成功后跳转登录页。
async function submitRegister(): Promise<void> {
  formError.value = validateForm()
  if (formError.value) return
  submitting.value = true
  try {
    await userRegister(username.value.trim(), password.value, email.value.trim(), code.value.trim())
    store.redisKey = ''
    await router.replace('/login')
  } catch (error) {
    formError.value = getErrorMessage(error)
    await loadCaptcha()
  } finally {
    submitting.value = false
  }
}

onMounted(loadCaptcha)
</script>

<style scoped>
.auth-form { min-width: 0; display: grid; gap: 16px; }
.auth-form label { min-width: 0; display: grid; gap: 8px; color: #42454b; font-size: 14px; font-weight: 620; }
.password-grid { min-width: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.captcha-row { min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr) 124px; gap: 10px; }
.captcha-button { height: 48px; overflow: hidden; border: 1px solid var(--color-border); border-radius: 14px; padding: 0; color: var(--color-muted); background: var(--color-surface-soft); cursor: pointer; }
.captcha-button img { width: 100%; height: 100%; display: block; object-fit: cover; }
.form-error { margin: -2px 0 0; color: var(--color-danger); font-size: 13px; line-height: 1.5; }
.submit-button { width: 100%; margin-top: 4px; }
@media (max-width: 470px) { .password-grid { grid-template-columns: 1fr; } }
@media (max-width: 360px) { .captcha-row { grid-template-columns: 1fr; } .captcha-button { width: 124px; } }
</style>
