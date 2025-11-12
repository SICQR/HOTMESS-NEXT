#!/usr/bin/env bash
set -euo pipefail

# env-doctor: Pull (dev) + validate + summarize gaps.
# Usage: pnpm run env:doctor  OR  bash scripts/env-doctor.sh [development|preview|production]
#        Add --lenient or HM_ENV_DOCTOR_LENIENT=1 to ignore public NEXT_PUBLIC_* keys in dev

ENV_IN="${1:-development}"
LENIENT="0"
if [ "${2:-}" = "--lenient" ] || [ "${HM_ENV_DOCTOR_LENIENT:-0}" = "1" ]; then
  LENIENT="1"
fi
case "$ENV_IN" in
  dev|development) VERCEL_ENV="development" ;;
  preview) VERCEL_ENV="preview" ;;
  prod|production) VERCEL_ENV="production" ;;
  *) echo "Usage: $0 [development|preview|production]"; exit 1 ;;
 esac

if ! command -v vercel >/dev/null 2>&1; then
  echo "✖ vercel CLI not installed (npm i -g vercel)."; exit 1
fi

# Pull environment
bash scripts/hm-env-sync.sh "$VERCEL_ENV" || true

# Run validator (web scope)
VALIDATOR_OUT=$(pnpm run validate:env:web 2>&1 || true)

echo "----- ENV VALIDATION SUMMARY ($VERCEL_ENV) -----"
# Extract missing lines (we'll compute our own counts)
MISSING_KEYS_STR=$(echo "$VALIDATOR_OUT" | awk '/^  ✖ /{print $2}' | tr '\n' ' ')

# Apply lenient ignores for public keys commonly provided only at deploy time
IGNORED_STR=""
FILTERED_STR=""
if [ "$LENIENT" = "1" ] && [ "$VERCEL_ENV" = "development" ]; then
  # Default ignore set for public client vars often provided via shared/project envs
  IGNORE_KEYS="NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY NEXT_PUBLIC_RADIOKING_BASE NEXT_PUBLIC_RADIOKING_SLUG"
  # Allow override/extension via HM_ENV_DOCTOR_IGNORE_KEYS (space or comma separated)
  if [ -n "${HM_ENV_DOCTOR_IGNORE_KEYS:-}" ]; then
    # Replace commas with spaces, collapse multiple spaces
    EXTRA_IGNORES=$(echo "$HM_ENV_DOCTOR_IGNORE_KEYS" | tr ',' ' ' | tr -s ' ')
    IGNORE_KEYS="$IGNORE_KEYS $EXTRA_IGNORES"
  fi
  for k in $MISSING_KEYS_STR; do
    skip=0
    for ig in $IGNORE_KEYS; do [ "$k" = "$ig" ] && skip=1 && break; done
    if [ $skip -eq 1 ]; then
      IGNORED_STR="$IGNORED_STR $k"
    else
      FILTERED_STR="$FILTERED_STR $k"
    fi
  done
else
  FILTERED_STR="$MISSING_KEYS_STR"
fi

# Print summary
FILTERED_COUNT=0
for _ in $FILTERED_STR; do FILTERED_COUNT=$((FILTERED_COUNT+1)); done
if [ $FILTERED_COUNT -gt 0 ]; then
  echo "Required variables missing: $FILTERED_COUNT"
  for k in $FILTERED_STR; do echo " - $k"; done
  printf "\nSafe, copy-paste ready commands to add them in Vercel (you will be prompted for values):\n"
  for k in $FILTERED_STR; do echo "  vercel env add $k $VERCEL_ENV"; done
  printf "\nNotes:\n"
  echo " - NEXT_PUBLIC_* keys are public client variables."
  echo " - Non NEXT_PUBLIC_* keys (e.g., LINK_SIGNING_SECRET) are server-only; do not expose in client."
else
  echo "All required web variables present."
fi

# If lenient and some keys were ignored, print a note
if [ -n "${IGNORED_STR// /}" ]; then
  printf "\nLenient mode: ignored these missing public keys in development (often provided via shared/project envs at deploy time):\n"
  for k in $IGNORED_STR; do echo " - $k"; done
fi

# List optional but recommended keys if absent
RECOMMENDED=(GO_TO_ALLOWLIST NEXT_PUBLIC_SITE_URL TELEGRAM_NOTIFY_SECRET INTERNAL_PARTNER_SECRET EDGE_ANALYTICS_URL)
MISSING_RECOMMENDED=()
for key in "${RECOMMENDED[@]}"; do
  if ! grep -q " ${key} " <<< "$VALIDATOR_OUT"; then
    continue
  fi
  if echo "$VALIDATOR_OUT" | grep -E "^  · ${key} " >/dev/null 2>&1; then
    # present optional
    continue
  fi
  # If it shows neither check nor dot and isn't required pass
  # Simpler approach: check for ' ${key} ' then presence of '✔'
  LINE=$(echo "$VALIDATOR_OUT" | grep -E " ${key} ") || true
  if [ -n "$LINE" ] && ! echo "$LINE" | grep -q '✔'; then
    MISSING_RECOMMENDED+=("$key")
  fi
  # For dot optional present status we already skip
  # For absence we add
  if [ -z "$LINE" ]; then MISSING_RECOMMENDED+=("$key"); fi
done

if [ "${#MISSING_RECOMMENDED[@]}" -gt 0 ]; then
  echo "Optional recommended variables missing:"; for k in "${MISSING_RECOMMENDED[@]}"; do echo " - $k"; done
fi

echo "----------------------------------------------"
# Exit code: fail only if filtered missing > 0
[ $FILTERED_COUNT -eq 0 ] && exit 0 || exit 1
