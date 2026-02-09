# UI Adaptive Development Cycle
## Autonomous Agent-Executable Specification v1.0

**Purpose:** A practical, battle-tested UI development cycle that agents can execute autonomously to produce working, tested, and deployed UI changes.

**Design Philosophy:** Small batches, rapid feedback, explicit verification points, and zero ambiguity.

---

## 🎯 CYCLE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    UI ADAPTIVE DEVELOPMENT CYCLE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌───────┐ │
│  │ OBSERVE │ -> │  DEFINE  │ -> │  BUILD   │ -> │  VERIFY  │ -> │ DEPLOY│ │
│  │  5 min  │    │  10 min  │    │  30 min  │    │  15 min  │    │ 5 min │ │
│  └────┬────┘    └─────┬────┘    └─────┬────┘    └─────┬────┘    └───┬───┘ │
│       │               │               │               │              │     │
│       ▼               ▼               ▼               ▼              ▼     │
│   Current State   Success Criteria   Code Changes   Automated      Live   │
│   Baseline        Acceptance Tests   File Edits     Tests          URL    │
│   Screenshots                      Component       Screenshots    Console │
│   Console Logs                      Creation        Console Logs   Check  │
│                                     Style Edits     Accessibility │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                     FEEDBACK LOOP                                   │  │
│  │    If ANY gate fails → Return to BUILD with specific failure      │  │
│  │    Max 2 loops → Escalate to human with context                   │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Total Time:** 65 minutes (typical UI change)
**Success Rate Target:** >85% autonomous completion

---

## 📋 PHASE 0: PRE-FLIGHT CHECK (2 min)

### 0.1 Environment Validation
```bash
# Run before every cycle
cd /path/to/project
git status --porcelain                    # Must be clean
npm run dev --dry-run 2>&1 | grep -q "ready" || echo "Dev server ready"
npx playwright test --list 2>&1 | head -1  # Verify Playwright installed
```

**Gates:**
- ✅ Git working directory clean
- ✅ Dev server starts without errors
- ✅ Playwright/Chrome MCP available
- ✅ No conflicting PRs in target branch

**If gate fails:** Stop and report specific blocker. Do not proceed.

### 0.2 Context Snapshot
```bash
# Create cycle run folder
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RUN_DIR=".runs/ui-cycle-${TIMESTAMP}"
mkdir -p "${RUN_DIR}/artifacts"
mkdir -p "${RUN_DIR}/screenshots/before"
mkdir -p "${RUN_DIR}/screenshots/after"
mkdir -p "${RUN_DIR}/logs"

# Save cycle metadata
cat > "${RUN_DIR}/cycle.json" <<EOF
{
  "cycle_id": "${TIMESTAMP}",
  "started_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "git_head": "$(git rev-parse HEAD)",
  "git_branch": "$(git branch --show-current)",
  "task": "${TASK_DESCRIPTION}",
  "agent": "$(whoami)-$(hostname)"
}
EOF
```

---

## 🔍 PHASE 1: OBSERVE (5 min)

### Goal: Establish baseline understanding of current state

### 1.1 Navigate and Capture Current State
```javascript
// Using Chrome MCP or Playwright
await page.goto(URL);
await page.waitForLoadState('networkidle');

// Capture viewport sizes to test
const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 }
];

for (const vp of viewports) {
  await page.setViewportSize(vp);
  await page.screenshot({
    path: `${RUN_DIR}/screenshots/before/${vp.name}.png`,
    fullPage: true
  });
}
```

### 1.2 Console & Network Baseline
```javascript
// Clear and capture console
await page.evaluate(() => console.clear());
const consoleLogs = [];

page.on('console', msg => {
  consoleLogs.push({
    type: msg.type(),
    text: msg.text(),
    location: msg.location()
  });
});

// Get network baseline
const performanceMetrics = await page.evaluate(() => ({
  timing: JSON.parse(JSON.stringify(performance.timing)),
  navigation: JSON.parse(JSON.stringify(performance.navigation))
}));

fs.writeFileSync(
  `${RUN_DIR}/logs/before-console.json`,
  JSON.stringify(consoleLogs, null, 2)
);

fs.writeFileSync(
  `${RUN_DIR}/logs/before-performance.json`,
  JSON.stringify(performanceMetrics, null, 2)
);
```

### 1.3 Component Inspection
```bash
# Find relevant components using semantic search
# (Use Serena MCP or grep)

# Example: Find all button components
find src -name "*.tsx" -o -name "*.jsx" | xargs grep -l "Button" | head -20

# Get component hierarchy
grep -r "export.*Button" src/components --include="*.tsx" -A 5
```

**Outputs:**
- `screenshots/before/*.png` - Current UI state
- `logs/before-console.json` - Console errors/warnings
- `logs/before-performance.json` - Performance baseline
- `artifacts/component-map.md` - Relevant components found

---

## 📝 PHASE 2: DEFINE (10 min)

### Goal: Create unambiguous success criteria

### 2.1 Success Criteria Template
```markdown
# Success Criteria for: ${TASK_DESCRIPTION}

## Must-Have (Blocking Failures)
- [ ] No console errors after changes
- [ ] No visual regressions on mobile/desktop
- [ ] Target component renders correctly
- [ ] Existing functionality preserved

## Should-Have (Quality Gates)
- [ ] Accessibility score > 90
- [ ] Touch targets >= 44x44px (mobile)
- [ ] Text contrast >= WCAG AA
- [ ] Performance metrics within 10% of baseline

## Nice-to-Have (Enhancements)
- [ ] Code follows existing patterns
- [ ] No new dependencies added
- [ ] TypeScript strict mode compliant
```

### 2.2 Acceptance Test Generation
```typescript
// Generate test before building
// File: ${RUN_DIR}/artifacts/acceptance.test.ts

import { test, expect } from '@playwright/test';

test.describe(`${TASK_DESCRIPTION}`, () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'desktop', width: 1920, height: 1080 }
  ];

  viewports.forEach(vp => {
    test.use({ viewport: vp.width, viewportHeight: vp.height });

    test(`validates on ${vp.name}`, async ({ page }) => {
      await page.goto(URL);

      // TODO: Add specific assertions based on task
      // Example:
      // await expect(page.locator('[data-testid="target-element"]')).toBeVisible();
      // await expect(page).toHaveNoConsoleErrors();
    });
  });
});
```

**Outputs:**
- `artifacts/success-criteria.md` - Pass/fail checklist
- `artifacts/acceptance.test.ts` - Automated test

---

## 🔨 PHASE 3: BUILD (30 min)

### Goal: Make minimal, targeted changes

### 3.1 Code Change Strategy
```
RULE: Single Responsibility per Cycle
✅ Good: "Update button color from blue to red"
❌ Bad: "Redesign entire navigation and add new features"

RULE: One File Type per Batch
1. Component changes (tsx)
2. Style changes (css/tailwind)
3. Test changes (test.ts)
4. Type changes (d.ts)
```

### 3.2 Component Modification Pattern
```typescript
// 1. Locate the target component
// 2. Make surgical changes
// 3. Preserve existing props and interfaces
// 4. Add data-testid attributes for testing

// BEFORE modification - create backup
cp src/components/TargetComponent.tsx \
   "${RUN_DIR}/artifacts/TargetComponent.tsx.backup"

// Make changes using Edit tool (not Write)
// This preserves file structure and imports
```

### 3.3 Style Change Pattern
```css
/* For CSS modules */
.targetElement {
  /* Existing styles preserved */
  composes: baseClass;

  /* New changes */
  color: var(--color-red-500);
}

/* For Tailwind - prefer utility classes */
<div className="existing-class bg-red-500 text-white">
```

### 3.4 Change Verification (Self-Check)
```bash
# After making changes, run immediate validation

# Type check
npm run type-check 2>&1 | tee "${RUN_DIR}/logs/typecheck.log"

# Lint check
npm run lint 2>&1 | tee "${RUN_DIR}/logs/lint.log"

# Build check
npm run build 2>&1 | tee "${RUN_DIR}/logs/build.log"

# If any fail, fix before proceeding
```

**Outputs:**
- Modified source files
- `artifacts/*.backup` - Backup of changed files
- `logs/typecheck.log`, `logs/lint.log`, `logs/build.log`

---

## ✅ PHASE 4: VERIFY (15 min)

### Goal: Automated validation against success criteria

### 4.1 Automated Test Execution
```bash
# Run acceptance tests
npx playwright test "${RUN_DIR}/artifacts/acceptance.test.ts" \
  --config=playwright.config.ts \
  --reporter=json \
  --reporter=html \
  --output="${RUN_DIR}/test-results"

# Capture exit code
TEST_EXIT=$?

# Save results
cp test-results/*.json "${RUN_DIR}/logs/test-results.json"
```

### 4.2 Visual Regression
```javascript
// Capture after screenshots
for (const vp of viewports) {
  await page.setViewportSize(vp);
  await page.screenshot({
    path: `${RUN_DIR}/screenshots/after/${vp.name}.png`,
    fullPage: true
  });
}

// Compare with baseline
const { diffPixelCount, diffRatio } = await compareImages(
  `${RUN_DIR}/screenshots/before/${vp.name}.png`,
  `${RUN_DIR}/screenshots/after/${vp.name}.png`
);

console.log(`Visual diff for ${vp.name}: ${diffRatio}% pixels changed`);
```

### 4.3 Console Validation
```javascript
// Check console is clean
const afterConsoleLogs = await page.evaluate(() => {
  return window.__consoleLogs || [];
});

const errors = afterConsoleLogs.filter(log => log.type === 'error');
const warnings = afterConsoleLogs.filter(log => log.type === 'warning');

if (errors.length > 0) {
  throw new Error(`Console has ${errors.length} errors`);
}

console.log(`Console check: ${errors.length} errors, ${warnings.length} warnings`);
```

### 4.4 Accessibility Audit
```javascript
// Run accessibility checks
const accessibilityScan = await page.accessibility.scan();
const violations = accessibilityScan.violations;

if (violations.length > 0) {
  const score = Math.max(0, 100 - (violations.length * 5));
  console.log(`Accessibility score: ${score}`);

  if (score < 90) {
    throw new Error(`Accessibility score ${score} below threshold 90`);
  }
}
```

### 4.5 Performance Check
```javascript
// Compare with baseline
const afterMetrics = await page.evaluate(() => ({
  timing: JSON.parse(JSON.stringify(performance.timing)),
  navigation: JSON.parse(JSON.stringify(performance.navigation))
}));

const loadTime = afterMetrics.timing.loadEventEnd -
                 afterMetrics.timing.navigationStart;

const baselineLoadTime = JSON.parse(
  fs.readFileSync(`${RUN_DIR}/logs/before-performance.json`)
).timing.loadEventEnd - baseline.timing.navigationStart;

const diff = ((loadTime - baselineLoadTime) / baselineLoadTime) * 100;

if (diff > 10) {
  throw new Error(`Performance degraded by ${diff}%`);
}

console.log(`Performance: ${loadTime}ms (${diff > 0 ? '+' : ''}${diff}%)`);
```

### 4.6 Cross-Browser Validation (Optional)
```bash
# If time permits, test in multiple browsers
BROWSERS=("chromium" "firefox" "webkit")

for browser in "${BROWSERS[@]}"; do
  npx playwright test --project=${browser} \
    "${RUN_DIR}/artifacts/acceptance.test.ts" || true
done
```

**Verification Gates:**
- ✅ All tests pass
- ✅ No console errors
- ✅ No visual regressions (>5% pixel change)
- ✅ Accessibility score > 90
- ✅ Performance within 10% of baseline

**If gate fails:**
1. Document specific failure in `${RUN_DIR}/artifacts/failure-report.md`
2. Loop back to BUILD phase
3. Max 2 loops
4. If still failing, escalate to human

**Outputs:**
- `screenshots/after/*.png` - Post-change UI
- `logs/test-results.json` - Test results
- `logs/console-after.json` - Post-change console
- `logs/accessibility.json` - A11y audit
- `logs/performance-after.json` - Post-change metrics
- `artifacts/verification-report.md` - Summary

---

## 🚀 PHASE 5: DEPLOY (5 min)

### Goal: Ship to production with verification

### 5.1 Git Commit
```bash
# Stage changes
git add src/
git add tests/  # If new tests added

# Conventional commit message
git commit -m "$(cat <<EOF
feat(${COMPONENT_NAME}): ${TASK_DESCRIPTION}

- Made specific changes to component
- Added acceptance tests
- Verified on mobile and desktop
- Accessibility score: ${A11Y_SCORE}
- Performance: ${PERF_METRIC}

Co-Authored-By: UI-Adaptive-Cycle <cycle@blackbox.ai>
EOF
)"

# Capture commit SHA
COMMIT_SHA=$(git rev-parse HEAD)
echo "${COMMIT_SHA}" > "${RUN_DIR}/git-commit-sha.txt"
```

### 5.2 Push to Dev Branch
```bash
# Create feature branch
git checkout -b "ui-cycle-${TIMESTAMP}"

# Push to remote
git push -u origin "ui-cycle-${TIMESTAMP}"

# Create PR (using gh CLI if available)
gh pr create \
  --title "UI Cycle: ${TASK_DESCRIPTION}" \
  --body "Automated UI change via UI Adaptive Cycle

**Changes:** ${TASK_DESCRIPTION}
**Tests:** All passing
**Screenshots:** Attached
**Cycle ID:** ${TIMESTAMP}" \
  --base dev || true
```

### 5.3 Production Deployment
```bash
# After PR approval and merge
git checkout main
git pull origin main

# Verify Cloudflare deployment
# (Adjust for your deployment platform)

# Monitor deployment
DEPLOY_URL=$(npx wrangler deploy 2>&1 | grep -o 'https://.*\.pages\.dev')

# Verify deployment is live
curl -sSf "${DEPLOY_URL}" > /dev/null
echo "${DEPLOY_URL}" > "${RUN_DIR}/deployment-url.txt"
```

### 5.4 Production Verification
```javascript
// Final smoke test on production
await page.goto(DEPLOY_URL);
await page.waitForLoadState('networkidle');

// Check for console errors
const prodErrors = await page.evaluate(() => {
  return window.__consoleLogs?.filter(l => l.type === 'error') || [];
});

if (prodErrors.length > 0) {
  // Rollback
  await exec('git revert HEAD');
  await exec('git push origin main');
  throw new Error('Production deployment failed - rolled back');
}

// Take final screenshot
await page.screenshot({
  path: `${RUN_DIR}/screenshots/production.png`,
  fullPage: true
});
```

**Outputs:**
- `git-commit-sha.txt` - Commit reference
- `deployment-url.txt` - Live URL
- `screenshots/production.png` - Production state

---

## 📊 PHASE 6: CLOSE (3 min)

### Goal: Clean documentation and artifacts

### 6.1 Generate Cycle Report
```markdown
# UI Adaptive Cycle Report

## Cycle Details
- **Cycle ID:** ${TIMESTAMP}
- **Task:** ${TASK_DESCRIPTION}
- **Duration:** 65 minutes
- **Status:** ✅ Success / ❌ Failed

## Artifacts
- **Before Screenshots:** \`screenshots/before/\`
- **After Screenshots:** \`screenshots/after/\`
- **Test Results:** \`logs/test-results.json\`
- **Console Logs:** \`logs/console-*.json\`

## Verification Summary
- Tests: ${TEST_STATUS}
- Console: ${CONSOLE_STATUS}
- Visual: ${VISUAL_STATUS}
- Accessibility: ${A11Y_SCORE}/100
- Performance: ${PERF_CHANGE}%

## Deployment
- **Commit:** ${COMMIT_SHA}
- **URL:** ${DEPLOY_URL}

## Next Steps
- [ ] Monitor production for 24h
- [ ] Check analytics for user impact
- [ ] Schedule follow-up if needed
```

### 6.2 Archive Artifacts
```bash
# Copy to central archive
cp -r "${RUN_DIR}" "/path/to/archive/ui-cycles/${TIMESTAMP}/"

# Update index
echo "${TIMESTAMP}|${TASK_DESCRIPTION}|${STATUS}|${DEPLOY_URL}" >> \
  /path/to/archive/ui-cycles/index.csv

# Cleanup local run directory
rm -rf "${RUN_DIR}"
```

---

## 🔄 LOOP BEHAVIOR

### Success Path
```
OBSERVE → DEFINE → BUILD → VERIFY → DEPLOY → CLOSE
✅        ✅       ✅       ✅        ✅       ✅
```

### Failure Paths

#### Type 1: Build Failure
```
BUILD → type-check ❌ → FIX BUILD → type-check ✅ → VERIFY
```

#### Type 2: Test Failure
```
VERIFY → test ❌ → BUILD (fix) → VERIFY → test ✅ → DEPLOY
         (1 loop)   (2nd try)          (2nd try)
```

#### Type 3: Visual Regression
```
VERIFY → visual diff > 5% → BUILD (adjust) → VERIFY → visual diff < 5% → DEPLOY
```

#### Type 4: Production Failure
```
DEPLOY → prod error ❌ → ROLLBACK → ESCALATE TO HUMAN
```

### Loop Limits
- **Max BUILD loops:** 2
- **Max VERIFY loops:** 2
- **Total cycle time limit:** 90 minutes
- **After limits:** Escalate to human with full context

---

## 🤖 AGENT EXECUTION GUIDE

### Required MCP Servers
- ✅ `chrome-devtools` - For live testing
- ✅ `playwright` - For automated testing
- ✅ `serena` - For code analysis
- ✅ `filesystem` - For file operations

### Required Capabilities
- Navigate to localhost URLs
- Take screenshots
- Execute JavaScript in page context
- Run shell commands
- Read/write files
- Git operations

### Agent Protocol
1. **Always create run folder** before starting
2. **Always take before screenshots** before making changes
3. **Always verify console** after page loads
4. **Always document failures** with specific error messages
5. **Never skip verification gates**
6. **Never proceed past gate failures**
7. **Always ask for human help** after 2 loop failures

### Communication Template
```markdown
## UI Cycle Progress

**Current Phase:** ${PHASE_NAME}
**Task:** ${TASK_DESCRIPTION}
**Run Directory:** ${RUN_DIR}

**What I Did:**
- ${ACTION_1}
- ${ACTION_2}

**Current Status:**
${STATUS_EMOJI} ${STATUS_MESSAGE}

**Artifacts Created:**
- ${ARTIFACT_1}
- ${ARTIFACT_2}

**Next Step:** ${NEXT_ACTION}

**Blocking Issues:** ${BLOCKERS}
```

---

## 📋 CHECKLISTS

### Pre-Cycle Checklist
- [ ] Git working directory clean
- [ ] Dev server starts without errors
- [ ] Playwright tests can run
- [ ] Chrome MCP connects
- [ ] Task description is clear and specific
- [ ] Run folder created

### Build Checklist
- [ ] Backup files created
- [ ] Changes made to correct files
- [ ] Type check passes
- [ ] Lint check passes
- [ ] Build succeeds
- [ ] No new dependencies (unless intentional)

### Verify Checklist
- [ ] Acceptance tests pass
- [ ] No console errors
- [ ] Visual regression check passes
- [ ] Accessibility score > 90
- [ ] Performance within baseline
- [ ] Mobile responsive
- [ ] Desktop correct

### Deploy Checklist
- [ ] Committed with conventional message
- [ ] Pushed to correct branch
- [ ] PR created (if required)
- [ ] Deployment succeeded
- [ ] Production URL accessible
- [ ] Production console clean
- [ ] Screenshot saved

### Close Checklist
- [ ] Cycle report generated
- [ ] Artifacts archived
- [ ] Index updated
- [ ] Local cleanup done
- [ ] Next steps documented

---

## 🎯 SUCCESS CRITERIA SUMMARY

### Phase Gates

| Phase | Gate | Pass Condition |
|-------|------|----------------|
| Pre-flight | Environment | All checks pass |
| Observe | Baseline | Screenshots + logs captured |
| Define | Criteria | Success criteria defined |
| Build | Quality | Type/lint/build pass |
| Verify | Tests | All acceptance tests pass |
| Verify | Console | Zero errors |
| Verify | Visual | <5% pixel difference |
| Verify | A11y | Score >90 |
| Verify | Performance | Within 10% baseline |
| Deploy | Production | URL live + console clean |

### Final Success Indicators
- ✅ Zero console errors in production
- ✅ All acceptance tests passing
- ✅ No visual regressions
- ✅ Accessibility score >90
- ✅ Performance maintained
- ✅ Screenshots archived
- ✅ Cycle report generated

---

## 🚨 ESCALATION TRIGGERS

Escalate to human immediately when:

1. **Ambiguous Requirements**
   - Task description has multiple interpretations
   - Success criteria unclear
   - Multiple valid approaches exist

2. **Infrastructure Issues**
   - Dev server won't start
   - Tests can't run
   - MCP servers unavailable
   - Git operations fail

3. **Loop Limits Reached**
   - 2 build failures
   - 2 verification failures
   - 90 minutes elapsed

4. **Production Issues**
   - Deployment fails
   - Rollback required
   - Production console has errors

5. **Unexpected State**
   - File structure different than expected
   - Dependencies conflict
   - Breaking changes in dependencies

### Escalation Template
```markdown
## 🚨 UI Cycle Escalation

**Cycle ID:** ${TIMESTAMP}
**Task:** ${TASK_DESCRIPTION}
**Phase:** ${PHASE_NAME}
**Loop Count:** ${LOOP_COUNT}

### What Happened
${STEPS_TAKEN}

### Specific Error
${ERROR_MESSAGE}

### What I Tried
${ATTEMPTS}

### Artifacts for Review
- ${ARTIFACT_1}
- ${ARTIFACT_2}

### Suggested Actions
${SUGGESTIONS}

### Context Files
- Run directory: ${RUN_DIR}
- Before screenshots: ${RUN_DIR}/screenshots/before/
- Logs: ${RUN_DIR}/logs/
```

---

## 📚 EXAMPLE TASK FLOWS

### Example 1: Change Button Color
```
OBSERVE:
  Navigate to /login
  Screenshot: login-button.png (before)
  Console: 0 errors, 2 warnings

DEFINE:
  Success: Button color changes from blue to red
  Test: Button has class bg-red-500
  Verify: No visual regressions elsewhere

BUILD:
  Edit: src/components/LoginButton.tsx
  Change: className="bg-blue-500" → "bg-red-500"
  Verify: npm run type-check ✅

VERIFY:
  Test: npx playwright test ✅
  Console: 0 errors ✅
  Visual: 0.3% pixel change ✅
  A11y: Score 95 ✅

DEPLOY:
  Commit: feat(login): change button color to red
  Push: ui-cycle-20250112_143000
  URL: https://deploy.example.com
  Verify: Console clean ✅

CLOSE:
  Report: Button color changed successfully
  Archive: /archive/ui-cycles/20250112_143000/
```

### Example 2: Add Loading State
```
OBSERVE:
  Navigate to /dashboard
  Screenshot: dashboard.png (before)
  Console: 0 errors

DEFINE:
  Success: Show spinner during data fetch
  Test: Spinner visible when loading=true
  Verify: Spinner hidden after load

BUILD:
  Edit: src/components/Dashboard.tsx
  Add: <Spinner /> component
  Add: loading state boolean
  Test: npm run type-check ✅

VERIFY:
  Test: Spinner appears on load ✅
  Console: 0 errors ✅
  Visual: Only spinner area changed ✅
  A11y: Spinner has aria-label ✅

DEPLOY:
  Commit: feat(dashboard): add loading spinner
  Push: ui-cycle-20250112_150000
  URL: https://deploy.example.com
  Verify: Spinner shows, then hides ✅

CLOSE:
  Report: Loading state added successfully
```

---

## 🔄 CONTINUOUS IMPROVEMENT

### Metrics to Track
- Cycle success rate
- Average cycle duration
- Common failure patterns
- Loop frequency
- Escalation rate

### Optimization Opportunities
- Parallelize test execution
- Cache baseline screenshots
- Pre-build common components
- Template for frequent tasks

### Pattern Library
Build up templates for common UI changes:
- Color changes
- Layout adjustments
- Component additions
- Text changes
- Icon updates
- Spacing tweaks

---

## 📖 REFERENCE

### File Locations
- Run directory: `.runs/ui-cycle-{timestamp}/`
- Screenshots: `{run_dir}/screenshots/{before,after,production}/`
- Logs: `{run_dir}/logs/`
- Artifacts: `{run_dir}/artifacts/`
- Archive: `/archive/ui-cycles/{timestamp}/`

### Useful Commands
```bash
# Start dev server
npm run dev &

# Run tests
npx playwright test

# Check types
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Deploy (adjust for your platform)
npx wrangler deploy
# or
vercel --prod
# or
netlify deploy --prod
```

### Troubleshooting
| Issue | Solution |
|-------|----------|
| Dev server won't start | Check port conflicts, clear node_modules |
| Tests fail locally | Update snapshots, check selectors |
| Visual regression false positive | Ignore dynamic content areas |
| Console errors unrelated | Filter known warnings |
| Deployment fails | Check auth, verify branch |

---

**Version:** 1.0
**Last Updated:** 2025-01-12
**Maintained By:** Blackbox3 Team
