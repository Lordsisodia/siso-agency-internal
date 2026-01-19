#!/bin/bash

################################################################################
# Blackbox5 Engine Index Update Script
# =============================================================================
# This script automatically updates the INDEX.yaml file with current statistics
# from the Blackbox5 engine directory structure.
#
# Features:
# - Counts agents, skills, scripts, and other components
# - Updates INDEX.yaml with current statistics
# - Creates backup before modifying
# - Prints summary of changes
#
# Usage: ./update-index.sh
################################################################################

# Set strict error handling
set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENGINE_DIR="$(dirname "$SCRIPT_DIR")"
INDEX_FILE="$ENGINE_DIR/INDEX.yaml"
BACKUP_FILE="${INDEX_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
CURRENT_DATE="$(date +%Y-%m-%d)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo -e "${BLUE}=============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=============================================${NC}"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

################################################################################
# Count Functions
################################################################################

count_agents() {
    find "$ENGINE_DIR/agents" -name "*.agent.yaml" 2>/dev/null | wc -l | tr -d ' '
}

count_skills() {
    find "$ENGINE_DIR/capabilities/skills" -name "SKILL.md" 2>/dev/null | wc -l | tr -d ' '
}

count_runtime_scripts() {
    find "$ENGINE_DIR/operations/runtime" -name "*.sh" 2>/dev/null | wc -l | tr -d ' '
}

count_tool_scripts() {
    find "$ENGINE_DIR/operations/tools" -name "*.sh" 2>/dev/null | wc -l | tr -d ' '
}

count_all_scripts() {
    find "$ENGINE_DIR/operations" -name "*.sh" 2>/dev/null | wc -l | tr -d ' '
}

################################################################################
# Update Functions
################################################################################

update_statistics() {
    local agents_count="$1"
    local skills_count="$2"
    local runtime_scripts="$3"
    local tool_scripts="$4"
    local total_scripts="$5"

    # Use sed to update the statistics section
    sed -i.bak "
        /^  agents:/,/^[^ ]/ {
            s/total: [0-9]*/total: $agents_count/
        }
        /^  capabilities:/,/^[^ ]/ {
            s/skills: [0-9]*/skills: $skills_count/
        }
        /^  scripts:/,/^[^ ]/ {
            s/runtime: [0-9]*/runtime: $runtime_scripts/
            s/tools: [0-9]*/tools: $tool_scripts/
            s/total: [0-9]*/total: $total_scripts/
        }
    " "$INDEX_FILE"

    # Remove the sed backup file
    rm -f "${INDEX_FILE}.bak"
}

update_system_date() {
    # Update the system.updated field
    sed -i.bak "s/updated: \"[0-9-]*\"/updated: \"$CURRENT_DATE\"/" "$INDEX_FILE"
    rm -f "${INDEX_FILE}.bak"
}

################################################################################
# Main Execution
################################################################################

main() {
    print_header "Blackbox5 Engine Index Update"

    # Check if INDEX.yaml exists
    if [[ ! -f "$INDEX_FILE" ]]; then
        print_error "INDEX.yaml not found at: $INDEX_FILE"
        exit 1
    fi

    print_info "Engine directory: $ENGINE_DIR"
    print_info "Index file: $INDEX_FILE"
    echo ""

    # Create backup
    print_info "Creating backup..."
    cp "$INDEX_FILE" "$BACKUP_FILE"
    print_success "Backup created: $BACKUP_FILE"
    echo ""

    # Count components
    print_info "Counting components..."

    AGENTS_COUNT=$(count_agents)
    print_success "Agents: $AGENTS_COUNT"

    SKILLS_COUNT=$(count_skills)
    print_success "Skills: $SKILLS_COUNT"

    RUNTIME_SCRIPTS=$(count_runtime_scripts)
    print_success "Runtime scripts: $RUNTIME_SCRIPTS"

    TOOL_SCRIPTS=$(count_tool_scripts)
    print_success "Tool scripts: $TOOL_SCRIPTS"

    TOTAL_SCRIPTS=$(count_all_scripts)
    print_success "Total scripts: $TOTAL_SCRIPTS"
    echo ""

    # Update INDEX.yaml
    print_info "Updating INDEX.yaml..."
    update_statistics "$AGENTS_COUNT" "$SKILLS_COUNT" "$RUNTIME_SCRIPTS" "$TOOL_SCRIPTS" "$TOTAL_SCRIPTS"
    update_system_date
    print_success "Statistics updated"
    echo ""

    # Show summary
    print_header "Update Summary"
    echo "Updated values:"
    echo "  - Agents:        $AGENTS_COUNT"
    echo "  - Skills:        $SKILLS_COUNT"
    echo "  - Runtime scripts: $RUNTIME_SCRIPTS"
    echo "  - Tool scripts:    $TOOL_SCRIPTS"
    echo "  - Total scripts:   $TOTAL_SCRIPTS"
    echo "  - Date updated:    $CURRENT_DATE"
    echo ""
    print_success "Index updated successfully!"
    echo ""
    print_info "Backup saved to: $BACKUP_FILE"
}

# Run main function
main "$@"
