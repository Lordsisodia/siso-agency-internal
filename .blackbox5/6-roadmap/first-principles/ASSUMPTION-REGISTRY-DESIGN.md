# Assumption Registry System

**Purpose:** Central database of all assumptions across BlackBox5 with validation tracking

---

## Overview

A unified system to:
1. **Collect** all assumptions from all feature docs
2. **Track** validation status (unknown/validated/invalidated/inconclusive)
3. **Rank** by priority (impact × uncertainty)
4. **Search** by feature, domain, confidence level
5. **Update** as validations complete

---

## Data Structure

### Master Registry File

**Location:** `.blackbox5/roadmap/first-principles/ASSUMPTION-REGISTRY.yaml`

```yaml
# ============================================================================
# ASSUMPTION REGISTRY - MASTER DATABASE
# ============================================================================
# Purpose: Track all assumptions across all BlackBox5 features
# Last Updated: 2026-01-19
# ============================================================================

metadata:
  version: "1.0"
  total_assumptions: 0
  validated: 0
  invalidated: 0
  inconclusive: 0
  unknown: 0
  last_updated: "2026-01-19T12:00:00Z"

# ============================================================================
# ASSUMPTIONS
# ============================================================================
assumptions:
  - id: "ASSUMPTION-0001"
    feature: "task-analyzer"
    feature_link: ".blackbox5/roadmap/first-principles/features/task-analyzer.md"
    assumption: "Tasks can be accurately analyzed from text description"
    category: "technical"
    domain: "task-management"

    # Validation Status
    status: "unknown"  # unknown, validated, invalidated, inconclusive
    confidence: "medium"  # high, medium, low
    impact: "high"  # critical, high, medium, low

    # Priority Score (0-100)
    priority_score: 85.0  # Based on impact × uncertainty
    priority_reason: "High impact, medium confidence - foundational assumption"

    # Challenges
    challenges_link: ".blackbox5/roadmap/first-principles/challenges/task-analyzer-challenges.md"
    total_questions: 52
    questions_categories: 6

    # Validation
    validation_link: null  # Link to validation doc when complete
    validation_date: null
    validation_method: null  # quantitative, qualitative, competitive, thought-experiment
    validation_result: null

    # What we learned
    conclusion: null
    action_required: null
    next_steps: null

    # Dependencies
    affects_features: []  # Other features that depend on this assumption
    related_assumptions: []  # IDs of related assumptions

    # Metadata
    created_at: "2026-01-19T10:00:00Z"
    updated_at: "2026-01-19T10:00:00Z"
    created_by: "human"

# ============================================================================
# INDEXES
# ============================================================================
# Quick lookup indexes
indexes:
  by_status:
    unknown: []
    validated: []
    invalidated: []
    inconclusive: []

  by_priority:
    critical: []  # priority_score >= 90
    high: []      # priority_score >= 70
    medium: []    # priority_score >= 50
    low: []       # priority_score < 50

  by_domain:
    task-management: []
    agents: []
    skills: []
    memory: []
    tools: []
    cli: []
    infrastructure: []

  by_confidence:
    high: []   # We're very sure
    medium: [] # Somewhat sure
    low: []    # Not sure at all

# ============================================================================
# STATISTICS
# ============================================================================
statistics:
  total_by_feature:
    task-analyzer: 7
    bmad-framework: 0
    memory-system: 0

  total_by_status:
    unknown: 7
    validated: 0
    invalidated: 0
    inconclusive: 0

  total_by_domain:
    task-management: 7
    agents: 0
    skills: 0

  total_by_confidence:
    high: 2
    medium: 4
    low: 1

  total_by_impact:
    critical: 0
    high: 5
    medium: 2
    low: 0

# ============================================================================
# VALIDATION QUEUE
# ============================================================================
# Assumptions to validate, ordered by priority
validation_queue:
  - assumption_id: "ASSUMPTION-0001"
    priority_score: 85.0
    estimated_effort: "4-6 hours"
    quick_win: false
    reason: "Foundation of entire system"

  - assumption_id: "ASSUMPTION-0004"
    priority_score: 75.0
    estimated_effort: "4-5 hours"
    quick_win: false
    reason: "Affects routing accuracy"

  - assumption_id: "ASSUMPTION-0002"
    priority_score: 60.0
    estimated_effort: "2-3 hours"
    quick_win: true
    reason: "Quickest validation, confirms fundamental approach"
```

---

## Human-Readable Views

### View 1: All Assumptions Table

**Location:** `.blackbox5/roadmap/first-principles/ASSUMPTIONS-LIST.md`

```markdown
# All Assumptions Registry

**Last Updated:** 2026-01-19
**Total Assumptions:** 7
**Validated:** 0 | **Invalidated:** 0 | **Inconclusive:** 0 | **Unknown:** 7

---

## Quick Stats

| Status | Count | Percentage |
|--------|-------|------------|
| 🔵 Unknown | 7 | 100% |
| 🟢 Validated | 0 | 0% |
| 🔴 Invalidated | 0 | 0% |
| 🟡 Inconclusive | 0 | 0% |

| Confidence | Count |
|-----------|-------|
| High | 2 |
| Medium | 4 |
| Low | 1 |

| Impact | Count |
|--------|-------|
| Critical | 0 |
| High | 5 |
| Medium | 2 |
| Low | 0 |

---

## Validation Priority Queue

### 🔥🔥🔥 Critical Priority (Validate First)

| ID | Assumption | Feature | Priority | Est. Time |
|----|-----------|---------|----------|-----------|
| ASSUMPTION-0001 | Tasks can be accurately analyzed from text | task-analyzer | 85/100 | 4-6h |
| ASSUMPTION-0004 | Task type can be determined from keywords | task-analyzer | 75/100 | 4-5h |

### 🔥🔥 High Priority

| ID | Assumption | Feature | Priority | Est. Time |
|----|-----------|---------|----------|-----------|
| ASSUMPTION-0006 | Token estimation is possible | task-analyzer | 70/100 | Weeks |
| ASSUMPTION-0003 | Multiplicative scoring > additive | task-analyzer | 65/100 | 3-4h |

### ⚡ Quick Wins (< 4 hours)

| ID | Assumption | Feature | Priority | Est. Time |
|----|-----------|---------|----------|-----------|
| ASSUMPTION-0002 | Logarithmic scaling matches distribution | task-analyzer | 60/100 | 2-3h |

---

## All Assumptions

### Filter by: [All] [Unknown] [Validated] [Invalidated] [High Confidence] [Low Confidence] [High Impact]

| ID | Status | Assumption | Feature | Confidence | Impact | Priority |
|----|--------|-----------|---------|------------|--------|----------|
| ASSUMPTION-0001 | 🔵 | Tasks can be accurately analyzed from text | task-analyzer | Medium | High | 85/100 |
| ASSUMPTION-0002 | 🔵 | Logarithmic scaling matches distribution | task-analyzer | High | Low | 60/100 |
| ASSUMPTION-0003 | 🔵 | Multiplicative > additive | task-analyzer | Medium | Medium | 65/100 |
| ASSUMPTION-0004 | 🔵 | Task type from keywords | task-analyzer | High | High | 75/100 |
| ASSUMPTION-0005 | 🔵 | 10 task types sufficient | task-analyzer | Medium | Low | 50/100 |
| ASSUMPTION-0006 | 🔵 | Token estimation possible | task-analyzer | Low | Medium | 70/100 |
| ASSUMPTION-0007 | 🔵 | ROI is good prioritization metric | task-analyzer | High | Low | 55/100 |

**Legend:** 🔵 Unknown | 🟢 Validated | 🔴 Invalidated | 🟡 Inconclusive

---

## By Feature

### Task Analyzer (7 assumptions)
- [ASSUMPTION-0001](#assumption-0001) - Tasks can be accurately analyzed from text (🔵, 85/100)
- [ASSUMPTION-0002](#assumption-0002) - Logarithmic scaling matches distribution (🔵, 60/100)
- [ASSUMPTION-0003](#assumption-0003) - Multiplicative > additive (🔵, 65/100)
- [ASSUMPTION-0004](#assumption-0004) - Task type from keywords (🔵, 75/100)
- [ASSUMPTION-0005](#assumption-0005) - 10 task types sufficient (🔵, 50/100)
- [ASSUMPTION-0006](#assumption-0006) - Token estimation possible (🔵, 70/100)
- [ASSUMPTION-0007](#assumption-0007) - ROI is good prioritization metric (🔵, 55/100)

---

## Detailed View

### ASSUMPTION-0001: Tasks can be accurately analyzed from text description

**Status:** 🔵 Unknown
**Feature:** task-analyzer
**Confidence:** Medium
**Impact:** High
**Priority:** 85/100

**What we believe:**
The task title, description, and content contain sufficient information to determine complexity, value, compute needs, and urgency

**Why it matters:**
Foundation of the entire task analysis system. If wrong, we'd misroute tasks, waste resources, and misprioritize work.

**Challenges:** [task-analyzer-challenges.md](./challenges/task-analyzer-challenges.md#assumption-1)
**Total Questions:** 52 (across 6 categories)

**Validation Plan:**
- **Type:** Quantitative (correlation analysis)
- **Method:** Compare predicted complexity vs actual effort for 100 tasks
- **Success:** Correlation > 0.6, MAE < 30%
- **Est. Time:** 4-6 hours

**Next Steps:**
1. Collect 100 completed tasks with time tracking
2. Run complexity analyzer on each
3. Calculate correlation and error metrics
4. Document results in validation report

---
```

### View 2: Validation Dashboard

**Location:** `.blackbox5/roadmap/first-principles/VALIDATION-DASHBOARD.md`

```markdown
# Assumption Validation Dashboard

**Last Updated:** 2026-01-19

---

## Validation Progress

```
████████████████████████░░░░░░  71% Unknown (7/10)
██████████████░░░░░░░░░░░░░░░  29% Validated (0/10)
░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0% Invalidated (0/10)
░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0% Inconclusive (0/10)
```

## Recent Validations

*No validations completed yet*

## Upcoming Validations

1. **ASSUMPTION-0001** - Tasks can be analyzed from text (4-6h)
2. **ASSUMPTION-0004** - Task type from keywords (4-5h)
3. **ASSUMPTION-0002** - Log distribution (2-3h) ⚡ Quick Win

## Validation Impact

### What We've Learned
*Nothing yet*

### What Changed
*Nothing yet*

### Assumptions Invalidated (Needs Action)
*None yet*

---
```

---

## Workflow

### 1. Extract Assumptions

When a feature doc is created:

```bash
# Run assumption extractor
python .blackbox5/engine/scripts/extract-assumptions.py \
  --feature task-analyzer \
  --output .blackbox5/roadmap/first-principles/ASSUMPTION-REGISTRY.yaml
```

### 2. Generate Challenges

```bash
# Run assumption challenger
python .blackbox5/engine/scripts/challenge-assumptions.py \
  --assumption ASSUMPTION-0001 \
  --output .blackbox5/roadmap/first-principles/challenges/task-analyzer-challenges.md
```

### 3. Run Validation

```bash
# Run validation experiment
python .blackbox5/engine/scripts/validate-assumption.py \
  --assumption ASSUMPTION-0001 \
  --method quantitative \
  --output .blackbox5/roadmap/first-principles/validations/task-analyzer-validation.md
```

### 4. Update Registry

After validation:

```bash
# Update registry with results
python .blackbox5/engine/scripts/update-registry.py \
  --assumption ASSUMPTION-0001 \
  --status validated \
  --conclusion "Correlation 0.72, assumption validated"
```

---

## Priority Scoring

**Formula:**
```
Priority = (Impact × 100) + ((100 - Confidence) × 50)

Where:
- Impact: critical=100, high=75, medium=50, low=25
- Confidence: high=0, medium=50, low=100 (inverted for scoring)
```

**Examples:**
- High impact + low confidence = 75 + 50 = 125 (capped at 100)
- High impact + high confidence = 75 + 0 = 75
- Low impact + high confidence = 25 + 0 = 25

---

## Next Steps

1. [ ] Create ASSUMPTION-REGISTRY.yaml
2. [ ] Create ASSUMPTIONS-LIST.md (human view)
3. [ ] Create VALIDATION-DASHBOARD.md
4. [ ] Extract assumptions from task-analyzer.md
5. [ ] Extract assumptions from other feature docs
6. [ ] Create Python scripts for automation
7. [ ] Run first validation (ASSUMPTION-0002 - quick win)
