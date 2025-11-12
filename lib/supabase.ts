import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Provide a no-op client when env is missing to allow builds/tests without runtime secrets.
interface NoopQueryBuilder {
	select: (..._cols: string[]) => NoopQueryBuilder;
	order: (..._args: unknown[]) => NoopQueryBuilder;
	limit: (..._args: unknown[]) => NoopQueryBuilder;
	maybeSingle: () => Promise<{ data: null; error: null }>;
	single: () => Promise<{ data: null; error: null }>;
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
	single: async () => ({ data: null, error: null }),
	eq: () => noopBuilder,
	gte: () => noopBuilder,
	upsert: async () => ({ data: null, error: null }),
	insert: async () => ({ data: null, error: null }),
};

const noopClient = { from: () => noopBuilder } as unknown as SupabaseClient;

export const supabase: SupabaseClient = (supabaseUrl && supabaseAnon)
	? createClient(supabaseUrl, supabaseAnon)
	: noopClient;
