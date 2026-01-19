# 04-Work

AI frameworks and work modules for the BlackBox5 Engine.

## Overview

This folder contains:
- **Frameworks** - Complete AI agent systems (BMAD, SpeckIt, MetaGPT, Swarm)
- **Modules** - Work capabilities and components (context, planning, research, etc.)

## Structure

```
04-work/
├── frameworks/              # AI Frameworks (4)
│   ├── bmad/               # Blackbox Multi-Agent Development
│   ├── speckit/            # Spec-driven development kit
│   ├── metagpt/            # Multi-agent software development
│   └── swarm/              # Swarm intelligence patterns
│
└── modules/                 # Work Capabilities (9)
    ├── context/            # Context management
    ├── domain/             # Domain workflows
    ├── first-principles/   # First principles analysis
    ├── implementation/     # Implementation workflows
    ├── kanban/             # Kanban board operations
    ├── planning/           # Planning tools
    ├── research/           # Research capabilities
    ├── skills/             # Agent skills
    └── task-management/    # Task analysis tools
```

## Frameworks vs Modules

### Frameworks

**Complete AI agent systems** used as foundations:

| Framework | Purpose |
|-----------|---------|
| **bmad** | Blackbox Multi-Agent Development framework |
| **speckit** | Spec-driven development kit |
| **metagpt** | Multi-agent software development system |
| **swarm** | Swarm intelligence patterns |

### Modules

**Work capabilities** that extend agents:

| Module | Purpose |
|--------|---------|
| **context** | Context management and snapshots |
| **domain** | Domain-specific workflows (admin, multi-tenant, etc.) |
| **first-principles** | First principles analysis and decomposition |
| **implementation** | Implementation workflows (code review, dev stories) |
| **kanban** | Kanban board management (Vibe integration) |
| **planning** | Planning tools (epics, stories, PRDs, architecture) |
| **research** | Research capabilities (OSS catalog, competitors) |
| **skills** | Reusable agent skills |
| **task-management** | Task analysis and complexity detection |

## Quick Reference

| I want to... | Use this |
|--------------|----------|
| Build multi-agent systems | `frameworks/bmad/` |
| Drive development from specs | `frameworks/speckit/` |
| Use MetaGPT patterns | `frameworks/metagpt/` |
| Implement swarm intelligence | `frameworks/swarm/` |
| Manage context | `modules/context/` |
| Analyze domain | `modules/domain/` |
| Apply first principles | `modules/first-principles/` |
| Manage implementation | `modules/implementation/` |
| Work with Kanban boards | `modules/kanban/` |
| Plan projects | `modules/planning/` |
| Research OSS/competitors | `modules/research/` |
| Use agent skills | `modules/skills/` |
| Analyze tasks | `modules/task-management/` |

## Statistics

- **Total frameworks**: 4
- **Total modules**: 9
- **Total files**: ~162
- **Python files**: 32
- **Documentation files**: 126+

## Usage

### Using a Framework

```python
# Example: Using BMAD framework
from blackbox5.engine.work.frameworks.bmad import BMADFramework

framework = BMADFramework()
# Use framework capabilities
```

### Using a Module

```python
# Example: Using context module
from blackbox5.engine.work.modules.context import ContextManager

context = ContextManager()
# Use context capabilities
```

## Framework Details

### BMAD (Blackbox Multi-Agent Development)

Multi-agent development framework with:
- Agent orchestration
- Task decomposition
- Coordination patterns

### SpeckIt (Spec-driven Development Kit)

Specification-driven development with:
- Spec templates
- Workflow automation
- Validation tools

### MetaGPT

Multi-agent software development with:
- Role-based agents
- Software development lifecycle
- Collaboration patterns

### Swarm

Swarm intelligence patterns with:
- Emergent behavior
- Collective intelligence
- Distributed coordination

## Module Details

### Context

Context management with:
- Snapshot creation/restore
- Context storage
- History tracking

### Domain

Domain-specific workflows:
- Admin workflows (audit, automation, feature flags, RBAC)
- Multi-tenant validation
- Vendor swap analysis

### First Principles

First principles analysis:
- Decision tracking
- Outcome analysis
- Principle definitions
- Cost analysis
- Constraint mapping

### Implementation

Implementation workflows:
- Automated testing
- Code review
- Development stories

### Kanban

Kanban board management:
- Vibe integration
- Task creation
- Task movement
- Board listing

### Planning

Planning tools:
- Epic management
- Story creation
- PRD generation
- Architecture planning

### Research

Research capabilities:
- OSS catalog
- Competitor analysis
- Feature synthesis
- Market research
- Semantic search

### Skills

Reusable agent skills:
- Feedback triage
- Notifications
- Codebase navigation
- Supabase DDL/RLS
- Testing playbook

### Task Management

Task analysis:
- Complexity detection
- Compute analysis
- Speed analysis
- Value analysis
- Task type detection

## Related

- Engine core: `../01-core/`
- Agents: `../02-agents/`
- Knowledge: `../03-knowledge/`
- Tools: `../05-tools/`

## Documentation

- Framework docs: See individual framework READMEs
- Module docs: See individual module READMEs
