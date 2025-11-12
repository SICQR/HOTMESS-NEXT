# Partner Postback Contracts

## Uber / UberEats
- **click_id** (string, required) — echo from initial click
- **status** (enum: pending, approved, declined)
- **payout_gross** (number) — partner payout before fees
- **net_after_fee** (number) — actual amount after commission split
- **sig** (string, optional) — HMAC signature for verification

All postbacks must be signed with shared secret. Verify upstream in Make and at edge.

## General Notes
- Conversions logged to `conversions` table via `award_conversion` RPC
- Affiliates credited by `affiliate_id` derived from original scan
- Monthly payout cycle
