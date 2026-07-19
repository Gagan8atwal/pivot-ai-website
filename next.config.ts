import type { NextConfig } from 'next'

// Origins the browser must reach for the logged-in app to work. These mirror the
// defaults in lib/api.ts and lib/auth.ts: the app calls the voice backend and
// Supabase Auth directly from the client, so both must be in `connect-src` or
// every login / dashboard fetch is blocked by CSP.
//
// Read from env at build time so preview and self-hosted deploys point at their
// own backends without editing this file. Values are reduced to a bare origin —
// a stray path or trailing slash makes the whole directive silently non-matching.
function origin(value: string | undefined, fallback = ''): string {
  const raw = value?.trim() || fallback
  if (!raw) return ''
  try {
    return new URL(raw).origin
  } catch {
    return ''
  }
}

const API_ORIGIN = origin(
  process.env.NEXT_PUBLIC_API_BASE,
  'https://ai-receptionist-voice.onrender.com',
)
const SUPABASE_ORIGIN = origin(process.env.NEXT_PUBLIC_SUPABASE_URL)

const connectSrc = [
  "'self'",
  API_ORIGIN,
  SUPABASE_ORIGIN,
  // Supabase Auth refresh + realtime use a WebSocket on the same host.
  SUPABASE_ORIGIN.replace(/^https:/, 'wss:'),
].filter(Boolean)

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com",
      "img-src 'self' data: blob:",
      `connect-src ${connectSrc.join(' ')}`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
