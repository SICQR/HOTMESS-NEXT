# HOTMESS Enterprise – Vercel Deployment Guide

This document focuses ONLY on deploying and operating the HOTMESS Next.js 16 App Router project on **Vercel** with Supabase, Shopify, RadioKing, and Edge Functions.

> Audience: engineering + ops. For product features, see `README.md`.

---
## 1. Overview
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Runtime**: Node 18.18+ (declared in `package.json` engines)
- **Package manager**: pnpm (lockfile: `pnpm-lock.yaml`)
- **Edge**: Supabase Edge Functions (Deno) separately deployed; NOT part of Vercel build.
- **Compliance gating**: Age gate + consent gating; analytics load only after user consent.
- **Signed redirects**: `/r` (QR router) and `/go` rely on `LINK_SIGNING_SECRET`; never expose this client-side.

---
## 2. Quick Deploy
1. Fork or push repo to GitHub.
2. In Vercel dashboard → "Add New" → "Project" → import repo.
3. Ensure Root Directory is set to `/` (where `package.json` lives).
4. Framework should auto-detect as Next.js. If not, the following are safe:
   - Install Command: `pnpm install`
   - Build Command: `pnpm run build`
   - Output Directory: (auto by Next.js; do not override)
5. Add required environment variables (see Section 4).
6. Deploy.

> If Vercel reports "No Next.js version detected", verify the root path and that `next` is in dependencies. `vercel.json` already sets `framework: "nextjs"`.

---
## 3. Build & Runtime Notes
- **Engines**: `"node": ">=18.18.0"` ensures modern features and compatibility with Next 16.
- **Turbopack root warning**: Local warnings about multiple lockfiles are benign; ensure only one lockfile (`pnpm-lock.yaml`) is committed.
- **Middleware**: The legacy `middleware.ts` convention triggers a deprecation warning; plan migration to `proxy` route convention when upgrading Next.
- **Analytics gating**: GA/Umami scripts are injected only after consent (`consent.analytics === true`); avoids early tracking.
- **HMAC Links**: Ensure `LINK_SIGNING_SECRET` exists before using rotating QR or `/r` flows.

---
## 4. Environment Variables (Vercel → Project Settings)
### 4.1 Required (Public - Development/Preview/Production)
| Key | Description |
|-----|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/publishable key |
| `NEXT_PUBLIC_RADIOKING_BASE` | RadioKing API base (e.g. `https://api.radioking.io`) |
| `NEXT_PUBLIC_RADIOKING_SLUG` | Radio station slug (e.g. `hotmess-radio`) |

### 4.2 Required (Server Only)
| Key | Description |
|-----|-------------|
| `LINK_SIGNING_SECRET` | HMAC secret for signed QR/redirects (64 hex recommended) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role for privileged Supabase RPC (DO NOT expose client-side) |

### 4.3 Strongly Recommended
| Key | Purpose |
|-----|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical domain (affects OG tags, sitemap) |
| `GO_TO_ALLOWLIST` | Comma host allowlist for `/go` redirects |
| `TELEGRAM_NOTIFY_SECRET` | Internal auth for Telegram notifications |
| `INTERNAL_PARTNER_SECRET` | Authenticate partner postbacks/ingests |

### 4.4 Optional Public Analytics
| Key | Purpose |
|-----|---------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 property (consent-gated) |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Umami site ID (consent-gated) |
| `NEXT_PUBLIC_UMAMI_SRC` | Custom Umami script URL |

### 4.5 Shopify
| Key | Purpose |
|-----|---------|
| `SHOPIFY_DOMAIN` | Storefront domain (or use alias `SHOPIFY_SHOP_DOMAIN`) |
| `SHOPIFY_STOREFRONT_TOKEN` | Storefront API access token |

### 4.6 Telegram (if bot features active)
| Key | Purpose |
|-----|---------|
| `TELEGRAM_BOT_TOKEN` | Bot token (never public) |
| `TELEGRAM_WEBHOOK_SECRET` | Shared secret for webhook validation |
| `TELEGRAM_MOD_CHAT_ID` | Moderator channel ID |

### 4.7 Stripe / Future
| Key | Purpose |
|-----|---------|
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification (placeholder) |
| `LOGTAIL_SOURCE_TOKEN` | Optional: structured log sink token for client/server logs |

> Set variable scopes to **Development**, **Preview**, **Production** as needed. Do NOT mark server secrets as public.

#### Secret Generation (macOS)
```bash
# 64-hex recommended for HMAC secrets
openssl rand -hex 32
```

---
## 5. Local Sync & Validation (Optional but Recommended)
Use scripts to keep local `.env.local` aligned with Vercel:

| Script | Purpose |
|--------|---------|
| `pnpm run env:pull` | Pull dev env vars → `.env.local` |
| `pnpm run env:pull:preview` | Pull preview environment |
| `pnpm run env:pull:prod` | Pull production environment |
| `pnpm run env:doctor` | Summarize missing/misformatted vars |
| `pnpm run env:doc` | Alias for strict doctor |
| `pnpm run env:doctor:lenient` | Lenient dev mode (ignores shared NEXT_PUBLIC_* in dev) |
| `pnpm run env:docto` | Alias for lenient doctor |
| `pnpm run validate:env:web` | Validate web-required vars only |
| `pnpm run validate:env:edge` | Validate edge/server vars |

Bot env (Telegram) validation:
```bash
pnpm run env:bot:check:local      # Validate .env.bot
pnpm run env:bot:check            # Validate shell env
```

Local helper to patch `.env.local` without exposing values:
```bash
npx ts-node scripts/set-local-env.ts KEY=value [...]
```

---
## 6. Edge Functions (Supabase)
Deployed separately; Vercel does not host these.

| File | Purpose |
|------|---------|
| `edge/postbacks.ts` | Partner conversion postbacks -> Supabase RPC |
| `edge/analytics.ts` | Event ingest buffer (write via service role) |
| `edge/telegram.ts` | Telegram webhook commands & moderation |
| `edge/globe_snapshot.ts` | City listener snapshot feed |
| `edge/sellers_submit.ts` | Seller onboarding flow |

Deploy examples:
```bash
supabase functions deploy postbacks --project-ref <ref>
supabase functions deploy analytics --project-ref <ref>
supabase functions deploy telegram --project-ref <ref>
```

---
## 7. Compliance & Safety Controls
| Control | Mechanism | Notes |
|---------|-----------|-------|
| Age Gate (Men 18+) | `AgeGateMenOnly` component + `hm_age_ok` cookie | Blocks UI until verified |
| Consent Gating | `CookieBanner` sets granular preferences | Analytics load only post-consent |
| Safe QR Links | Rotating signed links (short TTL) | Uses `LINK_SIGNING_SECRET` |
| Redirect Allowlist | `GO_TO_ALLOWLIST` host names | Denies unknown external redirects |
| RLS Policies | Supabase `sql/002_rls.sql` | Enforced server-side only |

---
## 8. Observability & Logs
- Client events buffered until `window.__HM_ANALYTICS_READY__`.
- Server/edge logs: prefer structured JSON (check `lib/log.ts`).
- Consider enabling Vercel Analytics ONLY after finalizing consent logic (avoid double measurement).

---
## 9. Common Deployment Issues
| Symptom | Cause | Fix |
|---------|-------|-----|
| "No Next.js version detected" | Wrong root or missing dependency | Set Root Directory `/`; ensure `next` in dependencies |
| Blank analytics | Consent not granted | Trigger banner or check localStorage `hm_cookie_prefs` |
| QR links 404 | Missing `LINK_SIGNING_SECRET` | Add secret & redeploy |
| Fallback radio stuck | RadioKing slug mismatch | Verify `NEXT_PUBLIC_RADIOKING_SLUG` |
| Edge RPC failures | Missing service role key | Add `SUPABASE_SERVICE_ROLE_KEY` to server env |

---
## 10. Security Guidelines
- Never commit `.env.local` or `.env.bot` (ensure `.gitignore` covers them).
- Rotate `LINK_SIGNING_SECRET` if exposed; it invalidates old QR signatures.
- Keep service role key out of the browser bundle; only reference in server code or edge functions.
- Use allowlist for external redirects to mitigate open redirect abuse.

---
## 11. Manual Production Checklist
1. Required public vars set for all environments.
2. Server secrets present (service role, signing secret, webhook secrets).
3. Age Gate + consent tested on production domain.
4. Edge functions deployed/updated.
5. Supabase RLS policies active.
6. QR `/r` and `/safe` routes verified (signature, expiration, redirect correctness).
7. Diagnostics: run `pnpm run env:doctor` locally (optional) and compare output.

---
## 12. Rollback Strategy
- Code rollback: redeploy previous Git commit in Vercel UI.
- Env rollback: Vercel keeps history—revert variable edits as needed.
- Edge functions: redeploy prior version; consider version-tagged refs.

---
## 13. Future Hardening (Roadmap)
| Item | Benefit |
|------|---------|
| Redis/Upstash rate limiting | Durable multi-instance protection |
| Edge function auth signing | Unified HMAC for all ingest endpoints |
| CSP headers + security.txt | Strengthen client security posture |
| Sentry integration | Production error tracking |
| Enhanced bot moderation ML | Automate flagged content review |

---
## 14. Reference Commands (Local)
```bash
# Development
pnpm dev

# Lint & Typecheck
pnpm lint
pnpm typecheck

# Tests
pnpm test

# Build
pnpm build

# Env doctor (summaries)
pnpm run env:doctor
# Strict / Lenient aliases
pnpm run env:doc
pnpm run env:doctor:lenient
pnpm run env:docto

# Customize lenient ignores (space or comma separated)
HM_ENV_DOCTOR_IGNORE_KEYS="NEXT_PUBLIC_SITE_URL,NEXT_PUBLIC_GA_MEASUREMENT_ID" pnpm run env:doctor:lenient

# Add single local env key
npx ts-node scripts/set-local-env.ts NEXT_PUBLIC_RADIOKING_SLUG=hotmess-radio
```

---
## 15. Contact & Ownership
- Primary Maintainer: HOTMESS London Engineering
- Ops Escalation: Telegram mod channel + internal on-call rotation

---
## 16. License & Attribution
Internal proprietary project. Portions interact with third-party APIs (Supabase, Shopify, RadioKing, Telegram). Respect each service’s TOS.

---
## 17. Secret Rotation & Scanning
Keeping secrets fresh and detecting accidental reference leaks reduces blast radius.

### 17.1 Rotate `LINK_SIGNING_SECRET`
Use the helper script (redacts the value; invalidates old QR signatures immediately):
```bash
pnpm run secret:rotate:link
```
Effects:
- Generates new 64‑hex secret via `openssl rand -hex 32`.
- Rewrites the line in `.env.local` (or creates it if missing).
- Old signed links become invalid (expected); issue fresh QR codes.

Post‑rotation checklist:
1. Commit (without the env file). 2. Update Vercel secret in Dashboard. 3. Trigger redeploy.

### 17.2 Scan for Leaked Patterns
Detect suspicious references before pushing:
```bash
pnpm run secrets:scan
```
Patterns covered (variable names / formats only; values never dumped):
- Supabase service role key token shape
- HMAC signing secret name
- Telegram bot tokens
- Generic JWT‑like long tokens
- Stripe keys (publishable/secret) indicators
 - Log sink tokens (names only)

Integrate into pre‑push (already scaffolded in `.husky/pre-push` via `pnpm run verify`). Extend by adding `pnpm run secrets:scan` if desired.

### 17.3 Automated Hygiene (Optional Roadmap)
- Add weekly GitHub Action to run scan + open issue on matches.
- Auto‑rotate signing secret quarterly; announce window to affiliates.
- Extend scan with entropy detection (flag high‑entropy strings not in ignore list).

### 17.4 False Positives & Ignores
If internal docs trigger matches, add targeted ignores inside the scan script or refactor docs to mask values (e.g. replace middle characters with `***`). Avoid global ignores that hide real leaks.

---
**HOTMESS Enterprise** — Men-only • 18+ • Consent first • Safety & aftercare emphasis.
# HOTMESS Enterprise – Vercel Deployment Guide

This document focuses ONLY on deploying and operating the HOTMESS Next.js 16 App Router project on **Vercel** with Supabase, Shopify, RadioKing, and Edge Functions.

> Audience: engineering + ops. For product features, see `README.md`.

---
## 1. Overview
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Runtime**: Node 18.18+ (declared in `package.json` engines)
- **Package manager**: pnpm (lockfile: `pnpm-lock.yaml`)
- **Edge**: Supabase Edge Functions (Deno) separately deployed; NOT part of Vercel build.
- **Compliance gating**: Age gate + consent gating; analytics load only after user consent.
- **Signed redirects**: `/r` (QR router) and `/go` rely on `LINK_SIGNING_SECRET`; never expose this client-side.

---
## 2. Quick Deploy
1. Fork or push repo to GitHub.
2. In Vercel dashboard → "Add New" → "Project" → import repo.
3. Ensure Root Directory is set to `/` (where `package.json` lives).
4. Framework should auto-detect as Next.js. If not, the following are safe:
   - Install Command: `pnpm install`
   - Build Command: `pnpm run build`
   - Output Directory: (auto by Next.js; do not override)
5. Add required environment variables (see Section 4).
6. Deploy.

> If Vercel reports "No Next.js version detected", verify the root path and that `next` is in dependencies. `vercel.json` already sets `framework: "nextjs"`.

---
## 3. Build & Runtime Notes
- **Engines**: `"node": ">=18.18.0"` ensures modern features and compatibility with Next 16.
- **Turbopack root warning**: Local warnings about multiple lockfiles are benign; ensure only one lockfile (`pnpm-lock.yaml`) is committed.
- **Middleware**: The legacy `middleware.ts` convention triggers a deprecation warning; plan migration to `proxy` route convention when upgrading Next.
- **Analytics gating**: GA/Umami scripts are injected only after consent (`consent.analytics === true`); avoids early tracking.
- **HMAC Links**: Ensure `LINK_SIGNING_SECRET` exists before using rotating QR or `/r` flows.

---
## 4. Environment Variables (Vercel → Project Settings)
### 4.1 Required (Public - Development/Preview/Production)
| Key | Description |
|-----|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/publishable key |
| `NEXT_PUBLIC_RADIOKING_BASE` | RadioKing API base (e.g. `https://api.radioking.io`) |
| `NEXT_PUBLIC_RADIOKING_SLUG` | Radio station slug (e.g. `hotmess-radio`) |

### 4.2 Required (Server Only)
| Key | Description |
|-----|-------------|
| `LINK_SIGNING_SECRET` | HMAC secret for signed QR/redirects (64 hex recommended) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role for privileged Supabase RPC (DO NOT expose client-side) |

### 4.3 Strongly Recommended
| Key | Purpose |
|-----|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical domain (affects OG tags, sitemap) |
| `GO_TO_ALLOWLIST` | Comma host allowlist for `/go` redirects |
| `TELEGRAM_NOTIFY_SECRET` | Internal auth for Telegram notifications |
| `INTERNAL_PARTNER_SECRET` | Authenticate partner postbacks/ingests |

### 4.4 Optional Public Analytics
| Key | Purpose |
|-----|---------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 property (consent-gated) |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Umami site ID (consent-gated) |
| `NEXT_PUBLIC_UMAMI_SRC` | Custom Umami script URL |

### 4.5 Shopify
| Key | Purpose |
|-----|---------|
| `SHOPIFY_DOMAIN` | Storefront domain (or use alias `SHOPIFY_SHOP_DOMAIN`) |
| `SHOPIFY_STOREFRONT_TOKEN` | Storefront API access token |

### 4.6 Telegram (if bot features active)
| Key | Purpose |
|-----|---------|
| `TELEGRAM_BOT_TOKEN` | Bot token (never public) |
| `TELEGRAM_WEBHOOK_SECRET` | Shared secret for webhook validation |
| `TELEGRAM_MOD_CHAT_ID` | Moderator channel ID |

### 4.7 Stripe / Future
| Key | Purpose |
|-----|---------|
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification (placeholder) |
| `LOGTAIL_SOURCE_TOKEN` | Optional: structured log sink token for client/server logs |

> Set variable scopes to **Development**, **Preview**, **Production** as needed. Do NOT mark server secrets as public.

#### Secret Generation (macOS)
```bash
# 64-hex recommended for HMAC secrets
openssl rand -hex 32
```

---
## 5. Local Sync & Validation (Optional but Recommended)
Use scripts to keep local `.env.local` aligned with Vercel:

| Script | Purpose |
|--------|---------|
| `pnpm run env:pull` | Pull dev env vars → `.env.local` |
| `pnpm run env:pull:preview` | Pull preview environment |
| `pnpm run env:pull:prod` | Pull production environment |
| `pnpm run env:doctor` | Summarize missing/misformatted vars |
| `pnpm run env:doc` | Alias for strict doctor |
| `pnpm run env:doctor:lenient` | Lenient dev mode (ignores shared NEXT_PUBLIC_* in dev) |
| `pnpm run env:docto` | Alias for lenient doctor |
| `pnpm run validate:env:web` | Validate web-required vars only |
| `pnpm run validate:env:edge` | Validate edge/server vars |

Bot env (Telegram) validation:
```bash
pnpm run env:bot:check:local      # Validate .env.bot
pnpm run env:bot:check            # Validate shell env
```

Local helper to patch `.env.local` without exposing values:
```bash
npx ts-node scripts/set-local-env.ts KEY=value [...]
```

---
## 6. Edge Functions (Supabase)
Deployed separately; Vercel does not host these.

| File | Purpose |
|------|---------|
| `edge/postbacks.ts` | Partner conversion postbacks -> Supabase RPC |
| `edge/analytics.ts` | Event ingest buffer (write via service role) |
| `edge/telegram.ts` | Telegram webhook commands & moderation |
| `edge/globe_snapshot.ts` | City listener snapshot feed |
| `edge/sellers_submit.ts` | Seller onboarding flow |

Deploy examples:
```bash
supabase functions deploy postbacks --project-ref <ref>
supabase functions deploy analytics --project-ref <ref>
supabase functions deploy telegram --project-ref <ref>
```

---
## 7. Compliance & Safety Controls
| Control | Mechanism | Notes |
|---------|-----------|-------|
| Age Gate (Men 18+) | `AgeGateMenOnly` component + `hm_age_ok` cookie | Blocks UI until verified |
| Consent Gating | `CookieBanner` sets granular preferences | Analytics load only post-consent |
| Safe QR Links | Rotating signed links (short TTL) | Uses `LINK_SIGNING_SECRET` |
| Redirect Allowlist | `GO_TO_ALLOWLIST` host names | Denies unknown external redirects |
| RLS Policies | Supabase `sql/002_rls.sql` | Enforced server-side only |

---
## 8. Observability & Logs
- Client events buffered until `window.__HM_ANALYTICS_READY__`.
- Server/edge logs: prefer structured JSON (check `lib/log.ts`).
- Consider enabling Vercel Analytics ONLY after finalizing consent logic (avoid double measurement).

---
## 9. Common Deployment Issues
| Symptom | Cause | Fix |
|---------|-------|-----|
| "No Next.js version detected" | Wrong root or missing dependency | Set Root Directory `/`; ensure `next` in dependencies |
| Blank analytics | Consent not granted | Trigger banner or check localStorage `hm_cookie_prefs` |
| QR links 404 | Missing `LINK_SIGNING_SECRET` | Add secret & redeploy |
| Fallback radio stuck | RadioKing slug mismatch | Verify `NEXT_PUBLIC_RADIOKING_SLUG` |
| Edge RPC failures | Missing service role key | Add `SUPABASE_SERVICE_ROLE_KEY` to server env |

---
## 10. Security Guidelines
- Never commit `.env.local` or `.env.bot` (ensure `.gitignore` covers them).
- Rotate `LINK_SIGNING_SECRET` if exposed; it invalidates old QR signatures.
- Keep service role key out of the browser bundle; only reference in server code or edge functions.
- Use allowlist for external redirects to mitigate open redirect abuse.

---
## 11. Manual Production Checklist
1. Required public vars set for all environments.
2. Server secrets present (service role, signing secret, webhook secrets).
3. Age Gate + consent tested on production domain.
4. Edge functions deployed/updated.
5. Supabase RLS policies active.
6. QR `/r` and `/safe` routes verified (signature, expiration, redirect correctness).
7. Diagnostics: run `pnpm run env:doctor` locally (optional) and compare output.

---
## 12. Rollback Strategy
- Code rollback: redeploy previous Git commit in Vercel UI.
- Env rollback: Vercel keeps history—revert variable edits as needed.
- Edge functions: redeploy prior version; consider version-tagged refs.

---
## 13. Future Hardening (Roadmap)
| Item | Benefit |
|------|---------|
| Redis/Upstash rate limiting | Durable multi-instance protection |
| Edge function auth signing | Unified HMAC for all ingest endpoints |
| CSP headers + security.txt | Strengthen client security posture |
| Sentry integration | Production error tracking |
| Enhanced bot moderation ML | Automate flagged content review |

---
## 14. Reference Commands (Local)
```bash
# Development
pnpm dev

# Lint & Typecheck
pnpm lint
pnpm typecheck

# Tests
pnpm test

# Build
pnpm build

# Env doctor (summaries)
pnpm run env:doctor
# Strict / Lenient aliases
pnpm run env:doc
pnpm run env:doctor:lenient
pnpm run env:docto

# Customize lenient ignores (space or comma separated)
HM_ENV_DOCTOR_IGNORE_KEYS="NEXT_PUBLIC_SITE_URL,NEXT_PUBLIC_GA_MEASUREMENT_ID" pnpm run env:doctor:lenient

# Add single local env key
npx ts-node scripts/set-local-env.ts NEXT_PUBLIC_RADIOKING_SLUG=hotmess-radio
```

---
## 15. Contact & Ownership
- Primary Maintainer: HOTMESS London Engineering
- Ops Escalation: Telegram mod channel + internal on-call rotation

---
## 16. License & Attribution
Internal proprietary project. Portions interact with third-party APIs (Supabase, Shopify, RadioKing, Telegram). Respect each service’s TOS.

---
## 17. Secret Rotation & Scanning
Keeping secrets fresh and detecting accidental reference leaks reduces blast radius.

### 17.1 Rotate `LINK_SIGNING_SECRET`
Use the helper script (redacts the value; invalidates old QR signatures immediately):
```bash
pnpm run secret:rotate:link
```
Effects:
- Generates new 64‑hex secret via `openssl rand -hex 32`.
- Rewrites the line in `.env.local` (or creates it if missing).
- Old signed links become invalid (expected); issue fresh QR codes.

Post‑rotation checklist:
1. Commit (without the env file). 2. Update Vercel secret in Dashboard. 3. Trigger redeploy.

### 17.2 Scan for Leaked Patterns
Detect suspicious references before pushing:
```bash
pnpm run secrets:scan
```
Patterns covered (variable names / formats only; values never dumped):
- Supabase service role key token shape
- HMAC signing secret name
- Telegram bot tokens
- Generic JWT‑like long tokens
- Stripe keys (publishable/secret) indicators
 - Log sink tokens (names only)

Integrate into pre‑push (already scaffolded in `.husky/pre-push` via `pnpm run verify`). Extend by adding `pnpm run secrets:scan` if desired.

### 17.3 Automated Hygiene (Optional Roadmap)
- Add weekly GitHub Action to run scan + open issue on matches.
- Auto‑rotate signing secret quarterly; announce window to affiliates.
- Extend scan with entropy detection (flag high‑entropy strings not in ignore list).

### 17.4 False Positives & Ignores
If internal docs trigger matches, add targeted ignores inside the scan script or refactor docs to mask values (e.g. replace middle characters with `***`). Avoid global ignores that hide real leaks.

---
**HOTMESS Enterprise** — Men-only • 18+ • Consent first • Safety & aftercare emphasis.
