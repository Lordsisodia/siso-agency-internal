# 🎯 Your Dual Kanban System Guide

You now have **two powerful Kanban systems** running on your Mac Mini! Here's how to use them together:

---

## 📊 System Overview

### System 1: Simple Kanban (Port 5678)
**Purpose:** Quick task management and organization
- **URL:** http://192.168.0.29:5678
- **Best for:** Quick task tracking, manual organization
- **Features:** Beautiful UI, drag-and-drop, 4-column board
- **Data:** Simple file-based storage

### System 2: Vibe Kanban (Port 3000)
**Purpose:** AI-powered autonomous task execution
- **URL:** http://192.168.0.29:3000
- **Best for:** AI agent orchestration, code generation
- **Features:** Agent execution, git integration, progress tracking
- **Data:** Full .blackbox integration with automatic tracking

---

## 🔄 Recommended Workflow

### Option 1: Use Simple Kanban for Planning → Vibe Kanban for Execution

```
1. You're in Vietnam with an idea
   ↓
2. Add to Simple Kanban (quick, easy interface)
   ↓
3. Review tasks on Simple Kanban
   ↓
4. Move important tasks to Vibe Kanban for AI execution
   ↓
5. Gemini works on tasks overnight
   ↓
6. Wake up to completed work!
```

### Option 2: Use Vibe Kanban for Everything

```
1. Create tasks directly in Vibe Kanban
2. Use Gemini/CLI agents to execute
3. Everything tracked to .blackbox automatically
4. More powerful but slightly more complex
```

---

## 🚀 Access from Anywhere

### From Your MacBook in Vietnam:

**Simple Kanban:**
```bash
# SSH Tunnel
ssh -L 5678:localhost:5678 username@192.168.0.29
# Open: http://localhost:5678
```

**Vibe Kanban:**
```bash
# SSH Tunnel
ssh -L 3000:localhost:3000 username@192.168.0.29
# Open: http://localhost:3000
```

**Both at Once:**
```bash
ssh -L 5678:localhost:5678 -L 3000:localhost:3000 username@192.168.0.29
```

---

## 📋 When to Use Which System

### Use Simple Kanban (5678) for:
- ✅ Quick task brainstorming
- ✅ Manual task organization
- ✅ Non-coding tasks
- ✅ Simple project tracking
- ✅ Visual planning
- ✅ Team coordination

### Use Vibe Kanban (3000) for:
- ✅ Code generation tasks
- ✅ Refactoring work
- ✅ Bug fixing
- ✅ Feature implementation
- ✅ Automated testing
- ✅ Git-heavy operations
- ✅ When you need AI agents to work autonomously

---

## 🔗 Integrating Both Systems

### Strategy: Hierarchical Task Management

**Level 1: Simple Kanban (Backlog)**
- Capture all ideas quickly
- Organize by priority
- Simple drag-and-drop interface
- No AI overhead

**Level 2: Vibe Kanban (Execution)**
- Pull high-priority tasks from Simple Kanban
- Assign to AI agents for execution
- Track progress automatically
- Everything logged to .blackbox

### Example Workflow:

```
Morning in Vietnam:
1. Open Simple Kanban (5678)
2. Add 10 tasks for the day:
   - "Fix navigation bug"
   - "Add dark mode"
   - "Refactor user service"
   - "Update docs"
   - etc.

3. Prioritize them on the board
4. Pick top 3 for AI execution

Evening:
5. Create 3 tasks in Vibe Kanban (3000)
6. Assign to Gemini agent
7. Go to sleep

Next Morning:
8. Wake up to completed work!
9. Review in Vibe Kanban
10. Update Simple Kanban to reflect completion
```

---

## 🎯 Best Practices

### For Simple Kanban:
- Keep it simple - don't overthink
- Use it as a capture tool for ideas
- Review and prioritize daily
- Move completed tasks to "Done" column

### For Vibe Kanban:
- Only add tasks that need AI execution
- Be specific in task descriptions
- Review agent progress regularly
- Check .blackbox for detailed tracking
- Use for coding-heavy tasks

### For Both:
- Keep them in sync
- Don't duplicate tasks
- Use Simple Kanban for planning
- Use Vibe Kanban for execution
- Review both systems weekly

---

## 🔧 Quick Commands

### Check What's Running:
```bash
# On Mac Mini
docker ps | grep -E "(kanban|vibe)"
```

### Access Simple Kanban:
```bash
# Direct (on Mac Mini)
open http://localhost:5678

# From MacBook (via SSH tunnel)
open http://localhost:5678
```

### Access Vibe Kanban:
```bash
# Direct (on Mac Mini)
open http://localhost:3000

# From MacBook (via SSH tunnel)
open http://localhost:3000
```

### Check Vibe Kanban Tracking:
```bash
# See what's being tracked to .blackbox
cat ~/SISO-INTERNAL/.blackbox/.plans/active/vibe-kanban-work/active-tasks.md

# See completed tasks
cat ~/SISO-INTERNAL/.blackbox/.plans/active/vibe-kanban-work/completed-tasks.md
```

---

## 📊 System Comparison

| Feature | Simple Kanban | Vibe Kanban |
|---------|---------------|-------------|
| **Purpose** | Task organization | AI execution |
| **Complexity** | Simple | Advanced |
| **AI Agents** | No | Yes (Gemini, Claude) |
| **Code Execution** | No | Yes |
| **Git Integration** | No | Yes |
| **.blackbox Tracking** | No | Yes (automatic) |
| **Best For** | Planning | Execution |
| **Port** | 5678 | 3000 |
| **Learning Curve** | Easy | Moderate |

---

## 🎁 You Have the Best of Both Worlds!

**Simple Kanban** = Your visual planning board
- Easy to use
- Beautiful interface
- Quick task capture
- Manual organization

**Vibe Kanban** = Your AI execution engine
- Powerful automation
- Agent orchestration
- Automatic tracking
- Heavy lifting

---

## 💡 Pro Tips

1. **Start Simple:** Use Simple Kanban for everything initially
2. **Graduate to Vibe:** Move complex tasks to Vibe Kanban
3. **Check .blackbox:** All Vibe Kanban work is tracked automatically
4. **Daily Review:** Check both systems each morning
5. **Weekly Cleanup:** Archive completed tasks from both systems

---

## 🚀 Next Steps

1. **Try Both Systems:**
   - Open Simple Kanban: http://192.168.0.29:5678
   - Open Vibe Kanban: http://192.168.0.29:3000

2. **Create Your First Workflow:**
   - Add 5 tasks to Simple Kanban
   - Pick 1 for AI execution
   - Create it in Vibe Kanban
   - Watch the magic happen!

3. **Monitor from Anywhere:**
   - Set up SSH tunnels from your MacBook
   - Check progress on your phone
   - Wake up to completed work

---

## 📖 Full Documentation

- **Vibe Kanban Setup:** `QUICKSTART-VIBE-KANBAN.md`
- **Vibe Kanban Integration:** `VIBE-KANBAN-INTEGRATION-SUMMARY.md`
- **Vibe Kanban Details:** `.blackbox/.plans/active/vibe-kanban-integration.md`

---

## ✅ Summary

You now have:
- 🎨 **Simple Kanban** - Beautiful, easy task planning
- 🤖 **Vibe Kanban** - Powerful AI execution engine
- 📊 **.blackbox** - Complete memory system
- 🌐 **Remote Access** - Work from anywhere
- 🚀 **24/7 Operation** - Mac Mini works while you sleep

**Use Simple Kanban for planning, Vibe Kanban for execution!** 🎯

Both systems complement each other perfectly. You can capture ideas quickly in Simple Kanban, then execute the important ones with AI in Vibe Kanban. Everything is tracked automatically, and you can monitor from anywhere in the world!
