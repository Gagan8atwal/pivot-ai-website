#!/usr/bin/env node
/**
 * Tests for the website-import review UI helpers.
 *
 * The defect class these guard against is not a crash — it is an interface that
 * quietly overclaims. If "Accepted" reads as "live", a customer will believe a
 * scraped price is already being quoted on calls when nothing has been applied.
 * So the assertions here are mostly about what the wording is NOT allowed to
 * say, and about a high-risk value never being pre-ticked.
 *
 * Imports the TypeScript module directly — Node strips the types at load.
 */
import assert from 'node:assert/strict'
import {
  fieldLabel, riskExplanations, derivationLabel, reviewStatusLine, canPreselect,
  sortForReview, outstandingCount, importErrorMessage, jobStatusLabel, summaryLine,
} from '../lib/import.ts'

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

const candidate = (over = {}) => ({
  id: 'c1', field_key: 'business_name', value_text: 'Acme',
  derivation: 'verified', confidence: 0.95, high_risk: false, risk_reason: null,
  review: null, applied: false, ...over,
})

console.log('\nimport review — wording must never overclaim')

test('an accepted value says it has not been applied', () => {
  const line = reviewStatusLine(candidate({ review: { decision: 'accepted' }, applied: false }))
  assert.equal(line, 'Reviewed, not yet applied.')
  assert.ok(!/\blive\b|\bin use\b|\bactive\b/i.test(line))
})

test('no review status claims a value is live until applied is true', () => {
  for (const decision of ['accepted', 'edited', 'rejected', 'deferred', 'something_new']) {
    const line = reviewStatusLine(candidate({ review: { decision }, applied: false }))
    assert.ok(
      !/\bapplied to\b|\blive\b|\bin use\b|\bnow using\b/i.test(line),
      `"${line}" implies the value is in use`
    )
  }
  // And when it genuinely is applied, it says so.
  assert.equal(
    reviewStatusLine(candidate({ review: { decision: 'accepted' }, applied: true })),
    'Applied to your settings.'
  )
})

test('an unreviewed value says so', () => {
  assert.equal(reviewStatusLine(candidate()), 'Not reviewed yet.')
})

console.log('\nimport review — high risk is never pre-selected')

test('a high-risk value is not pre-selected at any confidence', () => {
  assert.equal(canPreselect({ high_risk: true, derivation: 'verified', confidence: 1 }), false)
  assert.equal(canPreselect({ high_risk: true, derivation: 'verified', confidence: 0.99 }), false)
})

test('only high-confidence verified values are pre-selected', () => {
  assert.equal(canPreselect({ high_risk: false, derivation: 'verified', confidence: 0.95 }), true)
  assert.equal(canPreselect({ high_risk: false, derivation: 'verified', confidence: 0.84 }), false)
  assert.equal(canPreselect({ high_risk: false, derivation: 'inferred', confidence: 0.99 }), false)
})

test('risk reasons are explained in terms a business owner can act on', () => {
  const [explanation] = riskExplanations('contains_price')
  assert.ok(/price/i.test(explanation))
  assert.ok(explanation.length > 20, 'an explanation must say more than the code did')
  // An unknown code still produces something, never an empty flag.
  assert.equal(riskExplanations('brand_new_code').length, 1)
  assert.deepEqual(riskExplanations(null), [])
  assert.equal(riskExplanations('contains_price,contains_guarantee').length, 2)
})

console.log('\nimport review — ordering and counts')

test('unreviewed high-risk values sort to the top', () => {
  const sorted = sortForReview([
    candidate({ id: 'reviewed', review: { decision: 'accepted' }, field_key: 'address' }),
    candidate({ id: 'plain', field_key: 'phone' }),
    candidate({ id: 'risky', field_key: 'pricing', high_risk: true }),
    candidate({ id: 'deferred', field_key: 'hours', review: { decision: 'deferred' } }),
  ])
  assert.deepEqual(sorted.map((c) => c.id), ['risky', 'plain', 'deferred', 'reviewed'])
})

test('deferred values still count as outstanding', () => {
  const list = [
    candidate({ id: 'a' }),
    candidate({ id: 'b', review: { decision: 'deferred' } }),
    candidate({ id: 'c', review: { decision: 'accepted' } }),
    candidate({ id: 'd', review: { decision: 'rejected' } }),
  ]
  assert.equal(outstandingCount(list), 2)
})

console.log('\nimport review — failures are described honestly')

test('a refusal is described as a refusal, not a generic failure', () => {
  assert.match(importErrorMessage('blocked_host'), /private or internal/i)
  assert.match(importErrorMessage('resolves_to_private'), /private network/i)
  assert.match(importErrorMessage('blocked_scheme'), /http/i)
  assert.equal(jobStatusLabel({ status: 'blocked' }), 'Refused')
})

test('an unknown error code still produces an honest message', () => {
  assert.match(importErrorMessage('brand_new_reason'), /brand_new_reason/)
  assert.match(importErrorMessage('http_503'), /503/)
  assert.equal(importErrorMessage(null), 'The import did not complete.')
})

test('a partial run is not reported as a clean success', () => {
  assert.notEqual(jobStatusLabel({ status: 'partial' }), jobStatusLabel({ status: 'succeeded' }))
  assert.match(jobStatusLabel({ status: 'partial' }), /skipped/i)
})

console.log('\nimport review — the summary tells the truth')

test('the summary leads with what needs a person', () => {
  const line = summaryLine({
    pagesFetched: 4, pagesBlocked: 1, candidates: 9,
    verified: 5, inferred: 4, highRisk: 2, conflicts: 1, injectionPages: 1,
  })
  assert.match(line, /9 values found across 4 pages/)
  assert.match(line, /2 needs your sign-off/)
  assert.match(line, /1 disagree/)
  assert.match(line, /1 page could not be read/)
  assert.match(line, /instruct an AI/)
})

test('a clean summary mentions nothing that did not happen', () => {
  const line = summaryLine({
    pagesFetched: 1, pagesBlocked: 0, candidates: 1,
    verified: 1, inferred: 0, highRisk: 0, conflicts: 0, injectionPages: 0,
  })
  assert.equal(line, '1 value found across 1 page.')
  assert.ok(!/sign-off|disagree|could not be read|instruct/.test(line))
})

test('field keys read as English, including unknown ones', () => {
  assert.equal(fieldLabel('business_name'), 'Business name')
  assert.equal(fieldLabel('opening_slots'), 'Opening slots')
  assert.equal(fieldLabel(''), '')
})

test('verified and inferred are described differently', () => {
  const v = derivationLabel('verified')
  const i = derivationLabel('inferred')
  assert.notEqual(v.label, i.label)
  assert.match(i.detail, /closer look|ambiguous/i)
})

console.log(`\n${count - failures}/${count} passed`)
process.exit(failures === 0 ? 0 : 1)
