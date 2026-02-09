# Examples - Phase 4

**Version:** 1.0.0
**Last Updated:** 2026-01-15
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Basic Examples](#basic-examples)
3. [Real-World Scenarios](#real-world-scenarios)
4. [Autonomous Execution Examples](#autonomous-execution-examples)
5. [Circuit Breaker Examples](#circuit-breaker-examples)
6. [Response Analyzer Examples](#response-analyzer-examples)
7. [Multi-Agent Coordination](#multi-agent-coordination)
8. [Error Recovery Examples](#error-recovery-examples)

---

## Overview

This document provides comprehensive examples for using Phase 4 (Ralph Runtime) in various scenarios. Each example includes complete code and expected output.

### Example Categories

- **Basic Examples:** Simple getting-started examples
- **Real-World Scenarios:** Practical use cases
- **Autonomous Execution:** Full autonomous workflows
- **Circuit Breaker:** Safety system examples
- **Response Analyzer:** Progress tracking examples
- **Multi-Agent Coordination:** Complex workflows
- **Error Recovery:** Handling failures

---

## Basic Examples

### Example 1: Hello World

**Setup:**
```bash
mkdir -p hello-world && cd hello-world
cat > README.md << 'EOF'
# Hello World

Create a simple hello world program.

## Success Criteria
- [ ] Program prints "Hello, World!"
- [ ] Code is clean
- [ ] Documentation exists
EOF
```

**Execution:**
```bash
cd hello-world
../../4-scripts/autonomous-loop.sh run
```

**Output:**
```
🚀 Autonomous loop session initialized
   Circuit breaker: CLOSED
   Max loops: 3

=== Loop 1 of 3 ===
Working on tasks...
Created hello.py with print statement
Progress: 33%

=== Loop 2 of 3 ===
Working on tasks...
Added comments and documentation
Progress: 66%

=== Loop 3 of 3 ===
Working on tasks...
Finalized code and documentation
Progress: 100%

✅ Session completed!
   Total loops: 3
   Final progress: 100%
```

### Example 2: Simple Feature

**Setup:**
```bash
mkdir -p simple-feature && cd simple-feature
cat > README.md << 'EOF'
# User Profile Feature

Add user profile page with:
- Name display
- Email display
- Profile picture

## Success Criteria
- [ ] Profile page created
- [ ] All fields working
- [ ] Responsive design
- [ ] Tests passing
EOF
```

**Execution:**
```bash
cd simple-feature
export PROJECT_TYPE="simple_script"
../../4-scripts/autonomous-loop.sh run
```

**Monitoring:**
```bash
# In another terminal
cd simple-feature
watch -n 2 '../../4-scripts/autonomous-loop.sh status'
```

---

## Real-World Scenarios

### Scenario 1: E-commerce Checkout

**Setup:**
```bash
mkdir -p ecommerce-checkout && cd ecommerce-checkout

# Create spec (Phase 3)
python3 ../../4-scripts/planning/spec-create.py create \
    --name "E-commerce Checkout Flow" \
    --output specs/checkout-spec.json << 'EOF'
# E-commerce Checkout Flow

## User Stories
- As a customer, I want to add items to cart
- As a customer, I want to enter shipping info
- As a customer, I want to enter payment info
- As a customer, I want to confirm order

## Requirements
- Cart persistence
- Shipping validation
- Payment integration
- Order confirmation

## Success Criteria
All user stories implemented and tested
EOF

# Set context (Phase 1)
export TENANT_ID="shopify_001"
export TENANT_NAME="Shopify Store"
export PROJECT_TYPE="critical_feature"

# Break down tasks (Phase 2)
../../hierarchical-plan.sh breakdown \
    --spec specs/checkout-spec.json

# Execute autonomously (Phase 4)
../../4-scripts/autonomous-loop.sh run
```

**Result:**
- Spec drives autonomous execution
- Context ensures tenant-specific implementation
- Hierarchical tasks guide execution order
- Circuit breaker prevents infinite loops
- Complete checkout flow implemented

### Scenario 2: API Development

**Setup:**
```bash
mkdir -p api-development && cd api-development

# Create spec
cat > README.md << 'EOF'
# REST API Development

## Endpoints
- POST /users - Create user
- GET /users/:id - Get user
- PUT /users/:id - Update user
- DELETE /users/:id - Delete user

## Requirements
- JWT authentication
- Input validation
- Error handling
- API documentation

## Success Criteria
All endpoints working, documented, tested
EOF

# Execute
export PROJECT_TYPE="critical_feature"
../../4-scripts/autonomous-loop.sh run
```

**Expected Progress:**
```
Loop 1: Set up project structure
Loop 2: Implement authentication
Loop 3: Create user endpoints
Loop 4: Add validation
Loop 5: Error handling
Loop 6: Documentation
Loop 7: Testing
Loop 8: Complete
```

### Scenario 3: Data Migration

**Setup:**
```bash
mkdir -p data-migration && cd data-migration

cat > README.md << 'EOF'
# Database Migration

Migrate user data from legacy system.

## Tasks
- [ ] Analyze legacy schema
- [ ] Design new schema
- [ ] Write migration script
- [ ] Test migration
- [ ] Verify data integrity

## Success Criteria
All data migrated without loss
EOF

# Execute with research thresholds
export PROJECT_TYPE="research_task"
../../4-scripts/autonomous-loop.sh run
```

---

## Autonomous Execution Examples

### Example 1: Full Autonomous Workflow

```bash
# Complete workflow from spec to completion

# 1. Create spec
python3 4-scripts/planning/spec-create.py create \
    --name "User Authentication" \
    --context tenant_id=acme_001

# 2. Set context
export TENANT_ID="acme_001"
export PROJECT_TYPE="critical_feature"

# 3. Execute autonomously
./4-scripts/autonomous-loop.sh run

# 4. Monitor in real-time
# Terminal 2
watch -n 2 './4-scripts/autonomous-loop.sh status'

# 5. Check logs
# Terminal 3
tail -f .ralph/logs/*.log
```

### Example 2: Autonomous Testing

```bash
mkdir -p autonomous-test && cd autonomous-test

cat > README.md << 'EOF'
# Automated Testing Suite

Create comprehensive tests for existing codebase.

## Test Categories
- Unit tests
- Integration tests
- E2E tests

## Success Criteria
80% code coverage, all tests passing
EOF

# Execute autonomously
export PROJECT_TYPE="simple_script"
../../4-scripts/autonomous-loop.sh run
```

### Example 3: Autonomous Documentation

```bash
mkdir -p auto-docs && cd auto-docs

cat > README.md << 'EOF'
# API Documentation

Auto-generate API documentation from code.

## Components
- Endpoint documentation
- Parameter descriptions
- Response formats
- Code examples

## Success Criteria
All endpoints documented with examples
EOF

# Execute
export PROJECT_TYPE="documentation"
../../4-scripts/autonomous-loop.sh run
```

---

## Circuit Breaker Examples

### Example 1: Stagnation Detection

```bash
mkdir -p stagnation-test && cd stagnation-test

# Create task that will stagnate
cat > README.md << 'EOF'
# Complex Problem

Solve this complex problem that requires iteration.

## Note
This task intentionally progresses slowly to demonstrate stagnation detection.
EOF

# Set low thresholds for testing
cat > config.yaml << 'EOF'
circuit_breaker:
  max_loops_no_progress: 5
  stagnation_threshold: 3
EOF

# Execute
export CIRCUIT_CONFIG="config.yaml"
../../4-scripts/autonomous-loop.sh run

# Expected output:
# Loop 1: Progress 5%
# Loop 2: Progress 6% (stagnation warning)
# Loop 3: Progress 7% (stagnation count: 2)
# Loop 4: Progress 8% (stagnation count: 3)
# Loop 5: Progress 9% (stagnation count: 4)
# 🚨 CIRCUIT BREAKER TRIGGERED: Stagnation: 5 loops
```

### Example 2: Absolute Maximum

```bash
# Set absolute max low
cat > config.yaml << 'EOF'
circuit_breaker:
  absolute_max_loops: 5
EOF

# Execute
export CIRCUIT_CONFIG="config.yaml"
../../4-scripts/autonomous-loop.sh run

# Will stop at loop 5 regardless of progress
```

### Example 3: Project-Specific Thresholds

```bash
# Critical feature
export PROJECT_TYPE="critical_feature"
../../4-scripts/autonomous-loop.sh run
# Allows 15 loops, 2% stagnation threshold

# Research task
export PROJECT_TYPE="research_task"
../../4-scripts/autonomous-loop.sh run
# Allows 20 loops, 5% stagnation threshold

# Simple script
export PROJECT_TYPE="simple_script"
../../4-scripts/autonomous-loop.sh run
# Allows 3 loops, 10% stagnation threshold
```

---

## Response Analyzer Examples

### Example 1: Completion Detection

```bash
# Create @fix_plan.md
cat > .ralph/@fix_plan.md << 'EOF'
# Task List
- [x] Task 1
- [x] Task 2
- [ ] Task 3
- [ ] Task 4
EOF

# Analyze
source 4-scripts/lib/response-analyzer.sh
score=$(extract_completion_score "")
echo "Completion: $score%"
# Output: Completion: 50%
```

### Example 2: Confidence Extraction

```bash
# High confidence response
response1="I am confident this will work perfectly"
confidence1=$(extract_confidence "$response1")
echo "Confidence: $confidence1%"
# Output: Confidence: 90%

# Medium confidence response
response2="This will probably work"
confidence2=$(extract_confidence "$response2")
echo "Confidence: $confidence2%"
# Output: Confidence: 60%

# Low confidence response
response3="I'm not sure about this approach"
confidence3=$(extract_confidence "$response3")
echo "Confidence: $confidence3%"
# Output: Confidence: 20%
```

### Example 3: Error Detection

```bash
# Response with errors
response="There was an error in the code, failed to connect"
errors=$(extract_errors "$response")
echo "Errors: $errors"
# Output: Errors: 2
```

---

## Multi-Agent Coordination

### Example 1: Agent Handoff Chain

```bash
mkdir -p agent-chain && cd agent-chain

cat > README.md << 'EOF'
# Full Feature Development

Complete feature from design to deployment.

## Agent Chain
1. Planner - Create plan
2. Developer - Implement
3. Tester - Test
4. Documenter - Document
5. Deployer - Deploy

## Success Criteria
Feature deployed and working
EOF

# Execute autonomously
../../4-scripts/autonomous-loop.sh run

# Autonomous execution handles all handoffs:
# planner → developer → tester → documenter → deployer
```

### Example 2: Parallel Agent Work

```bash
# Setup parallel tasks
mkdir -p parallel-work && cd parallel-work

cat > README.md << 'EOF'
# Parallel Feature Development

Develop multiple features in parallel.

## Features
- Feature A (Agent 1)
- Feature B (Agent 2)
- Feature C (Agent 3)

## Success Criteria
All features complete
EOF

# Execute (each in separate terminal)
# Terminal 1
cd parallel-work/feature-a
../../../4-scripts/autonomous-loop.sh run

# Terminal 2
cd parallel-work/feature-b
../../../4-scripts/autonomous-loop.sh run

# Terminal 3
cd parallel-work/feature-c
../../../4-scripts/autonomous-loop.sh run
```

---

## Error Recovery Examples

### Example 1: Stagnation Recovery

```bash
# Circuit triggered by stagnation
./4-scripts/autonomous-loop.sh status
# Output: Status: OPEN, Stagnation: 10 loops

# Investigate
cat .ralph/progress.md
# See what progress was made

# Adjust approach
nano README.md
# Clarify instructions, add more details

# Reset and retry
./4-scripts/autonomous-loop.sh reset
./4-scripts/autonomous-loop.sh run
```

### Example 2: State Corruption Recovery

```bash
# State file corrupted
cat .ralph/circuit-state.json
# Error: Invalid JSON

# Restore from backup
ls -la .ralph/backups/
cp .ralph/backups/circuit-state_20260115_100000.json \
   .ralph/circuit-state.json

# Verify
./4-scripts/autonomous-loop.sh status
```

### Example 3: Manual Intervention

```bash
# Autonomous execution not progressing
./4-scripts/autonomous-loop.sh run
# Stuck at 50% progress

# Take over manually
./4-scripts/autonomous-loop.sh reset

# Continue manually
./4-scripts/agents/agent-handoff.sh planner dev
# Provide guidance
./4-scripts/agents/agent-handoff.sh dev test
# etc.

# Or restart autonomous
./4-scripts/autonomous-loop.sh run
```

---

## Complete Example: Full Workflow

```bash
# Complete Phase 1-4 integration

# 1. Create project
mkdir my-project && cd my-project

# 2. Create spec (Phase 3)
python3 ../../4-scripts/planning/spec-create.py create \
    --name "My Feature" \
    --output specs/my-feature.json

# 3. Set context (Phase 1)
export TENANT_ID="tenant_001"
export TENANT_NAME="My Tenant"
export PROJECT_TYPE="critical_feature"

# 4. Break down tasks (Phase 2)
../../hierarchical-plan.sh breakdown \
    --spec specs/my-feature.json

# 5. Execute autonomously (Phase 4)
../../4-scripts/autonomous-loop.sh run

# 6. Monitor (separate terminal)
cd my-project
watch -n 2 '../../4-scripts/autonomous-loop.sh status'

# 7. Check logs (separate terminal)
cd my-project
tail -f .ralph/logs/*.log

# Result: Complete autonomous execution from spec to completion
```

---

## Conclusion

These examples demonstrate the full power of Phase 4 (Ralph Runtime) in various scenarios. From simple tasks to complex multi-agent workflows, autonomous execution with safety mechanisms enables efficient AI agent development.

**Key Examples:**
- Basic autonomous execution
- Real-world scenarios (ecommerce, API, migration)
- Circuit breaker safety
- Response analysis
- Multi-agent coordination
- Error recovery

**Next Steps:**
- Try examples in your environment
- Adapt to your use cases
- Monitor and learn from execution
- Iterate and improve

**More Information:**
- [Ralph Runtime Guide](RALPH-RUNTIME-GUIDE.md)
- [Circuit Breaker Guide](CIRCUIT-BREAKER-GUIDE.md)
- [Integration Guide](INTEGRATION-PHASE4-GUIDE.md)
