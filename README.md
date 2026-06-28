# Pivot AI — Public Marketing Website

**Official public marketing website for Pivot AI.**
Built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui.

---

## Stack

| Technology | Purpose |
|---|---|
| Next.js 15 (App Router) | Framework |
| TypeScript | Type safety |
| Tailwind CSS v3 | Styling |
| shadcn/ui pattern | UI components |
| Lucide React | Icons |
| `next/font` (Inter) | Typography |

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page (Hero, Features, How It Works, Testimonials, Industries, Pricing, FAQ, CTA) |
| `/demo` | Demo request form with SMS consent |
| `/contact` | Contact form |
| `/privacy` | Privacy Policy (A2P compliant) |
| `/terms` | Terms of Service |

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

---

## Deployment (Vercel)

### Option A — Vercel Dashboard
1. Push this repository to GitHub.
2. Go to [vercel.com](https://vercel.com) → New Project.
3. Import the `pivot-ai-website` repository.
4. Vercel auto-detects Next.js. Click **Deploy**.
5. Your site is live at `<your-project>.vercel.app`.

### Option B — Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

### Connect `pivotai.app`
1. In Vercel → Project → Settings → Domains.
2. Add `pivotai.app` and `www.pivotai.app`.
3. Update your DNS registrar with the records Vercel provides.
4. Vercel provisions SSL automatically.

---

## Wiring Up the Forms

The demo and contact forms currently show a success state after a simulated delay.
To connect them to a real backend, replace the `handleSubmit` functions with one of:

**Option 1 — Resend (email)**
```ts
const response = await fetch('/api/demo', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(form),
})
```
Then create `app/api/demo/route.ts` using the Resend SDK.

**Option 2 — Formspree**
Change `<form>` action to your Formspree endpoint.

**Option 3 — Your existing backend**
POST to `https://ai-receptionist-voice.onrender.com/your-endpoint`.

---

## Customization

### Brand Colors
Defined in `tailwind.config.ts`:
- Navy: `#0e1b2c` (primary dark)
- Amber: `#f59e0b` (accent)

### Content
All marketing copy lives in the section components:
- `components/sections/hero.tsx`
- `components/sections/features.tsx`
- `components/sections/pricing.tsx`
- etc.

### OG Image
Add `public/og-image.png` (1200×630px) to enable social previews.
Update the `og-image.png` URL in `app/layout.tsx`.

---

## Legal Compliance

This site includes:
- ✅ A2P 10DLC compliant SMS opt-out language in footer
- ✅ SMS consent checkbox on demo form
- ✅ STOP/HELP keywords in Privacy Policy
- ✅ "Mobile information will not be shared with third parties" clause
- ✅ Privacy Policy with subprocessor list
- ✅ Terms of Service with TCPA compliance section

---

## Environment Variables

No environment variables are required for the public marketing site.
If you add server-side form handling, create `.env.local`:

```
RESEND_API_KEY=re_...
FORM_NOTIFICATION_EMAIL=hello@pivotai.app
```

---

## Project Structure

```
pivot-ai-website/
├── app/
│   ├── globals.css          # Global styles + CSS variables
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Home (/) page
│   ├── demo/page.tsx        # Demo request page
│   ├── contact/page.tsx     # Contact page
│   ├── privacy/page.tsx     # Privacy Policy
│   ├── terms/page.tsx       # Terms of Service
│   ├── sitemap.ts           # Auto-generated sitemap
│   └── robots.ts            # Robots.txt
├── components/
│   ├── navbar.tsx           # Top navigation
│   ├── footer.tsx           # Footer with A2P compliance
│   ├── ui/                  # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx        # Input, Textarea, Label, Select, Checkbox
│   │   └── accordion.tsx    # FAQ accordion
│   └── sections/            # Landing page sections
│       ├── hero.tsx
│       ├── features.tsx
│       ├── how-it-works.tsx
│       ├── industries.tsx
│       ├── pricing.tsx
│       ├── testimonials.tsx
│       ├── faq.tsx
│       └── cta.tsx
├── lib/
│   └── utils.ts             # cn() utility
└── public/
    └── favicon.svg
```

---

© 2026 Pivot AI · AL Logistics LLC
