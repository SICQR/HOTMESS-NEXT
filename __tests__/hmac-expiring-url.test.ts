import { signExpiringUrl, verifyExpiringUrl } from '@/lib/server/urlSign';

describe('Expiring URL HMAC helpers', () => {
  const secret = 'test-secret-hmac';
  const target = 'https://example.com/resource?id=123';

  test('sign + verify happy path', () => {
    const { sig, exp, signedUrl } = signExpiringUrl(target, secret, 60);
    expect(sig).toHaveLength(64);
    expect(exp).toBeGreaterThan(Math.floor(Date.now()/1000));
    expect(signedUrl).toContain(`sig=${sig}`);
    expect(verifyExpiringUrl(target, sig, exp, secret)).toBe(true);
  });

  test('expired link fails verification (past exp)', () => {
    const { sig, exp } = signExpiringUrl(target, secret, 1); // very short ttl
    // Wait artificially by simulating past exp
    const pastExp = exp - 5; // ensure past
    expect(verifyExpiringUrl(target, sig, pastExp, secret)).toBe(false);
  });

  test('tampered signature fails', () => {
    const { sig, exp } = signExpiringUrl(target, secret, 30);
    const badSig = sig.slice(0,-1) + (sig.slice(-1) === 'a' ? 'b' : 'a');
    expect(verifyExpiringUrl(target, badSig, exp, secret)).toBe(false);
  });
});
