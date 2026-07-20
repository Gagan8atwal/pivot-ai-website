'use client'

import * as React from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/app/page-header'
import { ErrorState, LoadingState, NotConfiguredState } from '@/components/app/states'
import { useAuth } from '@/components/app/auth-provider'
import { useApi } from '@/lib/use-api'
import {
  ApiError,
  api,
  can,
  errorMessage,
  isApiConfigured,
  type ActivationBlockedBody,
  type OnboardingIntegrations,
  type OnboardingReadiness,
  type OnboardingStateRecord,
  type ReadinessIssue,
} from '@/lib/api'
import {
  TOTAL_STEPS,
  clampStep,
  draftFromForm,
  emptyOnboardingForm,
  formFromServer,
  settingsPatchForStep,
  stepMeta,
  unwrapSettings,
  validateStep,
  type OnboardingForm,
  type StepErrors,
} from '@/lib/onboarding'
import {
  SaveIndicator,
  StepRail,
  type SaveStatus,
} from '@/components/app/onboarding/shared'
import { StepBusinessHours, StepBusinessProfile } from '@/components/app/onboarding/steps-profile'
import { StepReceptionist, StepRouting } from '@/components/app/onboarding/steps-receptionist'
import { StepAppointments, StepLeadCapture } from '@/components/app/onboarding/steps-capture'
import { StepReview } from '@/components/app/onboarding/step-review'

const AUTOSAVE_DELAY_MS = 800

const EMPTY_READINESS: OnboardingReadiness = { ready: false, blockers: [], warnings: [] }
const EMPTY_INTEGRATIONS: OnboardingIntegrations = {
  calendar: false,
  phone: false,
  sms: { enabled: false, deliverable: false, reason: null },
  email: false,
}

function issues(value: unknown): ReadinessIssue[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      const r = (item ?? {}) as Record<string, unknown>
      return {
        field: typeof r.field === 'string' ? r.field : '',
        message: typeof r.message === 'string' ? r.message : String(r.message ?? ''),
      }
    })
    .filter((i) => i.message)
}

function readReadiness(value: unknown): OnboardingReadiness {
  const r = (value ?? {}) as Partial<OnboardingReadiness>
  return {
    ready: r.ready === true,
    blockers: issues(r.blockers),
    warnings: issues(r.warnings),
  }
}

function readIntegrations(value: unknown): OnboardingIntegrations {
  const r = (value ?? {}) as Record<string, unknown>
  const sms = (r.sms ?? {}) as Record<string, unknown>
  return {
    calendar: r.calendar === true,
    phone: r.phone === true,
    email: r.email === true,
    sms: {
      enabled: sms.enabled === true,
      deliverable: sms.deliverable === true,
      reason: typeof sms.reason === 'string' ? sms.reason : null,
    },
  }
}

function completedStepsOf(state: OnboardingStateRecord | null): number[] {
  if (!state || !Array.isArray(state.completed_steps)) return []
  return state.completed_steps
    .filter((n): n is number => typeof n === 'number' && n >= 1 && n <= TOTAL_STEPS)
    .sort((a, b) => a - b)
}

function assignedPhoneOf(settings: Record<string, unknown>): string {
  for (const key of ['phone_number', 'twilio_number', 'assigned_phone_number', 'number']) {
    const v = settings[key]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}

export function OnboardingWizard() {
  const { me } = useAuth()
  const canEdit = can.admin(me?.role)

  const bundle = useApi(async () => {
    const [onboarding, settingsRaw] = await Promise.all([api.onboarding.get(), api.settings.get()])
    return { onboarding, settings: unwrapSettings(settingsRaw) }
  }, [])

  // ── Server-derived state (refreshed independently of the form) ──────────────
  const [serverState, setServerState] = React.useState<OnboardingStateRecord | null>(null)
  const [readiness, setReadiness] = React.useState<OnboardingReadiness>(EMPTY_READINESS)
  const [integrations, setIntegrations] = React.useState<OnboardingIntegrations>(EMPTY_INTEGRATIONS)
  const [rawSettings, setRawSettings] = React.useState<Record<string, unknown>>({})

  // ── Wizard state ───────────────────────────────────────────────────────────
  const [form, setForm] = React.useState<OnboardingForm>(() => emptyOnboardingForm())
  const [step, setStep] = React.useState(1)
  const [hydrated, setHydrated] = React.useState(false)
  const [errors, setErrors] = React.useState<StepErrors>({})
  const [dirty, setDirty] = React.useState(false)
  const [saveTick, setSaveTick] = React.useState(0)
  const [save, setSave] = React.useState<SaveStatus>({ status: 'idle' })
  const [busy, setBusy] = React.useState(false)
  const [refreshing, setRefreshing] = React.useState(false)
  const [refreshError, setRefreshError] = React.useState<string | null>(null)

  // ── Activation state ───────────────────────────────────────────────────────
  const [activating, setActivating] = React.useState(false)
  const [activationBlockers, setActivationBlockers] = React.useState<ReadinessIssue[]>([])
  const [activationWarnings, setActivationWarnings] = React.useState<ReadinessIssue[]>([])
  const [activationError, setActivationError] = React.useState<string | null>(null)
  const [activatedMessage, setActivatedMessage] = React.useState<string | null>(null)

  const savingRef = React.useRef(false)

  // ── Hydrate once the initial load resolves ─────────────────────────────────
  React.useEffect(() => {
    if (!bundle.data) return
    const { onboarding, settings } = bundle.data
    setServerState(onboarding.state ?? null)
    setReadiness(readReadiness(onboarding.readiness))
    setIntegrations(readIntegrations(onboarding.integrations))
    setRawSettings(settings)
    setForm(formFromServer(settings, onboarding.state?.draft))
    setStep(clampStep(onboarding.state?.current_step))
    setDirty(false)
    setSave({ status: 'idle' })
    setHydrated(true)
  }, [bundle.data])

  const patch = React.useCallback((p: Partial<OnboardingForm>) => {
    setForm((f) => ({ ...f, ...p }))
    setDirty(true)
    setSave({ status: 'pending' })
  }, [])

  /**
   * Single writer for both backends. Settings columns owned by `fromStep` go to
   * `PATCH /app/settings`; wizard-only values go to the onboarding draft. The
   * indicator only reports "saved" when both calls actually succeeded.
   */
  const persist = React.useCallback(
    async (opts: {
      fromStep: number
      nextStep?: number
      completedStep?: number
      /** Wait for an in-flight autosave instead of bailing out. */
      wait?: boolean
    }) => {
      if (savingRef.current) {
        if (!opts.wait) return false
        for (let i = 0; i < 200 && savingRef.current; i++) {
          await new Promise((resolve) => setTimeout(resolve, 50))
        }
        if (savingRef.current) {
          setSave({ status: 'error', message: 'A previous save is still running.' })
          return false
        }
      }
      savingRef.current = true
      setDirty(false)
      setSave({ status: 'saving' })
      try {
        const settingsPatch = settingsPatchForStep(opts.fromStep, form)
        if (Object.keys(settingsPatch).length > 0) {
          const updated = await api.settings.update(settingsPatch)
          setRawSettings(unwrapSettings(updated))
        }
        const res = await api.onboarding.save({
          currentStep: clampStep(opts.nextStep ?? opts.fromStep),
          ...(opts.completedStep ? { completedStep: opts.completedStep } : {}),
          draft: draftFromForm(form),
        })
        if (res?.state) setServerState(res.state)
        setSave({
          status: 'saved',
          at: res?.savedAt || res?.state?.last_saved_at || new Date().toISOString(),
        })
        return true
      } catch (err) {
        setSave({ status: 'error', message: errorMessage(err) })
        setDirty(true)
        return false
      } finally {
        savingRef.current = false
        setSaveTick((t) => t + 1)
      }
    },
    [form]
  )

  // ── Debounced autosave (real request state, never optimistic) ───────────────
  React.useEffect(() => {
    if (!hydrated || !dirty || !canEdit || busy) return
    if (savingRef.current) return
    const timer = setTimeout(() => {
      void persist({ fromStep: step })
    }, AUTOSAVE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [hydrated, dirty, canEdit, busy, step, persist, saveTick])

  // Warn before losing an unsaved edit (e.g. a failed autosave).
  React.useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  const refresh = React.useCallback(async () => {
    setRefreshing(true)
    setRefreshError(null)
    try {
      const [onboarding, settingsRaw] = await Promise.all([
        api.onboarding.get(),
        api.settings.get(),
      ])
      setServerState(onboarding.state ?? null)
      setReadiness(readReadiness(onboarding.readiness))
      setIntegrations(readIntegrations(onboarding.integrations))
      setRawSettings(unwrapSettings(settingsRaw))
    } catch (err) {
      setRefreshError(errorMessage(err))
    } finally {
      setRefreshing(false)
    }
  }, [])

  // Readiness must be current whenever the review step is on screen.
  React.useEffect(() => {
    if (!hydrated || step !== TOTAL_STEPS) return
    void refresh()
  }, [hydrated, step, refresh])

  const goTo = React.useCallback(
    (target: number) => {
      const next = clampStep(target)
      if (next === step) return
      setErrors({})
      if (canEdit) void persist({ fromStep: step, nextStep: next, wait: true })
      setStep(next)
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [canEdit, persist, step]
  )

  const goNext = React.useCallback(async () => {
    const found = validateStep(step, form)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (!canEdit) return
    setBusy(true)
    const next = Math.min(step + 1, TOTAL_STEPS)
    const ok = await persist({ fromStep: step, nextStep: next, completedStep: step, wait: true })
    setBusy(false)
    if (!ok) return // step is NOT marked complete when the save failed
    setStep(next)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [canEdit, form, persist, step])

  const activate = React.useCallback(async () => {
    setActivating(true)
    setActivationError(null)
    setActivatedMessage(null)
    setActivationBlockers([])
    setActivationWarnings([])
    try {
      const res = await api.onboarding.activate()
      setActivationWarnings(issues(res?.warnings))
      setActivatedMessage(
        res?.alreadyActive
          ? 'This business was already active — nothing changed.'
          : 'Activated. Your AI receptionist is answering calls now.'
      )
      await refresh()
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const body = (err.body ?? {}) as Partial<ActivationBlockedBody>
        const blockers = issues(body.blockers)
        setActivationBlockers(blockers)
        setActivationWarnings(issues(body.warnings))
        setActivationError(
          blockers.length > 0
            ? 'Activation was blocked. Fix the items listed above, then try again.'
            : 'Activation was blocked by the backend readiness check.'
        )
        await refresh()
      } else {
        setActivationError(errorMessage(err))
      }
    } finally {
      setActivating(false)
    }
  }, [refresh])

  // ── Framing states ─────────────────────────────────────────────────────────
  const header = (
    <PageHeader
      title="Set up your AI receptionist"
      description="Seven steps. Everything you enter is saved as you go — you can stop and come back."
    />
  )

  if (!isApiConfigured) {
    return (
      <>
        {header}
        <NotConfiguredState feature="Onboarding" />
      </>
    )
  }

  if (bundle.loading && !hydrated) {
    return (
      <>
        {header}
        <LoadingState label="Loading your setup…" />
      </>
    )
  }

  if (bundle.error && !hydrated) {
    return (
      <>
        {header}
        <ErrorState
          title="Could not load your setup"
          message={bundle.error}
          onRetry={bundle.refetch}
        />
      </>
    )
  }

  const meta = stepMeta(step)
  const completed = completedStepsOf(serverState)
  const activatedAt = typeof serverState?.activated_at === 'string' ? serverState.activated_at : null
  const stepProps = { form, patch, errors, integrations, busy: busy || !canEdit }
  const hasErrors = Object.keys(errors).length > 0

  return (
    <>
      <PageHeader
        title="Set up your AI receptionist"
        description="Seven steps. Everything you enter is saved as you go — you can stop and come back."
        actions={
          activatedAt ? (
            <Badge variant="secondary" className="gap-1.5">
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Live
            </Badge>
          ) : undefined
        }
      />

      {!canEdit && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          You have read-only access. An admin or the owner needs to complete setup — you can look
          through it, but nothing you change here will be saved.
        </div>
      )}

      {refreshError && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <span>Could not refresh your setup status: {refreshError}</span>
          <Button type="button" variant="ghost" size="sm" onClick={() => void refresh()}>
            Try again
          </Button>
        </div>
      )}

      <div className="mb-5 space-y-3">
        <StepRail current={step} completed={completed} onSelect={goTo} />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-500">
            Step {step} of {TOTAL_STEPS} · {completed.length} of {TOTAL_STEPS} complete
          </p>
          <SaveIndicator
            state={save}
            onRetry={() => void persist({ fromStep: step, wait: true })}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{meta.title}</CardTitle>
          <CardDescription>{meta.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {hasErrors && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Fix the highlighted {Object.keys(errors).length === 1 ? 'field' : 'fields'} before
              continuing.
            </p>
          )}

          {step === 1 && <StepBusinessProfile {...stepProps} />}
          {step === 2 && <StepBusinessHours {...stepProps} />}
          {step === 3 && <StepReceptionist {...stepProps} />}
          {step === 4 && <StepRouting {...stepProps} />}
          {step === 5 && <StepLeadCapture {...stepProps} />}
          {step === 6 && <StepAppointments {...stepProps} />}
          {step === TOTAL_STEPS && (
            <StepReview
              form={form}
              readiness={readiness}
              integrations={integrations}
              assignedPhone={assignedPhoneOf(rawSettings)}
              activatedAt={activatedAt}
              activating={activating}
              refreshing={refreshing}
              activationBlockers={activationBlockers}
              activationWarnings={activationWarnings}
              activationError={activationError}
              activatedMessage={activatedMessage}
              onFix={goTo}
              onActivate={() => void activate()}
              onRefresh={() => void refresh()}
            />
          )}
        </CardContent>
      </Card>

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => goTo(step - 1)}
          disabled={step === 1 || busy}
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" /> Back
        </Button>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {step === 6 && !form.booking_enabled && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => void goNext()}
              disabled={busy || !canEdit}
            >
              Skip booking for now
            </Button>
          )}
          {step < TOTAL_STEPS && (
            <Button type="button" onClick={() => void goNext()} disabled={busy || !canEdit}>
              {busy ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              {busy ? 'Saving…' : 'Save & continue'}
              {!busy && <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />}
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
