import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json().catch(() => ({}));
    // In real usage, forward to your analytics service or log store
    // For now, just return ok
    return NextResponse.json({ ok: true, received: { path: data?.path ?? null } }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
