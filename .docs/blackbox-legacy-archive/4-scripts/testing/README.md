# Testing Scripts

Testing related scripts for Blackbox4.

## Phase 2 Test Infrastructure

Comprehensive test suite for Phase 2: Hierarchical Tasks Implementation.

### Test Scripts

1. **test-hierarchical-tasks.sh**
   Comprehensive test suite validating:
   - Library structure (hierarchical-tasks, task-breakdown)
   - Python imports (HierarchicalTask, TaskBreakdownEngine)
   - Basic functionality (hierarchy creation, relationships)
   - File existence and permissions

   Usage:
   ```bash
   ./test-hierarchical-tasks.sh
   ```

2. **validate-phase2.sh**
   Quick validation script that runs all example scripts:
   - Simple hierarchy example
   - Auto breakdown example
   - Checklist integration example
   - Hierarchical plan script
   - Wrapper scripts
   - End-to-end integration flow

   Usage:
   ```bash
   ./validate-phase2.sh
   ```

3. **TEST-REPORT-TEMPLATE.md**
   Template for generating test reports with:
   - Executive summary with metrics
   - Test results by category
   - Detailed findings and recommendations
   - Performance metrics and environment details

### Other Testing Scripts

- `autonomous-loop.sh` - Autonomous testing loop
- `benchmark-task.sh` - Task performance benchmarking
- `check-ui-constraints.sh` - UI constraint validation
- `check-vendor-leaks.sh` - Vendor dependency checks
- `lib.sh` - Shared testing library
- `start-feature-research.sh` - Feature research testing
- `start-oss-discovery-cycle.sh` - OSS discovery testing
- `start-testing.sh` - Main testing orchestration
- `start-ui-cycle.sh` - UI cycle testing
- `test-context-variables.sh` - Context variable validation

## Usage

### From .blackbox4 root:
```bash
./4-scripts/testing/<script>.sh [args]
```

### From within 4-scripts:
```bash
cd 4-scripts
./testing/<script>.sh [args]
```

### Run Phase 2 Tests:
```bash
# Comprehensive test suite
./4-scripts/testing/test-hierarchical-tasks.sh

# Quick validation
./4-scripts/testing/validate-phase2.sh
```

## Test Output

### Console Output
Tests use color-coded output:
- **GREEN**: Info/Pass messages
- **RED**: Error/Fail messages
- **YELLOW**: Warning messages
- **BLUE**: Test execution messages
- **CYAN**: Validation messages

### Exit Codes
- **0**: All tests passed
- **1**: One or more tests failed

### Log Files
Test output is logged to:
- `/tmp/simple_hierarchy_output.log`
- `/tmp/auto_breakdown_output.log`
- `/tmp/checklist_output.log`
- `/tmp/integration_test.log`

## Test Coverage

### Library Structure Tests
- Directory existence checks
- File existence checks
- Executable permission checks
- Required file validation

### Python Import Tests
- Module import validation
- Class availability checks
- Dependency resolution

### Functionality Tests
- Basic hierarchy operations
- Parent-child relationships
- Task depth calculation
- Auto breakdown functionality
- Checklist generation

### Integration Tests
- End-to-end workflow validation
- Wrapper script functionality
- Plan generation and processing

## Extending Tests

### Adding New Tests

1. Create test function in `test-hierarchical-tasks.sh`:
```bash
test_new_feature() {
    log_test "New feature test"
    if [[ condition ]]; then
        test_pass "Feature works"
    else
        test_fail "Feature failed"
    fi
}
```

2. Call in main():
```bash
main() {
    test_new_feature
    echo ""
}
```

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Phase 2 Tests
  run: |
    cd 4-scripts/testing
    ./test-hierarchical-tasks.sh
    ./validate-phase2.sh
```

## Related Documentation

- Phase 2 Implementation: `/4-scripts/lib/hierarchical-tasks/README.md`
- Task Breakdown: `/4-scripts/lib/task-breakdown/README.md`
- Hierarchical Planning: `/4-scripts/planning/hierarchical-plan.py`
- Examples: `/1-agents/4-specialists/hierarchical-examples/README.md`

## See Also

- [../README.md](../README.md) - All scripts overview
- [../lib/README.md](../lib/README.md) - Library documentation
