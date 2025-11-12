// Core shared domain types for HOTMESS enterprise expansion (Paste Pack)
// Keep lightweight; avoid importing server-only modules here.

export type OwnerTier = 'guest' | 'member' | 'vip' | 'staff' | 'admin';

export interface IntentBase {
  id: string;              // stable slug (e.g. 'listen', 'shop', 'join')
  label: string;           // human readable
  href?: string;           // default navigation target
  priority?: number;       // ordering weight
  icon?: string;           // lucide icon name or custom identifier
  gated?: boolean;         // requires age gate or auth
  requiresAuth?: boolean;  // must be logged in
}

export interface Beacon {
  id: string;              // uuid
  intentId: string;        // references IntentBase.id
  createdAt: string;       // ISO timestamp
  expiresAt?: string;      // optional TTL
  nonce: string;           // rotating short code (human friendly)
  ownerTier: OwnerTier;
  meta?: Record<string, unknown>; // flexible payload for attribution / campaign
}

export interface BeaconResolution {
  beacon: Beacon;
  intent: IntentBase;
  resolvedUrl: string;
  expired: boolean;
}

export interface CityMetricPoint {
  city: string;
  country: string;
  lat: number;
  lng: number;
  listeners: number; // active listener count snapshot
  ts: string;        // ISO time
}

export interface GlobeDataset {
  points: CityMetricPoint[];
  generatedAt: string;
}

export interface JwtUser {
  sub: string;         // user id
  tier: OwnerTier;
  iat: number;
  exp: number;
}

export type StripeSessionKind = 'checkout' | 'portal' | 'donation';

export interface StripeSessionRequest {
  kind: StripeSessionKind;
  priceId?: string;   // for checkout
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface StripeSessionResponse {
  id: string;
  url: string;
}

export interface ApiErrorPayload {
  error: string;
  details?: unknown;
}

export function isApiError(x: unknown): x is ApiErrorPayload {
  if (!x || typeof x !== 'object') return false;
  return 'error' in x && typeof (x as { error: unknown }).error === 'string';
}
