# Skill: Local Notifications (No Secrets)

## Purpose
Provide progress updates **without external services or API keys**.

Useful when:
- Telegram/Slack is flaky
- you don’t want to deal with secrets
- you’re running agents locally for a day

## Outputs (always-on)
Inside the plan folder:
- `status.md` — the current state (updated frequently)
- `progress-log.md` — append-only checkpoints

## Optional (desktop notification)
Use the helper script:
- `scripts/notify-local.sh`

## Recommended cadence
- Update `status.md` every **5–15 minutes** (short).
- Append to `progress-log.md` every **15–60 minutes** (more meaningful checkpoint).
- Write immediately when a “significant finding” changes rankings or direction.

## `status.md` contents (suggested)
- Current phase (setup/explore/exploit/synthesize)
- What changed since last update
- Next 1–3 actions
- Link/path to the current top artifact (e.g., rankings)

