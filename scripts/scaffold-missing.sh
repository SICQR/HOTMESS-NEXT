#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

paths=(
  "app/onboarding/layout.tsx"
  "app/onboarding/seller/page.tsx"
  "app/onboarding/customer/page.tsx"
  "app/qr/page.tsx"
  "app/api/sellers/route.ts"
  "app/api/qr/scan/route.ts"
  "app/api/qr/rewards/route.ts"
  "app/marketplace/page.tsx"
  "app/marketplace/[sellerId]/page.tsx"
  "components/Button.tsx"
  "components/InputField.tsx"
  "components/ProgressBar.tsx"
  "lib/env.ts"
  "lib/supabase.ts"
  "lib/log.ts"
  "sql/004_onboarding_qr.sql"
)

for p in "${paths[@]}"; do
  mkdir -p "$(dirname "$p")"
  if [ ! -f "$p" ]; then
    cat > "$p" <<'FILE'
// TODO: stub created by scaffold. Replace with implementation.
export default function Stub() { return null }
FILE
    echo "Created $p"
  fi
done
echo "Done."
