# Research Summary: AI Agent Frameworks

> Completed: 2025-01-18
> Total Frameworks Analyzed: 9
> Documentation Created: 8 documents

## What Was Done

Successfully cloned and analyzed 9 AI agent frameworks and orchestration systems:

### Cloned Repositories

**Agent Frameworks** (4):
1. **Auto-Claude** - Multi-agent autonomous coding (Python/TypeScript)
2. **Gastown** - Multi-agent orchestration with Mayor pattern (Go)
3. **Claudio** - Parallel Claude instances (Go)
4. **Agent of Empires** - Terminal session manager (Rust)

**Workflow & Orchestration** (2):
5. **Agor** - Multiplayer spatial canvas (TypeScript/Node)
6. **SimpleLLMs** - Specialized agent behaviors (TypeScript)

**Specifications** (1):
7. **OpenSpec** - Spec management system (TypeScript)

**Reference Materials** (2):
8. **CL4R1T4S** - System prompts collection
9. **system-prompts-and-models-of-ai-tools** - Model documentation

### Documentation Created

1. **README.md** - Overview with quick reference tables
2. **user-agent-suite.md** - Documentation of user's Simpsons-based agents
3. **framework-analysis/AUTO-CLAUDE.md** - Deep dive into Auto-Claude
4. **framework-analysis/GASTOWN.md** - Deep dive into Gastown
5. **framework-analysis/AGOR.md** - Deep dive into Agor
6. **CROSS-FRAMEWORK-ANALYSIS.md** - Comparative analysis
7. **RESEARCH-SUMMARY.md** - This document

## Key Findings

### Universal Patterns

1. **Git Worktree Isolation** - Every serious framework uses this
2. **Orchestrator Pattern** - Single coordinator managing workers
3. **Quality Assurance Loop** - Multi-stage validation
4. **Context Management** - Persistent shared state

### Unique Innovations

**Auto-Claude**:
- Complexity-based pipelines (3-8 phases)
- Three-layer security model
- E2E testing via Electron MCP
- Platform abstraction for cross-platform support

**Gastown**:
- The Mayor pattern (AI coordinator)
- Beads integration (git-backed issue tracking)
- Mailbox system for async communication
- Scales to 20-30 agents

**Agor**:
- Spatial canvas paradigm (Figma-like)
- Worktree-centric architecture
- Zone triggers for automation
- Isolated environments with unique ports
- Session genealogy (fork/spawn)

**Claudio**:
- UltraPlan mode (4-phase hierarchical planning)
- TripleShot mode (3 parallel attempts)
- Task chaining with dependencies
- File-level conflict detection

**SimpleLLMs**:
- Specialized agents (L.I.S.A., B.A.R.T., M.A.R.G.E., H.O.M.E.R., R.A.L.P.H.)
- Grounded synthesis via NotebookLM
- Decision tree for agent selection
- Personality-driven behaviors

### Architecture Comparisons

**State Management**:
- Best scaling: Gastown (git-backed hooks)
- Most flexibility: Agor (LibSQL database)
- Simplest: Claudio (session.json)

**Agent Communication**:
- Best for collaboration: Agor (WebSocket real-time)
- Best for scaling: Gastown (async mailboxes)
- Most reliable: Auto-Claude (Agent SDK)

**Security**:
- Only Auto-Claude has production-ready security model
- Other frameworks lack comprehensive security

## Recommendations for BlackBox5

### Must-Have Features

1. **Git Worktree Isolation** - Non-negotiable for parallel work
2. **Orchestrator Agent** - Single coordinator for complexity management
3. **Quality Assurance Loop** - Multi-stage validation
4. **Context Management** - Persistent across sessions

### Should-Have Features

1. **Security Model** - Three-layer defense from Auto-Claude
2. **Task Chaining** - Dependency-based execution
3. **Conflict Detection** - File-level awareness
4. **Specialized Agents** - Role-based behaviors

### Nice-to-Have Features

1. **Spatial Canvas** - Visual organization (from Agor)
2. **Complexity-Based Pipelines** - Adaptive workflow depth
3. **Mailbox System** - Async communication
4. **Session Genealogy** - Fork and spawn with visualization

### Architecture Recommendations

1. **Storage**: Git-backed (Gastown-style) for reliability
2. **Communication**: Async mailboxes for scalability
3. **UI**: Start with CLI/TUI, consider spatial canvas later
4. **Security**: Implement Auto-Claude's three-layer model
5. **Context**: Graphiti memory or similar knowledge graph
6. **Git Integration**: Worktree-per-task with automatic cleanup

## Anti-Patterns to Avoid

1. Scattered platform checks → Centralize in platform module
2. Automatic git pushes → User should control when to push
3. Hardcoded agent limits → Make it configurable
4. Synchronous communication → Blocks scalability
5. Manual worktree cleanup → Automate it

## Emerging Trends

1. **MCP as Standard** - Model Context Protocol gaining adoption
2. **Spatial Interfaces** - Visual over text-based
3. **Multi-Provider Support** - Claude, Codex, Gemini
4. **Real-Time Collaboration** - Multiplayer features
5. **Specialized Agents** - Role-based over general-purpose

## User's Agent Suite

Documented the user's custom agent system based on The Simpsons:
- **L.I.S.A.** - Research (Lookup, Investigate, Synthesize, Act)
- **B.A.R.T.** - Innovation (Branch Alternative Retry Trees)
- **M.A.R.G.E.** - Integration (Maintain Adapters, Reconcile, Guard Execution)
- **H.O.M.E.R.** - Scale (Harness Omni-Mode Execution Resources)
- **R.A.L.P.H.** - Persistence (Retry And Loop Persistently until Happy)

Key insights:
- Personality-driven prompts shape behavior
- Research grounding via NotebookLM
- Decision tree for agent selection
- Team coordination patterns

## Next Steps

### Immediate Actions

1. Read all framework analysis documents
2. Identify patterns relevant to BlackBox5
3. Prioritize features based on recommendations
4. Design architecture combining best practices

### Future Research

1. MCP integration patterns
2. Memory system alternatives
3. Production security best practices
4. Spatial UI design patterns
5. CRDT-based state management

## Repository Structure

```
.docs/research/
├── README.md                           # Overview and quick reference
├── user-agent-suite.md                 # User's Simpsons agents
├── CROSS-FRAMEWORK-ANALYSIS.md         # Comparative analysis
├── RESEARCH-SUMMARY.md                 # This document
├── framework-analysis/
│   ├── AUTO-CLAUDE.md                  # Auto-Claude deep dive
│   ├── GASTOWN.md                      # Gastown deep dive
│   └── AGOR.md                         # Agor deep dive
├── agents/
│   ├── auto-claude/                    # Cloned repository
│   ├── gastown/                        # Cloned repository
│   ├── claudio/                        # Cloned repository
│   └── agent-of-empires/               # Cloned repository
├── workflow/
│   ├── agor/                           # Cloned repository
│   └── simplellms/                     # Cloned repository
├── specifications/
│   └── openspec/                       # Cloned repository
└── reference/
    ├── CL4R1T4S/                       # Cloned repository
    └── system-prompts-and-models-of-ai-tools/  # Cloned repository
```

## Key Takeaways

1. **Git worktrees are universal** - Every production framework uses them
2. **Orchestrator pattern is essential** - Single coordinator manages complexity
3. **Security matters** - Auto-Claude is only one with production-ready model
4. **Persistence is key** - Git-backed storage scales best
5. **Specialization wins** - Role-based agents over general-purpose
6. **UI is differentiating** - Spatial canvas is most innovative
7. **Communication scales** - Async beats sync for multi-agent
8. **Automation reduces friction** - Zone triggers, formulas, templates

## Best Overall Frameworks

| Category | Winner | Why |
|----------|--------|-----|
| **Production Ready** | Auto-Claude | Complete security, CI/CD, desktop app |
| **Scalability** | Gastown | 20-30 agents with Mayor pattern |
| **Innovation** | Agor | Spatial canvas, zone triggers |
| **Simplicity** | Claudio | Clean TUI, easy to understand |
| **Specialization** | SimpleLLMs | Personality-driven agents |

## Final Recommendation

For BlackBox5 development, combine:
- **Auto-Claude's** security model and platform abstraction
- **Gastown's** persistence layer and Mayor pattern
- **Agor's** worktree-centric design and zone automation
- **SimpleLLMs'** specialized agent behaviors
- **Claudio's** task chaining and conflict detection

This hybrid approach leverages the best innovations from each framework while avoiding their individual limitations.

## Conclusion

The AI agent framework space is rapidly evolving with clear patterns emerging. This research provides a comprehensive foundation for making informed decisions about BlackBox5 architecture and features.

All documentation is in `.docs/research/` for ongoing reference.
