# MCP Integration for Blackbox3
**Status**: Planning Phase - Ready for Implementation  
**Created**: 2026-01-15

## Overview

This document outlines how to add Oh-My-OpenCode\'s powerful MCP (Model Context Protocol) system to Blackbox3.

## What You Get

1. **Curated MCPs** (already built into oh-my-opencode):
   - Context7: Official documentation for any library
   - Exa: Real-time web search
   - Grep.app: Ultra-fast GitHub code search

2. **Community MCPs** (easily addable):
   - GitHub MCP: Official GitHub integration
   - Playwright: Browser automation (already in oh-my-opencode)
   - SQLite: Local database with query
   - Chroma: Vector search for your 3-tier memory
   - Supabase: Production backend

## Files to Create

### 1. Configuration File

**File**: `.opencode/mcp-servers.json`

```json
{
  "mcpServers": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp",
      "enabled": true
    },
    "websearch_exa": {
      "type": "remote",
      "url": "https://mcp.exa.ai/mcp?tools=web_search_exa",
      "enabled": true
    },
    "grep_app": {
      "type": "remote",
      "url": "https://mcp.grep.app/mcp",
      "enabled": true
    },
    "github": {
      "type": "remote",
      "url": "https://mcp.github.com/mcp",
      "enabled": true
    },
    "sqlite": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/sqlite"],
      "enabled": true
    },
    "chroma": {
      "command": "npx",
      "args": ["-y", "@chroma-core/mcp-server"],
      "enabled": true
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-playwright"],
      "enabled": true
    },
    "supabase": {
      "type": "remote",
      "url": "https://mcp.supabase.com/mcp",
      "enabled": true
    }
  }
}
```

### 2. MCP Manager Script

**File**: `scripts/mcp-manager.sh`

```bash
#!/usr/bin/env bash

# Blackbox3 MCP Manager
# Manages MCP servers for Blackbox3

set -e

BLACKBOX3_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."
CONFIG_FILE="$BLACKBOX3_HOME/.opencode/mcp-servers.json"

# Colors
GREEN=\'\\033[0;32m\'
RED=\'\\033[0;31m\'
YELLOW=\'\\033[1;33m\'
NC=\'\\033[0m\'

# Functions
show_help() {
    echo "Blackbox3 MCP Manager"
    echo ""
    echo "Usage: blackbox3 mcp <command> [options]"
    echo ""
    echo "Commands:"
    echo "  list              List all configured MCPs"
    echo "  add <name>       Add new MCP to config"
    echo "  remove <name>    Remove MCP from config"
    echo "  enable <name>    Enable MCP"
    echo "  disable <name>   Disable MCP"
    echo "  status            Show MCP status"
    echo ""
    echo "Options:"
    echo "  --help            Show this help message"
}

list_mcps() {
    if [ ! -f "$CONFIG_FILE" ]; then
        echo "${YELLOW}No MCP config file found${NC}"
        return 1
    fi
    
    echo "${GREEN}Configured MCP Servers:${NC}"
    jq -r \'.mcpServers | to_entries[] | "\(.key): \(.value.enabled // "enabled" // "disabled")"' "$CONFIG_FILE"
}

add_mcp() {
    local name="$1"
    shift
    local type="remote"
    local url=""
    local command=""
    local args=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --type)
                type="$2"
                shift 2
                ;;
            --url)
                url="$2"
                shift 2
                ;;
            --command)
                command="$2"
                shift 2
                ;;
            --args)
                args="$2"
                shift 2
                ;;
            *)
                shift
                ;;
        esac
    done
    
    # Create config if doesn\'t exist
    if [ ! -f "$CONFIG_FILE" ]; then
        mkdir -p "$(dirname "$CONFIG_FILE")"
        echo '{"mcpServers": {}}' > "$CONFIG_FILE"
    fi
    
    # Build config object
    local config="{"
    if [ "$type" = "remote" ]; then
        config+='\"type\": \"remote\", \"url\": \"$url\",'
    elif [ "$type" = "command" ]; then
        config+="\"command\": \"$command\", \"args\": $(echo "$args" | jq -R .),"
    fi
    config+="\"enabled\": true}"
    
    # Add to config
    jq --arg name "$name" --argjson config "$config" \'.mcpServers[$name] = $config' "$CONFIG_FILE" > "$CONFIG_FILE.tmp"
    mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
    
    echo "${GREEN}✓ MCP '$name' added successfully${NC}"
}

remove_mcp() {
    local name="$1"
    
    if [ ! -f "$CONFIG_FILE" ]; then
        echo "${RED}No MCP config file found${NC}"
        return 1
    fi
    
    jq --arg name "$name" 'del(.mcpServers[$name])' "$CONFIG_FILE" > "$CONFIG_FILE.tmp"
    mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
    
    echo "${GREEN}✓ MCP '$name' removed${NC}"
}

enable_mcp() {
    local name="$1"
    
    jq --arg name "$name" \'.mcpServers[$name].enabled = true' "$CONFIG_FILE" > "$CONFIG_FILE.tmp"
    mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
    
    echo "${GREEN}✓ MCP '$name' enabled${NC}"
}

disable_mcp() {
    local name="$1"
    
    jq --arg name "$name" \'.mcpServers[$name].enabled = false' "$CONFIG_FILE" > "$CONFIG_FILE.tmp"
    mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
    
    echo "${GREEN}✓ MCP '$name' disabled${NC}"
}

show_status() {
    if [ ! -f "$CONFIG_FILE" ]; then
        echo "${YELLOW}No MCP config file found${NC}"
        return 1
    fi
    
    echo "${GREEN}MCP Status:${NC}"
    jq -r \'.mcpServers | to_entries[] | "\(.key): \(.value.enabled)"' "$CONFIG_FILE"
}

# Main
case "${1:-help}" in
    list)
        list_mcps
        ;;
    add)
        if [ -z "$2" ]; then
            echo "${RED}Error: MCP name required${NC}"
            echo "Usage: blackbox3 mcp add <name> [--type <type>] [--url <url>]"
            exit 1
        fi
        add_mcp "$@"
        ;;
    remove)
        if [ -z "$2" ]; then
            echo "${RED}Error: MCP name required${NC}"
            exit 1
        fi
        remove_mcp "$2"
        ;;
    enable)
        if [ -z "$2" ]; then
            echo "${RED}Error: MCP name required${NC}"
            exit 1
        fi
        enable_mcp "$2"
        ;;
    disable)
        if [ -z "$2" ]; then
            echo "${RED}Error: MCP name required${NC}"
            exit 1
        fi
        disable_mcp "$2"
        ;;
    status)
        show_status
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
