import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (relative) => readFileSync(path.join(root, relative), 'utf8')

console.log('appointment owner actions')

const page = read('app/(app)/appointments/page.tsx')

assert.match(page, /apiFetch<\{ appointment: Appointment \}>\(`\/app\/appointments\/\$\{appointment\.id\}`/)
assert.match(page, /method: 'PATCH'/)
assert.match(page, /body: \{ status \}/)
assert.match(page, /onStatusChange\(appointment, 'confirmed'\)/)
assert.match(page, /onStatusChange\(appointment, 'completed'\)/)
assert.match(page, /onStatusChange\(appointment, 'cancelled'\)/)
assert.match(page, /role="alert"/)
assert.match(page, /Review appointment requests/)
assert.match(page, /captured a requested time/)
assert.doesNotMatch(page, /Everything Pivot AI books for you/)
assert.doesNotMatch(page, /When Pivot AI books a caller/)

console.log('appointment-owner-actions: all assertions passed')
