import request from '../utils/request'
import type { AdminUser, ApiResult, PageResult, Wallpaper } from '../types/api'

// AdminPage 获取后台壁纸分页。
export function AdminPage(page: number, size: number, filter: string) {
  return request.get<ApiResult<PageResult<Wallpaper>>>('/wallpaper/admin/file', { params: { page, size, filter } })
}

// updateFileAuditStatus 切换壁纸审核状态。
export function updateFileAuditStatus(fileId: string, audited: string) {
  return request.put<ApiResult<null>>('/wallpaper/admin/audit', { fileId, audited })
}

// getUserList 获取后台用户分页。
export function getUserList(page: number, size: number, role: string) {
  return request.get<ApiResult<PageResult<AdminUser>>>('/wallpaper/admin/user', { params: { page, size, role } })
}

// userStatus 切换用户启用状态。
export function userStatus(userId: string) {
  return request.put<ApiResult<null>>('/wallpaper/admin/status', { userId })
}
