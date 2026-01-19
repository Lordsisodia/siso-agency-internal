# BlackBox5 Frameworks

**Total Frameworks:** 16
**Last Updated:** 2026-01-19
**Purpose:** Comprehensive inventory and documentation of all agent frameworks in BlackBox5

---

## Quick Overview

BlackBox5 integrates **16 frameworks** across 6 categories, providing a comprehensive toolkit for AI agent development, orchestration, and deployment.

| Category | Frameworks | Status | Purpose |
|----------|------------|--------|---------|
| **Core Agent Frameworks** | 4 | ✅ Active | Primary orchestration & coordination |
| **Claude Code Frameworks** | 3 | 📚 Researched | Autonomous Claude Code extensions |
| **Production Frameworks** | 3 | 📚 Researched | Enterprise-ready agent systems |
| **Enterprise Frameworks** | 3 | 📚 Researched | Large-scale deployment |
| **Inspiration Frameworks** | 2 | 💡 Patterns | Implementation patterns & inspiration |
| **Autonomous Loop Frameworks** | 1 | 🔥 Highest Priority | Git worktree parallel execution |

---

## Category 1: Core Agent Frameworks (4)

**Status:** ✅ Active (Integrated in BlackBox5)
**Location:** `.blackbox5/engine/frameworks/`

### 1. BMAD (BlackBox Multi-Agent Development)
- **Type:** Multi-Agent Orchestration
- **Purpose:** Primary framework for coordinating specialized agents
- **Key Features:**
  - BMAD Master agent coordination
  - Specialized modules: Analyst, Architect, Developer, PM
  - Workflow-based agent collaboration
- **Code Location:** `.blackbox5/engine/frameworks/1-bmad/`
- **Documentation:** [BMAD Details](./01-core-agent-frameworks/README.md)
- **Status:** ✅ Active (Primary Framework)

### 2. SpecKit
- **Type:** Spec-Driven Development
- **Purpose:** Specification-driven development with templates
- **Key Features:**
  - Slash commands for quick actions
  - Template system for consistency
  - Spec-first development workflow
- **Code Location:** `.blackbox5/engine/frameworks/2-speckit/`
- **Documentation:** [SpecKit Details](./01-core-agent-frameworks/README.md#speckit)
- **Status:** ✅ Active

### 3. MetaGPT
- **Type:** Multi-Agent with SOPs
- **Purpose:** Standard Operating Procedures for consistent workflows
- **Key Features:**
  - SOP-based agent coordination
  - Role-based agent interactions
  - Consistent output formats
- **Code Location:** `.blackbox5/engine/frameworks/3-metagpt/`
- **Documentation:** [MetaGPT Details](./01-core-agent-frameworks/README.md#metagpt)
- **Status:** ✅ Active

### 4. Swarm (OpenAI)
- **Type:** Lightweight Orchestration
- **Purpose:** Multi-agent coordination with emergent behavior
- **Key Features:**
  - Lightweight agent handoffs
  - Emergent coordination patterns
  - Simple conversational interface
- **Code Location:** `.blackbox5/engine/frameworks/4-swarm/`
- **Documentation:** [Swarm Details](./01-core-agent-frameworks/README.md#swarm)
- **Status:** ✅ Active

---

## Category 2: Claude Code Autonomous Frameworks (3)

**Status:** 📚 Research Complete
**Purpose:** Extend Claude Code with autonomous capabilities

### 5. Claude-Flow
- **Type:** Orchestration Platform (MCP-based)
- **Purpose:** Operating system for AI agents with 54+ specialized agents
- **Key Features:**
  - MCP Integration (175+ tools)
  - SONA self-learning architecture
  - Background daemon (24/7 operation)
  - Multi-swarm coordination
  - Q-Learning router
- **Research:** [Claude-Flow Analysis](../../.docs/frameworks-analysis/claude-flow/)
- **Analysis:** `CLAUDE-CODE-AUTONOMOUS-FRAMEWORKS.md`
- **Status:** 📚 Research Complete (Highly Recommended)
- **Priority:** ⭐⭐⭐⭐⭐

### 6. Sleepless Agent
- **Type:** 24/7 AI Daemon
- **Purpose:** Transform Claude Code Pro into autonomous AgentOS
- **Key Features:**
  - Slack integration (`/think`, `/chat`, `/check`)
  - Smart scheduling (95% day, 96% night)
  - Auto Git operations
  - SQLite task queue
- **Research:** [Sleepless Analysis](../../.docs/frameworks-analysis/sleepless/)
- **Analysis:** `FRAMEWORKS-DEEP-DIVE.md`
- **Status:** 📚 Research Complete (Production-Ready)
- **Priority:** ⭐⭐⭐⭐⭐

### 7. LLM Autonomous Agent Plugin
- **Type:** Claude Code Plugin
- **Purpose:** Self-learning plugin with specialized agents
- **Key Features:**
  - GLM API support (built-in!)
  - 35+ specialized agents
  - 40+ linters
  - Pattern learning (94% accuracy)
  - Real-time dashboard
- **Research:** [LLM Plugin Analysis](../../.docs/frameworks-analysis/llm-plugin/)
- **Analysis:** `FRAMEWORKS-DEEP-DIVE.md`
- **Status:** 📚 Research Complete (Best GLM Support)
- **Priority:** ⭐⭐⭐⭐

---

## Category 3: Production Agent Frameworks (3)

**Status:** 📚 Research Complete
**Purpose:** Enterprise-ready agent systems

### 8. AgentScope
- **Type:** Multi-Agent Framework
- **Purpose:** Advanced middleware system for agent orchestration
- **Key Features:**
  - **Middleware System** (high priority)
  - YAML-based agent configuration
  - Memory compression
  - Token compression
  - Distributed execution
- **Research Location:** `.blackbox5/engine/development/framework-research/agentscope-ai-agentscope-ANALYSIS.md`
- **Status:** 📚 Research Complete
- **Priority:** ⭐⭐⭐⭐⭐ (Middleware System)

### 9. DeerFlow (ByteDance)
- **Type:** Workflow Framework
- **Purpose:** Token compression and visual workflow builder
- **Key Features:**
  - **Token Compression** (solves context explosion)
  - Visual workflow builder
  - Message compression algorithms
  - State management
- **Research Location:** `.blackbox5/engine/development/framework-research/bytedance-deer-flow-ANALYSIS.md`
- **Status:** 📚 Research Complete
- **Priority:** ⭐⭐⭐⭐⭐ (Token Compression)

### 10. Astron Agent (iFlytek)
- **Type:** Enterprise Agent Framework
- **Purpose:** Enterprise-grade agent framework
- **Key Features:**
  - Enterprise scaling
  - Production deployment
  - Monitoring & observability
- **Research Location:** `.blackbox5/engine/development/framework-research/iflytek-astron-agent-ANALYSIS.md`
- **Status:** 📚 Research Complete
- **Priority:** ⭐⭐⭐

---

## Category 4: Enterprise Frameworks (3)

**Status:** 📚 Research Complete
**Purpose:** Large-scale deployment & integration

### 11. Google ADK (Agent Development Kit)
- **Type:** Agent Development Framework
- **Purpose:** Google's official agent development framework
- **Key Features:**
  - Official Google support
  - Enterprise integration
  - Scalable architecture
- **Research Location:** `.blackbox5/engine/development/framework-research/google-adk-python-ANALYSIS.md`
- **Status:** 📚 Research Complete
- **Priority:** ⭐⭐⭐⭐

### 12. Microsoft Agent Framework
- **Type:** Enterprise Agent Framework
- **Purpose:** Microsoft's agent framework for enterprise applications
- **Key Features:**
  - Azure integration
  - Enterprise security
  - Microsoft ecosystem
- **Research Location:** `.blackbox5/engine/development/framework-research/microsoft-agent-framework-ANALYSIS.md`
- **Status:** 📚 Research Complete
- **Priority:** ⭐⭐⭐⭐

### 13. PraisonAI
- **Type:** Multi-Agent Framework
- **Purpose:** Simplified multi-agent orchestration
- **Key Features:**
  - Simple API
  - Quick setup
  - Multi-agent coordination
- **Research Location:** `.blackbox5/engine/development/framework-research/MervinPraison-PraisonAI-ANALYSIS.md`
- **Status:** 📚 Research Complete
- **Priority:** ⭐⭐⭐

---

## Category 5: Inspiration Frameworks (2)

**Status:** 💡 Implementation Patterns
**Purpose:** Provide patterns and inspiration for BlackBox5

### 14. AutoMaker
- **Type:** Autonomous AI Development Studio
- **Purpose:** Kanban workflow for autonomous feature implementation
- **Key Features:**
  - **Context Files System** ⭐
  - **Git Worktree Isolation** ⭐
  - **Event-Driven Architecture** ⭐
  - Planning modes (skip, lite, spec, full)
  - Real-time streaming
  - GitHub integration
- **Documentation:** [AutoMaker Analysis](../../.docs/frameworks-analysis/automaker/)
- **Status:** 💡 Analysis Complete (High Priority Patterns)
- **Priority:** ⭐⭐⭐⭐⭐ (Patterns)

### 15. Maestro
- **Type:** Multi-Agent IDE
- **Purpose:** Keyboard-first multi-agent orchestration
- **Key Features:**
  - **Layer Stack System** ⭐
  - **Auto Run & Playbooks** ⭐
  - Group chat multi-agent coordination
  - Mobile remote control
  - CLI tool for headless operation
  - Usage dashboard
- **Documentation:** [Maestro Analysis](../../.docs/frameworks-analysis/Maestro/)
- **Status:** 💡 Analysis Complete (High Priority Patterns)
- **Priority:** ⭐⭐⭐⭐⭐ (Patterns)

---

## Category 6: Autonomous Loop Frameworks (1)

**Status:** 🔥 Highest Priority (Critical Integration)
**Purpose:** Autonomous AI execution loops with parallel execution

### 16. Ralph-y (Ralphy)
- **Type:** Autonomous AI Coding Loop
- **Purpose:** Bash-based autonomous AI execution with git worktree parallel execution
- **Repository:** https://github.com/michaelshimeles/ralphy
- **Version:** 3.1.0
- **Key Features:**
  - **Git Worktree Parallel Execution** ⭐⭐⭐⭐⭐ (HIGHEST PRIORITY PATTERN)
  - **Multi-AI Engine Support** - Claude Code, OpenCode, Codex, Cursor
  - **PRD-Driven Format** - Natural checkbox task format
  - **Branch Per Task** - Isolated branches with auto-PR creation
  - **Cost Tracking** - Per-engine token/cost tracking
  - **YAML Parallel Groups** - Control task execution order
- **Critical Pattern:** Git worktree isolation enables true parallel execution without file conflicts
- **Analysis Location:** `.blackbox5/engine/development/framework-research/ralphy-ANALYSIS.md`
- **Status:** 🔥 Analysis Complete (Highest Priority Integration)
- **Priority:** ⭐⭐⭐⭐⭐ (Git Worktree Pattern)
- **Integration Timeline:** Week 1 (immediate)

**Why Ralph-y is Different:**
- Complementary to RALPH Runtime (not competitive)
- RALPH provides decision engine, Ralph-y provides git worktree execution
- Bash-based simplicity vs Python sophistication
- Battle-tested (v3.1.0) in production

**Git Worktree Pattern:**
```bash
# Each agent gets isolated worktree for true parallel execution
Agent 1 → /tmp/ralphy-agent-1 → branch: ralphy/agent-1-task-name
Agent 2 → /tmp/ralphy-agent-2 → branch: ralphy/agent-2-task-name
Agent 3 → /tmp/ralphy-agent-3 → branch: ralphy/agent-3-task-name

# Merge back when done
git worktree remove /tmp/ralphy-agent-1
```

**Expected Impact:** 3-5x speedup on parallelizable tasks

---

## Framework Integration Status

### ✅ Fully Integrated (4 frameworks)
- BMAD
- SpecKit
- MetaGPT
- Swarm

### 🔥 Highest Priority (1 framework)
- **Ralph-y** (Git worktree parallel execution - Week 1 priority)

### 📚 Research Complete (10 frameworks)
- Claude-Flow
- Sleepless Agent
- LLM Autonomous Agent Plugin
- AgentScope
- DeerFlow
- Astron Agent
- Google ADK
- Microsoft Agent Framework
- PraisonAI
- Ralph-y (analysis complete)

### 💡 Patterns Identified (2 frameworks)
- AutoMaker (context files, git worktrees, event-driven)
- Maestro (layer stack, auto run, playbooks)

---

## Priority Implementation Roadmap

### Phase 0: Git Worktree Integration (Week 1) 🔥🔥🔥🔥🔥
**From Ralph-y (HIGHEST PRIORITY):**
1. **Git Worktree Parallel Execution** ⭐⭐⭐⭐⭐
   - Implement `GitWorktreeManager` class
   - Add parallel execution support to RALPH Runtime
   - Enable 3-5x speedup on parallelizable tasks
   - Test with 3-5 parallel agents

**Why First?**
- Most critical pattern for performance
- Solves file conflict issues
- Enables true parallel execution
- Complements RALPH Runtime perfectly

### Phase 1: Core Patterns (Weeks 2-3) ⭐⭐⭐⭐⭐
**From AutoMaker & Maestro:**
1. Context Files System
2. Layer Stack System
3. Event-Driven Architecture
4. Auto Run & Playbooks

### Phase 2: Advanced Features (Weeks 4-5) ⭐⭐⭐⭐⭐
**From AgentScope & DeerFlow:**
1. **Middleware System** (AgentScope)
2. **Token Compression** (DeerFlow)
3. **Memory Compression** (AgentScope)
4. **YAML Configuration** (AgentScope)

### Phase 3: Autonomous Extensions (Weeks 6-7) ⭐⭐⭐⭐
**From Claude Code Frameworks:**
1. Claude-Flow MCP Integration
2. Sleepless Agent 24/7 operation
3. LLM Autonomous Agent Plugin

### Phase 4: Enterprise Integration (Weeks 8-9) ⭐⭐⭐
**From Enterprise Frameworks:**
1. Google ADK Integration
2. Microsoft Agent Framework
3. Enterprise deployment patterns

---

## Key Framework Patterns

### High Priority Patterns (Implement First)

#### 0. **Git Worktree Parallel Execution** (Ralph-y) 🔥🔥🔥🔥🔥
- **CRITICAL PATTERN** - Most important to adopt
- Enables true parallel execution without file conflicts
- Expected 3-5x speedup on parallelizable tasks
- **Implementation:** 3-5 days (Week 1 priority)
- **Code Location:** `.blackbox5/engine/development/framework-research/ralphy-ANALYSIS.md:194`

#### 1. **Token Compression** (DeerFlow)
- Solves context explosion
- Builds on existing `context_extractor.py`
- **Implementation:** 2-3 days

#### 2. **Middleware System** (AgentScope)
- More powerful than hooks
- Enables cross-cutting concerns
- **Implementation:** 3-5 days

#### 3. **YAML Configuration** (AgentScope)
- Easier agent management
- Declarative agent definitions
- **Implementation:** 2-3 days

#### 4. **Memory Compression** (AgentScope)
- Long-running agents
- State management
- **Implementation:** 3-4 days

#### 5. **Agent Interoperability** (Swarm)
- Multi-framework scenarios
- Agent handoffs
- **Implementation:** 2-3 days

### Implemented Patterns (AutoMaker, Maestro, Ralph-y)

#### 1. **Context Files System** (AutoMaker)
- Persistent context across sessions
- Template-based context management
- **Status:** ✅ Concept Aligned

#### 2. **Layer Stack System** (Maestro)
- Hierarchical agent coordination
- State propagation
- **Status:** ⚠️ Partial Implementation

#### 3. **Git Worktree Isolation** (AutoMaker + Ralph-y) 🔥
- **CRITICAL:** AutoMaker identified, Ralph-y perfected
- Parallel development streams
- Isolated testing environments
- **Status:** ✅ Supported (pattern documented, needs RALPH Runtime integration)

#### 4. **Event-Driven Architecture** (AutoMaker)
- Reactive agent system
- Async workflows
- **Status:** ✅ EventBus Implemented

#### 5. **Hook-Based State** (Maestro)
- Lifecycle hooks
- State management
- **Status:** ✅ System Exists

---

## Code References

### Core Frameworks (Integrated)
- **BMAD:** `.blackbox5/engine/frameworks/1-bmad/`
- **SpecKit:** `.blackbox5/engine/frameworks/2-speckit/`
- **MetaGPT:** `.blackbox5/engine/frameworks/3-metagpt/`
- **Swarm:** `.blackbox5/engine/frameworks/4-swarm/`

### Autonomous Loop Frameworks (Critical Priority)
- **Ralph-y:** `.blackbox5/engine/development/framework-research/ralphy-ANALYSIS.md`
- **Repository:** https://github.com/michaelshimeles/ralphy

### Framework Research
- **All Analysis Files:** `.blackbox5/engine/development/framework-research/`
- **Implementation Plan:** `.blackbox5/docs/FRAMEWORK-IMPLEMENTATION-PLAN.md`
- **Features Analysis:** `.blackbox5/docs/FRAMEWORK-FEATURES-ANALYSIS.md`

### Inspiration Analysis
- **AutoMaker:** `.docs/frameworks-analysis/automaker/`
- **Maestro:** `.docs/frameworks-analysis/Maestro/`
- **Quick Reference:** `.docs/frameworks-analysis/QUICK-REFERENCE.md`

---

## Implementation Roadmap Reference

### Day-by-Day Plan
**File:** `.blackbox5/docs/FRAMEWORK-IMPLEMENTATION-PLAN.md`
- **Duration:** 4 weeks (28 days)
- **Code Sources:** Auto-Claude (40%), OpenSpec (30%), Cognee (10%), Custom (20%)
- **Time Saved:** 25-36 days through code reuse

### Key Milestones
- **Week 1:** Core patterns (context, git worktrees)
- **Week 2:** Advanced patterns (layer stack, events)
- **Week 3:** Middleware & compression
- **Week 4:** Integration & testing

---

## Framework Comparison

### Orchestration Capabilities

| Framework | Orchestration | Middleware | YAML Config | Token Compression |
|-----------|--------------|------------|-------------|-------------------|
| **BMAD** | ✅ Master-Agent | ❌ | ❌ | ❌ |
| **SpecKit** | ✅ Spec-Driven | ❌ | ✅ | ❌ |
| **MetaGPT** | ✅ SOP-Based | ❌ | ✅ | ❌ |
| **Swarm** | ✅ Conversational | ❌ | ❌ | ❌ |
| **AgentScope** | ✅ Advanced | ✅ | ✅ | ✅ |
| **DeerFlow** | ✅ Visual | ❌ | ✅ | ✅ |
| **Claude-Flow** | ✅ Q-Learning | ✅ | ✅ | ❌ |

### Enterprise Features

| Framework | Scaling | Monitoring | Security | Deployment |
|-----------|---------|------------|----------|------------|
| **Google ADK** | ✅ | ✅ | ✅ | ✅ |
| **Microsoft** | ✅ | ✅ | ✅ | ✅ |
| **Astron** | ✅ | ✅ | ✅ | ✅ |
| **PraisonAI** | ⚠️ | ⚠️ | ⚠️ | ✅ |

---

## Next Steps

### Immediate Actions (This Week)
1. **Review Core Frameworks** - Understand BMAD, SpecKit, MetaGPT, Swarm
2. **Study Inspiration Patterns** - AutoMaker & Maestro implementation guides
3. **Plan Integration** - Identify which patterns to implement first

### Short-term (Next 2 Weeks)
4. **Implement Context Files** - AutoMaker pattern
5. **Implement Layer Stack** - Maestro pattern
6. **Evaluate Middleware** - AgentScope integration

### Long-term (Next 4-6 Weeks)
7. **Token Compression** - DeerFlow integration
8. **YAML Configuration** - AgentScope pattern
9. **Autonomous Extensions** - Claude-Flow or Sleepless Agent

---

## Related Documentation

- **Framework Implementation Plan:** `.blackbox5/docs/FRAMEWORK-IMPLEMENTATION-PLAN.md`
- **Framework Features Analysis:** `.blackbox5/docs/FRAMEWORK-FEATURES-ANALYSIS.md`
- **Frameworks Deep Dive:** `FRAMEWORKS-DEEP-DIVE.md`
- **Claude Code Autonomous Frameworks:** `CLAUDE-CODE-AUTONOMOUS-FRAMEWORKS.md`
- **Framework Comparison:** `.blackbox5/engine/development/frameworks/FRAMEWORK-COMPARISON.md`

---

**Last Updated:** 2026-01-19
**Total Frameworks:** 16 (4 active, 1 critical priority, 10 researched, 2 patterns)
**Maintainer:** BlackBox5 Engine Team
**Status:** ✅ Complete Inventory + Ralph-y Integration Plan
