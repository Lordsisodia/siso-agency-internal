---
name: subagent-driven-development
category: workflow
version: 1.0.0
description: Quality-gated iteration with multi-agent workflows for complex tasks
author: obra/superpowers
verified: true
tags: [workflow, multi-agent, quality, development]
---

# Subagent-Driven Development

## Overview
Use multiple specialized subagents in sequence to handle complex development tasks with quality gates between each phase.

## When to Use This Skill
✅ Large-scale refactoring across many files
✅ Parallel development streams
✅ Complex feature requiring multiple expertise areas
✅ High-risk changes requiring thorough validation
✅ Tasks needing separation of concerns

## The Subagent Pattern

### Basic Flow
```
[Planning Agent]
       ↓
[Quality Gate: Plan Approved?]
       ↓
[Implementation Agent]
       ↓
[Quality Gate: Code Complete?]
       ↓
[Review Agent]
       ↓
[Quality Gate: Issues Resolved?]
       ↓
[Testing Agent]
       ↓
[Quality Gate: Tests Passing?]
       ↓
[Documentation Agent]
       ↓
[Final Output]
```

## Agent Specializations

### 1. Planning Agent
**Responsibility**: Break down complex tasks into actionable steps

**Input**:
- High-level requirement
- Constraints and preferences
- Existing codebase context

**Output**:
- Detailed implementation plan
- Risk assessment
- Dependencies identified
- Success criteria defined

**Quality Gate**:
- [ ] Plan is comprehensive
- [ ] Risks are identified
- [ ] Steps are actionable
- [ ] Success criteria clear

### 2. Implementation Agent
**Responsibility**: Execute the plan with clean, tested code

**Input**:
- Approved implementation plan
- Code to modify
- Testing requirements

**Output**:
- Implemented changes
- Unit tests
- Integration points updated

**Quality Gate**:
- [ ] Code follows plan
- [ ] Tests pass locally
- [ ] No regressions
- [ ] Code is clean

### 3. Review Agent
**Responsibility**: Critical analysis of implementation

**Input**:
- Implementation changes
- Original plan
- Codebase standards

**Output**:
- Code review feedback
- Security concerns
- Performance issues
- Improvement suggestions

**Quality Gate**:
- [ ] No critical issues
- [ ] Security reviewed
- [ ] Performance acceptable
- [ ] Standards followed

### 4. Testing Agent
**Responsibility**: Comprehensive testing validation

**Input**:
- Implemented changes
- Test requirements
- Edge case scenarios

**Output**:
- Test results
- Coverage report
- Bug findings
- Performance metrics

**Quality Gate**:
- [ ] All tests pass
- [ ] Coverage threshold met
- [ ] No critical bugs
- [ ] Performance within limits

### 5. Documentation Agent
**Responsibility**: Complete documentation updates

**Input**:
- Final implementation
- API changes
- User-facing features

**Output**:
- Updated documentation
- API reference
- Migration guides
- Changelog entry

**Quality Gate**:
- [ ] Docs are accurate
- [ ] Examples work
- [ ] Migration guide clear
- [ ] Changelog complete

## Parallel Development Pattern

### Multiple Implementation Streams
```markdown
## Parallel Refactoring

### Stream 1: Backend API
- [ ] Planning: Design new API structure
- [ ] Implementation: Build new endpoints
- [ ] Testing: Verify API contracts
- [ ] Review: Security and performance

### Stream 2: Frontend Integration
- [ ] Planning: Update component structure
- [ ] Implementation: Connect to new API
- [ ] Testing: Verify user flows
- [ ] Review: UX and accessibility

### Stream 3: Data Migration
- [ ] Planning: Design migration script
- [ ] Implementation: Build migration tool
- [ ] Testing: Verify data integrity
- [ ] Review: Rollback strategy

### Integration Phase
- [ ] Merge all streams
- [ ] End-to-end testing
- [ ] Final review
- [ ] Deploy
```

## Quality Gate Criteria

### Must Have (Blocking)
- Plan is approved by stakeholders
- All tests passing
- No security vulnerabilities
- No critical bugs
- Performance benchmarks met

### Should Have (Warning)
- Code coverage >80%
- Documentation complete
- No review comments unresolved
- Performance optimized

### Nice to Have (Optional)
- Additional test scenarios
- Enhanced documentation
- Performance improvements
- Code simplifications

## Example Workflow

### Complex Refactoring Task
```markdown
## Refactor User Authentication System

### Phase 1: Planning
**Agent**: Planning Specialist
**Task**: Analyze current auth system, design new architecture
**Deliverable**: 10-page implementation plan with risk assessment
**Quality Gate**: ✅ Plan approved

### Phase 2: Implementation
**Agent**: Backend Developer
**Task**: Implement new auth service with OAuth 2.0
**Deliverable**: Working auth service with unit tests
**Quality Gate**: ✅ All tests pass

### Phase 3: Security Review
**Agent**: Security Specialist
**Task**: Audit authentication flow for vulnerabilities
**Deliverable**: Security report with recommendations
**Quality Gate**: ⚠️ 3 medium-severity issues found

### Phase 4: Fix Implementation
**Agent**: Backend Developer
**Task**: Address security issues
**Deliverable**: Updated code with fixes
**Quality Gate**: ✅ All issues resolved

### Phase 5: Integration Testing
**Agent**: QA Specialist
**Task**: Test auth flows across all applications
**Deliverable**: Test report with coverage metrics
**Quality Gate**: ✅ 95% coverage, no critical bugs

### Phase 6: Documentation
**Agent**: Technical Writer
**Task**: Update API docs and migration guides
**Deliverable**: Complete documentation set
**Quality Gate**: ✅ Docs accurate and complete

### Phase 7: Final Review
**Agent**: Architect
**Task**: Validate entire refactoring
**Deliverable**: Final approval
**Quality Gate**: ✅ Approved for merge
```

## Best Practices

### 1. Clear Agent Boundaries
Each agent has a specific responsibility and doesn't overlap with others.

### 2. Handoff Documentation
Each phase produces artifacts for the next phase.

### 3. Quality Gates Are Strict
Don't proceed to next phase until quality gate passes.

### 4. Rollback Strategy
Each phase should be reversible if issues are found.

### 5. Parallel When Possible
Independent streams can run simultaneously.

## Common Mistakes

❌ **Skipping quality gates**: "Let's just fix it later"
❌ **Blurry agent boundaries**: Multiple agents doing same work
❌ **Poor handoffs**: Next agent doesn't have context
❌ **No rollback**: Can't undo if things go wrong
❌ **Serial when parallel possible**: Slowing down unnecessarily

## Integration with Claude
When using subagent-driven development, say:
- "Use subagent-driven development for [complex task]"
- "Break this into phases with quality gates"
- "Run planning, implementation, and review agents"
- "Set up parallel streams for [feature set]"

Claude will:
- Identify appropriate agent specializations
- Define clear quality gates
- Produce handoff artifacts
- Respect phase boundaries
- Enable parallel execution where possible
- Ensure thorough validation at each step
