// HOTMESS ADD
import { NextRequest } from 'next/server';
import { PartnerSlugSchema } from '@/lib/schemas/marketplace';
import { jsonErr, jsonOk } from '@/lib/errors';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/log';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const parsed = PartnerSlugSchema.safeParse({ slug });
  if (!parsed.success) return jsonErr('Invalid slug', 'BAD_REQUEST', parsed.error.issues, { status: 400 });
  try {
    const { data: partner, error } = await supabase
      .from('marketplace_partners')
      .select('*')
      .eq('slug', parsed.data.slug)
      .single();
    if (error) throw error;
    if (!partner) return jsonErr('Not found', 'NOT_FOUND', undefined, { status: 404 });

    const { data: offers } = await supabase
      .from('marketplace_offers')
      .select('*')
      .eq('partner_id', partner.id)
      .eq('active', true)
      .limit(100);

    return jsonOk({ partner, offers: offers || [] });
  } catch (e) {
    logger.error('[HM] partner fetch failed', { err: (e as Error).message });
    return jsonErr('Internal error', 'INTERNAL', undefined, { status: 500 });
  }
}
