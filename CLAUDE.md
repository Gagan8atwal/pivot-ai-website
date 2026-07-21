# CLAUDE.md — pivot-ai-website

Pivot AI's public marketing website **and** the unified authenticated app frontend that
consumes the `ai-receptionist-voice` backend. Next.js 15 App Router.

- Remote: `https://github.com/Gagan8atwal/pivot-ai-website.git` (branch `main`)
- Deploys to: **Vercel** (auto-detected Next.js)
- Verified healthy: install ✅ · `next lint` ✅ · `tsc --noEmit` ✅ · `npm test` ✅ · `next build` ✅

## Stack
Next.js `^15.5`, React `19.0.0`, Tailwind CSS `^3.4`, TypeScript `^5.7`, shadcn/ui pattern,
Lucide icons, `next/font` (Inter), Supabase JS, Resend (email), googleapis (Google Calendar).

## Commands
```bash
npm install       # or: npm ci
npm run dev       # dev server on :3000
npm run build     # production build
npm start         # serve production build
npm run lint      # next lint (ESLint 8, next/core-web-vitals)
npm test          # node scripts: smoke-routes + url + parse + settings-ivr (20 IVR tests)
```

## Layout
- `app/` — App Router. Route groups: `(app)/` = authenticated product surfaces
  (dashboard, calls, crm, appointments, billing, messages, settings, team, knowledge-base,
  vs-carriers, owner); `(auth)/` = login/signup/reset; plus marketing routes
  (`/`, `/demo`, `/contact`, `/industries/[slug]`, `/privacy`, `/terms`) and
  `app/api/{contact,demo}` route handlers.
- `components/` — `sections/` (marketing), `app/` (product shell/widgets), `ui/` (shadcn).
- `lib/` — `api.ts` (backend client), `auth.ts`, `settings-ivr.ts`, `industries.ts`,
  `google-calendar.ts`, `demo-emails.ts`, formatters/parsers.
- `scripts/` — the `*.test.mjs` files run by `npm test`, plus brand raster generation.
- `marketing/`, `brand/`, `branding/` — copy and brand assets. `GROUND_TRUTH.md` = source of truth.

## Environment (`.env.example`)
Server-only: `RESEND_API_KEY`, `OWNER_EMAIL`, `FROM_EMAIL`, `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `DASHBOARD_OWNER_ID`. Public: `NEXT_PUBLIC_API_BASE`
(the Render backend), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
Never expose the service-role key to the browser.

## Notes / gotchas
- `next/font` fetches Inter from Google Fonts **at build time** — a build in a network-restricted
  sandbox fails on the font fetch only; it is not a code defect.
- `next lint` is deprecated in Next 16; migration to the ESLint CLI is a future task.
- Keep `lib/api.ts` in sync with the backend contract in `ai-receptionist-voice`.
