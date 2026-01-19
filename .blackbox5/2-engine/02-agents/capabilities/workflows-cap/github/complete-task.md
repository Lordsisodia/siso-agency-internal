# Complete GitHub Task Workflow

Complete a task and store learnings in brain.

## Usage

```python
from blackbox5.engine.integrations.github import (
    GitHubIssuesIntegration,
    TaskOutcome,
)

# Initialize integration
integration = GitHubIssuesIntegration()

# Define outcome
outcome = TaskOutcome(
    success=True,
    patterns=["Use React hooks for state management"],
    gotchas=["Don't store tokens in localStorage"],
    deliverables=[
        "OAuth login component",
        "Session management",
        "Logout functionality",
    ],
    unit_test_status="passing",
    integration_test_status="passing",
    manual_test_status="passed",
    documentation_status="complete",
)

# Complete task
await integration.complete_task(task_id=123, outcome=outcome)
```

## What Happens

1. **Format Completion Comment** - With testing status and learnings
2. **Post to GitHub** - Adds final comment to issue
3. **Store Outcome in Brain** - Saves patterns and gotchas
4. **Close Issue** - Closes the GitHub issue
5. **Archive to Extended Memory** - Moves task from working to archival

## Completion Comment Format

```markdown
## ✅ Task Completed - 2025-01-18 16:00 UTC

### 🎯 All Acceptance Criteria Met
- ✅ All criteria verified and complete

### 📦 Deliverables
- OAuth login component
- Session management
- Logout functionality

### 🧪 Testing
- Unit tests: ✅ Passing
- Integration tests: ✅ Passing
- Manual testing: ✅ Passed

### 📚 Documentation
- Code documentation: ✅ Complete

### 💡 Key Learnings
**Patterns Discovered:**
- Use React hooks for state management

**Gotchas:**
- Don't store tokens in localStorage

This task is ready for review.

---
*Task completed: 100% | Synced from BlackBox5 at 2025-01-18 16:00 UTC*
```

## Brain Episodes

Creates episodes in brain for future reference:

- **TASK_OUTCOME** - Task completion with success/failure
- **PATTERN** - Reusable patterns discovered
- **GOTCHA** - Pitfalls to avoid

These episodes are searchable via semantic search in future sessions.
