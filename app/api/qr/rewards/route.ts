import { z } from 'zod';
import { logger } from '../../../../lib/log';

// Narrow JSON shape expected for POST body
interface QRRewardsBody {
  userId?: string;
  // future: points?: number; etc.
  [key: string]: unknown;
}

// Helper: parse raw body safely in varied test/runtime environments (no stream fallback needed)
async function readJson(request: Request): Promise<QRRewardsBody> {
  try {
    const raw = await request.text();
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as QRRewardsBody;
    }
    return {};
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  // Some Jest environments lack Request.json(); fall back to manual parsing
  const json = await readJson(request);
  const userId = typeof json.userId === 'string' ? json.userId : '';
  if (!userId) {
    logger.debug('invalid request body', { body: json });
    return new Response(JSON.stringify({ success: false, error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const isProd = process.env.NODE_ENV === 'production' || process.env.FORCE_QR_PROD === '1';
  const allowMock = process.env.NEXT_PUBLIC_ALLOW_MOCK_IDS === '1';
  if (isProd && !allowMock) {
    // enforce RFC-4122 UUID
    const uuidResult = z.string().uuid().safeParse(userId);
    if (!uuidResult.success) {
      logger.warn('invalid user id format', { userId });
      return new Response(JSON.stringify({ success: false, error: 'Invalid user ID format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // TODO: redemption logic here (placeholder)
  logger.info('redeem attempt', { userId });
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Optional GET handler mirroring POST validation to support hooks/useQRPoints & other fetchers
export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId') || '';
  const isProd = process.env.NODE_ENV === 'production' || process.env.FORCE_QR_PROD === '1';
  const allowMock = process.env.NEXT_PUBLIC_ALLOW_MOCK_IDS === '1';
  if (isProd && !allowMock) {
    const uuidResult = z.string().uuid().safeParse(userId);
    if (!uuidResult.success) {
      logger.warn('invalid user id format', { userId });
      return new Response(JSON.stringify({ success: false, error: 'Invalid user ID format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
  if (!userId) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  logger.info('redeem attempt (GET)', { userId });
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
