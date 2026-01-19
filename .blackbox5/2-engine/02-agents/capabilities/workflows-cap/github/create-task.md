# Create GitHub Task Workflow

Create a new GitHub issue from a task specification.

## Usage

```python
from blackbox5.engine.integrations.github import (
    GitHubIssuesIntegration,
    TaskSpec,
)

# Initialize integration
integration = GitHubIssuesIntegration(
    repo="owner/repo",  # Auto-detected if None
    memory_path="./memory/working",
)

# Define task
spec = TaskSpec(
    title="Add user authentication",
    description="Implement OAuth2 login with GitHub support",
    acceptance_criteria=[
        "User can login with GitHub account",
        "User session is persisted",
        "Logout functionality works",
    ],
    labels=["type:feature", "priority:high"],
    assignees=["username"],
)

# Create task
issue = await integration.create_task(spec)
print(f"Created issue #{issue.number}: {issue.title}")
```

## What Happens

1. **Repository Safety Check** - Prevents writing to template repos
2. **GitHub Issue Created** - With formatted body and labels
3. **Local Context Initialized** - Task directory created in memory
4. **Brain Episode Stored** - Task creation logged (if brain enabled)

## Outputs

- Returns `IssueData` with issue details
- Creates local task context at `memory/working/tasks/{issue_number}/`
- Stores episode in brain (if enabled)
