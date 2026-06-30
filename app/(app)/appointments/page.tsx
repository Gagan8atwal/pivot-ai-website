'use client'

import * as React from 'react'
import { CalendarDays, Clock } from 'lucide-react'
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
import { api, asArray, isApiConfigured, type Appointment } from '@/lib/api'
import { formatDateTime, statusTone, titleCase } from '@/lib/format'

export default function AppointmentsPage() {
  const appts = useApi(() => api.appointments.list().then((r) => asArray<Appointment>(r)), [])

  if (!isApiConfigured) {
    return (
      <>
        <PageHeader title="Appointments" description="Everything Pivot AI books for you." />
        <NotConfiguredState feature="Appointments" />
      </>
    )
  }

  const all = appts.data ?? []
  const now = Date.now()
  const upcoming = all
    .filter((a) => (a.start_at ? new Date(a.start_at).getTime() >= now : false))
    .sort((a, b) => new Date(a.start_at ?? 0).getTime() - new Date(b.start_at ?? 0).getTime())
  const past = all
    .filter((a) => (a.start_at ? new Date(a.start_at).getTime() < now : true))
    .sort((a, b) => new Date(b.start_at ?? 0).getTime() - new Date(a.start_at ?? 0).getTime())

  return (
    <>
      <PageHeader
        title="Appointments"
        description="Appointments Pivot AI booked from calls and messages."
      />

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <AppointmentTable
            state={appts}
            rows={upcoming}
            emptyTitle="No upcoming appointments"
            emptyDescription="When Pivot AI books a caller, the appointment will appear here."
          />
        </TabsContent>
        <TabsContent value="past">
          <AppointmentTable
            state={appts}
            rows={past}
            emptyTitle="No past appointments"
            emptyDescription="Completed and past appointments will be listed here."
          />
        </TabsContent>
      </Tabs>
    </>
  )
}

function AppointmentTable({
  state,
  rows,
  emptyTitle,
  emptyDescription,
}: {
  state: { loading: boolean; error: string | null; refetch: () => void }
  rows: Appointment[]
  emptyTitle: string
  emptyDescription: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        {state.loading ? (
          <TableSkeleton rows={6} cols={4} />
        ) : state.error ? (
          <ErrorState message={state.error} onRetry={state.refetch} />
        ) : rows.length === 0 ? (
          <EmptyState icon={CalendarDays} title={emptyTitle} description={emptyDescription} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Title</TableHead>
                <TableHead className="hidden sm:table-cell">Phone</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="whitespace-nowrap font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {formatDateTime(a.start_at)}
                    </span>
                  </TableCell>
                  <TableCell>{a.customer_name || '—'}</TableCell>
                  <TableCell className="hidden text-slate-500 md:table-cell">
                    {a.title || '—'}
                  </TableCell>
                  <TableCell className="hidden text-slate-500 sm:table-cell">
                    {a.phone || '—'}
                  </TableCell>
                  <TableCell>
                    {a.status ? (
                      <Badge variant={statusTone(a.status)} className="capitalize">
                        {titleCase(a.status)}
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
