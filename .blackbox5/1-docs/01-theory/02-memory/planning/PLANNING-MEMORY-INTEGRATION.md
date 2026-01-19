# BlackBox5 Planning & Memory Integration Plan

**Created:** 2026-01-18
**Status:** Ready for Implementation
**Frameworks:** CCPM (Research) + GSD (Execution) + BlackBox Memory

---

## Executive Summary

This document outlines how BlackBox5 agents will:

1. **Research problems before planning** (using CCPM's 4-dimensional research)
2. **Create action plans/PRDs** (using first principles + Get Shit Done patterns)
3. **Store everything in BlackBox memory** (plans, progress, reasoning)
4. **Integrate with GitHub + Vibe Kanban** (autonomous execution)

---

## The Complete Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    1. HUMAN INPUT                            │
│  "Add user authentication with JWT"                         │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              2. RESEARCH PHASE (CCPM Framework)              │
│                                                              │
│  Agent spawns 4 parallel research dimensions:               │
│  ├─ STACK.md: What tech stack are we using?                 │
│  ├─ FEATURES.md: What features does auth need?              │
│  ├─ ARCHITECTURE.md: Where does auth fit in system?         │
│  └─ PITFALLS.md: What are common auth pitfalls?             │
│                                                              │
│  Researcher synthesizes into SUMMARY.md                      │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│         3. FIRST PRINCIPLES ANALYSIS (Before PRD)            │
│                                                              │
│  Questions to answer:                                       │
│  ├─ What problem are we actually solving?                   │
│  ├─ What are the core constraints?                          │
│  ├─ What does "success" look like?                          │
│  └─ What are we NOT doing? (scope boundaries)               │
│                                                              │
│  Output: First Principles Document                          │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              4. CREATE ACTION PLAN (PRD/GitHub Issue)        │
│                                                              │
│  Based on research + first principles, create:              │
│  ├─ PRD.md (Product Requirements Document)                  │
│  ├─ Epic.md (Technical Specification)                       │
│  └─ Tasks (001.md, 002.md, 003.md...)                       │
│                                                              │
│  Sync to GitHub Issues → #201, #202, #203...                │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
              ┌────────────┴────────────┐
              │                         │
      ┌───────▼────────┐      ┌────────▼─────────┐
      │ MANUAL MODE     │      │ AUTONOMOUS MODE  │
      │                 │      │                  │
      │ Arthur agent    │      │ GitHub webhook   │
      │ works on issue │      │ → Vibe Kanban    │
      │                 │      │ → Ralph Runtime  │
      └───────┬────────┘      └────────┬─────────┘
              │                         │
              └────────────┬────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              5. BLACKBOX MEMORY UPDATES (CRITICAL!)          │
│                                                              │
│  Throughout workflow, update BlackBox memory:               │
│  ├─ The Plan: What we're doing                              │
│  ├─ Progress on Plan: Current status                        │
│  ├─ Reasoning: Why we made decisions                        │
│  ├─ Research Findings: What we discovered                   │
│  ├─ Lessons Learned: What worked/didn't work                │
│  └─ Next Steps: What's coming next                          │
│                                                              │
│  Stored in: .blackbox5/data/memory/{agent_id}/              │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Research Framework (CCPM's 4-Dimensional Research)

### When: Before writing any PRD

### What: Parallel research across 4 dimensions

### Implementation:

**Agent:** `gsd-project-researcher` (from GSD framework)

**Process:**

```python
# Spawn 4 parallel researchers
Task(
    description="Research STACK",
    subagent_type="gsd-phase-researcher",
    prompt="Research what tech stack we're using for JWT auth"
)

Task(
    description="Research FEATURES",
    subagent_type="gsd-phase-researcher",
    prompt="Research what features JWT auth needs"
)

Task(
    description="Research ARCHITECTURE",
    subagent_type="gsd-phase-researcher",
    prompt="Research where auth fits in system architecture"
)

Task(
    description="Research PITFALLS",
    subagent_type="gsd-phase-researcher",
    prompt="Research common JWT auth pitfalls"
)

# Synthesize results
Task(
    description="Synthesize Research",
    subagent_type="gsd-research-synthesizer",
    prompt="Combine 4 research dimensions into SUMMARY.md"
)
```

**Output Structure:**

```
.blackbox5/specs/prds/{feature}/research/
├── STACK.md         # Tech stack analysis
├── FEATURES.md      # Feature requirements
├── ARCHITECTURE.md  # System integration
├── PITFALLS.md      # Common pitfalls
└── SUMMARY.md       # Synthesized findings
```

**BlackBox Memory Update:**

```python
# Store research findings in memory
memory.add_insight(
    content="JWT auth requires jose library (not jsonwebtoken)",
    category="pattern",
    confidence=0.95,
    metadata={"source": "STACK.md research", "feature": "jwt-auth"}
)

memory.add_insight(
    content="Always store JWTs in httpOnly cookies",
    category="gotcha",
    confidence=1.0,
    metadata={"source": "PITFALLS.md research", "feature": "jwt-auth"}
)
```

---

## Phase 2: First Principles Analysis

### When: After research, before PRD

### What: Deep questioning to understand the actual problem

### Framework Questions:

```markdown
# First Principles Analysis for {Feature}

## 1. What problem are we solving?
- NOT "Implement JWT auth"
- BUT "Users need secure, persistent sessions without re-authentication"

## 2. What are the core constraints?
- Security: JWTs must be signed with secure secret
- Performance: Token verification < 10ms
- Compatibility: Works with Edge runtime

## 3. What does success look like?
- Users can log in once, stay authenticated for 15 minutes
- Tokens rotate automatically for security
- Session termination works properly

## 4. What are we NOT doing? (Scope boundaries)
- NOT building OAuth2 social login
- NOT building password reset flow
- NOT building multi-factor authentication

## 5. What assumptions are we making?
- Users have email/password already
- Frontend can handle cookie storage
- Edge runtime supports crypto operations

## 6. What do we need to validate?
- Token verification performance
- Cookie security on production domain
- Refresh token rotation logic
```

**BlackBox Memory Update:**

```python
memory.add_session(
    task="First principles analysis for JWT auth",
    result="Identified 6 key questions, defined scope boundaries",
    success=True,
    metadata={
        "feature": "jwt-auth",
        "scope_boundaries": ["No OAuth2", "No password reset", "No MFA"],
        "core_constraints": ["Security", "Performance", "Edge runtime"]
    }
)

memory.update_context({
    "patterns": [
        "Always define scope boundaries before implementation",
        "First principles analysis prevents scope creep"
    ]
})
```

---

## Phase 3: Action Plan Creation (PRD + GitHub Issue)

### When: After research + first principles

### What: Create structured action plan

### PRD Structure:

```markdown
---
name: JWT Authentication System
status: planned
created: 2026-01-18T14:30:00Z
priority: high
effort: 8 hours
---

# Product Requirements Document: JWT Authentication

## Problem Statement
Users need secure, persistent sessions without re-authentication.

## First Principles Summary
- **Core Problem**: Session management without database overhead
- **Success Criteria**: 15-minute sessions, <10ms verification
- **Scope Boundaries**: No OAuth2, no password reset, no MFA

## User Stories
1. As a user, I want to log in once and stay authenticated
2. As a user, I want my session to expire safely
3. As a developer, I want tokens to rotate automatically

## Requirements
### Functional
- Login endpoint accepts email/password
- Returns httpOnly cookie with JWT
- Token verification < 10ms
- Refresh token rotation every 15 minutes

### Non-Functional
- Security: Tokens signed with RS256
- Performance: Verification < 10ms
- Compatibility: Edge runtime compatible

## Success Criteria
- [ ] Users can authenticate with email/password
- [ ] Tokens verify in < 10ms
- [ ] Sessions expire after 15 minutes
- [ ] Refresh tokens rotate automatically
- [ ] Logout terminates session immediately

## Technical Constraints
- Must use `jose` library (Edge compatible)
- Must store tokens in httpOnly cookies
- Must implement RS256 signing

## Dependencies
- Database: Users table exists
- Frontend: Can handle cookie storage
- Environment: JWT_SECRET configured

## Out of Scope
- OAuth2 social login
- Password reset flow
- Multi-factor authentication
- Session analytics/analytics
```

**Sync to GitHub:**

```bash
# Create GitHub issue from PRD
gh issue create \
  --title "Feature: JWT Authentication System" \
  --body-file prd.md \
  --label "feature,authentication"
```

**BlackBox Memory Update:**

```python
memory.add_session(
    task="Create PRD for JWT authentication",
    result="Created comprehensive PRD with 6 requirements, 4 success criteria",
    success=True,
    metadata={
        "feature": "jwt-auth",
        "github_issue": "#204",
        "requirements_count": 6,
        "success_criteria_count": 4
    }
)
```

---

## Phase 4: Epic + Task Breakdown

### When: After PRD approved

### What: Break PRD into technical epics and tasks

### Epic Structure:

```markdown
---
name: JWT Authentication Epic
status: in-progress
created: 2026-01-18T15:00:00Z
progress: 0%
prd: .blackbox5/specs/prds/jwt-auth.md
github: https://github.com/Lordsisodia/siso-agency-internal/issues/204
---

# Epic: JWT Authentication System

## Overview
Implement secure JWT-based authentication for user sessions.

## Technical Decisions
| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Use `jose` library | Edge runtime compatible | jsonwebtoken (CommonJS), crypto-js (slow) |
| RS256 signing | More secure than HS256 | HS256 (symmetric), none (insecure) |
| httpOnly cookies | Prevents XSS attacks | localStorage (XSS vulnerable) |
| 15-minute expiry | Balance security/UX | 5 minutes (too short), 1 hour (too long) |

## Architecture
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Frontend   │────▶│  API Route   │────▶│   Database  │
│             │◀────│  /api/auth   │◀────│             │
└─────────────┘     └──────────────┘     └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  JWT Utils   │
                     │  (sign/verify)│
                     └──────────────┘
```

## Data Flow
1. User submits email/password to `/api/auth/login`
2. API verifies credentials against database
3. JWT generated with user payload
4. Token set in httpOnly cookie
5. Response returns success
6. Subsequent requests include cookie
7. Middleware verifies token
8. Request proceeds if valid

## Components
1. **JWT Utils** (`src/lib/auth/jwt.ts`)
   - signToken()
   - verifyToken()
   - refreshToken()

2. **Login Endpoint** (`src/app/api/auth/login/route.ts`)
   - Validate credentials
   - Generate token
   - Set cookie

3. **Auth Middleware** (`src/middleware.ts`)
   - Verify token
   - Attach user to request
   - Handle errors

4. **Logout Endpoint** (`src/app/api/auth/logout/route.ts`)
   - Clear cookie
   - Terminate session

## Tasks Created: 4
- [ ] #205 - Implement JWT utilities
- [ ] #206 - Create login endpoint
- [ ] #207 - Add authentication middleware
- [ ] #208 - Implement logout functionality

## Stats
- Total tasks: 4
- Parallel tasks: 2 (JWT utils, login endpoint)
- Sequential tasks: 2 (middleware, logout - depend on login)
- Estimated total effort: 8 hours
```

**Task Structure (001.md → #205):**

```markdown
---
name: Implement JWT Utilities
status: open
created: 2026-01-18T15:30:00Z
parallel: true
effort: 2 hours
depends_on: []
conflicts_with: []
---

# Task: Implement JWT Utilities

## Specification
Create JWT utility library for signing and verification.

## Acceptance Criteria
- [ ] signToken() creates valid JWT with user payload
- [ ] verifyToken() validates signature and returns payload
- [ ] refreshToken() rotates tokens with new claims
- [ ] Tokens use RS256 algorithm
- [ ] Token expiry set to 15 minutes

## Files
- `src/lib/auth/jwt.ts` (new file)

## Technical Approach
1. Install `jose` library
2. Create JWT_SECRET environment variable
3. Implement signToken(payload, secret)
4. Implement verifyToken(token, secret)
5. Implement refreshToken(oldToken, secret)
6. Add unit tests for all functions

## Dependencies
None

## Conflicts
None

## Testing
```bash
npm test -- jwt.test.ts
```

## Verification
- [ ] Unit tests pass
- [ ] Tokens verify successfully
- [ ] Expired tokens throw errors
- [ ] Invalid signatures throw errors
```

**BlackBox Memory Update:**

```python
memory.add_session(
    task="Break down JWT auth into epic + tasks",
    result="Created 1 epic, 4 tasks, 2 parallel streams identified",
    success=True,
    metadata={
        "feature": "jwt-auth",
        "epic_issue": "#204",
        "tasks_created": 4,
        "parallel_tasks": 2,
        "estimated_effort_hours": 8
    }
)

# Record architectural decisions
memory.add_insight(
    content="Use jose library for Edge runtime compatibility",
    category="pattern",
    confidence=1.0,
    metadata={"feature": "jwt-auth", "decision": "library choice"}
)

memory.add_insight(
    content="httpOnly cookies prevent XSS attacks vs localStorage",
    category="gotcha",
    confidence=1.0,
    metadata={"feature": "jwt-auth", "decision": "token storage"}
)
```

---

## Phase 5: Execution (Manual or Autonomous)

### Path A: Manual Execution (Arthur Agent)

```python
# Arthur reads GitHub issue
issue = gh.issue.view(205)

# Arthur loads task context
task = read(".claude/epics/jwt-auth/205.md")

# Arthur updates BlackBox memory
memory = AgentMemory(agent_id="arthur")
memory.add_session(
    task="Implement JWT utilities (#205)",
    result="Starting implementation",
    success=True,
    metadata={"github_issue": "#205", "status": "in_progress"}
)

# Arthur implements code
# ... implementation ...

# Arthur commits code
git.commit("feat(205): implement JWT utilities")

# Arthur posts progress to GitHub
gh.issue.comment(205, "## 🔄 Progress Update\n### ✅ Completed\n- Created jwt.ts\n- Implemented signToken()\n- Implemented verifyToken()\n\n### 🔄 In Progress\n- Implementing refreshToken()\n\nProgress: 60%")

# Arthur updates BlackBox memory
memory.add_session(
    task="Implement JWT utilities (#205)",
    result="Completed JWT utility implementation",
    success=True,
    metadata={
        "github_issue": "#205",
        "files_modified": ["src/lib/auth/jwt.ts"],
        "tests_added": "jwt.test.ts",
        "completion_percentage": 100
    }
)

# Arthur closes issue
gh.issue.close(205)
```

### Path B: Autonomous Execution (Vibe Kanban + Ralph Runtime)

```python
# GitHub webhook fires
webhook_data = {
    "action": "opened",
    "issue": {
        "number": 205,
        "title": "Implement JWT Utilities",
        "labels": [{"name": "auto"}]  # <-- Triggers autonomous mode
    }
}

# Ralph Runtime picks up task
ralph = RalphRuntime()
ralph.load_task(issue_id=205)

# Ralph loops until complete
while not ralph.task_complete:
    # 1. Read current state
    state = ralph.get_state()

    # 2. Update BlackBox memory with current reasoning
    ralph.memory.add_session(
        task=f"Execute JWT utilities task (loop {state.loop_count})",
        result=f"Current status: {state.status}",
        success=True,
        metadata={
            "github_issue": "#205",
            "loop": state.loop_count,
            "autonomous": True
        }
    )

    # 3. Execute next step
    result = ralph.execute_step()

    # 4. Post progress to GitHub
    gh.issue.comment(205, result.progress_update)

    # 5. If tests fail, fix and retry
    if not result.tests_passed:
        ralf.fix_issues()

    # 6. If all complete, commit and close
    if result.all_complete:
        git.commit(f"feat(205): {result.commit_message}")
        gh.issue.close(205)

        # Final BlackBox memory update
        ralph.memory.add_session(
            task="Execute JWT utilities task (autonomous)",
            result="Task completed autonomously",
            success=True,
            metadata={
                "github_issue": "#205",
                "autonomous": True,
                "total_loops": state.loop_count,
                "files_modified": result.files,
                "tests_passed": result.tests_passed
            }
        )

        break
```

---

## Phase 6: BlackBox Memory Updates (CRITICAL!)

### What Gets Stored in BlackBox Memory:

```python
# 1. THE PLAN
memory.update_context({
    "current_plan": {
        "feature": "jwt-auth",
        "prd": ".blackbox5/specs/prds/jwt-auth.md",
        "epic": ".blackbox5/specs/epics/jwt-auth/epic.md",
        "github_epic": "#204",
        "tasks": [205, 206, 207, 208],
        "status": "in_progress"
    }
})

# 2. PROGRESS ON PLAN
memory.add_session(
    task="JWT authentication system",
    result="Epic progress: 1/4 tasks complete (25%)",
    success=True,
    metadata={
        "feature": "jwt-auth",
        "epic_issue": "#204",
        "tasks_completed": 1,
        "tasks_total": 4,
        "progress_percentage": 25
    }
)

# 3. REASONING (Why decisions were made)
memory.add_insight(
    content="Chose jose library over jsonwebtoken for Edge runtime compatibility",
    category="pattern",
    confidence=1.0,
    metadata={
        "feature": "jwt-auth",
        "decision_type": "technical",
        "alternatives_considered": ["jsonwebtoken", "crypto-js"],
        "rationale": "Edge runtime doesn't support CommonJS"
    }
)

# 4. RESEARCH FINDINGS
memory.add_insight(
    content="JWT verification must be < 10ms for acceptable performance",
    category="discovery",
    confidence=0.9,
    metadata={
        "feature": "jwt-auth",
        "source": "ARCHITECTURE.md research",
        "performance_requirement": "10ms"
    }
)

# 5. LESSONS LEARNED
memory.add_insight(
    content="Always define scope boundaries before implementation to prevent creep",
    category="pattern",
    confidence=1.0,
    metadata={
        "feature": "jwt-auth",
        "lesson_source": "first_principles_analysis",
        "impact": "prevented OAuth2 scope creep"
    }
)

# 6. NEXT STEPS
memory.update_context({
    "next_steps": [
        "Task #206: Create login endpoint (depends on #205)",
        "Task #207: Add auth middleware (depends on #206)",
        "Task #208: Implement logout (depends on #207)"
    ]
})
```

### BlackBox Memory Structure:

```
.blackbox5/data/memory/arthur/
├── sessions.json           # All task executions
├── insights.json           # All learnings
└── context.json            # Current state

context.json contents:
{
  "agent_id": "arthur",
  "current_plan": {
    "feature": "jwt-auth",
    "status": "in_progress",
    "progress": "25%"
  },
  "patterns": [
    "Use jose library for Edge runtime",
    "Define scope boundaries early",
    "httpOnly cookies prevent XSS"
  ],
  "gotchas": [
    "jsonwebtoken doesn't work on Edge runtime",
    "localStorage is vulnerable to XSS"
  ],
  "discoveries": [
    "JWT verification must be < 10ms",
    "RS256 is more secure than HS256"
  ],
  "next_steps": [
    "Task #206: Create login endpoint"
  ]
}
```

---

## Integration with Vibe Kanban (Autonomous Path)

### When GitHub Issue Has [auto] Tag:

```
GitHub Issue #205 created with label "auto"
        ↓
GitHub webhook fires → http://localhost:3000/webhook/github
        ↓
Vibe Kanban receives webhook payload
        ↓
Vibe Kanban creates task in queue
        ↓
Ralph Runtime detects [auto] tag
        ↓
Ralph Runtime spawns autonomous execution loop
        ↓
┌─────────────────────────────────────────────────────────┐
│  while not task_complete:                               │
│    1. Read current state from GitHub                    │
│    2. Update BlackBox memory with current reasoning     │
│    3. Execute next implementation step                  │
│    4. Run tests (TDD)                                   │
│    5. If tests pass: git commit                         │
│    6. If tests fail: fix and retry                      │
│    7. Post progress to GitHub comments                  │
│    8. Check if all acceptance criteria met              │
│    9. If yes: close issue                               │
│   10. If no: continue loop                              │
│                                                          │
│  CRITICAL: Every loop updates BlackBox memory!          │
└─────────────────────────────────────────────────────────┘
        ↓
Issue closed, epic progress updated
        ↓
Next [auto] task starts automatically
```

### BlackBox Updates During Autonomous Execution:

```python
# Loop 1: Starting task
memory.add_session(
    task="JWT utilities #205 (autonomous loop 1)",
    result="Starting implementation, reading task spec",
    success=True,
    metadata={"loop": 1, "status": "starting"}
)

# Loop 2: Implementation in progress
memory.add_session(
    task="JWT utilities #205 (autonomous loop 2)",
    result="Implemented signToken(), testing",
    success=True,
    metadata={"loop": 2, "status": "implementing"}
)

# Loop 3: Tests failed, fixing
memory.add_session(
    task="JWT utilities #205 (autonomous loop 3)",
    result="Tests failed, fixing token expiry bug",
    success=False,
    metadata={"loop": 3, "status": "fixing", "error": "token_expiry"}
)

# Loop 4: Tests passing
memory.add_session(
    task="JWT utilities #205 (autonomous loop 4)",
    result="Tests passing, committing code",
    success=True,
    metadata={"loop": 4, "status": "committing"}
)

# Loop 5: Complete
memory.add_session(
    task="JWT utilities #205 (autonomous loop 5)",
    result="Task complete, issue closed",
    success=True,
    metadata={"loop": 5, "status": "complete"}
)

# Record learning from autonomous execution
memory.add_insight(
    content="Token expiry must be in seconds, not milliseconds",
    category="gotcha",
    confidence=1.0,
    metadata={
        "feature": "jwt-auth",
        "learned_during": "autonomous_execution",
        "loop_where_learned": 3
    }
)
```

---

## Summary: The Complete System

### What Happens When You Say "Add user authentication":

1. **RESEARCH** (CCPM Framework)
   - 4 parallel research dimensions
   - Findings synthesized into SUMMARY.md
   - BlackBox updated with research insights

2. **FIRST PRINCIPLES** (Critical Thinking)
   - Deep questioning about actual problem
   - Scope boundaries defined
   - Success criteria clarified
   - BlackBox updated with reasoning

3. **ACTION PLAN** (PRD + GitHub Issue)
   - PRD created from research + analysis
   - Epic broken into tasks
   - Synced to GitHub Issues
   - BlackBox updated with plan

4. **EXECUTION** (Manual or Autonomous)
   - **Manual**: Arthur agent works task
   - **Autonomous**: Ralph Runtime loops until complete
   - Progress posted to GitHub comments
   - **BlackBox updated EVERY STEP**

5. **COMPLETION**
   - Issue closed
   - Code committed
   - Epic progress updated
   - BlackBox updated with lessons learned

### What's Stored in BlackBox:

✅ **The Plan**
- What we're building
- Why we're building it
- What success looks like

✅ **Progress on Plan**
- Current status percentage
- What's complete
- What's in progress
- What's blocked

✅ **Reasoning**
- Why we made technical decisions
- What alternatives we considered
- What tradeoffs we accepted

✅ **Research Findings**
- What we discovered about the problem
- What constraints exist
- What pitfalls to avoid

✅ **Lessons Learned**
- What worked well
- What didn't work
- What we'd do differently

✅ **Next Steps**
- What's coming next
- What depends on what
- What's blocked on what

---

## Next Steps

1. ✅ **Research Framework**: CCPM 4-dimensional research (already documented)
2. ✅ **First Principles**: Deep questioning framework (already documented)
3. ✅ **Memory Integration**: BlackBox memory system (already exists)
4. ⏳ **Implementation**: Integrate into github-integration skill commands
5. ⏳ **Testing**: Run end-to-end test with real feature
6. ⏳ **Vibe Kanban Integration**: Set up webhooks for autonomous execution

**Ready to proceed with implementation!**
