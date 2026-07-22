import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

import {
  boundedText,
  isUuid,
  isValidEmail,
  normalizeEmail,
  splitName,
} from '@/lib/intake'
import {
  IntakeRequestError,
  parseSubmissionMeta,
  rateLimitWindowStart,
  readJsonObject,
  safeErrorMessage,
  validatePublicFormOrigin,
} from '@/lib/intake-server'
import {
  recordIntakeEmailFailure,
  sendTrackedIntakeEmail,
  type IntakeEmailResult,
} from '@/lib/intake-email'

const OWNER_ID_FALLBACK = '3fbf8a9e-0185-4445-868b-2b93258080cb'
const RESPONSE_HEADERS = { 'Cache-Control': 'no-store' }

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: RESPONSE_HEADERS })
}

function getSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, key, { auth: { persistSession: false } })
}

function getOwnerId(): string {
  const value = process.env.DASHBOARD_OWNER_ID?.trim() || OWNER_ID_FALLBACK
  if (!isUuid(value)) throw new Error('DASHBOARD_OWNER_ID is not a valid UUID')
  return value.toLowerCase()
}

function sameStoredLead(
  existing: Record<string, unknown>,
  expected: {
    firstName: string
    lastName: string | null
    email: string
    message: string
  }
): boolean {
  return (
    existing.source === 'contact_form' &&
    existing.first_name === expected.firstName &&
    (existing.last_name ?? null) === expected.lastName &&
    normalizeEmail(existing.email) === expected.email &&
    (existing.message ?? '') === expected.message
  )
}

async function ownerNotification(
  supabase: SupabaseClient,
  submissionId: string,
  input: { name: string; email: string; subject: string; message: string }
): Promise<IntakeEmailResult> {
  const ownerEmail = process.env.OWNER_EMAIL?.trim() || ''
  const fromEmail = process.env.FROM_EMAIL?.trim() || ''
  const apiKey = process.env.RESEND_API_KEY?.trim() || ''
  const emailSubject = `New Contact Message: ${input.subject || 'No Subject'}`

  if (!ownerEmail || !fromEmail || !apiKey) {
    await recordIntakeEmailFailure({
      supabase,
      submissionId,
      source: 'contact_form',
      emailType: 'owner_notification',
      recipient: ownerEmail || 'unconfigured-owner@invalid.local',
      subject: emailSubject,
      reason: 'OWNER_EMAIL, FROM_EMAIL, or RESEND_API_KEY is not configured',
    })
    return { status: 'failed', reason: 'delivery configuration unavailable' }
  }

  return sendTrackedIntakeEmail({
    supabase,
    resend: new Resend(apiKey),
    submissionId,
    source: 'contact_form',
    emailType: 'owner_notification',
    recipient: ownerEmail,
    subject: emailSubject,
    payload: {
      from: fromEmail,
      to: ownerEmail,
      replyTo: input.email,
      subject: emailSubject,
      text: [
        'New Contact Message from Pivot AI Website',
        '',
        `Submission ID: ${submissionId}`,
        `Name: ${input.name}`,
        `Email: ${input.email}`,
        `Subject: ${input.subject || 'No Subject'}`,
        '',
        'Message:',
        input.message,
      ].join('\n'),
    },
  })
}

export async function POST(request: Request) {
  try {
    validatePublicFormOrigin(request)
    const body = await readJsonObject(request)

    if (body.company_website && String(body.company_website).trim() !== '') {
      return json({ ok: true })
    }

    const { submissionId } = parseSubmissionMeta(body)
    const name = boundedText(body.name, 100)
    const email = normalizeEmail(body.email)
    const subject = boundedText(body.subject, 200)
    const message = boundedText(body.message, 5_000)

    if (!name || !email || !message) {
      throw new IntakeRequestError(400, 'Required fields are missing.')
    }
    if (!isValidEmail(email)) {
      throw new IntakeRequestError(400, 'Please enter a valid email address.')
    }

    const supabase = getSupabase()
    const ownerId = getOwnerId()
    const [firstName, lastName] = splitName(name)
    const crmMessage = [subject && `Subject: ${subject}`, message].filter(Boolean).join('\n\n')

    const { data: existing, error: lookupError } = await supabase
      .from('crm_leads')
      .select('id, source, first_name, last_name, email, message')
      .eq('id', submissionId)
      .maybeSingle()

    if (lookupError) {
      console.error('[contact] crm_lookup: FAIL —', safeErrorMessage(lookupError))
      throw new IntakeRequestError(503, 'We could not save your message. Please try again.')
    }

    let duplicate = false
    if (existing) {
      duplicate = true
      if (!sameStoredLead(existing as Record<string, unknown>, {
        firstName,
        lastName,
        email,
        message: crmMessage,
      })) {
        throw new IntakeRequestError(
          409,
          'This submission identifier was already used. Please refresh and try again.'
        )
      }
    } else {
      const { count, error: rateError } = await supabase
        .from('crm_leads')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', ownerId)
        .eq('source', 'contact_form')
        .eq('email', email)
        .gte('created_at', rateLimitWindowStart())

      if (rateError) {
        console.error('[contact] rate_limit_query: FAIL —', safeErrorMessage(rateError))
        throw new IntakeRequestError(503, 'We could not save your message. Please try again.')
      }
      if ((count ?? 0) >= 3) {
        throw new IntakeRequestError(
          429,
          'We already received several recent messages from this email. Please try again later.'
        )
      }

      const { error: insertError } = await supabase.from('crm_leads').insert({
        id: submissionId,
        user_id: ownerId,
        source: 'contact_form',
        first_name: firstName,
        last_name: lastName,
        email,
        message: crmMessage,
      })

      if (insertError) {
        console.error('[contact] crm_insert: FAIL —', safeErrorMessage(insertError))
        throw new IntakeRequestError(503, 'We could not save your message. Please try again.')
      }
    }

    const delivery = await ownerNotification(supabase, submissionId, {
      name,
      email,
      subject,
      message,
    })

    console.info('[contact] request_complete', {
      submissionId,
      duplicate,
      ownerNotification: delivery.status,
    })

    return json({
      ok: true,
      submissionId,
      duplicate,
      ownerNotification: delivery.status,
    })
  } catch (error) {
    if (error instanceof IntakeRequestError) {
      console.warn('[contact] request_rejected', {
        status: error.status,
        reason: safeErrorMessage(error),
      })
      return json({ error: error.publicMessage }, error.status)
    }

    console.error('[contact] request_failed —', safeErrorMessage(error))
    return json({ error: 'Service unavailable. Please try again later.' }, 503)
  }
}
