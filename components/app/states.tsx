'use client'

import * as React from 'react'
import Link from 'next/link'
import { AlertTriangle, Inbox, Loader2, SettingsIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-slate-400', className)} aria-hidden="true" />
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <Spinner className="h-6 w-6" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={cn('h-9 flex-1', c === 0 && 'max-w-[40%]')} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-navy-900">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: {
  title?: string
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50/60 px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="h-6 w-6 text-red-600" />
      </div>
      <h3 className="text-base font-semibold text-navy-900">{title}</h3>
      {message && <p className="mt-1 max-w-md text-sm text-slate-600">{message}</p>}
      {onRetry && (
        <Button variant="outline-navy" size="sm" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

/** Shown when backend / Supabase env vars are not configured. */
export function NotConfiguredState({
  feature = 'This area',
}: {
  feature?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-50/60 px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
        <SettingsIcon className="h-6 w-6 text-amber-600" />
      </div>
      <h3 className="text-base font-semibold text-navy-900">Backend not configured</h3>
      <p className="mt-1 max-w-md text-sm text-slate-600">
        {feature} needs the API and Supabase environment variables. Set{' '}
        <code className="rounded bg-amber-100 px-1 text-xs">NEXT_PUBLIC_API_BASE</code>,{' '}
        <code className="rounded bg-amber-100 px-1 text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
        <code className="rounded bg-amber-100 px-1 text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to
        connect to the live backend.
      </p>
      <Link href="/" className="mt-5">
        <Button variant="ghost" size="sm">
          Back to site
        </Button>
      </Link>
    </div>
  )
}
