'use client'

import * as React from 'react'
import type { Session } from '@supabase/supabase-js'
import { getSession, onAuthStateChange, isSupabaseConfigured } from '@/lib/auth'
import { api, type MeResponse, errorMessage } from '@/lib/api'

interface AuthContextValue {
  configured: boolean
  /** True until the initial session check completes. */
  initializing: boolean
  session: Session | null
  me: MeResponse | null
  meLoading: boolean
  meError: string | null
  refreshMe: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null)
  const [initializing, setInitializing] = React.useState(true)
  const [me, setMe] = React.useState<MeResponse | null>(null)
  const [meLoading, setMeLoading] = React.useState(false)
  const [meError, setMeError] = React.useState<string | null>(null)

  const refreshMe = React.useCallback(async () => {
    if (!isSupabaseConfigured) return
    setMeLoading(true)
    setMeError(null)
    try {
      // Auto-provision the tenant, then load identity. ensure-tenant is
      // idempotent on the backend; ignore its failure so /me still loads.
      await api.auth.ensureTenant().catch(() => undefined)
      const data = await api.me()
      setMe(data)
    } catch (err) {
      setMeError(errorMessage(err))
      setMe(null)
    } finally {
      setMeLoading(false)
    }
  }, [])

  React.useEffect(() => {
    let mounted = true
    getSession().then((s) => {
      if (!mounted) return
      setSession(s)
      setInitializing(false)
    })
    const unsub = onAuthStateChange((s) => {
      setSession(s)
      setInitializing(false)
    })
    return () => {
      mounted = false
      unsub()
    }
  }, [])

  // Load /me whenever we gain a session; clear it when we lose one.
  React.useEffect(() => {
    if (session) {
      void refreshMe()
    } else {
      setMe(null)
      setMeError(null)
    }
  }, [session, refreshMe])

  const value: AuthContextValue = {
    configured: isSupabaseConfigured,
    initializing,
    session,
    me,
    meLoading,
    meError,
    refreshMe,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
