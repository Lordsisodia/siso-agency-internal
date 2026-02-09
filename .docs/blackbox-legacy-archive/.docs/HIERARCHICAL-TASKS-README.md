# Hierarchical Task Management Scripts

This directory contains convenient wrapper scripts for hierarchical task management in Blackbox4.

## Available Scripts

### Root Level Wrappers (`.blackbox4/`)

#### `hierarchical-plan.sh`
Wrapper for the hierarchical planning system.

```bash
./hierarchical-plan.sh [options]
```

Routes to: `4-scripts/planning/lib/hierarchical-tasks/hierarchical_task.py`

#### `auto-breakdown.sh`
Automatic task breakdown functionality.

```bash
./auto-breakdown.sh <task_file> [options]
```

Options:
- `--max-depth N`: Maximum breakdown depth (default: 3)
- `--output DIR`: Output directory for results
- `--format FORMAT`: Output format (markdown, json, yaml)

Routes to: `4-scripts/lib/task-breakdown/write_tasks.py`

#### `new-step.sh`
Step creation wrapper with hierarchical task support.

```bash
./new-step.sh [options] <step_name>
```

Routes to: `4-scripts/planning/new-step.sh`

### Planning Scripts (`4-scripts/planning/`)

#### `new-step-hierarchical.sh`
Enhanced step creation with full hierarchical support.

```bash
./4-scripts/planning/new-step-hierarchical.sh [options] <step_name>
```

Options:
- `-p, --parent <parent_step>`: Parent step for hierarchical relationship
- `-d, --description <desc>`: Step description
- `-t, --type <type>`: Step type (default, feature, fix, refactor)

Examples:
```bash
# Create a standalone step
./new-step-hierarchical.sh "Implement authentication"

# Create a child step
./new-step-hierarchical.sh -p "setup" "Add database schema"

# Create a typed child step
./new-step-hierarchical.sh -p "setup" -t feature "Add user model"
```

## Directory Structure

```
.blackbox4/
├── hierarchical-plan.sh          # Hierarchical planning wrapper
├── auto-breakdown.sh             # Task auto-breakdown wrapper
├── new-step.sh                   # Step creation wrapper
├── 4-scripts/
│   ├── planning/
│   │   ├── new-step-hierarchical.sh  # Enhanced step creation
│   │   └── lib/
│   │       └── hierarchical-tasks/
│   │           └── hierarchical_task.py
│   └── lib/
│       └── task-breakdown/
│           ├── write_tasks.py    # Task breakdown implementation
│           └── project_manager.py
```

## Usage Examples

### Creating a Hierarchical Task Structure

```bash
# Create parent step
./new-step-hierarchical.sh "Project Setup"

# Create child steps
./new-step-hierarchical.sh -p "Project Setup" "Initialize Repository"
./new-step-hierarchical.sh -p "Project Setup" "Configure CI/CD"
./new-step-hierarchical.sh -p "Project Setup" "Setup Database"

# Auto-breakdown complex step
./auto-breakdown.sh .plans/steps/project-setup/tasks/main.md --max-depth 3
```

### Using the Hierarchical Planner

```bash
# Generate hierarchical plan
./hierarchical-plan.sh --input .plans/steps --output .plans/hierarchy
```

## File Permissions

All scripts are executable (`chmod +x`). If you encounter permission errors:

```bash
chmod +x .blackbox4/*.sh
chmod +x .blackbox4/4-scripts/planning/*.sh
chmod +x .blackbox4/4-scripts/lib/task-breakdown/*.py
```

## Integration with Blackbox4

These scripts integrate with the existing Blackbox4 framework:
- Plans are stored in `.plans/` directory
- Steps follow the standard Blackbox4 naming conventions
- Output formats are compatible with existing documentation
