#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const api = readFileSync(new URL('../lib/api.ts', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../app/(app)/dashboard/page.tsx', import.meta.url), 'utf8');
const calls = readFileSync(new URL('../app/(app)/calls/page.tsx', import.meta.url), 'utf8');

assert.match(api, /export interface VoiceIncident/);
assert.match(api, /export interface VoiceIncidentsResponse/);
assert.match(api, /voiceIncidents:\s*\(\) =>/);
assert.match(api, /\/app\/ops\/voice-incidents/);
assert.match(api, /export interface CallRecord/);
assert.match(api, /apiFetch<unknown>\('\/app\/calls'\)/);

assert.match(dashboard, /Call reliability/);
assert.match(dashboard, /api\.logs\.voiceIncidents\(\)/);
assert.match(dashboard, /Repeated or configuration-level call failures are grouped here automatically/);
assert.match(dashboard, /at least three times within 15 minutes/);
assert.match(dashboard, /recent_failures_15m/);
assert.match(dashboard, /incident\.occurrences/);
assert.match(dashboard, /incident\.failure_class/);
assert.match(dashboard, /can\.admin\(me\?\.role\)/);

assert.match(calls, /api\.calls\.list\(\)/);
assert.match(calls, /Authoritative call records from the Pivot voice system/);
assert.match(calls, /Failed calls are never shown as completed/);
assert.match(calls, /call\.failure_class/);
assert.doesNotMatch(calls, /api\.leads\.list/);

console.log('Pivot call reliability dashboard contract PASS');
