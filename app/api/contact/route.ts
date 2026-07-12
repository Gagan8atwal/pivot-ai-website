import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from "@supabase/supabase-js"

// Single-tenant fallback — safe to inline as it's a non-secret UUID
const OWNER_ID_FALLBACK = '3fbf8a9e-0185-4445-868b-2b93258080cb'

function trim(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function splitName(fullName: string): [string, string | null] {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return [parts[0], null]
  return [parts[0], parts.slice(1).join(' ')]
}

function getCrmSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  const ownerId = process.env.DASHBOARD_OWNER_ID ?? OWNER_ID_FALLBACK
  return { client: createClient(url, key, { auth: { persistSession: false } }), ownerId }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { company_website } = body

    // Honeypot — return success silently so bots don't learn the trap
    if (company_website && String(company_website).trim() !== '') {
      return NextResponse.json({ success: true })
    }

    const name = trim(body.name, 100)
    const email = trim(body.email, 254)
    const subject = trim(body.subject, 200)
    const message = trim(body.message, 5000)

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('[contact] RESEND_API_KEY not set')
      return NextResponse.json({ error: 'Service unavailable. Please try again later.' }, { status: 500 })
    }

    const ownerEmail = process.env.OWNER_EMAIL
    const fromEmail = process.env.FROM_EMAIL
    if (!ownerEmail || !fromEmail) {
      console.error('[contact] OWNER_EMAIL or FROM_EMAIL not set')
      return NextResponse.json({ error: 'Service unavailable. Please try again later.' }, { status: 500 })
    }

    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: ownerEmail,
      replyTo: email,
      subject: `New Contact Message: ${subject || 'No Subject'}`,
      text: [
        'New Contact Message from Pivot AI Website',
        '',
        `Name:    ${name}`,
        `Email:   ${email}`,
        `Subject: ${subject || 'No Subject'}`,
        '',
        'Message:',
        message,
      ].join('\n'),
    })

    if (error) {
      console.error('[contact] resend error:', error)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Best-effort CRM lead insert — never breaks the email response
    try {
      const crm = getCrmSupabase()
      if (crm) {
        const [firstName, lastName] = splitName(name)
        const { error: crmErr } = await crm.client.from('crm_leads').insert({
          user_id:    crm.ownerId,
          source:     'contact_form',
          first_name: firstName,
          last_name:  lastName,
          email,
          message:    [subject && `Subject: ${subject}`, message].filter(Boolean).join('\n\n') || null,
        })
        if (crmErr) {
          console.error('[contact] crm_lead_insert: FAIL —', crmErr.message)
        } else {
          console.info('[contact] crm_lead_insert: PASS')
        }
      } else {
        console.warn('[contact] crm_lead_insert: SKIPPED — SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set')
      }
    } catch (crmEx) {
      console.error('[contact] crm_lead_insert: FAIL (exception) —', (crmEx as Error).message)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[contact] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
