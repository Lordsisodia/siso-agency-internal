# Explore and document runtime systems

**Analyzed by:** Ralph Runtime
**Date:** 2026-01-18 14:49:17

## Analysis: .blackbox5/engine/runtime

### Directory Structure

```
total 688
-rw-r--r--@  1 shaansisodia  staff     26 18 Jan 14:31 __init__.py
drwxr-xr-x@ 49 shaansisodia  staff   1568 18 Jan 14:31 .
drwxr-xr-x@ 24 shaansisodia  staff    768 18 Jan 14:48 ..
-rwxr-xr-x@  1 shaansisodia  staff   5857 18 Jan 13:07 agent-status.sh
drwxr-xr-x@  7 shaansisodia  staff    224 18 Jan 10:47 agents
-rwxr-xr-x@  1 shaansisodia  staff  24795 18 Jan 10:47 analyze-response.sh
-rwxr-xr-x@  1 shaansisodia  staff    212 18 Jan 10:47 auto-breakdown.sh
-rwxr-xr-x@  1 shaansisodia  staff   8674 18 Jan 10:47 autonomous-loop.sh
-rwxr-xr-x@  1 shaansisodia  staff  25087 18 Jan 10:47 autonomous-run.sh
-rwxr-xr-x@  1 shaansisodia  staff  22337 18 Jan 10:47 circuit-breaker.sh
-rw-r--r--@  1 shaansisodia  staff   6431 18 Jan 13:10 CLI-TOOLS-README.md
-rwxr-xr-x@  1 shaansisodia  staff   7364 18 Jan 10:47 generate-prd.sh
-rwxr-xr-x@  1 shaansisodia  staff    229 18 Jan 10:47 hierarchical-plan.sh
drwxr-xr-x@  4 shaansisodia  staff    128 18 Jan 10:47 hooks
-rw-r--r--@  1 shaansisodia  staff   7023 18 Jan 13:12 IMPLEMENTATION-SUMMARY.md
-rwxr-xr-x@  1 shaansisodia  staff   2776 18 Jan 10:47 init-features.sh
drwxr-xr-x@ 10 shaansisodia  staff    320 18 Jan 10:47 integration
drwxr-xr-x@  3 shaansisodia  staff     96 18 Jan 10:47 integrations
-rwxr-xr-x@  1 shaansisodia  staff  22210 18 Jan 10:47 intervene.sh
drwxr-xr-x@ 22 shaansisodia  staff    704 18 Jan 10:47 lib
-rwxr-xr-x@  1 shaansisodia  staff   1621 18 Jan 10:47 lib.sh
drwxr-xr-x@  7 shaansisodia  staff    224 18 Jan 10:47 memory
-rwxr-xr-x@  1 shaansisodia  staff  15845 18 Jan 10:47 monitor.sh
drwxr-xr-x@  6 shaansisodia  staff    192 18 Jan 10:47 monitoring
-rwxr-xr-x@  1 shaansisodia  staff    224 18 Jan 10:47 new-step.sh
-rw-r--r--@  1 shaansisodia  staff   5109 18 Jan 10:47 plan-status.py
drwxr-xr-x@ 15 shaansisodia  staff    480 18 Jan 10:47 planning
drwxr-xr-x@ 10 shaansisodia  staff    320 18 Jan 10:47 prd-templates
drwxr-xr-x@  8 shaansisodia  staff    256 18 Jan 10:47 python
drwxr-xr-x@ 11 shaansisodia  staff    352 18 Jan 10:47 questioning
-rwxr-xr-x@  1 shaansisodia  staff   7701 18 Jan 10:47 questioning-workflow.sh
drwxr-xr-x@ 18 shaansisodia  staff    576 18 Jan 14:49 ralph
-rwxr-xr-x@  1 shaansisodia  staff  30088 18 Jan 10:47 ralph-cli.sh
-rwxr-xr-x@  1 shaansisodia  staff    199 18 Jan 10:47 ralph-loop.sh
-rwxr-xr-x@  1 shaansisodia  staff  19830 18 Jan 10:47 ralph-runtime.sh
-rw-r--r--@  1 shaansisodia  staff   3782 18 Jan 10:47 README.md
-rwxr-xr-x@  1 shaansisodia  staff    204 18 Jan 10:47 spec-analyze.sh
-rwxr-xr-x@  1 shaansisodia  staff    207 18 Jan 10:47 spec-create.sh
-rwxr-xr-x@  1 shaansisodia  staff    206 18 Jan 10:47 spec-validate.sh
-rwxr-xr-x@  1 shaansisodia  staff   9245 18 Jan 12:38 start-redis.sh
-rwxr-xr-x@  1 shaansisodia  staff   7703 18 Jan 10:47 test-agent-tracking.sh
drwxr-xr-x@ 17 shaansisodia  staff    544 18 Jan 10:47 testing
-rwxr-xr-x@  1 shaansisodia  staff  13486 18 Jan 10:47 ui-cycle-status.py
drwxr-xr-x@ 10 shaansisodia  staff    320 18 Jan 10:47 utility
drwxr-xr-x@  4 shaansisodia  staff    128 18 Jan 10:47 utils
-rwxr-xr-x@  1 shaansisodia  staff  13603 18 Jan 10:47 validate-ui-cycle.py
drwxr-xr-x@ 15 shaansisodia  staff    480 18 Jan 10:47 validation
-rwxr-xr-x@  1 shaansisodia  staff   7132 18 Jan 13:05 view-logs.sh
-rwxr-xr-x@  1 shaansisodia  staff   5191 18 Jan 13:06 view-manifest.sh

```

### File Statistics

- Python files: 118
- TypeScript files: 0
- TSX files: 0
- JSON files: 4
- Markdown files: 296

### Documentation Files (92 found)

#### README.md

# 4-scripts

All executable scripts for Blackbox4.

## Purpose

Scripts organized by category for easy navigation and maintenance.

## Organization

### Core Scripts (Root Level)
- `autonomous-loop.sh` - Start Ralph autonomous loop
- `lib.sh` - Shared utility functions library
- `validate-ui-cycle.p...

#### memory/README.md

# Umemory Scripts

Lmemory related scripts for Blackbox4.

## Scripts

- `autonomous-loop.sh`
- `lib.sh`

## Usage

From .blackbox4 root:
```bash
./4-scripts/memory/<script>.sh [args]
```

From within 4-scripts:
```bash
cd 4-scripts
./memory/<script>.sh [args]
```

## See Also

- [../README.md](../R...

#### python/README.md

# python

Component in Blackbox4.

## Location

```
Blackbox3/scripts/python
```

## Parent Directory

Part of: [`Blackbox3/scripts/`](../)

## Purpose

This directory contains: `python`

## Usage

See parent directory documentation for usage information.


### Main Components (16 found)

- **agents/**
- **hooks/**
- **integration/**
- **integrations/**
- **lib/**
- **memory/**
- **monitoring/**
- **planning/**
- **prd-templates/**
- **python/**
- **questioning/**
- **ralph/**
- **testing/**
- **utility/**
- **utils/**
- **validation/**

### Sample Python Files

- __init__.py
- agents/handoff-with-context.py
- integration/context_aware_spec.py
- integration/handoff_to_spec.py
- integration/plan_to_spec.py
- integration/spec_cli.py
- integration/spec_to_plan.py
- integrations/vibe-kanban/vibe-monitor.py
- integrations/vibe-kanban/webhook-server.py
- lib/circuit-breaker/__init__.py
... and 108 more

### Summary

The directory `.blackbox5/engine/runtime` contains 118 Python files, 0 TypeScript files, and 16 main components.

