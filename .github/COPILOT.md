# Copilot Guardrails – HOTMESS Version 10

Do only DELTA items listed in BUILD_STATE.md that are unchecked.

Never modify:
- Existing signed link logic unless tests fail.
- Existing HMAC utils except for additive helpers.
- AgeGate / Consent gating unless security patch.

Security Order (MUST preserve):
1. HMAC verification on raw body (bot/telegram notify) before JSON parse.
2. Link signature + 120s timestamp window (/go or /r style).
3. Activation &amp; QR: verify signature → TTL → cooldown → daily cap → award points.
4. RLS enforced on listings/orders; use SECURITY DEFINER RPCs for privileged operations (not service role key inline).
5. Rate limit endpoints (scan, partner-bot-drop, webhooks).

Prohibited:
- Auto-playing stingers/previews.
- Logging secrets or entire env objects.
- Returning internal IDs for private rows.
- Exposing service role key.
- Creating unapproved listing states outside moderation pipeline.
- Awarding points without passing TTL/cap checks.

Error Codes (must match):
- 400 bad_signature | invalid_payload
- 401 unauthorized
- 403 forbidden
- 404 not_found
- 410 expired
- 429 rate_limited | cooldown
- 500 internal_error

Sponsor Impressions:
- Fire once per session per surface; throttle repeat renders.

Tests:
- Add tests for any new endpoint; do not remove existing tests.

Environment:
- Only expose NEXT_PUBLIC_* to client.
- Keep .env.local out of version control.

When uncertain:
- Add TODO with ISSUE-REF placeholder; do NOT guess security logic.
