# Phase 4 Test Suite Documentation

Comprehensive test infrastructure for Ralph Runtime in Blackbox4 Phase 4.

## Overview

The Phase 4 test suite provides comprehensive testing for Ralph Runtime, including:

- **Core Functionality Tests**: Runtime initialization, autonomous execution, agent coordination
- **Circuit Breaker Tests**: State transitions, failure detection, auto-recovery
- **Response Analyzer Tests**: Pattern matching, quality scoring, Ralph-specific analysis
- **Integration Tests**: Cross-phase integration, end-to-end workflows
- **Performance Tests**: Load testing, stress testing, resource monitoring

## Test Files

### Shell Script Tests

#### `test-ralph-runtime.sh` (~7-8KB)
Tests Ralph Runtime core functionality with 12+ test cases:

- Runtime directory structure
- Runtime initialization
- Autonomous execution
- Agent coordination
- State management
- Error handling
- Decision making
- Progress tracking
- Logging system
- Configuration management
- Resource management
- Cleanup and teardown

**Usage:**
```bash
./test-ralph-runtime.sh
```

**Expected Output:**
```
╔════════════════════════════════════════════════════════════╗
║ Phase 4: Ralph Runtime - Core Functionality Tests          ║
╚════════════════════════════════════════════════════════════╝

[INFO] Starting Ralph Runtime tests...
[INFO] Blackbox4 root: /path/to/.blackbox4

▶ Runtime Directory Structure
────────────────────────────────────────────────────────────
[TEST] Ralph Runtime library directory exists
[PASS] Ralph Runtime library directory exists
[TEST] Python runtime directory exists
[PASS] Python runtime directory exists
...
```

#### `test-circuit-breaker.sh` (~6-7KB)
Tests circuit breaker functionality with 10+ test cases:

- Circuit breaker library structure
- Circuit state initialization
- State transitions (CLOSED → OPEN → HALF_OPEN → CLOSED)
- Failure detection (stagnation, timeout, error threshold)
- Auto-recovery mechanisms
- Metrics collection
- Threshold configuration
- Logging and history
- Manual override
- Project-specific thresholds

**Usage:**
```bash
./test-circuit-breaker.sh
```

#### `test-response-analyzer.sh` (~6-7KB)
Tests response analyzer functionality with 10+ test cases:

- Analyzer library structure
- Pattern matching (success, failure, progress)
- Quality scoring (completeness, relevance, clarity)
- Expectation validation
- Ralph-specific analysis (decision markers, coordination)
- Response categorization
- Sentiment analysis
- Progress tracking in responses
- Action extraction
- Response validation
- Metrics collection

**Usage:**
```bash
./test-response-analyzer.sh
```

#### `test-integration-phase4.sh` (~6-7KB)
Tests Phase 4 integration with Phases 1-3 with 10+ test cases:

- Phase 1 (Context) + Phase 4 integration
- Phase 2 (Planning/Tasks) + Phase 4 integration
- Phase 3 (Specs) + Phase 4 integration
- Circuit breaker integration with runtime
- Response analyzer integration
- End-to-end workflow across all phases
- Cross-phase data flow
- Backward compatibility with existing plans
- Cross-phase error handling

**Usage:**
```bash
./test-integration-phase4.sh
```

#### `validate-phase4.sh` (~5-6KB)
Master validation script that runs all Phase 4 tests:

- Runs all test suites
- Verifies integration with Phases 1-3
- Checks Phase 4 completeness
- Generates final report
- Provides exit codes for CI/CD

**Usage:**
```bash
./validate-phase4.sh
```

**Exit Codes:**
- `0`: All tests passed
- `1`: Some tests failed

### Python Tests

#### `end-to-end-ralph-test.py` (~5-6KB)
End-to-end test for Ralph Runtime:

- Creates complex multi-step scenario
- Executes autonomously
- Monitors progress
- Validates results
- Generates detailed report

**Usage:**
```bash
python3 end-to-end-ralph-test.py
```

**Scenario:**
1. Requirements Analysis
2. Design
3. Implementation
4. Testing
5. Documentation
6. Deployment

**Output:**
- Test report JSON: `/tmp/blackbox4-e2e-test/test-report.json`
- Console output with colored results

#### `load-test.py` (~4-5KB)
Load testing for Ralph Runtime:

- Concurrent execution tests (10 threads)
- Stress load tests (100 requests)
- Memory usage monitoring
- Resource contention tests
- Performance scaling analysis

**Usage:**
```bash
python3 load-test.py
```

**Requirements:**
- Python 3.7+
- psutil (optional, for memory monitoring)

**Output:**
- Load test report JSON: `/tmp/blackbox4-load-test/load-test-report.json`

## Understanding Test Output

### Color-Coded Output

- 🔵 **BLUE** (`[TEST]`): Test being executed
- 🟢 **GREEN** (`[PASS]`): Test passed successfully
- 🔴 **RED** (`[FAIL]`): Test failed
- 🟡 **YELLOW** (`▶`): Section headers
- 🔵 **CYAN**: Frame headers

### Test Summary

Each test script generates a summary:

```
Test Results:
  Total Tests: 45
  Passed: 45
  Failed: 0

Pass Rate: 100%

╔════════════════════════════════════════════════════════════╗
║ ALL TESTS PASSED - Ralph Runtime is fully functional!     ║
╚════════════════════════════════════════════════════════════╝
```

### Test Counters

- **Tests Run**: Total number of tests executed
- **Passed**: Number of tests that passed
- **Failed**: Number of tests that failed
- **Pass Rate**: Percentage of tests passed

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Phase 4 Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Run Phase 4 Tests
        run: |
          cd .blackbox4/4-scripts/testing/phase4
          chmod +x validate-phase4.sh
          ./validate-phase4.sh

      - name: Check Results
        run: |
          if [ $? -eq 0 ]; then
            echo "All tests passed!"
          else
            echo "Some tests failed!"
            exit 1
          fi
```

### GitLab CI Example

```yaml
test:phase4:
  script:
    - cd .blackbox4/4-scripts/testing/phase4
    - chmod +x validate-phase4.sh
    - ./validate-phase4.sh
  artifacts:
    when: always
    paths:
      - .blackbox4/.tests/phase4/
```

### Jenkins Example

```groovy
pipeline {
    agent any

    stages {
        stage('Phase 4 Tests') {
            steps {
                dir('.blackbox4/4-scripts/testing/phase4') {
                    sh 'chmod +x validate-phase4.sh'
                    sh './validate-phase4.sh'
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: '.blackbox4/.tests/phase4/**/*'
        }
    }
}
```

## Running Individual Test Suites

### Run All Tests
```bash
cd .blackbox4/4-scripts/testing/phase4
./validate-phase4.sh
```

### Run Specific Test Suite
```bash
cd .blackbox4/4-scripts/testing/phase4
./test-ralph-runtime.sh
./test-circuit-breaker.sh
./test-response-analyzer.sh
./test-integration-phase4.sh
```

### Run Python Tests
```bash
cd .blackbox4/4-scripts/testing/phase4
python3 end-to-end-ralph-test.py
python3 load-test.py
```

## Test Data Locations

Test data is created in:
```
.blackbox4/.tests/phase4/
├── ralph-runtime/
├── circuit-breaker/
├── response-analyzer/
├── integration/
└── (test-specific directories)
```

## Troubleshooting

### Permission Denied Error

**Problem:**
```
bash: ./test-ralph-runtime.sh: Permission denied
```

**Solution:**
```bash
chmod +x .blackbox4/4-scripts/testing/phase4/*.sh
```

### Command Not Found Error

**Problem:**
```
jq: command not found
```

**Solution:**
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# CentOS/RHEL
sudo yum install jq
```

### Python Module Not Found

**Problem:**
```
ModuleNotFoundError: No module named 'psutil'
```

**Solution:**
```bash
pip3 install psutil
```

### Test Failures

**Problem:**
```
[FAIL] Ralph Runtime library exists
```

**Solution:**
1. Check if Ralph Runtime library is installed
2. Verify paths in test scripts
3. Check file permissions
4. Review test logs for detailed errors

### Cleanup Test Data

**Remove all test data:**
```bash
rm -rf .blackbox4/.tests/phase4/
```

**Remove specific test data:**
```bash
rm -rf .blackbox4/.tests/phase4/ralph-runtime/
rm -rf .blackbox4/.tests/phase4/circuit-breaker/
```

## Test Coverage

### Functional Tests
- ✅ Runtime initialization
- ✅ Autonomous execution
- ✅ Agent coordination
- ✅ State management
- ✅ Error handling
- ✅ Decision making
- ✅ Progress tracking
- ✅ Logging system
- ✅ Configuration management
- ✅ Resource management

### Integration Tests
- ✅ Phase 1 + Phase 4 integration
- ✅ Phase 2 + Phase 4 integration
- ✅ Phase 3 + Phase 4 integration
- ✅ Circuit breaker integration
- ✅ Response analyzer integration
- ✅ End-to-end workflows
- ✅ Cross-phase data flow
- ✅ Backward compatibility

### Performance Tests
- ✅ Concurrent execution
- ✅ Stress load testing
- ✅ Memory usage monitoring
- ✅ Resource contention
- ✅ Performance scaling

### Reliability Tests
- ✅ Error recovery
- ✅ Circuit breaker functionality
- ✅ Failure detection
- ✅ Auto-recovery mechanisms
- ✅ Manual override capabilities

## Best Practices

1. **Run tests before committing**: Always run `validate-phase4.sh` before pushing changes
2. **Run specific tests**: During development, run specific test suites for faster feedback
3. **Review test output**: Pay attention to warnings and failures
4. **Clean up test data**: Regularly clean up test data directories
5. **Update tests**: When adding new features, update tests accordingly
6. **Monitor performance**: Run load tests periodically to catch performance regressions

## Contributing

When adding new tests:

1. Follow existing test patterns
2. Use same color scheme and output format
3. Include pass/fail counters
4. Test both individual components and integration
5. Test backward compatibility
6. Update this README

## Support

For issues or questions:
1. Check test output for error messages
2. Review troubleshooting section
3. Check test logs in `.blackbox4/.tests/phase4/`
4. Consult main Blackbox4 documentation

## Version History

- **v1.0.0** (2025-01-15): Initial Phase 4 test suite
  - Ralph Runtime tests
  - Circuit Breaker tests
  - Response Analyzer tests
  - Integration tests
  - Performance tests
  - Master validation script
