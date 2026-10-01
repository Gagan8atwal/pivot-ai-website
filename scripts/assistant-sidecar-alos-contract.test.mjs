#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync(new URL('../.alos/sidecar-e2e.json', import.meta.url), 'utf8'));
const source = readFileSync(new URL('../components/app/app-shell.tsx', import.meta.url), 'utf8');

assert.equal(manifest.projectKey, 'pivot-ai-website');
assert.equal(manifest.sideEffects, 'forbidden');
assert.equal(manifest.acceptance.requireTenantIsolation, true);
assert.match(source, /Read-only help for this account/);
assert.match(source, /pivot:sidecar:/);
assert.match(source, /api\.assistant\.overview\(\)/);
assert.match(source, /api\.assistant\.conversations\.send/);
assert.match(source, /pathname === '\/assistant'/);
for (const forbidden of ['settings-write', 'billing-write', 'telecom-write', 'cross-business-read']) {
  assert.ok(manifest.forbidden.includes(forbidden));
}
console.log('Pivot website ALOS sidecar contract PASS');
