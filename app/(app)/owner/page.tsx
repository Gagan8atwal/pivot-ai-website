'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Crown,
  Users2,
  CreditCard,
  UsersRound,
  BarChart3,
  Building2,
  ShieldCheck,
  ArrowRight,
  Activity,
} from 'lucide-react'
import { PageHeader, StatCard } from '@/components/app/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  EmptyState,
  ErrorState,
  LoadingState,
  NotConfiguredState,
} from '@/components/app/states'
import { useAuth } from '@/components/app/auth-provider'
import { useApi } from '@/lib/use-api'
import {
  api,
  asArray,
  can,
  isApiConfigured,
  type Lead,
  type TeamMember,
  type Billing,
  type Usage,
} from '@/lib/api'
import { titleCase } from '@/lib/format'

export default function OwnerPage() {
  const { me, configured, meLoading } = useAuth()
  const isOwner = can.owner(me?.role)

  const team = useApi(() => api.team.list().then((r) => asArray<TeamMember>(r)), [isOwner])
  const leads = useApi(() => api.leads.list().then((r) => asArray<Lead>(r)), [isOwner])
  const billing = useApi<Billing>(() => api.billing.get(), [isOwner])
  const usage = useApi<Usage>(() => api.usage(), [isOwner])

  if (!configured || !isApiConfigured) {
    return (
      <>
        <PageHeader title="Owner Command Center" />
        <NotConfiguredState feature="The owner command center" />
      </>
    )
  }

  if (meLoading) {
    return (
      <>
        <PageHeader title="Owner Command Center" />
        <LoadingState label="Checking your access…" />
      </>
    )
  }

  if (!isOwner) {
    return (
      <>
        <PageHeader title="Owner Command Center" />
        <EmptyState
          icon={ShieldCheck}
          title="Owner access required"
          description="This area is limited to the business owner. Ask your owner to grant access if you need it."
        />
      </>
    )
  }

  const teamList = team.data ?? []
  const leadList = leads.data ?? []
  const owners = teamList.filter((m) => String(m.role).toLowerCase() === 'owner')

  return (
    <>
      <PageHeader
        title="Owner Command Center"
        description="High-level control over your Pivot AI account."
        actions={
          <Badge variant="amber" className="gap-1.5">
            <Crown className="h-3.5 w-3.5" /> Owner
          </Badge>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Team members"
          value={team.loading ? '—' : teamList.length}
          sub={`${owners.length} owner${owners.length === 1 ? '' : 's'}`}
          icon={UsersRound}
        />
        <StatCard
          label="Total leads"
          value={leads.loading ? '—' : leadList.length}
          icon={Users2}
        />
        <StatCard
          label="Plan"
          value={
            <span className="capitalize">
              {billing.loading ? '—' : billing.data?.plan ?? me?.business?.plan ?? 'Trial'}
            </span>
          }
          sub={billing.data?.status ? titleCase(billing.data.status) : undefined}
          icon={CreditCard}
        />
        <StatCard
          label="Business"
          value={
            <span className="block truncate text-lg">{me?.business?.name ?? '—'}</span>
          }
          icon={Building2}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Owner controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ControlLink
              href="/team"
              icon={UsersRound}
              title="Manage team & roles"
              desc="Invite members, assign roles, transfer ownership."
            />
            <ControlLink
              href="/billing"
              icon={CreditCard}
              title="Billing & subscription"
              desc="Change plan, view invoices, manage payment."
            />
            <ControlLink
              href="/settings"
              icon={Building2}
              title="Business settings"
              desc="Profile, phone numbers, integrations, compliance."
            />
            <ControlLink
              href="/vs-carriers"
              icon={Activity}
              title="Tenant provisioning"
              desc="Configure greetings, departments, and call flows."
            />
          </CardContent>
        </Card>

        {/* Usage */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-lg">Usage</CardTitle>
            <BarChart3 className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            {usage.loading ? (
              <LoadingState label="Loading usage…" />
            ) : usage.error ? (
              <ErrorState message={usage.error} onRetry={usage.refetch} />
            ) : (
              <UsageBreakdown usage={usage.data} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team snapshot */}
      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-lg">Team snapshot</CardTitle>
          <Link href="/team">
            <Button variant="ghost" size="sm">
              Manage <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {team.loading ? (
            <LoadingState label="Loading team…" />
          ) : team.error ? (
            <ErrorState message={team.error} onRetry={team.refetch} />
          ) : teamList.length === 0 ? (
            <EmptyState icon={UsersRound} title="No team members yet" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {teamList.slice(0, 8).map((m) => (
                <li
                  key={m.user_id || m.email}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-navy-900">
                      {m.name || m.email || m.user_id}
                    </p>
                    {m.email && m.name && (
                      <p className="truncate text-sm text-slate-500">{m.email}</p>
                    )}
                  </div>
                  <Badge variant={String(m.role).toLowerCase() === 'owner' ? 'amber' : 'secondary'} className="capitalize">
                    {String(m.role)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function UsageBreakdown({ usage }: { usage: Usage | null }) {
  const entries = usage
    ? Object.entries(usage).filter(([, v]) => typeof v === 'number' || typeof v === 'string')
    : []
  if (entries.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-500">
        No usage metrics reported yet.
      </p>
    )
  }
  return (
    <dl className="grid grid-cols-2 gap-4">
      {entries.slice(0, 6).map(([key, value]) => (
        <div key={key} className="rounded-lg bg-slate-50 p-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {titleCase(key)}
          </dt>
          <dd className="mt-1 text-xl font-bold text-navy-900">{String(value)}</dd>
        </div>
      ))}
    </dl>
  )
}

function ControlLink({
  href,
  icon: Icon,
  title,
  desc,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:border-navy-200 hover:bg-slate-50"
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-navy-900/5">
        <Icon className="h-4 w-4 text-navy-700" />
      </div>
      <div className="min-w-0">
        <p className="font-medium text-navy-900">{title}</p>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
      <ArrowRight className="ml-auto mt-1 h-4 w-4 flex-shrink-0 text-slate-300" />
    </Link>
  )
}
