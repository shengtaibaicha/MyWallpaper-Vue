import type { RouteLocationRaw } from 'vue-router'

export interface AccessMeta {
  requiresAuth?: boolean
  requiresAdmin?: boolean
  guestOnly?: boolean
}

export interface AccessSession {
  token: string
  role: string
  path: string
}

// resolveAccess 根据路由元信息和本地会话决定放行或跳转。
export function resolveAccess(meta: AccessMeta, session: AccessSession): true | RouteLocationRaw {
  const authenticated = session.token.trim().length > 0
  if ((meta.requiresAuth || meta.requiresAdmin) && !authenticated) {
    return { path: '/login', query: { redirect: session.path } }
  }
  if (meta.guestOnly && authenticated) {
    return { path: '/home' }
  }
  if (meta.requiresAdmin && session.role !== 'admin' && session.role !== 'superAdmin') {
    return { path: '/home' }
  }
  return true
}
