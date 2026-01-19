# Task Analyzer

**Status:** documented
**Last Updated:** 2026-01-19
**Domain:** task-management

---

## Purpose

Multi-dimensional analysis of tasks to determine complexity, value, compute requirements, and speed.

**Problem Statement:**
BlackBox5 needs to understand tasks at a deep level to route them appropriately. Simple task categorization (easy/medium/hard) is insufficient. We need to consider multiple dimensions simultaneously to make intelligent decisions about:
- How complex is this task?
- How valuable is this task?
- What resources (tokens, model) does it need?
- How urgent is it?
- What type of task is it?

**Who Benefits:**
- The system: Better routing and resource allocation
- Users: More appropriate agent selection and faster completion
- Developers: Clearer understanding of task requirements

**Why It Matters:**
Without proper task analysis, we can't:
- Route tasks to the right agents
- Allocate appropriate compute resources
- Prioritize work effectively
- Estimate completion times accurately

---

## How It Works

The task analyzer uses 5 dimensions with logarithmic (log₁₀) scoring:

1. **Task Type Detection**
   - Analyzes task title, description, content
   - Matches keywords against 10 task types (UI, Refactor, Research, etc.)
   - Returns confidence score for each type

2. **Complexity Analysis**
   - 6 sub-dimensions: Scope, Technical, Dependencies, Risk, Uncertainty, Cross-Domain
   - Each dimension scored 0-100 using logarithmic scaling
   - Multiplicative combination (not additive)
   - Final complexity score 0-100

3. **Value Analysis**
   - 5 sub-dimensions: Business, User, Strategic, Urgency, Impact
   - Each dimension scored 0-100 using logarithmic scaling
   - Multiplicative combination
   - Final value score 0-100

4. **Compute Analysis**
   - Uses complexity and task type to estimate token requirements
   - Determines appropriate model (Haiku/Sonnet/Opus)
   - Estimates parallelization potential

5. **Speed Analysis**
   - Uses deadlines, blocking relationships, priority, value
   - Determines how urgent the task is
   - Final speed score 0-100

6. **ROI Calculation**
   - ROI = Value Magnitude / Complexity Magnitude
   - Higher ROI = more value per unit complexity
   - Used for prioritization

7. **Workflow Recommendation**
   - Based on all 5 dimensions
   - Recommends: quick_fix, simple, standard, complex, or research
   - Recommends model choice
   - Estimates parallelization

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    TASK INPUT                                │
│  title, description, content, metadata                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              TYPE DETECTOR                                   │
│  10 types: UI, Refactor, Research, Planning, etc.           │
└──────────────────────────┬──────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ COMPLEXITY   │  │    VALUE     │  │    SPEED     │
│ 6 dimensions │  │ 5 dimensions │  │ 4 dimensions │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
                         ▼
                ┌────────────────┐
                │   COMPUTE      │
                │ Uses Complexity│
                │   + Type       │
                └────────┬───────┘
                         │
                         ▼
                ┌────────────────┐
                │  INTEGRATION   │
                │  - ROI calc    │
                │  - Workflow    │
                │  - Priority    │
                └────────┬───────┘
                         │
                         ▼
                ┌────────────────┐
                │   OUTPUT       │
                │ All scores,    │
                │ recommendations│
                └────────────────┘
```

### Key Components

- **TaskTypeDetector:** Determines what kind of task this is
- **LogComplexityAnalyzer:** Analyzes how hard it is
- **LogValueAnalyzer:** Analyzes how valuable it is
- **LogComputeAnalyzer:** Estimates resource needs
- **LogSpeedAnalyzer:** Analyzes urgency
- **LogEnhancedTaskAnalyzer:** Integrates all analyzers

---

## Underlying Assumptions

### Assumption 1: Tasks can be accurately analyzed from text description
- **What we believe:** The task title, description, and content contain sufficient information to determine complexity, value, compute needs, and urgency
- **Why we believe it:** Most task descriptions include context about scope, tech stack, dependencies, deadlines, and business value
- **Confidence:** medium
- **Impact if wrong:** We'd misroute tasks, waste resources, and misprioritize work

### Assumption 2: Logarithmic scaling matches natural task distribution
- **What we believe:** Tasks follow a power law distribution (many simple, few complex). Log₁₀ scoring naturally handles this.
- **Why we believe it:** Software complexity, file counts, and user impact typically follow power laws
- **Confidence:** high
- **Impact if wrong:** Scoring would be skewed, but still functional

### Assumption 3: Multiplicative scoring is better than additive
- **What we believe:** Multiplicative scoring prevents weak dimensions from compensating for strong ones. All dimensions matter.
- **Why we believe it:** A high-value task that's extremely complex has different characteristics than one that's simple
- **Confidence:** medium
- **Impact if wrong:** ROI calculation would be less accurate

### Assumption 4: Task type can be determined from keywords
- **What we believe:** Specific keywords reliably indicate task type (e.g., "CSS" → UI, "refactor" → Refactor)
- **Why we believe it:** Task descriptions typically include domain-specific terminology
- **Confidence:** high
- **Impact if wrong:** Tasks would be routed to wrong agent types

### Assumption 5: 10 task types are sufficient
- **What we believe:** We can categorize all tasks into UI, Refactor, Research, Planning, Brainstorming, Implementation, Testing, Documentation, Infrastructure, or Data
- **Why we believe it:** These cover most software development work
- **Confidence:** medium
- **Impact if wrong:** Some tasks would be miscategorized

### Assumption 6: Token estimation is possible from complexity analysis
- **What we believe:** We can estimate required tokens based on task complexity, type, and uncertainty
- **Why we believe it:** Complex tasks require more reasoning, more code generation, more iterations
- **Confidence:** low
- **Impact if wrong:** We'd over/under-allocate resources, waste money or time

### Assumption 7: ROI (Value/Complexity) is a good prioritization metric
- **What we believe:** Tasks with higher value per unit complexity should be prioritized
- **Why we believe it:** This maximizes impact per effort
- **Confidence:** high
- **Impact if wrong:** We'd prioritize suboptimally, but not catastrophically

---

## Technologies Used

### Technology 1: Python (type hints, dataclasses)
- **Purpose:** Core implementation language
- **Why this technology:** BlackBox5 is Python-based, type hints improve maintainability
- **Alternatives considered:** None (Python is our base)
- **Risks:** None significant

### Technology 2: YAML frontmatter
- **Purpose:** Task metadata storage
- **Why this technology:** Human-readable, widely supported, AI-friendly
- **Alternatives considered:** JSON (less readable), TOML (less common)
- **Risks:** YAML is more complex to parse than JSON

### Technology 3: Logarithmic scoring (math.log10)
- **Purpose:** Natural distribution handling
- **Why this technology:** Matches power law distribution of real-world tasks
- **Alternatives considered:** Linear scoring (discriminated poorly at low end), exponential (too aggressive)
- **Risks:** Logarithmic scales may be less intuitive for humans

---

## Workflows

### Workflow 1: Task Analysis

**Purpose:** Analyze a new task to determine routing and resource allocation

**Steps:**
1. Parse task YAML + markdown body
2. Run through TaskTypeDetector
3. Run through LogComplexityAnalyzer
4. Run through LogValueAnalyzer
5. Run through LogComputeAnalyzer (uses complexity + type)
6. Run through LogSpeedAnalyzer
7. Calculate ROI
8. Recommend workflow tier and model
9. Store results in task metadata

**Assumptions:**
- Task description is accurate
- YAML frontmatter is properly formatted
- All metadata fields are present

**Alternatives:**
- Manual categorization (too slow for scale)
- ML-based classification (overkill for now)

### Workflow 2: Task Prioritization

**Purpose:** Order tasks by priority for execution

**Steps:**
1. Analyze all tasks
2. Sort by overall_priority (weighted value + speed + ROI)
3. Return ordered list

**Assumptions:**
- Priority weights are appropriate (40% value, 30% speed, 20% ROI, 10% complexity)
- Scores are comparable across tasks

**Alternatives:**
- Manual prioritization (not scalable)
- Pure urgency-based (misses high-value low-urgency tasks)

---

## Agents

### Agent: Task Analyzer (not really an agent, it's a service)

**Purpose:** Provides task analysis capabilities to other agents

**How it works:**
- Called as a Python module
- Stateless (no memory between calls)
- Returns complete analysis dict

**Assumptions:**
- Caller provides valid task object
- Analysis doesn't require external state

**Capabilities:**
- Analyze tasks in < 100ms
- Handle 1000+ tasks per minute

**Limitations:**
- No learning from past analyses
- No contextual awareness of project state
- Relies on accurate task descriptions

---

## Challenges

### Questions that test the assumptions:

#### Assumption 1 Challenges (Tasks can be analyzed from text)
- What if task descriptions are incomplete or misleading?
- How would we know if analysis is wrong?
- What evidence do we have that text analysis correlates with actual complexity?
- What if the person writing the task doesn't understand the scope?

#### Design Challenges
- Is 5 dimensions too many? Could we achieve 80% of value with 2-3 dimensions?
- Are the 6 complexity sub-dimensions all necessary?
- Are the 5 value sub-dimensions all necessary?
- What's the bottleneck in this analysis?

#### Technology Challenges
- What if logarithmic scoring doesn't match our actual task distribution?
- What if token estimation is wildly inaccurate?
- What if our priorities (40% value, 30% speed, etc.) are wrong?

#### Workflow Challenges
- Should we cache analysis results?
- Should we re-analyze tasks as they progress?
- How do we handle analysis errors?

---

## Validation Plan

### Test 1: Text analysis accuracy
- **What we're testing:** Can we accurately determine task complexity from text?
- **How we'll test it:**
  1. Analyze 100 completed tasks
  2. Compare predicted complexity vs actual time spent
  3. Measure correlation
- **Success criteria:** > 0.6 correlation between predicted complexity and actual effort
- **Alternative if false:** Add more metadata fields, use historical data
- **Status:** planned

### Test 2: Token estimation accuracy
- **What we're testing:** Can we estimate token usage?
- **How we'll test it:**
  1. Track token usage for 100 tasks
  2. Compare estimated vs actual
  3. Measure error rate
- **Success criteria:** Within 2x of actual (order of magnitude)
- **Alternative if false:** Use simpler estimation, track historical averages
- **Status:** planned

### Test 3: Prioritization effectiveness
- **What we're testing:** Does ROI-based prioritization work?
- **How we'll test it:**
  1. Compare ROI-based priority vs random
  2. Measure value delivered per unit time
  3. A/B test
- **Success criteria:** ROI-based delivers 2x more value
- **Alternative if false:** Adjust weights, use different metric
- **Status:** planned

### Test 4: Task type detection
- **What we're testing:** Can we accurately detect task types?
- **How we'll test it:**
  1. Manually label 200 tasks
  2. Run detection
  3. Measure accuracy
- **Success criteria:** > 80% accuracy
- **Alternative if false:** Add more keywords, use ML classifier
- **Status:** planned

---

## Validation Results

*No validations completed yet*

---

## Decisions

### Decision 1: Use logarithmic scoring
- **Date:** 2026-01-19
- **Decision:** Use log₁₀ scoring instead of linear
- **Rationale:** Better matches power law distribution of real tasks
- **Alternatives considered:** Linear (poor discrimination), exponential (too aggressive)
- **Reversible?** Yes, change scoring function

### Decision 2: Use multiplicative scoring
- **Date:** 2026-01-19
- **Decision:** Multiply sub-dimensions instead of adding
- **Rationale:** All dimensions matter equally, prevents compensation
- **Alternatives considered:** Additive with weights (allows weak areas to compensate)
- **Reversible?** Yes, change combination function

### Decision 3: 10 task types
- **Date:** 2026-01-19
- **Decision:** Implement 10 specific task types
- **Rationale:** Covers most software development work
- **Alternatives considered:** Fewer types (too coarse), more types (too fragmented)
- **Reversible?** Yes, add/remove types

---

## Open Questions

- How do we handle tasks that don't fit any of the 10 types?
- What if a task spans multiple types?
- How do we account for developer skill level?
- Should we adjust scores based on past performance?
- How do we handle evolving tasks?

---

## Next Steps

1. [ ] Run validation Test 1 (Text analysis accuracy)
2. [ ] Run validation Test 4 (Task type detection)
3. [ ] Create first-principles docs for remaining components
4. [ ] Integrate task analyzer with task database

---

## Related

- Task Management System
- Adaptive Flow Router
- BMAD Framework
- GSD Framework
