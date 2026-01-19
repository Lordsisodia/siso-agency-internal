# Black Box 5 Agent System - Migration Inventory

**Migration Date:** 2025-01-18
**Source:** `.blackbox/` (Black Box 4)
**Destination:** `.blackbox5/engine/` (Black Box 5)

---

## Executive Summary

✅ **All components successfully migrated from Black Box 4 to Black Box 5**

| Component | Files | Status |
|-----------|-------|--------|
| **Agents** | 255 | ✅ Complete |
| **Skills** | 40 | ✅ Complete |
| **Runtime** | 534 | ✅ Complete |
| **Brain** | 61 | ✅ Complete |
| **Total** | 890+ | ✅ Complete |

---

## 1. Agents (`engine/agents/`)

### Directory Structure

```
agents/
├── 1-core/                   # Core agents and templates
├── 2-bmad/                   # BMAD methodology agents
│   ├── core/                # Core BMAD workflows
│   ├── modules/             # BMAD modules
│   └── workflows/           # BMAD workflows
├── 3-research/              # Research specialists
│   ├── deep-research/       # Deep research agent (Mary)
│   ├── docs-feedback/       # Documentation feedback
│   ├── feature-research/    # Feature research
│   └── oss-discovery/       # OSS discovery
├── 4-specialists/           # Domain specialists
│   ├── architect/           # Architect (Winston)
│   ├── orchestrator/        # Orchestrator
│   ├── ralph-agent/         # Ralph type system
│   ├── ralph-examples/      # Ralph examples
│   └── custom/              # Custom specialists
├── 5-enhanced/              # Enhanced capabilities
├── core/                    # Additional core agents
│   ├── orchestrator/
│   └── templates/
├── implementation-executor/ # Implementation executor
├── research-grouping/       # Research grouping
├── review-verification/     # Review and verification
├── selection-planner/       # Selection planner
└── specialists/             # Additional specialists
    └── executor/
```

### Agent Categories

#### Core Agents (1-core)
- Base workflow stages
- Prompt templates
- Agent coordination

#### BMAD Agents (2-bmad)
- Mary (Business Analyst)
- Winston (Architect)
- Arthur (Developer)
- John (PM)
- TEA (Technical Analyst)
- Quick Flow (Solo Dev)
- Plus 6+ more specialists

#### Research Agents (3-research)
- Deep Research (comprehensive analysis)
- OSS Discovery (open source research)
- Feature Research (feature analysis)
- Docs Feedback (documentation improvement)

#### Specialist Agents (4-specialists)
- Architect (system design)
- Orchestrator (coordination)
- Ralph (type system & validation)
- Custom specialists
- Plus domain experts

#### Enhanced Agents (5-enhanced)
- Advanced capabilities
- Multi-agent coordination
- Complex workflows

---

## 2. Skills (`engine/agents/.skills/`)

### Directory Structure

```
.skills/
├── 1-core/                   # Core skills
├── automation/              # Automation skills
├── collaboration/           # Collaboration skills
├── development/             # Development skills
├── documentation/           # Documentation skills
├── git-workflow/           # Git workflow skills
├── mcp-integrations/       # MCP integration skills
├── testing/                # Testing skills
└── thinking/               # Thinking skills
```

### Skill Categories

**1-Core Skills:**
- Foundational capabilities
- Basic operations
- Core patterns

**Automation Skills:**
- GitHub CLI
- Long-running operations
- Task automation

**Collaboration Skills:**
- Code review
- Skill creation
- Team coordination

**Development Skills:**
- Coding patterns
- Implementation tactics
- Debugging approaches

**Documentation Skills:**
- API documentation
- Guides and tutorials
- README generation

**Git Workflow Skills:**
- Atomic commits (GSD)
- Branch management
- Release workflows

**MCP Integrations:**
- Filesystem operations
- GitHub integration
- Supabase integration
- Plus other MCP servers

**Testing Skills:**
- Test strategies
- Quality assurance
- Validation approaches

**Thinking Skills:**
- Intelligent routing
- Deep research
- First principles analysis

---

## 3. Runtime System (`engine/runtime/`)

### Directory Structure

```
runtime/
├── agents/                  # Agent execution
├── hooks/                  # Lifecycle hooks
├── integration/            # External integrations
│   └── vibe-kanban/
├── lib/                    # Runtime libraries
│   ├── circuit-breaker/    # Circuit breaker pattern
│   ├── context-variables/  # Context management
│   ├── hierarchical-tasks/ # Task hierarchy
│   ├── ralph-runtime/      # Ralph runtime system
│   ├── response-analyzer/  # Response analysis
│   ├── spec-creation/      # Spec creation
│   └── task-breakdown/     # Task breakdown
├── memory/                 # Memory system
├── monitoring/             # Monitoring tools
├── planning/               # Planning tools
├── prd-templates/          # PRD templates
│   ├── examples/
│   └── templates/
├── python/                 # Python runtime
│   └── core/
├── questioning/            # Questioning workflows
│   └── sessions/
├── testing/                # Testing tools
│   ├── phase3/
│   └── phase4/
├── utility/                # Utilities
├── utils/                  # Additional utils
└── validation/             # Validation tools
```

### Key Runtime Components

**Circuit Breaker:**
- Prevents infinite loops
- Error handling
- Failure recovery

**Context Variables:**
- Context budgeting (GSD)
- Token management
- Quality degradation curve

**Hierarchical Tasks:**
- Task decomposition
- Dependency management
- Wave-based execution

**Ralph Runtime:**
- Autonomous execution
- Decision engine
- Type validation

**Response Analyzer:**
- Output validation
- Quality checks
- Error detection

**Spec Creation:**
- Spec generation
- Template processing
- Artifact management

**Task Breakdown:**
- Atomic task creation
- Planning algorithms
- Execution scheduling

---

## 4. Brain System (`engine/brain/`)

### Directory Structure

```
brain/
├── api/                     # Brain API
├── databases/              # Database integrations
│   ├── neo4j/             # Knowledge graph
│   └── postgresql/        # Vector store
├── incoming/               # Incoming data
│   └── vibe-kanban-tasks/
├── ingest/                 # Knowledge ingestion
├── metadata/               # Metadata schema
│   └── examples/
├── query/                  # Query engines
└── tests/                  # Brain tests
```

### Brain Components

**API Layer:**
- Query interface
- REST endpoints
- Natural language processing

**Databases:**
- Neo4j (knowledge graph)
- PostgreSQL (vector store)
- Hybrid queries

**Ingestion:**
- File watching
- Automatic indexing
- Knowledge extraction

**Metadata:**
- Schema definitions
- Artifact descriptions
- Type definitions

**Query Engines:**
- Vector search
- Graph traversal
- Hybrid queries

---

## 5. Memory System (`engine/memory/`)

### Components

**Working Memory:**
- Current task context
- Session state
- Active agent data

**Extended Memory:**
- Long-term storage
- Historical data
- Persistent knowledge

**Handoffs:**
- Agent handoff packages
- Context preservation
- State transfer

---

## Agent Inventory

### BMAD Agents

| Agent | Role | Location |
|-------|------|----------|
| Mary | Business Analyst | `2-bmad/core/` |
| Winston | Architect | `4-specialists/architect/` |
| Arthur | Developer | `implementation-executor/` |
| John | PM | `2-bmad/modules/` |
| TEA | Technical Analyst | `3-research/deep-research/` |
| Quick Flow | Solo Dev | `1-core/` |

### Research Agents

| Agent | Role | Location |
|-------|------|----------|
| Deep Research | Comprehensive research | `3-research/deep-research/` |
| OSS Discovery | Open source research | `3-research/oss-discovery/` |
| Feature Research | Feature analysis | `3-research/feature-research/` |
| Docs Feedback | Documentation | `3-research/docs-feedback/` |

### GSD Agents

| Agent | Role | Pattern |
|-------|------|---------|
| gsd-planner | Planning | `planning/` |
| gsd-executor | Execution | `implementation-executor/` |
| gsd-verifier | Verification | `review-verification/` |
| gsd-researcher | Research | `3-research/` |
| gsd-debugger | Debugging | `lib/ralph-runtime/` |

---

## Key Features Migrated

### 1. **5-Stage Workflow**
- Stage 0: Align
- Stage 1: Plan
- Stage 2: Execute
- Stage 3: Communicate
- Stage 4: Verify
- Stage 5: Wrap

### 2. **Agent Handoff System**
- Context preservation
- JSON-based handoffs
- State transfer

### 3. **Ralph Runtime**
- Autonomous mode
- Interactive mode
- Circuit breaker
- Session management

### 4. **Skills System**
- YAML frontmatter
- Markdown body
- Composable capabilities

### 5. **Context Management**
- Token budgeting (GSD)
- Quality degradation curve
- Fresh context per agent

### 6. **Quality Gates**
- Phase validation
- Artifact verification
- Output validation

### 7. **Anti-Looping**
- Hard stop triggers
- Loop detection
- Safety mechanisms

---

## Integration Points

### With Claude Code

**Tool Integration:**
- Read, Write, Edit, Bash, Grep, Glob
- MCP servers (filesystem, GitHub, Supabase)
- Custom tools (context_manager, git_ops, indexer)

**Workflow Integration:**
- Task tool for spawning agents
- Sequential execution
- Context management

### With Brain System

**Query Integration:**
- Semantic search
- Knowledge graph queries
- Hybrid vector + graph

**Ingestion Integration:**
- Automatic indexing
- Metadata extraction
- Knowledge persistence

---

## Next Steps

### Phase 1: Base Agent Class
- [ ] Create `BaseAgent` Python class
- [ ] Implement execute(), handoff(), verify()
- [ ] Add tool integration layer

### Phase 2: Agent Loader
- [ ] Parse agent YAML configs
- [ ] Load agent prompts
- [ ] Initialize agent instances

### Phase 3: Agent Router
- [ ] Implement routing logic
- [ ] Task complexity analysis
- [ ] Agent selection algorithm

### Phase 4: Skills System
- [ ] Parse YAML frontmatter
- [ ] Load skill definitions
- [ ] Compose skills with agents

### Phase 5: Integration
- [ ] Connect with Claude Code
- [ ] Connect with Brain system
- [ ] Test agent workflows

---

## Verification Checklist

- [x] All agent directories copied
- [x] All skill definitions copied
- [x] Runtime system copied
- [x] Brain system copied
- [x] Memory system copied
- [x] File counts verified
- [x] Directory structures validated
- [x] No missing components

---

**Status:** ✅ Migration complete and verified

All 890+ files successfully migrated from Black Box 4 to Black Box 5.
Ready for Phase 1 implementation (Base Agent Class).
