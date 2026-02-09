# Testing Infrastructure

**Purpose**: Comprehensive testing framework for Blackbox4

---

## Overview

Blackbox4 follows a **test-first design** philosophy where testing is a first-class citizen. This directory contains all testing infrastructure organized by testing type.

---

## Structure

```
8-testing/
├── unit/              # Unit tests
├── integration/       # Integration tests
├── e2e/              # End-to-end tests
├── performance/      # Performance and load tests
└── templates/        # Test templates and fixtures
```

---

## Testing Levels

### 1. Unit Tests (`unit/`)

**Purpose**: Test individual components in isolation

**Scope**:
- Agent configuration validation
- Schema validation
- Utility functions
- Individual component logic

**Example**:
```yaml
test_agent_config():
  given: agent yaml file
  when: validate against schema
  then: passes validation
```

---

### 2. Integration Tests (`integration/`)

**Purpose**: Test component interactions

**Scope**:
- Agent handoff flows
- Scheduler → Router → Executor pipeline
- MCP server integration
- Memory system operations

**Example**:
```yaml
test_agent_handoff():
  given: architect agent with task
  when: handoff to oracle agent
  then: context preserved, oracle receives task
```

---

### 3. End-to-End Tests (`e2e/`)

**Purpose**: Test complete workflows

**Scope**:
- Full plan execution (manual mode)
- Autonomous Ralph execution
- Multi-agent workflows
- Complete BMAD cycles

**Example**:
```yaml
test_complete_plan_execution():
  given: new plan created
  when: execute all tasks
  then: all tasks complete, artifacts generated
```

---

### 4. Performance Tests (`performance/`)

**Purpose**: Test system performance under load

**Scope**:
- Concurrent task execution
- Memory usage under load
- API rate limiting
- Response time benchmarks

**Example**:
```yaml
test_concurrent_execution():
  given: 10 tasks queued
  when: execute concurrently
  then: all complete within SLA, no resource exhaustion
```

---

## Test Templates

### Agent Test Template
```yaml
name: Agent Test Template
version: 1.0
description: Standard template for testing agents

sections:
  - setup:
      - load agent configuration
      - initialize mock context
      - set up test fixtures

  - execute:
      - invoke agent with test input
      - capture agent output
      - record execution metrics

  - verify:
      - assert expected outputs
      - validate response format
      - check side effects

  - teardown:
      - clean up test fixtures
      - reset agent state
      - archive test results
```

### Integration Test Template
```yaml
name: Integration Test Template
version: 1.0
description: Standard template for testing integrations

sections:
  - setup:
      - initialize all components
      - configure test environment
      - set up mock external services

  - execute:
      - trigger workflow
      - monitor component interactions
      - capture all events

  - verify:
      - assert component A called component B
      - validate data passed correctly
      - check error handling

  - teardown:
      - shut down all components
      - clean up test data
      - restore environment
```

---

## Test Execution

### Run All Tests
```bash
cd 8-testing
./run-all-tests.sh
```

### Run Specific Test Type
```bash
cd 8-testing
./run-unit-tests.sh
./run-integration-tests.sh
./run-e2e-tests.sh
./run-performance-tests.sh
```

### Run Specific Test
```bash
cd 8-testing/unit
pytest test_agent_config.py::test_oracle_config
```

---

## Coverage Requirements

| Component | Minimum Coverage | Target Coverage |
|-----------|------------------|-----------------|
| Core utilities | 90% | 95% |
| Agent schemas | 100% | 100% |
| Runtime components | 85% | 90% |
| MCP integration | 80% | 85% |
| Memory system | 85% | 90% |

---

## Glass Box Testing Philosophy

Blackbox4 follows **glass box testing** principles:

- ✅ **Visible**: All test results logged and inspectable
- ✅ **Transparent**: Test logic readable and understandable
- ✅ **Debuggable**: Failed tests provide detailed context
- ✅ **Observable**: Real-time test execution monitoring

### Test Result Schema
```json
{
  "test_id": "test_20260115_103000",
  "test_name": "test_agent_handoff",
  "timestamp": "2026-01-15T10:30:00Z",
  "status": "passed",
  "duration_ms": 1234,
  "coverage": {
    "lines": 95,
    "branches": 90,
    "functions": 100
  },
  "artifacts": [
    "logs/execution.log",
    "snapshots/before.json",
    "snapshots/after.json"
  ]
}
```

---

## Continuous Integration

Tests should run automatically:
- On every commit to main branch
- Before merging pull requests
- Nightly for full test suite
- Performance tests weekly

---

## Test Data Management

### Fixtures
```
templates/
├── fixtures/
│   ├── agents/          # Sample agent configs
│   ├── plans/           # Sample plan files
│   └── contexts/        # Sample contexts
```

### Mock Data
```
templates/
├── mocks/
│   ├── mcp_servers/     # Mock MCP responses
│   ├── agents/          # Mock agent responses
│   └── external/        # Mock external APIs
```

---

## Test Metrics

Track and report:
- **Pass rate**: Percentage of tests passing
- **Coverage**: Code coverage percentage
- **Flakiness**: Tests that sometimes fail
- **Duration**: Time to run test suite
- **Trends**: Changes in metrics over time

---

## Best Practices

1. **Write tests first** (TDD approach)
2. **One assertion per test** (when possible)
3. **Descriptive test names** (explain what they test)
4. **Independent tests** (no dependencies between tests)
5. **Fast unit tests** (< 100ms each)
6. **Isolated integration tests** (no external dependencies)
7. **Realistic e2e tests** (mirror actual usage)
8. **Performance baselines** (track and compare)

---

**Part of**: Blackbox4 Testing Infrastructure
**Philosophy**: Test-First Design
**Principle**: Glass Box Testing (Full Observability)
