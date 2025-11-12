#!/usr/bin/env bash
set -euo pipefail

OUT="${1:-.env.bot}"
if [ -f "$OUT" ]; then
  echo "Refusing to overwrite existing $OUT. Pass a different path to generate a new file."
  exit 1
fi

cat > "$OUT" <<'EOF'
# Local bot env template (do NOT commit)
# Set values and validate with: pnpm run env:bot:check:local

HOTMESS_ACTIVE_BOT=new            # or radio | radio_v2 | playground

# Shared secrets
TELEGRAM_NOTIFY_SECRET=<64-hex>
LINK_SIGNING_SECRET=<64-hex>
SITE_BASE_URL=https://hotmess.london

# Identity
BOT_USERNAME=HotmessNew_bot       # no leading @ here
BOT_CHANNEL_URL=https://t.me/HOTMESSRADIOXXX

# Tokens (choose the one matching HOTMESS_ACTIVE_BOT)
HOTMESS_NEW_BOT_TOKEN=123456789:XXXXXXXXXXXXXXXXXXXXXXXXXXXX
HOTMESS_RADIO_BOT_TOKEN=
HOTMESS_RADIO_BOT_TOKEN_v2=
HOTMESS_PLAYGROUND_BOT_TOKEN=
EOF

echo "Wrote $OUT. Next: fill values, then run: pnpm run env:bot:check:local"
