---
id: ISSUE-YYYYMMDD-0001
title: "<short, specific title>"
status: inbox
domain: "<supabase|auth|ui|integrations|build|mobile|tauri|other>"
priority: "<p0|p1|p2|p3>"
owner: "<agent_or_human>"
created_at: "<YYYY-MM-DD>"
updated_at: "<YYYY-MM-DD>"
---

# Summary

One paragraph describing the user-visible problem and why it matters.

## Symptoms / Evidence

- What the user sees:
- Where it happens (route/page/feature):
- Any logs / screenshots / repro videos:

## Scope

- In scope:
- Out of scope:

## Acceptance Criteria (Must Be Verifiable)

- [ ] <criterion 1>
- [ ] <criterion 2>
- [ ] <criterion 3>

## Research Notes (Grounded in Code)

- Entry points:
  - `src/...`
- Suspected root cause:
- Related prior code / patterns:
- If DB-related: tables, constraints, policies, edge functions involved

---

# Classification (Stage 2a)

## Problem Type

- Category: `bug | feature | integration | refactor | tech_debt | performance | security`
- Risk: `low | medium | high`
- Blast radius: `local | cross-cutting`
- Test impact: `none | unit | integration | e2e`

## Three Solution Options (Code-Realistic)

### Option A — Minimal Patch

- What changes:
- Pros:
- Cons / risks:
- Estimated effort:

### Option B — Pattern-Consistent Refactor

- What changes:
- Pros:
- Cons / risks:
- Estimated effort:

### Option C — Alternative Approach

- What changes:
- Pros:
- Cons / risks:
- Estimated effort:

---

# Selection (Stage 2b)

## Chosen Option

Chosen: `A | B | C`

## Decision Reasoning

- Why this option fits current architecture:
- Why not the others:
- Edge cases:

---

# Implementation Plan (Stage 3)

## Preflight Checklist

- [ ] Identify exact files to touch
- [ ] Identify required Supabase / API changes (if any)
- [ ] Identify tests to add/update
- [ ] Identify migration/rollback plan (if DB-related)

## Steps (Ordered, Executable)

1. …
2. …
3. …

## Tests / Verification Commands

- Unit:
  - `npm test` (or `npm run test`)
- Typecheck:
  - `npm run typecheck`
- E2E (if applicable):
  - `npx playwright test`

## Rollback / Safety

- How to revert quickly if something breaks:

---

# Implementation Log (Filled by Executor)

- Date:
- What changed:
- Files changed:
- Notes:

---

# Verification (Stage 4)

## Verification Checklist

- [ ] Acceptance criteria met
- [ ] No regressions observed in adjacent flows
- [ ] Tests passing (or justified exceptions)
- [ ] If DB change: RLS/policies reviewed and validated

## Reviewer Notes

- Findings:
- Follow-ups:

