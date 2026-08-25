#!/usr/bin/env node

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const support = readFileSync(join(root, 'components/app/support/support-console.tsx'), 'utf8')
const shell = readFileSync(join(root, 'components/app/app-shell.tsx'), 'utf8')

let count = 0
let failures = 0
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

console.log('\nCustomer Help control-plane checks')

test('authenticated navigation exposes Customer Help', () => {
  assert.match(shell, /href:\s*'\/support'.*label:\s*'Customer Help'/s)
})

test('the console uses tenant-derived authenticated support routes', () => {
  for (const route of [
    '/app/assistant/support',
    '/app/assistant/support/cases',
    '/app/assistant/support/refund-requests',
  ]) assert.ok(support.includes(route), `missing ${route}`)
  assert.doesNotMatch(support, /businessId\s*:/)
  assert.doesNotMatch(support, /business_id\s*:/)
})

test('human intervention is a durable escalation action', () => {
  assert.match(support, /\/cases\/\$\{id\}\/escalate/)
  assert.match(support, /requestHuman/)
  assert.match(support, /notification status/i)
})

test('refund review remains owner-gated and non-executing', () => {
  assert.match(support, /const isOwner = can\.owner/)
  assert.match(support, /moneyMoved !== false/)
  assert.match(support, /No automatic money movement/)
  assert.doesNotMatch(support, /stripe\.refunds|refunds\.create|\/v1\/refunds/i)
})

test('support failures never render fabricated success', () => {
  assert.match(support, /No action was reported as successful/)
  assert.match(support, /setNotice\(\{ kind: 'error'/)
})

console.log(`\n${count - failures}/${count} Customer Help checks passed`)
if (failures) process.exit(1)
