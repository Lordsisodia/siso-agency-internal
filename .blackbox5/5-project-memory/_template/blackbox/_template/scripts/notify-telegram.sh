#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF' >&2
Usage:
  notify-telegram.sh "message text"

Required env vars:
  TELEGRAM_BOT_TOKEN   Bot token (secret)
  TELEGRAM_CHAT_ID     Destination chat id (number or @channelusername)

Optional local config (markdown, gitignored):
  .blackbox/.local/telegram.md

Optional env vars:
  TELEGRAM_SILENT=1    Send without notification sound
  TELEGRAM_PARSE_MODE  "MarkdownV2" | "HTML" | "Markdown" (default: none)
  TELEGRAM_CONFIG_MD   Override path to markdown config file

Example:
  export TELEGRAM_BOT_TOKEN="***"
  export TELEGRAM_CHAT_ID="123456789"
  ./.blackbox/4-scripts/notify-telegram.sh "[Deep Research] Checkpoint: narrowed to top 3 ideas"
EOF
}

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
box_dir="$(cd "${script_dir}/.." && pwd)"
default_config_md="${box_dir}/.local/telegram.md"
config_md="${TELEGRAM_CONFIG_MD:-$default_config_md}"

read_config_md() {
  local file="$1"
  [[ -f "$file" ]] || return 0

  # Accept any of these formats (first match wins):
  # - TELEGRAM_BOT_TOKEN=...
  # - TELEGRAM_BOT_TOKEN: ...
  # - bot_token: ...
  # Same for chat id.
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
  echo "Missing Telegram config." >&2
  echo "- Provide env vars: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID" >&2
  echo "- Or create: ${config_md} (gitignored)" >&2
  exit 1
fi

text="$*"

disable_notification="false"
if [[ "${TELEGRAM_SILENT:-}" == "1" ]]; then
  disable_notification="true"
fi

api="https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage"

http_code="$(
  curl -sS -o /tmp/telegram_send.json -w "%{http_code}" \
    --data-urlencode "chat_id=${TELEGRAM_CHAT_ID}" \
    --data-urlencode "text=${text}" \
    --data-urlencode "disable_notification=${disable_notification}" \
    ${TELEGRAM_PARSE_MODE:+--data-urlencode "parse_mode=${TELEGRAM_PARSE_MODE}"} \
    "$api" || true
)"

if [[ "$http_code" != "200" ]]; then
  echo "Telegram sendMessage failed (HTTP $http_code)." >&2
  echo "Common causes:" >&2
  echo "- invalid/revoked bot token" >&2
  echo "- wrong chat id (message the bot once, then run telegram-bootstrap.sh)" >&2
  echo "- bot cannot message you until you start the chat (send /start)" >&2
  exit 1
fi
