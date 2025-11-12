import { NextRequest, NextResponse } from 'next/server';
import { verify } from '@/lib/server/hmac';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const qp = url.searchParams;

  const secret = process.env.LINK_SIGNING_SECRET || '';
  const ok = secret ? verify(qp, secret) : false;
  const p = qp.get('p');

  let to = '/';
  if (ok) {
    if (p === 'radio') to = '/radio';
    else if (p === 'uber_home' || p === 'uber_eats') to = '/shop';
    else if (p === 'room') to = 'https://t.me/HotmessNew_bot';
  }

  return NextResponse.redirect(new URL(to, url), { status: 302 });
}
