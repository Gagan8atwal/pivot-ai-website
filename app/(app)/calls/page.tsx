'use client'

import * as React from 'react'
import { AlertTriangle, Info, PhoneCall, PhoneIncoming } from 'lucide-react'

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
import { api, isApiConfigured, type CallRecord } from '@/lib/api'
import { formatDateTime, statusTone, titleCase } from '@/lib/format'

export default function CallsPage() {
  const calls = useApi(() => api.calls.list(), [])
  const [search, setSearch] = React.useState('')

  if (!isApiConfigured) {
    return (
      <>
        <PageHeader title="Calls" description="Calls handled by your Pivot AI receptionist." />
        <NotConfiguredState feature="Call activity" />
      </>
    )
  }

  const all = calls.data ?? []
  const filtered = all
    .filter((call) => {
      if (!search) return true
      const q = search.toLowerCase()
      return [
        call.caller_number,
        call.status,
        call.failure_class,
        call.intent,
        call.summary,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
    .sort(
      (a, b) =>
        new Date(b.started_at ?? 0).getTime() -
        new Date(a.started_at ?? 0).getTime()
    )

  const failed = all.filter((call) => (call.status ?? '').toLowerCase() === 'failed')

  return (
    <>
      <PageHeader
        title="Calls"
        description="Authoritative call records from the Pivot voice system."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
          <span>
            These are real tenant-scoped call records. Failed calls are never shown as completed.
          </span>
        </div>
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
          <span>
            {failed.length === 0
              ? 'No failed call records in the current list.'
              : `${failed.length} failed call${failed.length === 1 ? '' : 's'} in the current list.`}
          </span>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative mb-4">
            <PhoneIncoming className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search calls or errors…"
              className="pl-9"
            />
          </div>

          {calls.loading ? (
            <TableSkeleton rows={6} cols={5} />
          ) : calls.error ? (
            <ErrorState message={calls.error} onRetry={calls.refetch} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={PhoneCall}
              title="No calls yet"
              description="When Pivot receives a call, its authoritative status will show up here."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Caller</TableHead>
                  <TableHead className="hidden sm:table-cell">Intent</TableHead>
                  <TableHead className="hidden md:table-cell">When</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((call: CallRecord) => (
                  <TableRow key={call.id}>
                    <TableCell className="font-medium">
                      {call.caller_number || 'Unknown caller'}
                    </TableCell>
                    <TableCell className="hidden text-slate-500 sm:table-cell">
                      {call.intent ? titleCase(call.intent) : '—'}
                    </TableCell>
                    <TableCell className="hidden text-slate-400 md:table-cell">
                      {formatDateTime(call.started_at)}
                    </TableCell>
                    <TableCell>
                      {call.status ? (
                        <Badge variant={statusTone(call.status)} className="capitalize">
                          {titleCase(call.status)}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {call.failure_class ? (
                        <Badge variant="amber" className="capitalize">
                          {titleCase(call.failure_class)}
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
