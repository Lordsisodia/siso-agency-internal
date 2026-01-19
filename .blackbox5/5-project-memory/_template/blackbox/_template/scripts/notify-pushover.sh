#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF' >&2
Usage:
  notify-pushover.sh "message"

Config (env OR gitignored markdown):
  PUSHOVER_APP_TOKEN / app_token
  PUSHOVER_USER_KEY  / user_key

Optional:
  PUSHOVER_TITLE     (default: "Lumelle Agent")
  PUSHOVER_URL
  PUSHOVER_URL_TITLE

Markdown config path (gitignored):
  .blackbox/.local/pushover.md

Example config file:
  app_token: ***
  user_key: ***
EOF
}

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
box_dir="$(cd "${script_dir}/.." && pwd)"
config_md="${PUSHOVER_CONFIG_MD:-${box_dir}/.local/pushover.md}"

read_kv() {
  local key="$1"
  local file="$2"
  grep -E "^(${key})[=:]" "$file" 2>/dev/null | head -n 1 | sed -E 's/^.*[=:][[:space:]]*//; s/[[:space:]]+$//'
}

if [[ -f "$config_md" ]]; then
  : "${PUSHOVER_APP_TOKEN:=$(read_kv 'PUSHOVER_APP_TOKEN|app_token' "$config_md")}"
  : "${PUSHOVER_USER_KEY:=$(read_kv 'PUSHOVER_USER_KEY|user_key' "$config_md")}"
fi

if [[ -z "${PUSHOVER_APP_TOKEN:-}" || -z "${PUSHOVER_USER_KEY:-}" ]]; then
  echo "Missing Pushover config. Set env vars or create $config_md" >&2
  exit 1
fi

title="${PUSHOVER_TITLE:-Lumelle Agent}"
message="$*"

# Pushover message API: https://api.pushover.net/1/messages.json
api="https://api.pushover.net/1/messages.json"

http_code="$(
  curl -sS -o /tmp/pushover_send.json -w "%{http_code}" \
    --form-string "token=${PUSHOVER_APP_TOKEN}" \
    --form-string "user=${PUSHOVER_USER_KEY}" \
    --form-string "title=${title}" \
    --form-string "message=${message}" \
    ${PUSHOVER_URL:+--form-string "url=${PUSHOVER_URL}"} \
    ${PUSHOVER_URL_TITLE:+--form-string "url_title=${PUSHOVER_URL_TITLE}"} \
    "$api" || true
)"

if [[ "$http_code" != "200" ]]; then
  echo "Pushover send failed (HTTP $http_code)." >&2
  echo "Response (redacted):" >&2
  sed -E 's/[A-Za-z0-9]{20,}/***REDACTED***/g' /tmp/pushover_send.json >&2 || true
  exit 1
fi
