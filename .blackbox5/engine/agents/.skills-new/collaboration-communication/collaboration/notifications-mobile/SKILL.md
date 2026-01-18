---
name: notifications-mobile
category: collaboration-communication/collaboration
version: 1.0.0
description: Get agent progress updates on iPhone while away from laptop
author: obra/superpowers
verified: true
tags: [notifications, mobile, iphone, pushover, pushcut, ios]
---

# Mobile Notifications (iPhone, External)

<context>
Get agent progress updates on your **iPhone** while you're away from your laptop.

This skill is "pluggable": pick one provider and wire the agent to call the corresponding script.

**Providers (recommended)**:
- **Option A - Pushover**: Simple, reliable HTTPS API for push notifications
- **Option B - Pushcut**: iOS automation + notifications with webhook support
</context>

<instructions>
Configure mobile push notifications to receive agent progress updates on iPhone.

Select a provider (Pushover or Pushcut), configure required scripts, and establish a notification policy that provides useful updates without spam.

Follow strict security rules for handling API tokens and keys.
</instructions>

<workflow>
1. Choose notification provider (Pushover or Pushcut)
2. Install required helper script from `scripts/` directory
3. Configure API tokens/keys (NEVER commit to tracked repo)
4. Store secrets only in `.local/*.md` (gitignored)
5. Set up notification policy (timing and content)
6. Test notification delivery
7. Monitor and adjust frequency as needed
</workflow>

<rules>
## Security Rules (Non-negotiable)
- Never commit tokens/keys to tracked repo files
- Store secrets only in `.local/*.md` (gitignored)
- Rotate/revoke keys if pasted into chat logs or committed anywhere
- Use environment variables at runtime when possible
- Never share tokens in unencrypted communications

## Notification Policy
- Routine progress: every **5-15 minutes** (short)
- Significant findings: immediate (always include artifact pointer)
- Always include: plan folder path + next action
</rules>

<best_practices>
## Provider Selection

**Pushover** - Best when you want:
- "Just push alerts"
- Minimal iOS setup
- Simple, reliable HTTPS API
- No automation features needed

**Pushcut** - Best when you want:
- Push + optional actions/shortcuts
- iOS automation integration
- Dynamic notification content via JSON
- Advanced scheduling and workflows

## Effective Notifications
- Keep messages concise (under 500 characters)
- Always include context (what agent is working on)
- Include next action (what happens next)
- Add artifact pointers (where to find details)
- Use clear, specific titles
</best_practices>

<examples>
## Pushover Notification
```bash
# Via helper script
scripts/notify-pushover.sh "Research phase complete" "Analyzed 15 solutions, identified top 3. Next: Deep dive on candidates. agents/.plans/2025-01-18_research/"
```

## Pushcut Notification
```bash
# Via helper script
scripts/notify-pushcut.sh "Found promising candidate" "Candidate #5 shows 40% performance improvement. artifacts/rankings.md#candidate-5"
```

## Minimal Notification Format
```
Title: [Phase] Key finding
Why: Why it matters
Artifacts: Path to details
Next: What agent will do next
```
</examples>

<integration_notes>
## Tooling
- Local (no keys): `scripts/notify-local.sh`
- Pushover: `scripts/notify-pushover.sh`
- Pushcut: `scripts/notify-pushcut.sh`

## Provider Setup

### Pushover Setup
1. Create account at pushover.net
2. Register application
3. Get API token
4. Store in `.local/pushover.md`:
   ```
   PUSHOVER_TOKEN=your_token
   PUSHOVER_USER=your_user_key
   ```

### Pushcut Setup
1. Install Pushcut app on iOS
2. Create notification action
3. Get webhook URL
4. Store in `.local/pushcut.md`:
   ```
   PUSHCUT_WEBHOOK_URL=https://api.pushcut.io/...
   ```

Combine with other notification skills for multi-channel updates.
</integration_notes>

<output_format>
Push notifications to iPhone with:
- Title (short, specific)
- Body (what happened and why it matters)
- Artifact pointer (where to find details)
- Next action (what happens next)

Example notification:
```
[Deep Research] Found strong OSS candidate: X
Why: reduces build time for Y by ~Z%
Artifacts: agents/.plans/2025-01-18_research/notes.md
Next: validate licensing + integration approach
```
</output_format>
