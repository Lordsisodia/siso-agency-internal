#!/usr/bin/env bash
set -euo pipefail

# Install git hooks for .blackbox4 UI development
#
# Usage:
#   ./4-scripts/install-hooks.sh

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

BOX_ROOT="$(find_box_root)"
HOOKS_DIR="${BOX_ROOT}/.git/hooks"

info "Installing git hooks..."

# Create pre-commit hook
cat >"${HOOKS_DIR}/pre-commit" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

# .blackbox4 Pre-Commit Hook
# - Checks UI constraints
# - Runs type check if available
# - Runs lint if available

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
BOX_ROOT="$(dirname "$SCRIPT_DIR")"

# Run UI constraint checker
if [[ -x "${BOX_ROOT}/4-scripts/check-ui-constraints.sh" ]]; then
  echo "🔍 Checking UI constraints..."
  if ! "${BOX_ROOT}/4-scripts/check-ui-constraints.sh" --src ./src; then
    echo "❌ UI constraint check failed"
    echo "   Run '4-scripts/check-ui-constraints.sh' to see violations"
    exit 1
  fi
fi

# Run type check if available
if command -v npm >/dev/null 2>&1 && [[ -f "package.json" ]]; then
  if npm run type-check >/dev/null 2>&1; then
    echo "🔍 Running type check..."
    if ! npm run type-check; then
      echo "❌ Type check failed"
      exit 1
    fi
  fi
fi

# Run lint if available
if command -v npm >/dev/null 2>&1 && [[ -f "package.json" ]]; then
  if npm run lint >/dev/null 2>&1; then
    echo "🔍 Running linter..."
    if ! npm run lint; then
      echo "❌ Lint failed"
      exit 1
    fi
  fi
fi

echo "✅ Pre-commit checks passed"
EOF

chmod +x "${HOOKS_DIR}/pre-commit"

success "Git hooks installed:"
info "  pre-commit: UI constraints, type check, lint"
echo ""
info "To skip hooks (not recommended):"
info "  git commit --no-verify"
