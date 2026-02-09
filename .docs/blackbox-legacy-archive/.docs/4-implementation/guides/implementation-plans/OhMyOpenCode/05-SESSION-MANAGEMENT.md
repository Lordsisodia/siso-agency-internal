# Session Management for Blackbox3
**Status**: Planning Phase

## Overview

Add Oh-My-OpenCode\'s session management system to Blackbox3. Never lose important conversations - search through all your history, find previous solutions, and see what agents worked on.

## Why This Matters

**Current**: No cross-session persistence - conversations are lost when they end
**After**: Session history, cross-session search, metadata tracking, continuity across restarts

## What You Get

1. **Session History**: Access all past conversations
2. **Cross-Session Search**: Full-text search through all sessions
3. **Metadata**: See agents used, tokens consumed, time spent
4. **Continuity**: Resume work from where you left off

## Files to Create

### 1. Session Manager Script

**File**: `sessions/session-manager.sh`

```bash
#!/usr/bin/env bash

# Blackbox3 Session Manager
# Manage and search through all Blackbox3 sessions

set -e

BLACKBOX3_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."
SESSIONS_DIR="$BLACKBOX3_HOME/sessions"
SESSION_DATA="$SESSIONS_DIR/session-data.json"

# Colors
GREEN=\'\\033[0;32m\'
BLUE=\'\\033[0;34m\'
YELLOW=\'\\033[1;33m\'
RED=\'\\033[0;31m\'
NC=\'\\033[0m\'

# Functions
show_help() {
    echo "Blackbox3 Session Manager"
    echo ""
    echo "Search through and manage all your Blackbox3 sessions"
    echo ""
    echo "Usage: blackbox3 session <command> [options]"
    echo ""
    echo "Commands:"
    echo "  list [options]              List all sessions"
    echo "  read <session_id>           Read full session messages"
    echo "  search \"query\"            Full-text search across sessions"
    echo "  info <session_id>            Get session metadata"
    echo "  archive <session_id>          Archive session"
    echo "  delete <session_id>          Delete session"
    echo ""
    echo "Options for list:"
    echo "  --limit N                 Show last N sessions"
    echo "  --agent NAME             Filter by agent"
    echo "  --from-date DATE          Since specific date"
    echo "  --to-date DATE            Until specific date"
    echo ""
    echo "Options for search:"
    echo "  --agent NAME             Filter by agent"
    echo "  --session ID            Search within specific session"
    echo "  --limit N                 Max results (default: 20)"
}

init_session_manager() {
    if [ ! -d "$SESSIONS_DIR" ]; then
        mkdir -p "$SESSIONS_DIR"
    fi
    
    if [ ! -f "$SESSION_DATA" ]; then
        echo '{"sessions": {}}' > "$SESSION_DATA"
    fi
}

list_sessions() {
    local limit="${1:-50}"
    local agent="${2:-}"
    local from_date="${3:-}"
    local to_date="${4:-}"
    
    if [ ! -f "$SESSION_DATA" ]; then
        echo "${RED}No session data found${NC}"
        return
    fi
    
    echo "${BLUE}Blackbox3 Sessions${NC}"
    echo ""
    
    jq -r --arg limit "$limit" \\
           --arg agent "$agent" \\
           --arg from_date "$from_date" \\
           --arg to_date "$to_date" \\
           '.sessions | sort_by(.createdAt) | reverse | if $limit != null then .[0:$limit] else .' \\
           "$SESSION_DATA"
}

read_session() {
    local session_id="$1"
    
    if [ ! -f "$SESSION_DATA" ]; then
        echo "${RED}No session data found${NC}"
        return
    fi
    
    local session=$(jq -r --arg id "$session_id" '.sessions[] | select(.id == $id)' "$SESSION_DATA")
    
    if [ -z "$session" ]; then
        echo "${RED}Session not found: $session_id${NC}"
        return
    fi
    
    local created_at=$(echo "$session" | jq -r '.createdAt')
    local agent=$(echo "$session" | jq -r '.agent // "unknown"')
    local message_count=$(echo "$session" | jq -r '.messages | length')
    
    echo "${GREEN}Session: $session_id${NC}"
    echo "Created: $created_at"
    echo "Agent: $agent"
    echo "Messages: $message_count"
    echo ""
    echo "--- Messages ---"
    echo "$session" | jq -r '.messages[] | {message, role} | "\\n--- Message [\\(.role)] --- \\n\\(.message)"'
}

search_sessions() {
    local query="$2"
    local limit="${3:-20}"
    local agent="${4:-}"
    local session_id="${5:-}"
    
    if [ ! -f "$SESSION_DATA" ]; then
        echo "${RED}No session data found${NC}"
        return
    fi
    
    local jq_filter=".sessions | map({id, createdAt, agent, messages: [.messages[] | select(contains(.message; \"$query\")) | select(contains(.message; \"$query\")) | select(contains(.message; \"$query\")) | select(contains(.message; \"$query\")) | .[0:3]]}])"
    
    if [ -n "$agent" ]; then
        jq_filter=$(echo "$jq_filter" | jq -r --arg agent "$agent" 'select(.agent == $agent)')
    fi
    
    if [ -n "$session_id" ]; then
        jq_filter=$(echo "$jq_filter" | jq -r --arg session_id "$session_id" 'select(.id == $session_id)')
    fi
    
    local results=$(jq -r --arg limit "$limit" "$jq_filter" "$SESSION_DATA")
    
    echo "${BLUE}Search Results for: \"$query\"${NC}"
    echo ""
    echo "$results" | jq -r '.[] | {id, sessionID: .sessionID, agent: .agent, date: .createdAt, snippet: .messages[0].message} | "\\n--- Result [\\(.index + 1)] ---"'
}

session_info() {
    local session_id="$1"
    
    if [ ! -f "$SESSION_DATA" ]; then
        echo "${RED}No session data found${NC}"
        return
    fi
    
    local session=$(jq -r --arg id "$session_id" '.sessions[] | select(.id == $id)' "$SESSION_DATA")
    
    if [ -z "$session" ]; then
        echo "${RED}Session not found: $session_id${NC}"
        return
    fi
    
    local created_at=$(echo "$session" | jq -r '.createdAt')
    local agent=$(echo "$session" | jq -r '.agent // "unknown"')
    local message_count=$(echo "$session" | jq -r '.messages | length')
    local date_range=$(echo "$session" | jq -r '{
        start: .messages[0].createdAt,
        end: .messages[-1].createdAt
    }')
    local tokens_used=$(echo "$session" | jq -r '.tokensUsed // "not tracked"')
    
    echo "${GREEN}Session: $session_id${NC}"
    echo "Created: $created_at"
    echo "Agent: $agent"
    echo "Messages: $message_count"
    echo "Date Range: $(echo "$date_range" | jq -r '"\\(.start) to \\(.end)"')"
    echo "Tokens Used: $tokens_used"
    echo ""
    echo "--- Recent Activity ---"
    echo "$session" | jq -r '.messages[-5:] | {time: .createdAt, agent: .agent, type: .type} | "\\n--- [\\(.index + 1)] ---"'
}

# Main
init_session_manager
case "${1:-help}" in
    list)
        list_sessions "$@"
        ;;
    read)
        read_session "$2"
        ;;
    search)
        search_sessions "$@"
        ;;
    info)
        session_info "$2"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "${RED}Unknown command: $1${NC}"
        show_help
        ;;
esac
