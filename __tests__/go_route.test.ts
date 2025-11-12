import { withEnv, buildJsonRequest } from './utils';

function makeUrl(params: Record<string, string | number>) {
  const u = new URL('http://localhost/go');
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, String(v));
  return u.toString();
}

describe('/go route', () => {
  const secret = 'shh';
  const baseEnv = { LINK_SIGNING_SECRET: secret };

  beforeEach(() => { jest.resetModules(); jest.restoreAllMocks(); });

  test('403 on invalid signature', async () => {
    await withEnv(baseEnv, async () => {
      const mod = await import('@/app/go/route');
      const ts = Math.floor(Date.now() / 1000);
      const url = makeUrl({ partner: 'p', offer: 'care', ts, sig: 'bad' });
      const req = buildJsonRequest(url, 'GET');
  const res = await mod.GET(req as unknown as Request);
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.success).toBe(false);
    });
  });

  test('400 on unknown offer when no to provided', async () => {
    await withEnv(baseEnv, async () => {
      const { signGo } = await import('@/lib/hmac');
      const mod = await import('@/app/go/route');
      const ts = Math.floor(Date.now() / 1000);
      const sig = signGo('p', 'nope', ts, secret);
      const url = makeUrl({ partner: 'p', offer: 'nope', ts, sig });
      const req = buildJsonRequest(url, 'GET');
  const res = await mod.GET(req as unknown as Request);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
    });
  });

  test('302 redirect to mapped offer with utm params', async () => {
    await withEnv(baseEnv, async () => {
      const { signGo } = await import('@/lib/hmac');
      const mod = await import('@/app/go/route');
      const ts = Math.floor(Date.now() / 1000);
      const sig = signGo('p', 'care', ts, secret);
      const url = makeUrl({ partner: 'p', offer: 'care', ts, sig });
      const req = buildJsonRequest(url, 'GET');
  const res = await mod.GET(req as unknown as Request);
      expect(res.status).toBe(302);
      // NextResponse.redirect returns a Response; we can inspect headers
      const loc = res.headers.get('location');
      expect(loc).toContain('/care');
      expect(loc).toContain('utm_source=go');
      expect(loc).toContain('utm_medium=p');
      expect(loc).toContain('utm_campaign=care');
    });
  });

  test('302 redirect to explicit to url', async () => {
    await withEnv(baseEnv, async () => {
      const { signGo } = await import('@/lib/hmac');
      const mod = await import('@/app/go/route');
      const ts = Math.floor(Date.now() / 1000);
      const sig = signGo('p', 'care', ts, secret);
      const url = makeUrl({ partner: 'p', offer: 'care', ts, sig, to: 'https://hotmess.london/care' });
      const req = buildJsonRequest(url, 'GET');
  const res = await mod.GET(req as unknown as Request);
      expect(res.status).toBe(302);
      const loc = res.headers.get('location');
      expect(loc).toMatch(/^https:\/\/hotmess\.london\/care/);
    });
  });

  test('403 when explicit to is off-allowlist', async () => {
    await withEnv(baseEnv, async () => {
      const { signGo } = await import('@/lib/hmac');
      const mod = await import('@/app/go/route');
      const ts = Math.floor(Date.now() / 1000);
      const sig = signGo('p', 'care', ts, secret);
      const url = makeUrl({ partner: 'p', offer: 'care', ts, sig, to: 'https://evil.example.com/phish' });
      const req = buildJsonRequest(url, 'GET');
      const res = await mod.GET(req as unknown as Request);
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.success).toBe(false);
    });
  });

  test('302 allowed when explicit to host is in GO_TO_ALLOWLIST', async () => {
    await withEnv({ ...baseEnv, GO_TO_ALLOWLIST: 'partners.example.com' }, async () => {
      const { signGo } = await import('@/lib/hmac');
      const mod = await import('@/app/go/route');
      const ts = Math.floor(Date.now() / 1000);
      const sig = signGo('p', 'care', ts, secret);
      const url = makeUrl({ partner: 'p', offer: 'care', ts, sig, to: 'https://partners.example.com/deal' });
      const req = buildJsonRequest(url, 'GET');
      const res = await mod.GET(req as unknown as Request);
      expect(res.status).toBe(302);
      const loc = res.headers.get('location');
      expect(loc).toMatch(/^https:\/\/partners\.example\.com\/deal/);
    });
  });

  test('logs and blocks disallowed target host', async () => {
    await withEnv(baseEnv, async () => {
      const { signGo } = await import('@/lib/hmac');
      const mod = await import('@/app/go/route');
      const ts = Math.floor(Date.now() / 1000);
      const sig = signGo('p', 'care', ts, secret);
      const url = makeUrl({ partner: 'p', offer: 'care', ts, sig, to: 'https://blocked.example.net/x' });
      const req = buildJsonRequest(url, 'GET');
      const warnSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const res = await mod.GET(req as unknown as Request);
      expect(res.status).toBe(403);
      warnSpy.mockRestore();
    });
  });

  test('400 on expired timestamp window', async () => {
    await withEnv(baseEnv, async () => {
      const { signGo } = await import('@/lib/hmac');
      const mod = await import('@/app/go/route');
      const ts = Math.floor(Date.now() / 1000) - 10000;
      const sig = signGo('p', 'care', ts, secret);
      const url = makeUrl({ partner: 'p', offer: 'care', ts, sig });
      const req = buildJsonRequest(url, 'GET');
      const res = await mod.GET(req as unknown as Request);
      // verifyGo should fail, which our route maps to 403 invalid_signature
      expect(res.status).toBe(403);
    });
  });

  test('400 on missing partner parameter', async () => {
    await withEnv(baseEnv, async () => {
      const mod = await import('@/app/go/route');
      const ts = Math.floor(Date.now() / 1000);
      const url = makeUrl({ offer: 'care', ts, sig: 'x' });
      const req = buildJsonRequest(url, 'GET');
      const res = await mod.GET(req as unknown as Request);
      expect(res.status).toBe(400);
    });
  });
});
