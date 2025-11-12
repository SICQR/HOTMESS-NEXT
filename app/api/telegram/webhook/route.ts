// HOTMESS ADD
import { NextResponse } from 'next/server';
import { handleTelegramUpdate, getTelegramEnv, TelegramUpdate } from '@/lib/telegram';
import { jsonErr, jsonOk } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const secretHeader = req.headers.get('x-telegram-bot-api-secret-token');
  const { WEBHOOK_SECRET } = getTelegramEnv();
  if (WEBHOOK_SECRET && secretHeader !== WEBHOOK_SECRET) {
    return jsonErr('Forbidden', 'forbidden', undefined, { status: 403 });
  }

  let update: TelegramUpdate;
  try {
    update = (await req.json()) as TelegramUpdate;
  } catch {
    return jsonErr('Bad JSON', 'bad_json', undefined, { status: 400 });
  }

  try {
    await handleTelegramUpdate(update);
  } catch (e) {
    console.error('[HM] telegram update error', e);
  }

  return jsonOk({ received: true });
}

export async function GET() {
  return NextResponse.json({ success: true, data: { ok: true } });
}
