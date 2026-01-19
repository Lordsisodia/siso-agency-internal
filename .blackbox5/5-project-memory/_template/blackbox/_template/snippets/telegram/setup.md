# Telegram Bot Setup

Security:
- Never commit tokens
- Use env vars or a local gitignored markdown config at `.blackbox/.local/telegram.md`

Get updates (after messaging the bot once):

```bash
export TELEGRAM_BOT_TOKEN="***"
curl -sS "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates"
```
