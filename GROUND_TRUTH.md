# GROUND_TRUTH.md — Phase 0 Audit

Generated: 2026-07-11 by automated Phase 0 audit.
Session branch: `fix/industries-index`

Key: **VERIFIED** = executed and observed. **UNVERIFIED** = not directly confirmed. **BLOCKED** = credential/external access missing.

---

## REPO 1: pivot-ai-website

**Path:** `C:\Users\gagan\OneDrive\Documents\pivot-ai-website`
**Live site:** pivotcalls.co

### Structure & Runtime
| Field | Value | Status |
|---|---|---|
| Framework | Next.js 15.5.18 (pinned), React 19.0.0, TypeScript 5.7 | VERIFIED |
| Node running locally | v24.18.0 | VERIFIED |
| Node requirement | none pinned (Next.js minimum ~18) | VERIFIED |
| Deploy target | Vercel "pivot-ai-web", auto-deploys from `main` | UNVERIFIED (Vercel dashboard not accessible) |
| `vercel.json` | Absent — default Vercel settings | VERIFIED |
| `next.config.ts` | Security headers set (X-Frame-Options, CSP, etc.); `cacheComponents` NOT set (no such field in website config) | VERIFIED |

### Git State
| Field | Value | Status |
|---|---|---|
| Current branch | `fix/industries-index` | VERIFIED |
| Commits ahead of local `main` | 8 (includes merged PRs #3 and #4 plus the industries-index fix) | VERIFIED |
| Local `main` vs `origin/main` | Local main is 7 commits behind remote main | VERIFIED |
| Unstaged working-tree changes | 5 files: email address corrections (pivotai.app→pivotcalls.co; personal email→business email) | VERIFIED |
| Remote branch | `origin/fix/industries-index` in sync | VERIFIED |

### Tests — `npm test` (4 scripts)
| Script | Result | Status |
|---|---|---|
| `scripts/smoke-routes.mjs` | **30 passed, 0 failed** | VERIFIED |
| `scripts/url.test.mjs` | **15 passed, 0 failed** | VERIFIED |
| `scripts/parse.test.mjs` | **9 passed, 0 failed** | VERIFIED |
| `scripts/settings-ivr.test.mjs` | **20 passed, 0 failed** | VERIFIED |
| **TOTAL** | **74 passed, 0 failed, 0 skipped** | VERIFIED |

### npm audit
```
postcss  <8.5.10  (Severity: moderate)
PostCSS XSS via Unescaped </style> — GHSA-qx2v-qp2m-jg93
Chain: next → next/node_modules/postcss
Fix: npm audit fix --force would downgrade Next to 9.3.3 (BREAKING — do NOT run)
2 moderate severity vulnerabilities
```
Status: VERIFIED. Not actionable without upstream Next.js fix.

### Supabase Migrations
None (website calls the Fastify backend for all data). VERIFIED.

### Config / Env Vars (from .env.example)
| Var | Purpose | Status |
|---|---|---|
| `RESEND_API_KEY` | Email delivery for contact/demo forms | UNVERIFIED (value not visible) |
| `OWNER_EMAIL` | Recipient for form submissions | UNVERIFIED |
| `FROM_EMAIL` | Resend sender address | UNVERIFIED |
| `SUPABASE_URL` | Supabase project URL (server-side only) | UNVERIFIED |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase auth | UNVERIFIED |
| `NEXT_PUBLIC_API_BASE` | Fastify backend URL | UNVERIFIED |
| `NEXT_PUBLIC_SUPABASE_URL` | Public Supabase URL | UNVERIFIED |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase key | UNVERIFIED |

### Testimonial / Trust Content Audit
All sections inspected (`components/sections/testimonials.tsx`, `hero.tsx`, `cta.tsx`, `faq.tsx`, `pricing.tsx`, `features.tsx`, `how-it-works.tsx`, `industries.tsx`):
- **Testimonials component** (`components/sections/testimonials.tsx`): Is a feature comparison table (Pivot AI vs Answering Service vs Voicemail) + 3 honest trust cards ("Pilot Program", "Founder-led", "Honest early access"). **No fabricated quotes, no star ratings, no fake customer logos.** VERIFIED CLEAN.
- **Hero** (`components/sections/hero.tsx`): Shows "Founder-led Early Access" badge, stats are "Early Access" and "Pilot Program" — not fabricated metrics. VERIFIED CLEAN.
- **CTA** (`components/sections/cta.tsx`): "Founder-led early access — limited pilot spots." No false claims. VERIFIED CLEAN.
- **FAQ** (`components/sections/faq.tsx`): 11 factual Q&A items, no customer quotes. VERIFIED CLEAN.
- **Pricing** (`components/sections/pricing.tsx`): Prices $49/$149/$299 with feature lists. No fabricated social proof. VERIFIED CLEAN.

**Result: No fake testimonials, fabricated reviews, unsupported customer quotes, fake ratings, or fake logos found. Section already clean per prior cleanup (PRs #3/#4).**

### Notable Issues
1. CSP in `next.config.ts` uses `'unsafe-inline'` and `'unsafe-eval'` — reduces XSS protection (UNVERIFIED impact in production as Vercel may override).
2. Personal email `gagan.s.atwal@gmail.com` was exposed in `app/contact/page.tsx` — fixed in unstaged changes committed in this session.
3. Old domain `hello@pivotai.app` in `app/privacy/page.tsx`, `app/terms/page.tsx`, `.env.example`, `README.md` — corrected in this session.

---

## REPO 2: pivot-ai-dashboard

**Path:** `C:\Users\gagan\OneDrive\Documents\pivot-ai-dashboard`

### Structure & Runtime
| Field | Value | Status |
|---|---|---|
| Framework | Next.js ^15.5.4, React 19, TypeScript 5, Tailwind 3 | VERIFIED |
| Node running locally | v24.18.0 | VERIFIED |
| Deploy target | Vercel "pivot-ai-dashboard" (name per instructions) | UNVERIFIED (no vercel.json; Vercel dashboard blocked) |
| `next.config.ts` | `cacheComponents: true` only — no security headers | VERIFIED |
| `vercel.json` | Absent | VERIFIED |

### Git State
| Field | Value | Status |
|---|---|---|
| Current branch | `main` | VERIFIED |
| Ahead of origin | 0 (clean) | VERIFIED |
| Recent commits | `1d8d956 docs(phase-7+8)`, `f94989a feat(phase-3+4+5+6)`, `b4e71eb feat(phase-1+2)`, etc. | VERIFIED |

### Tests
No `test` script defined in `package.json`. No test files found. VERIFIED — zero tests.

### npm audit
```
postcss  <8.5.10  (Severity: moderate)
Chain: next → next/node_modules/postcss
2 moderate severity vulnerabilities
```
Status: VERIFIED. Same issue as website — not fixable without breaking change.

### Supabase Migrations
1 file: `20240709000000_create_campaigns_tables.sql`
Applied status: BLOCKED (cannot query Supabase without credentials).

### Key Env Vars (from .env.example)
| Var | Purpose | Status |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public Supabase URL | UNVERIFIED |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key | UNVERIFIED |
| `OPENAI_API_KEY` | Server-side AI personalization | UNVERIFIED |

### Notable Issues
1. No test suite — zero coverage.
2. No security headers in `next.config.ts` (unlike pivot-ai-website which has them).
3. `@supabase/ssr: "latest"` and `@supabase/supabase-js: "latest"` pinned to "latest" — risky for reproducible builds.
4. `next: "^15.5.4"` (caret) in dashboard vs `next: "^15.5.18"` (after pin fix) in website — dashboard could resolve a different patch.
5. No vercel.json means deploy branch is UNVERIFIED (assumed `main` by Vercel default).

---

## REPO 3: ai-receptionist-voice

**Path:** `C:\Users\gagan\OneDrive\Documents\ai-receptionist-voice`
**Live service:** ai-receptionist-voice.onrender.com (Render "ai-receptionist")

### Structure & Runtime
| Field | Value | Status |
|---|---|---|
| Framework | Fastify 5.3.3, Node ESM, no TypeScript | VERIFIED |
| Package version | 1.4.0 | VERIFIED |
| Node requirement | `>=18` (engines field) | VERIFIED |
| Node running locally | v24.18.0 | VERIFIED |
| `render.yaml` `NODE_VERSION` | `"20"` (Render will use Node 20 in production) | VERIFIED |
| `render.yaml` branch | `main` | VERIFIED |
| `render.yaml` `autoDeploy` | `false` — manual deploy required | VERIFIED |
| Orchestrator-reported live commit | `f30aebf` era running ElevenLabs | UNVERIFIED (not directly observed by this audit session) |

### Git State
| Field | Value | Status |
|---|---|---|
| Current branch | `main` | VERIFIED |
| Ahead of origin | 0 (clean) | VERIFIED |
| Latest commit | `57ecee4 docs(XXIV): add acquisition package` | VERIFIED |
| Recent notable commits | `f30aebf fix(voice): MISSION XVI` (voice pipeline repair), `0aa572d fix(voice): MISSION XVII` (signed URL auth), `ad28d4d fix(voice): MISSION XVIII` | VERIFIED |
| Open Dependabot PRs (remote) | googleapis-173.0.0, openai-6.46.0, stripe-22.3.1, twilio-6.0.2, production-minor-patch, actions/checkout-7, actions/setup-node-6, codeql-action-4, gitleaks-action-3 | VERIFIED (from git branch -a) |

### Tests — `npm test` (26 test files, sequential)
All 26 test files executed, 0 failures.

| File | Passed | Notes |
|---|---|---|
| calendar.test.mjs | 8 | |
| calendar_oauth.test.mjs | 11 | |
| billing.test.mjs | 12 | |
| billing_checkout.test.mjs | 18 | |
| tenant_isolation.test.mjs | 15 | |
| sms_notify.test.mjs | 20 | Warning: `sms_opt_outs` table missing (migration 000006 not applied to test DB) |
| auth.test.mjs | 20 | |
| crm.test.mjs | 12 | |
| kb.test.mjs | 16 | |
| team.test.mjs | 10 | |
| billing_ops.test.mjs | 11 | |
| vs_carriers.test.mjs | 6 | |
| logs.test.mjs | 3 | |
| cors.test.mjs | 8 | |
| voice_ivr.test.mjs | 13 | |
| extraction.test.mjs | 24 | |
| voice_provider.test.mjs | 28 | |
| emotion.test.mjs | 29 | |
| personas.test.mjs | 16 | |
| voice_ivr_transfer.test.mjs | 26 | |
| call_memory.test.mjs | 36 | |
| elevenlabs.test.mjs | 34 | |
| hotfix.test.mjs | 31 | |
| audio_pipeline.test.mjs | 28 | |
| health_voice.test.mjs | 30 | |
| elevenlabs_ws_auth.test.mjs | 20 | |
| **TOTAL** | **485 passed, 0 failed, 0 skipped** | VERIFIED |

### npm audit
```
uuid  <11.1.1  (Severity: moderate)
uuid: Missing buffer bounds check in v3/v5/v6 when buf is provided — GHSA-w5hq-g745-h8pq
Chain: googleapis → googleapis-common → gaxios → uuid
4 moderate severity vulnerabilities
Fix: npm audit fix (no --force needed) would update googleapis to 173.0.0
Note: googleapis 173.0.0 is already a Dependabot PR on the repo
```
Status: VERIFIED. Fixable via `npm audit fix` (non-breaking).

### Supabase Migrations
11 migration files present in `supabase/migrations/`:
| Migration | File | Applied Status |
|---|---|---|
| 000001 | tenant_isolation_columns.sql | BLOCKED |
| 000002 | rls_policyless_tables.sql | BLOCKED |
| 000003 | business_settings_routing.sql | BLOCKED |
| 000004 | **(MISSING — gap in sequence)** | N/A |
| 000005 | pending_onboardings.sql | BLOCKED |
| 000006 | sms_opt_outs.sql | UNVERIFIED — test warning: "no table" |
| 000007 | provision_tenant_fn.sql | BLOCKED |
| 000008 | businesses_stripe_customer.sql | BLOCKED |
| 000009 | crm.sql | BLOCKED |
| 000010 | ivr_greetings.sql | BLOCKED |
| 000011 | lead_extraction_fields.sql | BLOCKED |
| 000012 | performance_indexes.sql | BLOCKED |

**Note:** Migration `000004` is missing (gap between 000003 and 000005). Whether this was intentionally skipped or accidentally deleted is UNVERIFIED.

Also: `supabase/onboarding/vs_carriers_onboarding.template.sql` (onboarding template, not a migration).

### Key Env Vars (from .env.example and render.yaml)
| Var | Required | Status |
|---|---|---|
| `PUBLIC_HOST` | REQUIRED | BLOCKED |
| `OPENAI_API_KEY` | REQUIRED | BLOCKED |
| `TWILIO_AUTH_TOKEN` | REQUIRED | BLOCKED |
| `SUPABASE_URL` | REQUIRED | BLOCKED |
| `SUPABASE_SECRET_KEY` | REQUIRED | BLOCKED |
| `VOICE_PROVIDER` | Optional (default: "openai") | UNVERIFIED in production |
| `ELEVENLABS_API_KEY` | Required if VOICE_PROVIDER=elevenlabs | BLOCKED |
| `ELEVENLABS_AGENT_ID` | Required if VOICE_PROVIDER=elevenlabs | BLOCKED |
| `ELEVENLABS_WS_URL` | Optional override | BLOCKED |
| `WS_SHARED_SECRET` | REQUIRED (render: generateValue) | BLOCKED |
| `DASHBOARD_SESSION_SECRET` | REQUIRED (render: generateValue) | BLOCKED |
| `STRIPE_SECRET_KEY` | Optional (billing) | BLOCKED |
| `RESEND_API_KEY` | Optional (email) | BLOCKED |
| `SENTRY_DSN` | Optional (monitoring) | BLOCKED |
| `CUSTOMER_AUTH_ENABLED` | Optional (default: false) | UNVERIFIED |
| `BUSINESS_ID` | Optional (required for dashboard) | UNVERIFIED |

### Config vs render.yaml Notes
- `render.yaml` `NODE_VERSION: "20"` vs local runtime v24.18.0 — production uses Node 20, local uses Node 24. Minor version divergence, no known breaking issues for this codebase (>=18 requirement).
- `render.yaml` `autoDeploy: false` — deployments to Render are NOT automatic on push to main.
- `render.yaml` `healthCheckPath: /health` — verified in code (Fastify `/health` route exists and returns 200).

### Notable Issues
1. **Migration 000004 gap**: a sequential gap in Supabase migrations (000003 → 000005). Could indicate a deleted/rolled-back migration or an intentional skip. UNVERIFIED.
2. **sms_opt_outs table**: Test warning suggests migration 000006 may not be applied to production Supabase. Tests pass because the code gracefully handles the missing table.
3. **Dependabot PRs open**: 9 PRs waiting to be merged (googleapis, openai, stripe, twilio, plus CI action upgrades). The googleapis fix would also resolve the npm audit vulnerability.
4. **Node version mismatch**: Local v24 vs Render Node 20. No issues observed in tests but production behavior on edge cases may differ.
5. **VOICE_PROVIDER in production**: orchestrator reports ElevenLabs is running. render.yaml has `VOICE_PROVIDER` as `sync: false` — actual value set in Render dashboard (BLOCKED).

---

## Cross-Repo Summary

| Item | pivot-ai-website | pivot-ai-dashboard | ai-receptionist-voice |
|---|---|---|---|
| Branch | fix/industries-index | main | main |
| Tests | 74 pass / 0 fail | No tests | 485 pass / 0 fail |
| npm audit vulns | 2 moderate (not fixable) | 2 moderate (not fixable) | 4 moderate (fixable) |
| Supabase migrations | None | 1 (applied status BLOCKED) | 11 (applied status BLOCKED, gap at 000004) |
| Fake content | None found | N/A | N/A |
| Missing test suite | No | **YES** | No |
| Security headers | YES (next.config.ts) | NO | N/A (Fastify, CORS configured) |
| Deploy gating | Vercel auto from main | UNVERIFIED | Render manual (autoDeploy: false) |
