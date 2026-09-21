export type MediaVariant = 'thumbnail' | 'original'

// mediaUrl 生成只访问 HTTP Gateway 的壁纸媒体地址。
export function mediaUrl(fileId: string, variant: MediaVariant): string {
  const normalized = fileId.trim()
  if (!normalized) {
    throw new Error('壁纸 ID 不能为空')
  }
  return `/wallpaper/media/${encodeURIComponent(normalized)}?variant=${variant}`
}
