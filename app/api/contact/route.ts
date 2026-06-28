import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key')

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, subject, message, company_website } = body

    // Honeypot check
    if (company_website) {
      return NextResponse.json({ error: 'Spam detected' }, { status: 400 })
    }

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: process.env.OWNER_EMAIL || 'hello@pivotai.app',
      subject: `New Contact Message: ${subject || 'No Subject'}`,
      text: `
        New Contact Message from Pivot AI Website
        
        Name: ${name}
        Email: ${email}
        Subject: ${subject || 'No Subject'}
        
        Message:
        ${message}
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('API Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
