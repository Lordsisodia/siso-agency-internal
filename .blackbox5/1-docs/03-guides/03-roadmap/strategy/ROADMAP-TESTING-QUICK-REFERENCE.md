# Roadmap Testing Strategy - Quick Reference

**Quick reference for the comprehensive testing strategy**

---

## Test Count Summary

| Category | Tests | Focus |
|----------|-------|-------|
| **Unit Tests** | 200+ | Individual functions, validation logic |
| **Integration Tests** | 50 | Component interactions, gate flows |
| **E2E Tests** | 20 | Complete user workflows |
| **Performance Tests** | 5+ | Speed, scalability benchmarks |
| **Total** | 275+ | Complete system validation |

---

## Critical Test Areas (Test First)

### 1. Gate Validation (45 tests)
**Why first:** Gates prevent bad data from entering system

**Priority order:**
1. Gate 1: Proposed → Research (10 tests) - **START HERE**
2. Gate 2: Research → Design (12 tests)
3. Gate 3: Design → Planned (10 tests)
4. Gate 4: Planned → Active (8 tests)
5. Gate 5: Active → Completed (10 tests)

**Quick validation:**
```bash
# Test Gate 1 validation logic
pytest test_units/test_gates.py::TestGate1ProposedToResearch -v
```

### 2. YAML Schema Validation (25 tests)
**Why second:** Invalid YAML corrupts system

**Critical tests:**
- Required fields present
- Field values in allowed ranges
- Date formats correct
- No duplicate IDs
- Valid link references

### 3. Bidirectional Links (30 tests)
**Why third:** Links must stay consistent

**Critical tests:**
- A blocks B → B blocked_by A
- Update updates both directions
- Delete removes both directions
- Circular dependencies prevented

### 4. INDEX.yaml Synchronization (25 tests)
**Why fourth:** INDEX must stay accurate

**Critical tests:**
- Counts match reality
- Atomic writes (no corruption)
- Backup on update
- Recovery from corruption

---

## Test Execution Commands

### Run All Tests
```bash
# All roadmap tests
pytest .blackbox5/tests/roadmap/ -v

# With coverage
pytest .blackbox5/tests/roadmap/ --cov=roadmap --cov-report=html
```

### Run by Category
```bash
# Unit tests only
pytest .blackbox5/tests/roadmap/test_units/ -v

# Integration tests only
pytest .blackbox5/tests/roadmap/test_integration/ -v

# E2E tests only
pytest .blackbox5/tests/roadmap/test_e2e/ -v

# Performance tests only
pytest .blackbox5/tests/roadmap/test_performance/ -v
```

### Run Specific Tests
```bash
# All gate tests
pytest .blackbox5/tests/roadmap/test_units/test_gates.py -v

# Specific gate
pytest .blackbox5/tests/roadmap/test_units/test_gates.py::TestGate1ProposedToResearch -v

# Specific test
pytest .blackbox5/tests/roadmap/test_units/test_gates.py::TestGate1ProposedToResearch::test_proposal_has_idea_articulated -v
```

### Run in Parallel (Fast)
```bash
# Install pytest-xdist
pip install pytest-xdist

# Run tests in parallel
pytest .blackbox5/tests/roadmap/ -n auto
```

---

## E2E Scenarios (Must Pass)

### Happy Path (5 scenarios)
1. ✅ Simple feature: Proposed → Completed
2. ✅ Complex feature with dependencies
3. ✅ Feature with security review
4. ✅ Large effort with POC
5. ✅ Feature with deployment

### Edge Cases (10 scenarios)
6. ✅ Cancelled (infeasible)
7. ✅ Backlog and promote
8. ✅ Return to previous stage
9. ✅ Parallel work
10. ✅ Epic with children
11. ✅ Circular dependency attempt (should fail)
12. ✅ Concurrent modification
13. ✅ Missing file
14. ✅ Invalid YAML
15. ✅ Special characters
16. ✅ Very long title
17. ✅ Rapid transitions
18. ✅ Many improvements (100+)
19. ✅ Unicode content
20. ✅ Disk full

---

## Success Metrics

### Must Achieve
- [ ] 85%+ code coverage
- [ ] All 275+ tests passing
- [ ] Zero critical bugs
- [ ] Gate validation < 1s
- [ ] INDEX.yaml update < 500ms

### Nice to Have
- [ ] 90%+ code coverage
- [ ] 300+ tests
- [ ] Gate validation < 500ms
- [ ] All performance benchmarks met

---

## Week-by-Week Plan

### Week 1: Foundation
- [ ] Set up test infrastructure
- [ ] Create fixtures
- [ ] Write first 25 unit tests (YAML validation)
- [ ] Write first 10 unit tests (Gate 1)
- [ ] Write first E2E test (simple lifecycle)

### Week 2: Core Coverage
- [ ] Complete all unit tests (200+)
- [ ] Achieve 85%+ coverage
- [ ] All gate tests passing
- [ ] All link tests passing

### Week 3: Integration & E2E
- [ ] Complete all integration tests (50)
- [ ] Complete all E2E scenarios (20)
- [ ] Test with real data

### Week 4: Performance & Polish
- [ ] Complete performance tests
- [ ] Complete edge case tests
- [ ] Stress test with 100+ improvements
- [ ] Document any issues

---

## Quick Wins (Validate Design)

### Day 1: Create First Improvement
```bash
python -m roadmap.cli create proposal \
  --title "Test Feature" \
  --category feature \
  --domain agents \
  --priority high

# Validate: File created, YAML valid, INDEX updated
```

### Day 2: Validate Gate Logic
```bash
pytest test_units/test_gates.py::TestGate1ProposedToResearch -v

# Validate: All Gate 1 tests pass
```

### Day 3: Complete Lifecycle
```bash
pytest test_e2e/test_workflows.py::test_e2e_simple_feature -v

# Validate: Full lifecycle works
```

### Day 4: Test Real Data
```bash
python -m roadmap.migrate --source docs/plan.md

# Validate: Migration works
```

### Day 5: Performance Check
```bash
pytest test_performance/test_gate_speed.py -v

# Validate: Gate validation < 1s
```

---

## Common Issues & Solutions

### Issue: Tests Fail with File Not Found
**Solution:** Ensure temp_roadmap_dir fixture is used

### Issue: INDEX.yaml Out of Sync
**Solution:** Run INDEX.yaml rebuild command
```bash
python -m roadmap.cli rebuild-index
```

### Issue: Circular Dependency Not Detected
**Solution:** Check dependency graph algorithm
```bash
python -m roadmap.cli check-circular-deps
```

### Issue: Tests Slow
**Solution:** Use mock filesystem for unit tests
```python
# Use mock_filesystem fixture
@pytest.fixture
def mock_fs():
    from pyfakefs import fake_filesystem
    # ... setup
```

### Issue: Coverage Low
**Solution:** Add tests for uncovered code
```bash
# Generate coverage report
pytest --cov=roadmap --cov-report=html

# Open htmlcov/index.html to see what's missing
```

---

## Test Data Locations

### Small Dataset (10 improvements)
```bash
.blackbox5/tests/roadmap/fixtures/test_data_small.yaml
```

### Medium Dataset (50 improvements)
```bash
.blackbox5/tests/roadmap/fixtures/test_data_medium.yaml
```

### Large Dataset (100 improvements)
```bash
.blackbox5/tests/roadmap/fixtures/test_data_large.yaml
```

### Edge Cases
```bash
.blackbox5/tests/roadmap/fixtures/test_data_edge_cases.yaml
```

### Dependency Graphs
```bash
.blackbox5/tests/roadmap/fixtures/test_data_dependencies.yaml
```

---

## CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test-roadmap.yml
on:
  push:
    paths:
      - '.blackbox5/roadmap/**'
      - '.blackbox5/tests/roadmap/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pip install -e .[test]
      - run: pytest .blackbox5/tests/roadmap/ -v --cov=roadmap
```

### Pre-commit Hook
```bash
# .git/hooks/pre-commit
#!/bin/bash
pytest .blackbox5/tests/roadmap/test_units/ -q --tb=no
```

---

## Key Files

| File | Purpose |
|------|---------|
| `ROADMAP-TESTING-STRATEGY.md` | Full testing strategy |
| `ROADMAP-TESTING-QUICK-REFERENCE.md` | This file |
| `conftest.py` | Test fixtures |
| `test_units/test_gates.py` | Gate validation tests |
| `test_units/test_links.py` | Link validation tests |
| `test_units/test_yaml_validation.py` | YAML schema tests |
| `test_integration/test_transitions.py` | Stage transition tests |
| `test_e2e/test_workflows.py` | E2E workflow tests |
| `test_performance/test_gate_speed.py` | Performance tests |

---

## Getting Help

### Run Tests with Debug Output
```bash
pytest .blackbox5/tests/roadmap/ -v -s --tb=long
```

### Check Test Coverage
```bash
pytest .blackbox5/tests/roadmap/ --cov=roadmap --cov-report=term-missing
```

### Run Specific Test Category
```bash
# Unit tests only
pytest .blackbox5/tests/roadmap/test_units/ -v

# Integration tests only
pytest .blackbox5/tests/roadmap/test_integration/ -v

# E2E tests only
pytest .blackbox5/tests/roadmap/test_e2e/ -v
```

### Run Failed Tests Only
```bash
pytest .blackbox5/tests/roadmap/ --lf
```

### Run Until First Failure
```bash
pytest .blackbox5/tests/roadmap/ -x
```

---

## Summary

**Total Tests:** 275+
**Target Coverage:** 85%+
**Timeline:** 4 weeks
**Priority:** Gate validation → YAML → Links → INDEX → E2E

**Start Here:**
1. Set up test infrastructure (Day 1)
2. Write Gate 1 tests (Day 2)
3. Write YAML validation tests (Day 3)
4. Write first E2E test (Day 4)
5. Test with real data (Day 5)

**Success Criteria:**
- All tests passing
- 85%+ coverage
- Performance benchmarks met
- Zero critical bugs
