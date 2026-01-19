# Task: [Specific Task Name]

> **Epic**: [Epic-number] - [Epic-title]
> **PRD**: [PRD-number] - [PRD-title]
> **Status**: Todo | In Progress | In Review | Done
> **Priority**: P0 | P1 | P2 | P3
> **Estimated**: [Story points or hours]
> **Assignee**: [Agent/Human name]
> **Created**: YYYY-MM-DD
> **Due**: YYYY-MM-DD

## Context

<context>
**What**: [One-sentence description of what this task delivers]

**Why**: [Why this matters - traces to business value]

**Traces to**:
- PRD Requirement: [FR-number] - [Requirement text]
- Epic Component: [Component from epic]

**Dependencies**:
- Blocks: [Task this is waiting on]
- Blocked by: [Tasks waiting on this]
</context>

## First Principles Check

<validation>
**Before starting, verify**:
- [ ] **Traces to PRD**: Which requirement? [FR-number]
- [ ] **Problem Understood**: What problem are we solving? [Description]
- [ ] **Assumptions Verified**: What assumptions? [List with verification]
- [ ] **Constraints Validated**: Real vs imagined? [Analysis]
- [ ] **Minimal Solution**: Is this the simplest thing that works?

**First Principles Summary**:
Based on fundamental truths [truth 1, truth 2], the minimal solution is [description].
</validation>

## Task Specification

<spec>
### What to Build

**Deliverables**:
1. [Deliverable 1]
   - File location: `[path]`
   - Description: [What it does]
   - Acceptance criteria: [Specific criteria]

2. [Deliverable 2]
   - File location: `[path]`
   - Description: [What it does]
   - Acceptance criteria: [Specific criteria]

3. [Deliverable 3]
   - File location: `[path]`
   - Description: [What it does]
   - Acceptance criteria: [Specific criteria]

### What NOT to Build

<out_of_scope>
Explicitly out of scope (prevent scope creep):
- [ ] [Item 1]: [Why out of scope]
- [ ] [Item 2]: [Why out of scope]
- [ ] [Item 3]: [Why out of scope]
</out_of_scope>

### Acceptance Criteria

<acceptance_criteria>
- [ ] **AC-1**: [Specific, testable criteria with expected result]
- [ ] **AC-2**: [Specific, testable criteria with expected result]
- [ ] **AC-3**: [Specific, testable criteria with expected result]
- [ ] **AC-4**: [Specific, testable criteria with expected result]
</acceptance_criteria>

### Definition of Done

<definition_of_done>
- [ ] **Code**: All code written and committed
- [ ] **Tests**: Unit tests passing (coverage > 80%)
- [ ] **Documentation**: Code documented, README updated
- [ ] **Review**: Peer review completed and approved
- [ ] **Integration**: Works with other components
- [ ] **First Principles**: Validated against original analysis
- [ ] **No Regressions**: Existing functionality still works
</definition_of_done>
</spec>

## Implementation Notes

<implementation>
### File Changes

**Create**:
- `[path/to/new/file]`: [Purpose]

**Modify**:
- `[path/to/existing/file]`: [What changes]

**Delete**:
- `[path/to/old/file]`: [Why deleted]

### Code Pattern

```typescript
// Example of expected code pattern
interface Example {
  property: string;
}

function exampleFunction(input: string): Result {
  // Implementation
  return result;
}
```

### Key Implementation Details

<details>
**Detail 1**: [Important implementation note]
**Detail 2**: [Important implementation note]
**Detail 3**: [Important implementation note]
</details>

### Integration Points

**Calls**:
- `[skill/agent/function]`: [Why, what it returns]

**Called By**:
- `[skill/agent/function]`: [Context, what they expect]

**Side Effects**:
- [Effect 1]: [What happens]
- [Effect 2]: [What happens]

**State Changes**:
- [State change 1]: [How state is modified]
- [State change 2]: [How state is modified]
</implementation>

## Testing

<testing>
### How to Test

**Manual Testing**:
1. Step 1: [Action to take]
2. Step 2: [Expected result]
3. Step 3: [Expected result]

**Automated Testing**:
```typescript
// Test example
describe('Task Name', () => {
  it('should do X', () => {
    // Test code
  });
});
```

### Test Cases

| Test Case | Input | Expected Output | Status |
|-----------|-------|-----------------|--------|
| [Case 1] | [Input] | [Output] | ✅/❌ |
| [Case 2] | [Input] | [Output] | ✅/❌ |
| [Case 3] | [Input] | [Output] | ✅/❌ |

### Edge Cases

- [Edge case 1]: [How to handle]
- [Edge case 2]: [How to handle]
- [Edge case 3]: [How to handle]

### Expected Result

**When task is complete**:
- [Outcome 1]: [What user sees]
- [Outcome 2]: [What system does]
- [Outcome 3]: [What metrics change]
</testing>

## Verification

<verification>
### Self-Check (Before PR)

**Code Quality**:
- [ ] Follows project style guide
- [ ] No console.log or debug code
- [ ] No hardcoded values
- [ ] Error handling implemented
- [ ] Edge cases covered

**Testing**:
- [ ] All tests passing
- [ ] New tests added
- [ ] Coverage sufficient

**Documentation**:
- [ ] Code commented where complex
- [ ] README updated (if needed)
- [ ] API docs updated (if applicable)

**Integration**:
- [ ] Works with existing code
- [ ] No breaking changes
- [ ] Backwards compatible

### Rollback Plan

If this task causes issues:
1. **Immediate**: [Rollback step 1]
2. **Short-term**: [Rollback step 2]
3. **Long-term**: [Rollback step 3]

**Revert Command**:
```bash
# How to undo this change
git revert <commit-hash>
```
</verification>

## Progress

<progress>
### Subtasks

- [ ] **Subtask 1**: [Description] (Estimated: _ hours)
- [ ] **Subtask 2**: [Description] (Estimated: _ hours)
- [ ] **Subtask 3**: [Description] (Estimated: _ hours)

### Time Tracking

- **Estimated**: [Total estimate]
- **Actual**: [Time spent]
- **Remaining**: [Time left]

### Blockers

- [Blocker 1]: [Description, impact, resolution plan]
- [Blocker 2]: [Description, impact, resolution plan]
</progress>

## Notes

<notes>
### Implementation Notes
- [Note 1]: [Important detail]
- [Note 2]: [Important detail]

### Decisions Made
- **Decision 1**: [What was decided, why, alternatives]
- **Decision 2**: [What was decided, why, alternatives]

### Lessons Learned
- [Lesson 1]: [What we learned]
- [Lesson 2]: [What we learned]

### Questions & Answers
- **Q1**: [Question]
  - **A**: [Answer]

- **Q2**: [Question]
  - **A**: [Answer]
</notes>

## Review

<review>
### Code Review Checklist

**Reviewer Checklist**:
- [ ] Acceptance criteria met
- [ ] Code is clean and readable
- [ ] Tests are sufficient
- [ ] Documentation is clear
- [ ] No security issues
- [ ] Performance is acceptable
- [ ] Error handling is robust
- [ ] First principles validated

### Review Feedback

**Reviewer 1**: [Name]
- [ ] Approved
- [ ] Changes requested: [Feedback]
- [ ] Comments: [Additional notes]

**Reviewer 2**: [Name]
- [ ] Approved
- [ ] Changes requested: [Feedback]
- [ ] Comments: [Additional notes]
</review>

## Completion

<completion>
### Final Checklist

- [ ] All acceptance criteria met
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Code review approved
- [ ] Integrated into main branch
- [ ] Deployed to staging
- [ ] Monitored for issues

### Sign-off

- **Implementer**: [Name/Signature] - Date: __________
- **Reviewer**: [Name/Signature] - Date: __________
- **Approver**: [Name/Signature] - Date: __________

### Task Closure

**Status**: ✅ **COMPLETE**

**Final Notes**:
[Any final observations, next steps, or follow-up items]

**Related Tasks**:
- Follow-up: [Task link]
- Dependent: [Task link]
</completion>
