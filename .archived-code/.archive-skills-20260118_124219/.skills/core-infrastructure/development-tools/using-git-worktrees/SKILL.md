---
name: using-git-worktrees
category: core-infrastructure/development-tools
version: 1.0.0
description: Work on multiple features simultaneously without context switching overhead
author: obra/superpowers
verified: true
tags: [git, workflow, productivity, branching, parallel-development]
---

# Skill: Using Git Worktrees

<context>
<overview>
Git worktrees let you maintain multiple working directories on different branches simultaneously, eliminating costly context switches when juggling multiple features.
</overview>

<when_to_use>
✅ Working on multiple features in parallel
✅ Emergency hotfixes while mid-feature
✅ Code reviews requiring actual build/test
✅ Long-running experiments vs. mainline work
✅ Comparing different branch implementations
</when_to_use>
</context>

<instructions>
<basic_commands>
<create_worktree>
<commands>
# Create worktree for a new branch
git worktree add ../my-project-feature-a feature-a

# Create worktree for existing branch
git worktree add ../my-project-bugfix bugfix-123

# Create with detached HEAD
git worktree add ../my-project-exp experiment --detach
</commands>
</create_worktree>

<list_worktrees>
<commands>
# See all worktrees
git worktree list

# See with branch details
git worktree list --porcelain
</commands>
</list_worktrees>

<remove_worktrees>
<commands>
# After merging and cleaning up
git worktree remove ../my-project-feature-a

# Or prune deleted worktrees
git worktree prune
</commands>
</remove_worktrees>
</basic_commands>

<workflows>
<scenario name="Parallel Feature Development">
<description>
Work on multiple features simultaneously without stashing or committing partial work
</description>
<steps>
<step>
<commands>
# Main directory (main branch)
cd ~/dev/my-project

# Start feature A
git worktree add ../my-project-feature-a feature/add-user-auth

# Start feature B (no need to stash or commit partial work!)
git worktree add ../my-project-feature-b feature/payment-integration

# Switch between them by cd'ing, no git operations needed
cd ../my-project-feature-a  # Work on auth
cd ../my-project-feature-b  # Work on payments
</commands>
</step>
</steps>
</scenario>

<scenario name="Emergency Hotfix">
<description>
Handle critical bugs while in the middle of feature work
</description>
<steps>
<step>
<commands>
# Mid-feature work
git worktree add ../my-project-hotfix hotfix/critical-bug

# Fix, test, commit, push hotfix
cd ../my-project-hotfix
# ... fix and push ...

# Clean up
git worktree remove ../my-project-hotfix
</commands>
</step>
</steps>
</scenario>

<scenario name="Code Review with Build">
<description>
Reviewer's workflow for testing PRs with actual build/test
</description>
<steps>
<step>
<commands>
# Reviewer's workflow
git worktree add ../review-pr-123 pr-123
cd ../review-pr-123
npm install && npm test
# Verify the PR works
</commands>
</step>
</steps>
</scenario>
</workflows>

<best_practices>
<practice priority="high">
Name worktrees descriptively: `../project-branch-name`
</practice>
<practice priority="medium">
Keep worktrees in sibling directories to main repo
</practice>
<practice priority="medium">
Remove worktrees after merge to avoid clutter
</practice>
<practice priority="low">
Use `git worktree prune` regularly
</practice>
<practice priority="informative">
Each worktree has its own git stash, index, and working state
</practice>
</best_practices>

<integration_notes>
<claude_integration>
When managing parallel work, say:
- "Create a worktree for [feature] while I finish [current work]"
- "Help me clean up old worktrees"
- "Set up worktrees for reviewing PRs 123, 124, and 125"

Claude will:
- Manage worktree creation and cleanup
- Help organize parallel workflows
- Prevent merge conflicts from context switching
- Suggest optimal worktree organization
</claude_integration>
</integration_notes>

<examples>
<example scenario="Feature A and B in parallel">
<pre>
# Setup
cd ~/dev/my-project
git worktree add ../my-project-feature-a feature/user-auth
git worktree add ../my-project-feature-b feature/payments

# Work on auth
cd ../my-project-feature-a
# Make changes, commit, push

# Switch to payments (no stash needed)
cd ../my-project-feature-b
# Make changes, commit, push

# Cleanup after merge
cd ~/dev/my-project
git worktree remove ../my-project-feature-a
git worktree remove ../my-project-feature-b
</pre>
</example>

<example scenario="Hotfix during feature work">
<pre>
# Working on feature in main directory
cd ~/dev/my-project
# Half-done feature work...

# Hotfix comes in
git worktree add ../my-project-hotfix hotfix/critical-security

# Fix the hotfix
cd ../my-project-hotfix
# Make fix, test, commit, push

# Back to feature work (no context switching!)
cd ~/dev/my-project
# Continue where you left off

# Cleanup
git worktree remove ../my-project-hotfix
</pre>
</example>
</examples>
</instructions>
