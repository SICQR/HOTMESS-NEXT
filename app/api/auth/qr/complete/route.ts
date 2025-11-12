// HOTMESS ADD
import { jsonErr, jsonOk } from '@/lib/errors';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const CompleteSchema = z.object({ id: z.string().min(1) });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = CompleteSchema.safeParse(body);
  if (!parsed.success) return jsonErr('Invalid request', 'BAD_REQUEST', parsed.error.issues, { status: 400 });
  // stub: mark completed
  return jsonOk({ status: 'completed' as const });
}
