// HOTMESS ADD
/**
 * Minimal test that imports the QR scan route and ensures it returns unified shape.
 */
import { POST as scanPOST } from '@/app/api/qr/scan/route';
import { withEnv } from './utils';

class MockNextRequest {
  private _body: unknown;
  headers = { get: () => null };
  constructor(body: unknown) { this._body = body; }
  async json() { return this._body; }
}

describe('QR scan API', () => {
  it('returns success for valid payload', async () => {
    await withEnv({ NEXT_SAFE_MODE: '0', NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon' }, async () => {
      const req = new MockNextRequest({ qrCode: 'TEST-QR', userId: '11111111-1111-1111-1111-111111111111' });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await scanPOST(req as any); // handler expects NextRequest-like
      const json = await res.json();
      // Debug output if the shape isn't as expected
      // Guard to surface unexpected shape during debugging
      if (!(json && typeof json === 'object' && 'success' in json)) {
        console.error('QR test unexpected response body', json); // intentional console for diagnosis
      }
      expect(json.success).toBe(true);
      expect(json.data.points).toBeGreaterThanOrEqual(10);
      expect(json.data.points).toBeLessThanOrEqual(50);
    });
  });
});
