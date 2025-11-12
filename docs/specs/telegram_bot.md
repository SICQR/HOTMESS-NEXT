# HOTMESS ADD - Telegram Bot Spec

Purpose
Provide command interface for HOTMESS community: points, scans, offers, campaigns, DJ info, admin broadcasts.

Scope
In: webhook processing, command parsing, outbound message formatting.
Out: advanced pairing auth (future), payment, heavy analytics.

Env Vars
- TELEGRAM_BOT_TOKEN
- TELEGRAM_WEBHOOK_SECRET
- TELEGRAM_ALLOWED_CHATS
- TELEGRAM_ADMIN_CHAT_ID

Webhook
POST /api/telegram/webhook
Headers: X-Telegram-Bot-Api-Secret-Token must match TELEGRAM_WEBHOOK_SECRET (if set).
Response: { success: true, data: { received: true } }

Commands
- /start, /help
- /points
- /scan <code>
- /offer <slug>
- /campaign <slug>
- /dj <handle>
- /broadcast <message> (admin only)

Security
- Secret token header check
- Optional chat allowlist
- Rate limiting stub

Error handling
- Unknown command returns simple help prompt
- Bad JSON → 400
- Bad secret → 403

Future (Phase 2)
- QR pairing login flow
- Rich media (images for campaigns/offers)
- Inline keyboards for quick CTAs
- Realtime updates for radio now-playing

Test ideas
- Mock POST with valid secret and /start payload
- Secret mismatch → 403
- /scan executes and returns deterministic points

Definition of Done
- Webhook route deployed
- Env vars set
- Basic commands respond
- Logged errors visible in console
- Spec file committed
