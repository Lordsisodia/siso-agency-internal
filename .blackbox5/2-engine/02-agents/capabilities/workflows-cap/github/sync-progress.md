# Sync Progress to GitHub Workflow

Sync local task progress to GitHub issue with structured comment.

## Usage

```python
from blackbox5.engine.integrations.github import (
    GitHubIssuesIntegration,
)

# Initialize integration
integration = GitHubIssuesIntegration()

# Sync progress for task
synced = await integration.sync_progress(task_id=123)

if synced:
    print("Progress synced to GitHub")
else:
    print("No new updates to sync")
```

## Local Progress Format

Update your task's `progress.md` file:

```markdown
---
issue: 123
last_sync: 2025-01-18T10:00:00Z
completion: 50%
---

## Completed Work
- [x] Set up project structure
- [x] Implement basic UI

## In Progress
- [ ] Add authentication logic
- [ ] Connect to GitHub API

## Technical Notes
- Using OAuth2 for authentication
- Storing session in localStorage

## Acceptance Criteria Status
- [x] User can login with GitHub account
- [ ] User session is persisted
- [ ] Logout functionality works
```

## What Happens

1. **Load Local Progress** - Reads `memory/working/tasks/{task_id}/progress.md`
2. **Check for Updates** - Compares file mtime to last sync
3. **Format Comment** - Creates structured progress comment
4. **Post to GitHub** - Adds comment to issue
5. **Update Sync Marker** - Updates `.last_sync` timestamp

## Incremental Sync

Only posts comment if there are new updates since last sync. Prevents duplicate comments.

## Comment Format

```markdown
## 🔄 Progress Update - 2025-01-18 15:30 UTC

### ✅ Completed Work
- Set up project structure
- Implement basic UI

### 🔄 In Progress
- Add authentication logic
- Connect to GitHub API

### 📝 Technical Notes
- Using OAuth2 for authentication
- Storing session in localStorage

### 📊 Acceptance Criteria Status
- ✅ User can login with GitHub account
- 🔄 User session is persisted
- □ Logout functionality works

### 💻 Recent Commits
- `a1b2c3d` Initial commit
- `e5f6g7h` Add OAuth config

---
*Progress: 50% | Synced from BlackBox5 memory*
```
