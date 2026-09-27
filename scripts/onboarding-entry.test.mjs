#!/usr/bin/env node
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const signup = readFileSync(join(root, 'app/(auth)/signup/page.tsx'), 'utf8')
const quick = readFileSync(join(root, 'components/app/onboarding/quick-setup.tsx'), 'utf8')

assert.match(signup, /if \(data\.session\) \{\s*router\.push\('\/onboarding'\)/)
assert.doesNotMatch(signup, /if \(data\.session\) \{\s*router\.push\('\/dashboard'\)/)
assert.match(quick, /receptionistPhone: form\.receptionistPhone\.trim\(\) \|\| undefined/)
assert.match(quick, /This field never buys a number\./)
assert.match(quick, /activate: true/)
assert.match(quick, /if \(!isApiConfigured \|\| meLoading \|\| !me\) return/)
assert.match(quick, /ensureTenant -> \/me handoff/)

console.log('Five-minute onboarding entry contract passed.')
