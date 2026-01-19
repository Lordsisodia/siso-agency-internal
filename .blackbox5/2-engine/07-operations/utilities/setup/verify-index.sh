#!/bin/bash

################################################################################
# Blackbox5 Engine Index Verification Script
# =============================================================================
# This script verifies that all paths and files listed in INDEX.yaml actually
# exist in the filesystem.
#
# Features:
# - Checks that all directories in components section exist
# - Verifies registry files exist
# - Validates file counts match actual filesystem
# - Clear pass/fail reporting with emoji indicators
# - Returns proper exit codes
#
# Usage: ./verify-index.sh
#
# Exit codes:
#   0 - All checks passed
#   1 - One or more checks failed
################################################################################

# Set strict error handling
set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENGINE_DIR="$(dirname "$SCRIPT_DIR")"
INDEX_FILE="$ENGINE_DIR/INDEX.yaml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track overall status
ALL_CHECKS_PASSED=true

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo -e "${BLUE}=============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=============================================${NC}"
}

print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ALL_CHECKS_PASSED=false
}

print_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

# Check if a path exists
check_path_exists() {
    local path="$1"
    local full_path="${ENGINE_DIR}/${path}"

    if [[ -e "$full_path" ]]; then
        print_pass "Path exists: $path"
        return 0
    else
        print_fail "Path missing: $path"
        return 1
    fi
}

# Check if a file exists
check_file_exists() {
    local path="$1"
    local full_path="${ENGINE_DIR}/${path}"

    if [[ -f "$full_path" ]]; then
        print_pass "File exists: $path"
        return 0
    else
        print_fail "File missing: $path"
        return 1
    fi
}

# Check if a directory exists
check_dir_exists() {
    local path="$1"
    local full_path="${ENGINE_DIR}/${path}"

    if [[ -d "$full_path" ]]; then
        print_pass "Directory exists: $path"
        return 0
    else
        print_fail "Directory missing: $path"
        return 1
    fi
}

# Verify file count matches expected
verify_count() {
    local path="$1"
    local expected="$2"
    local pattern="$3"
    local full_path="${ENGINE_DIR}/${path}"

    if [[ ! -d "$full_path" ]]; then
        print_fail "Cannot count in missing directory: $path"
        return 1
    fi

    local actual=$(find "$full_path" -name "$pattern" 2>/dev/null | wc -l | tr -d ' ')

    if [[ "$actual" -eq "$expected" ]]; then
        print_pass "Count matches: $path ($pattern) = $actual"
        return 0
    else
        print_fail "Count mismatch: $path ($pattern) = $actual (expected $expected)"
        return 1
    fi
}

# Extract value from YAML (simple grep-based approach)
extract_yaml_value() {
    local file="$1"
    local key="$2"
    grep -E "^${key}:" "$file" | head -1 | sed 's/.*:[[:space:]]*//' | tr -d '"'
}

################################################################################
# Verification Functions
################################################################################

verify_index_file() {
    print_header "1. INDEX File Check"

    if [[ -f "$INDEX_FILE" ]]; then
        print_pass "INDEX.yaml exists"
    else
        print_fail "INDEX.yaml not found at: $INDEX_FILE"
        return 1
    fi
    echo ""
}

verify_component_directories() {
    print_header "2. Component Directories"

    local components=(
        "agents"
        "capabilities"
        "core"
        "operations"
        "development"
        "interface"
        "knowledge"
        "memory"
        "schemas"
        "task_management"
    )

    for component in "${components[@]}"; do
        check_dir_exists "$component"
    done
    echo ""
}

verify_registries() {
    print_header "3. Registry Files"

    local registries=(
        "agents/registry.yaml"
        "capabilities/registry.yaml"
        "capabilities/skills/registry.yaml"
    )

    for registry in "${registries[@]}"; do
        check_file_exists "$registry"
    done
    echo ""
}

verify_configuration() {
    print_header "4. Configuration Files"

    check_file_exists "config.yml"
    check_file_exists "config.example.yml"
    check_file_exists "requirements.txt"
    echo ""
}

verify_documentation() {
    print_header "5. Documentation"

    check_file_exists "README.md"
    echo ""
}

verify_maintenance_scripts() {
    print_header "6. Maintenance Scripts"

    check_file_exists "scripts/update-index.sh"
    check_file_exists "scripts/verify-index.sh"
    check_file_exists "scripts/init-project-memory.sh"
    echo ""
}

verify_statistics() {
    print_header "7. Statistics Verification"

    if [[ ! -f "$INDEX_FILE" ]]; then
        print_fail "Cannot verify statistics - INDEX.yaml missing"
        return 1
    fi

    # Extract expected counts from INDEX.yaml
    local expected_agents=$(extract_yaml_value "$INDEX_FILE" "total" | head -1)
    local expected_skills=$(extract_yaml_value "$INDEX_FILE" "skills" | head -1)
    local expected_scripts=$(extract_yaml_value "$INDEX_FILE" "total" | tail -1)

    # Count actual files
    local actual_agents=$(find "$ENGINE_DIR/agents" -name "*.agent.yaml" 2>/dev/null | wc -l | tr -d ' ')
    local actual_skills=$(find "$ENGINE_DIR/capabilities/skills" -name "SKILL.md" 2>/dev/null | wc -l | tr -d ' ')
    local actual_scripts=$(find "$ENGINE_DIR/operations" -name "*.sh" 2>/dev/null | wc -l | tr -d ' ')

    # Compare counts
    print_info "Agent count: expected=$expected_agents, actual=$actual_agents"
    if [[ "$actual_agents" -eq "$expected_agents" ]]; then
        print_pass "Agent count matches"
    else
        print_fail "Agent count mismatch"
    fi

    print_info "Skill count: expected=$expected_skills, actual=$actual_skills"
    if [[ "$actual_skills" -eq "$expected_skills" ]]; then
        print_pass "Skill count matches"
    else
        print_fail "Skill count mismatch"
    fi

    print_info "Script count: expected=$expected_scripts, actual=$actual_scripts"
    if [[ "$actual_scripts" -eq "$expected_scripts" ]]; then
        print_pass "Script count matches"
    else
        print_fail "Script count mismatch"
    fi
    echo ""
}

################################################################################
# Main Execution
################################################################################

main() {
    print_header "Blackbox5 Engine Index Verification"
    echo ""

    # Run all verification checks
    verify_index_file
    verify_component_directories
    verify_registries
    verify_configuration
    verify_documentation
    verify_maintenance_scripts
    verify_statistics

    # Final summary
    print_header "Verification Summary"

    if [[ "$ALL_CHECKS_PASSED" == true ]]; then
        echo -e "${GREEN}[SUCCESS]${NC} All checks passed!"
        echo ""
        return 0
    else
        echo -e "${RED}[FAILURE]${NC} Some checks failed. Please review the output above."
        echo ""
        return 1
    fi
}

# Run main function and capture exit code
main "$@"
exit $?
