import { createHmac } from 'crypto'

export function sign(params: Record<string, string | number>, secret: string) {
  const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&')
  return createHmac('sha256', secret).update(sorted).digest('hex')
}

export function verify(params: URLSearchParams, secret: string) {
  const sig = params.get('sig') || ''
  const entries: Record<string,string> = {}
  params.forEach((v,k) => { if (k !== 'sig') entries[k] = v })
  const expected = sign(entries, secret)
  return sig === expected
}

// HOTMESS ADD: GO router signing helpers (partner.offer.ts)
export function signGo(partner: string, offer: string, ts: number, secret: string): string {
  const payload = `${partner}.${offer}.${ts}`;
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export function verifyGo(partner: string, offer: string, ts: number, sig: string, secret: string, maxAgeSeconds = 120): boolean {
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > maxAgeSeconds) return false;
  const expected = signGo(partner, offer, ts, secret);
  return sig === expected;
}
