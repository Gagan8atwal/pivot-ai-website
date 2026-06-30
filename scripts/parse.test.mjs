#!/usr/bin/env node
/**
 * Logic tests for lib/parse.ts — the wrapped-list unwrapping that fixes the
 * dashboard "Recent Leads" / "Upcoming Appointments" bug. The backend returns
 * `{ leads: [...] }` and `{ appointments: [...] }`; reading those as bare
 * arrays throws "res.map is not a function". These assert the parser pulls the
 * array out of the documented key.
 *
 * Node (>=22.18 / 24) strips the TS types at load. Run with `npm test`.
 */
import assert from 'node:assert/strict'
import { pickArray } from '../lib/parse.ts'

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

console.log('\npickArray — GET /app/leads → { leads: [...] }')

test('unwraps a populated leads array', () => {
  const res = { leads: [{ id: '1', name: 'Ada' }, { id: '2', name: 'Babbage' }] }
  const out = pickArray(res, 'leads')
  assert.equal(Array.isArray(out), true)
  assert.equal(out.length, 2)
  assert.equal(out[0].name, 'Ada')
})

test('empty {"leads":[]} → [] (empty state, not an error)', () => {
  assert.deepEqual(pickArray({ leads: [] }, 'leads'), [])
})

test('a wrapped object is NOT itself iterable as an array (regression guard)', () => {
  const res = { leads: [{ id: '1' }] }
  // The old bug: treating `res` as the array. Guard that res itself isn't one.
  assert.equal(Array.isArray(res), false)
  assert.equal(pickArray(res, 'leads').length, 1)
})

console.log('\npickArray — GET /app/appointments → { appointments: [...] }')

test('unwraps a populated appointments array', () => {
  const res = {
    appointments: [
      { id: 'a1', customer_name: 'Grace', scheduled_start: '2099-01-01T10:00:00Z' },
    ],
  }
  const out = pickArray(res, 'appointments')
  assert.equal(out.length, 1)
  assert.equal(out[0].customer_name, 'Grace')
})

test('empty {"appointments":[]} → []', () => {
  assert.deepEqual(pickArray({ appointments: [] }, 'appointments'), [])
})

console.log('\npickArray — robustness')

test('a bare array is returned as-is', () => {
  assert.deepEqual(pickArray([1, 2, 3], 'leads'), [1, 2, 3])
})

test('null / undefined / garbage → []', () => {
  assert.deepEqual(pickArray(null, 'leads'), [])
  assert.deepEqual(pickArray(undefined, 'appointments'), [])
  assert.deepEqual(pickArray('nope', 'leads'), [])
  assert.deepEqual(pickArray(42, 'leads'), [])
})

test('missing key → [] (does not throw)', () => {
  assert.deepEqual(pickArray({ total: 0 }, 'leads'), [])
})

test('first matching key wins across fallbacks', () => {
  assert.deepEqual(pickArray({ data: [9] }, 'data', 'leads'), [9])
})

if (failures > 0) {
  console.error(`\n${failures} of ${count} parse tests failed.\n`)
  process.exit(1)
}
console.log(`\nAll ${count} parse (wrapped-list) tests passed.\n`)
