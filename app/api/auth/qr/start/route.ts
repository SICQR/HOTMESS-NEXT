// HOTMESS ADD
import { jsonErr, jsonOk } from '@/lib/errors';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const StartSchema = z.object({ userHint: z.string().optional() });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = StartSchema.safeParse(body);
  if (!parsed.success) return jsonErr('Invalid request', 'BAD_REQUEST', parsed.error.issues, { status: 400 });
  // stub: return a token id to poll
  return jsonOk({ tokenId: 'stub-token', qr: 'STUB-QR' }, { status: 201 });
}
