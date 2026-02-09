# Testing Directory

**Purpose:** Test files, test data, and testing utilities.

---

## Directory Structure

```
testing/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── fixtures/       # Test data
├── mocks/          # Mock implementations
└── README.md       # This file
```

---

## Test Organization

### Unit Tests

Test individual modules:
- `test_task_utils.py`
- `test_storage_backends.py`
- `test_event_logging.py`

### Integration Tests

Test module interactions:
- `test_task_lifecycle.py`
- `test_agent_execution.py`

### Fixtures

Test data files:
- Sample tasks
- Sample configurations
- Sample logs

---

## Running Tests

```bash
# Run all tests
python -m pytest testing/

# Run specific module
python -m pytest testing/unit/test_task_utils.py

# Run with coverage
python -m pytest --cov=lib testing/
```
