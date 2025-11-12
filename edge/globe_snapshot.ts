// Deno edge function to snapshot live listener metrics and push to Supabase
// Deploy via Supabase Edge Functions and schedule hourly.
// deno-lint-ignore-file no-explicit-any
// @ts-expect-error Deno edge import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-expect-error Deno edge import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// @ts-expect-error Deno global
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

interface CityPoint { city: string; country: string; lat: number; lng: number; listeners: number }

async function fetchRadioKing(): Promise<CityPoint[]> {
  // @ts-expect-error Deno global
  const base = Deno.env.get('RADIOKING_BASE');
  // @ts-expect-error Deno global
  const slug = Deno.env.get('RADIOKING_SLUG');
  if (!base || !slug) return [];
  try {
    const res = await fetch(`${base}/widget/radio/${slug}/track/current?format=json`);
    if (!res.ok) return [];
    const json = await res.json();
    // RadioKing doesn't expose geo; treat as primary London cluster.
    const listeners = typeof json.listeners === 'number' ? json.listeners : 0;
    return [
      { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, listeners },
    ];
  } catch { return []; }
}

async function fetchAzuracast(): Promise<CityPoint[]> {
  // @ts-expect-error Deno global
  const api = Deno.env.get('AZURACAST_API_BASE');
  // @ts-expect-error Deno global
  const key = Deno.env.get('AZURACAST_API_KEY');
  if (!api) return [];
  try {
    const url = key ? `${api}/nowplaying?key=${key}` : `${api}/nowplaying`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    // Shape: [{ listeners: { total }, station: { name } }]
    const first = Array.isArray(json) ? json[0] : null;
    const total = first?.listeners?.total ?? 0;
    // Assume fallback cluster in Manchester if distinct from RadioKing.
    return total ? [{ city: 'Manchester', country: 'UK', lat: 53.4808, lng: -2.2426, listeners: total }] : [];
  } catch { return []; }
}

async function fetchListeners(): Promise<CityPoint[]> {
  const rk = await fetchRadioKing();
  const az = await fetchAzuracast();
  // Merge by city (sum listeners)
  const map = new Map<string, CityPoint>();
  [...rk, ...az].forEach(p => {
    const existing = map.get(p.city);
    if (!existing) map.set(p.city, p); else existing.listeners += p.listeners;
  });
  return [...map.values()].filter(p => p.listeners > 0);
}

serve(async (req: Request) => {
  // @ts-expect-error Deno global
  const token = Deno.env.get('GLOBE_CRON_TOKEN');
  const auth = req.headers.get('authorization') || '';
  if (!token || auth !== `Bearer ${token}`) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } });
  }
  const points = await fetchListeners();
  const { error } = await supabase.rpc('globe_upsert_snapshot', { points });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
  return new Response(JSON.stringify({ ok: true, count: points.length }), { headers: { 'content-type': 'application/json' } });
});
