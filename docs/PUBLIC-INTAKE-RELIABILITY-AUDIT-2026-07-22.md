# Pivot AI Public Intake Reliability Audit — July 22, 2026

## Status

**Review branch only. No production deployment, database migration, record cleanup, provider configuration, or live form submission was performed.**

Repository: `Gagan8atwal/pivot-ai-website`  
Branch: `fix/intake-reliability-20260722`  
Base: `main` at `01f066e46808318317c59a6265928be8a242362c`

## Scope

This audit covers the public acquisition paths:

- `POST /api/contact`;
- `POST /api/demo`;
- the `/contact` form;
- the `/demo` form;
- persistence into `crm_leads` and `demo_requests`;
- Google Calendar placeholder creation;
- owner and customer email delivery;
- SMS-consent evidence.

It does not change customer receptionist tenants, calls, bookings, billing, subscription state, backend voice behavior, or the workstation G3 branch.

## Production evidence observed before remediation

Read-only database inspection found:

- 11 non-deleted historical `demo_requests` rows;
- one normalized-email duplicate group representing nine extra rows;
- two normalized-phone duplicate groups representing seven extra rows;
- zero current `crm_leads` rows;
- no uniqueness or idempotency constraint beyond the primary keys on `demo_requests.id` and `crm_leads.id`.

The historical duplicates prove that repeat submissions were capable of creating repeated acquisition records. They are not cleaned up by this PR.

The `crm_leads` count does **not** prove that the current CRM handoff is failing. The code that added the handoff was committed on July 12, 2026, and there are no `demo_requests` rows after that implementation timestamp. The production handoff therefore remains unverified rather than certified broken.

Runtime-log retention contained no recent contact or demo traffic, so it could not provide a current successful end-to-end sample.

## Confirmed design defects

### Contact persistence depended on email success

The contact route sent the owner email first and only attempted to create the CRM lead after Resend succeeded. A provider or configuration failure could therefore prevent the request from entering the operational system.

### Demo side effects had no shared idempotency identity

A demo submission independently created:

- a `demo_requests` row;
- a `crm_leads` row;
- a Calendar event;
- an owner email;
- a customer confirmation email.

The operations had no shared durable request key. Retrying after a partial failure could duplicate records or provider side effects.

### Delivery failures were log-only

Calendar and email failures were written to runtime logs but did not produce a durable, request-linked recovery record for the acquisition workflow.

### Consent evidence could overstate the user action

The server recorded consent time, IP, and user agent even when the optional SMS checkbox was not selected. The consent sentence in the API was also maintained separately from the visible form text.

### Public copy overstated the immediate outcome

The demo and contact surfaces described a 14-day free trial, full setup, no billing, and a confirmation email as automatic consequences of submitting the public form. The current commercial process is a founder-reviewed pilot request, not self-service activation.

## Remediation implemented on the branch

### Stable client-generated request identity

Each form creates one cryptographically random UUID and one form-start timestamp. The same values remain attached to browser retries.

The UUID becomes:

- `crm_leads.id` for contact submissions;
- both `demo_requests.id` and `crm_leads.id` for demo submissions;
- the seed for deterministic `email_events.id` values;
- the seed for the Google Calendar event ID;
- part of the Resend idempotency key.

A reused ID with different payload data is rejected with `409` rather than silently overwriting the first request.

### Persist before notify

Contact submissions now persist the CRM lead before owner notification.

Demo submissions now persist the demo request, then reconcile the corresponding CRM lead before Calendar or email delivery. A CRM handoff failure returns a retryable response while preserving the first demo row; the same browser request can heal the partial state without inserting another demo request.

### Durable email delivery ledger

Owner and customer email attempts are recorded in the existing `email_events` table. The ledger stores:

- a deterministic event UUID;
- request/source recovery marker;
- recipient and subject;
- attempt number;
- sent or failed state;
- provider ID when available;
- sanitized failure reason.

An already-sent event is not sent again. Failed or interrupted delivery can be retried with the same form UUID.

### Provider idempotency

Resend calls use a deterministic idempotency key derived from source, email purpose, and submission UUID.

Calendar events use a deterministic custom event ID. A duplicate-event conflict is treated as an already-created success, preventing retry-created placeholders.

### Abuse and input controls

Both routes now enforce:

- same-origin/cross-site request checks;
- JSON content type;
- a 20 KB body limit based on actual bytes;
- a honeypot;
- a minimum form-completion interval;
- a 24-hour form identity lifetime;
- UUID validation;
- finite field limits and control-character rejection;
- normalized email and practical phone validation;
- a maximum of three matching submissions in 15 minutes;
- no-store responses;
- stable public errors and sanitized server logs.

These controls reduce ordinary automated abuse. They are not a substitute for a managed edge rate limiter or challenge system if attack volume becomes material.

### Accurate consent evidence

One shared versioned SMS-consent contract is rendered by the form and stored by the API.

When the optional checkbox is false:

- `sms_consent` is false;
- consent method, timestamp, IP, and user-agent evidence are null.

When it is true, those fields record the affirmative web-form action and the exact versioned sentence shown.

### Accurate public outcome

The public pages now state that:

- the form is a founder-reviewed demo or pilot request;
- submission does not create an account, activate service, or start billing;
- setup, integration, pricing, testing, and pilot terms are confirmed later;
- confirmation-email delivery is not promised as proof that the request was saved.

## Automated verification

`scripts/intake.test.mjs` checks:

- UUID generation and validation;
- email, phone, name, and request-limit helpers;
- the exact versioned consent contract;
- conditional affirmative-consent evidence;
- stable browser submission metadata;
- database use of the request UUID;
- tracked email delivery and Resend idempotency wiring;
- deterministic Calendar event IDs and duplicate-conflict handling;
- cross-site, body-size, timing, and expiry controls;
- removal of automatic trial and billing promises.

The dedicated `Public Intake Reliability` GitHub workflow runs the complete repository tests, lint, and production build on Node.js 24.

## Required preview and pre-merge gates

1. GitHub regression tests, lint, and production build pass at the final head.
2. Vercel preview build reaches `READY` at the final executable head.
3. `/contact` and `/demo` render correctly on desktop and mobile preview.
4. Consent text visible in the DOM matches `SMS_CONSENT_TEXT` after link text is flattened.
5. Cross-site and invalid-content requests are rejected.
6. Too-fast, expired, malformed-UUID, oversized, invalid-email, and invalid-phone requests return controlled errors.
7. An approved test submission is performed only after founder authorization because it creates acquisition records and provider side effects.
8. That test proves one request UUID produces exactly:
   - one intended source record;
   - one CRM record;
   - at most one Calendar placeholder;
   - one owner-notification ledger row;
   - one customer-confirmation ledger row for a demo.
9. Replaying the identical request UUID leaves database and provider counts unchanged while returning an idempotent result.
10. Reusing the UUID with changed contact data returns `409`.
11. A controlled Resend failure records `failed`; a retry changes the same ledger row to `sent` without duplicating the source record.
12. A false SMS checkbox stores no affirmative timestamp, IP, user agent, or method.
13. A true SMS checkbox stores the exact versioned consent text and affirmative evidence.
14. Founder approval is obtained before merge or production promotion.

## Production follow-up requiring explicit approval

- Decide whether the historical duplicate demo records should be retained, soft-deleted, or consolidated. No cleanup should occur without reviewing the individual records and audit implications.
- Decide whether to add database-level normalized-email/phone deduplication or a dedicated intake-attempt table after the code-only path has been proven in preview.
- Decide whether managed Vercel Firewall/rate-limiting controls are required based on observed attack volume and plan capabilities.
- Establish an operational view or alert for failed `email_events` carrying `submission:contact_form:*` or `submission:demo_request:*` recovery markers.

## Rollback

Before production promotion:

- retain the current production deployment;
- record the final executable commit and environment targets;
- do not modify or delete historical acquisition rows;
- do not weaken RLS or expose service-role credentials to compensate for an application error.

If the new path fails after an approved deployment:

1. restore the previous Vercel production deployment;
2. preserve all rows created by the new path for reconciliation;
3. identify the affected submission UUIDs through CRM/demo IDs and email recovery markers;
4. reconcile partial Calendar/email effects before retrying;
5. correct the reviewed branch and rerun the complete idempotency test matrix.
