#!/usr/bin/env node
/**
 * Regression tests for plan pricing.
 *
 * Guards the defect where the in-app billing page advertised
 * "Starter $99 / Pro $249 / Scale $599" while the marketing site advertised
 * the real "Starter $49 / Pro $149 / Premium $299". Wrong prices and a plan
 * ("Scale") that does not exist in Stripe were shown to signed-in customers.
 *
 * The fix is `lib/pricing.ts` as the single source of truth. These tests pin
 * the amounts and names, and assert that no surface re-declares its own price
 * table. Imports the pure TypeScript module directly — Node (>=22.18 / 24)
 * strips the types at load. No test-runner dependency. Run with `npm test`.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { PRICING_PLANS, getPlan, formatMonthlyPrice } from '../lib/pricing.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (rel) => readFileSync(join(root, rel), 'utf8')

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

/** The authoritative table, mirrored from the live Stripe account. */
const EXPECTED = [
  { id: 'starter', name: 'Starter', price: 49, envVar: 'STRIPE_PRICE_STARTER' },
  { id: 'pro', name: 'Pro', price: 149, envVar: 'STRIPE_PRICE_PRO' },
  { id: 'premium', name: 'Premium', price: 299, envVar: 'STRIPE_PRICE_PREMIUM' },
]

/** Prices that were wrong in the app and must never reappear. */
const WRONG_PRICES = [99, 249, 599]

console.log('\nplan table — exactly three plans at the Stripe amounts')

test('exports exactly three plans', () => {
  assert.equal(PRICING_PLANS.length, 3)
})

for (const expected of EXPECTED) {
  test(`${expected.name} is $${expected.price}/month`, () => {
    const plan = PRICING_PLANS.find((p) => p.id === expected.id)
    assert.ok(plan, `no plan with id "${expected.id}"`)
    assert.equal(plan.name, expected.name)
    assert.equal(plan.price, expected.price)
    assert.equal(plan.period, 'month')
  })
}

test('plan names are exactly Starter / Pro / Premium, in order', () => {
  assert.deepEqual(
    PRICING_PLANS.map((p) => p.name),
    ['Starter', 'Pro', 'Premium'],
  )
})

test('monthly prices are exactly 49 / 149 / 299, in order', () => {
  assert.deepEqual(
    PRICING_PLANS.map((p) => p.price),
    [49, 149, 299],
  )
})

test('there is no plan named "Scale"', () => {
  assert.ok(
    !PRICING_PLANS.some((p) => p.name.toLowerCase() === 'scale' || p.id === 'scale'),
    'the "Scale" plan does not exist in Stripe and must not be advertised',
  )
})

test(`no plan costs $${WRONG_PRICES.join(' / $')} (the old in-app figures)`, () => {
  for (const wrong of WRONG_PRICES) {
    assert.ok(
      !PRICING_PLANS.some((p) => p.price === wrong),
      `a plan is priced at the incorrect $${wrong}`,
    )
  }
})

test('every plan references its Stripe price id by env var NAME only', () => {
  for (const expected of EXPECTED) {
    const plan = PRICING_PLANS.find((p) => p.id === expected.id)
    assert.equal(plan.stripePriceEnvVar, expected.envVar)
  }
  // A literal Stripe price id (price_…) would be config leaking into source.
  assert.ok(!/price_[A-Za-z0-9]/.test(read('lib/pricing.ts')), 'no Stripe price id in source')
})

test('every plan has a CTA label and target, and at least one feature', () => {
  for (const plan of PRICING_PLANS) {
    assert.ok(plan.cta && plan.cta.trim().length > 0, `${plan.name} has no CTA label`)
    assert.ok(plan.ctaHref.startsWith('/'), `${plan.name} CTA must be an internal path`)
    assert.ok(Array.isArray(plan.features) && plan.features.length > 0, `${plan.name} features`)
  }
})

test('exactly one plan is highlighted as most popular', () => {
  assert.equal(PRICING_PLANS.filter((p) => p.highlight).length, 1)
})

console.log('\nhelpers')

test('getPlan resolves by id, case-insensitively', () => {
  assert.equal(getPlan('pro').price, 149)
  assert.equal(getPlan('PREMIUM').name, 'Premium')
  assert.equal(getPlan('scale'), undefined)
  assert.equal(getPlan(''), undefined)
  assert.equal(getPlan(null), undefined)
})

test('formatMonthlyPrice renders the advertised string', () => {
  assert.deepEqual(PRICING_PLANS.map(formatMonthlyPrice), ['$49/mo', '$149/mo', '$299/mo'])
})

console.log('\nsingle source of truth — no surface may re-declare prices')

const SURFACES = [
  ['marketing pricing section', 'components/sections/pricing.tsx'],
  ['in-app billing page', 'app/(app)/billing/page.tsx'],
]

for (const [label, rel] of SURFACES) {
  test(`${label} imports from lib/pricing`, () => {
    assert.match(read(rel), /from '@\/lib\/pricing'/, `${rel} must import @/lib/pricing`)
  })

  test(`${label} declares no prices of its own`, () => {
    const src = read(rel)
    // Any price-shaped literal outside lib/pricing.ts is a divergence risk.
    const dollarLiterals = src.match(/\$\d[\d,]*/g) ?? []
    assert.deepEqual(dollarLiterals, [], `${rel} hardcodes ${dollarLiterals.join(', ')}`)
    for (const wrong of [...WRONG_PRICES, 49, 149, 299]) {
      assert.ok(
        !new RegExp(`price:\\s*'?\\$?${wrong}`).test(src),
        `${rel} hardcodes a price of ${wrong}`,
      )
    }
    assert.ok(!/\bScale\b/.test(src), `${rel} still mentions the non-existent "Scale" plan`)
  })
}

test('the /pricing route reuses the shared pricing section', () => {
  const src = read('app/pricing/page.tsx')
  assert.match(src, /components\/sections\/pricing/, '/pricing must reuse <Pricing />')
  assert.deepEqual(
    (src.match(/\$\d[\d,]*/g) ?? []).sort(),
    ['$149', '$149', '$299', '$299', '$49', '$49'],
    'only the SEO description may quote prices, and it must quote 49/149/299',
  )
})

if (failures > 0) {
  console.error(`\n${failures} of ${count} pricing tests failed.\n`)
  process.exit(1)
}
console.log(`\nAll ${count} pricing tests passed.\n`)
