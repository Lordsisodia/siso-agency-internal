# Cost Analysis Workflow

**Workflow:** Perform first-principles cost decomposition
**Purpose:** Break costs to atomic units (time, money, energy, complexity)
**Time Required:** 15-60 minutes (depending on complexity)

---

## When to Use

Use this workflow when:
- Making build vs buy decisions
- Comparing different technical approaches
- Estimating project budgets
- Validating cost assumptions
- Evaluating ROI of different options

---

## Inputs

```yaml
Problem: [What you're analyzing costs for]

Options:
  - [Option 1]
  - [Option 2]
  - [Option 3]

Time Horizon:
  - Analysis period: [1-year, 3-year, 5-year]
  - Discount rate: [For NPV calculations, if applicable]

Cost Categories to Include:
  - Development time
  - Infrastructure costs
  - License/subscription costs
  - Maintenance costs
  - Risk costs
  - Opportunity costs
```

---

## The Atomic Cost Units

### 1. Time Costs

| Component | Unit | How to Estimate |
|-----------|------|-----------------|
| Development | Hours | Task breakdown × hourly rate |
| Code Review | Hours | % of development time |
| QA/Testing | Hours | % of development time |
| Meetings | Hours | Number × duration |
| Learning | Hours | Training time |
| Debugging | Hours | % of development time |
| Deployment | Hours | Per deployment |

**Formula:**
```
Time Cost = Σ(Hours × Hourly Rate)
```

### 2. Money Costs

| Component | Unit | How to Estimate |
|-----------|------|-----------------|
| Infrastructure | $/month | Cloud pricing calculator |
| Licenses | $/year | Vendor pricing |
| Tools | $/year | Sum of tool costs |
| External Services | $/project | Vendor quotes |
| Hiring/Recruiting | $/hire | Recruiting costs |

**Formula:**
```
Money Cost = Σ(Monthly Cost × 12) + One-time Costs
```

### 3. Energy Costs (Cognitive Load)

| Component | Unit | How to Estimate |
|-----------|------|-----------------|
| Coordination | Low/Med/High | Team size × complexity |
| Maintenance | Low/Med/High | System complexity |
| Decision making | Low/Med/High | Number of decisions |
| Technical debt | Low/Med/High | Shortcuts taken |

**Note:** Energy costs are qualitative but important for team sustainability

### 4. Complexity Costs

| Component | Unit | How to Estimate |
|-----------|------|-----------------|
| Integration Points | Count | Number of external systems |
| Moving Parts | Count | Number of services/containers |
| Novelty | Qualitative | % similar to past work |
| Uncertainty | Qualitative | % unknown |

**Formula:**
```
Complexity Multiplier = 1 + (Integration Points × 0.1) + (Novelty × 0.2) + (Uncertainty × 0.3)
```

---

## Step-by-Step Process

### Step 1: Decompose Each Option

Break each option into components:

```
Option A: Build Custom
  ├─ User Management
  ├─ Authentication
  ├─ Authorization
  ├─ Session Management
  └─ Audit Logging

Option B: Buy SaaS
  ├─ Integration
  ├─ Configuration
  ├─ Customization
  └─ Migration
```

---

### Step 2: Estimate Time for Each Component

| Component | Hours | Hourly Rate | Cost | Notes |
|-----------|-------|-------------|------|-------|
| User Management | 16h | $100 | $1,600 | CRUD + admin UI |
| Authentication | 24h | $100 | $2,400 | Includes MFA |
| Authorization | 12h | $100 | $1,200 | RBAC |
| Session Mgmt | 8h | $100 | $800 | JWT/cookies |
| Audit Logging | 12h | $100 | $1,200 | Async logging |
| **TOTAL** | **72h** | - | **$7,200** | |

**Add multipliers:**
- Code review (20%): $1,440
- QA/Testing (30%): $2,160
- Buffer (30% for uncertainty): $3,240
- **Total with multipliers:** $14,040

---

### Step 3: Calculate Money Costs

| Component | Monthly | Year 1 | Years 2-5 | 5-Year Total |
|-----------|---------|--------|-----------|--------------|
| Infrastructure | $500 | $6,000 | $6,000/yr | $30,000 |
| Tools | $200 | $2,400 | $2,400/yr | $12,000 |
| Security Audit | - | $15,000 | $5,000/yr | $35,000 |
| **TOTAL** | **$700** | **$23,400** | **$13,400/yr** | **$77,000** |

---

### Step 4: Calculate Total Cost of Ownership (TCO)

```
Option A: Build Custom
├─ Development (Year 1): $14,040
├─ Infrastructure (Year 1): $6,000
├─ Maintenance (Year 1): $7,020 (50% of dev)
├─ Security Audit (Year 1): $15,000
├─ Year 1 Total: $42,060
├─ Annual Recurring (Years 2-5): $19,400/year
└─ 5-Year TCO: $42,060 + ($19,400 × 4) = $119,660
```

---

### Step 5: Compare Options

| Metric | Option A | Option B | Option C |
|--------|----------|----------|----------|
| Year 1 Cost | $42,060 | $10,280 | $12,500 |
| Years 2-5 | $19,400/yr | $8,000/yr | $12,000/yr |
| 5-Year TCO | $119,660 | $42,280 | $60,500 |
| Breakeven | - | Year 2 | Year 3 |

**Visualization:**

```
Cost Over Time
$

│
│        AAAAAA
│        AAAAAA                  Option A (Build)
│        AAAAAA                  Option B (Buy SaaS)
│        AAAAAA        BBBBBB    Option C (Hybrid)
│        AAAAAA        BBBBBB
│        AAAAAA        BBBBBB
│        AAAAAA        BBBBBB
│________AAAAAA________BBBBBB____________________
         Y1    Y2    Y3    Y4    Y5    Time
```

---

### Step 6: Sensitivity Analysis

Test assumptions:

```python
# What if dev time is 2x estimate?
if dev_hours × 2:
    Option A TCO = $200,000  # Still higher than B

# What if infrastructure grows 3x?
if infra × 3:
    Option A TCO = $160,000  # Still higher than B

# What if discount rate is 10%?
NPV_A = $95,000
NPV_B = $38,000
# Conclusion: B is still better
```

---

## Output Format

```markdown
# Cost Analysis: [Problem Name]

**Date:** YYYY-MM-DD
**Analysis Period:** [1-year, 3-year, 5-year]
**Discount Rate:** [X%]

## Options Analyzed
1. [Option A]
2. [Option B]
3. [Option C]

## Cost Breakdown by Option

### Option A: [Name]

#### Development Costs (Year 1)
| Component | Hours | Rate | Cost |
|-----------|-------|------|------|
| [Comp 1] | 8h | $100 | $800 |
| [Comp 2] | 16h | $100 | $1,600 |
| **Subtotal** | **24h** | - | **$2,400** |
| Code Review (20%) | - | - | $480 |
| QA/Testing (30%) | - | - | $720 |
| Buffer (30%) | - | - | $1,080 |
| **Total Dev** | - | - | **$4,680** |

#### Recurring Costs
| Component | Monthly | Year 1 | Years 2-5 | 5-Year Total |
|-----------|---------|--------|-----------|--------------|
| [Cost 1] | $500 | $6,000 | $6,000/yr | $30,000 |
| [Cost 2] | $200 | $2,400 | $2,400/yr | $12,000 |
| **Total** | **$700** | **$8,400** | **$8,400/yr** | **$42,000** |

#### Total Cost of Ownership
- Year 1: $[Dev + Recurring]
- Years 2-5: $[Recurring]/year
- 5-Year TCO: $[Total]

### Option B: [Name]
[Same structure]

### Option C: [Name]
[Same structure]

## Comparison

| Metric | Option A | Option B | Option C |
|--------|----------|----------|----------|
| Year 1 Cost | $X | $Y | $Z |
| 5-Year TCO | $X | $Y | $Z |
| Payback Period | N/A | Y years | Z years |
| NPV (10%) | $X | $Y | $Z |

## Sensitivity Analysis
- [Scenario 1]: [Impact on each option]
- [Scenario 2]: [Impact on each option]
- [Scenario 3]: [Impact on each option]

## Non-Cost Considerations
- [Risk factors not captured in cost]
- [Strategic considerations]
- [Team capabilities]
- [Time-to-market]

## Recommendation
[Based on cost analysis, recommend option X]

## Assumptions
- [Hourly rate: $100]
- [Buffer: 30%]
- [Growth rate: X%/year]
- [Discount rate: 10%]

## Next Steps
1. [Validate cost assumptions]
2. [Get vendor quotes]
3. [POC to validate estimates]
```

---

## Common Pitfalls

### ❌ Don't:
- Use analogy pricing ("similar project cost $50k")
- Forget hidden costs (maintenance, operations, risk)
- Ignore time value of money
- Use single-point estimates (no ranges)
- Forget to account for learning curve
- Ignore opportunity costs

### ✅ Do:
- Decompose to atomic units
- Include all cost drivers
- Use ranges or buffers for uncertainty
- Perform sensitivity analysis
- Consider non-cost factors
- Validate estimates against reality

---

## Tools

**Python API:**
```python
from runtime.fp_engine.first_principles import FirstPrinciplesEngine

engine = FirstPrinciplesEngine()
costs = engine.cost_analysis(
    components=[comp1, comp2, comp3],
    time_period="5-year"
)

print(costs)
```

---

## Related Workflows

- **Problem Decomposition:** `../decompose/` - Start with decomposition, then analyze costs
- **Constraint Mapping:** `../map-constraints/` - Constraints affect costs
- **PR-0001:** Cost Decomposition principle - Detailed methodology

---

## Example

See full example in `PR-0001.md` (Build vs Buy Auth detailed cost analysis)

---

**Last Updated:** 2026-01-13
**Workflow Version:** 1.0
