#!/usr/bin/env bash
set -euo pipefail

# check-vendor-leaks.sh
#
# Optional, lightweight hygiene check to help keep "UI is plug-in" true:
# - Detect vendor IDs (e.g. Shopify GIDs) and vendor-specific checkout copy in UI/client layers.
#
# By default this is report-only (exit 0).
# Use --fail to exit non-zero if leaks are found (useful for CI or pre-merge checks).
#
# Run from repo root:
#   ./docs/.blackbox/4-scripts/check-vendor-leaks.sh
# Or from within docs/:
#   ./.blackbox/4-scripts/check-vendor-leaks.sh

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
docs_root="$(cd "$here/../.." && pwd)"
repo_root="$(cd "$docs_root/.." && pwd)"

usage() {
  cat <<'EOF' >&2
Usage:
  check-vendor-leaks.sh [--fail]

Flags:
  --fail   Exit 1 if any matches are found (default: report-only, exit 0).
EOF
}

fail=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --fail)
      fail=true
      shift || true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown arg: $1" >&2
      usage
      exit 2
      ;;
  esac
done

if ! command -v rg >/dev/null 2>&1; then
  echo "WARN: ripgrep (rg) not found; skipping vendor leak scan." >&2
  exit 0
fi

targets=(
  "$repo_root/src/ui"
  "$repo_root/src/domains/client"
  "$repo_root/src/lib"
)

patterns=(
  "gid://shopify/"
  "Preparing Shopify checkout"
  "Secure checkout \\(Shopify\\)"
)

disallowed_patterns=0
disallowed_lines_total=0

is_allowed_match() {
  local pattern="$1"
  local line="$2"

  # Allowed transitional match: legacy GID cleanup helper in CartContext.
  # This is explicitly a "sunset" item, but we don't want it to block --fail in the meantime.
  if [[ "$pattern" == "gid://shopify/" ]]; then
    if [[ "$line" == *"/src/domains/client/shop/cart/providers/CartContext.tsx:"* && "$line" == *"startsWith('gid://shopify/'"* ]]; then
      return 0
    fi
  fi

  return 1
}

if [[ "$fail" == "true" ]]; then
  echo "Vendor leak scan (fail-on-match=true)"
else
  echo "Vendor leak scan (report-only=true)"
fi
echo "- repo: $repo_root"
echo "- targets:"
for t in "${targets[@]}"; do
  echo "  - ${t#$repo_root/}"
done

for pat in "${patterns[@]}"; do
  echo ""
  echo "=== Pattern: $pat ==="

  matches="$(rg -n --no-heading -S "$pat" "${targets[@]}" 2>/dev/null || true)"
  if [[ -z "$matches" ]]; then
    echo "(no matches)"
    continue
  fi

  allowed=""
  disallowed=""
  while IFS= read -r line; do
    if is_allowed_match "$pat" "$line"; then
      allowed+="$line"$'\n'
    else
      disallowed+="$line"$'\n'
    fi
  done <<<"$matches"

  if [[ -n "$disallowed" ]]; then
    printf "%s" "$disallowed"
    disallowed_patterns=$((disallowed_patterns + 1))
    disallowed_lines_total=$((disallowed_lines_total + $(printf "%s" "$disallowed" | wc -l | tr -d ' ')))
  else
    echo "(no disallowed matches)"
  fi

  if [[ -n "$allowed" ]]; then
    echo ""
    echo "Allowed (legacy/transitional):"
    printf "%s" "$allowed"
  fi
done

echo ""
echo "=== Pattern: encoded Shopify GIDs inside variant.* keys (base64url) ==="

# Why this exists:
# - The Shopify adapter currently encodes variant keys as `variant.<base64url(gid)>` behind the adapter boundary.
# - If UI/client code starts hardcoding those encoded keys, the old scan would miss it (no literal `gid://shopify/`).
# - This check keeps the gate aligned with the *real* goal: provider swaps should not depend on Shopify IDs,
#   even if they are obfuscated.
#
# We only flag likely base64url payloads by:
# - searching for long `variant.<token>` sequences (token length >= 20)
# - decoding them
# - and only reporting those that decode to a Shopify GID (`gid://shopify/`)
#
# Note: this intentionally stays portable (no PCRE2 required).

encoded_matches="$(rg -n -o "variant\\.[A-Za-z0-9_-]{20,}" "${targets[@]}" 2>/dev/null || true)"

if [[ -z "$encoded_matches" ]]; then
  echo "(no matches)"
else
  if ! command -v node >/dev/null 2>&1; then
    echo "WARN: node not found; skipping encoded-variantKey decode scan."
    decoded_disallowed=""
  else
    # Decode via node (handles base64url). Print only those that decode to a Shopify GID.
    # Output format: "<file>:<line>:<match>  # decoded: <decoded>"
    decoded_disallowed="$(
      node -e "const fs=require('fs');const input=fs.readFileSync(0,'utf8');const lines=input.split('\\n').filter(Boolean);for(const line of lines){const idx=line.lastIndexOf(':');if(idx===-1)continue;const match=line.slice(idx+1);if(!match.startsWith('variant.'))continue;const token=match.slice('variant.'.length);let decoded='';try{decoded=Buffer.from(token,'base64url').toString('utf8')}catch{continue}if(decoded.includes('gid://shopify/')){process.stdout.write(line+'  # decoded: '+decoded+'\\n')}}"
      <<<"$encoded_matches"
    )"
  fi

  if [[ -z "$decoded_disallowed" ]]; then
    echo "(no disallowed matches)"
  else
    printf "%s" "$decoded_disallowed"
    disallowed_patterns=$((disallowed_patterns + 1))
    disallowed_lines_total=$((disallowed_lines_total + $(printf "%s" "$decoded_disallowed" | wc -l | tr -d ' ')))
  fi
fi

echo ""
echo "Vendor leak scan summary: disallowed_patterns=${disallowed_patterns} disallowed_lines=${disallowed_lines_total}"
echo ""
if [[ "$disallowed_patterns" -gt 0 ]]; then
  echo "Found vendor leaks: disallowed_patterns=${disallowed_patterns} disallowed_lines=${disallowed_lines_total}"
  echo "Fix direction: replace vendor IDs/copy above adapters with internal keys + capabilities."
  echo "See: docs/05-planning/research/ui-infra-key-mapping-strategy.md"
  if [[ "$fail" == "true" ]]; then
    exit 1
  fi
  exit 0
fi

echo "No disallowed matches found."
