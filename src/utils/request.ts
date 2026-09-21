import axios from 'axios'
import { getActivePinia } from 'pinia'

import { useUserStore } from '../store/useUser'

const request = axios.create({
  timeout: 60_000,
})

// clearSession 清空当前持久化登录状态。
function clearSession(): void {
  const pinia = getActivePinia()
  if (!pinia) return
  const store = useUserStore(pinia)
  store.token = ''
  store.redisKey = ''
}

request.interceptors.request.use((config) => {
  const pinia = getActivePinia()
  if (!pinia) return config
  const token = useUserStore(pinia).token.trim()
  if (token) {
    config.headers.Authorization = token
  }
  return config
})

request.interceptors.response.use(
  (response) => {
    const body = response.data as { code?: unknown; message?: unknown } | Blob
    if (!(body instanceof Blob) && typeof body === 'object' && body !== null && typeof body.code === 'number' && body.code >= 400) {
      return Promise.reject(new Error(typeof body.message === 'string' ? body.message : '请求失败'))
    }
    return response
  },
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearSession()
    }
    return Promise.reject(error)
  },
)

export default request
