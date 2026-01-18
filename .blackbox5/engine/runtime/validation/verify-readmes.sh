#!/bin/bash
#
# Verify README.md coverage across all .blackbox4 directories
# Ensures 100% documentation coverage
#

BB4_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Counters
total=0
with_readme=0
without_readme=0
skipped=0

log_info "Scanning .blackbox4 for README.md coverage..."
echo

# Find all directories and check for README.md
while IFS= read -r -d '' dir; do
    ((total++))

    # Skip runtime-generated directories (legitimate exceptions)
    if [[ "$dir" =~ \.plans/.*_test-suite ]] || \
       [[ "$dir" =~ \.ralph/.*\.tmp/ ]] || \
       [[ "$dir" =~ /work/monitoring/results/ ]] || \
       [[ "$dir" =~ /work/runner/runs/ ]]; then
        ((skipped++))
        continue
    fi

    if [[ -f "$dir/README.md" ]]; then
        ((with_readme++))
    else
        ((without_readme++))
        rel_path="${dir#$BB4_ROOT/}"
        log_warning "Missing README.md: $rel_path"
    fi
done < <(find "$BB4_ROOT" -mindepth 1 -type d -print0 | sort -z)

echo
echo "==================================="
echo "    README.md Coverage Report"
echo "==================================="
echo
echo "Total directories:    $total"
echo "With README.md:       $with_readme"
echo "Without README.md:    $without_readme"
echo "Runtime dirs skipped: $skipped"
echo

# Calculate coverage percentage (excluding skipped runtime dirs)
checked=$((total - skipped))
if [[ $checked -gt 0 ]]; then
    coverage=$((with_readme * 100 / checked))
    echo "Coverage:             ${coverage}%"
    echo
fi

# Exit with appropriate code
if [[ $without_readme -eq 0 ]]; then
    log_success "All directories have README.md!"
    echo
    exit 0
else
    log_error "$without_readme directories missing README.md"
    echo
    exit 1
fi
