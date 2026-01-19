---
name: notifications-local
category: collaboration-communication/collaboration
version: 1.0.0
description: Provide progress updates without external services or API keys
author: obra/superpowers
verified: true
tags: [notifications, local, progress-tracking, no-secrets]
---

# Local Notifications (No Secrets)

<context>
Provide progress updates **without external services or API keys**.

Useful when:
- Telegram/Slack is flaky
- you don't want to deal with secrets
- you're running agents locally for a day
</context>

<instructions>
Use local file-based notifications to track progress and maintain visibility into agent activities without requiring external services or API credentials.

Create always-on outputs inside the plan folder:
- `status.md` - the current state (updated frequently)
- `progress-log.md` - append-only checkpoints

Optionally use desktop notifications via helper script: `scripts/notify-local.sh`
</instructions>

<workflow>
1. Create `status.md` in plan folder with current state
2. Update status every 5-15 minutes with changes and next actions
3. Create `progress-log.md` for append-only checkpoints
4. Append to progress log every 15-60 minutes with meaningful checkpoints
5. Write immediately when "significant finding" changes rankings or direction
6. Optionally trigger desktop notifications for important updates
</workflow>

<rules>
- Never require external services or API keys
- Always update `status.md` every 5-15 minutes (short updates)
- Always append to `progress-log.md` every 15-60 minutes (meaningful checkpoints)
- Write immediately when a "significant finding" changes rankings or direction
- Keep status.md focused on current state and next actions
- Keep progress-log.md as append-only checkpoint history
</rules>

<best_practices>
## Recommended Cadence
- Update `status.md` every **5-15 minutes** (short)
- Append to `progress-log.md` every **15-60 minutes** (more meaningful checkpoint)
- Write immediately when a "significant finding" changes rankings or direction

## status.md Contents (Suggested)
- Current phase (setup/explore/exploit/synthesize)
- What changed since last update
- Next 1-3 actions
- Link/path to the current top artifact (e.g., rankings)
</best_practices>

<examples>
## Example status.md
```markdown
# Status - 2025-01-18 14:30

## Current Phase
Exploit - Validating top 3 candidates

## What Changed (Last 10 min)
- Eliminated candidate #2 (performance concerns)
- Deepened analysis on candidate #1 (promising)
- Found new documentation for candidate #3

## Next Actions
1. Run benchmarks on candidate #1
2. Verify licensing for all remaining candidates
3. Prepare comparison matrix

## Top Artifact
`agents/.plans/2025-01-18_research/rankings.md`
```

## Example progress-log.md
```markdown
# Progress Log

## 14:00 - Research Phase Complete
- Analyzed 15 potential solutions
- Identified top 5 candidates
- Created initial rankings

## 13:00 - Setup Complete
- Configured research environment
- Gathered initial requirements
- Established success criteria
```
</examples>

<integration_notes>
This skill works independently and requires no external dependencies. It can be combined with other notification skills (Telegram, Mobile) for multi-channel updates.

The local notification files serve as both:
1. Real-time progress tracking for monitoring
2. Audit trail of agent activities

Optional desktop notifications require the helper script and may need system permissions.
</integration_notes>

<output_format>
Two markdown files in the plan folder:

1. **status.md** (overwritten frequently)
   - Current phase
   - Recent changes
   - Next actions
   - Artifact links

2. **progress-log.md** (append-only)
   - Timestamped checkpoints
   - Significant milestones
   - Phase transitions
   - Key findings
</output_format>
