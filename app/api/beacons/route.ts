// HOTMESS ADD
import { NextRequest } from 'next/server';
import { jsonErr, jsonOk } from '@/lib/errors';
import { createBeacon, listBeacons, resolveBeacon } from '@/lib/beacons';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CreateSchema = z.object({ intentId: z.string().min(1), ownerTier: z.string().optional(), ttlSeconds: z.number().int().min(60).max(86400).optional() });

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const nonce = searchParams.get('nonce');
  if (id || nonce) {
    const resolved = resolveBeacon(id || nonce!);
    if (!resolved) return jsonErr('Not found', 'NOT_FOUND', undefined, { status: 404 });
    return jsonOk(resolved);
  }
  return jsonOk({ beacons: listBeacons() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) return jsonErr('Invalid request', 'BAD_REQUEST', parsed.error.issues, { status: 400 });
  // HOTMESS ADD ensure ownerTier cast to valid union
  const ownerTier = (parsed.data.ownerTier === 'member' || parsed.data.ownerTier === 'admin') ? parsed.data.ownerTier : 'guest';
  const b = createBeacon(parsed.data.intentId, ownerTier, parsed.data.ttlSeconds || 300);
    return jsonOk(b, { status: 201 });
  } catch {
    return jsonErr('Internal error', 'INTERNAL', undefined, { status: 500 });
  }
}
