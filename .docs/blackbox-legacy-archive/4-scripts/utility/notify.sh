#!/usr/bin/env bash
set -euo pipefail

# Unified notification system for .blackbox4
# Supports Telegram and local notifications
#
# Usage:
#   notify.sh "message text"
#   notify.sh --silent "message text"
#
# Environment variables:
#   TELEGRAM_BOT_TOKEN   Bot token (secret)
#   TELEGRAM_CHAT_ID     Destination chat id (number or @channelusername)
#   NOTIFY_SILENT=1      Send without notification sound
#
# Local config (gitignored):
#   .blackbox/.local/telegram.md

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

BOX_ROOT="$(find_box_root)"
default_config_md="${BOX_ROOT}/.local/telegram.md"
config_md="${TELEGRAM_CONFIG_MD:-$default_config_md}"

usage() {
  cat <<'EOF' >&2
Usage:
  notify.sh [--silent] [--local] "message text"

Flags:
  --silent    Send without notification sound
  --local     Use local notification only (no Telegram)

Environment variables:
  TELEGRAM_BOT_TOKEN   Bot token (for Telegram notifications)
  TELEGRAM_CHAT_ID     Destination chat id (number or @channelusername)
  NOTIFY_SILENT=1      Send without notification sound

Local config (gitignored):
  .blackbox/.local/telegram.md
    Format: TELEGRAM_BOT_TOKEN=... or bot_token: ...
            TELEGRAM_CHAT_ID=... or chat_id: ...

Examples:
  # Local notification only
  notify.sh --local "UI Cycle complete"

  # Telegram notification
  export TELEGRAM_BOT_TOKEN="***"
  export TELEGRAM_CHAT_ID="123456789"
  notify.sh "UI Cycle deployed successfully"

  # Silent notification
  notify.sh --silent "Background task completed"
EOF
}

silent=false
local_only=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --silent)
      silent=true
      shift
      ;;
    --local)
      local_only=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      break
      ;;
  esac
done

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

text="$*"

# Local notification (always attempted)
send_local_notification() {
  local message="$1"

  # Try different local notification methods
  if command -v terminal-notifier >/dev/null 2>&1; then
    terminal-notifier -title ".blackbox4" -message "$message" 2>/dev/null || true
  elif command -v notify-send >/dev/null 2>&1; then
    notify-send ".blackbox4" "$message" 2>/dev/null || true
  elif command -v osascript >/dev/null 2>&1; then
    # macOS AppleScript
    osascript -e "display notification \"$message\" with title \".blackbox4\"" 2>/dev/null || true
  fi

  # Also log to stderr
  echo "[NOTIFY] $message" >&2
}

# Telegram notification
send_telegram_notification() {
  local message="$1"

  # Read config from local file
  read_config_md() {
    local file="$1"
    [[ -f "$file" ]] || return 0

    # Accept multiple formats
    local token_line chat_line

    token_line="$(grep -nF "TELEGRAM_BOT_TOKEN" "$file" 2>/dev/null | head -n 1 || true)"
    if [[ -z "$token_line" ]]; then
      token_line="$(grep -nF "bot_token" "$file" 2>/dev/null | head -n 1 || true)"
    fi

    chat_line="$(grep -nF "TELEGRAM_CHAT_ID" "$file" 2>/dev/null | head -n 1 || true)"
    if [[ -z "$chat_line" ]]; then
      chat_line="$(grep -nF "chat_id" "$file" 2>/dev/null | head -n 1 || true)"
    fi

    if [[ -n "$token_line" && -z "${TELEGRAM_BOT_TOKEN:-}" ]]; then
      TELEGRAM_BOT_TOKEN="$(echo "$token_line" | sed -E 's/^.*[=:][[:space:]]*//; s/[[:space:]]+$//')"
      export TELEGRAM_BOT_TOKEN
    fi

    if [[ -n "$chat_line" && -z "${TELEGRAM_CHAT_ID:-}" ]]; then
      TELEGRAM_CHAT_ID="$(echo "$chat_line" | sed -E 's/^.*[=:][[:space:]]*//; s/[[:space:]]+$//')"
      export TELEGRAM_CHAT_ID
    fi
  }

  read_config_md "$config_md"

  if [[ -z "${TELEGRAM_BOT_TOKEN:-}" || -z "${TELEGRAM_CHAT_ID:-}" ]]; then
    echo "WARN: Telegram config not found (skipping Telegram)" >&2
    echo "  - Set env vars: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID" >&2
    echo "  - Or create: ${config_md} (gitignored)" >&2
    return 1
  fi

  local disable_notification="false"
  if [[ "$silent" == "true" || "${TELEGRAM_SILENT:-}" == "1" ]]; then
    disable_notification="true"
  fi

  local api="https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage"

  local http_code
  http_code="$(
    curl -sS -o /tmp/telegram_send.json -w "%{http_code}" \
      --data-urlencode "chat_id=${TELEGRAM_CHAT_ID}" \
      --data-urlencode "text=${message}" \
      --data-urlencode "disable_notification=${disable_notification}" \
      "$api" 2>&1
  )"

  if [[ "$http_code" != "200" ]]; then
    echo "WARN: Telegram sendMessage failed (HTTP $http_code)" >&2
    echo "  - Check bot token and chat ID" >&2
    echo "  - Ensure bot can message you (send /start to bot)" >&2
    return 1
  fi

  return 0
}

# Send notifications
send_local_notification "$text"

if [[ "$local_only" != "true" ]]; then
  send_telegram_notification "$text" || true
fi
