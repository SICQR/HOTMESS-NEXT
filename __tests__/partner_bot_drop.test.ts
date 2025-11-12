// HOTMESS ADD: bot-drop endpoint tests
import { buildJsonRequest, withEnv } from './utils';

describe('partner bot-drop', () => {
  const routeUrl = 'http://localhost/api/partner/bot-drop';
  const baseEnv = {
    BOT_BASE_URL: 'https://bot.example',
    TELEGRAM_NOTIFY_SECRET: 'abc123abc123abc123',
    INTERNAL_PARTNER_SECRET: 'sekret'
  };

  beforeEach(() => { jest.resetModules(); jest.restoreAllMocks(); });

  test('403 without secret header', async () => {
    await withEnv(baseEnv, async () => {
      const mod = await import('@/app/api/partner/bot-drop/route');
      const req = buildJsonRequest(routeUrl, 'POST', { product_id: 'SKU-1', chat: '@hotmess' });
      const res = await mod.POST(req as unknown as Request);
      expect(res.status).toBe(403);
    });
  });

  test('403 with wrong secret', async () => {
    await withEnv(baseEnv, async () => {
      const mod = await import('@/app/api/partner/bot-drop/route');
      const req = buildJsonRequest(routeUrl, 'POST', { product_id: 'SKU-1', chat: '@hotmess' }, { 'x-internal-secret': 'nope' });
      const res = await mod.POST(req as unknown as Request);
      expect(res.status).toBe(403);
    });
  });

  test('200 success with upstream ok', async () => {
    await withEnv(baseEnv, async () => {
      const fetchOk = { ok: true, status: 200, json: async () => ({ success: true, data: { sent: 1 } }) } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      jest.spyOn(global, 'fetch').mockResolvedValue(fetchOk);
      const mod = await import('@/app/api/partner/bot-drop/route');
      const req = buildJsonRequest(routeUrl, 'POST', { product_id: 'SKU-1', chat: 'https://t.me/HOTMESSRADIOXXX/69' }, { 'x-internal-secret': baseEnv.INTERNAL_PARTNER_SECRET });
      const res = await mod.POST(req as unknown as Request);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });
  });

  test('502 when upstream fails', async () => {
    await withEnv(baseEnv, async () => {
      const fetchFail = { ok: false, status: 502, json: async () => ({ error: 'x' }) } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      jest.spyOn(global, 'fetch').mockResolvedValue(fetchFail);
      const mod = await import('@/app/api/partner/bot-drop/route');
      const req = buildJsonRequest(routeUrl, 'POST', { product_id: 'SKU-2', chat: '@hotmess' }, { 'x-internal-secret': baseEnv.INTERNAL_PARTNER_SECRET });
      const res = await mod.POST(req as unknown as Request);
      expect(res.status).toBe(502);
    });
  });
});
