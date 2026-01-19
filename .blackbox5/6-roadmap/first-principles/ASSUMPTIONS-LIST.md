# All Assumptions Registry

**Last Updated:** 2026-01-19
**Total Assumptions:** 7
**Validated:** 0 | **Invalidated:** 0 | **Inconclusive:** 0 | **Unknown:** 7

---

## Quick Stats

### By Status

| Status | Count | Percentage |
|--------|-------|------------|
| 🔵 Unknown | 7 | 100% |
| 🟢 Validated | 0 | 0% |
| 🔴 Invalidated | 0 | 0% |
| 🟡 Inconclusive | 0 | 0% |

### By Confidence

| Confidence | Count | Percentage |
|-----------|-------|------------|
| High | 3 | 43% |
| Medium | 3 | 43% |
| Low | 1 | 14% |

### By Impact

| Impact | Count | Percentage |
|--------|-------|------------|
| Critical | 0 | 0% |
| High | 2 | 29% |
| Medium | 2 | 29% |
| Low | 3 | 43% |

### By Domain

| Domain | Count |
|--------|-------|
| task-management | 7 |
| agents | 0 |
| skills | 0 |
| memory | 0 |

---

## Validation Priority Queue

### 🔥🔥🔥 High Priority (Validate First)

| ID | Assumption | Feature | Priority | Est. Time | Quick Win |
|----|-----------|---------|----------|-----------|-----------|
| [ASSUMPTION-0001](#assumption-0001) | Tasks can be accurately analyzed from text | task-analyzer | **85/100** | 4-6h | ❌ |
| [ASSUMPTION-0004](#assumption-0004) | Task type from keywords | task-analyzer | **75/100** | 4-5h | ❌ |
| [ASSUMPTION-0006](#assumption-0006) | Token estimation possible | task-analyzer | **70/100** | Weeks | ❌ |

### 🔥🔥 Medium Priority

| ID | Assumption | Feature | Priority | Est. Time | Quick Win |
|----|-----------|---------|----------|-----------|-----------|
| [ASSUMPTION-0003](#assumption-0003) | Multiplicative > additive | task-analyzer | **65/100** | 3-4h | ❌ |
| [ASSUMPTION-0002](#assumption-0002) | Log scaling matches distribution | task-analyzer | **60/100** | 2-3h | ✅ |
| [ASSUMPTION-0007](#assumption-0007) | ROI is good prioritization metric | task-analyzer | **55/100** | 4-5h | ❌ |

### ⚡ Quick Wins (< 4 hours)

| ID | Assumption | Feature | Priority | Est. Time |
|----|-----------|---------|----------|-----------|
| [ASSUMPTION-0002](#assumption-0002) | Log scaling matches distribution | task-analyzer | **60/100** | 2-3h |

---

## All Assumptions Table

| ID | Status | Assumption | Feature | Confidence | Impact | Priority |
|----|--------|-----------|---------|------------|--------|----------|
| ASSUMPTION-0001 | 🔵 | Tasks can be accurately analyzed from text | task-analyzer | Medium | High | **85/100** |
| ASSUMPTION-0004 | 🔵 | Task type from keywords | task-analyzer | High | High | **75/100** |
| ASSUMPTION-0006 | 🔵 | Token estimation possible | task-analyzer | Low | Medium | **70/100** |
| ASSUMPTION-0003 | 🔵 | Multiplicative > additive | task-analyzer | Medium | Medium | **65/100** |
| ASSUMPTION-0002 | 🔵 | Log scaling matches distribution | task-analyzer | High | Low | **60/100** |
| ASSUMPTION-0007 | 🔵 | ROI is good prioritization metric | task-analyzer | High | Low | **55/100** |
| ASSUMPTION-0005 | 🔵 | 10 task types sufficient | task-analyzer | Medium | Low | **50/100** |

**Legend:** 🔵 Unknown | 🟢 Validated | 🔴 Invalidated | 🟡 Inconclusive

---

## By Feature

### Task Analyzer (7 assumptions)

- [ASSUMPTION-0001](#assumption-0001) - Tasks can be accurately analyzed from text (🔵, 85/100, Medium, High)
- [ASSUMPTION-0002](#assumption-0002) - Log scaling matches distribution (🔵, 60/100, High, Low)
- [ASSUMPTION-0003](#assumption-0003) - Multiplicative > additive (🔵, 65/100, Medium, Medium)
- [ASSUMPTION-0004](#assumption-0004) - Task type from keywords (🔵, 75/100, High, High)
- [ASSUMPTION-0005](#assumption-0005) - 10 task types sufficient (🔵, 50/100, Medium, Low)
- [ASSUMPTION-0006](#assumption-0006) - Token estimation possible (🔵, 70/100, Low, Medium)
- [ASSUMPTION-0007](#assumption-0007) - ROI is good prioritization metric (🔵, 55/100, High, Low)

---

## Detailed Assumptions

### ASSUMPTION-0001: Tasks can be accurately analyzed from text description

**Status:** 🔵 Unknown
**Feature:** [task-analyzer](./features/task-analyzer.md)
**Category:** Technical
**Domain:** task-management

**Confidence:** Medium | **Impact:** High | **Priority:** 85/100

**What we believe:**
The task title, description, and content contain sufficient information to determine complexity, value, compute needs, and urgency

**Why we believe it:**
Most task descriptions include context about scope, tech stack, dependencies, deadlines, and business value

**Impact if wrong:**
We'd misroute tasks, waste resources, and misprioritize work

**Challenges:** [task-analyzer-challenges.md](./challenges/task-analyzer-challenges.md)
- Total Questions: 10
- Categories: 6 (Truth, Opposite, Edge Cases, Stakeholders, Alternatives, Consequences)

**Validation Plan:**
- **Type:** Quantitative (correlation analysis)
- **Method:** Compare predicted complexity vs actual effort for 100 completed tasks
- **Success:** Correlation > 0.6, MAE < 30%
- **Failure:** Correlation < 0.3, MAE > 50%
- **Est. Time:** 4-6 hours

**Next Steps:**
1. Collect 100 completed tasks with time tracking
2. Run complexity analyzer on each
3. Calculate correlation and error metrics
4. Document results

---

### ASSUMPTION-0002: Logarithmic scaling matches natural task distribution

**Status:** 🔵 Unknown
**Feature:** [task-analyzer](./features/task-analyzer.md)
**Category:** Technical
**Domain:** task-management

**Confidence:** High | **Impact:** Low | **Priority:** 60/100

**What we believe:**
Tasks follow a power law distribution (many simple, few complex). Log₁₀ scoring naturally handles this.

**Why we believe it:**
Software complexity, file counts, and user impact typically follow power laws

**Impact if wrong:**
Scoring would be skewed, but still functional

**Challenges:** [task-analyzer-challenges.md](./challenges/task-analyzer-challenges.md)
- Total Questions: 8
- Categories: 6

**Validation Plan:**
- **Type:** Quantitative (distribution analysis)
- **Method:** Analyze 500+ tasks, test fit for power law, normal, uniform distributions
- **Success:** Power law is best fit (p > 0.05)
- **Failure:** Normal or uniform is better fit
- **Est. Time:** 2-3 hours ⚡ **QUICK WIN**

**Next Steps:**
1. Collect complexity data from 500+ tasks
2. Plot distribution (histogram, Q-Q plot)
3. Test fit for different distributions
4. Confirm or reject power law assumption

---

### ASSUMPTION-0003: Multiplicative scoring is better than additive

**Status:** 🔵 Unknown
**Feature:** [task-analyzer](./features/task-analyzer.md)
**Category:** Technical
**Domain:** task-management

**Confidence:** Medium | **Impact:** Medium | **Priority:** 65/100

**What we believe:**
Multiplicative scoring prevents weak dimensions from compensating for strong ones. All dimensions matter.

**Why we believe it:**
A high-value task that's extremely complex has different characteristics than one that's simple

**Impact if wrong:**
ROI calculation would be less accurate

**Challenges:** [task-analyzer-challenges.md](./challenges/task-analyzer-challenges.md)
- Total Questions: 9
- Categories: 6

**Validation Plan:**
- **Type:** Quantitative + Qualitative
- **Method:** Score 100 tasks both ways, have humans rate which feels more accurate
- **Success:** Humans prefer multiplicative 70%+ of time
- **Failure:** Humans prefer additive 70%+ of time
- **Est. Time:** 3-4 hours

**Next Steps:**
1. Score 100 tasks with both methods
2. Compare rankings
3. Have 5-10 developers rate preference
4. Analyze results

---

### ASSUMPTION-0004: Task type can be determined from keywords

**Status:** 🔵 Unknown
**Feature:** [task-analyzer](./features/task-analyzer.md)
**Category:** Technical
**Domain:** task-management

**Confidence:** High | **Impact:** High | **Priority:** 75/100

**What we believe:**
Specific keywords reliably indicate task type (e.g., "CSS" → UI, "refactor" → Refactor)

**Why we believe it:**
Task descriptions typically include domain-specific terminology

**Impact if wrong:**
Tasks would be routed to wrong agent types

**Challenges:** [task-analyzer-challenges.md](./challenges/task-analyzer-challenges.md)
- Total Questions: 8
- Categories: 6

**Validation Plan:**
- **Type:** Quantitative (accuracy analysis)
- **Method:** Collect 200 human-labeled tasks, run keyword classifier, calculate precision/recall
- **Success:** Overall accuracy > 80%, F1 > 0.7 for all types
- **Failure:** Accuracy < 70%, F1 < 0.5 for any type
- **Est. Time:** 4-5 hours

**Next Steps:**
1. Collect 200 tasks with human labels
2. Run keyword-based classifier
3. Calculate precision, recall, F1
4. Analyze misclassifications

---

### ASSUMPTION-0005: 10 task types are sufficient

**Status:** 🔵 Unknown
**Feature:** [task-analyzer](./features/task-analyzer.md)
**Category:** Categorical
**Domain:** task-management

**Confidence:** Medium | **Impact:** Low | **Priority:** 50/100

**What we believe:**
We can categorize all tasks into UI, Refactor, Research, Planning, Brainstorming, Implementation, Testing, Documentation, Infrastructure, or Data

**Why we believe it:**
These cover most software development work

**Impact if wrong:**
Some tasks would be miscategorized

**Challenges:** [task-analyzer-challenges.md](./challenges/task-analyzer-challenges.md)
- Total Questions: 7
- Categories: 6

**Validation Plan:**
- **Type:** Qualitative (coverage analysis)
- **Method:** Sample 200 tasks, attempt categorization, interview stakeholders
- **Success:** > 95% fit clearly, no missing patterns
- **Failure:** < 85% fit clearly, clear missing pattern
- **Est. Time:** 3-4 hours

**Next Steps:**
1. Sample 200 diverse tasks
2. Attempt categorization
3. Record tasks that don't fit
4. Interview stakeholders

---

### ASSUMPTION-0006: Token estimation is possible from complexity analysis

**Status:** 🔵 Unknown
**Feature:** [task-analyzer](./features/task-analyzer.md)
**Category:** Technical
**Domain:** task-management

**Confidence:** Low | **Impact:** Medium | **Priority:** 70/100

**What we believe:**
We can estimate required tokens based on task complexity, type, and uncertainty

**Why we believe it:**
Complex tasks require more reasoning, more code generation, more iterations

**Impact if wrong:**
We'd over/under-allocate resources, waste money or time

**Challenges:** [task-analyzer-challenges.md](./challenges/task-analyzer-challenges.md)
- Total Questions: 7
- Categories: 6

**Validation Plan:**
- **Type:** Quantitative (correlation + error analysis)
- **Method:** Run 100 tasks, track predicted vs actual tokens
- **Success:** Correlation > 0.5, within 2x of actual
- **Failure:** Correlation < 0.3, often > 5x off
- **Est. Time:** Weeks (requires running actual tasks)

**Next Steps:**
1. Enable token tracking on tasks
2. Run 100+ tasks over time
3. Collect predicted vs actual data
4. Analyze correlation and error

---

### ASSUMPTION-0007: ROI (Value/Complexity) is a good prioritization metric

**Status:** 🔵 Unknown
**Feature:** [task-analyzer](./features/task-analyzer.md)
**Category:** Strategic
**Domain:** task-management

**Confidence:** High | **Impact:** Low | **Priority:** 55/100

**What we believe:**
Tasks with higher value per unit complexity should be prioritized

**Why we believe it:**
This maximizes impact per effort

**Impact if wrong:**
We'd prioritize suboptimally, but not catastrophically

**Challenges:** [task-analyzer-challenges.md](./challenges/task-analyzer-challenges.md)
- Total Questions: 7
- Categories: 6

**Validation Plan:**
- **Type:** Quantitative (simulation)
- **Method:** Simulate 100 tasks with 3 strategies (ROI, urgency, dependency)
- **Success:** ROI delivers > 20% more value
- **Failure:** ROI delivers < 10% more value
- **Est. Time:** 4-5 hours

**Next Steps:**
1. Create simulation with 100 tasks
2. Simulate 3 prioritization strategies
3. Measure total value delivered
4. Compare results

---

## Filtering and Search

### Quick Filters

- **[All Unknown]** (7) - Show all unvalidated assumptions
- **[High Priority]** (3) - Priority >= 70
- **[High Impact]** (2) - Impact = High
- **[Low Confidence]** (1) - Confidence = Low
- **[Quick Wins]** (1) - Can validate in < 4 hours

### Search by Domain

- [task-management] (7 assumptions)
- [agents] (0 assumptions)
- [skills] (0 assumptions)
- [memory] (0 assumptions)

### Search by Category

- [technical] (5 assumptions)
- [categorical] (1 assumption)
- [strategic] (1 assumption)

---

## Next Actions

### Immediate (This Week)

1. **[ASSUMPTION-0002](#assumption-0002)** - Validate log distribution (2-3h) ⚡ **QUICKEST WIN**
   - Why: Quickest validation, confirms fundamental approach
   - Effort: 2-3 hours
   - Impact: Validates core scoring mechanism

2. **[ASSUMPTION-0001](#assumption-0001)** - Validate text analysis (4-6h)
   - Why: Foundation of entire system
   - Effort: 4-6 hours
   - Impact: Critical for routing accuracy

### Short-term (This Month)

3. **[ASSUMPTION-0004](#assumption-0004)** - Validate keyword classification (4-5h)
   - Why: High impact on routing
   - Effort: 4-5 hours

4. **[ASSUMPTION-0003](#assumption-0003)** - Validate multiplicative scoring (3-4h)
   - Why: Affects ROI calculation
   - Effort: 3-4 hours

### Long-term (Ongoing)

5. **[ASSUMPTION-0006](#assumption-0006)** - Validate token estimation (Weeks)
   - Why: Low confidence, important for resource allocation
   - Effort: Weeks (data collection)
   - Start: Enable token tracking now

---

## Related Documents

- [ASSUMPTION-REGISTRY.yaml](./ASSUMPTION-REGISTRY.yaml) - Machine-readable database
- [VALIDATION-DASHBOARD.md](./VALIDATION-DASHBOARD.md) - Validation progress dashboard
- [ASSUMPTION-CHALLENGER-PLAN.md](./ASSUMPTION-CHALLENGER-PLAN.md) - System design

---

**Last Updated:** 2026-01-19
**Generated from:** ASSUMPTION-REGISTRY.yaml
