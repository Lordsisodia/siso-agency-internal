# Blackbox3 Documentation Index

**Complete Guide to Blackbox3 Documentation**

Last Updated: 2025-01-13

---

## Quick Navigation

### 🚀 **New to Blackbox3?** Start Here:
1. [Quick Start Guide](user-guides/QUICK-START.md) - 5-minute overview
2. [Main README](../README.md) - System overview
3. [Protocol](../protocol.md) - How the system works

### 🏗️ **Ready to Build?**
1. [Implementation Complete](reference/IMPLEMENTATION-COMPLETE.md) - What's been built
2. [Memory Architecture](memory/MEMORY-ARCHITECTURE.md) - Memory system guide
3. [Memory Quick Reference](memory/MEMORY-QUICK-REF.md) - Command reference

### 🤖 **Working with Agents?**
1. [Agents Overview](agents/README.md) - Agent system
2. [Agent Setup](workflows/UI-CYCLE-AGENT-SETUP.md) - Configure agents
3. [Skills System](../agents/.skills/README.md) - Available skills

---

## Documentation by Category

### User Guides

| Document | Description | Location |
|----------|-------------|----------|
| **Quick Start** | 5-minute getting started guide | `user-guides/QUICK-START.md` |
| **How to Use** | Comprehensive usage guide | `user-guides/HOW-TO-USE.md` |
| **Typeless AI Guide** | Guide for AI agents using Blackbox3 | `user-guides/TYPELESS-AI-GUIDE.md` |
| **UI Cycle Quick Start** | Pocket guide for UI cycle | `user-guides/UI-CYCLE-QUICK-START.md` |

### System Documentation

| Document | Description | Location |
|----------|-------------|----------|
| **Protocol** | How Blackbox3 works | `../protocol.md` |
| **Context** | Current project state | `../context.md` |
| **Tasks** | Project backlog | `../tasks.md` |
| **Implementation Complete** | Build status | `reference/IMPLEMENTATION-COMPLETE.md` |
| **Directory Structure** | Complete file structure reference | `reference/DIRECTORY-STRUCTURE.md` |
| **Quick Reference** | Fast command lookup | `reference/QUICK-REFERENCE.md` |

### Memory Architecture

| Document | Description | Location |
|----------|-------------|----------|
| **Memory Architecture** | Complete memory system guide | `memory/MEMORY-ARCHITECTURE.md` |
| **Memory Quick Reference** | Fast command lookup | `memory/MEMORY-QUICK-REF.md` |

### Workflows & Processes

| Document | Description | Location |
|----------|-------------|----------|
| **UI Adaptive Dev Cycle** | Adaptive UI development workflow | `workflows/UI-ADAPTIVE-DEV-CYCLE.md` |
| **UI Cycle Agent Setup** | Configure agents for UI cycle | `workflows/UI-CYCLE-AGENT-SETUP.md` |
| **Development Cycle Spec** | Development cycle specification | `workflows/DEVELOPMENT-CYCLE-SPECIFICATION.md` |

### Testing & Verification

| Document | Description | Location |
|----------|-------------|----------|
| **Sprint 1 Verification** | Sprint 1 test results | `.docs/testing/SPRINT-1-VERIFICATION.md` |
| **Sprint 6 Test** | Sprint 6 test results | `.docs/testing/SPRINT-6-TEST.md` |

### Analysis & Reports

| Document | Description | Location |
|----------|-------------|----------|
| **Blackbox3 Analysis** | Technical system analysis | `analysis/BLACKBOX3-ANALYSIS.md` |
| **Issues Analysis** | System issues and solutions | `analysis/BLACKBOX3-ISSUES-ANALYSIS.md` |
| **Lumelle Integration** | Integration summary | `analysis/LUMELLE-INTEGRATION-SUMMARY.md` |
| **Phase 1 Complete** | Phase 1 completion report | `analysis/PHASE-1-COMPLETE.md` |
| **MCP Skills Download** | MCP skill integration | `analysis/MCP-SKILLS-DOWNLOAD.md` |

---

## Component Documentation

### Core Components

#### Agents System
- **Location**: `../agents/`
- **Documentation**: [agents/README.md](agents/README.md)
- **Contents**:
  - BMAD agents (10+ specialized roles)
  - Custom agents
  - Agent templates
  - Core operating rules

#### Skills System
- **Location**: `../agents/.skills/`
- **Documentation**: [agents/.skills/README.md](../agents/.skills/README.md)
- **Contents**:
  - 19 total skills (9 core + 10 MCP-specific)
  - Deep Research, Docs Routing, Feedback Triage
  - GitHub CLI, Long-run Operations
  - Notifications,和各种 MCP 集成

#### Memory System
- **Configuration**: `../memory-config.yaml`
- **Runtime Modules**:
  - `runtime/shared_memory.py` - Multi-agent coordination
  - `runtime/knowledge_graph.py` - Entity relationships
  - `runtime/goal_tracking.py` - Goal tracking

#### Research Module
- **Location**: `../modules/research/`
- **Contents**: Semantic search, vector database, research tools

---

## Architecture Overview

### Directory Structure

```
Blackbox3/
├── .docs/                    # This documentation
│   ├── user-guides/         # Getting started guides
│   ├── reference/           # System reference docs
│   ├── memory/              # Memory architecture docs
│   ├── workflows/           # Workflow documentation
│   ├── .docs/testing/             # Testing & verification
│   ├── analysis/            # Analysis & reports
│   ├── agents/              # Agent documentation
│   └── architecture/        # Architecture docs
├── agents/.plans/                   # Execution plans
├── agents/.skills/                  # Skill definitions
├── .memory/                  # Memory storage
├── agents/                   # Agent definitions
├── core/                     # Core runtime system
│   ├── runtime/             # Python execution engine
│   ├── agents/              # Core agent system
│   ├── workflows/           # Workflow definitions
│   └── snippets/            # Reusable snippets
├── modules/                  # Domain modules
│   ├── context/             # Context management
│   ├── domain/              # Domain-specific workflows
│   ├── first-principles/    # Decision framework
│   ├── implementation/      # Code generation
│   ├── kanban/              # Task management
│   ├── planning/            # Epic/story creation
│   └── research/            # Market/competitor analysis
├── scripts/                  # Helper scripts
├── data/                     # Data storage
└── runtime/                  # Runtime modules
```

---

## Key Concepts

### 1. Dual-Mode Operation

**Manual Mode** (File-Based)
- Use file conventions with AI chat tools
- Create plans in `agents/.plans/`
- Work with agents in `agents/`
- Follow B-MAD patterns

**Automated Mode** (Python Runtime)
- Use `core/runtime/` execution engine
- Automated agent orchestration
- Pipeline-based execution
- Manifest-based tracking

### 2. Three-Tier Memory

1. **Working Memory** (10 MB) - Active session context
2. **Extended Memory** (500 MB) - Project knowledge base
3. **Archival Memory** (5 GB) - Historical records

### 3. Modular Design

**Domain Modules**:
- `context` - Context management
- `domain` - Domain-specific workflows
- `first-principles` - Decision framework
- `implementation` - Code generation
- `kanban` - Task management
- `planning` - Epic/story creation
- `research` - Market/competitor analysis

---

## Common Tasks

### Create a New Plan

```bash
./scripts/new-plan.sh "your goal here"
```

### Check System Status

```bash
./scripts/check-blackbox.sh
```

### Work with Agents

1. Read `protocol.md` for system rules
2. Read `context.md` for current state
3. Read `agents/_core/prompt.md` for agent rules
4. Open AI chat (Claude Code, Cursor, etc.)
5. Paste agent prompts and execute work
6. Save outputs to plan folder's `artifacts/`

### Memory Management

```bash
# Check memory status
./scripts/manage-memory-tiers.sh status

# Build semantic search index
./scripts/build-semantic-index.sh

# Count tokens
./scripts/utils/token-count.py file.md
```

---

## Development Status

### Completed ✅

- Core system architecture
- BMAD agent integration
- Memory architecture (3-tier)
- Semantic search
- Multi-agent coordination
- Goal tracking framework
- Knowledge graph
- Skills system (19 skills)
- Documentation reorganization

### In Progress 🚧

- Workflow automation
- Enhanced runtime execution
- Additional domain modules

---

## External References

- **Factory Research**: [../../.research/README.md](../../.research/README.md)
- **Factory Documentation**: [../../.docs/README.md](../../.docs/README.md)

---

## Maintenance

This documentation is actively maintained. For updates:

1. Check `reference/IMPLEMENTATION-COMPLETE.md` for latest features
2. Review `../tasks.md` for planned improvements
3. Monitor `.memory/` for system evolution

---

**Last Updated**: 2025-01-13
**Blackbox3 Version**: 3.0.0
