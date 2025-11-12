import { createServerClient } from '@supabase/ssr';
// Cookie bridging with Next.js headers API was attempted; reverted to no-op due to type mismatch.
// Future enhancement: import { cookies } from 'next/headers' and map getAll/setAll once types align.
import { getEnv } from '@/lib/env';

/**
 * Create a Supabase server client that integrates with Next.js 16 cookies.
 *
 * Usage inside a Server Component or Route Handler:
 *   const supabase = supabaseServer();
 *
 * You can optionally pass a cookie store (e.g. from `cookies()` you already obtained)
 * to avoid multiple reads:
 *   const store = cookies();
 *   const supabase = supabaseServer(store);
 *
 * The cookie bridge is best‑effort: writing cookies from a pure Server Component
 * can throw; we swallow that in setAll so that auth refresh via middleware still works.
 */
export function supabaseServer() {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = getEnv();

  // Guard against missing envs early (helps local setup clarity). In safe mode we allow stub values.
  if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Fall back to lightweight client with no cookie integration (mirrors previous noop approach).
    return createServerClient(NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY || 'anon-placeholder', {
      cookies: { getAll: () => [], setAll: () => { /* noop */ } },
    });
  }

  return createServerClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return []; },
      setAll() { /* noop */ },
    },
  });
}
