import { NextRequest, NextResponse } from 'next/server';
// Stripe types only if package present; fallback to runtime import when absent.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Stripe from 'stripe';
import 'server-only';

export const dynamic = 'force-dynamic';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2024-06-20' }) : null;

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

export async function POST(req: NextRequest) {
  if (!stripe || !webhookSecret) {
    return json(200, { received: true, mode: 'disabled' });
  }
  const raw = await req.text();
  const sig = req.headers.get('stripe-signature') || '';
  let event: { id: string; type: string };
  try {
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
  } catch {
    return json(400, { error: 'invalid_signature' });
  }

  // Minimal event router (extend as needed)
  switch (event.type) {
    case 'checkout.session.completed': {
      try {
        const e: Record<string, unknown> = (event as unknown as { data?: { object?: Record<string, unknown> } }).data?.object || {};
        const meta = (e.metadata as Record<string, unknown>) || {};
        const affiliate_id = typeof meta.affiliate_id === 'string' ? meta.affiliate_id : null;
        const amount_total = typeof e.amount_total === 'number' ? e.amount_total : 0;
        const currency = typeof e.currency === 'string' ? e.currency : 'usd';
        if (affiliate_id) {
          const { supabaseAdmin } = await import('@/lib/supabase/admin');
          const { randomUUID } = await import('crypto');
          await supabaseAdmin.from('affiliate_credits').insert({
            id: randomUUID(),
            affiliate_id,
            amount_cents: amount_total,
            currency,
            source: 'stripe:checkout.session.completed',
          });
        }
      } catch {/* noop */}
      break;
    }
    case 'payment_intent.succeeded': {
      try {
        const e: Record<string, unknown> = (event as unknown as { data?: { object?: Record<string, unknown> } }).data?.object || {};
        const meta = (e.metadata as Record<string, unknown>) || {};
        const user_id = typeof meta.user_id === 'string' ? meta.user_id : null;
        const tier = typeof meta.tier === 'string' ? meta.tier : 'member';
        if (user_id) {
          const { supabaseAdmin } = await import('@/lib/supabase/admin');
          await supabaseAdmin.from('room_tiers')
            .upsert({ user_id, tier, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
        }
      } catch {/* noop */}
      break;
    }
    default:
      break;
  }

  return json(200, { received: true });
}

export async function GET() {
  return json(200, { ok: true, status: stripe ? 'active' : 'stub' });
}
