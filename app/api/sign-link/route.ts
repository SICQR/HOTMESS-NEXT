import { NextRequest, NextResponse } from 'next/server';
import { signExpiringUrl } from '@/lib/server/urlSign';

interface SignLinkBody { targetUrl?: string; ttlSeconds?: number }

// POST { targetUrl: string, ttlSeconds?: number }
export async function POST(req: NextRequest) {
  let body: SignLinkBody | undefined;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const targetUrl = body?.targetUrl;
  const ttlSeconds = body?.ttlSeconds ?? 60 * 60 * 24; // 24h default
  const secret = process.env.LINK_SIGNING_SECRET || '';
  if (!secret) return NextResponse.json({ error: 'LINK_SIGNING_SECRET not configured' }, { status: 500 });
  try {
    const { sig, exp, signedUrl } = signExpiringUrl(String(targetUrl), secret, Number(ttlSeconds));
    return NextResponse.json({ signedUrl, sig, exp });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
