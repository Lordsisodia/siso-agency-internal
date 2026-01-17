# 🚀 Quick Start: Your First Vibe Kanban Test

## ⚡ 5-Minute First Test

Let's test the system with a simple, visible task!

---

## 📋 Task: Add Dark Mode Toggle

**Why this task:**
- ✅ Easy to verify (you can see it work)
- ✅ Low risk (won't break anything)
- ✅ Fast to complete (~10-15 minutes)
- ✅ Tests multiple skills (UI, localStorage, CSS)

---

## 🎯 Step-by-Step

### Step 1: Open Vibe Kanban (30 seconds)

```
https://tower-poly-lauren-minister.trycloudflare.com
```

### Step 2: Create Your First Task (2 minutes)

1. Click **"New Task"**
2. Fill in:

```
Title: Add dark mode toggle button

Description:
Add a dark mode toggle button to the navigation bar:

Requirements:
- Add toggle button to src/domains/lifelock/1-daily/_shared/components/UnifiedTopNav.tsx
- Button should toggle between light/dark mode
- Persist preference in localStorage
- Show sun icon in light mode, moon icon in dark mode
- Toggle 'dark' class on document.documentElement

Implementation:
1. Check existing dark mode CSS in src/app/index.css (already defined!)
2. Add button to UnifiedTopNav component
3. Create toggle handler: localStorage + class toggle
4. Add icons (you can use emoji ☀️/🌙 for simplicity)
5. Test it works

📍 .blackbox Integration:
IMPORTANT: Create progress file at .blackbox/.plans/active/vibe-kanban-work/task-{ID}-progress.md and log your work. When done, update .blackbox/.plans/active/vibe-kanban-work/completed-tasks.md
```

3. Click **"Create"**

### Step 3: Start the Agent (30 seconds)

1. Find your task in the **"To Do"** column
2. Click on the task
3. Click **"Start Task"**
4. Select **"Gemini"** as the agent
5. Click **"Start"**

### Step 4: Watch It Work! (5-10 minutes)

1. **Click on your task** to see real-time progress
2. **Watch as Gemini:**
   - Reads the task description
   - Explores the codebase
   - Finds the navigation component
   - Implements the toggle
   - Tests it
   - Commits changes

3. **Look for progress updates:**
   ```
   🔍 Exploring codebase...
   📁 Reading UnifiedTopNav.tsx...
   💡 Implementing toggle...
   ✅ Testing functionality...
   📝 Committing changes...
   ```

### Step 5: Review the Work (2 minutes)

When task moves to **"In Review"**:

1. **Click the Diff icon** (📋) to see changes
2. **Review what changed:**
   - Did it add the toggle button?
   - Is the implementation clean?
   - Does it handle errors?

3. **Test it locally:**
   ```bash
   # On your Mac
   cd ~/SISO-INTERNAL
   npm run dev

   # Open browser to localhost:5173
   # Click the toggle button!
   # Did dark mode work? 🌙
   ```

### Step 6: Approve or Request Changes (1 minute)

**If it looks good:**
1. Click **"Send"** to approve
2. Task moves to **"Done"** ✅

**If needs changes:**
1. Click on lines that need fixing
2. Add comments: "Move button to the right side"
3. Click **"Send"**
4. Agent will fix it

---

## 🔍 What to Check

### ✅ Success Looks Like:
- Toggle button appears in navigation
- Clicking it switches between light/dark mode
- Preference saves (refresh page, mode stays)
- No console errors
- Clean, readable code

### ❌ Failure Looks Like:
- Button doesn't appear
- Clicking does nothing
- Console errors
- Code is messy
- Doesn't persist

---

## 📊 Monitor Progress

While agent works, check the tracking:

```bash
# On Mac Mini (via SSH or RustDesk)
cd ~/SISO-INTERNAL

# See active tasks
cat .blackbox/.plans/active/vibe-kanban-work/active-tasks.md

# See progress file (will appear after agent starts)
cat .blackbox/.plans/active/vibe-kanban-work/task-*-progress.md

# Watch logs
docker logs -f vibe-kanban
```

---

## 🎁 Expected Outcome

### After 15 Minutes:
```
✅ Task created in Vibe Kanban
✅ Agent completed the work
✅ Dark mode toggle working
✅ Code committed to git
✅ .blackbox updated with progress
✅ Task moved to Done
```

### What You'll See:
- **Before:** Light mode only, no toggle
- **After:** Toggle button in nav, switches between light/dark
- **Bonus:** Preference saved, works after refresh

---

## 🚨 Troubleshooting

### Agent Stuck?
1. Check if agent is still running: Click task, look for activity
2. If stuck for 5+ minutes, abort and try again
3. Try different agent (Claude instead of Gemini)

### Can't See Changes?
1. Check browser: Refresh the page
2. Check local: Run `npm run dev` to see changes
3. Check git: Run `git log` to see commits

### .blackbox Not Updated?
1. Check file exists: `ls .blackbox/.plans/active/vibe-kanban-work/`
2. Wait 30 seconds for monitor to detect changes
3. Check agent included .blackbox instructions in task

---

## 🎯 Success Criteria

You'll know the test worked if:
- ✅ Task completed without errors
- ✅ Dark mode toggle works in browser
- ✅ Code is clean and readable
- ✅ .blackbox has progress logged
- ✅ You feel confident using the system

---

## 🚀 What's Next?

### After First Test Succeeds:

**Try 3 Tasks in Parallel:**
1. Dark mode toggle (from this test)
2. Fix console errors
3. Optimize images

**Create them all, start them all, watch agents work in parallel!**

### Try Overnight Batch:
```
9:00 PM: Create 5 tasks
9:05 PM: Start them all
9:10 PM: Go to sleep 😴
8:00 AM: Wake up to completed work!
```

---

## 💡 Pro Tips

### 1. Be Specific
```
❌ Bad: "Add dark mode"
✅ Good: "Add toggle button to UnifiedTopNav.tsx that..."
```

### 2. Check Progress
```
Keep the task open to watch agent work in real-time
```

### 3. Review Code
```
Always review before merging - agents make mistakes!
```

### 4. Test Locally
```
npm run dev to verify changes work
```

---

## 🎉 Celebrate!

When this first test works:
- You've successfully used AI agents to complete a task
- You've verified the autonomous workflow
- You're ready to scale up!

**Take a screenshot of the working dark mode toggle - that's your AI assistant doing work for you!** 📸

---

## 📞 Need Help?

If something goes wrong:
1. Check Vibe Kanban logs: `docker logs -f vibe-kanban`
2. Check .blackbox files for progress
3. Review agent output in the task
4. Try a simpler task if stuck

**Ready to test? Open Vibe Kanban and create your first task!** 🚀
