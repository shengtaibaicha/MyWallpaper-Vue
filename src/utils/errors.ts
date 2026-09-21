import axios from 'axios'

// getErrorMessage 将未知异常归一化为适合界面展示的中文消息。
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: unknown } | undefined
    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message
    }
    if (error.message) {
      return error.message
    }
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }
  if (typeof error === 'string' && error.trim()) {
    return error
  }
  return '请求失败，请稍后重试'
}
