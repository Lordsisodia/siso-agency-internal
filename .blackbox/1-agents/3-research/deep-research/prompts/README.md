# Deep Research Prompt Library

This folder contains:
- `context-pack.md` — shared context for deep/long research runs
- `library/` — reusable Deep Research prompt packs (topic-specific)

## Usage

1) Read (or copy/paste) the shared context pack:
   - `docs/.blackbox/agents/deep-research/prompts/context-pack.md`
2) Pick a prompt pack from:
   - `docs/.blackbox/agents/deep-research/prompts/library/`
3) Paste it into the Deep Research run (or adapt it).
3) Start a run folder:

```bash
./.blackbox/scripts/new-run.sh deep-research "<topic>" \
  --prompt .blackbox/agents/deep-research/prompts/library/<pick-one>.md
```

## Conventions
- Keep filenames ordered (optional): `01-...`, `02-...`, …
- Keep titles explicit (topic + desired deliverable).
- If multiple prompts share a large context pack, extract a single shared `context-pack.md` and reference it (to avoid duplication).
