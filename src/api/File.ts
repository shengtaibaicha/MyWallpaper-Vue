import type { AxiosProgressEvent } from 'axios'

import request from '../utils/request'
import type { ApiResult, CollectionData, PageResult, Wallpaper } from '../types/api'

// Download 下载原始壁纸文件。
export function Download(filename: string) {
  return request.get<Blob>('/wallpaper/file/download', { responseType: 'blob', params: { fileName: filename } })
}

// getKaptcha 获取验证码图片及响应头中的验证码键。
export function getKaptcha() {
  return request.get<ApiResult<string>>('/wallpaper/user/captcha')
}

// Upload 上传一张壁纸并报告进度。
export function Upload(file: FormData, onUploadProgress?: (event: AxiosProgressEvent) => void) {
  return request.post<ApiResult<{ fileId: string }>>('/wallpaper/file/upload', file, {
    onUploadProgress,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// getImagesPage 分页获取公开壁纸。
export function getImagesPage(page: number, size: number) {
  return request.get<ApiResult<PageResult<Wallpaper>>>('/wallpaper/file/find/page', { params: { page, size } })
}

// getImagesPageName 按名称搜索公开壁纸。
export function getImagesPageName(page: number, size: number, name: string) {
  return request.get<ApiResult<PageResult<Wallpaper>>>('/wallpaper/file/find/name', { params: { page, size, name } })
}

// getUserWallpapers 获取当前用户上传的壁纸。
export function getUserWallpapers(page: number, size: number) {
  return request.get<ApiResult<PageResult<Wallpaper>>>('/wallpaper/file/user/page', { params: { page, size } })
}

// deleteWallpaper 删除当前用户拥有的壁纸。
export function deleteWallpaper(fileId: string) {
  return request.delete<ApiResult<null>>('/wallpaper/file/delete', { params: { fileId } })
}

// toggleFavorite 切换当前用户的收藏状态。
export function toggleFavorite(fileId: string) {
  return request.post<ApiResult<null>>('/wallpaper/file/collect', { fileId })
}

// getCollections 获取当前用户收藏的壁纸 ID。
export function getCollections() {
  return request.get<ApiResult<CollectionData>>('/wallpaper/file/collections')
}
