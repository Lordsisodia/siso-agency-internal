# Epic: [Skill/Agent Name] - Technical Specification

> **Status**: Draft | In Review | Approved | In Progress | Done
> **PRD**: [PRD-number]
> **Created**: YYYY-MM-DD
> **Last Updated**: YYYY-MM-DD

## Overview

<overview>
**One-sentence summary**: [What this epic delivers]

**Traces to PRD**: [PRD-number] - [PRD title]

**Problem Statement**: [From PRD - what problem we're solving]

**Solution Overview**: [High-level approach]
</overview>

## First Principles Design

### Core Architecture

<architecture>
**Essential Components** (what we MUST have):
1. [Component 1]: [Purpose]
2. [Component 2]: [Purpose]
3. [Component 3]: [Purpose]

**What to Eliminate** (not needed):
- [ ] [Unnecessary component 1] - [Why not needed]
- [ ] [Unnecessary component 2] - [Why not needed]

**Minimal Viable Implementation**:
- [Core feature 1]
- [Core feature 2]
- [Core feature 3]
</architecture>

### Key Technical Decisions

<decisions>
#### Decision 1: [Decision Title]
**Options Considered**:
- Option A: [Description]
  - Pros: [Benefits]
  - Cons: [Drawbacks]
- Option B: [Description] ✅ **CHOSEN**
  - Pros: [Benefits]
  - Cons: [Drawbacks]
- Option C: [Description]
  - Pros: [Benefits]
  - Cons: [Drawbacks]

**Rationale (from first principles)**:
[Why B is fundamentally better - based on truths, not trends]

**Impact**: [What this enables or constrains]

---

#### Decision 2: [Decision Title]
**Options Considered**:
- [Similar structure]

**Chosen**: [Option X]

**Rationale**: [Why]

**Impact**: [What this enables or constrains]
</decisions>

## Implementation Strategy

<implementation>
### Phase 1: Foundation
**Components**:
- [Component 1]
- [Component 2]

**Deliverables**:
- [ ] [Deliverable 1]
- [ ] [Deliverable 2]

**Success Criteria**:
- [ ] [Criteria 1]
- [ ] [Criteria 2]

---

### Phase 2: Core Features
**Components**:
- [Component 3]
- [Component 4]

**Deliverables**:
- [ ] [Deliverable 3]
- [ ] [Deliverable 4]

**Success Criteria**:
- [ ] [Criteria 3]
- [ ] [Criteria 4]

---

### Phase 3: Polish & Optimize
**Components**:
- [Component 5]
- [Component 6]

**Deliverables**:
- [ ] [Deliverable 5]
- [ ] [Deliverable 6]

**Success Criteria**:
- [ ] [Criteria 5]
- [ ] [Criteria 6]
</implementation>

## Component Specifications

<components>
### Component 1: [Component Name]

**Purpose**: [What this component does]

**File Location**: `[path/to/file]`

**Dependencies**:
- Requires: [dependency 1]
- Required by: [component 2]

**Interface**:
```typescript
// Type signature or interface
interface ComponentInterface {
  // Methods and properties
}
```

**Acceptance Criteria**:
- [ ] [AC-1]: [Specific criteria]
- [ ] [AC-2]: [Specific criteria]
- [ ] [AC-3]: [Specific criteria]

**Testing Strategy**:
- Unit test: [What to test]
- Integration test: [What to test]
- Edge case: [What to test]

---

### Component 2: [Component Name]
[Similar structure]

---

### Component 3: [Component Name]
[Similar structure]
</components>

## Data Flow

<data_flow>
```
[Component A] → [Component B] → [Component C]
     ↓              ↓              ↓
  [Data X]      [Data Y]       [Data Z]
```

**Flow Description**:
1. [Step 1: What happens]
2. [Step 2: What happens]
3. [Step 3: What happens]

**Data Structures**:
```typescript
// Data structure definitions
interface DataFlow {
  // Fields
}
```
</data_flow>

## Error Handling

<error_handling>
### Error Scenario 1: [Scenario]
**When**: [When this happens]

**Response**:
- Error message: [User-facing message]
- System action: [What system does]
- Recovery: [How user recovers]

### Error Scenario 2: [Scenario]
[Similar structure]

### Error Scenario 3: [Scenario]
[Similar structure]
</error_handling>

## Testing Strategy

<testing>
### Unit Tests
- **Test 1**: [What it tests]
  - Input: [Test input]
  - Expected: [Expected output]
  - Covers: [What code path]

- **Test 2**: [What it tests]
  - Input: [Test input]
  - Expected: [Expected output]
  - Covers: [What code path]

### Integration Tests
- **Test 1**: [What it tests]
  - Components: [Which components]
  - Scenario: [Test scenario]
  - Expected: [Expected outcome]

### End-to-End Tests
- **Test 1**: [User journey]
  - Steps: [User actions]
  - Expected: [Final outcome]

### First Principles Validation
- ✅ **Core assumptions verified**: [Which assumptions]
- ✅ **Fundamental truths hold**: [Which truths]
- ✅ **Constraints validated**: [Which constraints]
- ✅ **Success metrics defined**: [Which metrics]
</testing>

## Security & Performance

<security_performance>
### Security
- **Authentication**: [How users/agents authenticate]
- **Authorization**: [Who can do what]
- **Data Protection**: [How data is secured]
- **Input Validation**: [How inputs are sanitized]

### Performance
- **Response Time**: [Target, e.g., "< 100ms"]
- **Throughput**: [Target, e.g., "1000 req/s"]
- **Resource Usage**: [Limits, e.g., "< 512MB RAM"]
- **Caching Strategy**: [What gets cached, how]

### Scalability
- **Horizontal Scaling**: [Can we add more instances?]
- **Vertical Scaling**: [Can we increase resources?]
- **Bottlenecks**: [Known limitations]
</security_performance>

## Dependencies

<dependencies>
### Skills Required
- **[skill-1]**: [Why needed, how used]
- **[skill-2]**: [Why needed, how used]

### Agents Required
- **[agent-1]**: [Why needed, how used]
- **[agent-2]**: [Why needed, how used]

### External Dependencies
- **[library-1]**: [Version, why needed]
- **[service-1]**: [API, why needed]

### System Dependencies
- **[system-1]**: [What we need from it]
- **[system-2]**: [What we need from it]
</dependencies>

## Rollout Plan

<rollout>
### Phase 1: Alpha (Internal)
**Scope**: [Limited feature set]
**Audience**: [Internal team only]
**Success Criteria**: [What defines success]
**Rollback**: [How to undo if needed]

### Phase 2: Beta (Limited Users)
**Scope**: [Most features]
**Audience**: [Selected users]
**Success Criteria**: [What defines success]
**Rollback**: [How to undo if needed]

### Phase 3: GA (General Availability)
**Scope**: [All features]
**Audience**: [All users]
**Success Criteria**: [What defines success]
**Monitoring**: [What to watch]
</rollout>

## Monitoring & Observability

<monitoring>
### Metrics to Track
- **Business Metrics**: [Key business indicators]
- **Technical Metrics**: [Performance, errors, usage]
- **User Metrics**: [Engagement, satisfaction]

### Alerts
- **Alert 1**: [Condition] → [Action]
- **Alert 2**: [Condition] → [Action]

### Dashboards
- **Dashboard 1**: [What it shows, who views it]
- **Dashboard 2**: [What it shows, who views it]
</monitoring>

## Tasks Breakdown

<tasks>
Link to individual task specs:

### Foundation
- [ ] **Task 1**: [task-file or issue link]
- [ ] **Task 2**: [task-file or issue link]
- [ ] **Task 3**: [task-file or issue link]

### Core Features
- [ ] **Task 4**: [task-file or issue link]
- [ ] **Task 5**: [task-file or issue link]
- [ ] **Task 6**: [task-file or issue link]

### Polish
- [ ] **Task 7**: [task-file or issue link]
- [ ] **Task 8**: [task-file or issue link]
</tasks>

## Risks & Mitigation

<risks>
| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| [Risk 1] | Low/Medium/High | Low/Medium/High | [Strategy] | [Who] |
| [Risk 2] | Low/Medium/High | Low/Medium/High | [Strategy] | [Who] |
</risks>

## Open Questions

<questions>
- [ ] [Question 1]: [Why important, decision deadline]
- [ ] [Question 2]: [Why important, decision deadline]
</questions>

## Appendix

<appendix>
### Alternative Approaches Considered
- [Approach 1]: [Why rejected]
- [Approach 2]: [Why rejected]

### Research & References
- [Source 1](URL): [Key insight]
- [Source 2](URL): [Key insight]

### Glossary
- **[Term 1]**: [Definition]
- **[Term 2]**: [Definition]
</appendix>

## Approval

<approval>
- [ ] **Technical Lead**: [Name/Signature] - Date: __________
- [ ] **Product Owner**: [Name/Signature] - Date: __________
- [ ] **Security Review**: [Name/Signature] - Date: __________
</approval>
