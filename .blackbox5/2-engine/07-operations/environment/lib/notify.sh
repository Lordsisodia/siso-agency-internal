#!/usr/bin/env bash

# Blackbox4 Enhanced Notification System
# Multi-channel notifications (local, mobile, Telegram)

set -e

BLACKBOX4_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
NOTIFY_CONFIG="$BLACKBOX4_HOME/.config/notifications.json"
NOTIFY_LOG="$BLACKBOX4_HOME/.runtime/notifications.log"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Initialize notification system
init_notify() {
    if [ ! -f "$NOTIFY_CONFIG" ]; then
        mkdir -p "$(dirname "$NOTIFY_CONFIG")"
        cat > "$NOTIFY_CONFIG" << 'EOF'
{
  "channels": {
    "local": {
      "enabled": true,
      "type": "desktop",
      "command": "osascript"
    },
    "mobile": {
      "enabled": false,
      "type": "push",
      "service": "ntfy",
      "topic": ""
    },
    "telegram": {
      "enabled": false,
      "type": "bot",
      "bot_token": "",
      "chat_id": ""
    }
  },
  "settings": {
    "quiet_hours": {
      "enabled": false,
      "start": "22:00",
      "end": "08:00"
    },
    "priority_filter": {
      "min_priority": "info",
      "quiet_urgent_only": false
    },
    "throttle": {
      "enabled": true,
      "max_per_hour": 10,
      "cooldown_seconds": 60
    }
  }
}
EOF
        echo "${GREEN}✓ Notification system initialized${NC}"
    fi

    mkdir -p "$(dirname "$NOTIFY_LOG")"
}

# Send local desktop notification
send_local() {
    local title="$1"
    local message="$2"
    local sound="${3:-true}"

    if [ "$(uname)" = "Darwin" ]; then
        # macOS
        local sound_flag=""
        if [ "$sound" = "true" ]; then
            sound_flag="sound name \"Glass\""
        fi

        osascript -e "display notification \"$message\" with title \"$title\" $sound_flag" 2>/dev/null || true
    elif command -v notify-send >/dev/null 2>&1; then
        # Linux with libnotify
        notify-send "$title" "$message" 2>/dev/null || true
    fi
}

# Send Telegram notification
send_telegram() {
    local title="$1"
    local message="$2"

    if [ ! -f "$NOTIFY_CONFIG" ]; then
        return 0
    fi

    local enabled=$(jq -r '.channels.telegram.enabled' "$NOTIFY_CONFIG" 2>/dev/null || echo "false")
    if [ "$enabled" != "true" ]; then
        return 0
    fi

    local bot_token=$(jq -r '.channels.telegram.bot_token // ""' "$NOTIFY_CONFIG")
    local chat_id=$(jq -r '.channels.telegram.chat_id // ""' "$NOTIFY_CONFIG")

    if [ -z "$bot_token" ] || [ -z "$chat_id" ]; then
        return 0
    fi

    local text="*$title*%0A%0A$message"

    curl -s -X POST "https://api.telegram.org/bot$bot_token/sendMessage" \
        -d chat_id="$chat_id" \
        -d text="$text" \
        -d parse_mode="Markdown" \
        >/dev/null 2>&1 || true
}

# Send mobile push notification
send_mobile() {
    local title="$1"
    local message="$2"

    if [ ! -f "$NOTIFY_CONFIG" ]; then
        return 0
    fi

    local enabled=$(jq -r '.channels.mobile.enabled' "$NOTIFY_CONFIG" 2>/dev/null || echo "false")
    if [ "$enabled" != "true" ]; then
        return 0
    fi

    local service=$(jq -r '.channels.mobile.service // ""' "$NOTIFY_CONFIG")
    local topic=$(jq -r '.channels.mobile.topic // ""' "$NOTIFY_CONFIG")

    if [ "$service" = "ntfy" ] && [ -n "$topic" ]; then
        curl -s -X POST "https://ntfy.sh/$topic" \
            -d "$title: $message" \
            -H "Priority: high" \
            >/dev/null 2>&1 || true
    fi
}

# Check quiet hours
is_quiet_hours() {
    if [ ! -f "$NOTIFY_CONFIG" ]; then
        return 1
    fi

    local enabled=$(jq -r '.settings.quiet_hours.enabled' "$NOTIFY_CONFIG" 2>/dev/null || echo "false")
    if [ "$enabled" != "true" ]; then
        return 1
    fi

    local start=$(jq -r '.settings.quiet_hours.start' "$NOTIFY_CONFIG")
    local end=$(jq -r '.settings.quiet_hours.end' "$NOTIFY_CONFIG")
    local current_hour=$(date +%H)
    local current_minute=$(date +%M)
    local current_time=$((current_hour * 60 + current_minute))

    local start_hour=${start%%:*}
    local start_min=${start##*:}
    local start_time=$((start_hour * 60 + start_min))

    local end_hour=${end%%:*}
    local end_min=${end##*:}
    local end_time=$((end_hour * 60 + end_min))

    if [ "$start_time" < "$end_time" ]; then
        # Normal range (e.g., 22:00 to 08:00)
        if [ "$current_time" -ge "$start_time" ] && [ "$current_time" -lt "$end_time" ]; then
            return 0
        fi
    else
        # Overnight range (e.g., 22:00 to 08:00 next day)
        if [ "$current_time" -ge "$start_time" ] || [ "$current_time" -lt "$end_time" ]; then
            return 0
        fi
    fi

    return 1
}

# Check throttle
check_throttle() {
    if [ ! -f "$NOTIFY_CONFIG" ]; then
        return 0
    fi

    local enabled=$(jq -r '.settings.throttle.enabled' "$NOTIFY_CONFIG" 2>/dev/null || echo "false")
    if [ "$enabled" != "true" ]; then
        return 0
    fi

    local cooldown=$(jq -r '.settings.throttle.cooldown_seconds' "$NOTIFY_CONFIG" 2>/dev/null || echo "60")
    local last_notification=$(stat -f%m "$NOTIFY_LOG" 2>/dev/null || stat -c%Y "$NOTIFY_LOG" 2>/dev/null || echo "0")
    local current_time=$(date +%s)

    if [ $((current_time - last_notification)) -lt "$cooldown" ]; then
        return 1
    fi

    return 0
}

# Main notification function
send_notification() {
    local title="$1"
    local message="${2:-}"
    local priority="${3:-info}"
    local sound="${4:-true}"

    init_notify

    # Check quiet hours (skip for urgent)
    if [ "$priority" != "urgent" ] && is_quiet_hours; then
        return 0
    fi

    # Check throttle
    if ! check_throttle; then
        return 0
    fi

    # Send to enabled channels
    if [ -f "$NOTIFY_CONFIG" ]; then
        local local_enabled=$(jq -r '.channels.local.enabled' "$NOTIFY_CONFIG" 2>/dev/null || echo "true")
        local telegram_enabled=$(jq -r '.channels.telegram.enabled' "$NOTIFY_CONFIG" 2>/dev/null || echo "false")
        local mobile_enabled=$(jq -r '.channels.mobile.enabled' "$NOTIFY_CONFIG" 2>/dev/null || echo "false")
    else
        local local_enabled="true"
        local telegram_enabled="false"
        local mobile_enabled="false"
    fi

    if [ "$local_enabled" = "true" ]; then
        send_local "$title" "$message" "$sound"
    fi

    if [ "$telegram_enabled" = "true" ]; then
        send_telegram "$title" "$message"
    fi

    if [ "$mobile_enabled" = "true" ]; then
        send_mobile "$title" "$message"
    fi

    # Log notification
    log_notification "$title" "$message" "$priority"

    # Update log timestamp for throttle
    touch "$NOTIFY_LOG"
}

# Log notification
log_notification() {
    local title="$1"
    local message="$2"
    local priority="${3:-info}"

    mkdir -p "$(dirname "$NOTIFY_LOG")"

    cat >> "$NOTIFY_LOG" << LOG
$(date -u +"%Y-%m-%dT%H:%M:%SZ") | [$priority] $title
  $message
LOG
}

# Show notification history
show_history() {
    local count="${1:-20}"

    if [ ! -f "$NOTIFY_LOG" ]; then
        echo "${YELLOW}No notification history found${NC}"
        return 0
    fi

    echo "${BLUE}Recent notifications (last $count):${NC}"
    tail -n "$count" "$NOTIFY_LOG"
}

# Test notifications
test_notifications() {
    echo "${BLUE}Testing notifications...${NC}"

    echo "  → Local notification"
    send_notification "Blackbox4 Test" "This is a test notification" "info" "true"

    echo "  → Telegram"
    if [ -f "$NOTIFY_CONFIG" ]; then
        local enabled=$(jq -r '.channels.telegram.enabled' "$NOTIFY_CONFIG" 2>/dev/null || echo "false")
        if [ "$enabled" = "true" ]; then
            send_telegram "Blackbox4 Test" "Test notification"
            echo "    Telegram sent"
        else
            echo "    Telegram disabled"
        fi
    fi

    echo "  → Mobile"
    if [ -f "$NOTIFY_CONFIG" ]; then
        local enabled=$(jq -r '.channels.mobile.enabled' "$NOTIFY_CONFIG" 2>/dev/null || echo "false")
        if [ "$enabled" = "true" ]; then
            send_mobile "Blackbox4 Test" "Test notification"
            echo "    Mobile sent"
        else
            echo "    Mobile disabled"
        fi
    fi

    echo "${GREEN}✓ Test complete${NC}"
}

# Configure channel
configure_channel() {
    local channel="$1"
    local setting="$2"
    local value="$3"

    if [ ! -f "$NOTIFY_CONFIG" ]; then
        init_notify
    fi

    if command -v jq >/dev/null 2>&1; then
        jq --arg ch "$channel" --arg key "$setting" --arg val "$value" '
            .channels[$ch][$key] = ($val | if . == "true" or . == "false" then . == "true" else . end)
        ' "$NOTIFY_CONFIG" > "$NOTIFY_CONFIG.tmp"
        mv "$NOTIFY_CONFIG.tmp" "$NOTIFY_CONFIG"
        echo "${GREEN}✓ Set $channel.$setting = $value${NC}"
    fi
}

# Show configuration
show_config() {
    if [ ! -f "$NOTIFY_CONFIG" ]; then
        echo "${YELLOW}No notification configuration found${NC}"
        return 0
    fi

    echo "${BLUE}Notification Configuration:${NC}"

    if command -v jq >/dev/null 2>&1; then
        jq '.' "$NOTIFY_CONFIG"
    fi
}

# Show help
show_help() {
    cat << 'HELP'
Blackbox4 Enhanced Notification System

Multi-channel notifications (local, mobile, Telegram).

Usage:
  notify.sh <command> [options]

Commands:
  init                       Initialize notification system
  send <title> [message]     Send notification
  test                       Test all enabled channels
  history [count]            Show notification history
  config                     Show configuration
  configure <channel>        Configure a channel

Channel Configuration:
  configure local enabled true/false
  configure telegram bot_token <token>
  configure telegram chat_id <id>
  configure mobile topic <topic>

Priority Levels:
  info        Normal notifications (default)
  warning     Warning notifications
  error       Error notifications
  urgent      Urgent notifications (bypasses quiet hours)

Examples:
  # Send notification
  notify.sh send "Task Complete" "Background task finished"

  # Send urgent notification
  notify.sh send "Error" "Build failed" urgent

  # Test notifications
  notify.sh test

  # Enable Telegram
  notify.sh configure telegram enabled true
  notify.sh configure telegram bot_token "YOUR_BOT_TOKEN"
  notify.sh configure telegram chat_id "YOUR_CHAT_ID"

  # Show history
  notify.sh history 50

  # Configure mobile
  notify.sh configure mobile enabled true
  notify.sh configure mobile topic "my_topic"
HELP
}

# Main
case "${1:-send}" in
    init)
        init_notify
        ;;
    send)
        send_notification "${2:-Notification}" "${3:-}" "${4:-info}" "${5:-true}"
        ;;
    test)
        test_notifications
        ;;
    history)
        show_history "${2:-20}"
        ;;
    config)
        show_config
        ;;
    configure)
        if [ -z "${2:-}" ] || [ -z "${3:-}" ] || [ -z "${4:-}" ]; then
            echo "${RED}Error: channel, setting, and value required${NC}"
            exit 1
        fi
        configure_channel "$2" "$3" "$4"
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
