# Customer-readiness CTA correction — 2026-07-22

This branch aligns the public pricing conversion path with the currently verified founder-assisted pilot flow.

## Changed

- Starter and Pro CTA labels now say `Request Pilot Demo` while retaining `/demo` as the destination.
- Removed unsupported claims that a 14-day self-service trial begins without a card.
- Added explicit language that requesting a demo does not create an account, start a subscription, or charge a card.
- Pricing metadata and page copy now describe founder-assisted onboarding.

## Not changed

- Plan prices.
- Stripe products, price IDs, checkout, subscriptions, billing, or production data.
- Feature availability claims beyond the CTA/trial mismatch.
- Legal policies.
- Backend code, Release G, migrations, or production deployment.

## Verification required before merge

- Vercel preview build passes.
- `/pricing` renders on desktop and mobile.
- All Starter and Pro CTAs open `/demo` and use matching labels.
- Premium still opens `/contact`.
- No checkout or account activation is implied.
- Founder reviews the wording before production promotion.
