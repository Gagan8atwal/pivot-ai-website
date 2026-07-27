#!/usr/bin/env node
/**
 * Run every test script in this directory.
 *
 * Replaces a hand-maintained `&&` chain in package.json. The backend repo had
 * the same chain and it had silently stopped running three suites — a new test
 * file passed locally while `npm test` never opened it and still reported
 * green. A test that is never executed is worse than no test, because it buys
 * confidence it has not earned.
 *
 * Discovery is by directory listing, so adding a file is enough. npm runs
 * scripts through cmd.exe on Windows, which does not expand globs — hence a
 * script rather than `node scripts/*.test.mjs`.
 *
 * smoke-routes.mjs is not named `.test.mjs` but is a test, so it is included
 * explicitly and asserted to exist rather than silently skipped if renamed.
 */
import { readdirSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))

const EXTRA = ['smoke-routes.mjs']
for (const f of EXTRA) {
  if (!existsSync(path.join(here, f))) {
    console.error(`run-all: ${f} is listed explicitly but missing — refusing to skip it silently`)
    process.exit(1)
  }
}

const files = [...EXTRA, ...readdirSync(here).filter((f) => f.endsWith('.test.mjs')).sort()]

if (files.length <= EXTRA.length) {
  console.error('run-all: no *.test.mjs files found — refusing to report success')
  process.exit(1)
}

console.log(`run-all: ${files.length} suites\n`)

const failed = []
for (const file of files) {
  const res = spawnSync(process.execPath, [path.join(here, file)], { stdio: 'inherit' })
  if (res.status !== 0) failed.push(`${file} (exit ${res.status})`)
}

console.log(`\nrun-all: ${files.length - failed.length}/${files.length} suites passed`)
if (failed.length) {
  console.error(`run-all: FAILED\n  ${failed.join('\n  ')}`)
  process.exit(1)
}
