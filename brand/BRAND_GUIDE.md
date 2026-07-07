# Pivot AI — Brand Guide

The complete, production brand system for **Pivot AI** — the 24/7 AI receptionist
for local service businesses. All source is hand-authored, editable SVG (plus HTML
for the email signature). This guide is the single source of truth for colour,
type, spacing, and logo usage.

---

## 1. Brand at a glance

- **Name:** Pivot AI (always two words, capital P, capital A + I).
- **Tagline (primary):** *Never miss another customer call.*
- **Descriptor:** *The 24/7 AI receptionist for local service businesses.*
- **Domain:** pivotcalls.co
- **Personality:** Dependable, modern, approachable, no-hype. We sound like a
  trusted operator, not a robot. Confident, plain-spoken, never over-promising.

---

## 2. Logo

### Files
| Asset | Path | Use |
|---|---|---|
| Primary (horizontal, light bg) | `branding/logo-primary.svg`, `public/logo/pivot-ai-logo.svg` | Default lockup |
| Primary (dark bg) | `branding/logo-primary-dark.svg`, `public/logo/pivot-ai-logo-white.svg` | On navy/photos |
| Stacked / secondary | `branding/logo-stacked.svg` | Square-ish spaces, avatars, print |
| Mark only | `branding/logo-mark.svg`, `public/logo/pivot-ai-mark.svg` | App tiles, favicons, watermarks |
| All-black | `branding/logo-all-black.svg` | One-colour print, engraving, fax |
| All-white | `branding/logo-all-white.svg` | Knockout on dark/photo |
| App icon (maskable) | `public/icons/app-icon.svg` | PWA / app stores |
| Favicon master | `public/icons/favicon.svg`, `app/icon.svg` | Browser tab |

### The mark
A phone glyph inside a rounded square, with a subtle "pivot" arc — the moment a
missed call *pivots* into a captured customer. Navy container, amber glyph.

### Clear space
Keep clear space around the logo equal to **the height of the mark's corner radius**
(≈ 25% of the mark height) on all sides. Nothing — text, edges, other logos — enters
this zone.

### Minimum size
- Horizontal logo: **120px** wide (screen) / 0.9in (print).
- Mark alone: **24px** (favicon is a simplified 32-grid version).

### Do
- Use the provided SVGs unchanged.
- Use the dark-bg variant on navy or photography.
- Give it room to breathe.

### Don't
- ❌ Recolour the logo outside the approved palette.
- ❌ Stretch, skew, rotate, or add drop shadows/gradients to the wordmark.
- ❌ Re-typeset "Pivot AI" in another font.
- ❌ Put the light-bg logo on a busy/dark background (use the dark or white variant).
- ❌ Box the logo or place it on low-contrast colour.

---

## 3. Colour

### Core palette
| Token | Hex | Usage |
|---|---|---|
| **Navy / Ink** | `#0E1B2C` | Primary brand colour — text, backgrounds, the mark container |
| **Navy 800** | `#132C55` | Gradient partner, elevated dark surfaces |
| **Navy 700** | `#1B3A6E` | Secondary dark accents |
| **Navy 500** | `#3260A3` | Links/icons on light, informational |
| **Navy 300** | `#7A9ECB` | Muted text on dark |
| **Navy 200** | `#AAC2DD` | Sub-headline text on dark |
| **Amber / Signal** | `#F59E0B` | The accent — CTAs, highlights, the phone glyph. Use sparingly for punch. |
| **Amber 400** | `#FBBF24` | Hover/lighter accent |

### Neutrals
| Token | Hex | Usage |
|---|---|---|
| White | `#FFFFFF` | Base surface |
| Slate 50 | `#F8FAFC` | App background |
| Slate 200 | `#E2E8F0` | Borders, dividers |
| Slate 500 | `#64748B` | Secondary text |
| Slate 700 | `#334155` | Body text on light |

### Functional (UI only — not brand accents)
| Token | Hex | Meaning |
|---|---|---|
| Success | `#16A34A` | Confirmed / won |
| Destructive | `#DC2626` | Errors / cancel |

### Ratios & accessibility
- Roughly **60% navy/neutral, 30% white, 10% amber**. Amber is a spotlight, not a wash.
- Navy `#0E1B2C` on white and white on navy both exceed WCAG AA.
- Amber `#F59E0B` is a **background/accent** colour: pair amber fills with **navy text**
  (as in buttons). Do **not** use amber text on white for body copy (fails contrast).

*(These tokens match the app's `tailwind.config.ts` `navy` scale and the amber accent.)*

---

## 4. Typography

**Typeface: Inter** (already loaded in the app via `next/font`). Fallback stack:
`Inter, "Helvetica Neue", Arial, sans-serif`.

| Role | Size / Weight | Notes |
|---|---|---|
| Display | 48–82px / 800 | Hero headlines, letter-spacing −2 |
| H1 | 32px / 700 | Page titles, tracking −0.5 |
| H2 | 24px / 700 | Section titles |
| H3 | 20px / 600 | Card titles |
| Body | 16px / 400 | Default copy, line-height 1.5 |
| Small | 14px / 400 | Secondary text |
| Overline | 12px / 600, letter-spacing 3 | Eyebrows/labels, uppercase |

**Rules:** Headlines use tight tracking (−0.5 to −2). Never justify body text. Sentence
case for UI; Title Case for buttons/nav labels.

---

## 5. Spacing & layout

Base unit **4px**; scale: **4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96**.
- Corner radius: buttons/inputs `8px`, cards `12–16px`, the mark container `25%` of its size.
- Grid: 12-column, max content width **1280px** (`max-w-7xl`), gutters 16–32px.
- Give sections generous vertical rhythm (64–96px between major blocks).

---

## 6. Iconography & imagery

- Icons: **Lucide** (already a dependency), 1.5–2px stroke, rounded caps — matches the mark.
- Photography: real people/local businesses, warm and candid; avoid staash stocky "robot"
  clichés. Overlay navy at 40–60% when placing white text.

---

## 7. Voice & messaging (truthful claims only)

Approved capability claims (these are what the product actually does):
- Answers calls **24/7** with an AI receptionist.
- **Captures leads** (name, phone, reason for calling) into a dashboard/CRM.
- **Books appointments** and syncs to **Google Calendar**.
- Sends **SMS + email confirmations**.
- **Multilingual**: English, Punjabi, Hindi.
- Warm-transfers / routes to departments (e.g. Dispatch, Mechanic, Manager).
- Billing via **Stripe**.

Do **not** claim anything outside the above (no "replaces your staff", no unverified
stats, no integrations we don't have).

---

## 8. Asset index

- **Logos:** `branding/logo-*.svg`, `public/logo/*.svg`
- **Icons/favicon:** `public/icons/*.svg`, `app/icon.svg`, `app/apple-icon.tsx`
- **Social/OG:** `app/opengraph-image.tsx` + `app/twitter-image.tsx` (generated PNG),
  `branding/og-image.svg` (editable master), `branding/social-profile.svg`
- **Banners:** `branding/linkedin-banner.svg` (1584×396), `branding/x-banner.svg` (1500×500)
- **Stationery:** `branding/business-card.svg`, `branding/letterhead.svg`
- **Email:** `branding/email-signature.html`
- **Web:** `branding/website-hero.svg`

---

## 9. Raster exports needed (owner action)

Everything above is vector. A few destinations require raster files that can't be
hand-authored as binary here. Export from the listed SVG master:

| Output | Size(s) | From |
|---|---|---|
| `favicon.ico` | 16, 32, 48 (multi-res .ico) | `public/icons/favicon.svg` |
| Apple touch icon | 180×180 PNG | Auto-generated by `app/apple-icon.tsx` ✓ (no action) |
| OG / Twitter image | 1200×630 PNG | Auto-generated by `app/opengraph-image.tsx` ✓ (no action) |
| PWA icons | 192, 512 PNG (+ maskable) | `public/icons/app-icon.svg` |
| Social profile avatar | 400, 800 PNG | `branding/social-profile.svg` |
| LinkedIn / X banners | export at native px | respective SVGs |
| Business card / letterhead | PDF at 300dpi + 0.125" bleed | respective SVGs |

Export tool suggestions: `rsvg-convert`, Inkscape (`inkscape --export-type=png`),
or any browser "print to PDF". The favicon/OG/apple-icon are already wired into Next
metadata and render automatically at build — the manual exports above are only for
off-site destinations (print shop, social profile uploads).
