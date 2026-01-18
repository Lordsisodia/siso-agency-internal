# Skill: First-Principles Thinking

## Purpose

Apply **first-principles reasoning** to any problem—technical, business, organizational, or product—by breaking down assumptions, identifying fundamental truths, and generating novel solutions that address root causes rather than symptoms.

This skill is designed for **complex problems** where:
- Conventional wisdom may be wrong
- Assumptions need questioning
- Multiple stakeholder perspectives exist
- Innovation is needed, not optimization
- Understanding "why" matters more than "how"

## Trigger (when to use)

Use when any of the following is true:
- The user asks for "first principles," "fundamental analysis," "rethink from scratch"
- The problem seems stuck or keeps recurring (solution addresses symptoms)
- You need to challenge assumptions or conventional wisdom
- Multiple options exist and you need to choose based on fundamentals
- The problem spans multiple domains (technical + business + organizational)
- You want to understand what *truly* matters, not what *appears* to matter

## Outputs (artifacts)

1. A **comprehensive analysis document** (markdown) with:
   - Executive summary of insights
   - First-principles framework breakdown
   - Improvements organized by category
   - Priority matrix (quick wins vs strategic)
   - Success metrics

2. An **actionable improvements list** (prioritized by impact/effort)

3. **Visual diagrams** (ASCII art) showing:
   - Current state flows
   - Relationship maps
   - Cognitive load sources
   - Information architecture
   - Workflow friction points

4. An **executable plan** (checklist-based) with:
   - Task breakdown
   - Dependencies
   - Time/effort estimates
   - Success criteria
   - Verification steps

5. (Optional) A **plan folder** in `agents/.plans/` for follow-through

## Key requirements

This skill MUST be able to:

### (A) Strip away assumptions
Question every "that's how it's done" and "everyone knows X." Identify what is *actually* true vs. what is *believed* to be true.

### (B) Identify fundamental truths
Distinguish between:
- **Means** vs. **ends** (what we want vs. how we get there)
- **Symptoms** vs. **root causes** (what we see vs. what causes it)
- **Constraints** vs. **preferences** (what limits us vs. what we like)
- **Essential** vs. **accidental** (what matters vs. what's tradition)

### (C) Generate multiple solution approaches
Don't settle for the first obvious answer. Explore:
- Conservative optimizations (improve existing)
- Moderate innovations (rethink parts)
- Radical transformations (rebuild from scratch)

### (D) Produce all 4 output formats
Deliver comprehensive analysis, actionable list, visual diagrams, AND executable plan—not just one.

## Step-by-step framework

### Phase 0: Clarify the scope (1–3 questions max)

If the user prompt is missing critical context, ask only what's needed to proceed.

**Minimum info to collect:**
- **Domain:** Technical, business, organizational, product, or mixed?
- **Stakeholders:** Who will use/be affected by the analysis?
- **Constraints:** Time, budget, political realities, risk tolerance
- **Output preference:** All 4 formats or specific ones?

### Phase 1: Deconstruct (Strip assumptions)

**Goal:** Map current state WITHOUT bias or assumptions.

**Steps:**
- [ ] List all assumptions about the problem ("X is true because...")
- [ ] Identify which assumptions are *tested truths* vs. *unquestioned beliefs*
- [ ] Map the current state as it *actually is*, not as it *should be*
- [ ] Question "why?" at least 5 times to reach fundamental truths
- [ ] Distinguish between **observed facts** and **inferred conclusions**

**Output:** Current state map + assumption list

**Guiding questions:**
- What do we *know* is true? (evidence-backed)
- What do we *believe* is true? (assumed, not tested)
- What *should* be true? (desired, not actual)
- What *would* be true if we started from scratch?

---

### Phase 2: Identify Core Purpose

**Goal:** Find the TRUE end, not just the current means.

**Steps:**
- [ ] Ask: "What problem are we *actually* trying to solve?"
- [ ] Separate **ends** (outcomes) from **means** (methods)
- [ ] Identify **who benefits** and **how they benefit**
- [ ] Define **success** in fundamental terms (not existing metrics)
- [ ] Question whether the current approach even serves the core purpose

**Output:** Core purpose statement + success definition

**Guiding questions:**
- If we deleted everything and started over, what would we rebuild?
- What is the *irreducible* core of what we're trying to achieve?
- Who cares about this and why?
- What does "good" look like from the user's perspective?
- What does "bad" look like and why does it happen?

---

### Phase 3: Analyze Current State

**Goal:** Understand what works, what doesn't, and why.

**Steps:**
- [ ] Assess **what works** (keep or improve)
- [ ] Assess **what doesn't work** (fix or remove)
- [ ] Identify **assumptions** that may be wrong
- [ ] Identify **constraints** (real vs. perceived)
- [ ] Map **stakeholder needs** (users, customers, team, business)
- [ ] Assess **cognitive load** (where is friction?)
- [ ] Identify **information flow** (how does info move?)
- [ ] Identify **decision points** (who decides what?)

**Output:** Current state analysis with problems identified

**Guiding questions:**
- Where do people get stuck? Why?
- What questions do we keep answering? Why do they keep coming up?
- What information is hard to find? Why?
- What takes longer than it should? Why?
- What breaks repeatedly? Why?
- Who is frustrated by what? Why?

---

### Phase 4: Generate Insights (First-Principles Analysis)

**Goal:** Apply first-principles thinking to identify *root* issues, not symptoms.

**Steps:**
- [ ] **Cognitive Load Analysis:** Where is mental effort wasted?
  - Discovery load (finding things)
  - Relationship load (understanding connections)
  - State load (remembering context)
  - Decision load (choosing between options)

- [ ] **Information Architecture Analysis:** How is information organized?
  - Is it structured by *storage* or *understanding*?
  - Can users find what they need without reading everything?
  - Are relationships explicit or implicit?
  - Is there semantic meaning or just structural hierarchy?

- [ ] **Workflow Friction Analysis:** How does work actually flow?
  - Static structure vs. dynamic work (mismatch?)
  - Context switching between directories/systems
  - Handoff friction (between agents, teams, systems)
  - Bottlenecks in decision-making

- [ ] **Scalability Analysis:** What breaks at scale?
  - Single points of failure
  - Coupling that prevents independent evolution
  - Knowledge silos that create bus factor risk
  - Process bottlenecks

- [ ] **Maintenance Analysis:** What creates ongoing burden?
  - Technical debt accumulation
  - Documentation maintenance
  - Training/onboarding new people
  - Keeping systems in sync

**Output:** Insights organized by category with root cause identification

**Guiding questions:**
- Organization ≠ Understanding: Is it well-organized but hard to understand?
- Multiple Users, Multiple Needs: Are we optimizing for one user at others' expense?
- Static Structure, Dynamic Work: Does the structure match actual workflows?
- Documentation vs Discovery: Do we have docs but no way to find answers?

---

### Phase 5: Design Solutions

**Goal:** Generate solutions that address *root causes*, not symptoms.

**Steps:**
- [ ] **Quick Wins** (under 1 hour, high impact)
  - Discovery improvements (indexes, search)
  - Navigation improvements (symlinks, clear names)
  - Documentation improvements (purpose markers, context)

- [ ] **High Value** (2-4 hours, high impact)
  - Visual maps and diagrams
  - Workflow checklists
  - Framework consolidation
  - Interactive guidance

- [ ] **Strategic** (4-8 hours, long-term value)
  - API layers (stable interfaces)
  - Plugin systems (extensibility)
  - Architecture redesigns

- [ ] **For each solution:**
  - What root cause does it address?
  - What is the expected impact?
  - What is the effort required?
  - What are the risks?
  - How do we measure success?

**Output:** Prioritized solutions list with impact/effort matrix

---

### Phase 6: Create Action Plan

**Goal:** Turn insights into *executable* next steps.

**Steps:**
- [ ] **Organize by priority:**
  - 🔥🔥🔥 Critical (do first)
  - 🔥🔥 High (do soon)
  - 🔥 Medium (do when possible)
  - ⭐ Strategic (plan for)

- [ ] **For each priority tier:**
  - List improvements
  - Estimate time/effort
  - Identify dependencies
  - Define success metrics
  - Specify verification method

- [ ] **Create timeline:**
  - What can be done in parallel?
  - What must be sequential?
  - What are the milestones?

**Output:** Executable plan with priorities and timeline

---

### Phase 7: Document and Deliver

**Goal:** Produce all 4 output formats for the user.

**Steps:**

#### 7.1: Comprehensive Markdown Document
- [ ] Use the template below
- [ ] Include all sections
- [ ] Add specific examples from the analysis
- [ ] Save to appropriate location (`.docs/` or plan folder)

#### 7.2: Actionable Improvements List
- [ ] Extract top 20 improvements
- [ ] Organize by priority matrix
- [ ] Add time estimates
- [ ] Mark quick wins

#### 7.3: Visual Diagrams
- [ ] Create current state flow diagram
- [ ] Create relationship map (components → relationships)
- [ ] Create cognitive load diagram (sources → impact)
- [ ] Create information architecture diagram
- [ ] Create workflow friction diagram (flow → bottlenecks)
- [ ] Use ASCII art for clarity

#### 7.4: Executable Plan
- [ ] Create checklist-based plan
- [ ] Use existing plan format (`checklist.md`)
- [ ] Add task dependencies
- [ ] Include verification steps
- [ ] Save to `.plans/active/` if follow-through needed

**Output:** All 4 formats delivered

---

## Output Templates

### Template 1: Comprehensive Markdown Document

```markdown
# [Problem/SYSTEM]: First-Principles Analysis

**Date:** [YYYY-MM-DD]
**Domain:** [Technical/Business/Organizational/Product]
**Analyst:** [Your name/agent]

---

## Executive Summary

**[2-3 sentence overview of the core insights and top recommendation]**

**Key Finding:** [The most important insight from first-principles analysis]

**Top Recommendation:** [What should be done first, based on impact/effort]

**Expected Impact:** [What improvement this will deliver]

---

## First-Principles Framework

### Phase 1: Deconstruct
**Assumptions Questioned:**
- [Assumption 1] → [Actual truth]
- [Assumption 2] → [Actual truth]

**Current State Map:** [What actually exists, stripped of assumptions]

### Phase 2: Core Purpose
**True Problem:** [What problem are we actually solving?]

**Current Means:** [How we currently try to solve it]

**Core Purpose:** [What we actually want to achieve]

**Success Definition:** [What does "good" look like fundamentally?]

### Phase 3: Current State Analysis
**What Works:**
- [Strength 1]
- [Strength 2]

**What Doesn't Work:**
- [Weakness 1] → Root Cause: [First-principles explanation]
- [Weakness 2] → Root Cause: [First-principles explanation]

**Stakeholder Needs:**
- [Stakeholder Group]: [What they need] → [Current gap]

### Phase 4: Insights (First-Principles Analysis)

#### Insight 1: [Category Name]
**Observation:** [What we see happening]

**First-Principles Explanation:** [Why this happens at a fundamental level]

**Impact:** [How this affects the system/users]

**Examples:** [Specific instances]

#### Insight 2: [Category Name]
[Same structure]

#### Insight 3: [Category Name]
[Same structure]

### Phase 5: Solutions

#### Priority: 🔥🔥🔥 Quick Wins (Under 1 hour)
1. **[Improvement Name]**
   - **Root Cause:** [What it addresses]
   - **Impact:** [Expected outcome]
   - **Effort:** [Time estimate]
   - **Risk:** [Potential downsides]

2. **[Improvement Name]**
   [Same structure]

#### Priority: 🔥🔥 High Value (2-4 hours)
[Same format]

#### Priority: 🔥 Medium (2-4 hours)
[Same format]

#### Priority: ⭐ Strategic (4-8 hours, long-term)
[Same structure]

### Phase 6: Action Plan

**Immediate Actions (This Week):**
- [ ] [Task 1] - [Time] - [Owner if known]
- [ ] [Task 2] - [Time] - [Owner if known]

**Short-term (This Month):**
- [ ] [Task 1] - [Time] - [Owner if known]
- [ ] [Task 2] - [Time] - [Owner if known]

**Strategic (This Quarter):**
- [ ] [Task 1] - [Time] - [Owner if known]
- [ ] [Task 2] - [Time] - [Owner if known]

### Phase 7: Success Metrics

**Before State:**
- [Metric 1]: [Current value]
- [Metric 2]: [Current value]

**Target State:**
- [Metric 1]: [Target value]
- [Metric 2]: [Target value]

**Measurement Method:**
- [How we'll track each metric]

---

## Appendix

### Methodology Notes
[Any notes on the analysis process, sources consulted, etc.]

### Related Documents
[Links to related docs, plans, etc.]
```

---

### Template 2: Visual Diagrams

```ascii
# Current State Flow Diagram

┌─────────────┐
│   INPUT     │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐
│  PROCESS A  │────▶│  DECISION    │
└──────┬──────┘     │   POINT     │
       │            └──────┬───────┘
       ▼                   │
┌─────────────┐             │
│  PROCESS B  │◀────────────┘
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   OUTPUT    │
└─────────────┘

[Annotations: Where friction occurs, what's broken]
```

```ascii
# Relationship Map

┌─────────────────────────────────────────────────┐
│              SYSTEM/CATEGORY                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────┐      ┌──────────┐      ┌────────┐ │
│  │ Component│─────▶│ Component│─────▶│Output  │ │
│  │    1     │      │    2     │      │        │ │
│  └──────────┘      └──────────┘      └────────┘ │
│         │                   │                   │
│         ▼                   ▼                   │
│  ┌─────────────────────────────┐             │
│  │    Shared State/Memory      │             │
│  └─────────────────────────────┘             │
│                                                 │
└─────────────────────────────────────────────────┘

[Annotations: Relationships, dependencies, data flow]
```

```ascii
# Cognitive Load Sources

┌──────────────────────────────────────────────────┐
│          COGNITIVE LOAD BREAKDOWN                │
├──────────────────────────────────────────────────┤
│                                                   │
│  Discovery Load (Finding Things)                  │
│  ├─ No search index                              │
│  ├─ Scattered across 15 directories              │
│  └─ Takes 1-2 minutes to find files              │
│                                                   │
│  Relationship Load (Understanding Connections)      │
│  ├─ Relationships implicit, not explicit           │
│  ├─ Must read code to understand dependencies     │
│  └─ Takes 5-10 minutes to map relationships     │
│                                                   │
│  State Load (Remembering Context)                │
│  ├─ No session continuity                         │
│  ├─ Takes 2-5 minutes to resume work             │
│  └─ Lost context on context switch               │
│                                                   │
│  Decision Load (Choosing Options)                 │
│  ├─ No clear guidance for common workflows        │
│  ├─ Must figure out steps each time              │
│  └─ Takes 15-20 minutes to create agent           │
│                                                   │
└──────────────────────────────────────────────────┘

TOTAL COGNITIVE LOAD: HIGH (23-37 minutes for common tasks)

[Annotations: Which loads are most severe, what to fix first]
```

---

### Template 3: Executable Plan (checklist.md format)

```markdown
# First-Principles Improvements: [System/Problem]

**Created:** [Date]
**Status:** In Progress
**Priority:** High

---

## 🔥🔥🔥 Quick Wins (Do First)

### Discovery Index (1 hour)
- [ ] Create `.docs/DISCOVERY-INDEX.md`
- [ ] Add "Where do I find...?" quick reference table
- [ ] Organize by category, file type, phase
- [ ] Add search patterns and common commands
- [ ] Test: Can find any file in < 10 seconds

**Impact:** Very High | **Effort:** 1 hour

### Semantic Symlinks (5 minutes)
- [ ] Create `docs/` → `.docs/`
- [ ] Create `agents/` → `1-agents/`
- [ ] Create `libraries/` → `4-scripts/lib/`
- [ ] Create 5 more symlinks
- [ ] Test: Can navigate intuitively

**Impact:** High | **Effort:** 5 minutes

### Directory Purpose Markers (30 minutes)
- [ ] Add `.purpose.md` to 7 major directories
- [ ] Include: Purpose, Contains, Used By, Owner, Stability
- [ ] Test: Instant understanding of directory role

**Impact:** Medium | **Effort:** 30 minutes

### Version Registry (30 minutes)
- [ ] Create `.docs/VERSION-REGISTRY.md`
- [ ] List all integrated frameworks with versions
- [ ] Add compatibility matrix
- [ ] Test: Clear version visibility

**Impact:** Medium | **Effort:** 30 minutes

---

## 🔥🔥 High Value (2-4 hours)

### Visual Workflow Maps (2 hours)
- [ ] Create ASCII diagram for [workflow 1]
- [ ] Create ASCII diagram for [workflow 2]
- [ ] Add to `.docs/maps/` directory
- [ ] Test: Diagrams clarify complex flows

**Impact:** High | **Effort:** 2 hours

### Workflow Checklists (2 hours)
- [ ] Create checklist for [common workflow 1]
- [ ] Create checklist for [common workflow 2]
- [ ] Add to `.docs/workflows/CHECKLISTS.md`
- [ ] Test: Checklists reduce "what's next?" friction

**Impact:** High | **Effort:** 2 hours

---

## ⭐ Strategic (4-8 hours, long-term)

### API Layer (8 hours)
- [ ] Define API interface in `4-scripts/api/`
- [ ] Create `blackbox4.py` with core methods
- [ ] Add error handling and validation
- [ ] Write API documentation
- [ ] Test: Stable interface across versions

**Impact:** Very High | **Effort:** 8 hours

---

## Verification

**Success Metrics:**
- [ ] File discovery: < 10 seconds (baseline: 1-2 minutes)
- [ ] Directory understanding: Instant (baseline: explore)
- [ ] Workflow execution: 50% faster (baseline: varies)
- [ ] User satisfaction: Measurable improvement

**Testing Method:**
- [ ] Test each improvement individually
- [ ] Measure baseline vs. after state
- [ ] Get user feedback
- [ ] Iterate based on results

---

## Notes

[Any additional notes, dependencies, risks, etc.]
```

---

## Quality Bar (what "good" looks like)

### Minimum Acceptable Output
- ✅ All 7 phases completed
- ✅ At least 3 insights generated (different categories)
- ✅ At least 5 improvements identified
- ✅ At least 3 output formats delivered
- ✅ At least 1 visual diagram created
- ✅ Improvements prioritized by impact/effort

### Excellent Output
- ✅ All 7 phases completed thoroughly
- ✅ 5+ insights generated across multiple categories
- ✅ 15+ improvements identified
- ✅ All 4 output formats delivered
- ✅ 3+ visual diagrams created
- ✅ Clear priority matrix with time estimates
- ✅ Success metrics defined and measurable
- ✅ Executive summary is clear and actionable
- ✅ Analysis is traceable (evidence-backed conclusions)

### Red Flags (signs of shallow thinking)
- ❌ Accepts assumptions without questioning
- ❌ Treats symptoms as root causes
- ❌ Only considers incremental improvements
- ❌ Missing "why" analysis (only "what")
- ❌ No fundamental insights, only observations
- ❌ Prioritizes without impact/effort analysis
- ❌ Single output format only
- ❌ No visual diagrams
- ❌ Recommendations are generic/vague

---

## Common Patterns & Anti-Patterns

### Good Patterns
- **Ask "why?" 5 times** to reach fundamental truths
- **Separate means from ends** (what we want vs. how we get there)
- **Map before fixing** (understand current state before changing)
- **Generate multiple options** before choosing
- **Prioritize by impact/effort** (quick wins first)
- **Make thinking explicit** (document your reasoning)

### Anti-Patterns to Avoid
- **"Everyone knows X"** → Challenge it, even if "obvious"
- **"That's how it's done"** → Ask why it's done that way
- **"Fix the symptom"** → Find the root cause instead
- **"Add a feature"** → Question if a feature is the right solution
- **"Optimize existing"** → Consider if rebuild is better
- **"Ask the user"** → Use first principles to anticipate needs

---

## Integration with Other Skills

### Works Well With
- **deep-research** - Use first-principles to structure research
- **docs-routing** - Route analysis output to right places
- **feedback-triage** - Apply first-principles to messy feedback

### Can Be Combined With
- **Sequential Thinking MCP** - Use for deep reasoning within phases
- **Long-run-ops** - Use first-principles for long-running analysis
- **github-cli** - Apply to repository/workflow improvements

### When NOT to Use
- For simple, well-understood problems
- When the solution is obvious and non-controversial
- For pure information lookup tasks
- When time is extremely limited (use heuristic instead)

---

## Examples

See `first-principles-examples/` directory for:
- `technical-example.md` - Architecture decision (microservices vs monolith)
- `business-example.md` - Process improvement (reduce meeting overhead)
- `organizational-example.md` - Organization structure (this analysis)

---

## Notes

- First-principles thinking is **slow** but **thorough**. Use it when the problem justifies the investment.
- The goal is **insight**, not just analysis. Understanding "why" should lead to "what now."
- Be willing to challenge **any** assumption, even "obvious" or "sacred" ones.
- The best solutions often feel **obvious in retrospect** but **radical at first.
- If your analysis leads to "do what everyone else does," you probably missed a fundamental insight.

---

**Last Updated:** 2026-01-15
**Version:** 1.0
**Status:** Production Ready
