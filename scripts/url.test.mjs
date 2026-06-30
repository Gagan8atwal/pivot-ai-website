#!/usr/bin/env node
/**
 * Logic tests for lib/url.ts — the env URL normalizers that fix the
 * "Invalid path specified in request URL" login-page bug (trailing slash /
 * whitespace / stray path in NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_API_BASE).
 *
 * Imports the pure TypeScript module directly — Node (>=22.18 / 24) strips the
 * types at load. No test-runner dependency. Run with `npm test`.
 */
import assert from 'node:assert/strict'
import { normalizeOrigin, normalizeBaseUrl } from '../lib/url.ts'

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

console.log('\nnormalizeOrigin (NEXT_PUBLIC_SUPABASE_URL)')

test('strips a trailing slash (the actual bug)', () => {
  assert.equal(normalizeOrigin('https://abc.supabase.co/'), 'https://abc.supabase.co')
})

test('strips multiple trailing slashes', () => {
  assert.equal(normalizeOrigin('https://abc.supabase.co///'), 'https://abc.supabase.co')
})

test('trims surrounding whitespace/newlines', () => {
  assert.equal(normalizeOrigin('  https://abc.supabase.co\n'), 'https://abc.supabase.co')
})

test('reduces an accidental path to the bare origin', () => {
  assert.equal(normalizeOrigin('https://abc.supabase.co/auth/v1'), 'https://abc.supabase.co')
})

test('drops query and hash', () => {
  assert.equal(normalizeOrigin('https://abc.supabase.co/?foo=bar#x'), 'https://abc.supabase.co')
})

test('preserves an explicit port', () => {
  assert.equal(normalizeOrigin('http://localhost:54321/'), 'http://localhost:54321')
})

test('leaves an already-clean origin unchanged', () => {
  assert.equal(normalizeOrigin('https://abc.supabase.co'), 'https://abc.supabase.co')
})

test('returns empty string for undefined / null / blank', () => {
  assert.equal(normalizeOrigin(undefined), '')
  assert.equal(normalizeOrigin(null), '')
  assert.equal(normalizeOrigin('   '), '')
})

test('best-effort strips trailing slash when value has no protocol', () => {
  assert.equal(normalizeOrigin('abc.supabase.co/'), 'abc.supabase.co')
})

console.log('\nnormalizeBaseUrl (NEXT_PUBLIC_API_BASE)')

test('strips a single trailing slash', () => {
  assert.equal(
    normalizeBaseUrl('https://ai-receptionist-voice.onrender.com/'),
    'https://ai-receptionist-voice.onrender.com'
  )
})

test('strips multiple trailing slashes', () => {
  assert.equal(normalizeBaseUrl('https://api.example.com////'), 'https://api.example.com')
})

test('trims whitespace', () => {
  assert.equal(normalizeBaseUrl('  https://api.example.com  '), 'https://api.example.com')
})

test('preserves a sub-path (only trailing slash removed)', () => {
  assert.equal(normalizeBaseUrl('https://api.example.com/v2/'), 'https://api.example.com/v2')
})

test('returns empty string for undefined / null / blank', () => {
  assert.equal(normalizeBaseUrl(undefined), '')
  assert.equal(normalizeBaseUrl(null), '')
  assert.equal(normalizeBaseUrl('  '), '')
})

test('concatenation with a root-absolute path never double-slashes', () => {
  const base = normalizeBaseUrl('https://api.example.com/')
  assert.equal(`${base}/app/me`, 'https://api.example.com/app/me')
})

if (failures > 0) {
  console.error(`\n${failures} of ${count} url tests failed.\n`)
  process.exit(1)
}
console.log(`\nAll ${count} url normalization tests passed.\n`)
