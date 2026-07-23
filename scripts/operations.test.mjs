#!/usr/bin/env node

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  FINDING_META,
  STATUS_META,
  countAction,
  countFinding,
  formatGeneratedAt,
} from '../lib/operations.ts'

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

console.log('\noperations health contract')

const sample = {
  generated_at: '2026-07-23T12:00:00.000Z',
  policy_version: '2026-07-22-v1',
  status: 'critical',
  summary: {
    total: 4,
    by_severity: { info: 0, warning: 1, critical: 3 },
    by_type: {
      stale_call: 1,
      failed_notification: 1,
      aged_lead: 1,
      aged_appointment: 1,
    },
    by_action: {
      provider_verification_required: 1,
      manual_review: 1,
      owner_queue: 2,
    },
    tenant_scoped: 4,
  },
  thresholds_hours: {
    stale_call_warning: 2,
    stale_call_critical: 6,
    new_lead_warning: 24,
    new_lead_critical: 72,
    appointment_warning: 24,
    appointment_critical: 48,
  },
  guidance: {
    stale_call: 'Provider verification required.',
    failed_notification: 'Review delivery evidence.',
    aged_lead: 'Review lead.',
    aged_appointment: 'Review appointment.',
  },
}

test('finding metadata covers exactly the four operational queues', () => {
  assert.deepEqual(Object.keys(FINDING_META).sort(), [
    'aged_appointment',
    'aged_lead',
    'failed_notification',
    'stale_call',
  ])
})

test('every finding points to an authenticated owner workflow', () => {
  assert.deepEqual(
    Object.values(FINDING_META).map((item) => item.href).sort(),
    ['/appointments', '/calls', '/crm', '/messages'],
  )
  for (const item of Object.values(FINDING_META)) {
    assert.ok(item.label.length > 0)
    assert.ok(item.description.length > 0)
    assert.ok(item.actionLabel.length > 0)
    assert.ok(item.href.startsWith('/'))
  }
})

test('status copy never claims a source record was fixed automatically', () => {
  assert.deepEqual(Object.keys(STATUS_META).sort(), ['attention', 'critical', 'healthy'])
  const copy = JSON.stringify(STATUS_META).toLowerCase()
  for (const forbidden of ['automatically fixed', 'call completed', 'email resent', 'appointment confirmed']) {
    assert.ok(!copy.includes(forbidden), forbidden)
  }
})

test('count helpers normalize missing and invalid data', () => {
  assert.equal(countFinding(sample, 'stale_call'), 1)
  assert.equal(countFinding(null, 'stale_call'), 0)
  assert.equal(countAction(sample, 'owner_queue'), 2)
  assert.equal(countAction(null, 'owner_queue'), 0)
})

test('generated timestamp formatting is stable for invalid input', () => {
  assert.notEqual(formatGeneratedAt(sample.generated_at), 'Unknown')
  assert.equal(formatGeneratedAt('not-a-date'), 'Unknown')
})

console.log('\noperations page boundaries')

const page = read('app/(app)/operations/page.tsx')
const shell = read('components/app/app-shell.tsx')
const owner = read('app/(app)/owner/page.tsx')

test('operations page calls only the tenant aggregate endpoint', () => {
  assert.match(page, /apiFetch<ReconciliationResponse>\('\/app\/ops\/reconciliation'\)/)
  assert.doesNotMatch(page, /\/internal\/ops/)
  assert.doesNotMatch(page, /provider-call|provider-email|record-operational-incidents/)
})

test('operations page is owner-only and handles gradual enablement honestly', () => {
  assert.match(page, /can\.owner\(me\?\.role\)/)
  assert.match(page, /err instanceof ApiError && err\.status === 404/)
  assert.match(page, /Operations Health is not enabled for this account yet/)
  assert.match(page, /Nothing is broken/)
})

test('operations page renders no entity/provider identifiers or customer evidence', () => {
  for (const forbidden of [
    'entity_id',
    'call_sid',
    'resend_id',
    'recipient_email',
    'caller_number',
    'transcript',
    'recording_url',
    'error_message',
  ]) {
    assert.ok(!page.includes(forbidden), forbidden)
  }
})

test('operations page states that it cannot mutate operational evidence', () => {
  assert.match(page, /read-only owner summary/)
  assert.match(page, /Aging alone never completes a call, resends an email, closes a lead, or confirms an appointment/)
})

test('owner navigation and command center expose operations health only at owner rank', () => {
  assert.match(shell, /href: '\/operations', label: 'Operations Health', icon: Activity, minRank: 4/)
  assert.match(owner, /title: 'Operations Health'/)
  assert.match(owner, /href: '\/operations'/)
})

if (failures > 0) {
  console.error(`\n${failures} of ${count} operations tests failed.\n`)
  process.exit(1)
}
console.log(`\nAll ${count} operations tests passed.\n`)
