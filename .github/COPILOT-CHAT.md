# GitHub Copilot Chat Assistant — HOTMESS Next.js

This playbook ensures Copilot Chat “sees” the hotmess-next project and can work incrementally without breaking conventions.

## A) Quick VS Code fixes (1 minute)
- Open the workspace root as the hotmess-next folder
  - VS Code: File → Open Folder… → select the repository root (it should contain `package.json` and `app/`)
  - Trust the workspace if prompted
- Command Palette (Cmd/Ctrl+Shift+P):
  - “TypeScript: Restart TS server”
  - “Developer: Rebuild Index”
  - “Developer: Reload Window”
- Verify you see `package.json` and `app/` at the root in Explorer

## B) Master prompt for Copilot Chat
Paste the full block below into a Copilot Chat panel while the project root is open.

```
You are operating in the existing Next.js App Router project whose root is the folder named “hotmess-next”. Do not assume a fresh build. Your goals:
1) Discover and use existing files. If a referenced file is missing, create a minimal, compiling stub with TODO and do not overwrite existing content.
2) Work incrementally without asking me questions. Fix missing imports, add missing deps, and align with the existing design system.
3) Ensure the following key paths exist or are created as stubs without overwriting:
- app/onboarding/layout.tsx
- app/onboarding/seller/page.tsx
- app/onboarding/customer/page.tsx
- app/qr/page.tsx
- app/api/sellers/route.ts
- app/api/qr/scan/route.ts
- app/api/qr/rewards/route.ts
- app/marketplace/page.tsx
- app/marketplace/[sellerId]/page.tsx
- components/Button.tsx
- components/InputField.tsx
- components/ProgressBar.tsx
- lib/env.ts
- lib/supabase.ts
- lib/log.ts
- sql/004_onboarding_qr.sql
4) If @/ imports are used, verify tsconfig.json has: "paths": { "@/*": ["./*"] }
5) If zod or @supabase/supabase-js are missing, add them with:
- npm i zod @supabase/supabase-js
6) After file creation or edits, ensure the project compiles: fix types, imports, and exports. Use relative imports if the @ alias is not configured.
7) Produce a short “what changed” summary at the end of your output.

Tasks to execute now:
- Build a quick file map of app/, components/, lib/, api/ and note anything missing.
- Wire /app/api/sellers/route.ts to validate payload with Zod and insert into Supabase (table: sellers). Return { success, data } or { success: false, error }.
- Create /app/onboarding/seller/page.tsx form that POSTs to /api/sellers (client-side Zod ok).
- Create /app/api/qr/scan/route.ts and /app/api/qr/rewards/route.ts. Deterministic points for same qrCode; upsert user_rewards; log to qr_events.
- Create /app/qr/page.tsx showing current points and a Scan button that calls the API.
- If any path is missing, create the stub file with minimal compiling code and TODO comments.
- Do not alter unrelated files. Keep changes small and cohesive.
```

## C) Make files visible to Copilot (optional but helpful)
Run these at the repo root.

macOS/Linux:
```
# Create an index file of project files
if command -v tree >/dev/null 2>&1; then tree -L 3 > .project-files.txt; else find . -maxdepth 3 -type f | sort > .project-files.txt; fi
# Add a hint file with key paths
printf "%s\n" \
  "app/onboarding/layout.tsx" \
  "app/onboarding/seller/page.tsx" \
  "app/onboarding/customer/page.tsx" \
  "app/qr/page.tsx" \
  "app/api/sellers/route.ts" \
  "app/api/qr/scan/route.ts" \
  "app/api/qr/rewards/route.ts" \
  "app/marketplace/page.tsx" \
  "app/marketplace/[sellerId]/page.tsx" \
  "components/Button.tsx" \
  "components/InputField.tsx" \
  "components/ProgressBar.tsx" \
  "lib/env.ts" \
  "lib/supabase.ts" \
  "lib/log.ts" \
  "sql/004_onboarding_qr.sql" \
  > .copilot-hint.txt
```

Windows PowerShell:
```
If (Get-Command tree -ErrorAction SilentlyContinue) { tree /F > .project-files.txt } Else { Get-ChildItem -Recurse -Depth 3 -File | Sort-Object FullName | Select-Object -Expand FullName > .project-files.txt }
@(
  "app/onboarding/layout.tsx",
  "app/onboarding/seller/page.tsx",
  "app/onboarding/customer/page.tsx",
  "app/qr/page.tsx",
  "app/api/sellers/route.ts",
  "app/api/qr/scan/route.ts",
  "app/api/qr/rewards/route.ts",
  "app/marketplace/page.tsx",
  "app/marketplace/[sellerId]/page.tsx",
  "components/Button.tsx",
  "components/InputField.tsx",
  "components/ProgressBar.tsx",
  "lib/env.ts",
  "lib/supabase.ts",
  "lib/log.ts",
  "sql/004_onboarding_qr.sql"
) | Set-Content .copilot-hint.txt
```

## D) Safe scaffolder (creates only if missing)
macOS/Linux (bash):
```
cat > scripts/scaffold-missing.sh <<'EOF'
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
    cat > "$p" <<FILE
// TODO: stub created by scaffold. Replace with implementation.
export default function Stub() { return null }
FILE
    echo "Created $p"
  fi
done
echo "Done."
EOF
chmod +x scripts/scaffold-missing.sh
./scripts/scaffold-missing.sh
```

Windows PowerShell:
```
New-Item -ItemType Directory -Force scripts | Out-Null
@'
param()
$paths = @(
  "app/onboarding/layout.tsx",
  "app/onboarding/seller/page.tsx",
  "app/onboarding/customer/page.tsx",
  "app/qr/page.tsx",
  "app/api/sellers/route.ts",
  "app/api/qr/scan/route.ts",
  "app/api/qr/rewards/route.ts",
  "app/marketplace/page.tsx",
  "app/marketplace/[sellerId]/page.tsx",
  "components/Button.tsx",
  "components/InputField.tsx",
  "components/ProgressBar.tsx",
  "lib/env.ts",
  "lib/supabase.ts",
  "lib/log.ts",
  "sql/004_onboarding_qr.sql"
)
foreach ($p in $paths) {
  $dir = Split-Path $p
  New-Item -ItemType Directory -Force $dir | Out-Null
  if (-not (Test-Path $p)) {
    "// TODO: stub created by scaffold. Replace with implementation.`nexport default function Stub(){ return null }" | Set-Content $p
    Write-Output "Created $p"
  }
}
'@ | Set-Content scripts\scaffold-missing.ps1
powershell -ExecutionPolicy Bypass -File scripts\scaffold-missing.ps1
```

## E) Ensure @ alias resolves
Open `tsconfig.json` and confirm:
```
"baseUrl": ".",
"paths": { "@/*": ["./*"] }
```

## F) Install missing deps
```
npm i zod @supabase/supabase-js
# Optional
npm i swr react-globe.gl three
```

## G) Re-index after changes
- TypeScript: Restart TS server
- Developer: Rebuild Index
- Developer: Reload Window

If Copilot is still “blind”:
- Confirm Explorer shows `.project-files.txt` and `.copilot-hint.txt` at the root
- Close other folders from the workspace and open only the project root
- Toggle the GitHub Copilot Chat extension off/on, then Reload Window
