# AI Agent Frameworks Research

Research repository for analyzing and learning from various AI agent frameworks, orchestration systems, and agentic coding tools.

> Last Updated: 2025-01-18
> Status: Active Research

## Overview

This repository contains cloned copies of various AI agent frameworks and orchestration systems for research purposes. The goal is to understand different approaches to building agentic systems, identify patterns, and extract insights that can inform the development of BlackBox5 and other agent systems.

## Repository Categories

### Agent Frameworks
Complete frameworks for building and managing AI agents.

| Framework | Language | Focus | Status |
|-----------|----------|-------|--------|
| **Auto-Claude** | Python/TypeScript | Autonomous multi-agent coding | Production-ready |
| **gastown** | Go | Multi-agent orchestration | Active development |
| **claudio** | Go | Parallel Claude instances | Stable |
| **agent-of-empires** | Rust | Terminal session manager | Stable |

### Workflow & Orchestration
Tools for managing agentic workflows and pipelines.

| Framework | Language | Focus | Status |
|-----------|----------|-------|--------|
| **agor** | TypeScript/Node | Multiplayer spatial canvas | Active |
| **simplellms** | TypeScript | Specialized agent behaviors | Concept |

### Development Tools
Tools for visual development and project management.

| Framework | Language | Focus | Status |
|-----------|----------|-------|--------|
| **onlook** | TypeScript/Next.js | Visual web development | Active |
| **ccpm** | Shell/TypeScript | Spec-driven project management | Production-ready |

### Context Engineering
Frameworks for memory, context management, and AI persistence.

| Framework | Language | Focus | Status |
|-----------|----------|-------|--------|
| **cognee** | Python | Knowledge graph + vector memory | Beta |
| **Awesome-Context-Engineering** | Markdown | Context engineering research | Active |

### Specifications
Standards and specifications for AI systems.

| Framework | Language | Focus | Status |
|-----------|----------|-------|--------|
| **OpenSpec** | TypeScript | Spec management system | Active |

### Reference Materials
System prompts and architectural references.

| Repository | Content | Purpose |
|------------|---------|---------|
| **CL4R1T4S** | System prompts | AI transparency |
| **system-prompts-and-models-of-ai-tools** | Model documentation | Prompt engineering |

## Quick Reference

### Agent Orchestration Patterns

| Pattern | Description | Examples |
|---------|-------------|----------|
| **Git Worktree Isolation** | Each agent works in isolated worktree | Auto-Claude, Claudio, Agor |
| **Spatial Canvas** | Visual board-based coordination | Agor, Onlook |
| **Terminal Multiplexing** | tmux-based session management | Agent of Empires, Gastown |
| **Convoy/Chaining** | Sequential task dependencies | Claudio, SimpleLLMs |
| **Persistent Hooks** | Git-backed state persistence | Gastown |
| **GitHub-Native** | Issues as task database | CCPM |

### Context Management Patterns

| Pattern | Description | Examples |
|---------|-------------|----------|
| **Knowledge Graph + Vector** | Hybrid semantic search | Cognee |
| **Spec-Driven** | Traceability from PRD to code | CCPM |
| **ECL Pipeline** | Extract-Cognify-Load | Cognee |
| **Bayesian Inference** | Probabilistic context selection | Awesome Context Engineering |
| **File-Based Context** | Persistent context files | Claudio, CCPM |

### Development Patterns

| Pattern | Description | Examples |
|---------|-------------|----------|
| **Visual Editing** | Direct DOM manipulation | Onlook |
| **Instrumentation** | Runtime code mapping | Onlook |
| **Containerization** | Isolated execution environments | Onlook, Auto-Claude |
| **Parallel Execution** | Multiple agents simultaneously | CCPM, Claudio |

### Key Architectural Decisions

#### 1. Workspace Isolation
- **Auto-Claude**: Uses spec worktrees with automatic cleanup
- **Claudio**: Per-instance worktrees with conflict detection
- **Agor**: Worktree-centric architecture with isolated environments
- **Gastown**: Hooks system for persistent state
- **CCPM**: Epic-level worktrees with GitHub sync

#### 2. Agent Communication
- **Agor**: WebSocket-based real-time collaboration
- **Gastown**: Mailboxes and bead passing system
- **Claudio**: Shared context files
- **Auto-Claude**: Agent SDK with MCP integration
- **CCPM**: GitHub Issues as collaboration protocol

#### 3. State Management
- **Gastown**: Git-backed hooks + Beads ledger
- **Auto-Claude**: Graphiti memory system
- **Claudio**: Session.json + context.md
- **Agor**: LibSQL database + FeathersJS
- **Cognee**: Knowledge graph + vector database
- **CCPM**: GitHub Issues + epic files

#### 4. Scalability Approaches
- **Claudio**: Parallel instances with TUI dashboard
- **Auto-Claude**: Up to 12 parallel terminals
- **Agor**: Multiplayer canvas with unlimited sessions
- **Gastown**: 20-30 agents with Mayor coordination
- **CCPM**: 5-8 parallel tasks per issue
- **Cognee**: Enterprise-scale with graph partitioning

## Common Patterns Across Frameworks

### 1. Git Worktree Usage
Every serious framework uses git worktrees for isolation:
- Prevents branch conflicts
- Enables true parallel work
- Easy cleanup without affecting main repo
- Each worktree = isolated development environment

### 2. Orchestrator Pattern
All frameworks have some form of coordinator:
- Auto-Claude: Planner agent
- Gastown: The Mayor
- Agor: Daemon + spatial canvas
- Claudio: Orchestrator layer
- SimpleLLMs: Agent selection logic
- CCPM: GitHub Issues + epic orchestrator

### 3. Quality Assurance Loop
- Auto-Claude: Multi-stage QA (reviewer + fixer)
- Claudio: Built-in validation
- Agor: Zone-based workflows
- Gastown: Convoys for tracking
- CCPM: Spec-driven with traceability

### 4. Context Management
- Shared context files (Claudio)
- Memory systems (Auto-Claude's Graphiti, Cognee)
- MCP integration (Auto-Claude, Agor)
- Beads/issue tracking (Gastown)
- Knowledge graphs (Cognee)
- GitHub Issues (CCPM)

### 5. Visual Development
- Onlook: Visual editor with code sync
- Agor: Spatial canvas for organization
- Containerization for isolation (Onlook, Auto-Claude)

## Integration Approaches

### Claude Code Integration
| Framework | Integration Method | Notes |
|-----------|-------------------|-------|
| Auto-Claude | Claude Agent SDK | Native integration |
| Claudio | CLI wrapper | Process-based |
| Agor | Agent SDK | Multi-provider |
| Gastown | CLI wrapper | Multi-runtime |
| Agent of Empires | tmux sessions | Runtime-agnostic |
| CCPM | GitHub-native | Issues as protocol |
| Cognee | Python library | Memory backend |

### MCP (Model Context Protocol) Usage
| Framework | MCP Integration | Use Cases |
|-----------|-----------------|-----------|
| Auto-Claude | Full | Graphiti, Linear, Electron, Puppeteer |
| Agor | Full | Internal Agor MCP service |
| Gastown | Partial | Beads integration |
| Claudio | None | Uses shared context instead |
| Onlook | Planned | MCP integration for tools |

### GitHub Integration
| Framework | GitHub Usage | Purpose |
|-----------|--------------|---------|
| CCPM | Full | Issues as database, collaboration protocol |
| Auto-Claude | Partial | PR workflows |
| OpenSpec | Full | Spec management, merge detection |

## Potential Inspirations for BlackBox5

### From Auto-Claude
- **Spec-driven development**: Multi-phase pipeline for feature creation
- **Security model**: Three-layer defense (sandbox, filesystem, allowlist)
- **Agent SDK integration**: Clean abstraction for AI interactions
- **E2E testing**: Electron MCP for automated QA

### From Agor
- **Spatial canvas**: Visual organization of agent work
- **Zone triggers**: Template-based workflow automation
- **Multiplayer**: Real-time collaboration features
- **Worktree environments**: Isolated dev environments per task

### From Gastown
- **The Mayor pattern**: AI coordinator for complex workflows
- **Beads integration**: Git-backed issue tracking
- **Persistent hooks**: State that survives crashes
- **MEOW workflow**: Mayor-Enhanced Orchestration Workflow

### From Claudio
- **UltraPlan mode**: Hierarchical 4-phase planning
- **TripleShot mode**: 3 parallel attempts with judge selection
- **Task chaining**: Dependency-based execution
- **Conflict detection**: File-level conflict awareness

### From SimpleLLMs
- **Specialized agents**: L.I.S.A., B.A.R.T., M.A.R.G.E., H.O.M.E.R., R.A.L.P.H.
- **Research grounding**: NotebookLM integration
- **Decision tree**: Agent selection based on problem type
- **Cognitive pipeline**: Grounded synthesis before execution

### From OpenSpec
- **Spec management**: Parallel development with merge detection
- **Delta language**: Structured change tracking
- **Fingerprinting**: Base version detection for conflict prevention
- **Scenario-level operations**: Fine-grained change tracking

### From Onlook
- **Visual development**: Direct DOM manipulation with code sync
- **Instrumentation**: Runtime element-to-code mapping
- **Containerization**: Isolated execution environments
- **Bidirectional sync**: Visual and code representations
- **Multi-provider AI**: Flexible LLM backend routing

### From CCPM
- **GitHub-Native workflow**: Issues as single source of truth
- **Spec-driven discipline**: No "vibe coding" - full traceability
- **Parallel execution**: Multiple agents per task (5-8x)
- **Context optimization**: Main thread stays strategic
- **Human-AI collaboration**: Seamless handoffs via GitHub
- **Epic management**: PRD → Epic → Task → Issue → Code

### From Cognee
- **ECL pipeline**: Extract-Cognify-Load (vs traditional RAG)
- **Knowledge graph + vector**: Hybrid semantic search
- **Multi-source ingestion**: 30+ data sources
- **Memory persistence**: Survives sessions
- **Modular pipelines**: Customizable for different use cases
- **Entity relationships**: Beyond text similarity

### From Awesome Context Engineering
- **Context as discipline**: Systematic approach to context
- **Bayesian inference**: Probabilistic context selection
- **Quality metrics**: Relevance, completeness, conciseness
- **Optimization techniques**: Pruning, ranking, summarization
- **Evaluation paradigms**: Measure context effectiveness

## Research Notes

### User's Agent Suite
See `.docs/research/user-agent-suite.md` for documentation on the custom agent suite built by the user, including:
- L.I.S.A. (Research)
- B.A.R.T. (Innovation)
- M.A.R.G.E. (Integration)
- H.O.M.E.R. (Scale)
- R.A.L.P.H. (Persistence)

### Context Engineering Comparison
See `.docs/research/CONTEXT-ENGINEERING-COMPARISON.md` for a comprehensive comparison of CCPM, Cognee, and Awesome Context Engineering, including:
- Detailed feature comparison
- Philosophy and approach
- Context management strategies
- Memory systems
- Optimization techniques
- Integration patterns
- Recommendations for BlackBox5

### Cross-Framework Analysis
See individual framework directories for detailed analysis:

- `.docs/research/frameworks/automaker/` - Previous framework analysis
- `.docs/research/frameworks/maestro/` - Previous framework analysis
- `.docs/research/agents/auto-claude/` - Multi-agent autonomous coding
- `.docs/research/agents/gastown/` - Multi-agent orchestration
- `.docs/research/agents/claudio/` - Parallel Claude instances
- `.docs/research/agents/agent-of-empires/` - Terminal session management
- `.docs/research/workflow/agor/` - Multiplayer spatial canvas
- `.docs/research/workflow/simplellms/` - Specialized agent behaviors
- `.docs/research/specifications/openspec/` - Spec management system

### New Framework Analyses
See `.docs/research/framework-analysis/` for detailed analyses of new frameworks:
- `onlook.md` - Visual development environment
- `ccpm.md` - Spec-driven project management
- `cognee.md` - Knowledge graph + vector memory
- `awesome-context-engineering.md` - Context engineering research

## Key Insights

### What Works Well
1. **Git worktrees for isolation** - Universal pattern
2. **Orchestrator pattern** - Single coordinator managing workers
3. **Visual dashboards** - TUI or web UI for monitoring
4. **Persistent state** - Survives crashes and restarts
5. **Security layers** - Multiple defense mechanisms
6. **GitHub integration** - Issues as collaboration protocol (CCPM)
7. **Knowledge graphs** - Semantic understanding beyond text (Cognee)
8. **Visual development** - Direct manipulation (Onlook)

### Common Challenges
1. **Conflict detection** - Hard to prevent parallel work collisions
2. **Context management** - Keeping agents aware of each other
3. **Scalability limits** - 10-30 agents is typical max
4. **Git integration** - Complex workflows with branches/PRs
5. **Cost management** - Token usage grows with agent count
6. **Memory persistence** - Maintaining context across sessions
7. **Visual-code mapping** - Keeping representations in sync

### Emerging Trends
1. **MCP as standard** - Model Context Protocol gaining adoption
2. **Spatial interfaces** - Visual canvases over text-based
3. **Multi-provider support** - Claude, Codex, Gemini
4. **Real-time collaboration** - Multiplayer features
5. **Specialized agents** - Role-based over general-purpose
6. **Context engineering** - From prompt engineering to context systems
7. **GitHub-native workflows** - Issues as database and protocol
8. **Hybrid memory systems** - Graph + vector approaches
9. **Visual development** - Direct manipulation with code sync
10. **Spec-driven development** - Full traceability from PRD to code

## Future Research Directions

1. **Hybrid approaches** - Combining best patterns from multiple frameworks
2. **Advanced conflict resolution** - CRDT-based merge strategies
3. **Enhanced memory** - Long-term agent learning systems (Cognee)
4. **Better observability** - Tracing and debugging multi-agent workflows
5. **Standard protocols** - Inter-framework communication standards
6. **Context optimization** - Systematic context engineering
7. **Visual development** - Spatial interfaces for agent management
8. **GitHub integration** - Issues as collaboration protocol
9. **Knowledge graphs** - Semantic understanding and reasoning
10. **Memory persistence** - Cross-session agent learning

## References

### Agent Frameworks
- [Auto-Claude GitHub](https://github.com/AndyMik90/Auto-Claude)
- [Gastown GitHub](https://github.com/steveyegge/gastown)
- [Claudio GitHub](https://github.com/Iron-Ham/claudio)
- [Agent of Empires GitHub](https://github.com/njbrake/agent-of-empires)

### Workflow & Orchestration
- [Agor GitHub](https://github.com/preset-io/agor)
- [SimpleLLMs GitHub](https://github.com/midnightnow/simplellms)

### Development Tools
- [Onlook GitHub](https://github.com/onlook-dev/onlook)
- [CCPM GitHub](https://github.com/automazeio/ccpm)

### Context Engineering
- [Cognee GitHub](https://github.com/topoteretes/cognee)
- [Awesome Context Engineering GitHub](https://github.com/Meirtz/Awesome-Context-Engineering)
- [Context Engineering Paper](https://arxiv.org/abs/2507.13334)

### Specifications
- [OpenSpec GitHub](https://github.com/Fission-AI/OpenSpec)

## Contributing

This is a research repository. To add new frameworks or update analysis:

1. Clone the repository to the appropriate category directory
2. Create an analysis document following the template
3. Update this README with the new entry
4. Update the quick reference tables

## License

This research repository contains code from various projects with different licenses. Refer to individual repository LICENSE files for specific terms.
