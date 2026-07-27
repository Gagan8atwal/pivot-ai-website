# Pivot AI Public Claims Evidence Matrix — July 27, 2026

## Purpose

This document controls what Pivot AI may state publicly while the cumulative backend, website and internal acquisition CRM remain draft release candidates.

It is an evidence and release-control document, not legal approval. Production deployment, Terms, Privacy, billing, provider activation and customer launch remain separate decisions.

## Classification rules

| Classification | Meaning |
|---|---|
| Production-working | Current production behavior has verified end-to-end evidence for the stated scope. |
| Protected candidate | Implemented and repository-certified on an exact candidate, but not merged or promoted to production. |
| Limited pilot | Available only through founder-assisted configuration, selected tenants, manual review or explicit restrictions. |
| Demonstration only | UI or preview illustrates intended behavior without protected end-to-end execution. |
| Provider-dependent | Requires live provider configuration, approval or controlled real-account testing. |
| Planned / unsupported | Adequate implementation or evidence is absent. |
| Unknown | The required authenticated, provider, real-call or production evidence was not obtained. |

## Current release context

### Website candidate

- Cumulative website PR: `#20`.
- Exact executable head: `0dbc7d0d15b5e43432253338958fe10baf070e78`.
- Public Intake Reliability run `30303504080`: passed.
- Public Claims Readiness run `30303504083`: passed.
- Owner Operations Console run `30303504074`: passed.
- Exact Vercel preview deployment `dpl_ESjHRkybNVmEopqwu9wjS64oTCt6`: READY.
- Preview remains protected by Vercel Authentication.

### Backend candidate

- Cumulative backend PR: `#64` in `Gagan8atwal/ai-receptionist-voice`.
- Exact correction head: `2b92c42913b6a1750cd99cb3a395026a81c51ed5`.
- The inherited cumulative base passed repository, migration, dependency and provider-free release gates.
- The 16 production-shaped correction commits remain awaiting an allocated private-repository Actions runner on the exact head.
- Multiple attempts ended before checkout with zero steps and no logs; this is not evidence that repository code executed and failed.

### Internal acquisition CRM

- Cumulative internal-dashboard PR: `#4` in `Gagan8atwal/pivot-ai-dashboard`.
- Executable code head `2bda49162643c81512636222ded6a4e251155379` passed Dashboard Security Verification run `29966078788`.
- Exact current head adds only canonical README/ADR documentation after the verified code.
- This repository is not the customer receptionist dashboard.

## Acquisition and onboarding claims

| Public claim or implication | Classification | Current evidence | Required before stronger wording |
|---|---|---|---|
| Founder-led early access | Protected candidate / limited pilot | Exact website candidate uses founder-assisted pilot language and passes public-claims tests. | Merge/promotion plus actual pilot process matching the copy. |
| Request a pilot demo | Protected candidate | `/demo` is persist-first and does not create an account, activate service, start billing or charge a card. | Controlled approved request/replay test against intended environment. |
| Self-service free trial | Unsupported | No verified trial activation, expiry, cancellation or billing lifecycle. | Implement and verify full trial lifecycle or continue omitting the claim. |
| Website import proposes business information | Protected candidate | `/import` review UI and backend extraction/review implementation exist; exact website tests pass. | Protected website-to-backend browser journey using separate tenant identities. |
| Reviewed import values are automatically live | Prohibited claim | Candidate explicitly distinguishes reviewed, proposed, applied and verified states. | No stronger wording is allowed without separate apply and verification evidence. |
| Website-to-live receptionist in minutes | Planned / unsupported absolute | Import/review and onboarding foundations exist, but phone/provider activation remains separate and unverified. | Full import, approval, apply, phone setup, rollback and real-call pilot journey. |
| Existing number works without porting | Provider-dependent / unknown | Routing choices depend on carrier and approved phone configuration. | Carrier/forwarding matrix and controlled live calls. |

## Call handling and voice claims

| Public claim or implication | Classification | Current evidence | Required before stronger wording |
|---|---|---|---|
| Designed for around-the-clock eligible call coverage | Limited pilot | Voice backend, lifecycle evidence and reconciliation controls exist in the cumulative candidate. | Protected deployment and measured real-call window including after-hours cases. |
| Answers every call | Unsupported absolute | Network, carrier, provider and application failures remain possible. | Do not use; replace with scoped measured SLO wording. |
| Natural conversational virtual assistant | Limited pilot / subjective | Configurable voice pipeline and call behavior exist; subjective quality is not fully certified. | Blind listening, latency, interruption, noisy-line and diverse-caller testing. |
| Correct business identity and spelling | Protected backend candidate | Identity, pronunciation and letter-confirmation controls are present in the backend program. | Protected deployment plus real calls for names, acronyms and spelled input. |
| English call handling | Limited pilot | Current public candidate explicitly focuses production validation on English. | Accent, spelling, interruption, escalation and fallback evidence. |
| Additional languages | Planned | Public candidate no longer presents unverified languages as available. | Native-quality comprehension and voice testing before launch claims. |
| Live transfer | Provider-dependent | Transfer lifecycle and outcome evidence exist in backend candidate. | Controlled live transfer, fallback and destination-unavailable tests. |

## Lead, appointment and notification claims

| Public claim or implication | Classification | Current evidence | Required before stronger wording |
|---|---|---|---|
| Captures available caller details | Limited pilot | Lead capture exists and public copy preserves incomplete states. | Field-completeness and eligible-call capture metrics. |
| Every caller becomes a lead | Unsupported absolute | Failed and incomplete call paths remain possible. | Do not use; define eligibility and measured capture rate. |
| Records appointment requests | Protected candidate | Website uses request/review wording and owner status controls. | Protected website/backend journey with tenant isolation. |
| Automatically creates confirmed bookings | Unsupported | Candidate requires explicit disposition and does not equate capture with confirmation. | Availability, conflict, state-machine and Calendar verification. |
| Google Calendar synchronization | Provider-dependent | Code and compatibility tests exist; real-account protected validation remains a launch gate. | OAuth/token-refresh, timezone, idempotency, outage and rollback testing. |
| SMS notifications | Provider-dependent | Candidate uses conditional messaging and consent wording; Twilio/A2P is not resumed. | A2P, consent, STOP/HELP, receipts, retries and suppression evidence. |
| Email notifications | Limited pilot / protected candidate | Recoverable `email_events` ledger, deterministic IDs and Resend idempotency are implemented. | Controlled delivery failure/recovery and deliverability check. |
| Missed-call response within seconds | Unsupported timing claim | No current production timing distribution supports it. | Measured end-to-end distribution with outage and duplicate-suppression evidence. |

## Customer application, multi-tenancy and operations claims

| Public claim or implication | Classification | Current evidence | Required before stronger wording |
|---|---|---|---|
| Canonical customer dashboard | Protected candidate | `pivot-ai-website` contains customer operations, calls, CRM, appointments, import and settings surfaces. | Authenticated protected preview journeys and production promotion. |
| Separate `pivot-ai-dashboard` is the customer portal | Prohibited claim | ADR classifies it as internal acquisition CRM only. | Architecture reversal requires a replacement ADR and migration plan. |
| Multi-tenant authorization | Protected backend candidate | RLS, role, second-tenant and platform assertions exist in cumulative backend evidence. | Exact correction-head runner plus protected real JWT tests. |
| Tenant-safe owner Operations Health | Protected candidate | Aggregate reconciliation and SLO privacy contracts pass on exact website candidate. | Owner, non-owner and second-tenant browser/API sessions. |
| Customer can apply imported changes safely | Protected candidate | Import review and propose/decide/apply/undo UI contracts exist. | Protected backend integration proving state-change conflicts, verification and undo. |
| Multi-location production support | Planned / unverified | No complete location/routing/calendar/analytics journey is certified. | Authoritative location model and end-to-end isolation. |

## Security, privacy and enterprise claims

| Public claim or implication | Classification | Current evidence | Required before stronger wording |
|---|---|---|---|
| Least-privilege browser database access | Protected backend candidate | Service-only provisioning, structural privilege removal and authenticated acquisition policies are staged and tested in production-shaped fixtures. | Exact-head private runner, isolated rehearsal and approved production application. |
| Tenant isolation | Protected candidate | Negative role and second-tenant assertions exist; dashboard queries duplicate ownership scopes. | Protected real JWT and browser sessions. |
| Encryption in transit | Supported for HTTPS surfaces | Vercel/Render HTTPS behavior is part of deployed infrastructure evidence. | Continue monitoring and document contractual scope. |
| Encryption at rest | Provider-supported but not independently certified here | Managed providers state storage protections, but this release packet is not an independent audit. | Provider evidence and key/access review before contractual claims. |
| Compliance with all relevant regulations | Unsupported broad claim | No jurisdiction-specific legal certification is part of this release. | Counsel-approved, scoped compliance assessment. |
| Never shares data with third parties | Misleading without qualification | Service providers process data to deliver the product. | Counsel-approved distinction among sale, marketing sharing and subprocessors. |
| Auditability and operational evidence | Protected candidate | Release, incident, SLO, telemetry and reconciliation evidence exists in backend candidate. | Protected deployment, retention controls and enterprise review packet. |
| Production enterprise-ready | Not yet | Major controls exist, but provider, real-account, exact private-runner and production rollout gates remain. | Complete all protected-environment and launch gates. |

## Required copy controls

Until stronger evidence exists:

1. Prefer `pilot`, `founder-assisted`, `configured`, `designed to`, `can`, `eligible`, `request`, and `subject to validation`.
2. Avoid `every`, `never`, `guaranteed`, `no double bookings`, `within seconds`, `most callers`, and broad compliance language.
3. Distinguish `reviewed`, `proposed`, `approved`, `applied`, and `verified` configuration states.
4. Do not imply that submitting a demo request activates service, starts billing or charges a card.
5. Do not present appointment requests as confirmed bookings.
6. Do not present provider-dependent functionality as enabled before configuration and controlled testing.
7. Do not present the internal acquisition CRM as a customer product surface.
8. Require Product, Engineering, Security/Privacy and founder review before promoting any claim to `Production-working`.

## Evidence required for promotion

A capability may move to `Production-working` only when the release evidence identifies:

- authoritative repository and exact SHA;
- exact passing workflow runs;
- migration/deployment evidence where applicable;
- tenant and authorization tests;
- authenticated browser/mobile journey;
- real provider or call evidence when relevant;
- failure, retry and recovery behavior;
- audit and undo evidence for configuration changes;
- privacy, retention, export and deletion classification;
- monitoring and rollback method;
- named approval record.

## Canonical release paths

- Backend: `Gagan8atwal/ai-receptionist-voice` PR #64.
- Customer website/application: `Gagan8atwal/pivot-ai-website` PR #20.
- Internal acquisition CRM: `Gagan8atwal/pivot-ai-dashboard` PR #4.

Superseded PRs must not be treated as independent release candidates merely because their historical checks are green.
