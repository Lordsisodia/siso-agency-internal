# Blackbox5 Engine - Component Map

> **Quick Reference Guide** for finding components in Blackbox5
> Last Updated: 2026-01-19

---

## Quick Stats

| Category | Count | Status |
|----------|-------|--------|
| Agents | 193 docs | Active |
| Skills | 174 docs | 47% migrated |
| Workflows | 50+ | Active |
| Integrations | 14 MCP | Active |
| Core Services | 6 | Production |
| Documentation | 400+ files | Comprehensive |

---

## Component Location Map

### Core Engine Components

| Component | Old Location | New Location | Status | Key Files |
|-----------|--------------|--------------|--------|-----------|
| **Engine Kernel** | - | `/core/` | Production | `kernel.py`, `config.py`, `registry.py` |
| **API Server** | `/api/` | `/interface/api/` | Production | `server.py`, routes |
| **Health Monitor** | `/core/` | `/core/` | Production | `health.py`, lifecycle |
| **Service Registry** | `/core/` | `/core/` | Production | `registry.py` |

### Agent System

| Component Type | Location | Description | Count |
|---------------|----------|-------------|-------|
| **Core Agents** | `/agents/core/` | Base agent classes | 4 files |
| **Agent Categories** | `/agents/1-core/` | Core agent implementations | 8 subdirs |
| **BMAD Agents** | `/agents/2-bmad/` | BMAD methodology agents | Multiple |
| **Research Agents** | `/agents/3-research/` | Research specialists | Deep Research, etc |
| **Specialists** | `/agents/4-specialists/` | Specialized agents | Multiple |
| **Enhanced** | `/agents/5-enhanced/` | Enhanced capabilities | Multiple |
| **Custom** | `/agents/custom/` | Custom implementations | User-defined |

### Skills & Capabilities

| Skill Category | Location | Status | Examples |
|----------------|----------|--------|----------|
| **MCP Integrations** | `/capabilities/skills/integration-connectivity/mcp-integrations/` | 14 verified | Supabase, Shopify, GitHub, Playwright |
| **Development Workflow** | `/capabilities/skills/development-workflow/` | Active | TDD, Systematic Debugging |
| **Research** | `/capabilities/skills/research/` | Active | Deep Research, OSS Catalog |
| **Collaboration** | `/capabilities/skills/collaboration-communication/` | Active | Code Review, Notifications |
| **Planning** | `/capabilities/skills/planning/` | Active | Architecture, PRD, Stories |
| **Implementation** | `/capabilities/skills/implementation/` | Active | Code Review, Dev Story |
| **Documentation** | `/capabilities/skills/knowledge-documentation/` | Active | Docs Routing, Feedback Triage |
| **Kanban** | `/capabilities/skills/kanban/` | Active | Task management |

### Tools & Frameworks

| Component | Location | Purpose |
|-----------|----------|---------|
| **Data Tools** | `/tools/data_tools/` | Data processing utilities |
| **Task Management** | `/task_management/` | Task analyzers & processors |
| **Development** | `/development/` | Tests, examples, scripts, templates |
| **Frameworks** | `/development/frameworks/` | Framework research & reference |
| **Operations** | `/operations/` | Runtime operations & tools |

### Memory & Knowledge

| Component | Location | Purpose |
|-----------|----------|---------|
| **Memory System** | `/memory/` | Agent memory & context |
| **Brain/RAG** | `/knowledge/brain/` | Vector search & retrieval |
| **Memory Templates** | `/memory-templates/` | Project & task templates |
| **Schemas** | `/schemas/` | Data schemas & validation |

### Interfaces & Integrations

| Component | Location | Purpose |
|-----------|----------|---------|
| **CLI Interface** | `/interface/cli/` | Command-line interface |
| **API Interface** | `/interface/api/` | REST API endpoints |
| **Integrations** | `/interface/integrations/` | External integrations (GitHub, etc.) |
| **Spec-Driven** | `/interface/spec_driven/` | Specification-driven development |

---

## Directory Structure Overview

```
.blackbox5/engine/
├── core/                          # Core engine systems
│   ├── kernel.py                 # EngineKernel singleton
│   ├── config.py                 # ConfigManager
│   ├── registry.py               # ServiceRegistry
│   ├── health.py                 # HealthMonitor
│   ├── lifecycle.py              # LifecycleManager
│   └── boot*.py                  # Boot scripts
│
├── agents/                        # Agent system (193 docs)
│   ├── core/                     # Base classes (AgentLoader, AgentRouter, BaseAgent, SkillManager)
│   ├── 1-core/                   # Core agent implementations
│   │   ├── classification-options/
│   │   ├── manager/
│   │   ├── orchestrator/
│   │   ├── review-verification/
│   │   └── selection-planner/
│   ├── 2-bmad/                   # BMAD methodology agents
│   ├── 3-research/               # Research specialists
│   │   └── deep-research/        # Deep research agent
│   ├── 4-specialists/            # Specialized agents
│   ├── 5-enhanced/               # Enhanced capabilities
│   └── custom/                   # Custom implementations
│
├── capabilities/                  # Skills & workflows
│   ├── skills/                   # 174 skill documents
│   │   ├── integration-connectivity/
│   │   │   └── mcp-integrations/  # 14 MCP integrations
│   │   ├── development-workflow/  # TDD, debugging, etc
│   │   ├── research/              # OSS catalog, workflows
│   │   ├── collaboration-communication/  # Code review, notifications
│   │   ├── planning/              # Architecture, PRD, stories
│   │   ├── implementation/        # Code review, dev story
│   │   ├── knowledge-documentation/  # Docs routing, feedback
│   │   └── kanban/                # Task management
│   └── workflows/                # Workflow definitions
│
├── tools/                         # Core utilities
│   └── data_tools/               # Data processing tools
│
├── task_management/              # Task processing
│   └── analyzers/                # Task analyzers
│
├── development/                   # Development resources
│   ├── tests/                    # Test files
│   ├── examples/                 # Code examples
│   ├── scripts/                  # Utility scripts
│   ├── templates/                # Project templates
│   └── frameworks/               # Framework research
│
├── runtime/                       # Runtime operations
│   └── ralph/                    # Ralph runtime system
│
├── operations/                    # Operations tools
│   ├── tools/                    # Operational tools
│   └── runtime/                  # Runtime utilities
│
├── memory/                        # Memory system
│   └── context/                  # Agent context
│
├── knowledge/                     # Knowledge base
│   ├── brain/                    # RAG system
│   └── memory/                   # Memory storage
│
├── memory-templates/              # Memory templates
│   ├── project-template/         # Project structure
│   ├── AGENT-INTERFACE/          # Agent interface docs
│   └── task-templates/           # Task templates
│
├── schemas/                       # Data schemas
│
├── interface/                     # User interfaces
│   ├── cli/                      # Command-line interface
│   ├── api/                      # REST API
│   ├── integrations/             # External integrations
│   └── spec_driven/              # Spec-driven dev
│
├── scripts/                       # Utility scripts
│
├── INDEX.yaml                     # Structured component index
├── README.md                      # Engine documentation
└── COMPONENT-MAP.md              # This file
```

---

## Quick Find Guide

### Find an Agent

```bash
# List all agent directories
find .blackbox5/engine/agents -type d -maxdepth 1

# Find agent by name
find .blackbox5/engine/agents -name "*agent-name*" -type d

# Search agent documentation
grep -r "agent-name" .blackbox5/engine/agents --include="*.md"
```

### Find a Skill

```bash
# List all skill categories
find .blackbox5/engine/capabilities/skills -type d -maxdepth 1

# Find specific skill
find .blackbox5/engine/capabilities/skills -name "*skill-name*" -type f

# Search skill registry
grep -i "skill-name" .blackbox5/engine/capabilities/skills/SKILLS-REGISTRY.md
```

### Find Documentation

```bash
# Find all README files
find .blackbox5/engine -name "README.md" -type f

# Search by keyword
grep -r "keyword" .blackbox5/engine --include="*.md"

# Find schema files
find .blackbox5/engine/schemas -type f
```

### Find MCP Integrations

```bash
# List MCP integrations
ls .blackbox5/engine/capabilities/skills/integration-connectivity/mcp-integrations/

# Search MCP skills
grep -l "mcp" .blackbox5/engine/capabilities/skills/integration-connectivity/mcp-integrations/*/*.md
```

---

## Common Tasks

### How to Find an Agent

1. **Identify the category** (core, research, specialist, etc.)
2. **Navigate to the category directory** under `/agents/`
3. **Look for README.md** in the agent's directory
4. **Check agent.md** and **prompt.md** for implementation details

**Example:**
```bash
# Find the deep-research agent
cd .blackbox5/engine/agents/3-research/deep-research/
ls -la  # Shows: README.md, agent.md, prompt.md, runbook.md
```

### How to Find a Skill

1. **Check the SKILLS-REGISTRY.md** for category and status
2. **Navigate to the skill category** under `/capabilities/skills/`
3. **Look for SKILL.md** in the skill's directory
4. **Check sub-directories** for examples and workflows

**Example:**
```bash
# Find the TDD skill
cd .blackbox5/engine/capabilities/skills/development-workflow/coding-assistance/test-driven-development/
ls -la  # Shows: SKILL.md, examples/, workflows/
```

### How to Find Documentation

1. **Start with README.md** in any directory
2. **Check INDEX.yaml** for structured overview
3. **Use this COMPONENT-MAP.md** for quick reference
4. **Search with grep** for specific topics

**Example:**
```bash
# Find all documentation about TDD
grep -r "test-driven" .blackbox5/engine --include="*.md" -l
```

### How to Find Core Components

1. **Engine Core**: `/core/` - Kernel, Config, Registry, Health
2. **API Layer**: `/interface/api/` - REST endpoints
3. **Agent System**: `/agents/core/` - Base classes
4. **Skills**: `/capabilities/skills/` - All skills
5. **Tools**: `/tools/` - Utilities

**Example:**
```bash
# View core engine files
ls -la .blackbox5/engine/core/
# Output: kernel.py, config.py, registry.py, health.py, lifecycle.py
```

---

## Migration Notes

### What's Migrated

- ✅ Core engine system (kernel, config, registry, health)
- ✅ API interface with FastAPI
- ✅ 33 verified skills (47% of total)
- ✅ 14 MCP integrations
- ✅ Base agent classes
- ✅ Service registry & health monitoring

### What's In Progress

- 🚧 Additional skill migrations (37 pending)
- 🚧 Agent implementations
- 🚧 Workflow definitions
- 🚧 Integration testing

### What's Legacy

- ⚠️ Old skill structure in `/agents/.skills/` (being phased out)
- ⚠️ Old runtime scripts (see `/runtime/ralph/` for new)
- ⚠️ Some documentation may reference old paths

### Migration Tips

1. **Always check INDEX.yaml** for current structure
2. **Use new paths** when creating new components
3. **Update old references** when migrating code
4. **Check SKILLS-REGISTRY.md** for skill status

---

## Key Files Reference

### Must-Know Files

| File | Purpose | When to Use |
|------|---------|-------------|
| `INDEX.yaml` | Structured component index | Programmatic access |
| `README.md` | Engine overview | Understanding the system |
| `COMPONENT-MAP.md` | This file | Finding components |
| `SKILLS-REGISTRY.md` | Skill inventory | Finding skills |
| `AGENT-SYSTEM-README.md` | Agent system docs | Understanding agents |

### Configuration Files

| File | Purpose |
|------|---------|
| `config.yml` | Engine configuration |
| `config.example.yml` | Configuration template |
| `requirements.txt` | Python dependencies |

### Core Python Files

| File | Purpose |
|------|---------|
| `core/kernel.py` | EngineKernel singleton |
| `core/config.py` | ConfigManager |
| `core/registry.py` | ServiceRegistry |
| `core/health.py` | HealthMonitor |
| `core/lifecycle.py` | LifecycleManager |
| `agents/core/BaseAgent.py` | Base agent class |
| `agents/core/AgentLoader.py` | Agent loader |
| `agents/core/AgentRouter.py` | Agent router |
| `agents/core/SkillManager.py` | Skill manager |

---

## Search Commands Reference

### Find by Type

```bash
# Find all Python files
find .blackbox5/engine -name "*.py" -type f

# Find all Markdown files
find .blackbox5/engine -name "*.md" -type f

# Find all YAML files
find .blackbox5/engine -name "*.yml" -o -name "*.yaml" -type f
```

### Find by Content

```bash
# Search for specific text
grep -r "search term" .blackbox5/engine --include="*.md"

# Search in Python files only
grep -r "search term" .blackbox5/engine --include="*.py"

# Case-insensitive search
grep -ri "search term" .blackbox5/engine --include="*.md"
```

### Find by Status

```bash
# Find verified skills
grep -r "✅ Verified" .blackbox5/engine/capabilities/skills/SKILLS-REGISTRY.md

# Find pending skills
grep -r "📋 Pending" .blackbox5/engine/capabilities/skills/SKILLS-REGISTRY.md
```

---

## Component Categories

### 1. Core Infrastructure

**Purpose:** Foundation systems that power the engine

**Location:** `/core/`

**Components:**
- EngineKernel - Central singleton
- ConfigManager - Multi-strategy config
- ServiceRegistry - Service lifecycle
- HealthMonitor - Health checks
- LifecycleManager - Startup/shutdown

**When to use:** Building core engine features or understanding architecture

---

### 2. Agent System

**Purpose:** AI agents that perform specialized tasks

**Location:** `/agents/`

**Components:**
- Core agents - Base implementations
- BMAD agents - Methodology-specific
- Research agents - Deep research
- Specialists - Domain-specific
- Enhanced - Advanced capabilities

**When to use:** Creating agents or understanding agent behavior

---

### 3. Skills & Capabilities

**Purpose:** Reusable skills that agents can use

**Location:** `/capabilities/skills/`

**Components:**
- MCP Integrations - External service connections
- Development Workflow - Coding practices
- Research - Research methodologies
- Collaboration - Team workflows
- Planning - Architecture & specs
- Implementation - Code workflows
- Documentation - Docs & feedback
- Kanban - Task management

**When to use:** Finding capabilities or adding new skills

---

### 4. Tools & Frameworks

**Purpose:** Utilities and framework support

**Location:** `/tools/`, `/development/frameworks/`

**Components:**
- Data tools - Data processing
- Development resources - Tests, examples, templates
- Framework research - Framework references

**When to use:** Working with data or researching frameworks

---

### 5. Memory & Knowledge

**Purpose:** Information storage and retrieval

**Location:** `/memory/`, `/knowledge/`, `/memory-templates/`

**Components:**
- Memory system - Agent context
- Brain/RAG - Vector search
- Memory templates - Project structure
- Schemas - Data validation

**When to use:** Working with memory or knowledge systems

---

### 6. Interfaces

**Purpose:** User and system interfaces

**Location:** `/interface/`

**Components:**
- CLI - Command-line interface
- API - REST endpoints
- Integrations - External connections
- Spec-driven - Specification workflows

**When to use:** Building interfaces or integrating systems

---

### 7. Operations

**Purpose:** Runtime operations and tools

**Location:** `/operations/`, `/runtime/`

**Components:**
- Operations tools - Runtime utilities
- Ralph runtime - Execution engine
- Task management - Task processing

**When to use:** Running operations or managing tasks

---

## Quick Reference Tables

### MCP Integrations

| Integration | Purpose | Status |
|-------------|---------|--------|
| Supabase | Database & Auth | ✅ Verified |
| Shopify | E-commerce | ✅ Verified |
| GitHub | Git operations | ✅ Verified |
| Serena | Semantic coding | ✅ Verified |
| Chrome DevTools | Web debugging | ✅ Verified |
| Playwright | Browser automation | ✅ Verified |
| Filesystem | File operations | ✅ Verified |
| Sequential Thinking | Reasoning | ✅ Verified |
| SISO Internal | Internal tools | ✅ Verified |
| Artifacts Builder | HTML artifacts | ✅ Verified |
| Docx | Word documents | ✅ Verified |
| PDF | PDF processing | ✅ Verified |
| MCP Builder | Custom MCPs | ✅ Verified |

### Skill Categories

| Category | Skills | Status |
|----------|--------|--------|
| Core Infrastructure | 1 | 🔧 Migration |
| MCP Integrations | 14 | ✅ Verified |
| Development Workflow | 8 | 4 verified |
| Research | 4 | 3 verified |
| Collaboration | 9 | 7 verified |
| Planning | 5 | 3 verified |
| Documentation | 5 | 3 verified |
| Implementation | 3 | 2 verified |

### Agent Categories

| Category | Location | Purpose |
|----------|----------|---------|
| Core | `/agents/1-core/` | Core implementations |
| BMAD | `/agents/2-bmad/` | BMAD methodology |
| Research | `/agents/3-research/` | Research specialists |
| Specialists | `/agents/4-specialists/` | Domain experts |
| Enhanced | `/agents/5-enhanced/` | Advanced features |
| Custom | `/agents/custom/` | User-defined |

---

## Tips & Tricks

### Navigation Tips

1. **Use the INDEX.yaml** for structured lookups
2. **Start with README.md** in any directory
3. **Check SKILLS-REGISTRY.md** for skill status
4. **Use find/grep** for searching

### Common Patterns

1. **Skills** are in `/capabilities/skills/`
2. **Agents** are in `/agents/`
3. **Core** systems are in `/core/`
4. **Interfaces** are in `/interface/`
5. **Documentation** is usually `README.md`

### File Naming Conventions

- `README.md` - Directory overview
- `SKILL.md` - Skill definition
- `agent.md` - Agent documentation
- `prompt.md` - Agent prompt
- `runbook.md` - Agent procedures
- `INDEX.yaml` - Structured index
- `COMPONENT-MAP.md` - This file

---

## Getting Help

### Documentation

- Start here: `COMPONENT-MAP.md` (this file)
- Engine overview: `README.md`
- Skill inventory: `SKILLS-REGISTRY.md`
- Structured index: `INDEX.yaml`

### Search Strategies

1. **Broad search**: Use `find` to locate files
2. **Content search**: Use `grep` to search text
3. **Structured search**: Use `INDEX.yaml`
4. **Human search**: Use this `COMPONENT-MAP.md`

### Example Workflows

**Find a component:**
1. Check this map for the category
2. Navigate to the directory
3. Read the README.md
4. Explore the structure

**Understand a system:**
1. Start with the category README
2. Check INDEX.yaml for structure
3. Look at core files
4. Review examples

**Add new functionality:**
1. Find similar existing code
2. Follow the directory structure
3. Use established patterns
4. Update documentation

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-19 | 1.0.0 | Initial component map creation |

---

**This map is maintained alongside INDEX.yaml and SKILLS-REGISTRY.md**
**For programmatic access, use INDEX.yaml**
**For human navigation, use this COMPONENT-MAP.md**
