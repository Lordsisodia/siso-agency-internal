# Blackbox 5 Test Suite

Comprehensive test suite for Week 1 components of the Blackbox 5 multi-agent system.

## Test Structure

```
.blackbox5/tests/
├── conftest.py                    # Pytest fixtures and test configuration
├── pytest.ini                     # Pytest configuration
├── test_task_router.py            # Task routing and complexity analysis tests
├── test_logging.py                # Structured logging tests
├── test_manifest.py               # Manifest system tests
├── test_integration.py            # End-to-end integration tests
├── test_agent_integration.py      # Agent orchestration and workflow tests
└── AGENT-INTEGRATION-TEST-SUMMARY.md  # Agent integration test documentation
```

## Test Categories

### Unit Tests (`@pytest.mark.unit`)
Fast, isolated tests that don't require external dependencies.

- Task routing logic
- Complexity scoring
- Agent selection
- Logging functionality
- Manifest creation and tracking

### Integration Tests (`@pytest.mark.integration`)
Tests that verify integration between components.

- Task router with logging
- Manifest with logging
- Task router with manifest
- Circuit breaker integration
- Full system workflows

### Slow Tests (`@pytest.mark.slow`)
Tests that take longer to run (high volume, performance tests).

## Running Tests

### Run All Tests
```bash
cd .blackbox5/tests
pytest
```

### Run Only Unit Tests
```bash
pytest -m unit
```

### Run Only Integration Tests
```bash
pytest -m integration
```

### Skip Slow Tests
```bash
pytest -m "not slow"
```

### Run Specific Test File
```bash
pytest test_task_router.py
```

### Run Specific Test Class
```bash
pytest test_task_router.py::TestTaskRouting
```

### Run Specific Test
```bash
pytest test_task_router.py::TestTaskRouting::test_simple_task_routes_to_single_agent
```

### With Coverage Report
```bash
pytest --cov=../engine --cov-report=html
```

### With Verbose Output
```bash
pytest -v
```

## Test Fixtures

### Core Fixtures (conftest.py)

#### Event Bus Fixtures
- `mock_redis()` - Mock Redis client
- `mock_event_bus()` - Mock event bus
- `real_event_bus()` - Real event bus (requires Redis)

#### Agent Fixtures
- `sample_agent_capabilities()` - Sample agent capabilities
- `mock_agent_registry()` - Mock agent registry

#### Other Fixtures
- `mock_circuit_breaker()` - Mock circuit breaker
- `mock_manifest_system()` - Mock manifest system with temp directory
- `sample_tasks()` - Sample tasks for testing
- `temp_log_dir()` - Temporary directory for log files
- `temp_manifest_dir()` - Temporary directory for manifest files

## External Dependencies

### Required for Unit Tests
- pytest >= 7.0
- pytest-asyncio

### Required for Integration Tests
- Redis (localhost:6379)
- ChromaDB (for memory tests)
- Neo4j (localhost:7687)

### Install Dependencies
```bash
pip install pytest pytest-asyncio pytest-cov
```

## Test Configuration

### Redis Configuration
Integration tests use Redis DB 15 to avoid conflicts with production:

```python
EventBusConfig(db=15)
```

### Temporary Files
Tests use temporary directories that are cleaned up automatically:
- Logs: `/tmp/bb5_logs_*`
- Manifests: `/tmp/bb5_manifests_*`
- Memory: `/tmp/bb5_memory_*`

## Test Coverage

### Task Router Tests (test_task_router.py)
- Task routing logic
- Complexity scoring (tokens, tools, domain, steps)
- Agent selection (generalist, specialist, orchestrator)
- Routing decision structure
- Configuration options
- Statistics tracking
- Edge cases

### Logging Tests (test_logging.py)
- Logging setup and configuration
- Agent logger (task events, custom events)
- Operation logger (lifecycle, steps)
- Context binding
- JSON and text formats
- Log levels
- Concurrent logging
- High volume logging

### Manifest Tests (test_manifest.py)
- Manifest creation
- Step tracking
- Completion and failure
- Manifest retrieval
- Filtering by type and status
- Markdown formatting
- Persistence
- Edge cases

### Integration Tests (test_integration.py)
- Task router with logging
- Manifest with logging
- Task router with manifest
- Circuit breaker integration
- End-to-end workflows
- Error recovery
- Parallel execution
- Real Redis integration
- Performance tests

### Agent Integration Tests (test_agent_integration.py)
**New!** Comprehensive agent orchestration and workflow tests:
- Multi-agent workflows (Planner → Developer → Tester)
- Agent coordination scenarios
- Memory persistence across executions
- External integrations (GitHub, Vibe Kanban) with mocks
- Error handling and recovery
- Parallel agent execution

See [AGENT-INTEGRATION-TEST-SUMMARY.md](AGENT-INTEGRATION-TEST-SUMMARY.md) for detailed documentation.

## Running Agent Integration Tests

### Direct Execution (Recommended for detailed output)
```bash
python3 .blackbox5/tests/test_agent_integration.py
```

### Using pytest
```bash
pytest .blackbox5/tests/test_agent_integration.py -v
```

### Individual test suites
```bash
# Test 1: Multi-agent workflow
pytest .blackbox5/tests/test_agent_integration.py::test_multi_agent_workflow -v

# Test 2: Memory persistence
pytest .blackbox5/tests/test_agent_integration.py::test_memory_persistence -v

# Test 3: External integrations
pytest .blackbox5/tests/test_agent_integration.py::test_external_integrations -v

# Test 4: Agent coordination
pytest .blackbox5/tests/test_agent_integration.py::test_agent_coordination -v

# Test 5: Error handling
pytest .blackbox5/tests/test_agent_integration.py::test_error_handling -v
```

## Writing New Tests

### Test Template

```python
import pytest
from core.module import ClassToTest

class TestClassToTest:
    """Test ClassToTest functionality."""

    def test_something(self, fixture):
        """Should do something."""
        # Arrange
        instance = ClassToTest()

        # Act
        result = instance.method()

        # Assert
        assert result == expected

    @pytest.mark.integration
    def test_integration(self, real_component):
        """Should work with real component."""
        # Integration test
        pass
```

### Using Fixtures

```python
def test_with_fixtures(
    sample_tasks,
    mock_agent_registry,
    temp_log_dir
):
    """Test using multiple fixtures."""
    # Use the fixtures
    task = sample_tasks["simple"]
    # ...
```

### Mocking External Dependencies

```python
from unittest.mock import Mock, patch

def test_with_mock(mock_event_bus):
    """Test with mocked event bus."""
    # mock_event_bus is automatically provided
    result = mock_event_bus.publish("topic", event)
    assert result == 1
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      redis:
        image: redis:latest
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov

      - name: Run unit tests
        run: pytest -m unit

      - name: Run integration tests
        run: pytest -m integration

      - name: Generate coverage
        run: pytest --cov=.blackbox5/engine --cov-report=xml
```

## Debugging Tests

### Run with pdb debugger
```bash
pytest --pdb
```

### Stop on first failure
```bash
pytest -x
```

### Show local variables on failure
```bash
pytest -l
```

### Run tests in Python debugger
```bash
python -m pytest --pdb-trace
```

## Known Issues

### Redis Not Available
If Redis is not running, integration tests will be skipped:
```
SKIPPED [1] .blackbox5/tests/test_integration.py:xx: Redis not available
```

### ChromaDB/Neo4j Not Available
Similar skip behavior for ChromaDB and Neo4j tests.

## Test Maintenance

### Adding Fixtures
Add new fixtures to `conftest.py` following the naming convention:
- Scope-specific fixtures use `@pytest.fixture(scope="module")`
- Class-specific fixtures in test class files
- Use `autouse=True` for fixtures that should always run

### Updating Tests
When modifying components:
1. Update corresponding tests
2. Ensure all tests pass
3. Add tests for new functionality
4. Update test documentation

## Performance Benchmarks

Current test performance (approximate):
- Unit tests: ~2-5 seconds
- Integration tests: ~10-20 seconds (with Redis)
- Full suite: ~30-60 seconds

## Contributing

When adding new tests:
1. Follow existing test structure
2. Use descriptive test names
3. Add docstrings explaining what is being tested
4. Mock external dependencies where possible
5. Mark integration tests with `@pytest.mark.integration`
6. Mark slow tests with `@pytest.mark.slow`

## Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [Pytest Mock Documentation](https://docs.pytest.org/en/stable/how-to/unittest.html)
- [Blackbox 5 Implementation Plan](../IMPLEMENTATION-ACTION-PLAN.md)
