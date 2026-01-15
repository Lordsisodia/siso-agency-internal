---
id: ISSUE-20260105-0014
title: "AI calorie tracker: restore working model + API key path"
status: inbox
domain: "integrations"
priority: "p1"
owner: "unassigned"
created_at: "2026-01-05"
updated_at: "2026-01-05"
---

# Summary

The AI calorie/macro tracker (photo nutrition / nutrition AI) needs to work again with a working API key + model choice (user suggests GPT-5 nano or similar). Without this, nutrition tracking breaks and XP/insights become less meaningful.

## Symptoms / Evidence

- What the user sees: AI calorie tracker doesn’t work (likely failing due to missing/invalid API key or model config).
- Where it happens: Health / nutrition tracking flows.
- Source: `docs/knowledge/feedback/4-1-26/Daily View Feedback.md`

## Scope

- In scope: fix the API invocation path, model config, and error UX.
- Out of scope: building a full nutrition database.

## Acceptance Criteria (Must Be Verifiable)

- [ ] Uploading a food photo produces a macro estimate (calories + macros) reliably when online.
- [ ] If the API key is missing/invalid, UI shows a clear actionable error (not silent failure).
- [ ] Result persists into daily nutrition totals and contributes to XP calculations.

## Research Notes (Grounded in Code)

- Entry points:
  - `src/domains/lifelock/1-daily/5-wellness/features/photo-nutrition/services/visionApi.service.ts`
  - `src/domains/lifelock/1-daily/5-wellness/features/photo-nutrition/components/PhotoNutritionTracker.tsx`
  - `src/domains/lifelock/1-daily/5-wellness/ui/pages/HealthNonNegotiablesSection.tsx`
- Suspected root cause: model/key config drift (env var, endpoint, or model name) leading to runtime failure.

---

# Implementation Plan (Stage 3) — Seed

## Steps (Ordered, Executable)

1. Trace the vision API request path and confirm required env vars exist in `.env` + Vite.
2. Validate current model selection; update to a supported model and adjust prompt/response parsing if needed.
3. Add explicit error handling surfaced in UI (toast/banner) and confirm persistence of results.

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
