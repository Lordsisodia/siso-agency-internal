# Research Index

> Quick overview of all research across the SISO ecosystem. Browse without opening folders.

---

## Active Research

### 📍 User Profile

**Location**: `active/user-profile/`
**Date**: 2026-01-18
**Status**: ✅ Complete
**Related Epic**: `plans/active/user-profile/`

**Summary**: 4-dimensional analysis for user profile page feature

| Dimension | File | Key Findings |
|-----------|------|--------------|
| **Technology** | `STACK.md` | Clerk (auth), Supabase (DB), Radix UI (components) |
| **Features** | `FEATURES.md` | Profile editing, preferences, avatar upload, privacy settings |
| **Architecture** | `ARCHITECTURE.md` | 3 components, 2 hooks, 5 pages, clear data flow |
| **Pitfalls** | `PITFALLS.md` | Clerk webhook delays, RLS policy complexity, avatar storage |

**Quick Stats**:
- **Total Files**: 6
- **Total Size**: 72 KB
- **Research Time**: ~2 hours

**Key Decisions**:
- Use Clerk for authentication (webhook reliability concerns noted)
- Use Supabase for profile data (RLS policies require testing)
- Use Radix UI for components (consistent with existing codebase)

**Known Risks**:
- 🔴 Clerk webhooks can be delayed (mitigation: implement retry logic)
- 🟡 Supabase RLS policies need thorough testing

**Links**:
- Epic: `plans/active/user-profile/epic.md`
- PRD: `plans/prds/active/user-profile.md`
- XREF: `plans/active/user-profile/XREF.md`

---

## SISO Ecosystem Research

### 🤖 SISO Platform

**Status**: 🟢 Active Development
**Location**: [SISO Repository](../../..)
**Focus**: Internal development platform

**Key Components**:
- **BlackBox5 Engine**: Agent orchestration system
- **Project Memory**: 6-folder memory structure
- **Agent System**: Multi-agent collaboration (John, Winston, Arthur, Dexter, Felix)
- **Integration Hub**: GitHub, Supabase, Clerk, Vibe Kanban

**Research Areas**:
- Agent memory systems
- Project-centric memory architecture
- Autonomous execution workflows
- Multi-agent coordination

**Documentation**:
- Engine README: `../../2-engine/README.md`
- Project Memory: `../REORGANIZATION-COMPLETE.md`

---

### 🤖 Ralphie (Ralph Runtime)

**Status**: 🟢 Active Development
**Location**: `operations/agents/history/sessions/ralph/`
**Type**: Autonomous Agent Runtime

**Purpose**: Autonomous task execution and coordination

**Key Features**:
- Autonomous task execution
- Circuit breaker patterns
- Progress monitoring
- Error recovery
- Multi-step task coordination

**Session Data**:
- Location: `operations/agents/history/sessions/ralph/`
- Format: JSON session logs
- Includes: Context, insights, sessions

**Related**:
- Ralph Runtime Documentation: `../../2-engine/02-agents/`
- Agent Memory System: `operations/agents/`

---

### 🧠 AgentMemory

**Status**: 🟢 Implemented
**Location**: `operations/agents/`
**Type**: Agent Memory System

**Purpose**: Persistent memory for AI agents across sessions

**Key Components**:
- **Active Sessions**: Current agent sessions
- **History**: Past session transcripts
- **Context**: Agent context and state
- **Insights**: Learned patterns and insights

**Agent Types**:
- **Specialist Agents**: John (PM), Winston (Architect), Arthur (Dev), Dexter (DevOps), Felix (Security)
- **Runtime Agents**: Ralph (autonomous execution)
- **Utility Agents**: Search, Import/Export, Stats, Demo

**Memory Structure**:
```
operations/agents/
├── active/              # Current sessions
└── history/sessions/    # Past sessions
    ├── ralph/           # Ralph Runtime sessions
    ├── john/            # PM agent sessions
    ├── winston/         # Architect sessions
    └── ...
```

**Documentation**: See `operations/agents/README.md`

---

### 📊 DeepEval

**Status**: 🟢 Implemented
**Location**: `../../2-engine/.deepeval/`
**Type**: Evaluation Framework

**Purpose**: Safety and evaluation framework for AI agents

**Key Components**:
- **Safety Evaluations**: Agent response safety checks
- **Performance Metrics**: Agent performance tracking
- **Test Suites**: Evaluation test cases
- **Reporting**: Evaluation results and insights

**Usage**:
- Location: `.blackbox5/2-engine/.deepeval/`
- Integration: Used in agent testing workflows
- Output: Evaluation reports and metrics

**Related**:
- Engine Testing: `../../2-engine/01-core/safety/`
- Test Framework: `../../2-engine/05-tools/`

---

## Cross-Reference

### By Topic

| Topic | Research Location | Related Code | Status |
|-------|------------------|--------------|--------|
| **User Profiles** | `research/active/user-profile/` | `lifelock/` domain | Planning Complete |
| **Agent Memory** | `operations/agents/` | `02-engine/02-agents/` | Implemented |
| **Autonomous Execution** | `operations/agents/ralph/` | `02-engine/02-agents/` | Active |
| **Safety/Eval** | `.deepeval/` | `01-core/safety/` | Implemented |

### By Technology

| Technology | Research | Implementation | Status |
|-------------|----------|----------------|--------|
| **Clerk** | User Profile STACK.md | Authentication | Planned |
| **Supabase** | User Profile STACK.md | Database | Planned |
| **Radix UI** | User Profile STACK.md | Components | In Use |
| **Ralph Runtime** | Agent Memory | Autonomous execution | Active |

### By Agent

| Agent | Research | Memory | Status |
|-------|----------|--------|--------|
| **John** (PM) | PRD frameworks | `operations/agents/history/sessions/` | Active |
| **Winston** (Arch) | Architecture patterns | `operations/agents/history/sessions/` | Active |
| **Arthur** (Dev) | Implementation | `operations/agents/history/sessions/` | Active |
| **Ralph** (Runtime) | Autonomous execution | `operations/agents/history/sessions/ralph/` | Active |

---

## Archived Research

*(None yet - research will be archived when features are complete)*

---

## Research Templates

**Template**: `_template-research.md`

**4D Research Framework**:
1. **STACK** - Technology choices and tools
2. **FEATURES** - Feature breakdown and requirements
3. **ARCHITECTURE** - System design and components
4. **PITFALLS** - Known issues and risks

**Usage**:
- Copy template for new research
- Follow 4D framework
- Include metadata.yaml

---

## Statistics

| Metric | Value |
|--------|-------|
| **Active Research Projects** | 1 (user-profile) |
| **SISO Components** | 4 (SISO, Ralphie, AgentMemory, DeepEval) |
| **Total Research Files** | 6 (user-profile) |
| **Total Research Size** | 72 KB (user-profile) |
| **Agent Sessions Archived** | 10+ sessions |

---

## Quick Links

### Internal (Project Memory)
- **Active Epic**: `plans/active/user-profile/epic.md`
- **Research**: `knowledge/research/active/user-profile/`
- **Agent Memory**: `operations/agents/`
- **Decisions**: `decisions/`

### External (SISO Ecosystem)
- **BlackBox5 Engine**: `../../2-engine/README.md`
- **Ralph Runtime**: `../../2-engine/02-agents/`
- **DeepEval**: `../../2-engine/.deepeval/`
- **Main Repository**: `../../..`

---

## Research Roadmap

### Planned Research
- [ ] GitHub Integration Patterns
- [ ] Vibe Kanban Integration
- [ ] Multi-Agent Coordination
- [ ] Autonomous Testing Framework

### In Progress
- [ ] User Profile Implementation (research complete, execution pending)

### Completed
- [x] User Profile Research (4D analysis complete)
- [x] Agent Memory System (implemented)
- [x] Project Memory Architecture (implemented)

---

**Last Updated**: 2026-01-19
**Maintainer**: Update when research is added or completed
**Related**: See [ACTIVE.md](../../ACTIVE.md) for current work status
