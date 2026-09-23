#!/usr/bin/env node
import assert from 'node:assert/strict'
import { deriveDashboardOnboardingStatus } from '../lib/dashboard-onboarding-status.mjs'

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

console.log('\nDashboard onboarding truth regressions')

test('historical activation does not hide a current readiness regression', () => {
  const status = deriveDashboardOnboardingStatus({
    state: {
      activated_at: '2026-09-01T00:00:00.000Z',
      completed_steps: [1, 2, 3, 4, 5, 6, 7],
      current_step: 7,
    },
    activation: {
      active: false,
      activatedAt: '2026-09-01T00:00:00.000Z',
      previouslyActivated: true,
      requiresAttention: true,
    },
    readiness: {
      ready: false,
      blockers: [{ field: 'phone', message: 'provider-confirmed phone required' }],
      warnings: [],
    },
    totalSteps: 7,
  })

  assert.equal(status.active, false)
  assert.equal(status.previouslyActivated, true)
  assert.equal(status.requiresAttention, true)
  assert.equal(status.showSetupBanner, true)
})

test('current activation hides the setup banner only when authoritative activation says active', () => {
  const status = deriveDashboardOnboardingStatus({
    state: {
      activated_at: '2026-09-01T00:00:00.000Z',
      completed_steps: [1, 2, 3, 4, 5, 6, 7],
      current_step: 7,
    },
    activation: {
      active: true,
      activatedAt: '2026-09-01T00:00:00.000Z',
      previouslyActivated: true,
      requiresAttention: false,
    },
    readiness: { ready: true, blockers: [], warnings: [] },
    totalSteps: 7,
  })

  assert.equal(status.active, true)
  assert.equal(status.requiresAttention, false)
  assert.equal(status.showSetupBanner, false)
})

test('missing current activation contract fails closed even with historical activated_at', () => {
  const status = deriveDashboardOnboardingStatus({
    state: {
      activated_at: '2026-09-01T00:00:00.000Z',
      completed_steps: [1, 2, 3],
      current_step: 4,
    },
    totalSteps: 7,
  })

  assert.equal(status.active, false)
  assert.equal(status.previouslyActivated, true)
  assert.equal(status.requiresAttention, true)
  assert.equal(status.showSetupBanner, true)
  assert.equal(status.completedCount, 3)
  assert.equal(status.resumeStep, 4)
})

if (failures > 0) {
  console.error(`\n${failures} of ${count} dashboard onboarding truth tests failed.\n`)
  process.exit(1)
}

console.log(`\nAll ${count} dashboard onboarding truth tests passed.\n`)
