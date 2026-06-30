'use client'

import * as React from 'react'
import Link from 'next/link'
import { PhoneCall, Info, PhoneIncoming } from 'lucide-react'
import { PageHeader } from '@/components/app/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  EmptyState,
  ErrorState,
  TableSkeleton,
  NotConfiguredState,
} from '@/components/app/states'
import { useApi } from '@/lib/use-api'
import { api, asArray, isApiConfigured, type Lead } from '@/lib/api'
import { formatDateTime, leadDisplayName, statusTone, titleCase } from '@/lib/format'

/**
 * The backend contract has no dedicated calls endpoint — call activity is
 * derived from captured leads (each lead is a caller Pivot AI answered).
 * Fields the contract doesn't expose (duration, recording, transcript) are
 * intentionally omitted rather than fabricated.
 */
export default function CallsPage() {
  const leads = useApi(() => api.leads.list().then((r) => asArray<Lead>(r)), [])
  const [search, setSearch] = React.useState('')

  if (!isApiConfigured) {
    return (
      <>
        <PageHeader title="Calls" description="Calls Pivot AI answered for you." />
        <NotConfiguredState feature="Call activity" />
      </>
    )
  }

  const all = leads.data ?? []
  // A "call" is any captured lead that has a phone number.
  const calls = all
    .filter((l) => Boolean(l.phone))
    .filter((l) => {
      if (!search) return true
      const q = search.toLowerCase()
      return [l.name, l.phone, l.source, l.status].filter(Boolean).join(' ').toLowerCase().includes(q)
    })
    .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())

  return (
    <>
      <PageHeader
        title="Calls"
        description="Callers Pivot AI answered and captured as leads."
      />

      <div className="mb-4 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
        <span>
          Call activity is derived from captured leads. Detailed call records (duration, recording,
          transcript) aren&apos;t part of the current backend contract, so they&apos;re not shown here.
        </span>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative mb-4">
            <PhoneIncoming className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search callers…"
              className="pl-9"
            />
          </div>

          {leads.loading ? (
            <TableSkeleton rows={6} cols={4} />
          ) : leads.error ? (
            <ErrorState message={leads.error} onRetry={leads.refetch} />
          ) : calls.length === 0 ? (
            <EmptyState
              icon={PhoneCall}
              title="No calls yet"
              description="When Pivot AI answers a call, the caller will show up here."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Caller</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="hidden sm:table-cell">Source</TableHead>
                  <TableHead className="hidden md:table-cell">When</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calls.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">
                      <Link href={`/crm?lead=${lead.id}`} className="hover:underline">
                        {leadDisplayName(lead)}
                      </Link>
                    </TableCell>
                    <TableCell className="text-slate-500">{lead.phone}</TableCell>
                    <TableCell className="hidden text-slate-500 sm:table-cell">
                      {lead.source || 'Phone'}
                    </TableCell>
                    <TableCell className="hidden text-slate-400 md:table-cell">
                      {formatDateTime(lead.created_at)}
                    </TableCell>
                    <TableCell>
                      {lead.status ? (
                        <Badge variant={statusTone(lead.status)} className="capitalize">
                          {titleCase(lead.status)}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  )
}
