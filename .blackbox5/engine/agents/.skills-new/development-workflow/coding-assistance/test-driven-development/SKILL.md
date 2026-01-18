---
name: test-driven-development
category: core
version: 1.0.0
description: RED-GREEN-REFACTOR cycle for writing bulletproof code with strong test coverage
author: obra/superpowers
verified: true
tags: [testing, tdd, development, quality]
---

# Test-Driven Development (TDD)

## Overview
Master the RED-GREEN-REFACTOR cycle to build software with guaranteed test coverage and fewer bugs.

## When to Use This Skill
✅ Building new features from scratch
✅ Refactoring existing code with safety nets
✅ Fixing bugs with regression prevention
✅ Working on critical systems requiring high confidence

## The TDD Cycle

### 1. RED Phase
Write a failing test that demonstrates the desired behavior:
- Write the MINIMAL test case for new functionality
- Run the test and confirm it FAILS (red)
- Don't write implementation code yet

### 2. GREEN Phase
Write the MINIMAL code to make the test pass:
- Implement just enough to pass the test
- Don't worry about perfect code yet
- Run the test and confirm it PASSES (green)

### 3. REFACTOR Phase
Improve the code while keeping tests green:
- Clean up duplication
- Improve names and structure
- Optimize for readability
- Run tests after each change to ensure they still pass

## Example Workflow

```javascript
// RED: Write failing test
test('calculates total with tax', () => {
  expect(calculateTotal(100, 0.1)).toBe(110);
});

// GREEN: Write minimal implementation
function calculateTotal(amount, taxRate) {
  return amount + (amount * taxRate);
}

// REFACTOR: Improve if needed (tests still pass!)
```

## Best Practices
- Keep tests small and focused
- One assertion per test when possible
- Test behaviors, not implementation details
- Run tests frequently (every few minutes)
- Never skip the RED phase - it proves the test works

## Anti-Patterns to Avoid
❌ Writing tests after the code
❌ Testing multiple behaviors in one test
❌ Mocking too much (test real behavior)
❌ Skipping tests when "in a hurry"

## Integration with Claude
When using Claude Code, say:
- "Let's use TDD to build [feature]"
- "Help me write tests for [behavior]"
- "Refactor this code using TDD principles"

Claude will automatically:
- Follow RED-GREEN-REFACTOR sequence
- Keep tests focused and clear
- Suggest edge cases you might miss
- Ensure tests remain green during refactoring
