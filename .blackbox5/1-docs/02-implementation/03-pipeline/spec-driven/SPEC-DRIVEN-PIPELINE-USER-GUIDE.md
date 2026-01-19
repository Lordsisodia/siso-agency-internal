# BlackBox5 Spec-Driven Development Pipeline

Complete guide for using the BlackBox5 spec-driven development pipeline.

## Overview

The BlackBox5 spec-driven development pipeline provides a structured workflow for transforming requirements into implementation tasks:

```
PRD (Product Requirements Document)
    ↓
Epic (Technical Specification)
    ↓
Tasks (Implementation Units)
    ↓
GitHub Issues (with optional sync)
```

## Table of Contents

1. [Quick Start](#quick-start)
2. [PRD Creation](#prd-creation)
3. [Epic Generation](#epic-generation)
4. [Task Breakdown](#task-breakdown)
5. [GitHub Integration](#github-integration)
6. [Complete Workflow Example](#complete-workflow-example)
7. [CLI Reference](#cli-reference)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Quick Start

### Installation

The pipeline is included with BlackBox5. Ensure you have:

```bash
# BlackBox5 should be installed
cd /path/to/your/project
.blackbox5/cli/bb5 --help
```

### Your First PRD

```bash
# Create a new PRD interactively
.blackbox5/cli/bb5 prd:new "User Authentication System"

# Or non-interactively
.blackbox5/cli/bb5 prd:new "User Auth" --non-interactive \
  --description "Implement JWT-based authentication"
```

### Generate Epic from PRD

```bash
# Transform PRD to Epic
.blackbox5/cli/bb5 epic:create \
  --prd .blackbox5/specs/prds/prd-user-authentication-system.md
```

### Create Tasks from Epic

```bash
# Generate tasks from epic
.blackbox5/cli/bb5 task:create \
  .blackbox5/specs/epics/epic-001-user-authentication-system.md
```

### Sync to GitHub (Optional)

```bash
# Sync epic to GitHub
.blackbox5/cli/bb5 github:sync-epic \
  .blackbox5/specs/epics/epic-001-user-authentication-system.md
```

## PRD Creation

### What is a PRD?

A Product Requirements Document (PRD) defines:
- **What** you're building and **why**
- **Who** it's for (user personas)
- **Success criteria** (metrics, acceptance criteria)
- **User stories** (feature requirements from user perspective)
- **First principles analysis** (fundamental truths and assumptions)

### Creating a PRD

**Interactive Mode** (recommended for first-time users):

```bash
.blackbox5/cli/bb5 prd:new "My Feature"
```

You'll be prompted for:
- Description
- User personas
- Requirements
- Success metrics
- User stories

**Non-Interactive Mode**:

```bash
.blackbox5/cli/bb5 prd:new "My Feature" --non-interactive \
  --description "Brief description of the feature" \
  --author "Your Name"
```

Then edit the generated file:

```bash
# Edit the PRD
vim .blackbox5/specs/prds/prd-my-feature.md
```

### PRD Structure

A complete PRD includes:

```markdown
# PRD-001: My Feature

**Author**: Your Name
**Status**: Draft
**Created**: 2024-01-18

## Overview
Brief description of the feature

## First Principles Analysis

### Problem Statement
What problem are we solving?

### Assumptions
What are we assuming to be true?

### Fundamental Truths
What do we know for certain?

### Questions to Answer
What do we need to validate?

## Requirements
- Requirement 1
- Requirement 2

## Success Metrics
- Metric 1: How we measure success
- Metric 2: Another measure

## User Stories
### Story 1
- **As a** [user role]
- **I want** [action]
- **So that** [benefit]

## Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2
```

### Validating a PRD

```bash
.blackbox5/cli/bb5 prd:validate \
  .blackbox5/specs/prds/prd-my-feature.md
```

### Listing PRDs

```bash
.blackbox5/cli/bb5 prd:list
```

## Epic Generation

### What is an Epic?

An Epic is a technical specification that:
- Transforms business requirements into technical design
- Defines architecture and components
- Makes technical decisions with rationale
- Establishes acceptance criteria

### Creating an Epic

```bash
.blackbox5/cli/bb5 epic:create \
  --prd .blackbox5/specs/prds/prd-my-feature.md
```

The Epic Agent will:
1. Analyze the PRD requirements
2. Design system architecture
3. Break down into components
4. Make technical decisions with options and rationale
5. Generate acceptance criteria

### Epic Structure

```markdown
# Epic-001: My Feature - Technical Specification

**PRD**: PRD-001
**Status**: Draft
**Created**: 2024-01-18

## Overview
Technical overview of the implementation

## Architecture
System architecture description

### Components
#### Component 1
- **Description**: What it does
- **Responsibilities**:
  - Responsibility 1
  - Responsibility 2
- **Proposed Files**:
  - `src/components/Component1.tsx`
  - `src/components/Component1.test.tsx`

## Technical Decisions

### Decision 1: Technology Choice
**Options Considered**:
- Option A: Description
- Option B: Description
- Option C: Description

**Chosen**: Option B

**Rationale**:
Why we chose this option

## Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2

## Dependencies
- Dependency 1
- Dependency 2
```

### Validating an Epic

```bash
.blackbox5/cli/bb5 epic:validate \
  .blackbox5/specs/epics/epic-001-my-feature.md
```

## Task Breakdown

### What are Tasks?

Tasks are implementation units that:
- Can be completed in a single work session
- Have clear acceptance criteria
- Include time estimates
- Track dependencies

### Creating Tasks

```bash
.blackbox5/cli/bb5 task:create \
  .blackbox5/specs/epics/epic-001-my-feature.md
```

The Task Agent will:
1. Analyze epic components
2. Generate implementation tasks for each component
3. Generate testing tasks
4. Estimate complexity and time
5. Identify dependencies
6. Generate acceptance criteria

### Task Structure

```markdown
# EPIC-001-001: Implement Component 1

**Type**: Feature | **Priority**: High | **Status**: Todo

## Description
Implement the Component1 as specified in the epic.

## Estimates
**Estimate**:
- Complexity: Moderate
- Expected: 3.0h
- Range: 2.0h - 4.0h
- Confidence: 85%

## Acceptance Criteria
✅ **AC-1**: Feature functions as expected in component 1
   *Verification: automated_test*
✅ **AC-2**: Edge cases are handled appropriately
   *Verification: automated_test*
🔹 **AC-3**: User feedback is clear and actionable
   *Verification: manual_test*

## Dependencies
🚫 **TASK**: Requires completion of EPIC-001-002
🔗 **EPIC**: Related to EPIC-001 architecture

## Technical Notes
- Part of epic: My Feature
- Component: Component1

## Expected File Changes
- `src/components/Component1.tsx`
- `src/components/Component1.test.tsx`

## Labels
`epic-001`, `feature`, `implementation`

## Traceability
- **PRD**: PRD-001
- **Epic**: EPIC-001
```

### Listing Tasks

```bash
# List all task documents
.blackbox5/cli/bb5 task:list

# Filter by epic
.blackbox5/cli/bb5 task:list --epic EPIC-001
```

### Showing Task Details

```bash
# Show summary
.blackbox5/cli/bb5 task:show EPIC-001-001

# Show full markdown
.blackbox5/cli/bb5 task:show EPIC-001-001 --format markdown

# Show JSON
.blackbox5/cli/bb5 task:show EPIC-001-001 --format json
```

### Validating Tasks

```bash
# Validate all tasks in a document
.blackbox5/cli/bb5 task:validate \
  .blackbox5/specs/tasks/epic-001-my-feature-tasks.md
```

## GitHub Integration

### Setup

Configure GitHub credentials:

```bash
# Set environment variables
export GITHUB_TOKEN=your_token_here
export GITHUB_REPO=owner/repo

# Or create config file
cat > .blackbox5/config.yml << EOF
github:
  token: ${GITHUB_TOKEN}
  repo_owner: owner
  repo_name: repo
  enable_auto_sync: false  # Set to true for automatic sync
EOF
```

### Syncing Epic to GitHub

```bash
.blackbox5/cli/bb5 github:sync-epic \
  .blackbox5/specs/epics/epic-001-my-feature.md
```

This creates:
- GitHub issue for the epic
- Links to PRD in issue body
- Adds labels and milestones

### Syncing Tasks to GitHub

```bash
.blackbox5/cli/bb5 task:sync \
  .blackbox5/specs/tasks/epic-001-my-feature-tasks.md \
  --epic-issue 123
```

This creates:
- GitHub issues for each task
- Links tasks to epic as sub-issues
- Adds dependencies between tasks
- Includes estimates and acceptance criteria

### Updating Progress

```bash
.blackbox5/cli/bb5 github:update \
  --issue 124 \
  --status "in_progress" \
  --comment "Working on implementation"
```

### Checking Sync Status

```bash
.blackbox5/cli/bb5 github:status --epic EPIC-001
```

## Complete Workflow Example

Let's walk through building a "User Dashboard" feature:

### Step 1: Create PRD

```bash
.blackbox5/cli/bb5 prd:new "User Dashboard" --non-interactive
```

Edit the PRD:

```bash
vim .blackbox5/specs/prds/prd-user-dashboard.md
```

Add content:

```markdown
# PRD-001: User Dashboard

## First Principles Analysis

### Problem Statement
Users need a centralized view of their account information and recent activity.

### Assumptions
- Users have accounts with profile data
- Users have recent activities to display
- Dashboard should load quickly (< 2 seconds)

### Fundamental Truths
- Users want quick access to key information
- Information should be organized and scannable
- Performance impacts user satisfaction

## Requirements
- Display user profile information
- Show recent activity (last 10 items)
- Provide quick actions (edit profile, settings)
- Responsive design for mobile

## Success Metrics
- Dashboard load time < 2 seconds
- User engagement increases by 20%
- Support tickets decrease by 15%

## User Stories
- As a user, I want to see my profile at a glance
- As a user, I want to see my recent activity
- As a user, I want to quickly access settings
```

Validate:

```bash
.blackbox5/cli/bb5 prd:validate \
  .blackbox5/specs/prds/prd-user-dashboard.md
```

### Step 2: Generate Epic

```bash
.blackbox5/cli/bb5 epic:create \
  --prd .blackbox5/specs/prds/prd-user-dashboard.md
```

Output:

```
✓ Created Epic: EPIC-001
  Title: User Dashboard - Technical Specification
  Components: 4
  Technical Decisions: 3
  File: .blackbox5/specs/epics/epic-001-user-dashboard.md
```

Review the epic:

```bash
vim .blackbox5/specs/epics/epic-001-user-dashboard.md
```

### Step 3: Generate Tasks

```bash
.blackbox5/cli/bb5 task:create \
  .blackbox5/specs/epics/epic-001-user-dashboard.md
```

Output:

```
✓ Created 8 tasks
  By Priority:
  - High: 4
  - Medium: 4

  Total estimated hours: 24.0h

  File: .blackbox5/specs/tasks/epic-001-user-dashboard-tasks.md
```

### Step 4: Sync to GitHub (Optional)

```bash
# Sync epic
.blackbox5/cli/bb5 github:sync-epic \
  .blackbox5/specs/epics/epic-001-user-dashboard.md

# Sync tasks (note the epic issue number from output)
.blackbox5/cli/bb5 task:sync \
  .blackbox5/specs/tasks/epic-001-user-dashboard-tasks.md \
  --epic-issue 42
```

### Step 5: Track Progress

As you work on tasks:

```bash
# Update status
.blackbox5/cli/bb5 github:update \
  --issue 43 \
  --status "in_progress"

# When complete
.blackbox5/cli/bb5 github:update \
  --issue 43 \
  --status "done" \
  --comment "Completed implementation with tests"
```

## CLI Reference

### PRD Commands

#### `prd:new`
Create a new PRD.

```bash
bb5 prd:new <title> [options]

Options:
  --non-interactive    Skip interactive prompts
  --description TEXT   Brief description
  --author TEXT       Author name
  -o, --output DIR    Output directory
```

#### `prd:validate`
Validate a PRD.

```bash
bb5 prd:validate <prd_file>
```

#### `prd:list`
List all PRDs.

```bash
bb5 prd:list [options]

Options:
  -d, --directory DIR    PRDs directory
```

#### `prd:show`
Display a PRD.

```bash
bb5 prd:show <prd_id> [options]

Options:
  -d, --directory DIR    PRDs directory
  -f, --format FORMAT    Output format (markdown|json|summary)
```

### Epic Commands

#### `epic:create`
Create an epic from a PRD.

```bash
bb5 epic:create --prd <prd_file> [options]

Options:
  -o, --output DIR       Output directory
  --no-validation        Skip validation
```

#### `epic:validate`
Validate an epic.

```bash
bb5 epic:validate <epic_file>
```

#### `epic:list`
List all epics.

```bash
bb5 epic:list [options]

Options:
  -d, --directory DIR    Epics directory
```

#### `epic:show`
Display an epic.

```bash
bb5 epic:show <epic_id> [options]

Options:
  -d, --directory DIR    Epics directory
  -f, --format FORMAT    Output format (markdown|json|summary)
```

### Task Commands

#### `task:create`
Create tasks from an epic.

```bash
bb5 task:create <epic_file> [options]

Options:
  -o, --output DIR       Output directory
  -p, --prd FILE         PRD file for traceability
  --no-validation        Skip validation
  -v, --verbose          Enable verbose output
```

#### `task:validate`
Validate tasks.

```bash
bb5 task:validate <task_file> [options]

Options:
  -v, --verbose          Enable verbose output
```

#### `task:list`
List task documents.

```bash
bb5 task:list [options]

Options:
  -e, --epic EPIC_ID     Filter by epic
  -d, --directory DIR    Tasks directory
```

#### `task:show`
Display a task.

```bash
bb5 task:show <task_id> [options]

Options:
  -d, --directory DIR    Tasks directory
  -f, --format FORMAT    Output format (markdown|json|summary)
```

#### `task:sync`
Sync tasks to GitHub.

```bash
bb5 task:sync <task_file> [options]

Options:
  -e, --epic-issue NUM   Epic issue number
  --dry-run              Show what would be created
```

### GitHub Commands

#### `github:sync-epic`
Sync epic to GitHub issue.

```bash
bb5 github:sync-epic <epic_file> [options]

Options:
  --dry-run              Show what would be created
```

#### `github:sync-task`
Sync task to GitHub issue.

```bash
bb5 github:sync-task <task_file> [options]

Options:
  -e, --epic-issue NUM   Epic issue number
  --dry-run              Show what would be created
```

#### `github:update`
Update GitHub issue status.

```bash
bb5 github:update --issue NUM [options]

Options:
  --status STATUS        New status
  --comment TEXT         Add comment
```

#### `github:status`
Check sync status.

```bash
bb5 github:status [options]

Options:
  -e, --epic EPIC_ID     Show epic status
```

## Best Practices

### PRD Creation

1. **Start with First Principles**
   - Clearly define the problem
   - List assumptions explicitly
   - Identify fundamental truths

2. **Be Specific with Success Metrics**
   - Use measurable criteria
   - Include baseline and target
   - Define how to measure

3. **Write Complete User Stories**
   - Use the "As a... I want... So that..." format
   - Focus on user value
   - Keep stories independent

### Epic Generation

1. **Consider Multiple Options**
   - Always evaluate 2-3 alternatives
   - Document trade-offs
   - Explain your reasoning

2. **Break Down Components**
   - Each component should have a single responsibility
   - Components should be loosely coupled
   - Define interfaces between components

3. **Think About Testing**
   - Design for testability
   - Consider test data needs
   - Plan for integration testing

### Task Breakdown

1. **Make Tasks Independently Valuable**
   - Each task should deliver value
   - Avoid tasks that are too large
   - Consider parallel execution

2. **Define Clear Acceptance Criteria**
   - Criteria should be testable
   - Include edge cases
   - Consider error conditions

3. **Estimate Realistically**
   - Consider complexity, not just size
   - Account for testing and review
   - Build in contingency

### GitHub Sync

1. **Use Structured Comments**
   - Follow CCPM progress format
   - Update regularly
   - Be specific about blockers

2. **Maintain Traceability**
   - Link issues to PRDs and Epics
   - Reference related tasks
   - Document decisions

## Troubleshooting

### PRD Validation Fails

**Problem**: PRD validation shows errors

**Solutions**:
- Ensure all required sections are present
- Check that user stories follow the correct format
- Verify success metrics are measurable
- Run with `-v` flag for detailed error messages

### Epic Generation Fails

**Problem**: Epic creation fails or produces poor results

**Solutions**:
- Ensure PRD is complete and validated
- Check that requirements are clear
- Review technical decisions in generated epic
- Manually edit the epic to improve quality

### Task Estimation Seems Off

**Problem**: Task estimates are too high or low

**Solutions**:
- Review complexity keywords in task descriptions
- Adjust complexity weights in config
- Provide more detailed component descriptions
- Manually edit estimates after generation

### GitHub Sync Fails

**Problem**: GitHub sync fails with authentication error

**Solutions**:
- Verify GITHUB_TOKEN is set correctly
- Check token has necessary permissions
- Ensure repository exists and is accessible
- Verify repo owner/name in config

### Dependencies Not Detected

**Problem**: Tasks don't have expected dependencies

**Solutions**:
- Ensure file paths are specified in epic components
- Check that file paths overlap between tasks
- Manually add dependencies after generation
- Review dependency detection in task agent

## Advanced Usage

### Custom Configuration

Create `.blackbox5/config.yml`:

```yaml
github:
  token: ${GITHUB_TOKEN}
  repo_owner: your_org
  repo_name: your_repo
  enable_auto_sync: false
  create_draft_prs: true

validation:
  strict_mode: false
  require_estimates: true
  require_acceptance_criteria: true
  max_task_duration_hours: 40

agent:
  model: claude-opus-4-5-20251101
  temperature: 0.7
  max_tokens: 4096

logging:
  level: INFO
  console: true
  file: .blackbox5/pipeline.log
```

### Programmatic Usage

```python
from engine.spec_driven.prd_agent import PRDAgent
from engine.spec_driven.epic_agent import EpicAgent
from engine.spec_driven.task_agent import TaskAgent
from engine.spec_driven.config import load_config

# Load configuration
config = load_config()

# Create PRD
prd_agent = PRDAgent(config)
prd = prd_agent.create_prd(
    title="My Feature",
    description="Feature description",
    interactive=False
)

# Generate Epic
epic_agent = EpicAgent(config)
epic = epic_agent.create_epic(prd)

# Generate Tasks
task_agent = TaskAgent(config)
task_doc = task_agent.create_tasks(epic, prd)

# Save artifacts
prd_agent.save_prd(prd, config.paths.prds_dir)
epic_agent.save_epic(epic, config.paths.specs_dir)
task_agent.save_task_document(task_doc, config.paths.specs_dir)
```

## Contributing

To improve the pipeline:

1. Review the code in `.blackbox5/engine/spec_driven/`
2. Add tests to `.blackbox5/tests/`
3. Update documentation
4. Submit pull request

## Support

For issues or questions:
- Check troubleshooting section
- Review test files for examples
- Open an issue on GitHub

## License

Part of the BlackBox5 framework.
