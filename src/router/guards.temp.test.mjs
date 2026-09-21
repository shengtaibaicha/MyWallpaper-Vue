import assert from 'node:assert/strict'
import { resolveAccess } from './access.ts'

assert.deepEqual(resolveAccess({ requiresAuth: true }, { token: '', role: '', path: '/upload' }), {
  path: '/login', query: { redirect: '/upload' },
})
assert.deepEqual(resolveAccess({ guestOnly: true }, { token: 'token', role: 'user', path: '/login' }), { path: '/home' })
assert.deepEqual(resolveAccess({ requiresAdmin: true }, { token: 'token', role: 'user', path: '/admin' }), { path: '/home' })
assert.equal(resolveAccess({ requiresAdmin: true }, { token: 'token', role: 'admin', path: '/admin' }), true)
