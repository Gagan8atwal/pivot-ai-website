#!/usr/bin/env node
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url)
const read = (p) => readFileSync(new URL(p, root), 'utf8')

const signup = read('app/(auth)/signup/page.tsx')
const onboardingPage = read('app/(app)/onboarding/page.tsx')
const fast = read('components/app/onboarding/fast-onboarding.tsx')
const api = read('lib/api.ts')
const hero = read('components/sections/hero.tsx')
const cta = read('components/sections/cta.tsx')
const nav = read('components/navbar.tsx')
const pricing = read('lib/pricing.ts')
const env = read('.env.example')
const proof = read('alos/browser-proof/onboarding/index.html')
const browserSpec = JSON.parse(read('.alos/browser-e2e.json'))

assert.match(signup, /router\.push\('\/onboarding'\)/)
assert.match(signup, /window\.location\.origin\}\/onboarding/)
assert.match(signup, /password\.length < 12/)
assert.match(onboardingPage, /FastOnboarding/)
assert.match(fast, /api\.onboarding\.quick/)
assert.match(fast, /business name, timezone, business hours and services are required/i)
assert.match(fast, /receptionistPhone/)
assert.match(fast, /Save setup & activate if ready/)
assert.match(fast, /Call my receptionist/)
assert.match(fast, /testCall\?\.received/)
assert.match(api, /\/app\/onboarding\/quick/)
assert.doesNotMatch(api, /onrender\.com/)
assert.match(hero, /href="\/signup"/)
assert.match(hero, /Start 5-Minute Setup/)
assert.match(cta, /href="\/signup"/)
assert.match(nav, /Start Setup/)
assert.equal((pricing.match(/ctaHref: '\/signup'/g) || []).length, 2)
assert.match(env, /NEXT_PUBLIC_API_BASE=http:\/\/127\.0\.0\.1:3001/)
assert.doesNotMatch(env, /render\.com/i)

console.log('Pivot website -> signup -> fast onboarding funnel contract PASS')

assert.match(fast, /api\.auth\.ensureTenant\(\)/)
assert.match(fast, /api\.onboarding\.get\(\)/)
assert.match(fast, /api\.settings\.get\(\)/)
assert.match(proof, /SETUP:RELOAD-RESUMES-SAVED-STATE/)
assert.deepEqual(browserSpec.acceptance.reliabilityProof, {
  kind: 'retry',
  expectText: 'SETUP:RELOAD-RESUMES-SAVED-STATE',
})
