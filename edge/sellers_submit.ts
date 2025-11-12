// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
// Supabase Edge Function: sellers_submit
// Validates input (Zod), optional rate limiting by IP, and inserts into public.sellers
// Deploy via: supabase functions deploy sellers_submit

// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.5';
import { z } from 'https://esm.sh/zod@3.23.8';

const RATE_LIMIT_MAX = Number(Deno.env.get('RATE_LIMIT_MAX') ?? '5');
const RATE_LIMIT_WINDOW_SECONDS = Number(Deno.env.get('RATE_LIMIT_WINDOW_SECONDS') ?? '600'); // 10 minutes
const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const SellerSubmissionSchema = z.object({
  name: z.string().min(2).max(80),
  shopName: z.string().min(2).max(80),
  email: z.string().email().max(160),
  productCategory: z.string().min(2).max(40),
  productDescription: z.string().min(10).max(600),
  brandingAgreement: z.literal(true),
});

serve(async (req) => {
  const origin = req.headers.get('origin');

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders(origin) });
  }

  const headers = corsHeaders(origin);

  try {
    if (req.method !== 'POST') {
      return jsonErr('Method not allowed', 405, headers);
    }

    if (ALLOWED_ORIGINS.length && origin && !ALLOWED_ORIGINS.includes(origin)) {
      return jsonErr('CORS origin not allowed', 403, headers);
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE(_KEY) env');
      return jsonErr('Server misconfiguration', 500, headers);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || undefined;
    const body = (await req.json()) as unknown;

    const parsed = SellerSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return jsonErr({ message: 'Invalid payload', issues: parsed.error.issues }, 400, headers);
    }

    const payload = parsed.data;

    // Optional rate limiting by IP
    if (RATE_LIMIT_MAX > 0 && RATE_LIMIT_WINDOW_SECONDS > 0 && ip) {
      const rl = await checkRateLimit(supabase, ip, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_SECONDS);
      if (!rl.allowed) {
        return jsonErr('Rate limit exceeded. Try again later.', 429, headers);
      }
    }

    const { data, error } = await supabase
      .from('sellers')
      .insert([
        {
          name: payload.name,
          shop_name: payload.shopName,
          email: payload.email,
          product_category: payload.productCategory,
          product_description: payload.productDescription,
          branding_agreement: true,
          submitted_ip: ip ?? null,
        },
      ])
      .select('id,name,shop_name,email,product_category,product_description,created_at');

    if (error) {
      return jsonErr(error.message, 400, headers);
    }

    return jsonOk({ message: 'Seller successfully onboarded!', data }, 201, headers);
  } catch (err: any) {
    console.error('seller_submit_error', { message: err?.message, stack: err?.stack });
    return jsonErr('Unexpected error', 500, headers);
  }
});

async function checkRateLimit(
  supabase: any,
  ip: string,
  max: number,
  windowSeconds: number,
): Promise<{ allowed: boolean }> {
  try {
    const sinceIso = new Date(Date.now() - windowSeconds * 1000).toISOString();
    const { count, error } = await supabase
      .from('sellers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sinceIso)
      .eq('submitted_ip', ip);
    if (error) {
      console.warn('Rate count error', error.message);
      return { allowed: true };
    }
    return { allowed: (count ?? 0) < max };
  } catch (e) {
    console.warn('Rate limit check failed', e?.message ?? e);
    return { allowed: true };
  }
}

function corsHeaders(origin: string | null): HeadersInit {
  const vary = { Vary: 'Origin' } as Record<string, string>;
  if (!ALLOWED_ORIGINS.length) {
    return {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Content-Type': 'application/json',
      ...vary,
    };
  }
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : 'null';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
    ...vary,
  };
}

function jsonOk(body: unknown, status = 200, headers?: HeadersInit) {
  return new Response(JSON.stringify({ ok: true, ...(typeof body === 'object' && body ? body : { data: body }) }), { status, headers });
}

function jsonErr(error: unknown, status = 400, headers?: HeadersInit) {
  const payload = typeof error === 'string' ? { error } : { error };
  return new Response(JSON.stringify({ ok: false, ...payload }), { status, headers });
}
