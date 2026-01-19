# Ralph Runtime - Documentation

**Autonomous Agent Loop for Blackbox5**

---

## What Is Ralph?

Ralph is an **autonomous coding agent** that:

1. Reads a PRD (Product Requirements Document) with user stories
2. Picks the highest priority incomplete story
3. Executes that story using Blackbox5 agents
4. Runs quality checks (tests, lint, typecheck)
5. Commits changes if checks pass
6. Updates progress with learnings
7. Repeats until all stories complete

**Key innovation:** Each iteration gets fresh context, but accumulates learnings in `progress.txt`.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  RALPH AUTONOMOUS LOOP                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 1. Load PRD and progress                       │  │
│  │ 2. Pick highest priority incomplete story        │  │
│  │ 3. Select appropriate agent                      │  │
│  │ 4. Execute story via agent                       │  │
│  │ 5. Run quality checks                            │  │
│  │ 6. Commit if checks pass                         │  │
│  │ 7. Update PRD (passes=true)                      │  │
│  │ 8. Document learnings to progress.txt            │  │
│  │ 9. Repeat until all stories complete             │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              BLACKBOX5 AGENT SYSTEM                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │  Coder   │  │Researcher│  │Architect │  ...     │
│  └──────────┘  └──────────┘  └──────────┘          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 MCP TOOL INTEGRATIONS                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │  GitHub  │  │Playwright│  │  Brain   │  ...     │
│  └──────────┘  └──────────┘  └──────────┘          │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Start

### 1. Create a PRD File

```json
{
  "branchName": "feature/my-feature",
  "userStories": [
    {
      "id": "US-001",
      "title": "Add user authentication",
      "priority": 1,
      "passes": false,
      "agent": "coder",
      "tools": ["write_code"],
      "context": {
        "description": "Implement login and registration"
      }
    },
    {
      "id": "US-002",
      "title": "Add tests for authentication",
      "priority": 2,
      "passes": false,
      "agent": "tester",
      "tools": ["test", "write_code"],
      "context": {
        "description": "Test authentication flows"
      }
    },
    {
      "id": "US-003",
      "title": "Document authentication API",
      "priority": 3,
      "passes": false,
      "agent": "writer",
      "tools": [],
      "context": {
        "description": "Write API documentation"
      }
    }
  ]
}
```

### 2. Start Ralph

```bash
# Navigate to your workspace
cd /path/to/project

# Run Ralph
.blackbox5/engine/runtime/ralph/start-ralph.sh 100
```

### 3. Watch It Work

```
======================================================================
 Ralph Autonomous Loop - Session a1b2c3d4
======================================================================
Workspace: /path/to/project
Max Iterations: 100

✓ Loaded 3 stories from PRD
✓ Branch: feature/my-feature

──────────────────────────────────────────────────────────────
 Iteration 1/100
──────────────────────────────────────────────────────────────

📋 Story: US-001
   Title: Add user authentication
   Priority: 1
   Agent: coder
   Selected Agent: CoderAgent

   → Executing...
   ✓ Execution complete
   Files changed: 3

   → Running quality checks...
   ✓ Tests passed
   ✓ Lint passed

   → Committing changes...
   Files to commit: auth.py, models.py, views.py
   ✓ Commit ready

✓ Completed: US-001 - Add user authentication

──────────────────────────────────────────────────────────────
 Iteration 2/100
──────────────────────────────────────────────────────────────

📋 Story: US-002
   Title: Add tests for authentication
   Priority: 2
   Agent: tester
   ...

(continues until all stories complete)
```

---

## PRD Format

### Required Fields

```json
{
  "branchName": "feature/branch-name",
  "userStories": [...]
}
```

### User Story Fields

```json
{
  "id": "US-001",
  "title": "Story title",
  "priority": 1,
  "passes": false,
  "agent": "coder",
  "tools": ["write_code", "github"],
  "context": {
    "description": "Detailed description",
    "files": ["file1.py", "file2.py"],
    "requirements": ["req1", "req2"]
  }
}
```

**Fields:**
- `id` (required): Unique story identifier
- `title` (required): Human-readable title
- `priority` (required): 1-10 (1 = highest)
- `passes` (required): Completion status
- `agent` (optional): Which agent to use
- `tools` (optional): Tools/checks to run
- `context` (optional): Additional context

---

## Available Agents

### Coder Agent
**Best for:** Writing code, implementing features
```json
{
  "agent": "coder",
  "tools": ["write_code", "read_code"]
}
```

### Researcher Agent
**Best for:** Finding information, documentation
```json
{
  "agent": "researcher",
  "tools": ["web_search", "read_docs"]
}
```

### Architect Agent
**Best for:** Design, planning, structure
```json
{
  "agent": "architect",
  "tools": ["analyze_structure", "create_plan"]
}
```

### Writer Agent
**Best for:** Documentation, README
```json
{
  "agent": "writer",
  "tools": []
}
```

### Tester Agent
**Best for:** Testing, validation
```json
{
  "agent": "tester",
  "tools": ["test", "lint", "typecheck"]
}
```

---

## Available Tools

### Development Tools
- `write_code` - Write/create code files
- `read_code` - Read existing code
- `github` - GitHub operations (commit, PR, issues)

### Testing Tools
- `test` - Run test suite
- `lint` - Run linter
- `typecheck` - Run type checker

### Research Tools
- `web_search` - Search the web
- `read_docs` - Read documentation
- `brain_query` - Query brain system

### UI Tools
- `playwright` - Browser automation
- `screenshot` - Take screenshots

---

## Progress Tracking

### progress.txt Format

```markdown
# Ralph Progress Log
# Started: 2026-01-18 10:00:00
# Session: a1b2c3d4

## Codebase Patterns
# (Patterns added as discovered)

## 2026-01-18 10:05:00 - US-001
Story: Add user authentication

Implemented:
  - auth.py (created)
  - models.py (modified)
  - views.py (modified)

Learnings:
  - Uses JWT for authentication
  - Middleware pattern for route protection
  - Store tokens in httpOnly cookies

Thread: https://amp.example.com/thread/123

---
```

---

## Quality Checks

Ralph runs quality checks before committing:

### Test
```bash
pytest                    # Python
npm test                  # JavaScript
yarn test                 # JavaScript
```

### Lint
```bash
eslint                     # JavaScript/TypeScript
flake8                     # Python
ruff check                 # Python
```

### Type Check
```bash
pyright                   # Python
mypy                      # Python
tsc --noEmit              # TypeScript
```

---

## Examples

### Example 1: Refactor Code

```json
{
  "branchName": "refactor/cleanup",
  "userStories": [
    {
      "id": "REFACTOR-001",
      "title": "Extract duplicate code into utility function",
      "priority": 1,
      "passes": false,
      "agent": "architect",
      "context": {
        "files": ["file1.py", "file2.py"],
        "issue": "Duplicate code across multiple files"
      }
    },
    {
      "id": "REFACTOR-002",
      "title": "Update files to use new utility",
      "priority": 2,
      "passes": false,
      "agent": "coder",
      "tools": ["write_code", "read_code"]
    },
    {
      "id": "REFACTOR-003",
      "title": "Run tests to verify refactoring",
      "priority": 3,
      "passes": false,
      "agent": "tester",
      "tools": ["test"]
    }
  ]
}
```

### Example 2: Improve UI

```json
{
  "branchName": "ui/improvements",
  "userStories": [
    {
      "id": "UI-001",
      "title": "Analyze current UI component structure",
      "priority": 1,
      "passes": false,
      "agent": "analyst",
      "tools": ["read_code"]
    },
    {
      "id": "UI-002",
      "title": "Design improved component organization",
      "priority": 2,
      "passes": false,
      "agent": "architect",
      "tools": ["brain_query"]
    },
    {
      "id": "UI-003",
      "title": "Reorganize components",
      "priority": 3,
      "passes": false,
      "agent": "coder",
      "tools": ["write_code", "move_files"]
    },
    {
      "id": "UI-004",
      "title": "Verify UI works in browser",
      "priority": 4,
      "passes": false,
      "agent": "tester",
      "tools": ["playwright", "screenshot"]
    }
  ]
}
```

### Example 3: Add Feature

```json
{
  "branchName": "feature/user-dashboard",
  "userStories": [
    {
      "id": "FEATURE-001",
      "title": "Design dashboard layout",
      "priority": 1,
      "passes": false,
      "agent": "architect",
      "tools": []
    },
    {
      "id": "FEATURE-002",
      "title": "Implement dashboard components",
      "priority": 2,
      "passes": false,
      "agent": "coder",
      "tools": ["write_code"]
    },
    {
      "id": "FEATURE-003",
      "title": "Write dashboard documentation",
      "priority": 3,
      "passes": false,
      "agent": "writer",
      "tools": []
    },
    {
      "id": "FEATURE-004",
      "title": "Test dashboard functionality",
      "priority": 4,
      "passes": false,
      "agent": "tester",
      "tools": ["test", "playwright"]
    }
  ]
}
```

### Example 4: Fix Bug

```json
{
  "branchName": "bugfix/login-error",
  "userStories": [
    {
      "id": "BUGFIX-001",
      "title": "Investigate login failure",
      "priority": 1,
      "passes": false,
      "agent": "analyst",
      "tools": ["read_code", "github"],
      "context": {
        "issue": "Users cannot login with valid credentials"
      }
    },
    {
      "id": "BUGFIX-002",
      "title": "Fix authentication logic",
      "priority": 2,
      "passes": false,
      "agent": "coder",
      "tools": ["write_code"]
    },
    {
      "id": "BUGFIX-003",
      "title": "Verify fix works",
      "priority": 3,
      "passes": false,
      "agent": "tester",
      "tools": ["test", "playwright"]
    },
    {
      "id": "BUGFIX-004",
      "title": "Close GitHub issue",
      "priority": 4,
      "passes": false,
      "agent": "coordinator",
      "tools": ["github"]
    }
  ]
}
```

---

## Integration with Blackbox5

### Agents

Ralph uses Blackbox5's agent system:

```python
from blackbox5.engine.agents.core.AgentLoader import AgentLoader

loader = AgentLoader()
agents = await loader.load_all()

# Select agent based on story
agent = agents.get(story.agent)
result = await agent.execute(story)
```

### Event Bus

Ralph publishes events to the event bus:

```python
from blackbox5.engine.core import get_event_bus

event_bus = get_event_bus()
event_bus.publish("ralph.iteration.start", {
    "iteration": iteration,
    "story_id": story.id
})
```

### Brain System

Ralph can query the brain for context:

```python
from blackbox5.engine.brain.api import BrainAPI

brain = BrainAPI()
context = brain.query("How do we structure components?")
```

### MCP Tools

Ralph can use MCP integrations:

```python
from blackbox5.engine.integrations import (
    GitHubMCP,
    PlaywrightMCP,
    FilesystemMCP
)

# Use GitHub MCP to commit
github = GitHubMCP()
github.commit(message, files)

# Use Playwright to test UI
playwright = PlaywrightMCP()
playwright.navigate(url)
playwright.screenshot()
```

---

## Stopping Conditions

Ralph stops when:

1. **All stories complete** - All stories have `passes: true`
2. **Max iterations reached** - Hit iteration limit
3. **Fatal error** - Unrecoverable error occurs

---

## Troubleshooting

### Ralph won't start

**Error:** `PRD file not found`

**Solution:** Create `prd.json` in your workspace

### No agents available

**Error:** `No agents found`

**Solution:** Ensure agents are in `.blackbox5/engine/agents/` directory

### Quality checks fail

**Error:** Tests failed

**Solution:** Fix failing tests and rerun Ralph

---

## Advanced Features

### Custom Quality Checks

Add custom quality checks in PRD:

```json
{
  "tools": ["test", "custom_check", "lint"]
}
```

### Multi-Agent Coordination

Let multiple agents work on one story:

```json
{
  "agent": "coordinator",
  "context": {
    "subtasks": [
      {"agent": "architect", "task": "Design"},
      {"agent": "coder", "task": "Implement"},
      {"agent": "tester", "task": "Verify"}
    ]
  }
}
```

### Branch Management

Ralph automatically creates/uses branches:

```json
{
  "branchName": "ralph/feature-x"
}
```

---

## Best Practices

### 1. Start Small

Begin with simple stories to test Ralph:

```json
{
  "userStories": [
    {
      "id": "TEST-001",
      "title": "Create hello world file",
      "priority": 1,
      "passes": false,
      "agent": "coder"
    }
  ]
}
```

### 2. Use Appropriate Agents

Match agent to task:
- Code → `coder`
- Design → `architect`
- Docs → `writer`
- Tests → `tester`
- Research → `researcher`

### 3. Specify Tools

Include quality gates:

```json
{
  "tools": ["test", "lint", "typecheck"]
}
```

### 4. Provide Context

Give agents context they need:

```json
{
  "context": {
    "files": ["auth.py", "models.py"],
    "requirements": ["JWT auth", "password hashing"],
    "dependencies": ["flask", "pyjwt"]
  }
}
```

---

## Status

**✅ Implemented**
- RalphRuntime autonomous loop
- QualityChecker (test, lint, typecheck)
- Progress tracking (progress.txt)
- PRD management (prd.json)
- CLI script (start-ralph.sh)
- Example PRD

**🔄 Next Steps**
- Integrate with actual Blackbox5 agents
- Add MCP tool integrations
- Test end-to-end with real projects

---

**Ready to run autonomous coding loops!** 🚀
