export interface ApiResult<T> {
  code: number
  message: string
  data: T
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

export interface Wallpaper {
  fileId: string
  fileUrl: string
  fileUrlse: string
  uploadTime: string
  status: string
  userId: string
  fileName: string
  fileTitle: string
  fileSize: number
  number: number
  collect?: boolean
}

export interface UserInfo {
  userName: string
  userEmail: string
  joinDate: string
  userAvatar: string
  uploadNumber: number
  downloadNumber: number
  collectNumber: number
  role: string
  enable: number
}

export interface Tag {
  tagId: number
  tagName: string
}

export interface AdminUser {
  userId: string
  userName: string
  userEmail: string
  joinDate: string
  role: string
  enable: number
}

export interface LoginData {
  token: string
}

export interface RegisterData {
  userId: string
}

export interface CollectionData {
  fileIds: string[]
}
