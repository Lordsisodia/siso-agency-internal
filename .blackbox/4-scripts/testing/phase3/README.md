# Phase 3 Test Suite: Structured Spec Creation

This directory contains comprehensive tests for Phase 3 (Structured Spec Creation) of Blackbox4.

## Test Structure

```
phase3/
├── test-spec-creation.sh      # Tests spec creation library (12 tests)
├── test-questioning.sh        # Tests questioning workflow (8 tests)
├── test-validation.sh         # Tests validation system (8 tests)
├── test-integration.sh        # Tests integration (8 tests)
├── validate-phase3.sh         # Master validation script
├── end-to-end-test.py         # End-to-end workflow test
├── TEST-REPORT-TEMPLATE.md    # Test report template
└── README.md                  # This file
```

## Quick Start

### Run All Tests

```bash
./validate-phase3.sh
```

This will:
- Run all individual test suites
- Check Phase 1 + Phase 2 + Phase 3 integration
- Generate a comprehensive test report
- Return appropriate exit codes for CI/CD

### Run Individual Test Suites

```bash
# Test spec creation library
./test-spec-creation.sh

# Test questioning workflow
./test-questioning.sh

# Test validation system
./test-validation.sh

# Test integration
./test-integration.sh

# Run end-to-end test
./end-to-end-test.py
```

## Test Coverage

### Spec Creation Tests (test-spec-creation.sh)

Tests the core spec creation functionality:
- Library structure and file existence
- Python imports
- SpecType enum
- Spec serialization/deserialization
- PRD generation
- Technical spec generation
- Database schema spec
- API spec generation
- Test plan spec
- UX spec generation
- Spec validation
- Edge cases

**Total: 12 test cases**

### Questioning Tests (test-questioning.sh)

Tests the intelligent questioning system:
- Questioning module structure
- Question creation
- Gap analysis
- Question strategies
- Priority calculation
- Question dependencies
- Session persistence
- Interactive CLI simulation

**Total: 8 test cases**

### Validation Tests (test-validation.sh)

Tests the spec validation system:
- Validation module structure
- Spec validator
- Required field validation
- Cross-artifact validation
- Validation reports
- Auto-fix functionality
- Validation rules
- Output formats

**Total: 8 test cases**

### Integration Tests (test-integration.sh)

Tests integration with other Blackbox4 components:
- Spec to plan conversion
- Plan to spec conversion
- Context integration
- Agent handoff with specs
- CLI integration
- Backward compatibility
- Existing plan compatibility
- End-to-end workflow

**Total: 8 test cases**

### End-to-End Test (end-to-end-test.py)

Tests the complete spec creation workflow:
1. Create spec from requirement
2. Run questioning workflow
3. Generate PRD with user stories
4. Validate spec
5. Convert to plan
6. Verify all artifacts
7. Save and load spec

**Total: 7 workflow steps**

## Test Output

### Individual Test Suite Output

```
[INFO] Starting Phase 3: Spec Creation Tests

====================================
Test 1: Spec Creation Library Structure
====================================

[TEST] Spec creation library directory exists
[PASS] Spec creation library directory exists
[TEST] __init__.py exists
[PASS] __init__.py exists
...

====================================
Test Summary
====================================
Tests run: 12
Tests passed: 12
Tests failed: 0

✓ All tests passed!
```

### Master Validation Output

```
╔════════════════════════════════════════════════════════════╗
║ Phase 3: Structured Spec Creation - Master Validation     ║
╚════════════════════════════════════════════════════════════╝

[INFO] Starting comprehensive Phase 3 validation...
[INFO] Blackbox4 root: /path/to/.blackbox4

[INFO] Running test suite: Spec Creation Tests
... (test output) ...
✓ Spec Creation Tests: PASSED

... (more test suites) ...

▶ Phase 1 Integration Check
────────────────────────────────────────────────────────────
✓ Phase 1 integration: PASSED (3/3 checks)

▶ Phase 2 Integration Check
────────────────────────────────────────────────────────────
✓ Phase 2 integration: PASSED (3/3 checks)

▶ Phase 3 Completeness Check
────────────────────────────────────────────────────────────
✓ Phase 3 completeness: PASSED (8/8 checks)

╔════════════════════════════════════════════════════════════╗
║ ALL TESTS PASSED - Phase 3 is fully operational!          ║
╚════════════════════════════════════════════════════════════╝
```

## Exit Codes

The master validation script returns the following exit codes:

- `0`: All tests passed
- `1`: Some tests failed
- `2`: Critical error (e.g., missing dependencies)

This makes it suitable for CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Phase 3 Tests
  run: ./4-scripts/testing/phase3/validate-phase3.sh
```

## Test Report Template

Use `TEST-REPORT-TEMPLATE.md` to generate comprehensive test reports after running tests:

1. Copy the template: `cp TEST-REPORT-TEMPLATE.md test-report-2025-01-15.md`
2. Fill in the results from test execution
3. Add screenshots and additional notes as needed
4. Share with stakeholders

## Color Scheme

The test scripts use a consistent color scheme:

- 🔵 **BLUE**: Headers and section titles
- 🟡 **YELLOW**: Test indicators
- 🟢 **GREEN**: Success/pass messages
- 🔴 **RED**: Failure/error messages

## Troubleshooting

### Python Module Not Found

If you get "Module not found" errors:

```bash
# Check that spec-creation library exists
ls -la ../../lib/spec-creation/

# Verify Python can import modules
cd ../../lib/spec-creation
python3 -c "import spec_types"
```

### Permission Denied

If scripts won't execute:

```bash
chmod +x phase3/*.sh phase3/*.py
```

### Tests Fail with Existing Plans

If integration tests fail with existing plans:

```bash
# Check existing plans
ls -la ../../../.plans/

# Tests should handle this gracefully
# If not, report it as a bug
```

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Use the same color scheme and output format
3. Include both positive and negative test cases
4. Test edge cases and error conditions
5. Update this README with new test descriptions

## CI/CD Integration

### GitHub Actions

```yaml
name: Phase 3 Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - name: Run Phase 3 Tests
        run: .blackbox4/4-scripts/testing/phase3/validate-phase3.sh
```

### GitLab CI

```yaml
test:phase3:
  script:
    - .blackbox4/4-scripts/testing/phase3/validate-phase3.sh
  artifacts:
    reports:
      junit: test-results.xml
```

## Maintenance

### Update Tests After Code Changes

When modifying spec creation code:

1. Run all tests: `./validate-phase3.sh`
2. Fix any failing tests
3. Add new tests for new features
4. Update test counts in this README

### Periodic Review

Review and update tests:
- Monthly: Check for deprecated patterns
- Quarterly: Review test coverage
- Annually: Major test suite refactoring

## Support

For issues or questions about Phase 3 tests:

1. Check the main Blackbox4 documentation
2. Review test output for specific error messages
3. Consult the test source code for implementation details
4. Report issues in the Blackbox4 issue tracker

---

**Test Suite Version:** 1.0.0
**Last Updated:** 2025-01-15
**Blackbox4 Version:** 1.0.0
