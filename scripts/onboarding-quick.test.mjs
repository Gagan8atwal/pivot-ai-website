#!/usr/bin/env node
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = readFileSync(join(root, 'components/app/onboarding/quick-setup.tsx'), 'utf8')

let failures = 0
let count = 0
function test(name, fn) {
  count++
  try {
    fn()
    console.log(`  ✓ ${name}`)
  } catch (err) {
    failures++
    console.error(`  ✗ ${name}`)
    console.error(`    ${err.message}`)
  }
}

console.log('\nQuick Setup release regressions')

test('backend-not-ready remains visibly blocked instead of claiming activation', () => {
  assert.match(source, /const blockers = result\?\.readiness\?\.blockers \|\| \[\]/)
  assert.match(source, /blockers\.length > 0/)
  assert.match(source, />Still required</)
  assert.match(source, /result\.activated \? 'Setup activated' : 'Setup saved'/)
  assert.match(source, /Only the items below still prevent activation\./)
})

test('quick endpoint error offers Advanced fallback without discarding entered fields', () => {
  assert.match(source, /catch \(err\) \{\s*setError\(errorMessage\(err\)\)/)
  assert.match(source, />Open advanced setup instead</)
  assert.match(source, /if \(advanced\) \{/)
  assert.match(source, />Quick Setup draft preserved</)
  assert.match(source, />Return to Quick Setup</)

  for (const field of [
    'businessName',
    'businessProfile',
    'services',
    'hours',
    'timezone',
    'ownerPhone',
    'ownerEmail',
    'agentName',
    'tone',
    'pronunciationHints',
    'bookingEnabled',
  ]) {
    assert.match(source, new RegExp(`form\\.${field}`), `${field} is not preserved in Advanced fallback`)
  }
})

test('activation is requested once through one primary submit CTA', () => {
  assert.equal((source.match(/activate: true/g) ?? []).length, 1, 'activate=true must have one request site')
  assert.equal((source.match(/type="submit"/g) ?? []).length, 1, 'Quick Setup must expose one submit CTA')
  assert.equal((source.match(/Build my receptionist/g) ?? []).length, 1, 'primary activation CTA must be singular')
})

test('phone readiness and messaging/carrier approval stay separate from setup activation', () => {
  assert.match(source, /const phoneReady = result\?\.integrations\?\.phone === true/)
  assert.match(source, /Phone service is not considered live until the phone integration reports ready\./)
  assert.match(source, /Messaging and carrier approval remain separate statuses\./)
})

test('Advanced fallback itself does not silently submit the preserved Quick draft', () => {
  const advancedBlock = source.slice(source.indexOf('if (advanced) {'), source.indexOf('if (!isApiConfigured)'))
  assert.ok(advancedBlock.length > 0, 'Advanced fallback block not found')
  assert.doesNotMatch(advancedBlock, /apiFetch|method:\s*'POST'|activate:\s*true/)
  assert.match(advancedBlock, /<OnboardingWizard \/>/)
})

if (failures > 0) {
  console.error(`\n${failures} of ${count} Quick Setup tests failed.\n`)
  process.exit(1)
}

console.log(`\nAll ${count} Quick Setup tests passed.\n`)
