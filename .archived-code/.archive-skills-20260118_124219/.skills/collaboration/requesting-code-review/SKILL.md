---
name: requesting-code-review
category: workflow
version: 1.0.0
description: Pre-review preparation with formatted diffs and clear PR descriptions
author: obra/superpowers
verified: true
tags: [code-review, collaboration, git, workflow]
---

# Requesting Code Review

## Overview
Prepare pull requests for effective code reviews with clear descriptions, formatted diffs, and proper context for reviewers.

## When to Use This Skill
✅ Before submitting PRs for review
✅ Preparing complex changes for team review
✅ Ensuring review feedback is actionable
✅ Making reviews faster and more effective

## Pre-Review Checklist

### Before Opening PR
- [ ] Code follows project style guidelines
- [ ] All tests pass locally
- [ ] Added/updated tests for new behavior
- [ ] Documentation updated (docs, comments, README)
- [ ] Commits are clean and logical
- [ ] PR description is clear and complete
- [ ] Self-review completed

### Self-Review Process
1. **Review your own diff first**: What will confuse reviewers?
2. **Check for obvious issues**: typos, console.logs, TODO comments
3. **Verify tests cover edge cases**: what did you miss?
4. **Update PR description**: add context based on your review

## PR Description Template

```markdown
## Summary
Brief description of what this PR does and why.

## Changes
- Bullet point of main changes
- Keep it high-level, details in the diff

## Context
Why this approach? Alternatives considered?

## Testing
- How did you test this?
- What scenarios are covered?
- Any manual testing steps?

## Screenshots (if UI changes)
[Before] | [After]

## Checklist
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No merge conflicts
- [ ] Ready for review

## Review Focus Areas
Specific things to look at:
- Performance implications of X
- Security consideration in Y
- Alternative approach for Z
```

## Formatting Diffs for Reviewers

### Highlight Key Changes
```markdown
## Key Changes to Review

### Critical: Security Fix
📍 `src/auth.js:45-52`
- Added input sanitization for user tokens
- Prevents injection vulnerability

### Performance: Database Query
📍 `src/models/user.js:123-140`
- Added index on email column
- Reduced query time from 200ms to 15ms

### Breaking Change: API Response
📍 `api/users.js:89`
- Response format changed: `user_name` → `username`
- Migration guide in docs/api-migration.md
```

### Visual Diff Annotations
```markdown
## Diff Annotations

```diff
 // Before
-function authenticate(token) {
-  return db.users.findOne({ token });
+// After
+function authenticate(token) {
+  if (!isValidTokenFormat(token)) {
+    throw new AuthError('Invalid token format');
+  }
+  return db.users.findOne({ token });
 }
```

## Common Review Focus Areas

### Performance Considerations
- Any database queries that could be optimized?
- Large files or expensive operations?
- Memory leaks or unnecessary allocations?
- Caching opportunities?

### Security Concerns
- Input validation on user data?
- Authentication/authorization checks?
- Secrets or sensitive data exposure?
- Dependency vulnerabilities?

### Code Quality
- Complex logic that could be simplified?
- Repeated code that should be extracted?
- Unclear names that need renaming?
- Missing error handling?

### Testing Coverage
- Edge cases covered?
- Error scenarios tested?
- Integration tests included?
- Test assertions meaningful?

## Handling Review Feedback

### Receiving Feedback
- Assume good intentions
- Ask for clarification if needed
- Consider all feedback seriously
- Push back respectfully if you disagree

### Implementing Changes
```markdown
## Feedback Resolution

✅ Implemented
- @reviewer: Added validation as suggested

✅ Implemented with modification
- @reviewer: Added logging but only in dev mode

💭 Discussion needed
- @reviewer: Concerned about performance impact, thoughts?

❌ Not applicable
- @reviewer: This is handled by existing validation in X
```

## Integration with Claude
When preparing PRs, say:
- "Help me write a PR description for [changes]"
- "Review my PR description and suggest improvements"
- "Format this diff for easier review"
- "What should I highlight for reviewers?"

Claude will:
- Structure clear PR descriptions
- Highlight key changes effectively
- Identify areas needing focus
- Suggest improvements to organization
- Create readable diff summaries
