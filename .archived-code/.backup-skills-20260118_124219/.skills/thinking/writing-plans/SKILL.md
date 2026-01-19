---
name: writing-plans
category: workflow
version: 1.0.0
description: Create detailed implementation strategies and architecture documentation
author: obra/superpowers
verified: true
tags: [planning, architecture, documentation, strategy]
---

# Writing Plans

## Overview
Create detailed, actionable implementation plans that break down complex features into clear steps with proper architecture consideration.

## When to Use This Skill
✅ Complex features requiring multiple steps
✅ System design and architecture decisions
✅ Technical specifications and implementation docs
✅ Multi-person coordination

## Plan Structure

### Executive Summary
```markdown
## Overview
[2-3 sentences explaining what we're building and why]

## Goals
- [ ] Primary goal: what success looks like
- [ ] Secondary goals: additional benefits
- [ ] Non-goals: explicitly out of scope

## Success Metrics
- Performance: [specific metrics]
- Quality: [test coverage, etc.]
- Timeline: [when it's needed]
```

### Technical Approach
```markdown
## Architecture
[High-level architecture description]

## Components
1. **Component A**: [purpose and responsibility]
2. **Component B**: [purpose and responsibility]
3. **Component C**: [purpose and responsibility]

## Data Flow
[How data moves through the system]

## Alternatives Considered
| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| Option A | Fast | Complex | ❌ Not worth complexity |
| Option B | Simple | Slower | ✅ **Chosen** |
| Option C | Modern | Risky | ❌ Too experimental |
```

### Implementation Steps
```markdown
## Phase 1: Foundation (Days 1-2)
- [ ] Step 1.1: [specific task]
- [ ] Step 1.2: [specific task]
- [ ] Step 1.3: [specific task]

**Dependencies**: None
**Deliverable**: [what's complete]

## Phase 2: Core Features (Days 3-5)
- [ ] Step 2.1: [specific task]
- [ ] Step 2.2: [specific task]
- [ ] Step 2.3: [specific task]

**Dependencies**: Phase 1 complete
**Deliverable**: [what's complete]

## Phase 3: Integration & Polish (Days 6-7)
- [ ] Step 3.1: [specific task]
- [ ] Step 3.2: [specific task]
- [ ] Step 3.3: [specific task]

**Dependencies**: Phase 2 complete
**Deliverable**: [production-ready feature]
```

### Testing Strategy
```markdown
## Unit Tests
- [ ] Core business logic
- [ ] Edge cases and error handling
- [ ] Data validation

## Integration Tests
- [ ] API endpoints
- [ ] Database operations
- [ ] External service integrations

## Manual Testing
- [ ] User flows
- [ ] Performance under load
- [ ] Cross-browser/device testing

## Test Coverage Goal: >80%
```

### Risk Assessment
```markdown
## Technical Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Performance bottleneck | High | Medium | Implement caching, add monitoring |
| Third-party API changes | Medium | Low | Version pinning, fallback strategy |
| Data migration complexity | High | High | Thorough testing, rollback plan |

## Dependencies
- [ ] External API approval
- [ ] Database schema approval
- [ ] Security review

## Rollback Plan
[How to revert if things go wrong]
```

## Planning Best Practices

### Make Steps Atomic
❌ Bad: "Build the payment system"
✅ Good: "Create Stripe checkout form"

### Include Definition of Done
Each step should have clear completion criteria:
- [ ] Code written and reviewed
- [ ] Tests passing
- [ ] Documentation updated
- [ ] No regressions

### Consider Edge Cases
```markdown
## Edge Cases to Handle
- What happens if the API is down?
- How do we handle malformed input?
- What if the user has no internet connection?
- Concurrent requests for the same resource?
- Extremely large datasets?
```

### Plan for Iteration
```markdown
## Iteration 1 (MVP)
- Core functionality
- Basic error handling
- Happy path only

## Iteration 2
- Enhanced error handling
- Edge case coverage
- Performance optimization

## Iteration 3
- Advanced features
- Polish and UX improvements
```

## Common Planning Mistakes
❌ Skipping the "why" - context matters
❌ No alternative analysis - first idea isn't always best
❌ Unrealistic timelines - buffer time for the unknown
❌ Ignoring risks - what could go wrong?
❌ Testing as afterthought - plan tests upfront
❌ No rollback plan - assume you'll need it

## Integration with Claude
When planning, say:
- "Help me create a plan for [feature]"
- "Break down this implementation into steps"
- "What are the risks with this approach?"
- "Create an architecture doc for [system]"

Claude will:
- Structure comprehensive plans
- Identify potential issues
- Suggest alternatives
- Break down complex tasks
- Ensure nothing is forgotten
- Create clear, actionable steps
