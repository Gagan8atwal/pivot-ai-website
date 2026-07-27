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
import {
  AVAILABILITY_COPY,
  SLO_ORDER,
  SLO_STATE_META,
  metric24h,
  metricAvailability,
  percent,
  stateCount,
} from '../lib/slo.ts'

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

const sloSample = {
  mode: 'aggregate_read_only_slo',
  policy_version: '2026-07-23-v1',
  profile: 'pilot_baseline_v1',
  contractual_sla: false,
  scope: 'tenant',
  generated_at: '2026-07-23T12:00:00.000Z',
  evidence_generated_at: '2026-07-23T11:59:00.000Z',
  state: 'unknown',
  route: 'operations_queue',
  safe_to_claim_healthy: false,
  summary: { healthy: 2, degraded: 0, critical: 0, unknown: 5 },
  metrics: Object.fromEntries(SLO_ORDER.map((metric) => [metric, {
    metric,
    label: metric,
    description: 'aggregate evidence',
    objective: 0.98,
    error_budget: 0.02,
    state: metric === 'call_finalization' ? 'healthy' : 'unknown',
    reason: metric === 'call_finalization' ? null : 'incomplete_window',
    breaches: [],
    budget_24h: { known: metric === 'call_finalization', consumed_ratio: 0, remaining_ratio: 1 },
    windows: Object.fromEntries(['5m', '30m', '1h', '6h', '24h'].map((window) => [window, {
      window,
      state: metric === 'call_finalization' ? 'within_objective' : 'unknown',
      reason: metric === 'call_finalization' ? null : 'incomplete_window',
      minimum_samples: 2,
      good: metric === 'call_finalization' ? 20 : null,
      total: metric === 'call_finalization' ? 20 : null,
      success_rate: metric === 'call_finalization' ? 1 : null,
      error_rate: metric === 'call_finalization' ? 0 : null,
      burn_rate: metric === 'call_finalization' ? 0 : null,
      observed_at: '2026-07-23T11:59:00.000Z',
    }])),
  }])),
  guardrails: {
    workers: { state: 'unknown', reason: 'worker_heartbeat_telemetry_not_deployed' },
    queue: { state: 'unknown', reason: 'durable_job_queue_telemetry_not_deployed' },
  },
  alerts: [],
  availability: {
    voice_connection: 'missing_pre_session_inbound_attempt_telemetry',
    owner_console_availability: 'missing_owner_console_request_telemetry',
    queue_processing: 'durable_job_telemetry_not_deployed',
    workers: 'worker_heartbeat_telemetry_not_deployed',
    queue: 'durable_job_queue_telemetry_not_deployed',
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

console.log('\nreliability evidence contract')

test('SLO contract covers exactly the seven internal pilot metrics', () => {
  assert.deepEqual(SLO_ORDER, [
    'voice_connection',
    'call_finalization',
    'expected_lead_capture',
    'appointment_persistence',
    'notification_delivery',
    'owner_console_availability',
    'queue_processing',
  ])
  assert.deepEqual(Object.keys(SLO_STATE_META).sort(), ['critical', 'degraded', 'healthy', 'unknown'])
})

test('unknown and unavailable evidence never becomes a healthy claim', () => {
  assert.equal(sloSample.contractual_sla, false)
  assert.equal(sloSample.safe_to_claim_healthy, false)
  assert.equal(SLO_STATE_META.unknown.label, 'Reliability not yet proven')
  assert.match(SLO_STATE_META.unknown.description, /missing, stale, incomplete, unavailable, or too low-volume/)
  assert.equal(stateCount(sloSample, 'unknown'), 5)
  assert.equal(metric24h(sloSample, 'voice_connection').state, 'unknown')
})

test('SLO formatting and availability helpers expose aggregate evidence only', () => {
  assert.equal(percent(0.98), '98.0%')
  assert.equal(percent(null), 'Unknown')
  assert.equal(metric24h(sloSample, 'call_finalization').success_rate, 1)
  assert.equal(
    metricAvailability(sloSample, 'voice_connection'),
    AVAILABILITY_COPY.missing_pre_session_inbound_attempt_telemetry,
  )
  assert.equal(metricAvailability(sloSample, 'call_finalization'), null)
})

console.log('\noperations page boundaries')

const page = read('app/(app)/operations/page.tsx')
const component = read('components/app/reliability-evidence.tsx')
const sloContract = read('lib/slo.ts')
const shell = read('components/app/app-shell.tsx')
const combinedUi = `${page}\n${component}\n${sloContract}`

test('operations page calls only protected tenant aggregate endpoints', () => {
  assert.match(page, /apiFetch<ReconciliationResponse>\('\/app\/ops\/reconciliation'\)/)
  assert.match(page, /apiFetch<SloResponse>\('\/app\/ops\/slo'\)/)
  assert.doesNotMatch(page, /\/internal\/ops/)
  assert.doesNotMatch(page, /provider-call|provider-email|record-operational-incidents/)
  assert.doesNotMatch(page, /method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/)
})

test('reconciliation and SLO failures are isolated from each other', () => {
  assert.match(page, /Promise\.allSettled/)
  assert.match(page, /setSloNotEnabled\(true\)/)
  assert.match(page, /setSloError\(errorMessage\(sloResult\.reason\)\)/)
  assert.match(component, /The operational queue above remains available/)
  assert.match(component, /This does not change or hide the operational queue above/)
})

test('operations page is owner-only and handles gradual enablement honestly', () => {
  assert.match(page, /can\.owner\(me\?\.role\)/)
  assert.match(page, /reconciliationResult\.reason instanceof ApiError/)
  assert.match(page, /Operations Health is not enabled for this account yet/)
  assert.match(page, /Nothing is broken/)
})

test('operations UI renders no entity/provider identifiers or customer evidence fields', () => {
  for (const forbidden of [
    'entity_id',
    'call_sid',
    'resend_id',
    'recipient_email',
    'caller_number',
    'recording_url',
    'error_message',
    'source_manifest',
    'rows_examined',
  ]) {
    assert.ok(!combinedUi.includes(forbidden), forbidden)
  }
  assert.doesNotMatch(combinedUi, /data\?\.(?:transcript|recording|provider|recipient|caller)/)
})

test('reliability panel is explicitly non-contractual and read-only', () => {
  assert.match(component, /This is not a contractual SLA/)
  assert.match(component, /does not trigger remediation, provider actions, or customer-data changes/)
  assert.match(component, /Missing, stale, incomplete, unavailable, or low-volume evidence is shown as unknown/)
  assert.match(component, /aggregate reliability evidence only/)
  assert.doesNotMatch(component, /apiFetch|fetch\(|onClick=|<Button|<form|method=/)
})

test('operations page states that it cannot mutate operational evidence', () => {
  assert.match(page, /read-only owner summary/)
  assert.match(page, /Aging alone never completes a call, resends an email, closes a lead, or confirms an\s+appointment/)
})

test('owner navigation exposes operations health only at owner rank', () => {
  assert.match(shell, /href: '\/operations', label: 'Operations Health', icon: Activity, minRank: 4/)
})

if (failures > 0) {
  console.error(`\n${failures} of ${count} operations tests failed.\n`)
  process.exit(1)
}
console.log(`\nAll ${count} operations tests passed.\n`)
