// downloadFilename 从 Content-Disposition 安全解析文件名并提供稳定默认值。
export function downloadFilename(contentDisposition?: string): string {
  if (!contentDisposition) return 'wallpaper.jpg'
  const encoded = contentDisposition.match(/filename\*=(?:UTF-8'')?([^;]+)/i)?.[1]
  const plain = contentDisposition.match(/filename="?([^";]+)"?/i)?.[1]
  const candidate = (encoded ?? plain ?? '').trim().replace(/^"|"$/g, '')
  if (!candidate) return 'wallpaper.jpg'
  try {
    return decodeURIComponent(candidate)
  } catch {
    return candidate
  }
}

// withObjectUrl 在回调完成或抛错后都释放临时对象地址。
export function withObjectUrl<T>(
  blob: Blob,
  create: (value: Blob) => string,
  revoke: (url: string) => void,
  use: (url: string) => T,
): T {
  const url = create(blob)
  try {
    return use(url)
  } finally {
    revoke(url)
  }
}

// triggerBlobDownload 在浏览器中触发下载并立即清理临时资源。
export function triggerBlobDownload(blob: Blob, contentDisposition?: string): void {
  withObjectUrl(blob, URL.createObjectURL, URL.revokeObjectURL, (url) => {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = downloadFilename(contentDisposition)
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  })
}
