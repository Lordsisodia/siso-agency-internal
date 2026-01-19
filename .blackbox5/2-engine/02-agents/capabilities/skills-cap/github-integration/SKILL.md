# GitHub Integration Skill

## Overview
This skill provides complete GitHub integration for BlackBox5 agents, enabling them to create, read, update, and manage GitHub Issues as part of a spec-driven development workflow.

## What This Skill Does

### Core Capabilities
1. **PRD Creation** - Create Product Requirements Documents with structured brainstorming
2. **Epic Generation** - Transform PRDs into technical specifications
3. **Task Decomposition** - Break epics into actionable tasks
4. **GitHub Sync** - Create epic and task issues on GitHub
5. **Progress Tracking** - Post updates to GitHub issues
6. **Issue Management** - Read, update, and close GitHub issues

### Workflow
```
1. Create PRD (.blackbox5/specs/prds/{name}.md)
2. Generate Epic (.blackbox5/specs/epics/{name}/epic.md)
3. Decompose Tasks (.blackbox5/specs/epics/{name}/{001,002,...}.md)
4. Sync to GitHub (Creates Issues)
5. Execute with BlackBox5 agents
6. Post Progress (GitHub comments)
7. Complete (Issues close)
```

## Usage

### Creating a PRD

When you need to create a new feature or requirement document:

```
Use the github-integration skill to create a PRD for: {feature_name}

The skill will:
1. Guide brainstorming session
2. Ask clarifying questions
3. Create structured PRD with:
   - Executive Summary
   - Problem Statement
   - User Stories
   - Requirements (Functional & Non-Functional)
   - Success Criteria
   - Constraints & Assumptions
   - Dependencies

Saves to: .blackbox5/specs/prds/{name}.md
```

### Generating an Epic

Transform a PRD into technical specification:

```
Use the github-integration skill to parse PRD: {prd_name}

The skill will:
1. Read the PRD file
2. Extract requirements
3. Create technical epic with:
   - Overview
   - Key Decisions (with rationale)
   - Components
   - Data Flow
   - Testing Strategy

Saves to: .blackbox5/specs/epics/{name}/epic.md
```

### Decomposing into Tasks

Break epic into actionable units:

```
Use the github-integration skill to decompose epic: {epic_name}

The skill will:
1. Read epic file
2. Identify components
3. Create task files with:
   - Specification
   - File Changes
   - Acceptance Criteria
   - Definition of Done
   - Test Cases
4. Determine dependencies (depends_on)
5. Identify parallel opportunities (parallel: true/false)

Saves to: .blackbox5/specs/epics/{name}/{001,002,003,...}.md
```

### Syncing to GitHub

Create GitHub Issues from epic and tasks:

```
Use the github-integration skill to sync epic: {epic_name}

The skill will:
1. Create Epic Issue on GitHub
2. Create Task Issues (as sub-issues if gh-sub-issue available)
3. Rename task files with GitHub issue numbers (001.md → 123.md)
4. Update frontmatter with GitHub URLs
5. Create worktree for isolated development
6. Create GitHub mapping file

Result: GitHub Issues created and linked
```

### Reading GitHub Issues

Understand what needs to be done:

```
Use the github-integration skill to read GitHub issue: {issue_number}

The skill will:
1. Fetch issue details via gh CLI
2. Parse issue body
3. Extract requirements
4. Identify acceptance criteria
5. Check for dependencies
6. Determine if task can start

Returns: Complete task context
```

### Posting Progress Updates

Update GitHub with progress:

```
Use the github-integration skill to post progress for issue: {issue_number}

Progress:
- Completed: [list of completed items]
- In Progress: [current work]
- Technical Notes: [decisions made]
- Acceptance Criteria: [status of each criterion]
- Next Steps: [planned actions]
- Blockers: [any blockers]

The skill will:
1. Format progress as GitHub comment
2. Post to issue
3. Update frontmatter timestamps
```

### Closing Issues

Mark tasks complete:

```
Use the github-integration skill to close issue: {issue_number}

The skill will:
1. Post completion summary
2. Close GitHub issue
3. Update task file frontmatter (status: closed)
4. Update epic progress
```

## File Structure

### PRD File
```yaml
---
name: feature-name
description: Brief description
status: backlog
created: 2026-01-18T10:00:00Z
---

# PRD: Feature Name
[Content]
```

### Epic File
```yaml
---
name: feature-name
status: backlog
created: 2026-01-18T10:00:00Z
progress: 0%
prd: .blackbox5/specs/prds/feature-name.md
github: https://github.com/owner/repo/issues/123
updated: 2026-01-18T10:00:00Z
---

# Epic: Feature Name
[Content]
```

### Task File
```yaml
---
name: Task Title
status: open
created: 2026-01-18T10:00:00Z
updated: 2026-01-18T10:00:00Z
github: https://github.com/owner/repo/issues/124
depends_on: []
parallel: true
conflicts_with: []
---

# Task: Task Title
[Content]
```

## Integration with BlackBox5

### Agent Usage

Other BlackBox5 agents can use this skill:

**Winston (Architect):**
- Create PRDs for new features
- Generate epics from PRDs
- Review technical specs

**Arthur (Developer):**
- Read GitHub issues to understand tasks
- Post progress updates
- Close issues when complete

**John (PM):**
- Create and update PRDs
- Monitor epic progress
- Provide feedback via GitHub comments

**Dexter (DevOps):**
- Create worktrees for epic development
- Manage GitHub integration
- Track deployment progress

### Example Workflow

```
User: "Add user authentication"

BlackBox5 (John - PM):
  Uses github-integration skill to create PRD
  → .blackbox5/specs/prds/user-auth.md

BlackBox5 (Winston - Architect):
  Uses github-integration skill to generate epic
  → .blackbox5/specs/epics/user-auth/epic.md

BlackBox5 (Winston + Arthur):
  Uses github-integration skill to decompose epic
  → .blackbox5/specs/epics/user-auth/{001,002,003}.md

BlackBox5 (System):
  Uses github-integration skill to sync epic
  → GitHub Issues #200, #201, #202, #203...

BlackBox5 (Arthur - Developer):
  Uses github-integration skill to read issue #201
  → Gets complete task context

BlackBox5 (Arthur + Dexter + Felix):
  Execute task in worktree

BlackBox5 (Arthur):
  Uses github-integration skill to post progress
  → GitHub comment added

BlackBox5 (Arthur):
  Uses github-integration skill to close issue #201
  → Issue closes, epic updates
```

## Tools Required

- **Bash** - Execute gh CLI commands
- **Read** - Read spec files, GitHub issue data
- **Write** - Create and update spec files
- **LS** - Navigate directories
- **Grep** - Search for dependencies

## GitHub CLI Commands Used

### Create Issue
```bash
gh issue create \
  --title "Epic: feature-name" \
  --body-file /tmp/epic-body.md \
  --label "epic,epic:feature-name,feature"
```

### Create Sub-Issue
```bash
gh sub-issue create \
  --parent {epic_number} \
  --title "Task Name" \
  --body-file /tmp/task-body.md \
  --label "task,epic:feature-name"
```

### Post Comment
```bash
gh issue comment {issue_number} --body-file /tmp/update.md
```

### Close Issue
```bash
gh issue close {issue_number} --comment "Completed"
```

### Read Issue
```bash
gh issue view {issue_number} --json title,body,labels,state
```

## Quality Gates

- ✅ All spec files have valid YAML frontmatter
- ✅ GitHub issues created successfully
- ✅ Task files renamed with issue numbers
- ✅ Progress updates posted with timestamps
- ✅ Epic progress calculated correctly
- ✅ Dependencies respected (no circular deps)

## Error Handling

If GitHub CLI fails:
- Check authentication: `gh auth status`
- Check repository permissions
- Verify issue number exists
- Handle rate limits gracefully

If spec file invalid:
- Validate YAML frontmatter
- Check required fields present
- Verify file paths correct

## Best Practices

1. **Always create PRD first** - Don't skip requirements gathering
2. **Sync to GitHub before coding** - Issues are source of truth
3. **Update progress regularly** - Keep team informed
4. **Close issues when complete** - Don't leave them open
5. **Use worktrees for isolation** - Prevent conflicts
6. **Respect dependencies** - Don't start blocked tasks

## Success Criteria

- ✅ Complete traceability (PRD → Epic → Tasks → Issues → Code)
- ✅ Transparent progress (GitHub comments show status)
- ✅ Human collaboration (team can see and comment)
- ✅ Agent coordination (BlackBox5 agents work together)
- ✅ Audit trail (everything documented)

## Examples

See `.blackbox5/specs/examples/` for:
- Sample PRD
- Sample Epic
- Sample Task files
- Complete workflow example

## Related Skills

- **development-workflow/test-driven-development** - TDD for tasks
- **knowledge-documentation/planning-architecture/writing-plans** - Planning
- **integration-connectivity/mcp-integrations/github** - GitHub MCP

## References

- CCPM Documentation: `.docs/research/development-tools/ccpm/`
- GitHub CLI: https://cli.github.com/
- gh-sub-issue: https://github.com/yahsan2/gh-sub-issue
