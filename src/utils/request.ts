import axios from 'axios';
import { useUserStore } from '../store/useUser';
import { getActivePinia } from 'pinia';

// 创建 axios 实例
const request = axios.create({
  // baseURL: "http://localhost:8088", // API 基础路径
  // baseURL: 'http://59.153.164.121:8088',
  // baseURL: 'http://localhost:8888',
  timeout: 600000, // 请求超时时间
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么，例如添加 token
    // 正确方式：通过pinia实例获取store
    const pinia = getActivePinia();
    const userStore = useUserStore(pinia)
    const token = userStore.token;
    if (token != '') {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    // 处理请求错误
    console.error('请求出错:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    const res = response;
    // if (res.code !== 200) {
    //   // 处理业务错误
    //   console.error('业务错误:', res.code);
    //   return Promise.reject(new Error(res.message || 'Error'));
    // }
    return res;
  },
  (error) => {
    // 处理响应错误
    console.error('响应出错:', error.message);
    return Promise.reject(error);
  }
);

export default request;