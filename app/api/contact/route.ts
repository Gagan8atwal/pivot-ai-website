import { NextResponse } from 'next/server'
import { Resend } from 'resend'

function trim(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
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

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[contact] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
