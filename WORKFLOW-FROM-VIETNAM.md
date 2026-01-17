# 🌏 Daily Workflow: Managing Vibe Kanban from Vietnam

## 🚀 Quick Access

### Vibe Kanban Web Interface
```
https://tower-poly-lauren-minister.trycloudflare.com
```

**Access from anywhere in the world!**

---

## 📅 Your Daily Routine

### Morning (Vietnam Time) - 8:00 AM

1. **Check What Mac Mini Completed Overnight**
   - Open Vibe Kanban (link above)
   - Look at "Done" column
   - Review completed work
   - Check for any failures

2. **Review Code Changes**
   - Click completed tasks
   - Review diffs
   - Merge if good, add feedback if needed

3. **Plan Today's Work**
   - Look at your "To Do" column
   - Prioritize tasks
   - Estimate what can be done today

### During the Day - 9:00 AM - 6:00 PM

4. **Add New Tasks**
   - Create tasks for features you want
   - Add bug reports as you find them
   - Plan refactoring work

5. **Monitor Progress**
   - Watch "In Progress" column
   - See agents working in real-time
   - Check progress files

6. **Use Claude Code with MCP**
   - From your MacBook, create tasks via voice/text
   - "Create a task to fix the navigation bug"
   - "Move authentication task to In Progress"
   - "Show me all tasks in To Do"

### Evening - 9:00 PM

7. **Queue Overnight Work**
   - Move 3-5 tasks to "To Do"
   - Start tasks with agents
   - Let Mac Mini work while you sleep

8. **Check System Status**
   ```bash
   # SSH to Mac Mini (if needed)
   ssh username@192.168.0.29

   # Check services
   docker ps | grep vibe

   # Check logs
   docker logs -f vibe-kanban
   ```

---

## 🎯 Example Day

### 8:00 AM - Wake Up & Review
```
✅ Mac Mini completed 5 tasks overnight!
   - Fixed login bug ✅
   - Added dark mode ✅
   - Refactored user service ✅
   - Updated docs ✅
   - Fixed navigation ✅

❌ 1 task failed:
   - Database migration (permission error)
```

### 9:00 AM - Plan & Prioritize
```
Today's priorities:
1. Fix the failed migration (high priority)
2. Add user profile feature (medium)
3. Improve error handling (medium)
4. Update tests (low)
```

### 10:00 AM - Start Work
```
Create task: "Fix database migration permissions"
Move to: In Progress
Assign: Gemini agent

Agent starts working immediately...
```

### 2:00 PM - Add More Tasks
```
From MacBook in Vietnam:
"Create task for user profile page with avatar upload"
"Add task to improve error messages"
"Create task for unit tests for auth module"
```

### 6:00 PM - Review Progress
```
Completed today:
- Fixed migration ✅
- User profile 80% done 🔄
- Error messages improved ✅

Still in progress:
- User profile (working on avatar upload)
```

### 9:00 PM - Queue Overnight Work
```
Move to "To Do":
1. Complete user profile avatar
2. Add unit tests for auth
3. Refactor payment service
4. Update API documentation
5. Fix mobile responsive issues

Start first 3 tasks with agents...
Go to sleep 😴
```

### Next Morning 8:00 AM
```
🎉 Mac Mini completed all 5 tasks!
All code ready for review!
```

---

## 💬 Using Claude Code with MCP

### From Your MacBook

```bash
# Make sure Claude Code has MCP configured
cat ~/.config/claude-code/config.json
```

### Voice/Text Commands

**List Tasks:**
```
"Show me all my Vibe Kanban tasks"
"What's in my To Do column?"
"Which tasks are In Progress?"
```

**Create Tasks:**
```
"Create a task called 'Add search functionality'"
"Add task to fix the checkout bug"
"Create task for API rate limiting"
```

**Manage Tasks:**
```
"Move 'Add search' to In Progress"
"Mark the navigation task as Done"
"Show me details of the authentication task"
```

**Get Context:**
```
"What did Mac Mini complete yesterday?"
"Which tasks failed and why?"
"Show me the progress of user profile task"
```

---

## 🔧 Quick Commands

### Check Mac Mini Status
```bash
# SSH to Mac Mini
ssh username@192.168.0.29

# Check Docker services
docker ps

# Check Vibe Kanban logs
docker logs -f vibe-kanban

# Check agent activity
docker logs -f vibe-kanban | grep -i "gemini\|claude"

# See .blackbox tracking
cat ~/SISO-INTERNAL/.blackbox/.plans/active/vibe-kanban-work/active-tasks.md
```

### Monitor from Browser
```
1. Open: https://tower-poly-lauren-minister.trycloudflare.com
2. See all tasks
3. Watch agents working
4. Review code changes
5. Merge completed work
```

### Use MCP from Claude Code
```
1. Open Claude Code on MacBook
2. Ask about tasks
3. Create new tasks
4. Move tasks between columns
5. Get progress updates
```

---

## 📊 Weekly Review

### Every Sunday Evening

1. **Review Completed Work**
   - Check "Done" column
   - Review quality of work
   - Identify patterns

2. **Clean Up**
   - Archive old completed tasks
   - Remove duplicate tasks
   - Update task descriptions

3. **Plan Next Week**
   - Add tasks for next week's goals
   - Prioritize by importance
   - Estimate complexity

4. **System Health Check**
   ```bash
   # Check disk space
   df -h

   # Check Docker resource usage
   docker stats

   # Check for errors
   docker logs vibe-kanban --tail 100
   ```

---

## 🎯 Pro Tips

### 1. Start Tasks Before You Sleep
```
9:00 PM: Move 3-5 tasks to To Do
9:05 PM: Start them with agents
9:10 PM: Go to sleep
8:00 AM: Wake up to completed work!
```

### 2. Use Descriptive Task Titles
```
❌ Bad: "Fix bug"
✅ Good: "Fix navigation bug where menu doesn't close on mobile"
```

### 3. Add Context to Tasks
```
❌ Bad: "Add auth"
✅ Good: "Add JWT authentication with login, logout, and refresh tokens"

📍 Add: .blackbox integration instructions
```

### 4. Review Daily
```
✅ DO: Review completed work every morning
❌ DON'T: Let tasks pile up without review
```

### 5. Use Agents Smartly
```
Claude: Planning, architecture, complex logic
Gemini: Implementation, bug fixes, refactoring
Codex: Simple tasks, quick fixes
```

---

## 🚨 Troubleshooting

### Can't Access Vibe Kanban
```bash
# Check Mac Mini is running
ssh username@192.168.0.29
docker ps | grep vibe-kanban

# Restart if needed
docker restart vibe-kanban
```

### Cloudflare Tunnel Down
```bash
# SSH to Mac Mini
ssh username@192.168.0.29

# Check cloudflared
docker ps | grep cloudflared

# Restart
docker restart vibe-cloudflared
```

### Agent Not Responding
```bash
# Check agent logs
docker logs vibe-kanban | grep -i "error\|failed"

# Restart Vibe Kanban
docker restart vibe-kanban
```

---

## 🎁 Summary

**Your Autonomous Task System:**

✅ **Accessible from anywhere** via Cloudflare tunnel
✅ **24/7 operation** on Mac Mini at home
✅ **Voice control** via Claude Code MCP
✅ **Automatic tracking** to .blackbox
✅ **Zero manual intervention** - agents do the work

**Daily Workflow:**
1. Morning: Review overnight work
2. Day: Add tasks, monitor progress
3. Evening: Queue overnight work
4. Sleep: Mac Mini works while you rest
5. Repeat! 🔄

**You can now:**
- Work from anywhere in the world
- Queue tasks while in Vietnam
- Wake up to completed work
- Monitor progress on your phone
- Use voice commands to manage tasks

**Your autonomous AI workforce is ready!** 🚀
