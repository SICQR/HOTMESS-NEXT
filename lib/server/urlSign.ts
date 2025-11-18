import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Sign an absolute URL with an embedded expiration timestamp.
 * Contract:
 *  input: targetUrl (string, absolute), secret (string), ttlSeconds (number > 0)
 *  output: { sig: hex(sha256), exp: epochSeconds, signedUrl: targetUrl + sig&exp qp }
 *  errors: throws if targetUrl invalid or ttlSeconds non-positive.
 */
export function signExpiringUrl(targetUrl: string, secret: string, ttlSeconds = 60 * 60 * 24) {
  if (!targetUrl || typeof targetUrl !== 'string') throw new Error('targetUrl required');
  if (!/^https?:\/\//i.test(targetUrl)) throw new Error('targetUrl must be absolute http/https');
  if (!ttlSeconds || ttlSeconds <= 0) throw new Error('ttlSeconds must be > 0');
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${targetUrl}|${exp}`;
  const sig = createHmac('sha256', secret).update(payload).digest('hex');
  const qpJoin = targetUrl.includes('?') ? '&' : '?';
  return { sig, exp, signedUrl: `${targetUrl}${qpJoin}sig=${sig}&exp=${exp}` };
}

/**
 * Verify previously signed URL + signature + expiration.
 * Returns boolean; never throws.
 */
export function verifyExpiringUrl(targetUrl: string, sig: string, exp: number, secret: string) {
  try {
    if (!sig || typeof sig !== 'string') return false;
    if (!exp || typeof exp !== 'number') return false;
    const now = Math.floor(Date.now() / 1000);
    if (now > exp) return false; // expired
    if (!/^https?:\/\//i.test(targetUrl)) return false;
    // quick length check (sha256 hex = 64 chars)
    if (sig.length !== 64 || /[^0-9a-f]/i.test(sig)) return false;
    const payload = `${targetUrl}|${exp}`;
    const expected = createHmac('sha256', secret).update(payload).digest('hex');
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(sig, 'hex'));
  } catch {
    return false;
  }
}
