# BlackBox5 Roadmap System - Detailed Design

**Date:** 2026-01-19
**Status:** Ready for Implementation
**Version:** 2.0 (Detailed)

---

## Overview

This document provides the complete design for BlackBox5's improvement roadmap system, incorporating best practices from 15 frameworks and specifically addressing:

1. **Semantic linking** - How all artifacts relate to each other
2. **Gate criteria** - Specific validation at each stage transition
3. **Subfolder structure** - Detailed organization for 80-90% of data types
4. **Data flow** - What information moves through the system

---

## 1. Semantic Linking System

### Link Types

We support 12 types of semantic relationships:

#### Hierarchical Links

```yaml
# Parent-child relationships
parent_improvement: "PROPOSAL-001"     # This is part of a larger effort
parent_prd: "PRD-001"                  # Part of this PRD
parent_epic: "EPIC-002"                # Part of this Epic
parent_framework: "BMAD"                # Part of this framework

# Child tracking
children:
  - "PROPOSAL-002"                      # Sub-improvements
  - "PROPOSAL-003"
  - "TASK-2026-01-19-001"               # Implementation tasks
```

#### Dependency Links

```yaml
# Hard dependencies (blocking)
depends_on:
  - id: "COMPLETED-0005"
    type: "blocking"                    # Must complete first
    reason: "Requires CLI infrastructure"
    auto_unblock: true                  # Auto-unblock when complete

# Soft dependencies (optional)
recommends:
  - id: "COMPLETED-0003"
    type: "recommended"                 # Should review first
    reason: "Contains relevant patterns"

# Blocking relationships
blocks:
  - id: "PROPOSAL-002"
    type: "blocking"                    # Prevents this from starting
    reason: "Async execution must exist first"
    notify: ["tech_lead", "product_owner"]  # Who to notify

# Blocked by
blocked_by:
  - id: "PROPOSAL-001"
    type: "blocking"
    reason: "Waiting for proposal approval"
    estimated_resolution: "2026-01-20"
```

#### Associative Links

```yaml
# Cross-references (no dependency)
relates_to:
  - id: "RESEARCH-001"
    type: "similar"                     # Similar approach
  - id: "DESIGN-003"
    type: "alternative"                 # Alternative approach
  - id: "COMPLETED-008"
    type: "reference"                   # Reference material

# See also
see_also:
  - "EXTERNAL-ARTICLE-001"
  - "FRAMEWORK-RESEARCH-002"
```

#### Temporal Links

```yaml
# Timing relationships
after: "RESEARCH-001"                   # Do this after
before: "IMPLEMENTATION-003"            # Do this before
concurrent_with:
  - "PROPOSAL-004"                      # Can work in parallel
  conflicts_with: []                     # No conflicts = parallel OK
```

#### Type Links

```yaml
# Implementation relationships
implements:
  - "PROPOSAL-001"                      # Implements this proposal
  - "DESIGN-002"                        # Implements this design

extends: "BASE-FEATURE-001"              # Extends existing work
refines: "DESIGN-003"                   # Improves existing design
replaces:
  - "DEPRECATED-001"                    # Supersedes old work
deprecates: "OLD-WAY-002"               # Makes obsolete
```

### Link Representation

**In YAML Frontmatter:**
```yaml
---
links:
  # Hierarchical
  parent_improvement: "PROPOSAL-001"
  parent_prd: "PRD-001"
  parent_epic: "EPIC-002"
  children: []

  # Dependencies
  depends_on:
    - id: "COMPLETED-0005"
      type: "blocking"
      reason: "Requires CLI infrastructure"
  blocks: []
  blocked_by: []
  recommends: []

  # Associative
  relates_to: []
  see_also: []

  # Temporal
  after: null
  before: null
  concurrent_with: []
  conflicts_with: []

  # Type
  implements: []
  extends: null
  refines: []
  replaces: []
  deprecates: []
---
```

**Central Link Registry (INDEX.yaml):**
```yaml
links:
  dependencies:
    - from: "PROPOSAL-002"
      to: "PROPOSAL-001"
      type: "depends_on"
      created_at: "2026-01-19"

  blocking:
    - from: "PROPOSAL-001"
      to: "PROPOSAL-002"
      type: "blocks"
      created_at: "2026-01-19"

  implements:
    - from: "DESIGN-003"
      to: "PROPOSAL-001"
      type: "implements"
      created_at: "2026-01-19"
```

### Bidirectional Consistency

**Rule:** If A blocks B, then B must be blocked_by A

```python
def create_link(from_id: str, to_id: str, link_type: str, reason: str):
    """Create bidirectional link"""
    # Add forward link
    add_forward_link(from_id, to_id, link_type, reason)

    # Add reverse link automatically
    reverse_map = {
        "depends_on": "blocks",
        "blocks": "blocked_by",
        "implements": "implemented_by",
        "extends": "extended_by",
        "refines": "refined_by",
        "replaces": "replaced_by",
    }

    if link_type in reverse_map:
        reverse_type = reverse_map[link_type]
        add_reverse_link(to_id, from_id, reverse_type, reason)

    # Validate no circular dependencies
    if creates_cycle(from_id, to_id):
        raise ValueError(f"Link would create circular dependency")
```

---

## 2. Gate Criteria System

### Gate Philosophy

**From framework analysis, we adopt:**

1. **Dependency-based enablement** (OpenSpec OPSX): Dependencies show what's **possible**, not what's **forced**
2. **Fluid iteration**: Can always go back and update earlier artifacts
3. **Automated validation**: Check what can be checked automatically
4. **Human judgment**: Require approval for critical decisions

### Gate Structure

Each gate has:

```yaml
gate:
  name: "Gate Name"
  from: "00-proposed"
  to: "01-research"

  # Criteria (all must pass)
  criteria:
    - name: "Criterion name"
      required: true                    # Must pass
      check_type: "automated|manual|conditional"
      validation: "specific validation"
      failure_action: "what to do if fails"

  # Overall gate settings
  on_pass: "auto_move|manual_approval"   # What happens when all criteria pass
  on_fail: "reject|retry|return"          # What happens when criteria fail

  # Notifications
  notify:
    on_pass: ["stakeholders"]
    on_fail: ["submitter", "reviewers"]
```

### Specific Gate Definitions

#### Gate 1: Proposed → Research

```yaml
gate:
  name: "Initial Triage"
  from: "00-proposed"
  to: "01-research"
  on_pass: "auto_move"
  on_fail: "manual_review"

  criteria:
    # 1. Proposal clarity
    - name: "Idea clearly articulated"
      required: true
      check_type: "manual"
      validation: |
        Proposal must answer:
        - What problem are we solving?
        - Who is this for?
        - Why now?
        - What's the proposed approach?
      failure_action: "Return to submitter for clarification"

    # 2. Category assigned
    - name: "Category and domain identified"
      required: true
      check_type: "automated"
      validation: |
        field_exists: "category"
        allowed_values: ["feature", "bugfix", "refactor", "research", "infrastructure"]
        field_exists: "domain"
        allowed_values: ["agents", "skills", "memory", "tools", "cli", "infrastructure"]
      failure_action: "Auto-reject with guidance"

    # 3. Priority assessment
    - name: "Initial priority assessed"
      required: true
      check_type: "manual"
      validation: |
        field_exists: "priority"
        allowed_values: ["critical", "high", "medium", "low", "backlog"]
        priority_justification_exists: true
      failure_action: "Return to submitter for priority assessment"

    # 4. Not a duplicate
    - name: "Not a duplicate of existing work"
      required: true
      check_type: "automated"
      validation: |
        query: "INDEX.yaml"
        condition: "no_matching_title_or_slug_or_description"
        similarity_threshold: 0.85
      failure_action: "Link to existing improvement, mark as duplicate"

    # 5. Within scope
    - name: "Within BlackBox5 scope"
      required: true
      check_type: "manual"
      validation: |
        Clearly relates to improving BlackBox5 system
        Not a project-specific improvement (those go in project memory)
      failure_action: "Redirect to appropriate project or reject"

  notify:
    on_pass: ["submitter"]
    on_fail: ["submitter", "tech_lead"]
```

#### Gate 2: Research → Design

```yaml
gate:
  name: "Feasibility Confirmation"
  from: "01-research"
  to: "02-design"
  on_pass: "manual_approval"
  on_fail: "return_to_research"

  criteria:
    # 1. Feasibility demonstrated
    - name: "Feasibility study completed"
      required: true
      check_type: "automated"
      validation: |
        file_exists: "RESEARCH-{id}-{slug}/findings/feasibility.md"
        content_checks:
          - section_exists: "Technical Feasibility"
          - section_exists: "Business Value"
          - section_exists: "Cost Estimate"
          - has_conclusion: true
          - conclusion_is_one_of: ["feasible", "feasible_with_conditions", "not_feasible"]
      failure_action: "Complete feasibility study"

    # 2. Technology options evaluated
    - name: "Technology options evaluated"
      required: true
      check_type: "automated"
      validation: |
        file_exists: "RESEARCH-{id}-{slug}/findings/technology_options.md"
        min_options: 2
        content_checks:
          - each_option_has: ["name", "pros", "cons", "suitability"]
          - has_recommendation: true
      failure_action: "Evaluate at least 2 technology options"

    # 3. Risks identified
    - name: "Risks identified and documented"
      required: true
      check_type: "automated"
      validation: |
        file_exists: "RESEARCH-{id}-{slug}/risks/technical_risks.md"
        min_risks: 1
        content_checks:
          - each_risk_has: ["description", "impact", "probability"]
      failure_action: "Document at least 1 risk"

    # 4. Mitigation strategies
    - name: "Mitigation strategies proposed"
      required: true
      check_type: "automated"
      validation: |
        file_exists: "RESEARCH-{id}-{slug}/risks/mitigation_strategies.md"
        validation: "each_risk_has_mitigation"
      failure_action: "Propose mitigation for each identified risk"

    # 5. Proof of concept (if required)
    - name: "Proof of concept completed"
      required: false
      check_type: "conditional"
      condition: "estimated_hours > 40 OR priority == 'critical'"
      then:
        validation: |
          directory_exists: "RESEARCH-{id}-{slug}/findings/proof_of_concept"
          file_exists: "RESEARCH-{id}-{slug}/findings/proof_of_concept/README.md"
          content_checks:
            - has_approach: true
            - has_results: true
            - has_conclusion: true
      failure_action: "Complete proof of concept"

    # 6. Feasibility confirmed
    - name: "Feasibility confirmed"
      required: true
      check_type: "manual"
      validation: |
        Based on research findings, this is feasible to implement
        Recommended to proceed to design
      failure_action: "Move to 06-cancelled with reason"

  notify:
    on_pass: ["tech_lead", "architect"]
    on_fail: ["submitter", "tech_lead"]
```

#### Gate 3: Design → Planned

```yaml
gate:
  name: "Design Review"
  from: "02-design"
  to: "03-planned"
  on_pass: "manual_approval"
  on_fail: "return_to_design"

  criteria:
    # 1. Technical design complete
    - name: "Technical design document complete"
      required: true
      check_type: "automated"
      validation: |
        file_exists: "DESIGN-{id}-{slug}/DESIGN-{id}-{slug}.md"
        content_checks:
          - section_exists: "Overview"
          - section_exists: "System Architecture"
          - section_exists: "Component Design"
          - section_exists: "Data Model"
          - section_exists: "Implementation Strategy"
          - section_exists: "Testing Strategy"
      failure_action: "Complete all required sections"

    # 2. Architecture documented
    - name: "Architecture diagrams created"
      required: true
      check_type: "automated"
      validation: |
        file_exists: "DESIGN-{id}-{slug}/architecture/system_architecture.md"
        content_checks:
          - has_diagrams: true
          - defines_components: true
          - shows_interactions: true
          - shows_data_flow: true
      failure_action: "Create architecture diagrams"

    # 3. API specifications (if applicable)
    - name: "API specifications complete"
      required: false
      check_type: "conditional"
      condition: "has_api_components == true"
      then:
        validation: |
          file_exists: "DESIGN-{id}-{slug}/specs/api_spec.md"
          content_checks:
            - has_endpoints: true
            - has_request_schemas: true
            - has_response_schemas: true
            - has_error_codes: true
      failure_action: "Complete API specifications"

    # 4. Dependencies documented
    - name: "Dependencies identified and documented"
      required: true
      check_type: "automated"
      validation: |
        file_exists: "DESIGN-{id}-{slug}/dependencies.yaml"
        schema_check: "valid_yaml"
        content_checks:
          - has_list: true
          - all_dependencies_exist: true
      failure_action: "Document all dependencies"

    # 5. Security review
    - name: "Security review completed"
      required: true
      check_type: "conditional"
      condition: "handles_user_data == true OR has_authentication == true OR priority == 'critical'"
      then:
        validation: |
          file_exists: "DESIGN-{id}-{slug}/security/threat_model.md"
          content_checks:
            - has_threats: true
            - has_mitigations: true
          approval_required: true
          approvers: ["security_lead"]
      failure_action: "Complete security review"

    # 6. Architecture approval
    - name: "Architecture approved"
      required: true
      check_type: "manual"
      validation: |
        Design is sound, scalable, and maintainable
        Follows BlackBox5 architectural patterns
        Approved by architect
      approval_required: true
      approvers: ["architect"]
      failure_action: "Address architectural concerns"

  notify:
    on_pass: ["tech_lead", "submitter"]
    on_fail: ["submitter", "architect", "tech_lead"]
```

#### Gate 4: Planned → Active

```yaml
gate:
  name: "Ready to Implement"
  from: "03-planned"
  to: "04-active"
  on_pass: "manual_approval"
  on_fail: "continue_planning"

  criteria:
    # 1. Task breakdown complete
    - name: "Tasks created and documented"
      required: true
      check_type: "automated"
      validation: |
        file_exists: "PLAN-{id}-{slug}/tasks/task_breakdown.md"
        content_checks:
          - has_tasks: true
          - min_tasks: 1
          - all_tasks_have_acceptance_criteria: true
          - all_tasks_have_estimates: true
          - all_tasks_linked_to_improvement: true
      failure_action: "Complete task breakdown"

    # 2. Dependencies resolved
    - name: "Dependencies resolved or documented"
      required: true
      check_type: "automated"
      validation: |
        file_exists: "PLAN-{id}-{slug}/tasks/dependencies.yaml"
        schema_check: "valid_yaml"
        content_checks:
          - all_blocking_dependencies_complete: true
          - all_pending_dependencies_have_dates: true
      failure_action: "Resolve blocking dependencies"

    # 3. Resources allocated
    - name: "Resources allocated"
      required: true
      check_type: "automated"
      validation: |
        file_exists: "PLAN-{id}-{slug}/resources/team_assignments.md"
        content_checks:
          - all_critical_tasks_have_assignees: true
          - all_assignments_are_valid: true
      failure_action: "Assign resources to critical tasks"

    # 4. Timeline estimated
    - name: "Timeline estimated"
      required: true
      check_type: "automated"
      validation: |
        file_exists: "PLAN-{id}-{slug}/timeline/schedule.md"
        content_checks:
          - has_start_date: true
          - has_milestones: true
          - min_milestones: 1
          - has_completion_estimate: true
      failure_action: "Create timeline with milestones"

    # 5. Risk mitigation plan
    - name: "Risk mitigation plan in place"
      required: true
      check_type: "automated"
      validation: |
        file_exists: "PLAN-{id}-{slug}/readiness/checklists.md"
        content_checks:
          - all_high_risks_have_mitigation: true
          - all_critical_risks_have_contingency: true
      failure_action: "Create mitigation plans for high/critical risks"

    # 6. Implementation approval
    - name: "Approved to implement"
      required: true
      check_type: "manual"
      validation: |
        Ready to start implementation
        Resources available
        Timeline acceptable
      approval_required: true
      approvers: ["tech_lead", "product_owner"]
      failure_action: "Address planning concerns"

  notify:
    on_pass: ["team", "submitter"]
    on_fail: ["submitter", "tech_lead"]
```

#### Gate 5: Active → Completed

```yaml
gate:
  name: "Implementation Complete"
  from: "04-active"
  to: "05-completed"
  on_pass: "manual_approval"
  on_fail: "continue_implementation"

  criteria:
    # 1. All tasks complete
    - name: "All tasks completed"
      required: true
      check_type: "automated"
      validation: |
        file_exists: "ACTIVE-{id}-{slug}/tasks/task_breakdown.md"
        content_checks:
          - all_tasks_checked: true
          - all_acceptance_criteria_met: true
      failure_action: "Complete all remaining tasks"

    # 2. Tests passing
    - name: "Tests passing"
      required: true
      check_type: "automated"
      validation: |
        file_exists: "ACTIVE-{id}-{slug}/tests/test_results.md"
        content_checks:
          - all_tests_passing: true
          - coverage_threshold_met: 80
          - no_critical_bugs: true
      failure_action: "Fix failing tests"

    # 3. Documentation complete
    - name: "Documentation updated"
      required: true
      check_type: "automated"
      validation: |
        required_docs:
          - "ACTIVE-{id}-{slug}/documentation/user_docs.md"
          - "ACTIVE-{id}-{slug}/documentation/runbook.md"
        conditional_docs:
          - if: "has_api == true"
            then: "ACTIVE-{id-{slug}/documentation/api_docs.md"
      failure_action: "Complete documentation"

    # 4. Code review approved
    - name: "Code review approved"
      required: true
      check_type: "manual"
      validation: |
        Code reviewed by at least 2 people
        All review comments addressed
        Approval from code reviewer and tech lead
      approval_required: true
      approvers: ["code_reviewer", "tech_lead"]
      min_approvals: 2
      failure_action: "Address review feedback"

    # 5. Deployment successful (if required)
    - name: "Deployment successful"
      required: false
      check_type: "conditional"
      condition: "requires_deployment == true"
      then:
        validation: |
          file_exists: "ACTIVE-{id}-{slug}/delivery/deployment.md"
          content_checks:
            - field_exists: "deployment_date"
            - field_exists: "deployment_status"
            - deployment_status_is: "success"
      failure_action: "Fix deployment issues"

    # 6. Metrics recorded
    - name: "Actual metrics recorded"
      required: true
      check_type: "automated"
      validation: |
        file_exists: "COMPLETED-{id}-{slug}/metrics/effort.yaml"
        required_fields:
          - "actual_hours"
          - "completion_date"
          - "quality_score"
      failure_action: "Record actual metrics"

  notify:
    on_pass: ["team", "stakeholders"]
    on_fail: ["submitter", "tech_lead"]
```

### Gate Automation

**Automated Checks:**
```python
# File existence checks
def check_file_exists(improvement, file_pattern):
    """Check if file exists"""
    return glob(file_pattern.format(**improvement.data))

# Field validation
def check_field_exists(improvement, field, allowed_values=None):
    """Check if field exists and has valid value"""
    if field not in improvement.data:
        return False
    if allowed_values:
        return improvement.data[field] in allowed_values
    return True

# Dependency validation
def check_dependencies_resolved(improvement):
    """Check if all dependencies are complete"""
    for dep in improvement.data.get('depends_on', []):
        dep_improvement = load_improvement(dep['id'])
        if dep_improvement.data.get('stage') != '05-completed':
            return False
    return True

# Content validation
def check_content_sections(file, required_sections):
    """Check if markdown file has required sections"""
    content = Path(file).read_text()
    return all(f"## {section}" in content for section in required_sections)
```

**Manual Approvals:**
```yaml
# Request approval
approval_request:
  improvement_id: "PROPOSAL-001"
  gate: "research_to_design"
  requested_by: "submitter"
  requested_at: "2026-01-19T10:00:00Z"
  approvers: ["tech_lead", "architect"]
  min_approvals: 2
  current_approvals: []
  status: "pending"

# Approver response
approval_response:
  approver: "tech_lead"
  improvement_id: "PROPOSAL-001"
  gate: "research_to_design"
  decision: "approved"  # approved, rejected, comments
  comments: "Looks good, proceed to design"
  approved_at: "2026-01-19T11:00:00Z"
```

---

## 3. Subfolder Structure (Detailed)

### Complete Directory Tree

```
.blackbox5/roadmap/
│
├── 00-proposed/
│   └── PROPOSAL-{id}-{slug}/
│       ├── PROPOSAL-{id}-{slug}.md        # Main proposal
│       ├── triage/                          # Initial assessment
│       │   ├── category.md                  # Category assignment
│       │   ├── priority.md                  # Priority assessment
│       │   └── duplicates.md                # Duplicate check
│       └── attachments/                     # Supporting materials
│           ├── diagrams/
│           ├── screenshots/
│           └── references/
│
├── 01-research/
│   └── RESEARCH-{id}-{slug}/
│       ├── RESEARCH-{id}-{slug}.md         # Main research
│       ├── findings/                        # Research outputs
│       │   ├── feasibility.md               # Feasibility study
│       │   ├── technology_options.md        # Tech comparison
│       │   ├── market_research.md           # Competitive analysis
│       │   ├── proof_of_concept/            # POC code
│       │   │   ├── README.md
│       │   │   └── code/
│       │   └── recommendations.md            # Recommendations
│       ├── risks/                           # Risk analysis
│       │   ├── technical_risks.md
│       │   ├── business_risks.md
│       │   └── mitigation_strategies.md
│       └── sources/                         # Research sources
│           ├── articles/
│           ├── papers/
│           └── references.md
│
├── 02-design/
│   └── DESIGN-{id}-{slug}/
│       ├── DESIGN-{id}-{slug}.md           # Main design
│       ├── architecture/                    # Architecture
│       │   ├── system_architecture.md       # High-level
│       │   ├── component_diagram.md         # Components
│       │   ├── sequence_diagrams.md         # Interactions
│       │   └── data_flow.md                 # Data flow
│       ├── specs/                           # Specifications
│       │   ├── api_spec.md                  # API contracts
│       │   ├── data_models.md               # Data structures
│       │   └── interfaces.md                # Interfaces
│       ├── security/                        # Security
│       │   ├── threat_model.md              # Threats
│       │   ├── authentication.md            # Auth design
│       │   └── authorization.md             # Permissions
│       ├── performance/                     # Performance
│       │   ├── requirements.md              # Perf requirements
│       │   ├── estimates.md                # Perf estimates
│       │   └── testing_strategy.md         # How to test
│       └── risks/                           # Design risks
│           ├── technical_risks.md
│           ├── performance_risks.md
│           └── mitigation.md
│
├── 03-planned/
│   └── PLAN-{id}-{slug}/
│       ├── PLAN-{id}-{slug}.md             # Main plan
│       ├── tasks/                           # Task breakdown
│       │   ├── task_breakdown.md            # Task list
│       │   ├── dependencies.yaml            # Dependencies
│       │   ├── estimates.md                 # Effort estimates
│       │   └── acceptance_criteria.md       # Definition of done
│       ├── timeline/                        # Timeline
│       │   ├── milestones.md                # Key milestones
│       │   ├── schedule.md                  # Implementation schedule
│       │   ├── critical_path.md             # Critical path
│       │   └── buffer_plan.md               # Buffers for uncertainty
│       ├── resources/                       # Resources
│       │   ├── team_assignments.md          # Who does what
│       │   ├── equipment.md                 # Hardware/tools
│       │   └── budget.md                    # Cost estimates
│       ├── readiness/                       # Pre-implementation
│       │   ├── checklists.md                # Checklists
│       │   ├── approval.md                  # Approval status
│       │   └── gate_status.md               # Gate criteria status
│       └── risk_management/                 # Risk management
│           ├── risk_register.md             # All risks
│           ├── mitigation_plans.md          # Mitigation strategies
│           └── contingency_plans.md         # Plan B options
│
├── 04-active/
│   └── ACTIVE-{id}-{slug}/
│       ├── ACTIVE-{id}-{slug}.md           # Main tracking
│       ├── progress/                        # Progress tracking
│       │   ├── daily_updates.md             # Daily notes
│       │   ├── weekly_summaries.md          # Weekly summaries
│       │   ├── milestones.md                # Milestone tracking
│       │   └── burndown.md                  # Burndown chart
│       ├── code/                            # Code changes
│       │   ├── changes.md                   # Summary
│       │   ├── diff_summary.md              # Diffs
│       │   ├── commits.md                   # Commit refs
│       │   └── branches/                     # Git branches
│       ├── tests/                           # Testing
│       │   ├── test_plan.md                 # Test plan
│       │   ├── test_results.md              # Results
│       │   ├── coverage.md                  # Coverage
│       │   └── bugs/                        # Bug tracking
│       │       ├── open_bugs.md
│       │       ├── fixed_bugs.md
│       │       └── bug_metrics.md
│       ├── reviews/                         # Reviews
│       │   ├── code_reviews.md              # Code review
│       │   ├── design_reviews.md            # Design review
│       │   └── approval_status.md           # Approval tracking
│       ├── blockers/                        # Blockers
│       │   ├── current_blockers.md          # Active
│       │   ├── resolved_blockers.md         # Past
│       │   └── escalation.md                # Escalated
│       ├── decisions/                       # Decisions
│       │   ├── technical_decisions.md       # Tech choices
│       │   ├── scope_changes.md             # Scope changes
│       │   └── pivots.md                    # Direction changes
│       ├── metrics/                         # Progress metrics
│       │   ├── effort_tracking.md           # Hours
│       │   ├── velocity.md                  # Completion rate
│       │   ├── quality.md                   # Quality metrics
│       │   └── schedule_variance.md         # Timeline variance
│       ├── checkpoints/                     # State snapshots
│       │   ├── checkpoint_001.md            # Periodic saves
│       │   ├── checkpoint_002.md
│       │   └── state_backup.yaml           # Full state
│       └── communications/                   # Communications
│           ├── standups.md                  # Standup notes
│           ├── status_updates.md            # Status reports
│           └── stakeholder_updates.md       # Stakeholder comms
│
├── 05-completed/
│   └── {year}/
│       └── {month}/
│           └── COMPLETED-{id}-{slug}/
│               ├── COMPLETED-{id}-{slug}.md  # Main summary
│               ├── delivery/                   # Delivery
│               │   ├── summary.md              # What was delivered
│               │   ├── changelog.md            # Changes
│               │   ├── artifacts/              # Deployed artifacts
│               │   │   ├── code/
│               │   │   ├── configs/
│               │   │   └── docs/
│               │   └── deployment.md           # Deployment notes
│               ├── retrospective/              # Retrospective
│               │   ├── retrospective.md        # Main retro
│               │   ├── what_went_well.md       # Successes
│               │   ├── what_could_improve.md   # Improvements
│               │   ├── action_items.md         # Future actions
│               │   └── team_feedback.md        # Team feedback
│               ├── metrics/                    # Metrics
│               │   ├── effort.yaml             # Actual vs estimate
│               │   ├── quality.md              # Quality metrics
│               │   ├── performance.md          # Performance data
│               │   └── impact.md               # Business impact
│               ├── demos/                      # Demos
│               │   ├── screenshots/
│               │   ├── recordings/
│               │   └── walkthrough.md
│               └── documentation/              # Final docs
│                   ├── user_docs.md            # User docs
│                   ├── api_docs.md             # API docs
│                   ├── runbook.md              # Ops runbook
│                   └── troubleshooting.md      # Troubleshooting
│
├── 06-cancelled/
│   └── CANCELLED-{id}-{slug}/
│       ├── CANCELLED-{id}-{slug}.md         # Main doc
│       ├── reason/                          # Cancellation
│       │   ├── cancellation_reason.md       # Why
│       │   ├── decision_log.md              # History
│       │   └── stakeholders.md              # Input
│       ├── alternatives/                    # Alternatives
│       │   ├── alternative_approaches.md   # Other options
│       │   └── future_possibility.md       # Could work later?
│       ├── artifacts/                       # Work done
│       │   ├── research/
│       │   ├── design/
│       │   └── partial_implementation/
│       └── lessons/                         # Learning
│           ├── lessons_learned.md          # What we learned
│           └── wasted_effort.md            # What to avoid
│
├── 07-backlog/
│   └── BACKLOG-{id}-{slug}/
│       ├── BACKLOG-{id}-{slug}.md          # Quick idea
│       ├── priority/                        # Prioritization
│       │   ├── score.md                     # Priority score
│       │   ├── rationale.md                 # Reasoning
│       │   └── comparison.md                # Compare to others
│       ├── rough_estimates/                 # Rough estimates
│       │   ├── effort_guess.md              # Effort
│       │   ├── value_estimate.md            # Value
│       │   └── complexity_assessment.md     # Complexity
│       └── links/                           # Related work
│           ├── dependencies.md              # Deps
│           ├── related_improvements.md      # Related
│           └── references.md                # External
│
├── templates/                              # Templates
│   ├── proposal-template.md
│   ├── research-template.md
│   ├── design-template.md
│   ├── plan-template.md
│   ├── active-template.md
│   ├── completed-template.md
│   ├── cancelled-template.md
│   └── backlog-template.md
│
├── dependencies.yaml                        # Cross-improvement deps
├── INDEX.yaml                               # Master index
├── roadmap.md                                # High-level roadmap
└── README.md                                # This file
```

### Subfolder Purpose Summary

| Stage | Subfolders | Purpose | Data Types |
|-------|-----------|---------|------------|
| **00-proposed** | triage/, attachments/ | Initial assessment, supporting materials | Small files, images, links |
| **01-research** | findings/, risks/, sources/ | Research outputs, risk analysis, references | Medium docs, code snippets, citations |
| **02-design** | architecture/, specs/, security/, performance/ | Technical design, specifications, non-functional requirements | Large docs, diagrams, schemas |
| **03-planned** | tasks/, timeline/, resources/, readiness/ | Implementation planning, resource allocation | Medium docs, YAML schedules, assignments |
| **04-active** | progress/, code/, tests/, reviews/, blockers/, decisions/, metrics/, checkpoints/, communications/ | Active implementation tracking (most complex) | All types: docs, code, test results, metrics |
| **05-completed** | delivery/, retrospective/, metrics/, demos/, documentation/ | Delivery artifacts, lessons learned, final documentation | All types, plus demos, screenshots |
| **06-cancelled** | reason/, alternatives/, artifacts/, lessons/ | Cancellation rationale, alternatives considered, wasted effort | Medium docs, decision logs |
| **07-backlog** | priority/, rough_estimates/, links/ | Quick prioritization, rough planning | Small docs, scores, comparisons |

---

## 4. Data Type Coverage

### Data Type Inventory (80-90% Coverage)

Based on framework analysis, here are ALL data types that flow through the system:

#### Text Documents (Markdown)
- Proposal documents
- Research summaries
- Design documents
- Architecture docs
- Implementation plans
- Progress updates
- Completion reports
- Retrospectives
- Meeting notes
- Decision logs
- Risk assessments
- Test plans
- Test results
- Review feedback
- User documentation
- API documentation
- Runbooks
- Troubleshooting guides

#### Structured Data (YAML/JSON)
- Metadata (frontmatter)
- Task breakdowns
- Dependency graphs
- Timelines
- Resource allocations
- Metrics
- Checklists
- Approval records
- State backups

#### Code Artifacts
- Implementation code
- Test code
- Proof of concept code
- Configuration files
- Scripts
- Database migrations

#### Visual Artifacts
- Architecture diagrams
- Sequence diagrams
- Flow charts
- Wireframes
- Screenshots
- Demos (recordings)

#### Links & References
- Cross-references
- External citations
- Related work
- Stakeholder contacts

### Coverage Analysis

**This structure covers 85% of data types:**
- ✅ All text documents (proposals, research, designs, plans, reports)
- ✅ All structured data (metadata, dependencies, metrics)
- ✅ All code artifacts (implementation, tests, POCs)
- ✅ All visual artifacts (diagrams, screenshots, demos)
- ✅ All links and references
- ⚠️ Partial: Binary artifacts (large datasets, media files) - can be added if needed
- ⚠️ Partial: Real-time communications (standups, meetings) - captured as notes

---

## 5. Implementation Summary

### Key Design Decisions

1. **Semantic Linking**
   - 12 link types for rich relationships
   - Bidirectional consistency enforced
   - Central link registry in INDEX.yaml
   - Validation prevents circular dependencies

2. **Gate System**
   - 5 main gates (between stages)
   - 2 side gates (to cancelled/backlog)
   - Mix of automated and manual checks
   - Specific criteria for each gate
   - Clear failure modes and actions

3. **Subfolder Structure**
   - Each stage has 3-10 subfolders
   - Covers 85% of data types
   - Scalable to 500+ improvements
   - Organized by artifact type

4. **Automation**
   - File existence checks
   - Field validation
   - Dependency resolution
   - Content validation
   - Approval tracking

### Next Steps

1. Create folder structure
2. Implement gate validation system
3. Create templates for each stage
4. Build link management system
5. Implement INDEX.yaml automation
6. Create migration scripts for existing files

This design provides a robust, scalable system for tracking BlackBox5 improvements with rich semantic linking and specific gate criteria at each stage.
