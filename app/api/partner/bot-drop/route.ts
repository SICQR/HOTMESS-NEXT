// HOTMESS ADD: Partner bot drop announce endpoint
// import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { jsonErr, jsonOk } from '@/lib/errors';
import { logger } from '@/lib/log';
import { rateLimitAllow } from '@/lib/rate';
import { fetchWithRetry } from '@/lib/retryFetch';

const BOT_BASE = process.env.BOT_BASE_URL || '';
const NOTIFY_SECRET = process.env.TELEGRAM_NOTIFY_SECRET || '';
const INTERNAL_SECRET = process.env.INTERNAL_PARTNER_SECRET || '';

const BodySchema = z.object({
  product_id: z.string().min(1, 'product_id required'),
  chat: z.string().min(1, 'chat required'),
});

function sign(raw: string) {
  if (!NOTIFY_SECRET) return '';
  return crypto.createHmac('sha256', NOTIFY_SECRET).update(raw).digest('hex');
}

function parseChat(input: string): { channel: string; replyTo?: number; url?: string } {
  const s = input.trim();
  try {
    if (s.startsWith('http')) {
      const u = new URL(s);
      const parts = u.pathname.split('/').filter(Boolean);
      const channel = parts[0]?.replace(/^@/, '') || '';
      const msgId = parts[1] ? Number(parts[1]) : undefined;
      return { channel: `@${channel}`, replyTo: Number.isFinite(msgId) ? msgId : undefined, url: s };
    }
  } catch {
    // fallthrough
  }
  const clean = s.replace(/^@/, '');
  return { channel: `@${clean}` };
}

export async function POST(req: Request) {
  const requestId = req.headers.get('x-hm-request-id') || Math.random().toString(36).slice(2, 12);
  // Secret check
  const hdr = req.headers.get('x-internal-secret');
  if (!INTERNAL_SECRET || hdr !== INTERNAL_SECRET) {
    logger.warn('[HM] bot-drop forbidden', { request_id: requestId });
    return jsonErr('forbidden', 'forbidden', undefined, { status: 403 });
  }

  // Simple token bucket limiter keyed by secret to dampen floods (30/min)
  const key = INTERNAL_SECRET;
  if (!rateLimitAllow(key)) {
    logger.warn('[HM] bot-drop rate_limited', { request_id: requestId });
    return jsonErr('rate_limited', 'rate_limited', undefined, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return jsonErr('bad_json', 'bad_json', undefined, { status: 400 }); }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr('invalid_body', 'bad_request', parsed.error.issues, { status: 400 });
  }
  const { product_id, chat } = parsed.data;

  const { channel, replyTo, url } = parseChat(chat);
  if (!channel) return jsonErr('invalid_chat', 'bad_request', undefined, { status: 400 });

  if (!BOT_BASE || !NOTIFY_SECRET) {
    logger.error('[HM] bot-drop missing config', { request_id: requestId, BOT_BASE: !!BOT_BASE, NOTIFY_SECRET: !!NOTIFY_SECRET });
    return jsonErr('server_misconfig', 'config', undefined, { status: 500 });
  }

  const text = `🔥 New drop: <b>${product_id}</b>\nJoin the thread to discuss.`;
  const buttons = url ? [{ text: 'Open post', url }] : undefined;
  const payload = {
    kind: 'drop_announce',
    chatScope: { chatIds: [channel] },
    text,
    buttons,
    replyTo,
    occurredAt: new Date().toISOString(),
  };
  const raw = JSON.stringify(payload);

  try {
    const res = await fetchWithRetry(`${BOT_BASE}/v1/telegram/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-HM-Signature': sign(raw) },
      body: raw,
    });
    const j = await res.json().catch(() => null);
    if (!res.ok) {
      logger.error('[HM] bot-drop notify_failed', { request_id: requestId, status: res.status, body: j });
      return jsonErr('notify_failed', 'upstream', j, { status: 502 });
    }
    return jsonOk(j?.data ?? { forwarded: true }, { status: 200 });
  } catch (e) {
    logger.error('[HM] bot-drop notify_error', { request_id: requestId, error: (e as Error).message });
    return jsonErr('notify_error', 'upstream', undefined, { status: 502 });
  }
}

export const dynamic = 'force-dynamic';