import request from '../utils/request';

// 管理员获取分页获取全部文件
export function AdminPage(page:number, size:number, filter:string) {
  return request({
    url: '/wallpaper/admin/file',
    method: 'get',
    params: {
      page,
      size,
      filter
    }
  });
}

// 更新文件审核状态
export function updateFileAuditStatus(fileId:string, audited:string) {
  return request({
    url: '/wallpaper/admin/audit',
    method: 'put',
    data:{
      fileId: fileId,
      audited: audited,
    }
  });
}

// 获取用户列表
export function getUserList(page:number, size:number, role:string) {
  return request({
    url: '/wallpaper/admin/user',
    method: 'get',
    params:{
      page,
      size,
      role,
    }
  });
}

// 修改用户状态
export function userStatus(userId:string) {
  return request({
    url: '/wallpaper/admin/status',
    method: 'put',
    data: {
      userId
    }
  });
}