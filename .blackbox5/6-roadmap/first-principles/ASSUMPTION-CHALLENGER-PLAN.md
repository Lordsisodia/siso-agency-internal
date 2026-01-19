# Assumption Challenger Agent - System Design

**Date:** 2026-01-19
**Status:** Planning
**Purpose:** Generate challenging questions that test base assumptions in first-principles analysis

---

## Overview

We need an agent that can:
1. **Read** first-principles feature documents
2. **Analyze** all underlying assumptions
3. **Generate** tough, challenging questions for each assumption
4. **Help design** validation experiments
5. **Test both sides** to see what's actually true

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ASSUMPTION CHALLENGER SYSTEM                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐ │
│  │   INPUT      │─────▶│  CHALLENGER  │─────▶│   OUTPUT     │ │
│  │              │      │    AGENT     │      │              │ │
│  │ Feature doc  │      │              │      │ Challenges   │ │
│  │ (first-prin- │      │ - Read       │      │ + Validation │ │
│  │  ciples.md)  │      │ - Analyze    │      │   Plan       │ │
│  └──────────────┘      │ - Challenge  │      └──────────────┘ │
│                        │ - Validate   │                       │
│                        └──────────────┘                       │
│                             │                                 │
│                             ▼                                 │
│                        ┌──────────────┐                       │
│                        │   STORAGE    │                       │
│                        │              │                       │
│                        │ challenges/  │                       │
│                        │ validations/ │                       │
│                        └──────────────┘                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Input: First-Principles Feature Document

**Location:** `.blackbox5/roadmap/first-principles/features/{feature-name}.md`

**Contains:**
- Purpose
- How It Works
- Underlying Assumptions (with confidence levels)
- Technologies Used
- Workflows
- Agents

### 2. Processing: Challenger Agent

**Agent:** `assumption-challenger` (new skill/agent)

**Process:**
1. Parse the feature document
2. Extract all assumptions
3. For each assumption, generate:
   - 5-10 challenging questions
   - "What if opposite?" scenarios
   - Validation experiments
   - Success/failure criteria

### 3. Output: Challenges Document

**Location:** `.blackbox5/roadmap/first-principles/challenges/{feature-name}-challenges.md`

**Contains:**
- List of all assumptions
- Challenging questions for each
- Validation experiments
- Expected outcomes

### 4. Validation: Validation Agent

**Agent:** `assumption-validator` (new skill/agent)

**Process:**
1. Read challenges document
2. Design validation experiments
3. Run experiments (or help human run them)
4. Document results

### 5. Output: Validation Results

**Location:** `.blackbox5/roadmap/first-principles/validations/{feature-name}-validation.md`

**Contains:**
- What was tested
- How it was tested
- Results
- Conclusions
- Recommendations

---

## Directory Structure

```
.blackbox5/roadmap/first-principles/
├── features/                    # Input documents
│   ├── task-analyzer.md
│   ├── bmad-framework.md
│   └── ...
├── challenges/                  # Generated challenges (NEW)
│   ├── task-analyzer-challenges.md
│   ├── bmad-framework-challenges.md
│   └── ...
├── validations/                 # Validation results (NEW)
│   ├── task-analyzer-validation.md
│   ├── bmad-framework-validation.md
│   └── ...
└── TEMPLATE.md                  # Template for feature docs
```

---

## Challenger Agent Specification

### Agent Type: Skill

**Location:** `.blackbox5/engine/capabilities/skills/thinking-methodologies/assumption-challenger/SKILL.md`

### Trigger Conditions

Use this skill when:
- User asks to "challenge assumptions"
- User asks to "generate tough questions"
- User asks to "validate first-principles"
- A new feature document is added to `first-principles/features/`

### Inputs

1. **Feature document path** - Path to first-principles feature doc
2. **Challenge level** - mild/medium/aggressive (default: medium)
3. **Focus areas** - optional (e.g., "technology assumptions only")

### Outputs

1. **Challenges document** - Saved to `first-principles/challenges/`
2. **Validation plan** - How to test each assumption
3. **Priority list** - Which assumptions to validate first

### Capabilities

The challenger agent MUST be able to:

1. **Extract Assumptions**
   - Parse the "Underlying Assumptions" section
   - Identify implicit assumptions (not explicitly stated)
   - Categorize assumptions (technical, process, organizational)

2. **Generate Challenging Questions**
   - "What if the opposite is true?" questions
   - "How would we know if this is false?" questions
   - "What evidence supports this?" questions
   - "What breaks if this is wrong?" questions
   - "Who is harmed by this assumption?" questions
   - "When was this last validated?" questions

3. **Design Validation Experiments**
   - What to measure
   - How to measure it
   - Success criteria
   - Alternative approaches if assumption fails

4. **Prioritize Validation**
   - High-impact assumptions first
   - High-uncertainty assumptions first
   - Easy-to-validate assumptions first (quick wins)

---

## Question Generation Framework

For each assumption, generate questions in these categories:

### Category 1: Truth Testing
- What evidence do we have that this is true?
- What evidence would prove this is false?
- When was this last tested/validated?
- Has the context changed since this was established?

### Category 2: Opposite Scenarios
- What if the exact opposite is true?
- What would happen if we reversed this assumption?
- Who would benefit if this were false?
- What would a system look like that assumed the opposite?

### Category 3: Edge Cases
- When does this assumption break down?
- Are there exceptions we haven't considered?
- What happens at scale?
- What happens under stress/pressure?

### Category 4: Stakeholder Perspectives
- Who benefits from this assumption?
- Who is harmed by this assumption?
- Would a different persona/team/role disagree?
- What does the user/customer think about this?

### Category 5: Alternatives
- Could we achieve the same goal differently?
- What if we removed this entirely?
- What's the simplest version that still works?
- What's the most radical alternative?

### Category 6: Consequences
- What breaks if this is wrong?
- What's the worst case scenario?
- What's the best case scenario?
- What's the most likely scenario?
- How would we detect failure?

---

## Validation Framework

For each assumption, design a validation experiment:

### Validation Template

```markdown
## Validation: [Assumption Name]

**Assumption:** [What we believe]
**Confidence:** [high/medium/low]
**Impact if wrong:** [What breaks]

### Validation Experiment
**Type:** [quantitative/qualitative/competitive/A-B test]

**Method:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Success Criteria:**
- [Metric 1]: [Target value]
- [Metric 2]: [Target value]

**Failure Criteria:**
- [Metric 1]: [Value that proves assumption wrong]
- [Metric 2]: [Value that proves assumption wrong]

**Resources Required:**
- [What we need]
- [Time estimate]
- [Who needs to be involved]

**Alternative if False:**
- [What do we do if assumption is wrong?]
- [Backup plan]

**Status:** [planned/in-progress/completed]

**Results:**
- [What we found]
- [Conclusion: validated/invalidated/inconclusive]
```

---

## Implementation Plan

### Phase 1: Create Challenger Skill (2-3 hours)

**Tasks:**
1. [ ] Create skill directory structure
2. [ ] Write `SKILL.md` with detailed instructions
3. [ ] Create challenge generation templates
4. [ ] Create validation experiment templates
5. [ ] Test with `task-analyzer.md` as first example

**Deliverables:**
- `.blackbox5/engine/capabilities/skills/thinking-methodologies/assumption-challenger/SKILL.md`
- Challenge generation template
- Validation experiment template

### Phase 2: Create Challenger Agent (1-2 hours)

**Tasks:**
1. [ ] Create agent configuration
2. [ ] Write agent prompt
3. [ ] Integrate with skill
4. [ ] Test agent with sample feature doc

**Deliverables:**
- `.blackbox5/engine/agents/assumption-challenger/`
- Agent prompt
- Integration with skill

### Phase 3: Create Directory Structure (5 minutes)

**Tasks:**
1. [ ] Create `first-principles/challenges/` directory
2. [ ] Create `first-principles/validations/` directory
3. [ ] Add README files to each

**Deliverables:**
- Directory structure ready
- README files explaining purpose

### Phase 4: Test System (1-2 hours)

**Tasks:**
1. [ ] Run challenger agent on `task-analyzer.md`
2. [ ] Review generated challenges
3. [ ] Design validation experiments
4. [ ] Run 1-2 validations
5. [ ] Update feature doc with results

**Deliverables:**
- `task-analyzer-challenges.md`
- `task-analyzer-validation.md`
- Updated `task-analyzer.md` with validation results

### Phase 5: Iterate and Refine (1 hour)

**Tasks:**
1. [ ] Review challenge quality
2. [ ] Refine question generation
3. [ ] Improve validation templates
4. [ ] Document learnings

**Deliverables:**
- Improved templates
- Documentation of what works

---

## Integration Points

### With First-Principles Thinking Skill
- The `first-principles-thinking` skill creates feature docs
- The `assumption-challenger` skill challenges those docs
- They work together in a loop

### With Roadmap System
- Feature improvements tracked in roadmap
- Assumptions validated before implementation
- Reduces risk of building on wrong assumptions

### With BMAD/GSD Frameworks
- Use BMAD agents for validation experiments
- Use GSD task tracking for validation tasks

---

## Success Criteria

### Minimum Acceptable
- [x] Challenger agent generates 5+ questions per assumption
- [x] Questions are genuinely challenging (not obvious)
- [x] Validation experiments are actionable
- [x] System works on first feature doc

### Excellent
- [x] 10+ questions per assumption
- [x] Questions cover all 6 categories
- [x] Validation experiments are comprehensive
- [x] System catches real flaws in assumptions
- [x] Validations change our approach

---

## Next Steps

1. [ ] Create the `assumption-challenger` skill
2. [ ] Set up directory structure (`challenges/`, `validations/`)
3. [ ] Test with `task-analyzer.md`
4. [ ] Run first validation
5. [ ] Document results
6. [ ] Iterate on other feature docs

---

## Questions to Resolve

1. **Should this be a skill or an agent?**
   - **Recommendation:** Start as a skill, can become agent if needed
   - Skills are more flexible, easier to integrate

2. **Should validation be automatic or manual?**
   - **Recommendation:** Semi-automatic
   - Agent generates experiments, human decides to run

3. **How do we track validation status?**
   - **Recommendation:** Add to feature doc YAML frontmatter
   - Add `assumptions_validated: X/Y` field

4. **What happens when an assumption is invalidated?**
   - **Recommendation:** Update feature doc, create improvement proposal
   - Track in roadmap as new improvement

5. **How often do we re-validate assumptions?**
   - **Recommendation:** When context changes or every 6 months
   - Add `last_validated` date to each assumption
