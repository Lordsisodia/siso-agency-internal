#!/usr/bin/env bash
set -euo pipefail

# Refreshes evidence snapshots for the 1909 architecture plan and regenerates:
# - backend-boundary-contract-v1.1-endpoint-table.md
# - contract-gaps-report-v1.1.md
#
# Run from `docs/`.
#
# Usage:
#   ./.blackbox/4-scripts/refresh-1909-contract-evidence.sh

if [[ "${PWD##*/}" != "docs" ]]; then
  echo "error: run this script from the docs/ directory (current: $PWD)" >&2
  exit 2
fi

PLAN="${PLAN:-.blackbox/.plans/2025-12-29_1909_backend-frontend-interchangeability-scalability-first-principles-loop}"
SNP="$PLAN/artifacts/snapshots"

mkdir -p "$SNP"

ts_compact="$(date -u +%Y-%m-%d_%H%M%S)"
log_file="$SNP/refresh-1909-contract-evidence.${ts_compact}.log.txt"
exec > >(tee "$log_file") 2>&1
echo "log: $log_file"

echo "[1/5] Refreshing /functions/api inventories"
find ../functions/api -type f | sed 's|^../||' | sort > "$SNP/functions-api-files.clean.find.txt"
rg -n "^export const onRequest" ../functions/api > "$SNP/functions-api-handlers.clean.rg.txt" || true

echo "[2/5] Refreshing implementation cue scans (auth/tenant/cache/security)"
rg -n "Authorization|Bearer |getToken\\(|clerk|Clerk|requireInternalAuth\\(|X-Forwarded-Host|\\bHost\\b|tenant" ../functions/api > "$SNP/functions-api-auth-tenant-cues.rg.txt" || true
rg -n "Cache-Control|Vary\\b|ETag\\b|s-maxage|max-age|no-store|cache|jsonTenantPublic\\(|jsonNoStore\\(" ../functions/api > "$SNP/functions-api-cache-cues.rg.txt" || true
rg -n "X-Shopify|hmac|webhook|signature|SHOPIFY" ../functions/api > "$SNP/functions-api-shopify-security-cues.rg.txt" || true

echo "[3/5] Building per-file cue matrix"
python3 - <<'PY'
import os, re
from pathlib import Path

plan = Path(os.environ.get("PLAN", ".blackbox/.plans/2025-12-29_1909_backend-frontend-interchangeability-scalability-first-principles-loop"))
snp = plan / "artifacts" / "snapshots"
files = [line.strip() for line in (snp / "functions-api-files.clean.find.txt").read_text().splitlines() if line.strip()]

root = Path("..")
auth_re = re.compile(r"Authorization|Bearer |getToken\(|clerk|Clerk|requireInternalAuth\(", re.I)
tenant_re = re.compile(r"X-Forwarded-Host|\bHost\b|tenant", re.I)
cache_re = re.compile(r"Cache-Control|\bVary\b|ETag|s-maxage|max-age|no-store|cache|jsonTenantPublic\(|jsonNoStore\(", re.I)
shop_re = re.compile(r"X-Shopify|hmac|webhook|signature|SHOPIFY", re.I)

out_lines = []
out_lines.append("# source: ../functions/api/**")
out_lines.append(f"# captured: {os.popen('date -u +%Y-%m-%dT%H:%M:%SZ').read().strip()}")
out_lines.append("# format: path | auth_cues | tenant_cues | cache_cues | shopify_security_cues")
out_lines.append("")

for rel in files:
  p = root / rel
  try:
    text = p.read_text(errors="ignore")
  except Exception as e:
    out_lines.append(f"{rel} | ERROR({e.__class__.__name__}) | 0 | 0 | 0")
    continue
  auth = 1 if auth_re.search(text) else 0
  tenant = 1 if tenant_re.search(text) else 0
  cache = 1 if cache_re.search(text) else 0
  shop = 1 if shop_re.search(text) else 0
  out_lines.append(f"{rel} | {auth} | {tenant} | {cache} | {shop}")

(snp / "functions-api-cues.matrix.txt").write_text("\n".join(out_lines) + "\n")
PY

echo "[4/5] Regenerating contract v1.1 endpoint table + gaps report"
python3 - <<'PY'
from pathlib import Path
from collections import defaultdict
import os
import re

plan = Path(os.environ.get("PLAN", ".blackbox/.plans/2025-12-29_1909_backend-frontend-interchangeability-scalability-first-principles-loop"))
snp = plan / "artifacts" / "snapshots"

files = [l.strip() for l in (snp / "functions-api-files.clean.find.txt").read_text().splitlines() if l.strip()]

matrix = {}
for line in (snp / "functions-api-cues.matrix.txt").read_text().splitlines():
  if not line or line.startswith("#"):
    continue
  parts = [p.strip() for p in line.split("|")]
  if len(parts) != 5:
    continue
  path, auth, tenant, cache, shop = parts
  matrix[path] = {"auth": int(auth), "tenant": int(tenant), "cache": int(cache), "shop": int(shop)}

root = Path("..")
edge_cache_policy_re = re.compile(r"Cache-Control|s-maxage|max-age|jsonTenantPublic\(", re.I)

def classify(path: str):
  rel = path.replace("functions/api/", "")
  if rel == "health.ts":
    return ("health", "public", "no-store", "no", "health/diagnostics")
  if rel.startswith("storefront/landing/"):
    return ("storefront", "public", "edge-cacheable", "yes", "content sections")
  if rel.startswith("storefront/product/"):
    return ("storefront", "public", "edge-cacheable", "yes", "catalog + sections")
  if rel.startswith("storefront/cart/"):
    return ("storefront", "public_or_user", "no-store", "yes", "cart")
  if rel.startswith("payments/"):
    return ("payments", "user_or_public", "no-store", "yes", "payments")
  if rel.startswith("customer-auth/"):
    return ("customer-auth", "mixed", "no-store", "yes", "customer auth")
  if rel.startswith("customer/"):
    return ("customer", "user", "no-store", "yes", "customer data")
  if rel.startswith("admin/"):
    return ("admin", "admin", "no-store", "yes", "admin backoffice")
  if rel.startswith("exports/"):
    return ("exports", "admin", "no-store", "yes", "exports")
  if rel.startswith("metrics/"):
    return ("metrics", "admin", "no-store", "yes", "metrics")
  if rel.startswith("shopify/webhooks/"):
    return ("shopify-webhooks", "integration", "no-store", "yes", "provider plumbing")
  if rel.startswith("shopify/"):
    return ("shopify", "integration", "no-store", "yes", "provider auth/session")
  if rel.startswith("webhooks/"):
    return ("webhooks", "integration", "no-store", "yes", "provider webhooks")
  if rel.startswith("orders/"):
    return ("orders", "admin_or_service", "no-store", "yes", "order lookup")
  if rel == "experiment/config.ts":
    return ("experiment", "public", "edge-cacheable", "yes", "experiments/flags config")
  if rel == "experiment/track.ts":
    return ("experiment", "public", "no-store", "yes", "experiments/ingest")
  if rel.startswith("experiment/"):
    return ("experiment", "public", "no-store", "yes", "experiments/other")
  return ("other", "unknown", "unknown", "unknown", "")

groups = defaultdict(list)
for p in files:
  grp, tier, cache_req, tenant_req, maps_to = classify(p)
  groups[grp].append((p, tier, cache_req, tenant_req, maps_to))

order = ["health","storefront","payments","customer-auth","customer","admin","exports","metrics","orders","experiment","shopify","shopify-webhooks","webhooks","other"]

lines = []
lines.append("# Backend Boundary Contract v1.1 — Endpoint Table (current surface)")
lines.append("")
lines.append("This is a machine-derived table of the current `/api/*` surface (from `functions/api/**`) plus the v1 contract expectations.")
lines.append("")
lines.append("Evidence:")
lines.append(f"- Route inventory: `{snp/'functions-api-files.clean.find.txt'}`")
lines.append(f"- Handler inventory: `{snp/'functions-api-handlers.clean.rg.txt'}`")
lines.append(f"- Cue matrix (auth/tenant/cache/security): `{snp/'functions-api-cues.matrix.txt'}`")
lines.append(f"- Auth/tenant cue grep: `{snp/'functions-api-auth-tenant-cues.rg.txt'}`")
lines.append(f"- Cache cue grep: `{snp/'functions-api-cache-cues.rg.txt'}`")
lines.append(f"- Shopify security cue grep: `{snp/'functions-api-shopify-security-cues.rg.txt'}`")
lines.append("")
lines.append("Legend:")
lines.append("- `auth_cues`: header/token usage found in file body (heuristic)")
lines.append("- `tenant_cues`: host/tenant strings found in file body (heuristic; may be handled in shared `_lib`)")
lines.append("- `cache_cues`: Cache-Control/ETag/Vary strings found (heuristic)")
lines.append("- `shopify_security_cues`: hmac/signature/webhook strings found (heuristic)")
lines.append("")
lines.append("---")

for grp in order:
  if grp not in groups:
    continue
  title = grp.replace("-", " ").title()
  lines.append(f"## {title}")
  lines.append("")
  lines.append("| Endpoint file | Tier (required) | Tenant (required) | Cache (required) | Maps to | auth_cues | tenant_cues | cache_cues | shopify_security_cues |")
  lines.append("|---|---:|---:|---:|---|---:|---:|---:|---:|")
  for p, tier, cache_req, tenant_req, maps_to in sorted(groups[grp]):
    m = matrix.get(p, {"auth":0,"tenant":0,"cache":0,"shop":0})
    lines.append(f"| `{p}` | `{tier}` | `{tenant_req}` | `{cache_req}` | {maps_to} | {m['auth']} | {m['tenant']} | {m['cache']} | {m['shop']} |")
  lines.append("")

(plan / "backend-boundary-contract-v1.1-endpoint-table.md").write_text("\n".join(lines) + "\n")

# gaps report (heuristic)
missing_auth = []
missing_cache = []
missing_tenant = []

for p in files:
  grp, tier, cache_req, tenant_req, _ = classify(p)
  m = matrix.get(p, {"auth":0,"tenant":0,"cache":0,"shop":0})
  if tier in ("admin","user","admin_or_service") and m["auth"] == 0:
    missing_auth.append(p)
  if cache_req == "edge-cacheable":
    try:
      text = (root / p).read_text(errors="ignore")
    except Exception:
      text = ""
    if not edge_cache_policy_re.search(text):
      missing_cache.append(p)
  if tenant_req == "yes" and m["tenant"] == 0:
    missing_tenant.append(p)

out = []
out.append("# Contract Gaps Report (v1.1 heuristics)")
out.append("")
out.append("This report compares contract expectations (tier/tenant/cache) to a string-cue scan of `functions/api/**`.")
out.append("These are heuristics: some behaviors may live in shared helpers (`functions/_lib/**`).")
out.append("")
out.append("Evidence inputs:")
out.append(f"- `{snp/'functions-api-cues.matrix.txt'}`")
out.append(f"- `{snp/'functions-api-auth-tenant-cues.rg.txt'}`")
out.append(f"- `{snp/'functions-api-cache-cues.rg.txt'}`")
out.append("")
out.append("---")
out.append("## A) Endpoints that look like they lack auth enforcement (by cue scan)")
out.append("")
out.extend([f"- `{p}`" for p in missing_auth] or ["- (none)"])
out.append("")
out.append("## B) Endpoints that look like they lack explicit cache headers (but are expected edge-cacheable)")
out.append("")
out.extend([f"- `{p}`" for p in missing_cache] or ["- (none)"])
out.append("")
out.append("## C) Endpoints with no tenant/host cues in-file (tenant required by contract)")
out.append("")
pref = defaultdict(int)
for p in missing_tenant:
  rel = p.replace("functions/api/", "")
  pref[rel.split("/")[0]] += 1
for k in sorted(pref):
  out.append(f"- `{k}/**` — {pref[k]} files")
out.append("")
out.append("Interpretation:")
out.append("- If tenant resolution is centralized (recommended), it may not appear in each endpoint file; it should appear in a shared helper and be called by every endpoint.")

(plan / "contract-gaps-report-v1.1.md").write_text("\n".join(out) + "\n")
PY

echo "[5/5] Refreshing snapshot index"
ls -la "$SNP" > "$SNP/_snapshot-index.ls.txt"

cp "$log_file" "$SNP/refresh-1909-contract-evidence.latest.log.txt" 2>/dev/null || true

echo "done: refreshed contract evidence under $PLAN"
