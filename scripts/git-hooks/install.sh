#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

if ! command -v npx >/dev/null 2>&1; then
  echo "npx not found" >&2
  exit 1
fi

# Initialize Husky if not already
if [ ! -d .husky ]; then
  echo "Initializing Husky…"
  npx husky init
fi

# Ensure pre-push runs typecheck, lint and tests
HOOK_FILE=".husky/pre-push"
cat > "$HOOK_FILE" <<'EOF'
#!/usr/bin/env sh
. "$(dirname "$0")/_/husky.sh"

npm run typecheck || exit 1
npm run lint || exit 1
npm test -- --passWithNoTests || exit 1
EOF
chmod +x "$HOOK_FILE"

echo "Husky pre-push hook installed."
