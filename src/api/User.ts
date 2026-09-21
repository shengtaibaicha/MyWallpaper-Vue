import request from '../utils/request'
import { useUserStore } from '../store/useUser'
import type { ApiResult, LoginData, RegisterData, UserInfo } from '../types/api'

// userRegister 注册普通用户。
export function userRegister(username: string, password: string, email: string, code: string) {
  const store = useUserStore()
  return request.post<ApiResult<RegisterData>>('/wallpaper/user/register', {
    userName: username,
    userPassword: password,
    userEmail: email,
    captchaCode: code,
  }, { headers: { redisKey: store.redisKey } })
}

// userLogin 登录并获取会话令牌。
export function userLogin(username: string, password: string, code: string) {
  const store = useUserStore()
  return request.post<ApiResult<LoginData>>('/wallpaper/user/login', {
    userName: username,
    userPassword: password,
    captchaCode: code,
  }, { headers: { redisKey: store.redisKey } })
}

// getUserInfo 获取当前用户资料。
export function getUserInfo() {
  return request.get<ApiResult<UserInfo>>('/wallpaper/user/info')
}
