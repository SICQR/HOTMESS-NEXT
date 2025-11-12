#!/usr/bin/env bash
set -euo pipefail

PHASE() { printf "\n\033[1;35m[VERIFY] %s\033[0m\n" "$1"; }
WARN()  { printf "\033[1;33m[WARN] %s\033[0m\n" "$1"; }
ERR()   { printf "\033[1;31m[ERR]  %s\033[0m\n" "$1"; }

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

NO_INSTALL=0
QUICK=0
CI_MODE=0

for arg in "$@"; do
  case "$arg" in
    --no-install) NO_INSTALL=1 ;;
    --quick) QUICK=1 ;;
    --ci) CI_MODE=1 ;;
    *) WARN "Unknown flag: $arg" ;;
  esac
done

PHASE "Workspace sanity"
if [ ! -f package.json ] || [ ! -d app ]; then
  ERR "This script must be run from the hotmess-next project root."
  exit 1
fi
printf "Found app/, package.json, tsconfig.json? %s\n" $( [ -f tsconfig.json ] && echo yes || echo no )

PHASE "Env check"
# Warn and set safe defaults for build-time env to avoid crashes during build.
missing=0
if [ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ]; then missing=1; export NEXT_PUBLIC_SUPABASE_URL="http://localhost:54321"; fi
if [ -z "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" ]; then missing=1; export NEXT_PUBLIC_SUPABASE_ANON_KEY="anon-placeholder"; fi
if [ "$missing" -eq 1 ]; then
  WARN "Missing env detected. Using safe defaults for build. Populate .env.local for real values."
fi

PHASE "Install deps"
if [ "$NO_INSTALL" -eq 0 ]; then
  if command -v npm >/dev/null 2>&1; then
    if [ -d node_modules ]; then
      echo "node_modules present; skipping clean install"
    else
      echo "Installing dependencies (npm ci)…"
      npm ci
    fi
  else
    ERR "npm not found"
    exit 1
  fi
else
  echo "--no-install passed; skipping install"
fi

PHASE "Typecheck"
npm run typecheck

PHASE "Lint"
npm run lint || { ERR "Lint failed"; exit 1; }

PHASE "Tests"
if npm run -s | grep -q "test:ci"; then
  if [ "$CI_MODE" -eq 1 ]; then
    npm run test:ci
  else
    npm test -- --passWithNoTests
  fi
else
  npm test -- --passWithNoTests
fi

if [ "$QUICK" -eq 1 ]; then
  PHASE "Quick mode enabled; skipping build"
  echo "Done (quick)."
  exit 0
fi

PHASE "Build"
# Prefer safe mode for build if issues encountered locally; keep env available.
NEXT_SAFE_MODE=${NEXT_SAFE_MODE:-0} npm run build

PHASE "Bundle size (approx)"
if [ -d .next ]; then
  du -sh .next | tail -n 1 || true
else
  WARN ".next directory not found"
fi

PHASE "next.config sanity"
# We can't easily parse TS here; print relevant env toggles used by config
printf "NEXT_USE_TURBO_ROOT=%s\n" "${NEXT_USE_TURBO_ROOT:-0}"

PHASE "Lighthouse placeholder"
# TODO: Integrate Lighthouse CI here. Skipping for now.

printf "\n\033[1;32m[VERIFY] All checks completed.\033[0m\n"
