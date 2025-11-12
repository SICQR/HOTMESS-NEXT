#!/usr/bin/env ts-node
/*
  Convert a loosely formatted .env.local.txt (including bullet "•" lines)
  into a sanitized .env.local with only the keys this project expects for web dev.

  - Reads .env.local.txt and existing .env.local (if any)
  - Extracts pairs like:
      • KEY\n
      • VALUE
    and classic KEY=VALUE lines
  - Maps aliases and fills sane defaults where safe (no server-only secrets)
  - Backs up existing .env.local → .env.local.bak-<timestamp>
  - Writes a minimal .env.local

  NOTE: This script does NOT print secret values. It prints only key names.
*/

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = process.cwd();
const TXT = path.join(ROOT, '.env.local.txt');
const ENV = path.join(ROOT, '.env.local');

function readFileSafe(p: string): string | null {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}

function parseLooseEnv(input: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!input) return out;

  // 1) Parse classic KEY=VALUE lines
  input.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) {
      const [, k, vRaw] = m;
      // Strip surrounding quotes
      const v = vRaw.replace(/^['"]/, '').replace(/['"]$/, '');
      if (k) out[k] = v;
    }
  });

  // 2) Parse bullet pairs like "• KEY" then next non-empty bullet line as value
  const cleaned = input
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const bullet = /^•\s*(.+)$/; // bullet + rest
  const pairs: string[] = [];
  for (let i = 0; i < cleaned.length; i++) {
    const m = cleaned[i].match(bullet);
    if (!m) continue;
    const key = m[1].trim();
    const mv = (i + 1 < cleaned.length) ? cleaned[i + 1].match(bullet) : null;
    if (mv) {
      const val = mv[1].trim();
      pairs.push(key, val);
      i++; // skip value line
    }
  }
  for (let i = 0; i < pairs.length; i += 2) {
    const k = pairs[i];
    const v = pairs[i + 1] ?? '';
    // Only accept ALLCAPS_UNDERSCORE keys
    if (/^[A-Z0-9_]+$/.test(k)) {
      out[k] = v;
    }
  }

  return out;
}

function parseDotEnv(input: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!input) return out;
  input.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) {
      const [, k, vRaw] = m;
      const v = vRaw.replace(/^['"]/, '').replace(/['"]$/, '');
      out[k] = v;
    }
  });
  return out;
}

function randHex(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

function main() {
  const src = readFileSafe(TXT);
  if (!src) {
    console.error(`✖ ${path.basename(TXT)} not found`);
    process.exit(1);
  }

  const loose = parseLooseEnv(src);
  const existing = parseDotEnv(readFileSafe(ENV));

  // Build target map (only safe, expected web vars)
  const target: Record<string, string> = { ...existing };

  // Supabase (use ANON; fallback to publishable alias or SUPABASE_ANON_KEY)
  if (loose.NEXT_PUBLIC_SUPABASE_URL) target.NEXT_PUBLIC_SUPABASE_URL = loose.NEXT_PUBLIC_SUPABASE_URL;
  const anon = loose.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || loose.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
    || loose.SUPABASE_ANON_KEY;
  if (anon) target.NEXT_PUBLIC_SUPABASE_ANON_KEY = anon;
  if (loose.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY) {
    target.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY = loose.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  }

  // Shopify domain alias
  const shopDomain = loose.SHOPIFY_DOMAIN || loose.SHOPIFY_SHOP_DOMAIN;
  if (shopDomain) target.SHOPIFY_DOMAIN = shopDomain;
  // Keep existing storefront token if already present; do not try to guess from unrelated keys
  if (loose.SHOPIFY_STOREFRONT_TOKEN && !target.SHOPIFY_STOREFRONT_TOKEN) {
    target.SHOPIFY_STOREFRONT_TOKEN = loose.SHOPIFY_STOREFRONT_TOKEN;
  }

  // Bot username/channel to NEXT_PUBLIC_* (strip leading @ for username)
  if (loose.BOT_USERNAME) target.NEXT_PUBLIC_BOT_USERNAME = loose.BOT_USERNAME.replace(/^@/, '');
  if (loose.BOT_CHANNEL_URL) target.NEXT_PUBLIC_BOT_CHANNEL_URL = loose.BOT_CHANNEL_URL;

  // Safe defaults for radio if missing
  if (!target.NEXT_PUBLIC_RADIOKING_BASE) target.NEXT_PUBLIC_RADIOKING_BASE = 'https://api.radioking.io';
  if (!target.NEXT_PUBLIC_RADIOKING_SLUG) target.NEXT_PUBLIC_RADIOKING_SLUG = 'hotmess-radio';

  // Bot base URL default if absent
  if (!target.BOT_BASE_URL) target.BOT_BASE_URL = 'https://bot.hotmess.market';

  // Generate LINK_SIGNING_SECRET if missing
  if (!target.LINK_SIGNING_SECRET) target.LINK_SIGNING_SECRET = randHex(32);

  // Never propagate highly sensitive server-only secrets here
  const stripKeys = [
    'SUPABASE_SERVICE_KEY', 'SUPABASE_SERVICE_ROLE_KEY',
    'SHOPIFY_ADMIN_API_TOKEN', 'SHOPIFY_API_ACCESS_TOKEN_ADMIN', 'SHOPIFY_API_KEY', 'SHOPIFY_API_SECRET_KEY',
    'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET',
    'HOTMESS_NEW_BOT_TOKEN', 'HOTMESS_RADIO_BOT_TOKEN', 'HOTMESS_RADIO_BOT_TOKEN_v2', 'HOTMESS_PLAYGROUND_BOT_TOKEN',
  ];
  stripKeys.forEach((k) => { if (k in target) delete target[k]; });

  // Backup existing .env.local
  if (fs.existsSync(ENV)) {
    const bak = ENV + '.bak-' + new Date().toISOString().replace(/[:.]/g, '-');
    fs.copyFileSync(ENV, bak);
    console.log(`Backed up existing .env.local → ${path.basename(bak)}`);
  }

  // Write sanitized .env.local with header
  const header = [
    '# Generated from .env.local.txt by scripts/convert-env-local-txt.ts',
    '# Source of truth for production: Vercel Project Environment Variables',
    '# Do NOT commit this file. Use .env.example for documentation only.',
    '',
  ].join('\n');
  const body = Object.entries(target)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${/\s/.test(v) ? JSON.stringify(v) : v}`)
    .join('\n') + '\n';

  fs.writeFileSync(ENV, header + body, 'utf8');

  // Ensure .gitignore has .env.local
  const gi = path.join(ROOT, '.gitignore');
  try {
    const giContent = readFileSafe(gi) || '';
    if (!/^\.env\.local$/m.test(giContent) && !/^\.env(\..+)?\.local$/m.test(giContent)) {
      fs.appendFileSync(gi, (giContent.endsWith('\n') ? '' : '\n') + '.env.local\n');
      console.log('Appended .env.local to .gitignore');
    }
  } catch { /* ignore */ }

  // Print summary of keys written (no values)
  const keys = Object.keys(target).sort();
  console.log('Wrote .env.local with keys:');
  keys.forEach((k) => console.log(`  - ${k}`));

  // Warn about still-missing required keys that must be set in Vercel
  const required = [
    'BOT_BASE_URL',
    'TELEGRAM_NOTIFY_SECRET',
    'INTERNAL_PARTNER_SECRET',
    'LINK_SIGNING_SECRET',
    'NEXT_PUBLIC_BOT_USERNAME',
    'NEXT_PUBLIC_BOT_CHANNEL_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];
  const missing = required.filter((k) => !target[k]);
  if (missing.length) {
    console.warn('Missing required keys (set in Vercel dev and re-pull):');
    missing.forEach((k) => console.warn(`  - ${k}`));
  }
}

main();
