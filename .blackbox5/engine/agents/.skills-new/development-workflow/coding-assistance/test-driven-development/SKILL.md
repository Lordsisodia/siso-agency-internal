---
name: test-driven-development
category: development-workflow/coding-assistance
version: 1.0.0
description: RED-GREEN-REFACTOR cycle for writing bulletproof code with strong test coverage
author: obra/superpowers
verified: true
tags: [testing, tdd, development, quality, red-green-refactor]
---

# Test-Driven Development (TDD)

<context>
Test-Driven Development is a software development process that relies on the repetition of a short development cycle: requirements are turned into very specific test cases, then the code is improved to pass the tests. TDD encourages simple designs and inspires confidence in your code through comprehensive test coverage.
</context>

<instructions>
Follow the RED-GREEN-REFACTOR cycle strictly for all development work:

1. **RED Phase**: Write a failing test that demonstrates the desired behavior
2. **GREEN Phase**: Write the MINIMAL code to make the test pass
3. **REFACTOR Phase**: Improve the code while keeping tests green

Never skip the RED phase - it proves your test works and prevents false positives.
</instructions>

<rules>
- Always write the test BEFORE implementation code
- Write the MINIMAL test case for new functionality
- Run the test and confirm it FAILS (red) before writing implementation
- Write just enough code to pass - don't worry about perfect code yet
- Run the test and confirm it PASSES (green)
- Only refactor when tests are green
- Run tests after each refactor to ensure they still pass
- Keep tests small and focused
- One assertion per test when possible
- Test behaviors, not implementation details
- Never skip tests when "in a hurry"
</rules>

<workflow>
<phase name="1. RED">
<steps>
1. Identify the next piece of functionality to implement
2. Write a minimal test case that demonstrates this functionality
3. Run the test and confirm it FAILS
4. This proves the test is valid and catches missing implementation
</steps>
<outcome>Failing test that clearly documents expected behavior</outcome>
</phase>

<phase name="2. GREEN">
<steps>
1. Write the MINIMAL code to make the test pass
2. Don't worry about code quality yet - focus on passing the test
3. Run the test and confirm it PASSES
4. If test passes, you have working implementation
</steps>
<outcome>Working implementation that meets test requirements</outcome>
</phase>

<phase name="3. REFACTOR">
<steps>
1. Review the code for duplication and improvements
2. Clean up code while keeping tests green
3. Improve names and structure
4. Optimize for readability and maintainability
5. Run tests after each change to ensure they still pass
6. Stop when tests fail - fix before continuing
</steps>
<outcome>Clean, maintainable code with passing tests</outcome>
</phase>
</workflow>

<examples>
<example>
<title>Basic TDD Example - Calculate Total with Tax</title>
<description>Demonstrates the full TDD cycle for a simple calculation function</description>
<code language="javascript">
// ========== RED PHASE ==========
// Write failing test first
test('calculates total with tax', () => {
  expect(calculateTotal(100, 0.1)).toBe(110);
});

// Run test - FAILS ✓ (function doesn't exist yet)

// ========== GREEN PHASE ==========
// Write minimal implementation
function calculateTotal(amount, taxRate) {
  return amount + (amount * taxRate);
}

// Run test - PASSES ✓

// ========== REFACTOR PHASE ==========
// Look for improvements:
// - Function name is clear ✓
// - Logic is simple ✓
// - No duplication ✓
// - Code is readable ✓

// No refactoring needed - move to next test!
</code>
<outcome>Working function with test coverage and confidence it works correctly</outcome>
</example>

<example>
<title>TDD for Edge Cases</title>
<description>Demonstrates how TDD helps catch edge cases</description>
<code language="javascript">
// First test - happy path
test('calculates total with positive tax rate', () => {
  expect(calculateTotal(100, 0.1)).toBe(110);
});

// Second test - edge case: zero tax
test('calculates total with zero tax rate', () => {
  expect(calculateTotal(100, 0)).toBe(100);
});

// Third test - edge case: negative amount (should we handle this?)
test('throws error for negative amount', () => {
  expect(() => calculateTotal(-100, 0.1)).toThrow('Amount must be positive');
});

// Now implement all cases:
function calculateTotal(amount, taxRate) {
  if (amount < 0) {
    throw new Error('Amount must be positive');
  }
  return amount + (amount * taxRate);
}
</code>
<outcome>Robust function that handles edge cases with test coverage</outcome>
</example>
</examples>

<best_practices>
- Start with the simplest possible test case
- Write tests that read like documentation
- Use descriptive test names that explain what is being tested
- Keep test code as clean as production code
- Run tests frequently - every few minutes
- Use test coverage tools to ensure all paths are tested
- Test behaviors and outcomes, not implementation details
- Keep tests independent - they should run in any order
- Mock external dependencies only when necessary
- Test error cases and edge cases, not just happy paths
- Use setup/teardown to keep tests DRY (Don't Repeat Yourself)
</best_practices>

<anti_patterns>
❌ Writing tests AFTER the code - this misses the point of TDD
❌ Testing multiple behaviors in one test - makes failures hard to diagnose
❌ Mocking too much - tests the mock instead of real behavior
❌ Skipping the RED phase - can't prove test actually works
❌ Writing complex test setup - makes tests hard to understand
❌ Testing private methods directly - test public interface instead
❌ Relying on test order - tests should be independent
❌ Having brittle tests that break with refactoring - test behavior, not implementation
❌ Skipping tests when "in a hurry" - guarantees bugs in production
❌ Writing tests that are too tightly coupled to implementation details
</anti_patterns>

<integration_notes>
When using Claude Code with this skill, trigger it by saying:

- "Let's use TDD to build [feature]"
- "Help me write tests for [behavior]"
- "Refactor this code using TDD principles"
- "I want to implement [feature] test-first"

Claude will automatically:
- Follow RED-GREEN-REFACTOR sequence strictly
- Keep tests focused and clear
- Suggest edge cases you might miss
- Ensure tests remain green during refactoring
- Write tests that read like documentation
- Never skip the RED phase

Expected behaviors:
- Claude will always write the test first
- Claude will confirm tests fail before implementation
- Claude will write minimal code to pass
- Claude will suggest refactor improvements
- Claude will run tests after every change
</integration_notes>

<error_handling>
When tests fail unexpectedly:

1. **Check test validity**: Is the test correctly written?
2. **Check requirements**: Did requirements change?
3. **Check implementation**: Is there a bug in the code?
4. **Check dependencies**: Did external systems change?
5. **Check test environment**: Is the test environment correct?

Common issues:
- Flaky tests that sometimes pass/fail - fix test, not code
- Tests that depend on execution order - make tests independent
- Tests that depend on external state - mock dependencies appropriately
- Tests that are too complex - simplify test or split into multiple tests
</error_handling>

<output_format>
When TDD is applied successfully, you should expect:

1. **Comprehensive test coverage**: All code paths tested
2. **Failing tests first**: Proof that tests work
3. **Minimal implementation**: Simple code that just works
4. **Refactored code**: Clean, maintainable, well-structured
5. **Documentation**: Tests that serve as living documentation
6. **Confidence**: High confidence code works as intended
7. **Safety net**: Catch regressions when changing code

File structure:
```
feature/
├── feature.test.ts     # Tests written first
├── feature.ts          # Implementation (minimal at first)
└── README.md           # Documentation (optional)
```
</output_format>

<related_skills>
- systematic-debugging - Use when tests fail and you need to debug
- refactoring - Apply after tests are green
- unit-testing - Complementary practice for writing good tests
- integration-testing - Next step after unit tests
</related_skills>

<see_also>
- [Test-Driven Development by Kent Beck](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530) - The book that introduced TDD
- [The Three Laws of TDD by Robert C. Martin](https://butunclebob.com/ArticleS.UncleBob.TheThreeRulesOfTdd) - Core principles
- [TDD: Where did it all go wrong?](https://dzone.com/articles/tdd-where-did-it-all-go-wrong) - Common pitfalls to avoid
</see_also>

<motivation>
<why_tdd>
TDD creates a virtuous cycle:

1. **Fast feedback**: Know immediately when code breaks
2. **Documentation**: Tests document what code does
3. **Design**: Thinking about tests first leads to better design
4. **Confidence**: Refactor without fear of breaking things
5. **Debugging**: When tests fail, you know exactly where
6. **Edge cases**: Tests force you to think about edge cases
7. **Simplicity**: TDD encourages simple, testable code
</why_tdd>

<when_to_use>
✅ Building new features from scratch
✅ Refactoring existing code with safety nets
✅ Fixing bugs with regression prevention
✅ Working on critical systems requiring high confidence
✅ Complex algorithms or business logic
✅ APIs with public contracts

⚠️ Consider alternatives for:
- Simple CRUD operations (may be overkill)
- Exploratory coding (spikes, prototypes)
- UI/UX experiments (not testable code)
- Performance optimization (benchmarks better than tests)
</when_to_use>
</motivation>
