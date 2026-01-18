# Maestro Framework Analysis

> Analysis Date: 2025-01-18
> Repository: https://github.com/pedramamini/Maestro
> Version: Latest (analyzed)

## Executive Summary

Maestro is a **cross-platform desktop app for orchestrating fleets of AI agents and projects**. It's a high-velocity solution for hackers juggling multiple projects in parallel, designed for power users who live on the keyboard. Think of it as a **multi-agent IDE** with Linear/Superhuman-level responsiveness.

## Core Philosophy

**"Maestro hones fractured attention into focused intent."**

Maestro is the **conductor of your AI orchestra** - coordinating multiple AI agents across multiple projects with:
- Keyboard-first interface
- Parallel agent execution
- Real-time collaboration
- Mobile remote control
- Batch automation

## Key Architectural Patterns

### 1. Dual-Process Architecture

Each session runs **two processes simultaneously**:

```typescript
interface Session {
  aiPid: number;              // AI agent process (suffixed -ai)
  terminalPid: number;        // Terminal process (suffixed -terminal)
  inputMode: 'ai' | 'terminal';  // Which process receives input
}
```

**Key Innovation**: Seamless switching between AI and terminal modes without process restarts.

### 2. IPC Security Model

Strict context isolation with `contextBridge`:

```typescript
window.maestro = {
  settings: { get, set, getAll },
  process: { spawn, write, interrupt, kill },
  git: { status, diff, branches, worktreeInfo, createPR },
  agents: { detect, get, getConfig },
  // ... minimal, secure API
}
```

**Security**: Renderer has no Node.js access, only exposed API via preload script.

### 3. Layer Stack System

Centralized modal/overlay management with predictable Escape key handling:

```typescript
const MODAL_PRIORITIES = {
  CONFIRM: 1000,           // Highest
  QUICK_ACTION: 700,       // Cmd+K palette
  SETTINGS: 450,
  GIT_DIFF: 200,
  FILE_TREE_FILTER: 30,    // Lowest
};
```

**Problem Solved**: 9+ scattered Escape handlers → single global handler with priority system.

### 4. Process Manager

Handles two process types:

**PTY Processes** (via `node-pty`):
- Terminal sessions with full shell emulation
- Supports resize, ANSI escape codes
- Interactive shell (zsh, bash, fish)

**Child Processes** (via `child_process.spawn`):
- AI assistants (Claude Code, OpenAI Codex, OpenCode)
- Direct stdin/stdout/stderr capture
- **Security**: Uses `spawn()` with `shell: false`

### 5. Custom Hooks (15 hooks)

Maestro uses **extensive custom hooks** for state management:

| Hook | Purpose |
|------|---------|
| `useSettings` | Application settings with persistence |
| `useSessionManager` | Sessions and groups CRUD |
| `useFileTreeManagement` | File tree refresh/filter |
| `useBatchProcessor` | Auto Run batch execution |
| `useLayerStack` | Modal/overlay management |
| `useNavigationHistory` | Back/forward navigation |
| `useAtMentionCompletion` | File reference autocomplete |
| `useTabCompletion` | Terminal-style completion |
| `useAchievements` | Gamification system |
| `useActivityTracker` | Idle detection |

**Pattern**: Consistent hook-based architecture for all complex state.

## Innovative Features

### 1. Git Worktrees

**Game-changing feature**: Run AI agents in parallel on isolated branches

```typescript
// Create worktree sub-agents from git branch menu
// Work interactively in main repo while agents process independently
// Create PRs with one click
```

**Benefits**:
- True parallel development
- No conflicts
- Isolated testing
- Easy PR creation

### 2. Auto Run & Playbooks

**File-system-based task runner** that batch-processes markdown checklists:

```typescript
// Playbooks: Repeatable workflows
// Loop mode: Continuous execution
// Progress tracking: Full history
// Each task gets fresh AI session
```

**Architecture**:
- Documents stored as markdown files
- Checkbox tasks processed sequentially
- Each task = clean conversation context
- Git worktree support for isolation
- Asset folder support (configs, scripts, Dockerfiles)

### 3. Group Chat

**Multi-agent coordination** with moderator AI:

```
User → Moderator → Routes to agents → Agents respond → Moderator synthesizes
```

**Flow**:
1. User sends message with @mentions
2. Moderator routes to mentioned agents
3. Agents work in parallel
4. Moderator reviews responses
5. Either @mentions again (loop) OR returns to user (done)

**Key**: Moderator controls flow, can go back and forth with agents until satisfied.

### 4. Mobile Remote Control

**Built-in web server** with QR code access:

```typescript
// Local network access
// Cloudflare tunnel for remote access
// Monitor and control all agents from phone
// Progressive Web App (PWA)
```

**Features**:
- Session list
- Message input
- Auto Run status
- Command history
- WebSocket communication
- Offline queue

### 5. CLI Tool

Full CLI for headless operation:

```bash
maestro list-agents
maestro list-playbooks
maestro run-playbook <id> --format jsonl
```

**Use Cases**:
- Cron job automation
- CI/CD integration
- Batch processing
- Scripting

### 6. Multi-Agent Management

Run **unlimited agents and terminal sessions** in parallel:
- Each agent has own workspace
- Separate conversation history
- Isolated context
- Concurrent execution

### 7. Message Queueing

Queue messages while AI is busy:
- Sent automatically when agent becomes ready
- Never lose a thought
- Visual queue indicator
- Cancel pending items

### 8. Keyboard-First Design

Full keyboard control:
- `Cmd+K` - Quick actions
- `Cmd+N` - New agent
- `Cmd+J` - Switch AI/Terminal
- `Cmd+[ / Cmd+]` - Previous/Next agent
- `Alt+Cmd+T` - Tab switcher

**Mastery Tracking**: Rewards for leveling up keyboard usage.

### 9. Session Discovery

Automatically discovers and imports existing sessions:
- All supported providers
- Conversations from before Maestro was installed
- Browse, search, star, rename
- Resume any session

### 10. Theme System

12 beautiful themes:
- Dracula, Monokai, Nord, Tokyo Night
- GitHub Light, Solarized
- Custom theme builder
- Inline styles for theme colors (not Tailwind)

## Architecture Deep Dive

### Main Process (Node.js)

```
src/main/
├── index.ts              # Entry, IPC handlers, window management
├── process-manager.ts    # PTY + child process spawning
├── web-server.ts         # Fastify server for mobile
├── agent-detector.ts     # Auto-detect CLI tools
├── tunnel-manager.ts     # Cloudflare tunnel management
├── parsers/              # Agent output parsers
├── storage/              # Session storage implementations
└── group-chat/           # Multi-agent coordination
```

### Renderer Process (React)

```
src/renderer/
├── components/           # UI components
├── hooks/                # 15 custom hooks
├── services/             # IPC wrappers (git.ts, process.ts)
├── contexts/             # LayerStackContext, ToastContext
├── constants/            # Themes, shortcuts, priorities
└── utils/                # Frontend utilities
```

### Web/Mobile Interface

```
src/web/
├── mobile/               # Mobile-optimized components
├── components/           # Shared web components
├── hooks/                # Web-specific hooks
└── public/               # PWA assets (manifest, icons, service worker)
```

## Data Storage

### File-Based (electron-store)

**Locations**:
- macOS: `~/Library/Application Support/maestro/`
- Windows: `%APPDATA%/maestro/`
- Linux: `~/.config/maestro/`

**Files**:
- `maestro-settings.json` - User preferences
- `maestro-sessions.json` - Session persistence
- `maestro-groups.json` - Session groups
- `maestro-agent-configs.json` - Per-agent config
- `group-chats/{chatId}/` - Group chat data

### Claude Sessions API

Browse and resume Claude Code sessions from `~/.claude/projects/`:

```typescript
// List sessions
window.maestro.claude.listSessions(projectPath)

// Read messages with pagination
window.maestro.claude.readSessionMessages(projectPath, sessionId, { offset, limit })

// Search sessions
window.maestro.claude.searchSessions(projectPath, query, 'all')

// Get global stats with streaming
window.maestro.claude.getGlobalStats()
```

## Advanced Features

### 1. Usage Dashboard

Comprehensive analytics:
- Multiple time ranges (day, week, month, year, all time)
- Agent performance comparison
- User vs. Auto Run distribution
- Activity heatmaps
- CSV export
- Real-time updates
- Colorblind-friendly palettes

**Backend**: SQLite database (better-sqlite3) with WAL mode

### 2. Document Graph

Visual knowledge graph of markdown documentation:
- Discovers `[[wiki-links]]` and `[markdown](links)`
- Interactive nodes and edges
- Force-directed and hierarchical layouts
- Search/filter documents
- Keyboard navigation
- Mini-map and legend
- Real-time file watching

### 3. Achievement System

Gamification with conductor-themed badges:
- 15 levels (Apprentice → Transcendent Maestro)
- Based on cumulative Auto Run time
- Standing ovation overlay with confetti
- Share functionality

### 4. Execution Queue

Sequential message processing:
- Prevents race conditions
- Write operations queue sequentially
- Read-only operations run in parallel
- Visual queue indicator
- Cancel pending items

### 5. SSH Remote Sessions

Execute commands on remote hosts:
- Two SSH identifiers (different lifecycles)
- Remote directory browsing
- Git operations on remote
- File system access

### 6. Custom AI Commands

User-defined prompt macros:
```typescript
{
  command: '/review',
  description: 'Review staged changes',
  prompt: 'Review the staged git changes...',
  aiOnly: true
}
```

**Template Variables**: `{{date}}`, `{{time}}`, `{{cwd}}`, `{{session}}`, `{{agent}}`

## Technology Stack

### Frontend
- **React** - UI framework
- **Electron** - Desktop app
- **xterm.js** - Terminal emulator
- **Fastify** - Web server (main process)

### Backend
- **Node.js** - Runtime
- **node-pty** - PTY sessions
- **better-sqlite3** - Stats database
- **chokidar** - File watching
- **ws** - WebSocket

### Testing
- **Playwright** - E2E tests
- **Vitest** - Unit tests

## Security Features

1. **Context Isolation** - No Node.js in renderer
2. **Safe Command Execution** - `execFileNoThrow` utility
3. **No Shell Injection** - Never use shell-based execution
4. **Preload Script** - Minimal API exposure
5. **Layer Stack** - Predictable focus management

## Developer Experience

### 1. Comprehensive Documentation

- CLAUDE.md - Quick reference
- ARCHITECTURE.md - Deep technical details
- CLAUDE-PATTERNS.md - Implementation patterns
- CLAUDE-FEATURES.md - Feature documentation
- CLAUDE-AGENTS.md - Agent integration guide
- CONTRIBUTING.md - Development setup

### 2. Progressive Disclosure

Documentation split into focused documents for different needs.

### 3. Error Handling Patterns

Clear patterns for each layer:
- **IPC Handlers**: Throw critical, catch optional
- **Services**: Never throw, safe defaults
- **Components**: Try-catch async, show UI errors
- **Hooks**: Internal catch, expose error state

## Lessons for BlackBox5

### What Works Well

1. **Dual-Process Architecture** - Seamless AI/terminal switching
2. **Layer Stack System** - Predictable modal management
3. **Custom Hooks** - Consistent state management pattern
4. **Git Worktrees** - True parallel development
5. **Auto Run System** - File-based automation
6. **Group Chat** - Multi-agent coordination
7. **Mobile Remote** - Anywhere access
8. **Keyboard-First** - Power user experience
9. **Session Discovery** - Automatic import
10. **Achievement System** - Gamification

### Architectural Patterns to Adopt

1. **Context Isolation** - Security through preload script
2. **Event Emitters** - Real-time communication
3. **Safe Command Execution** - No shell injection
4. **Hook-Based State** - Consistent patterns
5. **Priority System** - Layered modals
6. **Dual-Process Sessions** - Flexible modes
7. **File-Based Storage** - Simple and transparent
8. **Documentation Split** - Progressive disclosure

### Innovative Ideas

1. **Tab Hover Overlay Menu** - Context operations (400ms delay)
2. **Message Queueing** - Never lose thoughts
3. **Worktree Integration** - Isolated batch execution
4. **Playbook Assets** - Support non-markdown files
5. **Moderator Pattern** - Multi-agent orchestration
6. **Usage Dashboard** - Analytics with SQLite
7. **Document Graph** - Visual knowledge mapping
8. **SSH Remote** - Execute on remote hosts
9. **Custom Commands** - User-defined macros
10. **Achievement System** - Gamify engagement

### Unique Capabilities

1. **Multi-Agent Tabs** - Separate conversations per tab
2. **Read-Only Mode** - Prevent accidental input
3. **Auto-Save** - Drafts saved per session
4. **Audio Notifications** - Text-to-speech alerts
5. **Cost Tracking** - Token usage per session
6. **Output Filtering** - Search AI responses
7. **Slash Commands** - Extensible command system
8. **Template Variables** - Dynamic prompt expansion

## Potential Concerns

1. **Electron Complexity** - Heavy resource usage
2. **Session Management** - Complex state handling
3. **Multi-Agent Coordination** - Moderator complexity
4. **File-Based Storage** - May not scale
5. **SQLite Stats** - Separate database system
6. **SSH Complexity** - Two identifier confusion

## Summary

Maestro is a **power user's dream** for managing multiple AI agents across multiple projects with:

**Greatest Strengths**:
- Multi-agent orchestration (Group Chat)
- Parallel execution (Git Worktrees)
- Automation (Auto Run + Playbooks)
- Remote control (Mobile + CLI)
- Keyboard-first workflow
- Comprehensive documentation

**Most Inspiring for BlackBox5**:
- Layer stack system for modal management
- Auto Run file-based automation
- Group chat multi-agent coordination
- Hook-based state management
- Git worktree integration
- Session discovery and persistence

Maestro excels at **orchestration and coordination** of AI agents, making it ideal for power users managing complex workflows across multiple projects.
