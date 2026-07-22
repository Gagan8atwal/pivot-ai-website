# Pivot AI Public Claims Evidence Matrix — July 22, 2026

## Purpose

This document controls what Pivot AI may present as production-working while the backend post-RC program remains ahead of production and Release G/H is incomplete.

It is an evidence and release-control document, not legal approval. Public copy, Terms, Privacy, pricing, billing and production deployment remain separate approval decisions.

## Classification rules

| Classification | Meaning |
|---|---|
| Production-working | Served behavior has current production evidence across the required end-to-end journey. |
| Limited pilot | Capability exists in some form but requires founder setup, controlled tenants, manual intervention or explicit limitations. |
| Demonstration only | UI, copy or a preview illustrates intended behavior without verified production execution. |
| Post-RC / not deployed | Implemented or partially implemented after the production release, but required code or migrations are not live. |
| Planned / unsupported | No adequate implementation or production evidence was found. |
| Unknown | The cloud audit could not obtain the provider, real-call, account or authenticated evidence required. |

## Current release context

- Marketing production serves website `main` at `01f066e`.
- Backend production remains behind the post-RC program.
- Production Supabase migration head is `20260721000001`.
- Post-RC migrations `20260721000002` through `20260721000011` are not applied.
- G1 and G2 are pushed; G3 may exist only as uncommitted workstation work.
- Website import PR #11 is preview-only and intentionally held.
- Real voice behavior, provider configuration and full authenticated journeys have not been certified by this document.

## Acquisition and onboarding claims

| Public claim or implication | Current classification | Current evidence | Required evidence before stronger wording | Owner |
|---|---|---|---|---|
| Founder-led early access | Production-working | Homepage labels the program as founder-led early access; demo form states founder review. | Continue matching actual intake and response process. | Founder / Product |
| “Get a Free Demo” | Production-working as lead intake | `/demo` is a request form; no charge is initiated by opening it. | Verify form delivery, owner notification, response SLA and consent handling. | Growth / Operations |
| No credit card required for requesting a demo | Production-working | Demo request does not invoke verified checkout. | Automated test proving no Stripe session or subscription is created. | Product / Billing |
| “Start Free Trial” / 14-day no-card trial | Unsupported in current production | Existing pricing and FAQ copy previously promised a trial, while CTAs routed to `/demo`. | Implement and test trial lifecycle, activation, expiration, cancellation and billing, or remove the claim. PR #14 removes the mismatch in preview. | Product / Billing / Legal |
| Website-to-live receptionist onboarding | Post-RC / not deployed | Website import PR #11 exists as a held preview; production has zero assistant import jobs and zero activated onboarding records. | Full URL import, review, approval, apply, rollback, number provisioning and real-call journey in isolated staging and production pilot. | Product / Engineering |
| Setup is simple and requires no technical knowledge | Limited pilot | Founder-assisted configuration exists as an intended workflow. | Timed pilot evidence, failure recovery, required owner steps and support burden measurement. | Product / Customer Success |
| Existing phone number works with no porting | Unknown / provider-dependent | Copy states Twilio routing; Twilio production readiness and live routing were not verified in this audit. | Verified carrier/number routing matrix, forwarding instructions, failure behavior and real calls. | Telephony / Operations |

## Call handling and voice claims

| Public claim or implication | Current classification | Current evidence | Required evidence before stronger wording | Owner |
|---|---|---|---|---|
| Answers calls 24/7 | Limited pilot / unknown reliability | Production call records exist, but 11 of 21 are failed and one is stale `in_progress`. | Real-call success-rate window, after-hours tests, provider outage handling, monitoring and stale-call reconciliation. | Voice / Reliability |
| Answers every call | Misleading / unsupported absolute | Production includes failed calls; tests do not prove provider or network availability. | Replace absolute wording or provide defined SLO with measured exclusions and incident evidence. | Product / Legal / Reliability |
| Natural, warm, human-like voice | Unknown | Repository evaluations and prior tests do not prove subjective real-call quality. | Blind listening rubric, latency/interruption tests, diverse caller tests and provider configuration evidence. | Voice QA |
| Most callers assume a human receptionist | Unsupported | No caller study or measured evidence was found. | Controlled study with disclosure/compliance review and documented sample. | Product Research / Legal |
| Correct business identity and pronunciation | Post-RC / not deployed | G1 identity and G2 pronunciation controls are pushed; production remains older. | Migration/deploy, tenant-isolation tests and real-call validation for names, acronyms, letters and edge cases. | Voice / Release |
| Custom greeting, tone and fallback phrases | Post-RC / incomplete | G1/G2 pushed; G3 bounded tone work may be local-only. | Preserve and finish G3; verify UI, assistant read/write, approval, audit, undo and real calls. | Voice / Product |
| Custom AI voice | Unknown / owner-dependent | Public Premium plan advertises it; ElevenLabs privacy/provider configuration remains owner-controlled and unresolved. | Approved provider settings, retention/privacy review, voice selection workflow and real-call evidence. | Founder / Voice / Privacy |
| English-language production handling | Limited pilot | Product is intentionally English-focused; real-call quality is not fully certified. | Accent, spelling, noisy-line, interruption, consent and escalation test suite. | Voice QA |
| Spanish or additional languages | Planned | Website says additional languages are on the roadmap. | Native-quality voice and comprehension evaluation before availability claims. | Product / Voice |

## Lead, appointment and communication claims

| Public claim or implication | Current classification | Current evidence | Required evidence before stronger wording | Owner |
|---|---|---|---|---|
| Every caller becomes a lead | Misleading absolute | Production has call and lead records, but failed calls and incomplete capture paths exist. | Defined eligible-call criteria, capture success metrics, failure states and reconciliation. | Product / Operations |
| Name, phone, email, request and intent recorded on every call | Unsupported absolute | Data fields exist, but no complete-call coverage proof was found. | Field-level completeness report over successful calls plus consent/privacy treatment. | Product / Privacy / QA |
| Appointment booking automatically creates confirmed appointments | Limited pilot / production evidence insufficient | Appointment records exist; two remain `new`; post-RC G5 is incomplete. | Availability checks, conflict prevention, confirmation state machine, cancellation/reschedule and calendar verification. | Booking / Product |
| Google Calendar sync with no double bookings | Unsupported absolute | Calendar integration work exists historically, but current production end-to-end evidence is absent. | Concurrent booking tests, idempotency, timezone/DST, token refresh, outage and rollback evidence. | Integrations / Reliability |
| Instant SMS alerts for every lead and booking | Unknown / provider-dependent | SMS behavior and Twilio/A2P readiness were not verified; legal consent controls are not certified. | Consent, A2P, STOP/HELP, delivery receipts, retries, opt-out and failure evidence. | Messaging / Legal |
| Email confirmations after every interaction | Limited pilot | Production has six email events: five sent and one failed. | Retry/dead-letter behavior, template coverage, deliverability and reconciliation for the failed event. | Notifications / Operations |
| Missed callers are texted back within seconds | Unknown / unverified | Public feature claim exists; current production missed-call recovery timing was not verified. | End-to-end timing distribution, consent/legal review, duplicate suppression, opt-out and outage behavior. | Messaging / Reliability |
| Smart call routing and live transfer | Unknown | Public copy advertises routing/transfer; real production transfer quality was not tested. | Intent/urgency rules, transfer success metrics, fallback numbers, voicemail and provider failure tests. | Telephony / Product |

## Dashboard, CRM and multi-tenant claims

| Public claim or implication | Current classification | Current evidence | Required evidence before stronger wording | Owner |
|---|---|---|---|---|
| One clean dashboard contains every call, lead, booking and transcript | Present but incomplete | `pivot-ai-website` contains receptionist dashboard routes; authenticated production journey was not fully executed. A separate `pivot-ai-dashboard` deploy serves outbound campaigns instead. | Select one canonical customer dashboard, verify all records, permissions, mobile behavior and navigation end to end. | Product / Architecture |
| Multi-tenant support | Post-RC / security-blocked | Business and membership tables exist, but production has an open tenant-provisioning authorization blocker. | Resolve backend #38; cross-tenant negative tests; tenant-safe exports, assistants, jobs and operations. | Security / Platform |
| Multi-location support | Planned / unverified | Public Premium plan advertises it; G6 operational configuration remains incomplete. | Authoritative location model, routing, hours, calendars, numbers, permissions, analytics and isolation tests. | Product / Platform |
| CRM and lead follow-up | Fragmented | Voice production has leads; separate dashboard has `crm_leads` and campaigns with unresolved source-of-truth. | Resolve dashboard issue #1, select authoritative data model and prevent dual writes. | Architecture / Product |
| Customer can update business knowledge at any time | Post-RC / incomplete | Configuration/assistant foundations exist; full G3-G6 UI and lifecycle are unfinished. | Read/propose/approve/apply/undo, audit evidence, validation and production verification. | Product / Assistant |

## Security, privacy and legal claims

| Public claim or implication | Current classification | Current evidence | Required evidence before stronger wording | Owner |
|---|---|---|---|---|
| Industry-standard access controls | Release-blocked | Supabase is healthy, but backend #38 records dangerous function and table privileges. | Reviewed privilege migration, negative authorization tests, advisor rerun and founder-approved production application. | Security / Platform |
| Encryption in transit and at rest | Partially evidenced | HTTPS/HSTS is verified; managed-provider at-rest configuration was not independently audited here. | Provider evidence, key/access policy and data-flow review. | Security / Privacy |
| Regular security reviews | Unsupported as an ongoing claim | One cloud audit identified unresolved blockers; no recurring approved review program was verified. | Defined cadence, scope, owner, findings register and closure evidence. | Security / Management |
| Compliance with relevant data-protection regulations | Unsupported broad legal claim | No jurisdiction-specific compliance assessment or counsel approval was found. | Narrow claim, complete legal review, data map, subprocessors, retention, rights handling and consent controls. | Legal / Privacy |
| Never sells or shares customer data with third parties | Requires precise wording | Privacy policy lists multiple subprocessors; “share” can conflict with provider processing language. | Counsel-approved wording distinguishing sale, marketing sharing and service-provider processing. | Legal / Privacy |
| Recorded verbal SMS consent, STOP and HELP behavior | Unknown / policy promise | Published policy promises it; production controls were not verified. | Real message/call evidence, consent log, opt-out enforcement, suppression and A2P review. | Messaging / Legal |
| Access, correction, export and deletion rights | Unknown / policy promise | Tables and post-RC privacy work exist, but full production lifecycle was not verified. | Request intake, identity verification, tenant-safe export, deletion classification, subprocessors and audit record. | Privacy / Operations |
| Active subscription plus 90-day retention | Unknown / policy promise | Published policy states the period; enforcement job and provider retention were not verified. | Retention inventory, automated enforcement, legal holds, provider settings and deletion evidence. | Privacy / Platform |
| Dashboard cancellation and 14-day trial | Unsupported | No verified customer cancellation/trial production journey. | Stripe lifecycle tests, customer UI, webhooks, proration/refunds policy and legal approval. | Billing / Product / Legal |

## Required copy controls

Until completion evidence exists:

1. Prefer `pilot`, `founder-assisted`, `configurable`, `designed to`, or `can` over absolute guarantees.
2. Avoid `every`, `never`, `no double bookings`, `within seconds`, `most callers`, and broad compliance language.
3. Keep preview-only and post-RC capabilities clearly separated from production availability.
4. Tie plan features to an availability/evidence source rather than using static marketing copy alone.
5. Do not imply self-service activation, trial or checkout when the CTA opens a demo request.
6. Do not represent the separate outbound-campaign dashboard as the canonical receptionist portal.
7. Require Product, Engineering, Security/Privacy and founder review before promoting any row to `Production-working`.

## Release evidence required for promotion

A capability may move to `Production-working` only when the repository contains or links to:

- authoritative source and release SHA;
- migration/deployment evidence where applicable;
- tenant and authorization tests;
- browser/mobile journey;
- real provider or call evidence;
- failure/retry/recovery behavior;
- audit and undo evidence for customer configuration;
- privacy/export/deletion classification;
- monitoring and rollback method;
- named owner and approval record.

## Related controls

- Backend issues #38, #39 and #40
- Website issues #12 and #13
- Website PR #11 — held website-import preview
- Website PR #14 — pilot CTA and trial-copy correction
- Dashboard issue #1 and PR #2
- Backend draft PR #41 — Release G/H control and workstation resume package
