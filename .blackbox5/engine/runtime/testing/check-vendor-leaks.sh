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
#   ./4-scripts/check-vendor-leaks.sh

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

BOX_ROOT="$(find_box_root)"

usage() {
  cat <<'EOF' >&2
Usage:
  check-vendor-leaks.sh [--fail] [--src <path>]

Flags:
  --fail   Exit 1 if any matches are found (default: report-only, exit 0).
  --src    Source directory to scan (default: ./src)

Description:
  This script helps maintain vendor independence by detecting:
  - Vendor-specific IDs (e.g., Shopify GIDs)
  - Vendor-specific checkout copy
  - Base64-encoded vendor IDs (obfuscated leaks)

  By default, it's report-only. Use --fail for CI/pre-commit checks.
EOF
}

fail=false
src_path=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --fail)
      fail=true
      shift || true
      ;;
    --src)
      shift
      src_path="${1:-}"
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
  warn "ripgrep (rg) not found; skipping vendor leak scan."
  exit 0
fi

# Default to src/ if not specified
if [[ -z "$src_path" ]]; then
  src_path="${BOX_ROOT}/src"
fi

# Convert to absolute path if relative
if [[ ! "$src_path" = /* ]]; then
  src_path="${BOX_ROOT}/${src_path}"
fi

# Build targets list (common UI/client directories)
targets=()
if [[ -d "$src_path/ui" ]]; then
  targets+=("$src_path/ui")
fi
if [[ -d "$src_path/client" ]]; then
  targets+=("$src_path/client")
fi
if [[ -d "$src_path/lib" ]]; then
  targets+=("$src_path/lib")
fi
if [[ -d "$src_path/components" ]]; then
  targets+=("$src_path/components")
fi

# If no subdirectories found, use the src_path itself
if [[ ${#targets[@]} -eq 0 ]]; then
  targets=("$src_path")
fi

# Common vendor patterns to detect
patterns=(
  "gid://shopify/"
  "Preparing Shopify checkout"
  "Secure checkout \\(Shopify\\)"
  "stripe\\.com"
  "api\\.stripe\\.com"
)

disallowed_patterns=0
disallowed_lines_total=0

is_allowed_match() {
  local pattern="$1"
  local line="$2"

  # Allowed transitional match: legacy GID cleanup helpers
  # This is explicitly a "sunset" item, but we don't want it to block --fail
  if [[ "$pattern" == "gid://shopify/" ]]; then
    if [[ "$line" == *"startsWith('gid://shopify/'"* ]]; then
      return 0
    fi
    if [[ "$line" == *"includes('gid://shopify/'"* ]]; then
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
echo "- repo: $BOX_ROOT"
echo "- targets:"
for t in "${targets[@]}"; do
  if [[ -d "$t" ]]; then
    echo "  - ${t#$BOX_ROOT/}"
  fi
done
echo ""

for pat in "${patterns[@]}"; do
  echo "=== Pattern: $pat ==="

  # Skip non-existent targets
  existing_targets=()
  for t in "${targets[@]}"; do
    if [[ -d "$t" ]]; then
      existing_targets+=("$t")
    fi
  done

  if [[ ${#existing_targets[@]} -eq 0 ]]; then
    echo "(no targets exist)"
    continue
  fi

  matches="$(rg -n --no-heading -S "$pat" "${existing_targets[@]}" 2>/dev/null || true)"
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
echo "=== Pattern: encoded vendor IDs (base64url) ==="

# Why this exists:
# - Some adapters encode vendor IDs as base64 to hide them
# - This check detects obfuscated vendor leaks by:
#   1. Finding long base64-like tokens
#   2. Decoding them
#   3. Only reporting those that decode to vendor IDs
#
# We use node for base64url decoding (portable, no PCRE2 required)

# Build targets list for encoded scan
existing_targets=()
for t in "${targets[@]}"; do
  if [[ -d "$t" ]]; then
    existing_targets+=("$t")
  fi
done

if [[ ${#existing_targets[@]} -eq 0 ]]; then
  echo "(no targets exist)"
else
  encoded_matches="$(rg -n -o "[A-Za-z0-9_-]{20,}" "${existing_targets[@]}" 2>/dev/null || true)"

  if [[ -z "$encoded_matches" ]]; then
    echo "(no matches)"
  else
    if ! command -v node >/dev/null 2>&1; then
      warn "node not found; skipping encoded vendor ID decode scan."
      decoded_disallowed=""
    else
      # Decode via node (handles base64url). Print only those that decode to vendor IDs.
      # Output format: "<file>:<line>:<match>  # decoded: <decoded>"
      decoded_disallowed="$(
        node -e "const fs=require('fs');const input=fs.readFileSync(0,'utf8');const lines=input.split('\\n').filter(Boolean);for(const line of lines){const idx=line.lastIndexOf(':');if(idx===-1)continue;const match=line.slice(idx+1);let decoded='';try{decoded=Buffer.from(match,'base64url').toString('utf8')}catch{continue}if(decoded.includes('gid://shopify/')||decoded.includes('stripe.')||decoded.includes('api.stripe')){process.stdout.write(line+'  # decoded: '+decoded+'\\n')}}"
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
fi

echo ""
echo "Vendor leak scan summary: disallowed_patterns=${disallowed_patterns} disallowed_lines=${disallowed_lines_total}"
echo ""
if [[ "$disallowed_patterns" -gt 0 ]]; then
  error "Found vendor leaks: disallowed_patterns=${disallowed_patterns} disallowed_lines=${disallowed_lines_total}"
  info "Fix direction: replace vendor IDs/copy above adapters with internal keys + capabilities."
  if [[ "$fail" == "true" ]]; then
    exit 1
  fi
  exit 0
fi

success "No disallowed matches found."
