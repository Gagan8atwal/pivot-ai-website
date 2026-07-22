import type { SupabaseClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

import {
  emailEventId,
  recoveryMarker,
  resendIdempotencyKey,
  safeErrorMessage,
} from '@/lib/intake-server'

export type IntakeSource = 'contact_form' | 'demo_request'
export type IntakeEmailType = 'owner_notification' | 'customer_confirmation'

export interface IntakeEmailPayload {
  from: string
  to: string
  subject: string
  text?: string
  html?: string
  replyTo?: string
}

export type IntakeEmailResult =
  | { status: 'sent'; resendId: string | null }
  | { status: 'already_sent'; resendId: string | null }
  | { status: 'failed'; reason: string }

interface SendTrackedEmailInput {
  supabase: SupabaseClient
  resend: Resend
  submissionId: string
  source: IntakeSource
  emailType: IntakeEmailType
  payload: IntakeEmailPayload
}

export async function sendTrackedIntakeEmail(
  input: SendTrackedEmailInput
): Promise<IntakeEmailResult> {
  const { supabase, resend, submissionId, source, emailType, payload } = input
  const eventId = emailEventId(submissionId, source, emailType)
  const marker = recoveryMarker(submissionId, source)

  const { data: existing, error: existingError } = await supabase
    .from('email_events')
    .select('status, attempt, resend_id')
    .eq('id', eventId)
    .maybeSingle()

  if (existingError) {
    const reason = safeErrorMessage(existingError)
    console.error('[intake-email] ledger_lookup: FAIL —', reason)
    return { status: 'failed', reason: 'delivery ledger unavailable' }
  }

  if (existing?.status === 'sent') {
    return { status: 'already_sent', resendId: existing.resend_id ?? null }
  }

  const attempt = Math.max(1, Number(existing?.attempt ?? 0) + 1)
  const { error: ledgerError } = await supabase.from('email_events').upsert(
    {
      id: eventId,
      business_id: null,
      appointment_id: null,
      recipient_email: payload.to,
      email_type: emailType,
      subject: payload.subject,
      resend_id: marker,
      status: 'failed',
      error_message: 'delivery_pending',
      attempt,
      sent_at: null,
    },
    { onConflict: 'id' }
  )

  if (ledgerError) {
    const reason = safeErrorMessage(ledgerError)
    console.error('[intake-email] ledger_prepare: FAIL —', reason)
    return { status: 'failed', reason: 'delivery ledger unavailable' }
  }

  try {
    const { data, error } = await resend.emails.send(payload, {
      idempotencyKey: resendIdempotencyKey(submissionId, source, emailType),
    })

    if (error) {
      const reason = safeErrorMessage(error)
      await supabase
        .from('email_events')
        .update({ status: 'failed', error_message: reason, resend_id: marker })
        .eq('id', eventId)
      return { status: 'failed', reason }
    }

    const resendId = data?.id ?? null
    const { error: updateError } = await supabase
      .from('email_events')
      .update({
        status: 'sent',
        error_message: null,
        resend_id: resendId ?? marker,
        sent_at: new Date().toISOString(),
      })
      .eq('id', eventId)

    if (updateError) {
      console.error('[intake-email] ledger_complete: FAIL —', safeErrorMessage(updateError))
    }

    return { status: 'sent', resendId }
  } catch (error) {
    const reason = safeErrorMessage(error)
    await supabase
      .from('email_events')
      .update({ status: 'failed', error_message: reason, resend_id: marker })
      .eq('id', eventId)
    return { status: 'failed', reason }
  }
}
