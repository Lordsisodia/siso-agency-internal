# How to Start Using This Code in BlackBox5

## Quick Start: 3-Phase Implementation

---

## 🚀 Phase 1: Week 1 (Setup & Templates)

### Step 1: Create Directory Structure

```bash
cd /Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5

# Create new directories
mkdir -p specs/{prds,epics,tasks}
mkdir -p context/{requirements,assembler,cache}
mkdir -p security/{input,execution,output}
mkdir -p verification/{completeness,consistency,correctness}
mkdir -p metrics/{relevance,completeness,efficiency}
mkdir -p github/{issues,workflows,sync}
```

### Step 2: Copy Templates (Already Done!)

The templates are already created:
- ✅ `.blackbox5/specs/prds/TEMPLATE.md`
- ✅ `.blackbox5/specs/epics/TEMPLATE.md`
- ✅ `.blackbox5/specs/tasks/TEMPLATE.md`

### Step 3: Create First PRD (Test Drive)

**Example**: Create a PRD for a new skill

```bash
# Copy template
cp .blackbox5/specs/prds/TEMPLATE.md .blackbox5/specs/prds/001-debugging-helper.md
```

**Fill in the PRD**:
```markdown
# PRD: Debugging Helper Skill

## First Principles Analysis

### The Problem
Developers struggle to debug issues systematically. They try random fixes without understanding root causes.

### Fundamental Truths
1. **Debugging is detective work** - Need evidence, not guesses
2. **Symptoms have causes** - Fix the cause, not the symptom
3. **Time is limited** - Need efficient process

### Assumptions
- ✅ Developers want to debug faster (verified)
- ✅ Systematic approach works better than random (verified)
- ❌ "Just try things" is efficient (FALSE - proven wrong)

### Constraints
- Real: Time available for debugging
- Real: Access to code and logs
- Imagined: "No time for systematic debugging" (false economy)

### Solution from First Principles
Minimal solution: 4-phase systematic process
1. Gather evidence
2. Form hypotheses
3. Test hypotheses
4. Verify fix

## Requirements
- FR-1: Teach systematic debugging process
- FR-2: Provide clear workflow
- FR-3: Include examples

## Success Metrics
- Users follow systematic process
- Reduced debugging time
- Fewer recurring bugs
```

### Step 4: Create Epic from PRD

```bash
# Use the epic template
cp .blackbox5/specs/epics/TEMPLATE.md .blackbox5/specs/epics/001-debugging-helper-epic.md
```

**Fill in the Epic** (technical spec):
```markdown
# Epic: Debugging Helper Skill - Technical Specification

## Overview
Traces to PRD: 001-debugging-helper

## First Principles Design

### Core Architecture
Essential Components:
1. `SKILL.md` - Main skill document
2. `<workflow>` tag - 4-phase process
3. `<examples>` tag - Concrete examples

What to Eliminate:
- Complex tooling (not needed)
- Framework-specific patterns (keep generic)

### Key Technical Decisions
1. **Format**: XML tags (Anthropic best practice)
2. **Structure**: 4 phases (Gather, Hypothesize, Test, Verify)
3. **Examples**: 3+ real debugging scenarios

## Components
### Component 1: SKILL.md
File: `.blackbox5/engine/agents/.skills-new/development-workflow/testing-quality/systematic-debugging/SKILL.md`
Content: XML-structured debugging methodology

## Acceptance Criteria
- [ ] SKILL.md created with XML tags
- [ ] Workflow has 4 phases
- [ ] 3+ examples included
- [ ] Tested with Claude Code
```

### Step 5: Create Tasks

```bash
# Use the task template
cp .blackbox5/specs/tasks/TEMPLATE.md .blackbox5/specs/tasks/001-create-skill-file.md
cp .blackbox5/specs/tasks/TEMPLATE.md .blackbox5/specs/tasks/002-add-workflow.md
cp .blackbox5/specs/tasks/TEMPLATE.md .blackbox5/specs/tasks/003-add-examples.md
```

**Fill in each task** with acceptance criteria.

---

## 🔧 Phase 2: Week 2-3 (Implementation)

### Step 1: Create PRD Command

**File**: `.blackbox5/commands/prd-new.sh`

```bash
#!/bin/bash
# .blackbox5/commands/prd-new.sh
# Create new PRD with first principles analysis

SKILL_NAME=$1
TEMPLATE=".blackbox5/specs/prds/TEMPLATE.md"
OUTPUT=".blackbox5/specs/prds/001-${SKILL_NAME}.md"

# Copy template
cp "$TEMPLATE" "$OUTPUT"

echo "✅ PRD created: $OUTPUT"
echo "📝 Edit the PRD with first principles analysis:"
echo "   - What problem are we solving?"
echo "   - What are fundamental truths?"
echo "   - What are assumptions vs constraints?"
echo ""
echo "Then run: bb5 prd:parse ${SKILL_NAME}"
```

**Make it executable**:
```bash
chmod +x .blackbox5/commands/prd-new.sh
```

### Step 2: Create Epic Generator Command

**File**: `.blackbox5/commands/prd-parse.sh`

```bash
#!/bin/bash
# .blackbox5/commands/prd-parse.sh
# Transform PRD to technical epic

SKILL_NAME=$1
PRD_FILE=".blackbox5/specs/prds/001-${SKILL_NAME}.md"
EPIC_FILE=".blackbox5/specs/epics/001-${SKILL_NAME}-epic.md"

# Read PRD
if [ ! -f "$PRD_FILE" ]; then
    echo "❌ PRD not found: $PRD_FILE"
    echo "Run: bb5 prd:new ${SKILL_NAME}"
    exit 1
fi

# Extract requirements (simple version)
echo "Generating epic from PRD..."

# Use Claude Code to generate epic
cat > "$EPIC_FILE" << EOF
# Epic: ${SKILL_NAME} - Technical Specification

## Overview
Auto-generated from PRD: 001-${SKILL_NAME}

## Architecture
[Extracted from PRD requirements]

## Components
[Based on PRD functional requirements]

## Acceptance Criteria
[From PRD acceptance criteria]
EOF

echo "✅ Epic created: $EPIC_FILE"
echo "📝 Review and edit the epic with technical details"
echo "Then run: bb5 epic:decompose ${SKILL_NAME}"
```

### Step 3: Create Task Decomposer Command

**File**: `.blackbox5/commands/epic-decompose.sh`

```bash
#!/bin/bash
# .blackbox5/commands/epic-decompose.sh
# Break epic into tasks

SKILL_NAME=$1
EPIC_FILE=".blackbox5/specs/epics/001-${SKILL_NAME}-epic.md"
TASKS_DIR=".blackbox5/specs/tasks"

# Read epic
if [ ! -f "$EPIC_FILE" ]; then
    echo "❌ Epic not found: $EPIC_FILE"
    echo "Run: bb5 prd:parse ${SKILL_NAME}"
    exit 1
fi

# Create tasks
echo "Decomposing epic into tasks..."

# Task 1: Create structure
cat > "$TASKS_DIR/001-create-structure.md" << EOF
# Task: Create Directory Structure

## Context
Epic: ${SKILL_NAME}
PRD: 001-${SKILL_NAME}

## Acceptance Criteria
- [ ] Directory created
- [ ] SKILL.md created
- [ ] Scripts folder created
EOF

# Task 2: Write content
cat > "$TASKS_DIR/002-write-content.md" << EOF
# Task: Write SKILL.md Content

## Context
Epic: ${SKILL_NAME}
PRD: 001-${SKILL_NAME}

## Acceptance Criteria
- [ ] XML tags used
- [ ] Workflow defined
- [ ] Examples included
EOF

echo "✅ Tasks created in $TASKS_DIR"
echo "📝 Review tasks and assign to agents/humans"
```

### Step 4: Add to PATH

```bash
# Add BlackBox5 commands to PATH
export PATH="$PATH:.blackbox5/commands"

# Or add to ~/.zshrc or ~/.bashrc
echo 'export PATH="$PATH:/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/commands"' >> ~/.zshrc
source ~/.zshrc
```

---

## 🧪 Phase 3: Week 4 (Test & Integrate)

### Step 1: Test with Existing Skill

**Use the TDD skill** (already exists):

```bash
# Create PRD for TDD skill (retroactive)
bb5 prd:new test-driven-development

# It should create:
# .blackbox5/specs/prds/001-test-driven-development.md

# Edit the PRD to match existing skill
```

### Step 2: Generate Epic

```bash
bb5 prd:parse test-driven-development

# It should create:
# .blackbox5/specs/epics/001-test-driven-development-epic.md
```

### Step 3: Decompose to Tasks

```bash
bb5 epic:decompose test-driven-development

# It should create:
# .blackbox5/specs/tasks/001-tdd-red-phase.md
# .blackbox5/specs/tasks/002-tdd-green-phase.md
# .blackbox5/specs/tasks/003-tdd-refactor-phase.md
```

### Step 4: Implement Tasks

Each task should have:
- Clear acceptance criteria
- File locations
- Definition of done

### Step 5: Verify

```bash
# Check that all components work:
ls -la .blackbox5/specs/prds/
ls -la .blackbox5/specs/epics/
ls -la .blackbox5/specs/tasks/

# Verify workflow works
cat .blackbox5/specs/prds/001-test-driven-development.md
cat .blackbox5/specs/epics/001-test-driven-development-epic.md
```

---

## 🔗 Integration with Existing BlackBox5

### Connect to Agent Loader

**File**: `.blackbox5/engine/core/AgentLoader.py`

**Add PRD check**:
```python
def load_agent(agent_id):
    """Load agent with PRD validation"""

    # Check if agent has PRD
    prd_file = f".blackbox5/specs/prds/{agent_id}.md"
    if os.path.exists(prd_file):
        print(f"✅ Loading agent with PRD: {agent_id}")
        # Load PRD context
        with open(prd_file) as f:
            prd_context = f.read()
        # Prepend to agent prompt
    else:
        print(f"⚠️  No PRD found for: {agent_id}")
        print("   Consider creating PRD first: bb5 prd:new {agent_id}")

    # Load agent normally
    # ... existing code ...
```

### Connect to Skill Manager

**File**: `.blackbox5/engine/core/SkillManager.py`

**Add spec validation**:
```python
def load_skill(skill_id):
    """Load skill with spec validation"""

    # Check if skill has spec
    spec_file = f".blackbox5/specs/epics/{skill_id}-epic.md"
    if os.path.exists(spec_file):
        print(f"✅ Loading skill with spec: {skill_id}")
        # Validate against spec
        with open(spec_file) as f:
            spec = f.read()
        # Check acceptance criteria
    else:
        print(f"⚠️  No spec found for: {skill_id}")
        print("   Consider creating spec: bb5 prd:parse {skill_id}")

    # Load skill normally
    # ... existing code ...
```

---

## 📝 Quick Reference Commands

```bash
# Create new PRD
bb5 prd:new <skill-name>

# Transform PRD to Epic
bb5 prd:parse <skill-name>

# Break Epic into Tasks
bb5 epic:decompose <skill-name>

# List all PRDs
bb5 prd:list

# Show PRD status
bb5 prd:status <skill-name>

# Show Epic status
bb5 epic:status <skill-name>

# Show Task status
bb5 task:status <task-id>
```

---

## 🎯 Example Workflow

**Scenario**: Create a new "Code Review" skill

```bash
# 1. Create PRD (5 min)
bb5 prd:new code-review
# Edit: .blackbox5/specs/prds/001-code-review.md
# Add: First principles analysis, requirements, success metrics

# 2. Generate Epic (5 min)
bb5 prd:parse code-review
# Edit: .blackbox5/specs/epics/001-code-review-epic.md
# Add: Technical decisions, architecture, components

# 3. Decompose to Tasks (5 min)
bb5 epic:decompose code-review
# Edit: .blackbox5/specs/tasks/*.md
# Add: Acceptance criteria, file locations, definition of done

# 4. Implement (agent or human)
# Each task has clear acceptance criteria
# Implement exactly to spec
# No deviations without approval

# 5. Verify
bb5 verify:completeness code-review
bb5 verify:consistency code-review
bb5 verify:correctness code-review

# 6. Quality Check
bb5 metrics:calculate code-review
# Shows: relevance, completeness, efficiency scores
```

**Total time**: ~30 minutes for systematic, traceable skill development
**vs** "Vibe coding": Hit or miss, no traceability, uncertain quality

---

## ✅ Success Criteria

After implementation, you should be able to:

- [ ] Create PRD in 5 minutes
- [ ] Generate Epic in 5 minutes
- [ ] Decompose to Tasks in 5 minutes
- [ ] Every skill traces back to requirements
- [ ] First principles analysis documented
- [ ] Acceptance criteria clearly defined
- [ ] Quality measured objectively

---

## 🚀 Next Steps

1. **Week 1**: Create directory structure, copy templates, test PRD workflow
2. **Week 2**: Implement command scripts, integrate with AgentLoader
3. **Week 3**: Test with existing skills, measure improvement
4. **Week 4**: Add security layer, verification, metrics

**Start now**: Create your first PRD!

```bash
cd /Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL
bb5 prd:new my-first-skill
```
