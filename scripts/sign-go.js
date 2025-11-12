#!/usr/bin/env node
/* eslint-disable */
/*
  Sign /go links for HOTMESS site.
  Usage:
    node scripts/sign-go.js --partner hotmess --offer care --to https://hotmess.london/care --secret $LINK_SIGNING_SECRET --base http://localhost:3000/go
*/
const crypto = require('crypto');

function hmacHex(secret, s) {
  return crypto.createHmac('sha256', secret).update(s).digest('hex');
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : '1';
      args[k] = v;
    }
  }
  return args;
}

(async () => {
  const { partner = 'hotmess', offer = 'care', to, secret = process.env.LINK_SIGNING_SECRET, base = 'http://localhost:3000/go' } = parseArgs(process.argv);
  if (!secret) {
    console.error('Missing --secret or LINK_SIGNING_SECRET');
    process.exit(1);
  }
  if (!to) {
    console.error('Missing --to <url>');
    process.exit(1);
  }
  const ts = Math.floor(Date.now() / 1000);
  const sig = hmacHex(secret, `${partner}.${offer}.${ts}`);
  const u = new URL(base);
  u.searchParams.set('partner', partner);
  u.searchParams.set('offer', offer);
  u.searchParams.set('ts', String(ts));
  u.searchParams.set('sig', sig);
  u.searchParams.set('to', to);
  console.log(u.toString());
})();
