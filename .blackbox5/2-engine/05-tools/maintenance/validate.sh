#!/usr/bin/env bash
# Blackbox4 Validation Wrapper
# Usage: ./validate.sh [all|specs|system|tests]
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
BLACKBOX_ROOT="$(dirname "$SCRIPT_DIR")"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored status
print_status() {
    local status=$1
    local message=$2
    case $status in
        "success")
            echo -e "${GREEN}✓${NC} $message"
            ;;
        "error")
            echo -e "${RED}✗${NC} $message"
            ;;
        "info")
            echo -e "${YELLOW}ℹ${NC} $message"
            ;;
    esac
}

# Validate specs
validate_specs() {
    echo ""
    print_status "info" "Validating Specs..."
    echo ""

    local spec_files=$(find "$BLACKBOX_ROOT/3-output/specs" -name "*.json" 2>/dev/null || echo "")

    if [ -z "$spec_files" ]; then
        print_status "info" "No spec files found to validate"
        return 0
    fi

    local valid_count=0
    local total_count=0

    while IFS= read -r spec_file; do
        total_count=$((total_count + 1))
        if "$BLACKBOX_ROOT/spec-validate.sh" "$spec_file" 2>/dev/null; then
            valid_count=$((valid_count + 1))
            print_status "success" "$(basename "$spec_file")"
        else
            print_status "error" "$(basename "$spec_file")"
        fi
    done <<< "$spec_files"

    echo ""
    print_status "info" "Spec validation: $valid_count/$total_count valid"
    return $([ $valid_count -eq $total_count ] && echo 0 || echo 1)
}

# Main validation logic
case "${1:-all}" in
    "specs")
        validate_specs
        ;;
    "all")
        print_status "info" "Running full validation suite..."
        echo ""

        # Run spec validation
        validate_specs || true

        # Run system validation
        if [ -f "$BLACKBOX_ROOT/4-scripts/validation/validate-all.sh" ]; then
            echo ""
            print_status "info" "Validating system configuration..."
            "$BLACKBOX_ROOT/4-scripts/validation/validate-all.sh"
        else
            print_status "info" "System validation script not found"
        fi

        echo ""
        print_status "success" "Validation complete"
        ;;
    *)
        echo "Usage: $0 [all|specs|system|tests]"
        echo ""
        echo "Options:"
        echo "  all    - Run all validation checks (default)"
        echo "  specs  - Validate spec files only"
        echo "  system - Validate system configuration only"
        echo "  tests  - Run test suite"
        exit 1
        ;;
esac
