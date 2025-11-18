import { z } from 'zod';
import { NextResponse } from 'next/server';
import { logger } from '../../../../lib/log';

const NODE_ENV = process.env.NODE_ENV;
const ALLOW_MOCK = process.env.NEXT_PUBLIC_ALLOW_MOCK_IDS === '1';

const bodySchema = z.object({
  userId: z.string().min(1),
  // other fields may be present
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    logger.warn('invalid request body', { body: json });
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  const { userId } = parsed.data;

  if (NODE_ENV === 'production' && !ALLOW_MOCK) {
    // enforce RFC-4122 UUID
    const uuidResult = z.string().uuid().safeParse(userId);
    if (!uuidResult.success) {
      logger.warn('invalid user id format', { userId });
      return NextResponse.json({ success: false, error: 'Invalid user ID format' }, { status: 400 });
    }
  }

  // TODO: redemption logic here (placeholder)
  logger.info('redeem attempt', { userId });
  return NextResponse.json({ success: true });
}
