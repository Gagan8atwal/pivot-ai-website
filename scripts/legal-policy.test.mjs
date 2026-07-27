#!/usr/bin/env node
/**
 * Operational policy-alignment gate.
 *
 * This is not a legal-compliance certification. It prevents public Privacy and
 * Terms pages from reintroducing product, billing, retention, consent, security,
 * or cancellation promises that the current early-access system cannot prove.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (relativePath) => readFileSync(join(root, relativePath), 'utf8')

const privacy = read('app/privacy/page.tsx')
const terms = read('app/terms/page.tsx')
const combined = `${privacy}\n${terms}`

const forbiddenPromises = [
  /14-day\s+free\s+trial\s+requires\s+no\s+payment/i,
  /We\s+retain\s+call\s+records,\s*transcripts,\s*and\s*lead\s+data.*active\s+subscription\s+plus\s+90\s+days/is,
  /verbal\s+consent,?\s+which\s+is\s+recorded/i,
  /regular\s+security\s+reviews/i,
  /cancel\s+your\s+subscription\s+at\s+any\s+time\s+through\s+your\s+account\s+dashboard/i,
  /appointment\s+booking,\s+SMS\s+and\s+email\s+notifications.*included/i,
  /we\s+only\s+send\s+SMS.*explicitly\s+consented.*verbally/is,
  /receive\s+one\s+final\s+confirmation\s+and\s+no\s+further\s+messages/i,
  /industry-standard\s+security\s+measures/i,
  /access\s+the\s+personal\s+information\s+we\s+hold.*request\s+deletion/is,
]

let failures = 0
let count = 0

function test(name, fn) {
  count += 1
  try {
    fn()
    console.log(`  ✓ ${name}`)
  } catch (error) {
    failures += 1
    console.error(`  ✗ ${name}`)
    console.error(`    ${error.message}`)
  }
}

console.log('\nlegal policy — verified early-access lifecycle boundary')

test('privacy and terms use the current policy date', () => {
  assert.match(privacy, /July 27, 2026/)
  assert.match(terms, /July 27, 2026/)
})

test('both pages identify the same operating entity', () => {
  assert.match(privacy, /AL\s+Logistics\s+LLC/)
  assert.match(terms, /AL\s+Logistics\s+LLC/)
})

test('unsupported lifecycle promises do not return', () => {
  for (const pattern of forbiddenPromises) {
    assert.doesNotMatch(combined, pattern, `policy contains unsupported promise ${pattern}`)
  }
})

test('demo submission is separated from account, activation, billing, and charges', () => {
  assert.match(privacy, /does not create a customer account/i)
  assert.match(privacy, /begin a subscription/i)
  assert.match(terms, /does not create an account/i)
  assert.match(terms, /authorize a charge/i)
})

test('privacy describes conditional feature collection rather than universal capture', () => {
  assert.match(privacy, /Depending on the pilot configuration and provider support/i)
  assert.match(privacy, /when enabled/i)
  assert.match(privacy, /Appointment requests and later owner disposition/i)
})

test('messaging policy distinguishes written consent from unverified verbal workflows', () => {
  assert.match(privacy, /records affirmative written consent only when the optional SMS\s+checkbox is selected/i)
  assert.match(privacy, /do not represent.*recorded verbal consent/is)
  assert.match(privacy, /depends on the sender type and Twilio Messaging Service\s+configuration/i)
  assert.match(terms, /does not promise.*custom STOP, HELP, verbal-consent/is)
})

test('retention is category and purpose based, not a fictional fixed automation', () => {
  assert.match(privacy, /Retention varies by record type/i)
  assert.match(privacy, /do not currently promise an automatic/i)
  assert.match(privacy, /Provider copies, backups, logs,\s+legal holds/i)
})

test('privacy requests are conditional, verified, and not claimed as self-service', () => {
  assert.match(privacy, /Depending on where you live and the circumstances/i)
  assert.match(privacy, /verify your identity and authority/i)
  assert.match(privacy, /do not currently represent that every request can be completed through a self-service/i)
})

test('security wording avoids certification and absolute-security implications', () => {
  assert.match(privacy, /measures intended to reduce risk/i)
  assert.match(privacy, /no transmission or storage system is guaranteed secure/i)
  assert.match(privacy, /does not represent that Pivot AI has completed an independent security\s+certification/i)
})

test('terms distinguish appointment requests from confirmed bookings', () => {
  assert.match(terms, /Captured appointment times are requests/i)
  assert.match(terms, /Do not represent an appointment request as confirmed/i)
})

test('terms disclose AI, call, transfer, notification, and provider limitations', () => {
  assert.match(terms, /AI output may be incomplete, delayed, misunderstood, or incorrect/i)
  assert.match(terms, /Calls may fail because of carriers, networks, providers/i)
  assert.match(terms, /Transfers and notifications can fail or arrive late/i)
  assert.match(terms, /Third-Party Services/i)
})

test('terms do not claim ownership of third-party AI models', () => {
  assert.match(terms, /No ownership of a third-party AI model is claimed/i)
})

test('cancellation is contact-based unless an operational dashboard control exists', () => {
  assert.match(terms, /request cancellation by emailing/i)
  assert.match(terms, /dashboard cancellation control is available only if it is shown and operational/i)
})

if (failures > 0) {
  console.error(`\n${failures} of ${count} legal-policy tests failed.\n`)
  process.exit(1)
}

console.log(`\nAll ${count} legal-policy tests passed.\n`)
