#!/usr/bin/env node
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../components/app/app-shell.tsx', import.meta.url), 'utf8')

assert.match(source, /function PivotAssistantSidecar\(\)/)
assert.match(source, /api\.assistant\.overview\(\)/)
assert.match(source, /api\.assistant\.conversations\.create/)
assert.match(source, /api\.assistant\.conversations\.send/)
assert.match(source, /Read-only help for this account/)
assert.match(source, /pathname === '\/assistant'/)
assert.match(source, /pivot:sidecar:/)
assert.doesNotMatch(source, /api\.settings\.update|api\.tasks\.create|api\.billing\./)

console.log('Pivot authenticated assistant sidecar contract PASS')
