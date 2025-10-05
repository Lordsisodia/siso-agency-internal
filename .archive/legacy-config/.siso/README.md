# .siso / AI Changelog

This directory contains the AI‑maintained changelog for this repo.

Files:
- `AI_CHANGELOG.md`: Human‑readable history grouped by date.
- `ai-changelog.jsonl`: Machine‑readable line‑delimited JSON events.
- `siso-ai-log`: Helper script to append entries reliably.

Quick start:
- Log a change (auto‑detect last commit files):
  ```bash
  .siso/siso-ai-log log "Fix: adjust config loader" --scope api --labels fix,config
  ```
- Include extra details or custom files:
  ```bash
  .siso/siso-ai-log log "Refactor UI state" \
    --details "Moved store; simplified effects." \
    --files src/ui/store.ts src/ui/App.tsx \
    --labels refactor,ui --actor ai --scope ui
  ```

Optional Git hook install (keeps log in sync with commits):
```bash
.siso/siso-ai-log install-hook
```
This adds a `post-commit` hook that prompts the logger with the current commit message and changed files. Remove with `uninstall-hook`.

Notes:
- JSONL is canonical; Markdown is derived for humans.
- Use short, action‑oriented summaries (<= 72 chars).
- Avoid sensitive secrets in details; this log is committed.

