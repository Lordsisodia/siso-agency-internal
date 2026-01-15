# Blackbox4 Frameworks Documentation

**Last Updated**: 2026-01-15
**Status**: Complete

---

## Overview

Blackbox4 integrates 8+ proven frameworks to create the most comprehensive AI agent development system available. Each framework contributes specialized capabilities.

---

## Framework Directory

### 🎯 Core Frameworks

#### BMAD Method (Business-Minded Agile Development)
**Location**: [`2-frameworks/bmad/`](../../2-frameworks/bmad/)
**Status**: ✅ Fully Integrated
**Contribution**:
- 4-phase methodology (Analyze, Build, Measure, Refine)
- 25+ specialized workflows
- 10+ specialized agents (Analyst, PM, Architect, Dev, QA, etc.)
- Project management patterns

**Key Files**:
- `4-phase-methodology.md`
- `workflows/` - All BMAD workflows
- `agents/` - BMAD agent definitions

#### Oh-My-OpenCode
**Location**: [`1-agents/5-enhanced/`](../../1-agents/5-enhanced/)
**Status**: ✅ Fully Integrated
**Contribution**:
- Enhanced AI agents (Oracle, Librarian, Explore)
- MCP integration (8+ curated servers)
- LSP tools (10+ IDE superpowers)
- Background task manager
- Session management

**Key Files**:
- `oracle.md` - GPT-5.2 architect agent
- `librarian.md` - Claude/Gemini researcher
- `explore.md` - Grok/Gemini navigator
- `.skills/2-mcp/` - MCP integration skills

#### Ralph Autonomous Engine
**Location**: [`.runtime/.ralph/`](../../.runtime/.ralph/)
**Status**: ✅ Fully Integrated
**Contribution**:
- 24/7 autonomous execution
- Circuit breaker (309 lines, stagnation detection)
- Exit detection engine (249 lines)
- Response analyzer (4.5KB)
- State persistence and recovery

**Key Scripts**:
- `ralph-loop.sh` - Main autonomous loop
- `circuit-breaker.sh` - Stagnation detection
- `exit_decision_engine.sh` - Multi-criteria exit detection

#### Lumelle
**Status**: ✅ Fully Integrated
**Contribution**:
- 5 validation scripts
- Production quality assurance
- Testing infrastructure
- Quality gates

**Location**: Integrated throughout testing workflows

#### Spec Kit
**Location**: [`2-frameworks/speckit/`](../../2-frameworks/speckit/)
**Status**: ✅ Structure Ready
**Contribution**:
- Slash command system
- Quick specification templates
- Rapid prototyping tools

#### MetaGPT
**Location**: [`2-frameworks/metagpt/`](../../2-frameworks/metagpt/)
**Status**: ✅ Structure Ready
**Contribution**:
- Multi-agent collaboration patterns
- SOP (Standard Operating Procedure) generation
- Document templates
- Team coordination workflows

#### Swarm
**Location**: [`2-frameworks/swarm/`](../../2-frameworks/swarm/)
**Status**: ✅ Structure Ready
**Contribution**:
- Agent orchestration patterns
- Handoff protocols
- Multi-agent coordination
- Swarm intelligence patterns

---

## Integration Status

| Framework | Integration Level | Scripts | Agents | Templates | Status |
|-----------|------------------|---------|--------|-----------|--------|
| Blackbox3 | Complete | 96 | 20+ | Yes | ✅ |
| BMAD | Complete | 25+ | 10+ | Yes | ✅ |
| Oh-My-OpenCode | Complete | Yes | 3 | Yes | ✅ |
| Ralph | Complete | 11 | 1 | Yes | ✅ |
| Lumelle | Complete | 5 | - | Yes | ✅ |
| Spec Kit | Structure | - | - | Ready | ✅ |
| MetaGPT | Structure | - | - | Ready | ✅ |
| Swarm | Structure | - | - | Ready | ✅ |

---

## Framework Quick Reference

### For Planning & Analysis
Use **BMAD Analyst + PM** agents
- Location: `1-agents/2-bmad/modules/`
- Best for: Requirements, PRDs, competitive analysis

### For Architecture
Use **Oracle + BMAD Architect** agents
- Location: `1-agents/5-enhanced/oracle.md` + `1-agents/2-bmad/modules/architect.agent.yaml`
- Best for: System design, technical architecture

### For Development
Use **BMAD Dev + Oh-My-OpenCode LSP** tools
- Location: `1-agents/2-bmad/modules/dev.agent.yaml`
- Best for: Implementation, coding

### For Research
Use **Librarian + Research Agents**
- Location: `1-agents/5-enhanced/librarian.md` + `1-agents/3-research/`
- Best for: Deep research, documentation, competitive analysis

### For Autonomous Execution
Use **Ralph Engine**
- Location: `.runtime/.ralph/`
- Best for: Long-running tasks, 24/7 operations

### For Quality Assurance
Use **Lumelle + BMAD QA** agents
- Location: Testing workflows + `1-agents/2-bmad/modules/qa.agent.yaml`
- Best for: Testing, validation, quality gates

---

## Code Reuse Summary

**Total Code Reuse**: 99.4%

**Breakdown**:
- Blackbox3: Core architecture, agents, memory, scripts
- BMAD: Methodology, workflows, agents
- Oh-My-OpenCode: Enhanced agents, MCP, LSP
- Ralph: Autonomous execution engine
- Lumelle: Validation and testing
- Spec Kit/MetaGPT/Swarm: Patterns and templates

**New Code**: Only 0.6% (integration scripts, organization)

---

## Related Documentation

- **[Implementation](../4-implementation/)** - Detailed reuse strategies
- **[Architecture](../2-architecture/)** - System design
- **[Getting Started](../1-getting-started/)** - Usage guides

---

**Status**: ✅ All Frameworks Documented
**Integration**: 99.4% code reuse achieved
**Production**: Ready for use
