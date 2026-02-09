# Skill: Telegram Notifications (Progress + Significant Findings)

## Purpose
Send lightweight status updates to a human during long-running agent work.

This skill is designed to prevent “silent running” for multi-hour tasks by:
- pinging on significant discoveries
- sending periodic progress check-ins

## Security rules (non-negotiable)
- **Never** store bot tokens in tracked repo files.
- Prefer environment variables at runtime.
- If you must write a token to disk temporarily, store it only in a gitignored local file like: `.local/telegram.md`
- If a token is pasted into chat or committed anywhere, **revoke it immediately**.

## Inputs
- `TELEGRAM_BOT_TOKEN` (secret; env var)
- `TELEGRAM_CHAT_ID` (destination chat id; env var)

Optional:
- `TELEGRAM_SILENT=1` to send silently (no notification sound)
- `TELEGRAM_CONFIG_MD=/path/to/telegram.md` to override the default config location

## Local config file (markdown, gitignored)

Default path (recommended):
- `.local/telegram.md`

Accepted formats (pick one):

```text
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

or:

```text
bot_token: ...
chat_id: ...
```

## When to send
### 1) Significant finding ping (event-driven)
Send when:
- a top-3 idea changes materially (new evidence, feasibility breakthrough)
- a risk is discovered that changes the recommendation
- a decision becomes clear (or a path is blocked)

### 2) Progress ping (time-driven)
Default: send every **5 minutes** during active long runs (or every 15 minutes during deep focus):
- what changed since last checkpoint
- what’s next (top 3 queue items)
- ETA to next synthesis checkpoint

## Message format (recommended)
- **Title**: short + specific
- **Signal**: why it matters
- **Artifact pointer**: link/path to where details live
- **Next**: what the agent will do next

Example:
```text
[Deep Research] Found strong OSS candidate: X
Why: reduces build time for Y by ~Z
Artifacts: agents/.plans/2025-12-28_1815_deep-research-x/notes.md
Next: validate licensing + integration approach
```

## Tooling (local helper)
Use the helper script:
- `scripts/notify-telegram.sh`
