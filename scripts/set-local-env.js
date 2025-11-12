#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Safely set or update key=value pairs in .env.local without touching Vercel.
 * Usage: node scripts/set-local-env.js KEY=value [KEY2=value ...]
 * - Creates .env.local if missing
 * - Preserves existing lines and comments
 * - Updates keys if present; appends new keys at the end
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/set-local-env.js KEY=value [KEY2=value ...]');
  process.exit(1);
}

const kvs = {};
for (const arg of args) {
  const idx = arg.indexOf('=');
  if (idx === -1) {
    console.error(`Invalid arg (expected KEY=value): ${arg}`);
    process.exit(2);
  }
  const key = arg.slice(0, idx);
  const value = arg.slice(idx + 1);
  if (!key) {
    console.error(`Empty key in arg: ${arg}`);
    process.exit(3);
  }
  kvs[key] = value;
}

const envPath = path.resolve(process.cwd(), '.env.local');
let lines = [];
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  lines = content.split(/\r?\n/);
} else {
  lines = [];
}

// Build an index of existing keys (ignoring comments and blank lines)
const keyLineIndex = new Map();
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line || /^\s*#/.test(line)) continue;
  const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
  if (match) {
    const key = match[1];
    keyLineIndex.set(key, i);
  }
}

// Apply updates
for (const [key, value] of Object.entries(kvs)) {
  const newLine = `${key}=${value}`;
  if (keyLineIndex.has(key)) {
    const idx = keyLineIndex.get(key);
    lines[idx] = newLine;
  } else {
    if (lines.length > 0 && lines[lines.length - 1] !== '') {
      lines.push(''); // ensure a blank line before appending
    }
    lines.push(newLine);
  }
}

const out = lines.join('\n');
fs.writeFileSync(envPath, out, { encoding: 'utf8' });

console.log(`Updated ${envPath} with ${Object.keys(kvs).length} key(s).`);
