# UI Cycle Agent

Autonomous UI development specialist executing the UI Adaptive Development Cycle.

## Purpose

Executes UI changes through a rigorous 6-phase cycle: Observe → Define → Build → Verify → Deploy → Close. Each change is baseline-captured, tested, validated, and deployed with full artifact trails.

## Trigger (when to use)

- You need to make a UI change (color, layout, text, spacing, component)
- You want to deploy UI changes with automated testing
- You need visual regression protection
- You require accessibility validation (score >90)
- You want production deployment with rollback safety

## Inputs

- **Task Description:** What UI change to make (one line)
- **Target URL:** Where to test the change (e.g., localhost:3000)
- **Component Name:** Which component to modify (e.g., LoginButton.tsx)
- **Change Type:** color | layout | text | spacing | component | other

## Outputs

- Modified source files
- Automated test suite
- Screenshots (before/after/production)
- Console and performance logs
- Accessibility audit report
- Cycle completion report
- Archived artifacts in `/archive/ui-cycles/{timestamp}/`

## Guardrails

- Always capture baseline before making changes
- Never skip verification gates
- Max 2 loops per phase, then escalate
- Console must be clean before deploy
- Visual regression must be <5%
- Accessibility score must be >90
- Performance within 10% of baseline

## Run Loop

1. **Load UI cycle specification** from `../../UI-ADAPTIVE-DEV-CYCLE.md`
2. **Load quick start guide** from `../../UI-CYCLE-QUICK-START.md`
3. **Create run directory** at `.runs/ui-cycle-{timestamp}/`
4. **Execute 6 phases:**
   - Phase 0: Pre-flight (validate environment)
   - Phase 1: Observe (capture baseline)
   - Phase 2: Define (success criteria)
   - Phase 3: Build (make changes)
   - Phase 4: Verify (automated tests)
   - Phase 5: Deploy (ship to production)
   - Phase 6: Close (archive & report)
5. **Track loop counts** and escalate at limits
6. **Generate cycle report** with all artifacts

## Special Instructions

### Required MCP Servers
- `chrome-devtools` - Browser automation, screenshots, console
- `playwright` - Automated testing, visual regression
- `serena` - Code analysis, component search
- `filesystem` - Artifact management

### Loop Behavior
- Build loops: max 2 (then escalate)
- Verify loops: max 2 (then escalate)
- Total time: max 90 minutes (then escalate)

### Escalation Format
When stuck, provide:
- Cycle ID and task
- Current phase and loop count
- Steps taken
- Specific error
- Attempts made
- Artifacts location
- Suggested actions

### Common Patterns

| Pattern | Example | Test |
|---------|---------|------|
| Change Color | `bg-blue-500` → `bg-red-500` | Element has `bg-red-500` |
| Change Text | `"Submit"` → `"Send"` | Text is `"Send"` |
| Adjust Spacing | `padding: 1rem` → `2rem` | Spacing increased |
| Hide/Show | Conditional className | Visibility matches |
| Add Component | Insert new JSX | Renders correctly |

## Files

- `ui-cycle.agent.yaml` - Agent configuration with persona, capabilities, menu
- `prompt.md` - Main agent prompt with execution instructions
- `../../agents/.skills/ui-cycle.md` - Skill with detailed step-by-step framework
- `../../UI-ADAPTIVE-DEV-CYCLE.md` - Full specification
- `../../UI-CYCLE-QUICK-START.md` - Quick reference guide

## Usage

```bash
# Via agent system
load agent custom/agents/ui-cycle

# Execute full cycle
*ui-cycle "Change login button from blue to red" --url=http://localhost:3000 --component=LoginButton

# Execute specific phase
OBSERVE --url=http://localhost:3000
DEFINE --task="Change button color"
BUILD --component=LoginButton
VERIFY
DEPLOY
CLOSE

# Check status
STATUS

# Escalate if stuck
ESCALATE
```

## Examples

### Example 1: Change Button Color
```
Task: Change login button from blue to red
URL: http://localhost:3000/login
Component: LoginButton.tsx

Expected Output:
- Modified LoginButton.tsx (bg-blue-500 → bg-red-500)
- Acceptance test verifies red color
- Screenshots show color change
- Console clean, a11y score 95, performance +2%
- Deployed to https://production.example.com
```

### Example 2: Add Loading State
```
Task: Add loading spinner to dashboard
URL: http://localhost:3000/dashboard
Component: Dashboard.tsx

Expected Output:
- New Spinner component created
- Dashboard.tsx imports and uses Spinner
- Acceptance test verifies spinner appears during fetch
- All tests pass, console clean
- Deployed and verified
```

## Verification

After each cycle:
- [ ] All gates passed
- [ ] Production deployed
- [ ] Console clean
- [ ] Screenshots archived
- [ ] Cycle report generated
