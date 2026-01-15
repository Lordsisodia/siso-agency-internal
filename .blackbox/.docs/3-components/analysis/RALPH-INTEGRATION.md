# Ralph Wiggum Integration for Blackbox3

**Date:** 2026-01-13
**Purpose:** Use autonomous AI loop to accelerate Blackbox3 improvements

---

## What is Ralph Wiggum?

Ralph is a minimal, file-based agent loop for autonomous coding:
- Each iteration starts fresh (clean context)
- Reads from on-disk state (files + git)
- Executes one task per iteration
- Commits work incrementally
- Treats files as memory, not model context

**Source:** https://github.com/iannuttall/ralph

---

## Why Ralph Fits Blackbox3

| Blackbox3 Principle | Ralph Wiggum Approach |
|---------------------|----------------------|
| File-based conventions | ✅ Uses files as memory |
| Manual, convention-based | ✅ Human reviews commits |
| Bash over Python | ✅ Simple npm CLI |
| Incremental | ✅ One story per iteration |
| No complex runtime | ✅ Clean slate each loop |

---

## Integration: Automated Testing (Hypothesis 4)

### Setup

```bash
# Install Ralph globally
npm i -g @iannuttall/ralph

# In Blackbox3 directory
cd /Users/shaansisodia/DEV/AI-HUB/Black\ Box\ Factory/current/Blackbox3

# Install Ralph templates locally
ralph install

# Install required skills
ralph install --skills
# Choose: claude (for Claude Code)
# Choose: local (project-specific)
```

### Create PRD for Testing Suite

Create `.agents/tasks/prd-testing-suite.json`:

```json
{
  "name": "Blackbox3 Testing Suite",
  "description": "Build comprehensive validation tests for Blackbox3 file-based conventions",
  "stories": [
    {
      "id": "1",
      "title": "Create test framework",
      "description": "Build bash-based test framework for checking file conventions",
      "acceptance": [
        "Test runner script exists",
        "Can check plan folder naming",
        "Can check required files exist",
        "Can validate file structure",
        "Tests pass on good examples",
        "Tests fail on bad examples"
      ],
      "status": "pending"
    },
    {
      "id": "2",
      "title": "Write convention tests",
      "description": "Create tests for all Blackbox3 file conventions",
      "acceptance": [
        "Test plan naming (YYYY-MM-DD_HHMM_slug)",
        "Test required files (README.md, checklist.md, status.md)",
        "Test checkpoint file naming",
        "Test artifact locations",
        "Test context management files",
        "All tests documented"
      ],
      "status": "pending"
    },
    {
      "id": "3",
      "title": "Create test documentation",
      "description": "Document how to use and extend test suite",
      "acceptance": [
        "README explains test framework",
        "Examples show how to add tests",
        "CI integration documented",
        "Test coverage documented"
      ],
      "status": "pending"
    },
    {
      "id": "4",
      "title": "Validate test suite",
      "description": "Run tests on existing plans to validate they work",
      "acceptance": [
        "Tests run on 5+ existing plans",
        "False positive rate measured",
        "False negative rate measured",
        "Issues documented and fixed"
      ],
      "status": "pending"
    }
  ],
  "gates": {
    "ready": true,
    "done": ["all stories status = complete"]
  }
}
```

### Run Ralph Loop

```bash
# Run Ralph autonomously (will loop until all stories complete)
ralph build 1
```

**What Ralph does:**
1. Reads PRD from `.agents/tasks/prd-testing-suite.json`
2. Picks first pending story
3. Executes work using Claude Code
4. Commits changes with story ID
5. Updates PRD status
6. Repeats until all stories complete

**You do:**
- Review each commit before merging
- Provide feedback if work is off-track
- Let Ralph run autonomously otherwise

---

## Integration: Template Library (Hypothesis 5)

### Create PRD for Template Curation

Create `.agents/tasks/prd-templates.json`:

```json
{
  "name": "Blackbox3 Template Library",
  "description": "Curate high-quality examples and create reusable templates",
  "stories": [
    {
      "id": "1",
      "title": "Audit existing plans",
      "description": "Review all plans in agents/.plans/ and assess quality",
      "acceptance": [
        "Inventory all existing plans created",
        "Each plan rated for quality (1-5)",
        "Categorized by workflow type",
        "High-quality examples identified (≥4 rating)",
        "Gaps documented"
      ],
      "status": "pending"
    },
    {
      "id": "2",
      "title": "Create template structure",
      "description": "Design template library organization",
      "acceptance": [
        "Template categories defined",
        "Naming conventions established",
        "Template location decided (.templates/)",
        "Discovery method designed (README/index)",
        "Template template created"
      ],
      "status": "pending"
    },
    {
      "id": "3",
      "title": "Extract templates from examples",
      "description": "Convert high-quality plans into reusable templates",
      "acceptance": [
        "3-5 templates created",
        "Each template has README",
        "Each template has usage example",
        "Template variables documented",
        "Templates tested for usability"
      ],
      "status": "pending"
    },
    {
      "id": "4",
      "title": "Create template documentation",
      "description": "Document template library usage",
      "acceptance": [
        "Template library README created",
        "How to use templates documented",
        "How to create new templates documented",
        "Examples provided"
      ],
      "status": "pending"
    }
  ]
}
```

---

## Integration: Documentation Updates (Bonus)

### Create PRD for Doc Maintenance

Create `.agents/tasks/prd-docs.json`:

```json
{
  "name": "Blackbox3 Documentation Maintenance",
  "description": "Keep documentation synchronized with system changes",
  "stories": [
    {
      "id": "1",
      "title": "Update quick start guide",
      "description": "Ensure QUICK-START.md reflects current system",
      "acceptance": [
        "All scripts in guide exist",
        "All paths are correct",
        "Examples work as documented",
        "Screenshots are current (if any)"
      ],
      "status": "pending"
    },
    {
      "id": "2",
      "title": "Sync protocol.md with reality",
      "description": "Verify protocol.md matches actual agent workflow",
      "acceptance": [
        "Agent stages match actual workflow",
        "File locations are accurate",
        "Blackbox loop description correct",
        "All referenced files exist"
      ],
      "status": "pending"
    },
    {
      "id": "3",
      "title": "Update INDEX.md",
      "description": "Ensure documentation index is complete",
      "acceptance": [
        "All documented files listed",
        "All links work",
        "New docs added",
        "Organization is logical"
      ],
      "status": "pending"
    }
  ]
}
```

---

## Benefits for Blackbox3

### 1. Autonomous Development
- Ralph works while you review
- Continuous progress on long tasks
- No manual context management needed

### 2. Clean Context Each Loop
- No context overflow
- Each iteration starts fresh
- Files and git are the memory

### 3. Incremental + Reviewable
- Each story is one commit
- You review before merging
- Can stop anytime

### 4. Fits Blackbox3 Philosophy
- File-based (PRD is JSON, state in .ralph/)
- Manual (you review commits)
- Convention-based (uses existing patterns)
- No complex runtime (simple CLI)

---

## Workflow: Ralph + Human

```
┌─────────────────────────────────────────────────────────┐
│  1. Create PRD (JSON) defining work                      │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│  2. Run: ralph build 1                                  │
│     Ralph starts autonomous loop                        │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│  3. Ralph Loop (repeats until done):                   │
│     • Pick next pending story                          │
│     • Start fresh (clean context)                      │
│     • Read state from files + git                      │
│     • Execute work with Claude Code                    │
│     • Commit work with story ID                        │
│     • Update PRD status                                │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│  4. Human Review (between Ralph iterations)            │
│     • Review commit                                    │
│     • Test changes                                     │
│     • Provide feedback if needed                       │
│     • Let Ralph continue                               │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│  5. Done! All stories complete                         │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Start Commands

```bash
# Install Ralph
npm i -g @iannuttall/ralph

# Navigate to Blackbox3
cd /path/to/Blackbox3

# Install Ralph locally (creates .agents/ralph/)
ralph install

# Install skills (optional but recommended)
ralph install --skills

# Create PRD interactively
ralph prd

# Or run with existing PRD
ralph build 1

# Dry run (no commits)
ralph build 1 --no-commit

# Check Ralph status
ralph status
```

---

## Ralph PRD Format

Ralph uses JSON PRDs with this structure:

```json
{
  "name": "Project Name",
  "description": "What this project does",
  "stories": [
    {
      "id": "1",
      "title": "Story title",
      "description": "What to do",
      "acceptance": ["Criteria 1", "Criteria 2", "Criteria 3"],
      "status": "pending | in-progress | complete"
    }
  ],
  "gates": {
    "ready": true,
    "done": ["all stories status = complete"]
  }
}
```

---

## Customizing Ralph for Blackbox3

After running `ralph install`, edit `.agents/ralph/` to customize:

### Agent Template
Customize how Ralph interacts with Claude:
- Edit system prompt
- Add Blackbox3-specific context
- Customize output format

### Skills
Add Blackbox3-specific skills:
- `blackbox3-validate` - Validate file conventions
- `blackbox3-test` - Run test suite
- `blackbox3-docs` - Update documentation

---

## Example: Complete Ralph Session

```bash
# 1. Navigate to Blackbox3
cd /Users/shaansisodia/DEV/AI-HUB/Black\ Box\ Factory/current/Blackbox3

# 2. Create testing PRD (see above)
cat > .agents/tasks/prd-testing.json << 'EOF'
{...json content...}
EOF

# 3. Start Ralph loop
ralph build 1

# Ralph now:
# - Reads prd-testing.json
# - Picks story 1
# - Starts Claude Code with fresh context
# - Reads Blackbox3 files and docs
# - Creates test framework
# - Commits with message "ralph: story 1 - Create test framework"
# - Updates PRD status to "complete"
# - Picks story 2
# - ...repeats until all stories done

# 4. You review commits as they appear
git log --oneline

# 5. When all stories done, Ralph stops
# Check .ralph/prd-testing.json to see status
```

---

## Monitoring Ralph

```bash
# Check current status
ralph status

# View what Ralph is working on
cat .ralph/state.json

# View PRD progress
cat .agents/tasks/prd-*.json

# View Ralph logs
tail -f .ralph/ralph.log
```

---

## Safety Features

1. **Human Review Required** - Ralph commits, you merge
2. **Dry Run Mode** - `--no-commit` flag for testing
3. **Incremental** - One story per commit, easy to revert
4. **File-Based** - All state in files, easy to inspect
5. **Clean Context** - Each iteration starts fresh, no context pollution

---

## Comparison: Ralph vs Manual

| Aspect | Manual | Ralph |
|---------|--------|-------|
| Context management | Manual | Automatic (clean each loop) |
| Progress tracking | Manual (files) | Automatic (PRD status) |
| Incremental commits | Manual | Automatic |
| Session length | Limited (context overflow) | Unlimited (clean slate) |
| Multi-tasking | Hard (track yourself) | Easy (PRD defines work) |
| Review needed | Yes | Yes (you still review commits) |

---

## Next Steps

1. **Install Ralph** - `npm i -g @iannuttall/ralph`
2. **Install in Blackbox3** - `ralph install`
3. **Create first PRD** - Start with testing suite
4. **Run Ralph** - `ralph build 1`
5. **Monitor progress** - `ralph status`
6. **Review commits** - `git log` and review changes

---

## Sources

- **Ralph Repository:** https://github.com/iannuttall/ralph
- **Original Ralph Wiggum Guide:** https://github.com/ghuntley/how-to-ralph-wiggum
- **Claude Code Ralph Plugin:** https://github.com/anthropics/claude-code/blob/main/plugins/ralph-wiggum/README.md
- **Multi-Agent Ralph:** https://github.com/alfredolopez80/multi-agent-ralph-loop

---

**Status:** Ready to integrate
**Recommendation:** Use Ralph for Hypothesis 4 (Testing Suite) - perfect fit for autonomous test development
