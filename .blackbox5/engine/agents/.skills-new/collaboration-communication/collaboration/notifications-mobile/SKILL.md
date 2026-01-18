# Skill: Mobile Notifications (iPhone, External)

## Purpose
Get agent progress updates on your **iPhone** while you’re away from your laptop.

This skill is “pluggable”: pick one provider and wire the agent to call the corresponding script.

## Providers (recommended)

### Option A — Pushover (simple, reliable)
- Send push notifications via a straightforward HTTPS API.
- Best when you want: “just push alerts”, minimal iOS setup.

### Option B — Pushcut (iOS automation + notifications)
- Trigger Pushcut notifications via a webhook URL (POST/GET).
- Supports dynamic notification content via JSON (depending on your Pushcut setup/plan).
- Best when you want: push + optional actions/shortcuts.

## Security rules (non-negotiable)
- Never commit tokens/keys to tracked repo files.
- If you want “just markdown files” (no `.env`), store secrets only in:
  - `.local/*.md` (gitignored)
- Rotate/revoke keys if they are pasted into chat logs or committed anywhere.

## Recommended notification policy (so it’s useful, not spam)
- Routine progress: every **5–15 minutes** (short)
- Significant findings: immediate (always include artifact pointer)
- Always include: plan folder path + next action

## Tooling
- Local (no keys): `scripts/notify-local.sh`
- Pushover: `scripts/notify-pushover.sh`
- Pushcut: `scripts/notify-pushcut.sh`
