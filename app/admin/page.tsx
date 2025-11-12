import type { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { SupabaseClient } from '@supabase/supabase-js';

export const metadata: Metadata = {
  title: 'Admin — HOTMESS',
  description: 'Live snapshot, issuances, credits, and room tiers'
};

function fmt(n: number) { return new Intl.NumberFormat().format(n); }

export default async function AdminPage() {
  // Narrow runtime env detection: only run queries if service key is present.
  const hasService = !!(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL);

  type Point = { city: string; country: string; listeners: number };
  type Issuance = { issued_at: string; intent: string; ttl_seconds: number; affiliate_id: string | null; campaign: string | null };
  type Credit = { created_at: string; affiliate_id: string; amount_cents: number; currency: string; source: string };
  type Tier = { user_id: string; tier: string; updated_at: string };

  let latestTs: string | null = null;
  let points: Point[] = [];
  let issuances: Issuance[] = [];
  let credits: Credit[] = [];
  let tiers: Tier[] = [];

  if (hasService) {
    const sb = supabaseAdmin as SupabaseClient;
    try {
      const latest = await sb
        .from('globe_city_metrics')
        .select('ts')
        .order('ts', { ascending: false })
        .limit(1)
        .maybeSingle();
      latestTs = latest?.data?.ts || null;
      if (latestTs) {
        const res = await sb
          .from('globe_city_metrics')
          .select('city,country,listeners')
          .eq('ts', latestTs)
          .order('listeners', { ascending: false })
          .limit(10);
        points = (res?.data || []) as Point[];
      }
    } catch {/* ignore for build */}

    try {
      const now = new Date();
      const since = new Date(now.getTime() - 24*60*60*1000).toISOString();
      const res = await sb
        .from('beacon_issuances')
        .select('issued_at,intent,ttl_seconds,affiliate_id,campaign')
        .gte('issued_at', since)
        .order('issued_at', { ascending: false })
        .limit(20);
      issuances = (res?.data || []) as Issuance[];
    } catch {/* ignore */}

    try {
      const res = await sb
        .from('affiliate_credits')
        .select('created_at,affiliate_id,amount_cents,currency,source')
        .order('created_at', { ascending: false })
        .limit(20);
      credits = (res?.data || []) as Credit[];
    } catch {/* ignore */}

    try {
      const res = await sb
        .from('room_tiers')
        .select('user_id,tier,updated_at')
        .order('updated_at', { ascending: false })
        .limit(20);
      tiers = (res?.data || []) as Tier[];
    } catch {/* ignore */}
  }

  return (
    <div className="px-6 py-24 max-w-6xl mx-auto space-y-10">
      <header>
        <h1 className="text-4xl font-bold">Admin</h1>
        <p className="text-sm text-neutral-400">Read-only overview of live metrics</p>
      </header>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 p-4">
          <h2 className="font-semibold mb-2">Latest Globe Snapshot</h2>
          <p className="text-xs text-neutral-400 mb-3">{latestTs ? new Date(latestTs).toLocaleString() : 'No snapshot yet'}</p>
          <ul className="text-sm space-y-1">
            {points.map(p => (
              <li key={p.city} className="flex justify-between"><span>{p.city}, {p.country}</span><span>{fmt(p.listeners)}</span></li>
            ))}
            {!points.length && <li className="text-neutral-500">No points</li>}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 p-4">
          <h2 className="font-semibold mb-2">Recent Affiliate Credits</h2>
          <ul className="text-sm space-y-1">
            {(credits||[]).map((c, i) => (
              <li key={i} className="grid grid-cols-4 gap-2">
                <span className="truncate" title={c.affiliate_id}>{c.affiliate_id}</span>
                <span>{c.currency?.toUpperCase() || 'USD'}</span>
                <span className="text-right">{fmt(c.amount_cents || 0)}</span>
                <span className="truncate" title={c.source}>{c.source}</span>
              </li>
            ))}
            {(!credits||!credits.length) && <li className="text-neutral-500">No credits</li>}
          </ul>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 p-4">
          <h2 className="font-semibold mb-2">QR Issuances (24h)</h2>
          <ul className="text-sm space-y-1">
            {(issuances||[]).map((r, i) => (
              <li key={i} className="grid grid-cols-5 gap-2">
                <span className="col-span-2 truncate" title={r.issued_at}>{new Date(r.issued_at).toLocaleTimeString()}</span>
                <span>{r.intent}</span>
                <span className="truncate" title={r.affiliate_id ?? undefined}>{r.affiliate_id || '-'}</span>
                <span className="truncate" title={r.campaign ?? undefined}>{r.campaign || '-'}</span>
              </li>
            ))}
            {(!issuances||!issuances.length) && <li className="text-neutral-500">No issuances</li>}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 p-4">
          <h2 className="font-semibold mb-2">Room Tiers</h2>
          <ul className="text-sm space-y-1">
            {(tiers||[]).map((t, i) => (
              <li key={i} className="grid grid-cols-3 gap-2">
                <span className="truncate" title={t.user_id}>{t.user_id}</span>
                <span className="uppercase">{t.tier}</span>
                <span className="text-right">{new Date(t.updated_at).toLocaleDateString()}</span>
              </li>
            ))}
            {(!tiers||!tiers.length) && <li className="text-neutral-500">No tiers</li>}
          </ul>
        </div>
      </section>
    </div>
  );
}
