import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import Home from '../page/Home.vue';
import Upload from '../page/Upload.vue';
import Login from '../page/Login.vue';
import Register from '../page/Register.vue';
import Profile from '../page/Profile.vue';
import Admin from '../page/Admin.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/upload',
    name: 'Upload',
    component: Upload
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path:'/profile',
    name:'Profile',
    component: Profile
  },
  {
    path:'/admin',
    name:'Admin',
    component: Admin
  },
  {
    path:'/',
    redirect:'/home'
  }
  
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;