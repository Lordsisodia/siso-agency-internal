# Integration Guide - Phase 4

**Version:** 1.0.0
**Last Updated:** 2026-01-15
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Complete Phase 1-4 Integration](#complete-phase-1-4-integration)
3. [Migration Guide](#migration-guide)
4. [Context Variables Usage](#context-variables-usage)
5. [Agent Handoff Patterns](#agent-handoff-patterns)
6. [Backward Compatibility](#backward-compatibility)
7. [Examples](#examples)

---

## Overview

This guide explains how Phase 4 (Ralph Runtime) integrates with Phases 1-3, creating a complete autonomous agent framework with context awareness, hierarchical tasks, structured specs, and safe autonomous execution.

### Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              COMPLETE BLACKBOX4 FRAMEWORK                   │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Phase 1     │  │  Phase 2     │  │  Phase 3     │
│  Context     │  │  Tasks       │  │  Specs       │
└──────────────┘  └──────────────┘  └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
                ┌───────────────────────────┐
                │    PHASE 4                │
                │    Ralph Runtime          │
                │    - Autonomous Execution │
                │    - Circuit Breaker      │
                │    - Response Analyzer    │
                └───────────────────────────┘
```

### Phase Capabilities

**Phase 1 (Context Variables):**
- Multi-tenant context support
- Dynamic agent instructions
- Context-aware handoffs

**Phase 2 (Hierarchical Tasks):**
- Task breakdown structure
- Parent-child relationships
- Dependency tracking

**Phase 3 (Structured Specs):**
- Structured requirement capture
- Sequential questioning
- Spec validation

**Phase 4 (Ralph Runtime):**
- Autonomous execution
- Safety mechanisms
- Progress tracking

---

## Complete Phase 1-4 Integration

### End-to-End Workflow

```
┌─────────────────────────────────────────────────────────────┐
│              COMPLETE WORKFLOW                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  1. PLAN (Phase 3)    │
                │  - Create spec        │
                │  - Define requirements │
                │  - Set constitution   │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  2. BREAK DOWN (P2/P3)│
                │  - Hierarchical tasks │
                │  - Dependencies       │
                │  - User stories       │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  3. SET CONTEXT (P1)  │
                │  - Tenant context     │
                │  - Project context    │
                │  - Agent context      │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  4. EXECUTE (Phase 4) │
                │  - Autonomous loop    │
                │  - Circuit breaker    │
                │  - Response analysis  │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  5. COMPLETE          │
                │  - Validation         │
                │  - Documentation      │
                │  - Delivery           │
                └───────────────────────┘
```

### Data Flow Across Phases

```
Phase 3 (Specs)
    │
    ├──> StructuredSpec JSON
    │       │
    │       ├──> User Stories ──┐
    │       ├──> Requirements ──┤
    │       └──> Constitution ──┘
    │                           │
    ▼                           ▼
Phase 2 (Tasks)          Phase 1 (Context)
    │                           │
    ├──> Hierarchical Tasks     │
    │   ├──> Parent tasks ──────┤
    │   ├──> Child tasks ───────┤
    │   └──> Dependencies ──────┘
    │                           │
    └───────────┬───────────────┘
                │
                ▼
        Combined Context
                │
                ├──> Spec requirements
                ├──> Task hierarchy
                ├──> Tenant context
                └──> Agent instructions
                │
                ▼
        Phase 4 (Ralph Runtime)
                │
                ├──> Autonomous execution
                ├──> Safety (circuit breaker)
                └──> Progress tracking
```

---

## Migration Guide

### From Manual to Autonomous

**Before (Manual Execution):**
```bash
# Manual agent handoffs
./4-scripts/agents/agent-handoff.sh planner dev
# Review output
./4-scripts/agents/agent-handoff.sh dev test
# Review output
./4-scripts/agents/agent-handoff.sh test document
# etc.
```

**After (Autonomous Execution):**
```bash
# Single autonomous command
./4-scripts/autonomous-loop.sh run

# Monitors and executes all phases automatically
```

### From Phase 3 to Phase 4

**Phase 3 Only:**
```bash
# Create spec
python3 4-scripts/planning/spec-create.py create \
    --name "Feature X"

# Validate spec
python3 4-scripts/planning/spec-create.py validate \
    --spec specs/feature-x.json

# Export to PRD
python3 4-scripts/planning/spec-create.py export \
    --spec specs/feature-x.json \
    --format prd

# Manually execute
./4-scripts/agents/agent-handoff.sh planner dev
```

**Phase 3 + Phase 4:**
```bash
# Create spec
python3 4-scripts/planning/spec-create.py create \
    --name "Feature X"

# Autonomous execution from spec
./4-scripts/autonomous-loop.sh run
# Automatically:
# - Reads spec
# - Executes tasks
# - Tracks progress
# - Completes work
```

### Integration Steps

**Step 1: Create Spec (Phase 3)**
```bash
python3 4-scripts/planning/spec-create.py create \
    --name "User Authentication" \
    --output specs/auth-spec.json
```

**Step 2: Set Context (Phase 1)**
```bash
export TENANT_ID="acme_001"
export TENANT_NAME="Acme Corp"
export PROJECT_TYPE="critical_feature"
```

**Step 3: Break Down Tasks (Phase 2)**
```bash
./hierarchical-plan.sh breakdown \
    --spec specs/auth-spec.json \
    --output plans/auth-plan
```

**Step 4: Execute Autonomously (Phase 4)**
```bash
./4-scripts/autonomous-loop.sh run
```

---

## Context Variables Usage

### Multi-Tenant Autonomous Execution

```bash
# Set tenant context
export TENANT_ID="acme_001"
export TENANT_NAME="Acme Corp"
export PROJECT_TYPE="critical_feature"

# Create tenant-specific spec
python3 4-scripts/planning/spec-create.py create \
    --name "Acme Custom Feature" \
    --context tenant_id=acme_001 \
    --output specs/acme-feature.json

# Execute with tenant context
./4-scripts/autonomous-loop.sh run

# Benefits:
# - Spec includes tenant requirements
# - Tasks use tenant-specific configurations
# - Circuit breaker uses tenant thresholds
# - Progress tracking is tenant-isolated
```

### Context-Aware Circuit Breaker

```bash
# Different thresholds for different tenants
cat > 4-scripts/lib/circuit-breaker/config.yaml << 'EOF'
circuit_breaker:
  projects:
    # Enterprise tenant - more complex work
    enterprise:
      max_loops_no_progress: 15
      stagnation_threshold: 2

    # Startup tenant - quick iterations
    startup:
      max_loops_no_progress: 5
      stagnation_threshold: 10

    # Research tenant - exploration
    research:
      max_loops_no_progress: 20
      stagnation_threshold: 5
EOF

# Use tenant-specific thresholds
export TENANT_TYPE="enterprise"
./4-scripts/autonomous-loop.sh run
```

### Dynamic Agent Instructions

```bash
# Agent instructions use context
cat > 1-agents/4-specialists/dev.md << 'EOF'
# Developer Agent

## Instructions
function instructions(context_variables):
    tenant_name = context_variables.get("tenant_name", "Guest")
    project_type = context_variables.get("project_type", "generic")

    return f"""You are a developer working for {tenant_name}.

Project Type: {project_type}

Context Variables:
{context_variables}

Follow {tenant_name}'s coding standards and practices."""
EOF

# Autonomous execution uses context
export TENANT_NAME="Acme Corp"
export PROJECT_TYPE="critical_feature"
./4-scripts/autonomous-loop.sh run
```

---

## Agent Handoff Patterns

### Traditional Handoff

```bash
# Manual handoff
./4-scripts/agents/agent-handoff.sh planner dev

# Output: "Handing off from planner to dev"
# Context: Minimal
# Tracking: Manual
```

### Context-Aware Handoff (Phase 1)

```bash
# Handoff with context
python3 4-scripts/agents/handoff-with-context.py handoff \
    planner dev \
    --context '{
        "tenant": "acme",
        "project": "auth",
        "priority": "high"
    }' \
    --message "Planning complete, starting development"

# Benefits:
# - Context preserved
# - Tenant awareness
# - Project continuity
```

### Autonomous Handoff (Phase 4)

```bash
# Autonomous execution handles all handoffs
./4-scripts/autonomous-loop.sh run

# Internal handoffs:
# planner → dev (with context)
# dev → test (with context)
# test → document (with context)

# All handoffs:
# - Preserve context
# - Track progress
# - Follow dependencies
# - Respect circuit breaker
```

### Handoff with Task Hierarchy

```bash
# Phase 2 hierarchical tasks
cat > checklist.md << 'EOF'
# Parent Task: User Authentication
- [ ] Child 1: Login page
- [ ] Child 2: Registration
- [ ] Child 3: Password reset

# Login Page (Child 1.1)
- [ ] Grandchild 1.1.1: Form design
- [ ] Grandchild 1.1.2: Validation
- [ ] Grandchild 1.1.3: API integration
EOF

# Autonomous execution respects hierarchy
./4-scripts/autonomous-loop.sh run

# Execution order:
# 1. Complete all grandchildren
# 2. Mark parent complete
# 3. Move to next child
```

---

## Backward Compatibility

### Existing Scripts Still Work

```bash
# All existing scripts continue to work
./4-scripts/agents/agent-handoff.sh planner dev  # ✅ Works
./hierarchical-plan.sh breakdown                  # ✅ Works
python3 4-scripts/planning/spec-create.py create  # ✅ Works

# Phase 4 is additive, not replacing
```

### Gradual Adoption

**Option 1: Use Phase 4 for New Work**
```bash
# Existing projects: Continue with manual
cd existing-project
./4-scripts/agents/agent-handoff.sh planner dev

# New projects: Use autonomous
cd new-project
./4-scripts/autonomous-loop.sh run
```

**Option 2: Hybrid Approach**
```bash
# Phase 3 for planning
python3 4-scripts/planning/spec-create.py create \
    --name "Feature X"

# Manual execution for critical parts
./4-scripts/agents/agent-handoff.sh planner dev

# Autonomous for routine tasks
./4-scripts/autonomous-loop.sh run
```

**Option 3: Full Migration**
```bash
# Migrate all projects to autonomous
for project in */; do
    cd "$project"
    ../4-scripts/autonomous-loop.sh run
    cd ..
done
```

### Compatibility Matrix

| Feature | Phase 1-3 | Phase 4 | Notes |
|---------|-----------|---------|-------|
| Agent Handoff | ✅ | ✅ | Both work |
| Context Variables | ✅ | ✅ | Enhanced in P4 |
| Hierarchical Tasks | ✅ | ✅ | Respected in P4 |
| Structured Specs | ✅ | ✅ | Used by P4 |
| Autonomous Execution | ❌ | ✅ | New in P4 |
| Circuit Breaker | ❌ | ✅ | New in P4 |
| Response Analyzer | ❌ | ✅ | New in P4 |

---

## Examples

### Example 1: Complete Workflow

```bash
# 1. Create spec (Phase 3)
python3 4-scripts/planning/spec-create.py create \
    --name "User Authentication" \
    --output specs/auth.json

# 2. Set context (Phase 1)
export TENANT_ID="acme_001"
export TENANT_NAME="Acme Corp"
export PROJECT_TYPE="critical_feature"

# 3. Break down tasks (Phase 2)
./hierarchical-plan.sh breakdown \
    --spec specs/auth.json

# 4. Execute autonomously (Phase 4)
./4-scripts/autonomous-loop.sh run

# 5. Monitor progress
./4-scripts/autonomous-loop.sh monitor

# Result: Complete autonomous execution with all phases
```

### Example 2: Multi-Tenant Execution

```bash
# Tenant 1: Acme Corp
export TENANT_ID="acme_001"
export TENANT_NAME="Acme Corp"
export PROJECT_TYPE="enterprise"
python3 4-scripts/planning/spec-create.py create \
    --name "Acme Dashboard" \
    --context tenant_id=acme_001
./4-scripts/autonomous-loop.sh run

# Tenant 2: Globex Inc
export TENANT_ID="globex_001"
export TENANT_NAME="Globex Inc"
export PROJECT_TYPE="startup"
python3 4-scripts/planning/spec-create.py create \
    --name "Globex Mobile App" \
    --context tenant_id=globex_001
./4-scripts/autonomous-loop.sh run

# Each tenant gets:
# - Isolated execution
# - Appropriate thresholds
# - Context-aware work
```

### Example 3: Migration from Manual

```bash
# Before: Manual execution
./4-scripts/agents/agent-handoff.sh planner dev
./4-scripts/agents/agent-handoff.sh dev test
./4-scripts/agents/agent-handoff.sh test document

# After: Autonomous execution
./4-scripts/autonomous-loop.sh run

# Same work, less manual intervention
```

---

## Conclusion

Phase 4 integrates seamlessly with Phases 1-3, creating a complete autonomous agent framework. By understanding how to use all phases together, you can leverage the full power of Blackbox4 for autonomous AI agent execution.

**Key Takeaways:**
1. All phases work together seamlessly
2. Existing scripts continue to work
3. Gradual adoption is possible
4. Context variables enhance autonomous execution
5. Hierarchical tasks guide autonomous work
6. Structured specs inform autonomous execution

**Next Steps:**
- Read [API Reference](API-REFERENCE-PHASE4.md) for complete API documentation
- Check [Examples](EXAMPLES-PHASE4.md) for real-world scenarios
- Review [Complete Framework Summary](COMPLETE-FRAMEWORK-SUMMARY.md) for full system overview
