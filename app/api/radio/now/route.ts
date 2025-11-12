import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const base = process.env.RADIOKING_BASE || 'https://api.radioking.io';
    const slug = process.env.RADIOKING_SLUG || 'hotmess-radio';
  const r = await fetch(`${base}/widget/radio/${slug}/track/current?format=json`, { next: { revalidate: 10 } });
  type Track = { title?: string; artist?: string };
  let j: Track = {};
  try { j = (await r.json()) as Track; } catch {}
  return NextResponse.json({ title: j.title || 'HOTMESS RADIO', artist: j.artist || 'Live 24/7' }, { status: 200 });
  } catch {
    return NextResponse.json({ title: 'HOTMESS RADIO', artist: 'Live 24/7' }, { status: 200 });
  }
}
