'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Crown,
  Users2,
  CalendarDays,
  PhoneCall,
  MessageSquare,
  BookOpen,
  UsersRound,
  CreditCard,
  Settings as SettingsIcon,
  Building2,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Phone,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner, NotConfiguredState } from '@/components/app/states'
import { useAuth } from '@/components/app/auth-provider'
import { signOut } from '@/lib/auth'
import { can, roleRank } from '@/lib/api'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  /** Minimum role rank required to see the item. */
  minRank?: number
}

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/owner', label: 'Owner Command Center', icon: Crown, minRank: 4 },
    ],
  },
  {
    section: 'Customers',
    items: [
      { href: '/crm', label: 'CRM', icon: Users2 },
      { href: '/appointments', label: 'Appointments', icon: CalendarDays },
      { href: '/calls', label: 'Calls', icon: PhoneCall },
      { href: '/messages', label: 'Messages', icon: MessageSquare },
    ],
  },
  {
    section: 'Configuration',
    items: [
      { href: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
      { href: '/team', label: 'Team', icon: UsersRound, minRank: 3 },
      { href: '/billing', label: 'Billing', icon: CreditCard, minRank: 4 },
      { href: '/settings', label: 'Settings', icon: SettingsIcon },
      { href: '/vs-carriers', label: 'Tenant Setup', icon: Building2, minRank: 3 },
    ],
  },
]

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2" aria-label="Pivot AI">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 shadow-sm">
        <Phone className="h-4 w-4 text-navy-900" />
      </div>
      <span className="text-lg font-bold text-navy-900">Pivot AI</span>
    </Link>
  )
}

function SidebarNav({ role, onNavigate }: { role: string | null; onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-6 px-3 py-4">
      {NAV.map((group) => {
        const items = group.items.filter((i) => !i.minRank || roleRank(role) >= i.minRank)
        if (items.length === 0) return null
        return (
          <div key={group.section}>
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {group.section}
            </p>
            <ul className="space-y-1">
              {items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        active
                          ? 'bg-navy-900 text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-navy-900'
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}

function AccountMenu() {
  const { me, session } = useAuth()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const email = me?.user?.email ?? session?.user?.email ?? 'Account'
  const initial = (email[0] ?? 'A').toUpperCase()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-sm font-semibold text-white">
          {initial}
        </div>
        <span className="hidden max-w-[160px] truncate text-sm font-medium text-navy-900 sm:block">
          {email}
        </span>
        <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-medium text-navy-900">{email}</p>
            {me?.role && (
              <p className="mt-0.5 text-xs capitalize text-slate-500">{String(me.role)}</p>
            )}
          </div>
          <div className="p-1">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              <SettingsIcon className="h-4 w-4" /> Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function TenantIndicator() {
  const { me } = useAuth()
  const businessName = me?.business?.name ?? null
  const isOwner = can.owner(me?.role)
  return (
    <div className="flex items-center gap-2">
      {businessName ? (
        <Badge variant="secondary" className="gap-1.5">
          <Building2 className="h-3 w-3" />
          <span className="max-w-[160px] truncate">{businessName}</span>
        </Badge>
      ) : null}
      {isOwner && (
        <Badge variant="amber" className="gap-1.5">
          <ShieldCheck className="h-3 w-3" /> Owner mode
        </Badge>
      )}
    </div>
  )
}

/**
 * Protected app shell: redirects to /login when there is no session,
 * renders a sidebar + top bar around the page content.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { configured, initializing, session, me } = useAuth()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  React.useEffect(() => {
    if (configured && !initializing && !session) {
      router.replace('/login')
    }
  }, [configured, initializing, session, router])

  // Graceful state when Supabase isn't configured: render UI, no crash.
  if (!configured) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4">
          <Logo />
          <Link href="/">
            <Button variant="ghost" size="sm">Back to site</Button>
          </Link>
        </header>
        <main className="mx-auto max-w-2xl p-6">
          <NotConfiguredState feature="The customer app" />
        </main>
      </div>
    )
  }

  if (initializing || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-7 w-7" />
          <p className="text-sm text-slate-500">Loading your workspace…</p>
        </div>
      </div>
    )
  }

  const role = (me?.role as string) ?? null

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-16 items-center border-b border-slate-100 px-5">
          <Logo />
        </div>
        <div className="h-[calc(100vh-4rem)] overflow-y-auto">
          <SidebarNav role={role} />
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 overflow-y-auto bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
              <Logo />
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <SidebarNav role={role} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Top bar */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-md p-2 hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-slate-600" />
            </button>
            <TenantIndicator />
          </div>
          <AccountMenu />
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
