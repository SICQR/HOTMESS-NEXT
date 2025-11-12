/*
  Dry-run env validator: checks presence of expected variables without printing values.
  - Exits with code 0 on success, 1 on missing required.
  - Prints a concise table of required/optional and where used.
*/

type Entry = {
  name: string;
  required: boolean;
  area: 'web' | 'edge' | 'ci' | 'shop' | 'radio';
  usedIn: string[]; // files
  hint?: string;
};

const entries: Entry[] = [
  // Web (Next.js)
  { name: 'NEXT_PUBLIC_SUPABASE_URL', required: true, area: 'web', usedIn: ['lib/supabase.ts','lib/supabase/admin.ts','lib/env.ts'] },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', required: true, area: 'web', usedIn: ['lib/supabase.ts','lib/env.ts'] },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: false, area: 'web', usedIn: ['lib/supabase/admin.ts','app/admin/page.tsx'] },
  { name: 'NEXT_PUBLIC_SITE_URL', required: false, area: 'web', usedIn: ['app/robots.ts','app/sitemap.ts','lib/telegram.ts'] },
  { name: 'LINK_SIGNING_SECRET', required: true, area: 'web', usedIn: ['app/api/beacon-link/route.ts','app/r/route.ts','app/go/route.ts','scripts/sign-go.js','scripts/sign-link.js','lib/env.ts'] },
  { name: 'NEXT_PUBLIC_LINK_SIGNING_SECRET', required: false, area: 'web', usedIn: ['app/r/_debug/page.tsx'] },
  { name: 'GO_TO_ALLOWLIST', required: false, area: 'web', usedIn: ['lib/links.ts','app/go/route.ts','lib/env.ts'], hint: 'comma-separated hosts' },
  { name: 'EDGE_ANALYTICS_URL', required: false, area: 'web', usedIn: ['next.config.ts','lib/analyticsServer.ts'] },
  { name: 'ANALYTICS_INGEST_SECRET', required: false, area: 'web', usedIn: ['lib/analyticsServer.ts'] },

  // Shopify
  { name: 'SHOPIFY_DOMAIN', required: false, area: 'shop', usedIn: ['lib/shopify.ts'] },
  { name: 'SHOPIFY_STOREFRONT_TOKEN', required: false, area: 'shop', usedIn: ['lib/shopify.ts'] },

  // Radio
  { name: 'NEXT_PUBLIC_RADIOKING_BASE', required: true, area: 'radio', usedIn: ['lib/radio.ts'] },
  { name: 'NEXT_PUBLIC_RADIOKING_SLUG', required: true, area: 'radio', usedIn: ['lib/radio.ts'] },
  { name: 'NEXT_PUBLIC_AZURACAST_API_BASE', required: false, area: 'radio', usedIn: ['lib/radio.ts'] },
  { name: 'NEXT_PUBLIC_AZURACAST_API_KEY', required: false, area: 'radio', usedIn: ['lib/radio.ts'] },

  // Partner/Bot
  { name: 'BOT_BASE_URL', required: false, area: 'web', usedIn: ['app/api/partner/bot-drop/route.ts','lib/env.ts'] },
  { name: 'TELEGRAM_NOTIFY_SECRET', required: false, area: 'web', usedIn: ['app/api/partner/bot-drop/route.ts','lib/env.ts'] },
  { name: 'INTERNAL_PARTNER_SECRET', required: false, area: 'web', usedIn: ['app/api/partner/bot-drop/route.ts','lib/env.ts'] },
  { name: 'TELEGRAM_WEBHOOK_SECRET', required: false, area: 'web', usedIn: ['middleware.ts','lib/env.ts'] },

  // Edge (Supabase functions)
  { name: 'SUPABASE_URL', required: true, area: 'edge', usedIn: ['edge/analytics.ts','edge/postbacks.ts','edge/globe_snapshot.ts','edge/telegram.ts','edge/sellers_submit.ts'] },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true, area: 'edge', usedIn: ['edge/analytics.ts','edge/postbacks.ts','edge/globe_snapshot.ts','edge/telegram.ts','edge/sellers_submit.ts'] },
  { name: 'ANALYTICS_INGEST_SECRET', required: false, area: 'edge', usedIn: ['edge/analytics.ts'] },
  { name: 'ALLOWED_ORIGINS', required: false, area: 'edge', usedIn: ['edge/sellers_submit.ts'] },
  { name: 'RATE_LIMIT_MAX', required: false, area: 'edge', usedIn: ['edge/sellers_submit.ts'] },
  { name: 'RATE_LIMIT_WINDOW_SECONDS', required: false, area: 'edge', usedIn: ['edge/sellers_submit.ts'] },
  { name: 'RADIOKING_BASE', required: false, area: 'edge', usedIn: ['edge/globe_snapshot.ts'] },
  { name: 'RADIOKING_SLUG', required: false, area: 'edge', usedIn: ['edge/globe_snapshot.ts'] },
  { name: 'AZURACAST_API_BASE', required: false, area: 'edge', usedIn: ['edge/globe_snapshot.ts'] },
  { name: 'AZURACAST_API_KEY', required: false, area: 'edge', usedIn: ['edge/globe_snapshot.ts'] },
  { name: 'GLOBE_CRON_TOKEN', required: false, area: 'edge', usedIn: ['edge/globe_snapshot.ts'] },
];

function has(name: string): boolean {
  return typeof process.env[name] === 'string' && process.env[name]!.length > 0;
}

function pad(s: string, n: number) { return (s + ' '.repeat(n)).slice(0, n); }

function parseOnlyArg(): 'all' | 'web' | 'edge' {
  const arg = process.argv.find(a => a.startsWith('--only='));
  if (!arg) return 'all';
  const val = arg.split('=')[1]?.toLowerCase();
  if (val === 'web' || val === 'edge') return val;
  return 'all';
}

import fs from 'fs';
import path from 'path';

function loadLocalEnv() {
  const candidates = [
    '.env.local',
    '.env.development.local',
    '.env',
  ].map((p: string) => path.join(process.cwd(), p));
  for (const file of candidates) {
    try {
      if (!fs.existsSync(file)) continue;
      const src = fs.readFileSync(file, 'utf8');
      src.split(/\r?\n/).forEach((line: string) => {
        const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
        if (!m) return;
        const [, k, raw] = m;
        const v = raw.replace(/^['"]/, '').replace(/['"]$/, '');
        if (!process.env[k]) process.env[k] = v;
      });
      // Load first found and stop
      break;
    } catch {/* ignore */}
  }
}

async function main() {
  // Load local env files into process.env for standalone runs
  loadLocalEnv();
  const only = parseOnlyArg();
  const includeAreas = only === 'all'
    ? new Set(['web','edge','shop','radio','ci'])
    : only === 'web'
      ? new Set(['web','shop','radio','ci'])
      : new Set(['edge']);
  // Load .env if running locally (Next/Jest typically already loads)
  // Intentionally do not print values.
  let missing = 0;
  const filtered = entries.filter(e => includeAreas.has(e.area));
  const rows = filtered.map(e => {
    const present = has(e.name);
    if (e.required && !present) missing++;
    return `${present ? '✔' : e.required ? '✖' : '·'} ${pad(e.name, 32)} ${pad(e.area, 6)} ${e.required ? 'required ' : 'optional '} ${e.usedIn.join(', ')}`;
  });

  console.log(`Env validation (no values printed) — scope: ${only}`);
  rows.forEach(r => console.log('  ' + r));
  if (missing > 0) {
    console.error(`Missing required variables: ${missing}. See .env.example for guidance.`);
    process.exit(1);
  }
}

main().catch(err => { console.error(err?.message || err); process.exit(1); });
