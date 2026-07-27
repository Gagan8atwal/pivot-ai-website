export type ReconciliationStatus = 'healthy' | 'attention' | 'critical'
export type FindingType =
  | 'stale_call'
  | 'failed_notification'
  | 'aged_lead'
  | 'aged_appointment'

export interface ReconciliationSummary {
  total: number
  by_severity: Record<'info' | 'warning' | 'critical', number>
  by_type: Partial<Record<FindingType, number>>
  by_action: Record<string, number>
  tenant_scoped: number
}

export interface ReconciliationResponse {
  generated_at: string
  policy_version: string
  status: ReconciliationStatus
  summary: ReconciliationSummary
  thresholds_hours: {
    stale_call_warning: number
    stale_call_critical: number
    new_lead_warning: number
    new_lead_critical: number
    appointment_warning: number
    appointment_critical: number
  }
  guidance: Record<FindingType, string>
}

export const FINDING_META: Record<
  FindingType,
  { label: string; description: string; href: string; actionLabel: string }
> = {
  stale_call: {
    label: 'Calls needing verification',
    description: 'Calls that still look active beyond the operating threshold.',
    href: '/calls',
    actionLabel: 'Review calls',
  },
  failed_notification: {
    label: 'Notification delivery issues',
    description: 'Confirm delivery evidence before trying another notification.',
    href: '/messages',
    actionLabel: 'Review messages',
  },
  aged_lead: {
    label: 'Leads awaiting action',
    description: 'New leads that have waited beyond the follow-up threshold.',
    href: '/crm',
    actionLabel: 'Open CRM',
  },
  aged_appointment: {
    label: 'Appointment requests awaiting action',
    description: 'Requests still waiting for confirmation, rescheduling, or decline.',
    href: '/appointments',
    actionLabel: 'Review appointments',
  },
}

export const STATUS_META: Record<
  ReconciliationStatus,
  { label: string; description: string; className: string }
> = {
  healthy: {
    label: 'Healthy',
    description: 'No work has crossed the current reconciliation thresholds.',
    className: 'border-green-200 bg-green-50 text-green-800',
  },
  attention: {
    label: 'Needs attention',
    description: 'One or more items should be reviewed before they become critical.',
    className: 'border-amber-200 bg-amber-50 text-amber-900',
  },
  critical: {
    label: 'Critical attention required',
    description: 'At least one operational item has crossed a critical threshold.',
    className: 'border-red-200 bg-red-50 text-red-800',
  },
}

export function countFinding(data: ReconciliationResponse | null, type: FindingType): number {
  return Math.max(0, Number(data?.summary?.by_type?.[type] ?? 0) || 0)
}

export function countAction(data: ReconciliationResponse | null, action: string): number {
  return Math.max(0, Number(data?.summary?.by_action?.[action] ?? 0) || 0)
}

export function formatGeneratedAt(value: string): string {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return 'Unknown'
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
