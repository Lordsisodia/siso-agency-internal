# BlackBox5 Unification Plan
## From Extracted Frameworks to Working System

**Date**: 2026-01-18
**Status**: Analysis Complete

---

## 🔍 Current State Assessment

### What Actually Exists

#### ✅ Working Components (Can be imported)

**Core Data Structures** (`.blackbox5/engine/core/task_types.py`)
- Task, TaskPriority, TaskStatus enums
- ComplexityScore, RoutingDecision
- AgentCapabilities, RoutingConfig
- **Status**: Fully implemented, imports successfully

#### ❌ Broken Components (Missing dependencies)

**Orchestrator** (`.blackbox5/engine/core/Orchestrator.py`)
- Imports from event_bus, events, task_router, exceptions
- These modules exist but may have dependency issues
- **Status**: Code exists, needs dependency verification

**Event Bus** (`.blackbox5/engine/core/event_bus.py`)
- Redis-based pub/sub system
- Requires `redis` pip package
- **Status**: Code exists, needs Redis + dependencies

**Task Router** (`.blackbox5/engine/core/task_router.py`)
- Complexity-based task routing
- **Status**: Needs dependency verification

**GLM Client** (`.blackbox5/engine/core/GLMClient.py`)
- GLM API integration
- **Status**: Code exists, needs testing

#### 📚 Documentation Only (Not implemented)

- **CLI** (`.blackbox5/bb5.py`) - Created but references non-existent modules
- **Custom Agents** (`.blackbox5/custom_agents/`) - Markdown files only, no code
- **Skills Registry** (`.blackbox5/engine/.skills/SKILLS-REGISTRY.md`) - Documentation, 70 skills listed but most not implemented

#### 🗄️ Extracted Frameworks (Research material)

- **BMAD** - 4-phase methodology, 50+ workflows (as documentation/templates)
- **SpecKit** - Spec-driven development
- **MetaGPT** - SOP-based agent system
- **Swarm** - Emergent behavior patterns

---

## 🎯 What "Unified Working System" Means

A unified system should:

1. **Accept a task** via simple interface (CLI or API)
2. **Route the task** to appropriate agent(s)
3. **Execute the work** using actual tools (file operations, code execution, etc.)
4. **Return results** in structured format
5. **Persist state** across sessions

### Current Gaps

| Component | What We Have | What We Need |
|-----------|--------------|--------------|
| **Task Input** | `bb5.py` CLI (broken) | Working CLI that doesn't crash |
| **LLM Integration** | GLMClient code | Tested, working GLM client |
| **Agent System** | Orchestrator code | Verified working agents |
| **Tool Execution** | MCP docs (14 tools) | Actually working MCP integrations |
| **Memory** | AgentMemory code | Working persistent memory |
| **Workflows** | BMAD templates | Executable workflow engine |

---

## 📋 Unification Action Plan

### Phase 1: Foundation (Critical Path)

#### 1.1 Fix Dependencies
**Goal**: Get core modules importing without errors

**Tasks**:
- [ ] Install missing Python packages
  ```bash
  pip install redis pydantic
  ```
- [ ] Verify all core modules import successfully
- [ ] Create `requirements.txt` with all dependencies

**Files**:
- Create: `.blackbox5/requirements.txt`
- Test: All imports in `engine/core/`

**Estimated Time**: 30 minutes

---

#### 1.2 Create Working GLM Client
**Goal**: Have a tested, working LLM client

**Tasks**:
- [ ] Test GLMClient with real API call
- [ ] Add proper error handling
- [ ] Create mock client for testing
- [ ] Document usage

**Files**:
- Fix: `.blackbox5/engine/core/GLMClient.py`
- Create: `.blackbox5/tests/test_glm_client.py`

**Estimated Time**: 1 hour

---

#### 1.3 Build Minimal Orchestrator
**Goal**: Orchestrate agents (even dummy ones)

**Tasks**:
- [ ] Simplify Orchestrator.py to minimal working version
- [ ] Create dummy agent implementations
- [ ] Test single-agent execution
- [ ] Test multi-agent coordination

**Files**:
- Create: `.blackbox5/engine/core/SimpleOrchestrator.py`
- Create: `.blackbox5/engine/agents/dummy_agents.py`
- Create: `.blackbox5/tests/test_simple_orchestrator.py`

**Estimated Time**: 2 hours

---

### Phase 2: Tool Integration

#### 2.1 Implement Core Tools
**Goal**: Agents can actually do work

**Priority Tools**:
1. **file_read** - Read source files
2. **file_write** - Create/modify files
3. **bash_execute** - Run commands
4. **search** - Find code patterns

**Tasks**:
- [ ] Create tool interface
- [ ] Implement each tool
- [ ] Add error handling
- [ ] Test tools work correctly

**Files**:
- Create: `.blackbox5/engine/tools/base.py`
- Create: `.blackbox5/engine/tools/file_tools.py`
- Create: `.blackbox5/engine/tools/bash_tool.py`
- Create: `.blackbox5/engine/tools/search_tool.py`

**Estimated Time**: 3 hours

---

#### 2.2 Connect Tools to Agents
**Goal**: Agents can use tools via LLM

**Tasks**:
- [ ] Create tool registry
- [ ] Add tool calling logic to GLMClient
- [ ] Create agent with tool access
- [ ] Test agent using tools

**Files**:
- Create: `.blackbox5/engine/core/ToolRegistry.py`
- Modify: `.blackbox5/engine/core/GLMClient.py` (add tool calling)
- Create: `.blackbox5/engine/agents/ToolAgent.py`

**Estimated Time**: 2 hours

---

### Phase 3: CLI Interface

#### 3.1 Working CLI
**Goal**: Users can interact with system

**Tasks**:
- [ ] Fix `bb5.py` to use working modules
- [ ] Add command parsing
- [ ] Add output formatting
- [ ] Test common workflows

**Files**:
- Rewrite: `.blackbox5/bb5.py`
- Create: `.blackbox5/tests/test_cli.py`

**Estimated Time**: 2 hours

---

#### 3.2 Project Integration
**Goal**: System understands SISO-INTERNAL project

**Tasks**:
- [ ] Scan project structure
- [ ] Detect capabilities (React, TypeScript, Supabase)
- [ ] Create project context
- [ ] Route tasks to appropriate agents

**Files**:
- Create: `.blackbox5/engine/core/ProjectScanner.py`
- Create: `.blackbox5/engine/core/ContextBuilder.py`

**Estimated Time**: 2 hours

---

### Phase 4: Custom Agents (Optional)

#### 4.1 Implement Custom Agents
**Goal**: Specialized agents for SISO-INTERNAL

**Tasks**:
- [ ] Convert agent.md specs to working code
- [ ] Frontend Developer agent
- [ ] Backend Developer agent
- [ ] Bug Fixer agent
- [ ] Others as needed

**Files**:
- Create: `.blackbox5/engine/agents/FrontendDeveloper.py`
- Create: `.blackbox5/engine/agents/BackendDeveloper.py`
- Create: `.blackbox5/engine/agents/BugFixer.py`

**Estimated Time**: 4 hours per agent

---

## 🚀 Quick Start Path (Minimum Viable System)

If you want **something working ASAP**, do this:

### Step 1: Install Dependencies (5 min)
```bash
pip install redis pydantic requests
```

### Step 2: Create Simple Task Runner (1 hour)
```python
# .blackbox5/simple_runner.py
from GLMClient import create_glm_client

client = create_glm_client(mock=True)  # Start with mock

def run_task(task: str) -> str:
    response = client.create([
        {"role": "user", "content": task}
    ])
    return response.content

# Test
result = run_task("Say hello")
print(result)
```

### Step 3: Add Tool Use (2 hours)
Extend GLMClient to call tools:
- file_read
- file_write
- bash_execute

### Step 4: Create CLI (1 hour)
```bash
python simple_runner.py "Fix the bug in RewardCatalog.tsx"
```

**Total Time**: 4 hours for basic working system

---

## 📊 Full System Estimate

| Phase | Tasks | Time |
|-------|-------|------|
| Phase 1: Foundation | 3 tasks | 3.5 hours |
| Phase 2: Tools | 2 tasks | 5 hours |
| Phase 3: CLI | 2 tasks | 4 hours |
| Phase 4: Custom Agents | 6+ agents | 24+ hours |
| **TOTAL** | **13+ tasks** | **36+ hours** |

---

## 🎯 Recommended Approach

### Option A: Incremental (Recommended)
1. Start with Phase 1 (Foundation)
2. Get simple task execution working
3. Add tools one at a time
4. Build CLI incrementally
5. Add custom agents as needed

**Pros**: Progress visible early, easier to debug
**Cons**: Takes longer to get "full" system

### Option B: MVP First
1. Build Quick Start Path (4 hours)
2. Have working system immediately
3. Add features incrementally

**Pros**: Working system fast
**Cons**: More refactoring later

### Option C: Research-Driven
1. Study existing frameworks (BMAD, SpecKit, etc.)
2. Extract best patterns
3. Design unified architecture
4. Implement from scratch

**Pros**: Best architecture
**Cons**: Longest time, most work

---

## 🔧 Technical Decisions Needed

### 1. LLM Provider
- [x] GLM (already have API key)
- [ ] Anthropic (would require API key)
- [ ] OpenAI (alternative)
- [ ] Support multiple?

**Recommendation**: Stick with GLM for now

### 2. Tool System
- [ ] MCP (Model Context Protocol)
- [ ] Custom tool interface
- [ ] Function calling
- [ ] Hybrid

**Recommendation**: Start with custom, migrate to MCP later

### 3. Agent Architecture
- [ ] BMAD-style (4-phase, specialized agents)
- [ ] Swarm-style (emergent behavior)
- [ ] Simple orchestration (master + workers)
- [ ] Hybrid

**Recommendation**: Start simple, add complexity as needed

### 4. Memory System
- [ ] Redis (already using for event bus)
- [ ] File-based (AgentMemory.py exists)
- [ ] Vector database (ChromaDB/Neo4j extracted)
- [ ] None (stateless)

**Recommendation**: File-based for now, Redis later

---

## 📝 Next Steps

1. **Choose approach**: Incremental vs MVP vs Research
2. **Install dependencies**: `pip install redis pydantic requests`
3. **Test imports**: Verify core modules load
4. **Pick starting point**: Phase 1.1 or Quick Start Path
5. **Build incrementally**: Test each component before moving on

---

## ⚠️ Reality Check

**What BlackBox5 actually is today**:
- A collection of extracted frameworks (BMAD, SpecKit, MetaGPT, Swarm)
- Some working core modules (task_types)
- Some partially implemented modules (Orchestrator, GLMClient)
- Lots of documentation
- No unified, working system

**What it needs to become**:
- Working LLM integration
- Tool execution capabilities
- Agent coordination
- User interface (CLI/API)
- Project understanding
- Persistent state

**This is real work** - not just "run a script". But the foundation exists. It just needs assembly, testing, and integration.

---

**Ready to proceed?** Pick an approach and let's start building!
