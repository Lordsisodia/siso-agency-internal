#!/usr/bin/env bash
set -euo pipefail

# Bootstraps TELEGRAM_CHAT_ID by reading bot token from a local markdown config
# and inspecting the latest Telegram updates.
#
# This avoids putting the token on the command line or into tracked files.

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
box_dir="$(cd "${script_dir}/.." && pwd)"
config_md="${TELEGRAM_CONFIG_MD:-${box_dir}/.local/telegram.md}"

if [[ ! -f "$config_md" ]]; then
  cat <<EOF >&2
Missing config: $config_md

Create it (gitignored) with at least a bot token:

  mkdir -p ${box_dir}/.local
  cat > ${box_dir}/.local/telegram.md <<'EOT'
  bot_token: ***
  EOT
EOF
  exit 1
fi

bot_token="$(
  grep -E '^(TELEGRAM_BOT_TOKEN|bot_token)[=:]' "$config_md" \
    | head -n 1 \
    | sed -E 's/^.*[=:][[:space:]]*//; s/[[:space:]]+$//'
)"

if [[ -z "$bot_token" ]]; then
  echo "Could not find bot token in $config_md (expected bot_token: ...)" >&2
  exit 1
fi

api_base="https://api.telegram.org/bot${bot_token}"

# Validate token early for clearer errors than a raw 404.
http_code="$(curl -sS -o /tmp/telegram_getme.json -w "%{http_code}" "${api_base}/getMe" || true)"
if [[ "$http_code" != "200" ]]; then
  echo "Telegram getMe failed (HTTP $http_code)." >&2
  echo "Most common causes:" >&2
  echo "- token is invalid / revoked" >&2
  echo "- you pasted the wrong token (e.g. from a different bot)" >&2
  echo "" >&2
  echo "Fix: update $config_md with the new token from BotFather, then retry." >&2
  exit 1
fi

updates="$(curl -sS --fail "${api_base}/getUpdates")"

chat_id="$(
  python3 - <<'PY'
import json, os, sys
data = json.loads(sys.stdin.read())
results = data.get("result", [])
chat_ids = []
for r in results:
  msg = r.get("message") or r.get("edited_message") or r.get("channel_post") or r.get("edited_channel_post")
  if not msg:
    continue
  chat = msg.get("chat") or {}
  cid = chat.get("id")
  if cid is not None:
    chat_ids.append(cid)
if not chat_ids:
  print("")
  sys.exit(0)
print(chat_ids[-1])
PY
  <<<"$updates"
)"

if [[ -z "$chat_id" ]]; then
  echo "No chat_id found in getUpdates output." >&2
  echo "Send the bot a message in Telegram and try again." >&2
  exit 1
fi

if ! grep -Eq '^(TELEGRAM_CHAT_ID|chat_id)[=:]' "$config_md"; then
  {
    echo ""
    echo "chat_id: ${chat_id}"
  } >>"$config_md"
  echo "Wrote chat_id to: $config_md"
else
  echo "Found existing chat_id in: $config_md"
fi

echo "TELEGRAM_CHAT_ID=${chat_id}"
