import assert from 'node:assert/strict'
import { mediaUrl } from './media.ts'

assert.equal(mediaUrl('abc 1', 'thumbnail'), '/wallpaper/media/abc%201?variant=thumbnail')
assert.throws(() => mediaUrl('', 'thumbnail'))
