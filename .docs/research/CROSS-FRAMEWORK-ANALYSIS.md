# Cross-Framework Analysis

> Comparative analysis of AI agent frameworks and orchestration systems
> Created: 2025-01-18
> Frameworks Analyzed: Auto-Claude, Gastown, Agor, Claudio, Agent of Empires

## Executive Summary

After analyzing 9 different AI agent frameworks, several clear patterns emerge. This document synthesizes the common approaches, unique innovations, and best practices across all frameworks to inform the development of BlackBox5.

## Common Patterns

### 1. Git Worktree Isolation (Universal)

**Every serious framework uses git worktrees for isolation.**

| Framework | Worktree Strategy | Unique Approach |
|-----------|------------------|-----------------|
| Auto-Claude | Spec worktrees | One branch per spec, automatic cleanup |
| Claudio | Per-instance worktrees | Conflict detection, shared context |
| Agor | Worktree-centric | Worktrees as primary cards on boards |
| Gastown | Hooks system | Persistent state in worktrees |
| SimpleLLMs | Agent worktrees | Isolated per agent behavior |

**Why it works**:
- True parallel development without conflicts
- Easy cleanup without affecting main repo
- Each worktree = isolated dev environment
- Natural integration with git workflows

**Best Practices**:
- Create worktree on task start
- Delete worktree on task completion
- Use descriptive branch names
- Track worktree metadata separately

### 2. Orchestrator Pattern

**All frameworks have some form of coordinator.**

| Framework | Coordinator | Implementation |
|-----------|-------------|----------------|
| Auto-Claude | Planner Agent | Python agent with planning prompt |
| Gastown | The Mayor | Go-based coordinator with full context |
| Agor | Daemon | FeathersJS server with services |
| Claudio | Orchestrator | Go layer managing instances |
| SimpleLLMs | Decision Tree | Agent selection logic |

**Common Responsibilities**:
- Break down high-level goals
- Spawn and manage workers
- Track progress and status
- Handle failures and retries
- Summarize results

**Best Practices**:
- Single source of truth for state
- Clear communication protocol
- Progress visibility
- Error recovery mechanisms

### 3. Quality Assurance Loop

**Multi-stage validation before completion.**

| Framework | QA Approach | Stages |
|-----------|-------------|--------|
| Auto-Claude | Multi-stage QA | Reviewer → Fixer (loop) |
| Claudio | Built-in validation | Status checks |
| Agor | Zone-based workflows | Analyze → Develop → Review → Deploy |
| Gastown | Convoy tracking | Bead completion verification |

**Common Elements**:
- Validation criteria defined upfront
- Automated testing where possible
- Fix loops until passing
- Human review for critical changes

### 4. Context Management

**All frameworks need to manage shared context.**

| Framework | Context Strategy | Storage |
|-----------|------------------|---------|
| Auto-Claude | Graphiti memory | Knowledge graph |
| Claudio | Shared context files | `context.md` |
| Agor | Database + MCP | LibSQL + HTTP endpoint |
| Gastown | Beads + Hooks | Git-backed |
| SimpleLLMs | NotebookLM | External MCP |

**Best Practices**:
- Persistent across sessions
- Searchable and queryable
- Easy to update
- Version controlled

## Unique Innovations by Framework

### Auto-Claude

1. **Complexity-Based Pipelines**
   - Adapts pipeline depth (3-8 phases) based on task complexity
   - SIMPLE (3), STANDARD (6-7), COMPLEX (8)
   - No other framework does this

2. **Three-Layer Security**
   - OS Sandbox + Filesystem Permissions + Command Allowlist
   - Most comprehensive security model
   - Production-ready approach

3. **E2E Testing via MCP**
   - Electron MCP server for automated UI testing
   - QA agents can interact with running app
   - Screenshots, form testing, visual verification

4. **Platform Abstraction**
   - Centralized platform-specific code
   - Prevents cross-platform bugs
   - Multi-platform CI requirement

### Gastown

1. **The Mayor Pattern**
   - First framework with dedicated coordinator agent
   - AI agent with full workspace context
   - MEOW workflow (Mayor-Enhanced Orchestration)

2. **Beads Integration**
   - Git-backed issue tracking
   - Structured data with unique IDs
   - Formula-based workflows

3. **Mailbox System**
   - Async agent communication
   - Mayor injects tasks into mailboxes
   - Agents check mail on startup

4. **20-30 Agent Scaling**
   - Proven approach to large-scale coordination
   - Convoys for work tracking
   - Handoffs for work transfer

### Agor

1. **Spatial Canvas Paradigm**
   - Figma-like board organization
   - Drag-and-drop interface
   - Zone-based automation
   - First framework to use spatial UI

2. **Worktree-Centric Architecture**
   - Worktrees as primary cards (not sessions)
   - Multiple sessions per worktree
   - Linked to GitHub issues/PRs

3. **Isolated Environments**
   - Unique ports per worktree
   - Auto-managed start/stop
   - Health monitoring
   - No port conflicts

4. **Session Genealogy**
   - Fork and spawn with tree visualization
   - Track session relationships
   - Explore alternatives

5. **Internal MCP Service**
   - HTTP endpoint for agent communication
   - Agents can query board state
   - Enables agent-to-agent coordination

### Claudio

1. **UltraPlan Mode**
   - Hierarchical 4-phase planning
   - Automatic parallel execution
   - No other framework has this

2. **TripleShot Mode**
   - 3 parallel attempts per task
   - Judge selects best result
   - Competitive approach

3. **Task Chaining**
   - Dependency-based execution
   - `--depends-on` flag
   - Automatic ordering

4. **Conflict Detection**
   - File-level conflict awareness
   - Warns when instances modify same files
   - Prevents data loss

### SimpleLLMs

1. **Specialized Agent Behaviors**
   - L.I.S.A. (Research)
   - B.A.R.T. (Innovation)
   - M.A.R.G.E. (Integration)
   - H.O.M.E.R. (Scale)
   - R.A.L.P.H. (Persistence)

2. **Grounded Synthesis**
   - NotebookLM integration
   - Research before execution
   - Knowledge base grounding

3. **Decision Tree**
   - Clear agent selection guidance
   - Problem type → Agent choice
   - Reduces decision paralysis

## Architectural Comparisons

### State Management

| Framework | Primary Storage | Persistence | Scalability |
|-----------|----------------|-------------|-------------|
| Auto-Claude | Graphiti + Files | In-memory + Disk | Medium |
| Gastown | Git Hooks | Git (permanent) | High (20-30) |
| Agor | LibSQL Database | Database | High (unlimited) |
| Claudio | Session.json | File | Medium (10+) |
| SimpleLLMs | Worktrees | Git | Low (5) |

**Insight**: Git-backed storage (Gastown) scales best and is most reliable. Database (Agor) offers most flexibility. Files (Claudio) are simplest.

### Agent Communication

| Framework | Communication Method | Async? | Multiplayer? |
|-----------|---------------------|--------|--------------|
| Auto-Claude | Agent SDK | Yes | No |
| Gastown | Mailboxes | Yes | No |
| Agor | WebSocket | Yes | Yes |
| Claudio | Context files | No | No |
| SimpleLLMs | Direct | No | No |

**Insight**: Real-time communication (Agor) enables collaboration but adds complexity. Async (Gastown) scales better.

### Git Integration

| Framework | Git Strategy | Branches | Worktrees | Cleanup |
|-----------|--------------|----------|-----------|---------|
| Auto-Claude | Spec-based | Local only | Yes | Auto |
| Gastown | Hooks-based | Local + remote | Yes | Manual |
| Agor | Worktree-linked | GitHub sync | Yes | Manual |
| Claudio | Per-instance | Local only | Yes | Manual |
| SimpleLLMs | Per-agent | Local only | Yes | Manual |

**Insight**: Automatic cleanup (Auto-Claude) is best user experience. GitHub linking (Agor) best for teams.

### Security Model

| Framework | Sandboxing | Filesystem | Commands | Monitoring |
|-----------|-----------|------------|----------|------------|
| Auto-Claude | ✅ OS-level | ✅ Restricted | ✅ Allowlist | ✅ Full |
| Gastown | ❌ None | ❌ None | ❌ None | ❌ Basic |
| Agor | ❌ None | ❌ None | ❌ None | ❌ Basic |
| Claudio | ❌ None | ❌ None | ❌ None | ❌ Basic |
| SimpleLLMs | ❌ None | ❌ None | ❌ None | ❌ Basic |

**Insight**: Only Auto-Claude has production-ready security. This is a gap in other frameworks.

## Performance & Scalability

### Parallel Execution

| Framework | Max Parallel | Overhead | Coordination |
|-----------|--------------|----------|--------------|
| Auto-Claude | 12 terminals | Medium | Planner |
| Gastown | 20-30 agents | Low | Mayor |
| Agor | Unlimited | Medium | Daemon |
| Claudio | 10+ instances | Low | Orchestrator |
| SimpleLLMs | 5 agents | Low | Manual |

**Insight**: Gastown scales best with 20-30 agents. Agor has highest potential but needs more testing.

### Resource Usage

| Framework | Memory | CPU | Disk | Network |
|-----------|--------|-----|------|---------|
| Auto-Claude | High | Medium | Medium | Low |
| Gastown | Low | Low | Low | None |
| Agor | Medium | Medium | Medium | High (WebSocket) |
| Claudio | Medium | Low | Low | None |
| SimpleLLMs | Medium | Medium | Medium | Low |

**Insight**: Gastown is most lightweight. Agor has highest network overhead due to real-time features.

## Recommendations for BlackBox5

### Must-Have Features (Based on Universal Patterns)

1. **Git Worktree Isolation**
   - Every task gets isolated worktree
   - Automatic cleanup on completion
   - Descriptive branch naming

2. **Orchestrator Agent**
   - Single coordinator for all agents
   - Full workspace context
   - Progress tracking and reporting

3. **Quality Assurance Loop**
   - Multi-stage validation
   - Automated testing where possible
   - Fix loops until passing

4. **Context Management**
   - Persistent across sessions
   - Searchable and queryable
   - Version controlled

### Should-Have Features (Based on Best Practices)

1. **Security Model** (from Auto-Claude)
   - Three-layer defense
   - OS sandboxing
   - Command allowlisting

2. **Task Chaining** (from Claudio)
   - Dependency-based execution
   - Automatic ordering
   - Visual dependency graph

3. **Conflict Detection** (from Claudio)
   - File-level awareness
   - Warn before conflicts
   - Prevent data loss

4. **Specialized Agents** (from SimpleLLMs)
   - Role-based behaviors
   - Clear selection criteria
   - Personality-driven prompts

### Nice-to-Have Features (Based on Unique Innovations)

1. **Spatial Canvas** (from Agor)
   - Visual organization
   - Zone-based automation
   - Drag-and-drop interface

2. **Complexity-Based Pipelines** (from Auto-Claude)
   - Adaptive workflow depth
   - Simple (3), Standard (6), Complex (8)
   - AI-based complexity assessment

3. **Mailbox System** (from Gastown)
   - Async communication
   - Task injection
   - Handoff support

4. **Session Genealogy** (from Agor)
   - Fork and spawn
   - Tree visualization
   - Alternative exploration

### Architecture Recommendations

1. **Storage**: Git-backed (Gastown-style) for reliability
2. **Communication**: Async mailboxes (Gastown-style) for scalability
3. **UI**: Start with CLI/TUI, consider spatial canvas later
4. **Security**: Implement Auto-Claude's three-layer model
5. **Context**: Graphiti memory or similar knowledge graph
6. **Git Integration**: Worktree-per-task with automatic cleanup

### Anti-Patterns to Avoid

1. **Scattered platform checks** - Centralize in platform module
2. **Automatic git pushes** - User should control when to push
3. **Hardcoded agent limits** - Make it configurable
4. **Synchronous communication** - Blocks scalability
5. **Manual worktree cleanup** - Automate it

## Emerging Trends

### Across All Frameworks

1. **MCP as Standard** - Model Context Protocol gaining adoption
2. **Spatial Interfaces** - Visual over text-based
3. **Multi-Provider Support** - Claude, Codex, Gemini
4. **Real-Time Collaboration** - Multiplayer features
5. **Specialized Agents** - Role-based over general-purpose

### Future Directions

1. **CRDT-Based Merge** - Conflict-free replication
2. **Enhanced Memory** - Long-term agent learning
3. **Better Observability** - Tracing and debugging
4. **Standard Protocols** - Inter-framework communication
5. **Advanced Security** - Sandboxing and isolation

## Conclusion

The AI agent framework space is rapidly evolving with clear patterns emerging:

**Universal**: Git worktrees, orchestrator pattern, QA loops, context management
**Differentiating**: UI paradigms, security models, communication protocols, scalability approaches

**Best Overall**: Auto-Claude for production readiness, Gastown for scalability, Agor for innovation

**For BlackBox5**: Combine Auto-Claude's security, Gastown's persistence, Agor's worktree-centric design, and SimpleLLMs' specialized agents.

## Key Takeaways

1. **Git worktrees are non-negotiable** - Every serious framework uses them
2. **Orchestrator pattern is universal** - Single coordinator manages complexity
3. **Security matters** - Auto-Claude is only one with production-ready model
4. **Persistence is key** - Git-backed storage scales best
5. **Specialization wins** - Role-based agents over general-purpose
6. **UI is differentiating** - Spatial canvas is most innovative
7. **Communication scales** - Async beats sync for multi-agent
8. **Automation reduces friction** - Zone triggers, formulas, templates

## Further Research

- **MCP Integration Pattern** - How to standardize Model Context Protocol
- **Memory Systems** - Graphiti vs alternatives
- **Security Best Practices** - Production sandboxing
- **Spatial UI Patterns** - Beyond Figma-like boards
- **CRDT for State** - Conflict-free replication
