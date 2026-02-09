#!/usr/bin/env bash

# Blackbox4 Keyword Detection System
# Detects magic words in prompts and enables specialized modes

set -e

BLACKBOX4_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
KEYWORDS_CONFIG="$BLACKBOX4_HOME/.config/keywords.json"
MODE_STATE="$BLACKBOX4_HOME/.runtime/current-mode.json"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Initialize keyword detection
init_keywords() {
    if [ ! -f "$KEYWORDS_CONFIG" ]; then
        mkdir -p "$(dirname "$KEYWORDS_CONFIG")"
        cat > "$KEYWORDS_CONFIG" << 'EOF'
{
  "keywords": {
    "ultrawork": {
      "triggers": ["ultrawork", "ulw"],
      "mode": "parallel",
      "description": "Maximum performance with parallel agents",
      "features": [
        "parallel_agents",
        "background_tasks",
        "aggressive_execution",
        "todo_continuation"
      ]
    },
    "search": {
      "triggers": ["search", "find", "look for", "찾아", "검색"],
      "mode": "research",
      "description": "Deep research mode with parallel search",
      "features": [
        "parallel_explore_librarian",
        "maximized_grep",
        "context7_active",
        "grep_app_active"
      ]
    },
    "analyze": {
      "triggers": ["analyze", "investigate", "분석", "조사"],
      "mode": "analysis",
      "description": "Multi-phase expert consultation",
      "features": [
        "oracle_first",
        "explore_librarian_data",
        "sequential_investigation",
        "synthesis_report"
      ]
    }
  },
  "current_mode": "normal",
  "mode_history": []
}
EOF
        echo "${GREEN}✓ Keywords initialized${NC}"
    fi
}

# Detect keywords in text
detect_keywords() {
    local text="$1"

    if [ ! -f "$KEYWORDS_CONFIG" ]; then
        init_keywords
    fi

    local detected=()
    local modes=()

    # Check for ultrawork
    if echo "$text" | grep -iqE "\b(ultrawork|ulw)\b"; then
        detected+=("ultrawork")
        modes+=("parallel")
    fi

    # Check for search
    if echo "$text" | grep -iqE "\b(search|find|look for|찾아|검색)\b"; then
        detected+=("search")
        modes+=("research")
    fi

    # Check for analyze
    if echo "$text" | grep -iqE "\b(analyze|investigate|분석|조사)\b"; then
        detected+=("analyze")
        modes+=("analysis")
    fi

    # Return results
    if [ ${#detected[@]} -gt 0 ]; then
        echo "${detected[@]}"
        return 0
    else
        return 1
    fi
}

# Set mode
set_mode() {
    local mode="$1"
    local keywords="$2"

    mkdir -p "$(dirname "$MODE_STATE")"

    cat > "$MODE_STATE" << EOF
{
  "mode": "$mode",
  "keywords": [$keywords],
  "enabled_at": "$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")",
  "session_id": "bb4-$(date +%s)-$RANDOM"
}
EOF

    echo "${GREEN}✓ Mode set to: $mode${NC}"
}

# Get current mode
get_mode() {
    if [ -f "$MODE_STATE" ]; then
        jq -r '.mode' "$MODE_STATE" 2>/dev/null || echo "normal"
    else
        echo "normal"
    fi
}

# Get mode info
get_mode_info() {
    local mode="$1"

    case "$mode" in
        parallel)
            echo "Mode: PARALLEL (ultrawork)"
            echo "  → All agents enabled"
            echo "  → Aggressive parallel execution"
            echo "  → Background task delegation"
            echo "  → Todo continuation enforced"
            ;;
        research)
            echo "Mode: RESEARCH (search)"
            echo "  → Parallel Explore + Librarian"
            echo "  → Maximized grep/ast-grep"
            echo "  → Context7 and grep.app active"
            echo "  → Deep search mode"
            ;;
        analysis)
            echo "Mode: ANALYSIS (analyze)"
            echo "  → Oracle first (architecture/strategy)"
            echo "  → Explore + Librarian for data"
            echo "  → Sequential investigation"
            echo "  → Synthesis report"
            ;;
        normal)
            echo "Mode: NORMAL"
            echo "  → Standard single-agent mode"
            echo "  → Normal tool permissions"
            echo "  → All hooks enabled normally"
            ;;
        *)
            echo "Unknown mode: $mode"
            ;;
    esac
}

# Reset mode
reset_mode() {
    if [ -f "$MODE_STATE" ]; then
        rm "$MODE_STATE"
        echo "${GREEN}✓ Mode reset to normal${NC}"
    else
        echo "${YELLOW}Already in normal mode${NC}"
    fi
}

# Process prompt and set mode
process_prompt() {
    local prompt="$1"
    local auto_set="${2:-true}"

    local detected
    detected=$(detect_keywords "$prompt")

    if [ -n "$detected" ]; then
        local keywords_array=($detected)
        local keyword="${keywords_array[0]}"
        local mode=""

        case "$keyword" in
            ultrawork)
                mode="parallel"
                ;;
            search)
                mode="research"
                ;;
            analyze)
                mode="analysis"
                ;;
        esac

        if [ "$auto_set" = "true" ]; then
            set_mode "$mode" "\"$keyword\""
        else
            echo "${BLUE}Detected keyword: $keyword (mode: $mode)${NC}"
        fi

        return 0
    else
        return 1
    fi
}

# Show help
show_help() {
    cat << 'HELP'
Blackbox4 Keyword Detection System

Magic words that trigger specialized modes:

  ultrawork / ulw      Maximum performance with parallel agents
                      → All agents enabled
                      → Aggressive parallel execution
                      → Background task delegation
                      → Use for: Full-stack development with tight deadlines

  search / find        Deep research mode with parallel search
                      → Parallel Explore + Librarian agents
                      → Maximized grep/ast-grep search
                      → Context7 and grep.app active
                      → Use for: Finding implementation patterns, codebase patterns

  analyze / investigate  Multi-phase expert consultation
                      → Oracle first (architecture/strategy)
                      → Explore + Librarian for data gathering
                      → Sequential investigation with synthesis
                      → Use for: Debugging complex issues, deep system analysis

Usage:
  keyword-detector.sh init                    Initialize keyword system
  keyword-detector.sh detect "<text>"         Detect keywords in text
  keyword-detector.sh set-mode <mode>         Manually set mode
  keyword-detector.sh get-mode                Get current mode
  keyword-detector.sh mode-info <mode>        Get information about a mode
  keyword-detector.sh reset                   Reset to normal mode
  keyword-detector.sh process "<prompt>"      Process prompt and auto-set mode

Examples:
  # Detect keywords in text
  keyword-detector.sh detect "Build auth system ultrawork"

  # Process a prompt and auto-set mode
  keyword-detector.sh process "Find all usages of getUserAuth search"

  # Check current mode
  keyword-detector.sh get-mode

  # Get mode information
  keyword-detector.sh mode-info parallel

  # Reset to normal
  keyword-detector.sh reset
HELP
}

# Main
case "${1:-help}" in
    init)
        init_keywords
        ;;
    detect)
        if [ -z "${2:-}" ]; then
            echo "${RED}Error: Text required for detection${NC}"
            exit 1
        fi
        detected=$(detect_keywords "$2")
        if [ -n "$detected" ]; then
            echo "${GREEN}Detected keywords: $detected${NC}"
            exit 0
        else
            echo "${YELLOW}No keywords detected${NC}"
            exit 1
        fi
        ;;
    set-mode)
        if [ -z "${2:-}" ]; then
            echo "${RED}Error: Mode required${NC}"
            exit 1
        fi
        set_mode "$2" "manual"
        ;;
    get-mode)
        get_mode
        ;;
    mode-info)
        if [ -z "${2:-}" ]; then
            get_mode_info "$(get_mode)"
        else
            get_mode_info "$2"
        fi
        ;;
    reset)
        reset_mode
        ;;
    process)
        if [ -z "${2:-}" ]; then
            echo "${RED}Error: Prompt required${NC}"
            exit 1
        fi
        process_prompt "$2" "${3:-true}"
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
