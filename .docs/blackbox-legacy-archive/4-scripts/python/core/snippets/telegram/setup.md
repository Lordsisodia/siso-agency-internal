# Telegram Bot Setup (for agent notifications)

## Security
- Never commit bot tokens or paste them into tracked repo files.
- If you want a “just a markdown file” workflow, use a gitignored local file: `docs/.blackbox/.local/telegram.md`
- If a token is exposed anywhere, revoke/regenerate it immediately.

## 1) Get your chat id

1) Open Telegram and send a message to your bot (e.g., “hello”).
2) Fetch updates from the Bot API:

```bash
export TELEGRAM_BOT_TOKEN="***"
curl -sS "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates"
```

3) Find `"chat":{"id": ... }` in the response. That number is your `TELEGRAM_CHAT_ID`.

## 2) Set env vars and send a test ping

```bash
export TELEGRAM_BOT_TOKEN="***"
export TELEGRAM_CHAT_ID="123456789"
./.blackbox/scripts/notify-telegram.sh "[Agent] Test ping"
```

## 2b) Alternative: local markdown config (no `.env` file)

Create (gitignored):

```bash
mkdir -p ./.blackbox/.local
cat > ./.blackbox/.local/telegram.md <<'EOF'
bot_token: ***
chat_id: 123456789
EOF
```

Then send a ping (script auto-reads this file):

```bash
./.blackbox/scripts/notify-telegram.sh "[Agent] Test ping (from .local markdown)"
```

## 2c) Auto-detect your chat id (recommended)

After you have messaged the bot at least once:

```bash
./.blackbox/scripts/telegram-bootstrap.sh
```

This will write `chat_id: ...` into `./.blackbox/.local/telegram.md` if it’s missing.

## 3) Optional: send silent updates

```bash
export TELEGRAM_SILENT=1
./.blackbox/scripts/notify-telegram.sh "[Agent] silent ping"
```
