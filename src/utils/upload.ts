export interface UploadFileLike {
  type: string
  size: number
}

export const MAX_UPLOAD_BYTES = 30 * 1024 * 1024

// validateUploadFiles 校验数量、格式与单文件体积限制。
export function validateUploadFiles(files: readonly UploadFileLike[]): string {
  if (files.length === 0) return '请选择至少一张图片。'
  if (files.length > 4) return '一次最多上传 4 张图片。'
  if (files.some((file) => file.type !== 'image/jpeg' && file.type !== 'image/png')) return '仅支持 JPEG 或 PNG 图片。'
  if (files.some((file) => file.size > MAX_UPLOAD_BYTES)) return '单张图片不能超过 30 MiB。'
  return ''
}
