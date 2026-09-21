import assert from 'node:assert/strict'
import { validateUploadFiles } from './upload.ts'

const image = { type: 'image/jpeg', size: 1024 }
assert.match(validateUploadFiles([]), /选择/)
assert.match(validateUploadFiles(Array.from({ length: 5 }, () => image)), /4/)
assert.match(validateUploadFiles([{ type: 'image/gif', size: 1024 }]), /JPEG|PNG/)
assert.match(validateUploadFiles([{ type: 'image/png', size: 30 * 1024 * 1024 + 1 }]), /30/)
assert.equal(validateUploadFiles([image]), '')
