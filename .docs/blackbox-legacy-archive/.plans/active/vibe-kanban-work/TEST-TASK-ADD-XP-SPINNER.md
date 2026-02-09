# 🧪 TEST TASK: Add Loading Spinner to XP Display Component

## 🎯 Task Overview

**Task ID:** VK-TEST-001
**Priority:** MEDIUM
**Estimated Time:** 15-30 minutes
**Agent Type:** Gemini or Claude Code

---

## 📋 Description

Add a simple loading spinner (⏳ emoji) to the XP Display component that shows while XP data is being loaded, then hides when loaded.

**Purpose:** Test the complete Vibe Kanban + .blackbox integration workflow with a real, valuable improvement.

---

## ✅ Requirements

### 1. MANDATORY: Read .blackbox Onboarding First
- **File:** `.blackbox/AGENT-ONBOARDING.md`
- **Must read completely** before starting any work
- **Must understand** the .blackbox workflow

### 2. Find XP Display Component
- **Location:** `src/domains/lifelock/`
- **File name likely contains:** "XP" and "Display"
- **Search for:** XP Display component files

### 3. Add Loading State
- **When loading:** Show ⏳ emoji
- **When loaded:** Hide spinner, show XP
- **Implementation:** Simple state toggle

### 4. .blackbox Integration (CRITICAL)
- **Create:** `.blackbox/.plans/active/vibe-kanban-work/task-VK-TEST-001-progress.md`
- **Log all work** with timestamps
- **Update:** `active-tasks.md` when starting
- **Update:** `completed-tasks.md` when done
- **Create artifact:** `.blackbox/9-brain/incoming/vibe-kanban-tasks/VK-TEST-001.md`

---

## 🔍 Technical Details

### Expected Component Location
```
src/domains/lifelock/
├── 1-daily/_shared/components/
│   ├── XPDisplay.tsx  (most likely)
│   └── XPDisplay.ts
```

### Implementation Pattern
```typescript
// Add loading state
const [isLoading, setIsLoading] = useState(true);

// Show spinner while loading
{isLoading ? (
  <div className="xp-loading">
    ⏳ Loading XP...
  </div>
) : (
  <div className="xp-display">
    {xpAmount} XP
  </div>
)}

// Set loading to false when data arrives
useEffect(() => {
  if (xpData) {
    setIsLoading(false);
  }
}, [xpData]);
```

---

## 📍 .blackbox Workflow Checklist

### Before Starting Work:
- [ ] Read `.blackbox/AGENT-ONBOARDING.md` completely
- [ ] Check `active-tasks.md` for context
- [ ] Create progress file: `task-VK-TEST-001-progress.md`
- [ ] Update `active-tasks.md` with this task

### While Working:
- [ ] Log every file read
- [ ] Log every code change
- [ ] Record all decisions made
- [ ] Note any problems encountered
- [ ] Update progress file regularly

### When Complete:
- [ ] Update progress file with completion details
- [ ] Move to `completed-tasks.md`
- [ ] Create artifact in `incoming/vibe-kanban-tasks/`
- [ ] Test the changes work
- [ ] Commit to git (if applicable)

---

## 🎯 Success Criteria

1. ✅ **Agent read onboarding** - Verified in progress file
2. ✅ **Loading spinner shows** - ⏳ visible when loading
3. ✅ **Spinner hides when loaded** - XP shows after data loads
4. ✅ **.blackbox tracking complete** - All files updated
5. ✅ **Code works** - Tested and functional
6. ✅ **Artifact created** - Summary in incoming/

---

## 📊 Expected Deliverables

### Code Changes:
- **File Modified:** XP Display component
- **Lines Added:** ~5-10 lines
- **Complexity:** Low (simple state toggle)

### .blackbox Artifacts:
1. **Progress File:** `.blackbox/.plans/active/vibe-kanban-work/task-VK-TEST-001-progress.md`
   - Complete work log
   - All decisions
   - All changes
   - Timestamps throughout

2. **Artifact:** `.blackbox/9-brain/incoming/vibe-kanban-tasks/VK-TEST-001.md`
   - Summary of changes
   - Files modified
   - Testing performed
   - Success verification

3. **Updated Files:**
   - `active-tasks.md` - Task added, then moved to completed
   - `completed-tasks.md` - Task added with completion details
   - `queue-status.md` - Stats updated

---

## 🚀 How This Tests the System

This task verifies:
1. ✅ **Agent Onboarding Works** - Agent reads and follows instructions
2. ✅ **.blackbox Integration Works** - Complete tracking from start to finish
3. ✅ **Vibe Kanban Workflow Works** - Task creation → Agent work → Completion
4. ✅ **Real Value Delivered** - Actual improvement to the codebase
5. ✅ **Memory System Works** - All work captured and searchable

---

## 💡 Notes for Agent

- **This is a REAL task** - Make the changes, test them, commit them
- **.blackbox is MANDATORY** - Don't skip the tracking steps
- **Follow the templates** - Use the exact formats from onboarding
- **Be specific** - Include file paths, line numbers, exact changes
- **Log everything** - We want to see the complete workflow

---

**Ready to test the complete Vibe Kanban + .blackbox integration!** 🎉

*When this task is complete, we'll have proven the entire workflow works end-to-end.*
