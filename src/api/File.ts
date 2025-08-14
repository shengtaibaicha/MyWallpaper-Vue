// src/api/user.js
import request from '../utils/request';


// 下载图片
export function Download(filename:String) {
  return request({
    url: 'wallpaper/file/download',
    method: 'get',
    responseType:'blob',
    params:{
      fileName:filename
    },
  });
}

// 获取验证码图片
export function getKaptcha() {
  return request({
    url: 'wallpaper/user/captcha',
    method: 'get',
  });
}

// 上传图片
export function Upload(file:FormData) {
  return request({
    url: 'wallpaper/file/upload',
    method: 'post',
    data: file, // 将FormData对象作为请求体
    headers: {
      'Content-Type': 'multipart/form-data' // 确保使用正确的Content-Type
    }
  });
}

// 分页获取图片列表
export function getImagesPage(page:number, size:number) {
  return request({
    url: '/wallpaper/file/find/page',
    method: 'get',
    params:{
      page:page,
      size:size
    },
  });
}

// 根据名字分页获取图片列表
export function getImagesPageName(page:number, size:number, name:string) {
  return request({
    url: '/wallpaper/file/find/name',
    method: 'get',
    params:{
      page:page,
      size:size,
      name:name
    },
  });
}

// 获取用户上传的壁纸
export function getUserWallpapers(page:number, size:number) {
  return request({
    url: '/wallpaper/file/user/page',
    method: 'get',
    params:{
      page:page,
      size:size
    },
  });
}

// 删除壁纸
export function deleteWallpaper(fileId:string) {
  return request({
    url: '/wallpaper/file/delete',
    method: 'delete',
    params:{
      fileId:fileId
    },
  });
}

// 重命名壁纸
export function renameWallpaper(fileId:number, newName:string) {
  return request({
    url: '/wallpaper/file/rename',
    method: 'put',
    data:{
      fileId:fileId,
      newName:newName
    },
  });
}

// 切换壁纸收藏状态
export function toggleFavorite(fileId:string) {
  return request({
    url: '/wallpaper/file/collect',
    method: 'post',
    data:{
      fileId
    }
  });
}

// 更新文件审核状态
export function updateFileAuditStatus(fileId:string, audited:boolean) {
  return request({
    url: '/wallpaper/file/audit',
    method: 'put',
    data:{
      fileId: fileId,
      audited: audited
    }
  });
}