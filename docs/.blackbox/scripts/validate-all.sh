#!/usr/bin/env bash
set -euo pipefail

# One-command validation for `docs/.blackbox/`.
#
# Run from repo root:
#   ./docs/.blackbox/scripts/validate-all.sh
#
# Optional project checks:
#   ./docs/.blackbox/scripts/validate-all.sh --typecheck --tests

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
docs_root="$(cd "$here/../.." && pwd)"
repo_root="$(cd "$docs_root/.." && pwd)"

typecheck=false
tests=false

usage() {
  cat <<'EOF' >&2
Usage:
  validate-all.sh [--typecheck] [--tests]

Flags:
  --typecheck  Also run `npm run typecheck` (project-level; slower).
  --tests      Also run `npm test` if available (project-level; slowest).
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --typecheck)
      typecheck=true
      shift || true
      ;;
    --tests)
      tests=true
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

check() {
  "$docs_root/.blackbox/scripts/check-blackbox.sh"
}

run_typecheck() {
  if [[ "$typecheck" != "true" ]]; then
    return 0
  fi
  if [[ -f "$repo_root/package.json" ]] && command -v npm >/dev/null 2>&1; then
    (cd "$repo_root" && npm run typecheck)
  else
    echo "WARN: npm/package.json not found; skipping typecheck" >&2
  fi
}

run_tests() {
  if [[ "$tests" != "true" ]]; then
    return 0
  fi
  if [[ -f "$repo_root/package.json" ]] && command -v npm >/dev/null 2>&1; then
    (cd "$repo_root" && npm test)
  else
    echo "WARN: npm/package.json not found; skipping tests" >&2
  fi
}

check
run_typecheck
run_tests

