#!/usr/bin/env bash
set -euo pipefail

# Refreshes the full swappability gate suite for the 1909 architecture plan:
# - Contract evidence refresh (inventories + cue scans + v1.1 endpoint table + gaps report)
# - Boundary import scans (UI/client must not import adapters)
# - Vendor leak scan (Shopify GIDs etc above adapters)
# - Platform inventories (ports/runtimes/adapters)
#
# Run from `docs/`.
#
# Usage:
#   ./.blackbox/4-scripts/refresh-1909-all-gates.sh
#
# Optional:
#   PLAN=... override the plan folder (defaults to 1909 plan)

if [[ "${PWD##*/}" != "docs" ]]; then
  echo "error: run this script from the docs/ directory (current: $PWD)" >&2
  exit 2
fi

PLAN="${PLAN:-.blackbox/.plans/2025-12-29_1909_backend-frontend-interchangeability-scalability-first-principles-loop}"
SNP="$PLAN/artifacts/snapshots"

mkdir -p "$SNP"

ts_compact="$(date -u +%Y-%m-%d_%H%M%S)"
log_file="$SNP/refresh-1909-all-gates.${ts_compact}.log.txt"
exec > >(tee "$log_file") 2>&1
echo "log: $log_file"

echo "[0/5] Capturing gate script heads (for audit)"
ls -la .blackbox/scripts > "$SNP/docs-blackbox-scripts-dir.ls.txt" || true
sed -n '1,220p' .blackbox/4-scripts/refresh-1909-all-gates.sh > "$SNP/docs-blackbox-scripts-refresh-1909-all-gates.sh.head220.txt" || true
sed -n '1,200p' .blackbox/4-scripts/refresh-1909-contract-evidence.sh > "$SNP/docs-blackbox-scripts-refresh-1909-contract-evidence.sh.head200.txt" || true
sed -n '1,220p' .blackbox/4-scripts/refresh-1909-stop-point-dashboard.sh > "$SNP/docs-blackbox-scripts-refresh-1909-stop-point-dashboard.sh.head220.txt" || true
./.blackbox/4-scripts/check-blackbox.sh > "$SNP/check-blackbox.${ts_compact}.txt" || true
cp "$SNP/check-blackbox.${ts_compact}.txt" "$SNP/check-blackbox.latest.txt" 2>/dev/null || true
ls -la .blackbox > "$SNP/docs-blackbox-root.ls.${ts_compact}.txt" || true
ls -la .blackbox/.plans > "$SNP/docs-blackbox-plans.ls.${ts_compact}.txt" || true
cp "$SNP/docs-blackbox-root.ls.${ts_compact}.txt" "$SNP/docs-blackbox-root.ls.latest.txt" 2>/dev/null || true
cp "$SNP/docs-blackbox-plans.ls.${ts_compact}.txt" "$SNP/docs-blackbox-plans.ls.latest.txt" 2>/dev/null || true

echo "[0b/5] Refreshing plan doc head snapshots (evidence anchors)"
# Some plan docs cite `plan-*.head*.txt` snapshots directly as evidence anchors.
# Keep these refreshed on every run so citations can't silently go stale.
snapshot_head() {
  local input_file="$1"
  local output_file="$2"
  local lines="$3"

  if [ -f "$input_file" ]; then
    sed -n "1,${lines}p" "$input_file" > "$output_file" || true
  else
    {
      echo "MISSING: $input_file"
      echo "captured_at: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    } > "$output_file" || true
  fi
}

snapshot_head "$PLAN/acceptance-gates.md" "$SNP/plan-acceptance-gates.md.head120.txt" 120
snapshot_head "$PLAN/backend-boundary-contract-v0.md" "$SNP/plan-backend-boundary-contract-v0.md.head120.txt" 120
snapshot_head "$PLAN/backend-boundary-contract-v1.md" "$SNP/plan-backend-boundary-contract-v1.md.head120.txt" 120
snapshot_head "$PLAN/tenancy-context-rules.md" "$SNP/plan-tenancy-context-rules.md.head120.txt" 120
snapshot_head "$PLAN/scalability-plan.md" "$SNP/plan-scalability-plan.md.head120.txt" 120
snapshot_head "$PLAN/migration-stages.md" "$SNP/plan-migration-stages.md.head120.txt" 120

echo "[1/5] Refreshing contract evidence (endpoint inventories + v1.1 table + gaps)"
./.blackbox/4-scripts/refresh-1909-contract-evidence.sh

echo "[1b/5] Snapshotting checkout proxy seam (vendor-agnostic handoff)"
if [ -f '../functions/cart/c/[[catchall]].ts' ]; then
  sed -n '1,200p' '../functions/cart/c/[[catchall]].ts' > "$SNP/functions-cart-c-catchall.ts.head200.txt" || true
fi
if [ -f '../functions/checkouts/[[catchall]].ts' ]; then
  sed -n '1,200p' '../functions/checkouts/[[catchall]].ts' > "$SNP/functions-checkouts-catchall.ts.head200.txt" || true
fi
if [ -f '../functions/_lib/shopifyCheckoutProxy.ts' ]; then
  sed -n '1,240p' '../functions/_lib/shopifyCheckoutProxy.ts' > "$SNP/functions-_lib-shopifyCheckoutProxy.ts.head240.txt" || true
fi

echo "[2/5] Refreshing boundary import scans (UI/client must not import adapters)"
rg -n "@platform/.*/adapters" ../src > "$SNP/boundary-adapter-imports.rg.txt" || true
rg -n "domains/platform/.*/adapters" ../src/ui ../src/domains/client > "$SNP/boundary-adapter-imports.ui-client.rg.txt" || true

echo "[3/5] Refreshing vendor leak scan (report-only until hard gate)"
./.blackbox/4-scripts/check-vendor-leaks.sh > "$SNP/check-vendor-leaks.txt" || true

echo "[3b/5] Refreshing provider coupling scans (informative, not passing gates)"
# These scans help answer: "where are we still coupled to a specific vendor/infrastructure component?"
# Keep them scoped to code directories (avoid docs noise).
rg -n "clerk|Clerk" ../src ../functions > "$SNP/coupling-clerk-matches.txt" || true
rg -n "gid://shopify" ../src ../functions ../api > "$SNP/coupling-shopify-gid-matches.txt" || true
rg -n "shopify|Shopify|SHOPIFY_" ../src ../functions ../api > "$SNP/coupling-shopify-word-matches.txt" || true
rg -n "stripe|Stripe|STRIPE_" ../src ../functions ../api > "$SNP/coupling-stripe-matches.txt" || true
rg -n "supabase|Supabase|SUPABASE_" ../src ../functions ../api ../server > "$SNP/coupling-supabase-matches.txt" || true

echo "[3c/5] Refreshing vendor SDK import scan (UI should not depend on vendor SDKs outside platform/*)"
# This is a report-only gate today; the goal is to shrink this output over time by:
# - pushing identity/payments UI coupling behind platform domains (or capability-driven wrappers)
# - keeping vendor SDKs out of product/client domains
rg -n "from '@clerk/clerk-react'|from '@stripe/stripe-js'|from '@stripe/react-stripe-js'|from '@supabase/supabase-js'|from '@shopify" ../src \
  | rg -v '^\.\./src/domains/platform/' \
  > "$SNP/boundary-vendor-sdk-imports.nonplatform.rg.txt" || true

# Convenience snapshots: unique files by vendor (keeps remediation planning mechanical).
vendor_sdk_file="$SNP/boundary-vendor-sdk-imports.nonplatform.rg.txt"
if [ -f "$vendor_sdk_file" ]; then
  awk -F: '{print $1}' "$vendor_sdk_file" | sed 's|^../||' | sort -u > "$SNP/boundary-vendor-sdk-imports.nonplatform.unique-files.txt"
  awk -F: 'index($0, "@clerk/") {print $1}' "$vendor_sdk_file" | sed 's|^../||' | sort -u > "$SNP/boundary-vendor-sdk-imports.nonplatform.unique-files.clerk.txt"
  awk -F: 'index($0, "@stripe/") {print $1}' "$vendor_sdk_file" | sed 's|^../||' | sort -u > "$SNP/boundary-vendor-sdk-imports.nonplatform.unique-files.stripe.txt"
fi

echo "[4/5] Refreshing platform inventories (ports/runtimes/adapters)"
find ../src/domains/platform -path '*ports*' -type f | sed 's|^../||' | sort > "$SNP/platform-ports-files.txt"
find ../src/domains/platform -name 'runtime.ts' -type f | sed 's|^../||' | sort > "$SNP/platform-runtime-files.txt"
find ../src/domains/platform -path '*adapters*' -type f | sed 's|^../||' | sort > "$SNP/platform-adapters-files.txt"

echo "[4b/5] Refreshing src topology inventories (repo architecture evidence)"
# These are evidence snapshots used by architecture docs; keep them refreshed so citations never go stale.
find ../src -maxdepth 4 -type d | sed 's|^../||' | sort > "$SNP/src-tree.maxdepth4.dirs.txt"
find ../src -maxdepth 2 -type f | sed 's|^../||' | sort > "$SNP/src-files.maxdepth2.txt"
if [ -d ../src/domains ]; then
  find ../src/domains -maxdepth 3 -type d | sed 's|^../||' | sort > "$SNP/src-domains.maxdepth3.dirs.txt"
  find ../src/domains -maxdepth 3 -type f | sed 's|^../||' | sort > "$SNP/src-domains.maxdepth3.files.txt"
fi
if [ -d ../src/domains/platform ]; then
  find ../src/domains/platform -type f | sed 's|^../||' | sort > "$SNP/src-domains-platform-files.find.txt"
fi

# Capture a small, stable extract of key frontend platform-boundary files for evidence-backed docs.
key_extract="$SNP/src-key-files.extract.latest.txt"
: > "$key_extract"
for f in ../src/main.tsx ../src/router.tsx ../src/App.tsx \
  ../src/domains/platform/http/internal-api/client.ts \
  ../src/domains/platform/commerce/runtime.ts \
  ../src/domains/platform/commerce/ports/checkout.ts \
  ../src/domains/platform/commerce/adapters/shopify/internal-api/checkout.ts \
  ../src/domains/platform/storage/supabase.ts; do
  echo "===== ${f#../}" >> "$key_extract"
  if [ -f "$f" ]; then
    sed -n '1,200p' "$f" >> "$key_extract" || true
  else
    echo "MISSING" >> "$key_extract"
  fi
  echo "" >> "$key_extract"
done

# Targeted file heads for evidence-backed docs (kept separate for easy linking).
if [ -f '../src/domains/platform/auth/providers/AuthContext.impl.tsx' ]; then
  sed -n '1,240p' '../src/domains/platform/auth/providers/AuthContext.impl.tsx' > "$SNP/src-domains-platform-auth-providers-AuthContext.impl.tsx.head240.txt" || true
fi
if [ -f '../src/shells/ClerkShell.tsx' ]; then
  sed -n '1,200p' '../src/shells/ClerkShell.tsx' > "$SNP/src-shells-ClerkShell.tsx.head200.txt" || true
fi

echo "[5/5] Refreshing legacy/aux inventories (repo top-level + api/ + server/)"
( cd .. && ls -la ) > "$SNP/repo-top-level.ls.txt"
if [ -d ../functions ]; then
  find ../functions -type f | sed 's|^../||' | sort > "$SNP/functions-files.find.txt"
  rg -n "context\\.env\\.|process\\.env\\.|\\b(env|getEnv|getenv)\\(|SHOPIFY_|STRIPE_|CLERK_|SUPABASE_" ../functions > "$SNP/functions-provider-env-reads.rg.txt" || true
fi
if [ -d ../api ]; then
  find ../api -type f | sed 's|^../||' | sort > "$SNP/api-files.find.txt"
fi
if [ -d ../server ]; then
  find ../server -type f | sed 's|^../||' | sort > "$SNP/server-files.find.txt"
fi

echo "Computing api/** vs functions/api/** endpoint diff (drift signal)"
if [ -f "$SNP/api-files.find.txt" ] && [ -f "$SNP/functions-api-files.clean.find.txt" ]; then
  # Normalize both endpoint sets to a common form so we can compare surface areas.
  # Notes:
  # - api/** includes _lib and other non-endpoint files; filter those out.
  # - functions/api/** inventory is already endpoint handlers only (from contract evidence refresh).
  cat "$SNP/api-files.find.txt" \
    | sed -n 's|^api/||p' \
    | sed -n 's|\.ts$||p' \
    | grep -Ev '(^_lib/|^shopify/_lib/|^storefront/_client$|/_map$|^shopify/_admin$|^test$)' \
    | grep -Ev '(^customer-auth/(pkce|utils)$|^shopify/webhooks/_verify$)' \
    | sort -u > "$SNP/api-endpoints.normalized.txt"

  cat "$SNP/functions-api-files.clean.find.txt" \
    | sed -n 's|^functions/api/||p' \
    | sed -n 's|\.ts$||p' \
    | sort -u > "$SNP/functions-endpoints.normalized.txt"

  comm -12 "$SNP/api-endpoints.normalized.txt" "$SNP/functions-endpoints.normalized.txt" > "$SNP/api-vs-functions.common.txt"
  comm -23 "$SNP/api-endpoints.normalized.txt" "$SNP/functions-endpoints.normalized.txt" > "$SNP/api-only-endpoints.txt"
  comm -13 "$SNP/api-endpoints.normalized.txt" "$SNP/functions-endpoints.normalized.txt" > "$SNP/functions-only-endpoints.txt"

  echo "Refreshing api-only endpoint triage snapshots (usage scan + handler heads bundle)"
  if [ -f "$SNP/api-only-endpoints.txt" ]; then
    # Usage scan is useful for prioritizing P0.3 work (UI-callers first).
    # Exclude snapshot directories to avoid self-referential matches.
    tmp_usage="$(mktemp "$SNP/.tmp.api-only-usage.XXXXXX" 2>/dev/null || echo "")"
    if [[ -n "$tmp_usage" ]]; then
      {
        echo "timestamp: ${ts_compact}"
        echo "source: ${PLAN}/artifacts/snapshots/api-only-endpoints.txt"
        echo "root: .."
      } > "$tmp_usage"

      while IFS= read -r ep; do
        [[ -z "$ep" ]] && continue
        {
          echo ""
          echo "=== exact: /api/${ep} ==="
          echo ""
        } >> "$tmp_usage"
        rg -n "/api/${ep}" .. --glob '!docs/.blackbox/.plans/**/artifacts/snapshots/**' >> "$tmp_usage" || true
      done < "$SNP/api-only-endpoints.txt"

      mv "$tmp_usage" "$SNP/api-only-endpoints.exact-usage.latest.txt"
    fi

    # Bundle heads for the current api-only set so triage is evidence-first.
    out_heads="$SNP/api-only-endpoints.handlers.head80.txt"
    : > "$out_heads"
    while IFS= read -r ep; do
      [[ -z "$ep" ]] && continue
      f="../api/${ep}.ts"
      if [ -f "$f" ]; then
        echo "### $f" >> "$out_heads"
        sed -n '1,80p' "$f" >> "$out_heads"
        echo "" >> "$out_heads"
      else
        echo "### MISSING: $f" >> "$out_heads"
        echo "" >> "$out_heads"
      fi
    done < "$SNP/api-only-endpoints.txt"
  fi

  {
    echo "api_endpoints: $(wc -l < "$SNP/api-endpoints.normalized.txt")"
    echo "functions_endpoints: $(wc -l < "$SNP/functions-endpoints.normalized.txt")"
    echo "common: $(wc -l < "$SNP/api-vs-functions.common.txt")"
    echo "api_only: $(wc -l < "$SNP/api-only-endpoints.txt")"
    echo "functions_only: $(wc -l < "$SNP/functions-only-endpoints.txt")"
    echo
    echo "api_only_top_prefixes:"
    cut -d/ -f1 "$SNP/api-only-endpoints.txt" | sort | uniq -c | sort -nr | head -n 20
    echo
    echo "functions_only_top_prefixes:"
    cut -d/ -f1 "$SNP/functions-only-endpoints.txt" | sort | uniq -c | sort -nr | head -n 20
  } > "$SNP/api-vs-functions.summary.txt"
fi

echo "Refreshing snapshot index"
ls -la "$SNP" > "$SNP/_snapshot-index.ls.txt"

cp "$log_file" "$SNP/refresh-1909-all-gates.latest.log.txt" 2>/dev/null || true

echo "done: refreshed all gates under $PLAN"
