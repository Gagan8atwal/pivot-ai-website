'use client'

import * as React from 'react'
import { MessageSquare, Mail, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { PageHeader } from '@/components/app/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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
import { api, asArray, isApiConfigured, type SmsLog, type EmailLog } from '@/lib/api'
import { formatDateTime, statusTone, titleCase } from '@/lib/format'

function DirectionBadge({ direction }: { direction?: string | null }) {
  const out = (direction ?? '').toLowerCase().startsWith('out')
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
      {out ? (
        <ArrowUpRight className="h-3.5 w-3.5 text-blue-500" />
      ) : (
        <ArrowDownLeft className="h-3.5 w-3.5 text-green-500" />
      )}
      {out ? 'Sent' : 'Received'}
    </span>
  )
}

export default function MessagesPage() {
  if (!isApiConfigured) {
    return (
      <>
        <PageHeader title="Messages" description="SMS and email Pivot AI sent and received." />
        <NotConfiguredState feature="Messages" />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Messages"
        description="Text messages and emails handled by Pivot AI on your behalf."
      />
      <Tabs defaultValue="sms">
        <TabsList>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>
        <TabsContent value="sms">
          <SmsPanel />
        </TabsContent>
        <TabsContent value="email">
          <EmailPanel />
        </TabsContent>
      </Tabs>
    </>
  )
}

function SmsPanel() {
  const logs = useApi(() => api.logs.sms().then((r) => asArray<SmsLog>(r)), [])
  const rows = (logs.data ?? []).sort(
    (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
  )
  return (
    <Card>
      <CardContent className="p-4">
        {logs.loading ? (
          <TableSkeleton rows={6} cols={4} />
        ) : logs.error ? (
          <ErrorState message={logs.error} onRetry={logs.refetch} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No text messages yet"
            description="SMS that Pivot AI sends or receives will show up here."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Direction</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="hidden md:table-cell">Message</TableHead>
                <TableHead className="hidden sm:table-cell">When</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <DirectionBadge direction={m.direction} />
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {(m.direction ?? '').toLowerCase().startsWith('out') ? m.to : m.from}
                  </TableCell>
                  <TableCell className="hidden max-w-xs truncate text-slate-500 md:table-cell">
                    {m.body || '—'}
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap text-slate-400 sm:table-cell">
                    {formatDateTime(m.created_at)}
                  </TableCell>
                  <TableCell>
                    {m.status ? (
                      <Badge variant={statusTone(m.status)} className="capitalize">
                        {titleCase(m.status)}
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
  )
}

function EmailPanel() {
  const logs = useApi(() => api.logs.email().then((r) => asArray<EmailLog>(r)), [])
  const rows = (logs.data ?? []).sort(
    (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
  )
  return (
    <Card>
      <CardContent className="p-4">
        {logs.loading ? (
          <TableSkeleton rows={6} cols={4} />
        ) : logs.error ? (
          <ErrorState message={logs.error} onRetry={logs.refetch} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No emails yet"
            description="Emails that Pivot AI sends or receives will show up here."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Direction</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="hidden md:table-cell">Subject</TableHead>
                <TableHead className="hidden sm:table-cell">When</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <DirectionBadge direction={m.direction} />
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {(m.direction ?? '').toLowerCase().startsWith('out') ? m.to : m.from}
                  </TableCell>
                  <TableCell className="hidden max-w-xs truncate text-slate-500 md:table-cell">
                    {m.subject || '—'}
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap text-slate-400 sm:table-cell">
                    {formatDateTime(m.created_at)}
                  </TableCell>
                  <TableCell>
                    {m.status ? (
                      <Badge variant={statusTone(m.status)} className="capitalize">
                        {titleCase(m.status)}
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
  )
}
