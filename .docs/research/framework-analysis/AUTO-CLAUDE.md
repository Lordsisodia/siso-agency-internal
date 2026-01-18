# Auto-Claude Framework Analysis

> Repository: https://github.com/AndyMik90/Auto-Claude
> Version: 2.7.5 (Stable)
> Language: Python (backend), TypeScript/React (frontend)
> License: AGPL-3.0

## Executive Summary

Auto-Claude is a production-ready, multi-agent autonomous coding framework that builds software through coordinated AI agent sessions. It features a complete desktop application with Electron frontend, Python backend, and sophisticated security model.

**Key Strength**: Most complete and production-ready framework with desktop app, security layers, and full CI/CD pipeline.

## What It Does

Autonomous software development through a pipeline of specialized agents:

1. **Spec Creation** - Multi-phase pipeline (3-8 phases based on complexity)
2. **Implementation** - Planner → Coder → QA Reviewer → QA Fixer loop
3. **Validation** - Multi-stage QA with E2E testing capabilities
4. **Integration** - GitHub/GitLab/Linear integration for issue tracking

## Key Features

### 1. Spec-Driven Development

Multi-phase pipeline that adapts to task complexity:

- **SIMPLE** (3 phases): Discovery → Quick Spec → Validate
- **STANDARD** (6-7 phases): Discovery → Requirements → [Research] → Context → Spec → Plan → Validate
- **COMPLEX** (8 phases): Full pipeline with Research and Self-Critique phases

### 2. Security Model

Three-layer defense architecture:

- **OS Sandbox**: Bash command isolation
- **Filesystem Permissions**: Operations restricted to project directory
- **Command Allowlist**: Dynamic allowlist from project analysis

Cached in `.auto-claude-security.json`

### 3. Agent SDK Integration

Uses Claude Agent SDK exclusively (NOT Anthropic API directly):

```python
from core.client import create_client

client = create_client(
    project_dir=project_dir,
    spec_dir=spec_dir,
    model="claude-sonnet-4-5-20250929",
    agent_type="coder",
    max_thinking_tokens=None
)
```

### 4. Memory System

Graphiti memory integration (mandatory):
- Knowledge graph for cross-session context
- Multi-provider support (OpenAI, Anthropic, Azure, Ollama, Google AI)
- Session insights extraction
- Semantic search capabilities

### 5. E2E Testing

Electron MCP server for automated QA:
- Window management and screenshots
- UI interaction (click, fill, select)
- Page inspection and debugging
- Form verification
- Custom JavaScript execution

### 6. Desktop Application

Complete Electron app with:
- Kanban board for task management
- Agent terminals with context injection
- Roadmap planning with competitor analysis
- Insights chat interface
- Changelog generation

## Interesting Patterns

### 1. Complexity Assessment

AI-based complexity detection that adjusts pipeline depth:

```python
# Spec complexity determines phases
if complexity == "simple":
    phases = 3  # Discovery → Quick Spec → Validate
elif complexity == "standard":
    phases = 6-7  # Full pipeline
elif complexity == "complex":
    phases = 8  # + Research + Self-Critique
```

### 2. Git Worktree Strategy

Isolated builds with local branches:

```
main (user's branch)
└── auto-claude/{spec-name}  ← spec branch (isolated worktree)
```

Key principles:
- ONE branch per spec
- NO automatic pushes to GitHub
- User reviews in worktree before merge
- Final merge: spec branch → main (after approval)

### 3. Agent Specialization

Four distinct agent roles:

| Agent | Prompt | Responsibility |
|-------|--------|----------------|
| **Planner** | `planner.md` | Creates implementation plan with subtasks |
| **Coder** | `coder.md` | Implements individual subtasks |
| **QA Reviewer** | `qa_reviewer.md` | Validates acceptance criteria |
| **QA Fixer** | `qa_fixer.md` | Fixes QA-reported issues in loop |

### 4. Multi-Platform CI

Tests on all three platforms (Windows, macOS, Linux):

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
```

Platform-specific bugs were the #1 source of breakage, so they:
- Centralized platform abstractions in `platform/` modules
- Use feature detection over OS checks
- Test on all platforms before merging

### 5. Internationalization

Frontend uses `react-i18next` with strict rules:
- All user-facing text must use translation keys
- Translation files for all languages (en, fr, etc.)
- Namespace-based organization
- Interpolation support for dynamic content

## Architecture Highlights

### Backend Structure (Python)

```
apps/backend/
├── core/              # Client, auth, security
│   ├── client.py      # Claude SDK client factory
│   ├── security.py    # Dynamic command allowlisting
│   └── auth.py        # OAuth token management
├── agents/            # Agent implementations
│   ├── planner.py
│   ├── coder.py
│   ├── qa_reviewer.py
│   └── qa_fixer.py
├── spec_agents/       # Spec creation agents
│   ├── gatherer.py
│   ├── researcher.py
│   ├── writer.py
│   └── critic.py
├── integrations/      # External services
│   └── graphiti/      # Memory system
└── prompts/           # Agent system prompts
```

### Frontend Structure (Electron)

```
apps/frontend/
├── src/
│   ├── main/          # Electron main process
│   │   └── platform/  # Platform abstractions
│   └── shared/        # React application
│       ├── i18n/      # Translations
│       └── components/
└── package.json
```

## Potential Inspirations for BlackBox5

### 1. Complexity-Based Pipelines
Adaptive workflow depth based on task complexity:
- Simple tasks: Fast track
- Standard tasks: Full pipeline
- Complex tasks: Extended with research/critique

**Application**: BlackBox5 could adjust agent coordination complexity based on task assessment.

### 2. Security Layers
Multi-layer defense is essential for production systems:
- OS-level sandboxing
- Filesystem restrictions
- Dynamic command allowlisting

**Application**: Implement similar security model for BlackBox5 agent execution.

### 3. Agent SDK Abstraction
Clean separation between AI interactions and business logic:
- Single client factory
- Agent-specific permissions
- Session management
- MCP integration

**Application**: Create similar SDK abstraction layer for BlackBox5.

### 4. Platform Abstraction
Centralized platform-specific code prevents bugs:
- Single source of truth for OS differences
- Feature detection over OS checks
- Multi-platform CI

**Application**: Implement platform module for BlackBox5 to handle cross-platform differences.

### 5. Graphiti Memory
Knowledge graph for long-term context:
- Cross-session learning
- Semantic search
- Multi-provider support
- Session insights extraction

**Application**: Integrate Graphiti or similar memory system for BlackBox5.

### 6. E2E Testing
Automated UI testing via MCP:
- QA agents can interact with running app
- Screenshot-based verification
- Form testing
- Visual regression detection

**Application**: Implement E2E testing capabilities for BlackBox5 frontend changes.

## Lessons Learned

### What Works
1. **Spec-driven approach** - Clear requirements before implementation
2. **Isolated worktrees** - Safe parallel development
3. **Multi-stage QA** - Quality gate before merge
4. **Platform abstraction** - Prevents cross-platform bugs
5. **Memory system** - Agents learn from past sessions

### What to Avoid
1. **Direct API usage** - Use SDK abstractions instead
2. **Platform checks scattered** - Centralize in platform modules
3. **Manual platform testing** - Automate with multi-platform CI
4. **Hardcoded strings** - Use i18n for all user-facing text
5. **Automatic pushes** - User should control when code goes to remote

## Metrics & Stats

- **Current Version**: 2.7.5 (stable)
- **GitHub Stars**: Active development
- **Agent Types**: 4 (planner, coder, qa_reviewer, qa_fixer)
- **Pipeline Phases**: 3-8 (based on complexity)
- **Parallel Agents**: Up to 12 terminals
- **Security Layers**: 3 (sandbox, filesystem, allowlist)
- **Memory Providers**: 5 (OpenAI, Anthropic, Azure, Ollama, Google)

## Comparison to Other Frameworks

| Feature | Auto-Claude | Claudio | Agor | Gastown |
|---------|-------------|---------|------|---------|
| Desktop App | ✅ Electron | ❌ CLI/TUI | ✅ Web UI | ❌ CLI |
| Security Model | ✅ 3-layer | ❌ Basic | ❌ Basic | ❌ Basic |
| Memory System | ✅ Graphiti | ❌ None | ❌ Basic | ✅ Beads |
| Multi-Platform CI | ✅ All 3 | ❌ Basic | ❌ Basic | ❌ Basic |
| E2E Testing | ✅ MCP | ❌ None | ❌ None | ❌ None |
| Agent SDK | ✅ Native | ❌ Wrapper | ✅ Native | ❌ Wrapper |

## Key Files to Study

- `apps/backend/core/client.py` - SDK client factory
- `apps/backend/core/security.py` - Dynamic allowlisting
- `apps/backend/agents/planner.py` - Planning agent
- `apps/backend/integrations/graphiti/` - Memory system
- `apps/frontend/src/main/platform/` - Platform abstractions
- `apps/backend/prompts/` - Agent system prompts

## Further Reading

- [Auto-Claude Documentation](https://github.com/AndyMik90/Auto-Claude)
- [Claude Agent SDK](https://docs.anthropic.com/en/docs/build-with-claude/agent-sdk)
- [Graphiti Memory](https://github.com/getzephi/graphiti)

## Notes

- Licensed under AGPL-3.0 (copyleft - requires sharing modifications)
- Commercial licensing available for closed-source use
- Active community on Discord
- Comprehensive documentation and guides
- Production-ready with regular releases
