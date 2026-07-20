/**
 * lib/import.ts — pure helpers for the website import review UI.
 *
 * The job of this file is to stop the interface from overclaiming. An import
 * produces proposals; a review records a decision; neither changes what the
 * receptionist says. Every label here is chosen so a business owner reading it
 * quickly cannot come away believing their settings just changed.
 *
 * No fetching, no React — so the wording and the gating are unit-testable.
 */

import type { ImportCandidate, ImportJob, ImportSummary } from '@/lib/api'

/** How a field key reads to a business owner. Unknown keys degrade gracefully. */
const FIELD_LABELS: Record<string, string> = {
  business_name: 'Business name',
  phone: 'Phone number',
  email: 'Email address',
  address: 'Address',
  hours: 'Opening hours',
  pricing: 'Pricing',
}

export function fieldLabel(key: string): string {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key]
  return String(key ?? '')
    .replace(/[_.]+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase())
}

/**
 * Why a value is flagged, in plain language.
 *
 * The backend reason codes are comma-joined machine strings. A reviewer needs
 * to know what to check, not what the regex matched.
 */
const RISK_REASONS: Record<string, string> = {
  contains_price: 'This contains a price. A wrong price quoted on a call is your liability, not ours.',
  pricing_field: 'Pricing is always reviewed by a person before it can be said on a call.',
  contains_guarantee: 'This promises a guarantee. Confirm you still offer it on these terms.',
  regulated_claim: 'This makes a medical, legal or financial claim. Those need your explicit sign-off.',
}

export function riskExplanations(riskReason?: string | null): string[] {
  return String(riskReason ?? '')
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => RISK_REASONS[r] ?? `Flagged for review (${r}).`)
}

/** How we obtained a value — the distinction that tells a reviewer how hard to look. */
export function derivationLabel(derivation: string): { label: string; detail: string } {
  return derivation === 'verified'
    ? {
        label: 'From your site’s markup',
        detail: 'Read directly from structured data you publish, so it is what your site declares.',
      }
    : {
        label: 'Read from your page text',
        detail: 'Worked out from wording on the page. Worth a closer look — text can be ambiguous.',
      }
}

/**
 * The one sentence under every reviewed item.
 *
 * "Accepted" must never be allowed to read as "live". Until the Level 1 write
 * path applies a value it has changed nothing, and this is the string that says
 * so. A test asserts none of these ever claim a value is in use.
 */
export function reviewStatusLine(candidate: Pick<ImportCandidate, 'review' | 'applied'>): string {
  const decision = candidate.review?.decision
  if (!decision) return 'Not reviewed yet.'
  if (candidate.applied) return 'Applied to your settings.'
  switch (decision) {
    case 'accepted':
      return 'Reviewed, not yet applied.'
    case 'edited':
      return 'Edited and reviewed, not yet applied.'
    case 'rejected':
      return 'Rejected. This will not be used.'
    case 'deferred':
      return 'Set aside for now.'
    default:
      return 'Reviewed, not yet applied.'
  }
}

/**
 * Whether the UI may pre-select a candidate for acceptance.
 *
 * Mirrors `isAutoAcceptable` on the backend, and matters for the same reason:
 * a pre-ticked checkbox is a recommendation, and recommending an unreviewed
 * price is how a wrong number ends up on a live call. High risk is excluded
 * regardless of confidence.
 */
export function canPreselect(candidate: Pick<ImportCandidate, 'high_risk' | 'derivation' | 'confidence'>): boolean {
  if (candidate.high_risk) return false
  return candidate.derivation === 'verified' && candidate.confidence >= 0.85
}

/** Review first: risky, then unreviewed, then everything else. */
export function sortForReview(candidates: ImportCandidate[]): ImportCandidate[] {
  const rank = (c: ImportCandidate) => {
    if (c.high_risk && !c.review) return 0
    if (!c.review) return 1
    if (c.review.decision === 'deferred') return 2
    return 3
  }
  return [...candidates].sort(
    (a, b) => rank(a) - rank(b) || a.field_key.localeCompare(b.field_key) || b.confidence - a.confidence
  )
}

/** Values a reviewer still has to look at. Drives the "N left" count. */
export function outstandingCount(candidates: ImportCandidate[]): number {
  return candidates.filter((c) => !c.review || c.review.decision === 'deferred').length
}

/**
 * What went wrong, said plainly.
 *
 * The guard's reason codes are precise and meaningless to a customer. Each one
 * is translated to what they should actually do about it — and a refusal is
 * described as a refusal, never softened into a generic failure.
 */
const ERROR_MESSAGES: Record<string, string> = {
  missing_url: 'No address was given.',
  malformed_url: 'That does not look like a web address. Try it with https:// in front.',
  blocked_scheme: 'Only http:// and https:// addresses can be read.',
  credentials_in_url: 'Addresses containing a username or password are not accepted.',
  blocked_host: 'That address points at a private or internal location, not a public website.',
  resolves_to_private: 'That domain resolves to a private network address, so it was not read.',
  dns_failed: 'That domain could not be found. Check the spelling.',
  dns_empty: 'That domain has no address records.',
  timeout: 'The site took too long to respond.',
  too_many_redirects: 'The site redirected too many times.',
  unsupported_content_type: 'That address did not return a web page.',
  too_large: 'That page is too large to read.',
  fetch_failed: 'The site could not be reached.',
  no_pages_fetched: 'No pages could be read from that address.',
  import_already_running: 'An import is already running. Wait for it to finish.',
  unexpected_error: 'The import stopped unexpectedly. Nothing was changed.',
}

export function importErrorMessage(errorClass?: string | null): string {
  const key = String(errorClass ?? '').trim()
  if (!key) return 'The import did not complete.'
  if (ERROR_MESSAGES[key]) return ERROR_MESSAGES[key]
  if (key.startsWith('http_')) return `The site returned ${key.slice(5)}.`
  return `The import stopped (${key}).`
}

export function jobStatusLabel(job: Pick<ImportJob, 'status'>): string {
  switch (job.status) {
    case 'queued':
      return 'Queued'
    case 'running':
      return 'Reading your site'
    case 'succeeded':
      return 'Finished'
    case 'partial':
      return 'Finished with some pages skipped'
    case 'blocked':
      return 'Refused'
    case 'failed':
      return 'Failed'
    default:
      return String(job.status ?? 'Unknown')
  }
}

/**
 * The headline under a finished import.
 *
 * Leads with what needs a person, because that is the only part that requires
 * action. A page that tried to give the assistant instructions is reported
 * plainly rather than hidden — it is the customer's site, and they should know.
 */
export function summaryLine(summary: ImportSummary): string {
  const parts = [`${summary.candidates} value${summary.candidates === 1 ? '' : 's'} found across ${summary.pagesFetched} page${summary.pagesFetched === 1 ? '' : 's'}`]
  if (summary.highRisk > 0) parts.push(`${summary.highRisk} needs your sign-off`)
  if (summary.conflicts > 0) parts.push(`${summary.conflicts} disagree between pages`)
  if (summary.pagesBlocked > 0) parts.push(`${summary.pagesBlocked} page${summary.pagesBlocked === 1 ? '' : 's'} could not be read`)
  if (summary.injectionPages > 0) {
    parts.push(`${summary.injectionPages} page${summary.injectionPages === 1 ? '' : 's'} contained text written to instruct an AI — it was stored as text and acted on by nothing`)
  }
  return `${parts.join('. ')}.`
}
