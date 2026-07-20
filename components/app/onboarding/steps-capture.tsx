'use client'

import * as React from 'react'
import { AlertTriangle, CalendarCheck, ClipboardList } from 'lucide-react'
import { Checkbox } from '@/components/ui/input'
import { StatusRow, SmsPendingNote, type StepProps } from '@/components/app/onboarding/shared'
import { LEAD_FIELDS, type LeadFieldKey } from '@/lib/onboarding'

/* ───────────────────────────── Step 5 — lead capture ───────────────────────────── */

export function StepLeadCapture({ form, patch, errors, integrations, busy }: StepProps) {
  const toggle = (key: LeadFieldKey, required: boolean) =>
    patch({
      required_lead_fields: required
        ? Array.from(new Set([...form.required_lead_fields, key]))
        : form.required_lead_fields.filter((k) => k !== key),
    })

  return (
    <div className="space-y-5">
      <fieldset className="space-y-2" disabled={busy}>
        <legend className="mb-2 flex items-center gap-2 text-sm font-semibold text-navy-900">
          <ClipboardList className="h-4 w-4 text-navy-700" aria-hidden="true" /> Required before the AI
          ends a call
        </legend>

        {errors.required_lead_fields && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errors.required_lead_fields}
          </p>
        )}

        {LEAD_FIELDS.map((field) => {
          const required = form.required_lead_fields.includes(field.key)
          return (
            <div
              key={field.key}
              className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-navy-900">{field.label}</p>
                <p className="text-xs text-slate-500">{field.description}</p>
              </div>
              <Checkbox
                id={`lead_${field.key}`}
                checked={required}
                disabled={busy}
                onChange={(e) => toggle(field.key, e.target.checked)}
                label="Required"
              />
            </div>
          )
        })}
      </fieldset>

      <p className="text-xs text-slate-400">
        Anything left unticked is still captured when the caller volunteers it — the AI simply will not
        insist on it.
      </p>

      <SmsPendingNote integrations={integrations} />
    </div>
  )
}

/* ───────────────────────────── Step 6 — appointments ───────────────────────────── */

export function StepAppointments({ form, patch, integrations, busy }: StepProps) {
  const calendarConnected = Boolean(integrations.calendar)

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-navy-900">
            <CalendarCheck className="h-4 w-4 text-navy-700" aria-hidden="true" /> Let the AI book
            appointments
          </p>
          <p className="mt-1 text-xs text-slate-500">
            When on, the AI offers open slots and writes the booking straight into your calendar.
          </p>
        </div>
        <Checkbox
          id="booking_enabled"
          checked={form.booking_enabled}
          disabled={busy}
          onChange={(e) => patch({ booking_enabled: e.target.checked })}
          label="Enabled"
        />
      </div>

      <StatusRow
        name="Calendar connection"
        state={calendarConnected ? 'connected' : 'not-connected'}
        detail={
          calendarConnected
            ? 'The backend reports a working calendar connection for this business.'
            : 'No calendar is connected to this business yet.'
        }
      />

      {form.booking_enabled && !calendarConnected && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" aria-hidden="true" />
          <span>
            <strong className="font-semibold">Activation will be blocked.</strong> Booking is switched on
            but no calendar is connected, so the AI would have nowhere to write appointments. Connect a
            calendar, or turn booking off and finish setup without it.
          </span>
        </div>
      )}

      {!form.booking_enabled && (
        <p className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-600">
          Booking is off. The AI will capture the request and hand it to your team instead of scheduling
          it — you can switch this on any time from Settings.
        </p>
      )}
    </div>
  )
}
