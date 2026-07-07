# Product Screenshots — shot list & capture guide

Screenshots require a **logged-in session against the live app** with demo data, so
they can't be generated in this repo. Below is the shot list, exact routes, and a
repeatable capture process (owner action). Frame everything on the brand (navy/amber)
and blur any real customer PII.

## Recommended shots
| # | Screen | Route | What to show |
|---|---|---|---|
| 1 | Dashboard | `/dashboard` | Stat cards + Recent Leads + Upcoming Appointments populated |
| 2 | CRM — Leads | `/crm` | Leads table with statuses, search/filter visible |
| 3 | CRM — Lead drawer | `/crm` (open a lead) | Contact details + notes + status |
| 4 | CRM — Pipeline | `/crm` (Pipeline tab) | Stage columns with lead cards |
| 5 | Appointments | `/appointments` | Upcoming list synced from calendar |
| 6 | Calls / Messages | `/calls`, `/messages` | Call/lead activity + SMS/email logs |
| 7 | Knowledge base | `/knowledge-base` | FAQs / services / greeting config |
| 8 | Settings — IVR & greetings | `/settings` | EN/PA/HI greetings, departments, hours |
| 9 | Billing | `/billing` | Plan cards + invoices |
| 10 | Tenant setup (VS Carriers) | `/vs-carriers` | Multilingual greetings + departments template |

## How to capture (repeatable)
1. Deploy or run the app pointed at a backend with **seed/demo data** (no real PII).
2. Log in as an **owner/admin** so all sections render.
3. Browser at **1440×900**, 100% zoom, light theme; hide the bookmarks bar.
4. Capture full-viewport PNGs; for marketing frames, drop into a device mockup.
5. Export at 2× for retina; keep originals in `/marketing/screenshots/` (create as needed).

## Placeholders until then
Until real captures exist, use the **website hero graphic**
(`/branding/website-hero.svg`) as an illustrative stand-in in decks and the brochure,
clearly presented as an illustration, not a screenshot.

> ⚠️ Owner action: capture shots 1–10 from a live login and add them here.
