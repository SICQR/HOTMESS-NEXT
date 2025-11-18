import { NextRequest, NextResponse } from 'next/server';
import { verifyExpiringUrl } from '@/lib/server/urlSign';

// GET /api/verify-link?url=...&sig=...&exp=...
export async function GET(req: NextRequest) {
  const urlObj = new URL(req.url);
  const targetUrl = urlObj.searchParams.get('url');
  const sig = urlObj.searchParams.get('sig');
  const expRaw = urlObj.searchParams.get('exp');
  if (!targetUrl || !sig || !expRaw) {
    return NextResponse.json({ valid: false, error: 'Missing query parameters' }, { status: 400 });
  }
  const secret = process.env.LINK_SIGNING_SECRET || '';
  if (!secret) return NextResponse.json({ error: 'LINK_SIGNING_SECRET not configured' }, { status: 500 });
  const exp = Number(expRaw);
  const valid = verifyExpiringUrl(String(targetUrl), String(sig), exp, secret);
  return NextResponse.json({ valid });
}
