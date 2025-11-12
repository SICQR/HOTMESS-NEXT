- 2025-11-11: CI/verify pipeline setup
  - Added scripts/verify.sh (env check, typecheck, lint, test, build, bundle size) with flags --no-install, --quick, --ci
  - Updated package.json scripts: typecheck, test:ci, verify
  - Added .github/workflows/ci.yml (Node 18/20 matrix, cache, typecheck, lint, test:ci, build, artifacts)
  - Added scripts/git-hooks/install.sh to bootstrap Husky pre-push (typecheck, lint, tests)
  - Appended curl examples to API routes for local testing
  - Added __tests__/health.test.ts sanity test
  - Enabled Jest coverage collection with thresholds (statements 70%, branches 60%, functions 65%, lines 70%)
  - Enabled Vercel Deploy Hook step on main branch after successful build (uses secrets.VERCEL_DEPLOY_HOOK)
- 2025-11-11: Fixed routing conflict at /r
  - Removed app/r/page.tsx which conflicted with app/r/route.ts (Next.js prohibits both)
  - Added app/r/_debug/page.tsx to manually inspect query params without redirecting
# Progress Log

- 2025-11-11: Added shared utilities and schemas; aligned QR scan to deterministic 10..50 points
  - Added lib/errors.ts (API error helpers/types)
  - Added lib/points.ts (deterministicPoints)
  - Added lib/schemas/onboarding.ts and lib/schemas/qr.ts
  - Added hooks/useQRPoints.ts (SWR wrapper)
  - Patched app/api/qr/scan/route.ts to use shared schema and 10..50 points
  - Patched app/api/sellers/route.ts to use shared onboarding schema
- 2025-11-11: Dev server stabilization (Safe Mode)
  - Added dev:safe & clean:cache scripts to package.json
  - Added baseUrl & ignoreDeprecations to tsconfig.json
  - Added SAFE MODE bailout to app/layout.tsx to disable heavy components
  - Added SAFE MODE fallback in env validation (lib/env.ts)
  - Introduced lib/net.ts safeFetch utility (5s timeout)
  - Removed unsupported --no-turbo flag from dev:safe script after runtime error
  - Patched next.config.ts to remove hard-coded turbopack root; gated behind NEXT_USE_TURBO_ROOT

=== PROGRESS REPORT 1 — Phase 1 (File map, libs, APIs) ===
Date: 2025-11-11

Files added:
- (none) — targets already present in repo

Files modified:
- eslint.config.mjs — add ignores for edge/** and coverage/**
- types/jest-axe.d.ts — add minimal typings for jest-axe matchers/results
- __mocks__/framer-motion.ts — forwardRef support for tests
- __tests__/a11y.test.tsx — a11y smoke test added
- __tests__/hmac.test.ts — HMAC roundtrip tests added
- app/r/page.tsx — removed to resolve route conflict (server handler at app/r/route.ts)
- lib/supabase/admin.ts — added no-op client for builds without env

Targets present/missing:
- app/onboarding/layout.tsx — PRESENT
- app/onboarding/seller/page.tsx — PRESENT
- app/onboarding/customer/page.tsx — PRESENT
- app/qr/page.tsx — PRESENT
- app/api/sellers/route.ts — PRESENT
- app/api/qr/scan/route.ts — PRESENT
- app/api/qr/rewards/route.ts — PRESENT
- app/marketplace/page.tsx — PRESENT
- app/marketplace/[sellerId]/page.tsx — PRESENT
- components/Button.tsx — PRESENT
- components/InputField.tsx — PRESENT
- components/ProgressBar.tsx — PRESENT
- lib/env.ts — PRESENT (Zod-validated with SAFE MODE fallback)
- lib/supabase.ts — PRESENT (single client)
- lib/log.ts — PRESENT
- lib/errors.ts — PRESENT
- lib/points.ts — PRESENT (10..50 deterministic)
- lib/schemas/onboarding.ts — PRESENT
- lib/schemas/qr.ts — PRESENT
- hooks/useQRPoints.ts — PRESENT
- sql/004_onboarding_qr.sql — PRESENT

Tsconfig check:
- paths alias "@/*" — PRESENT
- baseUrl — intentionally OMITTED due to TS6 deprecation warning; alias works without it under moduleResolution "bundler". Avoided adding to keep typecheck green.

Dependencies:
- Already present: zod, @supabase/supabase-js, swr, react-globe.gl, stripe
- No changes required

Commands to run:
- npm run verify

Next:
1) Phase 2 — Implement/verify onboarding and QR pages UX details (validation messages, a11y polish)
2) Phase 3 — Marketplace list/detail data shaping and empty states
3) Optional — add Lighthouse CI job and README badge

=== PROGRESS REPORT 2 — Phase 2 (Onboarding + QR UX/a11y polish) ===
Date: 2025-11-11

Files modified:
- components/InputField.tsx — add label htmlFor/id linkage for better a11y
- components/ProgressBar.tsx — add role="progressbar" with aria-valuenow/min/max
- app/onboarding/seller/page.tsx — focus first error on submit, success banner with aria-live and focus, noValidate form
- app/onboarding/customer/page.tsx — keyboard Arrow navigation, focus heading on step change, aria-live section
- app/qr/page.tsx — aria-live assertive status, focus updates after scans and reward refresh
- lib/supabase.ts — no-op Supabase client when env missing (build-safe)

Validation:
- Typecheck/Lint/Tests: PASS
- Build: PASS (no-op Supabase client active without env)

Next:
1) Phase 3 — Marketplace UX (empty states, accessibility labels) and data shims
2) Optional — clean two minor lint warnings in API routes
3) Optional — Lighthouse CI addition
