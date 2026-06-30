/**
 * lib/url.ts — pure URL-normalization helpers for env-derived base URLs.
 *
 * Why this exists: when env vars like NEXT_PUBLIC_SUPABASE_URL or
 * NEXT_PUBLIC_API_BASE are pasted into a host's dashboard (Vercel, etc.) they
 * frequently arrive with a trailing slash or stray whitespace. Passing such a
 * value straight into supabase-js's createClient() makes it build endpoint
 * paths by string concatenation — e.g. `${url}/auth/v1/token` — so a trailing
 * slash yields a double slash (`https://ref.supabase.co//auth/v1/token`). The
 * Supabase gateway rejects that path with:
 *
 *     "Invalid path specified in request URL"
 *
 * which then surfaces (via error.message) on app load, before the user has
 * even signed in. Normalizing here makes the client tolerant of a misconfigured
 * value instead of crashing.
 *
 * These functions are pure and dependency-free so they can be unit-tested
 * directly (see scripts/url.test.mjs).
 */

/**
 * Normalize a value that must be a bare origin (scheme://host[:port]).
 * Trims whitespace, drops any path/query/hash, and removes trailing slashes.
 * Returns '' for empty/whitespace input. Best-effort (returns the trimmed,
 * slash-stripped string) if the value can't be parsed as a URL.
 *
 * Use for NEXT_PUBLIC_SUPABASE_URL — supabase-js requires a bare project origin.
 */
export function normalizeOrigin(raw?: string | null): string {
  const trimmed = (raw ?? '').trim()
  if (!trimmed) return ''
  try {
    return new URL(trimmed).origin
  } catch {
    // No protocol or otherwise unparseable — strip trailing slashes and return
    // as-is so a clearly-wrong value still can't introduce a double slash.
    return trimmed.replace(/\/+$/, '')
  }
}

/**
 * Normalize a base URL that callers concatenate root-absolute paths onto
 * (`${base}/app/me`). Trims whitespace and strips ALL trailing slashes so the
 * concatenation never produces a double slash. Preserves any sub-path.
 * Returns '' for empty/whitespace input.
 *
 * Use for NEXT_PUBLIC_API_BASE.
 */
export function normalizeBaseUrl(raw?: string | null): string {
  return (raw ?? '').trim().replace(/\/+$/, '')
}
