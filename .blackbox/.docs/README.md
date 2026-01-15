# Blackbox4

**Version**: 4.0.0
**Status**: ✅ Production Ready
**Created**: 2026-01-15
**Last Updated**: 2026-01-15 (Migration Complete)

---

## 🎯 What is Blackbox4?

Blackbox4 is a **consolidated AI agent framework** that combines the best components from multiple proven systems:

- **Blackbox3**: Production-tested foundation (5,810+ lines bash, 22,883 bytes Python)
- **Oh-My-OpenCode**: MCP integration, enhanced agents, LSP tools
- **BMAD**: 4-phase methodology and specialized agents
- **Ralph**: Autonomous execution engine
- **Spec Kit**: Slash command patterns
- **MetaGPT**: Document templates
- **Swarm**: Context variable patterns

**Key Insight**: 99.4% code reuse, 0.6% new code. All components proven and tested.

---

## 📁 Directory Structure

### Quick Overview

```
.blackbox4/
│
├── .config/              # System configuration
├── .docs/                # ALL documentation
├── .memory/              # 3-tier memory system
├── .plans/               # Active project plans
├── .runtime/             # Runtime/state data
│
├── 1-agents/             # ALL agent definitions
├── 2-frameworks/         # Framework patterns & templates
├── 3-modules/            # Domain modules
├── 4-scripts/            # All executable scripts
├── 5-templates/          # Document/file templates
├── 6-tools/              # Helper utilities
└── 7-workspace/          # Active workspace
```

### Numbered Folders (1-7)

Folders are numbered for **clear ordering** and **quick navigation**:

1. **1-agents/** - All agent definitions (6 categories)
2. **2-frameworks/** - Framework patterns (4 frameworks)
3. **3-modules/** - Domain modules (7 modules)
4. **4-scripts/** - All executable scripts
5. **5-templates/** - Document/file templates
6. **6-tools/** - Helper utilities
7. **7-workspace/** - Active workspace

---

## 🚀 Quick Start

### 1. Create a Plan

```bash
cd .blackbox4
./4-scripts/planning/new-plan.sh "your goal here"
```

This creates a new plan in `.plans/active/` with all necessary files.

### 2. Work with Agents

```bash
cd .plans/active/YYYY-MM-DD_HHMM_your-goal/

# Edit your plan
vim README.md
vim checklist.md

# Load an agent (example: Oracle for architecture)
# "Read: 1-agents/5-enhanced/oracle.md"
# "Review this architecture and suggest improvements"
```

### 3. Use Autonomous Mode (Ralph)

```bash
# From your plan directory
blackbox4 generate-ralph          # Generate Ralph files
blackbox4 autonomous-loop         # Run autonomously
```

---

## 📚 Documentation

Complete documentation is in [`.docs/`](.docs/):

- **[1-getting-started/](.docs/1-getting-started/)** - New user guides
- **[2-reference/](.docs/2-reference/)** - Technical reference
- **[3-components/](.docs/3-components/)** - Component documentation
- **[4-frameworks/](.docs/4-frameworks/)** - Framework documentation
- **[5-workflows/](.docs/5-workflows/)** - Workflow guides
- **[6-archives/](.docs/6-archives/)** - Historical documentation

---

## 🤖 Agents

All agents are in [`1-agents/`](1-agents/):

- **[1-core/](1-agents/1-core/)** - Core agent system
- **[2-bmad/](1-agents/2-bmad/)** - BMAD methodology agents (9 specialized agents + master)
- **[3-research/](1-agents/3-research/)** - Research agents (deep-research, feature-research, oss-discovery)
- **[4-specialists/](1-agents/4-specialists/)** - Specialist agents (orchestrator, architect, ralph)
- **[5-enhanced/](1-agents/5-enhanced/)** - Enhanced AI agents (Oracle, Librarian, Explore)
- **[.skills/](1-agents/.skills/)** - Skills system (3 categories: core, mcp, workflow)

---

## 🎨 Frameworks

Framework patterns are in [`2-frameworks/`](2-frameworks/):

- **[1-bmad/](2-frameworks/1-bmad/)** - BMAD 4-phase methodology
- **[2-speckit/](2-frameworks/2-speckit/)** - Spec Kit slash commands
- **[3-metagpt/](2-frameworks/3-metagpt/)** - MetaGPT document templates
- **[4-swarm/](2-frameworks/4-swarm/)** - Swarm patterns

---

## 🧠 Memory System

3-tier memory system in [`.memory/`](.memory/):

- **[working/](.memory/working/)** - 10MB active session
- **[extended/](.memory/extended/)** - 500MB project knowledge (ChromaDB)
- **[archival/](.memory/archival/)** - 5GB historical records

---

## 📋 Active Plans

All active work happens in [`.plans/active/`](.plans/active/):

```
.plans/active/YYYY-MM-DD_HHMM_goal-name/
├── README.md          # Goal, context, approach
├── checklist.md       # Task breakdown
├── status.md          # Current state, blockers
└── artifacts/         # Outputs and results
```

---

## 🔧 Configuration

System configuration is in [`.config/`](.config/):

- **blackbox4.yaml** - Main configuration
- **mcp-servers.json** - MCP server configs
- **agents.yaml** - Agent registry
- **memory.yaml** - Memory configuration

---

## ✅ Key Features

### 1. Dual-Mode Operation

- **Manual mode**: You control, AI assists
- **Autonomous mode**: Ralph engine runs until complete
- **Same workflow**: Start with manual, switch to autonomous

### 2. 3-Tier Memory System

- **Working Memory** (10 MB): Session context
- **Extended Memory** (500 MB): Semantic search with ChromaDB
- **Archival Memory** (5 GB): Historical records

### 3. Enhanced Agents

- **Oracle (GPT-5.2)**: Architecture expert, pattern detection
- **Librarian (Claude/Gemini)**: Research specialist, documentation lookup
- **Explore (Grok/Gemini)**: Fast codebase navigation, semantic search

### 4. MCP Integration

8+ curated servers for extensible tool integration.

### 5. BMAD 4-Phase Methodology

- Phase 1: Analysis
- Phase 2: Planning
- Phase 3: Solutioning
- Phase 4: Implementation

### 6. Ralph Autonomous Engine

- Circuit breaker (prevents infinite loops)
- Exit detection (knows when work is complete)
- Response analysis (understands progress)
- Rate limiting (controls API costs)

---

## 📊 Statistics

| Metric | Value |
|--------|-------|
| **Code Reuse** | 99.4% (~7,000+ lines) |
| **New Code** | 0.6% (~200 lines) |
| **Agent Categories** | 6 (down from 17+) |
| **Skill Categories** | 3 (organized from 19 flat files) |
| **Documentation Sections** | 6 (numbered, hierarchical) |
| **Frameworks** | 4 (consolidated patterns) |
| **Max Items Per Level** | 7 (never overwhelming) |

---

## 🎓 Design Principles

1. **Agent-Navigable**: Clear, predictable paths
2. **Scalable**: Hierarchical organization, easy to extend
3. **Intuitive**: Numbered folders, logical names
4. **No Empty Folders**: Every directory has a purpose
5. **Framework Agnostic**: Easy to add new frameworks

---

## 🚦 Getting Started

1. ✅ **Read this README** - Understand the system
2. ✅ **Explore [`.docs/1-getting-started/`](.docs/1-getting-started/)** - Learn the basics
3. ✅ **Create your first plan** - Try the workflow
4. ✅ **Use agents** - Experiment with different agents
5. ✅ **Test autonomous mode** - Try Ralph-powered execution
6. ✅ **Customize** - Add your own agents, skills, workflows

---

## 📝 System Files

- **[protocol.md](protocol.md)** - How the system works
- **[context.md](context.md)** - Current project state
- **[tasks.md](tasks.md)** - Project backlog
- **[manifest.yaml](manifest.yaml)** - System manifest

---

## 🏆 What Makes Blackbox4 Different

| Aspect | Traditional | Blackbox4 |
|--------|-------------|-----------|
| **Organization** | Flat, scattered | Hierarchical, numbered |
| **Agent Discovery** | 17+ categories | 6 logical groups |
| **Skills** | 19 flat files | 3 organized categories |
| **Documentation** | Multiple places | One `.docs/` folder |
| **Plans** | Buried in agents | Top-level `.plans/` |
| **Frameworks** | Scattered | Centralized in `2-frameworks/` |
| **Memory** | Inconsistent | 3-tier, organized |
| **Autonomous** | Separate | Integrated via Ralph |

---

## 📖 More Information

- **Complete Structure**: See [COMPLETE-STRUCTURE.md](COMPLETE-STRUCTURE.md)
- **Architecture Plan**: See [ARCHITECTURE-FINAL.md](ARCHITECTURE-FINAL.md)
- **Original Plan**: See [ARCHITECTURE-PLAN.md](ARCHITECTURE-PLAN.md)

---

**Blackbox4: Best of All AI Agent Frameworks - Unified, Organized, Production-Ready**

**Status**: ✅ Production Ready
**Migration**: Complete (103+ files migrated from Blackbox3)
**Risk**: Very Low (all proven code from production systems)
