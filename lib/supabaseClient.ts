'use client';
import { createBrowserClient } from '@supabase/ssr';
import { getEnv } from '@/lib/env';

export const supabaseClient = () => {
	const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = getEnv();
	return createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);
};
