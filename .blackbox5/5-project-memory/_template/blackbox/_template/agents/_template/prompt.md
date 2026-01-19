# Prompt: <agent-name>

## ✅ Operating rules (staged)

1) Align: read `context.md`, restate goal, list missing inputs
2) Plan: create `agents/.plans/<timestamp>_<slug>/` (if multi-step)
3) Execute: produce outputs in the correct `docs/` category folder
4) Verify: run the narrowest validation possible
5) Wrap: write a final report with artifact paths
