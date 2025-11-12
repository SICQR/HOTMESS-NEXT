import { NextResponse } from 'next/server'

// Generic analytics ingest endpoint
// Note: Real deployments should validate payload shape, apply consent checks,
// and forward to a durable store. This stub returns 200 for well-formed JSON.
export async function POST(request: Request) {
  try {
    const data = await request.json().catch(() => null)
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
    }
    // TODO: add consent gating on server if desired; currently assumed handled client-side
    // TODO: forward to edge analytics or log sink
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
