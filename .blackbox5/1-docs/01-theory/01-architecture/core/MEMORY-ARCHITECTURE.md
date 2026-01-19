# Multi-Project Memory Architecture

**Date**: 2026-01-18
**Status**: ✅ Designed
**Purpose**: One BlackBox5 engine serving all projects, each with its own memory

---

## 🎯 Architecture Overview

```
GitHub Repository Structure:
├── blackbox5/                           # ONE BlackBox5 engine for all projects
│   ├── engine/
│   │   └── memory-templates/            # TEMPLATES GO HERE (reusable)
│   │       ├── project-template/        # Template for new project memories
│   │       │   ├── INDEX.yaml.template
│   │       │   ├── project.yaml.template
│   │       │   ├── context.yaml.template
│   │       │   ├── timeline.yaml.template
│   │       │   ├── research/_template.yaml
│   │       │   ├── plans/_template.yaml
│   │       │   ├── tasks/_template.yaml
│   │       │   └── decisions/_template.yaml
│   │       └── AGENT-INTERFACE/          # Agent interface templates
│   │           ├── INDEX-TEMPLATE.yaml
│   │           ├── AGENT-API.md
│   │           ├── QUERY-TEMPLATES.md
│   │           └── AGENT-QUICK-REFERENCE.md
│   └── ...other engine components
│
├── project-alpha/                       # Project A repo
│   ├── .project-memory/                  # THIS PROJECT'S MEMORY
│   │   ├── INDEX.yaml                   # Initialized from template
│   │   ├── project.yaml
│   │   ├── context.yaml
│   │   ├── timeline.yaml
│   │   ├── research/
│   │   ├── plans/
│   │   ├── tasks/
│   │   └── decisions/
│   └── ...project code
│
├── project-beta/                        # Project B repo
│   ├── .project-memory/                  # THAT PROJECT'S MEMORY
│   │   ├── INDEX.yaml
│   │   └── ... (same structure)
│   └── ...project code
│
└── siso-internal/                       # Current project (SISO)
    ├── .project-memory/                  # THIS PROJECT'S MEMORY
    │   ├── INDEX.yaml
    │   ├── project.yaml
    │   ├── context.yaml
    │   ├── timeline.yaml
    │   ├── research/
    │   │   └── user-profile/
    │   ├── plans/
    │   │   └── user-profile/
    │   ├── tasks/
    │   │   └── active/
    │   └── decisions/
    └── ...project code
```

---

## 🔄 Workflow

### 1. Initialize New Project Memory

When starting a new project:

```bash
# Agent runs initialization command
pm:init [project-name]

# What happens:
1. Create .project-memory/ directory in project root
2. Copy templates from blackbox5/engine/memory-templates/
3. Initialize INDEX.yaml with project metadata
4. Create directory structure
5. Generate initial files from templates
```

### 2. Agent Works on Project

When agent works on ANY project:

```yaml
# Agent context:
project: "project-alpha"  # or "project-beta" or "siso-internal"
memory_location: "[project-root]/.project-memory/"

# Agent always:
1. Read [project-root]/.project-memory/INDEX.yaml
2. Use templates from blackbox5/engine/memory-templates/
3. Write to [project-root]/.project-memory/
```

### 3. BlackBox5 Engine Shared

```yaml
# BlackBox5 engine contains:
location: "blackbox5/engine/"

contents:
  - "memory-templates/"           # Reusable templates
  - "agents/"                     # Agent definitions
  - "skills/"                     # Agent skills
  - "core/"                       # Core functionality

# Used by ALL projects:
projects:
  - "project-alpha"
  - "project-beta"
  - "siso-internal"
  - "any-future-project"
```

---

## 📁 Template Locations

### BlackBox5 Engine (Shared, Reusable)

```
blackbox5/engine/memory-templates/
├── project-template/
│   ├── INDEX.yaml.template        # Template for project index
│   ├── project.yaml.template      # Template for project metadata
│   ├── context.yaml.template      # Template for project context
│   ├── timeline.yaml.template     # Template for timeline
│   │
│   ├── research/
│   │   ├── _template-directory/   # Research directory template
│   │   └── _template.yaml         # Research metadata template
│   │
│   ├── plans/
│   │   ├── _template-directory/   # Plans directory template
│   │   ├── _template.yaml         # Plan metadata template
│   │   ├── _template-prd.md       # PRD template
│   │   ├── _template-epic.md      # Epic template
│   │   └── _template-task.md      # Task template
│   │
│   ├── tasks/
│   │   ├── _template-directory/   # Tasks directory template
│   │   └── _template.yaml         # Task metadata template
│   │
│   └── decisions/
│       ├── _template-directory/   # Decisions directory template
│       └── _template.yaml         # Decision metadata template
│
└── AGENT-INTERFACE/
    ├── INDEX-TEMPLATE.yaml        # Template for INDEX.yaml
    ├── AGENT-API.md               # Agent API documentation
    ├── QUERY-TEMPLATES.md         # Query templates
    └── AGENT-QUICK-REFERENCE.md   # Quick reference
```

### Project Memory (Per Project, Unique)

```
[project-root]/.project-memory/      # Each project has its own
├── INDEX.yaml                       # This project's index
├── project.yaml                     # This project's metadata
├── context.yaml                     # This project's context
├── timeline.yaml                    # This project's timeline
├── research/                        # This project's research
├── plans/                           # This project's plans
├── tasks/                           # This project's tasks
└── decisions/                       # This project's decisions
```

---

## 🔧 Implementation

### Step 1: Create BlackBox5 Engine Templates

```bash
# Create template directory in BlackBox5 engine
mkdir -p blackbox5/engine/memory-templates/project-template
mkdir -p blackbox5/engine/memory-templates/AGENT-INTERFACE

# Copy templates to BlackBox5 engine
# (These are shared across ALL projects)
```

### Step 2: Create Initialization Script

```bash
# blackbox5/engine/scripts/init-project-memory.sh

#!/bin/bash
PROJECT_NAME=$1
PROJECT_ROOT=$2

# Create .project-memory directory
mkdir -p $PROJECT_ROOT/.project-memory

# Copy templates from BlackBox5 engine
cp -r blackbox5/engine/memory-templates/project-template/* $PROJECT_ROOT/.project-memory/

# Initialize project-specific files
sed -i '' 's/{PROJECT_NAME}/'$PROJECT_NAME'/g' $PROJECT_ROOT/.project-memory/project.yaml
sed -i '' 's/{PROJECT_NAME}/'$PROJECT_NAME'/g' $PROJECT_ROOT/.project-memory/INDEX.yaml

echo "Project memory initialized for: $PROJECT_NAME"
echo "Location: $PROJECT_ROOT/.project-memory/"
```

### Step 3: Agent Usage Pattern

```yaml
# When agent works on ANY project:

agent_workflow:
  1. "Identify current project"
  2. "Locate .project-memory/ in project root"
  3. "Read .project-memory/INDEX.yaml"
  4. "Use templates from blackbox5/engine/memory-templates/"
  5. "Write to .project-memory/[appropriate directory]/"
```

---

## 📊 File Mapping

| What | Where | Who Uses |
|------|-------|----------|
| **Templates** | `blackbox5/engine/memory-templates/` | All projects |
| **Project Memory** | `[project-root]/.project-memory/` | Specific project |
| **Agent Interface Docs** | `blackbox5/engine/memory-templates/AGENT-INTERFACE/` | All agents |
| **Project Data** | `[project-root]/.project-memory/*` | Specific project |

---

## 🎯 Benefits

### 1. Single Source of Truth
- ✅ BlackBox5 engine contains all templates
- ✅ Update once, all projects benefit
- ✅ Consistent structure across projects

### 2. Project Isolation
- ✅ Each project has its own memory
- ✅ No cross-project contamination
- ✅ Easy to backup/move individual projects

### 3. Reusability
- ✅ Templates shared across all projects
- ✅ Agent interface docs shared
- ✅ Query templates shared

### 4. Scalability
- ✅ Add new project: run init script
- ✅ Update templates: update in BlackBox5 engine
- ✅ Agent works on any project: same workflow

---

## 🚀 Usage Examples

### Example 1: Start New Project

```bash
# User wants to start new project "project-alpha"
cd ~/dev/projects/

# Agent runs:
pm:init project-alpha

# What happens:
1. Creates project-alpha/.project-memory/
2. Copies templates from blackbox5/engine/memory-templates/
3. Initializes with project name
4. Ready to use
```

### Example 2: Agent Works on Project

```yaml
# Agent working on "project-beta"

agent_context:
  current_project: "project-beta"
  memory_root: "/path/to/project-beta/.project-memory/"

workflow:
  1. "Read /path/to/project-beta/.project-memory/INDEX.yaml"
  2. "Get context from INDEX.yaml"
  3. "Use templates from blackbox5/engine/memory-templates/"
  4. "Write to /path/to/project-beta/.project-memory/"
```

### Example 3: Update Templates

```bash
# Want to improve templates?

# Edit templates in BlackBox5 engine:
vim blackbox5/engine/memory-templates/project-template/INDEX.yaml.template

# ALL projects benefit on next use:
# - project-alpha will use new template
# - project-beta will use new template
# - siso-internal will use new template
# - future projects will use new template
```

---

## 📝 Initialization Template

### INDEX.yaml.template

```yaml
# Template for INDEX.yaml
# Located in: blackbox5/engine/memory-templates/project-template/

system:
  version: "2.0"
  name: "{PROJECT_NAME}"
  type: "project-centric"
  updated: "{DATE}"
  location: ".project-memory/"

projects:
  - id: "{PROJECT_ID}"
    name: "{PROJECT_NAME}"
    status: "active"
    started: "{DATE}"
    path: "./"

quick_find:
  research: []
  prds: []
  epics: []
  tasks: []
  task_contexts: []

search_index:
  keywords: {}

status:
  active_tasks: 0
  completed_tasks: 0
  pending_tasks: 0
  progress: "0%"

agents: {}

templates:
  research: "blackbox5/engine/memory-templates/project-template/research/_template.yaml"
  prd: "blackbox5/engine/memory-templates/project-template/plans/_template-prd.md"
  epic: "blackbox5/engine/memory-templates/project-template/plans/_template-epic.md"
  task: "blackbox5/engine/memory-templates/project-template/plans/_template-task.md"

next_steps:
  immediate: []
  upcoming: []
```

---

## ✅ Next Steps

1. ✅ Architecture designed
2. ⏳ Create BlackBox5 engine template structure
3. ⏳ Create initialization script
4. ⏳ Move templates to engine
5. ⏳ Update current project memory
6. ⏳ Test multi-project workflow

---

**Status**: ✅ **ARCHITECTURE COMPLETE**
**Ready for Implementation**: Yes
**Confidence**: ⭐⭐⭐⭐⭐ (5/5)

This architecture enables ONE BlackBox5 engine to serve ALL projects, each with its own isolated memory!
