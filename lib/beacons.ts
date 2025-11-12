import { randomUUID } from 'crypto';
import { Beacon, BeaconResolution, IntentBase } from './types';

// In-memory intent registry (could evolve into DB-backed)
export const intents: IntentBase[] = [
  { id: 'listen', label: 'Listen Live', href: '/radio', priority: 10 },
  { id: 'shop', label: 'Shop', href: '/shop', priority: 9 },
  { id: 'join', label: 'Join Community', href: '/community', priority: 8, requiresAuth: true },
];

const NONCE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generateNonce(len = 5) {
  let out = '';
  for (let i = 0; i < len; i++) out += NONCE_CHARS[Math.floor(Math.random() * NONCE_CHARS.length)];
  return out;
}

export function createBeacon(intentId: string, ownerTier: Beacon['ownerTier'] = 'guest', ttlSeconds = 300): Beacon {
  const intent = intents.find(i => i.id === intentId);
  if (!intent) throw new Error('Unknown intent');
  const now = Date.now();
  const beacon: Beacon = {
    id: randomUUID(),
    intentId,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + ttlSeconds * 1000).toISOString(),
    nonce: generateNonce(),
    ownerTier,
    meta: {},
  };
  inMemoryBeacons.set(beacon.id, beacon);
  return beacon;
}

const inMemoryBeacons = new Map<string, Beacon>();

export function rotateBeaconNonce(id: string) {
  const b = inMemoryBeacons.get(id);
  if (!b) return false;
  b.nonce = generateNonce();
  return true;
}

export function resolveBeacon(idOrNonce: string): BeaconResolution | null {
  let beacon: Beacon | undefined = inMemoryBeacons.get(idOrNonce);
  if (!beacon) {
    beacon = [...inMemoryBeacons.values()].find(b => b.nonce === idOrNonce);
  }
  if (!beacon) return null;
  const intent = intents.find(i => i.id === beacon!.intentId)!;
  const expired = beacon.expiresAt ? Date.now() > Date.parse(beacon.expiresAt) : false;
  return {
    beacon,
    intent,
    resolvedUrl: intent.href || '/',
    expired,
  };
}

export function listBeacons() {
  return [...inMemoryBeacons.values()];
}
