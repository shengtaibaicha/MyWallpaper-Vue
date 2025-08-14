// src/api/user.js
import request from '../utils/request';
import { useUserStore } from '../store/useUser';

// 用户注册
export function userRegister(username:String, password:String, email:String, code:String) {
  const store = useUserStore()
  return request({
    url: '/wallpaper/user/register',
    method: 'post',
    headers:{
      'redisKey':store.redisKey
    },
    data:{
      userName:username,
      userPassword:password,
      userEmail:email,
      captchaCode:code
    },
    // withCredentials:true
  });
}

// 用户登录
export function userLogin(username:String, password:String, code:String) {
  const store = useUserStore()
  return request({
    url: '/wallpaper/user/login',
    method: 'post',
    headers:{
      'redisKey':store.redisKey
    },
    data:{
      userName:username,
      userPassword:password,
      captchaCode:code
    },
    // withCredentials:true
  });
}

// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/wallpaper/user/info',
    method: 'get'
  });
}