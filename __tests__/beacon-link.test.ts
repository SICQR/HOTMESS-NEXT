import { sanitizeTtlSeconds, computeExpiresAt } from '@/lib/links';

describe('Beacon link helpers', () => {
  it('clamps ttl within bounds', () => {
    expect(sanitizeTtlSeconds('5')).toBe(10); // lower bound
    expect(sanitizeTtlSeconds('999')).toBe(120); // upper bound
    expect(sanitizeTtlSeconds('30')).toBe(30);
  });

  it('computes expiry time roughly ttl seconds ahead', () => {
    const now = Date.now();
    const ttl = 45;
    const expires = computeExpiresAt(ttl, now);
    const diff = Date.parse(expires) - now;
    expect(diff).toBeGreaterThanOrEqual(ttl * 1000 - 5); // allow small drift
    expect(diff).toBeLessThanOrEqual(ttl * 1000 + 5);
  });
});
