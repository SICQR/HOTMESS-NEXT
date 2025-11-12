import { NextRequest } from 'next/server';
import { createBeacon, listBeacons, resolveBeacon, rotateBeaconNonce } from '@/lib/beacons';
import { isApiError } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const nonce = searchParams.get('nonce');
  const rotate = searchParams.get('rotate');
  if (rotate && id) {
    rotateBeaconNonce(id);
  }
  if (id || nonce) {
    const resolution = resolveBeacon(id || nonce!);
    if (!resolution) {
      return Response.json({ error: 'NOT_FOUND' }, { status: 404 });
    }
    return Response.json(resolution);
  }
  return Response.json({ beacons: listBeacons() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const intentId = body.intentId as string | undefined;
    if (!intentId) return Response.json({ error: 'intentId required' }, { status: 400 });
    const beacon = createBeacon(intentId, body.ownerTier || 'guest', body.ttlSeconds || 300);
    return Response.json(beacon, { status: 201 });
  } catch (e: unknown) {
    const errPayload = isApiError(e) ? e : { error: 'INTERNAL', details: (e as Error).message };
    return Response.json(errPayload, { status: 500 });
  }
}
