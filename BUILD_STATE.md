# Build State – Version 10

Mark with [x] ONLY after feature is implemented and passes tests. Do not remove checklist items.

## Core Foundations (Pre-existing)
- [x] Next.js App Router base layout
- [x] AgeGate + Consent gating
- [x] HMAC utilities (link signing)
- [x] /r or /go signed redirect endpoint
- [x] Basic Radio stream page
- [x] Global theming / tokens
- [x] Proxy &amp; CSP headers
- [x] Basic test harness (Jest + RTL)

## Delta Features
Radio
- [ ] Shows catalog (/radio/shows)
- [ ] Show detail (/radio/show/[slug]) with stinger player
- [ ] Hand in Hand page (/radio/hand-in-hand) sponsor injection

Lube Activation
- [ ] /activate/hnhmess endpoint + page (signature + points)

Records
- [ ] Release detail pages with preview + buy links

Drops
- [ ] Drops index (/drops/clothing)
- [ ] Drop detail (/drops/clothing/[slug]) countdown / inventory status

Marketplace
- [ ] DB schema (listings, sellers, moderation states)
- [ ] Seller onboarding flow
- [ ] Listing creation &amp; moderation pipeline
- [ ] Public marketplace listing index/detail

Beacons / Points
- [ ] Beacons schema + scan API
- [ ] Points ledger logic (multiplier, streak, cap, cooldown)
- [ ] Globe snapshot API + visualization
- [ ] /qr page dashboard enhancements

Tests (spec coverage)
- [ ] Activation tests set
- [ ] QR scan tests (TTL, cooldown, cap)
- [ ] Show detail tests (stinger + sponsor)
- [ ] Drop status tests
- [ ] Release preview tests
- [ ] Listing moderation tests
- [ ] Sponsor impression uniqueness tests
- [ ] Points ledger balance tests

Ops / Docs
- [ ] .github/COPILOT.md created
- [ ] ROADMAP.md created
- [ ] SECURITY_ORDER.md (optional)
- [ ] TEST_MATRIX.md (spec → tests mapping)
