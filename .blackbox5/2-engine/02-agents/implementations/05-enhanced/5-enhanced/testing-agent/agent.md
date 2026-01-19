# Testing Agent

An autonomous specialist agent for validating AI-generated output and ensuring quality through systematic testing.

## Overview

The Testing Agent automatically validates any work produced by AI agents, ensuring correctness, security, and reliability. It intelligently determines the best validation strategy for each type of output and executes tests with maximum automation and minimal friction.

## Core Capabilities

1. **Automatic Validation**: Always validates AI output without requiring manual triggers
2. **Intelligent Strategy**: Determines optimal testing approach based on output type
3. **Test Generation**: Creates appropriate tests automatically
4. **Smart Execution**: Uses the fastest, most efficient validation methods
5. **Clear Reporting**: Provides actionable feedback and next steps

## When to Use

- **Automatically**: After any AI agent completes work
- **Manually**: When you need thorough validation of existing code
- **In CI/CD**: As part of automated quality gates
- **Pre-deployment**: Final validation before releases

## Key Features

### Multi-Language Support
- JavaScript/TypeScript (Jest, Vitest, Playwright)
- Python (pytest, unittest)
- Go (testing package)
- Rust (built-in test framework)

### Multi-Type Validation
- Backend code (APIs, business logic)
- Frontend code (components, UI)
- Database changes (migrations, schemas)
- Infrastructure (configs, CI/CD)
- Documentation (accuracy, completeness)

### Automation Levels
1. **Immediate** (seconds): Linting, type checking, syntax validation
2. **Fast** (minutes): Unit tests, component tests
3. **Comprehensive** (10+ minutes): Integration tests, E2E tests
4. **Thorough** (hours): Load testing, security scanning

## Workflow

1. **Receive Context**: Get AI operation output
2. **Analyze**: Understand what was created
3. **Classify**: Determine output type
4. **Strategize**: Choose validation approach
5. **Execute**: Run automated tests
6. **Generate**: Create missing tests
7. **Validate**: Perform smart checks
8. **Report**: Provide results and recommendations

## Configuration

The agent can be configured via `config.yaml`:
- **context_budget**: Token limit for analysis (default: 200k)
- **temperature**: Determinism level (default: 0.3 for consistency)
- **auto_validate**: Automatically trigger validation (default: true)
- **generate_tests**: Create missing tests (default: true)
- **fail_fast_on_critical**: Stop on critical issues (default: true)

## Integration

### As a Standalone Agent
```bash
# Run validation on recent changes
blackbox5 testing-agent validate

# Validate specific files
blackbox5 testing-agent validate src/components/Button.tsx

# Generate tests for a file
blackbox5 testing-agent generate-tests src/api/users.js
```

### As a Skill
Other agents can invoke the `ai-output-validator` skill:
```
Use skill: ai-output-validator
Context: I just created a new API endpoint
```

### In CI/CD
```yaml
# .github/workflows/test.yml
- name: Validate with Testing Agent
  run: blackbox5 testing-agent validate --ci
```

### As a Post-Commit Hook
```bash
# .git/hooks/post-commit
blackbox5 testing-agent validate-staged
```

## Output Format

The agent provides structured validation reports:

### Summary (Console)
```
✅ PASS - 12/12 tests passed - 85% coverage
```

### Detailed Report
```markdown
# AI Output Validation Report

## Summary
- Status: PASS
- Tests Run: 12
- Passed: 12
- Coverage: 85%

## Critical Issues
None

## Warnings
- Unused import in TodoItem.tsx:15

## Automation Opportunities
- Add Storybook for visual testing (effort: medium, value: high)
```

## Best Practices

1. **Let it run automatically**: Don't manually trigger unless needed
2. **Trust but verify**: The agent catches what humans miss
3. **Act on recommendations**: Review and implement suggested improvements
4. **Track trends**: Monitor test coverage and failure rates over time
5. **Keep tests fast**: Optimize slow tests or move them to separate suites

## Related Skills

- **ai-output-validator**: Core validation skill
- **systematic-debugging**: For fixing found issues
- **test-driven-development**: For TDD workflows

## See Also

- [Testing Documentation](../.skills/5-validation/testing/)
- [Quality Assurance Guidelines](../../docs/testing.md)
