---
name: requesting-code-review
category: collaboration-communication/collaboration
version: 1.0.0
description: Pre-review preparation with formatted diffs and clear PR descriptions
author: obra/superpowers
verified: true
tags: [code-review, collaboration, git, workflow, pull-requests]
---

# Requesting Code Review

<context>
Prepare pull requests for effective code reviews with clear descriptions, formatted diffs, and proper context for reviewers.

This skill ensures reviews are faster, more effective, and provide actionable feedback by setting up PRs for success from the start.
</context>

<instructions>
Use systematic pre-review preparation to ensure pull requests are review-ready.

Complete pre-review checklist, create clear PR descriptions, format diffs for easy review, and identify specific focus areas for reviewers.

Handle feedback constructively and iterate on improvements.
</instructions>

<workflow>
## Pre-PR Phase
1. Verify code follows project style guidelines
2. Ensure all tests pass locally
3. Add/update tests for new behavior
4. Update documentation (docs, comments, README)
5. Clean up commits to be logical and clear
6. Complete self-review process

## PR Creation Phase
1. Write clear PR description using template
2. Highlight key changes with locations
3. Add visual diff annotations for complex changes
4. Identify specific review focus areas
5. Include testing notes and scenarios

## Post-Submission Phase
1. Monitor feedback respectfully
2. Implement requested changes
3. Track feedback resolution
4. Address clarification questions
5. Iterate based on review
</workflow>

<rules>
## Before Opening PR
- Code follows project style guidelines
- All tests pass locally
- Added/updated tests for new behavior
- Documentation updated (docs, comments, README)
- Commits are clean and logical
- PR description is clear and complete
- Self-review completed

## Self-Review Process
1. Review your own diff first: What will confuse reviewers?
2. Check for obvious issues: typos, console.logs, TODO comments
3. Verify tests cover edge cases: what did you miss?
4. Update PR description: add context based on your review
</rules>

<best_practices>
## PR Description Best Practices
- Start with clear, concise summary
- Use bullet points for changes (high-level)
- Explain context and alternatives considered
- Document testing approach
- Add screenshots for UI changes
- Include completion checklist
- Identify specific review focus areas

## Diff Formatting Best Practices
- Group related changes together
- Use file:line references for locations
- Explain "why" not just "what"
- Highlight breaking changes clearly
- Add migration guides when needed
- Use diff annotations for complex logic

## Review Focus Areas
- Performance implications
- Security considerations
- Alternative approaches
- Edge cases and error handling
- Testing coverage
- Documentation completeness
</best_practices>

<examples>
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

## Key Changes Format
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

## Feedback Resolution
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
</examples>

<integration_notes>
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
- Track all feedback items
- Mark status (implemented/discussed/not applicable)
- Explain reasoning for modifications
- Follow up on outstanding discussions
</integration_notes>

<output_format>
1. **Pull Request Description** with:
   - Summary paragraph
   - Bulleted changes
   - Context and rationale
   - Testing approach
   - Screenshots (if applicable)
   - Completion checklist
   - Specific review focus areas

2. **Key Changes Section** with:
   - File:line references
   - Change category (Critical/Performance/Breaking)
   - Brief explanation
   - Impact notes

3. **Feedback Resolution Tracker** with:
   - Reviewer attribution
   - Status indicators
   - Implementation notes
   - Discussion items
</output_format>
