import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

import {
  CUSTOMER_EMAIL_SUBJECT,
  customerEmailHtml,
  ownerEmailHtml,
  ownerEmailSubject,
  type DemoEmailData,
} from '@/lib/demo-emails'
import { createDemoCalendarEvent, type CalendarResult } from '@/lib/google-calendar'
import {
  SMS_CONSENT_METHOD,
  SMS_CONSENT_TEXT,
  boundedText,
  isUuid,
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  normalizePhone,
  phoneDigits,
  splitName,
} from '@/lib/intake'
import {
  IntakeRequestError,
  parseSubmissionMeta,
  rateLimitWindowStart,
  readJsonObject,
  requestIp,
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

function sameDemoRequest(
  existing: Record<string, unknown>,
  expected: {
    name: string
    businessName: string
    email: string
    phone: string
    industry: string
    notes: string | null
    consent: boolean
  }
): boolean {
  return (
    existing.name === expected.name &&
    (existing.business_name ?? '') === expected.businessName &&
    normalizeEmail(existing.email) === expected.email &&
    phoneDigits(normalizePhone(existing.phone)) === phoneDigits(expected.phone) &&
    (existing.industry ?? '') === expected.industry &&
    (existing.notes ?? null) === expected.notes &&
    existing.sms_consent === expected.consent
  )
}

function sameCrmLead(
  existing: Record<string, unknown>,
  expected: {
    firstName: string
    lastName: string | null
    email: string
    phone: string
    businessName: string
    industry: string
    message: string | null
  }
): boolean {
  return (
    existing.source === 'demo_request' &&
    existing.first_name === expected.firstName &&
    (existing.last_name ?? null) === expected.lastName &&
    normalizeEmail(existing.email) === expected.email &&
    phoneDigits(normalizePhone(existing.phone)) === phoneDigits(expected.phone) &&
    (existing.business_name ?? '') === expected.businessName &&
    (existing.industry ?? '') === expected.industry &&
    (existing.message ?? null) === expected.message
  )
}

async function syncCrmLead(
  supabase: SupabaseClient,
  ownerId: string,
  submissionId: string,
  input: {
    contactName: string
    email: string
    phone: string
    businessName: string
    industry: string
    notes: string | null
  }
): Promise<'created' | 'existing'> {
  const [firstName, lastName] = splitName(input.contactName)
  const expected = {
    firstName,
    lastName,
    email: input.email,
    phone: input.phone,
    businessName: input.businessName,
    industry: input.industry,
    message: input.notes,
  }

  const { data: existing, error: lookupError } = await supabase
    .from('crm_leads')
    .select('id, source, first_name, last_name, email, phone, business_name, industry, message')
    .eq('id', submissionId)
    .maybeSingle()

  if (lookupError) throw lookupError
  if (existing) {
    if (!sameCrmLead(existing as Record<string, unknown>, expected)) {
      throw new IntakeRequestError(
        409,
        'This submission identifier was already used. Please refresh and try again.'
      )
    }
    return 'existing'
  }

  const { error } = await supabase.from('crm_leads').insert({
    id: submissionId,
    user_id: ownerId,
    source: 'demo_request',
    first_name: firstName,
    last_name: lastName,
    email: input.email,
    phone: input.phone,
    business_name: input.businessName,
    industry: input.industry || null,
    message: input.notes,
  })
  if (error) throw error
  return 'created'
}

async function trackedOwnerEmail(
  supabase: SupabaseClient,
  submissionId: string,
  data: DemoEmailData
): Promise<IntakeEmailResult> {
  const ownerEmail = process.env.OWNER_EMAIL?.trim() || ''
  const fromEmail = process.env.FROM_EMAIL?.trim() || ''
  const apiKey = process.env.RESEND_API_KEY?.trim() || ''
  const subject = ownerEmailSubject(data)

  if (!ownerEmail || !fromEmail || !apiKey) {
    await recordIntakeEmailFailure({
      supabase,
      submissionId,
      source: 'demo_request',
      emailType: 'owner_notification',
      recipient: ownerEmail || 'unconfigured-owner@invalid.local',
      subject,
      reason: 'OWNER_EMAIL, FROM_EMAIL, or RESEND_API_KEY is not configured',
    })
    return { status: 'failed', reason: 'delivery configuration unavailable' }
  }

  return sendTrackedIntakeEmail({
    supabase,
    resend: new Resend(apiKey),
    submissionId,
    source: 'demo_request',
    emailType: 'owner_notification',
    recipient: ownerEmail,
    subject,
    payload: {
      from: fromEmail,
      to: ownerEmail,
      replyTo: data.email,
      subject,
      html: ownerEmailHtml(data),
    },
  })
}

async function trackedCustomerEmail(
  supabase: SupabaseClient,
  submissionId: string,
  data: DemoEmailData
): Promise<IntakeEmailResult> {
  const fromEmail = process.env.FROM_EMAIL?.trim() || ''
  const apiKey = process.env.RESEND_API_KEY?.trim() || ''

  if (!fromEmail || !apiKey) {
    await recordIntakeEmailFailure({
      supabase,
      submissionId,
      source: 'demo_request',
      emailType: 'customer_confirmation',
      recipient: data.email,
      subject: CUSTOMER_EMAIL_SUBJECT,
      reason: 'FROM_EMAIL or RESEND_API_KEY is not configured',
    })
    return { status: 'failed', reason: 'delivery configuration unavailable' }
  }

  return sendTrackedIntakeEmail({
    supabase,
    resend: new Resend(apiKey),
    submissionId,
    source: 'demo_request',
    emailType: 'customer_confirmation',
    recipient: data.email,
    subject: CUSTOMER_EMAIL_SUBJECT,
    payload: {
      from: fromEmail,
      to: data.email,
      subject: CUSTOMER_EMAIL_SUBJECT,
      html: customerEmailHtml(data),
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
    const contactName = boundedText(body.contactName, 100)
    const businessName = boundedText(body.businessName, 200)
    const email = normalizeEmail(body.email)
    const phone = normalizePhone(body.phone)
    const industry = boundedText(body.industry, 100)
    const employees = boundedText(body.employees, 50)
    const message = boundedText(body.message, 2_000)
    const consent = body.consent === true || body.consent === 'true'

    if (!contactName || !businessName || !email || !phone) {
      throw new IntakeRequestError(400, 'Name, business, email, and phone are required.')
    }
    if (!isValidEmail(email)) {
      throw new IntakeRequestError(400, 'Please enter a valid email address.')
    }
    if (!isValidPhone(phone)) {
      throw new IntakeRequestError(400, 'Please enter a valid phone number.')
    }

    const notes = [employees && `Team size: ${employees}`, message]
      .filter(Boolean)
      .join('\n\n') || null
    const supabase = getSupabase()
    const ownerId = getOwnerId()

    const { data: existing, error: lookupError } = await supabase
      .from('demo_requests')
      .select('id, name, business_name, email, phone, industry, notes, sms_consent')
      .eq('id', submissionId)
      .maybeSingle()

    if (lookupError) {
      console.error('[demo] request_lookup: FAIL —', safeErrorMessage(lookupError))
      throw new IntakeRequestError(503, 'We could not save your request. Please try again.')
    }

    let duplicate = false
    if (existing) {
      duplicate = true
      if (!sameDemoRequest(existing as Record<string, unknown>, {
        name: contactName,
        businessName,
        email,
        phone,
        industry,
        notes,
        consent,
      })) {
        throw new IntakeRequestError(
          409,
          'This submission identifier was already used. Please refresh and try again.'
        )
      }
    } else {
      const { count, error: rateError } = await supabase
        .from('demo_requests')
        .select('id', { count: 'exact', head: true })
        .eq('email', email)
        .is('deleted_at', null)
        .gte('created_at', rateLimitWindowStart())

      if (rateError) {
        console.error('[demo] rate_limit_query: FAIL —', safeErrorMessage(rateError))
        throw new IntakeRequestError(503, 'We could not save your request. Please try again.')
      }
      if ((count ?? 0) >= 3) {
        throw new IntakeRequestError(
          429,
          'We already received several recent requests from this email. Please try again later.'
        )
      }

      const now = new Date().toISOString()
      const { error: insertError } = await supabase.from('demo_requests').insert({
        id: submissionId,
        name: contactName,
        business_name: businessName,
        email,
        phone,
        industry: industry || null,
        notes,
        sms_consent: consent,
        sms_consent_method: consent ? SMS_CONSENT_METHOD : null,
        sms_consent_text: SMS_CONSENT_TEXT,
        sms_consent_at: consent ? now : null,
        sms_consent_ip: consent ? requestIp(request) : null,
        sms_consent_user_agent: consent
          ? boundedText(request.headers.get('user-agent'), 500) || 'unknown'
          : null,
      })

      if (insertError) {
        console.error('[demo] request_insert: FAIL —', safeErrorMessage(insertError))
        throw new IntakeRequestError(503, 'We could not save your request. Please try again.')
      }
    }

    let crm: 'created' | 'existing'
    try {
      crm = await syncCrmLead(supabase, ownerId, submissionId, {
        contactName,
        email,
        phone,
        businessName,
        industry,
        notes,
      })
    } catch (error) {
      if (error instanceof IntakeRequestError) throw error
      console.error('[demo] crm_sync: FAIL —', safeErrorMessage(error))
      throw new IntakeRequestError(
        503,
        'Your request was saved, but processing is incomplete. Please submit again.'
      )
    }

    const data: DemoEmailData = {
      contactName,
      businessName,
      email,
      phone,
      industry,
      employees,
      message,
      smsConsent: consent,
    }

    let calendar: CalendarResult
    try {
      calendar = await createDemoCalendarEvent({ ...data, submissionId })
    } catch (error) {
      calendar = { status: 'failed', reason: safeErrorMessage(error) }
    }

    const [ownerNotification, customerConfirmation] = await Promise.all([
      trackedOwnerEmail(supabase, submissionId, data),
      trackedCustomerEmail(supabase, submissionId, data),
    ])

    console.info('[demo] request_complete', {
      submissionId,
      duplicate,
      crm,
      calendar: calendar.status,
      ownerNotification: ownerNotification.status,
      customerConfirmation: customerConfirmation.status,
    })

    return json({
      ok: true,
      submissionId,
      duplicate,
      crm,
      calendar: calendar.status,
      ownerNotification: ownerNotification.status,
      customerConfirmation: customerConfirmation.status,
    })
  } catch (error) {
    if (error instanceof IntakeRequestError) {
      console.warn('[demo] request_rejected', {
        status: error.status,
        reason: safeErrorMessage(error),
      })
      return json({ error: error.publicMessage }, error.status)
    }

    console.error('[demo] request_failed —', safeErrorMessage(error))
    return json({ error: 'Service unavailable. Please try again later.' }, 503)
  }
}
