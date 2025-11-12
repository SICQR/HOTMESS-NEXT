# HOTMESS PLATFORM – VERSION 10 FULL SPEC

> Master specification (Version 10) with micro flows, page points, CTAs, marketplace rulebook, safety/legal coverage, and operational instructions. Not formal legal advice—final legal text should be lawyer‑reviewed.

---
## SECTION 0: ROLES & ACTORS
- Visitor (unauthenticated)
- Member (authenticated, tier = free|member|pro|staff|partner)
- Seller (member with seller profile)
- Moderator (staff flagged)
- Admin (full privileges)
- Sponsor (brand entity; managed by admin)
- Bot service (Telegram integration)
- External partners (Shopify, Stripe, Make.com)
- Marketplace buyer
- Flagship show listener (Hand in Hand)
- White label seller (seller + white_label entitlement)

## SECTION 1: CORE BRAND PILLARS (Domains)
1. HOTMESS CLOTHING – Limited drops tied to schedule, scarcity, points incentives.
2. HOTMESS RADIO – 24/7 stream + show catalog; flagship Hand in Hand; stinger audio per show.
3. HNHMESS Lube – QR activation brand; deep link rewards; sponsor surfaces.
4. RAW CONVICT RECORDS – Release feed; preview playback; purchase/download links.
5. Marketplace – Products/events/intents/services/digital assets; moderation & tiered fees.
6. QR Beacons & Gamification – Expiring location/product/show/event activation nodes; points, leaderboards, globe.
7. Telegram & Social Orchestration – Drops, show promos, milestone scans, community rooms.
8. Safety & Trust – Age gate, verification, moderation, reporting, dispute resolution.
9. Sponsorship Engine – Banner, show detail, stinger pre/post roll (future), drop co‑branding.

## SECTION 2: GLOBAL SYSTEM FLOW MAP (Macro)
A) Acquisition → Age Gate → Consent → Browse → QR / Activation → Engagement (Stream/Preview/Listing) → Transaction (order/listing/mod upgrade) → Points & Leaderboard → Retention loops (Telegram announcements, limited drops, seasonal resets) → Advocacy (sharing, referrals).
B) Safety gating intercepts at: Age Gate, Explicit listing view, Intent access, Reporting abuse, Expired beacon.

## SECTION 3: INFORMATION ARCHITECTURE (Routes + Purpose + Access)
(See specification for detailed route breakdown.)

## SECTION 4: MICRO FLOWS
(Full detailed step states as provided.)

## SECTION 5: MARKETPLACE RULEBOOK
(Category allowances, moderation codes, fee matrix, escalation ladder.)

## SECTION 6: POINTS ECONOMY & TERMS
Sources: QR beacon, lube activation, streak bonus, purchase bonus (future), referral, verification.
Multipliers: tier + promotional window.
Caps: daily total, per-beacon cooldown.
Redemption: Phase 2 perks.
Terms: no cash value, revocable, 12‑month inactivity expiry.

## SECTION 7: SPONSOR & PLACEMENT RULES
Surfaces, frequency capping, weighted rotation, disclosure requirements.

## SECTION 8: SECURITY & PRIVACY CONTROLS
Signature/HMAC endpoints, rate limits, RLS, data minimization, consent gating.

## SECTION 9: LEGAL PAGES OUTLINE
(Sections: Terms, Privacy, Community Rules, Safety & Consent, Points Terms, Sponsor Disclosure, IP.)

## SECTION 10: ENVIRONMENT KEYS (Recap)
List of required and recommended environment variables.

## SECTION 11: EVENTS & ANALYTICS SCHEMA
Event kinds: home_view, radio_page_view, shows_page_view, ... , leaderboard_refreshed.

## SECTION 12: ERROR CODE MATRIX
400 bad_signature|invalid_payload; 401 unauthorized; 403 forbidden; 404 not_found; 410 expired; 429 rate_limited|cooldown; 500 internal_error.

## SECTION 13: TEST COVERAGE REQUIREMENTS
Activation, QR scan, show detail, drops lifecycle, release preview threshold, listing moderation, sponsor impression, points ledger, RLS.

## SECTION 14: OPERATIONAL PLAYBOOK
Admin/moderator/seller/sponsor tasks, data hygiene, secret rotation.

## SECTION 15: CTA COPY INVENTORY
Categorized CTAs (Radio, Lube Activation, Drops, Marketplace, Listings, QR Points, Records, Leaderboard).

## SECTION 16: COPY BLOCK GUIDELINES
Tone and restrictions; disclaimer emphasis.

## SECTION 17: PERFORMANCE / ACCESSIBILITY
Lazy loading, aria labels, reduced motion handling, contrast rules.

## SECTION 18: PRIORITY CHECKLIST (DELTA)
[ ] Radio shows catalog & detail
[ ] Hand in Hand deep link page
[ ] Lube activation endpoint + page
[ ] Release detail pages
[ ] Drops index + detail
[ ] Marketplace listings + moderation
[ ] Beacons + scan API + globe snapshot + /qr enhancements
[ ] Leaderboards (phase 2)
[ ] Tests per matrix
[ ] Update documentation with this spec

## SECTION 19: GUARDRAILS
Never alter passing endpoints unnecessarily; enforce impression uniqueness; HMAC before body parse; avoid secret leakage; keep env files out of VCS.

---
END OF SPEC
