'use client'

/**
 * lib/auth.ts — Supabase Auth (browser) client + thin auth helpers.
 *
 * All real auth + provisioning lives in the backend (ai-receptionist-voice).
 * This module only handles the browser-side Supabase session so that the
 * access token can be attached to `/app/*` calls in `lib/api.ts`.
 *
 * If the Supabase env vars are not set, every export degrades gracefully:
 * `isSupabaseConfigured` is false and the auth calls throw a friendly,
 * catchable error instead of crashing at import time.
 */

import { createClient, type SupabaseClient, type Session } from '@supabase/supabase-js'
import { normalizeOrigin } from '@/lib/url'

// Normalize the env values: a trailing slash or stray whitespace on
// NEXT_PUBLIC_SUPABASE_URL makes supabase-js build a malformed path
// (`https://ref.supabase.co//auth/v1/...`), which the Supabase gateway rejects
// with "Invalid path specified in request URL" on app load. Reduce to a bare
// origin so the client tolerates a misconfigured value.
const SUPABASE_URL = normalizeOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL)
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || ''

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

let client: SupabaseClient | null = null

/**
 * Returns the singleton browser Supabase client, or null when env is unset.
 * Never throws at import time.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null
  if (!client) {
    client = createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
  return client
}

class AuthNotConfiguredError extends Error {
  constructor() {
    super(
      'Authentication is not configured. Set NEXT_PUBLIC_SUPABASE_URL and ' +
        'NEXT_PUBLIC_SUPABASE_ANON_KEY to enable sign in.'
    )
    this.name = 'AuthNotConfiguredError'
  }
}

function requireClient(): SupabaseClient {
  const c = getSupabaseClient()
  if (!c) throw new AuthNotConfiguredError()
  return c
}

/** Current access token (JWT) for the signed-in user, or null. */
export async function getAccessToken(): Promise<string | null> {
  const c = getSupabaseClient()
  if (!c) return null
  const { data } = await c.auth.getSession()
  return data.session?.access_token ?? null
}

/** Current session or null. */
export async function getSession(): Promise<Session | null> {
  const c = getSupabaseClient()
  if (!c) return null
  const { data } = await c.auth.getSession()
  return data.session
}

/** Subscribe to auth state changes. Returns an unsubscribe function. */
export function onAuthStateChange(
  cb: (session: Session | null) => void
): () => void {
  const c = getSupabaseClient()
  if (!c) {
    // Fire once with null so consumers can settle their loading state.
    cb(null)
    return () => {}
  }
  const { data } = c.auth.onAuthStateChange((_event, session) => cb(session))
  return () => data.subscription.unsubscribe()
}

export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await requireClient().auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signUpWithPassword(
  email: string,
  password: string,
  metadata?: Record<string, unknown>
) {
  const { data, error } = await requireClient().auth.signUp({
    email,
    password,
    options: { data: metadata },
  })
  if (error) throw error
  return data
}

export async function sendPasswordReset(email: string, redirectTo?: string) {
  const { data, error } = await requireClient().auth.resetPasswordForEmail(
    email,
    redirectTo ? { redirectTo } : undefined
  )
  if (error) throw error
  return data
}

export async function updatePassword(newPassword: string) {
  const { data, error } = await requireClient().auth.updateUser({
    password: newPassword,
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const c = getSupabaseClient()
  if (!c) return
  await c.auth.signOut()
}
