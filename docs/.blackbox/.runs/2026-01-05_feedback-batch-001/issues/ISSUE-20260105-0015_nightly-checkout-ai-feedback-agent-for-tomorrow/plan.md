---
id: ISSUE-20260105-0015
title: "Nightly checkout: AI feedback agent for tomorrow"
status: inbox
domain: "integrations"
priority: "p2"
owner: "unassigned"
created_at: "2026-01-05"
updated_at: "2026-01-05"
---

# Summary

After completing nightly checkout, a “tracked GPT agent” should generate feedback to help improve tomorrow (suggestions, plan ideas, patterns). This turns the nightly reflection into actionable coaching.

## Symptoms / Evidence

- What the user sees: no AI feedback based on nightly data.
- Where it happens: Nightly checkout flow.
- Source: `docs/knowledge/feedback/4-1-26/Daily View Feedback.md`

## Scope

- In scope: AI summary generation + display in checkout; minimal persistence of AI output.
- Out of scope: a full multi-day coaching timeline (initially).

## Acceptance Criteria (Must Be Verifiable)

- [ ] After saving nightly checkout, user can request or automatically receive an AI “tomorrow improvement” summary.
- [ ] AI output is stored (or cached) so it doesn’t regenerate every render.
- [ ] Works with offline-first constraints (queue generation until online, or disable with clear messaging).

## Research Notes (Grounded in Code)

- Entry points:
  - `src/domains/lifelock/1-daily/7-checkout/ui/pages/NightlyCheckoutSection.tsx`
  - `src/lib/hooks/useDailyReflections.ts` (reflection persistence)
  - `src/services/` (AI integration patterns)
- Notes:
  - The reflection object already contains `tomorrowFocus` and `tomorrowTopTasks`; AI can augment these.

---

# Implementation Plan (Stage 3) — Seed

## Steps (Ordered, Executable)

1. Define what data is fed into the AI prompt (wins, mood, action items, tomorrow focus).
2. Implement an AI service call (server-side route or client-side if already used elsewhere).
3. Store the AI output keyed by (user, date) and display in Nightly Checkout UI.

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
