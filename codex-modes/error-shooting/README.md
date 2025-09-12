# Codex Error Shooting Mode

This mode activates a structured diagnose→plan→fix flow when a command/app fails.

## Components
- `error-shooting.md`: Agent instructions (used by Codex profile `error-shooting`).
- `templates/error_report.md`: A short report template for hand-off.
- `../../scripts/codex-run`: Wrapper to run commands and create error bundles.

## Quick Start
1) Alias the wrapper (adjust path if your DEV root is elsewhere):
   - `alias crun="$HOME/DEV/SISO-INTERNAL/scripts/codex-run"`
2) Run your command via the wrapper:
   - `crun npm test` or `crun uv run app.py` or `crun make build`
3) On failure, the wrapper saves a bundle at:
   - `SISO-INTERNAL/.codex-error-sessions/<timestamp>-<cmd>/bundle.json`
   - And updates `SISO-INTERNAL/.codex-error-sessions/latest -> that run`.
4) Start a Codex session with profile `error-shooting` (from your IDE/CLI). The agent will load the bundle and auto-plan the investigation.

## Bundle contents (summary)
- Command argv + string form, cwd, timestamps, exit code
- Tail of stdout/stderr, and paths to full logs
- Git branch/commit and `git status --porcelain` (if in a repo)
- A small env sample (OS, SHELL, NODE_ENV, etc.)

## Notes
- The wrapper never deletes files or mutates your repo.
- If the Codex CLI binary isn’t on PATH, you can still open the profile from your IDE using this instruction file.

