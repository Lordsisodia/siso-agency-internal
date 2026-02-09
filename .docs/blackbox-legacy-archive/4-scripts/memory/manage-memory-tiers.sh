#!/usr/bin/env bash
#
# Memory tier management script
# Manages the three-tier memory architecture (Working, Extended, Archival)
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CONFIG="$PROJECT_ROOT/config.yaml"
TOKEN_COUNT="$PROJECT_ROOT/4-scripts/utils/token-count.py"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Parse config for memory tier paths
parse_config() {
    if [[ ! -f "$CONFIG" ]]; then
        log_error "Config not found: $CONFIG"
        exit 1
    fi

    # Extract working paths
    WORKING_PATHS=()
    while IFS= read -r line; do
        if [[ $line =~ -\ \"(.*)\" ]]; then
            WORKING_PATHS+=("${BASH_REMATCH[1]}")
        fi
    done < <(sed -n '/working:/,/extended:/p' "$CONFIG" | sed -n '/paths:/,/max_size:/p' | grep -E '^\s*-')

    # Extract extended paths
    EXTENDED_PATHS=()
    while IFS= read -r line; do
        if [[ $line =~ -\ \"(.*)\" ]]; then
            EXTENDED_PATHS+=("${BASH_REMATCH[1]}")
        fi
    done < <(sed -n '/extended:/,/archival:/p' "$CONFIG" | sed -n '/paths:/,/max_size:/p' | grep -E '^\s*-')

    # Extract archival paths
    ARCHIVAL_PATHS=()
    while IFS= read -r line; do
        if [[ $line =~ -\ \"(.*)\" ]]; then
            ARCHIVAL_PATHS+=("${BASH_REMATCH[1]}")
        fi
    done < <(sed -n '/archival:/,/management:/p' "$CONFIG" | sed -n '/paths:/,/max_size:/p' | grep -E '^\s*-')

    log_debug "Working paths: ${WORKING_PATHS[*]}"
    log_debug "Extended paths: ${EXTENDED_PATHS[*]}"
    log_debug "Archival paths: ${ARCHIVAL_PATHS[*]}"
}

# Get token count for a directory
get_dir_tokens() {
    local dir="$1"
    python3 "$TOKEN_COUNT" -j "$dir" 2>/dev/null | jq '. | map(.amount // . // 0) | add' || echo "0"
}

# Get file count for a directory
get_file_count() {
    local dir="$1"
    find "$dir" -type f 2>/dev/null | wc -l
}

# Status command
cmd_status() {
    log_info "Memory Tier Status"
    echo ""

    parse_config

    # Working tier
    echo "=== Working Memory ==="
    for path in "${WORKING_PATHS[@]}"; do
        local full_path="$PROJECT_ROOT/$path"
        if [[ -d "$full_path" ]]; then
            local tokens
            local files
            tokens=$(get_dir_tokens "$full_path")
            files=$(get_file_count "$full_path")
            echo "  $path"
            echo "    Tokens: $tokens"
            echo "    Files: $files"
        else
            echo "  $path (not created)"
        fi
    done
    echo ""

    # Extended tier
    echo "=== Extended Memory ==="
    for path in "${EXTENDED_PATHS[@]}"; do
        local full_path="$PROJECT_ROOT/$path"
        if [[ -d "$full_path" ]]; then
            local tokens
            local files
            tokens=$(get_dir_tokens "$full_path")
            files=$(get_file_count "$full_path")
            echo "  $path"
            echo "    Tokens: $tokens"
            echo "    Files: $files"
        else
            echo "  $path (not created)"
        fi
    done
    echo ""

    # Archival tier
    echo "=== Archival Memory ==="
    for path in "${ARCHIVAL_PATHS[@]}"; do
        local full_path="$PROJECT_ROOT/$path"
        if [[ -d "$full_path" ]]; then
            local tokens
            local files
            tokens=$(get_dir_tokens "$full_path")
            files=$(get_file_count "$full_path")
            echo "  $path"
            echo "    Tokens: $tokens"
            echo "    Files: $files"
        else
            echo "  $path (not created)"
        fi
    done
}

# Compact command
cmd_compact() {
    local tier="${1:-working}"
    log_info "Compacting $tier tier..."

    parse_config

    case "$tier" in
        working)
            for path in "${WORKING_PATHS[@]}"; do
                local full_path="$PROJECT_ROOT/$path"
                if [[ -d "$full_path" ]]; then
                    log_info "Compacting $full_path..."
                    "$PROJECT_ROOT/4-scripts/auto-compact.sh" "$full_path"
                fi
            done
            ;;
        extended)
            for path in "${EXTENDED_PATHS[@]}"; do
                local full_path="$PROJECT_ROOT/$path"
                if [[ -d "$full_path" ]]; then
                    log_info "Compacting $full_path..."
                    "$PROJECT_ROOT/4-scripts/auto-compact.sh" "$full_path"
                fi
            done
            ;;
        archival)
            log_warn "Archival tier is read-only, skipping compaction"
            ;;
        *)
            log_error "Unknown tier: $tier"
            exit 1
            ;;
    esac
}

# Archive command
cmd_archive() {
    log_info "Archiving old files from working to extended..."

    parse_config

    # Find files older than 30 days in working memory
    local cutoff_date
    cutoff_date=$(date -v-30d +%Y%m%d 2>/dev/null || date -d "30 days ago" +%Y%m%d)

    for path in "${WORKING_PATHS[@]}"; do
        local full_path="$PROJECT_ROOT/$path"
        if [[ -d "$full_path" ]]; then
            log_info "Checking $full_path for old files..."
            # Archive logic would go here
            log_warn "Archive not yet implemented"
        fi
    done
}

# Show help
cmd_help() {
    cat << EOF
Memory Tier Management

Usage: $0 <command> [args]

Commands:
  status              Show status of all memory tiers
  compact <tier>      Compact specified tier (working|extended)
  archive             Archive old files from working to extended

Examples:
  $0 status
  $0 compact working
  $0 archive
EOF
}

# Main
main() {
    local command="${1:-help}"

    case "$command" in
        status)
            cmd_status
            ;;
        compact)
            cmd_compact "${2:-working}"
            ;;
        archive)
            cmd_archive
            ;;
        help|--help|-h)
            cmd_help
            ;;
        *)
            log_error "Unknown command: $command"
            cmd_help
            exit 1
            ;;
    esac
}

main "$@"
