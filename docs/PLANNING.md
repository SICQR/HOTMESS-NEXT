# HOTMESS ADD - Planning

This document outlines the high-level plan for the integrated features: Auth, Marketplace, QR gamification, Beacons/Globe, and Content sections.

- Auth: Supabase SSR helpers, /login, UserMenu, signout route.
- QR: /api/qr/scan and /api/qr/rewards with unified responses and Zod validation.
- Marketplace: Partners/offers with HMAC-protected /go router for outbound tracking.
- Beacons: In-memory beacons with API for creation/resolution; beacon_events table for scans.
- Content: Campaigns/Promos/DJs/Blog schemas and basic cards.
