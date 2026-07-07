/**
 * lib/demo-emails.ts — branded HTML email templates for the demo workflow.
 *
 * Brand tokens mirror brand/BRAND_GUIDE.md:
 *   navy #0E1B2C · navy800 #132C55 · amber #F59E0B · slate #334155 · muted #64748B
 * The header wordmark uses the hosted white logo PNG (public/logo/…).
 *
 * All user-supplied values are HTML-escaped before interpolation.
 */

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

/** Escape HTML so user input can't break layout or inject markup into the email. */
export function escapeHtml(value: string): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Shared responsive shell: navy header w/ logo, white card, muted footer. */
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
            Pivot AI — the 24/7 AI receptionist for local service businesses.<br />
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

// ─── Owner notification ─────────────────────────────────────────────────────
export function ownerEmailSubject(d: DemoEmailData): string {
  return `New Pivot AI Demo Request — ${d.businessName || d.contactName}`
}

export function ownerEmailHtml(d: DemoEmailData): string {
  const inner = `
    <h1 style="margin:0 0 4px;font-size:22px;line-height:1.3;color:${NAVY};font-weight:700;">New demo request</h1>
    <p style="margin:0 0 24px;font-size:14px;color:${MUTED};">A new lead just submitted the demo form on pivotcalls.co.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
      ${detailRow('Name', d.contactName)}
      ${detailRow('Business', d.businessName)}
      ${detailRow('Email', d.email)}
      ${detailRow('Phone', d.phone)}
      ${detailRow('Industry', d.industry)}
      ${detailRow('Team size', d.employees)}
      ${detailRow('Message', d.message)}
      ${detailRow('SMS consent', d.smsConsent ? 'Yes — web form' : 'No')}
    </table>
    <div style="margin-top:24px;padding:16px;background:${BG};border:1px solid ${BORDER};border-radius:12px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${NAVY};">Next steps</p>
      <p style="margin:0;font-size:13px;line-height:1.6;color:${SLATE};">
        1. Call or text ${escapeHtml(d.phone || 'the lead')} within a few hours while interest is warm.<br />
        2. Confirm the demo time (a placeholder was added to your Google Calendar).<br />
        3. Prep an industry-tailored walkthrough${d.industry ? ` for ${escapeHtml(d.industry)}` : ''}.
      </p>
    </div>`
  return shell(`New demo request from ${d.businessName || d.contactName}`, inner)
}

// ─── Customer confirmation ──────────────────────────────────────────────────
export const CUSTOMER_EMAIL_SUBJECT = 'Your Pivot AI Demo Request Was Received'

export function customerEmailHtml(d: DemoEmailData): string {
  const firstName = (d.contactName || '').trim().split(/\s+/)[0] || 'there'
  const smsNote = d.smsConsent
    ? `<p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:${MUTED};">
         You agreed to receive communications from Pivot AI, including text messages, about your demo request.
         Message &amp; data rates may apply. Reply STOP to any text to opt out at any time.
       </p>`
    : ''
  const inner = `
    <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:${NAVY};font-weight:700;">Thanks, ${escapeHtml(firstName)} — we've got your request</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${SLATE};">
      We received your request for a Pivot AI demo${d.businessName ? ` for <strong>${escapeHtml(d.businessName)}</strong>` : ''}.
      A member of our founding team will reach out shortly to schedule a personalized walkthrough.
    </p>
    <div style="margin:0 0 20px;padding:16px;background:${BG};border:1px solid ${BORDER};border-radius:12px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${NAVY};">What happens next</p>
      <p style="margin:0;font-size:13px;line-height:1.7;color:${SLATE};">
        • We'll contact you at <strong>${escapeHtml(d.phone || d.email)}</strong> to pick a time.<br />
        • You'll see Pivot AI answer a real call, tailored to your business.<br />
        • If you move forward, setup is founder-led — no credit card to start your 14-day trial.
      </p>
    </div>
    <p style="margin:0;font-size:14px;line-height:1.6;color:${SLATE};">
      Questions in the meantime? Just reply to this email or visit
      <a href="${SITE}/contact" style="color:${NAVY};text-decoration:underline;">pivotcalls.co/contact</a>.
    </p>
    ${smsNote}`
  return shell('We received your Pivot AI demo request', inner)
}
