import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export interface SessionUser {
  userName: string
  role: string
  userAvatar?: string
}

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const redisKey = ref('')
  const user = ref<SessionUser | null>(null)
  const isAuthenticated = computed(() => token.value.trim().length > 0)

  // setSession 保存服务端签发的会话令牌和可选用户快照。
  function setSession(nextToken: string, snapshot?: SessionUser): void {
    token.value = nextToken.trim()
    if (snapshot) user.value = snapshot
  }

  // setUser 更新用于导航和路由判断的最小用户快照。
  function setUser(snapshot: SessionUser): void {
    user.value = snapshot
  }

  // clearSession 清除令牌、验证码键与用户快照。
  function clearSession(): void {
    token.value = ''
    redisKey.value = ''
    user.value = null
  }

  return { token, redisKey, user, isAuthenticated, setSession, setUser, clearSession }
}, { persist: true })
