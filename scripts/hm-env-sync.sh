#!/usr/bin/env bash
set -euo pipefail

# Usage: bash scripts/hm-env-sync.sh [development|preview|production]
ENV_IN="${1:-development}"
case "$ENV_IN" in
  dev|development) VERCEL_ENV="development" ;;
  preview)         VERCEL_ENV="preview" ;;
  prod|production) VERCEL_ENV="production" ;;
  *) echo "Usage: $0 [development|preview|production]"; exit 1 ;;
 esac

if ! command -v vercel >/dev/null 2>&1; then
  echo "Error: vercel CLI not found. Install with: npm i -g vercel"
  exit 1
fi

if [ ! -f scripts/env/manifest.json ]; then
  echo "Error: scripts/env/manifest.json not found."
  exit 1
fi

# Ensure .env.local is gitignored
touch .gitignore
if ! grep -qE '^\.env(\..+)?\.local$|^\.env\.local$' .gitignore; then
  echo ".env.local" >> .gitignore
fi

echo "Pulling Vercel env → .env.vercel.local ($VERCEL_ENV)… (non-destructive merge)"
set +e
vercel env pull .env.vercel.local --environment="$VERCEL_ENV" --yes
RC=$?
set -e
if [ $RC -ne 0 ] || [ ! -f .env.vercel.local ]; then
  echo "vercel env pull failed. Run: vercel login && vercel link, then retry."
  exit 1
fi

# Merge strategy:
# - If .env.local does not exist, copy pulled file.
# - If it exists, update/append keys from .env.vercel.local without removing existing keys.
if [ ! -f .env.local ]; then
  cp .env.vercel.local .env.local
else
  # function: set/update KEY=VALUE in .env.local without printing values
  set_kv() {
    local file="$1"; shift
    local key="$1"; shift
    local val="$1"; shift || true
    awk -v k="$key" -v v="$val" 'BEGIN{r=0} $0 ~ "^"k"=" {print k"="v; r=1; next} {print} END{if(!r) print k"="v}' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
  }
  while IFS= read -r line; do
    [ -z "$line" ] && continue
    [[ "$line" =~ ^# ]] && continue
    if echo "$line" | grep -q '='; then
      k="${line%%=*}"
      v="${line#*=}"
      # Trim surrounding quotes
      v="${v#\'}`echo`" # no-op placeholder to avoid echoing values
      v="${v%\'}"
      v="${v#\"}"
      v="${v%\"}"
      set_kv .env.local "$k" "$v"
    fi
  done < .env.vercel.local
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "⚠️  jq not found; format checks will be skipped."
  JQ_MISSING=1
else
  JQ_MISSING=0
fi

get_val() { grep -E "^$1=" .env.local | tail -n1 | cut -d'=' -f2- | sed -e 's/^"//' -e "s/^'//" -e 's/"$//' -e "s/'$//"; }

# helper: set/update key globally (if set_kv not defined above)
if ! declare -f set_kv >/dev/null 2>&1; then
  set_kv() {
    local file="$1"; shift
    local key="$1"; shift
    local val="$1"; shift || true
    awk -v k="$key" -v v="$val" 'BEGIN{r=0} $0 ~ "^"k"=" {print k"="v; r=1; next} {print} END{if(!r) print k"="v}' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
  }
fi

# Auto-mirror Supabase server vars to public web vars locally (no Vercel writes)
mirror_if_missing() {
  local src="$1"; shift
  local dst="$1"; shift
  local src_val dst_val
  src_val="$(get_val "$src")"
  dst_val="$(get_val "$dst")"
  if [ -n "$src_val" ] && [ -z "$dst_val" ]; then
    set_kv .env.local "$dst" "$src_val"
    echo "🔄 Mirrored $src → $dst in .env.local"
  fi
}

mirror_if_missing SUPABASE_URL NEXT_PUBLIC_SUPABASE_URL
mirror_if_missing SUPABASE_ANON_KEY NEXT_PUBLIC_SUPABASE_ANON_KEY

# In development, auto-generate a LINK_SIGNING_SECRET if missing to ease first-run
if [ "$VERCEL_ENV" = "development" ]; then
  if [ -z "$(get_val LINK_SIGNING_SECRET)" ]; then
    if command -v openssl >/dev/null 2>&1; then
      echo "LINK_SIGNING_SECRET=$(openssl rand -hex 32)" >> .env.local
      echo "🔐 Generated LINK_SIGNING_SECRET in .env.local (development only)."
    else
      echo "ℹ️  openssl not found; skipping auto-generation of LINK_SIGNING_SECRET."
    fi
  fi
fi


MISSING_REQ=()
BAD_FORMAT=()

# Validate required keys
if [ "$JQ_MISSING" -eq 0 ]; then
  for k in $(jq -r '.site.required[]' scripts/env/manifest.json); do
    val="$(get_val "$k")"
    if [ -z "${val:-}" ]; then
      MISSING_REQ+=("$k")
    else
      re=$(jq -r --arg k "$k" '.site.formatHints[$k] // empty' scripts/env/manifest.json)
      if [ -n "$re" ]; then
        echo "$val" | grep -Eq "$re" || BAD_FORMAT+=("$k")
      fi
    fi
  done

  # Optional present → format check
  for k in $(jq -r '.site.optional[]' scripts/env/manifest.json); do
    val="$(get_val "$k")"
    if [ -n "${val:-}" ]; then
      re=$(jq -r --arg k "$k" '.site.formatHints[$k] // empty' scripts/env/manifest.json)
      if [ -n "$re" ]; then
        echo "$val" | grep -Eq "$re" || BAD_FORMAT+=("$k")
      fi
    fi
  done
else
  # Fallback without jq: just check presence of required keys
  while read -r k; do
    [ -z "$k" ] && continue
    val="$(get_val "$k")"
    [ -z "${val:-}" ] && MISSING_REQ+=("$k")
  done < <(printf "%s\n" BOT_BASE_URL TELEGRAM_NOTIFY_SECRET INTERNAL_PARTNER_SECRET LINK_SIGNING_SECRET NEXT_PUBLIC_BOT_USERNAME NEXT_PUBLIC_BOT_CHANNEL_URL NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY)
fi

if [ "${#MISSING_REQ[@]}" -gt 0 ]; then
  echo "❌ Missing required Vercel env keys in .env.local:"
  for k in "${MISSING_REQ[@]}"; do echo "  - $k"; done
  echo "Add them in Vercel → Settings → Environment Variables ($VERCEL_ENV), then re-run pull.";
  echo "Hint: generate new 64-hex secrets via: openssl rand -hex 32";
  exit 1;
fi

if [ "${#BAD_FORMAT[@]}" -gt 0 ]; then
  echo "⚠️  These keys are present but fail format checks (verify values):"
  for k in "${BAD_FORMAT[@]}"; do echo "  - $k"; done
fi

echo "✅ .env.local verified for site ($VERCEL_ENV)."

# Cleanup pulled file (optional)
rm -f .env.vercel.local || true