---
status: draft
last_reviewed: 2025-12-28
owner: agent-zero
---

# Open Questions (Decision Log)

Purpose: turn uncertainty into **clear decisions** the team can answer quickly.

Rule: every item is written as a decision with options + recommendation + evidence.

## Decision template (copy/paste per decision)

```md
## <Decision title>

- Decision:
- Why it matters:
- Options:
  1) Option A — pros/cons (1 line)
  2) Option B — pros/cons (1 line)
  3) Option C (optional) — pros/cons (1 line)
- Recommendation: Option <A/B/C> because <1–2 reasons>
- Evidence:
  - <path/to/artifact.md>
  - <link>
- Next step after decision:
```

## Licensing policy (OSS)

- Decision: how do we treat copyleft / fair-code / unknown licenses?
- Why it matters: determines which repos we can integrate vs only use as inspiration.
- Options:
  1) Flag — include but clearly label; require review for copyleft/fair-code/unknown
  2) Exclude — skip copyleft/fair-code entirely; only permissive licenses allowed
  3) Hybrid — allow copyleft only as a separate service boundary (no embedding)
- Recommendation: Flag (default) until we formalize legal policy.
- Evidence:
  - `artifacts/oss-ranked.md`
  - `artifacts/sources.md`
- Next step after decision: regenerate shortlist + deepening queue using the chosen policy.

## “Low-cost” hosting baseline

- Decision: what counts as “low-cost” for self-hosted OSS during MVP?
- Why it matters: affects which tools are realistic (some need heavy infra).
- Options:
  1) Cheapest viable — single small VM + managed DB
  2) Managed-first — prefer managed providers; avoid running heavy stacks ourselves
  3) Flexible — allow heavier infra for high leverage only
- Recommendation: Cheapest viable (start strict, relax only with clear ROI).
- Evidence:
  - `artifacts/build-vs-buy.md` (from step 04)
- Next step after decision: tag “heavy to self-host” candidates and deprioritize if needed.

## Primary target persona (tie-breaker)

- Decision: which persona wins when priorities conflict?
- Why it matters: changes ranking for features/workflows.
- Options:
  1) Merchant admin users (ops/content/merchandising)
  2) Internal ops team (support/fulfillment/client success)
  3) Split — build primitives that serve both first (RBAC, audit logs, workflows)
- Recommendation: Split primitives first; then bias toward Merchant admin.
- Evidence:
  - `artifacts/features-ranked.md`
- Next step after decision: rerank top 10 features using the persona priority.
