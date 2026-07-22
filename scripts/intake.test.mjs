#!/usr/bin/env node

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  INTAKE_LIMITS,
  SMS_CONSENT_METHOD,
  SMS_CONSENT_PREFIX,
  SMS_CONSENT_TEXT,
  SMS_CONSENT_VERSION,
  createSubmissionId,
  isUuid,
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  phoneDigits,
  splitName,
} from '../lib/intake.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (relative) => readFileSync(join(root, relative), 'utf8')

let failures = 0
let count = 0
function test(name, fn) {
  count++
  try {
    fn()
    console.log(`  ✓ ${name}`)
  } catch (error) {
    failures++
    console.error(`  ✗ ${name}`)
    console.error(`    ${error.message}`)
  }
}

console.log('\npublic intake identity and validation')

test('client submission ids are valid random UUIDs', () => {
  const first = createSubmissionId()
  const second = createSubmissionId()
  assert.ok(isUuid(first))
  assert.ok(isUuid(second))
  assert.notEqual(first, second)
})

test('email and phone normalization enforce practical bounds', () => {
  assert.equal(normalizeEmail('  Person@Example.COM  '), 'person@example.com')
  assert.equal(isValidEmail('person@example.com'), true)
  assert.equal(isValidEmail('not-an-email'), false)
  assert.equal(phoneDigits('+1 (559) 555-0100'), '15595550100')
  assert.equal(isValidPhone('+1 (559) 555-0100'), true)
  assert.equal(isValidPhone('1234'), false)
})

test('name splitting preserves the remainder as the last name', () => {
  assert.deepEqual(splitName('Ada Lovelace'), ['Ada', 'Lovelace'])
  assert.deepEqual(splitName('Gagan Deep Singh'), ['Gagan', 'Deep Singh'])
  assert.deepEqual(splitName('Prince'), ['Prince', null])
})

test('public request limits are finite and conservative', () => {
  assert.equal(INTAKE_LIMITS.maxBodyBytes, 20_000)
  assert.ok(INTAKE_LIMITS.minFormFillMs >= 1_000)
  assert.ok(INTAKE_LIMITS.maxFormAgeMs <= 24 * 60 * 60 * 1_000)
  assert.ok(INTAKE_LIMITS.maxMatchingSubmissionsPerWindow <= 3)
})

console.log('\nconsent evidence contract')

test('consent text has an explicit version and one canonical sentence', () => {
  assert.equal(SMS_CONSENT_VERSION, '2026-07-22-v1')
  assert.equal(SMS_CONSENT_METHOD, `web_form:${SMS_CONSENT_VERSION}`)
  assert.equal(
    SMS_CONSENT_TEXT,
    `${SMS_CONSENT_PREFIX} See our Privacy Policy and Terms of Service.`
  )
  assert.match(SMS_CONSENT_TEXT, /Reply STOP to opt out/)
})

test('demo UI renders the shared consent contract instead of duplicating copy', () => {
  const source = read('app/demo/page.tsx')
  assert.match(source, /SMS_CONSENT_PREFIX/)
  assert.doesNotMatch(source, /I agree to receive SMS updates from Pivot AI/)
})

test('customer email reuses the same consent sentence', () => {
  const source = read('lib/demo-emails.ts')
  assert.match(source, /SMS_CONSENT_PREFIX/)
})

test('consent metadata is conditional on an affirmative checkbox', () => {
  const source = read('app/api/demo/route.ts')
  assert.match(source, /sms_consent_at:\s*consent \? now : null/)
  assert.match(source, /sms_consent_ip:\s*consent \? requestIp\(request\) : null/)
  assert.match(source, /sms_consent_method:\s*consent \? SMS_CONSENT_METHOD : null/)
})

console.log('\nidempotency and recovery wiring')

for (const [label, relative] of [
  ['contact form', 'app/contact/page.tsx'],
  ['demo form', 'app/demo/page.tsx'],
]) {
  test(`${label} sends a stable submission id and form start time`, () => {
    const source = read(relative)
    assert.match(source, /submissionId:\s*createSubmissionId\(\)/)
    assert.match(source, /formStartedAt:\s*Date\.now\(\)/)
    assert.match(source, /JSON\.stringify\(\{ \.\.\.form, \.\.\.submissionMeta \}\)/)
  })
}

for (const [label, relative] of [
  ['contact API', 'app/api/contact/route.ts'],
  ['demo API', 'app/api/demo/route.ts'],
]) {
  test(`${label} validates request metadata and persists the client id`, () => {
    const source = read(relative)
    assert.match(source, /parseSubmissionMeta\(body\)/)
    assert.match(source, /id:\s*submissionId/)
  })

  test(`${label} uses tracked delivery rather than direct provider calls`, () => {
    const source = read(relative)
    assert.match(source, /sendTrackedIntakeEmail/)
    assert.doesNotMatch(source, /\.emails\.send\(/)
  })
}

test('email helper writes a ledger and uses Resend idempotency keys', () => {
  const source = read('lib/intake-email.ts')
  assert.match(source, /from\('email_events'\)/)
  assert.match(source, /idempotencyKey:\s*resendIdempotencyKey/)
  assert.match(source, /status:\s*'already_sent'/)
  assert.match(source, /recordIntakeEmailFailure/)
  assert.match(source, /if \(!ledger \|\| ledger\.alreadySent\) return/)
})

test('calendar creation uses a deterministic event id and accepts duplicate conflicts', () => {
  const source = read('lib/google-calendar.ts')
  assert.match(source, /calendarEventId\(input\.submissionId\)/)
  assert.match(source, /id:\s*eventId/)
  assert.match(source, /response\.status === 409/)
  assert.match(source, /AbortController/)
})

test('server rejects cross-site, oversized, too-fast, and expired submissions', () => {
  const source = read('lib/intake-server.ts')
  assert.match(source, /fetchSite === 'cross-site'/)
  assert.match(source, /INTAKE_LIMITS\.maxBodyBytes/)
  assert.match(source, /age < INTAKE_LIMITS\.minFormFillMs/)
  assert.match(source, /age > INTAKE_LIMITS\.maxFormAgeMs/)
})

console.log('\npublic claim alignment')

for (const relative of [
  'app/contact/page.tsx',
  'app/demo/page.tsx',
  'lib/demo-emails.ts',
]) {
  test(`${relative} makes no automatic trial or billing promise`, () => {
    const source = read(relative).toLowerCase()
    assert.doesNotMatch(source, /14-day free trial/)
    assert.doesNotMatch(source, /trial included/)
    assert.doesNotMatch(source, /no billing until/)
    assert.doesNotMatch(source, /confirmation email on its way/)
    assert.doesNotMatch(source, /placeholder was added/)
  })
}

if (failures > 0) {
  console.error(`\n${failures} of ${count} intake tests failed.\n`)
  process.exit(1)
}

console.log(`\nAll ${count} intake tests passed.\n`)
