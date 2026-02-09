# Deep Research Prompt 04 — Workflow engines & automation (Shopify Flow vs iPaaS vs OSS orchestration)

## CONTEXT

Use the shared Deep Research Context Pack (copy/paste into your run as needed):
- `context-pack.md`

## PROMPT

TASK:
We differentiate on “AI-driven workflows embedded in product”. Research and compare workflow execution approaches:

A) Native Shopify automation (Shopify Flow, etc.)
B) iPaaS automation (Zapier, Make, Workato, Tray, etc.)
C) OSS/dev-grade orchestration (n8n, Temporal, Kestra, Windmill, etc.)

For each, extract:
- Trigger/action depth for Shopify
- Human-in-the-loop approvals support
- Reliability primitives (retries, idempotency, durable state)
- Observability (run logs, replay/simulate)
- Embedding/white-label feasibility
- Licensing risks and constraints
- Total operational burden

Then propose:
- A recommended execution layer for a SaaS-shaped product delivered as repeatable custom builds.
- A “workflow product requirements doc” (must-have features, nice-to-have, constraints).

OUTPUT REQUIREMENTS:
- A scorecard table (0–5) across the criteria with citations.
- A clear recommendation: “Use X as core” or “Build minimal engine + use Y”.
