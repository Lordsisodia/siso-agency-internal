# Task Storage Format & Category Design

**Created:** 2026-01-18
**Status:** Design Specification
**Purpose:** Optimal task storage for AI accessibility and semantic linking

---

## Executive Summary

### Decision: **YAML Frontmatter + Markdown Body**

**Rationale:** Based on analysis of existing BlackBox5 patterns:
- ✅ All templates use YAML frontmatter (`---`) + markdown body
- ✅ All existing tasks use this format (`TASK-YYYY-MM-DD-XXX.md`)
- ✅ Agents already trained to parse this structure
- ✅ Human-readable AND machine-parseable
- ✅ Supports rich documentation in body
- ✅ YAML handles complex nested structures better than JSON

**Storage Pattern:**
```
.blackbox5/tasks/
├── backlog/           # Tasks not yet prioritized
├── active/            # Currently being worked on
├── review/            # Awaiting review
├── done/              # Completed
└── archived/          # Old/deferred
```

Each task: `TASK-[ID].md` with YAML frontmatter + markdown content

---

## Format Specification

### Task File Format

```markdown
---
# YAML Frontmatter (Machine-Readable)
id: TASK-2026-01-18-001
title: Implement User Authentication
status: proposed
priority: high
complexity: moderate
estimated_hours: 8
category: feature
subcategory: authentication
tags:
  - auth
  - security
  - jwt
  - api
created_at: '2026-01-18T10:30:00Z'
updated_at: '2026-01-18T10:30:00Z'
created_by: human
assigned_to: null
tier: 3
workflow: standard

# Semantic Links
relates_to:
  - TASK-2026-01-17-045
  - TASK-2026-01-15-012
blocks:
  - TASK-2026-01-19-003
blocked_by:
  - TASK-2026-01-17-050
depends_on:
  - PRD-001-user-auth
  - EPIC-001-user-management
parent_epic: EPIC-001-user-management
parent_prd: PRD-001-user-auth

# Classification
domain: backend
tech_stack:
  - python
  - fastapi
  - postgresql
  - jwt
risk_level: medium
confidence: 0.8

# Workflow State
state:
  current: proposed
  previous: null
  history:
    - timestamp: '2026-01-18T10:30:00Z'
      from: null
      to: proposed
      reason: Initial creation

# Metadata
metadata:
  source: github_issue
  github_issue_url: https://github.com/...
  research_completed: true
  first_principles_analyzed: true
---

# Markdown Body (Human-Readable + AI Context)

## Overview

Implement JWT-based user authentication system with login, logout, and token refresh.

## Context

### Why This Task
Users need secure access to the application. Current system has no authentication.

### Business Value
- Secure user access
- Foundation for user-specific features
- Compliance with security requirements

## Technical Approach

### Components
1. **AuthService** - Authentication logic
2. **JWTMiddleware** - Token validation
3. **LoginController** - Login endpoint
4. **UserController** - User management

### API Endpoints
- POST /auth/login
- POST /auth/logout
- POST /auth/refresh
- GET /auth/me

## Acceptance Criteria
- [ ] Users can login with email/password
- [ ] JWT tokens are valid for 1 hour
- [ ] Refresh tokens work for 30 days
- [ ] Failed login attempts are logged
- [ ] Password hashing uses bcrypt
- [ ] Tokens include required claims

## Implementation Notes
- Use FastAPI security schemes
- Store refresh tokens in database
- Implement token blacklist for logout
- Rate limit login attempts

## Testing Plan
- Unit tests for AuthService
- Integration tests for endpoints
- Security tests for common vulnerabilities

## Risk Mitigation
- Use proven libraries (PyJWT, python-jose)
- Follow OWASP guidelines
- Security review before deployment

## References
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- PRD-001-user-auth (Section 3.2)
- Internal auth pattern library
```

---

## Semantic Category System

### Problem with Fixed Categories

The original 4-category system (Long-term Goals, Feature Ideas, Issues, Maintenance) is **too limiting**. Tasks have multiple dimensions:

1. **Purpose** - Why does this exist?
2. **Domain** - What area does it affect?
3. **Type** - What kind of work is it?
4. **Priority** - How urgent is it?
5. **Complexity** - How hard is it?
6. **Workflow** - What process should it follow?

### Solution: Multi-Dimensional Classification

#### Dimension 1: Category (Purpose)

```yaml
category:
  type: enum
  values:
    # Strategic Categories
    - vision           # Long-term product vision
    - research         # Research/investigation tasks
    - planning         # Planning and design tasks

    # Development Categories
    - feature          # New features
    - enhancement      # Improving existing features
    - refactor         # Code restructuring
    - bugfix           # Fixing bugs
    - performance      # Performance optimization
    - security         # Security improvements
    - testing          # Test creation/improvement

    # Infrastructure Categories
    - infrastructure   # Infrastructure work
    - devops          # DevOps/CI/CD
    - monitoring      # Monitoring/observability
    - documentation   # Documentation work

    # Maintenance Categories
    - maintenance      # Regular maintenance
    - cleanup         # Code cleanup
    - migration       # Data/schema migrations
    - upgrade         # Dependency upgrades

    # Process Categories
    - process         # Process improvements
    - tooling         # Tool development
    - automation      # Automation tasks
```

#### Dimension 2: Subcategory (Domain)

```yaml
subcategory:
  type: enum
  values:
    # Domain-Specific
    - authentication   # Auth-related
    - authorization    # Permission-related
    - database         # Database work
    - api              # API endpoints
    - ui               # User interface
    - ux               # User experience
    - integration      # Third-party integrations
    - data             # Data processing
    - analytics        # Analytics/reporting
    - email            # Email systems
    - notification     # Push/notifications
    - search           # Search functionality
    - file             # File handling
    - payment          # Payment processing
    - logistics        # Logistics/shipping
    - inventory        # Inventory management

    # Technical
    - frontend         # Frontend work
    - backend          # Backend work
    - mobile           # Mobile apps
    - web              # Web applications
    - cli              # Command-line tools
    - library          # Library development
    - framework        # Framework-level work
```

#### Dimension 3: Domain (Technical Area)

```yaml
domain:
  type: enum
  values:
    - product          # Product features
    - engineering      # Engineering tasks
    - design           # Design work
    - operations       # Ops/DevOps
    - security         # Security work
    - data             # Data engineering
    - research         # Research work
    - testing          # QA/testing
    - documentation    # Documentation
    - process          # Process improvements
```

#### Dimension 4: Tech Stack

```yaml
tech_stack:
  type: array
  values:
    - python
    - typescript
    - react
    - fastapi
    - postgresql
    - redis
    - docker
    - kubernetes
    - aws
    - gcp
    # ... etc
```

#### Dimension 5: Workflow Tier (Auto-classified)

```yaml
tier:
  type: integer
  range: 1-4
  description: Auto-classified complexity tier
  values:
    1: quick_fix       # < 1 hour
    2: simple          # 1-4 hours
    3: standard        # 4-16 hours
    4: complex         # 16+ hours

workflow:
  type: enum
  values:
    - quick_fix        # Direct to Git
    - light_prd        # Simple PRD
    - standard         # Full PRD flow
    - complex          # Full + Architecture Review
```

### Semantic Linking System

#### Relationship Types

```yaml
# Task Relationships
relates_to:
  - TASK-XXX          # Related but not dependent

blocks:
  - TASK-XXX          # This task blocks another

blocked_by:
  - TASK-XXX          # This task is blocked by another

depends_on:
  - PRD-XXX           # Depends on PRD
  - EPIC-XXX          # Depends on Epic
  - TASK-XXX          # Depends on another task

duplicates:
  - TASK-XXX          # Duplicate of another task

supersedes:
  - TASK-XXX          # Replaces an old task

superseded_by:
  - TASK-XXX          # Replaced by a new task

# Parent-Child Hierarchy
parent_prd:
  - PRD-XXX

parent_epic:
  - EPIC-XXX

parent_feature:
  - FEATURE-XXX

subtasks:
  - TASK-XXX
  - TASK-XXX
```

### Complete Example: Semantically-Rich Task

```yaml
---
id: TASK-2026-01-18-001
title: Implement JWT Authentication
status: proposed

# Multi-Dimensional Classification
category: feature
subcategory: authentication
domain: backend
tech_stack:
  - python
  - fastapi
  - postgresql
  - jwt

# Workflow Classification (Auto-computed)
tier: 3
workflow: standard
complexity: moderate
estimated_hours: 8

# Priority & Risk
priority: high
risk_level: medium
confidence: 0.8

# Semantic Links
relates_to:
  - TASK-2026-01-17-045  # User management
  - TASK-2026-01-15-012  # API security

blocks:
  - TASK-2026-01-19-003  # User profile (needs auth first)

blocked_by:
  - TASK-2026-01-17-050  # Database schema

depends_on:
  - PRD-001-user-auth
  - EPIC-001-user-management

parent_prd: PRD-001-user-auth
parent_epic: EPIC-001-user-management

# Metadata
tags:
  - auth
  - security
  - jwt
  - api
  - high-priority

created_at: '2026-01-18T10:30:00Z'
created_by: human
assigned_to: null

# Workflow State Tracking
state:
  current: proposed
  previous: null
  history:
    - timestamp: '2026-01-18T10:30:00Z'
      from: null
      to: proposed
      reason: Initial creation

metadata:
  source: feature_request
  stakeholder: product
  research_completed: true
  first_principles_analyzed: true
  github_issue: "https://github.com/..."
  jira_ticket: "AUTH-123"
```

---

## AI Accessibility Features

### 1. Structured Frontmatter

AI agents can parse YAML directly without markdown parsing:

```python
import yaml
from pathlib import Path

def load_task(task_path: Path) -> dict:
    """Load task with frontmatter parsing"""
    content = task_path.read_text()

    # Split on first ---
    parts = content.split('---', 2)

    frontmatter = yaml.safe_load(parts[1])
    body = parts[2] if len(parts) > 2 else ""

    return {
        "metadata": frontmatter,
        "content": body
    }
```

### 2. Rich Semantic Relationships

AI can traverse relationships:

```python
def find_blocked_tasks(task_id: str) -> list:
    """Find all tasks blocked by this task"""
    task = load_task(f"tasks/{task_id}.md")

    blocked = []
    for related_id in task["metadata"].get("blocks", []):
        related = load_task(f"tasks/{related_id}.md")
        blocked.append({
            "id": related_id,
            "title": related["metadata"]["title"],
            "priority": related["metadata"]["priority"]
        })

    return blocked
```

### 3. Multi-Dimensional Queries

```python
def query_tasks(
    category: str = None,
    subcategory: str = None,
    domain: str = None,
    tech_stack: list = None,
    status: str = None,
    tier: int = None
) -> list:
    """Query tasks across multiple dimensions"""
    results = []

    for task_file in Path("tasks/").glob("TASK-*.md"):
        task = load_task(task_file)
        meta = task["metadata"]

        # Filter on all dimensions
        if category and meta.get("category") != category:
            continue
        if subcategory and meta.get("subcategory") != subcategory:
            continue
        if domain and meta.get("domain") != domain:
            continue
        if tech_stack and not any(t in meta.get("tech_stack", []) for t in tech_stack):
            continue
        if status and meta.get("status") != status:
            continue
        if tier and meta.get("tier") != tier:
            continue

        results.append(task)

    return results
```

### 4. Contextual Search

```python
def search_tasks(query: str) -> list:
    """Search in both metadata and content"""
    results = []

    for task_file in Path("tasks/").glob("TASK-*.md"):
        task = load_task(task_file)
        meta = task["metadata"]
        content = task["content"].lower()

        # Search in title, tags, tech_stack
        query_lower = query.lower()

        match = False
        if query_lower in meta["title"].lower():
            match = True
        elif any(query_lower in tag.lower() for tag in meta.get("tags", [])):
            match = True
        elif any(query_lower in tech.lower() for tech in meta.get("tech_stack", [])):
            match = True
        elif query_lower in content:
            match = True

        if match:
            results.append(task)

    return results
```

---

## Storage Directory Structure

### Hierarchical Organization

```
.blackbox5/tasks/
│
├── backlog/              # Not yet prioritized
│   ├── TASK-2026-01-18-001.md
│   └── TASK-2026-01-18-002.md
│
├── active/               # Currently in progress
│   ├── TASK-2026-01-17-045.md
│   └── TASK-2026-01-17-050.md
│
├── review/               # Awaiting review/testing
│   ├── TASK-2026-01-16-033.md
│   └── TASK-2026-01-16-038.md
│
├── done/                 # Completed
│   ├── 2026/
│   │   ├── 01-week/
│   │   │   ├── TASK-2026-01-15-012.md
│   │   │   └── TASK-2026-01-15-089.md
│   │   └── 02-week/
│   └── 2025/
│       └── ...
│
└── archived/             # Old/deferred
    ├── TASK-2025-12-10-001.md
    └── TASK-2025-11-05-045.md
```

### Index File

```
.blackbox5/tasks/index.yaml
```

```yaml
# Task Index - Fast lookup without file parsing
version: '1.0'
last_updated: '2026-01-18T10:30:00Z'

tasks:
  TASK-2026-01-18-001:
    title: Implement JWT Authentication
    status: proposed
    category: feature
    subcategory: authentication
    tier: 3
    priority: high
    path: backlog/TASK-2026-01-18-001.md
    created_at: '2026-01-18T10:30:00Z'

  TASK-2026-01-17-045:
    title: User Profile Management
    status: active
    category: feature
    subcategory: api
    tier: 3
    priority: high
    path: active/TASK-2026-01-17-045.md
    created_at: '2026-01-17T14:20:00Z'

# Statistics
stats:
  total: 150
  by_status:
    proposed: 45
    active: 12
    review: 8
    done: 75
    archived: 10
  by_category:
    feature: 60
    bugfix: 25
    enhancement: 30
    refactor: 15
    maintenance: 10
    infrastructure: 10
  by_tier:
    1: 40
    2: 50
    3: 45
    4: 15
```

---

## Advantages Over JSON

### YAML Benefits

1. **Human-Readable Comments**
   ```yaml
   # This task is blocked by database migration
   blocked_by:
     - TASK-2026-01-17-050  # Database schema update
   ```

2. **Multi-Line Strings**
   ```yaml
   description: |
     This is a multi-line
     description that preserves
     formatting and is easier
     to read than JSON escapes
   ```

3. **Better for Complex Structures**
   ```yaml
   state:
     current: proposed
     history:
       - from: null
         to: proposed
         timestamp: '2026-01-18T10:30:00Z'
         reason: Initial creation
         metadata:
           source: github_issue
           author: shaan
   ```

4. **Compatible with Existing Patterns**
   - Already used in all templates
   - All agents trained on it
   - Standard in BlackBox5

### Markdown Body Benefits

1. **Rich Documentation**
   - Headers, lists, code blocks
   - Tables for structured data
   - Images/diagrams support

2. **AI Context**
   - Natural language explanations
   - Implementation notes
   - Testing strategies
   - Risk assessments

3. **Human Collaboration**
   - Easy to edit in any editor
   - Git-friendly diffs
   - Commentable in PRs

---

## Migration Strategy

### Phase 1: Dual Format Support
- Support both JSON and YAML
- Read from any format
- Write to YAML

### Phase 2: Gradual Migration
- Convert tasks as they're touched
- Tool to bulk convert

### Phase 3: YAML-Only
- Deprecate JSON support
- All new tasks in YAML

---

## Conclusion

**Recommended Format: YAML Frontmatter + Markdown Body**

This format:
- ✅ Aligns with existing BlackBox5 patterns
- ✅ Optimal for AI parsing (structured YAML)
- ✅ Optimal for human readability (markdown body)
- ✅ Supports rich semantic relationships
- ✅ Multi-dimensional classification
- ✅ Easy to query and traverse
- ✅ Future-proof and extensible

**Next Step:** Design the Adaptive Flow Router architecture
