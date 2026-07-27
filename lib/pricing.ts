/**
 * Single source of truth for Pivot AI plan pricing.
 *
 * Both the marketing pricing section (`components/sections/pricing.tsx`, also
 * rendered at `/pricing`) and the in-app billing page
 * (`app/(app)/billing/page.tsx`) render from this module. They previously
 * hardcoded their own tables and drifted apart — the app advertised
 * "Starter $99 / Pro $249 / Scale $599", none of which exist.
 *
 * The amounts here match the live Stripe prices referenced by the
 * STRIPE_PRICE_* environment variables named below. Only the env var NAMES
 * live in this file — never a Stripe price id or secret. Changing an amount
 * here without changing the corresponding Stripe price would put the site
 * back out of sync, so treat these numbers as mirrored config, not copy.
 *
 * Guarded by `scripts/pricing.test.mjs` (`npm test`).
 */

export type PlanId = 'starter' | 'pro' | 'premium'

export interface PricingPlan {
  /** Stable plan identifier used by the billing APIs. */
  id: PlanId
  /** Display name. */
  name: string
  /** Monthly price in whole US dollars. */
  price: number
  /** Billing period the price applies to. */
  period: 'month'
  /** Marketing one-liner. */
  description: string
  /** Included call volume, as advertised. */
  callVolume: string
  /** Feature bullets, as advertised on the marketing site. */
  features: string[]
  /** Marketing call-to-action label. */
  cta: string
  /** Marketing call-to-action destination. */
  ctaHref: string
  /**
   * NAME of the environment variable holding this plan's Stripe price id.
   * The value is resolved server-side at runtime; it is never bundled here.
   */
  stripePriceEnvVar: string
  /** Highlighted as "Most Popular" on the marketing site. */
  highlight: boolean
}

/** Currency all plan prices are quoted in. */
export const PRICING_CURRENCY = 'USD'

export const PRICING_PLANS: readonly PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    period: 'month',
    description: 'For solo operators and small businesses entering a founder-assisted pilot.',
    callVolume: 'Pilot target: up to 100 calls/month',
    features: [
      'AI receptionist coverage',
      'Lead capture & storage',
      'SMS notifications when enabled',
      'Email confirmations when enabled',
      'Reviewed business knowledge base',
      'Call transcripts where supported',
      'Email support',
    ],
    cta: 'Request Pilot Demo',
    ctaHref: '/demo',
    stripePriceEnvVar: 'STRIPE_PRICE_STARTER',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 149,
    period: 'month',
    description: 'For growing businesses that need broader pilot capacity and reviewed workflows.',
    callVolume: 'Pilot target: up to 500 calls/month',
    features: [
      'Everything in Starter',
      'Appointment request workflows',
      'Google Calendar sync when enabled',
      'Expanded business knowledge base',
      'Tenant-scoped operations',
      'Call analytics dashboard',
      'Priority email support',
    ],
    cta: 'Request Pilot Demo',
    ctaHref: '/demo',
    stripePriceEnvVar: 'STRIPE_PRICE_PRO',
    highlight: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 299,
    period: 'month',
    description:
      'For multi-location pilot requirements that need reviewed capacity and dedicated support.',
    callVolume: 'Custom capacity confirmed during onboarding',
    features: [
      'Everything in Pro',
      'Custom capacity planning',
      'Voice options subject to validation',
      'Priority support',
      'Multi-location configuration review',
    ],
    cta: 'Contact Sales',
    ctaHref: '/contact',
    stripePriceEnvVar: 'STRIPE_PRICE_PREMIUM',
    highlight: false,
  },
]

/** Look up a plan by its id (case-insensitive). Returns undefined if unknown. */
export function getPlan(id: string | null | undefined): PricingPlan | undefined {
  if (!id) return undefined
  const key = id.trim().toLowerCase()
  return PRICING_PLANS.find((plan) => plan.id === key)
}

/** Format a plan's monthly price, e.g. `$149/mo`. */
export function formatMonthlyPrice(plan: PricingPlan): string {
  return `$${plan.price}/mo`
}
