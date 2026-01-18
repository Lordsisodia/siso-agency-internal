# AutoMaker Framework Analysis

> Analysis Date: 2025-01-18
> Repository: https://github.com/AutoMaker-Org/automaker
> Version: Latest (analyzed)

## Executive Summary

AutoMaker is an **autonomous AI development studio** built as an npm workspace monorepo. It provides a Kanban-based workflow where AI agents (powered by Claude Agent SDK) implement features in isolated git worktrees. It's designed for **agentic coding** - where developers orchestrate AI agents rather than manually writing code.

## Core Philosophy

**"Stop typing code. Start directing AI agents."**

AutoMaker represents the future of software development where:
- Developers become architects directing AI agents
- AI agents handle implementation autonomously
- Features are described on Kanban boards
- Agents work in isolated environments (git worktrees)
- Real-time streaming shows progress

## Key Architectural Patterns

### 1. Monorepo Structure

```
automaker/
├── apps/
│   ├── ui/          # React + Vite + Electron frontend
│   └── server/      # Express + WebSocket backend
└── libs/            # Shared packages (@automaker/*)
    ├── types/
    ├── utils/
    ├── prompts/
    ├── platform/
    ├── model-resolver/
    ├── dependency-resolver/
    └── git-utils/
```

**Key Insight**: Clear separation of concerns with shared libraries following strict dependency hierarchy. Packages can only depend on packages above them in the chain.

### 2. Event-Driven Architecture

All server operations emit events that stream to the frontend via WebSocket:

```typescript
// Events created using createEventEmitter()
// Real-time updates to frontend
```

This enables:
- Real-time progress monitoring
- Live agent output streaming
- Instant status updates
- Multi-user collaboration potential

### 3. Git Worktree Isolation

**Critical Pattern**: Each feature executes in an isolated git worktree

```typescript
// Protects main branch during AI agent execution
// Enables parallel development
// Clean separation of concerns
```

Benefits:
- Main branch stays safe
- Multiple features can run in parallel
- Easy PR creation from worktrees
- Isolated testing environments

### 4. Context Files System

Project-specific rules stored in `.automaker/context/`:

```
.automaker/context/
├── CLAUDE.md              # Project rules
├── CODE_QUALITY.md        # Code standards
└── context-metadata.json  # File descriptions
```

**Key Innovation**: Context files are automatically loaded and prepended to agent prompts with clear descriptions of when to use each file.

### 5. File-Based Storage

No database required - uses JSON files:

```
.automaker/
├── features/{featureId}/
│   ├── feature.json
│   ├── agent-output.md
│   └── images/
├── context/
├── settings.json
└── spec.md
```

**Simplicity**: Easy to version control, inspect, and backup.

## Innovative Features

### 1. Kanban Workflow

Visual drag-and-drop board with stages:
- Backlog → In Progress → Waiting Approval → Verified

**Key**: AI agents automatically start when moved to "In Progress"

### 2. Planning Modes

Four levels of planning:
- **Skip**: Direct implementation (no plan)
- **Lite**: Quick plan
- **Spec**: Task breakdown
- **Full**: Phased execution with multi-agent tasks

**Innovation**: Plan approval required before implementation begins

### 3. Multi-Model Support

Per-feature model selection:
- Claude Opus (most capable)
- Claude Sonnet (balanced)
- Claude Haiku (fastest)

**Flexibility**: Choose the right model for each task

### 4. Extended Thinking

Enable thinking modes for complex problems:
- None
- Medium
- Deep
- Ultra

**Use Case**: Complex architectural decisions

### 5. Real-Time Streaming

Watch AI agents work in real-time:
- Tool usage visibility
- Progress updates
- Task completion status

**Transparency**: Full visibility into agent operations

### 6. Follow-up Instructions

Send additional instructions to running agents without stopping them

**Workflow**: Continuous refinement during execution

### 7. GitHub Integration

- Import issues
- Validate feasibility
- Convert to tasks automatically
- Create PRs from worktrees

**Integration**: Seamless workflow with GitHub

### 8. Dependency Graph

Visual feature dependencies with interactive graph

**Visualization**: See relationships between features

### 9. Docker Isolation

Security-focused deployment with no host filesystem access

**Security**: Recommended for production use

## Technology Stack

### Frontend
- **React 19** - Latest UI framework
- **Vite 7** - Fast build tool
- **Electron 39** - Desktop framework
- **TanStack Router** - File-based routing
- **Zustand 5** - State management
- **Tailwind CSS 4** - Styling (25+ themes)
- **dnd-kit** - Drag and drop
- **@xyflow/react** - Graph visualization
- **xterm.js** - Terminal emulator
- **CodeMirror 6** - Code editor

### Backend
- **Express 5** - HTTP server
- **WebSocket (ws)** - Real-time events
- **Claude Agent SDK** - AI integration
- **node-pty** - PTY sessions

### Testing
- **Playwright** - E2E testing
- **Vitest** - Unit testing

## Developer Experience

### 1. Interactive TUI Launcher

Beautiful terminal UI with:
- Gradient colors and ASCII art
- Interactive menu
- Memory of last choice
- Pre-flight checks
- 30-second timeout

### 2. Hot Module Replacement

Fast refresh during development with Vite

### 3. Comprehensive Documentation

- CLAUDE.md for AI agents
- CONTRIBUTING.md for developers
- Architecture guides
- Pattern documentation

### 4. Check-Sync Script

Automated workflow management:
- Dynamic RC branch detection
- Sync vs PR workflows
- Conflict resolution guidance

## Security Features

1. **Git Worktree Isolation** - Protects main branch
2. **Path Sandboxing** - Optional directory restriction
3. **Docker Isolation** - Recommended deployment
4. **Plan Approval** - Review before implementation
5. **API Key Storage** - Encrypted credentials

## Data Management

### Per-Project Data
- Stored in `.automaker/`
- Features, context, settings
- Version controlled

### Global Data
- Stored in `DATA_DIR`
- Settings, credentials, sessions
- Cross-project shared

## Unique Capabilities

### 1. Project Analysis

AI-powered codebase analysis to understand structure

### 2. Feature Suggestions

AI-generated feature ideas based on project analysis

### 3. Agent Chat

Interactive chat sessions for exploratory work

### 4. AI Profiles

Custom agent configurations with different prompts and models

### 5. Session History

Persistent conversations across restarts

### 6. Usage Tracking

Monitor Claude API usage with detailed metrics

## Lessons for BlackBox5

### What Works Well

1. **Monorepo Structure** - Clean package separation
2. **Event-Driven Architecture** - Real-time updates
3. **Git Worktree Isolation** - Safe parallel development
4. **Context Files** - Project-specific rules
5. **File-Based Storage** - Simplicity and transparency
6. **Kanban Workflow** - Visual task management
7. **Planning Modes** - Flexible control
8. **Real-Time Streaming** - Visibility into operations
9. **Multi-Model Support** - Right tool for the job
10. **GitHub Integration** - Seamless workflow

### Architectural Patterns to Adopt

1. **Shared Package Hierarchy** - Strict dependency layers
2. **Event Emitters** - Real-time communication
3. **Context Loader** - Dynamic prompt assembly
4. **Worktree Management** - Isolated execution
5. **File-Based Storage** - No database complexity
6. **Streaming Responses** - Live progress updates
7. **Approval Gates** - Human-in-the-loop
8. **Dependency Resolution** - Smart task ordering

### Innovative Ideas

1. **TUI Launcher** - Beautiful CLI experience
2. **Check-Sync Script** - Workflow automation
3. **Auto-Approve Plans** - Preview before execute
4. **Follow-up Instructions** - Continuous refinement
5. **Spec Mode** - Multi-agent task execution
6. **Feature Graph** - Visual dependencies
7. **Usage Dashboard** - Analytics and insights

## Potential Concerns

1. **Claude Agent SDK Dependency** - Tied to Anthropic
2. **File-Based Storage** - May not scale to enterprise
3. **No Database** - Limited querying capabilities
4. **Monorepo Complexity** - Requires npm workspace knowledge
5. **Docker Requirement** - Security needs isolation

## Summary

AutoMaker is a **pioneer in agentic coding** with excellent architectural patterns around:
- Monorepo organization
- Event-driven communication
- Isolated execution environments
- Context management
- Real-time streaming
- Visual workflows

Its **greatest strength** is the complete end-to-end workflow from feature definition to implementation with AI agents doing the heavy lifting while maintaining human control through approval gates.

**Most inspiring for BlackBox5**: The context files system, git worktree isolation, event-driven architecture, and the planning/approval workflow.
