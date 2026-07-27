#!/usr/bin/env node
/**
 * Static public-claims release gate.
 *
 * Pivot AI is currently offered through a founder-assisted early-access pilot.
 * Public pages must not claim self-service activation, guaranteed call coverage,
 * automatic confirmed appointments, universal lead capture, or provider behavior
 * that has not been verified for the customer's configuration.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (relativePath) => readFileSync(join(root, relativePath), 'utf8')

const PUBLIC_SURFACES = [
  'components/sections/hero.tsx',
  'components/sections/cta.tsx',
  'components/sections/how-it-works.tsx',
  'components/sections/features.tsx',
  'components/sections/pricing.tsx',
  'components/sections/faq.tsx',
  'app/pricing/page.tsx',
  'lib/pricing.ts',
]

const FORBIDDEN_CLAIMS = [
  /14-day\s+free\s+trial/i,
  /start\s+free\s+trial/i,
  /no\s+credit\s+card\s+required/i,
  /zero\s+financial\s+risk/i,
  /every\s+call\s+is\s+answered/i,
  /answers\s+every\s+call/i,
  /never\s+miss\s+(?:a|another)\s+call/i,
  /creates\s+confirmed\s+appointments\s+automatically/i,
  /appointment\s+booked/i,
  /books\s+appointments/i,
  /no\s+double\s+bookings/i,
  /no\s+missed\s+appointments/i,
  /every\s+caller\s+becomes\s+a\s+lead/i,
  /every\s+lead.*every\s+appointment/i,
  /most\s+callers\s+assume.*human/i,
  /won['’]?t\s+guess\s+or\s+make\s+things\s+up/i,
  /never\s+sell\s+or\s+share\s+your\s+customer\s+data/i,
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

console.log('\npublic claims — verified early-access boundary')

for (const relativePath of PUBLIC_SURFACES) {
  test(`${relativePath} avoids unsupported absolute or self-service claims`, () => {
    const source = read(relativePath)
    for (const pattern of FORBIDDEN_CLAIMS) {
      assert.doesNotMatch(source, pattern, `${relativePath} contains unsupported claim ${pattern}`)
    }
  })
}

test('hero identifies early access and uses appointment-request language', () => {
  const source = read('components/sections/hero.tsx')
  assert.match(source, /Founder-led Early Access/)
  assert.match(source, /Appointment request/)
  assert.match(source, /Demo requests do not activate service/)
})

test('how-it-works requires testing before activation', () => {
  const source = read('components/sections/how-it-works.tsx')
  assert.match(source, /Tested before activation/i)
  assert.match(source, /before live customer calls are enabled/i)
})

test('feature section describes conditional provider capabilities', () => {
  const source = read('components/sections/features.tsx')
  assert.match(source, /when enabled/i)
  assert.match(source, /subject to/i)
  assert.match(source, /requires separate quality testing/i)
})

test('final CTA states that a demo request does not activate or bill service', () => {
  const source = read('components/sections/cta.tsx')
  assert.match(source, /does not create an account, start billing or activate phone service/i)
})

test('pricing CTA remains a pilot request rather than checkout activation', () => {
  const pricingSource = read('lib/pricing.ts')
  assert.equal((pricingSource.match(/cta: 'Request Pilot Demo'/g) ?? []).length, 2)
  assert.match(read('components/sections/pricing.tsx'), /founder-assisted/i)
})

if (failures > 0) {
  console.error(`\n${failures} of ${count} public-claims tests failed.\n`)
  process.exit(1)
}

console.log(`\nAll ${count} public-claims tests passed.\n`)
