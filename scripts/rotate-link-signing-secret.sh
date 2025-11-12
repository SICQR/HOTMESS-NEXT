#!/usr/bin/env bash
set -euo pipefail

# Rotate LINK_SIGNING_SECRET locally without printing the old value.
# Usage: bash scripts/rotate-link-signing-secret.sh

ENV_FILE=".env.local"

if ! command -v openssl >/dev/null 2>&1; then
  echo "✖ openssl not found. Install openssl to generate secure secrets." >&2
  exit 1
fi

NEW_SECRET=$(openssl rand -hex 32)

# Ensure env file exists
[ -f "$ENV_FILE" ] || touch "$ENV_FILE"

# Update or add key without printing existing value
awk -v k="LINK_SIGNING_SECRET" -v v="$NEW_SECRET" '
  BEGIN{r=0}
  $0 ~ "^"k"=" {print k"="v; r=1; next}
  {print}
  END{if(!r) print k"="v}
' "$ENV_FILE" > "$ENV_FILE.tmp" && mv "$ENV_FILE.tmp" "$ENV_FILE"

# Best-effort: redact display
LEN=${#NEW_SECRET}
MASKED="${NEW_SECRET:0:4}…${NEW_SECRET: -4}"

echo "🔐 LINK_SIGNING_SECRET rotated in $ENV_FILE (length=$LEN)."
echo "   New value (redacted): $MASKED"
echo "   Note: previously issued QR signatures will become invalid."
