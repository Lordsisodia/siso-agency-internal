# Skill: Assumption Challenger

## Purpose

Generate **challenging questions** that test base assumptions in first-principles analysis. This skill takes a feature document and subjects every assumption to rigorous scrutiny by generating tough questions across 6 categories.

This skill is designed for **first-principles validation** where:
- Assumptions need to be tested before building
- We need to identify flaws in our thinking
- We need to validate what we believe is true
- We want to avoid building on wrong foundations

## Trigger (when to use)

Use when any of the following is true:
- The user asks to "challenge assumptions" or "test assumptions"
- A new feature document is added to `first-principles/features/`
- The user asks "what if we're wrong about X?"
- The user asks to validate first-principles analysis
- We need to design validation experiments

## Outputs (artifacts)

1. A **challenges document** (markdown) with:
   - All assumptions extracted from feature doc
   - 6-10 challenging questions per assumption
   - Questions organized by 6 categories (Truth, Opposite, Edge Cases, Stakeholders, Alternatives, Consequences)
   - Validation experiment design for each assumption
   - Priority ranking for validation

2. A **validation plan** (markdown) with:
   - What to test
   - How to test it
   - Success criteria
   - Alternative approaches if assumption fails

3. **Updated feature document** with:
   - Link to challenges document
   - Validation status tracking

## Key requirements

This skill MUST be able to:

### (A) Extract Assumptions
- Parse the "Underlying Assumptions" section from feature docs
- Identify implicit assumptions (not explicitly stated)
- Categorize assumptions by type (technical, process, organizational)
- Assess confidence level and impact

### (B) Generate Challenging Questions
Generate questions in 6 categories:
1. **Truth Testing** - What evidence supports this?
2. **Opposite Scenarios** - What if the reverse is true?
3. **Edge Cases** - When does this break down?
4. **Stakeholder Perspectives** - Who disagrees with this?
5. **Alternatives** - Could we achieve this differently?
6. **Consequences** - What breaks if this is wrong?

### (C) Design Validation Experiments
For each assumption, design:
- What to measure
- How to measure it
- Success criteria (what proves it's true)
- Failure criteria (what proves it's false)
- Alternative approach if assumption is wrong

### (D) Prioritize Validation
Rank assumptions by:
- Impact (what breaks if wrong?)
- Uncertainty (how confident are we?)
- Ease of validation (can we test this quickly?)

## Step-by-step framework

### Phase 1: Read Feature Document

**Goal:** Understand the feature and extract assumptions

**Steps:**
- [ ] Read feature document from `.blackbox5/roadmap/first-principles/features/{name}.md`
- [ ] Extract "Underlying Assumptions" section
- [ ] Extract implicit assumptions from "How It Works", "Technologies", "Workflows"
- [ ] Note confidence levels and impact assessments

**Output:** List of all assumptions (explicit + implicit)

---

### Phase 2: Generate Questions for Each Assumption

**Goal:** Subject each assumption to rigorous scrutiny

**For each assumption, generate questions in 6 categories:**

#### Category 1: Truth Testing
- What evidence do we have that this is true?
- What evidence would prove this is false?
- When was this last tested/validated?
- Has the context changed since this was established?
- How would we know if this stopped being true?
- What metrics would indicate this is wrong?

#### Category 2: Opposite Scenarios
- What if the exact opposite is true?
- What would happen if we reversed this assumption?
- Who would benefit if this were false?
- What would a system look like that assumed the opposite?
- What if we built the inverse of this?
- Could the opposite also work?

#### Category 3: Edge Cases
- When does this assumption break down?
- Are there exceptions we haven't considered?
- What happens at scale (10x, 100x)?
- What happens under stress/pressure?
- What happens in edge cases?
- What's the boundary condition where this fails?

#### Category 4: Stakeholder Perspectives
- Who benefits from this assumption?
- Who is harmed by this assumption?
- Would a different persona/team/role disagree?
- What does the user/customer think about this?
- Would experts in this field agree?
- Who would challenge this and why?

#### Category 5: Alternatives
- Could we achieve the same goal differently?
- What if we removed this entirely?
- What's the simplest version that still works?
- What's the most radical alternative?
- What if we used a completely different approach?
- What would a competitor say about this?

#### Category 6: Consequences
- What breaks if this is wrong?
- What's the worst case scenario?
- What's the best case scenario?
- What's the most likely scenario?
- How would we detect failure?
- What's the recovery cost if this fails?

**Output:** 6-10 challenging questions per assumption, categorized

---

### Phase 3: Design Validation Experiments

**Goal:** Create actionable tests for each assumption

**For each assumption, design:**

**Validation Type:**
- Quantitative (metrics, A/B tests)
- Qualitative (interviews, reviews)
- Competitive (compare with alternatives)
- Thought Experiment (what-if scenarios)

**Method:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Success Criteria:**
- [Metric 1]: [Value that proves assumption true]
- [Metric 2]: [Value that proves assumption true]

**Failure Criteria:**
- [Metric 1]: [Value that proves assumption false]
- [Metric 2]: [Value that proves assumption false]

**Resources Required:**
- Time: [X hours/days]
- Tools: [What we need]
- People: [Who needs to be involved]

**Alternative if False:**
- [What do we do if assumption is wrong?]
- [Backup plan]

**Output:** Validation experiment design for each assumption

---

### Phase 4: Prioritize Validation

**Goal:** Determine which assumptions to validate first

**Prioritization Matrix:**

| Priority | Impact | Uncertainty | Ease | Examples |
|----------|--------|-------------|------|----------|
| 🔥🔥🔥 Critical | High | High | Easy | Do first |
| 🔥🔥 High | High | Medium | Medium | Do soon |
| 🔥 Medium | Medium | High | Hard | Do when possible |
| ⭐ Low | Low | Low | Any | Do if time |

**Sort by:**
1. Impact (what breaks if wrong?)
2. Uncertainty (how confident are we?)
3. Ease (how fast can we validate?)

**Output:** Ranked list of assumptions to validate

---

### Phase 5: Generate Output Documents

**Goal:** Create challenges and validation plan documents

**Document 1: Challenges Document**
- Location: `.blackbox5/roadmap/first-principles/challenges/{feature-name}-challenges.md`
- Contains: All assumptions, all questions, all categories

**Document 2: Validation Plan**
- Location: Can be part of challenges doc or separate
- Contains: Validation experiments, success criteria, alternatives

**Document 3: Update Feature Doc**
- Add link to challenges document
- Add validation status to YAML frontmatter

**Output:** All documents created and saved

---

## Output Templates

### Template 1: Challenges Document

```markdown
# Challenges: [Feature Name]

**Generated:** [YYYY-MM-DD]
**Feature:** [Link to feature doc]
**Total Assumptions:** X
**Total Questions:** Y

---

## Assumption 1: [Name from feature doc]

**What we believe:** [Exact statement from feature doc]
**Confidence:** [high/medium/low]
**Impact if wrong:** [From feature doc]

### Questions

#### Truth Testing
- What evidence do we have that [assumption statement]?
- What would prove this is false?
- [4 more questions...]

#### Opposite Scenarios
- What if the opposite is true?
- [5 more questions...]

#### Edge Cases
- When does this break down?
- [5 more questions...]

#### Stakeholder Perspectives
- Who would disagree with this?
- [5 more questions...]

#### Alternatives
- Could we achieve this differently?
- [5 more questions...]

#### Consequences
- What breaks if this is wrong?
- [5 more questions...]

### Validation Experiment

**Type:** [quantitative/qualitative/competitive/thought-experiment]

**Method:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Success Criteria:**
- [Metric 1]: [Value]
- [Metric 2]: [Value]

**Failure Criteria:**
- [Metric 1]: [Value]
- [Metric 2]: [Value]

**Resources:**
- Time: [X hours]
- Tools: [What we need]

**Alternative if False:**
- [What we do if assumption is wrong]

---

## Assumption 2: [Name]
[Same structure]

---

## Priority Validation Order

1. **[Assumption X]** - High impact, high uncertainty, easy to validate
2. **[Assumption Y]** - High impact, medium uncertainty
3. **[Assumption Z]** - Medium impact, easy win

---

## Summary

- **Total Assumptions:** X
- **Total Questions Generated:** Y
- **High Priority Validations:** A
- **Medium Priority Validations:** B
- **Low Priority Validations:** C

**Estimated Validation Time:** [X hours]

**Quick Wins (Complete in < 1 hour):**
- [Assumption 1]
- [Assumption 2]
```

---

## Quality Bar (what "good" looks like)

### Minimum Acceptable Output
- ✅ All assumptions extracted (explicit + implicit)
- ✅ At least 5 questions per assumption
- ✅ Questions cover at least 4 categories
- ✅ Validation experiments designed for each assumption
- ✅ Priority ranking provided

### Excellent Output
- ✅ All assumptions extracted (including implicit ones)
- ✅ 10+ questions per assumption
- ✅ Questions cover all 6 categories thoroughly
- ✅ Validation experiments are specific and actionable
- ✅ Priority ranking is well-reasoned
- ✅ Questions are genuinely challenging (not obvious)
- ✅ Alternative approaches are creative
- ✅ Some questions expose real flaws in assumptions

### Red Flags (signs of shallow thinking)
- ❌ Only extracts explicit assumptions (misses implicit ones)
- ❌ Generates obvious questions ("what if this is wrong?")
- ❌ Questions are repetitive across categories
- ❌ Validation experiments are vague ("test this")
- ❌ No priority ranking
- ❌ Questions aren't actually challenging
- ❌ Confirmation bias (only looking for proof, not disproof)

---

## Common Patterns & Anti-Patterns

### Good Patterns
- **"How would we know if X is false?"** - Tests falsifiability
- **"What happens at 100x scale?"** - Tests boundary conditions
- **"Who would be harmed by this?"** - Tests stakeholder perspectives
- **"What's the simplest alternative?"** - Tests necessity
- **"When did we last validate this?"** - Tests staleness

### Anti-Patterns to Avoid
- **"Is X true?"** - Too obvious, doesn't test anything
- **"We should validate X"** - Doesn't say how
- **Questions that assume the answer** - Leading questions
- **Only looking for confirming evidence** - Confirmation bias
- **Asking "why?" without specificity** - Too vague

---

## Integration with Other Skills

### Works Well With
- **first-principles-thinking** - Challenges the assumptions it generates
- **deep-research** - Research can provide evidence for validation
- **feedback-triage** - Challenges assumptions in user feedback

### Can Be Combined With
- **sequential-thinking** - Use for deeper reasoning per assumption
- **test-driven-development** - Turn validation experiments into tests

### When NOT to Use
- For well-established facts (e.g., "Python is a programming language")
- For trivial assumptions (low impact, high confidence)
- When there are no assumptions to challenge
- When time is extremely limited

---

## Examples

After running this skill on `task-analyzer.md`, we would generate:

### Assumption 1: "Tasks can be accurately analyzed from text description"

**Questions generated:**
- **Truth Testing:** What evidence do we have that text correlates with actual complexity? How would we know if text analysis is insufficient?
- **Opposite Scenarios:** What if text descriptions are systematically misleading? What if the best analysis comes from code inspection, not text?
- **Edge Cases:** When does text analysis break down? What about tasks with minimal description but maximal complexity?
- **Stakeholder Perspectives:** Would developers agree that task descriptions reflect reality? What do PMs think about this?
- **Alternatives:** Could we analyze git history instead? Could we analyze past time tracking?
- **Consequences:** What breaks if text analysis is only 50% accurate? What's the cost of misrouting tasks?

**Validation Experiment:**
- Analyze 100 completed tasks
- Compare predicted complexity vs actual time spent
- Measure correlation
- Success: > 0.6 correlation
- Failure: < 0.3 correlation

---

## Notes

- The goal is **genuine challenge**, not confirmation bias
- Questions should make us **uncomfortable**, not reassured
- If an assumption survives this questioning, it's solid
- If it doesn't, we've saved ourselves from building on wrong foundations
- Best questions are the ones that expose **real flaws**

---

**Last Updated:** 2026-01-19
**Version:** 1.0
**Status:** Ready for Implementation
