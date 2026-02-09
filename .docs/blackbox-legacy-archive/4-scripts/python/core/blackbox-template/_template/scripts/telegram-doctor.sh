#!/usr/bin/env bash
set -euo pipefail

# One-shot helper:
# - validates bot token via getMe
# - bootstraps chat id from getUpdates
# - sends a test message
#
# Reads token/chat_id from:
# - env vars, or
# - `.blackbox/.local/telegram.md` (gitignored)

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "1/3 Validating bot token..."
"${script_dir}/telegram-bootstrap.sh" >/dev/null

echo "2/3 Bootstrapped TELEGRAM_CHAT_ID (or already present)."

echo "3/3 Sending test message..."
"${script_dir}/notify-telegram.sh" "[Test] Telegram notifications are working ✅"

echo "Done."

