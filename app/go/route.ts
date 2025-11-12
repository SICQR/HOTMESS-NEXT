import { NextResponse } from 'next/server';
import { verifyGo } from '@/lib/hmac';
import { jsonErr } from '@/lib/errors';
import { logger } from '@/lib/log';
import { supabase } from '@/lib/supabase';
import { parseAllowedHosts, isHostAllowed } from '@/lib/links';
import { trackServer } from '@/lib/analyticsServer';

// Minimal offers map used when explicit `to` is not provided
const OFFERS: Record<string, string> = {
  care: '/care',
  wet: '/records',
  radio: '/radio',
  shop: '/shop',
  join: '/rooms',
  records: '/records',
  rooms: '/rooms',
};

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const p = url.searchParams;
  const partner = p.get('partner') || '';
  const offer = p.get('offer') || '';
  const sig = p.get('sig') || '';
  const ts = Number(p.get('ts')) || 0;
  const to = p.get('to') || '';

  if (!partner || !offer || !sig || !ts) {
    return jsonErr('Missing parameters', 'BAD_REQUEST', undefined, { status: 400 });
  }

  const secret = process.env.LINK_SIGNING_SECRET || process.env.NEXT_PUBLIC_LINK_SIGNING_SECRET || '';
  if (!secret) {
    logger.warn('[HM] /go missing LINK_SIGNING_SECRET');
  }

  const valid = secret ? verifyGo(partner, offer, ts, sig, secret, 120) : false;
  if (!valid) {
    logger.warn('[HM] /go invalid signature', { partner, offer, ts });
  }

  // Logging best-effort (ignore errors)
  try {
    await supabase.from('marketplace_clicks').insert({
      partner_slug: partner,
      offer_code: offer,
      hmac_valid: valid,
      ts: new Date(ts * 1000).toISOString(),
      user_agent: req.headers.get('user-agent') || null,
      ip: req.headers.get('x-forwarded-for') || null,
    });
  } catch (e) {
    logger.error('[HM] /go insert click failed', { err: (e as Error).message });
  }

  if (!valid) {
    return jsonErr('invalid_signature', 'FORBIDDEN', undefined, { status: 403 });
  }

  let dest: string | null = null;
  if (to) {
    try {
      const parsed = new URL(to);
      const allowlistHosts = parseAllowedHosts(url.host);
      if (!isHostAllowed(parsed.host, allowlistHosts)) {
        logger.warn('[HM] /go disallowed target', { requested_host: parsed.host, allowlist: allowlistHosts });
        // Metric: blocked offer_click
        trackServer('offer_click', { blocked: true, host: parsed.host, kind: 'disallowed_target' });
        return jsonErr('disallowed_target', 'FORBIDDEN', undefined, { status: 403 });
      }
      dest = parsed.toString();
    } catch {
      return jsonErr('invalid_target_url', 'BAD_REQUEST', undefined, { status: 400 });
    }
  } else {
    const mapped = OFFERS[offer as keyof typeof OFFERS];
    if (!mapped) return jsonErr('unknown_offer', 'BAD_REQUEST', undefined, { status: 400 });
    dest = new URL(mapped, url.origin).toString();
  }

  const out = new URL(dest);
  out.searchParams.set('utm_source', 'go');
  out.searchParams.set('utm_medium', partner);
  out.searchParams.set('utm_campaign', offer);

  return NextResponse.redirect(out, { status: 302 });
}
