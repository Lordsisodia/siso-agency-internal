# Implementation Roadmap
**Status**: ✅ Complete  
**Last Updated**: 2026-01-15

## Overview

Prioritized implementation plan based on framework evaluations. All integrations are designed to be modular - use what you need, skip what you don't.

## Phase Timeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PHASE 1: CORE FEATURES (Week 1-2)                │
├─────────────────────────────────────────────────────────────────────┤
│  W1  │ MCP Integration System                                       │
│      │ • 8+ curated MCP servers                                     │
│      │ • MCP manager CLI                                            │
│      │ • Configuration files                                        │
├─────────────────────────────────────────────────────────────────────┤
│  W2  │ Enhanced Agents                                              │
│      │ • Oracle (GPT-5.2) - Architecture expert                     │
│      │ • Librarian (Claude/Gemini) - Research specialist            │
│      │ • Explore (Grok/Gemini) - Fast codebase navigator            │
│      │ • Agent loader enhancement                                   │
├─────────────────────────────────────────────────────────────────────┤
│  W2  │ LSP Tools for Agents                                         │
│      │ • 10+ IDE-level tools                                        │
│      │ • LSP integration skill                                      │
│      │ • Navigation, search, refactoring                            │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    PHASE 2: WORKFLOW FEATURES (Week 3-4)            │
├─────────────────────────────────────────────────────────────────────┤
│  W3  │ BMAD 4-Phase Methodology                                     │
│      │ • Phase tracking system                                      │
│      │ • Phase validation                                           │
│      │ • Workflow commands                                          │
├─────────────────────────────────────────────────────────────────────┤
│  W4  │ Ralph Autonomous Engine                                      │
│      │ • Ralph loop wrapper                                         │
│      │ • File conversion (BB3 ↔ Ralph)                              │
│      │ • Autonomous execution CLI                                   │
├─────────────────────────────────────────────────────────────────────┤
│  W4  │ Background Task System                                       │
│      │ • Parallel agent execution                                   │
│      │ • Task management CLI                                        │
│      │ • Progress tracking                                          │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    PHASE 3: INTELLIGENCE LAYER (Month 2, Week 1-2)  │
├─────────────────────────────────────────────────────────────────────┤
│  W1  │ Keyword Detection                                            │
│      │ • Magic word detection                                       │
│      │ • Mode switching (ultrawork, search, analyze)                │
│      │ • Automatic context enhancement                              │
├─────────────────────────────────────────────────────────────────────┤
│  W2  │ Session Management                                           │
│      │ • Full session history                                       │
│      │ • Cross-session search                                       │
│      │ • Metadata tracking                                          │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    PHASE 4: OPTIMIZATION (Month 2, Week 3-4)        │
├─────────────────────────────────────────────────────────────────────┤
│  W3  │ Auto-Compaction                                              │
│      │ • Smart context management                                   │
│      │ • Token limit prevention                                     │
│      │ • Critical context preservation                              │
├─────────────────────────────────────────────────────────────────────┤
│  W3  │ Advanced Hooks                                               │
│      │ • Pre/Post tool execution                                    │
│      │ • Code quality automation                                    │
│      │ • Validation hooks                                           │
├─────────────────────────────────────────────────────────────────────┤
│  W4  │ Documentation & Testing                                      │
│      │ • Complete documentation                                     │
│      │ • Integration testing                                        │
│      │ • Performance optimization                                   │
└─────────────────────────────────────────────────────────────────────┘
```

## Detailed Implementation Tasks

### Phase 1: Core Features

#### Week 1: MCP Integration

**Day 1-2**: Setup & Configuration
- [ ] Create `.opencode/mcp-servers.json` structure
- [ ] Implement MCP manager CLI (`scripts/mcp-manager.sh`)
- [ ] Test MCP loading mechanism

**Day 3-4**: Core MCPs
- [ ] Enable Context7 (documentation lookup)
- [ ] Enable Exa (web search)
- [ ] Enable Grep.app (GitHub search)

**Day 5**: Community MCPs
- [ ] Enable GitHub MCP (official integration)
- [ ] Enable Playwright (browser automation)
- [ ] Enable SQLite (local database)

**Deliverables**:
- ✅ MCP manager CLI working
- ✅ 6+ MCPs enabled and functional
- ✅ Documentation complete

#### Week 2: Enhanced Agents + LSP

**Day 1-2**: Agent Definitions
- [ ] Create Oracle agent definition
- [ ] Create Librarian agent definition
- [ ] Create Explore agent definition

**Day 3-4**: Agent Loader
- [ ] Update `agents/_core/load.bash`
- [ ] Add `--agent=omo:<name>` support
- [ ] Test agent loading

**Day 5**: LSP Integration
- [ ] Create `skills/with-lsp.md`
- [ ] Add LSP tools to agent context
- [ ] Test navigation and search

**Deliverables**:
- ✅ 3+ enhanced agents working
- ✅ LSP tools available to agents
- ✅ Integration with BMAD agents

### Phase 2: Workflow Features

#### Week 3: BMAD 4-Phase

**Day 1-2**: Phase System
- [ ] Create phase tracking system
- [ ] Implement phase validation logic
- [ ] Add phase commands to CLI

**Day 3-4**: Workflow Commands
- [ ] Create `blackbox3 phase` commands
- [ ] Implement workflow listing
- [ ] Add workflow search

**Day 5**: Documentation
- [ ] Document 4-phase methodology
- [ ] Create workflow examples
- [ ] Test with sample project

#### Week 4: Ralph + Background Tasks

**Day 1-2**: Ralph Wrapper
- [ ] Create `blackbox3-autonomous-loop.sh`
- [ ] Implement file conversion (BB3 ↔ Ralph)
- [ ] Test basic loop execution

**Day 3-4**: Background System
- [ ] Create `scripts/background-manager.sh`
- [ ] Implement task queue
- [ ] Add progress tracking

**Day 5**: Integration
- [ ] Integrate Ralph with Blackbox3
- [ ] Test autonomous execution
- [ ] Verify safety mechanisms

### Phase 3: Intelligence Layer

#### Week 5: Keyword Detection

**Day 1-2**: Detection System
- [ ] Implement keyword detector
- [ ] Create mode switching logic
- [ ] Add to core prompt

**Day 3-5**: Testing & Docs
- [ ] Test magic word detection
- [ ] Document keyword modes
- [ ] Create examples

#### Week 6: Session Management

**Day 1-3**: Session System
- [ ] Create `scripts/session-manager.sh`
- [ ] Implement session storage
- [ ] Add search functionality

**Day 4-5**: Integration
- [ ] Integrate with agent context
- [ ] Test cross-session search
- [ ] Document usage

### Phase 4: Optimization

#### Week 7: Compaction + Hooks

**Day 1-3**: Auto-Compaction
- [ ] Create `scripts/compaction-manager.sh`
- [ ] Implement context preservation
- [ ] Test token limit prevention

**Day 4-5**: Advanced Hooks
- [ ] Create hook configuration
- [ ] Implement hook scripts
- [ ] Test validation hooks

#### Week 8: Finalization

**Day 1-3**: Testing
- [ ] Integration testing
- [ ] Performance testing
- [ ] Bug fixes

**Day 4-5**: Documentation
- [ ] Complete all docs
- [ ] Create quick start guide
- [ ] Final review

## Resource Requirements

### Time Allocation

| Phase | Weeks | Hours/Week | Total Hours |
|-------|-------|------------|-------------|
| Phase 1 | 2 | 20 | 40 |
| Phase 2 | 2 | 20 | 40 |
| Phase 3 | 2 | 15 | 30 |
| Phase 4 | 2 | 15 | 30 |
| **Total** | **8** | **-** | **140** |

### Dependencies

| Dependency | Version | Required For | Installation |
|------------|---------|--------------|--------------|
| jq | Latest | MCP manager, config | brew install jq |
| Python | 3.8+ | Hook scripts | (usually pre-installed) |
| Claude Code | 2.0+ | Ralph, autonomous execution | npm install -g |
| git | Latest | Version control | (usually pre-installed) |

### Skills Required

- Bash scripting (CLI tools)
- YAML (agent definitions)
- Python (hook scripts)
- JSON (configuration)
- Git (version control)

## Success Metrics

### Phase 1 Complete When:
- [ ] At least 6 MCPs loadable and functional
- [ ] Omo agents load successfully
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
- [ ] Mode switching works automatically
- [ ] Documentation covers all features

### Phase 4 Complete When:
- [ ] Hooks execute reliably
- [ ] Auto-compaction prevents token limits
- [ ] All tests pass
- [ ] Performance acceptable

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| MCP integration issues | Medium | Low | Test each MCP individually |
| Agent loading failures | Low | Medium | Fall back to BMAD agents |
| Ralph dependency issues | Medium | Medium | Manual execution fallback |
| Performance degradation | Low | Medium | Monitor and optimize |
| Token limit issues | Medium | High | Auto-compaction at 85% |

## Quality Gates

### Before Phase Complete
- [ ] All tests passing
- [ ] No critical bugs
- [ ] Documentation complete
- [ ] Performance acceptable
- [ ] Integration verified

### Before Deployment
- [ ] Security review passed
- [ ] Performance tested
- [ ] User testing complete
- [ ] Rollback plan ready

## Documentation Deliverables

| Document | Phase | Status |
|----------|-------|--------|
| 00-QUICKSTART.md | Phase 1 | ✅ Complete |
| MCP Integration Guide | Phase 1 | ✅ Complete |
| Enhanced Agents Guide | Phase 1 | ✅ Complete |
| LSP Tools Guide | Phase 1 | ✅ Complete |
| BMAD 4-Phase Guide | Phase 2 | ⏳ Pending |
| Ralph Integration Guide | Phase 2 | ⏳ Pending |
| Background Tasks Guide | Phase 2 | ✅ Complete |
| Keyword Detection Guide | Phase 3 | ✅ Complete |
| Session Management Guide | Phase 3 | ✅ Complete |
| Hooks System Guide | Phase 4 | ✅ Complete |
| Auto-Compaction Guide | Phase 4 | ✅ Complete |
| MASTER-GUIDE.md | Phase 4 | ✅ Complete |

## Next Steps

1. **Review this roadmap** with team
2. **Assign resources** to each phase
3. **Begin Phase 1** - MCP Integration
4. **Iterate based on feedback**

---

**Document Status**: ✅ Complete  
**Next**: Risk Assessment (09-RISK-ASSESSMENT.md)
