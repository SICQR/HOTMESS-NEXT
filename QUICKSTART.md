# HOTMESS Enterprise — Quick Start Checklist

## ✅ Setup (5 minutes)

- [ ] **Install dependencies** (already done)
  ```bash
  npm install
  ```

- [ ] **Copy environment template**
  ```bash
  cp .env.example .env.local
  ```

- [ ] Tip: You can boot in dev without keys
  - In development, missing Supabase public keys will fall back to placeholders so the UI can load.
  - Fill the real values in `.env.local` when you're ready; Supabase-dependent features will remain limited until then.

- [ ] **Fill minimum env vars** in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL` (get from Supabase dashboard)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (get from Supabase dashboard)
  - `NEXT_PUBLIC_RADIOKING_BASE=https://api.radioking.io`
  - `NEXT_PUBLIC_RADIOKING_SLUG=hotmess-radio`
  - `NEXT_PUBLIC_LINK_SIGNING_SECRET` (generate: `openssl rand -hex 32`)

- [ ] **Start dev server**
  ```bash
  npm run dev
  ```
  Open http://localhost:3000

## ✅ Database Setup (10 minutes)

- [ ] **Create Supabase project** at https://supabase.com if you haven't

- [ ] **Run SQL migrations** in Supabase SQL editor (copy/paste each file):
  1. `sql/001_schema.sql` — Creates tables
  2. `sql/002_rls.sql` — Sets up security policies
  3. `sql/003_rpc.sql` — Creates stored procedures

- [ ] **Seed test data** (optional):
  ```sql
  -- Example affiliate
  INSERT INTO affiliates (id, display_name, city, tier) 
  VALUES ('aff123', 'Test Affiliate', 'london', 'base');

  -- Example room
  INSERT INTO rooms (id, city, title, public) 
  VALUES ('ldn01', 'london', 'HOTMESS London Night', true);
  ```

## ✅ Feature Verification (5 minutes)

Visit these URLs to verify features:

- [ ] **Homepage** — http://localhost:3000
  - Age gate appears (blocks content)
  - Fill DOB (18+), check boxes, submit
  - Marquee scrolls compliance message
  - Concierge button bottom-right

- [ ] **Radio** — http://localhost:3000/radio
  - Now-playing badge shows "Live Stream" (real data needs env vars)
  - Play button available

- [ ] **Shop** — http://localhost:3000/shop
  - Product grid shows 6 placeholders
  - (Wire Shopify Storefront API later)

- [ ] **Care** — http://localhost:3000/care
  - Check-in form renders
  - Mood dropdown + notes textarea

- [ ] **Earn** — http://localhost:3000/earn
  - Placeholder dashboard (needs Supabase Auth)

- [ ] **Rooms** — http://localhost:3000/rooms
  - 3 city cards (London, Manchester, Torremolinos)
  - Telegram links

- [ ] **QR Router** — http://localhost:3000/r
  - Shows "Routing..." (redirects to / without valid HMAC)

## ✅ Optional Enhancements

- [ ] **Shopify Integration**
  - Add `SHOPIFY_DOMAIN` and `SHOPIFY_STOREFRONT_TOKEN` to `.env.local`
  - Wire Storefront API queries in `/shop` page
  - Replace placeholder grid with real products

- [ ] **Radio Live Data**
  - Verify `NEXT_PUBLIC_RADIOKING_BASE` and `NEXT_PUBLIC_RADIOKING_SLUG`
  - Check now-playing updates every 15s

- [ ] **Supabase Auth**
  - Enable Email provider in Supabase dashboard
  - Wire magic link in `/login` page
  - Protect `/earn` route with auth check

- [ ] **Edge Functions**
  ```bash
  supabase functions deploy postbacks --project-ref YOUR_REF
  supabase functions deploy analytics --project-ref YOUR_REF
  supabase functions deploy telegram --project-ref YOUR_REF
  ```

- [ ] **Make.com Scenarios**
  - Create scenarios per `integrations/MAKE_SCENARIOS.md`
  - Set webhook URLs to edge functions

- [ ] **QR Code Generation**
  - Create `scripts/sign-link.ts` (example in Vite spec)
  - Generate signed QR codes for physical deployment

- [ ] **Analytics**
  - Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` for GA4
  - Add `NEXT_PUBLIC_UMAMI_WEBSITE_ID` and `NEXT_PUBLIC_UMAMI_SRC` for Umami
  - Both load only after cookie consent

- [ ] **Deploy**
  ```bash
  git init
  git add -A
  git commit -m "feat: HOTMESS Enterprise v0.1.0"
  vercel
  ```
  - Set env vars in Vercel dashboard
  - Deploy SQL migrations to production Supabase
  - Update `NEXT_PUBLIC_SITE_URL` to production domain

## ✅ Testing

- [ ] **Run test suite**
  ```bash
  npm test
  ```
  Should see: ✓ 1 passed

- [ ] **Type check**
  ```bash
  npm run build
  ```
  Should complete without errors (some warnings on edge/ files are OK)

## 🎉 Done!

Your HOTMESS Enterprise Next.js app is ready. Next steps:

1. Fill remaining env vars (Shopify, Telegram, Analytics)
2. Wire real data sources (Shopify products, Supabase auth)
3. Deploy edge functions and Make.com scenarios
4. Generate QR codes and deploy to physical locations
5. Monitor analytics and conversions

For questions or issues, see:
- `README.md` — Full documentation
- `ENTERPRISE_INTEGRATION.md` — Integration summary
- `integrations/README.md` — External service specs

---

© HOTMESS London — Men-only • 18+ • Consent first
