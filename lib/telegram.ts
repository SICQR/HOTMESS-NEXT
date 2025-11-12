// HOTMESS ADD
import { getEnv } from '@/lib/env';

export type TelegramUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    text?: string;
    chat: { id: number; type: string };
    from?: { id: number; username?: string };
  };
};

export function getTelegramEnv() {
  const {
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_WEBHOOK_SECRET,
    TELEGRAM_ALLOWED_CHATS,
    TELEGRAM_ADMIN_CHAT_ID,
  } = getEnv();
  return {
    BOT_TOKEN: TELEGRAM_BOT_TOKEN,
    WEBHOOK_SECRET: TELEGRAM_WEBHOOK_SECRET,
    ALLOWED_CHATS: (TELEGRAM_ALLOWED_CHATS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    ADMIN_CHAT: TELEGRAM_ADMIN_CHAT_ID,
  };
}

export async function telegramSend(
  chatId: number,
  text: string,
  parseMode: 'HTML' | 'MarkdownV2' = 'HTML'
) {
  const { BOT_TOKEN } = getTelegramEnv();
  if (!BOT_TOKEN) return;
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    console.error('[HM] telegram send error', await res.text());
  }
}

function parseCommand(text?: string): { cmd: string; args: string[] } {
  if (!text) return { cmd: '', args: [] };
  const parts = text.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);
  return { cmd, args };
}

// Simple per-chat rate limiter
const limits = new Map<number, { count: number; resetTs: number }>();
function allow(chatId: number, max = 20, windowMs = 60_000) {
  const now = Date.now();
  const cur = limits.get(chatId);
  if (!cur || now > cur.resetTs) {
    limits.set(chatId, { count: 1, resetTs: now + windowMs });
    return true;
  }
  if (cur.count >= max) return false;
  cur.count++;
  return true;
}

export async function handleTelegramUpdate(update: TelegramUpdate) {
  const msg = update.message;
  if (!msg) return;
  const { cmd, args } = parseCommand(msg.text);
  const chatId = msg.chat.id;
  const { ALLOWED_CHATS, ADMIN_CHAT } = getTelegramEnv();
  const allowed = ALLOWED_CHATS.length === 0 || ALLOWED_CHATS.includes(String(chatId));
  if (!allowed) return;
  if (!allow(chatId)) {
    return telegramSend(chatId, 'Slow down.');
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  switch (cmd) {
    case '/start':
      return telegramSend(
        chatId,
        `<b>HOTMESS</b>\nWelcome. Commands: /help /points /scan &lt;code&gt; /offer &lt;slug&gt; /campaign &lt;slug&gt; /dj &lt;handle&gt;`
      );
    case '/help':
      return telegramSend(
        chatId,
        `Commands:\n/points - your points\n/scan &lt;code&gt; - simulate QR (demo)\n/offer &lt;slug&gt; - offer info\n/campaign &lt;slug&gt; - campaign summary\n/dj &lt;handle&gt; - DJ profile snippet`
      );
    case '/points': {
      const r = await fetch(`${site}/api/qr/rewards?userId=demo_user`);
      const j = await r.json();
      const pts = j?.data?.totalPoints ?? 0;
      return telegramSend(chatId, `Points: <b>${pts}</b>`);
    }
    case '/scan': {
      const code = args[0] || 'demo';
      const r = await fetch(`${site}/api/qr/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: code, userId: 'demo_user' }),
      });
      const j = await r.json();
      const earned = j?.data?.points ?? 0;
      return telegramSend(chatId, `Scanned: ${code}\nEarned: <b>${earned}</b>`);
    }
    case '/offer': {
      const slug = args[0];
      if (!slug) return telegramSend(chatId, `Usage: /offer &lt;slug&gt;`);
      return telegramSend(chatId, `Offer: <b>${slug}</b>\nVisit: ${site}/marketplace`);
    }
    case '/campaign': {
      const slug = args[0];
      if (!slug) return telegramSend(chatId, `Usage: /campaign &lt;slug&gt;`);
      return telegramSend(chatId, `Campaign: <b>${slug}</b>\nMore: ${site}/campaigns/${slug}`);
    }
    case '/dj': {
      const handle = args[0];
      if (!handle) return telegramSend(chatId, `Usage: /dj &lt;handle&gt;`);
      return telegramSend(chatId, `DJ: <b>${handle.toUpperCase()}</b>\nProfile: ${site}/djs/${handle}`);
    }
    case '/broadcast': {
      if (String(chatId) !== ADMIN_CHAT) return telegramSend(chatId, `Not authorized.`);
      const text = args.join(' ');
      if (!text) return telegramSend(chatId, `Usage: /broadcast &lt;message&gt;`);
      const { ALLOWED_CHATS } = getTelegramEnv();
      for (const c of ALLOWED_CHATS) {
        await telegramSend(Number(c), `<b>Broadcast:</b> ${text}`);
      }
      return;
    }
    default:
      if (cmd.startsWith('/')) {
        return telegramSend(chatId, `Unknown command. Try /help`);
      }
  }
}
