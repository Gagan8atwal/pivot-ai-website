'use client'

import * as React from 'react'
import {
  PhoneForwarded,
  Languages,
  Clock,
  CalendarOff,
  Plus,
  Trash2,
  Building2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Label, Select, Checkbox } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  LANGS,
  DAYS,
  TRANSFER_MODES,
  isE164,
  isYmd,
  type IvrSettings,
  type LangCode,
  type LangText,
  type DayKey,
  type DeptOption,
  type TransferMode,
} from '@/lib/settings-ivr'

/**
 * Reusable, controlled editor for the greetings / IVR settings shape.
 * Used by both /settings (live values) and /vs-carriers (template defaults).
 */
export function IvrSettingsEditor({
  value,
  onChange,
  readOnly = false,
}: {
  value: IvrSettings
  onChange: (next: IvrSettings) => void
  readOnly?: boolean
}) {
  const patch = (p: Partial<IvrSettings>) => onChange({ ...value, ...p })

  return (
    <div className="space-y-6">
      <CallFlowSection value={value} patch={patch} readOnly={readOnly} />
      <GreetingsSection value={value} patch={patch} readOnly={readOnly} />
      <DepartmentsSection value={value} patch={patch} readOnly={readOnly} />
      <HoursSection value={value} patch={patch} readOnly={readOnly} />
      <HolidaysSection value={value} patch={patch} readOnly={readOnly} />
    </div>
  )
}

type SectionProps = {
  value: IvrSettings
  patch: (p: Partial<IvrSettings>) => void
  readOnly: boolean
}

function SectionCard({
  icon: Icon,
  title,
  description,
  badge,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  badge?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5 text-navy-700" /> {title}
          {badge}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

/* ───────────────── Call flow: IVR toggle + transfer mode ───────────────── */

function CallFlowSection({ value, patch, readOnly }: SectionProps) {
  return (
    <SectionCard
      icon={PhoneForwarded}
      title="Call flow"
      description="Whether callers hear the phone menu (IVR) and how the AI hands off live calls."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Checkbox
            id="ivr_enabled"
            checked={value.ivr_enabled}
            disabled={readOnly}
            onChange={(e) => patch({ ivr_enabled: e.target.checked })}
            label="Enable phone menu (IVR) — “Press 1 for Dispatch…”"
          />
          <p className="mt-2 text-xs text-slate-400">
            When off, the AI answers and handles every caller directly without a menu.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="transfer_mode">Transfer mode</Label>
          <Select
            id="transfer_mode"
            value={value.transfer_mode}
            disabled={readOnly}
            onChange={(e) => patch({ transfer_mode: e.target.value as TransferMode })}
          >
            {TRANSFER_MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>
          <p className="text-xs text-slate-400">
            {TRANSFER_MODES.find((m) => m.value === value.transfer_mode)?.description}
          </p>
        </div>
      </div>
    </SectionCard>
  )
}

/* ───────────────── Greetings: EN / PA / HI tabs ───────────────── */

function GreetingsSection({ value, patch, readOnly }: SectionProps) {
  const [lang, setLang] = React.useState<LangCode>('en')

  const setGreeting = (
    field: 'greetings' | 'after_hours_greeting' | 'holiday_greeting',
    code: LangCode,
    text: string
  ) => {
    const next: LangText = { ...value[field], [code]: text }
    patch({ [field]: next } as Partial<IvrSettings>)
  }

  return (
    <SectionCard
      icon={Languages}
      title="Greetings"
      description="What callers hear, per language. Switch tabs to edit each language."
    >
      <Tabs value={lang} onValueChange={(v) => setLang(v as LangCode)}>
        <TabsList>
          {LANGS.map((l) => (
            <TabsTrigger key={l.code} value={l.code}>
              {l.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {LANGS.map((l) => (
          <TabsContent key={l.code} value={l.code} className="space-y-4">
            <GreetingField
              label="Main / business greeting"
              id={`greeting-${l.code}`}
              value={value.greetings[l.code]}
              readOnly={readOnly}
              onChange={(t) => setGreeting('greetings', l.code, t)}
            />
            <GreetingField
              label="After-hours greeting"
              id={`afterhours-${l.code}`}
              value={value.after_hours_greeting[l.code]}
              readOnly={readOnly}
              onChange={(t) => setGreeting('after_hours_greeting', l.code, t)}
            />
            <GreetingField
              label="Holiday greeting"
              id={`holiday-${l.code}`}
              value={value.holiday_greeting[l.code]}
              readOnly={readOnly}
              onChange={(t) => setGreeting('holiday_greeting', l.code, t)}
            />
          </TabsContent>
        ))}
      </Tabs>
    </SectionCard>
  )
}

function GreetingField({
  label,
  id,
  value,
  onChange,
  readOnly,
}: {
  label: string
  id: string
  value: string
  onChange: (t: string) => void
  readOnly: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        rows={3}
        value={value}
        disabled={readOnly}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter the ${label.toLowerCase()}…`}
      />
    </div>
  )
}

/* ───────────────── Departments (Press 1/2/3) ───────────────── */

function DepartmentsSection({ value, patch, readOnly }: SectionProps) {
  const setDept = (i: number, p: Partial<{ name: string; label: string; option: DeptOption; phone: string }>) =>
    patch({
      departments: value.departments.map((d, idx) => (idx === i ? { ...d, ...p } : d)),
    })

  return (
    <SectionCard
      icon={Building2}
      title="Departments & menu options"
      description="Where each menu option routes. Phone numbers must be E.164 (e.g. +15555550123)."
    >
      <div className="space-y-3">
        {value.departments.map((d, i) => {
          const phoneInvalid = d.phone.trim().length > 0 && !isE164(d.phone)
          return (
            <div
              key={`${d.option}-${i}`}
              className="grid items-start gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[88px_1fr_1fr]"
            >
              <div className="space-y-1.5">
                <Label htmlFor={`dept-opt-${i}`}>Press</Label>
                <Select
                  id={`dept-opt-${i}`}
                  value={d.option}
                  disabled={readOnly}
                  onChange={(e) => setDept(i, { option: e.target.value as DeptOption })}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`dept-name-${i}`}>Department / name</Label>
                <Input
                  id={`dept-name-${i}`}
                  value={d.label ?? d.name}
                  disabled={readOnly}
                  onChange={(e) => setDept(i, { name: e.target.value, label: e.target.value })}
                  placeholder="Dispatch"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`dept-phone-${i}`}>Phone (E.164)</Label>
                <Input
                  id={`dept-phone-${i}`}
                  value={d.phone}
                  disabled={readOnly}
                  onChange={(e) => setDept(i, { phone: e.target.value })}
                  placeholder="+15555550123"
                  className={phoneInvalid ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}
                  aria-invalid={phoneInvalid}
                />
                {phoneInvalid && (
                  <p className="text-xs text-red-600">Must start with + and 8–15 digits.</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}

/* ───────────────── Operating hours ───────────────── */

function HoursSection({ value, patch, readOnly }: SectionProps) {
  const setDay = (key: DayKey, hours: IvrSettings['operating_hours'][DayKey]) =>
    patch({ operating_hours: { ...value.operating_hours, [key]: hours } })

  return (
    <SectionCard
      icon={Clock}
      title="Operating hours"
      description="Open/close per day. Toggle “Closed” for days you don't operate."
    >
      <div className="space-y-2">
        {DAYS.map(({ key, label }) => {
          const hours = value.operating_hours[key]
          const closed = hours === null
          const open = closed ? '' : hours[0]
          const close = closed ? '' : hours[1]
          return (
            <div
              key={key}
              className="grid items-center gap-3 rounded-lg border border-slate-100 px-3 py-2 sm:grid-cols-[110px_1fr_1fr_110px]"
            >
              <span className="text-sm font-medium text-navy-900">{label}</span>
              <Input
                type="time"
                value={open}
                disabled={readOnly || closed}
                onChange={(e) => setDay(key, [e.target.value, close || '17:00'])}
                aria-label={`${label} open time`}
              />
              <Input
                type="time"
                value={close}
                disabled={readOnly || closed}
                onChange={(e) => setDay(key, [open || '09:00', e.target.value])}
                aria-label={`${label} close time`}
              />
              <Checkbox
                id={`closed-${key}`}
                checked={closed}
                disabled={readOnly}
                onChange={(e) => setDay(key, e.target.checked ? null : ['09:00', '17:00'])}
                label="Closed"
              />
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}

/* ───────────────── Holidays ───────────────── */

function HolidaysSection({ value, patch, readOnly }: SectionProps) {
  const [draft, setDraft] = React.useState('')
  const draftInvalid = draft.trim().length > 0 && !isYmd(draft)

  const add = () => {
    const d = draft.trim()
    if (!isYmd(d) || value.holidays.includes(d)) return
    patch({ holidays: [...value.holidays, d].sort() })
    setDraft('')
  }
  const remove = (d: string) => patch({ holidays: value.holidays.filter((h) => h !== d) })

  return (
    <SectionCard
      icon={CalendarOff}
      title="Holidays"
      description="Dates the holiday greeting plays instead of normal hours (YYYY-MM-DD)."
      badge={value.holidays.length ? <Badge variant="secondary">{value.holidays.length}</Badge> : undefined}
    >
      {!readOnly && (
        <div className="mb-4 flex items-start gap-2">
          <div className="flex-1">
            <Input
              type="date"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  add()
                }
              }}
              aria-label="New holiday date"
              className={draftInvalid ? 'border-red-300' : ''}
            />
            {draftInvalid && <p className="mt-1 text-xs text-red-600">Use YYYY-MM-DD.</p>}
          </div>
          <Button type="button" variant="outline-navy" onClick={add} disabled={!isYmd(draft)}>
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>
      )}

      {value.holidays.length === 0 ? (
        <p className="py-2 text-sm text-slate-500">No holidays configured.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {value.holidays.map((h) => (
            <li
              key={h}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-navy-900"
            >
              {h}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => remove(h)}
                  className="text-slate-400 hover:text-red-600"
                  aria-label={`Remove ${h}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
