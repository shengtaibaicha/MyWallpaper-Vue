<template>
  <AuthShell title="欢迎回来" subtitle="登录后收藏、上传并下载你喜欢的壁纸。">
    <form class="auth-form" novalidate @submit.prevent="submitLogin">
      <label>
        <span>用户名</span>
        <input v-model="userName" class="field" type="text" autocomplete="username" placeholder="输入用户名">
      </label>
      <label>
        <span>密码</span>
        <input v-model="password" class="field" type="password" autocomplete="current-password" placeholder="输入密码">
      </label>
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
        {{ submitting ? '正在登录…' : '登录' }}
      </button>
    </form>
    <template #footer>还没有账号？<RouterLink to="/register">创建账号</RouterLink></template>
  </AuthShell>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { getKaptcha } from '../api/File'
import { getUserInfo, userLogin } from '../api/User'
import AuthShell from '../components/AuthShell.vue'
import { useUserStore } from '../store/useUser'
import { getErrorMessage } from '../utils/errors'

const store = useUserStore()
const router = useRouter()
const route = useRoute()
const userName = ref('')
const password = ref('')
const code = ref('')
const captchaUrl = ref('')
const captchaLoading = ref(false)
const submitting = ref(false)
const formError = ref('')

// loadCaptcha 刷新验证码图片及其一次性 Redis 键。
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

// submitLogin 校验表单、保存会话并返回原始目标页面。
async function submitLogin(): Promise<void> {
  formError.value = ''
  const normalizedName = userName.value.trim()
  if (!normalizedName || !password.value || !code.value.trim()) {
    formError.value = '请完整填写用户名、密码和验证码。'
    return
  }
  submitting.value = true
  try {
    const login = (await userLogin(normalizedName, password.value, code.value.trim())).data.data
    store.setSession(login.token)
    store.redisKey = ''
    const info = (await getUserInfo()).data.data
    store.setUser({ userName: info.userName, role: info.role, userAvatar: info.userAvatar })
    const requested = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') ? route.query.redirect : '/home'
    await router.replace(requested)
  } catch (error) {
    store.clearSession()
    formError.value = getErrorMessage(error)
    await loadCaptcha()
  } finally {
    submitting.value = false
  }
}

onMounted(loadCaptcha)
</script>

<style scoped>
.auth-form { display: grid; gap: 18px; }
.auth-form label { display: grid; gap: 8px; color: #42454b; font-size: 14px; font-weight: 620; }
.captcha-row { min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr) 124px; gap: 10px; }
.captcha-button { height: 48px; overflow: hidden; border: 1px solid var(--color-border); border-radius: 14px; padding: 0; color: var(--color-muted); background: var(--color-surface-soft); cursor: pointer; }
.captcha-button img { width: 100%; height: 100%; display: block; object-fit: cover; }
.form-error { margin: -3px 0 0; color: var(--color-danger); font-size: 13px; line-height: 1.5; }
.submit-button { width: 100%; margin-top: 4px; }
@media (max-width: 360px) { .captcha-row { grid-template-columns: 1fr; } .captcha-button { width: 124px; } }
</style>
