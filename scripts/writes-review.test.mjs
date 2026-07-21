#!/usr/bin/env node
/**
 * Tests for the approved-changes UI helpers.
 *
 * The failure mode being guarded against is an interface that reports a change
 * as done when the backend only reported it as attempted. Applied-but-
 * unverified is a real outcome — it is exactly what a silent no-op looks like,
 * and this codebase has produced several of those — so it gets its own wording
 * and its own test, and undo is not offered for it.
 */
import assert from 'node:assert/strict'
import {
  writeToolLabel, approvalStatusLine, canApply, canUndo, minutesUntilExpiry,
  describeValue, writeErrorMessage, sortApprovals, diffFromApproval,
} from '../lib/writes.ts'

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

const approval = (over = {}) => ({
  id: 'a1', tool_name: 'update_greeting', status: 'pending',
  proposed_input: { field: 'greeting', value: 'New' },
  current_value: { greeting: 'Old' }, proposed_value: { greeting: 'New' },
  expires_at: '2999-01-01T00:00:00Z', created_at: '2026-07-20T10:00:00Z',
  applied_at: null, verified_at: null, undone_at: null, ...over,
})

console.log('\napproved changes — status must not overclaim')

test('pending says nothing has changed', () => {
  assert.match(approvalStatusLine(approval()), /Nothing has changed/)
})

test('approved is not applied', () => {
  const line = approvalStatusLine(approval({ status: 'approved' }))
  assert.equal(line, 'Approved, not yet applied.')
  assert.ok(!/\bconfirmed\b|\blive\b/i.test(line))
})

test('applied but unverified is called out, never shown as success', () => {
  // The silent no-op: the write returned ok and the value did not change.
  const line = approvalStatusLine(approval({
    status: 'applied', applied_at: '2026-07-20T11:00:00Z', verified_at: null,
  }))
  assert.match(line, /could not confirm/i)
  assert.ok(!/^Applied and confirmed/.test(line))
})

test('applied and verified says so plainly', () => {
  assert.equal(
    approvalStatusLine(approval({ status: 'applied', applied_at: 'x', verified_at: 'y' })),
    'Applied and confirmed.'
  )
})

test('rejected and expired both state that nothing changed', () => {
  assert.match(approvalStatusLine(approval({ status: 'rejected' })), /Nothing was changed/)
  assert.match(approvalStatusLine(approval({ status: 'expired' })), /Nothing was changed/)
})

console.log('\napproved changes — what the UI may offer')

test('apply is offered only for a live approval', () => {
  assert.equal(canApply(approval({ status: 'approved' })), true)
  assert.equal(canApply(approval({ status: 'pending' })), false)
  assert.equal(canApply(approval({ status: 'applied' })), false)
  assert.equal(canApply(approval({ status: 'approved', expires_at: '2020-01-01T00:00:00Z' })), false)
})

test('undo is not offered for an unverified apply', () => {
  // Offering undo would promise to restore a value we are not sure was replaced.
  assert.equal(canUndo(approval({ status: 'applied', applied_at: 'x', verified_at: null })), false)
  assert.equal(canUndo(approval({ status: 'applied', applied_at: 'x', verified_at: 'y' })), true)
  assert.equal(canUndo(approval({ status: 'applied', applied_at: 'x', verified_at: 'y', undone_at: 'z' })), false)
  assert.equal(canUndo(approval({ status: 'approved' })), false)
})

test('expiry countdown never goes negative', () => {
  assert.equal(minutesUntilExpiry('2020-01-01T00:00:00Z'), 0)
  assert.equal(minutesUntilExpiry(null), 0)
  const soon = new Date(Date.now() + 90_000).toISOString()
  assert.equal(minutesUntilExpiry(soon), 2)
})

console.log('\napproved changes — values read as English')

test('an unset value reads as (not set), never null', () => {
  assert.equal(describeValue(null), '(not set)')
  assert.equal(describeValue(undefined), '(not set)')
  assert.equal(describeValue(''), '(not set)')
  assert.ok(!describeValue(null).includes('null'))
})

test('booleans and hours read as words', () => {
  assert.equal(describeValue(true), 'on')
  assert.equal(describeValue(false), 'off')
  assert.match(describeValue({ mon: { open: '09:00', close: '17:00' }, sun: null }), /sun: closed/)
})

test('a closed day is not rendered as null', () => {
  assert.ok(!describeValue({ sun: null }).includes('null'))
})

console.log('\napproved changes — refusals explain the consequence')

test('a stale-state refusal explains whose change would be lost', () => {
  const msg = writeErrorMessage('state_changed')
  assert.match(msg, /someone else/i)
  assert.match(msg, /undo their change/i)
})

test('unknown errors still say something honest', () => {
  assert.match(writeErrorMessage('brand_new_thing'), /brand_new_thing/)
  assert.match(writeErrorMessage('invalid_greeting_too_long_max_500'), /validation/i)
  assert.equal(writeErrorMessage(null), 'That did not work.')
})

console.log('\napproved changes — ordering and diffs')

test('pending approvals sort first', () => {
  const sorted = sortApprovals([
    approval({ id: 'applied', status: 'applied' }),
    approval({ id: 'rejected', status: 'rejected' }),
    approval({ id: 'pending', status: 'pending' }),
    approval({ id: 'approved', status: 'approved' }),
  ])
  assert.deepEqual(sorted.map((a) => a.id), ['pending', 'approved', 'applied', 'rejected'])
})

test('a diff can be rebuilt from a stored approval', () => {
  const d = diffFromApproval(approval())
  assert.equal(d.label, 'Greeting')
  assert.match(d.summary, /Old.*New/)
  assert.equal(d.unchanged, false)
})

test('an approval with no field yields no diff rather than a broken one', () => {
  assert.equal(diffFromApproval(approval({ proposed_input: null })), null)
})

test('tool names read as English, including unknown ones', () => {
  assert.equal(writeToolLabel('update_greeting'), 'Greeting')
  assert.equal(writeToolLabel('update_something_new'), 'Something new')
})

console.log(`\n${count - failures}/${count} passed`)
process.exit(failures === 0 ? 0 : 1)
