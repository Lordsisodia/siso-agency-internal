# UI Cycle Quick Start
## Agent Execution Pocket Guide

**Use this:** When you need to execute a UI change autonomously
**Read time:** 2 minutes
**Full spec:** `UI-ADAPTIVE-DEV-CYCLE.md`

---

## 🚀 30-SECOND START

```bash
# 1. Set up run directory
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RUN_DIR=".runs/ui-cycle-${TIMESTAMP}"
mkdir -p "${RUN_DIR}/artifacts"

# 2. Pre-flight check
git status --porcelain  # Must be clean
npm run dev &  # Start dev server

# 3. Follow the cycle below
```

---

## 🔄 THE CYCLE (AT A GLANCE)

```
1️⃣ OBSERVE (5 min)  → Take screenshots, capture console
2️⃣ DEFINE  (10 min) → Write success criteria
3️⃣ BUILD   (30 min) → Make changes, test locally
4️⃣ VERIFY  (15 min) → Run tests, check console
5️⃣ DEPLOY  (5 min)  → Commit, push, verify prod
```

---

## ✅ SUCCESS GATES (DON'T SKIP THESE)

| Phase | Gate | Check |
|-------|------|-------|
| Build | Type | `npm run type-check` |
| Build | Lint | `npm run lint` |
| Verify | Tests | `npx playwright test` |
| Verify | Console | Zero errors |
| Verify | Visual | <5% pixel diff |
| Verify | A11y | Score >90 |

**If ANY gate fails:** Fix and retry. Max 2 loops.

---

## 📋 TASK TEMPLATE

When given a UI task, fill this out:

```markdown
## Task: [ONE LINE DESCRIPTION]

**Component:** [ComponentName.tsx]
**Type:** [color/layout/text/component/spacing]

## Success Criteria
- [ ] [Specific change] is visible
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Desktop correct

## Files to Change
- src/components/[Component].tsx
- src/components/[Component].css (if applicable)

## Test Approach
- Navigate to: [URL]
- Find element: [selector]
- Verify: [what to check]
```

---

## 🛠️ COMMON PATTERNS

### Pattern 1: Change Color
```typescript
// Find: className="bg-blue-500"
// Change to: className="bg-red-500"
// Test: Element has red background
```

### Pattern 2: Change Text
```typescript
// Find: Text content
// Change to: New text
// Test: Text matches new value
```

### Pattern 3: Adjust Spacing
```css
/* Find: padding: 1rem */
/* Change to: padding: 2rem */
/* Test: Spacing increased visually */
```

### Pattern 4: Hide/Show Element
```typescript
// Find: element
// Add: className={condition ? 'block' : 'hidden'}
// Test: Element visibility matches condition
```

---

## 🎯 EXECUTION CHECKLIST

Print this for each cycle:

### Pre-Flight ☐
- [ ] Git clean
- [ ] Dev server running
- [ ] Run folder created

### Build ☐
- [ ] Backup created
- [ ] Changes made
- [ ] Type check ✅
- [ ] Lint ✅
- [ ] Build ✅

### Verify ☐
- [ ] Tests ✅
- [ ] Console: 0 errors
- [ ] Visual OK
- [ ] A11y >90

### Deploy ☐
- [ ] Committed
- [ ] Pushed
- [ ] Deployed
- [ ] Verified

---

## 🚨 WHEN TO ASK FOR HELP

Ask immediately when:
1. Task is ambiguous (multiple interpretations)
2. Can't find the component
3. Changes break something unexpected
4. 2 loops failed (build or verify)
5. Production deployment fails

**Say this:**
> "I've hit a blocker in UI cycle ${TIMESTAMP}.
> Phase: ${PHASE}
> Issue: ${SPECIFIC_ERROR}
> Attempts: ${WHAT_I_TRIED}
> Artifacts: ${RUN_DIR}
> Need human guidance."

---

## 📊 PROGRESS REPORT FORMAT

Update every phase:

```markdown
## UI Cycle Progress - ${PHASE}

**Task:** ${TASK}
**Status:** ${EMOJI} ${STATUS}

**Done:**
- ✅ ${ACTION_1}
- ✅ ${ACTION_2}

**Artifacts:**
- ${RUN_DIR}/screenshots/before/*.png
- ${RUN_DIR}/logs/console.json

**Next:** ${NEXT_ACTION}
```

---

## 🔄 LOOP LIMITER

Track your loops:

```
Build Loop:  /2  ⬜⬜
Verify Loop: /2  ⬜⬜
Total Time:  /90m

If either fills → ESCALATE
```

---

## 📁 RUN DIRECTORY STRUCTURE

```
.runs/ui-cycle-{timestamp}/
├── artifacts/
│   ├── backup/
│   ├── acceptance.test.ts
│   └── failure-report.md (if failed)
├── screenshots/
│   ├── before/
│   ├── after/
│   └── production.png
├── logs/
│   ├── before-*.json
│   ├── after-*.json
│   └── test-results.json
└── cycle.json
```

---

## 🎯 EXAMPLE: CHANGE BUTTON COLOR

```
OBSERVE:
  → Navigate to /login
  → Screenshot: before/login.png
  → Console: 0 errors

DEFINE:
  → Success: Button is red (not blue)
  → Test: Button has bg-red-500 class

BUILD:
  → Edit: LoginButton.tsx
  → Change: "bg-blue-500" → "bg-red-500"
  → Run: npm run type-check ✅

VERIFY:
  → Run: npx playwright test ✅
  → Console: 0 errors ✅
  → Visual: 0.2% diff ✅

DEPLOY:
  → Commit: "feat(login): change button to red"
  → Push: origin/ui-cycle-{timestamp}
  → Verify: https://prod.example.com ✅

DONE! 🎉
```

---

## 🔧 USEFUL COMMANDS

```bash
# Find component
grep -r "Button" src/components --include="*.tsx" -l

# Take screenshot (using Chrome MCP)
Take screenshot of page

# Check console (using Chrome MCP)
Get console logs

# Run tests
npx playwright test

# Type check
npm run type-check

# Commit
git add src/
git commit -m "feat(scope): description"
git push
```

---

## ✨ QUALITY CHECKLIST

Before calling it "done":

- [ ] Code follows project patterns
- [ ] No `// TODO` comments left
- [ ] No `console.log` statements
- [ ] Proper TypeScript types
- [ ] A11y attributes added (aria-label, etc.)
- [ ] Responsive on mobile
- [ ] Works on desktop
- [ ] Tests cover the change
- [ ] Commit message follows conventions

---

## 📖 FULL SPEC

For detailed explanations, see:
`/Users/shaansisodia/DEV/AI-HUB/Black Box Factory/UI-ADAPTIVE-DEV-CYCLE.md`

---

**Remember:** Small batches, verify everything, ask when stuck.
