#!/usr/bin/env bash
# .blackbox4 Validation Script
# Checks .blackbox4 structure and required files

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
checks_passed=0
checks_failed=0

# Helper functions
check_pass() {
  echo -e "${GREEN}[✓]${NC} $*"
  checks_passed=$((checks_passed + 1))
}

check_fail() {
  echo -e "${RED}[✗]${NC} $*" >&2
  checks_failed=$((checks_failed + 1))
}

check_warn() {
  echo -e "${YELLOW}[!]${NC} $*" >&2
}

# Find .blackbox4 root
find_box_root() {
  local dir="$SCRIPT_DIR"

  # Move up from 4-scripts/ to .blackbox4 root
  while [[ "$dir" != "/" && ! -f "$dir/manifest.yaml" ]]; do
    dir="$(dirname "$dir")"
  done

  if [[ ! -f "$dir/manifest.yaml" ]]; then
    error "Could not find .blackbox4 root (manifest.yaml not found)"
    exit 1
  fi

  echo "$dir"
}

# Main checks
main() {
  local box_root
  box_root="$(find_box_root)"

  echo ".blackbox4 Validation Check"
  echo "Checking: $box_root"
  echo ""

  # 1. Core protocol files
  info "Checking core protocol files..."

  local required_files=(
    "protocol.md"
    "context.md"
    "tasks.md"
    "manifest.yaml"
    "README.md"
  )

  for file in "${required_files[@]}"; do
    if [[ -f "$box_root/$file" ]]; then
      check_pass "Core file exists: $file"
    else
      check_fail "Missing core file: $file"
    fi
  done

  # 2. Scripts directory
  info "Checking scripts..."

  if [[ -d "$box_root/scripts" ]]; then
    check_pass "Scripts directory exists"

    # Check lib.sh exists
    if [[ -f "$box_root/4-scripts/lib.sh" ]]; then
      check_pass "lib.sh exists"
    else
      check_fail "Missing 4-scripts/lib.sh"
    fi

    # Check scripts are executable
    local non_exec_scripts
    non_exec_scripts=$(find "$box_root/scripts" -maxdepth 1 -type f -name '*.sh' ! -executable 2>/dev/null || true)

    if [[ -z "$non_exec_scripts" ]]; then
      check_pass "All shell scripts are executable"
    else
      check_fail "Non-executable shell scripts found:"
      echo "$non_exec_scripts" | while read -r script; do
        check_fail "  - ${script#$box_root/}"
      done
    fi
  else
    check_fail "Scripts directory missing"
  fi

  # 3. Plans directory
  info "Checking plans..."

  if [[ -d "$box_root/.plans" ]]; then
    check_pass ".plans directory exists"

    # Check for template
    if [[ -d "$box_root/.plans/_template" ]]; then
      check_pass ".plans/_template exists"
    else
      check_fail "Missing .plans/_template"
    fi

    # Check for context subdirectories (at least empty structure)
    if [[ -d "$box_root/.plans/_template/context" ]]; then
      check_pass ".plans/_template/context exists"
    else
      check_warn ".plans/_template/context missing (will be created by new-plan.sh)"
    fi
  else
    check_fail ".plans directory missing"
  fi

  # 4. Agents directory
  info "Checking agents..."

  if [[ -d "$box_root/agents" ]]; then
    check_pass "Agents directory exists"

    # Check for BMAD agents
    if [[ -d "$box_root/agents-bmm" ]]; then
      check_pass "BMAD agents directory exists"

      # Count BMAD agents
      local bmad_count
      bmad_count=$(find "$box_root/agents-bmm" -name '*.agent.yaml' -type f 2>/dev/null | wc -l | tr -d ' ')
      if [[ $bmad_count -gt 0 ]]; then
        check_pass "BMAD agents found: $bmad_count agents"
      else
        check_warn "No BMAD agent files found"
      fi
    else
      check_warn "BMAD agents directory missing (agents-bmm)"
    fi

    # Check for custom agents
    if [[ -d "$box_root/agents/custom" ]]; then
      check_pass "Custom agents directory exists"
    else
      check_warn "Custom agents directory missing (optional)"
    fi
  else
    check_fail "Agents directory missing"
  fi

  # 5. Workflows directory
  info "Checking workflows..."

  if [[ -d "$box_root/workflows-bmm" ]]; then
    check_pass "BMAD workflows directory exists"
  else
    check_warn "BMAD workflows directory missing (workflows-bmm)"
  fi

  if [[ -d "$box_root/workflows" ]]; then
    check_pass "Custom workflows directory exists"
  else
    check_warn "Custom workflows directory missing (optional)"
  fi

  # 6. Data directory
  info "Checking data..."

  local data_dirs=("context" "kanban" "decisions" "research")
  for data_dir in "${data_dirs[@]}"; do
    if [[ -d "$box_root/data/$data_dir" ]]; then
      check_pass "Data directory exists: data/$data_dir"
    else
      check_warn "Data directory missing: data/$data_dir (will be created as needed)"
    fi
  done

  # 7. Runtime directory (optional)
  info "Checking runtime..."

  if [[ -d "$box_root/runtime" ]]; then
    check_pass "Runtime directory exists"

    # Python runtime is optional
    if [[ -d "$box_root/runtime/python" ]]; then
      check_warn "Python runtime exists (optional, not needed initially)"
    fi
  else
    check_warn "Runtime directory missing (optional)"
  fi

  # Summary
  echo ""
  echo "================================"
  echo "Validation Summary"
  echo "================================"
  echo -e "${GREEN}Passed:${NC}   $checks_passed"
  echo -e "${RED}Failed:${NC}   $checks_failed"

  if [[ $checks_failed -eq 0 ]]; then
    echo ""
    success "All checks passed! .blackbox4 is ready to use."
    echo ""
    echo "Next steps:"
    echo "  1. Create a plan: ./4-scripts/new-plan.sh 'your goal'"
    echo "  2. Work with AI in chat to execute"
    echo "  3. Save outputs to your plan folder"
    exit 0
  else
    echo ""
    error "Validation failed. Please fix the errors above."
    echo ""
    echo "Common fixes:"
    echo "  - Missing files: Copy from template or create"
    echo "  - Non-executable scripts: chmod +x 4-scripts/*.sh"
    echo "  - Missing directories: mkdir -p <directory>"
    exit 1
  fi
}

# Run main
main "$@"
