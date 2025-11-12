// Server-only Supabase admin client (service role) — NEVER import on the client.
import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.warn('[supabaseAdmin] Missing env; exporting no-op client for build/test');
}

interface NoopQueryBuilder {
  select: (..._cols: string[]) => NoopQueryBuilder;
  order: (..._args: unknown[]) => NoopQueryBuilder;
  limit: (..._args: unknown[]) => NoopQueryBuilder;
  maybeSingle: () => Promise<{ data: null; error: null }>; // mimic supabase API surface used
  eq: (..._args: unknown[]) => NoopQueryBuilder;
  gte: (..._args: unknown[]) => NoopQueryBuilder;
  upsert: (..._args: unknown[]) => Promise<{ data: null; error: null }>;
  insert: (..._args: unknown[]) => Promise<{ data: null; error: null }>;
}

const noopBuilder: NoopQueryBuilder = {
  select: () => noopBuilder,
  order: () => noopBuilder,
  limit: () => noopBuilder,
  maybeSingle: async () => ({ data: null, error: null }),
  eq: () => noopBuilder,
  gte: () => noopBuilder,
  upsert: async () => ({ data: null, error: null }),
  insert: async () => ({ data: null, error: null }),
};

type NoopClient = {
  from: (_table: string) => NoopQueryBuilder;
};

const noopClient: NoopClient = {
  from: () => noopBuilder,
};

export const supabaseAdmin: SupabaseClient = (url && serviceKey)
  ? createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : (noopClient as unknown as SupabaseClient);
