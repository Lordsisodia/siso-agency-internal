# The Simpsons Agent Suite

> User's custom agentic system built on The Simpsons characters
> Created: 2025-01-18
> Status: Active Development

## Overview

A suite of specialized AI agents inspired by The Simpsons characters, each designed with a specific cognitive approach to different types of problems. The system implements the concept of "Grounded Synthesis" - integrating knowledge bases (via NotebookLM) before execution.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cognitive Pipeline                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Grounded Synthesis                                      │
│     └── NotebookLM MCP integration                           │
│         └── Project docs, PDFs, whitepapers → Source of Truth│
│                                                              │
│  2. Agent Selection                                         │
│     └── Problem type → Specialized behavior                 │
│                                                              │
│  3. Execution Loop                                          │
│     └── Agent-specific logic until completion               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Agent Profiles

### L.I.S.A. - Lookup, Investigate, Synthesize, Act

**Role**: Research-First Development Engine

**Personality**: Analytical, thorough, evidence-based

**Best For**:
- Features requiring deep understanding
- Integration with external APIs/services
- Documentation-heavy development
- "I need to understand before I code"

**Cognitive Pattern**:
1. **Lookup**: Gather all relevant documentation
2. **Investigate**: Cross-reference sources via NotebookLM
3. **Synthesize**: Create mental model of requirements
4. **Act**: Implement with research-backed decisions

**Key Features**:
- NotebookLM MCP integration for knowledge grounding
- Research before implementation
- Evidence-based decision making
- Comprehensive context gathering

**Example Use Case**:
```bash
lisa-agent "Implement OAuth2 authentication with Google provider"
# Output:
# 1. Researches OAuth2 RFC and Google's implementation
# 2. Synthesizes best practices from security docs
# 3. Creates implementation plan with security considerations
# 4. Implements with documented rationale
```

---

### B.A.R.T. - Branch Alternative Retry Trees

**Role**: Creative Pivot & Branching Logic

**Personality**: Mischievous, experimental, thinks outside the box

**Best For**:
- Breaking through creative blocks
- Exploring alternative approaches
- Debugging stubborn issues
- "I'm stuck and need a different perspective"

**Cognitive Pattern**:
1. **Branch**: Spawn alternative approaches
2. **Alternative**: Try non-obvious solutions
3. **Retry**: Iterate on failures with variations
4. **Trees**: Maintain branching exploration paths

**Key Features**:
- Multiple parallel approaches to problems
- Creative problem-solving strategies
- Alternative path exploration
- Non-linear thinking patterns

**Example Use Case**:
```bash
bart-agent "Fix this memory leak that defies conventional debugging"
# Output:
# Branch 1: Standard profiling
# Branch 2: Monkey-patch Object.prototype
# Branch 3: Rewrite without external libraries
# → Selects most creative/effective solution
```

---

### M.A.R.G.E. - Maintain Adapters, Reconcile, Guard Execution

**Role**: Safety Guardian & System Reconciler

**Personality**: Protective, meticulous, safety-conscious

**Best For**:
- Merging complex systems
- Safety-critical refactors
- Integration between microservices
- "Multiple systems fighting each other"

**Cognitive Pattern**:
1. **Maintain**: Keep adapters between systems
2. **Reconcile**: Resolve conflicts between components
3. **Guard**: Protect against breaking changes
4. **Execute**: Safely integrate changes

**Key Features**:
- Conflict detection and resolution
- Safety checks before execution
- Adapter pattern implementation
- System integration focus

**Example Use Case**:
```bash
marge-agent "Reconcile these three microservices with conflicting schemas"
# Output:
# 1. Analyzes schema conflicts
# 2. Creates adapter layer
# 3. Implements safety checks
# 4. Merges with rollback protection
```

---

### H.O.M.E.R. - Harness Omni-Mode Execution Resources

**Role**: High-Throughput Parallel Processing

**Personality**: Enthusiastic, unstoppable, scales to any challenge

**Best For**:
- Massive codebase refactors
- Batch processing operations
- Parallel task execution
- "I need to process this entire codebase fast"

**Cognitive Pattern**:
1. **Harness**: Maximize available resources
2. **Omni-Mode**: Execute across multiple modes
3. **Execution**: Parallel processing pipelines
4. **Resources**: Optimize throughput

**Key Features**:
- Parallel batch operations
- Massive scale refactoring
- High-throughput processing
- Resource optimization

**Example Use Case**:
```bash
homer-agent "Refactor all components to TypeScript strict mode"
# Output:
# Spawns 10 parallel workers
# Processes 500+ components
# Completes in minutes vs hours
```

---

### R.A.L.P.H. - Retry And Loop Persistently until Happy

**Role**: Standard Autonomous Loop

**Personality**: Determined, persistent, never gives up

**Best For**:
- Standard development tasks
- Test-fix loops
- Straightforward implementations
- "Just keep trying until it passes"

**Cognitive Pattern**:
1. **Retry**: Attempt implementation
2. **And**: Continue on failure
3. **Loop**: Iterate until success
4. **Persistently**: Never give up
5. **until Happy**: Satisfaction condition

**Key Features**:
- Simple persistence loop
- Test-driven iteration
- Failure recovery
- Straightforward determination

**Example Use Case**:
```bash
ralph-agent "Add unit tests for the user service"
# Output:
# 1. Writes tests
# 2. Runs tests → fails
# 3. Fixes code
# 4. Runs tests → fails
# 5. Fixes more
# 6. Runs tests → passes ✓
# 7. Loops until 100% coverage
```

## Integration with Git Worktrees

All agents support git worktree-based isolation:

```
project/
├── main/
└── .worktrees/
    ├── lisa-feature-auth/
    ├── bart-fix-memory/
    ├── marge-reconcile-services/
    ├── homer-refactor-typescript/
    └── ralph-add-tests/
```

Each agent creates an isolated worktree for their task, preventing conflicts and enabling true parallel work.

## Integration with NotebookLM

The suite uses [NotebookLM MCP](https://github.com/PleasePrompto/notebooklm-mcp) for research grounding:

```python
# L.I.S.A. workflow with NotebookLM
1. User: "Implement feature X"
2. L.I.S.A. queries NotebookLM:
   - "What does our documentation say about X?"
   - "Are there existing patterns for X?"
   - "What are the best practices?"
3. NotebookLM returns synthesized knowledge
4. L.I.S.A. implements based on research
```

## Agent Selection Decision Tree

```
"What's blocking you?"

├── Need to understand before coding?
│   └── L.I.S.A. → Research first, then implement
│
├── Stuck on the same error repeatedly?
│   └── B.A.R.T. → Creative pivots and alternative paths
│
├── Multiple systems fighting each other?
│   └── M.A.R.G.E. → Reconcile and guard execution
│
├── Need to process massive codebase fast?
│   └── H.O.M.E.R. → Parallel batch operations
│
└── Simple task, just need persistence?
    └── R.A.L.P.H. → Loop until it works
```

## The Ralph Wiggum Plugin Extension

Inspired by the original [Ralph concept](https://ghuntley.com/ralph/) by Geoffrey Huntley and [snarktank/ralph](https://github.com/snarktank/ralph) implementation, this suite extends the pattern with specialized behaviors.

### Lineage

```
ghuntley.com/ralph (Concept)
        │
        ▼
snarktank/ralph (Amp CLI Implementation)
        │
        ▼
SimpleLLMs (Claude Code Extension)
    ├── R.A.L.P.H. ← Direct port of Ralph pattern
    ├── B.A.R.T.   ← + Creative pivot strategy
    ├── L.I.S.A.   ← + Research-first + NotebookLM
    ├── M.A.R.G.E. ← + Integration/cleanup focus
    └── H.O.M.E.R. ← + Parallel batch processing
```

## Team Coordination

Agents can work together on complex projects:

```bash
# Example: Complex feature development
lisa-agent "Research authentication patterns for our API"
# → Creates research document

bart-agent "Explore alternative auth implementations"
# → Prototypes 3 different approaches

marge-agent "Reconcile auth implementations and create unified adapter"
# → Merges best approaches safely

homer-agent "Apply auth pattern across all microservices"
# → Parallel implementation across 50+ services

ralph-agent "Add tests and fix any failures"
# → Test-fix loop until 100% passing
```

## Technical Implementation

### Repository Structure
Each agent is a separate repository:
- `lisa-agent` - Research-first development engine
- `bart-agent` - Creative pivot and branching logic
- `marge-agent` - Safety guardian and system reconciler
- `homer-agent` - High-throughput parallel processing
- `ralph-agent` - The original autonomous loop

### Installation

```bash
# Clone and install any agent
git clone https://github.com/midnightnow/lisa-agent.git
cd lisa-agent && ./install.sh
```

### Usage

```bash
# Research-first development
simplellms --lisa "Implement the new authentication service"

# Creative problem solving
simplellms --bart "Find a way around this dependency conflict"

# System integration
simplellms --marge "Reconcile these three microservices"

# Batch processing
simplellms --homer "Refactor all components to TypeScript strict mode"

# Standard persistence loop
simplellms --ralph "Add unit tests and fix failures"
```

## Key Insights from Research

### What Makes This Suite Effective

1. **Specialized Behaviors**: Each agent has a specific cognitive approach
2. **Grounded Synthesis**: Research before execution (via NotebookLM)
3. **Decision Tree**: Clear guidance on agent selection
4. **Personality-Driven**: Character traits inform problem-solving style
5. **Team Coordination**: Agents can work together on complex tasks

### Alignment with BlackBox5 Goals

This suite demonstrates:
- **Role-based agents** over general-purpose ones
- **Knowledge integration** via MCP (NotebookLM)
- **Persistent execution** with intelligent loops
- **Creative problem-solving** through alternative approaches
- **Safety consciousness** in system integration

### Potential Inspirations for BlackBox5

1. **Personat-driven prompts**: Character traits shape behavior
2. **Decision trees**: Clear agent selection logic
3. **Research grounding**: Knowledge base integration
4. **Specialized loops**: Different retry strategies
5. **Team coordination**: Multi-agent workflows

## References

- [SimpleLLMs GitHub](https://github.com/midnightnow/simplellms)
- [Original Ralph Concept](https://ghuntley.com/ralph/)
- [snarktank/ralph](https://github.com/snarktank/ralph)
- [NotebookLM MCP](https://github.com/PleasePrompto/notebooklm-mcp)
- [Geoffrey Huntley](https://ghuntley.com/)

## License

MIT - Use freely. Build faster. Loop with purpose.
