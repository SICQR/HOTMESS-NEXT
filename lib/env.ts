import { z } from 'zod';

// Environment variables schema
// NOTE: In dev we allow these to be missing and substitute placeholders to avoid hard crashes
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  // Optional alias used by some snippets; we fallback to this if ANON is absent
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  LINK_SIGNING_SECRET: z.string().optional(), // HOTMESS ADD
  GO_TO_ALLOWLIST: z.string().optional(), // comma-separated host allowlist for /go to=
  TELEGRAM_BOT_TOKEN: z.string().optional(), // HOTMESS ADD
  TELEGRAM_WEBHOOK_SECRET: z.string().optional(), // HOTMESS ADD
  TELEGRAM_ALLOWED_CHATS: z.string().optional(), // HOTMESS ADD
  TELEGRAM_ADMIN_CHAT_ID: z.string().optional(), // HOTMESS ADD
  BOT_BASE_URL: z.string().url().optional(), // HOTMESS ADD
  TELEGRAM_NOTIFY_SECRET: z.string().optional(), // HOTMESS ADD
  INTERNAL_PARTNER_SECRET: z.string().optional(), // HOTMESS ADD
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

type BaseEnv = z.infer<typeof envSchema>;
export type Env = Omit<BaseEnv, 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'> & {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
};

export function getEnv(): Env {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    LINK_SIGNING_SECRET: process.env.LINK_SIGNING_SECRET, // HOTMESS ADD
    GO_TO_ALLOWLIST: process.env.GO_TO_ALLOWLIST, // HOTMESS ADD
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN, // HOTMESS ADD
    TELEGRAM_WEBHOOK_SECRET: process.env.TELEGRAM_WEBHOOK_SECRET, // HOTMESS ADD
    TELEGRAM_ALLOWED_CHATS: process.env.TELEGRAM_ALLOWED_CHATS, // HOTMESS ADD
    TELEGRAM_ADMIN_CHAT_ID: process.env.TELEGRAM_ADMIN_CHAT_ID, // HOTMESS ADD
    BOT_BASE_URL: process.env.BOT_BASE_URL, // HOTMESS ADD
    TELEGRAM_NOTIFY_SECRET: process.env.TELEGRAM_NOTIFY_SECRET, // HOTMESS ADD
    INTERNAL_PARTNER_SECRET: process.env.INTERNAL_PARTNER_SECRET, // HOTMESS ADD
    NODE_ENV: process.env.NODE_ENV,
  };

  const parsed = envSchema.safeParse(env);

  // Allow placeholder fallback in development or when explicitly NEXT_SAFE_MODE is set
  const isDev = (process.env.NODE_ENV || 'development') !== 'production';
  const allowPlaceholder = isDev || !!process.env.NEXT_SAFE_MODE;

  if (!parsed.success) {
    const missing = parsed.error.issues.map(i => i.path.join('.')).join(', ');
    if (allowPlaceholder) {
      console.warn('[HM] ENV PLACEHOLDER MODE: substituting missing Supabase public keys. Missing:', missing);
      return {
        NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.local',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'anon-placeholder',
        SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY || undefined,
        LINK_SIGNING_SECRET: env.LINK_SIGNING_SECRET || undefined,
  GO_TO_ALLOWLIST: env.GO_TO_ALLOWLIST || undefined,
        TELEGRAM_BOT_TOKEN: env.TELEGRAM_BOT_TOKEN || undefined,
        TELEGRAM_WEBHOOK_SECRET: env.TELEGRAM_WEBHOOK_SECRET || undefined,
        TELEGRAM_ALLOWED_CHATS: env.TELEGRAM_ALLOWED_CHATS || undefined,
        TELEGRAM_ADMIN_CHAT_ID: env.TELEGRAM_ADMIN_CHAT_ID || undefined,
        BOT_BASE_URL: env.BOT_BASE_URL || undefined,
        TELEGRAM_NOTIFY_SECRET: env.TELEGRAM_NOTIFY_SECRET || undefined,
        INTERNAL_PARTNER_SECRET: env.INTERNAL_PARTNER_SECRET || undefined,
        NODE_ENV: (process.env.NODE_ENV as 'development' | 'test' | 'production') || 'development',
      } as Env;
    }
    // Production hard fail with clearer message
    throw new Error(`Invalid environment variables. Missing/invalid: ${missing}. Set them in .env.local (see .env.example).`);
  }

  // If in dev and Supabase keys still missing after successful parse (because optional) provide placeholders
  if (allowPlaceholder && (!parsed.data.NEXT_PUBLIC_SUPABASE_URL || !parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    console.warn('[HM] ENV PLACEHOLDER MODE: Supabase keys missing; using placeholders');
    return {
      ...parsed.data,
      NEXT_PUBLIC_SUPABASE_URL: parsed.data.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.local',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'anon-placeholder',
    } as Env;
  }

  // In production, ensure required keys exist
  if (!allowPlaceholder && (!parsed.data.NEXT_PUBLIC_SUPABASE_URL || !parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    throw new Error('Invalid environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required in production.');
  }

  // Cast is safe now
  return parsed.data as Env;
}

export const env = getEnv();