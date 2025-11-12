# Test Matrix – Spec Mapping

Activation (/activate/hnhmess)
- Valid signature → 200 success_member
- Expired → 410 expired
- Tampered → 400 bad_signature
- Unauth → 302 redirect login

QR Scan (/api/qr/scan)
- Valid → points_awarded event
- Expired signature → 410
- Cooldown same beacon → 429 cooldown
- Daily cap exceeded → 429 rate_limited
- Multiplier correct per tier

Show Detail (/radio/show/[slug])
- Flagship sponsor banner presence
- Stinger player renders, no auto-play
- Sponsor impression only once

Drop Detail (/drops/clothing/[slug])
- Pre → countdown visible
- Live → Buy CTA visible
- Sold out → Archive CTA visible

Marketplace Listings
- Draft/submitted not in public index
- Approved appears
- Rejected reason displayed
- Intent gating (requires verification)
- Report listing form triggers event

Release Detail (/records/[slug])
- Preview play triggers release_play after threshold
- Buy link click tracked

Points Ledger
- Balance increments accurately after scan
- Streak increments

Sponsor Impression
- Second render same session does not duplicate event

Security
- HMAC failure returns 400 for bot-drop
- RLS denies unauthorized listing draft fetch

(Add rows as features grow.)
