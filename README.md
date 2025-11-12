
 

# HOTMESS Enterprise (Next.js 16)

Men‑only, 18+; care‑first queer ecosystem with Radio, Records, Shop, Care, and HMAC‑signed affiliate QR. Built with Next.js App Router, Supabase, Shopify, RadioKing (Azuracast fallback), Make.com, and Edge Functions.

For Vercel‑specific deployment and ops, see: [README.vercel.md](./README.vercel.md)

## Contents
- Overview and principles
- Architecture and folders
- Key features
- Local setup and environment
- Scripts and developer workflow
- Testing and quality gates
- Security, compliance, and privacy
- Edge functions and integrations
- Roadmap and contributing

## Diagrams & Roadmap
- Architecture diagrams (system context, data flows, folder graph): see `docs/DIAGRAMS.md`.
- Prioritized roadmap with phases and Gantt: see `docs/ROADMAP-PRIORITIES.md`.

## Overview and principles
- Compliance first: Men‑only 18+ AgeGate; analytics load only after consent.
- All affiliate redirects traverse `/r` with HMAC verification; rotating QR links are short‑lived.
- Secrets never in client; only `NEXT_PUBLIC_*` is exposed to the browser. Edge functions hold server‑only secrets.
- Accessibility and performance built‑in: skip links, reduced‑motion respect, SWR, code‑splitting.

## Architecture and folders
- `app/`: App Router pages; `layout.tsx` wraps Navbar, Footer, AgeGate, Marquee, Concierge.
- `components/`: UI and feature components (`AgeGateMenOnly`, `CookieBanner`, `Analytics`, `RotatingQR`, `Globe3D`, etc.).
- `lib/`: Single‑source utilities (supabase, shopify, radio, hmac, links, analytics, crypto, retry, rate, log, types).
- `edge/`: Deno edge functions (`postbacks`, `analytics` ingest, `telegram` bot, `globe_snapshot`, `sellers_submit`).
- `scripts/`: Env sync/doctor, signed link tools, secret rotation/scan, bot env helpers, verify.
- `sql/`: Schema, RLS policies, RPCs (`001_schema.sql` …).
- `__tests__/`: Jest + RTL tests (beacon‑link, hmac, qr_api, telegram_webhook, a11y, etc.).

Example routes
- `/radio`, `/shop`, `/care`, `/records`, `/earn`, `/login`, `/rooms`
- `/r` (QR router, verifies HMAC and redirects)
- `/safe` (rotating QR demo)
- `/globe` (global listeners 3D)
- `/legal/*` (policies, cookies, disclaimers)

## Key features
- AgeGateMenOnly: blocks UI until verified (`hm_age_ok=1`, 7d).
- Consent‑gated analytics: only load after `consent.analytics === true`.
- QR + affiliates: signed links; scan → click → conversion; `/go` allowlist for external redirects.
- Radio: SWR now‑playing every ~15s; Azuracast fallback if RadioKing is down.
- Globe: edge snapshot API → `react-globe.gl` visualization.
- Structured logging: optional Logtail sink; request id correlation via `hm_rid` cookie and `x-hm-request-id` header.
- Error boundaries: client route and global error pages with recovery actions.

## Local setup
Prereqs
- Node >= 18.18
- pnpm (repo pinned in `package.json`)

Install deps
```bash
pnpm install
```

Environment
- Copy `.env.example` to `.env.local` and fill minimal keys:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_RADIOKING_BASE`, `NEXT_PUBLIC_RADIOKING_SLUG`
  - `LINK_SIGNING_SECRET` (64 hex recommended)
- Optional: set `NEXT_PUBLIC_SITE_URL` for canonical URL and SEO.
- To sync from Vercel and auto‑mirror Supabase public keys:
```bash
pnpm run env:pull           # development
pnpm run env:pull:preview   # preview
pnpm run env:pull:prod      # production
```
Validate envs
```bash
pnpm run env:doc            # strict doctor
pnpm run env:docto          # lenient doctor (dev convenience)
```
Rotate signing secret (local)
```bash
pnpm run secret:rotate:link
```
Scan for potential leaks (names/patterns only)
```bash
pnpm run secrets:scan
```

Run dev server
```bash
pnpm dev
```
Open http://localhost:3000 and try `/safe` and `/globe`.

## Scripts and workflow
- dev / build / start: `pnpm dev`, `pnpm build`, `pnpm start`
- lint / typecheck / test: `pnpm lint`, `pnpm typecheck`, `pnpm test`
- env tools: `env:pull*`, `env:doctor`, `env:doc`, `env:doctor:lenient` (alias `env:docto`)
- secret hygiene: `secret:rotate:link`, `secrets:scan`
- verify gate: `pnpm run verify` (can be wired to Git hooks)

Signed links helpers
```bash
# /r signed link generator (QR optional with qrcode installed)
node scripts/sign-link.js --p radio --extra aff=aff123 --qr

# /go signed external offer
node scripts/sign-go.js --partner hotmess --offer care --to https://hotmess.london/care
```

## Testing and quality
- Jest + React Testing Library with coverage; run `pnpm test`
- Quality gates we check regularly:
  - Build PASS (`pnpm build`)
  - Lint PASS (`pnpm lint`)
  - Typecheck PASS (`pnpm typecheck`)
  - Tests PASS (`pnpm test`)
- Suggested CI (GitHub Actions): lint, typecheck, tests, env doctor, secrets scan on PRs.

## Security, compliance, privacy
- Men‑only, 18+; AgeGate blocks UI until verified.
- Consent gating: analytics scripts only load after user opt‑in.
- HMAC signed QR links; `/r` verifies signature; `/go` allows only allowlisted external hosts.
- Secrets never in client; only `NEXT_PUBLIC_*` is exposed. Server/edge secrets remain private.
- Logging: optional `LOGTAIL_SOURCE_TOKEN` for structured logs (client → `/api/log` → sink; server can post directly).
- Security headers enforced via global middleware (CSP nonce, Referrer-Policy, X-Frame-Options, Permissions-Policy). `/.well-known/security.txt` served.
### HMAC Verification
Secure affiliate link verification using HMAC signatures:

```typescript
import { hmacService } from './lib/hmac';

// Generate secure affiliate link
const link = hmacService.generateAffiliateLink(userId);

// Verify incoming affiliate traffic
const isValid = hmacService.verifyAffiliateLink(signature, userId);
```

### Age Gate
18+ verification with session persistence:

```tsx
import { AgeGateMenOnly } from './components/AgeGateMenOnly';

// Automatically shows on first visit
<AgeGateMenOnly />
```

## Responsive design
Mobile‑first with progressive enhancement and accessible drawer navigation.

```css
/* Base (mobile) */
.component { /* mobile styles */ }
/* Tablet */
@media (min-width: 768px) { /* tablet */ }
/* Desktop */
@media (min-width: 1024px) { /* desktop */ }
```

Mobile menu component:
```tsx
import { MobileMenu } from './components/MobileMenu';
<MobileMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
  {/* nav links */}
</MobileMenu>
```

## Theming & tokens
Design tokens live in `app/globals.css`.
```css
--color-bg:#0A0A0A; --color-surface:#121212; --color-border:#262626; --color-text:#FFFFFF;
--color-text-muted:#999999; --color-primary:#FF2768; --color-accent:#6AE3FF;
--radius-sm:0px; --radius-md:2px; --radius-lg:4px;
```
Gradients & glow utilities:
```css
.text-gradient-primary{background:linear-gradient(135deg,var(--color-primary),var(--color-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.btn-glow{box-shadow:0 0 20px var(--color-primary)}
```

## Performance tactics
- Code splitting via App Router layouts & route segments.
- Image optimization: `next/image` (headers, responsive sizes).
- GPU‑accelerated animations (`will-change: transform`).
- Lazy loading: dynamic import for heavy components (UserMenu, Globe3D).
- Tree shaking: keep utilities isolated in `lib/`.

Example animation:
```tsx
<motion.div className="will-change-transform" animate={{ x: 100 }} />
```

## Edge functions and integrations
- `edge/postbacks.ts`: partner conversion postbacks → Supabase RPC.
- `edge/analytics.ts`: event ingest; buffer writes via service role.
- `edge/telegram.ts`: bot webhook; moderation and check‑ins.
- `edge/globe_snapshot.ts`: listener snapshot feed.
- `edge/sellers_submit.ts`: seller flows.
- Deploy via `supabase functions deploy <name> --project-ref <ref>`

## Roadmap (selected)
- CSP + security.txt, rate limiting with Upstash, Playwright E2E flows.
- Image optimization with `next/image` (AVIF/WebP), asset pipeline audits.
- SEO: BreadcrumbList, richer metadata per route, sitemap validation.
- Monitoring: Sentry for client/server; performance dashboards.

## Contributing
PRs welcome for accessibility, performance, and integration hardening. Follow the verify gate locally before pushing:
```bash
pnpm run verify
```

## License
Internal proprietary project. Third‑party APIs (Supabase, Shopify, RadioKing, Telegram) are used under their respective terms.

© HOTMESS London — Men‑only • 18+ • Consent first • Aftercare is info/services, not medical advice
<!-- Internal note: Pick the token matching HOTMESS_ACTIVE_BOT -->
