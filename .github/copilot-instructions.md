# HOTMESS Enterprise – Copilot Instructions

Scope: Next.js 16 App Router + Supabase + Shopify + RadioKing (Azuracast fallback) + Make.com. Men‑only, 18+; consent‑gated analytics; HMAC‑signed QR affiliates; PWA.

1) Big picture
- Compliance first: AgeGate blocks UI until passed (hm_age_ok=1, 7d). Analytics load only after consent.analytics===true.
- Data flows: scan → /r verify (HMAC) → partner redirect → postback → edge/postbacks.ts → Supabase RPCs (track_event, award_conversion).
- Radio: SWR now‑playing (~15s) with Azuracast fallback. Globe: snapshot API → 3D via react‑globe.gl.

2) Architecture map
- app/: App Router; app/layout.tsx wraps Navbar, Footer, AgeGate, Marquee, Concierge. Key routes: /radio, /shop, /care, /records, /earn, /login, /rooms, /r, /safe, /globe, /legal/*
- components/: AgeGateMenOnly, CookieBanner, Analytics, ConciergeWidget, RotatingQR, Globe3D, etc.
- lib/: supabase.ts, shopify.ts, radio.ts, hmac.ts, links.ts, analytics.ts, beacons.ts, weather.ts, types.ts
- edge/ (Deno): postbacks.ts, analytics.ts, telegram.ts, globe_snapshot.ts, sellers_submit.ts
- sql/: schema + RLS + RPC (001_schema.sql … 007_sellers_admin.sql)
- integrations/: MAKE_SCENARIOS.md, POSTBACK_CONTRACTS.md, TELEGRAM_ROOMS.sample.json, SHOPIFY_METAFIELDS.json

3) Why this structure
- Legal/compliance: AgeGate + consent gating centralize risk controls.
- Edge functions: receive partner webhooks and bots close to users; isolate server‑only secrets.
- Utilities in lib/: single sources for crypto, APIs, analytics to avoid drift and leakage.

4) Development workflow
- Dev: npm run dev → http://localhost:3000 (try /safe and /globe)
- Build/Start: npm run build; npm start
- Tests: npm test (Jest + RTL). Examples: __tests__/hmac.test.ts, __tests__/beacon-link.route.test.ts, __tests__/StaggerViewport.test.tsx
- Minimal env to boot: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_RADIOKING_BASE, NEXT_PUBLIC_RADIOKING_SLUG, LINK_SIGNING_SECRET
- Edge deploy: supabase functions deploy postbacks|analytics|telegram --project-ref <ref>

5) Conventions
- App Router: one H1/page; SEO via metadata; PWA on; Tailwind in app/globals.css.
- Server vs client: SUPABASE_SERVICE_ROLE_KEY is server‑only; ONLY NEXT_PUBLIC_* in the browser. Edge uses Web APIs.
- Data: go through lib/supabase.ts (RLS on). Shopify via lib/shopify.ts. Radio via lib/radio.ts.
- Crypto: use lib/hmac.ts (and lib/crypto.ts). Don’t roll your own signing.
- Analytics: use lib/analytics.ts; buffer until (window as any).__HM_ANALYTICS_READY__.
- A11y/perf: respect reduced motion; keep focus rings; use existing animation components.

6) Integration points (where to look)
- API: app/api/beacon-link/route.ts — issues short‑lived signed links used by RotatingQR + /safe.
- Router: app/r/* — verifies HMAC via lib/hmac.ts; logs scan→click; redirects.
- Edge: postbacks.ts (partner conversions), analytics.ts (event ingest), telegram.ts (bot), globe_snapshot.ts (globe data), sellers_submit.ts (seller flows).
- Scripts/tests: scripts/sign-link.js; __tests__/beacon-link.*; __tests__/a11y.test.tsx.

7) Examples and tips
- Reopen cookie banner: window.dispatchEvent(new Event("hm:open-cookie-banner"))
- Safe QR: components/RotatingQR.tsx refreshes ~10s; server links expire quickly; always verify in /r.

8) Scripts/configs (pointers)
- package.json (scripts), next.config.ts (images/rewrites), tsconfig.json (paths), eslint.config.mjs + tailwind/postcss (style), .env.example (full matrix), jest.config.ts + jest.setup.ts (tests).

9) PR checklist (project‑specific)
- Age/consent respected (no gated UI or analytics early).
- All affiliate redirects go through /r with HMAC verify; safe QR links short‑lived.
- No server‑only secrets in client code/logs; NEXT_PUBLIC_* only in browser.
- Radio fallback to Azuracast works; globe/API endpoints resilient.
- A11y: focus/contrast preserved; reduced motion respected; a11y tests pass.
- Tests updated for new intents/routes (see __tests__/beacon-link.*; scripts/sign-link.js).

See also: .github/COPILOT-CHAT.md for a Copilot Chat “master prompt,” VS Code indexing fixes, and an optional safe scaffolder (scripts/scaffold-missing.sh) that creates only missing stubs.
