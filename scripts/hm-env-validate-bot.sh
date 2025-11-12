#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-.env.bot}"   # optional local file for bot env; otherwise uses current shell env
[ -f "$ENV_FILE" ] && set -a && source "$ENV_FILE" && set +a

if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is required. Install jq and re-run."
  exit 1
fi

if [ ! -f scripts/env/manifest.json ]; then
  echo "Error: scripts/env/manifest.json not found."
  exit 1
fi

get_env() { eval "printf '%s' \"\${$1-}\""; }

missing=()
bad=()

# Base required
for k in $(jq -r '.bot.required[]' scripts/env/manifest.json); do
  v="$(get_env "$k")"
  if [ -z "${v:-}" ]; then
    missing+=("$k")
  else
    re=$(jq -r --arg k "$k" '.bot.formatHints[$k] // empty' scripts/env/manifest.json)
    if [ -n "$re" ]; then echo "$v" | grep -Eq "$re" || bad+=("$k"); fi
  fi
done

# Conditional token requirement based on HOTMESS_ACTIVE_BOT
active="$(get_env HOTMESS_ACTIVE_BOT)"
case "$active" in
  radio)      req_token="HOTMESS_RADIO_BOT_TOKEN" ;;
  radio_v2)   req_token="HOTMESS_RADIO_BOT_TOKEN_v2" ;;
  playground) req_token="HOTMESS_PLAYGROUND_BOT_TOKEN" ;;
  new|*)      req_token="HOTMESS_NEW_BOT_TOKEN" ;;
 esac

v="$(get_env "$req_token")"
if [ -z "${v:-}" ]; then
  missing+=("$req_token")
else
  re=$(jq -r --arg k "$req_token" '.bot.formatHints[$k] // empty' scripts/env/manifest.json)
  if [ -n "$re" ]; then echo "$v" | grep -Eq "$re" || bad+=("$req_token"); fi
fi

if [ "${#missing[@]}" -gt 0 ]; then
  echo "❌ Missing required bot env keys:"
  for k in "${missing[@]}"; do echo "  - $k"; done
  exit 1
fi

if [ "${#bad[@]}" -gt 0 ]; then
  echo "⚠️  Present but failing format checks (verify values):"
  for k in "${bad[@]}"; do echo "  - $k"; done
fi

echo "✅ Bot env verified (mode: ${active:-unset})."