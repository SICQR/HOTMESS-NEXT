# Architecture Diagrams

This document provides high-level system context, data flows, and a folder graph for the HOTMESS Enterprise Next.js application.

Note: Diagrams use Mermaid and render on GitHub. Copy any diagram into mermaid.live to explore.

## 1) System Context (C4-style)

```mermaid
flowchart LR
  subgraph Client[Browser / Device]
    U[User]
    CB[CookieBanner / Consent]
    AG[AgeGateMenOnly]
    QR[RotatingQR]
    G3D[Globe3D]
    Axi[Analytics.tsx]
  end

  subgraph Next[Next.js 16 App (Vercel)]
    APPR[App Router: /, /radio, /shop, /care, /records, /earn, /rooms, /globe, /r, /go, /safe]
    API[/api/* routes]
    MW[middleware.ts (x-hm-request-id + hm_rid)]
  end

  subgraph Edge[Supabase Edge Functions]
    EPost[postbacks.ts]
    EAnal[analytics.ts]
    ETg[telegram.ts]
    EGlobe[globe_snapshot.ts]
    ESellers[sellers_submit.ts]
  end

  subgraph SB[Supabase]
    DB[(Postgres + RLS)]
    RPC[RPCs: track_event, award_conversion]
    Auth[Auth]
  end

  subgraph Third[Third-Party Services]
    RK[RadioKing]
    AZ[Azuracast]
    SF[Shopify Storefront]
    TG[Telegram]
    MK[Make.com]
    LOG[(Log sink: Logtail/Sentry)]
    GA[GA4]
    UM[Umami]
  end

  U -->|interacts| APPR
  APPR -->|server actions / API calls| API
  MW -. sets .-> U

  %% Data flows
  API -->|DB read/write| DB
  API -->|optional log forward| LOG
  APPR -->|consent true| Axi --> GA
  Axi --> UM
  Axi -->|edge ingest| EAnal
  EAnal --> DB

  %% Radio
  APPR --> RK
  APPR -->|fallback| AZ

  %% Globe
  APPR --> EGlobe --> DB
  EGlobe --> APPR

  %% QR / Affiliates
  APPR --> EPost --> RPC --> DB
  APPR --> SF
  APPR --> TG
  MK -. cron/webhooks .-> API
```

## 2) Folder Graph (Condensed)

```mermaid
flowchart TD
  root[(HOTMESS-NEXT)]
  subgraph app
    LAYOUT[layout.tsx]
    ERR[error.tsx + global-error.tsx]
    ROUTES[/radio|/shop|/care|/records|/earn|/rooms|/globe|/safe|/r|/go|/qr|/login|/legal]
    API[/api/*]
  end
  subgraph components
    UI[ui: button, card]
    CORE[AgeGate, CookieBanner, Analytics, Navbar, Footer]
    FEAT[RotatingQR, Globe3D, ConciergeWidget, WeatherStrip, StaggerViewport]
    CARDS[BlogCard, OfferCard, PartnerCard, DJCard, PromoCard, CampaignCard]
  end
  subgraph lib
    DATA[supabase*, shopify, radio, weather]
    SEC[hmac, crypto, links]
    OBS[log, retryFetch, rate, analytics, analyticsServer]
    TYPES[types, schemas/*, server/hmac]
  end
  subgraph edge
    postbacks
    analytics
    telegram
    globe_snapshot
    sellers_submit
  end
  subgraph scripts
    verify[verify.sh]
    env[env-doctor.sh, hm-env-sync.sh, validate-env.ts]
    sec[scan-secrets.sh, rotate-link-signing-secret.sh]
    links[sign-link.js, sign-go.js]
  end
  sql{{sql/*.sql: schema, RLS, RPC, marketplace, telegram, beacons}}
  tests[[__tests__: hmac, beacon-link, qr_api, go_route, telegram_webhook, a11y, points, StaggerViewport]]

  root --> app --> API
  root --> components
  root --> lib
  root --> edge
  root --> scripts
  root --> sql
  root --> tests
```

## 3) QR Affiliate Flow (Sequence)

```mermaid
sequenceDiagram
  autonumber
  participant User as User
  participant Dev as Device/Browser
  participant App as Next.js App (/qr, /r, /go)
  participant Edge as Edge postbacks.ts
  participant DB as Supabase (DB/RPC)
  participant Partner as Partner Platform

  User->>Dev: Scan QR
  Dev->>App: GET /qr/scan?payload=... (record scan)
  App->>DB: track_event(scan)
  Dev->>App: GET /r?sig=... (verify HMAC)
  App->>App: Verify signature via lib/hmac.ts
  App-->>Dev: 302 Redirect to target or /go
  Dev->>App: GET /go?to=allowlisted.host
  App->>App: Validate allowlist and log click
  App-->>Dev: 302 Redirect to Partner
  Partner->>Edge: POST /postbacks (conversion payload)
  Edge->>DB: RPC award_conversion
  Edge-->>Partner: 200 OK
```

## 4) Consent‑Gated Analytics

```mermaid
flowchart LR
  subgraph Client
    CB[CookieBanner]
    AG[AgeGate]
    A[Analytics.tsx]
  end
  subgraph Sinks
    GA[GA4]
    UM[Umami]
    E[Edge analytics]
  end

  CB -->|consent=true| A
  AG -->|age_ok| A
  A --> GA
  A --> UM
  A -->|POST /edge/analytics| E
```

## 5) Radio Now-Playing with Fallback

```mermaid
flowchart LR
  NP[Now-Playing fetch]
  RK[RadioKing API]
  AZ[Azuracast API]
  UI[Player UI]

  NP -->|try| RK
  RK -- fail/timeouts --> NP
  NP -->|fallback| AZ
  AZ -- success --> UI
  RK -- success --> UI
```

## 6) Globe Snapshot

```mermaid
flowchart TD
  EGlobe[edge/globe_snapshot.ts] --> DB[(Supabase)]
  DB --> EGlobe
  EGlobe --> App[Next.js /globe]
  App --> G3D[Globe3D component]
```

## 7) Logging & Correlation

```mermaid
sequenceDiagram
  autonumber
  participant MW as middleware.ts
  participant C as Client
  participant API as /api/log
  participant LOG as External Sink

  MW->>C: Set x-hm-request-id + hm_rid cookie (short-lived)
  C->>API: POST { level, message, meta, rid }
  API->>LOG: Forward (if token configured)
  API-->>C: 200 OK (always best-effort)
```
