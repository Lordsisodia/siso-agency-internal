# Blackbox3 Quick Reference

**One-Page Guide to Booking & Using Blackbox3**

---

## 🎯 What is Blackbox3?

A **manual convention-based system** for organizing AI-assisted development work. It provides structure, templates, and workflows for working with AI agents like Claude Code, Cursor, or Windsurf.

---

## 🚀 Quick Start (30 Seconds)

```bash
# 1. Navigate to Blackbox3
cd "/Users/shaansisodia/DEV/AI-HUB/Black Box Factory/current/Blackbox3"

# 2. Create a plan (this is your "booking")
./scripts/new-plan.sh "your-task-name"

# 3. Navigate to your plan
cd agents/.plans/$(ls -t agents/.plans/ | head -1)

# 4. Open Claude Code/Cursor and start working!
```

---

## 📋 Three Ways to Book

### 1. Simple Plan (Most Common)
```bash
./scripts/new-plan.sh "task-name"
```
**Best for:** Single tasks, research, feature work

### 2. Feature Research
```bash
./scripts/start-feature-research.sh
```
**Best for:** Deep research, competitive analysis

### 3. Multi-Agent Cycle
```bash
./scripts/start-agent-cycle.sh
```
**Best for:** Complex projects with multiple specialists

---

## 🔄 The Workflow

```
READ → CHECK → PLAN → EXECUTE → CAPTURE → LOG
```

1. **READ** `context.md` - Understand project state
2. **CHECK** `tasks.md` - See what needs doing
3. **PLAN** - Create execution folder
4. **EXECUTE** - Work with AI in chat
5. **CAPTURE** - Save outputs to artifacts/
6. **LOG** - Update tasks.md

---

## 📝 Creating Checkpoints

As you work, create checkpoints:

```bash
./../../scripts/new-step.sh "phase" "What you accomplished"
```

**Example:**
```bash
./../../scripts/new-step.sh "research" "Analyzed 5 competitors"
./../../scripts/new-step.sh "synthesis" "Created synthesis document"
```

**Benefits:**
- ✓ Maintains context for long sessions
- ✓ Auto-compacts at 10+ steps
- ✓ Creates audit trail

---

## 🎭 Available Agents

| Agent | Purpose |
|-------|---------|
| **analyst** | Research, competitive analysis |
| **pm** | Product requirements, PRDs |
| **architect** | System architecture, design |
| **dev** | Implementation, coding |
| **qa** | Testing, validation |
| **sm** | Sprint management |
| **ux-designer** | User experience design |
| **tech-writer** | Documentation |

**Use agents:** `cd agents/<agent-name>/` and read `prompt.md`

---

## 📁 Directory Structure

```
Blackbox3/
├── agents/.plans/              # Your bookings
│   └── <timestamp>_<task>/
│       ├── README.md
│       ├── checklist.md
│       ├── status.md
│       ├── artifacts/    # Your outputs
│       └── context/      # Context management
├── agents/              # Agent definitions
├── scripts/             # Executable scripts
├── context.md           # Project state
├── tasks.md             # Backlog
└── protocol.md          # System rules
```

---

## 🛠️ Key Scripts

| Script | Purpose |
|--------|---------|
| `new-plan.sh` | Create new booking |
| `new-step.sh` | Create checkpoint |
| `start-feature-research.sh` | Start research workflow |
| `start-agent-cycle.sh` | Start multi-agent workflow |
| `validate-all.sh` | Validate all plans |
| `promote.sh` | Promote artifacts |

---

## 💡 Pro Tips

1. **Be specific** with plan names: `./scripts/new-plan.sh "react-state-research-2025"`
2. **Create checkpoints** often (every 30-60 minutes)
3. **Let context manage itself** - auto-compaction is automatic
4. **Use the right tool** - simple tasks → new-plan.sh, research → start-feature-research.sh
5. **Complete the loop** - update status.md, generate final report

---

## ✅ Completion Checklist

When done with a booking:

- [ ] Update `status.md` to mark complete
- [ ] Generate final report from template
- [ ] Promote artifacts to permanent location
- [ ] Update `tasks.md` if needed

---

## 📚 Documentation

- **Full Guide**: `HOW-TO-USE.md`
- **Quick Start**: `QUICK-START.md`
- **Protocol**: `protocol.md`
- **Memory Architecture**: `MEMORY-ARCHITECTURE.md`

---

## 🧪 Testing

Use the test environment for experiments:
```bash
cd "../test-environment"
./scripts/init-test-env.sh
```

---

**Ready? Create your first plan:**
```bash
./scripts/new-plan.sh "my-first-task"
```

**🚀 Happy Booking!**
