import request from "../utils/request";

// 获取标签列表
export function getTags() {
  return request({
    url: 'wallpaper/file/tag/tags',
    method: 'get',
  });
}

// 根据分类标签获取图片列表
export function getImagesPageByTag(page:number, size:number, tagId:number) {
  return request({
    url: '/wallpaper/file/tag/find/page',
    method: 'post',
    data:{
      page,
      size,
      tagId
    }
  });
}