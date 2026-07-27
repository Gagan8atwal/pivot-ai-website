# Owner Reliability Evidence UI

Date: 2026-07-23

## Purpose

Extend the protected owner-only Operations Health page with aggregate reliability evidence from backend `GET /app/ops/slo`.

This view is an internal pilot evidence surface. It is not a contractual SLA, public uptime claim, remediation console, provider console, or incident-management interface.

## Existing operational queue remains authoritative

The page continues to load `GET /app/ops/reconciliation` for stale calls, failed notifications, aged leads, and aged appointment requests.

The SLO request is independent:

- both requests run through `Promise.allSettled`;
- a missing or failed SLO endpoint does not hide or fail the reconciliation queue;
- a reconciliation failure still uses the established page-level error state;
- a 404 SLO response is shown as protected evidence not enabled in that environment;
- no reliability state is inferred when the SLO endpoint is unavailable.

## Reliability states

The UI supports exactly:

- healthy;
- degraded;
- critical;
- unknown.

Unknown is used when evidence is missing, stale, incomplete, unavailable, invalid, or below the required sample floor. Null values must never be coerced to zero or displayed as `0.0%` or `0 of 0`.

## Metrics

The panel renders the seven internal pilot metrics in the backend contract:

1. voice connection;
2. call finalization;
3. expected lead capture;
4. appointment persistence;
5. transactional notification delivery;
6. owner-console availability;
7. queue processing within target.

For supported metrics it shows:

- internal objective;
- current state;
- 24-hour aggregate success rate;
- good/eligible event counts when both are known;
- evidence-quality reason when unknown;
- burn-policy detail when breached.

For unavailable telemetry it shows the backend availability reason in customer-safe language.

## Guardrails

Worker-heartbeat and durable-queue guardrails are displayed separately. Their state remains unknown until the corresponding backend telemetry is deployed.

## Privacy and control boundary

The UI consumes only the aggregate tenant endpoint. It does not call any internal/platform endpoint and provides no POST, PUT, PATCH, DELETE, provider-verification, incident-recording, deployment, rollback, retry, or remediation control.

The UI must not render or request:

- tenant, user, call, lead, appointment, email, or provider identifiers;
- source manifests or source-row counts;
- caller names, phone numbers, email addresses, message content, summaries, transcripts, recordings, notes, or raw errors;
- provider responses or credentials.

## Authorization

The page remains owner-only through the existing authenticated application shell and `can.owner(me?.role)` route state. Tenant scope is determined by the backend authenticated session; the frontend sends no tenant selector.

## Verification

The established operations regression suite now covers:

- both protected tenant aggregate endpoints;
- exact seven-metric coverage;
- non-contractual and read-only wording;
- independent SLO/reconciliation failure handling;
- unknown/unavailable evidence behavior;
- null formatting;
- absence of internal endpoints, mutation methods, entity/provider fields, source manifests, and action controls;
- owner-only navigation.

The Owner Operations Console workflow runs repository regression tests, lint, production Next.js build, artifact preservation, and final enforcement.

## Deployment boundary

This branch does not merge, deploy, promote a Vercel preview, enable backend feature flags, or change production data. The UI requires backend PR #53 or an equivalent protected endpoint contract before real use.
