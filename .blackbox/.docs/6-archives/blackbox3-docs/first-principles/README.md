# First Principles System

**Complete Guide to First-Principles Reasoning in Blackbox3**

Last Updated: 2026-01-13

---

## Overview

First Principles (FP) reasoning is a systematic approach to problem-solving that breaks problems down to their fundamental components, rather than reasoning by analogy or accepting "how things are done."

### The Four Steps

1. **DECOMPOSITION** - Break problems to atomic variables
2. **GROUNDING** - Replace assumptions with constraints
3. **RECONSTRUCTION** - Rebuild solutions from fundamentals
4. **TESTABILITY** - Generate falsifiable tests

---

## When to Use First Principles

Use FP reasoning when:
- Making architectural decisions
- Choosing between multiple approaches
- Determining priorities or trade-offs
- Evaluating significant risks
- Any decision where you'd regret being wrong

---

## The Decision Pipeline

### Step 1: Capture Context
- What are we trying to achieve?
- What's the unit of optimization?
- What are the stakes?

### Step 2: Inventory Assumptions
- What are we assuming is true?
- List all explicit and implicit assumptions
- Rate confidence (high/medium/low)

### Step 3: Map Constraints
- **Hard constraints**: Physics, law, math (cannot be violated)
- **Soft constraints**: Preferences, conventions (can be negotiated)

### Step 4: Decompose to Fundamentals
- Break the problem to atomic variables
- What are the irreducible components?
- What cannot be further decomposed?

### Step 5: Rebuild Options
- Starting from fundamentals, reconstruct solutions
- Generate 3-5 approaches (Conservative, Novel, Radical)
- Optimize for objective under constraints

### Step 6: Identify Bottleneck/Leverage
- What's the limiting factor?
- What gives us the most leverage?
- Where should we focus effort?

### Step 7: Propose Tests
- What would falsify each approach?
- What experiments can validate assumptions?
- How will we measure success?

### Step 8: Decide + Schedule Review
- Select best approach based on evidence
- Document rationale
- Schedule review date to validate decision

---

## Quick Reference

### Simple Decisions (< 5 min, low risk)
- Document reasoning directly
- No formal FP process needed

### Moderate Decisions (5-30 min, medium risk)
- Use FP Decomposition framework
- Document constraints and options
- Quick validation plan

### Complex Decisions (30 min - 2 hours, high risk)
- Full FP Decomposition
- Generate multiple hypotheses
- Design validation tests
- Document in Decision Record

### Critical Decisions (> 2 hours, very high risk)
- Full ADI Cycle (if applicable)
- Multiple stakeholder review
- Extensive validation
- Formal decision record with review date

---

## Decision Complexity Assessment

Use `decision_gateway.py` to automatically assess decision complexity:

```bash
python3 runtime/fp_engine/decision_gateway.py \
  --title "Your decision title" \
  --description "One-line description" \
  --goals "Goal 1" "Goal 2" \
  --constraints "Constraint 1" "Constraint 2"
```

**Output:**
- Complexity level (simple/moderate/complex/critical)
- Whether ADI cycle is required
- Suggested next steps
- Recommended agents/skills

---

## Decision Records

All FP decisions should be documented in `data/decisions/records/` with format:

```
DEC-YYYY-###-slug.md

# Decision: [Title]

**Date:** YYYY-MM-DD
**Complexity:** Moderate|Complex|Critical
**Decision Maker:** [Agent/Human]

## Context
[What decision we're facing]

## Constraints
### Hard Constraints
- [Constraint 1]
- [Constraint 2]

### Soft Constraints
- [Constraint 1]
- [Constraint 2]

## Assumptions
- [Assumption 1] (confidence: high/med/low)
- [Assumption 2] (confidence: high/med/low)

## Decomposition
### Fundamental Components
1. [Component 1]: [Description]
2. [Component 2]: [Description]
3. [Component 3]: [Description]

## Options Considered
### Option 1: [Name]
- **Approach:** [Description]
- **Rationale:** [Why this works]
- **Pros:** [List]
- **Cons:** [List]
- **Risks:** [List]

### Option 2: [Name]
...

## Decision
**Selected:** Option X

**Rationale:**
[Why this option was chosen]

**Weakest Link:**
[What could invalidate this decision]

**Action Plan:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Review Date:** YYYY-MM-DD

## Validation Tests
- [Test 1]: [What it validates]
- [Test 2]: [What it validates]
- [Test 3]: [What it validates]

## Outcome
[To be filled after review date]
```

---

## The ADI Cycle

For complex decisions, use the **Abduction → Deduction → Induction** cycle:

### Abduction (AI generates options)
- Generate 3-5 hypotheses
- Include Conservative, Novel, and Radical options
- Each with rationale, assumptions, pros, cons

### Deduction (Human verifies logic)
- Check each hypothesis for logical consistency
- Identify hidden assumptions
- Look for AI hallucinations
- Mark each as PASS or REJECT

### Induction (Design validation tests)
- Design experiments to test remaining hypotheses
- Define success criteria
- Identify risks
- Document what would prove you wrong

**See:** `prompts/fp/` for detailed ADI prompts

---

## Principles

### PR-0001: Cost Decomposition
Break problems to material fundamentals - time, money, energy, complexity.

### PR-0002: ADI Cycle
Abduction → Deduction → Induction for complex decisions.

### PR-0003: Transformer Mandate
Claude generates options; humans decide. A system cannot objectively evaluate its own outputs.

**See:** `data/principles/` for detailed principle documents

---

## Example: Build vs Buy Auth

### Context
Need authentication system for client app. Constraints: SOC2 required, budget $50k, timeline 8 weeks.

### Decomposition
**Atomic Variables:**
- Time-to-market (weeks)
- Development cost ($)
- Ongoing maintenance (hours/month)
- Control level (high/medium/low)
- Security compliance (SOC2, GDPR)

### Hard Constraints
- SOC2 compliance required
- GDPR compliance required
- Must support MFA

### Soft Constraints
- Prefer React ecosystem
- Budget limit $50k
- Timeline 8 weeks

### Options
**Option 1: Build Custom**
- Pros: Full control, custom features, no vendor lock-in
- Cons: High initial cost, ongoing maintenance, security risk
- Cost: $30k dev + $5k/year maintenance
- Timeline: 10 weeks

**Option 2: Auth0**
- Pros: SOC2 compliant, fast implementation, proven security
- Cons: Vendor lock-in, recurring cost, limited customization
- Cost: $0 upfront + $12k/year
- Timeline: 2 weeks

**Option 3: Clerk**
- Pros: Developer-friendly, React ecosystem, SOC2 ready
- Cons: Newer platform, less enterprise features
- Cost: $0 upfront + $8k/year
- Timeline: 3 weeks

### Decision
**Selected:** Option 3 (Clerk)

**Rationale:**
- Meets timeline (3 weeks < 8 weeks)
- Meets budget ($8k/year < $50k)
- SOC2 compliant out of box
- React ecosystem matches our tech stack
- Fast enough time-to-market

**Weakest Link:** Clerk is newer, less proven than Auth0

**Review Date:** 2026-03-13 (3 months)

**Validation:**
- POC with Clerk for 1 week
- Measure integration time
- Verify SOC2 documentation
- Compare with Auth0 demo

---

## Related Skills

- **skill-first-principles**: Core FP reasoning capability
- **skill-architecture**: For architectural FP applications
- **skill-cost-analysis**: For cost-focused FP decisions

---

## Workflows

- **Problem Decomposition:** `modules/first-principles/workflows/decompose/`
- **Constraint Mapping:** `modules/first-principles/workflows/map-constraints/`
- **Cost Analysis:** `modules/first-principles/workflows/cost-analysis/`

---

**Source:** Extracted from `.research/00-ARCHIVE/BLACKBOX-V2-FULL-DESIGN.md`
