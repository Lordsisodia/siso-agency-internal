# 🧪 Test Tasks for SISO-INTERNAL App

## 🎯 Real Test Tasks to Try in Vibe Kanban

Here are actual improvements we can make to the SISO-INTERNAL app to test the autonomous workflow!

---

## 📋 Test Task 1: Add Dark Mode Toggle (Easy)

```
Title: Add dark mode toggle button to navigation

Description:
The app has dark mode CSS variables defined but no user toggle. Add a dark mode toggle button to the navigation that:
- Toggles between light/dark mode
- Persists preference in localStorage
- Shows current mode (sun/moon icon)
- Is accessible with keyboard

Implementation hints:
- Check: src/app/index.css (dark mode CSS already exists)
- Check: src/domains/lifelock/1-daily/_shared/components/UnifiedTopNav.tsx
- Use: localStorage.setItem('theme', 'dark'|'light')
- Toggle class 'dark' on document.documentElement

📍 .blackbox Integration:
1. Create: .blackbox/.plans/active/vibe-kanban-work/task-dark-mode-progress.md
2. Log your investigation and implementation
3. When done, update: .blackbox/.plans/active/vibe-kanban-work/completed-tasks.md
```

**Why this is good:** Low risk, visible feature, tests UI + localStorage + CSS

---

## 📋 Test Task 2: Fix Console Errors (Easy)

```
Title: Find and fix console errors in the app

Description:
Run the app and check browser console for errors. Fix any errors found:
1. Start the app: npm run dev
2. Open browser console
3. Navigate through different sections
4. Document all errors found
5. Fix each error
6. Test that fixes work

Common issues to look for:
- Missing imports
- Undefined variables
- Type errors
- Failed fetch requests
- Missing components

📍 .blackbox Integration:
- Create progress file
- Log each error found and how you fixed it
- Document before/after state
```

**Why this is good:** Easy to verify, improves code quality, tests debugging skills

---

## 📋 Test Task 3: Add Loading States (Medium)

```
Title: Add loading states to async operations

Description:
The app has several async operations (API calls, data loading) that don't show loading states. Add skeleton loaders or spinners to:
1. src/domains/dashboard/pages/XPDashboardPage.tsx
2. src/domains/lifelock/analytics/ui/pages/XPAnalyticsPage.tsx
3. src/domains/xp-store/1-storefront/ui/pages/XPStorePage.tsx

For each:
- Create a loading component (skeleton or spinner)
- Show while data is loading
- Handle error states
- Test with slow network

📍 .blackbox Integration:
- Log each component you modify
- Show before/after screenshots in progress file
```

**Why this is good:** Improves UX, tests async handling, reusable components

---

## 📋 Test Task 4: Add Unit Tests (Medium)

```
Title: Add unit tests for utility functions

Description:
The app has test setup (vitest) but few tests. Add tests for utility functions:
1. Find utils in src/lib/ or src/services/
2. Pick 3-5 utility functions
3. Write comprehensive tests:
   - Happy path
   - Edge cases
   - Error handling
4. Ensure tests pass: npm run test:unit

Example functions to test:
- Date formatting utilities
- XP calculation functions
- Validation functions
- Data transformation helpers

📍 .blackbox Integration:
- Document which functions you tested
- Show test coverage before/after
- Log any bugs found during testing
```

**Why this is good:** Improves code quality, easy to verify (tests pass/fail)

---

## 📋 Test Task 5: Optimize Images (Easy)

```
Title: Optimize images in the app

Description:
Find and optimize images throughout the app:
1. Find all image imports (grep -r "import.*png\|jpg\|jpeg" src/)
2. Check if images are oversized
3. Optimize/compress images
4. Consider using WebP format
5. Add lazy loading to below-fold images
6. Test that images still look good

Tools to use:
- Image optimizers (squosh, sharp)
- Format conversion
- Lazy loading with loading="lazy"

📍 .blackbox Integration:
- List all images found
- Document optimization performed
- Show file size before/after
```

**Why this is good:** Easy to measure success (smaller files = faster load)

---

## 📋 Test Task 6: Add Error Boundaries (Medium)

```
Title: Add React Error Boundaries to route components

Description:
Add error boundaries to catch and handle errors gracefully:
1. Create ErrorBoundary component
2. Add to main route components
3. Show user-friendly error messages
4. Log errors for debugging
5. Add recovery options (retry, go home)

Routes to protect:
- /dashboard/*
- /lifelock/*
- /xp-store/*

📍 .blackbox Integration:
- Document error boundary implementation
- Show how to test (throw error to test)
- Log any existing errors found
```

**Why this is good:** Improves app reliability, tests error handling

---

## 📋 Test Task 7: Add Search Functionality (Hard)

```
Title: Add global search to the app

Description:
Implement a global search feature that:
1. Search across multiple domains (tasks, projects, docs)
2. Show results in a dropdown
3. Navigate to result on click
4. Support keyboard shortcuts (Cmd+K)
5. Highlight search terms in results

Implementation:
- Add search input to navigation
- Create search index of content
- Implement fuzzy search
- Show results dropdown
- Handle keyboard navigation

📍 .blackbox Integration:
- Document search architecture
- Log implementation challenges
- Show example searches
```

**Why this is good:** Complex feature, tests multiple skills, high value

---

## 📋 Test Task 8: Improve Accessibility (Medium)

```
Title: Fix accessibility issues in the app

Description:
Run accessibility audit and fix issues:
1. Run Lighthouse accessibility audit
2. Fix issues found:
   - Missing ARIA labels
   - Keyboard navigation
   - Color contrast
   - Focus indicators
   - Screen reader support
3. Test with screen reader
4. Test keyboard-only navigation

Priority areas:
- Navigation
- Forms
- Modals
- Data tables

📍 .blackbox Integration:
- List all a11y issues found
- Document fixes applied
- Show Lighthouse score before/after
```

**Why this is good:** Measurable improvement (Lighthouse score), inclusive design

---

## 📋 Test Task 9: Add API Response Caching (Medium)

```
Title: Add response caching to API calls

Description:
Implement caching for API responses to improve performance:
1. Find API calls in src/services/
2. Add caching layer:
   - Cache GET requests
   - Set TTL (time to live)
   - Cache key based on URL + params
   - Invalidate on mutations
3. Show cached data while refetching
4. Add cache status indicator

Consider using:
- React Query / SWR
- Custom cache implementation
- localStorage for persistence

📍 .blackbox Integration:
- Document caching strategy
- Show performance improvement
- Log cache hit rates
```

**Why this is good:** Measurable performance improvement, tests optimization

---

## 📋 Test Task 10: Create Component Library (Easy)

```
Title: Extract reusable components into library

Description:
Find repeated UI patterns and extract into reusable components:
1. Find duplicate code across domains
2. Create shared components in src/components/
3. Document component props
4. Replace usage in existing code
5. Test that everything still works

Common patterns to extract:
- Buttons with variants
- Cards with consistent styling
- Form inputs
- Modals/dialogs
- Loading spinners

📍 .blackbox Integration:
- List components extracted
- Show code reduction (lines before/after)
- Document component API
```

**Why this is good:** Improves code organization, reduces duplication

---

## 🚀 How to Run These Tests

### Step 1: Start Vibe Kanban
```bash
# On Mac Mini
docker-compose -f docker-compose.vibe-kanban.yml ps
# Access: https://tower-poly-lauren-minister.trycloudflare.com
```

### Step 2: Create Test Tasks
1. Open Vibe Kanban
2. Create tasks from the templates above
3. Start with easy tasks (Task 1, 2, or 5)
4. Assign to agents (Gemini or Claude)

### Step 3: Monitor Progress
```bash
# Watch agent working
# In Vibe Kanban, click on task to see real-time progress

# Check .blackbox updates
cat .blackbox/.plans/active/vibe-kanban-work/task-*-progress.md
```

### Step 4: Review Work
1. When task moves to "In Review"
2. Click to see code changes
3. Test the changes locally
4. Merge if good, add feedback if not

---

## 📊 Recommended Test Order

### Phase 1: Easy Wins (Build Confidence)
1. ✅ Task 2: Fix Console Errors
2. ✅ Task 5: Optimize Images
3. ✅ Task 1: Add Dark Mode Toggle

### Phase 2: Medium Complexity
4. ✅ Task 3: Add Loading States
5. ✅ Task 4: Add Unit Tests
6. ✅ Task 6: Add Error Boundaries
7. ✅ Task 8: Improve Accessibility
8. ✅ Task 9: Add API Caching
9. ✅ Task 10: Create Component Library

### Phase 3: Advanced Features
10. ✅ Task 7: Add Search Functionality

---

## 🎯 Success Criteria

For each task, success means:
- ✅ Code works without errors
- ✅ No regressions (existing features still work)
- ✅ .blackbox updated with progress
- ✅ Code committed to git
- ✅ Can demonstrate the feature

---

## 🧪 Testing the Workflow

### Test 1: Single Task Workflow
```
1. Create 1 task in Vibe Kanban
2. Start with Gemini agent
3. Watch it work in real-time
4. Review code changes
5. Merge to main
6. Celebrate! 🎉
```

### Test 2: Parallel Tasks Workflow
```
1. Create 3 tasks in Vibe Kanban
2. Start all 3 with different agents
3. Watch them work in parallel
4. Review all completed work
5. Merge successful work
```

### Test 3: Overnight Workflow
```
1. Evening: Create 5 tasks
2. Start them with agents
3. Go to sleep 😴
4. Morning: Review completed work
5. See what got done!
```

---

## 💡 Pro Tips for Testing

### Start Small
- Begin with easy tasks (Task 1 or 2)
- Build confidence in the system
- Learn how agents work

### Be Specific
- Give clear task descriptions
- Include file paths
- Add context about the codebase

### Monitor Closely
- Watch agents work in real-time
- Check progress files
- Intervene if going off track

### Review Carefully
- Always review code before merging
- Test changes locally
- Add feedback if needed

### Iterate Fast
- If task fails, adjust description
- Try again with different agent
- Learn what works best

---

## 📁 Checkpoint Files

As you test, monitor these files:

```bash
# Active tasks
cat .blackbox/.plans/active/vibe-kanban-work/active-tasks.md

# Task progress
cat .blackbox/.plans/active/vibe-kanban-work/task-*-progress.md

# Completed work
cat .blackbox/.plans/active/vibe-kanban-work/completed-tasks.md

# Queue status
cat .blackbox/.plans/active/vibe-kanban-work/queue-status.md
```

---

## 🎁 Summary

**10 real test tasks** for the SISO-INTERNAL app:
- 3 Easy (build confidence)
- 6 Medium (real value)
- 1 Hard (stretch goal)

**Recommended workflow:**
1. Start with 1 easy task
2. Verify it works end-to-end
3. Scale up to more tasks
4. Try overnight batch processing

**Success metrics:**
- Tasks completed successfully
- Code quality improved
- .blackbox tracking works
- You're confident in the system

**Ready to test?** Start with Task 1 (Dark Mode Toggle) - it's easy to verify and you'll see results immediately! 🚀
