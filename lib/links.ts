// Shared helpers for link issuance

export function sanitizeTtlSeconds(v: unknown, min = 10, max = 120, fallback = 30) {
  const n = typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : NaN;
  const ttl = Number.isFinite(n) ? Math.round(n as number) : fallback;
  return Math.min(max, Math.max(min, ttl));
}

export function computeExpiresAt(ttlSeconds: number, now = Date.now()) {
  return new Date(now + ttlSeconds * 1000).toISOString();
}

export function mapIntentToParam(intent: string) {
  const i = intent.toLowerCase();
  if (i === 'shop') return 'uber_home';
  if (i === 'join') return 'room';
  return 'radio';
}

// Build an allowlist of hosts for explicit redirect targets.
// Includes current origin host, a default first-party domain, and any GO_TO_ALLOWLIST entries.
export function parseAllowedHosts(originHost: string): string[] {
  const envList = (process.env.GO_TO_ALLOWLIST || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const set = new Set([originHost, 'hotmess.london', ...envList]);
  return Array.from(set);
}

export function isHostAllowed(host: string, allowed: string[]): boolean {
  return allowed.includes(host);
}
