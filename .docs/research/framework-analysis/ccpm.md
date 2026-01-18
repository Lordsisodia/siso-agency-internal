# CCPM - Context Management and Parallel Execution Analysis

> Framework: Claude Code PM (CCPM)
> Category: Development Tools / Context Engineering
> Research Date: 2025-01-18
> Repository: https://github.com/automazeio/ccpm
> License: MIT
> Creator: Automaze (aroussi)

## Executive Summary

CCPM (Claude Code Project Manager) is a spec-driven development workflow that transforms product requirements into production code through GitHub Issues, Git worktrees, and parallel AI agent execution. It emphasizes "No Vibe Coding" - every line of code must trace back to a specification.

**Key Differentiator**: GitHub Issues as single source of truth + parallel agent execution with full traceability from PRD to production.

---

## What It Does

### Core Capabilities

1. **Spec-Driven Development**
   - PRD (Product Requirements Document) creation through guided brainstorming
   - Epic planning with technical specifications
   - Task decomposition with acceptance criteria
   - Full audit trail from idea to code

2. **GitHub-Native Workflow**
   - Issues as database and collaboration layer
   - Real-time progress updates via comments
   - Human-AI handoffs through issue state
   - Multi-agent coordination through GitHub

3. **Parallel Execution**
   - Multiple agents working simultaneously
   - Worktree-based isolation
   - Context optimization per agent
   - Conflict-free concurrent development

4. **Context Management**
   - Persistent context across sessions
   - Epic-level context preservation
   - Intelligent context loading
   - Incremental synchronization

---

## Key Features

### 1. Five-Phase Discipline

```
1. Brainstorm → Think deeper than comfortable
2. Document  → Write specs that leave nothing to interpretation
3. Plan      → Architect with explicit technical decisions
4. Execute   → Build exactly what was specified
5. Track     → Maintain transparent progress at every step
```

### 2. PRD to Epic Pipeline

```bash
/pm:prd-new feature-name      # Create PRD through brainstorming
/pm:prd-parse feature-name    # Transform to technical epic
/pm:epic-decompose feature    # Break into tasks
/pm:epic-sync feature         # Push to GitHub
/pm:issue-start 1234          # Begin execution
```

### 3. Parallel Agent System

**Traditional Approach:**
- Epic with 3 issues
- Sequential execution

**CCPM Approach:**
- Same epic with 3 issues
- Each issue splits into ~4 parallel streams
- **12 agents working simultaneously**

### 4. GitHub as Collaboration Protocol

**True Team Collaboration:**
- Multiple Claude instances work on same project
- Humans see AI progress in real-time
- Team members can jump in anywhere
- Managers get transparency without interrupting

**Seamless Human-AI Handoffs:**
- AI starts task, human finishes (or vice versa)
- Progress visible to everyone
- Code reviews through PR comments
- No "what did the AI did?" meetings

---

## Technical Approach

### Architecture

```
.claude/
├── CLAUDE.md          # Always-on instructions
├── agents/            # Task-oriented agents
├── commands/          # Command definitions
│   ├── context/       # Context management
│   ├── pm/            # Project management
│   └── testing/       # Testing commands
├── context/           # Project-wide context files
├── epics/             # Local workspace (gitignored)
│   └── [epic-name]/
│       ├── epic.md    # Implementation plan
│       ├── [#].md     # Individual task files
│       └── updates/   # Work-in-progress updates
├── prds/              # PRD files
└── scripts/           # Utility scripts
```

### Workflow Phases

#### 1. Product Planning
```bash
/pm:prd-new feature-name
```
- Comprehensive brainstorming
- Captures vision, user stories, success criteria
- Output: `.claude/prds/feature-name.md`

#### 2. Implementation Planning
```bash
/pm:prd-parse feature-name
```
- Technical implementation plan
- Architectural decisions
- Technical approach
- Dependency mapping
- Output: `.claude/epics/feature-name/epic.md`

#### 3. Task Decomposition
```bash
/pm:epic-decompose feature-name
```
- Concrete, actionable tasks
- Acceptance criteria
- Effort estimates
- Parallelization flags
- Output: `.claude/epics/feature-name/[task].md`

#### 4. GitHub Synchronization
```bash
/pm:epic-sync feature-name
/pm:epic-oneshot feature-name  # Decompose + sync in one command
```
- Push epic and tasks to GitHub
- Appropriate labels and relationships
- Parent-child issue tracking

#### 5. Execution
```bash
/pm:issue-start 1234    # Launch specialized agent
/pm:issue-sync 1234     # Push progress updates
/pm:next                # Get next priority task
```

### Context Optimization

**Traditional single-thread approach:**
- Main conversation carries ALL implementation details
- Context window fills with schemas, APIs, UI components
- Eventually hits limits and loses coherence

**Parallel agent approach:**
- Main thread stays clean and strategic
- Each agent handles its own context in isolation
- Implementation details never pollute main conversation
- Main thread maintains oversight without drowning in code

---

## How Parallel Execution Works

### Issue Explosion

One "Implement user authentication" issue isn't one task. It's:

```
Agent 1: Database tables and migrations
Agent 2: Service layer and business logic
Agent 3: API endpoints and middleware
Agent 4: UI components and forms
Agent 5: Test suites and documentation
```

All running **simultaneously** in the same worktree.

### The Command Flow

```bash
# Analyze what can be parallelized
/pm:issue-analyze 1234

# Launch the swarm
/pm:epic-start memory-system
# Watch the magic
# 12 agents working across 3 issues
# All in: ../epic-memory-system/

# One clean merge when done
/pm:epic-merge memory-system
```

### GitHub vs Local: Perfect Separation

**What GitHub Sees:**
- Clean, simple issues
- Progress updates
- Completion status

**What Actually Happens Locally:**
- Issue #1234 explodes into 5 parallel agents
- Agents coordinate through Git commits
- Complex orchestration hidden from view

GitHub doesn't need to know HOW the work got done – just that it IS done.

---

## Potential Inspirations for BlackBox5

### 1. Spec-Driven Development
- **Multi-phase pipeline**: PRD → Epic → Task → Issue → Code
- **Full traceability**: Every decision documented
- **No "vibe coding"**: Explicit requirements for all work

### 2. GitHub-Native Architecture
- **Issues as database**: No separate project management tool
- **Comments as audit trail**: All history visible
- **Labels as organization**: Easy filtering and reporting

### 3. Parallel Agent Execution
- **Worktree isolation**: Each agent in isolated environment
- **Context optimization**: Main thread stays strategic
- **Conflict-free coordination**: Agents work on different aspects

### 4. Context Management
- **Epic-level context**: Shared across all tasks
- **Persistent context**: Survives sessions and restarts
- **Incremental sync**: Update when ready, not continuously

### 5. Human-AI Collaboration
- **Seamless handoffs**: Anyone can pick up any task
- **Transparency**: Progress visible to all
- **Flexibility**: AI and humans work side-by-side

---

## Unique Patterns

### 1. GitHub Issues as Single Source of Truth
- No separate database or project management tool
- Issue state = project state
- Comments = audit trail
- Labels = organization

### 2. Parallel Agent Orchestration
- Main thread as conductor, not orchestra
- Agents handle implementation details
- Coordination through Git commits
- Hidden complexity from GitHub

### 3. File Naming Convention
- Tasks start as `001.md`, `002.md`
- After GitHub sync: `{issue-id}.md` (e.g., `1234.md`)
- Easy navigation: issue #1234 = file `1234.md`

### 4. Local-First, Sync-Later
- All operations on local files first (speed)
- Explicit synchronization with GitHub
- Bidirectional sync when ready
- Can work offline

---

## Strengths

1. **Full traceability**: PRD → Epic → Task → Issue → Code → Commit
2. **Parallel execution**: 5-8 parallel tasks vs 1 previously
3. **GitHub-native**: Works with existing tools
4. **Context preservation**: 89% less time lost to context switching
5. **Quality focus**: 75% reduction in bug rates
6. **Speed**: Up to 3x faster feature delivery
7. **Scalability**: Multiple agents, multiple humans
8. **Transparency**: All progress visible

---

## Limitations

1. **GitHub dependency**: Requires GitHub (no GitLab/Bitbucket)
2. **Setup complexity**: Initial configuration required
3. **Learning curve**: Understanding the workflow
4. **Command-heavy**: Many commands to learn
5. **Overhead**: May be excessive for small projects

---

## Proven Results

Teams using CCPM report:
- **89% less time** lost to context switching
- **5-8 parallel tasks** vs 1 previously
- **75% reduction** in bug rates
- **Up to 3x faster** feature delivery

---

## Command Reference

### Initial Setup
- `/pm:init` - Install dependencies and configure GitHub

### PRD Commands
- `/pm:prd-new` - Launch brainstorming for new requirement
- `/pm:prd-parse` - Convert PRD to implementation epic
- `/pm:prd-list` - List all PRDs
- `/pm:prd-edit` - Edit existing PRD
- `/pm:prd-status` - Show PRD implementation status

### Epic Commands
- `/pm:epic-decompose` - Break epic into task files
- `/pm:epic-sync` - Push epic and tasks to GitHub
- `/pm:epic-oneshot` - Decompose and sync in one command
- `/pm:epic-list` - List all epics
- `/pm:epic-show` - Display epic and tasks
- `/pm:epic-close` - Mark epic as complete
- `/pm:epic-edit` - Edit epic details
- `/pm:epic-refresh` - Update epic progress from tasks

### Issue Commands
- `/pm:issue-show` - Display issue and sub-issues
- `/pm:issue-status` - Check issue status
- `/pm:issue-start` - Begin work with specialized agent
- `/pm:issue-sync` - Push updates to GitHub
- `/pm:issue-close` - Mark issue as complete
- `/pm:issue-reopen` - Reopen closed issue
- `/pm:issue-edit` - Edit issue details

### Workflow Commands
- `/pm:next` - Show next priority issue with epic context
- `/pm:status` - Overall project dashboard
- `/pm:standup` - Daily standup report
- `/pm:blocked` - Show blocked tasks
- `/pm:in-progress` - List work in progress

### Sync Commands
- `/pm:sync` - Full bidirectional sync with GitHub
- `/pm:import` - Import existing GitHub issues

### Maintenance Commands
- `/pm:validate` - Check system integrity
- `/pm:clean` - Archive completed work
- `/pm:search` - Search across all content

---

## Research Questions

1. **Scaling limits**: How many parallel agents before coordination overhead dominates?
2. **Conflict resolution**: How to handle merge conflicts in parallel work?
3. **Enterprise adoption**: What's needed for large teams?
4. **Alternative platforms**: Could this work with GitLab/Bitbucket?
5. **AI provider flexibility**: How to switch between Claude, GPT-4, etc.?

---

## Comparison to Similar Tools

| Feature | CCPM | Linear | Jira | GitHub Projects |
|---------|------|--------|------|-----------------|
| Spec-driven | Yes | Partial | No | No |
| GitHub-native | Yes | Integration | Integration | Native |
| Parallel agents | Yes | No | No | No |
| PRD creation | Yes | No | No | No |
| AI-focused | Yes | No | No | No |
| Context management | Yes | No | No | No |
| Open source | Yes | No | No | No |

---

## Integration Opportunities

### For BlackBox5

1. **Spec-Driven Skills**
   - Every skill requires explicit specification
   - Traceability from requirement to implementation
   - No "vibe coding"

2. **GitHub Integration**
   - Issues as task tracking
   - PRs as deliverables
   - Comments as communication

3. **Parallel Execution**
   - Multiple agents working on different skills
   - Worktree isolation per skill
   - Context optimization

4. **Context Management**
   - Epic-level context for complex features
   - Persistent context across sessions
   - Incremental updates

---

## References

- **Repository**: https://github.com/automazeio/ccpm
- **Creator**: https://twitter.com/aroussi
- **Company**: https://automaze.io
- **Installation**: https://automaze.io/ccpm/install
- **Awesome Claude Code**: Mentioned in awesome list

---

## Conclusion

CCPM demonstrates that **GitHub Issues can serve as a powerful collaboration protocol for AI-assisted development**. Its spec-driven approach ensures full traceability, while parallel agent execution dramatically increases velocity. The separation between local complexity (parallel agents) and GitHub simplicity (clean issues) is particularly elegant.

**Key Takeaway**: The future of AI-assisted development may be **GitHub-native workflows** where issues serve as both task tracker and coordination protocol, with AI handling the complexity locally and exposing simple, transparent progress updates to the team.

The **"No Vibe Coding"** principle is especially relevant - as AI systems become more powerful, the risk of agents making assumptions increases. Explicit specifications and full traceability become essential, not optional.
