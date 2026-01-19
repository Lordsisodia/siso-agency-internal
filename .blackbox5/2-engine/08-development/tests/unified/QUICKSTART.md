# Quick Start Guide - Blackbox 5 Tests

## Installation

```bash
# Install test dependencies
pip install -r requirements.txt

# Or install manually
pip install pytest pytest-asyncio pytest-cov
```

## Running Tests

### Option 1: Using the test runner (Recommended)

```bash
cd .blackbox5/tests

# Run all tests
./run_tests.sh

# Run only unit tests (fast)
./run_tests.sh -u

# Run only integration tests
./run_tests.sh -i

# Run with coverage report
./run_tests.sh -c

# Silent mode (minimal output)
./run_tests.sh -s
```

### Option 2: Using pytest directly

```bash
cd .blackbox5/tests

# Run all tests
pytest

# Run specific test file
pytest test_task_router.py

# Run specific test
pytest test_task_router.py::TestTaskRouting::test_simple_task_routes_to_single_agent

# Run with verbose output
pytest -v

# Run unit tests only
pytest -m unit

# Run integration tests only
pytest -m integration

# Skip slow tests
pytest -m "not slow"
```

## Before Running Tests

### Start Redis (for integration tests)

```bash
# macOS
brew services start redis

# Linux
sudo systemctl start redis

# Or run directly
redis-server
```

### Verify Redis is running

```bash
redis-cli ping
# Should return: PONG
```

## Understanding Test Output

### Success Output
```
tests/test_task_router.py::TestTaskRouting::test_simple_task_routes_to_single_agent PASSED
```

### Skipped Test (Redis not available)
```
SKIPPED [1] tests/test_integration.py:123: Redis not available
```

### Failed Test
```
FAILED tests/test_task_router.py::TestTaskRouting::test_xxx
AssertionError: Expected 'single' but got 'multi'
```

## Common Issues

### Issue: "Redis not available"
**Solution**: Start Redis server or run with `-m unit` to skip integration tests

### Issue: "ModuleNotFoundError: No module named 'core'"
**Solution**: Make sure you're running from `.blackbox5/tests/` directory

### Issue: Tests fail with import errors
**Solution**: Ensure the engine directory structure is correct

## Test Structure

```
.blackbox5/tests/
├── conftest.py              # Shared fixtures
├── test_task_router.py      # Task routing tests
├── test_logging.py          # Logging tests
├── test_manifest.py         # Manifest tests
├── test_integration.py      # Integration tests
├── pytest.ini               # Pytest config
├── requirements.txt         # Test dependencies
├── run_tests.sh             # Test runner script
├── README.md                # Full documentation
└── TEST_SUMMARY.md          # Test summary
```

## Quick Reference

### Test Markers
- `unit` - Fast, isolated tests
- `integration` - Tests with real components
- `slow` - Tests taking > 1 second

### Key Fixtures
- `mock_event_bus` - Mock event bus
- `mock_agent_registry` - Mock agents
- `sample_tasks` - Sample tasks for testing
- `temp_log_dir` - Temporary log directory
- `temp_manifest_dir` - Temporary manifest directory

### Running Specific Tests

```bash
# By file
pytest test_task_router.py

# By class
pytest test_task_router.py::TestTaskRouting

# By test name
pytest -k "test_simple_task"

# By marker
pytest -m unit
pytest -m integration
pytest -m "not slow"
```

## Coverage Reports

```bash
# Generate HTML coverage report
pytest --cov=../engine --cov-report=html

# View report
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux
```

## Next Steps

1. Read the full documentation in `README.md`
2. Review `TEST_SUMMARY.md` for detailed test coverage
3. Explore individual test files to see examples
4. Add your own tests following the existing patterns

## Getting Help

- Run `./run_tests.sh -h` for test runner help
- Run `pytest --help` for pytest help
- See `README.md` for detailed documentation

---

**Happy Testing!**
