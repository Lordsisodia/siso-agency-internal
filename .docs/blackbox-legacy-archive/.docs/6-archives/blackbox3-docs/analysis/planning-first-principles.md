# Planning Systems & First Principles Analysis

**Date:** 2026-01-13
**Question:** Should we design (1) a planning system that plans out our tasks, or (2) a planning thought process? Also, where are first principles integrated?

---

## Executive Summary

**Current State:**
- ✅ **First Principles** is integrated into the core agent prompt but the implementation is **missing**
- ✅ **Basic Planning** exists (`action-plan.sh`, `new-plan.sh`) but it's **template-based, not intelligent**
- ❌ **No automated task planning system** - plans are created by humans working with AI

**Recommendation:**
Build **BOTH**, but in a specific order:
1. **First** → Implement the First Principles Engine (referenced but missing)
2. **Second** → Build a Planning Thought Process (FP-powered planning)
3. **Third** → Add an Automated Planning System (uses the thought process)

---

## What Currently Exists

### 1. First Principles Integration

**Location:** `agents/_core/prompt.md` (lines 114-228)

**What's There:**
- Complete documentation of FP decision-making
- ADI Cycle (Abduction → Deduction → Induction)
- Reference to FP Engine: `runtime/fp_engine/decision_gateway.py`
- Reference to prompts: `prompts/fp/q1-abduct.txt`, etc.

**What's Missing:**
```bash
# These are referenced but don't exist:
runtime/fp_engine/          # ❌ Missing
prompts/fp/                # ❌ Missing
modules/first-principles/   # ❌ Empty (placeholder only)
data/decisions/records/    # ❌ Empty
data/principles/           # ❌ Empty
```

**Gap:** First principles is **documented but not implemented**. Agents are told to use it but the tools don't exist.

---

### 2. Planning System

**What Exists:**

| Script | Purpose | Capability |
|--------|---------|------------|
| `new-plan.sh` | Create plan folder | ✅ Creates 13 template files |
| `action-plan.sh` | Generate action plans | ⚠️ Creates metadata, no AI integration |
| `modules/planning/` | Planning module | ❌ Empty (placeholder) |

**What's Missing:**
- No automated task breakdown
- No intelligent agent assignment
- No dependency tracking
- No integration with FP for decision-making

**Gap:** Planning is **template-based, not intelligent**. Humans do all the thinking.

---

## The Two Questions

### Question 1: Planning System vs Planning Thought Process?

**Answer:** **Both**, but they serve different purposes:

```
┌─────────────────────────────────────────────────────────────┐
│                    Planning Thought Process                 │
│                                                             │
│  Purpose: HOW to think about planning                      │
│  - When to use FP decision-making                          │
│  - How to break down problems                              │
│  - How to evaluate trade-offs                             │
│  - How to validate plans                                  │
│                                                             │
│  Analogy: Teaching someone how to fish                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
                              informs
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Planning System                        │
│                                                             │
│  Purpose: AUTOMATES the planning process                   │
│  - Analyzes task requirements                              │
│  - Breaks down tasks automatically                        │
│  - Assigns agents intelligently                            │
│  - Tracks dependencies and progress                       │
│                                                             │
│  Analogy: A robot that fishes for you                     │
└─────────────────────────────────────────────────────────────┘
```

**Key Insight:** You need the thought process **FIRST**, because the system needs to know HOW to plan before it can automate it.

---

### Question 2: Where Are First Principles Integrated?

**Current State:**

```
First Principles is integrated at THREE levels:

Level 1: Core Agent Prompt (DOCUMENTED)
├─ Location: agents/_core/prompt.md
├─ Lines: 114-228
├─ Content: Complete FP documentation
└─ Status: ✅ Documented, ❌ Implemented

Level 2: Runtime FP Engine (MISSING)
├─ Location: runtime/fp_engine/
├─ Referenced: decision_gateway.py
├─ Purpose: Automated decision classification
└─ Status: ❌ Doesn't exist

Level 3: First Principles Module (EMPTY)
├─ Location: modules/first-principles/
├─ Content: Placeholder directories only
├─ Purpose: FP workflows and principles
└─ Status: ❌ Empty shell
```

**The Problem:**
```
Agent Prompt: "Use FP decision-making for complex choices!"
     ↓
Agent: "OK, let me use the FP engine..."
     ↓
FP Engine: ❌ Doesn't exist
     ↓
Agent: "I guess I'll just make it up..."
```

---

## Recommended Architecture

### Phase 1: Implement First Principles Engine (Priority: CRITICAL)

**Why First:** Without this, agents are told to use FP but can't.

**Build:**

```bash
runtime/fp_engine/
├── __init__.py
├── decision_gateway.py      # Classify decisions by complexity
├── adi_cycle.py             # Implement ADI cycle
├── principles.py            # Load and apply principles
└── prompts/
    ├── q1_abduct.md         # Abduction prompts
    ├── q2_deduct.md         # Deduction prompts
    └── q3_induct.md         # Induction prompts

modules/first-principles/
├── data/
│   ├── principles/
│   │   ├── PR-0001.md      # Cost Decomposition
│   │   ├── PR-0002.md      # ADI Cycle
│   │   └── PR-0003.md      # Transformer Mandate
│   ├── decisions/
│   │   └── records/        # Decision records
│   └── outcomes/           # Learning from past decisions
├── workflows/
│   ├── decompose/          # Problem decomposition
│   ├── map-constraints/    # Constraint mapping
│   └── cost-analysis/      # Cost analysis
└── agents/
    └── fp-analyst.agent.yaml
```

**Capabilities:**
1. **Decision Classification** → Simple/Moderate/Complex/Critical
2. **ADI Cycle** → Generate hypotheses → Verify logic → Design tests
3. **Principle Application** → Apply appropriate principles
4. **Decision Records** → Document all decisions

**Script:**
```bash
./scripts/analyze-decision.sh "Use React or Vue for dashboard?"
# Output:
# - Complexity: Moderate
# - Requires ADI: Yes
# - Suggested agents: architect, analyst
# - Next steps: See prompts/fp/q1_abduct.md
```

---

### Phase 2: Planning Thought Process (Priority: HIGH)

**Why Second:** Give agents a systematic way to think about planning.

**Build:**

```python
# modules/planning/thought_process.py

class PlanningThoughtProcess:
    """
    Systematic approach to planning using First Principles
    """

    def plan_task(self, task: str, context: dict) -> Plan:
        """
        Generate a plan using FP-powered reasoning
        """
        # Step 1: Decompose problem (PR-0001)
        components = self.decompose_problem(task)

        # Step 2: Map constraints
        constraints = self.map_constraints(context)

        # Step 3: Identify decisions
        decisions = self.identify_decisions(components, constraints)

        # Step 4: For each decision, use FP
        for decision in decisions:
            if decision.complexity > "simple":
                fp_result = self.fp_engine.adi_cycle(decision)
                decision.hypotheses = fp_result.hypotheses

        # Step 5: Generate action steps
        actions = self.generate_actions(components, decisions)

        # Step 6: Validate plan
        validation = self.validate_plan(actions, constraints)

        return Plan(
            components=components,
            constraints=constraints,
            decisions=decisions,
            actions=actions,
            validation=validation
        )
```

**Key Features:**
1. **Problem Decomposition** → Break complex tasks into components
2. **Constraint Mapping** → Identify all constraints explicitly
3. **Decision Points** → Identify where decisions are needed
4. **FP Integration** → Use FP for complex decisions
5. **Action Generation** → Convert decisions into actions
6. **Plan Validation** → Check plan against constraints

**Usage:**
```bash
# When creating a plan, agent uses this thought process:
cd agents/.plans/2025-01-13_1500_my-task/

# Agent thinks:
# 1. What are the components of this task?
# 2. What constraints exist?
# 3. What decisions need to be made?
# 4. Use FP for complex decisions
# 5. Generate action steps
# 6. Validate the plan
```

---

### Phase 3: Automated Planning System (Priority: MEDIUM)

**Why Third:** automate the thought process once it's defined.

**Build:**

```python
# modules/planning/automated_planner.py

class AutomatedPlanner:
    """
    Automatically generates and manages plans
    """

    def create_plan(self, task: str) -> PlanFolder:
        """
        Create a complete plan folder with intelligent defaults
        """
        # Use thought process to generate plan
        thought_process = PlanningThoughtProcess()
        plan = thought_process.plan_task(task, self.get_context())

        # Create plan folder
        folder = self.create_plan_folder(task)

        # Write plan files
        folder.write("README.md", plan.to_readme())
        folder.write("checklist.md", plan.to_checklist())
        folder.write("status.md", plan.to_status())

        # Assign agents
        agents = self.assign_agents(plan)
        folder.write("agents.yaml", agents.to_yaml())

        # Track dependencies
        dependencies = self.extract_dependencies(plan)
        folder.write("dependencies.yaml", dependencies)

        return folder
```

**Key Features:**
1. **Automated Task Analysis** → Understand task requirements
2. **Intelligent Breakdown** → Use thought process to break down
3. **Agent Assignment** → Assign appropriate agents
4. **Dependency Tracking** → Track task dependencies
5. **Progress Monitoring** → Track plan execution

**Usage:**
```bash
# Command-line
./scripts/plan-task.sh "Implement user authentication with OAuth"

# Output:
# - Analyzing task...
# - Complexity: Complex
# - Components: 5 (UI, API, database, OAuth, testing)
# - Decisions: 3 (provider choice, session management, security)
# - Using FP for decisions...
# - Assigning agents: architect, dev, qa
# - Plan created: agents/.plans/2025-01-13_1500_oauth-auth/
```

---

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Request                          │
│              "Implement OAuth authentication"               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              Automated Planning System                      │
│  - Analyzes task                                          │
│  - Estimates complexity                                    │
│  - Identifies components                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│            Planning Thought Process                         │
│  - Decompose problem (PR-0001)                            │
│  - Map constraints                                        │
│  - Identify decisions                                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              First Principles Engine                        │
│  - Classify decisions                                     │
│  - Run ADI cycle for complex decisions                    │
│  - Generate hypotheses                                   │
│  - Design validation tests                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    Plan Output                              │
│  - README.md (overview)                                   │
│  - checklist.md (action steps)                            │
│  - agents.yaml (agent assignments)                        │
│  - decisions/ (FP decision records)                       │
│  - dependencies.yaml (task deps)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Roadmap

### Sprint 1: First Principles Engine (Week 1)
- [ ] Create `runtime/fp_engine/` module
- [ ] Implement `decision_gateway.py`
- [ ] Implement `adi_cycle.py`
- [ ] Create FP prompts (q1, q2, q3)
- [ ] Document principles (PR-0001, PR-0002, PR-0003)
- [ ] Test with sample decisions

### Sprint 2: Planning Thought Process (Week 2)
- [ ] Create `modules/planning/thought_process.py`
- [ ] Implement problem decomposition
- [ ] Implement constraint mapping
- [ ] Implement decision identification
- [ ] Integrate with FP engine
- [ ] Create validation logic

### Sprint 3: Automated Planning System (Week 3)
- [ ] Create `modules/planning/automated_planner.py`
- [ ] Implement task analysis
- [ ] Implement intelligent breakdown
- [ ] Implement agent assignment
- [ ] Implement dependency tracking
- [ ] Create CLI interface

### Sprint 4: Integration & Testing (Week 4)
- [ ] Integrate with existing `new-plan.sh`
- [ ] Update agent prompts to use FP
- [ ] Create example plans
- [ ] Test with real tasks
- [ ] Document usage

---

## Answer Summary

### Question 1: Planning System or Planning Thought Process?

**Answer:** **Build both**, but in this order:

1. **First** → Planning Thought Process (HOW to think about planning)
2. **Second** → Planning System (AUTOMATES the thinking)

The thought process is the **foundation**. The system is the **automation**.

### Question 2: Where Are First Principles Integrated?

**Answer:** Three levels, but implementation is **missing**:

1. **Level 1: Agent Prompt** (✅ Documented)
   - `agents/_core/prompt.md` lines 114-228
   - Complete FP documentation
   - Agents are told to use it

2. **Level 2: FP Engine** (❌ Missing)
   - Referenced: `runtime/fp_engine/decision_gateway.py`
   - Purpose: Automated decision classification
   - Status: Doesn't exist

3. **Level 3: FP Module** (❌ Empty)
   - Location: `modules/first-principles/`
   - Purpose: FP workflows and principles
   - Status: Empty placeholder

**Critical Gap:** First principles is **documented but not implemented**. This is the highest priority fix.

---

## Next Steps

1. **Immediate**: Implement First Principles Engine
   - Without this, agents can't use FP as documented
   - Blocks both planning system and thought process

2. **Short-term**: Design Planning Thought Process
   - Define how agents should think about planning
   - Integrate with FP engine
   - Create validation logic

3. **Medium-term**: Build Automated Planning System
   - Automate the thought process
   - Provide CLI interface
   - Integrate with existing tools

**Want me to start implementing the First Principles Engine?**
