---
name: ui-cycle
category: collaboration-communication/automation
version: 1.0.0
description: Execute autonomous UI development changes through a rigorous 6-phase cycle
author: obra/superpowers
verified: true
tags: [ui, automation, testing, deployment, visual-regression, accessibility]
---

# Skill: UI Adaptive Development Cycle

<context>
<purpose>
Execute autonomous UI development changes through a rigorous 6-phase cycle:
Observe → Define → Build → Verify → Deploy → Close.

Each UI change is baseline-captured, tested, validated, and deployed with full artifact trails.
</purpose>

<trigger>
- You need to make a UI change (color, layout, text, spacing, component)
- You want to deploy UI changes with automated testing
- You need visual regression protection
- You require accessibility validation (score >90)
- You want production deployment with rollback safety
</trigger>

<goal>
Complete UI changes autonomously with:
- Zero console errors in production
- No visual regressions (<5% pixel change)
- Accessibility score >90
- Performance within 10% of baseline
- Full artifact trail for every change
</goal>

<capabilities_required>
- Chrome DevTools MCP (screenshots, console, navigation)
- Playwright MCP (automated testing, visual regression)
- Serena MCP (code analysis, component search)
- Filesystem MCP (artifact management)
- Git operations (commit, push, branch)
</capabilities_required>

<inputs_to_collect>
- **Task Description:** What UI change to make (one line)
- **Target URL:** Where to test the change (e.g., localhost:3000, https://example.com)
- **Component Name:** Which component to modify (e.g., LoginButton.tsx)
- **Change Type:** color | layout | text | spacing | component | other
</inputs_to_collect>

<artifacts_produced>
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
</artifacts_produced>
</context>

<instructions>
<workflow>
<phase name="Pre-Flight" duration="2 min">
<objective>
Validate environment before starting
</objective>

<checklist>
<item>
<command>git status --porcelain</command>
<expected>No output (clean working directory)</expected>
</item>
<item>
<command>npm run dev &</command>
<expected>Server starts without errors</expected>
</item>
<item>
<commands>
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RUN_DIR=".runs/ui-cycle-${TIMESTAMP}"
mkdir -p "${RUN_DIR}/artifacts"
mkdir -p "${RUN_DIR}/screenshots/before"
mkdir -p "${RUN_DIR}/screenshots/after"
mkdir -p "${RUN_DIR}/logs"
</commands>
</item>
<item>
<commands>
cat > "${RUN_DIR}/cycle.json" <<EOF
{
  "cycle_id": "${TIMESTAMP}",
  "started_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "task": "${TASK_DESCRIPTION}",
  "url": "${TARGET_URL}",
  "component": "${COMPONENT_NAME}"
}
EOF
</commands>
</item>
</checklist>

<gates>
✅ Git working directory clean
✅ Dev server starts without errors
✅ Run directory created
✅ Cycle metadata saved
</gates>

<failure>
If gate fails: Stop and report specific blocker
</failure>
</phase>

<phase name="Observe" duration="5 min">
<objective>
Capture baseline state before changes
</objective>

<steps>
<step name="Navigate to target">
<commands>
await page.goto(TARGET_URL);
await page.waitForLoadState('networkidle');
</commands>
</step>

<step name="Capture baseline screenshots">
<commands>
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
</commands>
</step>

<step name="Capture console baseline">
<commands>
await page.evaluate(() => console.clear());
const consoleLogs = [];

page.on('console', msg => {
  consoleLogs.push({
    type: msg.type(),
    text: msg.text(),
    location: msg.location()
  });
});

fs.writeFileSync(
  `${RUN_DIR}/logs/before-console.json`,
  JSON.stringify(consoleLogs, null, 2)
);
</commands>
</step>

<step name="Capture performance baseline">
<commands>
const perfMetrics = await page.evaluate(() => ({
  timing: JSON.parse(JSON.stringify(performance.timing)),
  navigation: JSON.parse(JSON.stringify(performance.navigation))
}));

fs.writeFileSync(
  `${RUN_DIR}/logs/before-performance.json`,
  JSON.stringify(perfMetrics, null, 2)
);
</commands>
</step>

<step name="Inspect target component">
<commands>
grep -r "export.*${COMPONENT_NAME}" src/components --include="*.tsx" -l
# Document component structure
# Save to: ${RUN_DIR}/artifacts/component-map.md
</commands>
</step>
</steps>

<artifacts>
- `screenshots/before/{mobile,tablet,desktop}.png`
- `logs/before-console.json`
- `logs/before-performance.json`
- `artifacts/component-map.md`
</artifacts>
</phase>

<phase name="Define" duration="10 min">
<objective>
Create unambiguous success criteria
</objective>

<steps>
<step name="Write success criteria">
<output_file>artifacts/success-criteria.md</output_file>
<content>
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
</content>
</step>

<step name="Generate acceptance test">
<output_file>artifacts/acceptance.test.ts</output_file>
<content>
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
    });
  });
});
</content>
</step>
</steps>

<artifacts>
- `artifacts/success-criteria.md`
- `artifacts/acceptance.test.ts`
</artifacts>
</phase>

<phase name="Build" duration="30 min">
<objective>
Make minimal, targeted changes
</objective>

<rules>
- ONE file type per batch (component OR style OR test)
- Use Edit tool (not Write) to preserve structure
- Create backups before modifying
- Verify with type-check, lint, build
</rules>

<steps>
<step name="Backup files">
<commands>
cp src/components/${COMPONENT_NAME}.tsx \
   ${RUN_DIR}/artifacts/${COMPONENT_NAME}.tsx.backup
</commands>
</step>

<step name="Make surgical changes">
<instructions>
- Locate the exact lines to change
- Use Edit with precise old_string/new_string
- Preserve file structure and imports
</instructions>
</step>

<step name="Verify changes">
<commands>
# Type check
npm run type-check 2>&1 | tee ${RUN_DIR}/logs/typecheck.log

# Lint
npm run lint 2>&1 | tee ${RUN_DIR}/logs/lint.log

# Build
npm run build 2>&1 | tee ${RUN_DIR}/logs/build.log
</commands>
</step>
</steps>

<gates>
✅ `npm run type-check` passes (exit code 0)
✅ `npm run lint` passes (exit code 0)
✅ `npm run build` succeeds (exit code 0)
</gates>

<loop_behavior>
If any gate fails → Fix → Retry (max 2 build loops)
Track loops: `build_loops = current + 1`
</loop_behavior>

<artifacts>
- Modified source files
- `artifacts/*.backup`
- `logs/typecheck.log`
- `logs/lint.log`
- `logs/build.log`
</artifacts>

<patterns>
<pattern name="Change Color">
<example>bg-blue-500 → bg-red-500</example>
<test>Element has bg-red-500 class</test>
</pattern>
<pattern name="Change Text">
<example>"Submit" → "Send"</example>
<test>Text content is "Send"</test>
</pattern>
<pattern name="Adjust Spacing">
<example>padding: 1rem → padding: 2rem</example>
<test>Spacing increased visually</test>
</pattern>
<pattern name="Hide/Show">
<example>Add conditional className</example>
<test>Element visibility matches condition</test>
</pattern>
<pattern name="Add Component">
<example>Insert new JSX</example>
<test>Component renders correctly</test>
</pattern>
</patterns>
</phase>

<phase name="Verify" duration="15 min">
<objective>
Automated validation against success criteria
</objective>

<steps>
<step name="Run acceptance tests">
<commands>
npx playwright test ${RUN_DIR}/artifacts/acceptance.test.ts \
  --config=playwright.config.ts \
  --reporter=json \
  --output=${RUN_DIR}/test-results

TEST_EXIT=$?
cp test-results/*.json ${RUN_DIR}/logs/test-results.json
</commands>
</step>

<step name="Capture after screenshots">
<commands>
for (const vp of viewports) {
  await page.setViewportSize(vp);
  await page.screenshot({
    path: `${RUN_DIR}/screenshots/after/${vp.name}.png`,
    fullPage: true
  });
}
</commands>
</step>

<step name="Visual regression check">
<commands>
const { diffPixelCount, diffRatio } = await compareImages(
  `${RUN_DIR}/screenshots/before/desktop.png`,
  `${RUN_DIR}/screenshots/after/desktop.png`
);

if (diffRatio > 0.05) {
  throw new Error(`Visual regression ${diffRatio * 100}% > 5% threshold`);
}
</commands>
</step>

<step name="Console validation">
<commands>
const errors = afterConsoleLogs.filter(log => log.type === 'error');

if (errors.length > 0) {
  throw new Error(`Console has ${errors.length} errors`);
}
</commands>
</step>

<step name="Accessibility audit">
<commands>
const a11yScan = await page.accessibility.scan();
const score = Math.max(0, 100 - (a11yScan.violations.length * 5));

if (score < 90) {
  throw new Error(`Accessibility score ${score} below threshold 90`);
}
</commands>
</step>

<step name="Performance check">
<commands>
const perfDiff = (afterLoad - beforeLoad) / beforeLoad;

if (perfDiff > 0.10) {
  throw new Error(`Performance degraded by ${perfDiff * 100}%`);
}
</commands>
</step>
</steps>

<gates>
✅ All tests pass (TEST_EXIT == 0)
✅ Zero console errors
✅ Visual diff < 5%
✅ A11y score > 90
✅ Performance within 10% baseline
</gates>

<loop_behavior>
If any gate fails → Loop back to BUILD phase
Max 2 verify loops
If still failing after 2 loops → Escalate to human
</loop_behavior>

<artifacts>
- `screenshots/after/{mobile,tablet,desktop}.png`
- `logs/test-results.json`
- `logs/after-console.json`
- `logs/accessibility.json`
- `logs/after-performance.json`
- `artifacts/verification-report.md`
</artifacts>
</phase>

<phase name="Deploy" duration="5 min">
<objective>
Ship to production with verification
</objective>

<steps>
<step name="Commit changes">
<commands>
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
</commands>
</step>

<step name="Create feature branch and push">
<commands>
git checkout -b ui-cycle-${TIMESTAMP}
git push -u origin ui-cycle-${TIMESTAMP}

gh pr create \
  --title "UI Cycle: ${TASK_DESCRIPTION}" \
  --body "Automated UI change via UI Adaptive Cycle

**Changes:** ${TASK_DESCRIPTION}
**Tests:** All passing
**Screenshots:** See artifacts
**Cycle ID:** ${TIMESTAMP}" \
  || true
</commands>
</step>

<step name="Deploy to production">
<commands>
# Cloudflare Workers
DEPLOY_URL=$(npx wrangler deploy 2>&1 | grep -o 'https://.*\.pages\.dev')

# OR Vercel
# DEPLOY_URL=$(vercel --prod 2>&1 | grep -o 'https://.*\.vercel\.app')

# OR Netlify
# DEPLOY_URL=$(netlify deploy --prod 2>&1 | grep -o 'https://.*\.netlify\.app')

echo "${DEPLOY_URL}" > ${RUN_DIR}/deployment-url.txt
</commands>
</step>

<step name="Production verification">
<commands>
await page.goto(DEPLOY_URL);
await page.waitForLoadState('networkidle');

const prodErrors = await page.evaluate(() => {
  return window.__consoleLogs?.filter(l => l.type === 'error') || [];
});

if (prodErrors.length > 0) {
  await exec('git revert HEAD');
  await exec('git push origin main');
  throw new Error('Production deployment failed - rolled back');
}

await page.screenshot({
  path: `${RUN_DIR}/screenshots/production.png`,
  fullPage: true
});
</commands>
</step>
</steps>

<artifacts>
- `git-commit-sha.txt`
- `deployment-url.txt`
- `screenshots/production.png`
</artifacts>
</phase>

<phase name="Close" duration="3 min">
<objective>
Archive artifacts and generate report
</objective>

<steps>
<step name="Generate cycle report">
<output_file>cycle-report.md</output_file>
<content>
# UI Adaptive Cycle Report

## Cycle Details
- **Cycle ID:** ${TIMESTAMP}
- **Task:** ${TASK_DESCRIPTION}
- **Component:** ${COMPONENT_NAME}
- **Duration:** ${DURATION_MINUTES} minutes
- **Status:** ✅ Success / ❌ Failed

## Artifacts
- **Before Screenshots:** `${RUN_DIR}/screenshots/before/`
- **After Screenshots:** `${RUN_DIR}/screenshots/after/`
- **Test Results:** `${RUN_DIR}/logs/test-results.json`
- **Console Logs:** `${RUN_DIR}/logs/console-*.json`

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
</content>
</step>

<step name="Archive artifacts">
<commands>
ARCHIVE_DIR="/archive/ui-cycles/${TIMESTAMP}"
mkdir -p "${ARCHIVE_DIR}"
cp -r "${RUN_DIR}"/* "${ARCHIVE_DIR}/"

echo "${TIMESTAMP}|${TASK_DESCRIPTION}|${STATUS}|${DEPLOY_URL}" >> \
  /archive/ui-cycles/index.csv

rm -rf "${RUN_DIR}"
</commands>
</step>
</steps>

<artifacts>
- Cycle report (markdown)
- Archived artifacts in `/archive/ui-cycles/${TIMESTAMP}/`
- Updated index in `/archive/ui-cycles/index.csv`
</artifacts>
</phase>
</workflow>

<success_criteria>
<table>
<tr><th>Phase</th><th>Gate</th><th>Pass Condition</th></tr>
<tr><td>Pre-flight</td><td>Git Clean</td><td>No uncommitted changes</td></tr>
<tr><td>Pre-flight</td><td>Dev Server</td><td>Starts without errors</td></tr>
<tr><td>Build</td><td>Type Check</td><td>npm run type-check exits 0</td></tr>
<tr><td>Build</td><td>Lint</td><td>npm run lint exits 0</td></tr>
<tr><td>Build</td><td>Build</td><td>npm run build exits 0</td></tr>
<tr><td>Verify</td><td>Tests</td><td>All acceptance tests pass</td></tr>
<tr><td>Verify</td><td>Console</td><td>Zero errors</td></tr>
<tr><td>Verify</td><td>Visual</td><td><5% pixel difference</td></tr>
<tr><td>Verify</td><td>A11y</td><td>Score >90</td></tr>
<tr><td>Verify</td><td>Performance</td><td>Within 10% baseline</td></tr>
<tr><td>Deploy</td><td>Production</td><td>URL accessible, console clean</td></tr>
</table>
</success_criteria>

<loop_limits>
<track_loops>
build: 0/2
verify: 0/2
</track_loops>

<escalate_when>
- Build loops reach 2
- Verify loops reach 2
- Total time exceeds 90 minutes
- Production deployment fails
</escalate_when>

<escalation_template>
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
</escalation_template>
</loop_limits>

<troubleshooting>
<table>
<tr><th>Issue</th><th>Solution</th></tr>
<tr><td>Dev server won't start</td><td>Check port conflicts, clear node_modules</td></tr>
<tr><td>Tests fail locally</td><td>Update snapshots, check selectors</td></tr>
<tr><td>Visual regression false positive</td><td>Ignore dynamic content areas</td></tr>
<tr><td>Console errors unrelated</td><td>Filter known warnings</td></tr>
<tr><td>Deployment fails</td><td>Check auth, verify branch</td></tr>
<tr><td>Production console has errors</td><td>Rollback immediately: git revert HEAD</td></tr>
</table>
</troubleshooting>

<done_checklist>
- [ ] All 6 phases completed
- [ ] All verification gates passed
- [ ] Production deployed and verified
- [ ] Cycle report generated
- [ ] Artifacts archived
- [ ] Index updated
- [ ] Local directory cleaned
</done_checklist>
</instructions>
