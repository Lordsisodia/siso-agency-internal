# First Principles System - User Guide

**Last Updated:** 2026-01-19
**Status:** Ready to Use

---

## Overview

The First Principles System helps us:
1. **Document** every feature and its underlying assumptions
2. **Challenge** those assumptions with tough questions
3. **Validate** what's actually true
4. **Track** validation status across all assumptions
5. **Improve** the system based on what we learn

---

## File Structure

```
.blackbox5/roadmap/first-principles/
├── README.md                           # System overview
├── TEMPLATE.md                          # Template for feature docs
│
├── features/                            # Feature documentation (input)
│   └── task-analyzer.md                 # Example feature doc
│
├── challenges/                          # Generated challenges (output)
│   ├── README.md                        # Directory overview
│   └── task-analyzer-challenges.md      # Example challenges
│
├── validations/                         # Validation results (output)
│   ├── README.md                        # Directory overview
│   └── {feature}-validation.md          # Validation results (when complete)
│
├── ASSUMPTION-REGISTRY.yaml            # MASTER DATABASE (all assumptions)
├── ASSUMPTIONS-LIST.md                  # Human-readable view
├── VALIDATION-DASHBOARD.md              # Validation progress dashboard
│
├── ASSUMPTION-CHALLENGER-PLAN.md        # System design
└── ASSUMPTION-REGISTRY-DESIGN.md        # Registry design
```

---

## How to Use

### 1. Document a Feature

When you want to analyze a feature from first principles:

```bash
# Create a new feature document
cp .blackbox5/roadmap/first-principles/TEMPLATE.md \
   .blackbox5/roadmap/first-principles/features/my-feature.md

# Fill in the template:
# - Purpose
# - How It Works
# - Underlying Assumptions (with confidence & impact)
# - Technologies Used
# - Workflows
# - Agents
# - Challenges (will be filled by agent)
# - Validation Results (will be filled after validation)
```

### 2. Generate Challenges

Use the **assumption-challenger** skill to generate challenges:

```bash
# The skill reads the feature doc and generates:
# - 6-10 challenging questions per assumption
# - Questions in 6 categories
# - Validation experiment designs
# - Priority ranking

# Output saved to:
# .blackbox5/roadmap/first-principles/challenges/my-feature-challenges.md
```

### 3. Update the Registry

After generating challenges, add assumptions to the master registry:

```bash
# Edit ASSUMPTION-REGISTRY.yaml
# Add each assumption with:
# - id: ASSUMPTION-XXXX
# - feature: my-feature
# - assumption: "What we believe"
# - confidence: high/medium/low
# - impact: critical/high/medium/low
# - priority_score: 0-100
# - challenges_link: path to challenges doc
```

### 4. Run Validations

Follow the validation plan from the challenges document:

```bash
# For each assumption you want to validate:
# 1. Read the validation experiment design
# 2. Run the experiment
# 3. Document results in validations/my-feature-validation.md
```

### 5. Update Validation Status

After validation completes:

```yaml
# In ASSUMPTION-REGISTRY.yaml, update:
status: "validated"  # or "invalidated" or "inconclusive"
validation_link: ".blackbox5/roadmap/first-principles/validations/my-feature-validation.md"
validation_date: "2026-01-19T12:00:00Z"
validation_result: "Correlation 0.72, assumption validated"
conclusion: "Text analysis correlates strongly with actual complexity"
```

---

## Quick Reference

### For Feature Documentation

| What | Where | Template |
|------|-------|----------|
| New feature doc | `features/{name}.md` | TEMPLATE.md |
| Example | `features/task-analyzer.md` | - |

### For Challenges

| What | Where | How |
|------|-------|-----|
| View challenges | `challenges/{name}-challenges.md` | Auto-generated |
| Generate challenges | Use **assumption-challenger** skill | See SKILL.md |

### For Validation Tracking

| What | Where | Format |
|------|-------|--------|
| Master database | `ASSUMPTION-REGISTRY.yaml` | YAML (machine-readable) |
| Human-readable list | `ASSUMPTIONS-LIST.md` | Markdown |
| Progress dashboard | `VALIDATION-DASHBOARD.md` | Markdown |

---

## Priority Scoring

**Formula:**
```
Priority Score = (Impact × 100) + ((100 - Confidence) × 50)
```

**Impact Values:**
- Critical = 100
- High = 75
- Medium = 50
- Low = 25

**Confidence Values (inverted for scoring):**
- High = 0 (we're sure, lower priority to validate)
- Medium = 50 (somewhat sure, medium priority)
- Low = 100 (unsure, high priority to validate)

**Examples:**
- High impact + Low confidence = 75 + 50 = 125 (capped at 100) ⚠️ **CRITICAL**
- High impact + High confidence = 75 + 0 = 75 🔥 **HIGH PRIORITY**
- Low impact + High confidence = 25 + 0 = 25 ⭐ **LOW PRIORITY**

---

## Current Status

### Assumptions

| Status | Count |
|--------|-------|
| 🔵 Unknown | 7 |
| 🟢 Validated | 0 |
| 🔴 Invalidated | 0 |
| 🟡 Inconclusive | 0 |

### Top Priorities

1. **ASSUMPTION-0001** (85/100) - Tasks can be analyzed from text
   - Why: Foundation of system
   - Time: 4-6 hours

2. **ASSUMPTION-0004** (75/100) - Task type from keywords
   - Why: High impact on routing
   - Time: 4-5 hours

3. **ASSUMPTION-0006** (70/100) - Token estimation possible
   - Why: Low confidence
   - Time: Weeks (data collection)

### Quick Win

**ASSUMPTION-0002** (60/100) - Log scaling matches distribution
- Time: 2-3 hours
- Why: Quickest validation

---

## Next Steps

### Immediate (This Week)

1. ✅ **System deployed** - Complete
2. ⬜ **Validate ASSUMPTION-0002** - Quick win (2-3h)
3. ⬜ **Validate ASSUMPTION-0001** - High priority (4-6h)

### Short-term (This Month)

4. ⬜ **Validate ASSUMPTION-0004** - High priority (4-5h)
5. ⬜ **Document more features** - Expand registry
6. ⬜ **Create automation scripts** - Streamline workflow

---

## Questions & Answers

### Q: Where do I start?

**A:** Start with the quick win:
1. Read `challenges/task-analyzer-challenges.md`
2. Find ASSUMPTION-0002 (log distribution)
3. Run the validation experiment (2-3 hours)
4. Document results
5. Update `ASSUMPTION-REGISTRY.yaml`

### Q: How do I add a new feature?

**A:**
1. Copy `TEMPLATE.md` to `features/my-feature.md`
2. Fill in all sections (especially assumptions)
3. Use assumption-challenger skill to generate challenges
4. Add assumptions to `ASSUMPTION-REGISTRY.yaml`
5. Re-generate `ASSUMPTIONS-LIST.md` and `VALIDATION-DASHBOARD.md`

### Q: What if an assumption is invalidated?

**A:**
1. Document why it's wrong in validation results
2. Update `ASSUMPTION-REGISTRY.yaml` with `status: invalidated`
3. Create an improvement proposal in roadmap system
4. Update the feature doc with corrected understanding
5. Re-challenge new assumptions if needed

### Q: How do I see all assumptions?

**A:** Three views:
1. **Machine-readable:** `ASSUMPTION-REGISTRY.yaml` (all data)
2. **Human-readable:** `ASSUMPTIONS-LIST.md` (formatted list)
3. **Progress tracking:** `VALIDATION-DASHBOARD.md` (validation status)

### Q: Can I filter assumptions?

**A:** Yes! In `ASSUMPTIONS-LIST.md`:
- Filter by status (unknown, validated, invalidated)
- Filter by priority (critical, high, medium, low)
- Filter by confidence (high, medium, low)
- Filter by domain (task-management, agents, etc.)
- Filter by category (technical, strategic, etc.)

### Q: How do I know what to validate first?

**A:** Check `VALIDATION-DASHBOARD.md`:
1. Look at "Validation Priority Queue"
2. Start with high-priority items
3. Look for "Quick Win" markers
4. Consider validation time estimates

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    WORKFLOW                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. FEATURE DOC CREATED                                     │
│     .blackbox5/roadmap/first-principles/features/{name}.md  │
│                                                              │
│  2. ASSUMPTION CHALLENGER RUNS                              │
│     Reads feature doc → Generates challenges                │
│                                                              │
│  3. CHALLENGES DOCUMENT CREATED                             │
│     .blackbox5/roadmap/first-principles/challenges/         │
│         {name}-challenges.md                                 │
│                                                              │
│  4. ASSUMPTIONS ADDED TO REGISTRY                           │
│     ASSUMPTION-REGISTRY.yaml (master DB)                    │
│                                                              │
│  5. VALIDATION EXPERIMENTS RUN                              │
│     Following challenges doc validation plan                │
│                                                              │
│  6. VALIDATION RESULTS DOCUMENTED                           │
│     .blackbox5/roadmap/first-principles/validations/        │
│         {name}-validation.md                                │
│                                                              │
│  7. REGISTRY UPDATED                                        │
│     Status changed: unknown → validated/invalidated          │
│                                                              │
│  8. VIEWS REGENERATED                                        │
│     ASSUMPTIONS-LIST.md, VALIDATION-DASHBOARD.md            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Success Metrics

### System Health

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Assumptions documented | 7 | 50+ | ✅ Growing |
| Assumptions validated | 0 (0%) | 25+ (50%) | ❌ Need to start |
| High-priority validated | 0/3 (0%) | 3/3 (100%) | ❌ Urgent |
| Low-confidence validated | 0/1 (0%) | 1/1 (100%) | ❌ Urgent |

### Quality Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Questions per assumption | 6-10 | 7.4 avg ✅ |
| Categories covered | 6 | 6 ✅ |
| Validation experiments designed | 100% | 100% ✅ |
| Priority scoring accuracy | Good | Good ✅ |

---

## Related Systems

### Roadmap System
- Feature improvements tracked in `../roadmap/`
- Assumptions inform improvement decisions
- Invalidated assumptions create new improvements

### Skills
- **assumption-challenger** - Generates challenges (see: `.blackbox5/engine/capabilities/skills/thinking-methodologies/assumption-challenger/SKILL.md`)
- **first-principles-thinking** - Creates feature docs (see: `.blackbox5/engine/capabilities/skills/thinking-methodologies/first-principles-thinking/SKILL.md`)

### Task Management
- Validated assumptions improve task routing
- Task analyzer assumptions need validation

---

**Last Updated:** 2026-01-19
**Status:** ✅ System Ready to Use
**Next Action:** Validate ASSUMPTION-0002 (quick win)
