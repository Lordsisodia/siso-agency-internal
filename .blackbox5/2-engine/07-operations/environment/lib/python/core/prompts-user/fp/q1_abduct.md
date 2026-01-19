# Q1: Abduction (Generate Options)

**Phase:** Abduction - AI generates hypotheses
**Goal:** Generate 3-5 diverse solution approaches from first principles

---

## Context

You are in the **Abduction phase** of the ADI cycle. Your task is to generate multiple solution hypotheses by reasoning from first principles - not from analogy or "how things are done."

**Abduction = inference to the best explanation**

In this phase, you:
1. Decompose the problem to fundamental components
2. Map constraints (hard vs soft)
3. Generate 3-5 hypotheses spanning Conservative → Novel → Radical
4. For each hypothesis: identify assumptions, pros, cons, risks

---

## Input Template

```yaml
Problem Statement: |
  [Clear description of what we're trying to solve]

Context:
  Stakeholders: [Who is affected?]
  Timeframe: [Constraints on time]
  Budget: [Financial constraints if any]
  Technical Constraints: [Hard technical limitations]

Objectives:
  - [Objective 1]
  - [Objective 2]
  - [What are we optimizing for?]

Constraints:
  Hard:
    - [Constraint that CANNOT be violated]
    - [Physics, law, math, absolute requirements]
  Soft:
    - [Preference that can be negotiated]
    - [Conventions, preferences, "nice to have"]
```

---

## Output Format

For each hypothesis, provide:

```markdown
### Hypothesis N: [Name]

**Type:** Conservative | Novel | Radical

**Approach:**
[One-sentence summary of the solution]

**Rationale:**
[Why this approach works - reasoning from first principles]

**Assumptions:**
1. [Assumption 1] (confidence: high/medium/low)
2. [Assumption 2] (confidence: high/medium/low)
3. [Assumption 3] (confidence: high/medium/low)

**Pros:**
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

**Cons:**
- [Drawback 1]
- [Drawback 2]
- [Drawback 3]

**Risks:**
- [Risk 1] - [Mitigation strategy]
- [Risk 2] - [Mitigation strategy]
- [Risk 3] - [Mitigation strategy]

**Hard Constraint Compliance:**
- ✅ [Constraint 1] - [How it's satisfied]
- ✅ [Constraint 2] - [How it's satisfied]
- ⚠️ [Constraint 3] - [Potential issue or tradeoff]

**Estimated Complexity:** [Simple/Moderate/Complex/Critical]
**Estimated Timeline:** [Time estimate]
**Estimated Cost:** [Cost estimate if applicable]
```

---

## Generating Hypotheses

### Hypothesis 1: Conservative Approach
**Characteristics:**
- Minimal change from existing solutions
- Proven, low-risk path
- Incremental improvement
- Fast implementation

**When to include:** Always - provides baseline

**Example reasoning:**
"What's the minimal change that solves this?"
"How do others typically solve this?"
"What's the proven path?"

---

### Hypothesis 2: Novel Approach
**Characteristics:**
- New architecture addressing fundamentals
- Balances innovation and risk
- Optimizes trade-offs differently
- Learning opportunity

**When to include:** Always - the "thoughtful middle ground"

**Example reasoning:**
"What if we rebuilt this from basics?"
"What are we optimizing for, really?"
"How can we improve on the conservative approach?"

---

### Hypothesis 3: Radical Approach
**Characteristics:**
- Complete rethink from first principles
- Maximum optimization without legacy constraints
- Highest risk, highest potential reward
- May not be feasible

**When to include:** When stakes are high or problem space is unconstrained

**Example reasoning:**
"What if we started from zero?"
"What would we do with no constraints?"
"What's the theoretically optimal solution?"

---

### Hypotheses 4-5: Alternative Angles
**Characteristics:**
- Different optimization targets
- Alternative constraint interpretations
- Niche or specialized approaches

**When to include:** When complexity warrants exploring more options

---

## First Principles Questions

As you generate hypotheses, ask:

1. **Decomposition:** What are the atomic variables? What cannot be further decomposed?

2. **Constraints:** Which constraints are actually hard vs soft? Are we treating soft constraints as hard?

3. **Objectives:** What are we ACTUALLY optimizing for? What's the unit of optimization?

4. **Assumptions:** What are we assuming is true? How would the solution change if assumptions were wrong?

5. **Trade-offs:** What's the bottleneck? What gives us the most leverage?

---

## Common Pitfalls

### ❌ Don't:
- Reason by analogy ("Company X does this, so should we")
- Accept "how things are done" without question
- Generate minor variations of the same idea
- Ignore hard constraints
- Make assumptions without documenting them

### ✅ Do:
- Break problems to atomic variables
- Generate truly diverse approaches (Conservative vs Radical)
- Document ALL assumptions
- Explicitly check against hard constraints
- Think from fundamentals, not existing solutions

---

## Example: Build vs Buy Auth

### Problem
Need authentication system. Constraints: SOC2 required, budget $50k, timeline 8 weeks.

### Hypothesis 1: Build Custom (Conservative)
**Approach:** Build authentication in-house using proven libraries

**Rationale:** Full control, no vendor lock-in, one-time cost

**Assumptions:**
- Team has auth expertise (medium)
- Can build SOC2-compliant system in 10 weeks (medium)
- Ongoing maintenance capacity exists (high)

**Pros:**
- Full control over features
- No recurring vendor cost
- No vendor lock-in

**Cons:**
- Higher initial cost ($30k)
- Longer timeline (10 weeks > 8 weeks)
- Ongoing maintenance burden
- Security risk if not done correctly

**Risks:**
- May not meet SOC2 requirements → Validate with security audit
- Timeline overrun → Have fallback vendor option

**Hard Constraint Compliance:**
- ⚠️ Timeline: 10 weeks may exceed 8-week constraint
- ✅ SOC2: Can achieve with proper implementation
- ✅ Budget: $30k < $50k

---

### Hypothesis 2: Use Clerk (Novel)
**Approach:** Use Clerk.dev for auth (newer, developer-friendly)

**Rationale:** React-native, SOC2-ready, fast implementation

**Assumptions:**
- Clerk is SOC2 compliant (high - verified)
- Platform is stable and growing (medium)
- Features meet our needs (high - evaluated)

**Pros:**
- 3-week implementation (well within timeline)
- React ecosystem match
- SOC2 compliant out of box
- $8k/year recurring (vs $12k for Auth0)

**Cons:**
- Newer platform (less proven than Auth0)
- Vendor lock-in
- Recurring cost forever

**Risks:**
- Platform might not scale → Have migration plan to Auth0 ready
- Missing enterprise features → Confirm roadmap covers gaps

**Hard Constraint Compliance:**
- ✅ Timeline: 3 weeks << 8 weeks
- ✅ SOC2: Certified compliant
- ✅ Budget: $8k/year well within $50k

---

### Hypothesis 3: Use Auth0 (Radical... for this context)
**Approach:** Use Auth0 (industry standard, enterprise-grade)

**Rationale:** Most proven, maximum security, enterprise features

**Assumptions:**
- Auth0 is stable long-term (high - market leader)
- Features are worth premium cost (high - evaluated)
- No scaling issues (high - proven at scale)

**Pros:**
- 2-week implementation (fastest)
- Most proven SOC2 compliance
- Extensive enterprise features
- Market leader, low risk

**Cons:**
- Highest cost ($12k/year recurring)
- Vendor lock-in
- More features than we need (overkill?)

**Risks:**
- Cost overruns → Monitor usage, can downgrade plan

**Hard Constraint Compliance:**
- ✅ Timeline: 2 weeks << 8 weeks
- ✅ SOC2: Industry leader in compliance
- ✅ Budget: $12k/year within $50k

---

## Checklist

Before completing Q1 (Abduction), verify:

- [ ] Problem decomposed to fundamental components
- [ ] Constraints mapped as hard vs soft
- [ ] At least 3 hypotheses generated (Conservative, Novel, Radical)
- [ ] Each hypothesis has: approach, rationale, assumptions, pros, cons, risks
- [ ] All assumptions documented with confidence levels
- [ ] Each hypothesis checked against hard constraints
- [ ] Risks identified with mitigation strategies
- [ ] Estimates provided for complexity, timeline, cost
- [ ] Hypotheses are truly diverse (not minor variations)

---

## Next Step

**Q2: Deduction (Verify Logic)**

A human (or another agent) will:
1. Check each hypothesis for logical consistency
2. Identify hidden assumptions
3. Look for reasoning errors or hallucinations
4. Mark each hypothesis as PASS or REJECT
5. Document reasoning for each judgment

Only hypotheses that PASS deduction proceed to Q3 (Induction).
