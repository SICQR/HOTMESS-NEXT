# HOTMESS Enterprise Integration — Summary

## What Was Done

Successfully transformed the existing **Next.js 16 App Router** project into a full **HOTMESS Enterprise** platform with:

### ✅ New Dependencies Installed
- `@supabase/supabase-js` — Database client
- `jose` — JWT/HMAC utilities
- `ky` — HTTP client
- `js-cookie`, `@types/js-cookie` — Cookie management
- `uuid`, `@types/uuid` — ID generation
- `dayjs` — Date utilities
- `jotai` — State management
- `react-hook-form` — Form handling
- `zod` — Schema validation
- `swr` — Data fetching/caching

### ✅ Integration Libraries (`lib/`)
- **supabase.ts** — Client configuration
- **shopify.ts** — Storefront API wrapper
- **radio.ts** — SWR hook for RadioKing + Azuracast now-playing
- **weather.ts** — Open-Meteo geolocation weather
- **hmac.ts** — QR link signing & verification (Node crypto)
- **analytics.ts** — Event tracking client

### ✅ New Components (`components/`)
- **AgeGateMenOnly.tsx** — Modal gate with DOB verification (cookie: `hm_age_ok`)
- **Marquee.tsx** — Scrolling compliance message
- **ConciergeWidget.tsx** — AI intent helper (7 intents: rides, eats, radio, shop, earn, safety, onboarding)
- **WeatherStrip.tsx** — Real-time temperature via geolocation
- **DividerTear.tsx** — Visual separator
- **Toast.tsx** — Notification component

### ✅ New Routes (`app/`)
- **app/earn/page.tsx** — Affiliate dashboard (clicks, conversions, tier)
- **app/login/page.tsx** — Auth placeholder (Supabase magic link)
- **app/rooms/page.tsx** — City chat room directory
- **app/r/route.ts** — QR redirect/router with HMAC verification
- **app/legal/cookies/page.tsx** — Cookie policy
- *(Existing: radio, shop, care, records, community, about, privacy, terms)*

### ✅ Layout Updates (`app/layout.tsx`)
- Integrated `AgeGateMenOnly` (blocks all content until passed)
- Added `Marquee` with compliance message
- Added `ConciergeWidget` (fixed bottom-right)
- Preserved existing `Navbar`, `Footer`, `AgeGate`, `CookieBanner`, `Analytics`

### ✅ Backend & Integrations
- **sql/** — Supabase schemas (001_schema.sql, 002_rls.sql, 003_rpc.sql)
  - Tables: `users_public`, `affiliates`, `rooms`, `scans`, `clicks`, `conversions`, `checkins`, `messages`, `escalations`
  - RLS policies for user/service access
  - RPC functions: `track_event`, `award_conversion`
- **edge/** — Deno edge functions
  - `postbacks.ts` — Partner conversion webhooks (Uber, UberEats, vendors)
  - `analytics.ts` — Event ingest
  - `telegram.ts` — Bot webhook (check-ins, moderation)
- **integrations/** — Specs & sample data
  - `MAKE_SCENARIOS.md` — Make.com workflows (8 scenarios: scan tracking, clicks, postbacks, night drops, radio sync, checkins, leaderboard, safety escalation)
  - `POSTBACK_CONTRACTS.md` — Partner API contracts
  - `TELEGRAM_ROOMS.sample.json` — City room config
  - `SHOPIFY_METAFIELDS.json` — Product metafields
  - `README.md` — Integration overview

### ✅ Configuration
- **.env.example** — Comprehensive env vars (30+ vars for Supabase, Shopify, Radio, Telegram, Analytics, QR tracking)
- **README.md** — Fully updated with:
  - Project overview
  - Feature list
  - Setup instructions (install, DB schema, edge functions, env config)
  - Project structure diagram
  - Integration guides
  - Deployment instructions
  - Legal/compliance notes

## What's New vs Original Vite Spec

| Feature | Vite Spec | Next.js Implementation |
|---------|-----------|------------------------|
| Router | React Router DOM | Next.js 16 App Router |
| Styling | Tailwind tokens (HSL vars) | Tailwind v4 + globals.css (existing) |
| Components | Plain TSX | Client components with `'use client'` |
| Data Fetching | Direct ky calls | SWR hooks for radio, server actions for forms |
| PWA | Vite PWA plugin | Can add next-pwa later |
| Edge Functions | Deno (standalone) | Deno (Supabase Edge Functions) |
| Layouts | Nested in App.tsx | Next.js layout.tsx hierarchy |
| Routing | Manual router setup | File-based routing |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js App Router (Frontend)                              │
│  ├─ AgeGateMenOnly → Blocks until passed                   │
│  ├─ Navbar, Marquee, Footer → Persistent UI                │
│  ├─ Routes: /, /radio, /shop, /care, /earn, /rooms, /r     │
│  └─ ConciergeWidget → AI intent helper                      │
└─────────────────────────────────────────────────────────────┘
                          ↓ API calls
┌─────────────────────────────────────────────────────────────┐
│  Supabase (Backend)                                         │
│  ├─ Postgres: users, affiliates, scans, clicks, conversions│
│  ├─ RLS: user-level + service-level policies               │
│  ├─ Edge Functions: postbacks, analytics, telegram         │
│  └─ Auth: magic link, OAuth (future)                        │
└─────────────────────────────────────────────────────────────┘
                          ↓ Webhooks
┌─────────────────────────────────────────────────────────────┐
│  External Integrations                                       │
│  ├─ RadioKing API → Now-playing (15s polling via SWR)      │
│  ├─ Shopify Storefront → Product data                       │
│  ├─ Telegram Bot → Check-ins, moderation                    │
│  ├─ Make.com → Cron jobs, webhooks, automation             │
│  ├─ Partner APIs → Uber, UberEats (postbacks)              │
│  └─ Open-Meteo → Weather by geolocation                     │
└─────────────────────────────────────────────────────────────┘
```

## Key Flows

### 1. QR Scan → Conversion
1. User scans QR (e.g., physical poster)
2. `/r?p=radio&city=london&aff=aff123&ts=1699999999&sig=HMAC` (HMAC-signed)
3. `app/r/route.ts` verifies signature via `lib/hmac.ts` (no page component; pure redirect handler)
4. Logs scan to Supabase (`scans` table) via edge function
5. Redirects to `/radio` (or partner URL for Uber/UberEats)
6. Partner sends postback to `edge/postbacks.ts` on conversion
7. `award_conversion` RPC credits affiliate, updates tier

### 2. Radio Now-Playing
1. `lib/radio.ts` → `useNowPlaying()` hook
2. SWR fetches RadioKing API every 15s
3. Falls back to Azuracast if RadioKing offline
4. Displays track/artist in `NowPlayingBadge` component

### 3. Age Gate
1. User visits site, `AgeGateMenOnly` checks cookie `hm_age_ok`
2. If not set, modal blocks with DOB input + checkboxes (man, 18+, consent)
3. On submit, sets cookie (7 days), closes modal
4. Content becomes accessible

### 4. Concierge Widget
1. Fixed bottom-right button
2. Click opens panel with 7 intent buttons
3. Select intent → displays contextual help text
4. Links to relevant pages (/radio, /shop, /rooms) or external (Telegram)

## Next Steps

1. **Fill `.env.local`** with real credentials:
   - Supabase URL + anon key
   - Shopify domain + Storefront token
   - RadioKing slug (already set: `hotmess-radio`)
   - Link signing secret (generate: `openssl rand -hex 32`)
   - Optional: GA4, Umami, Telegram bot token

2. **Run SQL migrations** in Supabase SQL editor:
   ```bash
   # Copy contents of sql/001_schema.sql, run in Supabase
   # Copy contents of sql/002_rls.sql, run in Supabase
   # Copy contents of sql/003_rpc.sql, run in Supabase
   ```

3. **Deploy edge functions** (if using Supabase Edge):
   ```bash
   supabase functions deploy postbacks --project-ref YOUR_REF
   supabase functions deploy analytics --project-ref YOUR_REF
   supabase functions deploy telegram --project-ref YOUR_REF
   ```

4. **Configure Make.com scenarios** per `integrations/MAKE_SCENARIOS.md`

5. **Test QR signing** script (create `scripts/sign-link.ts`):
   ```bash
   npx tsx scripts/sign-link.ts --p radio --city london --out qr.png
   ```

6. **Wire Shopify** product queries in `/shop` page (replace placeholder grid)

7. **Add Supabase Auth** to `/login` page (magic link or OAuth)

8. **Deploy to Vercel**:
   ```bash
   git init
   git add -A
   git commit -m "feat: HOTMESS Enterprise Next.js"
   vercel
   ```

## Validation

✅ Dev server running on http://localhost:3000
✅ All routes compile (no TypeScript errors blocking render)
✅ Age gate loads first (blocks content until passed)
✅ Marquee displays compliance message
✅ Concierge widget appears bottom-right
✅ Existing components (Navbar, Footer, Analytics) preserved
✅ Test suite (Jest) still passes

## Known Limitations

- **Edge function lint errors** — Normal (Deno-only, not run through TS config)
- **Placeholder content** — Some routes (earn, login, rooms) have basic UI; wire real data when ready
- **PWA** — Not configured yet (add `next-pwa` if needed)
- **Shopify** — Product grid is placeholder; needs Storefront GraphQL queries
- **Radio** — Requires env vars `NEXT_PUBLIC_RADIOKING_BASE` and `NEXT_PUBLIC_RADIOKING_SLUG` to work

## File Count Summary

| Category | Count | Notes |
|----------|-------|-------|
| New lib/ files | 6 | supabase, shopify, radio, weather, hmac, analytics |
| New components | 6 | AgeGateMenOnly, Marquee, Concierge, WeatherStrip, Toast, DividerTear |
| New app routes | 5 | earn, login, rooms, r (QR router), legal/cookies |
| SQL files | 3 | schema, RLS, RPC |
| Edge functions | 3 | postbacks, analytics, telegram |
| Integration docs | 5 | MAKE_SCENARIOS, POSTBACK_CONTRACTS, sample JSONs, README |
| Config updates | 3 | .env.example, README.md, layout.tsx |

**Total new/modified files: ~35**

---

© HOTMESS London — Men-only • 18+ • Consent first • Aftercare is info/services, not medical advice
