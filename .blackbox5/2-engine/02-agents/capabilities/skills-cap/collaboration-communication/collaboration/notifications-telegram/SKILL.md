---
name: notifications-telegram
category: collaboration-communication/collaboration
version: 1.0.0
description: Send lightweight status updates to a human during long-running agent work
author: obra/superpowers
verified: true
tags: [notifications, telegram, progress-tracking, remote-alerts]
---

# Telegram Notifications (Progress + Significant Findings)

<context>
Send lightweight status updates to a human during long-running agent work.

This skill is designed to prevent "silent running" for multi-hour tasks by:
- Pinging on significant discoveries
- Sending periodic progress check-ins

Ideal for long-running research, refactoring, or data processing tasks.
</context>

<instructions>
Configure Telegram bot to send status updates during long-running agent tasks.

Set up bot token and chat ID, then use helper script to send notifications for:
1. Significant findings (event-driven)
2. Progress check-ins (time-driven)

Follow strict security rules for handling bot tokens.
</instructions>

<workflow>
1. Create Telegram bot via @BotFather
2. Get bot token
3. Get chat ID (personal or group)
4. Store credentials in `.local/telegram.md` (gitignored)
5. Use helper script `scripts/notify-telegram.sh` to send updates
6. Send immediate notifications for significant findings
7. Send periodic progress updates every 5-15 minutes
8. Include artifact pointers in all notifications
</workflow>

<rules>
## Security Rules (Non-negotiable)
- **Never** store bot tokens in tracked repo files
- Prefer environment variables at runtime
- If you must write a token to disk temporarily, store it only in gitignored local file like: `.local/telegram.md`
- If a token is pasted into chat or committed anywhere, **revoke it immediately**

## When to Send
- **Significant finding**: Immediate (event-driven)
- **Progress check-in**: Every 5 minutes during active runs (or every 15 minutes during deep focus)

## Required Content
- Title: short + specific
- Signal: why it matters
- Artifact pointer: link/path to where details live
- Next: what the agent will do next
</rules>

<best_practices>
## Notification Triggers

### 1) Significant Finding Ping (Event-driven)
Send when:
- A top-3 idea changes materially (new evidence, feasibility breakthrough)
- A risk is discovered that changes the recommendation
- A decision becomes clear (or a path is blocked)

### 2) Progress Ping (Time-driven)
Default: send every **5 minutes** during active long runs (or every 15 minutes during deep focus):
- What changed since last checkpoint
- What's next (top 3 queue items)
- ETA to next synthesis checkpoint

## Message Format
- **Title**: Short and specific
- **Signal**: Why it matters
- **Artifact pointer**: Link/path to where details live
- **Next**: What the agent will do next
</best_practices>

<examples>
## Message Format

### Example Progress Update
```
[Deep Research] Analyzed 12 candidates, top 3 identified
Changed: Eliminated 4 due to licensing issues
Next: Deep dive on top 3 candidates
ETA: Next checkpoint in 15 min
Artifacts: agents/.plans/2025-01-18_research/rankings.md
```

### Example Significant Finding
```
[Deep Research] Found strong OSS candidate: X
Why: Reduces build time for Y by ~40%
Artifacts: agents/.plans/2025-01-18_research/notes.md#candidate-x
Next: Validate licensing + integration approach
```

## Configuration File (.local/telegram.md)

### Format Option 1
```
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_CHAT_ID=123456789
```

### Format Option 2
```
bot_token: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
chat_id: 123456789
```
</examples>

<integration_notes>
## Inputs
- `TELEGRAM_BOT_TOKEN` (secret; env var)
- `TELEGRAM_CHAT_ID` (destination chat id; env var)

Optional:
- `TELEGRAM_SILENT=1` to send silently (no notification sound)
- `TELEGRAM_CONFIG_MD=/path/to/telegram.md` to override the default config location

## Local Config File (Markdown, Gitignored)
Default path (recommended): `.local/telegram.md`

## Helper Script
Use: `scripts/notify-telegram.sh`

## Getting Started
1. Message @BotFather on Telegram
2. Create new bot with `/newbot`
3. Copy bot token
4. Message your bot to start conversation
5. Call `https://api.telegram.org/bot<TOKEN>/getUpdates` to get chat ID
6. Store both in `.local/telegram.md`

Combine with other notification skills for multi-channel updates.
</integration_notes>

<output_format>
Telegram messages with structure:

**Title**: [Phase] Key finding
**Why**: Why it matters
**Artifacts**: Path to details
**Next**: What agent will do next

Example:
```
[Deep Research] Found strong OSS candidate: X
Why: Reduces build time for Y by ~Z
Artifacts: agents/.plans/2025-12-28_1815_deep-research-x/notes.md
Next: Validate licensing + integration approach
```
</output_format>
