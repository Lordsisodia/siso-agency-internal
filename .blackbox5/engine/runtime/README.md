# 4-scripts

All executable scripts for Blackbox4.

## Purpose

Scripts organized by category for easy navigation and maintenance.

## Organization

### Core Scripts (Root Level)
- `autonomous-loop.sh` - Start Ralph autonomous loop
- `lib.sh` - Shared utility functions library
- `validate-ui-cycle.py` - Validate UI development cycles

### 📁 agents/

Agent management and execution scripts.

**Scripts:**
- `agent-handoff.sh` - Hand off between agents
- `new-agent.sh` - Create new agent
- `start-agent-cycle.sh` - Start agent execution cycle

### 📁 planning/

Plan creation and management scripts.

**Scripts:**
- `action-plan.sh` - Create action plans
- `new-plan.sh` - Create new project plan
- `new-run.sh` - Create new run
- `new-step.sh` - Create new step
- `new-tranche.sh` - Create new tranche
- `promote.sh` - Promote plan artifacts

### 📁 memory/

Memory management and compaction scripts.

**Scripts:**
- `auto-compact.sh` - Auto-compact working memory
- `compact-context.sh` - Compact context
- `compact-ui-context.sh` - Compact UI context
- `manage-memory-tiers.sh` - Manage memory tiers

### 📁 monitoring/

System monitoring and status scripts.

**Scripts:**
- `monitor-ui-deploy.sh` - Monitor UI deployment
- `ralph-status.sh` - Quick Ralph status check
- `start-10h-monitor.sh` - Start 10-hour monitoring

### 📁 testing/

Testing and benchmark scripts.

**Scripts:**
- `benchmark-task.sh` - Benchmark task performance
- `check-ui-constraints.sh` - Check UI constraints
- `check-vendor-leaks.sh` - Check for vendor leaks
- `start-feature-research.sh` - Start feature research
- `start-oss-discovery-cycle.sh` - Start OSS discovery
- `start-testing.sh` - Start testing
- `start-ui-cycle.sh` - Start UI development cycle

### 📁 validation/

System validation and verification scripts.

**Scripts:**
- `check-blackbox.sh` - Validate Blackbox structure
- `check-dependencies.sh` - Verify all dependencies
- `validate-all.sh` - Run all validations
- `validate-loop.sh` - Validate in a loop
- `verify-readmes.sh` - Verify README.md coverage

### 📁 utility/

General utility scripts.

**Scripts:**
- `build-semantic-index.sh` - Build semantic search index
- `fix-perms.sh` - Fix file permissions
- `generate-readmes.sh` - Generate README.md files
- `install-hooks.sh` - Install git hooks
- `notify.sh` - Send notifications
- `review-compactions.sh` - Review memory compactions
- `sync-template.sh` - Sync templates

### 📁 lib/

Legacy library directory (use `lib.sh` instead).

### 📁 python/

Python utility scripts.

**Scripts:**
- `plan-status.py` - Show plan status
- `ui-cycle-status.py` - Show UI cycle status

## Usage

**Run any script:**
```bash
cd 4-scripts
./<category>/<script>.sh [args]
```

**Example:**
```bash
# Create new plan
./planning/new-plan.sh "My goal"

# Check dependencies
./validation/check-dependencies.sh

# Ralph status
./monitoring/ralph-status.sh
```

**From root:**
```bash
# Use absolute path
./4-scripts/validation/check-dependencies.sh
```

## Adding New Scripts

1. Choose appropriate category
2. Add script to category directory
3. Update this README
4. Test script
5. Commit

**Script Template:**
```bash
#!/bin/bash
#
# Brief description
#

BB4_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Source library
source "$BB4_ROOT/4-scripts/lib.sh"

# Script logic here
```

## Conventions

- **File naming**: `kebab-case.sh`
- **Shebang**: `#!/bin/bash`
- **Source lib.sh**: Use shared utilities
- **Error handling**: `set -euo pipefail`
- **Logging**: Use log_info, log_success, log_error from lib.sh
- **BB4_ROOT**: Always set relative path

## See Also

- [lib.sh](./lib.sh) - Shared utility functions
- [../.docs/5-workflows/SCRIPTS.md](../.docs/5-workflows/SCRIPTS.md) - Script documentation
