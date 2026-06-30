'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Users2,
  CalendarDays,
  PhoneCall,
  TrendingUp,
  ArrowRight,
  MessageSquare,
  BookOpen,
} from 'lucide-react'
import { PageHeader, StatCard } from '@/components/app/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  EmptyState,
  ErrorState,
  TableSkeleton,
  NotConfiguredState,
} from '@/components/app/states'
import { useAuth } from '@/components/app/auth-provider'
import { useApi } from '@/lib/use-api'
import { api, asArray, isApiConfigured, type Lead, type Appointment } from '@/lib/api'
import { appointmentStart, formatDateTime, formatRelative, leadDisplayName, statusTone } from '@/lib/format'

export default function DashboardPage() {
  const { me, configured } = useAuth()

  const leads = useApi(() => api.leads.list().then((r) => asArray<Lead>(r)), [])
  const appts = useApi(() => api.appointments.list().then((r) => asArray<Appointment>(r)), [])

  if (!configured || !isApiConfigured) {
    return (
      <>
        <PageHeader title="Dashboard" description="Your Pivot AI workspace at a glance." />
        <NotConfiguredState feature="The dashboard" />
      </>
    )
  }

  const leadList = leads.data ?? []
  const apptList = appts.data ?? []
  const openLeads = leadList.filter(
    (l) => (l.status ?? '').toLowerCase() !== 'won' && (l.status ?? '').toLowerCase() !== 'lost'
  )
  const upcoming = apptList
    .filter((a) => {
      const s = appointmentStart(a)
      return s ? new Date(s).getTime() >= Date.now() : false
    })
    .sort(
      (a, b) =>
        new Date(appointmentStart(a) ?? 0).getTime() -
        new Date(appointmentStart(b) ?? 0).getTime()
    )

  const businessName = me?.business?.name ?? 'your business'

  return (
    <>
      <PageHeader
        title={`Welcome${me?.user?.name ? `, ${me.user.name.split(' ')[0]}` : ''}`}
        description={`Here's what's happening at ${businessName}.`}
        actions={
          <Link href="/crm">
            <Button variant="amber">
              Open CRM <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total leads"
          value={leads.loading ? '—' : leadList.length}
          sub={`${openLeads.length} open`}
          icon={Users2}
        />
        <StatCard
          label="Upcoming appointments"
          value={appts.loading ? '—' : upcoming.length}
          sub={apptList.length ? `${apptList.length} total` : 'None scheduled'}
          icon={CalendarDays}
        />
        <StatCard
          label="Plan"
          value={<span className="capitalize">{me?.business?.plan ?? 'Trial'}</span>}
          sub={me?.role ? <span className="capitalize">Role: {String(me.role)}</span> : undefined}
          icon={TrendingUp}
        />
        <StatCard
          label="Your access"
          value={<span className="capitalize">{String(me?.role ?? 'member')}</span>}
          sub="Permission level"
          icon={PhoneCall}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Recent leads */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent leads</CardTitle>
            <Link href="/crm" className="text-sm font-medium text-navy-700 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {leads.loading ? (
              <TableSkeleton rows={4} cols={3} />
            ) : leads.error ? (
              <ErrorState message={leads.error} onRetry={leads.refetch} />
            ) : leadList.length === 0 ? (
              <EmptyState
                icon={Users2}
                title="No leads yet"
                description="When Pivot AI captures a caller, they'll show up here."
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {leadList.slice(0, 6).map((lead) => (
                  <li key={lead.id}>
                    <Link
                      href={`/crm?lead=${lead.id}`}
                      className="flex items-center justify-between gap-3 py-3 hover:opacity-80"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-navy-900">
                          {leadDisplayName(lead)}
                        </p>
                        <p className="truncate text-sm text-slate-500">
                          {lead.phone || lead.email || '—'}
                        </p>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-3">
                        {lead.status && (
                          <Badge variant={statusTone(lead.status)} className="capitalize">
                            {lead.status}
                          </Badge>
                        )}
                        <span className="hidden text-xs text-slate-400 sm:block">
                          {formatRelative(lead.created_at)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Upcoming + quick links */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {appts.loading ? (
                <TableSkeleton rows={3} cols={1} />
              ) : appts.error ? (
                <ErrorState message={appts.error} onRetry={appts.refetch} />
              ) : upcoming.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">
                  No upcoming appointments.
                </p>
              ) : (
                <ul className="space-y-3">
                  {upcoming.slice(0, 4).map((a) => (
                    <li key={a.id} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50">
                        <CalendarDays className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-navy-900">
                          {a.customer_name || a.service || a.title || 'Appointment'}
                        </p>
                        <p className="text-xs text-slate-500">{formatDateTime(appointmentStart(a))}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick links</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <QuickLink href="/messages" icon={MessageSquare} label="Messages" />
              <QuickLink href="/calls" icon={PhoneCall} label="Calls" />
              <QuickLink href="/knowledge-base" icon={BookOpen} label="Knowledge" />
              <QuickLink href="/appointments" icon={CalendarDays} label="Calendar" />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-navy-200 hover:bg-slate-50"
    >
      <Icon className="h-4 w-4 text-slate-400" />
      {label}
    </Link>
  )
}
