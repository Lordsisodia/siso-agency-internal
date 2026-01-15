# Auto-Compaction for Blackbox3
**Status**: Planning Phase

## Overview

Add Oh-My-OpenCode\'s smart context management system to Blackbox3. Prevents token limits by proactively compacting sessions while preserving critical context.

## What You Get

1. **Preemptive Compaction**: Compact at 85% usage (before hitting limits)
2. **Context Preservation**: Keep AGENTS.md files, plan info, critical state
3. **Smart Re-injection**: Restore important context after compaction
4. **Compaction Strategies**: Remove tool outputs, old messages, duplicates

## Files to Create

### 1. Compaction Manager Script

**File**: `scripts/compaction-manager.sh`

```bash
#!/usr/bin/env bash

# Blackbox3 Auto-Compaction Manager
# Prevents token limits by smartly managing session context

set -e

BLACKBOX3_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."

# Compaction thresholds
DEFAULT_THRESHOLD=85
KEEP_HEADROOM=0.50  # Keep 50% headroom
KEEP_RECENT=10  # Keep last 10 messages
KEEP_PLAN=true  # Keep plan files
KEEP_AGENTS=true  # Keep AGENTS.md context

# Functions
show_help() {
    echo "Blackbox3 Compaction Manager"
    echo ""
    echo "Manages auto-compaction to prevent token limits"
    echo ""
    echo "Usage: blackbox3 compact <command> [options]"
    echo ""
    echo "Commands:"
    echo "  status          Show current compaction settings"
    echo "  enable          Enable auto-compaction"
    echo "  disable         Disable auto-compaction"
    echo "  configure       Configure compaction thresholds"
    echo "  trigger         Manually trigger compaction"
    echo ""
    echo "Options:"
    echo "  --threshold N   Compaction percentage (default: 85)"
    echo "  --headroom N     Keep N% headroom (default: 50)"
    echo "  --recent N       Keep last N messages (default: 10)"
    echo "  --keep-plan       Keep plan files (default: true)"
    echo "  --keep-agents    Keep AGENTS.md files (default: true)"
    echo "  --dry-run        Show what would be compacted"
    echo "  --help           Show this help message"
}

get_compaction_config() {
    local config_file="$BLACKBOX3_HOME/.bb3-config/compaction.json"
    
    if [ ! -f "$config_file" ]; then
        mkdir -p "$BLACKBOX3_HOME/.bb3-config"
        cat > "$config_file" <<CONFIG
{
  "threshold": $DEFAULT_THRESHOLD,
  "keep_headroom": $KEEP_HEADROOM,
  "keep_recent": $KEEP_RECENT,
  "keep_plan": $KEEP_PLAN,
  "keep_agents": $KEEP_AGENTS,
  "enabled": true
}
CONFIG
        echo "Created default compaction config"
    fi
    
    cat "$config_file"
}

enable_compaction() {
    local config_file="$BLACKBOX3_HOME/.bb3-config/compaction.json"
    jq \'.enabled = true' "$config_file" > "$config_file.tmp"
    mv "$config_file.tmp" "$config_file"
    echo "${GREEN}✓ Auto-compaction enabled${NC}"
}

disable_compaction() {
    local config_file="$BLACKBOX3_HOME/.bb3-config/compaction.json"
    jq \'.enabled = false' "$config_file" > "$config_file.tmp"
    mv "$config_file.tmp" "$config_file"
    echo "${YELLOW}⏸ Auto-compaction disabled${NC}"
}

configure_compaction() {
    local threshold="${1:-85}"
    local headroom="${2:-50}"
    local recent="${3:-10}"
    local keep_plan="${4:-true}"
    local keep_agents="${5:-true}"
    
    local config_file="$BLACKBOX3_HOME/.bb3-config/compaction.json"
    
    jq --arg threshold "$threshold" \\
       --arg headroom "$headroom" \\
       --arg recent "$recent" \\
       --arg keep_plan "$keep_plan" \\
       --arg keep_agents "$keep_agents" \\
       '.enabled = true | .threshold = $threshold | .keep_headroom = $headroom | .keep_recent = $recent | .keep_plan = $keep_plan | .keep_agents = $keep_agents' \\
       "$config_file" > "$config_file.tmp"
    mv "$config_file.tmp" "$config_file"
    
    echo "${GREEN}✓ Compaction configured${NC}"
    echo "  Threshold: $threshold%"
    echo "  Headroom: $headroom%"
    echo "  Keep recent: $recent"
    echo "  Keep plan: $keep_plan"
    echo "  Keep AGENTS.md: $keep_agents"
}

# Main
case "${1:-help}" in
    status)
        get_compaction_config
        ;;
    enable)
        enable_compaction
        ;;
    disable)
        disable_compaction
        ;;
    configure)
        configure_compaction "$@"
        ;;
    trigger)
        echo "${YELLOW}Manual trigger not yet implemented${NC}"
        echo "Auto-compaction will handle this automatically"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "${RED}Unknown command: $1${NC}"
        show_help
        ;;
esac
```

### 2. Integration Points

1. **Update hooks system** to call compaction manager
2. **Add to keyword detector** to disable compaction during deep analysis
3. **Update session manager** to integrate with compaction

### 3. Compaction Strategies

**Strategy 1: Remove Verbose Tool Outputs**
- Truncate Grep results
- Limit LSP output
- Summarize AST-grep results

**Strategy 2: Remove Duplicate Content**
- Remove consecutive tool calls with same output
- Deduplicate search results

**Strategy 3: Prioritize Recent Activity**
- Keep last 10-20 messages
- Remove middle messages of long sessions
- Keep most recent plan files

**Strategy 4: Preserve Critical Context**
- Keep all AGENTS.md files
- Keep current plan status and goals
- Keep last tool results
- Keep recent checklist state

**Strategy 5: Smart Re-injection**
- Re-inject AGENTS.md from all directories
- Re-inject plan files
- Restore recent message context
- Keep session state variables
