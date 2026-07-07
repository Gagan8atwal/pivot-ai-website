# Pivot AI — Pricing

*The 24/7 AI receptionist for local service businesses.*
**14-day free trial · no credit card to start · cancel anytime.**
Billing is handled securely through **Stripe**.

> Figures below match the public pricing on **pivotcalls.co**. See
> [Reconcile](#reconcile) for an internal note.

---

## Plans

### Starter — **$49/month**
*Solo operators and small businesses getting started.*
Up to **100 calls/month**.
- AI receptionist (24/7)
- Lead capture & storage
- SMS notifications
- Email confirmations
- Basic knowledge base
- Call transcripts
- Email support

### Pro — **$149/month**  ⭐ Most popular
*Growing businesses with higher call volume.*
Up to **500 calls/month**.
- Everything in Starter, plus:
- Appointment booking
- Google Calendar sync
- Advanced knowledge base
- Multi-tenant support
- Call analytics dashboard
- Priority email support

### Premium — **$299/month**
*Multi-location businesses that need maximum capacity.*
**Unlimited calls**.
- Everything in Pro, plus:
- Unlimited calls
- Custom AI voice
- Multi-location support
- Priority support

---

## What every plan includes
24/7 AI answering · lead capture to dashboard/CRM · call transcripts · configurable
greetings, hours & after-hours · multilingual (EN/PA/HI) · Stripe-secured billing.

## Add-ons & notes
- **Multilingual (English / Punjabi / Hindi)** greetings and conversation.
- **Department routing + warm transfer** (e.g. Dispatch / Mechanic / Manager).
- Telephony/carrier usage may apply depending on setup — confirmed during onboarding.

---

## Frequently asked (pricing)
- **Is there a contract?** No — month-to-month, cancel anytime from the billing page.
- **What happens after the trial?** Pick a plan to continue; nothing is charged until you do.
- **Can I change plans?** Yes — upgrade or downgrade anytime; changes are handled in-app.

---

<a id="reconcile"></a>
## ⚠️ Internal note — reconcile before publishing (owner action)
The repository currently contains **two different price lists**:

| Plan | Homepage (`components/sections/pricing.tsx`) | In-app billing (`app/(app)/billing/page.tsx`) |
|---|---|---|
| Starter | **$49**/mo · 100 calls | **$99**/mo |
| Pro | **$149**/mo · 500 calls | **$249**/mo |
| Tier 3 | **Premium $299**/mo · unlimited | **Scale $599**/mo |

This sheet uses the **homepage** figures (what prospects see). Before circulating
pricing externally, decide the single correct list and align both the homepage
component and the billing plan tiers (and the Stripe products) to match.
