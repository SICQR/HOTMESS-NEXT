// HOTMESS ADD
import { jsonOk } from '@/lib/errors';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ success: false, error: { message: 'id required', code: 'BAD_REQUEST' } }, { status: 400 });
  // stub: always pending
  return jsonOk({ status: 'pending' as const });
}
