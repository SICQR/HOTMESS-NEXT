import { NextResponse } from 'next/server'
import type { GlobeDataset, CityMetricPoint } from '@/lib/types'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Query the most recent snapshot
    const { data: latestTsRow } = await supabaseAdmin
      .from('globe_city_metrics')
      .select('ts')
      .order('ts', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestTsRow?.ts) {
      const { data: rows } = await supabaseAdmin
        .from('globe_city_metrics')
        .select('city, country, lat, lng, listeners, ts')
        .eq('ts', latestTsRow.ts)
        .order('listeners', { ascending: false });
      if (rows && rows.length) {
        const points = rows as unknown as CityMetricPoint[];
        const payload: GlobeDataset = { points, generatedAt: latestTsRow.ts };
        return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });
      }
    }
  } catch {
    // fall back to mock below
  }
  const now = new Date().toISOString();
  const points: CityMetricPoint[] = [
    { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, listeners: 128, ts: now },
    { city: 'Manchester', country: 'UK', lat: 53.4808, lng: -2.2426, listeners: 52, ts: now },
    { city: 'New York', country: 'US', lat: 40.7128, lng: -74.006, listeners: 61, ts: now },
    { city: 'Berlin', country: 'DE', lat: 52.52, lng: 13.405, listeners: 44, ts: now },
    { city: 'Torremolinos', country: 'ES', lat: 36.6218, lng: -4.5009, listeners: 23, ts: now },
  ];
  const payload: GlobeDataset = { points, generatedAt: now };
  return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });
}
