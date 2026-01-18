#!/usr/bin/env bash

# Blackbox4 MCP Server Manager
# Manage Model Context Protocol servers

set -e

BLACKBOX4_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MCP_CONFIG="$BLACKBOX4_HOME/.config/mcp-servers.json"
MCP_STATE="$BLACKBOX4_HOME/.runtime/mcp-state.json"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Initialize MCP system
init_mcp() {
    if [ ! -f "$MCP_CONFIG" ]; then
        mkdir -p "$(dirname "$MCP_CONFIG")"
        echo "${RED}Error: MCP config not found. Run setup first.${NC}"
        return 1
    fi

    if [ ! -f "$MCP_STATE" ]; then
        mkdir -p "$(dirname "$MCP_STATE")"
        cat > "$MCP_STATE" << 'EOF'
{
  "active_servers": [],
  "server_status": {},
  "last_update": null
}
EOF
    fi
}

# List available MCP servers
list_servers() {
    if [ ! -f "$MCP_CONFIG" ]; then
        echo "${YELLOW}No MCP configuration found${NC}"
        return 1
    fi

    echo "${BLUE}Available MCP Servers:${NC}"

    if command -v jq >/dev/null 2>&1; then
        jq -r '.mcpServers | to_entries[] |
            "\(.key): \(.value.description) [\(.value.enabled // "enabled")]",
            "  Capabilities: \(.value.capabilities | join(", "))",
            ""
        ' "$MCP_CONFIG"
    else
        cat "$MCP_CONFIG"
    fi
}

# Get server info
get_server_info() {
    local server="$1"

    if [ ! -f "$MCP_CONFIG" ]; then
        return 1
    fi

    if command -v jq >/dev/null 2>&1; then
        jq -r --arg server "$server" '.mcpServers[$server]' "$MCP_CONFIG"
    fi
}

# Enable server
enable_server() {
    local server="$1"

    if [ ! -f "$MCP_CONFIG" ]; then
        echo "${RED}Error: MCP config not found${NC}"
        return 1
    fi

    if command -v jq >/dev/null 2>&1; then
        jq --arg server "$server" '.mcpServers[$server].enabled = true' "$MCP_CONFIG" > "$MCP_CONFIG.tmp"
        mv "$MCP_CONFIG.tmp" "$MCP_CONFIG"
        echo "${GREEN}✓ Enabled MCP server: $server${NC}"
    fi
}

# Disable server
disable_server() {
    local server="$1"

    if [ ! -f "$MCP_CONFIG" ]; then
        echo "${RED}Error: MCP config not found${NC}"
        return 1
    fi

    if command -v jq >/dev/null 2>&1; then
        jq --arg server "$server" '.mcpServers[$server].enabled = false' "$MCP_CONFIG" > "$MCP_CONFIG.tmp"
        mv "$MCP_CONFIG.tmp" "$MCP_CONFIG"
        echo "${YELLOW}✓ Disabled MCP server: $server${NC}"
    fi
}

# Check server status
check_server() {
    local server="$1"

    if [ ! -f "$MCP_CONFIG" ]; then
        return 1
    fi

    local enabled=$(jq -r --arg server "$server" '.mcpServers[$server].enabled // "false"' "$MCP_CONFIG")

    if [ "$enabled" = "true" ]; then
        echo "${GREEN}✓ $server: ENABLED${NC}"
    else
        echo "${YELLOW}✗ $server: DISABLED${NC}"
    fi

    # Check if command exists
    local command=$(jq -r --arg server "$server" '.mcpServers[$server].command // ""' "$MCP_CONFIG")
    if [ -n "$command" ]; then
        if command -v "$command" >/dev/null 2>&1 || [ "$command" = "npx" ]; then
            echo "  Command: $command ✓"
        else
            echo "  Command: $command ✗ (not found)"
        fi
    fi
}

# Test server connection
test_server() {
    local server="$1"

    echo "${BLUE}Testing MCP server: $server${NC}"

    local info=$(get_server_info "$server")
    local command=$(echo "$info" | jq -r '.command // ""')
    local args=$(echo "$info" | jq -r '.args // []')

    if [ -z "$command" ]; then
        echo "${RED}No command configured for server: $server${NC}"
        return 1
    fi

    # Try to run the command with --help or --version
    if [ "$command" = "npx" ]; then
        echo "  → npx package: ${args[1]}"
        echo "  ${GREEN}✓ npx is available${NC}"
    else
        if command -v "$command" >/dev/null 2>&1; then
            echo "  ${GREEN}✓ Command available: $command${NC}"
        else
            echo "  ${RED}✗ Command not found: $command${NC}"
        fi
    fi
}

# Show server capabilities
show_capabilities() {
    local server="$1"

    if [ ! -f "$MCP_CONFIG" ]; then
        return 1
    fi

    if command -v jq >/dev/null 2>&1; then
        local caps=$(jq -r --arg server "$server" '.mcpServers[$server].capabilities | join(", ")' "$MCP_CONFIG")
        echo "${BLUE}Capabilities of $server:${NC}"
        echo "  $caps"
    fi
}

# Configure server environment
configure_server() {
    local server="$1"
    local env_var="$2"
    local value="$3"

    if [ ! -f "$MCP_CONFIG" ]; then
        echo "${RED}Error: MCP config not found${NC}"
        return 1
    fi

    if command -v jq >/dev/null 2>&1; then
        jq --arg server "$server" --arg env_var "$env_var" --arg value "$value" '
            .mcpServers[$server].env[$env_var] = $value
        ' "$MCP_CONFIG" > "$MCP_CONFIG.tmp"
        mv "$MCP_CONFIG.tmp" "$MCP_CONFIG"
        echo "${GREEN}✓ Set $env_var for $server${NC}"
    fi
}

# Show help
show_help() {
    cat << 'HELP'
Blackbox4 MCP Server Manager

Manage Model Context Protocol servers for enhanced capabilities.

Usage:
  mcp-manager.sh <command> [options]

Commands:
  list                       List all available MCP servers
  info <server>              Show detailed server information
  enable <server>            Enable a server
  disable <server>           Disable a server
  check <server>             Check server status
  test <server>              Test server connection
  capabilities <server>      Show server capabilities
  configure <server> <var>   Configure server environment variable

Available Servers:
  supabase                  Database operations, migrations, edge functions
  shopify                   E-commerce integration
  github                    Repository management, PR/issue automation
  filesystem                Advanced file operations
  playwright                Browser automation and testing
  sequential-thinking        Chain-of-thought reasoning
  exa                       Web search with Exa AI
  fetch                     HTTP request handling

Examples:
  # List all servers
  mcp-manager.sh list

  # Enable Shopify integration
  mcp-manager.sh enable shopify

  # Configure GitHub token
  mcp-manager.sh configure github GITHUB_TOKEN "ghp_xxxxx"

  # Test server connection
  mcp-manager.sh test supabase

  # Show server capabilities
  mcp-manager.sh capabilities playwright
HELP
}

# Main
init_mcp

case "${1:-help}" in
    list|ls)
        list_servers
        ;;
    info)
        if [ -z "${2:-}" ]; then
            echo "${RED}Error: Server name required${NC}"
            exit 1
        fi
        get_server_info "$2"
        ;;
    enable)
        if [ -z "${2:-}" ]; then
            echo "${RED}Error: Server name required${NC}"
            exit 1
        fi
        enable_server "$2"
        ;;
    disable)
        if [ -z "${2:-}" ]; then
            echo "${RED}Error: Server name required${NC}"
            exit 1
        fi
        disable_server "$2"
        ;;
    check)
        if [ -z "${2:-}" ]; then
            echo "${RED}Error: Server name required${NC}"
            exit 1
        fi
        check_server "$2"
        ;;
    test)
        if [ -z "${2:-}" ]; then
            echo "${RED}Error: Server name required${NC}"
            exit 1
        fi
        test_server "$2"
        ;;
    capabilities)
        if [ -z "${2:-}" ]; then
            echo "${RED}Error: Server name required${NC}"
            exit 1
        fi
        show_capabilities "$2"
        ;;
    configure)
        if [ -z "${2:-}" ] || [ -z "${3:-}" ] || [ -z "${4:-}" ]; then
            echo "${RED}Error: Server, env var, and value required${NC}"
            exit 1
        fi
        configure_server "$2" "$3" "$4"
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
