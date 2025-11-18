import { z } from 'zod';
import { logger } from '../../../../lib/log';

// Helper: parse raw body safely in varied test/runtime environments
async function readJson(request: Request): Promise<any> {
  try {
    let raw = '';
    try {
      raw = await request.text();
    } catch {
      raw = '';
    }
    if (!raw && (request as any).body) {
      // Attempt manual stream read
      const reader = (request as any).body.getReader?.();
      if (reader) {
        const chunks: Uint8Array[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) chunks.push(value);
        }
        raw = new TextDecoder().decode(Buffer.concat(chunks as any));
      }
    }
    if (!raw) return {};
    return JSON.parse(raw);
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
