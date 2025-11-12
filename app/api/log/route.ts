import { NextResponse } from 'next/server'
import { logger } from '@/lib/log'

// Internal logging ingest for client events (non-sensitive). Avoids exposing external token.
export async function POST(req: Request) {
  try {
    const data = await req.json().catch(() => null)
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })
    }
    // Minimal validation: require level + message
  const { level, message, meta, rid } = data as { level?: string; message?: string; meta?: Record<string, unknown> | undefined; rid?: string }
    if (!level || !message) {
      return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 422 })
    }
    // Re-log server-side (will forward to external sink if configured)
    switch (level) {
      case 'debug': logger.debug(message, { ...meta, rid }); break
      case 'info': logger.info(message, { ...meta, rid }); break
      case 'warn': logger.warn(message, { ...meta, rid }); break
      case 'error': logger.error(message, { ...meta, rid }); break
      default: logger.info(message, { ...meta, rid, level })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
