# HOTMESS ADD - Marketplace Spec

- Entities: marketplace_partners, marketplace_offers, marketplace_clicks, marketplace_conversions.
- API:
  - GET /api/marketplace/offers?partner=uuid (optional)
  - GET /api/marketplace/partners/[slug]
- UI: PartnerCard, OfferCard.
- Tracking: /go with HMAC as described in qr_router.md.
