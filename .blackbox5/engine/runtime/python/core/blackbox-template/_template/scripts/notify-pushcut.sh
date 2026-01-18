#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF' >&2
Usage:
  notify-pushcut.sh "message"

Config (env OR gitignored markdown):
  PUSHCUT_SECRET / secret
  PUSHCUT_NOTIFICATION / notification

Optional:
  PUSHCUT_TITLE (default: "Lumelle Agent")

Markdown config path (gitignored):
  .blackbox/.local/pushcut.md

Config file example:
  secret: <your-pushcut-webhook-secret>
  notification: deep-research

Reference:
  Webhook URL format:
    https://api.pushcut.io/[secret]/notifications/[notification-name-or-reference-id]
EOF
}

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
box_dir="$(cd "${script_dir}/.." && pwd)"
config_md="${PUSHCUT_CONFIG_MD:-${box_dir}/.local/pushcut.md}"

read_kv() {
  local key="$1"
  local file="$2"
  grep -E "^(${key})[=:]" "$file" 2>/dev/null | head -n 1 | sed -E 's/^.*[=:][[:space:]]*//; s/[[:space:]]+$//'
}

if [[ -f "$config_md" ]]; then
  : "${PUSHCUT_SECRET:=$(read_kv 'PUSHCUT_SECRET|secret' "$config_md")}"
  : "${PUSHCUT_NOTIFICATION:=$(read_kv 'PUSHCUT_NOTIFICATION|notification' "$config_md")}"
fi

if [[ -z "${PUSHCUT_SECRET:-}" || -z "${PUSHCUT_NOTIFICATION:-}" ]]; then
  echo "Missing Pushcut config. Set env vars or create $config_md" >&2
  exit 1
fi

title="${PUSHCUT_TITLE:-Lumelle Agent}"
text="$*"

url="https://api.pushcut.io/${PUSHCUT_SECRET}/notifications/${PUSHCUT_NOTIFICATION}"

# Pushcut supports POST/GET webhook triggers; JSON body can adjust notification content.
payload="$(python3 - <<PY
import json
print(json.dumps({"title": "$title", "text": "$text"}))
PY
)"

http_code="$(
  curl -sS -o /tmp/pushcut_send.json -w "%{http_code}" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    "$url" || true
)"

if [[ "$http_code" != "200" ]]; then
  echo "Pushcut notify failed (HTTP $http_code)." >&2
  echo "If this is 404, check secret/notification id in Pushcut." >&2
  exit 1
fi
