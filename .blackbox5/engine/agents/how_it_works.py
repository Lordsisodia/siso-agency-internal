"""
Simple demonstration of how the Black Box 5 agent system works
"""

print("=" * 70)
print("BLACK BOX 5 AGENT SYSTEM - HOW IT WORKS")
print("=" * 70)

print("\n1. AGENT ORGANIZATION")
print("-" * 70)
print("""
The agents are organized into 5 categories based on their role:

1-core/          → Core workflow agents (planning, verification, orchestration)
2-bmad/          → BMAD methodology agents (Mary, Winston, Arthur, John, TEA)
3-research/      → Research specialists (deep-research, OSS discovery)
4-specialists/   → Domain specialists (Ralph, Winston, custom agents)
5-enhanced/      → Enhanced capabilities (explore, librarian, oracle)
""")

print("\n2. AGENT ROUTING LOGIC")
print("-" * 70)
print("""
When a task comes in, the AgentRouter decides which agent should handle it:

┌─────────────────────────────────────────────────────────────────┐
│                        TASK                                  │
│  (description, type, complexity, context)                     │
└────────────────┬───────────────────────────────────────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │  DETERMINE COMPLEXITY   │
        │  • Simple: 1 file       │
        │  • Medium: 2-5 files     │
        │  • Complex: 5+ files     │
        └────────────────────────┘
                 │
        ┌────────────────────────┐
        │   DETERMINE TYPE        │
        │  • research            │
        │  • architecture         │
        │  • implementation      │
        │  • debugging           │
        └────────────────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │   APPLY ROUTING RULES   │
        └────────────────────────┘
                 │
     ┌───────────┼───────────┐
     │           │           │
     ▼           ▼           ▼
   Simple       Medium     Complex
     │           │           │
     ▼           ▼           ▼
 Quick-Flow  Arthur/Winston  Orchestrator
 gsd-executor     │           │
     │           └─────┬─────┘
     │                 │
     ▼                 ▼
  EXECUTE        COORDINATE
  (fresh          (multiple agents)
  context)      (BMAD team)
""")

print("\n3. ROUTING RULES TABLE")
print("-" * 70)
print("""
┌──────────────┬──────────────────┬──────────────────────────────────────┐
│ Complexity  │ Task Type        │ Agent                                   │
├──────────────┼──────────────────┼──────────────────────────────────────┤
│ Simple      │ Implementation   │ quick-flow, gsd-executor              │
│ Simple      │ Fix              │ gsd-debugger (Ralph)                  │
│ Medium      │ Implementation   │ arthur, gsd-executor                   │
│ Medium      │ Architecture     │ winston                                 │
│ Medium      │ Research         │ mary, deep-research                     │
│ Complex     │ Any              │ orchestrator (full BMAD team)         │
│ Any         │ Planning         │ selection-planner                       │
│ Any         │ Verification     │ review-verification                     │
└──────────────┴──────────────────┴──────────────────────────────────────┘
""")

print("\n4. BMAD TEAM COORDINATION")
print("-" * 70)
print("""
For complex tasks, the Orchestrator coordinates the full BMAD team:

┌─────────────────────────────────────────────────────────────────┐
│                    BMAD 4-PHASE METHODOLOGY                   │
└─────────────────────────────────────────────────────────────────┘

Phase 1: ELICITATION
  Agent: Mary (Business Analyst)
  Output: product-brief.md
  ↓
Phase 2: ANALYSIS
  Agents: Mary + John (PM)
  Output: prd.md
  ↓
Phase 3: SOLUTIONING
  Agent: Winston (Architect)
  Output: architecture-spec.md
  ↓
Phase 4: IMPLEMENTATION
  Agent: Arthur (Developer)
  Output: working-code + dev-agent-record.md

Each phase has quality gates before advancing to the next.
""")

print("\n5. GSD EXECUTION PATTERNS")
print("-" * 70)
print("""
GSD agents focus on context engineering and atomic execution:

┌─────────────────────────────────────────────────────────────────┐
│                      GSD CONTEXT ENGINEERING                    │
└─────────────────────────────────────────────────────────────────┘

Context Budget:
  0-30%:    PEAK (Deep Recall)      → Mary, Winston (planning)
  30-50%:   GOOD (Solid Work)      → Arthur (implementation)
  50-70%:   DEGRADING (Efficiency)  → Use checkpoints
  70%+:     POOR (Reset Required)   → Start fresh session

Atomic Commits:
  Each task = 1 atomic commit
  Format: {type}({phase}-{plan}): description

Wave Execution:
  Wave 1: Task 1 (no dependencies)  ─┐
  Wave 2: Task 2 (depends on 1)     ─┼── Parallel in waves
  Wave 2: Task 3 (depends on 1)     ─┘

Goal-Backward Verification:
  1. Existence (file exists?)
  2. Substantive (implemented, not stub?)
  3. Wired (connected to other components?)
""")

print("\n6. SKILLS SYSTEM")
print("-" * 70)
print("""
Skills are composable capabilities that agents can use:

┌─────────────────────────────────────────────────────────────────┐
│                      SKILL FORMAT                            │
└─────────────────────────────────────────────────────────────────┘

---
name: "Atomic Planning"
description: "Break down complex goals into atomic plans"
type: "workflow"
agent: "orchestrator"
complexity: "high"
risk: "critical"
context_cost: "medium"
tags: ["planning", "gsd", "core"]
---

# Atomic Planning

> Purpose: Break large goals into atomic, executable plans

## Blueprint

1. Analyze context health
2. Decompose into 2-3 tasks
3. Generate plan using YAML schema

## Examples
...
""")

print("\n7. EXECUTION FLOW")
print("-" * 70)
print("""
Here's how a typical task flows through the system:

User Request: "Add login feature"
     │
     ▼
┌────────────────────────────────────────────────────────────────┐
│ 1. TASK CLASSIFICATION                                        │
│    → Type: implementation                                   │
│    → Complexity: medium (2-5 files)                         │
└────────────────────────────────────────────────────────────────┘
     │
     ▼
┌────────────────────────────────────────────────────────────────┐
│ 2. AGENT ROUTING                                               │
│    → Route to Arthur (BMAD Developer) or gsd-executor         │
└────────────────────────────────────────────────────────────────┘
     │
     ▼
┌────────────────────────────────────────────────────────────────┐
│ 3. CONTEXT PREPARATION                                         │
│    → Load fresh 200k context (GSD pattern)                   │
│    → Check context budget                                     │
└────────────────────────────────────────────────────────────────┘
     │
     ▼
┌────────────────────────────────────────────────────────────────┐
│ 4. EXECUTION                                                  │
│    → Use tools (Read, Write, Edit, Bash)                     │
│    → Create artifacts                                         │
│    → Apply relevant skills                                   │
└────────────────────────────────────────────────────────────────┘
     │
     ▼
┌────────────────────────────────────────────────────────────────┐
│ 5. VERIFICATION                                                │
│    → Goal-backward checks (GSD)                              │
│    → Quality gates (BMAD)                                    │
│    → Atomic commit                                           │
└────────────────────────────────────────────────────────────────┘
     │
     ▼
✅ COMPLETE
""")

print("\n8. KEY CONCEPTS")
print("-" * 70)
print("""
CONCEPT                    DESCRIPTION
────────────────────────────────────────────────────────────────────
Agent Type                 BMAD, GSD, or Specialist agent
Agent Role                analyst, architect, developer, pm, etc.
Task Complexity           simple, medium, complex
Task Type                 research, architecture, implementation, etc.
Fresh Context              Each GSD agent gets 200k tokens (no sharing)
Atomic Commit              One commit per task (git bisect friendly)
Wave Execution            Parallel execution of independent tasks
Artifact                   Structured output (product-brief.md, prd.md, etc.)
Quality Gate              Validation before phase advancement
Handoff                    Context transfer between agents
Skill                      Composable capability for agents
""")

print("\n9. FILE STRUCTURE")
print("-" * 70)
print("""
.blackbox5/engine/agents/
├── core/                    # Python implementation
│   ├── BaseAgent.py       # Agent base classes
│   ├── AgentLoader.py     # Load agents from disk
│   ├── AgentRouter.py     # Route tasks to agents
│   └── SkillManager.py    # Manage skills
│
├── .skills/                 # 40 composable skills
│   ├── 1-core/
│   ├── automation/
│   ├── development/
│   └── ...
│
├── 1-core/                  # Core workflow agents
├── 2-bmad/                  # BMAD methodology agents
├── 3-research/              # Research specialists
├── 4-specialists/           # Domain specialists
└── 5-enhanced/              # Enhanced capabilities
""")

print("\n" + "=" * 70)
print("HOW TO USE")
print("=" * 70)
print("""
# Basic usage

from agents.core import AgentLoader, AgentRouter, Task

# 1. Load agents
loader = AgentLoader()
agents = await loader.load_all()

# 2. Create router
router = AgentRouter(loader)

# 3. Define task
task = Task(
    id="task-1",
    description="Fix login bug",
    type="implementation",
    complexity="simple"
)

# 4. Route to agent
agent = router.route(task)  # → Returns quick-flow or gsd-executor

# 5. Execute
result = await agent.execute(task)

# 6. Check result
if result.success:
    print(f"✅ {result.output}")
else:
    print(f"❌ {result.error}")
""")

print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)
print("""
The Black Box 5 agent system provides:

1. ORGANIZATION
   - 285+ agents in 5 categories
   - 40+ composable skills
   - Clear structure and roles

2. INTELLIGENT ROUTING
   - Automatic agent selection
   - Based on task complexity and type
   - Context-aware decisions

3. EXECUTION PATTERNS
   - BMAD: 4-phase methodology with specialist agents
   - GSD: Fresh context, atomic commits, wave execution
   - Combined: Best of both methodologies

4. QUALITY ASSURANCE
   - Goal-backward verification (GSD)
   - Quality gates (BMAD)
   - Artifact-based handoffs

5. SCALABILITY
   - Simple tasks: Direct execution
   - Medium tasks: Single specialist
   - Complex tasks: Multi-agent orchestration

This system allows Claude Code to leverage specialized AI agents
for any development task while maintaining quality and efficiency.
""")

print("\n" + "=" * 70)
print("✅ AGENT SYSTEM READY")
print("=" * 70)
