'use client'

import * as React from 'react'
import { Clock, Globe2, LocateFixed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Select, Textarea, Checkbox } from '@/components/ui/input'
import { Field, errorRing, type StepProps } from '@/components/app/onboarding/shared'
import { DAYS, type DayKey, type LangText } from '@/lib/settings-ivr'
import {
  INDUSTRIES,
  LANGUAGE_OPTIONS,
  detectTimezone,
  timezoneOptions,
} from '@/lib/onboarding'

/* ───────────────────────────── Step 1 — business profile ───────────────────────────── */

export function StepBusinessProfile({ form, patch, errors, busy }: StepProps) {
  const zones = React.useMemo(() => timezoneOptions(), [])
  const browserZone = React.useMemo(() => detectTimezone(), [])

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field
        id="display_name"
        label="Business name"
        required
        error={errors.display_name}
        hint="Exactly as callers should hear it. This is what the AI says when it answers."
        className="sm:col-span-2"
      >
        {(a) => (
          <Input
            {...a}
            value={form.display_name}
            disabled={busy}
            onChange={(e) => patch({ display_name: e.target.value })}
            placeholder="VS Carriers Inc."
            autoComplete="organization"
            className={errors.display_name ? errorRing : undefined}
          />
        )}
      </Field>

      <Field
        id="legal_name"
        label="Legal name"
        error={errors.legal_name}
        hint="Only if it differs from the name above (used on invoices and compliance records)."
      >
        {(a) => (
          <Input
            {...a}
            value={form.legal_name}
            disabled={busy}
            onChange={(e) => patch({ legal_name: e.target.value })}
            placeholder="VS Carriers Incorporated"
          />
        )}
      </Field>

      <Field
        id="industry"
        label="Industry"
        error={errors.industry}
        hint="Shapes the questions the AI asks callers."
      >
        {(a) => (
          <Select
            {...a}
            value={form.industry}
            disabled={busy}
            onChange={(e) => patch({ industry: e.target.value })}
          >
            <option value="">Select an industry…</option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field
        id="website"
        label="Website"
        error={errors.website}
        hint="The AI can point callers here for pricing, forms and directions."
      >
        {(a) => (
          <Input
            {...a}
            type="url"
            inputMode="url"
            value={form.website}
            disabled={busy}
            onChange={(e) => patch({ website: e.target.value })}
            placeholder="https://example.com"
            autoComplete="url"
          />
        )}
      </Field>

      <Field
        id="location"
        label="Location"
        error={errors.location}
        hint="City and address callers may ask for."
      >
        {(a) => (
          <Input
            {...a}
            value={form.location}
            disabled={busy}
            onChange={(e) => patch({ location: e.target.value })}
            placeholder="123 Main St, Brampton, ON"
            autoComplete="street-address"
          />
        )}
      </Field>

      <Field
        id="timezone"
        label="Timezone"
        required
        error={errors.timezone}
        hint="Every hour, booking and after-hours rule is interpreted in this zone."
        className="sm:col-span-2"
      >
        {(a) => (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select
              {...a}
              value={form.timezone}
              disabled={busy}
              onChange={(e) => patch({ timezone: e.target.value })}
              className={errors.timezone ? errorRing : undefined}
            >
              <option value="">Select a timezone…</option>
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </Select>
            {browserZone && browserZone !== form.timezone && (
              <Button
                type="button"
                variant="outline-navy"
                disabled={busy}
                onClick={() => patch({ timezone: browserZone })}
                className="flex-shrink-0"
              >
                <LocateFixed className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Use {browserZone}
              </Button>
            )}
          </div>
        )}
      </Field>

      <Field
        id="owner_phone"
        label="Owner phone"
        error={errors.owner_phone}
        hint="Where urgent calls and transfers reach you. 10–15 digits with country code."
      >
        {(a) => (
          <Input
            {...a}
            type="tel"
            inputMode="tel"
            value={form.owner_phone}
            disabled={busy}
            onChange={(e) => patch({ owner_phone: e.target.value })}
            placeholder="+1 416 555 0123"
            autoComplete="tel"
            className={errors.owner_phone ? errorRing : undefined}
          />
        )}
      </Field>

      <Field
        id="owner_email"
        label="Owner email"
        error={errors.owner_email}
        hint="Where lead summaries and daily recaps are sent."
      >
        {(a) => (
          <Input
            {...a}
            type="email"
            inputMode="email"
            value={form.owner_email}
            disabled={busy}
            onChange={(e) => patch({ owner_email: e.target.value })}
            placeholder="owner@example.com"
            autoComplete="email"
            className={errors.owner_email ? errorRing : undefined}
          />
        )}
      </Field>
    </div>
  )
}

/* ───────────────────────────── Step 2 — business hours ───────────────────────────── */

export function StepBusinessHours({ form, patch, errors, busy }: StepProps) {
  const zones = React.useMemo(() => timezoneOptions(), [])

  const setDay = (key: DayKey, value: [string, string] | null) =>
    patch({ operating_hours: { ...form.operating_hours, [key]: value } })

  const setAfterHours = (text: string) => {
    const next: LangText = { ...form.after_hours_greeting, [form.language]: text }
    patch({ after_hours_greeting: next })
  }

  const applyWeekdayHours = () => {
    const monday = form.operating_hours.mon
    if (!monday) return
    patch({
      operating_hours: {
        ...form.operating_hours,
        tue: [monday[0], monday[1]],
        wed: [monday[0], monday[1]],
        thu: [monday[0], monday[1]],
        fri: [monday[0], monday[1]],
      },
    })
  }

  const langLabel =
    LANGUAGE_OPTIONS.find((l) => l.value === form.language)?.label ?? 'English'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4 sm:flex-row sm:items-end">
        <Field
          id="hours_timezone"
          label="Timezone these hours are in"
          required
          error={errors.timezone}
          className="flex-1"
        >
          {(a) => (
            <Select
              {...a}
              value={form.timezone}
              disabled={busy}
              onChange={(e) => patch({ timezone: e.target.value })}
              className={errors.timezone ? errorRing : undefined}
            >
              <option value="">Select a timezone…</option>
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <p className="flex items-center gap-1.5 pb-2.5 text-xs text-slate-500">
          <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
          Changing this also updates step 1.
        </p>
      </div>

      <fieldset className="space-y-2" disabled={busy}>
        <legend className="mb-2 flex items-center gap-2 text-sm font-semibold text-navy-900">
          <Clock className="h-4 w-4 text-navy-700" aria-hidden="true" /> Opening hours
        </legend>

        {errors.operating_hours && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errors.operating_hours}
          </p>
        )}

        {DAYS.map(({ key, label }) => {
          const hours = form.operating_hours[key]
          const closed = hours === null
          const open = closed ? '' : hours[0]
          const close = closed ? '' : hours[1]
          const dayError = errors[`hours_${key}`]
          return (
            <div
              key={key}
              className="grid items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 sm:grid-cols-[110px_1fr_1fr_110px]"
            >
              <span className="text-sm font-medium text-navy-900">{label}</span>
              <Input
                type="time"
                value={open}
                disabled={busy || closed}
                onChange={(e) => setDay(key, [e.target.value, close || '17:00'])}
                aria-label={`${label} opening time`}
                aria-invalid={Boolean(dayError)}
                className={dayError ? errorRing : undefined}
              />
              <Input
                type="time"
                value={close}
                disabled={busy || closed}
                onChange={(e) => setDay(key, [open || '09:00', e.target.value])}
                aria-label={`${label} closing time`}
                aria-invalid={Boolean(dayError)}
                className={dayError ? errorRing : undefined}
              />
              <Checkbox
                id={`closed-${key}`}
                checked={closed}
                disabled={busy}
                onChange={(e) => setDay(key, e.target.checked ? null : ['09:00', '17:00'])}
                label="Closed"
              />
              {dayError && (
                <p role="alert" className="text-xs text-red-600 sm:col-span-4">
                  {dayError}
                </p>
              )}
            </div>
          )
        })}

        {form.operating_hours.mon && (
          <div className="pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={applyWeekdayHours} disabled={busy}>
              Copy Monday to Tue–Fri
            </Button>
          </div>
        )}
      </fieldset>

      <Field
        id="after_hours_greeting"
        label={`After-hours greeting (${langLabel})`}
        error={errors.after_hours_greeting}
        hint="Played when someone calls outside the hours above. Leave blank to use your main greeting."
      >
        {(a) => (
          <Textarea
            {...a}
            rows={3}
            value={form.after_hours_greeting[form.language]}
            disabled={busy}
            onChange={(e) => setAfterHours(e.target.value)}
            placeholder="Thanks for calling — we're closed right now. Leave your name and number and we'll call you back first thing."
          />
        )}
      </Field>
    </div>
  )
}
