# UI Cycle Agent - Setup Complete ✅

## Overview

The UI Adaptive Development Cycle agent has been successfully integrated into your current Blackbox3 system.

## Location

**Path:** `/Users/shaansisodia/DEV/AI-HUB/Black Box Factory/current/Blackbox3/`

## Files Created

### Agent Structure
```
current/Blackbox3/agents/custom/ui-cycle/
├── ui-cycle.agent.yaml          # Agent configuration (persona, capabilities, menu)
├── prompt.md                     # Execution instructions (updated paths)
├── README.md                     # Agent documentation (updated paths)
└── workflows/
    └── start-cycle.yaml          # Workflow definition
```

### Skill File
```
current/Blackbox3/agents/.skills/
└── ui-cycle.md                   # Detailed step-by-step framework (updated paths)
```

### Reference Documents
```
current/Blackbox3/
├── UI-ADAPTIVE-DEV-CYCLE.md      # Full specification (~25KB)
└── UI-CYCLE-QUICK-START.md       # Quick reference guide (~5KB)
```

## Path References Updated

All files have been updated with relative paths for the current Blackbox3 structure:

| File | Old Path | New Path |
|------|----------|----------|
| `prompt.md` | `/Black Box Factory/UI-ADAPTIVE-DEV-CYCLE.md` | `../../UI-ADAPTIVE-DEV-CYCLE.md` |
| `prompt.md` | `/Black Box Factory/UI-CYCLE-QUICK-START.md` | `../../UI-CYCLE-QUICK-START.md` |
| `README.md` | `/Black Box Factory/UI-ADAPTIVE-DEV-CYCLE.md` | `../../UI-ADAPTIVE-DEV-CYCLE.md` |
| `README.md` | `/Black Box Factory/UI-CYCLE-QUICK-START.md` | `../../UI-CYCLE-QUICK-START.md` |
| `ui-cycle.md` | `/Black Box Factory/UI-ADAPTIVE-DEV-CYCLE.md` | `../UI-ADAPTIVE-DEV-CYCLE.md` |

## Agent Capabilities

The UI Cycle Agent can:

1. **Execute 6-Phase UI Development Cycle**
   - Phase 0: Pre-Flight (2 min)
   - Phase 1: Observe (5 min)
   - Phase 2: Define (10 min)
   - Phase 3: Build (30 min)
   - Phase 4: Verify (15 min)
   - Phase 5: Deploy (5 min)
   - Phase 6: Close (3 min)

2. **Automated Testing**
   - Screenshot capture (mobile, tablet, desktop)
   - Console log validation
   - Visual regression detection (<5% threshold)
   - Accessibility audit (score >90)
   - Performance measurement (within 10% baseline)

3. **Safe Deployment**
   - Git commit with conventional messages
   - Feature branch creation
   - Production deployment
   - Production verification
   - Automatic rollback on failure

4. **Artifact Management**
   - Complete artifact trail
   - Cycle reports
   - Archived screenshots
   - Console and performance logs

## Usage

### Load the Agent
```bash
cd /Users/shaansisodia/DEV/AI-HUB/Black Box Factory/current/Blackbox3
# Then use the agent system to load:
load agent custom/agents/ui-cycle
```

### Execute a UI Cycle
```bash
# Full cycle
*ui-cycle "Change login button from blue to red" \
  --url=http://localhost:3000 \
  --component=LoginButton

# Phase-by-phase
OBSERVE --url=http://localhost:3000
DEFINE --task="Change button color"
BUILD --component=LoginButton
VERIFY
DEPLOY
CLOSE

# Check status
STATUS
```

## Integration Points

The agent integrates with:

- **MCP Servers:**
  - `chrome-devtools` - Browser automation
  - `playwright` - Automated testing
  - `serena` - Code analysis
  - `filesystem` - Artifact management

- **BMAD Agents:**
  - Can coordinate with `dev`, `qa`, `ux-designer` agents

- **Core Prompt:**
  - Inherits from `agents/_core/prompt.md`

## Supported UI Changes

| Pattern | Example | Test |
|---------|---------|------|
| Change Color | `bg-blue-500` → `bg-red-500` | Element has new class |
| Change Text | `"Submit"` → `"Send"` | Text content matches |
| Adjust Spacing | `padding: 1rem` → `2rem` | Visual spacing increased |
| Hide/Show | Conditional className | Visibility matches condition |
| Add Component | Insert new JSX | Component renders correctly |

## Verification Gates

All gates must pass for deployment:

- ✅ Type check passes
- ✅ Lint passes
- ✅ Build succeeds
- ✅ Tests pass
- ✅ Zero console errors
- ✅ Visual diff <5%
- ✅ A11y score >90
- ✅ Performance within 10% baseline
- ✅ Production console clean

## Escalation Triggers

Agent will escalate to human when:

- Build loops reach 2
- Verify loops reach 2
- Total time exceeds 90 minutes
- Production deployment fails

## Next Steps

1. **Test the agent** with a simple UI change
2. **Verify MCP servers** are configured correctly
3. **Run a full cycle** to validate the workflow
4. **Customize** for your specific deployment platform

## Documentation

- **Full Spec:** `UI-ADAPTIVE-DEV-CYCLE.md`
- **Quick Start:** `UI-CYCLE-QUICK-START.md`
- **Agent README:** `agents/custom/ui-cycle/README.md`
- **Skill:** `agents/.skills/ui-cycle.md`

---

**Status:** ✅ Ready to use
**Version:** 1.0.0
**Last Updated:** 2025-01-12
