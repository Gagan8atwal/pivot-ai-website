export type SloState = 'healthy' | 'degraded' | 'critical' | 'unknown'
export type SloMetricName =
  | 'voice_connection'
  | 'call_finalization'
  | 'expected_lead_capture'
  | 'appointment_persistence'
  | 'notification_delivery'
  | 'owner_console_availability'
  | 'queue_processing'
export type SloWindowName = '5m' | '30m' | '1h' | '6h' | '24h'

export interface SloWindow {
  window: SloWindowName
  state: 'within_objective' | 'burning_budget' | 'unknown'
  reason?: string | null
  minimum_samples?: number | null
  good?: number | null
  total?: number | null
  success_rate?: number | null
  error_rate?: number | null
  burn_rate?: number | null
  observed_at?: string | null
}

export interface SloBreach {
  policy: string
  state: 'degraded' | 'critical'
  route: string
  threshold: number
  windows: SloWindowName[]
  detail: string
}

export interface SloMetric {
  metric: SloMetricName
  label: string
  description: string
  objective: number
  error_budget: number
  state: SloState
  reason?: string | null
  breaches: SloBreach[]
  budget_24h: {
    known: boolean
    consumed_ratio: number | null
    remaining_ratio: number | null
  }
  windows: Record<SloWindowName, SloWindow>
}

export interface SloGuardrail {
  state: SloState
  reason?: string | null
  live_count?: number | null
  stale_count?: number | null
  depth?: number | null
  oldest_queued_age_seconds?: number | null
}

export interface SloResponse {
  mode: 'aggregate_read_only_slo'
  policy_version: string
  profile: 'pilot_baseline_v1'
  contractual_sla: false
  scope: 'tenant'
  generated_at: string
  evidence_generated_at: string | null
  state: SloState
  route: string
  safe_to_claim_healthy: boolean
  summary: Record<SloState, number>
  metrics: Record<SloMetricName, SloMetric>
  guardrails: {
    workers: SloGuardrail
    queue: SloGuardrail
  }
  alerts: Array<{
    type: string
    metric: string
    state: SloState
    route: string
    detail?: string | null
  }>
  availability: Partial<Record<SloMetricName | 'workers' | 'queue', string>>
}

export const SLO_ORDER: SloMetricName[] = [
  'voice_connection',
  'call_finalization',
  'expected_lead_capture',
  'appointment_persistence',
  'notification_delivery',
  'owner_console_availability',
  'queue_processing',
]

export const SLO_STATE_META: Record<
  SloState,
  { label: string; description: string; className: string; badge: 'default' | 'secondary' | 'amber' }
> = {
  healthy: {
    label: 'Healthy evidence',
    description: 'Current, complete, sufficiently sampled evidence is within the internal pilot objective.',
    className: 'border-green-200 bg-green-50 text-green-800',
    badge: 'default',
  },
  degraded: {
    label: 'Degraded evidence',
    description: 'One or more metrics are consuming error budget too quickly or a warning guardrail is active.',
    className: 'border-amber-200 bg-amber-50 text-amber-900',
    badge: 'amber',
  },
  critical: {
    label: 'Critical reliability evidence',
    description: 'A fast error-budget burn or critical worker/queue guardrail requires platform review.',
    className: 'border-red-200 bg-red-50 text-red-800',
    badge: 'secondary',
  },
  unknown: {
    label: 'Reliability not yet proven',
    description: 'Evidence is missing, stale, incomplete, unavailable, or too low-volume to support a healthy claim.',
    className: 'border-slate-300 bg-slate-50 text-slate-800',
    badge: 'secondary',
  },
}

export const AVAILABILITY_COPY: Record<string, string> = {
  missing_pre_session_inbound_attempt_telemetry:
    'Inbound attempts that fail before a call record exists are not yet measured.',
  missing_owner_console_request_telemetry:
    'Owner-console request outcomes are not yet instrumented.',
  durable_job_telemetry_not_deployed:
    'Durable job completion telemetry is not deployed in the current environment.',
  worker_heartbeat_telemetry_not_deployed:
    'Worker heartbeat telemetry is not deployed in the current environment.',
  durable_job_queue_telemetry_not_deployed:
    'Durable queue depth and age telemetry is not deployed in the current environment.',
}

export function percent(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return 'Unknown'
  return `${(value * 100).toFixed(digits)}%`
}

export function metricAvailability(data: SloResponse | null, metric: SloMetricName): string | null {
  const reason = data?.availability?.[metric]
  return reason ? AVAILABILITY_COPY[reason] ?? reason.replaceAll('_', ' ') : null
}

export function metric24h(data: SloResponse | null, metric: SloMetricName): SloWindow | null {
  return data?.metrics?.[metric]?.windows?.['24h'] ?? null
}

export function stateCount(data: SloResponse | null, state: SloState): number {
  return Math.max(0, Number(data?.summary?.[state] ?? 0) || 0)
}
