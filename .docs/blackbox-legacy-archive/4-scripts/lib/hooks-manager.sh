#!/usr/bin/env bash

# Blackbox4 Hooks Manager
# Pre/post-tool execution hooks for automation

set -e

BLACKBOX4_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HOOKS_CONFIG="$BLACKBOX4_HOME/.config/hooks.json"
HOOKS_DIR="$BLACKBOX4_HOME/4-scripts/hooks"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Initialize hooks system
init_hooks() {
    if [ ! -f "$HOOKS_CONFIG" ]; then
        mkdir -p "$(dirname "$HOOKS_CONFIG")"
        mkdir -p "$HOOKS_DIR"

        cat > "$HOOKS_CONFIG" << 'EOF'
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "pre-commit --file $FILE",
            "description": "Run pre-commit hooks before file changes"
          },
          {
            "type": "script",
            "script": "$BLACKBOX4_HOME/4-scripts/hooks/validate-changes.sh",
            "args": ["$FILE"],
            "description": "Validate changes against project rules"
          }
        ]
      },
      {
        "matcher": "Read",
        "hooks": [
          {
            "type": "script",
            "script": "$BLACKBOX4_HOME/4-scripts/hooks/inject-context.sh",
            "args": ["$FILE"],
            "description": "Inject AGENTS.md context on file reads"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "bash",
        "hooks": [
          {
            "type": "script",
            "script": "$BLACKBOX4_HOME/4-scripts/hooks/analyze-command.sh",
            "args": ["$COMMAND", "$OUTPUT"],
            "description": "Analyze bash commands for security patterns"
          }
        ]
      },
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "script",
            "script": "$BLACKBOX4_HOME/4-scripts/hooks/analyze-changes.sh",
            "args": ["$FILE"],
            "description": "Analyze changes for quality"
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "script",
            "script": "$BLACKBOX4_HOME/4-scripts/hooks/enhance-prompt.sh",
            "description": "Enhance user prompt with context and best practices"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "script",
            "script": "$BLACKBOX4_HOME/4-scripts/hooks/session-summary.sh",
            "description": "Generate session summary with next steps"
          }
        ]
      }
    ]
  },
  "enabled": true
}
EOF
        echo "${GREEN}✓ Hooks system initialized${NC}"
    fi
}

# Run pre-tool hooks
run_pre_tool_hooks() {
    local tool="$1"
    local file="${2:-}"

    if [ ! -f "$HOOKS_CONFIG" ]; then
        return 0
    fi

    local enabled=$(jq -r '.enabled' "$HOOKS_CONFIG" 2>/dev/null || echo "true")
    if [ "$enabled" != "true" ]; then
        return 0
    fi

    echo "${BLUE}Running pre-tool hooks for: $tool${NC}"

    if command -v jq >/dev/null 2>&1; then
        local hooks=$(jq -r --arg tool "$tool" '
            .hooks.PreToolUse[] |
            select(.matcher == $tool or (.matcher | test($tool))) |
            .hooks[]
        ' "$HOOKS_CONFIG")

        if [ -n "$hooks" ]; then
            echo "$hooks" | while read -r hook; do
                local type=$(echo "$hook" | jq -r '.type')
                local description=$(echo "$hook" | jq -r '.description')

                echo "  → $description"

                case "$type" in
                    command)
                        local command=$(echo "$hook" | jq -r '.command')
                        command="${command/\$FILE/$file}"
                        command="${command/\$BLACKBOX4_HOME/$BLACKBOX4_HOME}"
                        eval "$command" 2>/dev/null || true
                        ;;
                    script)
                        local script=$(echo "$hook" | jq -r '.script')
                        script="${script/\$BLACKBOX4_HOME/$BLACKBOX4_HOME}"
                        if [ -f "$script" ]; then
                            local args=$(echo "$hook" | jq -r '.args[]? // empty' | sed "s/\$FILE/$file/g")
                            bash "$script" $args 2>/dev/null || true
                        fi
                        ;;
                esac
            done
        fi
    fi
}

# Run post-tool hooks
run_post_tool_hooks() {
    local tool="$1"
    local output="${2:-}"
    local file="${3:-}"

    if [ ! -f "$HOOKS_CONFIG" ]; then
        return 0
    fi

    local enabled=$(jq -r '.enabled' "$HOOKS_CONFIG" 2>/dev/null || echo "true")
    if [ "$enabled" != "true" ]; then
        return 0
    fi

    echo "${BLUE}Running post-tool hooks for: $tool${NC}"

    if command -v jq >/dev/null 2>&1; then
        local hooks=$(jq -r --arg tool "$tool" '
            .hooks.PostToolUse[] |
            select(.matcher == $tool or (.matcher | test($tool))) |
            .hooks[]
        ' "$HOOKS_CONFIG")

        if [ -n "$hooks" ]; then
            echo "$hooks" | while read -r hook; do
                local type=$(echo "$hook" | jq -r '.type')
                local description=$(echo "$hook" | jq -r '.description')

                echo "  → $description"

                case "$type" in
                    script)
                        local script=$(echo "$hook" | jq -r '.script')
                        script="${script/\$BLACKBOX4_HOME/$BLACKBOX4_HOME}"
                        if [ -f "$script" ]; then
                            local args=$(echo "$hook" | jq -r '.args[]? // empty' | sed "s/\$FILE/$file/g" | sed "s/\$OUTPUT/$output/g")
                            bash "$script" $args 2>/dev/null || true
                        fi
                        ;;
                esac
            done
        fi
    fi
}

# Run user prompt submit hooks
run_prompt_hooks() {
    local prompt="$1"

    if [ ! -f "$HOOKS_CONFIG" ]; then
        echo "$prompt"
        return 0
    fi

    local enabled=$(jq -r '.enabled' "$HOOKS_CONFIG" 2>/dev/null || echo "true")
    if [ "$enabled" != "true" ]; then
        echo "$prompt"
        return 0
    fi

    echo "$prompt" # Return original prompt for now
}

# Run stop hooks
run_stop_hooks() {
    if [ ! -f "$HOOKS_CONFIG" ]; then
        return 0
    fi

    echo "${BLUE}Running stop hooks...${NC}"

    if command -v jq >/dev/null 2>&1; then
        local hooks=$(jq -r '.hooks.Stop[].hooks[]' "$HOOKS_CONFIG")

        if [ -n "$hooks" ]; then
            echo "$hooks" | while read -r hook; do
                local script=$(echo "$hook" | jq -r '.script // empty')
                script="${script/\$BLACKBOX4_HOME/$BLACKBOX4_HOME}"

                if [ -f "$script" ]; then
                    bash "$script" 2>/dev/null || true
                fi
            done
        fi
    fi
}

# Enable hooks
enable_hooks() {
    if [ ! -f "$HOOKS_CONFIG" ]; then
        init_hooks
    fi

    jq '.enabled = true' "$HOOKS_CONFIG" > "$HOOKS_CONFIG.tmp"
    mv "$HOOKS_CONFIG.tmp" "$HOOKS_CONFIG"
    echo "${GREEN}✓ Hooks enabled${NC}"
}

# Disable hooks
disable_hooks() {
    if [ ! -f "$HOOKS_CONFIG" ]; then
        return 0
    fi

    jq '.enabled = false' "$HOOKS_CONFIG" > "$HOOKS_CONFIG.tmp"
    mv "$HOOKS_CONFIG.tmp" "$HOOKS_CONFIG"
    echo "${YELLOW}✓ Hooks disabled${NC}"
}

# List hooks
list_hooks() {
    if [ ! -f "$HOOKS_CONFIG" ]; then
        echo "${YELLOW}No hooks configured${NC}"
        return 0
    fi

    echo "${BLUE}Configured Hooks:${NC}"

    if command -v jq >/dev/null 2>&1; then
        jq -r '
            .hooks |
            to_entries[] |
            "\n\(.key):",
            (.value[] |
                "  Matcher: \(.matcher)",
                "  Hooks:",
                (.value[] | "    - \(.description)"))
        ' "$HOOKS_CONFIG"
    fi
}

# Show help
show_help() {
    cat << 'HELP'
Blackbox4 Hooks Manager

Pre/post-tool execution hooks for automation.

Usage:
  hooks-manager.sh <command> [options]

Commands:
  init                       Initialize hooks system
  run-pre <tool> [file]      Run pre-tool hooks
  run-post <tool> [output]   Run post-tool hooks
  enable                     Enable hooks
  disable                    Disable hooks
  list                       List configured hooks

Hook Types:
  PreToolUse                 Run before tool execution
  PostToolUse                Run after tool execution
  UserPromptSubmit           Run when user submits prompt
  Stop                       Run on session stop

Examples:
  # Initialize hooks
  hooks-manager.sh init

  # Run pre-tool hooks for Write operation
  hooks-manager.sh run-pre Write /path/to/file.py

  # Run post-tool hooks for bash command
  hooks-manager.sh run-post bash

  # List configured hooks
  hooks-manager.sh list

  # Disable hooks temporarily
  hooks-manager.sh disable
HELP
}

# Main
case "${1:-help}" in
    init)
        init_hooks
        ;;
    run-pre)
        if [ -z "${2:-}" ]; then
            echo "${RED}Error: Tool name required${NC}"
            exit 1
        fi
        run_pre_tool_hooks "$2" "${3:-}"
        ;;
    run-post)
        if [ -z "${2:-}" ]; then
            echo "${RED}Error: Tool name required${NC}"
            exit 1
        fi
        run_post_tool_hooks "$2" "${3:-}" "${4:-}"
        ;;
    enable)
        enable_hooks
        ;;
    disable)
        disable_hooks
        ;;
    list|ls)
        list_hooks
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
