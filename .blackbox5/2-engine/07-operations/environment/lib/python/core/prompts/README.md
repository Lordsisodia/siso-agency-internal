# 🧠 Prompt Packs (`docs/.blackbox/.prompts/`)

This folder contains **prompt packs**: reusable, staged instructions agents can run for long work.

## ✅ Conventions

- Each prompt pack is a single `.md` file.
- Prompt packs should define:
  - goal
  - required outputs (files + paths)
  - staged workflow
  - stop conditions
  - checkpoint communication format

## 🗣️ Agent communication templates (recommended)

For anything an agent “says” (chat/Slack/voice), use:

- `docs/07-templates/agent-comms/read-aloud-status-update.md`
- `docs/07-templates/agent-comms/decision-request.md`
- `docs/07-templates/agent-comms/end-of-run-summary.md`

## Files

- `feature-research-orchestrator.md` — Agent Zero orchestrator for the 4-agent run
- `oss-competitors-step-01-needs-map.md` — Agent 1: feature hunt + OSS harvest
- `oss-competitors-step-02-competitors-core.md` — Agent 2: core competitor sweep (expanded, structured)
- `oss-competitors-step-03-competitors-adjacent.md` — Agent 3: adjacent competitor sweep (expanded, structured)
- `oss-competitors-step-04-oss-harvesting.md` — Agent 4: OSS harvesting (expanded, structured)
- `blocks-kit-v1-mini-poc.md` — Contracts-first POC pack (blog + marketing + storefront blocks)
- `oss-discovery-agent-cycle.md` — Long-form runbook prompt for the OSS discovery agent
- `oss-discovery-loop-pack.md` — Pasteable prompts for repeated OSS discovery/curation loops

## Folders

- Keep this folder **flat** (no subfolders) when possible.
- Deep Research prompt library lives under:
  - `docs/.blackbox/agents/deep-research/prompts/`

## Notes
- Keep prompt packs here (inputs), and save outputs in `.blackbox/agents/.plans/<run>/artifacts/`.
