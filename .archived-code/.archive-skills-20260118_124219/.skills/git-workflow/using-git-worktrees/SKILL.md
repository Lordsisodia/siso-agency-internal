---
name: using-git-worktrees
category: core
version: 1.0.0
description: Work on multiple features simultaneously without context switching overhead
author: obra/superpowers
verified: true
tags: [git, workflow, productivity, branching]
---

# Using Git Worktrees

## Overview
Git worktrees let you maintain multiple working directories on different branches simultaneously, eliminating costly context switches when juggling multiple features.

## When to Use This Skill
✅ Working on multiple features in parallel
✅ Emergency hotfixes while mid-feature
✅ Code reviews requiring actual build/test
✅ Long-running experiments vs. mainline work
✅ Comparing different branch implementations

## Basic Commands

### Create a Worktree
```bash
# Create worktree for a new branch
git worktree add ../my-project-feature-a feature-a

# Create worktree for existing branch
git worktree add ../my-project-bugfix bugfix-123

# Create with detached HEAD
git worktree add ../my-project-exp experiment --detach
```

### List Worktrees
```bash
# See all worktrees
git worktree list

# See with branch details
git worktree list --porcelain
```

### Remove Worktrees
```bash
# After merging and cleaning up
git worktree remove ../my-project-feature-a

# Or prune deleted worktrees
git worktree prune
```

## Typical Workflow

### Scenario 1: Parallel Feature Development
```bash
# Main directory (main branch)
cd ~/dev/my-project

# Start feature A
git worktree add ../my-project-feature-a feature/add-user-auth

# Start feature B (no need to stash or commit partial work!)
git worktree add ../my-project-feature-b feature/payment-integration

# Switch between them by cd'ing, no git operations needed
cd ../my-project-feature-a  # Work on auth
cd ../my-project-feature-b  # Work on payments
```

### Scenario 2: Emergency Hotfix
```bash
# Mid-feature work
git worktree add ../my-project-hotfix hotfix/critical-bug

# Fix, test, commit, push hotfix
cd ../my-project-hotfix
# ... fix and push ...

# Clean up
git worktree remove ../my-project-hotfix
```

### Scenario 3: Code Review with Build
```bash
# Reviewer's workflow
git worktree add ../review-pr-123 pr-123
cd ../review-pr-123
npm install && npm test
# Verify the PR works
```

## Best Practices
- Name worktrees descriptively: `../project-branch-name`
- Keep worktrees in sibling directories to main repo
- Remove worktrees after merge to avoid clutter
- Use `git worktree prune` regularly
- Each worktree has its own git stash, index, working state

## Integration with Claude
When managing parallel work, say:
- "Create a worktree for [feature] while I finish [current work]"
- "Help me clean up old worktrees"
- "Set up worktrees for reviewing PRs 123, 124, and 125"

Claude will:
- Manage worktree creation and cleanup
- Help organize parallel workflows
- Prevent merge conflicts from context switching
- Suggest optimal worktree organization
