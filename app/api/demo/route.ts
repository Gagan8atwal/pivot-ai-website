/**
 * POST /api/demo
 *
 * Flow (lead-save is the source of truth; everything after it is best-effort
 * and must NOT break the submission):
 *   1. Parse JSON body
 *   2. Honeypot check (company_website)
 *   3. Validate required fields + consent
 *   4. Sanitize / trim all strings
 *   5. INSERT into demo_requests via service-role key
 *      → DB failure  : log + return 500 (never fake success)
 *   6. Google Calendar event (best-effort, structured result, never throws)
 *   7. Owner notification email (branded, best-effort)
 *   8. Customer confirmation email (branded, best-effort, only if email given)
 *   9. Return 200 { ok: true }
 *
 * Security:
 *   - SUPABASE_SERVICE_ROLE_KEY / GOOGLE_* / RESEND_API_KEY are server-only here.
 *   - Never imported by any 'use client' file.
 *   - No secrets are logged; only safe error messages are returned to the UI.
 */

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextResponse } from "next/server";
import { createDemoCalendarEvent, type CalendarResult } from "@/lib/google-calendar";
import {
  ownerEmailHtml,
  ownerEmailSubject,
  customerEmailHtml,
  CUSTOMER_EMAIL_SUBJECT,
  type DemoEmailData,
} from "@/lib/demo-emails";

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
    console.error("[demo] parse_body: FAIL — invalid JSON");
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  console.info("[demo] submission_received");

  // ── 2. Honeypot ────────────────────────────────────────────────────────────
  if (body.company_website && String(body.company_website).trim() !== "") {
    console.info("[demo] honeypot: triggered — discarding silently");
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
    console.warn("[demo] validation: FAIL — contactName missing");
    return NextResponse.json({ error: "Your name is required." }, { status: 400 });
  }
  if (!phone || phone.length < 5) {
    console.warn("[demo] validation: FAIL — phone missing/short");
    return NextResponse.json(
      { error: "A valid phone number is required." },
      { status: 400 }
    );
  }
  if (!consent) {
    console.warn("[demo] validation: FAIL — consent not given");
    return NextResponse.json(
      { error: "You must agree to receive communications." },
      { status: 400 }
    );
  }
  if (email && !isValidEmail(email)) {
    console.warn("[demo] validation: FAIL — invalid email format");
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  console.info("[demo] validation: PASS");

  // ── 4. Build notes (employees + message → single notes field) ─────────────
  const notesParts: string[] = [];
  if (employees) notesParts.push(`Team size: ${employees}`);
  if (message) notesParts.push(message);
  const notes = notesParts.join("\n\n") || null;

  // ── 5. Supabase insert (source of truth — 500 on failure) ─────────────────
  let supabase;
  try {
    supabase = getSupabase();
  } catch (err) {
    console.error("[demo] supabase_init: FAIL —", (err as Error).message);
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
    console.error("[demo] supabase_insert: FAIL —", {
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

  console.info("[demo] supabase_insert: PASS");

  // Shared payload for calendar + emails.
  const data: DemoEmailData = {
    contactName,
    businessName,
    email,
    phone,
    industry,
    employees,
    message,
    smsConsent: true,
  };

  // ── 6. Google Calendar (best-effort, structured, never throws) ────────────
  let calendar: CalendarResult;
  try {
    calendar = await createDemoCalendarEvent({ ...data });
  } catch (err) {
    // Defensive: helper is designed not to throw, but never let it break the form.
    calendar = { status: "failed", reason: (err as Error)?.message || "unexpected error" };
  }
  if (calendar.status === "created") {
    console.info("[demo] calendar_create: PASS — eventId=%s", calendar.eventId);
  } else if (calendar.status === "skipped") {
    console.warn("[demo] calendar_create: SKIPPED — %s", calendar.reason);
  } else {
    console.error("[demo] calendar_create: FAIL — %s", calendar.reason);
  }

  // ── 7. Owner notification email (best-effort) ─────────────────────────────
  const ownerEmail = process.env.OWNER_EMAIL;
  const fromEmail = process.env.FROM_EMAIL;
  if (!ownerEmail || !fromEmail) {
    console.warn("[demo] owner_email: SKIPPED — OWNER_EMAIL or FROM_EMAIL not set");
  } else {
    try {
      const resend = getResend();
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: ownerEmail,
        replyTo: email || undefined,
        subject: ownerEmailSubject(data),
        html: ownerEmailHtml(data),
      });
      if (error) {
        console.error("[demo] owner_email: FAIL —", error.message ?? String(error));
      } else {
        console.info("[demo] owner_email: PASS");
      }
    } catch (err) {
      console.error("[demo] owner_email: FAIL —", (err as Error).message);
    }
  }

  // ── 8. Customer confirmation email (best-effort, only if email provided) ──
  if (!email) {
    console.info("[demo] customer_email: SKIPPED — no customer email provided");
  } else if (!fromEmail) {
    console.warn("[demo] customer_email: SKIPPED — FROM_EMAIL not set");
  } else {
    try {
      const resend = getResend();
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: CUSTOMER_EMAIL_SUBJECT,
        html: customerEmailHtml(data),
      });
      if (error) {
        console.error("[demo] customer_email: FAIL —", error.message ?? String(error));
      } else {
        console.info("[demo] customer_email: PASS");
      }
    } catch (err) {
      console.error("[demo] customer_email: FAIL —", (err as Error).message);
    }
  }

  // ── 9. Done ────────────────────────────────────────────────────────────────
  console.info("[demo] request_complete — returning 200");
  return NextResponse.json({ ok: true });
}
