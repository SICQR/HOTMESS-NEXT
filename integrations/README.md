# HOTMESS Enterprise — Integrations

This directory contains specs and sample data for external integrations.

## Files

- **MAKE_SCENARIOS.md** — Make.com workflow specs (webhooks, crons, listeners)
- **POSTBACK_CONTRACTS.md** — Partner postback API contracts (Uber, UberEats, future vendors)
- **TELEGRAM_ROOMS.sample.json** — Sample city room configuration for Telegram bot
- **SHOPIFY_METAFIELDS.json** — Custom metafields schema for Shopify products

## Quick Start

1. Import SQL schemas (`sql/001_schema.sql`, `002_rls.sql`, `003_rpc.sql`) into Supabase
2. Deploy edge functions (`edge/*.ts`) to Supabase Edge Functions
3. Configure Make.com scenarios per MAKE_SCENARIOS.md
4. Set up Telegram bot webhook to `edge/telegram.ts`
5. Configure partner postback endpoints per POSTBACK_CONTRACTS.md

## Security

- All QR links use HMAC signing (see `lib/hmac.ts`)
- Partner postbacks must include valid signature
- Telegram webhooks verify `x-hm-signature` header
- RLS policies enforce user-level and service-level access
