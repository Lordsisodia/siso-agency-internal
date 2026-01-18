# BMAD Workflow Library - Complete Guide

**50+ battle-tested workflows** for consistent, repeatable AI-driven development

---

## Overview

BMAD workflows are **YAML-defined execution patterns** that ensure:
- Consistent process every time
- No reinventing the wheel
- Battle-tested patterns
- Clear inputs and outputs
- Estimated completion times

## Workflow Structure

Every BMAD workflow follows this template:

```yaml
---
name: "Workflow Name"
phase: "elicitation" | "analysis" | "solutioning" | "implementation"
agent: "agent-name" | ["agent1", "agent2"]
estimated_time: "X hours"

preconditions:
  - "required-input-1"
  - "required-input-2"

steps:
  - step: 1
    name: "Step name"
    agent: "agent-name"
    actions:
      - "Action 1"
      - "Action 2"
    outputs: ["intermediate-artifact"]

  - step: 2
    name: "Step name"
    agent: "agent-name"
    actions:
      - "Action 1"
      - "Action 2"
    outputs: ["final-artifact"]

validation:
  - "Output file exists"
  - "Quality criteria met"
  - "Stakeholder approval"

postconditions:
  - "output-artifact-created"
  - "next-phase-gate-passed"
```

---

## Complete Workflow Catalog

### Phase 1: Elicitation Workflows

#### 1. Market Research
```yaml
id: "research-market"
name: "Market Research"
phase: "elicitation"
agent: "mary"
estimated_time: "2-4 hours"

inputs: ["project-charter", "stakeholder-input"]
outputs: ["market-analysis.md"]

steps:
  - Research market size and trends
  - Identify target customer segments
  - Analyze competitive landscape
  - Document market opportunities
```

#### 2. Competitive Analysis
```yaml
id: "research-competitive"
name: "Competitive Analysis"
phase: "elicitation"
agent: "mary"
estimated_time: "2-3 hours"

inputs: ["competitors-list"]
outputs: ["competitive-analysis.md"]

steps:
  - Identify key competitors
  - Analyze competitor features
  - Compare pricing models
  - Identify differentiation opportunities
```

#### 3. Project Brainstorming
```yaml
id: "brainstorm-project"
name: "Project Brainstorming"
phase: "elicitation"
agent: "mary"
estimated_time: "1-2 hours"

inputs: ["initial-idea"]
outputs: ["brainstorming-report.md"]

steps:
  - Facilitate brainstorming session
  - Capture all ideas without judgment
  - Group and prioritize ideas
  - Identify quick wins vs. long-term bets
```

#### 4. User Interviews
```yaml
id: "user-interviews"
name: "User Interview Planning"
phase: "elicitation"
agent: "mary"
estimated_time: "4-6 hours"

inputs: ["target-audience"]
outputs: ["interview-plan.md", "interview-questions.md"]

steps:
  - Define interview goals
  - Recruit participants
  - Create interview guide
  - Conduct interviews
  - Synthesize findings
```

---

### Phase 2: Analysis Workflows

#### 5. Product Brief Creation
```yaml
id: "create-product-brief"
name: "Product Brief Creation"
phase: "analysis"
agent: "mary"
estimated_time: "2-3 hours"

inputs: ["market-analysis", "competitive-analysis"]
outputs: ["product-brief.md"]

steps:
  - Synthesize market research
  - Define target market
  - Identify key features
  - Establish success metrics
  - Document assumptions and constraints
```

**Product Brief Template:**
```markdown
# Product Brief: {{project_name}}

**Created:** {{date}}
**Author:** Mary (Business Analyst)
**Status:** Draft | Review | Approved

## Executive Summary
{{executive_summary}}

## Target Market
{{target_market_analysis}}

## Key Features
{{key_features}}

## Success Metrics
{{success_metrics}}

## Assumptions & Constraints
{{assumptions}}

---
**Approval:**
- [ ] Product Owner
- [ ] Stakeholder
- [ ] Technical Lead
```

#### 6. PRD Creation
```yaml
id: "create-prd"
name: "PRD Creation"
phase: "analysis"
agents: ["mary", "john"]
estimated_time: "4-6 hours"

inputs: ["product-brief"]
outputs: ["prd.md"]

steps:
  - Define user personas
  - Create user stories
  - Write acceptance criteria
  - Identify dependencies
  - Assess risks
```

**PRD Template:**
```markdown
# Product Requirements Document: {{feature_name}}

**Created:** {{date}}
**Authors:** Mary (Analyst) + John (PM)
**Status:** Draft | Review | Approved

## User Personas
{{personas}}

## User Stories

### Story 1: {{story_title}}
**As a** {{user_type}}
**I want** {{action}}
**So that** {{benefit}}

**Acceptance Criteria:**
- [ ] {{criterion_1}}
- [ ] {{criterion_2}}
- [ ] {{criterion_3}}

## Assumptions
{{assumptions}}

## Dependencies
{{dependencies}}

## Risks
{{risks}}

---
**Approval:**
- [ ] Product Owner
- [ ] Technical Lead
- [ ] Stakeholders
```

#### 7. User Story Mapping
```yaml
id: "user-story-mapping"
name: "User Story Mapping"
phase: "analysis"
agents: ["mary", "john"]
estimated_time: "2-3 hours"

inputs: ["prd"]
outputs: ["user-story-map.md"]

steps:
  - Organize user stories by user journey
  - Identify release slices
  - Prioritize by value
  - Estimate effort
```

---

### Phase 3: Solutioning Workflows

#### 8. System Architecture Design
```yaml
id: "create-architecture"
name: "Architecture Design"
phase: "solutioning"
agent: "winston"
estimated_time: "4-8 hours"

inputs: ["prd", "constraints"]
outputs: ["architecture-spec.md"]

steps:
  - Define system boundaries
  - Design component architecture
  - Select technology stack
  - Design APIs
  - Model data structures
  - Plan scalability approach
```

**Architecture Spec Template:**
```markdown
# Architecture Specification: {{system_name}}

**Created:** {{date}}
**Author:** Winston (Architect)
**Status:** Draft | Review | Approved

## System Overview
{{system_overview_diagram}}
{{system_description}}

## Technology Stack
- **Frontend:** {{frontend_choices}}
- **Backend:** {{backend_choices}}
- **Database:** {{database_choices}}
- **Infrastructure:** {{infrastructure_choices}}

## API Design
{{api_endpoints}}
{{data_contracts}}

## Data Model
{{entity_relationship_diagram}}
{{table_schemas}}

## Scalability Strategy
{{scalability_plan}}

## Security Considerations
{{security_plan}}

---
**Approval:**
- [ ] Technical Lead
- [ ] Security Review
- [ ] Development Team
```

#### 9. Technology Selection
```yaml
id: "tech-selection"
name: "Technology Decision"
phase: "solutioning"
agent: "winston"
estimated_time: "2-4 hours"

inputs: ["requirements", "constraints"]
outputs: ["tech-decision-record.md"]

steps:
  - Identify options
  - Evaluate against criteria
  - Create comparison matrix
  - Make recommendation with rationale
```

#### 10. Implementation Readiness Review
```yaml
id: "implementation-readiness"
name: "Implementation Readiness Review"
phase: "solutioning"
agent: "winston"
estimated_time: "1-2 hours"

inputs: ["architecture-spec"]
outputs: ["readiness-report.md"]

steps:
  - Review architecture completeness
  - Verify all dependencies identified
  - Check environment readiness
  - Identify blockers
  - Create implementation plan
```

---

### Phase 4: Implementation Workflows

#### 11. New Feature Development
```yaml
id: "new-feature-development"
name: "New Feature Development"
phase: "implementation"
agent: "arthur"
estimated_time: "1-2 weeks"

inputs: ["architecture-spec", "prd"]
outputs: ["working-code", "tests"]

steps:
  - Set up development environment
  - Implement feature according to spec
  - Write unit tests
  - Write integration tests
  - Create documentation
  - Submit for code review
```

#### 12. Code Review
```yaml
id: "code-review"
name: "Code Review"
phase: "implementation"
agent: "arthur"
estimated_time: "1-2 hours"

inputs: ["pull-request"]
outputs: ["review-feedback"]

steps:
  - Review code against spec
  - Check for best practices
  - Verify test coverage
  - Check documentation
  - Provide feedback
```

#### 13. Bug Fix
```yaml
id: "bug-fix"
name: "Bug Fix"
phase: "implementation"
agent: "arthur"
estimated_time: "2-4 hours"

inputs: ["bug-report"]
outputs: ["fixed-code", "regression-tests"]

steps:
  - Reproduce bug
  - Identify root cause
  - Implement fix
  - Add regression test
  - Verify fix
```

---

### Brownfield Workflows

#### 14. Brownfield Project Analysis
```yaml
id: "brownfield-analysis"
name: "Brownfield Project Analysis"
phase: "elicitation"
agent: "mary"
estimated_time: "4-6 hours"

inputs: ["existing-codebase"]
outputs: ["project-inventory.md", "gap-analysis.md", "integration-strategy.md"]

steps:
  - Document existing project structure
  - Identify component inventory
  - Map dependencies
  - Document tech debt
  - Identify missing features
  - Assess technical debt
  - Find duplicate components
  - Map integration points
  - Plan migration approach
  - Identify quick wins
  - Assess risks
  - Create rollback plan
```

**Project Inventory Template:**
```markdown
# Brownfield Project Inventory: {{project_name}}

**Analyzed:** {{date}}
**Author:** Mary (Business Analyst)
**Completeness:** {{percentage}}%

## Existing Structure
{{file_tree}}

## Component Inventory
{{component_list_with_counts}}

## Dependencies
{{dependency_graph}}

## Technical Debt
{{tech_debt_items}}

## Duplicate Components
{{duplicate_list}}

## Integration Points
{{integration_points}}
```

**Gap Analysis Template:**
```markdown
# Gap Analysis: {{project_name}}

**Analyzed:** {{date}}
**Author:** Mary (Business Analyst)

## Missing Features
{{missing_features_with_priority}}

## Technical Debt by Priority
{{tech_debt_sorted}}

## Quick Wins (Low Risk, High Value)
{{quick_wins}}

## Long-Term Investments (High Risk, High Value)
{{long_term_investments}}
```

**Integration Strategy Template:**
```markdown
# Integration Strategy: {{project_name}}

**Created:** {{date}}
**Author:** Mary (Business Analyst)

## Migration Approach
- **Strategy:** {{big_bang | incremental | parallel }}
- **Rationale:** {{why_this_strategy}}

## Phase Plan
{{phases_with_timeline}}

## Risk Assessment
{{risks_with_mitigation}}

## Rollback Plan
{{rollback_procedure}}

## Success Criteria
{{measurable_success_criteria}}
```

#### 15. Component Consolidation
```yaml
id: "component-consolidation"
name: "Component Consolidation"
phase: "implementation"
agent: "arthur"
estimated_time: "1-2 weeks"

inputs: ["duplicate-analysis"]
outputs: ["consolidated-components", "migration-tests"]

steps:
  - Identify duplicates
  - Choose canonical version
  - Migrate imports
  - Delete duplicates
  - Test thoroughly
```

#### 16. Legacy Migration
```yaml
id: "legacy-migration"
name: "Legacy Code Migration"
phase: "implementation"
agent: "arthur"
estimated_time: "2-4 weeks"

inputs: ["legacy-code", "target-architecture"]
outputs: ["migrated-code", "migration-tests"]

steps:
  - Analyze legacy code
  - Create migration plan
  - Migrate incrementally
  - Test at each step
  - Maintain parity
  - Complete migration
```

---

### Quality Assurance Workflows

#### 17. Test Strategy Creation
```yaml
id: "test-strategy"
name: "Test Strategy"
phase: "solutioning"
agent: "kay"
estimated_time: "2-3 hours"

inputs: ["prd", "architecture-spec"]
outputs: ["test-strategy.md"]

steps:
  - Define testing scope
  - Identify test types
  - Plan test coverage
  - Define quality gates
```

#### 18. Quality Audit
```yaml
id: "quality-audit"
name: "Quality Audit"
phase: "implementation"
agent: "kay"
estimated_time: "1-2 hours"

inputs: ["feature-implementation"]
outputs: ["audit-report.md"]

steps:
  - Review code quality
  - Check test coverage
  - Verify documentation
  - Assess performance
  - Identify issues
```

---

### Documentation Workflows

#### 19. API Documentation
```yaml
id: "api-documentation"
name: "API Documentation"
phase: "implementation"
agent: "timothy"
estimated_time: "2-4 hours"

inputs: ["api-implementation"]
outputs: ["api-docs.md"]

steps:
  - Document endpoints
  - Provide examples
  - Define schemas
  - Create guides
```

#### 20. User Guide Creation
```yaml
id: "user-guide"
name: "User Guide"
phase: "implementation"
agent: "timothy"
estimated_time: "3-5 hours"

inputs: ["feature-implementation"]
outputs: ["user-guide.md"]

steps:
  - Identify user scenarios
  - Create step-by-step guides
  - Add screenshots
  - Include troubleshooting
```

---

## Workflow Execution

### Triggering Workflows

Workflows can be triggered in multiple ways:

```
# Via agent menu
@mary PB        # Product Brief
@winston SA     # System Architecture
@arthur NF      # New Feature

# Via command
/bmad:execute workflow:create-product-brief

# Via API
POST /api/workflows/execute
{
  "workflow": "create-product-brief",
  "inputs": {...}
}
```

### Workflow Tracking

```yaml
# .bmad/workflow-status.yaml
active_workflow: "create-product-brief"
started_at: "2025-01-18T10:00:00Z"
current_step: 2
estimated_completion: "2025-01-18T12:00:00Z"

steps:
  - step: 1
    name: "Synthesize market research"
    status: "complete"
    completed_at: "2025-01-18T10:30:00Z"

  - step: 2
    name: "Define target market"
    status: "in_progress"
    started_at: "2025-01-18T10:30:00Z"

  - step: 3
    name: "Identify key features"
    status: "pending"
```

---

## Creating Custom Workflows

### Workflow Template

```yaml
---
name: "Your Workflow Name"
phase: "elicitation" | "analysis" | "solutioning" | "implementation"
agent: "agent-name" | ["agent1", "agent2"]
estimated_time: "X hours"
version: "1.0"

description: |
  Brief description of what this workflow does
  and when to use it.

preconditions:
  - "required-input-1: description"
  - "required-input-2: description"

inputs:
  - name: "input-1"
    type: "file" | "artifact" | "user-input"
    description: "Description of input"
    required: true

outputs:
  - name: "output-1"
    type: "file" | "artifact"
    description: "Description of output"

steps:
  - step: 1
    name: "Step 1 Name"
    agent: "agent-name"
    estimated_time: "X minutes"
    actions:
      - "Specific action 1"
      - "Specific action 2"
    outputs:
      - "intermediate-artifact-1"
    validation:
      - "Output file exists"
      - "Quality criteria met"

  - step: 2
    name: "Step 2 Name"
    agent: "agent-name"
    estimated_time: "Y minutes"
    actions:
      - "Specific action 1"
      - "Specific action 2"
    outputs:
      - "final-artifact"

validation:
  - "All outputs created"
  - "Quality standards met"
  - "Stakeholder approval received"

postconditions:
  - "output-artifact-created"
  - "next-phase-gate-passed"
  - "documentation-updated"

triggers:
  - "trigger-1"
  - "trigger-2"

related_workflows:
  - "workflow-id-1"
  -workflow-id-2"
```

### Best Practices

1. **Be Specific**: Each step should have clear, actionable tasks
2. **Estimate Time**: Provide realistic time estimates
3. **Define Artifacts**: Specify exact inputs and outputs
4. **Include Validation**: Ensure quality gates are defined
5. **Version Control**: Track workflow versions

---

## Workflow Metrics

BMAD tracks workflow execution metrics:

```yaml
workflow_metrics:
  create-product-brief:
    total_executions: 47
    average_duration: "2.5 hours"
    success_rate: 98%
    common_failures:
      - "Insufficient market data"
      - "Unclear stakeholder requirements"

  system-architecture:
    total_executions: 23
    average_duration: "6 hours"
    success_rate: 100%
    common_failures: []
```

---

## Next Steps

1. **Learn Architecture Enforcement** → `03-bmad-architecture.md`
2. **Brownfield Integration** → `04-bmad-brownfield.md`
3. **BMAD vs GSD Integration** → `05-bmad-vs-gsd.md`

---

*Workflows are the engine of consistent, repeatable AI-driven development.*
