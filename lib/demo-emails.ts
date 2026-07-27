/**
 * lib/demo-emails.ts — branded HTML email templates for the demo workflow.
 * All user-supplied values are HTML-escaped before interpolation.
 */

import { SMS_CONSENT_PREFIX } from '@/lib/intake'

const SITE = 'https://pivotcalls.co'
const LOGO_WHITE = `${SITE}/logo/pivot-ai-logo-white.png`

const NAVY = '#0E1B2C'
const AMBER = '#F59E0B'
const SLATE = '#334155'
const MUTED = '#64748B'
const BORDER = '#E2E8F0'
const BG = '#F8FAFC'

export interface DemoEmailData {
  contactName: string
  businessName: string
  email: string
  phone: string
  industry: string
  employees: string
  message: string
  smsConsent: boolean
}

export function escapeHtml(value: string): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function shell(previewText: string, innerHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light only" />
<title>Pivot AI</title>
</head>
<body style="margin:0;padding:0;background:${BG};">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(previewText)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:24px 0;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid ${BORDER};border-radius:16px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif;">
      <tr>
        <td style="background:${NAVY};padding:24px 32px;">
          <img src="${LOGO_WHITE}" alt="Pivot AI" height="28" style="height:28px;display:block;border:0;" />
        </td>
      </tr>
      <tr><td style="height:4px;background:${AMBER};font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="padding:32px;">${innerHtml}</td></tr>
      <tr>
        <td style="padding:20px 32px;background:${BG};border-top:1px solid ${BORDER};">
          <p style="margin:0;font-size:12px;line-height:1.6;color:${MUTED};">
            Pivot AI — AI receptionist software for local service businesses.<br />
            <a href="${SITE}" style="color:${MUTED};text-decoration:underline;">pivotcalls.co</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 16px 8px 0;color:${MUTED};font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:8px 0;color:${SLATE};font-size:14px;vertical-align:top;">${escapeHtml(value || '—')}</td>
  </tr>`
}

export function ownerEmailSubject(data: DemoEmailData): string {
  return `New Pivot AI Demo Request — ${data.businessName || data.contactName}`
}

export function ownerEmailHtml(data: DemoEmailData): string {
  const inner = `
    <h1 style="margin:0 0 4px;font-size:22px;line-height:1.3;color:${NAVY};font-weight:700;">New demo request</h1>
    <p style="margin:0 0 24px;font-size:14px;color:${MUTED};">A new acquisition request was saved from pivotcalls.co.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
      ${detailRow('Name', data.contactName)}
      ${detailRow('Business', data.businessName)}
      ${detailRow('Email', data.email)}
      ${detailRow('Phone', data.phone)}
      ${detailRow('Industry', data.industry)}
      ${detailRow('Team size', data.employees)}
      ${detailRow('Message', data.message)}
      ${detailRow('SMS consent', data.smsConsent ? 'Yes — web form' : 'No')}
    </table>
    <div style="margin-top:24px;padding:16px;background:${BG};border:1px solid ${BORDER};border-radius:12px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${NAVY};">Next steps</p>
      <p style="margin:0;font-size:13px;line-height:1.6;color:${SLATE};">
        1. Review the business and contact details.<br />
        2. Contact ${escapeHtml(data.phone || data.email || 'the lead')} to confirm fit and arrange a real demo time.<br />
        3. Check the acquisition record for Calendar and delivery status before relying on provider side effects.
      </p>
    </div>`
  return shell(`New demo request from ${data.businessName || data.contactName}`, inner)
}

export const CUSTOMER_EMAIL_SUBJECT = 'Your Pivot AI Demo Request Was Received'

export function customerEmailHtml(data: DemoEmailData): string {
  const firstName = (data.contactName || '').trim().split(/\s+/)[0] || 'there'
  const smsNote = data.smsConsent
    ? `<p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:${MUTED};">
         ${escapeHtml(SMS_CONSENT_PREFIX)}
       </p>`
    : ''
  const inner = `
    <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:${NAVY};font-weight:700;">Thanks, ${escapeHtml(firstName)} — we received your request</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${SLATE};">
      Your request for a Pivot AI demonstration${data.businessName ? ` for <strong>${escapeHtml(data.businessName)}</strong>` : ''} has been saved.
      Our founding team will review the use case and contact details before arranging a walkthrough.
    </p>
    <div style="margin:0 0 20px;padding:16px;background:${BG};border:1px solid ${BORDER};border-radius:12px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${NAVY};">What happens next</p>
      <p style="margin:0;font-size:13px;line-height:1.7;color:${SLATE};">
        • We review the requested call flow, business requirements, and fit.<br />
        • We contact you at <strong>${escapeHtml(data.phone || data.email)}</strong> to arrange a demonstration.<br />
        • Setup, integrations, pricing, and any pilot terms are confirmed separately.<br />
        • This form submission does not activate service or start billing.
      </p>
    </div>
    <p style="margin:0;font-size:14px;line-height:1.6;color:${SLATE};">
      Questions in the meantime? Reply to this email or visit
      <a href="${SITE}/contact" style="color:${NAVY};text-decoration:underline;">pivotcalls.co/contact</a>.
    </p>
    ${smsNote}`
  return shell('We received your Pivot AI demo request', inner)
}
