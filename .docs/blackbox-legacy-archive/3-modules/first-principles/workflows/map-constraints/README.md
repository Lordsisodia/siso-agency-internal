# Constraint Mapping Workflow

**Workflow:** Classify constraints as hard (inviolable) or soft (negotiable)
**Purpose:** Replace assumptions with explicit constraints
**Time Required:** 5-15 minutes

---

## When to Use

Use this workflow when:
- Starting a decision process
- Need to clarify what's actually required vs preferred
- Preparing for ADI cycle
- Constraints feel vague or conflicting

---

## Inputs

```yaml
Problem: [What you're trying to solve]

Stakeholder Constraints:
  - [Constraint 1 from stakeholder]
  - [Constraint 2 from stakeholder]
  - [Constraint 3 from stakeholder]

Technical Constraints:
  - [Technical limitation 1]
  - [Technical limitation 2]

Business Constraints:
  - [Business requirement 1]
  - [Business requirement 2]
```

---

## The Two Types of Constraints

### Hard Constraints (Cannot Violate)

**Definition:** Constraints based on physics, law, math, or absolute requirements

**Examples:**
- **Legal:** GDPR compliance, SOC2 certification
- **Physics:** Speed of light, thermodynamics
- **Math:** Cryptographic strength, computational complexity
- **Absolute requirements:** "Must support 10k concurrent users" (if this is truly a requirement)

**Test:** Is there ANY scenario where this could be violated? If no → Hard constraint

---

### Soft Constraints (Can Negotiate)

**Definition:** Preferences, conventions, "nice to have" requirements

**Examples:**
- **Preferences:** "Prefer React ecosystem," "Ideally use TypeScript"
- **Conventions:** "Standard practice is X," "Most companies do Y"
- **Budget:** "Budget is $50k" (can often be negotiated)
- **Timeline:** "8 weeks" (can often be extended)
- **Nice to have:** "Should support feature X"

**Test:** Could we proceed if this constraint were relaxed? If yes → Soft constraint

---

## Step-by-Step Process

### Step 1: Gather All Constraints

List every constraint mentioned:

```yaml
From stakeholders:
  - "Must be SOC2 compliant"
  - "Budget is $50k"
  - "Timeline is 8 weeks"
  - "Prefer React ecosystem"
  - "Should support MFA"

From technical reality:
  - "Team knows JavaScript"
  - "Infrastructure is on AWS"
  - "Database is PostgreSQL"
```

---

### Step 2: Classify Each Constraint

For each constraint, ask: **Hard or Soft?**

#### Decision Tree

```
Is this based on law/regulation?
├─ Yes → HARD CONSTRAINT
└─ No
    └─ Is this a physical/mathematical limitation?
        ├─ Yes → HARD CONSTRAINT
        └─ No
            └─ Would the project fail if this were violated?
                ├─ Yes → HARD CONSTRAINT
                └─ No → SOFT CONSTRAINT
```

---

### Step 3: Document Rationale

For each constraint, document why it's hard or soft:

```markdown
### Constraint: "SOC2 compliance required"
**Type:** HARD
**Rationale:** Legal/business requirement, cannot sell product without it
**Source:** Customer contract
**Test:** SOC2 Type 2 audit
```

```markdown
### Constraint: "Budget is $50k"
**Type:** SOFT
**Rationale:** Can be negotiated if ROI justifies it
**Source:** Initial budget approval
**Test:** Can request additional budget with business case
```

---

### Step 4: Check for Conflicts

Look for conflicts between constraints:

```
Hard constraint A (SOC2 compliance) ──conflicts──► Soft constraint B (8-week timeline)
```

**If hard vs soft conflict:** Soft constraint may need to be relaxed

**If hard vs hard conflict:** Problem may be unsolvable as stated

---

### Step 5: Prioritize Soft Constraints

Soft constraints can be prioritized:

| Soft Constraint | Priority | Rationale |
|-----------------|----------|-----------|
| Prefer React | High | Team already knows it |
| Use TypeScript | Medium | Nice to have, not critical |
| Support MFA | Low | Can add later |

---

## Output Format

```markdown
# Constraint Mapping: [Problem Name]

**Date:** YYYY-MM-DD

## Hard Constraints (Cannot Violate)

### 1. [Constraint Name]
**Description:** [What this requires]
**Source:** [Where this came from]
**Rationale:** [Why it's hard]
**Validation:** [How to verify compliance]
**Consequences of Violation:** [What happens if violated]

### 2. [Constraint Name]
[Same structure]

## Soft Constraints (Can Negotiate)

### 1. [Constraint Name]
**Description:** [What this prefers]
**Source:** [Where this came from]
**Priority:** [High/Medium/Low]
**Trade-off:** [What we'd give up to satisfy this]
**Relaxation Criteria:** [When we'd drop this constraint]

### 2. [Constraint Name]
[Same structure]

## Constraint Conflicts
- [Hard constraint A] conflicts with [Soft constraint B]
  - Resolution: [How to resolve]
- [Hard constraint C] conflicts with [Hard constraint D]
  - Status: [May be unsolvable / Needs trade-off]

## Assumptions Previously Treated as Constraints
- [Assumption 1] - Now classified as [soft/hard/not a constraint]
- [Assumption 2] - Now classified as [soft/hard/not a constraint]

## Next Steps
1. Use hard constraints to filter solutions
2. Use soft constraints to prioritize between options
3. Validate hard constraints are truly hard
4. Check for hidden constraints not yet identified
```

---

## Example: Build vs Buy Auth

### Hard Constraints

1. **SOC2 compliance required**
   - **Description:** Must pass SOC2 Type 2 audit
   - **Source:** Customer contracts
   - **Rationale:** Legal requirement, cannot sell without it
   - **Validation:** SOC2 audit
   - **Consequences:** Cannot sell to enterprise customers

2. **GDPR compliance required**
   - **Description:** Must meet GDPR data protection requirements
   - **Source:** EU operations
   - **Rationale:** Legal requirement
   - **Validation:** Legal review
   - **Consequences:** Fines, legal liability

3. **Must support MFA**
   - **Description:** Multi-factor authentication required
   - **Source:** Security policy
   - **Rationale:** Security best practice, increasingly required
   - **Validation:** Security review
   - **Consequences:** Security vulnerability

---

### Soft Constraints

1. **Budget is $50k**
   - **Description:** Initial budget approval
   - **Source:** Finance approval
   - **Priority:** Medium
   - **Trade-off:** Could increase if ROI justifies it
   - **Relaxation Criteria:** If TCO analysis shows higher option is cheaper long-term

2. **Timeline is 8 weeks**
   - **Description:** Initial timeline estimate
   - **Source:** Project plan
   - **Priority:** Medium
   - **Trade-off:** Could extend if market conditions allow
   - **Relaxation Criteria:** If complex analysis shows 8 weeks is unrealistic

3. **Prefer React ecosystem**
   - **Description:** Team prefers React-based solutions
   - **Source:** Team preference
   - **Priority:** High
   - **Trade-off:** Would need to learn new framework
   - **Relaxation Criteria:** If other framework has significant advantages

4. **Host on AWS**
   - **Description:** Current infrastructure is AWS
   - **Source:** Infrastructure decision
   - **Priority:** Low
   - **Trade-off:** Could use other cloud with migration effort
   - **Relaxation Criteria:** If best solution is on different cloud

---

## Common Pitfalls

### ❌ Don't:
- Treat soft constraints as hard (limits options unnecessarily)
- Miss hard constraints (leads to failed solutions)
- Forget to document rationale
- Ignore constraint conflicts
- Treat assumptions as constraints

### ✅ Do:
- Be ruthless about classifying constraints correctly
- Document WHY each constraint is hard or soft
- Check for conflicts
- Validate that hard constraints are truly hard
- Remember that "should" ≠ "must"

---

## Tools

**Python API:**
```python
from runtime.fp_engine.first_principles import FirstPrinciplesEngine

engine = FirstPrinciplesEngine()
constraints = engine.map_constraints(
    constraints_input=[
        "Must be SOC2 compliant",
        "Budget is $50k",
        "Timeline is 8 weeks",
        "Prefer React"
    ],
    hard_keywords=['must', 'shall', 'required', 'cannot'],
    soft_keywords=['should', 'prefer', 'ideally']
)

for constraint in constraints:
    print(f"{constraint.text} → {constraint.type}")
```

**CLI:**
```bash
python3 runtime/fp_engine/first_principles.py map-constraints \
  --constraints "Must be SOC2 compliant" "Budget is $50k" "Prefer React"
```

---

## Related Workflows

- **Problem Decomposition:** `../decompose/` - Start with decomposition, then map constraints
- **Cost Analysis:** `../cost-analysis/` - Analyze costs of satisfying constraints
- **ADI Cycle:** Use constraint mapping in abduction phase

---

## Related Principles

- **PR-0001:** Cost Decomposition - Constraints affect cost analysis
- **PR-0002:** ADI Cycle - Constraint mapping happens in abduction phase

---

**Last Updated:** 2026-01-13
**Workflow Version:** 1.0
