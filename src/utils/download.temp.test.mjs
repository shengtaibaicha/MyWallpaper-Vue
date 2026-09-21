import assert from 'node:assert/strict'
import { downloadFilename, withObjectUrl } from './download.ts'

assert.equal(downloadFilename("attachment; filename*=UTF-8''%E9%A3%8E%E6%99%AF.jpg"), '风景.jpg')
assert.equal(downloadFilename(undefined), 'wallpaper.jpg')
assert.equal(downloadFilename('attachment; filename="landscape.jpg"'), 'landscape.jpg')

let revoked = false
assert.throws(() => withObjectUrl(new Blob(['x']), () => 'blob:test', () => { revoked = true }, () => { throw new Error('stop') }))
assert.equal(revoked, true)
