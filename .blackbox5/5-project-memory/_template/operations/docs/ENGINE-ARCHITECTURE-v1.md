# Black Box 5 Engine Architecture

**Version:** 1.0.0
**Status:** Design Complete
**Last Updated:** 2025-01-18

---

## Executive Summary

The Black Box 5 Engine is a **pure Python system** that provides the core AI execution capabilities for the SISO-INTERNAL ecosystem. It implements both **BMAD** (Breakthrough Method for Agile AI-Driven Development) and **GSD** (Goal-Backward Solo Development) methodologies in a unified framework.

### Core Philosophy

- **Separation of Concerns:** Engine handles AI execution, Main App handles business logic
- **Methodology Agnostic:** Supports BMAD, GSD, and custom methodologies
- **API-First:** All capabilities exposed via REST API and WebSocket
- **Artifact-Based:** Persistent outputs that survive context resets

---

## Engine Directory Structure

```
.blackbox5/engine/
├── core/                      # Core Engine Systems
│   ├── boot.py               # Engine initialization & validation
│   ├── schema.yaml           # System structure definition
│   ├── api.py                # REST API server (FastAPI)
│   ├── websocket.py          # Real-time event streaming
│   └── config.yml            # Engine configuration
│
├── agents/                    # Agent System (12+ BMAD Agents)
│   ├── 1-core/               # Core agents
│   │   ├── orchestrator/     # Main task coordinator
│   │   └── executor/         # Task execution agent
│   ├── 2-bmad/               # BMAD methodology agents
│   │   ├── analyst/          # Requirements analysis (Mary)
│   │   ├── architect/        # System architecture (Winston)
│   │   ├── developer/        # Code implementation (Arthur)
│   │   ├── pm/               # Project management (John)
│   │   ├── tea/              # Technical excellence & assurance
│   │   └── quick-flow/       # Rapid workflows
│   ├── 3-research/           # Research specialists
│   │   ├── deep-research/    # Deep research (Mary)
│   │   └── oss-discovery/    # Open source discovery
│   ├── 4-specialists/        # Domain specialists
│   │   ├── ralph-agent/      # Type system & validation (Ralph)
│   │   └── custom/           # Custom specialists
│   ├── 5-enhanced/           # Enhanced capabilities
│   └── .skills/              # Skill library
│       ├── thinking/         # Intelligent routing, deep research
│       ├── mcp-integrations/ # MCP server integrations
│       ├── automation/       # GitHub CLI, long-running ops
│       └── collaboration/    # Code review, skill creation
│
├── frameworks/                # Methodology Frameworks
│   ├── 1-bmad/               # BMAD methodology
│   │   ├── phases/           # 4-phase implementation
│   │   │   ├── 01-elicitation/
│   │   │   ├── 02-analysis/
│   │   │   ├── 03-solutioning/
│   │   │   └── 04-implementation/
│   │   ├── workflows/        # 50+ workflows
│   │   ├── artifacts/        # Artifact templates
│   │   └── agents/           # BMAD agent configs
│   ├── 2-gsd/                # GSD methodology
│   │   ├── context/          # Context budgeting
│   │   ├── commits/          # Atomic commit patterns
│   │   ├── verification/     # Goal-backward verification
│   │   ├── waves/            # Wave-based execution
│   │   ├── checkpoints/      # Checkpoint protocol
│   │   ├── deviations/       # 4-rule deviation handling
│   │   ├── todos/            # Todo management
│   │   └── anti-patterns/    # Anti-pattern detection
│   └── 3-custom/             # Custom methodologies
│
├── brain/                     # Brain / RAG System
│   ├── query/                # Query engines
│   │   ├── vector.py         # Vector search
│   │   ├── graph.py          # Graph-based queries
│   │   └── hybrid.py         # Hybrid vector+graph
│   ├── ingest/               # Knowledge ingestion
│   │   ├── embedder.py       # Text embedding
│   │   ├── indexer.py        # Document indexing
│   │   └── graph_builder.py  # Knowledge graph
│   ├── api/                  # Brain API
│   │   └── brain_api.py      # Query interface
│   └── metadata/             # Schema & metadata
│
├── tools/                     # Core Utilities
│   ├── context_manager.py    # Context budgeting & health
│   ├── git_ops.py            # Git operations
│   ├── indexer.py            # Code indexing
│   ├── tui_logger.py         # Terminal UI logging
│   ├── validator.py          # Architecture validation
│   ├── duplicate_detector.py # Duplicate file detection
│   └── maintenance/          # Maintenance scripts
│
├── modules/                   # Modular Components
│   ├── research/             # Research capabilities
│   │   └── semantic_search.py
│   ├── context/              # Context management
│   │   └── manager.py
│   ├── kanban/               # Task management
│   ├── planning/             # Planning tools
│   └── workflow/             # Workflow orchestration
│
├── ralph/                     # Ralph Type System
│   ├── runtime/              # Runtime execution
│   │   ├── autonomous.py     # Autonomous agent
│   │   └── decision_engine.py
│   ├── validation/           # Schema validation
│   │   ├── spec.py           # Spec validation
│   │   └── cross_artifact.py # Cross-artifact validation
│   └── schema/               # Type schemas
│       └── output.schema.json
│
├── templates/                 # Template System
│   ├── specs/                # PRD, user story templates
│   ├── agents/               # Agent prompt templates
│   ├── artifacts/            # BMAD artifact templates
│   └── code/                 # Code boilerplate
│
├── validation/                # Quality Gates
│   ├── architecture.py       # Architecture compliance
│   ├── artifacts.py          # Artifact validation
│   ├── phase_gates.py        # Phase gate verification
│   └── pre_commit.py         # Pre-commit hooks
│
└── api/                       # API Layer
    ├── routes/               # REST endpoints
    │   ├── status.py
    │   ├── tasks.py
    │   ├── agents.py
    │   ├── plans.py
    │   ├── brain.py
    │   └── workflows.py
    ├── middleware/           # Auth, logging, etc.
    └── models/               # Shared data models
```

---

## Component Breakdown

### 1. Core Engine (Python)

| Component | Purpose | Key Files |
|-----------|---------|-----------|
| **Boot System** | Initialize & validate engine | `boot.py`, `schema.yaml` |
| **API Server** | REST endpoints for GUI | `api.py` (FastAPI) |
| **WebSocket** | Real-time event streaming | `websocket.py` |
| **Config** | Central configuration | `config.yml` |

**Responsibilities:**
- System initialization and validation
- Health monitoring and status reporting
- API request handling and routing
- Event broadcasting to connected clients

---

### 2. Agents (12+ Specialized)

#### Core Agents

| Agent | Expertise | Key Capabilities |
|-------|-----------|------------------|
| **Orchestrator** | Task coordination | Intelligent routing, workload distribution |
| **Executor** | Task execution | Code generation, file operations |

#### BMAD Methodology Agents

| Agent | Role | Expertise |
|-------|------|-----------|
| **Mary** | Analyst | Market research, requirements analysis |
| **Winston** | Architect | System design, technical architecture |
| **Arthur** | Developer | Code implementation, testing |
| **John** | PM | Project management, planning |
| **TEA** | Technical Excellence | Quality assurance, best practices |
| **Quick Flow** | Rapid Workflows | Simple tasks, quick wins |

#### Research Specialists

| Agent | Expertise |
|-------|-----------|
| **Deep Research** | Comprehensive research, analysis |
| **OSS Discovery** | Open source research, evaluation |

#### Domain Specialists

| Agent | Expertise |
|-------|-----------|
| **Ralph** | Type system, validation, contracts |
| **Custom** | Domain-specific implementations |

#### Skill Library

| Category | Skills |
|----------|--------|
| **Thinking** | Intelligent routing, deep research, first principles |
| **MCP Integrations** | Filesystem, GitHub, Supabase integrations |
| **Automation** | GitHub CLI, long-running operations |
| **Collaboration** | Code review, skill creation |

**Agent Capabilities:**
- Domain-specific expertise and knowledge
- Unique personality and communication style
- Specialized tools and workflows
- Intelligent task routing based on complexity

---

### 3. Brain System (RAG)

| Component | Purpose | Technology |
|-----------|---------|------------|
| **Vector Store** | Semantic search | ChromaDB / Pinecone |
| **Knowledge Graph** | Relationship queries | Neo4j |
| **Embedder** | Text → vectors | sentence-transformers |
| **Ingestion** | Knowledge ingestion | Unified pipeline |

**Capabilities:**
- Semantic search across codebase and documentation
- Knowledge graph for relationship queries
- Unified ingestion pipeline for documents
- Hybrid vector + graph queries

---

### 4. Frameworks (Methodologies)

#### BMAD (Breakthrough Method)

| Component | Description |
|-----------|-------------|
| **4-Phase Methodology** | Elicitation → Analysis → Solutioning → Implementation |
| **50+ Workflows** | Pre-built, battle-tested workflows |
| **Artifact System** | Structured outputs that persist between sessions |
| **Domain Enforcement** | Automated duplicate prevention and validation |
| **Quality Gates** | Phase transition validation |

#### GSD (Goal-Backward Solo Development)

| Component | Description |
|-----------|-------------|
| **Context Engineering** | Explicit quality degradation curve (0-30% PEAK, 30-50% GOOD, 50-70% DEGRADING) |
| **Atomic Commits** | Per-task commits with structured format |
| **Goal-Backward Verification** | 3-level verification (Existence → Substantive → Wired) |
| **Wave-Based Execution** | Parallel task execution with dependency resolution |
| **Checkpoint Protocol** | Session persistence with fresh continuation agents |
| **4-Rule Deviation Handling** | Automatic bug fixes and critical additions |
| **Todo Management** | Persistent idea capture |
| **Anti-Pattern Detection** | Quality scanning for TODO, FIXME, placeholders |

---

### 5. Ralph System (Type Validation)

| Component | Purpose |
|-----------|---------|
| **Runtime** | Autonomous execution, decision engine |
| **Validation** | Schema enforcement, spec validation |
| **Cross-Artifact** | Validation across related artifacts |

**Capabilities:**
- Type system and contract validation
- Autonomous agent execution
- Cross-artifact validation
- Output schema enforcement

---

### 6. Tools (Utilities)

| Tool | Purpose |
|------|---------|
| **Context Manager** | Track context budget & health |
| **Git Ops** | Atomic commits, rollback, phase summaries |
| **Indexer** | Code indexing & search |
| **Validator** | Architecture compliance |
| **Duplicate Detector** | Find duplicate files |
| **TUI Logger** | Terminal UI logging with manifest |

---

### 7. Validation (Quality Gates)

| Gate | Purpose |
|------|---------|
| **Architecture** | Domain compliance, duplicate detection |
| **Artifacts** | Quality criteria, validation |
| **Phase Gates** | Phase transition verification |
| **Pre-commit** | Pre-commit validation hooks |

---

## API Endpoints

### Status & Health

```
GET  /status           # Engine health & stats
GET  /health           # Detailed health check
GET  /metrics          # Performance metrics
```

### Tasks

```
GET  /tasks            # Active task list
POST /tasks            # Create new task
GET  /tasks/{id}       # Get task details
PUT  /tasks/{id}       # Update task
DELETE /tasks/{id}     # Delete task
POST /tasks/{id}/run   # Execute task
```

### Agents

```
GET  /agents           # Agent status list
GET  /agents/{id}      # Agent details
POST /agents/{id}/run  # Run specific agent
GET  /agents/{id}/stats # Agent statistics
```

### Plans

```
GET  /plans            # List plans
POST /plans            # Save plan
GET  /plans/{id}       # Get plan details
DELETE /plans/{id}     # Delete plan
```

### Brain

```
GET  /brain/query      # Query brain system
POST /brain/ingest     # Ingest new knowledge
GET  /brain/status     # Brain system status
```

### Workflows

```
GET  /workflows        # List workflows
POST /workflows/run    # Execute workflow
GET  /workflows/{id}   # Get workflow details
```

### WebSocket

```
WS   /events           # Real-time event streaming
```

---

## BMAD + GSD Integration

### Phase-by-Phase Integration

```yaml
# Combined methodology configuration
methodology:
  framework: "BMAD 4-Phase"
  execution: "GSD patterns"

phases:
  elicitation:
    framework: "BMAD"
    agent: "mary"
    execution: "GSD deep questioning"
    output: "product-brief.md"
    context_budget: "30%"

  analysis:
    framework: "BMAD"
    agents: ["mary", "john"]
    execution: "GSD pre-planning discussion"
    output: "prd.md"
    context_budget: "50%"

  solutioning:
    framework: "BMAD"
    agent: "winston"
    execution: "GSD research integration"
    output: "architecture-spec.md"
    context_budget: "50%"

  implementation:
    framework: "BMAD"
    agent: "arthur"
    execution: "GSD wave-based execution"
    output: "working-code"
    git_strategy: "GSD atomic commits"
    verification: "GSD goal-backward"
    context_budget_per_task: "30%"
```

### Agent Selection Logic

```
Simple Task (1 file, clear fix):
  → Quick Flow (BMAD) or gsd-executor (GSD)
  → Context: 0-30% (PEAK)
  → Single atomic commit

Medium Task (2-5 files, feature):
  → Arthur (BMAD Developer) or gsd-executor (GSD)
  → Context: 30-50% (GOOD)
  → 2-3 atomic tasks

Complex Task (5+ files, new feature):
  → BMAD Team (Mary → John → Winston → Arthur)
  → Context: 50% per phase
  → Wave-based execution
  → Per-task atomic commits
  → Goal-backward verification
```

---

## Implementation Status

### ✅ Already Implemented (3/12 GSD components)

- **Goal-Backward Verification** - 3-level checks
- **Atomic Planning** - 2-3 tasks per plan
- **Context Budgeting** - Quality degradation curve

### ❌ Missing Critical Components (9/12 GSD)

- **Per-Task Atomic Commits** - Git workflow integration
- **Wave-Based Execution Orchestrator** - Parallel execution
- **Pre-Planning Context Extraction** - `/gsd:discuss-phase`
- **Checkpoint Protocol System** - Session persistence
- **STATE.md Management** - Cross-session continuity
- **4-Rule Deviation Handling** - Automatic problem solving
- **Todo Management System** - Persistent idea capture
- **Parallel Debugging Architecture** - Efficient debugging
- **Anti-Pattern Detection** - Quality scanning

---

## Migration Matrix

| Source | Destination | Priority |
|--------|-------------|----------|
| `.blackbox5/engine/tools/*` | `engine/tools/` | High |
| `.blackbox5/engine/agents/*` | `engine/agents/` | High |
| `.blackbox/9-brain/*` | `engine/brain/` | High |
| `.blackbox/4-scripts/lib/ralph-runtime/` | `engine/ralph/` | High |
| `.blackbox5/5-templates/specs/` | `engine/templates/specs/` | Medium |
| `.blackbox5/engine/frameworks/1-bmad/` | `engine/frameworks/1-bmad/` | High |
| `.blackbox5/engine/modules/*` | `engine/modules/` | Medium |

---

## Dependencies

### External Services

- **AI Models:** OpenAI, Anthropic Claude
- **Databases:** PostgreSQL, Supabase
- **Vector Stores:** ChromaDB, Pinecone
- **Graph DB:** Neo4j (optional)
- **Version Control:** Git

### Python Packages

```
fastapi          # REST API
uvicorn          # ASGI server
websockets       # WebSocket support
pydantic         # Data validation
sqlalchemy       # Database ORM
chromadb         # Vector store
sentence-transformers  # Embeddings
neo4j            # Graph database (optional)
pygit2           # Git operations
pyyaml           # YAML parsing
```

---

## Expected Results

### Performance Improvements

- **600 duplicate files eliminated** (100% prevention via BMAD)
- **50% → 95%+ AI accuracy** (90% improvement via BMAD)
- **25% productivity boost** (reduced search time)
- **40% performance improvement** (optimized architecture)

### Quality Improvements

- **Zero technical debt accumulation** (via BMAD enforcement)
- **Consistent code quality** (via GSD verification)
- **Atomic version control** (via GSD commits)
- **Context-aware execution** (via GSD budgeting)

---

## Next Steps

### Phase 1: Core GSD Execution (Must Haves)
1. Per-Task Atomic Commit System
2. Wave-Based Execution Orchestrator
3. STATE.md Management

### Phase 2: Advanced GSD Patterns (High Value)
4. Checkpoint Protocol System
5. 4-Rule Deviation Handling
6. Todo Management System

### Phase 3: Quality Assurance (Nice to Haves)
7. Anti-Pattern Detection
8. Parallel Debugging Architecture
9. Pre-Planning Context Extraction

---

*This architecture combines the discipline and structure of BMAD with the execution efficiency of GSD, creating the ultimate methodology for AI-driven development at scale.*
