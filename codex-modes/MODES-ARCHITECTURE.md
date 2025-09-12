# Codex Modes Architecture

This repository standardizes how we build plug‑in modes for Codex CLI.

## Core Conventions
- Each mode lives in `SISO-INTERNAL/codex-modes/<mode>/` with an instructions file `<mode>.md`.
- Each mode has an optional helper script in `SISO-INTERNAL/scripts/codex-<mode>` that captures inputs and writes a JSON bundle.
- Bundles live under `SISO-INTERNAL/.codex-<mode>/` with a `latest` symlink.
- The agent loads a bundle from `$CODEX_<MODE>_BUNDLE` or the `latest/bundle.json` fallback.
- Every mode defines a minimal JSON shape (`schema` string and fields); keep it backward compatible.

## Recommended Files per Mode
- `README.md` (purpose, quick start)
- `<mode>.md` (agent operating guide; used by profile `experimental_instructions_file`)
- `templates/` (briefs, reports)
- Optional `collectors/` (language‑specific log parsers)

## JSON Bundle Skeleton
```json
{
  "schema": "codex.<mode>-bundle/v1",
  "created_at": "ISO-8601",
  "cwd": "/abs/path",
  "inputs": { "...": "..." },
  "context": { "git": {"branch": "...", "commit": "..."} }
}
```

## Profile Wiring
Add a profile in `~/.codex/config.toml` that points `experimental_instructions_file` to the mode’s `.md` file. Keep `model_max_output_tokens` and `approval_policy` per mode needs.

## Mode Lifecycle (recommended)
1) Capture inputs to a bundle (`codex-<mode>` helper).
2) Start Codex with the profile for that mode.
3) Mode boot sequence: Load bundle → Summarize → `update_plan` → Execute grouped actions with short preambles.
4) Deliverables: concise, structured outputs with links to sources/bundles.

