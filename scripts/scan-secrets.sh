#!/usr/bin/env bash
set -euo pipefail

# Lightweight secret scan for common leaks in repo (working tree only).
# Skips node_modules, .next, coverage, .git, and local env files.
# Usage: bash scripts/scan-secrets.sh

ROOT_DIR="$(pwd)"
EXCLUDES=(
  "--glob=!node_modules/**"
  "--glob=!.next/**"
  "--glob=!coverage/**"
  "--glob=!.git/**"
  "--glob=!.vercel/**"
  "--glob=!.env*"
)

PATTERNS=(
  # Direct var names in code (no values printed)
  "SUPABASE_SERVICE_ROLE_KEY"
  "LINK_SIGNING_SECRET"
  "TELEGRAM_BOT_TOKEN|TELEGRAM_WEBHOOK_SECRET|STRIPE_WEBHOOK_SECRET"
  # Heuristic: accidental JWT strings hardcoded (header.payload.signature)
  "^[A-Za-z0-9-_]{10,}\\.[A-Za-z0-9-_]{10,}\\.[A-Za-z0-9-_]{10,}$"
)

run_rg() {
  rg --hidden --line-number --no-heading "${EXCLUDES[@]}" "$@" || true
}

if command -v rg >/dev/null 2>&1; then
  echo "🔎 Using ripgrep for scanning"
  for pat in "${PATTERNS[@]}"; do
    echo "\n-- Pattern: $pat"
    run_rg -N -e "$pat" "$ROOT_DIR" | sed 's/\x1b\[[0-9;]*m//g' || true
  done
else
  echo "ℹ️  ripgrep not found; falling back to grep (slower)."
  GREP_EXCLUDES=( -R -n -I --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=coverage --exclude='*.env*' )
  for pat in "${PATTERNS[@]}"; do
    echo "\n-- Pattern: $pat"
    grep "${GREP_EXCLUDES[@]}" -E "$pat" . || true
  done
fi

echo "\n✅ Scan complete (matches shown above; values not printed)."
