# Blackbox 5 Testing Agent

An intelligent testing and validation agent that automatically verifies AI-generated output with maximum automation and minimal friction.

## Overview

The Testing Agent is a specialist agent that:
1. **Automatically validates** all AI-generated output
2. **Intelligently determines** the best validation strategy
3. **Generates missing tests** automatically
4. **Executes smart validation** using the fastest methods
5. **Reports clearly** with actionable next steps

## Quick Start

### As a Skill

Any agent can use the AI Output Validator skill:

```
Use skill: ai-output-validator
Context: I just created a new API endpoint
```

### As an Agent

Run the testing agent directly:

```bash
# Validate recent changes
python .blackbox5/engine/agents/5-enhanced/testing-agent/utilities/validators.py

# Validate specific files
python .blackbox5/engine/agents/5-enhanced/testing-agent/utilities/validators.py --files src/api/users.js

# Generate tests for a file
python .blackbox5/engine/agents/5-enhanced/testing-agent/utilities/test_generators.py src/components/Button.tsx
```

## Architecture

```
testing-agent/
├── config.yaml           # Agent configuration
├── agent.md             # Agent documentation
├── utilities/
│   ├── validators.py    # Validation utilities
│   └── test_generators.py  # Test generation utilities
└── README.md            # This file
```

## Core Concepts

### 1. Validation Levels

The agent runs tests in order of speed:

1. **Immediate** (seconds)
   - Syntax validation
   - Linting
   - Type checking

2. **Fast** (minutes)
   - Unit tests
   - Component tests

3. **Comprehensive** (10+ minutes)
   - Integration tests
   - API tests

4. **Thorough** (hours)
   - E2E tests
   - Load tests
   - Security scans

### 2. Output Types

Different validation strategies for different output types:

| Type | Strategy | Tools |
|------|----------|-------|
| `code/backend` | Unit + Integration tests | Jest, pytest, Supertest |
| `code/frontend` | Component + Visual tests | Jest, Playwright, Chromatic |
| `database` | Schema + Migration tests | pg_prove, sqltest |
| `infrastructure` | Config validation | YAML schema, dry-run |
| `documentation` | Link checks, examples | markdown lint |

### 3. Impact Prioritization

Tests are prioritized by impact:

- **P0 (Critical)**: Security vulnerabilities, data loss, core functionality
- **P1 (High)**: Major features, user-facing bugs
- **P2 (Medium)**: Edge cases, error handling
- **P3 (Low)**: Nice-to-haves, optimizations

## Usage Patterns

### Pattern 1: Automatic Post-Generation Validation

Whenever an AI agent generates code, automatically validate it:

```
1. AI agent generates code
2. Testing agent activates
3. Analyzes what was created
4. Runs immediate checks
5. Generates missing tests
6. Reports results
```

### Pattern 2: Manual Validation

Manually trigger validation when needed:

```bash
# Validate everything
validators.py --path /path/to/project

# Validate specific files
validators.py --files file1.js file2.py

# Get JSON output for CI/CD
validators.py --output json
```

### Pattern 3: Test Generation

Generate tests for existing code:

```bash
# Generate tests for a file
test_generators.py src/api/users.js

# Print to stdout
test_generators.py src/components/Button.tsx --print

# Write to specific file
test_generators.py src/utils/helpers.py --output tests/helpers.test.py
```

### Pattern 4: CI/CD Integration

Add to your CI/CD pipeline:

```yaml
# .github/workflows/validate.yml
name: Validate AI Output

on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Testing Agent
        run: |
          python .blackbox5/engine/agents/5-enhanced/testing-agent/utilities/validators.py \
            --output json \
            > validation-results.json
      - name: Upload Results
        uses: actions/upload-artifact@v2
        with:
          name: validation-results
          path: validation-results.json
```

## Validation Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  1. AI COMPLETES OPERATION                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  2. TESTING AGENT ACTIVATES                                  │
│  - Receives operation context                                │
│  - Analyzes output                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  3. CLASSIFY OUTPUT TYPE                                     │
│  - code/backend | code/frontend | infrastructure             │
│  - database | documentation | analysis                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  4. DETERMINE VALIDATION STRATEGY                            │
│  - Select appropriate tests for type                         │
│  - Prioritize by impact (P0-P3)                              │
│  - Identify automation opportunities                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  5. EXECUTE IMMEDIATE CHECKS                                 │
│  - Linting & type checking                                   │
│  - Syntax validation                                         │
│  - Security scanning                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  6. RUN EXISTING TESTS                                       │
│  - Unit tests                                                │
│  - Integration tests                                         │
│  - E2E tests                                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  7. GENERATE MISSING TESTS                                   │
│  - Create unit tests for new code                            │
│  - Add integration tests for APIs                            │
│  - Generate test data and fixtures                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  8. COMPILE VALIDATION REPORT                                │
│  - Pass/fail status                                          │
│  - Critical issues                                           │
│  - Test coverage                                             │
│  - Automation recommendations                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  9. PROVIDE NEXT STEPS                                       │
│  - Required fixes                                            │
│  - Recommended tests                                         │
│  - Automation opportunities                                  │
└─────────────────────────────────────────────────────────────┘
```

## Output Format

### Console Output

```
============================================================
Validation Report: PASS
============================================================

Summary:
  Total:   8
  Passed:  7
  Failed:  0
  Partial: 1
  Skipped: 0

✅ All critical checks passed
```

### JSON Output

```json
{
  "status": "pass",
  "summary": {
    "total": 8,
    "passed": 7,
    "failed": 0,
    "partial": 1,
    "skipped": 0
  },
  "results": [
    {
      "name": "Syntax: src/api/users.js",
      "status": "pass",
      "message": "Valid js syntax"
    },
    {
      "name": "ESLint",
      "status": "partial",
      "message": "Found 1 warning"
    }
  ],
  "critical_issues": [],
  "warnings": [
    {
      "name": "ESLint",
      "message": "Unused import in TodoItem.tsx:15"
    }
  ]
}
```

## Best Practices

### 1. Let It Run Automatically

Configure the agent to run automatically after AI operations:

```yaml
# config.yaml
behavior:
  auto_validate: true
  generate_tests: true
```

### 2. Act on Recommendations

Review and implement the agent's recommendations:

- Fix critical issues immediately
- Address warnings before deployment
- Implement suggested automation

### 3. Track Metrics

Monitor validation metrics over time:

- Test coverage percentage
- Number of critical issues found
- Average validation time
- Test pass/fail rates

### 4. Keep Tests Fast

- Run fast tests first
- Optimize slow tests
- Move long-running tests to separate suites

## Integration

### With Other Agents

The Testing Agent works seamlessly with other Blackbox 5 agents:

- **Core Agents**: Use for validating code generation
- **Research Agents**: Verify analysis and recommendations
- **Specialist Agents**: Domain-specific validation

### With Tools

The agent integrates with:

- **Playwright**: Browser automation for UI testing
- **Supabase**: Database validation and migrations
- **Filesystem MCP**: Reading generated files
- **Chrome DevTools MCP**: Visual validation

### With CI/CD

Add validation to your pipeline:

```yaml
# GitHub Actions
- name: Validate AI Output
  run: python validators.py --output json
```

## Troubleshooting

### Agent Not Activating

Check that:
1. The agent is registered in the AgentLoader
2. The skill path is correct
3. Auto-validation is enabled in config

### Tests Failing

1. Run tests manually to see detailed output
2. Check for missing dependencies
3. Verify test environment is configured

### Validation Slow

1. Check for infinite loops in tests
2. Add timeout configurations
3. Move slow tests to separate suite

## Contributing

To extend the Testing Agent:

1. Add new validation types to `validators.py`
2. Add new test generators to `test_generators.py`
3. Update the skill documentation
4. Test thoroughly

## License

Part of the Blackbox 5 ecosystem.

## See Also

- [AI Output Validator Skill](../.skills/5-validation/testing/ai-output-validator/SKILL.md)
- [Systematic Debugging Skill](../.skills/5-validation/debugging/systematic-debugging/SKILL.md)
- [Test Driven Development Skill](../.skills/development/testing/test-driven-development/SKILL.md)
