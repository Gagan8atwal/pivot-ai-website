#!/usr/bin/env node
/**
 * Minimal route smoke test (no test-runner dependency).
 *
 * Asserts that every expected route — marketing + the unified app — has a
 * page module on disk that exports a default React component. Run with:
 *   npm test
 *
 * Exits non-zero (failing CI) if any route is missing or malformed.
 */
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// Public marketing routes (must keep working).
const PUBLIC_ROUTES = [
  ['/', 'app/page.tsx'],
  ['/demo', 'app/demo/page.tsx'],
  ['/contact', 'app/contact/page.tsx'],
  ['/privacy', 'app/privacy/page.tsx'],
  ['/terms', 'app/terms/page.tsx'],
]

// Marketing API routes.
const API_ROUTES = [
  ['POST /api/demo', 'app/api/demo/route.ts'],
  ['POST /api/contact', 'app/api/contact/route.ts'],
]

// Auth pages.
const AUTH_ROUTES = [
  ['/login', 'app/(auth)/login/page.tsx'],
  ['/signup', 'app/(auth)/signup/page.tsx'],
  ['/forgot-password', 'app/(auth)/forgot-password/page.tsx'],
  ['/reset-password', 'app/(auth)/reset-password/page.tsx'],
]

// Authenticated app pages.
const APP_ROUTES = [
  ['/dashboard', 'app/(app)/dashboard/page.tsx'],
  ['/owner', 'app/(app)/owner/page.tsx'],
  ['/crm', 'app/(app)/crm/page.tsx'],
  ['/appointments', 'app/(app)/appointments/page.tsx'],
  ['/calls', 'app/(app)/calls/page.tsx'],
  ['/messages', 'app/(app)/messages/page.tsx'],
  ['/billing', 'app/(app)/billing/page.tsx'],
  ['/knowledge-base', 'app/(app)/knowledge-base/page.tsx'],
  ['/team', 'app/(app)/team/page.tsx'],
  ['/settings', 'app/(app)/settings/page.tsx'],
  ['/vs-carriers', 'app/(app)/vs-carriers/page.tsx'],
]

// Core infrastructure files.
const LIB = [
  ['lib/api.ts', 'lib/api.ts'],
  ['lib/auth.ts', 'lib/auth.ts'],
  ['app shell', 'components/app/app-shell.tsx'],
  ['auth provider', 'components/app/auth-provider.tsx'],
]

let failures = 0
const pass = (m) => console.log(`  ✓ ${m}`)
const fail = (m) => {
  console.error(`  ✗ ${m}`)
  failures++
}

async function checkPage(label, rel) {
  const abs = join(root, rel)
  if (!existsSync(abs)) return fail(`${label} — missing file ${rel}`)
  const src = await readFile(abs, 'utf8')
  if (!/export\s+default\s+(async\s+)?function|export\s+default\s+\w+/.test(src)) {
    return fail(`${label} — ${rel} has no default export`)
  }
  pass(`${label} (${rel})`)
}

async function checkRoute(label, rel) {
  const abs = join(root, rel)
  if (!existsSync(abs)) return fail(`${label} — missing file ${rel}`)
  const src = await readFile(abs, 'utf8')
  if (!/export\s+(async\s+)?function\s+(GET|POST|PATCH|DELETE|PUT)/.test(src)) {
    return fail(`${label} — ${rel} has no HTTP handler export`)
  }
  pass(`${label} (${rel})`)
}

async function checkFile(label, rel) {
  if (!existsSync(join(root, rel))) return fail(`${label} — missing ${rel}`)
  pass(`${label} (${rel})`)
}

console.log('\nPublic marketing routes')
for (const [l, p] of PUBLIC_ROUTES) await checkPage(l, p)
console.log('\nMarketing API routes')
for (const [l, p] of API_ROUTES) await checkRoute(l, p)
console.log('\nAuth routes')
for (const [l, p] of AUTH_ROUTES) await checkPage(l, p)
console.log('\nApp routes')
for (const [l, p] of APP_ROUTES) await checkPage(l, p)
console.log('\nCore infrastructure')
for (const [l, p] of LIB) await checkFile(l, p)

const total =
  PUBLIC_ROUTES.length + API_ROUTES.length + AUTH_ROUTES.length + APP_ROUTES.length + LIB.length
if (failures > 0) {
  console.error(`\n${failures} of ${total} checks failed.\n`)
  process.exit(1)
}
console.log(`\nAll ${total} route/infra checks passed.\n`)
