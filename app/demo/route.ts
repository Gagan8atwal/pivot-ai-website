/**
 * POST /api/demo
 *
 * Flow:
 *   1. Parse JSON body
 *   2. Honeypot check (company_website)
 *   3. Validate required fields + consent
 *   4. Sanitize / trim all strings
 *   5. INSERT into demo_requests via service-role key
 *      → DB failure  : log + return 500 (never fake success)
 *   6. Send Resend notification email
 *      → Email failure: log + still return 200 (lead is already saved)
 *   7. Return 200 { ok: true }
 *
 * Security:
 *   - SUPABASE_SERVICE_ROLE_KEY is read server-side only inside this route.
 *   - Never imported by any 'use client' file.
 *   - No secrets are logged.
 */

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextResponse } from "next/server";

// ─── Supabase (service role – bypasses RLS, server-only) ─────────────────────
function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

// ─── Resend ───────────────────────────────────────────────────────────────────
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Missing RESEND_API_KEY");
  return new Resend(key);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function trim(v: unknown, max = 500): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}

// Exact SMS consent text shown on the demo form
const SMS_CONSENT_TEXT =
  "I agree to receive communications from Pivot AI about my demo request, " +
  "including text messages. Message and data rates may apply. Reply STOP to " +
  "opt out at any time. See our Privacy Policy and Terms of Service.";

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  // ── 1. Parse body ──────────────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    console.error("[demo] Failed to parse request body");
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  console.info("[demo] Submission received");

  // ── 2. Honeypot ────────────────────────────────────────────────────────────
  if (body.company_website && String(body.company_website).trim() !== "") {
    console.info("[demo] Honeypot triggered – discarding silently");
    return NextResponse.json({ ok: true });
  }

  // ── 3. Validate ────────────────────────────────────────────────────────────
  const contactName = trim(body.contactName, 100);
  const businessName = trim(body.businessName, 200);
  const email = trim(body.email, 254);
  const phone = trim(body.phone, 20);
  const industry = trim(body.industry, 100);
  const employees = trim(body.employees, 50);
  const message = trim(body.message, 2000);
  const consent = body.consent === true || body.consent === "true";

  if (!contactName) {
    console.warn("[demo] Validation failed: contactName missing");
    return NextResponse.json(
      { error: "Your name is required." },
      { status: 400 }
    );
  }
  if (!phone || phone.length < 5) {
    console.warn("[demo] Validation failed: phone missing");
    return NextResponse.json(
      { error: "A valid phone number is required." },
      { status: 400 }
    );
  }
  if (!consent) {
    console.warn("[demo] Validation failed: consent not given");
    return NextResponse.json(
      { error: "You must agree to receive communications." },
      { status: 400 }
    );
  }
  if (email && !isValidEmail(email)) {
    console.warn("[demo] Validation failed: invalid email format");
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  console.info("[demo] Validation passed");

  // ── 4. Build notes (employees + message → single notes field) ─────────────
  const notesParts: string[] = [];
  if (employees) notesParts.push(`Team size: ${employees}`);
  if (message) notesParts.push(message);
  const notes = notesParts.join("\n\n") || null;

  // ── 5. Supabase insert ─────────────────────────────────────────────────────
  let supabase;
  try {
    supabase = getSupabase();
  } catch (err) {
    console.error("[demo] Supabase client init failed:", (err as Error).message);
    return NextResponse.json(
      { error: "Service configuration error. Please try again later." },
      { status: 500 }
    );
  }

  const ip = getIp(request);
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  const { error: dbError } = await supabase.from("demo_requests").insert({
    name:                   contactName,
    business_name:          businessName || null,
    email:                  email || null,
    phone,
    industry:               industry || null,
    notes,
    sms_consent:            true,
    sms_consent_method:     "web_form",
    sms_consent_text:       SMS_CONSENT_TEXT,
    sms_consent_at:         new Date().toISOString(),
    sms_consent_ip:         ip,
    sms_consent_user_agent: userAgent,
  });

  if (dbError) {
    console.error("[demo] Supabase insert failed:", {
      code:    dbError.code,
      message: dbError.message,
      details: dbError.details,
      hint:    dbError.hint,
    });
    return NextResponse.json(
      { error: "Failed to save your request. Please try again." },
      { status: 500 }
    );
  }

  console.info("[demo] Supabase insert succeeded");

  // ── 6. Resend email (non-blocking – lead already saved) ───────────────────
  try {
    const resend = getResend();
    const ownerEmail = process.env.OWNER_EMAIL;
    const fromEmail  = process.env.FROM_EMAIL;

    if (!ownerEmail || !fromEmail) {
      console.warn("[demo] OWNER_EMAIL or FROM_EMAIL not set – skipping email");
    } else {
      await resend.emails.send({
        from:    fromEmail,
        to:      ownerEmail,
        subject: `New Demo Request – ${businessName || contactName}`,
        html: `
          <h2>New Demo Request</h2>
          <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
            <tr>
              <td style="padding:4px 12px 4px 0;color:#64748b;">Name</td>
              <td style="padding:4px 0;"><strong>${contactName}</strong></td>
            </tr>
            <tr>
              <td style="padding:4px 12px 4px 0;color:#64748b;">Business</td>
              <td style="padding:4px 0;">${businessName || "—"}</td>
            </tr>
            <tr>
              <td style="padding:4px 12px 4px 0;color:#64748b;">Email</td>
              <td style="padding:4px 0;">${email || "—"}</td>
            </tr>
            <tr>
              <td style="padding:4px 12px 4px 0;color:#64748b;">Phone</td>
              <td style="padding:4px 0;">${phone}</td>
            </tr>
            <tr>
              <td style="padding:4px 12px 4px 0;color:#64748b;">Industry</td>
              <td style="padding:4px 0;">${industry || "—"}</td>
            </tr>
            <tr>
              <td style="padding:4px 12px 4px 0;color:#64748b;">Team size</td>
              <td style="padding:4px 0;">${employees || "—"}</td>
            </tr>
            <tr>
              <td style="padding:4px 12px 4px 0;color:#64748b;">Message</td>
              <td style="padding:4px 0;">${message || "—"}</td>
            </tr>
            <tr>
              <td style="padding:4px 12px 4px 0;color:#64748b;">SMS Consent</td>
              <td style="padding:4px 0;">Yes – web_form</td>
            </tr>
          </table>
          <p style="margin-top:16px;font-size:12px;color:#94a3b8;">
            Saved to Supabase demo_requests. IP: ${ip}
          </p>
        `,
      });
      console.info("[demo] Resend email sent successfully");
    }
  } catch (emailErr) {
    console.error("[demo] Resend email failed (lead saved):", {
      message: (emailErr as Error).message,
    });
  }

  // ── 7. Done ────────────────────────────────────────────────────────────────
  console.info("[demo] Request complete – returning 200");
  return NextResponse.json({ ok: true });
}
