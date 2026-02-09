# Problem Decomposition Workflow

**Workflow:** Decompose problems to fundamental components
**Purpose:** First step of First Principles reasoning
**Time Required:** 5-30 minutes (depending on complexity)

---

## When to Use

Use this workflow when:
- Starting any complex decision
- Need to understand a problem's fundamental structure
- Preparing for ADI cycle
- Want to identify atomic variables

---

## Inputs

```yaml
Problem: [Clear statement of what you're trying to solve]

Context:
  Stakeholders: [Who is affected?]
  Timeframe: [Constraints on time]
  Budget: [Financial constraints]
  Technical Constraints: [Hard limitations]

Objectives:
  - [What are you optimizing for?]
  - [What does success look like?]
```

---

## Step-by-Step Process

### Step 1: Define the Objective

**Ask:**
- What are we trying to achieve?
- What's the unit of optimization? (time, cost, quality, etc.)
- What are the stakes? (low, medium, high, critical)

**Output:**
- Clear objective statement
- Optimization unit identified
- Stakes assessed

---

### Step 2: Decompose to Atomic Variables

**Method:** Break down the problem until components cannot be further divided

**Ask:**
- What are the fundamental building blocks?
- can this be broken down further? If yes, keep breaking down
- What cannot be decomposed further?

**Example:**
```
Problem: "Build authentication system"

Decomposition:
  authentication
    ├─ user identification
    │   ├─ email/username
    │   └─ unique identifier
    ├─ user verification
    │   ├─ password hashing
    │   ├─ MFA
    │   └─ biometrics (future)
    ├─ session management
    │   ├─ token storage
    │   ├─ refresh mechanism
    │   └─ expiration
    └─ authorization
        ├─ role-based access
        ├─ permissions
        └─ scopes
```

**Output:**
- Tree of atomic components
- Each component is irreducible (or very close to it)

---

### Step 3: Map Components to Variables

For each atomic component, identify:

| Component | Variable Type | Domain | Constraints |
|-----------|---------------|--------|-------------|
| Password hashing | Technical | Security | Must use Argon2/bcrypt |
| Session storage | Infrastructure | Scalability | Must handle 10k concurrent |
| MFA | Feature | Security | Nice to have (soft) |

**Variable Types:**
- **Resource:** Time, money, compute, storage
- **Constraint:** Hard limits, requirements
- **Objective:** What we're optimizing for
- **Decision Point:** Binary choice (yes/no, A/B)

---

### Step 4: Identify Dependencies

Map relationships between components:

```
user identification ──depends on──> unique identifier
user verification ──depends on──> password hashing
session management ──depends on──> user verification
authorization ──depends on──> user identification
```

**Output:**
- Dependency graph
- Critical path identified
- Parallelizable components noted

---

### Step 5: Document Assumptions

For each component, list assumptions:

```yaml
Password hashing:
  Assumptions:
    - Team knows Argon2 (confidence: high)
    - Performance acceptable (confidence: medium)
    - No regulatory requirement for specific algo (confidence: high)
  Tests:
    - Benchmark hashing performance
    - Verify against compliance requirements
```

---

## Output Format

```markdown
# Decomposition: [Problem Name]

**Date:** YYYY-MM-DD
**Decomposed by:** [Name/Role]

## Objective
[Clear statement of what we're achieving]

## Atomic Components

### 1. [Component Name]
**Type:** [Resource/Constraint/Objective/Decision]
**Description:** [What this component is]
**Dependencies:** [What it depends on]
**Assumptions:**
- [Assumption 1] (confidence: high/medium/low)
- [Assumption 2] (confidence: high/medium/low)

### 2. [Component Name]
[Same structure]

## Dependency Graph
[Visual or text representation]

## Critical Path
[Sequence of components that must be done in order]

## Parallelizable Components
[Components that can be worked on simultaneously]

## Next Steps
1. Proceed to constraint mapping (see ../map-constraints/)
2. Use decomposition as input to abduction phase
3. Validate assumptions with domain experts
```

---

## Example

See full example in `.docs/first-principles/README.md` (Build vs Buy Auth)

---

## Tools

**Python API:**
```python
from runtime.fp_engine.first_principles import FirstPrinciplesEngine

engine = FirstPrinciplesEngine()
components = engine.decompose(
    problem="Need authentication system",
    context={
        "constraints": ["SOC2 required", "8-week timeline"],
        "budget": 50000
    }
)

for comp in components:
    print(f"{comp.name}: {comp.description}")
```

**CLI:**
```bash
python3 runtime/fp_engine/first_principles.py decompose \
  --problem "Need authentication system with SOC2 compliance"
```

---

## Related Workflows

- **Constraint Mapping:** `../map-constraints/` - Map hard/soft constraints
- **Cost Analysis:** `../cost-analysis/` - Analyze costs of components
- **ADI Cycle:** Use decomposition as input to abduction phase

---

**Last Updated:** 2026-01-13
**Workflow Version:** 1.0
