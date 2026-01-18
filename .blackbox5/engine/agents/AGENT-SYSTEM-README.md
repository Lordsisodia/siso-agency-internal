# Black Box 5 Agent System

**Version:** 5.0.0
**Status:** ✅ Implemented and Ready

---

## Overview

The Black Box 5 Agent System provides a complete framework for AI-driven development with:

- **285+ Agents** organized into 5 categories
- **40+ Skills** with composable capabilities
- **Intelligent Routing** based on task complexity and type
- **Multi-Agent Orchestration** for complex workflows
- **Wave-Based Execution** for parallel task processing

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AGENT SYSTEM                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ AgentLoader  │  │ AgentRouter  │  │SkillManager │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   Agent Types                        │ │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   │ │
│  │  │ BMAD   │  │  GSD   │  │Special │  │ Core   │   │ │
│  │  │ Agents │  │ Agents │  │ Agents │  │ Agents │   │ │
│  │  └────────┘  └────────┘  └────────┘  └────────┘   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   Skills (.skills/)                  │ │
│  │  • Core • Automation • Development • Research       │ │
│  │  • Git • MCP • Testing • Thinking                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. BaseAgent (`core/BaseAgent.py`)

**Foundation for all agents**

```python
from agents.core import BaseAgent, AgentConfig, Task, AgentResult

class MyAgent(BaseAgent):
    async def initialize(self):
        # Load prompts, tools, skills
        pass

    async def execute(self, task: Task) -> AgentResult:
        # Execute the task
        pass
```

**Agent Types:**
- `BaseAgent` - Base class for all agents
- `BMADAgent` - BMAD methodology agents
- `GSDAgent` - GSD execution agents
- `SpecialistAgent` - Domain specialists

---

### 2. AgentLoader (`core/AgentLoader.py`)

**Loads agents from the filesystem**

```python
from agents.core import AgentLoader

loader = AgentLoader()
agents = await loader.load_all()

# Get specific agent
agent = loader.get_agent("arthur")

# Get by category
bmad_agents = loader.get_agents_by_category("2-bmad")
```

**Features:**
- Scans organized agent directories
- Parses YAML configs and Markdown prompts
- Loads agent metadata and capabilities
- Initializes agent instances

---

### 3. AgentRouter (`core/AgentRouter.py`)

**Intelligently routes tasks to agents**

```python
from agents.core import AgentRouter, Task

router = AgentRouter(loader)

task = Task(
    id="1",
    description="Fix login bug",
    type="implementation",
    complexity="simple"
)

agent = router.route(task)
# → Routes to quick-flow or gsd-executor
```

**Routing Rules:**

| Complexity | Type | Agent |
|------------|------|-------|
| Simple | Implementation | Quick Flow / gsd-executor |
| Medium | Implementation | Arthur / gsd-executor |
| Simple | Architecture | Winston |
| Medium | Research | Mary |
| Complex | Any | Orchestrator (full team) |

---

### 4. SkillManager (`core/SkillManager.py`)

**Manages composable skills**

```python
from agents.core import SkillManager

skill_manager = SkillManager()
skills = await skill_manager.load_all()

# Get skills for agent
my_skills = skill_manager.get_skills_for_agent("arthur")

# Search skills
planning_skills = skill_manager.search_skills("planning")

# Compose skills
workflow = skill_manager.compose_skills([
    "atomic-planning",
    "goal-backward"
])
```

**Skill Categories:**
- Core skills
- Automation
- Collaboration
- Development
- Documentation
- Git workflow
- MCP integrations
- Testing
- Thinking

---

### 5. ExecutionOrchestrator (`core/AgentRouter.py`)

**Orchestrates multi-agent workflows**

```python
from agents.core import ExecutionOrchestrator

orchestrator = ExecutionOrchestrator(router, loader)

# Execute single task
result = await orchestrator.execute_task(task)

# Execute wave (parallel)
results = await orchestrator.execute_wave(tasks)

# Execute plan (sequential waves)
results = await orchestrator.execute_plan(tasks)
```

---

## Usage Examples

### Example 1: Load and List Agents

```python
import asyncio
from agents.core import AgentLoader

async def main():
    loader = AgentLoader()
    agents = await loader.load_all()

    print(f"Loaded {len(agents)} agents:")
    for name in loader.list_agents():
        print(f"  - {name}")

asyncio.run(main())
```

### Example 2: Route and Execute Tasks

```python
from agents.core import AgentRouter, ExecutionOrchestrator, Task

async def main():
    # Setup
    loader = AgentLoader()
    await loader.load_all()

    router = AgentRouter(loader)
    orchestrator = ExecutionOrchestrator(router, loader)

    # Define task
    task = Task(
        id="1",
        description="Add authentication",
        type="implementation",
        complexity="medium"
    )

    # Route and execute
    agent = router.route(task)
    result = await orchestrator.execute_task(task)

    print(f"Task completed: {result.success}")

asyncio.run(main())
```

### Example 3: Parallel Execution (Waves)

```python
from agents.core import ExecutionOrchestrator, Task

async def main():
    orchestrator = ExecutionOrchestrator(router, loader)

    # Define wave 1 (3 independent tasks)
    wave1 = [
        Task(id="w1-1", description="Fix header", type="implementation", complexity="simple", wave=1),
        Task(id="w1-2", description="Update footer", type="implementation", complexity="simple", wave=1),
        Task(id="w1-3", description="Add favicon", type="implementation", complexity="simple", wave=1)
    ]

    # Execute in parallel
    results = await orchestrator.execute_wave(wave1)

    for task_id, result in results.items():
        print(f"{task_id}: {result.success}")

asyncio.run(main())
```

---

## Agent Directory Structure

```
.blackbox5/engine/agents/
├── core/                    # Python implementation
│   ├── __init__.py
│   ├── BaseAgent.py
│   ├── AgentLoader.py
│   ├── AgentRouter.py
│   └── SkillManager.py
│
├── .skills/                 # 40 skill definitions
│   ├── 1-core/
│   ├── automation/
│   ├── collaboration/
│   ├── development/
│   ├── documentation/
│   ├── git-workflow/
│   ├── mcp-integrations/
│   ├── testing/
│   └── thinking/
│
├── 1-core/                  # Core workflow agents
│   ├── orchestrator/
│   ├── selection-planner/
│   ├── review-verification/
│   └── templates/
│
├── 2-bmad/                  # BMAD methodology agents
│   ├── core/                # Mary, Winston, Arthur, John, TEA
│   ├── implementation-executor/
│   ├── modules/
│   └── workflows/
│
├── 3-research/              # Research specialists
│   ├── deep-research/
│   ├── docs-feedback/
│   ├── feature-research/
│   └── oss-discovery/
│
├── 4-specialists/           # Domain specialists
│   ├── architect/           # Winston
│   ├── ralph-agent/         # Ralph
│   ├── custom/
│   └── ...
│
└── 5-enhanced/              # Enhanced capabilities
```

---

## BMAD Agents

| Agent | Role | Location |
|-------|------|----------|
| **Mary** | Business Analyst | `2-bmad/core/` |
| **Winston** | Architect | `4-specialists/architect/` |
| **Arthur** | Developer | `2-bmad/implementation-executor/` |
| **John** | PM | `2-bmad/modules/` |
| **TEA** | Technical Analyst | `3-research/deep-research/` |
| **Quick Flow** | Solo Dev | `2-bmad/core/` |

---

## GSD Agents

| Agent | Role | Pattern |
|-------|------|---------|
| **gsd-planner** | Planning | `1-core/selection-planner/` |
| **gsd-executor** | Execution | `2-bmad/implementation-executor/` |
| **gsd-verifier** | Verification | `1-core/review-verification/` |
| **gsd-researcher** | Research | `3-research/` |
| **gsd-debugger** | Debugging | `4-specialists/ralph-agent/` |

---

## Skills System

### Skill Format

All skills use YAML frontmatter:

```yaml
---
name: "Atomic Planning"
description: "Break down complex goals into atomic plans"
type: "workflow"
agent: "orchestrator"
complexity: "high"
risk: "critical"
context_cost: "medium"
tags: ["planning", "gsd", "core"]
version: "1.0.0"
---

# Atomic Planning

> Break large goals into atomic, executable plans

## Blueprint
...
```

### Skill Categories

| Category | Skills | Purpose |
|----------|--------|---------|
| **1-Core** | ~5 | Foundational capabilities |
| **Automation** | ~5 | Automation workflows |
| **Collaboration** | ~4 | Team coordination |
| **Development** | ~6 | Coding patterns |
| **Documentation** | ~4 | Documentation skills |
| **Git Workflow** | ~5 | Version control |
| **MCP Integrations** | ~6 | External integrations |
| **Testing** | ~5 | Quality assurance |
| **Thinking** | ~5 | Cognitive patterns |

---

## Task Complexity

### Simple Tasks
- 1 file change
- Clear fix
- Low context cost

**Agent:** Quick Flow or gsd-executor

### Medium Tasks
- 2-5 files
- Feature implementation
- Moderate context cost

**Agent:** Arthur, Winston, or Mary

### Complex Tasks
- 5+ files
- New feature/system
- High context cost

**Agent:** Orchestrator (coordinates full BMAD team)

---

## Integration with Claude Code

The agent system integrates with Claude Code through:

1. **Tool Usage** - Agents can use Claude Code tools (Read, Write, Edit, Bash, Grep)
2. **Task Spawning** - Spawn sub-agents via Task tool
3. **Context Management** - Respect GSD context budgeting
4. **Verification** - Goal-backward verification of outcomes

---

## Running Examples

```bash
cd .blackbox5/engine/agents
python examples.py
```

This will run all examples showing:
- Loading agents
- Routing tasks
- Executing tasks
- Parallel execution
- Loading skills
- Composing skills
- Creating custom agents

---

## Status

✅ **Complete and Ready for Use**

- [x] BaseAgent class hierarchy
- [x] AgentLoader with filesystem scanning
- [x] AgentRouter with intelligent routing
- [x] SkillManager with YAML parsing
- [x] ExecutionOrchestrator for workflows
- [x] All 285+ agents organized
- [x] All 40+ skills loaded
- [x] Comprehensive examples
- [x] Full documentation

---

**Next:** Integrate with Brain system for context-aware agent execution.
