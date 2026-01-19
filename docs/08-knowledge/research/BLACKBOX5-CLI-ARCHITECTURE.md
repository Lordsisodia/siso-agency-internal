# BlackBox 5 CLI-First Architecture Analysis

**Date:** 2026-01-18
**Status:** Analysis Complete
**Target:** Claude Code CLI Implementation
**Version:** 1.0.0

---

## Executive Summary

This document analyzes BlackBox 5's architecture specifically for implementation through **Claude Code CLI** (this chat interface). It identifies components best-suited for CLI-based development, highlights challenges, and proposes an optimized architecture.

### Key Findings

**Good News:** BlackBox 5 is **exceptionally well-suited** for CLI development
- 70% of components are CLI-native (scripts, markdown configs, plain Python)
- Agent system uses markdown-based definitions (perfect for Read/Edit)
- Skills are YAML + markdown (ideal for text-based editing)
- Existing shell scripts demonstrate CLI-first philosophy

**Challenges:** 30% require special handling
- React GUI requires separate build process
- Multi-agent orchestration needs careful log analysis
- Event-driven systems require structured debugging approach
- Database operations need CLI query tools

---

## Table of Contents

1. [System Overview](#system-overview)
2. [CLI-Friendly Components](#cli-friendly-components)
3. [CLI-Challenging Components](#cli-challenging-components)
4. [Testing Strategy](#testing-strategy)
5. [Debugging Approach](#debugging-approach)
6. [Proposed CLI Architecture](#proposed-cli-architecture)
7. [Implementation Plan](#implementation-plan)

---

## System Overview

### Current Architecture

```
.blackbox5/
├── engine/                    # Core Engine (Python)
│   ├── core/                 # Boot, config, health
│   ├── agents/               # 285+ agent definitions (Markdown!)
│   ├── brain/                # RAG system (PostgreSQL, Neo4j)
│   ├── frameworks/           # BMAD, GSD methodologies
│   ├── runtime/              # 139 shell scripts
│   ├── tools/                # Git ops, indexer, validator
│   ├── memory/               # Extended memory systems
│   └── validation/           # Quality gates
│
├── gui/                       # React Dashboard (SKIP for CLI)
│   └── src/                  # TypeScript + Vite
│
├── memory/                    # Knowledge storage
│   ├── plans/                # Implementation plans
│   └── context/              # Architecture docs
│
└── scratch/                   # Gitignored working state
```

### Technology Stack

| Component | Technology | CLI-Friendly |
|-----------|-----------|--------------|
| **Agents** | Markdown + YAML | ✅ Perfect |
| **Skills** | YAML frontmatter + Markdown | ✅ Perfect |
| **Tools** | Pure Python scripts | ✅ Perfect |
| **Runtime** | Shell scripts (139) | ✅ Perfect |
| **Brain** | PostgreSQL, Neo4j | ⚠️ Requires CLI tools |
| **API** | FastAPI | ⚠️ Can't run interactively |
| **GUI** | React + Vite | ❌ Not CLI-friendly |
| **Tests** | Pytest | ✅ Perfect |

---

## CLI-Friendly Components

### 1. Agent System (EXCELLENT for CLI)

**Why It Works Well:**
- Agents are **markdown files** with structured YAML frontmatter
- Can be read, edited, and created using Read/Edit tools
- No compilation or build steps required
- Easy to validate through simple Python scripts

**Example Agent Structure:**
```markdown
---
name: "Orchestrator"
type: "core"
category: "coordination"
version: "1.0.0"
---

# Orchestrator Agent

## Purpose
Coordinates task distribution across specialized agents.

## Capabilities
- Intelligent routing
- Workload distribution
- Agent handoff
```

**CLI Workflow:**
1. Read existing agent: `Read /path/to/orchestrator.md`
2. Edit agent capabilities: `Edit` tool to modify sections
3. Validate: Run Python script to check YAML validity
4. Test: Execute agent through CLI wrapper

**File Locations:**
- `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/engine/agents/1-core/`
- `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/engine/agents/2-bmad/`
- `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/engine/agents/3-research/`
- `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/engine/agents/4-specialists/`

---

### 2. Skills System (PERFECT for CLI)

**Why It Works Well:**
- Skills are **single-file markdown** with YAML metadata
- Self-contained documentation + process
- Can be created and modified entirely through Read/Write/Edit
- No dependencies or build process

**Example Skill Structure:**
```yaml
---
name: "deep-research"
description: "Comprehensive research on complex topics"
type: "workflow"
agent: "all"
complexity: "high"
context_cost: "high"
tags: ["research", "analysis"]
---

# Deep Research Skill

## When to Use
- Complex, multi-faceted topics
- Require comprehensive understanding
- Need source-backed findings

## Process
1. [ ] Define research scope
2. [ ] Identify key questions
3. [ ] Search authoritative sources
4. [ ] Synthesize findings
5. [ ] Create summary report
```

**CLI Workflow:**
1. List available skills: `Glob` for `.skills/**/*.md`
2. Read skill: `Read /path/to/skill.md`
3. Create new skill: `Write` new file with YAML + markdown
4. Validate: Python script checks YAML syntax

**File Locations:**
- `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/engine/agents/.skills/`

---

### 3. Python Tools (EXCELLENT for CLI)

**Why It Works Well:**
- Pure Python scripts with clear inputs/outputs
- Can be executed via Bash tool
- Easy to test with pytest
- Good separation of concerns

**Existing Tools:**
```python
# Git Operations
git_ops.py → Atomic commits, status checks

# Code Indexing
indexer.py → Generate code index

# Context Management
context_manager.py → Track token usage

# Validation
validator.py → Check architecture compliance
```

**CLI Workflow:**
1. Read tool: `Read git_ops.py`
2. Understand API: Look at function signatures
3. Modify: `Edit` tool to change behavior
4. Test: `python git_ops.py check`
5. Commit: Use tool itself to commit changes

**File Locations:**
- `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/engine/tools/`

---

### 4. Shell Scripts (PERFECT for CLI)

**Why It Works Well:**
- 139 shell scripts already demonstrate CLI-first approach
- Simple, linear, easy to understand
- Can be tested directly in terminal
- Great for orchestration and automation

**Key Script Categories:**

**Planning & Execution:**
- `autonomous-run.sh` - Start autonomous agent loop
- `new-plan.sh` - Create implementation plan
- `new-step.sh` - Add plan step
- `action-plan.sh` - Generate action plans

**Monitoring & Status:**
- `monitor.sh` - System monitoring
- `ralph-status.sh` - Check Ralph agent status
- `plan-status.py` - Plan progress tracking

**Testing & Validation:**
- `start-testing.sh` - Run test suite
- `validate-all.sh` - Validate entire system
- `check-dependencies.sh` - Verify dependencies

**Memory Management:**
- `auto-compact.sh` - Compact working memory
- `compact-context.sh` - Clean up context

**CLI Workflow:**
1. List scripts: `Glob` for `**/*.sh`
2. Read script: `Read autonomous-run.sh`
3. Understand logic: Read through bash code
4. Modify: `Edit` tool to change behavior
5. Test: `bash autonomous-run.sh --dry-run`
6. Monitor: Check logs in `scratch/`

**File Locations:**
- `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/engine/runtime/`

---

### 5. Documentation & Plans (PERFECT for CLI)

**Why It Works Well:**
- Markdown format is native to Read/Edit tools
- Can be read and modified entirely through CLI
- No compilation or rendering required
- Git-tracked version history

**Document Types:**
- **Plans:** Implementation checklists in `memory/plans/`
- **Context:** Architecture docs in `memory/context/`
- **Skills:** Agent capabilities in `.skills/`
- **READMEs:** Component documentation

**CLI Workflow:**
1. Browse docs: `Glob` for `**/*.md`
2. Read doc: `Read /path/to/doc.md`
3. Update: `Edit` tool to add sections
4. Review: `git diff` to see changes
5. Commit: Atomic commit via `git_ops.py`

**File Locations:**
- `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/memory/`

---

## CLI-Challenging Components

### 1. React GUI (NOT SUITABLE for CLI)

**Challenge:**
- Requires separate build process (npm/vite)
- Can't "run and see" in traditional sense
- Visual debugging impossible through CLI
- Hot reload doesn't work in chat interface

**Recommendation:**
- **SKIP GUI development** during CLI-only phase
- Focus on **CLI-first architecture** instead
- Build GUI later when you have IDE access
- Or: Use existing GUI as-is, don't modify

**Alternative:**
- Build **TUI (Terminal UI)** using `rich` or `textual`
- TUI is CLI-friendly and provides visual feedback
- Can be tested entirely through terminal

**File Locations:**
- `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/gui/` → SKIP

---

### 2. Multi-Agent Orchestration (CHALLENGING)

**Challenge:**
- Multiple agents running concurrently
- Complex handoff logic
- Difficult to observe in real-time
- Event-driven architecture is hard to debug

**Why It's Hard:**
- Can't see agent "thinking" process
- Handoff failures are opaque
- Race conditions hard to reproduce
- No visual debugger

**Solutions:**

**A. Structured Logging**
```python
# Agent execution wrapper
class AgentRunner:
    def run_agent(self, agent_name: str, task: str):
        # Log start
        self.log_event("AGENT_START", {
            "agent": agent_name,
            "task": task,
            "timestamp": datetime.now()
        })

        # Run agent
        result = self.execute_agent(agent_name, task)

        # Log complete
        self.log_event("AGENT_COMPLETE", {
            "agent": agent_name,
            "result": result,
            "duration": elapsed_time
        })

        return result
```

**B. Manifest Files**
```markdown
# Agent Execution Manifest

## Run 2026-01-18-14:30

### Agent Orchestrator
- **Started:** 2026-01-18 14:30:00
- **Task:** "Implement user authentication"
- **Context:** 45,234 tokens
- **Decision:** Route to Arthur (Developer)

### Agent Arthur
- **Started:** 2026-01-18 14:31:15
- **Task:** "Implement auth flow"
- **Files Modified:**
  - `src/auth/login.ts`
  - `src/auth/register.ts`
- **Result:** Success

### Handoff Back to Orchestrator
- **Time:** 2026-01-18 14:45:30
- **Status:** Complete
```

**C. CLI Testing Strategy**
```bash
# Test single agent
python -m engine.core.agent_runner --agent arthur --task "fix bug"

# Test orchestration
python -m engine.core.orchestrator --dry-run --plan auth-fix

# Monitor execution
tail -f scratch/agent-execution.log
```

**File Locations:**
- `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/engine/core/`

---

### 3. Event-Driven Systems (CHALLENGING)

**Challenge:**
- WebSocket events can't be observed directly
- Async execution is hard to follow
- No breakpoints or step-through debugging
- Race conditions hard to detect

**Solutions:**

**A. Event Log**
```python
# Event logging system
class EventLogger:
    def __init__(self, log_path: str):
        self.log_path = log_path

    def log(self, event_type: str, data: dict):
        event = {
            "timestamp": datetime.now().isoformat(),
            "type": event_type,
            "data": data
        }
        with open(self.log_path, "a") as f:
            f.write(json.dumps(event) + "\n")
```

**B. Event Replay**
```python
# Replay events for debugging
def replay_events(log_path: str):
    with open(log_path) as f:
        for line in f:
            event = json.loads(line)
            print(f"[{event['timestamp']}] {event['type']}")
            print(f"  Data: {event['data']}")
```

**C. CLI Debugging**
```bash
# View event stream
tail -f scratch/events.log

# Filter events
grep "AGENT_HANDOFF" scratch/events.log

# Analyze patterns
python scripts/analyze_events.py scratch/events.log
```

**File Locations:**
- `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/engine/core/websocket.py`

---

### 4. Database Operations (MODERATE)

**Challenge:**
- Can't use GUI database tools
- Need to query databases through CLI
- Schema migrations require careful planning
- Data visualization is limited

**Solutions:**

**A. CLI Query Tools**
```bash
# PostgreSQL
psql -h localhost -U user -d blackbox5

# Neo4j
cypher-shell -u neo4j -p password

# Or use Python scripts
python scripts/query_brain.py "find all agents"
```

**B. Migration Scripts**
```python
# Migration runner
class MigrationRunner:
    def __init__(self, db_config: dict):
        self.db = self.connect(db_config)

    def apply_migration(self, migration_file: str):
        sql = open(migration_file).read()
        self.db.execute(sql)
        print(f"✅ Applied {migration_file}")
```

**C. Schema Validation**
```python
# Validate schema matches expectations
def validate_schema():
    # Check tables exist
    # Check columns match
    # Check indexes present
    # Report issues
```

**File Locations:**
- `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/engine/brain/databases/`

---

### 5. FastAPI Server (MODERATE)

**Challenge:**
- Can't run server interactively in CLI
- Can't test endpoints in browser
- Hot reload doesn't help
- Error logs are primary feedback

**Solutions:**

**A. Background Execution**
```bash
# Start server in background
uvicorn engine.core.api:app --host 0.0.0.0 --port 8000 &
SERVER_PID=$!

# Wait for startup
sleep 3

# Test endpoints
curl http://localhost:8000/status
curl http://localhost:8000/agents

# Kill server when done
kill $SERVER_PID
```

**B. Test Scripts**
```python
# Test endpoints automatically
def test_api():
    response = requests.get("http://localhost:8000/status")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
```

**C. Log Monitoring**
```bash
# Start server with logging
uvicorn engine.core.api:app --log-level debug > scratch/api.log 2>&1 &

# Monitor logs
tail -f scratch/api.log

# Test endpoints
python scripts/test_api.py
```

**File Locations:**
- `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/engine/core/api.py`

---

## Testing Strategy

### 1. Unit Testing (EXCELLENT)

**Approach:**
- Use pytest for Python components
- Test each tool in isolation
- Mock external dependencies
- Fast feedback loop

**CLI Workflow:**
```bash
# Run all tests
pytest engine/tests/

# Run specific test file
pytest engine/tests/test_git_ops.py

# Run with coverage
pytest --cov=engine/tools engine/tests/

# View results
cat scratch/pytest-report.txt
```

**File Locations:**
- `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/engine/*/tests/`

---

### 2. Integration Testing (GOOD)

**Approach:**
- Test component interactions
- Use real databases (test instances)
- Validate end-to-end flows
- Slower but comprehensive

**CLI Workflow:**
```bash
# Setup test database
psql -c "CREATE DATABASE blackbox5_test;"

# Run migrations
python scripts/migrate.py --database blackbox5_test

# Run integration tests
pytest engine/tests/integration/

# Cleanup
psql -c "DROP DATABASE blackbox5_test;"
```

**File Locations:**
- `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/engine/runtime/testing/`

---

### 3. Agent Testing (MODERATE)

**Challenge:**
- Agents are LLM-based (non-deterministic)
- Hard to assert exact outputs
- Need evaluation metrics

**Solutions:**

**A. Evaluation Framework**
```python
# Evaluate agent performance
class AgentEvaluator:
    def evaluate(self, agent_name: str, test_cases: list):
        results = []
        for case in test_cases:
            output = self.run_agent(agent_name, case["input"])
            score = self.compare(output, case["expected"])
            results.append({"case": case, "score": score})
        return results
```

**B. Test Cases**
```yaml
# test-cases.yaml
agent: "arthur"
tests:
  - input: "Fix typo in README"
    expected_behavior: "edit single file"
    max_files: 1
    max_time: 30
```

**C. Human Review**
```bash
# Run agent with test input
python scripts/test_agent.py arthur "Fix typo"

# Review manifest
cat scratch/agent-manifest.md

# Rate quality
python scripts/rate_output.py scratch/agent-output.json
```

**File Locations:**
- `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/engine/runtime/testing/`

---

### 4. Multi-Agent Testing (CHALLENGING)

**Challenge:**
- Complex orchestration
- Many failure modes
- Hard to reproduce

**Solutions:**

**A. Scenario Testing**
```python
# Test complete scenarios
def test_user_authentication_flow():
    # 1. Orchestrator receives task
    # 2. Routes to Mary (analysis)
    # 3. Mary creates PRD
    # 4. Routes to Arthur (implementation)
    # 5. Arthur implements auth
    # 6. Returns to orchestrator
    # 7. Orchestrator verifies
    # Assert each step completes
```

**B. Dry Run Mode**
```bash
# Test orchestration without side effects
python -m engine.core.orchestrator \
    --task "Implement auth" \
    --dry-run \
    --output scratch/dry-run-manifest.md
```

**C. Log Analysis**
```bash
# Run orchestration
python scripts/run_orchestration.py auth-flow

# Analyze logs
python scripts/analyze_orchestration.py scratch/orchestration.log

# Check for issues
grep "ERROR" scratch/orchestration.log
grep "HANDOFF_FAILURE" scratch/orchestration.log
```

**File Locations:**
- `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/engine/runtime/testing/end-to-end/`

---

## Debugging Approach

### 1. Log-Based Debugging (PRIMARY METHOD)

**Philosophy:**
- Since we can't use breakpoints, **log everything**
- Structured logs are better than print statements
- Log at entry/exit of every function
- Log all decisions and state changes

**Logging Pattern:**
```python
import structlog

logger = structlog.get_logger()

def process_task(task: str):
    log = logger.bind(task=task)

    log.info("process_task.start")
    try:
        # Do work
        result = do_work(task)
        log.info("process_task.success", result=result)
        return result
    except Exception as e:
        log.error("process_task.error", error=str(e))
        raise
```

**Log Analysis:**
```bash
# Follow logs in real-time
tail -f scratch/engine.log

# Search for specific events
grep "process_task.start" scratch/engine.log

# Analyze patterns
python scripts/analyze_logs.py scratch/engine.log

# Visualize timeline
python scripts/visualize_timeline.py scratch/engine.log
```

---

### 2. Manifest Files (KEY INSIGHT)

**Philosophy:**
- Every operation creates a **manifest file**
- Manifest records: what, why, how, result
- Provides audit trail and debugging info
- Easy to review in markdown

**Manifest Template:**
```markdown
# Operation Manifest: {operation_name}

## Metadata
- **ID:** {unique_id}
- **Type:** {operation_type}
- **Started:** {timestamp}
- **Duration:** {elapsed_time}

## Input
- **Task:** {task_description}
- **Context:** {context_summary}
- **Parameters:** {parameters}

## Execution
### Step 1: {step_name}
- **Action:** {action_taken}
- **Result:** {result}
- **Artifacts:** {files_created}

### Step 2: {step_name}
...

## Output
- **Success:** {true/false}
- **Result:** {final_result}
- **Artifacts:** {all_files_created}
- **Metrics:** {performance_metrics}

## Issues
- {any_issues_encountered}

## Next Steps
- {recommended_next_actions}
```

**CLI Workflow:**
```bash
# After operation completes
cat scratch/manifest-{id}.md

# Review what happened
grep "## Issues" scratch/manifest-*.md

# Find recent operations
ls -lt scratch/manifest-*.md | head -5
```

---

### 3. Incremental Development (CRITICAL)

**Philosophy:**
- Build in **small, testable increments**
- Each increment is an atomic commit
- Test after every change
- Roll back if something breaks

**Workflow:**
```bash
# 1. Make small change
Edit file.py

# 2. Test immediately
pytest test_file.py

# 3. If fails, fix or revert
git checkout file.py

# 4. If passes, commit
python tools/git_ops.py commit \
    --type feat \
    --scope agent-loader \
    --desc "Add agent loading" \
    --files file.py
```

**Benefits:**
- Always know what broke
- Easy to revert bad changes
- Git bisect works well
- Progress is visible

---

### 4. State Inspection

**Challenge:**
- Can't pause execution and inspect variables
- Need alternative ways to see state

**Solutions:**

**A. State Dumps**
```python
# Dump state to file for inspection
def dump_state(state: dict, path: str):
    with open(path, "w") as f:
        json.dump(state, f, indent=2)

# Use in code
def complex_function():
    state = {"intermediate": calculate()}
    dump_state(state, "scratch/state-dump.json")
    result = finalize(state)
    return result
```

**B. Checkpoints**
```python
# Save checkpoints during execution
class CheckpointManager:
    def save(self, name: str, state: dict):
        path = f"scratch/checkpoints/{name}.json"
        with open(path, "w") as f:
            json.dump(state, f)

    def load(self, name: str) -> dict:
        path = f"scratch/checkpoints/{name}.json"
        with open(path) as f:
            return json.load(f)
```

**C. Inspection Scripts**
```python
# Inspect saved state
def inspect_checkpoint(checkpoint_name: str):
    state = load_checkpoint(checkpoint_name)
    print(f"Checkpoint: {checkpoint_name}")
    print(f"Keys: {list(state.keys())}")
    print(f"Summary: {summarize_state(state)}")
```

**CLI Workflow:**
```bash
# Run function that saves checkpoints
python scripts/run_with_checkpoints.py

# Inspect checkpoints
ls -lt scratch/checkpoints/
python scripts/inspect_checkpoint.py checkpoint-001.json

# Compare checkpoints
diff scratch/checkpoints/001.json scratch/checkpoints/002.json
```

---

## Proposed CLI Architecture

### Design Principles

1. **Text-First:** Everything is text (markdown, YAML, JSON)
2. **Scriptable:** All operations via scripts
3. **Observable:** Extensive logging and manifests
4. **Testable:** Unit tests for everything
5. **Incremental:** Small changes, atomic commits

---

### Layer 1: Core Engine (Python)

**Components:**
- **Boot System:** Initialize and validate
- **Config Loader:** Multi-strategy configuration
- **Agent Loader:** Load agent definitions
- **Skill Parser:** Parse YAML frontmatter
- **Task Router:** Route tasks to agents

**CLI Interface:**
```bash
# Boot engine
python -m engine.core.boot

# Check status
python -m engine.core.status

# Load agent
python -m engine.core.agents load --agent orchestrator

# Route task
python -m engine.core.router --task "Fix bug" --agent arthur
```

**File Locations:**
- `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/engine/core/`

---

### Layer 2: Agent System (Markdown)

**Components:**
- **Agent Definitions:** 285+ markdown files
- **Skill Library:** 40 composable skills
- **Agent Runtime:** Execute agents
- **Agent Orchestator:** Coordinate multi-agent flows

**CLI Interface:**
```bash
# List agents
python -m engine.tools.list_agents

# Show agent details
python -m engine.tools.show_agent --agent orchestrator

# Run agent
python -m engine.runtime.run_agent \
    --agent arthur \
    --task "Implement feature" \
    --output scratch/agent-run.md

# Run orchestration
python -m engine.runtime.orchestrate \
    --plan auth-implementation \
    --dry-run
```

**File Locations:**
- `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/engine/agents/`

---

### Layer 3: Brain System (Databases)

**Components:**
- **Metadata Ingestion:** Parse and index metadata.yaml
- **PostgreSQL Store:** Structured queries
- **Neo4j Store:** Graph queries
- **Query Interface:** Unified query API

**CLI Interface:**
```bash
# Ingest metadata
python -m engine.brain.ingest --path .blackbox5/engine/agents

# Query database
python -m engine.brain.query \
    --type sql \
    --query "SELECT * FROM agents WHERE type='specialist'"

# Semantic search
python -m engine.brain.query \
    --type semantic \
    --query "Find agents similar to orchestrator"

# Graph query
python -m engine.brain.query \
    --type graph \
    --query "MATCH (a:Agent {name:'orchestrator'})-[:DEPENDS_ON]->(dep) RETURN dep"
```

**File Locations:**
- `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/engine/brain/`

---

### Layer 4: Runtime Environment (Shell Scripts)

**Components:**
- **139 Shell Scripts:** Orchestration, monitoring, testing
- **Workflow Scripts:** High-level operations
- **Monitoring Scripts:** Status and health checks
- **Utility Scripts:** Helpers and tools

**CLI Interface:**
```bash
# Start autonomous loop
bash engine/runtime/autonomous-loop.sh

# Create new plan
bash engine/runtime/new-plan.sh --name "Auth Implementation"

# Monitor system
bash engine/runtime/monitor.sh

# Run tests
bash engine/runtime/start-testing.sh
```

**File Locations:**
- `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/engine/runtime/`

---

### Layer 5: Tools & Utilities (Python)

**Components:**
- **Git Operations:** Atomic commits
- **Indexer:** Code indexing
- **Validator:** Architecture validation
- **Context Manager:** Token tracking

**CLI Interface:**
```bash
# Atomic commit
python tools/git_ops.py commit \
    --type feat \
    --scope agents \
    --desc "Add new agent" \
    --files agent.md

# Generate index
python tools/indexer.py \
    --root /path/to/project \
    --output memory/code_index.md

# Validate architecture
python tools/validator.py \
    --schema engine/core/schema.yaml \
    --path .blackbox5

# Check context
python tools/context_manager.py status
```

**File Locations:**
- `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/engine/tools/`

---

### Layer 6: Quality Gates (Validation)

**Components:**
- **Architecture Validator:** Check compliance
- **Artifact Validator:** Quality checks
- **Pre-commit Hooks:** Git validation
- **Test Runner:** Execute tests

**CLI Interface:**
```bash
# Validate architecture
python validation/architecture.py

# Validate artifacts
python validation/artifacts.py --agent orchestrator

# Run pre-commit
python validation/pre_commit.py

# Run all tests
pytest engine/tests/ -v
```

**File Locations:**
- `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/engine/validation/`

---

## Implementation Plan

### Phase 1: Foundation (Week 1-2)

**Goal:** Get basic CLI workflow working

**Tasks:**
1. ✅ Set up Python environment
2. ✅ Install dependencies (`requirements.txt`)
3. ✅ Boot system (`engine/core/boot.py`)
4. ✅ Config loader (`engine/core/config.py`)
5. ✅ Basic agent loader
6. ✅ Skill parser (YAML frontmatter)
7. ✅ Git operations tool

**Deliverables:**
- Engine boots successfully
- Can load agent definitions
- Can parse skill metadata
- Can make atomic commits

**Testing:**
```bash
# Test boot
python -m engine.core.boot

# Test agent loading
python -m engine.core.agents list

# Test git ops
python tools/git_ops.py commit --type test --scope cli --desc "Test" --files test.md
```

---

### Phase 2: Agent Execution (Week 3-4)

**Goal:** Execute single agents through CLI

**Tasks:**
1. ✅ Agent runtime (execute agent definitions)
2. ✅ Task router (simple routing logic)
3. ✅ Manifest generation (operation records)
4. ✅ Logging system (structured logs)
5. ✅ Error handling (graceful failures)

**Deliverables:**
- Can run single agent
- Creates manifest file
- Logs all operations
- Handles errors gracefully

**Testing:**
```bash
# Run simple agent
python -m engine.runtime.run_agent \
    --agent arthur \
    --task "Create hello world" \
    --output scratch/agent-run.md

# Check manifest
cat scratch/agent-run-manifest.md

# Check logs
tail -f scratch/agent.log
```

---

### Phase 3: Orchestration (Week 5-6)

**Goal:** Coordinate multiple agents

**Tasks:**
1. ✅ Orchestrator agent (coordination logic)
2. ✅ Agent handoff (pass control between agents)
3. ✅ Task decomposition (break down tasks)
4. ✅ Workflow engine (execute workflows)
5. ✅ Multi-agent testing

**Deliverables:**
- Can run multi-agent workflows
- Agents hand off correctly
- Tasks are decomposed properly
- Workflows complete successfully

**Testing:**
```bash
# Run orchestration
python -m engine.runtime.orchestrate \
    --plan feature-implementation \
    --dry-run

# Check orchestration log
cat scratch/orchestration-manifest.md

# Analyze performance
python scripts/analyze_orchestration.py scratch/orchestration.log
```

---

### Phase 4: Brain System (Week 7-8)

**Goal:** Implement knowledge system

**Tasks:**
1. ✅ Metadata schema (define structure)
2. ✅ Metadata validator (check validity)
3. ✅ PostgreSQL setup (database)
4. ✅ Ingestion pipeline (index artifacts)
5. ✅ Query interface (search system)

**Deliverables:**
- All artifacts have metadata.yaml
- Metadata is validated
- PostgreSQL database populated
- Can query for artifacts

**Testing:**
```bash
# Ingest metadata
python -m engine.brain.ingest --path .blackbox5/engine/agents

# Query database
python -m engine.brain.query \
    --type sql \
    --query "SELECT name, path FROM agents WHERE type='specialist'"

# Semantic search
python -m engine.brain.query \
    --type semantic \
    --query "agents for code review"
```

---

### Phase 5: Integration & Testing (Week 9-10)

**Goal:** Full system integration

**Tasks:**
1. ✅ End-to-end testing
2. ✅ Performance testing
3. ✅ Documentation
4. ✅ Example workflows
5. ✅ CLI polish

**Deliverables:**
- All components integrated
- Tests passing
- Documentation complete
- Example workflows working

**Testing:**
```bash
# Run full system test
pytest engine/tests/integration/ -v

# Run example workflow
bash engine/runtime/example-workflow.sh

# Check system health
python -m engine.core.health
```

---

## Key Insights

### What Works Well

1. **Markdown-based agents** - Perfect for Read/Edit workflow
2. **YAML frontmatter** - Easy to parse and validate
3. **Shell scripts** - Already demonstrate CLI-first approach
4. **Pure Python tools** - Testable and maintainable
5. **Structured logging** - Essential for debugging

### What Requires Care

1. **Multi-agent orchestration** - Needs good logging and manifests
2. **Event-driven systems** - Event logs are critical
3. **Database operations** - CLI query tools needed
4. **Async operations** - Need to observe through logs

### What to Avoid

1. **React GUI** - Skip during CLI-only development
2. **Interactive debugging** - Can't use breakpoints
3. **Visual tools** - Must use CLI alternatives
4. **Hot reload** - Doesn't work in chat context

---

## Best Practices

### Development Workflow

1. **Start with manifest** - Define what you're doing
2. **Make small changes** - Edit single files
3. **Test immediately** - Run tests after each change
4. **Commit frequently** - Atomic commits via git_ops.py
5. **Review logs** - Check logs after every operation

### File Organization

1. **Keep agents in markdown** - Easy to read and edit
2. **Use YAML for metadata** - Structured and parseable
3. **Log everything** - Structured logs to files
4. **Create manifests** - Record all operations
5. **Version control** - Git for everything

### Testing Strategy

1. **Unit tests first** - Test each component
2. **Integration tests** - Test interactions
3. **Scenario tests** - Test complete workflows
4. **Log analysis** - Review logs after runs
5. **Human review** - Check manifests

---

## Conclusion

BlackBox 5 is **exceptionally well-suited** for CLI-based development through Claude Code. The system's design philosophy aligns perfectly with CLI constraints:

**Strengths:**
- 70% of components are CLI-native
- Markdown-based agents and skills
- Shell script orchestration
- Text-based configuration
- Strong testing infrastructure

**Challenges:**
- Multi-agent orchestration (solved with logging)
- Event-driven systems (solved with event logs)
- Database operations (solved with CLI tools)
- GUI development (skip for now)

**Recommendation:**
Proceed with CLI-first implementation. The architecture is sound, the tools are in place, and the workflow is well-defined. Focus on:

1. **Core engine** (boot, config, agent loader)
2. **Agent execution** (single agent, then orchestration)
3. **Brain system** (metadata, ingestion, query)
4. **Testing** (unit, integration, scenario)

Skip GUI development until you have IDE access. Build CLI tools instead.

---

## Appendices

### A. File Structure Reference

```
.blackbox5/
├── engine/
│   ├── core/                    ✅ CLI-friendly
│   ├── agents/                  ✅ CLI-friendly (Markdown)
│   ├── brain/                   ⚠️ Requires CLI tools
│   ├── frameworks/              ✅ CLI-friendly
│   ├── runtime/                 ✅ CLI-friendly (Shell scripts)
│   ├── tools/                   ✅ CLI-friendly (Python)
│   ├── memory/                  ✅ CLI-friendly
│   └── validation/              ✅ CLI-friendly
├── gui/                         ❌ Skip for CLI
├── memory/                      ✅ CLI-friendly (Markdown)
└── scratch/                     ✅ CLI-friendly
```

### B. CLI Commands Reference

```bash
# Engine
python -m engine.core.boot                    # Boot engine
python -m engine.core.status                  # Check status
python -m engine.core.health                  # Health check

# Agents
python -m engine.tools.list_agents            # List agents
python -m engine.tools.show_agent             # Show agent details
python -m engine.runtime.run_agent            # Run agent

# Brain
python -m engine.brain.ingest                 # Ingest metadata
python -m engine.brain.query                  # Query database

# Tools
python tools/git_ops.py commit                # Atomic commit
python tools/indexer.py                       # Generate index
python tools/validator.py                     # Validate architecture

# Runtime
bash engine/runtime/autonomous-loop.sh        # Autonomous loop
bash engine/runtime/new-plan.sh               # Create plan
bash engine/runtime/monitor.sh                # Monitor system
```

### C. Testing Commands

```bash
# Unit tests
pytest engine/tests/ -v

# Integration tests
pytest engine/tests/integration/ -v

# With coverage
pytest --cov=engine engine/tests/

# Specific test
pytest engine/tests/test_git_ops.py -v

# Run scenario
bash engine/runtime/testing/scenario-auth.sh
```

### D. Debugging Commands

```bash
# Follow logs
tail -f scratch/engine.log

# Search logs
grep "ERROR" scratch/engine.log

# View manifest
cat scratch/manifest-*.md

# Inspect checkpoint
python scripts/inspect_checkpoint.py checkpoint.json

# Analyze orchestration
python scripts/analyze_orchestration.py scratch/orchestration.log
```

---

**Status:** Analysis Complete
**Next Steps:** Begin Phase 1 implementation
**Maintainer:** CLI Development Team
**Last Updated:** 2026-01-18
