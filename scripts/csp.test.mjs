#!/usr/bin/env node
/**
 * Regression tests for the Content-Security-Policy in next.config.ts.
 *
 * Guards the production outage where `connect-src 'self'` blocked every
 * browser call to Supabase Auth and the voice backend — login, signup and the
 * whole logged-in dashboard failed with "Refused to connect" on pivotcalls.co.
 *
 * The config is loaded in a child process per case so each run sees a fresh
 * module registry and its own NEXT_PUBLIC_* env. Run with `npm test`.
 */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Load next.config.ts under the given env and return its CSP string. */
function cspFor(env) {
  const script = `
    const { default: cfg } = await import('./next.config.ts')
    const routes = await cfg.headers()
    const csp = routes[0].headers.find(h => h.key === 'Content-Security-Policy')
    process.stdout.write(csp.value)
  `
  // --no-warnings keeps the TS-stripping notice out of the test output.
  return execFileSync(process.execPath, ['--no-warnings', '--input-type=module', '-e', script], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  })
}

/** Extract a single directive's value from a CSP string. */
function directive(csp, name) {
  const found = csp
    .split(';')
    .map((d) => d.trim())
    .find((d) => d === name || d.startsWith(`${name} `))
  assert.ok(found !== undefined, `CSP is missing the "${name}" directive`)
  return found.slice(name.length).trim()
}

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

const SUPABASE = 'https://dpmukxiekoikviowxzen.supabase.co'
const API = 'https://ai-receptionist-voice.onrender.com'

console.log('\nconnect-src — the origins the browser must actually reach')

test('includes the Supabase origin so login/signup are not blocked', () => {
  const connect = directive(
    cspFor({ NEXT_PUBLIC_SUPABASE_URL: SUPABASE, NEXT_PUBLIC_API_BASE: API }),
    'connect-src',
  )
  assert.ok(
    connect.split(/\s+/).includes(SUPABASE),
    `connect-src must list ${SUPABASE}, got: ${connect}`,
  )
})

test('includes the voice backend origin so dashboard fetches are not blocked', () => {
  const connect = directive(
    cspFor({ NEXT_PUBLIC_SUPABASE_URL: SUPABASE, NEXT_PUBLIC_API_BASE: API }),
    'connect-src',
  )
  assert.ok(
    connect.split(/\s+/).includes(API),
    `connect-src must list ${API}, got: ${connect}`,
  )
})

test('includes the Supabase wss origin for auth refresh / realtime', () => {
  const connect = directive(
    cspFor({ NEXT_PUBLIC_SUPABASE_URL: SUPABASE, NEXT_PUBLIC_API_BASE: API }),
    'connect-src',
  )
  assert.ok(
    connect.split(/\s+/).includes(SUPABASE.replace(/^https:/, 'wss:')),
    `connect-src must list the wss:// Supabase origin, got: ${connect}`,
  )
})

test("always retains 'self'", () => {
  const connect = directive(
    cspFor({ NEXT_PUBLIC_SUPABASE_URL: SUPABASE, NEXT_PUBLIC_API_BASE: API }),
    'connect-src',
  )
  assert.ok(connect.split(/\s+/).includes("'self'"), `got: ${connect}`)
})

test('is never left as the bare "self" that caused the outage', () => {
  const connect = directive(
    cspFor({ NEXT_PUBLIC_SUPABASE_URL: SUPABASE, NEXT_PUBLIC_API_BASE: API }),
    'connect-src',
  )
  assert.notEqual(connect, "'self'")
})

console.log('\nenv handling')

test('a trailing slash on NEXT_PUBLIC_SUPABASE_URL still yields a bare origin', () => {
  const connect = directive(
    cspFor({ NEXT_PUBLIC_SUPABASE_URL: `${SUPABASE}/`, NEXT_PUBLIC_API_BASE: API }),
    'connect-src',
  )
  assert.ok(connect.split(/\s+/).includes(SUPABASE), `got: ${connect}`)
  // A path/slash inside a CSP source would not match the origin at runtime.
  assert.ok(!connect.includes(`${SUPABASE}/ `), `origin must not carry a path: ${connect}`)
})

test('falls back to the default API origin when NEXT_PUBLIC_API_BASE is unset', () => {
  const connect = directive(
    cspFor({ NEXT_PUBLIC_SUPABASE_URL: SUPABASE, NEXT_PUBLIC_API_BASE: '' }),
    'connect-src',
  )
  assert.ok(connect.split(/\s+/).includes(API), `got: ${connect}`)
})

test('an unset Supabase URL degrades safely rather than emitting an empty token', () => {
  const connect = directive(
    cspFor({ NEXT_PUBLIC_SUPABASE_URL: '', NEXT_PUBLIC_API_BASE: API }),
    'connect-src',
  )
  assert.ok(!/\s{2,}/.test(connect), `no empty tokens allowed, got: "${connect}"`)
  assert.ok(!connect.includes('wss: '), `no bare wss: token allowed, got: "${connect}"`)
})

test('a malformed Supabase URL does not corrupt the directive', () => {
  const connect = directive(
    cspFor({ NEXT_PUBLIC_SUPABASE_URL: 'not a url', NEXT_PUBLIC_API_BASE: API }),
    'connect-src',
  )
  assert.ok(connect.split(/\s+/).includes("'self'"), `got: ${connect}`)
  assert.ok(!connect.includes('not a url'), `got: ${connect}`)
})

console.log('\nthe other hardening headers must survive the change')

test('frame-ancestors, base-uri and form-action are still locked down', () => {
  const csp = cspFor({ NEXT_PUBLIC_SUPABASE_URL: SUPABASE, NEXT_PUBLIC_API_BASE: API })
  assert.equal(directive(csp, 'frame-ancestors'), "'none'")
  assert.equal(directive(csp, 'base-uri'), "'self'")
  assert.equal(directive(csp, 'form-action'), "'self'")
})

test('default-src stays self — the fix is scoped to connect-src only', () => {
  const csp = cspFor({ NEXT_PUBLIC_SUPABASE_URL: SUPABASE, NEXT_PUBLIC_API_BASE: API })
  assert.equal(directive(csp, 'default-src'), "'self'")
})

if (failures > 0) {
  console.error(`\n${failures} of ${count} CSP tests failed.\n`)
  process.exit(1)
}
console.log(`\nAll ${count} CSP tests passed.\n`)
