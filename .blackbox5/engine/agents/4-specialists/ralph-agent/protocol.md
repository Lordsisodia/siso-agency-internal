# Ralph Agent Protocol

**Agent Type:** Autonomous Builder
**Parent System:** Blackbox3
**Protocol:** BMAD + Blackbox3 Extensions

---

## Purpose

Ralph Agent is an autonomous AI loop that continuously validates, tests, and improves Blackbox3. It operates with minimal human intervention while maintaining full transparency through documentation.

---

## Core Principles

1. **File-Based Memory** - All work stored as files, not model context
2. **Clean Context Each Loop** - Start fresh, read files, commit work
3. **Human Review Required** - All commits are reviewed before integration
4. **Sub-Agent Spawning** - Can delegate specialized tasks to sub-agents
5. **Continuous Documentation** - Every action is logged and explained

---

## Workspace Structure

```
agents/ralph-agent/
├── manifest.json              # Agent configuration
├── protocol.md                # This file
├── work/                      # Work output directory
│   ├── session-YYYYMMDD/     # Per-session work
│   │   ├── summary.md         # What was done
│   │   ├── achievements.md    # What was achieved
│   │   ├── materials.md       # Where materials are stored
│   │   ├── analysis.md        # Purpose and findings
│   │   └── sub-agents/        # Sub-agent work
│   └── index.md               # Master index of all sessions
├── logs/                      # Detailed logs
│   ├── activity.log           # Activity stream
│   ├── decisions.log          # Decisions made
│   └── sub-agents/            # Sub-agent logs
└── context/                   # Context snapshots
    ├── blackbox3-snapshot.md  # Blackbox3 state
    └── current-focus.md        # What Ralph is working on
```

---

## Documentation Requirements

### Per-Session Documentation (REQUIRED)

Every Ralph session MUST create:

**1. `work/session-YYYYMMDD/summary.md`**
```markdown
# Session Summary - YYYY-MM-DD

**Session ID:** [unique-id]
**Start Time:** [timestamp]
**End Time:** [timestamp]
**Stories Completed:** [list]
**Duration:** [time]

## What Was Done

[Bullet list of major accomplishments]

## Issues Found

[List of issues discovered with severity]

## Materials Created

[Files created with locations]

## Next Steps

[What to do next session]
```

**2. `work/session-YYYYMMDD/achievements.md`**
```markdown
# Achievements - Session YYYY-MM-DD

## Stories Completed

### Story X: [Title]
- **Status:** ✅ Complete
- **Acceptance:** [All criteria met]
- **Output:** [File locations]
- **Impact:** [What this improves]

### Story Y: [Title]
- **Status:** ⚠️ Partial
- **Remaining:** [What's left]
- **Blocked By:** [Dependencies]

## Metrics

- Files Created: [count]
- Tests Written: [count]
- Issues Fixed: [count]
- Documentation Updated: [count]

## Quality Improvements

[Measurable improvements to Blackbox3]
```

**3. `work/session-YYYYMMDD/materials.md`**
```markdown
# Materials Index - Session YYYY-MM-DD

## Code Files

| File | Purpose | Location |
|------|---------|----------|
| test-runner.sh | Test framework | tests/test-runner.sh |
| monitor-blackbox.sh | Monitoring | scripts/monitor-blackbox.sh |

## Documentation Files

| File | Purpose | Location |
|------|---------|----------|
| audit-baseline.md | Audit results | work/audit-baseline.md |

## Artifacts

- Git commits: [commit hashes]
- Run logs: [log file locations]
- Sub-agent outputs: [locations]

## Where Everything Is Stored

- **Main Work:** `ralph/work/`
- **Session Work:** `agents/ralph-agent/work/session-YYYYMMDD/`
- **Git Commits:** In `ralph/work/.git/`
- **Logs:** `agents/ralph-agent/logs/`
```

**4. `work/session-YYYYMMDD/analysis.md`**
```markdown
# Analysis & Purpose - Session YYYY-MM-DD

## What We Were Trying to Achieve

[The goal of this session]

## Approach Taken

[How Ralph approached the problem]

## Findings

### What Works
- [Thing that works well]
- [Another success]

### What Needs Improvement
- [Issue found]
- [Another issue]

### Recommendations

[What should be done next]

## Context For Next Session

[Important information for continuation]
```

---

## Sub-Agent Spawning

### When to Spawn Sub-Agents

Ralph MAY spawn sub-agents for:
1. **Specialized Tasks** - Testing, documentation, research
2. **Parallel Work** - Multiple independent validations
3. **Deep Analysis** - Complex problem requiring focus
4. **Cross-Referencing** - Validating across multiple systems

### How to Spawn

```bash
# Spawn sub-agent for testing
blackbox3.py agent create --name "test-validator" \
  --template "core/agents/_template/" \
  --task "Validate all test suites" \
  --output "agents/ralph-agent/work/session-YYYYMMDD/sub-agents/test-validator"

# Spawn sub-agent for documentation
blackbox3.py agent create --name "doc-updater" \
  --template "core/agents/_template/" \
  --task "Update all documentation" \
  --output "agents/ralph-agent/work/session-YYYYMMDD/sub-agents/doc-updater"
```

### Sub-Agent Documentation

Each sub-agent MUST produce:
1. **Task Description** - What they were asked to do
2. **Approach** - How they did it
3. **Results** - What they found/created
4. **Materials** - Files/artifacts they produced
5. **Recommendations** - What should be done next

Store in: `agents/ralph-agent/work/session-YYYYMMDD/sub-agents/[agent-name]/`

---

## Documentation Templates

### Quick-Log Template (For Minor Actions)

```markdown
## [Timestamp] - [Action]

**Story:** [Story ID]
**Action:** [What was done]
**Files:** [Files changed]
**Reason:** [Why this was needed]
**Result:** [Outcome]
```

### Sub-Agent Call Template

```markdown
## Sub-Agent Call: [Agent Name]

**Called:** [Timestamp]
**Purpose:** [Why sub-agent needed]
**Task:** [What sub-agent was asked to do]
**Expected Output:** [What we expect back]
**Status:** [Pending/Complete/Failed]
```

---

## Integration with Blackbox3

### Reading Blackbox3 Context

Before each session, Ralph reads:
1. `../context.md` - Blackbox3 overview
2. `../protocol.md` - Core protocols
3. `../core/protocols/protocol.md` - Detailed protocols
4. `../manifest.json` - System configuration

### Following Blackbox3 Conventions

1. **File-Based** - Store everything as files
2. **Bash-First** - Use shell scripts over Python
3. **Manual** - Humans review, Ralph suggests
4. **Documented** - Every action is explained
5. **Transparent** - All work is visible and traceable

### Writing to Blackbox3 Memory

When Ralph learns something important:
1. Write to `../memory/extended/ralph-findings.md`
2. Include: what, why, how, impact
3. Tag with date and session ID

---

## Session Lifecycle

### Session Start

1. Create session directory: `work/session-YYYYMMDD/`
2. Read Blackbox3 context
3. Read PRD and current story
4. Document session goals in `analysis.md`

### During Session

1. Log every action to `activity.log`
2. Document decisions in `decisions.log`
3. Update `summary.md` as work progresses
4. Spawn sub-agents when needed
5. Commit work incrementally

### Session End

1. Complete all documentation
2. Update master index in `work/index.md`
3. Write final summary
4. List next steps
5. Log session completion

---

## Required Files Per Session

- [ ] `work/session-YYYYMMDD/summary.md`
- [ ] `work/session-YYYYMMDD/achievements.md`
- [ ] `work/session-YYYYMMDD/materials.md`
- [ ] `work/session-YYYYMMDD/analysis.md`
- [ ] `logs/activity.log` updated
- [ ] `logs/decisions.log` updated
- [ ] `work/index.md` updated with session link

---

## Quality Gates

Before marking session complete:

1. **Documentation Complete** - All 4 session docs written
2. **Materials Indexed** - Everything created is listed
3. **Sub-Agents Documented** - All sub-agent work explained
4. **Next Steps Clear** - Path forward is obvious
5. **Blackbox3 Compatible** - All work follows BB3 conventions

---

## Human Review Checklist

When reviewing Ralph's work:

- [ ] All commits are justified in documentation
- [ ] New files follow Blackbox3 patterns
- [ ] Bash scripts preferred over Python
- [ ] No unnecessary automation added
- [ ] Documentation is clear and complete
- [ ] Sub-agent work is documented
- [ ] Next steps are actionable
- [ ] No breaking changes without warning
