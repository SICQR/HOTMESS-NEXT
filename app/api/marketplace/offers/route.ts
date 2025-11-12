// HOTMESS ADD
import { NextRequest } from 'next/server';
import { OfferListQuerySchema } from '@/lib/schemas/marketplace';
import { jsonErr, jsonOk } from '@/lib/errors';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/log';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parsed = OfferListQuerySchema.safeParse({ partner: searchParams.get('partner') || undefined });
  if (!parsed.success) return jsonErr('Invalid query', 'BAD_REQUEST', parsed.error.issues, { status: 400 });
  try {
    let query = supabase.from('marketplace_offers').select('*').eq('active', true);
    if (parsed.data.partner) query = query.eq('partner_id', parsed.data.partner);
    const { data, error } = await query.limit(100);
    if (error) throw error;
    return jsonOk({ offers: data || [] });
  } catch (e) {
    logger.error('[HM] offers fetch failed', { err: (e as Error).message });
    return jsonErr('Internal error', 'INTERNAL', undefined, { status: 500 });
  }
}
