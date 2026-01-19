#!/bin/bash
#
# BMAD GitHub Integration Setup
# Brings CCPM-style GitHub integration to BMAD
#

set -e

echo "🚀 Setting up BMAD GitHub Integration..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Create directory structure
echo -e "${YELLOW}📁 Creating directory structure...${NC}"
mkdir -p .blackbox/specs/{prds,epics,tasks}
mkdir -p .blackbox/commands/{project-management,github-integration}
mkdir -p .blackbox/templates/{prd,epic,task}
echo -e "${GREEN}✅ Directories created${NC}"
echo ""

# Step 2: Copy commands from CCPM
echo -e "${YELLOW}📋 Copying commands from CCPM...${NC}"

# Check if CCPM docs exist
CCPM_PATH=".docs/research/development-tools/ccpm/ccpm/commands"
if [ ! -d "$CCPM_PATH" ]; then
    echo -e "${RED}❌ CCPM documentation not found at $CCPM_PATH${NC}"
    echo "Please ensure the research files are available"
    exit 1
fi

# Copy project management commands
cp "$CCPM_PATH/pm/prd-new.md" .blackbox/commands/project-management/ 2>/dev/null || echo "  ⚠️  prd-new.md not found"
cp "$CCPM_PATH/pm/prd-parse.md" .blackbox/commands/project-management/ 2>/dev/null || echo "  ⚠️  prd-parse.md not found"
cp "$CCPM_PATH/pm/epic-decompose.md" .blackbox/commands/project-management/ 2>/dev/null || echo "  ⚠️  epic-decompose.md not found"
cp "$CCPM_PATH/pm/issue-start.md" .blackbox/commands/project-management/ 2>/dev/null || echo "  ⚠️  issue-start.md not found"

# Copy GitHub integration commands
cp "$CCPM_PATH/pm/epic-sync.md" .blackbox/commands/github-integration/ 2>/dev/null || echo "  ⚠️  epic-sync.md not found"
cp "$CCPM_PATH/pm/issue-sync.md" .blackbox/commands/github-integration/ 2>/dev/null || echo "  ⚠️  issue-sync.md not found"
cp "$CCPM_PATH/pm/issue-close.md" .blackbox/commands/github-integration/ 2>/dev/null || echo "  ⚠️  issue-close.md not found"

echo -e "${GREEN}✅ Commands copied${NC}"
echo ""

# Step 3: Create templates
echo -e "${YELLOW}📄 Creating templates...${NC}"

# PRD Template
cat > .blackbox/templates/prd/template.md << 'EOF'
---
name: {feature-name}
description: {Brief one-line description}
status: backlog
created: {current_datetime}
---

# PRD: {Feature Name}

## Executive Summary
{Overview and value proposition}

## Problem Statement
{What problem are we solving? Why is this important now?}

## User Stories
{Primary user personas and journeys}

## Requirements
### Functional Requirements
{Core features and capabilities}

### Non-Functional Requirements
{Performance, security, scalability}

## Success Criteria
{Measurable outcomes and KPIs}

## Constraints & Assumptions
{Technical limitations, timeline, resources}

## Out of Scope
{What we're explicitly NOT building}

## Dependencies
{External and internal dependencies}
EOF

# Epic Template
cat > .blackbox/templates/epic/template.md << 'EOF'
---
name: {feature-name}
status: backlog
created: {current_datetime}
progress: 0%
prd: .blackbox/specs/prds/{feature-name}.md
github: {added_on_sync}
updated: {current_datetime}
---

# Epic: {Feature Name}

## Overview
{Technical architecture}

## Key Decisions
{Technical choices with rationale}

## Components
{System components}

## Data Flow
{Architecture diagram}

## Testing Strategy
{Test approach}

## Tasks Created
{Auto-populated on sync}

## Stats
{Auto-populated on sync}
EOF

# Task Template
cat > .blackbox/templates/task/template.md << 'EOF'
---
name: {Task Title}
status: open
created: {current_datetime}
updated: {current_datetime}
github: {added_on_sync}
depends_on: []
parallel: true
conflicts_with: []
---

# Task: {Task Title}

## Specification
{What to build}

## File Changes
{Files to modify/create}

## Acceptance Criteria
- [ ] {Criterion 1}
- [ ] {Criterion 2}
- [ ] {Criterion 3}

## Definition of Done
{Complete checklist}

## Test Cases
{Specific test scenarios}
EOF

echo -e "${GREEN}✅ Templates created${NC}"
echo ""

# Step 4: Check GitHub CLI
echo -e "${YELLOW}🔧 Checking GitHub CLI...${NC}"
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI not found${NC}"
    echo "Install from: https://cli.github.com/"
    echo "Then run: gh auth login"
else
    echo -e "${GREEN}✅ GitHub CLI found${NC}"
    if gh auth status &> /dev/null; then
        echo -e "${GREEN}✅ GitHub CLI authenticated${NC}"
    else
        echo -e "${YELLOW}⚠️  GitHub CLI not authenticated${NC}"
        echo "Run: gh auth login"
    fi
fi
echo ""

# Step 5: Install gh-sub-issue extension
echo -e "${YELLOW}🔧 Installing gh-sub-issue extension...${NC}"
if command -v gh &> /dev/null; then
    if gh extension list | grep -q "yahsan2/gh-sub-issue"; then
        echo -e "${GREEN}✅ gh-sub-issue already installed${NC}"
    else
        gh extension install yahsan2/gh-sub-issue 2>/dev/null || echo -e "${YELLOW}⚠️  Could not install gh-sub-issue (optional)${NC}"
    fi
fi
echo ""

# Step 6: Create README
echo -e "${YELLOW}📖 Creating README...${NC}"
cat > .blackbox/commands/GITHUB-INTEGRATION.md << 'EOF'
# BMAD GitHub Integration

CCPM-style GitHub integration for BMAD framework.

## Quick Start

### 1. Create PRD
```bash
# Use the prd-new command
cat .blackbox/commands/project-management/prd-new.md
# Follow the instructions to create a PRD
```

### 2. Generate Epic
```bash
# Transform PRD to technical spec
cat .blackbox/commands/project-management/prd-parse.md
# Follow the instructions for your PRD
```

### 3. Decompose Tasks
```bash
# Break epic into tasks
cat .blackbox/commands/project-management/epic-decompose.md
# Follow the instructions for your epic
```

### 4. Sync to GitHub
```bash
# Create GitHub Issues
cat .blackbox/commands/github-integration/epic-sync.md
# This will create epic and task issues
```

### 5. Execute with BMAD
```bash
# Start work on a task
cat .blackbox/commands/project-management/issue-start.md
# BMAD agents will execute the task
```

### 6. Update Progress
```bash
# Post progress to GitHub
cat .blackbox/commands/github-integration/issue-sync.md
# Updates GitHub issue with progress
```

## Directory Structure

```
.blackbox/
├── specs/
│   ├── prds/              # Product Requirements
│   ├── epics/             # Technical Specifications
│   │   └── {feature}/
│   │       ├── epic.md
│   │       ├── {issue_numbers}.md
│   │       └── updates/
│   └── tasks/             # Standalone tasks
├── commands/
│   ├── project-management/
│   └── github-integration/
└── templates/
    ├── prd/
    ├── epic/
    └── task/
```

## Workflow

```
1. PRD Creation (Local)
   ↓
2. Epic Generation (Local)
   ↓
3. Task Decomposition (Local)
   ↓
4. GitHub Sync (Creates Issues)
   ↓
5. BMAD Execution (Agents work)
   ↓
6. Progress Updates (GitHub Comments)
   ↓
7. Completion (Issue Close)
```

## Integration with BMAD

- Uses BMAD agents for execution
- Tracks progress in BMAD memory system
- Coordinates via BMAD event bus
- Leverages BMAD skills library

## Benefits

- ✅ Spec-driven development
- ✅ GitHub-native workflow
- ✅ Complete traceability
- ✅ Human-AI collaboration
- ✅ Progress transparency
EOF

echo -e "${GREEN}✅ README created${NC}"
echo ""

# Summary
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  BMAD GitHub Integration Setup Complete! ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo "What's been created:"
echo "  📁 Directory structure: .blackbox/specs/, .blackbox/commands/, .blackbox/templates/"
echo "  📋 Command files: Project management + GitHub integration"
echo "  📄 Template files: PRD, Epic, Task templates"
echo "  📖 README: Usage instructions"
echo ""
echo "Next steps:"
echo "  1. Create your first PRD:"
echo "     cd .blackbox/commands/project-management"
echo "     # Read and follow prd-new.md"
echo ""
echo "  2. Or test with sample:"
echo "     # Example workflow in README"
echo ""
echo "  3. Integrate with BMAD agents:"
echo "     # Commands will use BMAD's agent system"
echo ""
echo "Documentation:"
echo "  📖 .blackbox/commands/GITHUB-INTEGRATION.md"
echo "  📊 .blackbox/IMPLEMENTATION-ACTION-PLAN.md"
echo "  🔗 .docs/research/CCPM-AND-VIBE-KANBAN-INTEGRATION.md"
echo ""
echo -e "${GREEN}✅ Ready to use!${NC}"
