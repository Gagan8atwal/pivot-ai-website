'use client'

import * as React from 'react'
import { CalendarDays, Clock } from 'lucide-react'
import { PageHeader } from '@/components/app/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { api, apiFetch, asArray, isApiConfigured, type Appointment } from '@/lib/api'
import { appointmentStart, formatDateTime, statusTone, titleCase } from '@/lib/format'

type AppointmentStatus = 'confirmed' | 'completed' | 'cancelled'

export default function AppointmentsPage() {
  const appts = useApi(() => api.appointments.list().then((r) => asArray<Appointment>(r)), [])
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)
  const [actionError, setActionError] = React.useState<string | null>(null)

  const updateStatus = React.useCallback(async (appointment: Appointment, status: AppointmentStatus) => {
    setUpdatingId(appointment.id)
    setActionError(null)
    try {
      await apiFetch<{ appointment: Appointment }>(`/app/appointments/${appointment.id}`, {
        method: 'PATCH',
        body: { status },
      })
      await appts.refetch()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not update the appointment.')
    } finally {
      setUpdatingId(null)
    }
  }, [appts])

  if (!isApiConfigured) {
    return (
      <>
        <PageHeader title="Appointments" description="Review and disposition appointment requests captured by Pivot AI." />
        <NotConfiguredState feature="Appointments" />
      </>
    )
  }

  const all = appts.data ?? []
  const now = Date.now()
  const startMs = (a: Appointment) => {
    const s = appointmentStart(a)
    return s ? new Date(s).getTime() : NaN
  }
  const upcoming = all
    .filter((a) => {
      const t = startMs(a)
      return !Number.isNaN(t) && t >= now
    })
    .sort((a, b) => startMs(a) - startMs(b))
  const past = all
    .filter((a) => {
      const t = startMs(a)
      return Number.isNaN(t) || t < now
    })
    .sort((a, b) => startMs(b) - startMs(a))

  return (
    <>
      <PageHeader
        title="Appointments"
        description="Review appointment requests, confirm accepted times, and close completed or cancelled records."
      />

      {actionError ? (
        <div role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      ) : null}

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <AppointmentTable
            state={appts}
            rows={upcoming}
            emptyTitle="No upcoming appointment requests"
            emptyDescription="When Pivot AI captures a requested time, it will appear here for review."
            updatingId={updatingId}
            onStatusChange={updateStatus}
          />
        </TabsContent>
        <TabsContent value="past">
          <AppointmentTable
            state={appts}
            rows={past}
            emptyTitle="No past appointment requests"
            emptyDescription="Past and completed appointment records will be listed here."
            updatingId={updatingId}
            onStatusChange={updateStatus}
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
  updatingId,
  onStatusChange,
}: {
  state: { loading: boolean; error: string | null; refetch: () => void | Promise<void> }
  rows: Appointment[]
  emptyTitle: string
  emptyDescription: string
  updatingId: string | null
  onStatusChange: (appointment: Appointment, status: AppointmentStatus) => Promise<void>
}) {
  return (
    <Card>
      <CardContent className="p-4">
        {state.loading ? (
          <TableSkeleton rows={6} cols={6} />
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
                <TableHead className="hidden md:table-cell">Service</TableHead>
                <TableHead className="hidden sm:table-cell">Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="whitespace-nowrap font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {formatDateTime(appointmentStart(a))}
                    </span>
                  </TableCell>
                  <TableCell>{a.customer_name || '—'}</TableCell>
                  <TableCell className="hidden text-slate-500 md:table-cell">
                    {a.service || a.title || '—'}
                  </TableCell>
                  <TableCell className="hidden text-slate-500 sm:table-cell">
                    {a.customer_phone || a.phone || '—'}
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
                  <TableCell>
                    <AppointmentActions
                      appointment={a}
                      busy={updatingId === a.id}
                      onStatusChange={onStatusChange}
                    />
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

function AppointmentActions({
  appointment,
  busy,
  onStatusChange,
}: {
  appointment: Appointment
  busy: boolean
  onStatusChange: (appointment: Appointment, status: AppointmentStatus) => Promise<void>
}) {
  const status = String(appointment.status || '').toLowerCase()
  const canConfirm = status === 'new' || status === 'requested'
  const canComplete = status === 'new' || status === 'confirmed'
  const canCancel = status === 'new' || status === 'requested' || status === 'confirmed'

  if (!canConfirm && !canComplete && !canCancel) {
    return <span className="block text-right text-xs text-slate-400">Closed</span>
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {canConfirm ? (
        <Button
          size="sm"
          disabled={busy}
          onClick={() => void onStatusChange(appointment, 'confirmed')}
          aria-label={`Confirm appointment for ${appointment.customer_name || 'customer'}`}
        >
          Confirm
        </Button>
      ) : null}
      {canComplete ? (
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => void onStatusChange(appointment, 'completed')}
          aria-label={`Mark appointment completed for ${appointment.customer_name || 'customer'}`}
        >
          Complete
        </Button>
      ) : null}
      {canCancel ? (
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          onClick={() => void onStatusChange(appointment, 'cancelled')}
          aria-label={`Cancel appointment for ${appointment.customer_name || 'customer'}`}
        >
          Cancel
        </Button>
      ) : null}
    </div>
  )
}
