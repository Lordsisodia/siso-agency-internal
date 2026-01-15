# Prompt Packs (`.blackbox/.prompts/`)

This folder contains **prompt packs**: reusable, staged instructions agents can run for long work.

Conventions:
- Keep prompts as markdown (`.md`).
- Group by purpose in subfolders (recommended), e.g.:
  - `deepresearch/`
  - `triage/`

Inputs vs outputs:
- Prompt packs live here (inputs).
- Outputs should be written into `.blackbox/agents/.plans/<run>/artifacts/`.

