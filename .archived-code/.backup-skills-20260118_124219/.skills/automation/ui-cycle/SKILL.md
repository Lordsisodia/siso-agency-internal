# Skill: UI Adaptive Development Cycle

## Purpose
Execute autonomous UI development changes through a rigorous 6-phase cycle: Observe → Define → Build → Verify → Deploy → Close. Each UI change is baseline-captured, tested, validated, and deployed with full artifact trails.

## Trigger (when to use)
- You need to make a UI change (color, layout, text, spacing, component)
- You want to deploy UI changes with automated testing
- You need visual regression protection
- You require accessibility validation (score >90)
- You want production deployment with rollback safety

## Goal
Complete UI changes autonomously with:
- Zero console errors in production
- No visual regressions (<5% pixel change)
- Accessibility score >90
- Performance within 10% of baseline
- Full artifact trail for every change

## Capabilities Required
- Chrome DevTools MCP (screenshots, console, navigation)
- Playwright MCP (automated testing, visual regression)
- Serena MCP (code analysis, component search)
- Filesystem MCP (artifact management)
- Git operations (commit, push, branch)

## Inputs to Collect
- **Task Description:** What UI change to make (one line)
- **Target URL:** Where to test the change (e.g., localhost:3000, https://example.com)
- **Component Name:** Which component to modify (e.g., LoginButton.tsx)
- **Change Type:** color | layout | text | spacing | component | other

## Artifacts Produced
```
.runs/ui-cycle-{timestamp}/
├── artifacts/
│   ├── success-criteria.md          # Success checklist
│   ├── acceptance.test.ts            # Automated test
│   ├── verification-report.md        # Test results
│   └── *.backup                      # File backups
├── screenshots/
│   ├── before/                       # Baseline (mobile, tablet, desktop)
│   ├── after/                        # Post-change
│   └── production.png                # Live verification
├── logs/
│   ├── before-console.json           # Baseline console
│   ├── after-console.json            # Post-change console
│   ├── test-results.json             # Playwright results
│   ├── accessibility.json            # A11y audit
│   └── performance-*.json            # Metrics
├── cycle.json                        # Cycle metadata
├── git-commit-sha.txt                # Commit reference
└── deployment-url.txt                # Live URL
```

## Step-by-Step Framework

### Phase 0: Pre-Flight (2 min)

**Objective:** Validate environment before starting

**Checklist:**
```bash
# 1. Git must be clean
git status --porcelain
# Expected: No output

# 2. Dev server must start
npm run dev &
# Expected: Server starts without errors

# 3. Create run directory
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RUN_DIR=".runs/ui-cycle-${TIMESTAMP}"
mkdir -p "${RUN_DIR}/artifacts"
mkdir -p "${RUN_DIR}/screenshots/before"
mkdir -p "${RUN_DIR}/screenshots/after"
mkdir -p "${RUN_DIR}/logs"

# 4. Save cycle metadata
cat > "${RUN_DIR}/cycle.json" <<EOF
{
  "cycle_id": "${TIMESTAMP}",
  "started_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "task": "${TASK_DESCRIPTION}",
  "url": "${TARGET_URL}",
  "component": "${COMPONENT_NAME}"
}
EOF
```

**Gates:**
- ✅ Git working directory clean
- ✅ Dev server starts without errors
- ✅ Run directory created
- ✅ Cycle metadata saved

**If gate fails:** Stop and report specific blocker.

---

### Phase 1: Observe (5 min)

**Objective:** Capture baseline state before changes

**Steps:**

1. **Navigate to target URL**
   ```javascript
   // Using Chrome DevTools MCP or Playwright
   await page.goto(TARGET_URL);
   await page.waitForLoadState('networkidle');
   ```

2. **Capture baseline screenshots** (3 viewports)
   ```javascript
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

3. **Capture console baseline**
   ```javascript
   await page.evaluate(() => console.clear());
   const consoleLogs = [];

   page.on('console', msg => {
     consoleLogs.push({
       type: msg.type(),
       text: msg.text(),
       location: msg.location()
     });
   });

   // Save to file
   fs.writeFileSync(
     `${RUN_DIR}/logs/before-console.json`,
     JSON.stringify(consoleLogs, null, 2)
   );
   ```

4. **Capture performance baseline**
   ```javascript
   const perfMetrics = await page.evaluate(() => ({
     timing: JSON.parse(JSON.stringify(performance.timing)),
     navigation: JSON.parse(JSON.stringify(performance.navigation))
   }));

   fs.writeFileSync(
     `${RUN_DIR}/logs/before-performance.json`,
     JSON.stringify(perfMetrics, null, 2)
   );
   ```

5. **Inspect target component**
   ```bash
   # Find component files using Serena or grep
   grep -r "export.*${COMPONENT_NAME}" src/components --include="*.tsx" -l

   # Document component structure
   # Save to: ${RUN_DIR}/artifacts/component-map.md
   ```

**Artifacts:**
- `screenshots/before/{mobile,tablet,desktop}.png`
- `logs/before-console.json`
- `logs/before-performance.json`
- `artifacts/component-map.md`

---

### Phase 2: Define (10 min)

**Objective:** Create unambiguous success criteria

**Steps:**

1. **Write success criteria**
   ```markdown
   # Success Criteria: ${TASK_DESCRIPTION}

   ## Must-Have (Blocking Failures)
   - [ ] No console errors after changes
   - [ ] No visual regressions on mobile/desktop
   - [ ] ${COMPONENT_NAME} renders correctly
   - [ ] Existing functionality preserved

   ## Should-Have (Quality Gates)
   - [ ] Accessibility score > 90
   - [ ] Touch targets >= 44x44px (mobile)
   - [ ] Text contrast >= WCAG AA
   - [ ] Performance within 10% of baseline

   ## Test Approach
   - Navigate to: ${TARGET_URL}
   - Find element: ${SELECTOR}
   - Verify: ${VERIFICATION}
   ```

2. **Generate acceptance test**
   ```typescript
   // File: ${RUN_DIR}/artifacts/acceptance.test.ts
   import { test, expect } from '@playwright/test';

   test.describe('${TASK_DESCRIPTION}', () => {
     const viewports = [
       { name: 'mobile', width: 375, height: 667 },
       { name: 'desktop', width: 1920, height: 1080 }
     ];

     viewports.forEach(vp => {
       test.use({ viewport: vp.width, viewportHeight: vp.height });

       test(`validates on ${vp.name}`, async ({ page }) => {
         await page.goto('${TARGET_URL}');

         // TODO: Add specific assertions
         // Example:
         // await expect(page.locator('[data-testid="target"]')).toBeVisible();
         // await expect(page).toHaveNoConsoleErrors();
       });
     });
   });
   ```

**Artifacts:**
- `artifacts/success-criteria.md`
- `artifacts/acceptance.test.ts`

---

### Phase 3: Build (30 min)

**Objective:** Make minimal, targeted changes

**Rules:**
- ONE file type per batch (component OR style OR test)
- Use Edit tool (not Write) to preserve structure
- Create backups before modifying
- Verify with type-check, lint, build

**Steps:**

1. **Backup files to modify**
   ```bash
   cp src/components/${COMPONENT_NAME}.tsx \
      ${RUN_DIR}/artifacts/${COMPONENT_NAME}.tsx.backup
   ```

2. **Make surgical changes** using Edit tool
   - Locate the exact lines to change
   - Use Edit with precise old_string/new_string
   - Preserve file structure and imports

3. **Verify changes** (run all 3 checks)
   ```bash
   # Type check
   npm run type-check 2>&1 | tee ${RUN_DIR}/logs/typecheck.log

   # Lint
   npm run lint 2>&1 | tee ${RUN_DIR}/logs/lint.log

   # Build
   npm run build 2>&1 | tee ${RUN_DIR}/logs/build.log
   ```

**Build Gates:**
- ✅ `npm run type-check` passes (exit code 0)
- ✅ `npm run lint` passes (exit code 0)
- ✅ `npm run build` succeeds (exit code 0)

**Loop Behavior:**
- If any gate fails → Fix → Retry (max 2 build loops)
- Track loops: `build_loops = current + 1`

**Artifacts:**
- Modified source files
- `artifacts/*.backup`
- `logs/typecheck.log`
- `logs/lint.log`
- `logs/build.log`

**Common Patterns:**

| Pattern | Example | Test |
|---------|---------|------|
| Change Color | `bg-blue-500` → `bg-red-500` | Element has `bg-red-500` class |
| Change Text | `"Submit"` → `"Send"` | Text content is `"Send"` |
| Adjust Spacing | `padding: 1rem` → `padding: 2rem` | Spacing increased visually |
| Hide/Show | Add conditional className | Element visibility matches condition |
| Add Component | Insert new JSX | Component renders correctly |

---

### Phase 4: Verify (15 min)

**Objective:** Automated validation against success criteria

**Steps:**

1. **Run acceptance tests**
   ```bash
   npx playwright test ${RUN_DIR}/artifacts/acceptance.test.ts \
     --config=playwright.config.ts \
     --reporter=json \
     --output=${RUN_DIR}/test-results

   TEST_EXIT=$?
   cp test-results/*.json ${RUN_DIR}/logs/test-results.json
   ```

2. **Capture after screenshots** (same viewports)
   ```javascript
   for (const vp of viewports) {
     await page.setViewportSize(vp);
     await page.screenshot({
       path: `${RUN_DIR}/screenshots/after/${vp.name}.png`,
       fullPage: true
     });
   }
   ```

3. **Visual regression check**
   ```javascript
   // Compare before/after screenshots
   const { diffPixelCount, diffRatio } = await compareImages(
     `${RUN_DIR}/screenshots/before/desktop.png`,
     `${RUN_DIR}/screenshots/after/desktop.png`
   );

   console.log(`Visual diff: ${diffRatio * 100}% pixels changed`);

   if (diffRatio > 0.05) {
     throw new Error(`Visual regression ${diffRatio * 100}% > 5% threshold`);
   }
   ```

4. **Console validation**
   ```javascript
   const afterConsoleLogs = await page.evaluate(() => {
     return window.__consoleLogs || [];
   });

   const errors = afterConsoleLogs.filter(log => log.type === 'error');

   if (errors.length > 0) {
     throw new Error(`Console has ${errors.length} errors`);
   }

   console.log(`Console check: ${errors.length} errors`);
   ```

5. **Accessibility audit**
   ```javascript
   const a11yScan = await page.accessibility.scan();
   const violations = a11yScan.violations;

   const score = Math.max(0, 100 - (violations.length * 5));
   console.log(`Accessibility score: ${score}`);

   if (score < 90) {
     throw new Error(`Accessibility score ${score} below threshold 90`);
   }
   ```

6. **Performance check**
   ```javascript
   const afterMetrics = await page.evaluate(() => ({
     timing: JSON.parse(JSON.stringify(performance.timing))
   }));

   const beforeMetrics = JSON.parse(
     fs.readFileSync(`${RUN_DIR}/logs/before-performance.json`)
   );

   const beforeLoad = beforeMetrics.timing.loadEventEnd -
                      beforeMetrics.timing.navigationStart;
   const afterLoad = afterMetrics.timing.loadEventEnd -
                     afterMetrics.timing.navigationStart;

   const perfDiff = (afterLoad - beforeLoad) / beforeLoad;

   if (perfDiff > 0.10) {
     throw new Error(`Performance degraded by ${perfDiff * 100}%`);
   }

   console.log(`Performance: ${afterLoad}ms (${perfDiff > 0 ? '+' : ''}${perfDiff * 100}%)`);
   ```

**Verification Gates:**
- ✅ All tests pass (`TEST_EXIT == 0`)
- ✅ Zero console errors
- ✅ Visual diff < 5%
- ✅ A11y score > 90
- ✅ Performance within 10% baseline

**Loop Behavior:**
- If any gate fails → Loop back to BUILD phase
- Max 2 verify loops
- Track loops: `verify_loops = current + 1`
- If still failing after 2 loops → Escalate to human

**Artifacts:**
- `screenshots/after/{mobile,tablet,desktop}.png`
- `logs/test-results.json`
- `logs/after-console.json`
- `logs/accessibility.json`
- `logs/after-performance.json`
- `artifacts/verification-report.md`

---

### Phase 5: Deploy (5 min)

**Objective:** Ship to production with verification

**Steps:**

1. **Commit changes**
   ```bash
   git add src/

   git commit -m "feat(${COMPONENT_NAME}): ${TASK_DESCRIPTION}

   - Made specific changes to ${COMPONENT_NAME}
   - Added acceptance tests
   - Verified on mobile and desktop
   - Accessibility score: ${A11Y_SCORE}
   - Performance: ${PERF_METRIC}

   Co-Authored-By: UI-Adaptive-Cycle <cycle@blackbox.ai>"

   COMMIT_SHA=$(git rev-parse HEAD)
   echo "${COMMIT_SHA}" > ${RUN_DIR}/git-commit-sha.txt
   ```

2. **Create feature branch and push**
   ```bash
   git checkout -b ui-cycle-${TIMESTAMP}
   git push -u origin ui-cycle-${TIMESTAMP}

   # Create PR (if gh CLI available)
   gh pr create \
     --title "UI Cycle: ${TASK_DESCRIPTION}" \
     --body "Automated UI change via UI Adaptive Cycle

   **Changes:** ${TASK_DESCRIPTION}
   **Tests:** All passing
   **Screenshots:** See artifacts
   **Cycle ID:** ${TIMESTAMP}" \
     || true  # Don't fail if gh CLI not available
   ```

3. **Deploy to production** (adjust for your platform)
   ```bash
   # Cloudflare Workers
   DEPLOY_URL=$(npx wrangler deploy 2>&1 | grep -o 'https://.*\.pages\.dev')

   # OR Vercel
   # DEPLOY_URL=$(vercel --prod 2>&1 | grep -o 'https://.*\.vercel\.app')

   # OR Netlify
   # DEPLOY_URL=$(netlify deploy --prod 2>&1 | grep -o 'https://.*\.netlify\.app')

   echo "${DEPLOY_URL}" > ${RUN_DIR}/deployment-url.txt
   ```

4. **Production verification**
   ```javascript
   await page.goto(DEPLOY_URL);
   await page.waitForLoadState('networkidle');

   // Check console
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

**Artifacts:**
- `git-commit-sha.txt`
- `deployment-url.txt`
- `screenshots/production.png`

---

### Phase 6: Close (3 min)

**Objective:** Archive artifacts and generate report

**Steps:**

1. **Generate cycle report**
   ```markdown
   # UI Adaptive Cycle Report

   ## Cycle Details
   - **Cycle ID:** ${TIMESTAMP}
   - **Task:** ${TASK_DESCRIPTION}
   - **Component:** ${COMPONENT_NAME}
   - **Duration:** ${DURATION_MINUTES} minutes
   - **Status:** ✅ Success / ❌ Failed

   ## Artifacts
   - **Before Screenshots:** \`${RUN_DIR}/screenshots/before/\`
   - **After Screenshots:** \`${RUN_DIR}/screenshots/after/\`
   - **Test Results:** \`${RUN_DIR}/logs/test-results.json\`
   - **Console Logs:** \`${RUN_DIR}/logs/console-*.json\`

   ## Verification Summary
   - **Tests:** ${TEST_STATUS}
   - **Console:** ${CONSOLE_STATUS}
   - **Visual:** ${VISUAL_STATUS}
   - **Accessibility:** ${A11Y_SCORE}/100
   - **Performance:** ${PERF_CHANGE}%

   ## Deployment
   - **Commit:** ${COMMIT_SHA}
   - **URL:** ${DEPLOY_URL}

   ## Next Steps
   - [ ] Monitor production for 24h
   - [ ] Check analytics for user impact
   - [ ] Schedule follow-up if needed
   ```

2. **Archive artifacts**
   ```bash
   # Copy to central archive
   ARCHIVE_DIR="/archive/ui-cycles/${TIMESTAMP}"
   mkdir -p "${ARCHIVE_DIR}"
   cp -r "${RUN_DIR}"/* "${ARCHIVE_DIR}/"

   # Update index
   echo "${TIMESTAMP}|${TASK_DESCRIPTION}|${STATUS}|${DEPLOY_URL}" >> \
     /archive/ui-cycles/index.csv

   # Cleanup local
   rm -rf "${RUN_DIR}"
   ```

**Artifacts:**
- Cycle report (markdown)
- Archived artifacts in `/archive/ui-cycles/${TIMESTAMP}/`
- Updated index in `/archive/ui-cycles/index.csv`

---

## Loop Limits & Escalation

**Track loops:**
```yaml
loops:
  build: 0/2
  verify: 0/2
```

**Escalate when:**
- Build loops reach 2
- Verify loops reach 2
- Total time exceeds 90 minutes
- Production deployment fails

**Escalation Template:**
```markdown
## 🚨 UI Cycle Escalation

**Cycle ID:** ${TIMESTAMP}
**Task:** ${TASK_DESCRIPTION}
**Phase:** ${CURRENT_PHASE}
**Loop Count:** ${LOOP_COUNT}/2

### What Happened
${STEPS_TAKEN}

### Specific Error
${ERROR_MESSAGE}

### What I Tried
${ATTEMPTS}

### Artifacts for Review
- ${RUN_DIR}/screenshots/before/
- ${RUN_DIR}/screenshots/after/
- ${RUN_DIR}/logs/

### Suggested Actions
${SUGGESTIONS}
```

---

## Success Criteria Summary

### All Gates Must Pass:
| Phase | Gate | Pass Condition |
|-------|------|---------------|
| Pre-flight | Git Clean | No uncommitted changes |
| Pre-flight | Dev Server | Starts without errors |
| Build | Type Check | `npm run type-check` exits 0 |
| Build | Lint | `npm run lint` exits 0 |
| Build | Build | `npm run build` exits 0 |
| Verify | Tests | All acceptance tests pass |
| Verify | Console | Zero errors |
| Verify | Visual | <5% pixel difference |
| Verify | A11y | Score >90 |
| Verify | Performance | Within 10% baseline |
| Deploy | Production | URL accessible, console clean |

---

## Progress Report Format

Update after each phase:

```markdown
## UI Cycle Progress - ${PHASE}

**Task:** ${TASK_DESCRIPTION}
**Status:** ${EMOJI} ${STATUS_MESSAGE}
**Run Directory:** ${RUN_DIR}

**Done:**
- ✅ ${COMPLETED_ACTION_1}
- ✅ ${COMPLETED_ACTION_2}

**Artifacts:**
- ${RUN_DIR}/screenshots/before/*.png
- ${RUN_DIR}/logs/console.json

**Next:** ${NEXT_ACTION}

**Blocking Issues:** ${BLOCKERS}
```

---

## Quick Reference Commands

```bash
# Pre-flight
git status --porcelain
npm run dev &

# Screenshots (using Chrome MCP)
# Navigate to URL, take screenshot

# Console check (using Chrome MCP)
# Get console logs

# Tests
npx playwright test

# Type check
npm run type-check

# Lint
npm run lint

# Commit
git add src/
git commit -m "feat(scope): description"
git push

# Deploy (platform-specific)
npx wrangler deploy  # Cloudflare
vercel --prod         # Vercel
netlify deploy --prod # Netlify
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Dev server won't start | Check port conflicts, clear node_modules |
| Tests fail locally | Update snapshots, check selectors |
| Visual regression false positive | Ignore dynamic content areas |
| Console errors unrelated | Filter known warnings |
| Deployment fails | Check auth, verify branch |
| Production console has errors | Rollback immediately: `git revert HEAD` |

---

## Done Checklist

At cycle completion:
- [ ] All 6 phases completed
- [ ] All verification gates passed
- [ ] Production deployed and verified
- [ ] Cycle report generated
- [ ] Artifacts archived
- [ ] Index updated
- [ ] Local directory cleaned

---

**Reference:** `../UI-ADAPTIVE-DEV-CYCLE.md` (full specification)
