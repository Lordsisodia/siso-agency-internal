#!/usr/bin/env bash
set -euo pipefail

# check-ui-constraints.sh
#
# Hygiene check to ensure UI code follows architectural constraints:
# - No hardcoded API endpoints or URLs
# - No hardcoded credentials or tokens
# - No platform-specific code that violates abstraction
# - No direct database queries in UI components
# - No console.log statements in production code
#
# By default this is report-only (exit 0).
# Use --fail to exit non-zero if violations are found.
#
# Usage:
#   ./4-scripts/check-ui-constraints.sh --src ./src
#   ./4-scripts/check-ui-constraints.sh --fail --src ./src

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

BOX_ROOT="$(find_box_root)"

usage() {
  cat <<'EOF' >&2
Usage:
  check-ui-constraints.sh [--src <path>] [--fail] [--strict]

Flags:
  --src <path>   Source directory to check (default: src/)
  --fail         Exit 1 if any violations found (default: report-only)
  --strict       Enable strict mode (all patterns are errors)

Patterns checked:
  - Hardcoded API endpoints (http://, https://)
  - Hardcoded credentials (password, token, secret, key)
  - console.log statements
  - Direct database queries (SELECT, INSERT, UPDATE)
  - Platform-specific code (Shopify, Stripe, etc.)
  - Hardcoded IDs (test IDs, user IDs)

Examples:
  # Report-only mode
  ./4-scripts/check-ui-constraints.sh

  # Fail on violations (for CI)
  ./4-scripts/check-ui-constraints.sh --fail

  # Check specific directory
  ./4-scripts/check-ui-constraints.sh --src ./src/components
EOF
}

src_dir="${BOX_ROOT}/src"
fail_mode=false
strict_mode=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --src)
      shift
      src_dir="${1:-}"
      shift || true
      ;;
    --fail)
      fail_mode=true
      shift || true
      ;;
    --strict)
      strict_mode=true
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

if [[ ! -d "$src_dir" ]]; then
  error "Source directory not found: $src_dir"
  exit 1
fi

# Check if ripgrep is available
if ! command -v rg >/dev/null 2>&1; then
  error "ripgrep (rg) not found. Install from: https://github.com/BurntSushi/ripgrep"
  exit 1
fi

# Define constraint patterns
declare -A patterns=(
  ["Hardcoded API endpoint"]="https?://[a-zA-Z0-9.-]+(api|endpoint|v[0-9]+)"
  ["Hardcoded credential"]="password\s*[:=]|token\s*[:=]|secret\s*[:=]|api_key\s*[:=]"
  ["Console log"]="console\.(log|debug|info|warn|error)\("
  ["Direct database query"]="(SELECT|INSERT|UPDATE|DELETE)\s+FROM\s+[`\"']?[a-zA-Z_]"
  ["Hardcoded ID"]="(test_id|user_id|admin_id|debug_id)\s*[:=]\s*['\"]?[0-9a-f]{8,}"
  ["TODO/FIXME"]="TODO|FIXME|HACK|XXX"
)

# Platform-specific patterns (only in strict mode)
declare -A platform_patterns=(
  ["Shopify-specific"]="shopify|Shopify|gid://shopify"
  ["Stripe-specific"]="stripe|Stripe|pk_test_|sk_test_"
  ["AWS-specific"]="aws_access_key_id|aws_secret_access_key|s3\.amazonaws\.com"
)

# Allow-list patterns (exceptions)
declare -A allowed_patterns=(
  ["console."=".*//.*console\.|.*mock.*console\.|.*test.*console\."
  ["https://"]=".*(example\.com|localhost|127\.0\.0\.1|test\.com|placeholder).*"
  ["TODO"]=".*//.*TODO.*|.*\*.*TODO.*"
)

# Check if a match is allowed
is_allowed_match() {
  local pattern="$1"
  local line="$2"

  for allowed_key in "${!allowed_patterns[@]}"; do
    local allowed_regex="${allowed_patterns[$allowed_key]}"
    if [[ "$line" =~ $allowed_regex ]]; then
      return 0
    fi
  done

  return 1
}

# Run the check
violations=0
total_violations=0

echo "UI Constraints Check"
echo "===================="
echo ""
echo "Source: $src_dir"
echo "Mode: $([ "$fail_mode" = true ] && echo "fail-on-violation" || echo "report-only")"
echo "Strict: $strict_mode"
echo ""

# Check standard patterns
for pattern_key in "${!patterns[@]}"; do
  pattern_regex="${patterns[$pattern_key]}"
  echo "=== Checking: $pattern_key ==="

  matches="$(rg -n --no-heading -i "$pattern_regex" "$src_dir" 2>/dev/null || true)"

  if [[ -z "$matches" ]]; then
    echo "  ✓ No violations found"
    echo ""
    continue
  fi

  pattern_violations=0
  while IFS= read -r line; do
    if is_allowed_match "$pattern_key" "$line"; then
      continue
    fi

    echo "  ✗ $line"
    pattern_violations=$((pattern_violations + 1))
  done <<<"$matches"

  if [[ $pattern_violations -gt 0 ]]; then
    violations=$((violations + 1))
    total_violations=$((total_violations + pattern_violations))
    echo "  Found $pattern_violations violation(s)"
  else
    echo "  ✓ No violations found"
  fi
  echo ""
done

# Check platform-specific patterns in strict mode
if [[ "$strict_mode" == "true" ]]; then
  echo "=== Platform-Specific Checks (Strict Mode) ==="

  for pattern_key in "${!platform_patterns[@]}"; do
    pattern_regex="${platform_patterns[$pattern_key]}"
    echo ""
    echo "Checking: $pattern_key"

    matches="$(rg -n --no-heading -i "$pattern_regex" "$src_dir" 2>/dev/null || true)"

    if [[ -z "$matches" ]]; then
      echo "  ✓ No violations found"
      continue
    fi

    pattern_violations=0
    while IFS= read -r line; do
      echo "  ✗ $line"
      pattern_violations=$((pattern_violations + 1))
    done <<<"$matches"

    if [[ $pattern_violations -gt 0 ]]; then
      violations=$((violations + 1))
      total_violations=$((total_violations + pattern_violations))
      echo "  Found $pattern_violations violation(s)"
    fi
  done

  echo ""
fi

# Print summary
echo "===================="
echo "Summary:"
echo "  Violation types: $violations"
echo "  Total violations: $total_violations"
echo ""

if [[ $total_violations -gt 0 ]]; then
  echo "❌ UI constraints check FAILED"
  echo ""
  echo "Fix direction:"
  echo "  - Remove hardcoded values (use environment variables or config)"
  echo "  - Replace console.log with proper logging"
  echo "  - Abstract platform-specific code behind interfaces"
  echo "  - Use dependency injection for external services"
  echo ""

  if [[ "$fail_mode" == "true" ]]; then
    exit 1
  fi
else
  echo "✅ UI constraints check PASSED"
  echo ""
  exit 0
fi
