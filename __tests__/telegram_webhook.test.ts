// HOTMESS ADD
import { buildJsonRequest, withEnv } from './utils';

describe('telegram webhook', () => {
  beforeEach(() => { jest.resetModules(); });
  it('rejects bad secret', async () => {
    await withEnv({ TELEGRAM_WEBHOOK_SECRET: 'test-secret', NEXT_SAFE_MODE: '0', NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon' }, async () => {
      const mod = await import('@/app/api/telegram/webhook/route');
      const req = buildJsonRequest('http://localhost/api/telegram/webhook', 'POST', { update_id: 1 }, { 'x-telegram-bot-api-secret-token': 'wrong' });
      const res = await mod.POST(req as unknown as Request);
      expect(res.status).toBe(403);
    });
  });

  it('accepts correct secret', async () => {
    await withEnv({ TELEGRAM_WEBHOOK_SECRET: 'test-secret', NEXT_SAFE_MODE: '0', NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon' }, async () => {
      const mod = await import('@/app/api/telegram/webhook/route');
      const req = buildJsonRequest('http://localhost/api/telegram/webhook', 'POST', { update_id: 2, message: { message_id: 1, text: '/start', chat: { id: 1, type: 'private' } } }, { 'x-telegram-bot-api-secret-token': 'test-secret' });
      const res = await mod.POST(req as unknown as Request);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });
  });
});
