#!/usr/bin/env bash
#
# Build semantic search index
# Indexes all project files for vector-based semantic search
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SEMANTIC_SEARCH="$PROJECT_ROOT/modules/research/semantic_search.py"

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

# Check dependencies
check_dependencies() {
    log_info "Checking dependencies..."

    if ! python3 -c "import chromadb" 2>/dev/null; then
        log_error "ChromaDB not installed"
        log_info "Install with: pip install -r modules/research/requirements.txt"
        exit 1
    fi

    if ! python3 -c "import sentence_transformers" 2>/dev/null; then
        log_error "sentence-transformers not installed"
        log_info "Install with: pip install -r modules/research/requirements.txt"
        exit 1
    fi

    log_info "Dependencies OK"
}

# Build index
build_index() {
    local force="${1:-false}"

    check_dependencies

    if [[ ! -f "$SEMANTIC_SEARCH" ]]; then
        log_error "Semantic search module not found: $SEMANTIC_SEARCH"
        exit 1
    fi

    log_info "Building semantic search index..."

    local force_flag=""
    if [[ "$force" == "true" ]]; then
        force_flag="--force"
        log_warn "Force rebuilding index"
    fi

    # Index memory directories
    local dirs=(
        "data/context"
        "data/decisions"
        "data/bmad"
        ".docs"
    )

    for dir in "${dirs[@]}"; do
        local full_path="$PROJECT_ROOT/$dir"
        if [[ -d "$full_path" ]]; then
            log_info "Indexing $dir..."
            python3 "$SEMANTIC_SEARCH" index --path "$full_path" $force_flag
        else
            log_warn "Directory not found: $dir"
        fi
    done

    # Show stats
    log_info "Index statistics:"
    python3 "$SEMANTIC_SEARCH" stats
}

# Show help
show_help() {
    cat << EOF
Build Semantic Search Index

Usage: $0 [options]

Options:
  --force      Rebuild index from scratch
  --help       Show this help message

Examples:
  $0              # Build index (incremental)
  $0 --force      # Rebuild index completely
EOF
}

# Main
main() {
    local force="false"

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --force)
                force="true"
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done

    build_index "$force"
    log_info "Index build complete!"
}

main "$@"
