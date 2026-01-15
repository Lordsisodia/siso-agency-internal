#!/usr/bin/env bash
set -euo pipefail

# Generates/refreshes a stop-point progress dashboard for the 1909 plan.
#
# It is intentionally simple:
# - Reads `context/pr-diffs/*.md` (excluding README.md)
# - Writes `stop-point-status-dashboard.md` in the plan root
#
# Run from `docs/`.
#
# Usage:
#   ./.blackbox/4-scripts/refresh-1909-stop-point-dashboard.sh
#
# Optional:
#   PLAN=... override plan folder (defaults to 1909 plan)

if [[ "${PWD##*/}" != "docs" ]]; then
  echo "error: run this script from the docs/ directory (current: $PWD)" >&2
  exit 2
fi

PLAN="${PLAN:-.blackbox/.plans/2025-12-29_1909_backend-frontend-interchangeability-scalability-first-principles-loop}"
PR_DIFFS_DIR="$PLAN/context/pr-diffs"
OUT="$PLAN/stop-point-status-dashboard.md"
SNP="$PLAN/artifacts/snapshots"

mkdir -p "$PR_DIFFS_DIR"
mkdir -p "$SNP"

ts_compact="$(date -u +%Y-%m-%d_%H%M%S)"
log_file="$SNP/refresh-1909-stop-point-dashboard.${ts_compact}.log.txt"
exec > >(tee "$log_file") 2>&1
echo "log: $log_file"

ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

echo "# Stop-Point Status Dashboard (1909)" > "$OUT"
echo "" >> "$OUT"
echo "- Updated: \`$ts\`" >> "$OUT"
echo "- Source of truth for PR completion: \`$PR_DIFFS_DIR/\`" >> "$OUT"
echo "" >> "$OUT"
echo "## Filled PR diffs (newest first)" >> "$OUT"
echo "" >> "$OUT"

count=0
completed_prs_tmp="$(mktemp)"
trap 'rm -f "$completed_prs_tmp"' EXIT
while IFS= read -r f; do
  bn="$(basename "$f")"
  [[ "$bn" == "README.md" ]] && continue
  [[ "$bn" == ".keep" ]] && continue
  [[ "$bn" == _* ]] && continue
  [[ "$bn" == *template* ]] && continue
  echo "- \`context/pr-diffs/$bn\`" >> "$OUT"
  count=$((count+1))
  echo "$bn" >> "$completed_prs_tmp"
done < <(ls -1t "$PR_DIFFS_DIR"/*.md 2>/dev/null || true)

if [[ $count -eq 0 ]]; then
  echo "- (none yet — add one by copying \`pr-evidence-diff-summary-template.md\`)" >> "$OUT"
fi

echo "" >> "$OUT"
echo "## Stop points (manual checklist)" >> "$OUT"
echo "" >> "$OUT"
checkbox () {
  local pr="$1"
  # Works on macOS bash 3.2 (no associative arrays).
  # Matches filenames like: *_pr-000_*.md or *_pr-7_*.md
  if grep -Eq "pr-0*${pr}_" "$completed_prs_tmp" 2>/dev/null; then
    echo "[x]"
  else
    echo "[ ]"
  fi
}

latest_diff_for_pr () {
  local pr="$1"
  # Return latest diff filename (relative) for a given PR number, or empty if none.
  # Relies on `ls -1t` order and filename pattern `*_pr-<number>_*.md`.
  local match
  match="$(ls -1t "$PR_DIFFS_DIR"/*.md 2>/dev/null | xargs -n 1 basename | grep -E "pr-0*${pr}_" | head -n 1 || true)"
  if [[ -n "$match" ]]; then
    echo "context/pr-diffs/$match"
  fi
}

render_pr_line () {
  local pr="$1"
  local label="$2"
  local link
  link="$(latest_diff_for_pr "$pr")"
  if [[ -n "$link" ]]; then
    echo "- $(checkbox "$pr") PR $pr — $label — \`$link\`"
  else
    echo "- $(checkbox "$pr") PR $pr — $label"
  fi
}

latest_diff_for_p0_3 () {
  local match
  # Prefer a non-template diff file if one exists; fall back to a template link.
  match="$(ls -1t "$PR_DIFFS_DIR"/*.md 2>/dev/null | xargs -n 1 basename | grep -E "p0-3_" | grep -v "template" | head -n 1 || true)"
  if [[ -z "$match" ]]; then
    match="$(ls -1t "$PR_DIFFS_DIR"/*.md 2>/dev/null | xargs -n 1 basename | grep -E "p0-3_" | head -n 1 || true)"
  fi
  if [[ -n "$match" ]]; then
    echo "context/pr-diffs/$match"
  fi
}

checkbox_p0_3 () {
  if grep -Eq "p0-3_" "$completed_prs_tmp" 2>/dev/null; then
    echo "[x]"
  else
    echo "[ ]"
  fi
}

render_p0_3_line () {
  local label="$1"
  local link
  link="$(latest_diff_for_p0_3)"
  if [[ -n "$link" ]]; then
    echo "- $(checkbox_p0_3) P0.3 — $label — \`$link\`"
  else
    echo "- $(checkbox_p0_3) P0.3 — $label"
  fi
}

render_pr_line 0 "Repo hygiene (optional)" >> "$OUT"
render_p0_3_line "Consolidate backend boundary surface (api/** → functions/api/**)" >> "$OUT"
render_pr_line 1 "Add shared boundary primitives (tenant/auth/cache scaffolding)" >> "$OUT"
render_pr_line 2 "Wire auth guards into admin/exports/metrics/orders" >> "$OUT"
render_pr_line 3 "Wire tenant resolution into tenant-scoped endpoints" >> "$OUT"
render_pr_line 4 "Normalize cache headers for public endpoints" >> "$OUT"
render_pr_line 5 "Add tenancy tables (Supabase)" >> "$OUT"
render_pr_line 6 "Provider config lookup: env → tenant_integrations" >> "$OUT"
render_pr_line 7 "Eliminate vendor ID leaks above adapters (key mapping)" >> "$OUT"
render_pr_line 8 "Onboard tenant #2" >> "$OUT"

cat >> "$OUT" <<'MD'

Notes:
- Checkboxes are auto-marked based on diff files in `context/pr-diffs/`:
  - PRs: `*_pr-<number>_*.md`
  - P0.3: `*_p0-3_*.md`
- This is a lightweight signal, not a substitute for code review.
MD

echo "" >> "$OUT"
echo "## At-risk signals (from latest gate outputs)" >> "$OUT"
echo "" >> "$OUT"

vendor_leaks_file="$PLAN/artifacts/snapshots/check-vendor-leaks.txt"
adapter_imports_file="$PLAN/artifacts/snapshots/boundary-adapter-imports.ui-client.rg.txt"
gaps_report_file="$PLAN/contract-gaps-report-v1.1.md"
drift_file="$PLAN/artifacts/snapshots/api-vs-functions.summary.txt"
vendor_sdk_imports_file="$PLAN/artifacts/snapshots/boundary-vendor-sdk-imports.nonplatform.rg.txt"

metrics_prev_file="$PLAN/artifacts/snapshots/stop-point-metrics.prev.txt"
metrics_latest_file="$PLAN/artifacts/snapshots/stop-point-metrics.latest.txt"

checkout_proxy_cart_file="$PLAN/artifacts/snapshots/functions-cart-c-catchall.ts.head200.txt"
checkout_proxy_checkouts_file="$PLAN/artifacts/snapshots/functions-checkouts-catchall.ts.head200.txt"
checkout_proxy_lib_file="$PLAN/artifacts/snapshots/functions-_lib-shopifyCheckoutProxy.ts.head240.txt"

vendor_leaks_count="unknown"
if [[ -f "$vendor_leaks_file" ]]; then
  vendor_leaks_count="$(grep -Eo 'disallowed_lines=[0-9]+' "$vendor_leaks_file" | tail -n 1 | cut -d= -f2 || true)"
  [[ -z "$vendor_leaks_count" ]] && vendor_leaks_count="unknown"
fi

checkout_proxy_missing="unknown"
missing_count=0
if [[ -f "$checkout_proxy_cart_file" && -s "$checkout_proxy_cart_file" ]]; then :; else missing_count=$((missing_count+1)); fi
if [[ -f "$checkout_proxy_checkouts_file" && -s "$checkout_proxy_checkouts_file" ]]; then :; else missing_count=$((missing_count+1)); fi
if [[ -f "$checkout_proxy_lib_file" && -s "$checkout_proxy_lib_file" ]]; then :; else missing_count=$((missing_count+1)); fi
checkout_proxy_missing="$missing_count"

adapter_imports_violations="unknown"
if [[ -f "$adapter_imports_file" ]]; then
  # Count non-empty, non-comment lines without failing under `set -e` when the file is empty.
  adapter_imports_violations="$(awk '
    $0 ~ /^[[:space:]]*#/ {next}
    $0 ~ /^[[:space:]]*$/ {next}
    {c++}
    END {print c+0}
  ' "$adapter_imports_file")"
fi

api_only_endpoints="unknown"
if [[ -f "$drift_file" ]]; then
  api_only_endpoints="$(awk '/^api_only:/ {print $2; exit}' "$drift_file" || true)"
  [[ -z "$api_only_endpoints" ]] && api_only_endpoints="unknown"
fi

vendor_sdk_imports_total="unknown"
vendor_sdk_imports_clerk="unknown"
vendor_sdk_imports_stripe="unknown"
if [[ -f "$vendor_sdk_imports_file" ]]; then
  vendor_sdk_imports_total="$(awk 'NF {c++} END {print c+0}' "$vendor_sdk_imports_file")"
  vendor_sdk_imports_clerk="$(awk 'index($0, "@clerk/") {c++} END {print c+0}' "$vendor_sdk_imports_file")"
  vendor_sdk_imports_stripe="$(awk 'index($0, "@stripe/") {c++} END {print c+0}' "$vendor_sdk_imports_file")"
fi

count_section_lines () {
  local file="$1"
  local start_pat="$2"
  local end_pat="$3"
  if [[ ! -f "$file" ]]; then
    echo "unknown"
    return
  fi
  awk -v start="$start_pat" -v end="$end_pat" '
    $0 ~ start {inside=1; next}
    $0 ~ end {inside=0}
    inside==1 && $0 ~ /^- `/ {c++}
    END { if (c == "") print 0; else print c }
  ' "$file"
}

missing_auth_count="$(count_section_lines "$gaps_report_file" '^## A\\)' '^## B\\)')"
missing_cache_count="$(count_section_lines "$gaps_report_file" '^## B\\)' '^## C\\)')"

count_auth_gap_family () {
  local file="$1"
  local family="$2"
  if [[ ! -f "$file" ]]; then
    echo "unknown"
    return
  fi
  awk -v family="$family" '
    $0 ~ /^## A\)/ {inside=1; next}
    $0 ~ /^## B\)/ {inside=0}
    inside==1 && $0 ~ /^- `/ {
      # Lines look like: - `functions/api/admin/orders/get.ts`
      gsub(/^-[[:space:]]*`/, "", $0)
      gsub(/`[[:space:]]*$/, "", $0)
      if ($0 ~ ("^functions/api/" family "/")) c++
    }
    END { if (c == "") print 0; else print c }
  ' "$file"
}

auth_gap_admin_count="$(count_auth_gap_family "$gaps_report_file" "admin")"
auth_gap_exports_count="$(count_auth_gap_family "$gaps_report_file" "exports")"
auth_gap_metrics_count="$(count_auth_gap_family "$gaps_report_file" "metrics")"
auth_gap_orders_count="$(count_auth_gap_family "$gaps_report_file" "orders")"

status_word () {
  local val="$1"
  if [[ "$val" == "unknown" ]]; then
    echo "UNKNOWN"
    return
  fi
  if [[ "$val" == "0" ]]; then
    echo "OK"
  else
    echo "WARN"
  fi
}

status_word_max () {
  local val="$1"
  local max="$2"
  if [[ "$val" == "unknown" ]]; then
    echo "UNKNOWN"
    return
  fi
  if [[ ! "$val" =~ ^[0-9]+$ || ! "$max" =~ ^[0-9]+$ ]]; then
    echo "UNKNOWN"
    return
  fi
  if [[ "$val" -le "$max" ]]; then
    echo "OK"
  else
    echo "WARN"
  fi
}

read_metric () {
  local file="$1"
  local key="$2"
  if [[ ! -f "$file" ]]; then
    echo "unknown"
    return
  fi
  local v
  v="$(grep -E "^${key}=" "$file" | tail -n 1 | cut -d= -f2- || true)"
  [[ -z "$v" ]] && v="unknown"
  echo "$v"
}

delta_str () {
  local now="$1"
  local prev="$2"
  if [[ "$now" == "unknown" || "$prev" == "unknown" ]]; then
    echo "Δ?"
    return
  fi
  # Only numeric deltas supported.
  if [[ ! "$now" =~ ^[0-9]+$ || ! "$prev" =~ ^[0-9]+$ ]]; then
    echo "Δ?"
    return
  fi
  local d=$((now - prev))
  if [[ $d -gt 0 ]]; then
    echo "Δ+$d"
  else
    echo "Δ$d"
  fi
}

# Persist metrics for trend deltas (rotate latest -> prev).
if [[ -f "$metrics_latest_file" ]]; then
  cp "$metrics_latest_file" "$metrics_prev_file"
fi
{
  echo "captured_at=$ts"
  echo "checkout_proxy_missing_snapshots=$checkout_proxy_missing"
  echo "vendor_leaks_disallowed_lines=$vendor_leaks_count"
  echo "adapter_imports_ui_client_violations=$adapter_imports_violations"
  echo "backend_surface_api_only_endpoints=$api_only_endpoints"
  echo "vendor_sdk_imports_nonplatform_total=$vendor_sdk_imports_total"
  echo "vendor_sdk_imports_nonplatform_clerk=$vendor_sdk_imports_clerk"
  echo "vendor_sdk_imports_nonplatform_stripe=$vendor_sdk_imports_stripe"
  echo "contract_gaps_missing_auth=$missing_auth_count"
  echo "contract_gaps_missing_cache=$missing_cache_count"
} > "$metrics_latest_file"

prev_checkout_proxy="$(read_metric "$metrics_prev_file" checkout_proxy_missing_snapshots)"
prev_vendor="$(read_metric "$metrics_prev_file" vendor_leaks_disallowed_lines)"
prev_adapters="$(read_metric "$metrics_prev_file" adapter_imports_ui_client_violations)"
prev_api_only="$(read_metric "$metrics_prev_file" backend_surface_api_only_endpoints)"
prev_vendor_sdk_total="$(read_metric "$metrics_prev_file" vendor_sdk_imports_nonplatform_total)"
prev_auth="$(read_metric "$metrics_prev_file" contract_gaps_missing_auth)"
prev_cache="$(read_metric "$metrics_prev_file" contract_gaps_missing_cache)"

echo "- Checkout proxy seam missing snapshots: \`$checkout_proxy_missing\` ($(status_word "$checkout_proxy_missing"), $(delta_str "$checkout_proxy_missing" "$prev_checkout_proxy")) — \`$checkout_proxy_lib_file\`" >> "$OUT"
echo "- Vendor leak disallowed lines: \`$vendor_leaks_count\` ($(status_word "$vendor_leaks_count"), $(delta_str "$vendor_leaks_count" "$prev_vendor")) — \`$vendor_leaks_file\`" >> "$OUT"
echo "- UI/client adapter import violations: \`$adapter_imports_violations\` ($(status_word "$adapter_imports_violations"), $(delta_str "$adapter_imports_violations" "$prev_adapters")) — \`$adapter_imports_file\`" >> "$OUT"
echo "- Vendor SDK imports outside platform (<=10 OK): \`$vendor_sdk_imports_total\` (clerk=\`$vendor_sdk_imports_clerk\`, stripe=\`$vendor_sdk_imports_stripe\`) ($(status_word_max "$vendor_sdk_imports_total" 10), $(delta_str "$vendor_sdk_imports_total" "$prev_vendor_sdk_total")) — \`$vendor_sdk_imports_file\`" >> "$OUT"
echo "- Backend surface drift (api-only endpoints): \`$api_only_endpoints\` ($(status_word "$api_only_endpoints"), $(delta_str "$api_only_endpoints" "$prev_api_only")) — \`$drift_file\`" >> "$OUT"
echo "- Contract gaps (missing auth cues, heuristic): \`$missing_auth_count\` ($(status_word "$missing_auth_count"), $(delta_str "$missing_auth_count" "$prev_auth")) — \`$gaps_report_file\`" >> "$OUT"
echo "- Contract gaps (missing cache headers, heuristic): \`$missing_cache_count\` ($(status_word "$missing_cache_count"), $(delta_str "$missing_cache_count" "$prev_cache")) — \`$gaps_report_file\`" >> "$OUT"

echo "" >> "$OUT"
cat >> "$OUT" <<'MD'
## How to interpret these signals (quick)

- `OK` means the metric is within its acceptable threshold (often 0).
- `WARN` means outside the acceptable threshold; treat it as “swap readiness is blocked until this is reduced”.
- `Δ` is the delta vs the previous dashboard refresh (a quick trend signal, not a PR diff).
  - For PR-specific evidence, write a diff summary under `context/pr-diffs/` and then refresh the dashboard.
- Suggested priority order (stop-the-line first):
  - Adapter import violations and checkout proxy seam regressions (these break core invariants immediately).
  - Backend surface drift (`api_only`) → do P0.3 to enforce a single canonical `/api/*` boundary.
  - Auth gaps on sensitive endpoint families → do PR2 (admin/metrics/orders/exports).
  - Vendor leaks above adapters → do PR7 (key mapping) to unlock true provider swaps.
  - Cache header gaps on public endpoints → do PR4 (safe edge caching posture).
- Contract gap counts are heuristic scans of endpoint files; they may be reduced by centralizing helpers + making cues explicit.
  - See: `contract-gaps-report-v1.1.md`
  - Expected per-PR deltas (what “good progress” looks like) are documented in:
    - `pr-stop-point-gate-pack.md`
    - `p0-3-boundary-consolidation-detailed-plan.md`
MD

echo "" >> "$OUT"
echo "## Recommended next PR (heuristic)" >> "$OUT"
echo "" >> "$OUT"

recommend_pr=""
recommend_reason=""

is_positive_int () {
  [[ "$1" =~ ^[0-9]+$ ]] && [[ "$1" != "0" ]]
}

# Priority order: security regressions > auth gaps on sensitive endpoints > swappability leaks > contract enforcement.
if is_positive_int "$adapter_imports_violations"; then
  recommend_pr="(regression) Fix adapter import violations"
  recommend_reason="UI/client is importing adapters directly; this breaks swappability. Fix before other work."
elif is_positive_int "$checkout_proxy_missing"; then
  recommend_pr="(regression) Restore checkout proxy/handoff seam"
  recommend_reason="Checkout proxy/handoff snapshots are missing; this seam keeps vendor checkout routes/domains out of the UI."
elif is_positive_int "$api_only_endpoints"; then
  recommend_pr="P0.3 — Consolidate backend boundary surface (api/** → functions/api/**)"
  recommend_reason="There are endpoints implemented under api/** that are not present under functions/api/**; this can break the “single canonical boundary” invariant and block Cloudflare-first operation."
elif is_positive_int "$missing_auth_count" && (
  is_positive_int "$auth_gap_admin_count" ||
  is_positive_int "$auth_gap_exports_count" ||
  is_positive_int "$auth_gap_metrics_count" ||
  is_positive_int "$auth_gap_orders_count"
); then
  recommend_pr="PR 2 — Wire auth guards into admin/exports/metrics/orders"
  recommend_reason="Sensitive endpoint families appear to lack auth cues (admin/exports/metrics/orders). Close this risk before swappability cleanup."
elif is_positive_int "$vendor_leaks_count"; then
  recommend_pr="PR 7 — Eliminate vendor ID leaks above adapters (key mapping)"
  recommend_reason="Vendor IDs exist above adapters; this is the main blocker to swapping providers/clients safely."
elif is_positive_int "$missing_auth_count"; then
  recommend_pr="PR 2 — Wire auth guards into admin/exports/metrics/orders"
  recommend_reason="Many admin/metrics endpoints appear to lack auth cues; close this risk early."
elif is_positive_int "$missing_cache_count"; then
  recommend_pr="PR 4 — Normalize cache headers for public endpoints"
  recommend_reason="Public endpoints appear to lack explicit cache headers; fix to make caching safe and predictable."
else
  recommend_pr="Next unchecked stop point"
  recommend_reason="No current WARN signals detected; proceed with the next PR in order."
fi

echo "" >> "$OUT"
echo "### Auth gap hot-spots (from gaps report section A)" >> "$OUT"
echo "" >> "$OUT"
echo "- admin: \`$auth_gap_admin_count\`" >> "$OUT"
echo "- exports: \`$auth_gap_exports_count\`" >> "$OUT"
echo "- metrics: \`$auth_gap_metrics_count\`" >> "$OUT"
echo "- orders: \`$auth_gap_orders_count\`" >> "$OUT"

echo "- Next: **$recommend_pr**" >> "$OUT"
echo "- Why: $recommend_reason" >> "$OUT"
echo "- Then run: \`./.blackbox/4-scripts/refresh-1909-all-gates.sh\` and \`./.blackbox/4-scripts/refresh-1909-stop-point-dashboard.sh\`" >> "$OUT"

cat >> "$OUT" <<'MD'

## How to use this dashboard

- After completing any PR, create a diff summary file under `context/pr-diffs/`.
- Then refresh gates + dashboard:
  - Preferred: `./.blackbox/4-scripts/run-1909-loop.sh`
  - Equivalent:
    - `./.blackbox/4-scripts/refresh-1909-all-gates.sh`
    - `./.blackbox/4-scripts/refresh-1909-stop-point-dashboard.sh`
MD

cp "$log_file" "$SNP/refresh-1909-stop-point-dashboard.latest.log.txt" 2>/dev/null || true

echo "done: wrote $OUT"
