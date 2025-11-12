import { NextRequest, NextResponse } from 'next/server';
import { resolveBeacon } from '@/lib/beacons';

export const dynamic = 'force-dynamic';

// Resolve a beacon nonce to a redirect URL, or return JSON when ?json=1
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const b = searchParams.get('b') || searchParams.get('id') || searchParams.get('nonce');
  const json = searchParams.get('json');
  if (!b) return NextResponse.json({ error: 'missing beacon id/nonce' }, { status: 400 });
  const resolution = resolveBeacon(b);
  if (!resolution) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (json) return NextResponse.json(resolution);
  const to = resolution.resolvedUrl || '/';
  return NextResponse.redirect(new URL(to, req.url));
}
