# BlackBox5 Framework Comparison Matrix

> Visual comparison of 15 research frameworks
> Analysis Date: 2026-01-18

## Relevance vs Complexity Matrix

```
HIGH IMPACT
    │
    │  ★ Auto-Claude         ★ Cognee
    │  (Production-Ready)     (Memory Systems)
    │
    │  ★ Gastown             ★ CCPM
    │  (Orchestration)       (Spec-Driven)
    │
    │                ★ Maestro ★ Automaker
    │                (Multi-Agent IDE)
    │
    │  ★ Awesome Context     ★ Agor
    │  Engineering           (Spatial Canvas)
    │
    │  ★ Onlook              ★ OpenSpec
    │  (Visual Dev)          (Specs)
    │
    │       ★ Claudio        ★ Agent-of-Empires
    │       (Parallel)       (Terminal)
    │
    │  ★ SimpleLLMs          ★ CL4R1T4S
    │  (Behaviors)           (Prompts)
    │
    └───────────────────────────────────────────────
        LOW COMPLEXITY          HIGH COMPLEXITY
```

## Feature Comparison Table

| Feature | Auto-Claude | Gastown | CCPM | Cognee | Agor | BlackBox5 |
|---------|-------------|---------|------|--------|------|-----------|
| **Skills System** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ 31 skills |
| **Multi-Agent** | ✅ 4 agents | ✅ 20-30 | ✅ Parallel | ✅ | ✅ | ✅ 5+ agents |
| **Memory System** | ✅ Graphiti | ✅ Beads | ❌ | ✅ KG+Vector | ✅ DB | ❌ |
| **Persistent State** | ✅ Worktrees | ✅ Hooks | ✅ GitHub | ✅ DB | ✅ DB | ❌ |
| **Spec-Driven** | ✅ Multi-phase | ❌ | ✅ Full | ❌ | ❌ | ❌ |
| **GitHub-Native** | ✅ Integration | ✅ Beads | ✅ Core | ❌ | ✅ Linked | ❌ |
| **Security Model** | ✅ 3-layer | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Visual UI** | ✅ Electron | ❌ CLI | ❌ | ✅ Web UI | ✅ Spatial | ❌ |
| **Parallel Execution** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Context Engineering** | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ Partial |
| **E2E Testing** | ✅ MCP | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Orchestrator** | ✅ Planner | ✅ Mayor | ✅ PM | ❌ | ✅ Daemon | ✅ Orchestrator |
| **Worktree Isolation** | ✅ | ✅ Hooks | ✅ | ❌ | ✅ | ⚠️ Partial |
| **Knowledge Graph** | ✅ Graphiti | ✅ Beads | ❌ | ✅ Native | ❌ | ❌ |
| **Formula Automation** | ❌ | ✅ TOML | ❌ | ❌ | ✅ Zones | ❌ |
| **Session Tracking** | ❌ | ❌ | ❌ | ❌ | ✅ Genealogy | ❌ |

## Capabilities Heatmap

```
Capability                      Auto  Gastown  CCPM   Cognee  Agor   BlackBox5
                                Claude                 Context
─────────────────────────────────────────────────────────────────────────
Spec-Driven Development         ████  ░░░░    ████   ░░░░    ░░░░    ░░░░
Persistent Memory              ████  ████    ░░░░    ████   ████    ░░░░
Multi-Agent Coordination       ████  ████    ████   ████   ████    ████
GitHub Integration             ████  ████    ████   ░░░░    ████    ░░░░
Security Model                 ████  ░░░░    ░░░░    ░░░░    ░░░░    ░░░░
Visual Coordination            ████  ░░░░    ░░░░    ████   ████    ░░░░
Context Engineering            ████  ████    ████    ████   ████    ░░░░
Parallel Execution             ████  ████    ████   ████   ████    ░░░░
E2E Testing                    ████  ░░░░    ░░░░    ░░░░    ░░░░    ░░░░
Knowledge Graph                ████  ████    ░░░░    ████   ░░░░    ░░░░
Production Ready               ████  ░░░░    ████   ████   ░░░░    ░░░░

████ = Excellent Implementation
███░ = Good Implementation
██░░ = Partial Implementation
█░░░ = Basic Implementation
░░░░ = Not Implemented
```

## Adoption Priority

### Immediate Adoption (Weeks 1-4)
- ✅ CCPM: GitHub-native workflow
- ✅ Awesome Context Engineering: Context requirements
- ✅ Auto-Claude: Multi-platform abstractions
- ✅ Gastown: Mailbox system

### Short-Term Adoption (Weeks 5-12)
- ✅ Cognee: Memory architecture
- ✅ Auto-Claude: Security model
- ✅ Gastown: Mayor pattern
- ✅ CCPM: Parallel execution

### Long-Term Adoption (Weeks 13-30)
- ✅ Agor: Spatial coordination
- ✅ Auto-Claude: E2E testing
- ✅ Gastown: Formula automation
- ✅ Cognee: Advanced memory

## Learning Path

### Phase 1: Foundations (Week 1)
**Focus**: Spec-driven development and context engineering

**Study**:
1. CCPM - GitHub workflow and parallel execution
2. Awesome Context Engineering - Theoretical framework

**Implement**:
- Context requirements schema
- GitHub integration basics
- Skill metadata standardization

**Deliverable**: All skills have explicit context requirements

---

### Phase 2: Architecture (Weeks 2-3)
**Focus**: Multi-agent coordination and persistent state

**Study**:
1. Gastown - Mayor pattern and hooks
2. Auto-Claude - Security and platform abstraction

**Implement**:
- Mayor orchestrator pattern
- Agent mailbox system
- Platform abstraction layer

**Deliverable**: Coordinator agent with mailbox system

---

### Phase 3: Memory (Weeks 4-5)
**Focus**: Persistent memory and knowledge graphs

**Study**:
1. Cognee - ECL pipeline and knowledge graphs
2. OpenSpec - Specification management

**Implement**:
- Memory system architecture
- Knowledge graph schema
- ECL pipeline skeleton

**Deliverable**: Memory system with knowledge graph

---

### Phase 4: Production (Weeks 6-8)
**Focus**: Security, testing, and production readiness

**Study**:
1. Auto-Claude - Security model and E2E testing
2. Automaker - Autonomous development

**Implement**:
- 3-layer security model
- E2E testing framework
- Production deployment

**Deliverable**: Production-ready BlackBox5

---

### Phase 5: Advanced (Weeks 9+)
**Focus**: Visual coordination and advanced features

**Study**:
1. Agor - Spatial canvas and zone triggers
2. Maestro - Multi-agent IDE

**Implement**:
- Spatial coordination UI
- Zone-based automation
- Session genealogy

**Deliverable**: Enterprise-grade BlackBox5

## Key Differentiators

### What BlackBox5 Has That Others Don't

| Feature | BlackBox5 | Others | Advantage |
|---------|-----------|--------|-----------|
| **Skills System** | ✅ 31 skills, organized | ❌ None | Reusable capabilities |
| **Multiple Frameworks** | ✅ 5 frameworks | ⚠️ 1-2 | Flexibility |
| **Specialist Agents** | ✅ BMAD, research, specialists | ⚠️ General | Domain expertise |
| **MCP Integration** | ✅ 10+ MCP tools | ⚠️ Limited | Tool ecosystem |

### What Others Have That BlackBox5 Needs

| Feature | Source | Priority | Impact |
|---------|--------|----------|--------|
| **Spec-Driven Pipeline** | CCPM | #1 | VERY HIGH |
| **Memory System** | Cognee | #2 | VERY HIGH |
| **Mayor Pattern** | Gastown | #3 | VERY HIGH |
| **Security Model** | Auto-Claude | #4 | HIGH |
| **GitHub-Native** | CCPM | #5 | HIGH |

## Investment vs Return

```
HIGH RETURN
    │
    │  🎯 Spec-Driven Pipeline
    │  (CCPM) - 6 weeks
    │
    │  🎯 Memory System
    │  (Cognee) - 8 weeks
    │
    │  🎯 Mayor Pattern
    │  (Gastown) - 6 weeks
    │
    │        🎯 GitHub Integration
    │        (CCPM) - 2 weeks
    │
    │  🎯 Security Model
    │  (Auto-Claude) - 2 weeks
    │
    │      🎯 Context Requirements
    │      (Awesome CE) - 1 week
    │
    └────────────────────────────────────
        LOW INVESTMENT        HIGH INVESTMENT
```

## Risk Assessment

### High Risk, High Reward
- Knowledge Graph Memory System (8 weeks, complex)
- Spatial Coordination UI (10 weeks, complex)

### Medium Risk, High Reward
- Spec-Driven Pipeline (6 weeks, medium)
- Mayor Pattern (6 weeks, medium)

### Low Risk, High Reward
- Context Requirements (1 week, easy)
- GitHub Integration (2 weeks, easy)
- Security Model (2 weeks, medium)

### Low Risk, Low Reward
- Extended Thinking Mode (3 days, trivial)
- Skill Metadata (1 week, easy)

## Success Probability

```
100% ┤                          ┌─────────────
     │                    ┌─────┘
     │              ┌─────┘
     │        ┌─────┘
 75% ┤      ┌─┘
     │   ┌──┘
     │ ┌─┘
     │─┘                      ┌───────────
 50% ┤                  ┌─────┘
     │            ┌─────┘
     │      ┌─────┘
 25% ┤  ┌───┘
     │──┘
     └──────────────────────────────────
       Quick  Core  Spec-  Advanced
       Wins   Infra  Driven
```

---

**Key Takeaway**: Focus on quick wins first (context requirements, GitHub integration), then build core infrastructure (memory, orchestrator), and finally implement advanced features (spec-driven pipeline, spatial UI).

---

*Version: 1.0 | Last Updated: 2026-01-18 | Maintainer: BlackBox5 Team*
