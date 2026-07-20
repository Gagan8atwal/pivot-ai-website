'use client'

import * as React from 'react'
import { Building2, PhoneCall, Plus, SpellCheck2, Trash2, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Select, Textarea } from '@/components/ui/input'
import { Field, errorRing, type StepProps } from '@/components/app/onboarding/shared'
import { TRANSFER_MODES, type LangCode, type TransferMode } from '@/lib/settings-ivr'
import {
  AFTER_HOURS_ROUTING,
  LANGUAGE_OPTIONS,
  OPENAI_VOICES,
  TONES,
  TTS_PROVIDERS,
  greetingPreview,
  type AfterHoursRouting,
} from '@/lib/onboarding'

/* ───────────────────────────── Step 3 — receptionist ───────────────────────────── */

export function StepReceptionist({ form, patch, errors, busy }: StepProps) {
  const preview = greetingPreview(form)
  const providerHint = TTS_PROVIDERS.find((p) => p.value === form.tts_provider)?.hint

  const setPron = (index: number, key: 'term' | 'sounds_like', value: string) =>
    patch({
      pronunciations: form.pronunciations.map((p, i) => (i === index ? { ...p, [key]: value } : p)),
    })

  const addPron = () =>
    patch({ pronunciations: [...form.pronunciations, { term: '', sounds_like: '' }] })

  const removePron = (index: number) =>
    patch({ pronunciations: form.pronunciations.filter((_, i) => i !== index) })

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <Field
          id="greeting"
          label="Greeting"
          required
          error={errors.greeting}
          hint="Use {business_name} or {receptionist_name} to drop in the values above."
        >
          {(a) => (
            <Textarea
              {...a}
              rows={5}
              value={form.greeting}
              disabled={busy}
              onChange={(e) => patch({ greeting: e.target.value })}
              placeholder="Thank you for calling {business_name}. This is {receptionist_name} — how can I help you today?"
              className={errors.greeting ? errorRing : undefined}
            />
          )}
        </Field>

        <div className="space-y-1.5">
          <p className="text-sm font-medium leading-none text-navy-900">What the caller hears</p>
          <div
            className="min-h-[124px] rounded-lg border border-navy-900/15 bg-navy-900/[0.03] p-4"
            aria-live="polite"
          >
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Volume2 className="h-3.5 w-3.5" aria-hidden="true" /> Live preview
            </p>
            {preview ? (
              <p className="mt-2 text-sm leading-relaxed text-navy-900">“{preview}”</p>
            ) : (
              <p className="mt-2 text-sm italic text-slate-400">
                Nothing yet — write a greeting and it appears here word for word.
              </p>
            )}
          </div>
          <p className="text-xs text-slate-400">
            This is the exact text spoken when the AI answers, with placeholders resolved.
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="receptionist_name"
          label="Receptionist name"
          error={errors.receptionist_name}
          hint="The name the AI gives when a caller asks who they are speaking to."
        >
          {(a) => (
            <Input
              {...a}
              value={form.receptionist_name}
              disabled={busy}
              onChange={(e) => patch({ receptionist_name: e.target.value })}
              placeholder="Maya"
            />
          )}
        </Field>

        <Field id="tone" label="Tone" hint={TONES.find((t) => t.value === form.tone)?.description}>
          {(a) => (
            <Select
              {...a}
              value={form.tone}
              disabled={busy}
              onChange={(e) => patch({ tone: e.target.value })}
            >
              {TONES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field id="language" label="Primary language" hint="Which greeting slot this wizard edits.">
          {(a) => (
            <Select
              {...a}
              value={form.language}
              disabled={busy}
              onChange={(e) => patch({ language: e.target.value as LangCode })}
            >
              {LANGUAGE_OPTIONS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field
          id="tts_provider"
          label="Voice provider"
          required
          error={errors.tts_provider}
          hint={providerHint}
        >
          {(a) => (
            <Select
              {...a}
              value={form.tts_provider}
              disabled={busy}
              onChange={(e) => patch({ tts_provider: e.target.value, voice_id: '' })}
              className={errors.tts_provider ? errorRing : undefined}
            >
              {TTS_PROVIDERS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field
          id="voice_id"
          label="Voice"
          required
          error={errors.voice_id}
          hint={
            form.tts_provider === 'openai'
              ? 'OpenAI ships these six voices.'
              : 'Copy the voice ID from your ElevenLabs voice library.'
          }
          className="sm:col-span-2"
        >
          {(a) =>
            form.tts_provider === 'openai' ? (
              <Select
                {...a}
                value={form.voice_id}
                disabled={busy}
                onChange={(e) => patch({ voice_id: e.target.value })}
                className={errors.voice_id ? errorRing : undefined}
              >
                <option value="">Select a voice…</option>
                {OPENAI_VOICES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                {...a}
                value={form.voice_id}
                disabled={busy}
                onChange={(e) => patch({ voice_id: e.target.value })}
                placeholder="21m00Tcm4TlvDq8ikWAM"
                className={errors.voice_id ? errorRing : undefined}
              />
            )
          }
        </Field>
      </div>

      {/* Pronunciation hints */}
      <fieldset className="space-y-3 rounded-lg border border-slate-200 p-4" disabled={busy}>
        <legend className="flex items-center gap-2 px-1 text-sm font-semibold text-navy-900">
          <SpellCheck2 className="h-4 w-4 text-navy-700" aria-hidden="true" /> Pronunciation hints
        </legend>
        <p className="text-xs text-slate-500">
          Names, streets or brands the AI tends to mangle. Write them the way they should sound.
        </p>

        {form.pronunciations.length === 0 && (
          <p className="text-sm text-slate-500">No hints yet.</p>
        )}

        {form.pronunciations.map((p, i) => (
          <div key={i} className="grid items-start gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <Input
              value={p.term}
              disabled={busy}
              onChange={(e) => setPron(i, 'term', e.target.value)}
              placeholder="Gagandeep"
              aria-label={`Pronunciation term ${i + 1}`}
              aria-invalid={Boolean(errors[`pron_${i}`])}
              className={errors[`pron_${i}`] ? errorRing : undefined}
            />
            <Input
              value={p.sounds_like}
              disabled={busy}
              onChange={(e) => setPron(i, 'sounds_like', e.target.value)}
              placeholder="GUH-gun-deep"
              aria-label={`Pronunciation for term ${i + 1}`}
              aria-invalid={Boolean(errors[`pron_${i}`])}
              className={errors[`pron_${i}`] ? errorRing : undefined}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removePron(i)}
              disabled={busy}
              aria-label={`Remove pronunciation hint ${i + 1}`}
            >
              <Trash2 className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </Button>
            {errors[`pron_${i}`] && (
              <p role="alert" className="text-xs text-red-600 sm:col-span-3">
                {errors[`pron_${i}`]}
              </p>
            )}
          </div>
        ))}

        <Button type="button" variant="outline-navy" size="sm" onClick={addPron} disabled={busy}>
          <Plus className="mr-1 h-4 w-4" aria-hidden="true" /> Add hint
        </Button>
      </fieldset>

      <SpellingTerms form={form} patch={patch} busy={busy} />
    </div>
  )
}

function SpellingTerms({
  form,
  patch,
  busy,
}: Pick<StepProps, 'form' | 'patch' | 'busy'>) {
  const [draft, setDraft] = React.useState('')

  const add = () => {
    const value = draft.trim()
    if (!value || form.spelling_terms.includes(value)) return
    patch({ spelling_terms: [...form.spelling_terms, value] })
    setDraft('')
  }

  const remove = (term: string) =>
    patch({ spelling_terms: form.spelling_terms.filter((t) => t !== term) })

  return (
    <fieldset className="space-y-3 rounded-lg border border-slate-200 p-4" disabled={busy}>
      <legend className="flex items-center gap-2 px-1 text-sm font-semibold text-navy-900">
        Spelling-sensitive terms
      </legend>
      <p className="text-xs text-slate-500">
        Words the AI must spell back to the caller letter by letter — surnames, part numbers, unit
        numbers.
      </p>

      <div className="flex items-start gap-2">
        <Input
          value={draft}
          disabled={busy}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder="Chahal"
          aria-label="New spelling-sensitive term"
        />
        <Button type="button" variant="outline-navy" onClick={add} disabled={busy || !draft.trim()}>
          <Plus className="mr-1 h-4 w-4" aria-hidden="true" /> Add
        </Button>
      </div>

      {form.spelling_terms.length === 0 ? (
        <p className="text-sm text-slate-500">No terms yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {form.spelling_terms.map((t) => (
            <li
              key={t}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-navy-900"
            >
              {t}
              <button
                type="button"
                onClick={() => remove(t)}
                disabled={busy}
                className="text-slate-400 hover:text-red-600 disabled:opacity-50"
                aria-label={`Remove ${t}`}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </fieldset>
  )
}

/* ───────────────────────────── Step 4 — call routing ───────────────────────────── */

export function StepRouting({ form, patch, errors, busy }: StepProps) {
  const setDept = (index: number, key: 'name' | 'phone', value: string) =>
    patch({
      departments: form.departments.map((d, i) =>
        i === index ? { ...d, ...(key === 'name' ? { name: value, label: value } : { phone: value }) } : d
      ),
    })

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="routing_owner_phone"
          label="Forwarding number"
          required
          error={errors.owner_phone}
          hint="Where the AI transfers a caller who needs a human. 10–15 digits with country code."
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
          id="transfer_mode"
          label="Transfer style"
          hint={TRANSFER_MODES.find((m) => m.value === form.transfer_mode)?.description}
        >
          {(a) => (
            <Select
              {...a}
              value={form.transfer_mode}
              disabled={busy}
              onChange={(e) => patch({ transfer_mode: e.target.value as TransferMode })}
            >
              {TRANSFER_MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field
          id="fallback_line"
          label="Fallback line"
          error={errors.fallback_line}
          hint="Used only if the forwarding number is busy or unreachable. Optional."
          className="sm:col-span-2"
        >
          {(a) => (
            <Input
              {...a}
              type="tel"
              inputMode="tel"
              value={form.fallback_line}
              disabled={busy}
              onChange={(e) => patch({ fallback_line: e.target.value })}
              placeholder="+1 416 555 0199"
              className={errors.fallback_line ? errorRing : undefined}
            />
          )}
        </Field>
      </div>

      <fieldset className="space-y-3 rounded-lg border border-slate-200 p-4" disabled={busy}>
        <legend className="flex items-center gap-2 px-1 text-sm font-semibold text-navy-900">
          <Building2 className="h-4 w-4 text-navy-700" aria-hidden="true" /> Departments
        </legend>
        <p className="text-xs text-slate-500">
          Callers can ask for a department by name. Leave a number blank to keep that department on the
          main forwarding number.
        </p>

        {form.departments.map((d, i) => (
          <div key={`${d.option}-${i}`} className="grid gap-2 sm:grid-cols-[80px_1fr_1fr]">
            <div className="flex items-center">
              <span className="inline-flex h-9 items-center rounded-md bg-slate-100 px-3 text-xs font-semibold text-slate-600">
                Press {d.option}
              </span>
            </div>
            <Input
              value={d.label ?? d.name}
              disabled={busy}
              onChange={(e) => setDept(i, 'name', e.target.value)}
              placeholder="Dispatch"
              aria-label={`Department ${i + 1} name`}
              aria-invalid={Boolean(errors[`dept_name_${i}`])}
              className={errors[`dept_name_${i}`] ? errorRing : undefined}
            />
            <Input
              type="tel"
              inputMode="tel"
              value={d.phone}
              disabled={busy}
              onChange={(e) => setDept(i, 'phone', e.target.value)}
              placeholder="+1 416 555 0124"
              aria-label={`Department ${i + 1} phone number`}
              aria-invalid={Boolean(errors[`dept_phone_${i}`])}
              className={errors[`dept_phone_${i}`] ? errorRing : undefined}
            />
            {(errors[`dept_name_${i}`] || errors[`dept_phone_${i}`]) && (
              <p role="alert" className="text-xs text-red-600 sm:col-span-3">
                {errors[`dept_name_${i}`] ?? errors[`dept_phone_${i}`]}
              </p>
            )}
          </div>
        ))}
      </fieldset>

      <fieldset className="space-y-2 rounded-lg border border-slate-200 p-4" disabled={busy}>
        <legend className="flex items-center gap-2 px-1 text-sm font-semibold text-navy-900">
          <PhoneCall className="h-4 w-4 text-navy-700" aria-hidden="true" /> After-hours routing
        </legend>
        {errors.after_hours_routing && (
          <p role="alert" className="text-xs text-red-600">
            {errors.after_hours_routing}
          </p>
        )}
        {AFTER_HOURS_ROUTING.map((option) => (
          <label
            key={option.value}
            htmlFor={`after_hours_${option.value}`}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50"
          >
            <input
              type="radio"
              id={`after_hours_${option.value}`}
              name="after_hours_routing"
              value={option.value}
              checked={form.after_hours_routing === option.value}
              disabled={busy}
              onChange={() => patch({ after_hours_routing: option.value as AfterHoursRouting })}
              className="mt-0.5 h-4 w-4 flex-shrink-0 accent-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900/20"
            />
            <span>
              <span className="block text-sm font-medium text-navy-900">{option.label}</span>
              <span className="block text-xs text-slate-500">{option.description}</span>
            </span>
          </label>
        ))}
      </fieldset>
    </div>
  )
}
