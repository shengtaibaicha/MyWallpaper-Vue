import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { useUserStore } from '../store/useUser'
import { resolveAccess, type AccessMeta } from './access'

const routes: RouteRecordRaw[] = [
  { path: '/home', name: 'Home', component: () => import('../page/Home.vue') },
  { path: '/upload', name: 'Upload', component: () => import('../page/Upload.vue'), meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: () => import('../page/Login.vue'), meta: { guestOnly: true } },
  { path: '/register', name: 'Register', component: () => import('../page/Register.vue'), meta: { guestOnly: true } },
  { path: '/profile', name: 'Profile', component: () => import('../page/Profile.vue'), meta: { requiresAuth: true } },
  { path: '/admin', name: 'Admin', component: () => import('../page/Admin.vue'), meta: { requiresAdmin: true } },
  { path: '/', redirect: '/home' },
  { path: '/:pathMatch(.*)*', redirect: '/home' },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  const store = useUserStore()
  return resolveAccess(to.meta as AccessMeta, {
    token: store.token,
    role: store.user?.role ?? '',
    path: to.fullPath,
  })
})

export default router
