import request from '../utils/request'
import type { ApiResult, PageResult, Tag, Wallpaper } from '../types/api'

// getTags 获取公开标签列表。
export function getTags() {
  return request.get<ApiResult<Tag[]>>('/wallpaper/file/tag/tags')
}

// getImagesPageByTag 按标签分页获取公开壁纸。
export function getImagesPageByTag(page: number, size: number, tagId: number) {
  return request.post<ApiResult<PageResult<Wallpaper>>>('/wallpaper/file/tag/find/page', { page, size, tagId })
}
