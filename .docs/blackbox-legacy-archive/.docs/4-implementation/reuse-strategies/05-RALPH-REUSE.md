# 05 - Ralph Reuse Strategy

**Status:** ✅ ALREADY INTEGRATED (NO ACTION NEEDED)
**Source:** `Blackbox3/ralph/` (already in Blackbox3)
**Destination:** `blackbox4/ralph/` (keep as-is)

**Action:** Just copy Blackbox3/ralph directory. No changes.

---

## 📦 What You Already Have

### Ralph Integration (Already in Blackbox3)

**Location:** `blackbox3/ralph/`

**Components:**

| Component | Purpose | Status |
|-----------|---------|--------|
| `.agents/` | Ralph-specific agents | ✅ Working |
| `.git/` | Git integration | ✅ Working |
| `.ralph/` | Ralph configuration | ✅ Working |
| `prd-templates/` | PRD templates | ✅ Working |
| `scripts/` | Ralph scripts | ✅ Working |
| `tests/` | Ralph tests | ✅ Working |
| `work/` | Ralph workspace | ✅ Working |

**Reference:** 
- `blackbox3/ralph-integration-strategy.md`
- `blackbox3/ralph-implementation-plan.md`

---

## 🔍 Ralph Integration Details

### A. Ralph Wrapper Scripts (Already in Blackbox3)

**Location:** `scripts/`

| Script | Purpose | Status |
|--------|---------|--------|
| `autonomous-loop.sh` | Wrapper for ralph_loop.sh | ✅ In Blackbox3 |
| `generate-ralph-prompt.sh` | Convert BB3 → Ralph format | ✅ In Blackbox3 |
| `ralph-status.sh` | Show Ralph status in BB3 format | ✅ In Blackbox3 |
| `reset-circuit.sh` | Reset Ralph circuit breaker | ✅ In Blackbox3 |

**Note:** These are thin wrappers that call Ralph's `ralph_loop.sh`.

---

### B. File Format Conversion (Already Implemented)

**Blackbox3 → Ralph Mapping:**

| Blackbox3 File | Ralph File | Conversion |
|----------------|------------|-------------|
| `README.md` | `PROMPT.md` | Concatenate README + context + checklist |
| `checklist.md` | `@fix_plan.md` | Convert checkboxes |
| `status.md` | `.exit_signals` | Parse status, update exit signals |
| `artifacts/*.md` | `logs/*.log` | Copy/symlink |

**Status:** ✅ All converters already implemented in Blackbox3 scripts.

---

### C. Ralph Engine (External, Not Copied)

**Location:** `/Users/shaansisodia/DEV/AI-HUB/ralph-claude-code/`

**What Ralph Provides:**

| Feature | Description |
|---------|-------------|
| **Autonomous Loop** | Runs Claude Code continuously until complete |
| **Circuit Breaker** | Prevents infinite loops (stops after 3 no-progress loops) |
| **Exit Detection** | Knows when work is complete (all tasks done) |
| **Response Analysis** | Analyzes each response for progress |
| **Session Management** | Context continuity across loops |
| **Rate Limiting** | Controls API costs |
| **Tmux Monitoring** | Real-time progress visualization |

**Integration:** Blackbox4 calls Ralph as external dependency via wrapper scripts.

---

## 🚀 Usage (Already Working)

### Manual Mode (Blackbox3 Style)

```bash
cd blackbox4/agents/.plans/my-plan

# 1. Edit plan (your workflow, your control)
vim README.md     # Edit goal, context
vim checklist.md  # Edit tasks

# 2. Work manually with AI tools
# Blackbox4 provides context via .memory/extended/
```

### Autonomous Mode (Ralph-Powered)

```bash
cd blackbox4/agents/.plans/my-plan

# 1-2: Same as manual mode (create plan, edit files)

# 3. Generate Ralph files (automatic conversion)
blackbox4 generate-ralph
# Creates: PROMPT.md, @fix_plan.md from README.md, checklist.md

# 4. Start autonomous execution
blackbox4 autonomous-loop --monitor
# Behind scenes: calls ralph_loop.sh with BB4 plans
# Ralph runs until all tasks complete

# 5. Review results
cat artifacts/summary.md
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Ralph configuration (from Blackbox3)
export RALPH_HOME="/Users/shaansisodia/DEV/AI-HUB/ralph-claude-code"

# Blackbox4 configuration
export BLACKBOX4_HOME="$(pwd)"
export BLACKBOX4_PLANS_DIR="agents/.plans"
```

### Ralph Configuration (RALPH_HOME/.ralphrc)

```bash
# ~/.ralphrc or $RALPH_HOME/.ralphrc
max_calls_per_hour: 100
loop_pause: 2
timeout_minutes: 15
```

---

## 🎯 Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     BLACKBOX4 LAYER                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Blackbox4 Plans (Manual Mode)                    │  │
│  │    ↓                                                 │  │
│  │  README.md + checklist.md → PROMPT.md            │  │
│  │                             + @fix_plan.md        │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                 │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Blackbox4 Autonomous Loop (Ralph Wrapper)        │  │
│  │    ↓                                                 │  │
│  │  Calls: ralph_loop.sh --monitor                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                 │
└─────────────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────────┐
│                   RALPH ENGINE LAYER                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ralph_loop.sh (autonomous engine)                   │  │
│  │    ↓                                                 │  │
│  │  while true:                                        │  │
│  │    - Check circuit breaker                          │  │
│  │    - Check exit conditions                          │  │
│  │    - Execute claude code                            │  │
│  │    - Analyze response                              │  │
│  │    - Update circuit state                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ What You Get After Copying Blackbox3

1. ✅ **Ralph Wrapper Scripts** - 4 scripts (autonomous-loop, generate-ralph, status, reset)
2. ✅ **File Converters** - BB4 ↔ Ralph format conversion
3. ✅ **Ralph Configuration** - `.ralph/` directory with all settings
4. ✅ **PRD Templates** - Ralph's PRD templates
5. ✅ **Tests** - Ralph integration tests
6. ✅ **Documentation** - Full integration guides

**Total Code Reused:** 100% of Ralph integration (already working)
**New Code to Write:** 0 lines

---

## 📊 Integration Summary

| Component | Source | Size | Action | Status After |
|-----------|--------|------|--------|--------------|
| **Ralph Wrapper** | Blackbox3/scripts/ | 4 scripts | Copy | ✅ Working |
| **Converters** | Blackbox3/scripts/lib/ | File conversion | Copy | ✅ Working |
| **Ralph Config** | Blackbox3/ralph/ | Full system | Copy | ✅ Working |
| **PRD Templates** | Blackbox3/ralph/prd-templates/ | Templates | Copy | ✅ Working |
| **Tests** | Blackbox3/ralph/tests/ | Tests | Copy | ✅ Working |
| **External Ralph** | ralph-claude-code/ | External | Keep | ✅ External |

**Reuse Ratio:** 100% existing code, 0% new code

---

## ✅ Success Criteria

After copying Blackbox3 to `blackbox4/`:

1. ✅ Ralph wrapper scripts present and executable
2. ✅ File converters work (BB4 ↔ Ralph)
3. ✅ Can generate Ralph files: `blackbox4 generate-ralph`
4. ✅ Can run autonomous loop: `blackbox4 autonomous-loop --monitor`
5. ✅ Ralph circuit breaker prevents infinite loops
6. ✅ Exit detection stops when work complete
7. ✅ All documentation is available

---

## 🎯 Next Step

**Go to:** `06-SPECKIT-REUSE.md`

**Add Spec Kit slash command patterns (as documentation, not code).**
