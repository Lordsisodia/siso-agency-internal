#!/usr/bin/env bash
#
# Auto-compact script for context files
# Automatically compacts context files exceeding token threshold
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TOKEN_COUNT="$PROJECT_ROOT/4-scripts/utils/token-count.py"
THRESHOLD=50000  # Default threshold

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Compact a single file
compact_file() {
    local file_path="$1"
    local token_count="$2"

    log_warn "Compacting $file_path (${token_count:,} tokens)"

    # Create backup
    cp "$file_path" "${file_path}.bak"

    # Extract key sections to preserve
    local temp_file="${file_path}.tmp"

    {
        # Preserve header
        sed -n '/^# /p' "$file_path"

        # Preserve decision records
        echo ""
        echo "## Decision Records (Preserved)"
        echo ""
        sed -n '/## Decision Records/,/## [A-Z]/p' "$file_path" | head -n -1

        # Preserve final summaries
        echo ""
        echo "## Final Summary (Preserved)"
        echo ""
        sed -n '/## Final Summary/,/## [A-Z]/p' "$file_path" | head -n -1

        # Preserve key artifacts
        echo ""
        echo "## Key Artifacts (Preserved)"
        echo ""
        sed -n '/## Key Artifacts/,/## [A-Z]/p' "$file_path" | head -n -1

        # Add compaction notice
        echo ""
        echo "---"
        echo ""
        echo "*File compacted on $(date -u +"%Y-%m-%d %H:%M:%S UTC")*"
        echo "*Original file: ${file_path}.bak*"
        echo "*Original tokens: ${token_count:,}*"
        echo "*Compaction threshold: ${THRESHOLD:,} tokens*"
    } > "$temp_file"

    # Replace original
    mv "$temp_file" "$file_path"

    local new_count
    new_count=$(python3 "$TOKEN_COUNT" "$file_path" 2>/dev/null || echo "0")

    log_info "Compacted to ${new_count} tokens ($(echo "scale=1; ($new_count * 100) / $token_count" | bc -l)% of original)"
}

# Main compaction logic
main() {
    local target_dir="${1:-.}"
    local threshold="${2:-$THRESHOLD}"

    log_info "Scanning $target_dir for files exceeding ${threshold} tokens..."

    if [[ ! -f "$TOKEN_COUNT" ]]; then
        log_error "Token count utility not found: $TOKEN_COUNT"
        exit 1
    fi

    # Find large files
    while IFS= read -r -d '' file; do
        if [[ -f "$file" ]]; then
            local tokens
            tokens=$(python3 "$TOKEN_COUNT" "$file" 2>/dev/null || echo "0")

            if [[ $tokens -gt $threshold ]]; then
                compact_file "$file" "$tokens"
            fi
        fi
    done < <(find "$target_dir" -type f -name "*.md" -print0)

    log_info "Compaction complete!"
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
