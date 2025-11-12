#!/usr/bin/env node
/**
 * HOTMESS signed link generator
 * Generates a signed tracking URL for /r router.
 *
 * Usage examples:
 *   node scripts/sign-link.js --p radio
 *   node scripts/sign-link.js --p uber_home --base https://hotmess.london/r
 *   node scripts/sign-link.js --p room --secret YOUR_SECRET --qr
 *
 * Options:
 *   --p <value>           Required. Destination param (radio | uber_home | uber_eats | room)
 *   --base <url>          Base URL (default: http://localhost:3000/r)
 *   --secret <string>     HMAC secret override (default: process.env.LINK_SIGNING_SECRET)
 *   --extra k=v           Extra param (can repeat) e.g. --extra aff=aff123 --extra city=london
 *   --qr                  Output a QR code (requires 'qrcode' package)
 *   --help                Show help
 */
import { createHmac } from 'crypto';

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { p: null, base: 'http://localhost:3000/r', secret: process.env.LINK_SIGNING_SECRET || '', extras: {}, qr: false, help: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--p') { out.p = args[++i]; }
    else if (a === '--base') { out.base = args[++i]; }
    else if (a === '--secret') { out.secret = args[++i]; }
    else if (a === '--extra') { const kv = (args[++i]||'').split('='); out.extras[kv[0]] = kv[1]; }
    else if (a === '--qr') { out.qr = true; }
    else if (a === '--help') { out.help = true; }
  }
  return out;
}

function sign(params, secret) {
  const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
  return createHmac('sha256', secret).update(sorted).digest('hex');
}

function buildUrl(base, params) {
  const usp = new URLSearchParams();
  for (const [k,v] of Object.entries(params)) usp.set(k, String(v));
  const url = new URL(base);
  url.search = usp.toString();
  return url.toString();
}

async function maybeQr(text, enabled) {
  if (!enabled) return;
  try {
    const { default: QRCode } = await import('qrcode');
    const ascii = await QRCode.toString(text, { type: 'terminal', small: true, errorCorrectionLevel: 'L' });
    console.log('\n'+ascii);
  } catch {
    console.warn('QR generation failed. Install with: npm i qrcode');
  }
}

function help() {
  console.log(`Signed Link Generator\n\nOptions:\n  --p <value>        Destination (radio | uber_home | uber_eats | room)\n  --base <url>       Base URL (default http://localhost:3000/r)\n  --secret <string>  Override secret (else uses LINK_SIGNING_SECRET env var)\n  --extra k=v        Extra param (repeatable)\n  --qr               Output QR code (requires qrcode)\n  --help             Show help\n\nExample:\n  LINK_SIGNING_SECRET=abc123 node scripts/sign-link.js --p radio --extra aff=aff123 --qr\n`);
}

async function main() {
  const opts = parseArgs();
  if (opts.help || !opts.p) { help(); process.exit(opts.p ? 0 : 1); }
  if (!opts.secret) {
    console.error('Missing secret. Provide LINK_SIGNING_SECRET env or --secret.');
    process.exit(1);
  }
  const params = { p: opts.p, ...opts.extras };
  const sig = sign(params, opts.secret);
  const fullParams = { ...params, sig };
  const url = buildUrl(opts.base, fullParams);
  console.log('Signed URL:', url);
  console.log('Signature:', sig);
  await maybeQr(url, opts.qr);
}

main();
