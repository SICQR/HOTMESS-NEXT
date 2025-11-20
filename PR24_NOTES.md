PR #24 - harden logging redaction and enforce UUID validation for QR redemptions

This file summarizes the changes introduced by PR #24 and outlines next steps for follow-up fixes and verification. The branch is: copilot/harden-server-logging-and-uuid-validation.

Summary of changes included in PR #24:
- lib/log.ts: added redactEntry helper for deep redaction of sensitive keys and truncation of long strings; behavior depends on LOGTAIL_SOURCE_TOKEN and NODE_ENV (drop structured logs in production when no sink configured).
- app/qr/page.tsx: client mock ID generation changed to use crypto.randomUUID() when available and persisted to localStorage as 'mock_user_id'.
- app/api/qr/rewards/route.ts: server-side validation of userId; in production enforce RFC-4122 UUID via z.string().uuid() unless NEXT_PUBLIC_ALLOW_MOCK_IDS='1'.
- __tests__/log.redact.test.ts: unit tests for redaction behavior.

Notes and next steps:
1) Run CI (typecheck, lint, tests) to validate the branch. If CI failures occur, inspect failing logs and adjust implementations or tests.
2) Consider centralizing redactEntry into src/utils/redact.ts if other parts of the codebase need redaction beyond lib/log.ts.
3) Confirm production behavior for missing LOGTAIL_SOURCE_TOKEN is acceptable (one-time error and dropped structured logs) with stakeholders; adjust policy if structured logging must always be emitted.
4) Add integration test for QR redemption endpoint to assert 400 on non-UUID userId when NODE_ENV=production and NEXT_PUBLIC_ALLOW_MOCK_IDS is not set.
5) Optional: use a small uuid validation library at runtime to be explicit about UUID v4 vs other versions if needed.

If you want, I can now: push code changes to the branch to implement a centralized redact util, update imports, and add the integration test; or run additional repository reads to find the exact file locations to patch.
