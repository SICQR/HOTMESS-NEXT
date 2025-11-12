// HOTMESS ADD
import { signGo, verifyGo } from '@/lib/hmac';

describe('/go HMAC helpers', () => {
  it('signs and verifies with 120s window', () => {
    const secret = 'testsecret';
    const partner = 'p1';
    const offer = 'o1';
    const ts = Math.floor(Date.now() / 1000);
    const sig = signGo(partner, offer, ts, secret);
    expect(verifyGo(partner, offer, ts, sig, secret, 120)).toBe(true);
  });

  it('fails outside window', () => {
    const secret = 'testsecret';
    const partner = 'p1';
    const offer = 'o1';
    const ts = Math.floor(Date.now() / 1000) - 10000;
    const sig = signGo(partner, offer, ts, secret);
    expect(verifyGo(partner, offer, ts, sig, secret, 120)).toBe(false);
  });
});
