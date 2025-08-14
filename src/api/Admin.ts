import request from '../utils/request';

// 管理员获取分页获取全部文件
export function AdminPage(page:number, size:number) {
  return request({
    url: '/wallpaper/admin/file',
    method: 'get',
    params: {
      page,
      size
    }
  });
}