import { NextRequest, NextResponse } from 'next/server';

// Migrated from middleware.ts (deprecated) to proxy.ts.
// Purpose: request ID header/cookie, CSP nonce, protected route gating, telegram webhook hardening, security headers.

function hasSession(req: NextRequest) {
  return req.cookies.has('sb-access-token');
}

const PROTECTED_PREFIXES = ['/qr', '/onboarding'];

export default async function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;
  const requestId = (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)).slice(0, 10);
  const bytes = new Uint8Array(16);
  if (globalThis.crypto && 'getRandomValues' in globalThis.crypto) globalThis.crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  const cspNonce = btoa(String.fromCharCode(...Array.from(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

  if (process.env.NODE_ENV === 'development') {
    console.debug('[HM][req]', { id: requestId, path: pathname });
  }

  // Protected path gating
  if (PROTECTED_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    if (!hasSession(req)) {
      const login = new URL('/login', url.origin);
      login.searchParams.set('continue', url.pathname + (url.search || ''));
      const redirect = NextResponse.redirect(login);
      redirect.headers.set('x-hm-request-id', requestId);
      redirect.headers.set('x-hm-csp-nonce', cspNonce);
      redirect.cookies.set('hm_rid', requestId, { path: '/', maxAge: 60, httpOnly: false, sameSite: 'lax' });
      return redirect;
    }
  }

  // Telegram webhook hardening
  if (pathname.startsWith('/api/telegram')) {
    if (!['POST', 'GET'].includes(req.method)) {
      const r = NextResponse.json({ success: false, error: { message: 'Method not allowed', code: 'method_not_allowed' } }, { status: 405 });
      r.headers.set('x-hm-request-id', requestId);
      r.headers.set('x-hm-csp-nonce', cspNonce);
      r.cookies.set('hm_rid', requestId, { path: '/', maxAge: 60, httpOnly: false, sameSite: 'lax' });
      return r;
    }
    const secretHeader = req.headers.get('x-telegram-bot-api-secret-token');
    const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (expected && secretHeader !== expected) {
      const r = NextResponse.json({ success: false, error: { message: 'Forbidden', code: 'forbidden' } }, { status: 403 });
      r.headers.set('x-hm-request-id', requestId);
      r.headers.set('x-hm-csp-nonce', cspNonce);
      r.cookies.set('hm_rid', requestId, { path: '/', maxAge: 60, httpOnly: false, sameSite: 'lax' });
      return r;
    }
  }

  const res = NextResponse.next();
  res.headers.set('x-hm-request-id', requestId);
  res.headers.set('x-hm-csp-nonce', cspNonce);
  res.cookies.set('hm_rid', requestId, { path: '/', maxAge: 60, httpOnly: false, sameSite: 'lax' });

  const csp = [
    "default-src 'self'",
    "img-src 'self' data: blob: https:",
    "media-src 'self' https:",
    "font-src 'self' data:",
    `script-src 'self' 'nonce-${cspNonce}' https://www.googletagmanager.com https://www.google-analytics.com`,
    "style-src 'self' 'unsafe-inline'",
    "connect-src 'self' https: wss:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; ');

  res.headers.set('Content-Security-Policy', csp);
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), interest-cohort=()');
  return res;
}

export const config = { matcher: ['/:path*'] };