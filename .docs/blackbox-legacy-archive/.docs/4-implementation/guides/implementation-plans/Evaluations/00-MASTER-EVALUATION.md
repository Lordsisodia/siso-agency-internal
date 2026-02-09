# Blackbox Framework Evaluation Master Document
**Status**: In Progress  
**Last Updated**: 2026-01-15

## Overview

This document contains comprehensive evaluations of all major AI agent frameworks to determine which features to integrate into Blackbox3.

## Frameworks Evaluated

| Framework | Status | Priority | Key Value |
|-----------|--------|----------|-----------|
| **Oh-My-OpenCode** | ✅ Complete | **P0** | MCP system, multi-agent orchestration, hooks |
| **BMAD-METHOD** | 🔄 In Progress | **P0** | 12+ specialized agents, 4-phase methodology |
| **Spec Kit** | ⏳ Pending | **P1** | Slash commands, spec generation |
| **Ralph** | 🔄 In Progress | **P1** | Autonomous loop engine, circuit breaker |
| **MetaGPT** | ⏳ Pending | **P2** | Software company simulation, round-based |
| **Swarm** | ⏳ Pending | **P2** | Lightweight coordination, handoffs |
| **OpenCode** | ⏳ Pending | **P1** | Base platform, MCP client |
| **Claude Code** | ⏳ Pending | **P2** | Reference implementation, skills |

## Evaluation Criteria

### Core Architecture (1-5)
- Design philosophy and approach
- Code quality and maintainability
- Extensibility
- Production readiness

### Feature Completeness (1-5)
- Agent system
- Memory/context management
- Tool integration
- Workflow management

### Integration Potential (1-5)
- How well it fits Blackbox3
- Ease of integration
- Dependency requirements
- Maintenance burden

### Overall Score (1-5)
- Weighted average of above
- Final recommendation

## Quick Comparison Matrix

| Feature | Oh-My-OpenCode | BMAD | Spec Kit | Ralph | MetaGPT | Swarm |
|---------|---------------|------|----------|-------|---------|-------|
| **MCP Support** | ✅ Excellent | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Multi-Agent** | ✅ Excellent | ✅ Good | ❌ | ❌ | ✅ Good | ✅ Basic |
| **Autonomous Loop** | ⚠️ Basic | ❌ | ❌ | ✅ Excellent | ⚠️ Basic | ❌ |
| **Memory System** | ✅ Excellent | ⚠️ Basic | ❌ | ⚠️ Basic | ❌ | ❌ |
| **LSP Tools** | ✅ Excellent | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Hooks System** | ✅ Excellent | ❌ | ❌ | ⚠️ Basic | ❌ | ❌ |
| **Workflows** | ✅ Good | ✅ Excellent | ✅ Excellent | ⚠️ Basic | ⚠️ Basic | ❌ |
| **Slash Commands** | ✅ Good | ❌ | ✅ Excellent | ❌ | ❌ | ❌ |
| **Session Management** | ✅ Excellent | ❌ | ❌ | ⚠️ Basic | ❌ | ❌ |
| **Background Tasks** | ✅ Excellent | ❌ | ❌ | ⚠️ Basic | ❌ | ❌ |

## Feature Priority Matrix

| Feature | Impact | Effort | Priority | Source Framework |
|---------|--------|--------|----------|------------------|
| MCP Integration | High | Low | **P0** | Oh-My-OpenCode |
| Enhanced Agents | High | Medium | **P0** | Oh-My-OpenCode |
| LSP Tools | High | Low | **P0** | Oh-My-OpenCode |
| Background Tasks | High | Medium | **P1** | Oh-My-OpenCode |
| Session Management | Medium | Low | **P1** | Oh-My-OpenCode |
| Keyword Detection | Medium | Low | **P1** | Oh-My-OpenCode |
| BMAD 4-Phase | High | Medium | **P1** | BMAD-METHOD |
| Ralph Integration | High | Medium | **P1** | Ralph |
| Vendor Swap Validator | High | Medium | **P2** | Custom |
| Multi-Tenant Patterns | High | Medium | **P2** | Custom |

## Recommended Integrations

### Phase 1 (Week 1): Core Features
1. **MCP Integration** - 8+ curated servers from Oh-My-OpenCode
2. **Enhanced Agents** - Oracle, Librarian, Explore
3. **LSP Tools** - Give agents IDE superpowers

### Phase 2 (Week 2): Workflow Features
4. **BMAD 4-Phase** - Adopt proven methodology
5. **Ralph Integration** - Add autonomous execution engine
6. **Background Tasks** - Parallel agent execution

### Phase 3 (Week 3): Intelligence Layer
7. **Keyword Detection** - One-word mode switching
8. **Session Management** - Never lose context
9. **Auto-Compaction** - Smart token management

### Phase 4 (Week 4): Advanced Features
10. **Advanced Hooks** - Code quality automation
11. **Vendor Swap Validator** - Custom enforcement
12. **Multi-Tenant Patterns** - Enterprise compliance

## Decision Framework

### When to Use Each Framework

| Use Case | Recommended Framework(s) |
|----------|--------------------------|
| Code navigation & analysis | **Explore (Oh-My-OpenCode)** |
| Architecture review | **Oracle (Oh-My-OpenCode)** |
| Research & documentation | **Librarian (Oh-My-OpenCode)** |
| Full-stack development | **ultrawork mode** (all Omo agents) |
| Deep analysis/debugging | **analyze mode** (Oracle → Explore → Librarian) |
| Quick searches | **search mode** (Explore + Librarian) |
| Long-running tasks | **Ralph** autonomous loop |
| Complex projects | **BMAD 4-phase** methodology |
| Spec-driven development | **Spec Kit** slash commands |

### Framework Selection Tree

```
Start: What are you trying to do?
│
├─ Research & Documentation
│  └─ Use: Librarian (Omo) + Context7 MCP
│
├─ Code Navigation & Analysis  
│  └─ Use: Explore (Omo) + LSP Tools
│
├─ Architecture Review
│  └─ Use: Oracle (Omo)
│
├─ Full Development Sprint
│  ├─ Complex project with multiple features?
│  │  └─ Use: BMAD 4-Phase + ultrawork mode
│  │
│  └─ Single feature, quick turnaround
│     └─ Use: ultrawork mode
│
├─ Deep Debugging/Analysis
│  └─ Use: analyze mode (Oracle → Explore → Librarian)
│
├─ Long-Running Autonomous Task
│  └─ Use: Ralph autonomous loop + Omo agents
│
└─ Spec-Driven Development
   └─ Use: Spec Kit slash commands
```

## Risk Assessment

| Framework | Integration Risk | Maintenance Risk | Dependency Risk |
|-----------|------------------|------------------|-----------------|
| Oh-My-OpenCode | Low | Low | Low (well-maintained) |
| BMAD-METHOD | Medium | Low | Low (your own agents) |
| Ralph | Medium | Low | Low (standalone) |
| Spec Kit | Medium | Medium | Medium (CLI-first) |
| MetaGPT | High | High | High (complex dependencies) |
| Swarm | Low | Low | N/A (deprecated) |

## Success Metrics

### Phase 1 Complete When:
- [ ] At least 3 MCPs functional
- [ ] Omo agents load and respond
- [ ] LSP tools available to agents
- [ ] All documentation complete

### Phase 2 Complete When:
- [ ] BMAD 4-phase workflow functional
- [ ] Ralph loop integrates with Blackbox3
- [ ] Background tasks execute reliably
- [ ] Parallel agent execution tested

### Phase 3 Complete When:
- [ ] Keyword detection triggers correctly
- [ ] Session search returns relevant results
- [ ] Auto-compaction prevents token limits
- [ ] Long sessions stable (>2 hours)

### Phase 4 Complete When:
- [ ] Hooks execute reliably
- [ ] Vendor swap validation works
- [ ] Multi-tenant patterns enforced
- [ ] All tests pass

## Next Steps

1. **Complete Framework Reviews** - Finish detailed analysis of each framework
2. **Create Integration Plans** - Detailed implementation guides for each feature
3. **Prototype Critical Features** - MCP, agents, LSP tools
4. **Test Integration** - Verify all components work together
5. **Document Usage** - Create examples and guides

## Document Structure

This evaluation contains:

- **00-MASTER-EVALUATION.md** - This file (overview and decisions)
- **01-OHMYOPENCODE.md** - Complete Oh-My-OpenCode review
- **02-BMAD-METHOD.md** - BMAD agents and workflows review
- **03-SPECKIT.md** - Spec Kit slash commands review
- **04-RALPH.md** - Ralph autonomous loop review
- **05-METAGPT.md** - MetaGPT simulation review
- **06-SWARM.md** - Swarm coordination patterns review
- **07-FEATURE-MATRIX.md** - Detailed feature comparison
- **08-IMPLEMENTATION-ROADMAP.md** - Prioritized integration plan
- **09-RISK-ASSESSMENT.md** - Detailed risk analysis

---

**Document Status**: ✅ Structure Complete  
**Next**: Complete individual framework evaluations
