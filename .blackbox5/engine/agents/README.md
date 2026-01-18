# Black Box 5 Agents - Organized Structure

**Date:** 2025-01-18
**Status:** ✅ Fully Organized

---

## Overview

All agents have been organized into 5 main categories based on their role and specialization:

```
.blackbox5/engine/agents/
├── .skills/                  # 40 skill definitions
├── 1-core/                  # Core workflow agents
├── 2-bmad/                  # BMAD methodology agents
├── 3-research/              # Research specialists
├── 4-specialists/           # Domain specialists
└── 5-enhanced/              # Enhanced capabilities
```

---

## 1. Core Agents (`1-core/`)

**Purpose:** Foundational workflow and execution agents

| Directory | Description |
|-----------|-------------|
| `classification-options` | Task classification and routing |
| `orchestrator` | Main orchestration agent |
| `review-verification` | Review and verification workflows |
| `selection-planner` | Planning and selection |
| `templates` | Core agent templates |

**Files:**
- `prompt.md` - Core agent prompt
- `README.md` - Core agents documentation

**Key Agents:**
- Orchestrator - Coordinates other agents
- Selection Planner - Plans execution
- Review & Verification - Quality gates

---

## 2. BMAD Agents (`2-bmad/`)

**Purpose:** BMAD methodology specialists

| Directory | Description |
|-----------|-------------|
| `core` | Core BMAD agents (Mary, Winston, Arthur, John, TEA) |
| `implementation-executor` | Arthur - Implementation specialist |
| `modules` | BMAD modules and components |
| `workflows` | BMAD workflows (50+ workflows) |

**Files:**
- `README.md` - BMAD agents documentation

**Key Agents:**
- **Mary** - Business Analyst (market research, requirements)
- **Winston** - Architect (system design, architecture)
- **Arthur** - Developer (implementation, coding)
- **John** - PM (project management, requirements)
- **TEA** - Technical Analyst (research, PoCs)
- **Quick Flow** - Solo Dev (fast-track simple tasks)

---

## 3. Research Agents (`3-research/`)

**Purpose:** Research and knowledge discovery

| Directory | Description |
|-----------|-------------|
| `deep-research` | Deep research agent (Mary's research capabilities) |
| `docs-feedback` | Documentation feedback and improvement |
| `feature-research` | Feature research and analysis |
| `oss-discovery` | Open source discovery and evaluation |
| `research-grouping` | Research coordination and grouping |

**Files:**
- `README.md` - Research agents documentation

**Key Agents:**
- Deep Research - Comprehensive analysis, market research
- OSS Discovery - Open source research and evaluation
- Feature Research - Feature analysis and requirements
- Docs Feedback - Documentation improvement

---

## 4. Specialists (`4-specialists/`)

**Purpose:** Domain-specific experts

| Directory | Description |
|-----------|-------------|
| `architect` | Winston - System architect |
| `context-examples` | Context examples and patterns |
| `custom` | Custom specialist agents |
| `executor` | Execution specialists |
| `hierarchical-examples` | Hierarchical task examples |
| `lumelle` | Custom specialist |
| `morning-ui-optimizer` | UI optimization specialist |
| `orchestrator` | Orchestrator specialists |
| `ralph-agent` | Ralph - Type system and validation |
| `ralph-examples` | Ralph usage examples |
| `spec-examples` | Specification examples |

**Files:**
- `orchestrator-metadata.yaml` - Orchestrator configuration
- `README.md` - Specialists documentation

**Key Agents:**
- **Winston** (architect) - System architecture and design
- **Ralph** (ralph-agent) - Type system, validation, contracts
- **Orchestrator** variants - Coordination specialists
- **Custom specialists** - Domain-specific experts
- **Morning UI Optimizer** - UI/UX optimization

---

## 5. Enhanced (`5-enhanced/`)

**Purpose:** Enhanced capabilities and advanced features

| File/Directory | Description |
|----------------|-------------|
| `explore-agent.md` | Exploration agent |
| `librarian-agent.md` | Knowledge management agent |
| `oracle-agent.md` | Decision support agent |
| `run-agent.sh` | Agent execution script |
| `status.sh` | Status check script |
| `test-agents.sh` | Agent testing script |

**Key Agents:**
- **Explore Agent** - Codebase exploration and discovery
- **Librarian Agent** - Knowledge organization
- **Oracle Agent** - Decision support and guidance

---

## Skills (`.skills/`)

**Purpose:** Composable capabilities for agents

```
.skills/
├── 1-core/              # Core skills
├── automation/          # Automation capabilities
├── collaboration/       # Collaboration workflows
├── development/         # Development patterns
├── documentation/       # Documentation skills
├── git-workflow/       # Git workflow skills
├── mcp-integrations/   # MCP server integrations
├── testing/            # Testing strategies
└── thinking/           # Thinking patterns
```

---

## Agent Mapping

### BMAD Agent Mapping

| Agent Name | Role | Category | Location |
|------------|------|----------|----------|
| Mary | Business Analyst | BMAD | `2-bmad/core/` |
| Winston | Architect | Specialist | `4-specialists/architect/` |
| Arthur | Developer | BMAD | `2-bmad/implementation-executor/` |
| John | PM | BMAD | `2-bmad/modules/` |
| TEA | Technical Analyst | Research | `3-research/deep-research/` |
| Quick Flow | Solo Dev | BMAD | `2-bmad/core/` |

### GSD Agent Mapping

| Agent Name | Role | Category | Location |
|------------|------|----------|----------|
| gsd-planner | Planning | Core | `1-core/selection-planner/` |
| gsd-executor | Execution | BMAD | `2-bmad/implementation-executor/` |
| gsd-verifier | Verification | Core | `1-core/review-verification/` |
| gsd-researcher | Research | Research | `3-research/` |
| gsd-debugger | Debugging | Specialist | `4-specialists/ralph-agent/` |

---

## Usage Patterns

### Simple Task
```
User: "Fix this bug"
  ↓
Quick Flow (BMAD) or gsd-executor (GSD)
  ↓
Direct execution with fresh context
```

### Medium Task
```
User: "Add login feature"
  ↓
Arthur (BMAD Developer) or gsd-executor (GSD)
  ↓
2-3 atomic tasks
  ↓
Per-task atomic commits
```

### Complex Task
```
User: "Build partnership system"
  ↓
BMAD Team (Mary → John → Winston → Arthur)
  ↓
4-Phase Methodology
  ↓
Artifact-based handoffs
```

---

## File Count Summary

| Category | Files |
|----------|-------|
| 1-Core | ~50 |
| 2-BMAD | ~60 |
| 3-Research | ~70 |
| 4-Specialists | ~50 |
| 5-Enhanced | ~15 |
| Skills | ~40 |
| **Total** | **~285** |

---

## Integration Points

### With Engine Core

```python
from engine.agents import AgentLoader, AgentRouter

# Load agents
loader = AgentLoader()
agents = loader.load_all()

# Route tasks
router = AgentRouter()
agent = router.route(task)

# Execute
result = await agent.execute(task)
```

### With Brain System

```python
# Query brain for context
context = brain.query(task.description)

# Pass to agent
agent.set_context(context)
```

### With Claude Code

```python
# Use Claude Code tools
agent.use_tool("read", file="...")
agent.use_tool("edit", file="...", ...)
```

---

## Status

✅ **All agents organized and verified**

- All loose directories moved to proper categories
- Duplicate directories removed
- Clear structure based on role
- Ready for integration with engine core

---

**Next:** Implement BaseAgent class and AgentLoader to use these organized agents.
