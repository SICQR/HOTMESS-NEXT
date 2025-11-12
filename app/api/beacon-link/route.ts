import { NextRequest, NextResponse } from 'next/server';
import { sign } from '@/lib/server/hmac';
import { sanitizeTtlSeconds, computeExpiresAt, mapIntentToParam } from '@/lib/links';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { randomUUID } from 'crypto';

// Return a short-lived, HMAC-signed link suitable for a rotating QR code.
// Maps high-level intents to existing /r redirect params.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const intent = (url.searchParams.get('intent') || 'listen').toLowerCase();
  const rid = url.searchParams.get('rid') || undefined; // request id (optional)
  const mid = url.searchParams.get('mid') || undefined; // media id (optional)
  const affiliateId = url.searchParams.get('aid') || undefined; // affiliate id (optional)
  const campaign = url.searchParams.get('cmp') || undefined;  // campaign (optional)
  const ttl = sanitizeTtlSeconds(url.searchParams.get('ttl'));

  // Map intent -> p param for /r route
  const p = mapIntentToParam(intent);

  const base = url.origin;
  const params: Record<string, string> = { p };
  if (rid) params.rid = rid;
  if (mid) params.mid = mid;

  const secret = process.env.LINK_SIGNING_SECRET || '';
  if (!secret) {
    return NextResponse.json({ error: 'LINK_SIGNING_SECRET not configured' }, { status: 500 });
  }

  const sig = sign(params, secret);
  const qp = new URLSearchParams({ ...params, sig });
  const signedUrl = `${base}/r?${qp.toString()}`;

  const now = Date.now();
  const expiresAt = computeExpiresAt(ttl, now);

  // Best-effort issuance logging (requires service role); do not fail the request if it errors.
  try {
    const id = randomUUID();
  const ip = (req.headers.get('x-forwarded-for') || '').toString();
    const ua = req.headers.get('user-agent') || '';
    await supabaseAdmin.from('beacon_issuances').insert({
      id,
      intent,
      issued_at: new Date(now).toISOString(),
      expires_at: expiresAt,
      ttl_seconds: ttl,
      ip,
      user_agent: ua,
      affiliate_id: affiliateId,
      campaign,
    });
  } catch {
    // ignore
  }

  return NextResponse.json({ url: signedUrl, intent, expiresAt });
}
