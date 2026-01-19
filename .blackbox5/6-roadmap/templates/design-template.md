---
id: "DESIGN-XXXX"
title: "Improvement Title - Design"
slug: "improvement-title-design"
status: "design"
stage: "02-design"

# Metadata
created_at: "2026-01-19T10:30:00Z"
created_by: "human" # or agent name
updated_at: "2026-01-19T10:30:00Z"

# Classification
category: "feature" # feature, bugfix, refactor, research, infrastructure
domain: "agents"    # agents, skills, memory, tools, cli, infrastructure, testing, documentation
priority: "medium"    # critical, high, medium, low, backlog

# Relationships
depends_on: []      # IDs this depends on
blocks: []          # IDs this blocks
blocked_by: []      # IDs blocking this
relates_to: []      # Related IDs
parent_improvement: null  # Part of larger improvement

# Tasks
related_tasks: []   # Links to .blackbox5/tasks/
parent_prd: null
parent_epic: null

# Effort Tracking
estimated_hours: null
actual_hours: null
progress: 0.0       # 0.0 to 1.0

# Review
review_status: "not-reviewed" # not-reviewed, in-review, approved, rejected
reviewed_by: null
reviewed_at: null
approval_notes: null

# Tags
tags: []

# Links
proposal_link: null    # Path to proposal file
research_link: null    # Path to research file
design_link: null      # Path to this file
plan_link: null        # Path to plan file
active_link: null      # Path to active file
completion_link: null  # Path to completion file

# Git Integration
git_branch: null
git_pr: null

# Custom Metadata
metadata: {}
---

# Design: [Improvement Title]

## Overview

High-level summary of the design.

## Architecture

### System Architecture

How does this fit into the existing system?

```mermaid
graph TB
    A[Existing System] --> B[New Component]
    B --> C[Other Systems]
```

### Component Design

What are the main components? How do they interact?

### Data Flow

How does data flow through the system?

## Technical Specifications

### APIs and Interfaces

What APIs or interfaces are we defining?

### Data Structures

What data structures are we using?

### Algorithms

What algorithms are relevant?

## Implementation Details

### Files to Modify

- `path/to/file1` - What changes?
- `path/to/file2` - What changes?

### Files to Create

- `path/to/newfile` - Purpose

### Dependencies

What new dependencies do we need?

## Testing Strategy

How will we test this?

- Unit tests:
- Integration tests:
- E2E tests:

## Risk Assessment

### Technical Risks

What could go wrong technically?

### Operational Risks

What could go wrong in production?

### Mitigation Strategies

How will we mitigate these risks?

## Rollout Plan

How will we roll this out?

### Phase 1:
### Phase 2:
### Phase 3:

## Design Review

- [ ] Technical design is sound
- [ ] Architecture is appropriate
- [ ] Risks are identified and mitigated
- [ ] Implementation approach is clear
- [ ] Testing strategy is adequate

## Next Steps

- [ ] Move to planned
- [ ] Return to research (more info needed)
