#!/usr/bin/env bash

# Blackbox4 Auto-Compaction System
# Automatic memory and context compression when limits reached

set -e

BLACKBOX4_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPACT_CONFIG="$BLACKBOX4_HOME/.config/compact-config.json"
COMPACT_LOG="$BLACKBOX4_HOME/.runtime/compact.log"

# Default limits (in bytes)
MAX_WORKING_MEMORY=$((10 * 1024 * 1024))  # 10MB
MAX_EXTENDED_MEMORY=$((500 * 1024 * 1024))  # 500MB
MAX_ARCHIVAL_MEMORY=$((5 * 1024 * 1024 * 1024))  # 5GB

# Token limits (approximate: 1 token ≈ 4 chars)
MAX_TOKENS=$((200 * 1000))  # 200K tokens

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Initialize compaction system
init_compact() {
    if [ ! -f "$COMPACT_CONFIG" ]; then
        mkdir -p "$(dirname "$COMPACT_CONFIG")"
        cat > "$COMPACT_CONFIG" << 'EOF'
{
  "limits": {
    "working_memory": 10485760,
    "extended_memory": 524288000,
    "archival_memory": 5368709120,
    "max_tokens": 200000
  },
  "settings": {
    "auto_compact": true,
    "compact_threshold": 0.9,
    "backup_before_compact": true,
    "preserve_metadata": true,
    "priority_rules": {
      "keep_first_lines": 50,
      "keep_last_lines": 50,
      "keep_markdown_headers": true,
      "keep_code_blocks": true
    }
  },
  "history": []
}
EOF
        echo "${GREEN}✓ Auto-compact system initialized${NC}"
    fi

    mkdir -p "$(dirname "$COMPACT_LOG")"
}

# Count tokens in a file (rough estimate)
count_tokens() {
    local file="$1"

    if [ ! -f "$file" ]; then
        echo "0"
        return
    fi

    # Rough estimate: characters / 4
    local chars=$(wc -c < "$file" 2>/dev/null || echo "0")
    echo $((chars / 4))
}

# Get file size in bytes
get_file_size() {
    local file="$1"

    if [ ! -f "$file" ]; then
        echo "0"
        return
    fi

    stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0"
}

# Check if compaction needed
check_compact_needed() {
    local file="$1"
    local tier="${2:-working}"

    local size=$(get_file_size "$file")
    local max_size=0

    case "$tier" in
        working)
            max_size=$(jq -r '.limits.working_memory' "$COMPACT_CONFIG" 2>/dev/null || echo $MAX_WORKING_MEMORY)
            ;;
        extended)
            max_size=$(jq -r '.limits.extended_memory' "$COMPACT_CONFIG" 2>/dev/null || echo $MAX_EXTENDED_MEMORY)
            ;;
        archival)
            max_size=$(jq -r '.limits.archival_memory' "$COMPACT_CONFIG" 2>/dev/null || echo $MAX_ARCHIVAL_MEMORY)
            ;;
    esac

    local threshold=$(jq -r '.settings.compact_threshold' "$COMPACT_CONFIG" 2>/dev/null || echo "0.9")
    local limit=$((max_size * threshold / 10))

    if [ "$size" -gt "$limit" ]; then
        echo "true"
        return 0
    else
        echo "false"
        return 1
    fi
}

# Compact a file
compact_file() {
    local file="$1"
    local output="${2:-${file}.compact}"
    local backup="${3:-true}"

    echo "${BLUE}Compacting: $file${NC}"

    # Backup if requested
    if [ "$backup" = "true" ]; then
        cp "$file" "$file.backup"
        echo "  → Backup created: $file.backup"
    fi

    # Get compaction settings
    local keep_first=$(jq -r '.settings.priority_rules.keep_first_lines' "$COMPACT_CONFIG" 2>/dev/null || echo "50")
    local keep_last=$(jq -r '.settings.priority_rules.keep_last_lines' "$COMPACT_CONFIG" 2>/dev/null || echo "50")
    local keep_headers=$(jq -r '.settings.priority_rules.keep_markdown_headers' "$COMPACT_CONFIG" 2>/dev/null || echo "true")

    local lines=$(wc -l < "$file" 2>/dev/null || echo "0")

    if [ "$lines" -le $((keep_first + keep_last)) ]; then
        echo "  ${YELLOW}File too small to compact${NC}"
        return 0
    fi

    # Extract first and last lines
    {
        head -n "$keep_first" "$file"
        echo ""
        echo "... [COMPACTED: $((lines - keep_first - keep_last)) lines removed] ..."
        echo ""
        tail -n "$keep_last" "$file"
    } > "$output"

    local old_size=$(get_file_size "$file")
    local new_size=$(get_file_size "$output")
    local reduction=$((100 - (new_size * 100 / old_size)))

    echo "  ${GREEN}✓ Compacted: $old_size → $new_size bytes ($reduction% reduction)${NC}"

    # Log compaction
    log_compaction "$file" "$old_size" "$new_size"

    # Replace original if successful
    if [ -s "$output" ]; then
        mv "$output" "$file"
        echo "  → File replaced"
        return 0
    else
        echo "  ${RED}✗ Compaction failed${NC}"
        rm -f "$output"
        return 1
    fi
}

# Log compaction event
log_compaction() {
    local file="$1"
    local old_size="$2"
    local new_size="$3"

    mkdir -p "$(dirname "$COMPACT_LOG")"

    cat >> "$COMPACT_LOG" << LOG
$(date -u +"%Y-%m-%dT%H:%M:%SZ") | Compacted: $file
  Size: $old_size → $new_size bytes ($((100 - new_size * 100 / old_size))% reduction)
LOG
}

# Scan and compact directory
scan_and_compact() {
    local directory="$1"
    local tier="${2:-working}"
    local dry_run="${3:-false}"

    echo "${BLUE}Scanning directory: $directory (tier: $tier)${NC}"

    local compacted=0
    local total_size_before=0
    local total_size_after=0

    while IFS= read -r -d '' file; do
        if check_compact_needed "$file" "$tier" >/dev/null 2>&1; then
            local size=$(get_file_size "$file")
            total_size_before=$((total_size_before + size))

            if [ "$dry_run" = "true" ]; then
                echo "  Would compact: $file ($size bytes)"
            else
                if compact_file "$file"; then
                    local new_size=$(get_file_size "$file")
                    total_size_after=$((total_size_after + new_size))
                    compacted=$((compacted + 1))
                fi
            fi
        fi
    done < <(find "$directory" -type f -name "*.md" -print0 2>/dev/null)

    if [ "$dry_run" = "true" ]; then
        echo ""
        echo "${YELLOW}Dry run complete${NC}"
        echo "Files that would be compacted: TBD"
    else
        echo ""
        echo "${GREEN}Compaction complete${NC}"
        echo "Files compacted: $compacted"
        echo "Total size: $total_size_before → $total_size_after bytes"
        if [ "$total_size_before" -gt 0 ]; then
            local reduction=$((100 - total_size_after * 100 / total_size_before))
            echo "Total reduction: $reduction%"
        fi
    fi
}

# Compact working memory
compact_working() {
    local working_dir="$BLACKBOX4_HOME/.memory/working"

    if [ ! -d "$working_dir" ]; then
        echo "${YELLOW}Working memory directory not found${NC}"
        return 0
    fi

    scan_and_compact "$working_dir" "working" "${1:-false}"
}

# Compact extended memory
compact_extended() {
    local extended_dir="$BLACKBOX4_HOME/.memory/extended"

    if [ ! -d "$extended_dir" ]; then
        echo "${YELLOW}Extended memory directory not found${NC}"
        return 0
    fi

    scan_and_compact "$extended_dir" "extended" "${1:-false}"
}

# Compact plans
compact_plans() {
    local plans_dir="$BLACKBOX4_HOME/.plans"

    if [ ! -d "$plans_dir" ]; then
        echo "${YELLOW}Plans directory not found${NC}"
        return 0
    fi

    scan_and_compact "$plans_dir" "extended" "${1:-false}"
}

# Show compaction status
show_status() {
    echo "${BLUE}=== Auto-Compaction Status ===${NC}"
    echo ""

    # Check each tier
    local tiers=("working" "extended" "archival")
    local dirs=(
        "$BLACKBOX4_HOME/.memory/working"
        "$BLACKBOX4_HOME/.memory/extended"
        "$BLACKBOX4_HOME/.memory/archival"
    )

    for i in "${!tiers[@]}"; do
        local tier="${tiers[$i]}"
        local dir="${dirs[$i]}"

        if [ -d "$dir" ]; then
            local size=$(du -sb "$dir" 2>/dev/null | cut -f1 || echo "0")
            local size_mb=$((size / 1024 / 1024))
            local files=$(find "$dir" -type f | wc -l 2>/dev/null || echo "0")

            # Capitalize first letter
            local tier_title=$(echo "$tier" | sed 's/^\(.\)/\U\1/')
            echo "$tier_title: $size_mb MB ($files files)"
        fi
    done

    echo ""

    # Show settings
    if [ -f "$COMPACT_CONFIG" ]; then
        echo "Settings:"
        echo "  Auto-compact: $(jq -r '.settings.auto_compact' "$COMPACT_CONFIG")"
        echo "  Threshold: $(jq -r '.settings.compact_threshold' "$COMPACT_CONFIG")"
        echo "  Backup before: $(jq -r '.settings.backup_before_compact' "$COMPACT_CONFIG")"
    fi
}

# Show help
show_help() {
    cat << 'HELP'
Blackbox4 Auto-Compaction System

Automatic memory and context compression when limits reached.

Usage:
  auto-compact.sh <command> [options]

Commands:
  init                       Initialize compaction system
  status                     Show compaction status
  check <file>               Check if file needs compaction
  compact <file>             Compact a specific file
  working [dry-run]          Compact working memory
  extended [dry-run]         Compact extended memory
  plans [dry-run]            Compact plans directory

Options:
  --dry-run                  Show what would be compacted without doing it
  --no-backup                Skip backup before compacting

Examples:
  # Check status
  auto-compact.sh status

  # Check specific file
  auto-compact.sh check context.md

  # Compact working memory
  auto-compact.sh working

  # Dry run on extended memory
  auto-compact.sh extended --dry-run

  # Compact specific file
  auto-compact.sh compact session.md
HELP
}

# Main
init_compact

case "${1:-status}" in
    init)
        init_compact
        ;;
    status)
        show_status
        ;;
    check)
        if [ -z "${2:-}" ]; then
            echo "${RED}Error: File path required${NC}"
            exit 1
        fi
        if check_compact_needed "$2" "${3:-working}"; then
            echo "${YELLOW}Compaction needed${NC}"
            exit 0
        else
            echo "${GREEN}No compaction needed${NC}"
            exit 1
        fi
        ;;
    compact)
        if [ -z "${2:-}" ]; then
            echo "${RED}Error: File path required${NC}"
            exit 1
        fi
        compact_file "$2" "${3:-}" "${4:-true}"
        ;;
    working)
        compact_working "${2:-false}"
        ;;
    extended)
        compact_extended "${2:-false}"
        ;;
    plans)
        compact_plans "${2:-false}"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "${RED}Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac
