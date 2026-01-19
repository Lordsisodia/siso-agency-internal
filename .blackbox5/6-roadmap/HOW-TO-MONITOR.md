# How to Monitor Research Agents - Complete Guide

**Date:** 2026-01-19
**Purpose:** Understand how to verify autonomous research agents are working and what framework powers them

---

## 🤖 Framework: Claude Code Task Tool

### What Framework Are We Using?

The autonomous research agents are powered by **Claude Code's Task Tool**, which:

1. **Spawns independent agent instances** - Each research category gets its own agent
2. **Runs in background** - Agents work asynchronously without blocking
3. **Has access to all tools** - Web search, file operations, documentation
4. **Persists context** - Each agent maintains its own conversation context
5. **Full logging** - All actions are logged to output files

### Technical Details

```
Framework: Claude Code (by Anthropic)
Task System: Async agent spawning
Session Management: Per-agent conversation contexts
Output Storage: /tmp/claude/.../tasks/{agentId}.output
Working Directory: .blackbox5/roadmap/01-research/{category}/
```

---

## 🔍 How to Check Agents Are Actually Running

### Method 1: View Agent Output Files (REAL-TIME)

```bash
# See all active agents
ls -la /tmp/claude/-Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/tasks/

# Monitor specific agent output (real-time)
tail -f /tmp/claude/-Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/tasks/a5f6e4d.output

# View completed agent output
cat /tmp/claude/-Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/tasks/ab4d103.output
```

### Method 2: Use TaskOutput Tool (PROGRAMMATIC)

```python
# In Claude Code, use:
TaskOutput(task_id="a5f6e4d", block=True, timeout=30000)
```

### Method 3: Check Research Files (DELIVERABLES)

```bash
# View research logs (main deliverables)
cat .blackbox5/roadmap/01-research/memory-context/research-log.md

# List all research logs
find .blackbox5/roadmap/01-research -name "research-log.md"

# Check for session summaries
find .blackbox5/roadmap/01-research -path "*/session-summaries/*.md"

# View findings
find .blackbox5/roadmap/01-research -path "*/findings/*/*.md"
```

---

## 📊 Real Example: Memory & Context Agent (a5f6e4d)

### What It Actually Did

Looking at the actual output, the agent:

1. **Created research directory structure**
2. **Searched arxiv for whitepapers:**
   - CMT: Compression Memory Training
   - DiffKV: Differentiated Memory Management
   - Context Engineering Survey
   - GraphRAG
   - LightRAG

3. **Analyzed GitHub repositories:**
   - Microsoft's LLMLingua
   - GraphRAG and LightRAG implementations
   - Awesome lists for AI memory
   - KV cache compression tools

4. **Researched best practices:**
   - OpenAI state management docs
   - Anthropic Claude Sonnet 4.5 memory features
   - Vector database deployment
   - Long-term memory architectures

5. **Documented EVERYTHING:**
   - Thought process (step-by-step reasoning)
   - Timeline (4 hours total)
   - Sources reviewed (10 sources with time spent on each)
   - 15 key findings
   - Next steps

### Actual Deliverable Created

The agent created: `.blackbox5/roadmap/01-research/memory-context/research-log.md`

**Contents include:**
- ✅ Session summary (1 session, 4 hours, 20+ sources, 5 whitepapers, 8 repos, 15 findings)
- ✅ Complete research timeline with thought process
- ✅ All sources reviewed with time stamps
- ✅ 15 key findings with specific details
- ✅ Next steps for implementation

---

## 🎯 How to Verify Agent Activity

### Checkpoint 1: Agent Progress Notifications

You'll see system reminders like:
```
Agent a5f6e4d progress: 4 new tools used, 990 new tokens.
```

This means the agent is:
- **Using tools** - Actively researching (web search, file operations)
- **Consuming tokens** - Processing information
- **Making progress** - Moving through research plan

### Checkpoint 2: Research Log Updates

The research log file shows real-time updates:
```bash
# Watch the file grow
tail -f .blackbox5/roadmap/01-research/memory-context/research-log.md

# Check recent changes
stat .blackbox5/roadmap/01-research/*/research-log.md
```

### Checkpoint 3: Output File Growth

```bash
# Check output file size (should be growing)
ls -lh /tmp/claude/-Users-shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/tasks/a5f6e4d.output

# Count lines in output
wc -l /tmp/claude/-Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/tasks/a5f6e4d.output
```

---

## 🔬 What Each Agent Documents

### Research Log Structure

```markdown
# Research Log: {Category}

## Session Summary
- Total Sessions: 1
- Total Hours: 4
- Sources Analyzed: 20+
- Whitepapers Reviewed: 5
- GitHub Repos Analyzed: 8
- Key Findings: 15

## Research Timeline

### Session 1 - 2026-01-19
**Duration:** 4 hours
**Focus:** Initial comprehensive research

**Thought Process:**
1. Started with whitepapers - Focused on...
2. Moved to GitHub repositories - Identified...
3. Researched industry best practices - Analyzed...

**Sources Reviewed:**
- [x] CMT: Compression Memory Training - 20 min
- [x] DiffKV: Differentiated Memory Management - 15 min
...

**Key Findings:**
1. Graph-based RAG is dominant
2. Memory compression critical
3. Context management formalized
...

**Next Steps:**
1. Create detailed analysis documents
2. Document GitHub repository findings
3. Generate specific proposals
```

### Session Summaries

Each session creates a separate summary file:
```bash
.blackbox5/roadmap/01-research/{category}/session-summaries/session-20260119-{timestamp}.md
```

---

## 📋 Monitoring Commands Quick Reference

```bash
# ========================================
# CHECK AGENT STATUS
# ========================================

# 1. List all agent output files
ls -la /tmp/claude/-Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/tasks/

# 2. Monitor specific agent in real-time
tail -f /tmp/claude/-Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/tasks/a5f6e4d.output

# 3. Check all research logs
find .blackbox5/roadmap/01-research -name "research-log.md" -exec tail -20 {} \;

# 4. View completed research
find .blackbox5/roadmap/01-research -path "*/session-summaries/*.md"

# 5. Check findings
find .blackbox5/roadmap/01-research/findings -name "*.md" -type f

# 6. See recent file changes
find .blackbox5/roadmap/01-research -name "*.md" -mmin -60 -ls

# ========================================
# UNDERSTAND RESEARCH PROGRESS
# ========================================

# 7. Count research sessions
grep -h "Total Sessions:" .blackbox5/roadmap/01-research/*/research-log.md

# 8. Count sources analyzed
grep -h "Sources Analyzed:" .blackbox5/roadmap/01-research/*/research-log.md

# 9. Count key findings
grep -h "Key Findings:" .blackbox5/roadmap/01-research/*/research-log.md

# 10. Total token usage (from system reminders)
# (Counted automatically by Claude Code)
```

---

## 🎓 Agent Lifecycle

### Launch Phase
```python
# Agent launched via Task tool
Task(
    description="Memory & Context Research",
    prompt="Research mission...",
    subagent_type="general-purpose",
    run_in_background=True
)
# Returns: agent_id (e.g., "a5f6e4d")
```

### Active Phase
```
Agent executes research plan:
1. Search arxiv for whitepapers
2. Analyze GitHub repositories
3. Review technical blogs
4. Document findings
5. Update research log
6. Generate recommendations
```

### Completion Phase
```
Task finishes when:
- All objectives complete
- Research time limit reached
- Agent determines sufficient research done
```

---

## 🔧 Troubleshooting

### Agent Not Making Progress?

```bash
# Check if agent is still running
ps aux | grep -i claude

# Check output file for errors
cat /tmp/claude/.../tasks/{agent_id}.output | grep -i error

# Check for rate limiting (429 errors)
cat /tmp/claude/.../tasks/{agent_id}.output | grep "429"
```

### Research Log Not Updating?

```bash
# Check file permissions
ls -la .blackbox5/roadmap/01-research/*/research-log.md

# Check if agent is working directory
pwd  # Should be: .../.blackbox5/roadmap/01-research
```

---

## 📊 Agent Status Dashboard

### Currently Active Agents (8 running)

| Agent ID | Category | Progress | Output File |
|----------|----------|----------|-------------|
| a5f6e4d | Memory & Context | ✅ 4 hours, 20+ sources, 15 findings | `/tmp/claude/.../a5f6e4d.output` |
| a7a1a6d | Reasoning & Planning | ✅ 89,568 tokens | `/tmp/claude/.../a7a1a6d.output` |
| a21e4b9 | Skills & Capabilities | ✅ 93,496 tokens | `/tmp/claude/.../a21e4b9.output` |
| a6faaea | Execution & Safety | ✅ 61,315 tokens | `/tmp/claude/.../a6faaea.output` |
| aff0f74 | Agent Types | ✅ 67,553 tokens | `/tmp/claude/.../aff0f74.output` |
| ab4d103 | Learning & Adaptation | ✅ COMPLETED | `/tmp/claude/.../ab4d103.output` |
| a2a6c86 | Data Architecture | ✅ 78,981 tokens | `/tmp/claude/.../a2a6c86.output` |
| ab9e0e3 | Performance | ✅ 37,766 tokens | `/tmp/claude/.../ab9e0e3.output` |

---

## ✅ Verification Checklist

### To Confirm Agents Are Working:

- [ ] See progress notifications ("Agent XXX progress: Y new tools used")
- [ ] Output files exist and are growing
- [ ] Research logs are being updated
- [ ] Token count increasing
- [ ] Session summaries created on completion
- [ ] Findings directories populated

### To See Results:

- [ ] Read research-log.md files
- [ ] Review session-summaries/
- [ ] Check findings/ directories
- [ ] Synthesize across agents

---

## 🎯 Summary

**Framework:** Claude Code Task Tool
**Execution:** Async background agents
**Documentation:** Full transparency with thought processes
**Verification:** Multiple methods (output files, logs, findings)

The agents ARE doing real research and documenting everything. You can verify this at any time using the commands above!

---

**Last Updated:** 2026-01-19
**Agent Framework:** Claude Code Task Tool
**Status:** Active and Working ✅
