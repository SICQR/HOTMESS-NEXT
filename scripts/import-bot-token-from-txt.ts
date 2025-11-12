#!/usr/bin/env ts-node
/*
  Import HOTMESS_NEW_BOT_TOKEN (and BOT_USERNAME) from .env.local.txt into .env.bot
  without printing the secret value. Supports the bullet ("•") format used in that file.
*/
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const TXT = path.join(ROOT, '.env.local.txt');
const BOT = path.join(ROOT, '.env.bot');

function read(p: string) {
  return fs.readFileSync(p, 'utf8');
}

function write(p: string, s: string) {
  fs.writeFileSync(p, s, 'utf8');
}

function parseBulletPairs(input: string): Record<string, string> {
  const lines = input.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const out: Record<string, string> = {};
  for (let i = 0; i < lines.length - 1; i++) {
    const k = lines[i].match(/^•\s*(.+)$/);
    const v = lines[i + 1].match(/^•\s*(.+)$/);
    if (k && v) {
      const key = k[1].trim();
      const val = v[1].trim();
      if (/^[A-Z0-9_]+$/.test(key)) out[key] = val;
      i++; // advance past value
    }
  }
  // Also parse KEY=VALUE lines if present
  input.split(/\r?\n/).forEach(line => {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^['"]/, '').replace(/['"]$/, '');
  });
  return out;
}

function upsertEnvLine(envSrc: string, key: string, value: string): string {
  const re = new RegExp(`^${key}=.*$`, 'm');
  const line = `${key}=${/\s/.test(value) ? JSON.stringify(value) : value}`;
  if (re.test(envSrc)) return envSrc.replace(re, line);
  return envSrc.trimEnd() + '\n' + line + '\n';
}

function main() {
  if (!fs.existsSync(TXT)) {
    console.error('.env.local.txt not found');
    process.exit(1);
  }
  if (!fs.existsSync(BOT)) {
    console.error('.env.bot not found — run scripts/init-env-bot.sh first.');
    process.exit(1);
  }
  const src = read(TXT);
  const pairs = parseBulletPairs(src);
  const token = pairs.HOTMESS_NEW_BOT_TOKEN;
  if (!token) {
    console.error('HOTMESS_NEW_BOT_TOKEN not found in .env.local.txt');
    process.exit(1);
  }
  const userRaw = pairs.BOT_USERNAME; // may include leading @
  const username = userRaw ? userRaw.replace(/^@/, '') : undefined;

  const before = read(BOT);
  let after = upsertEnvLine(before, 'HOTMESS_NEW_BOT_TOKEN', token);
  if (username) after = upsertEnvLine(after, 'BOT_USERNAME', username);

  // Backup and write
  const bak = BOT + '.bak-' + new Date().toISOString().replace(/[:.]/g, '-');
  fs.copyFileSync(BOT, bak);
  write(BOT, after);

  console.log('Imported HOTMESS_NEW_BOT_TOKEN into .env.bot (backup created).');
  if (username) console.log('Updated BOT_USERNAME as well.');
}

main();
