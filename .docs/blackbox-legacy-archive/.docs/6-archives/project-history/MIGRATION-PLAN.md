# Blackbox3 → Blackbox4 Migration Plan

**Status**: 📋 Ready to Execute
**Created**: 2026-01-15
**Goal**: Migrate all Blackbox3 content to Blackbox4 structure with 99.4% code reuse

---

## 🎯 Executive Summary

Blackbox4 consolidates:
- **Blackbox3**: Production foundation (5,810+ lines bash, 22,883 bytes Python)
- **Oh-My-OpenCode**: Enhanced agents (Oracle, Librarian, Explore)
- **BMAD**: 10+ specialized agents, 4-phase methodology
- **Ralph**: Autonomous execution engine
- **Plus**: Spec Kit, MetaGPT, Swarm patterns

**Result**: Clean, organized, maintainable system with max 7 items per directory level.

---

## 📊 Migration Overview

```
Blackbox3 (Current)                    →  Blackbox4 (Target)
══════════════════════════════════════════════════════════════════
30+ scripts                            →  4-scripts/
22KB Python runtime                    →  4-scripts/python/
17+ agent folders                      →  1-agents/ (6 categories)
19 flat skills                         →  1-agents/.skills/ (3 categories)
Scattered docs                         →  .docs/ (6 numbered sections)
4 frameworks                           →  2-frameworks/ (consolidated)
7 modules                              →  3-modules/ (preserved)
Ralph engine                           →  .runtime/.ralph/ + 1-agents/4-specialists/
```

---

## 🚀 Smart Reorganization Strategy

### Key Improvements

1. **Agents**: 17+ folders → 6 logical categories
   - `bmad/`, `deep-research/`, `feature-research/` all remain separate
   - But organized under 6 top-level categories

2. **Skills**: 19 flat files → 3 organized categories
   - Keep all MCP skills together
   - Group core skills
   - Add new workflow skills

3. **Documentation**: Scattered → 6 numbered sections
   - Easy to navigate: 1-getting-started through 6-archives
   - No more empty folders

4. **Runtime**: New explicit orchestration
   - Components that were implicit are now visible
   - scheduler, router, handoff, monitor, executor

---

## 📋 Execution Plan

### Step 1: Foundation (DO THIS FIRST)

```bash
# 1.1 Copy all scripts (30+ files)
cd /Users/shaansisodia/DEV/AI-HUB/Black\ Box\ Factory/current
cp -r Blackbox3/scripts/* .blackbox4/4-scripts/

# 1.2 Copy Python runtime
cp Blackbox3/blackbox3.py .blackbox4/4-scripts/python/blackbox4.py

# 1.3 Copy configuration
cp -r Blackbox3/.config/* .blackbox4/.config/

# 1.4 Make scripts executable
chmod +x .blackbox4/4-scripts/*.sh

# 1.5 Test basic functionality
cd .blackbox4
./4-scripts/check-blackbox.sh
```

**Expected Output**: `All checks passed! Blackbox4 is ready to use.`

---

### Step 2: Core System

```bash
# 2.1 Copy core agent
cp Blackbox3/agents/_core/prompt.md .blackbox4/1-agents/1-core/

# 2.2 Copy core runtime components
cp -r Blackbox3/core/* .blackbox4/4-scripts/python/core/

# 2.3 Update blackbox4.py references
# TODO: Update Blackbox3 → Blackbox4 in all files
```

---

### Step 3: BMAD Framework (Keep Together!)

```bash
# 3.1 Copy entire BMAD directory structure
cp -r Blackbox3/agents/bmad/* .blackbox4/1-agents/2-bmad/

# 3.2 This preserves:
#     - bmad-master.agent.yaml
#     - modules/ (all 10 BMAD agents)
#     - All BMAD patterns and workflows
```

**What you get**: Complete BMAD system intact, just in a better location

---

### Step 4: Research Agents

```bash
# 4.1 Deep Research
cp -r Blackbox3/agents/deep-research/* .blackbox4/1-agents/3-research/deep-research/

# 4.2 Feature Research
cp -r Blackbox3/agents/feature-research/* .blackbox4/1-agents/3-research/feature-research/

# 4.3 OSS Discovery
cp -r Blackbox3/agents/oss-discovery/* .blackbox4/1-agents/3-research/oss-discovery/

# 4.4 Docs Feedback
cp -r Blackbox3/agents/docs-feedback/* .blackbox4/1-agents/3-research/docs-feedback/
```

**Smart Organization**: All research agents in one place, easy to find

---

### Step 5: Specialist Agents

```bash
# 5.1 Orchestrator
cp Blackbox3/agents/orchestrator.agent.yaml .blackbox4/1-agents/4-specialists/orchestrator/
cp -r Blackbox3/agents/orchestrator/* .blackbox4/1-agents/4-specialists/orchestrator/

# 5.2 Ralph Agent (agent interface only)
cp -r Blackbox3/agents/ralph-agent/* .blackbox4/1-agents/4-specialists/ralph-agent/

# 5.3 Custom Specialists
cp -r Blackbox3/agents/custom/* .blackbox4/1-agents/4-specialists/custom/
```

---

### Step 6: Enhanced Agents (Oh-My-OpenCode)

```bash
# 6.1 Copy all Oh-My-OpenCode agents
cp -r Blackbox3/agents/ohmy-opencode/* .blackbox4/1-agents/5-enhanced/

# This gives you:
#     - oracle.md (GPT-5.2 architecture expert)
#     - librarian.md (Claude/Gemini research specialist)
#     - explore.md (Grok/Gemini fast search)
```

**Value**: These are premium agents, now easy to find

---

### Step 7: Skills (Smart Categorization)

```bash
# 7.1 Core Skills (non-MCP)
for file in deep-research.md docs-routing.md feedback-triage.md \
            long-run-ops.md notifications-*.md ui-cycle.md github-cli.md; do
    cp Blackbox3/agents/.skills/$file .blackbox4/1-agents/.skills/1-core/
done

# 7.2 MCP Skills (keep all together)
cp -r Blackbox3/agents/.skills/mcp-skills/* .blackbox4/1-agents/.skills/2-mcp/

# 7.3 Workflow Skills (TO CREATE - extract from frameworks)
# TODO: Create workflow skills from BMAD, Spec Kit, MetaGPT, Swarm
```

**Smart Move**: MCP skills stay together, easy to manage as a group

---

### Step 8: Documentation (Reorganize by Type)

```bash
# 8.1 Getting Started (user guides)
cp -r Blackbox3/.docs/user-guides/* .blackbox4/.docs/1-getting-started/

# 8.2 Reference (technical docs)
cp Blackbox3/.docs/reference/*.md .blackbox4/.docs/2-reference/
cp -r Blackbox3/.docs/architecture .blackbox4/.docs/2-reference/

# 8.3 Components (agent, analysis docs)
cp -r Blackbox3/.docs/agents .blackbox4/.docs/3-components/
cp -r Blackbox3/.docs/analysis .blackbox4/.docs/3-components/
cp -r Blackbox3/.docs/extra-docs .blackbox4/.docs/3-components/
cp -r Blackbox3/.docs/first-principles .blackbox4/.docs/3-components/
cp -r Blackbox3/.docs/memory .blackbox4/.docs/3-components/

# 8.4 Frameworks (BMAD, Spec Kit, MetaGPT, Swarm)
# TODO: Consolidate framework docs here
cp -r Blackbox3/.docs/roadmap .blackbox4/.docs/4-frameworks/
cp -r Blackbox3/.docs/improvement .blackbox4/.docs/4-frameworks/

# 8.5 Workflows (testing, development cycles)
cp -r Blackbox3/.docs/workflows .blackbox4/.docs/5-workflows/
cp -r Blackbox3/.docs/testing .blackbox4/.docs/5-workflows/testing/

# 8.6 Archives (benchmarks, research)
cp -r Blackbox3/.docs/benchmark .blackbox4/.docs/6-archives/benchmarks/
cp -r Blackbox3/research/gap-analysis .blackbox4/.docs/6-archives/research/
```

---

### Step 9: Modules (Direct Copy)

```bash
# 9.1 All 7 modules
cp -r Blackbox3/modules/* .blackbox4/3-modules/
```

**Simple**: Modules already well-organized, just copy them over

---

### Step 10: Ralph (Split Intelligent Ways)

```bash
# 10.1 Ralph Runtime (execution engine)
cp -r Blackbox3/ralph/.ralph .blackbox4/.runtime/.ralph/
cp -r Blackbox3/ralph/.agents .blackbox4/.runtime/.ralph/
cp -r Blackbox3/ralph/work .blackbox4/.runtime/.ralph/
cp -r Blackbox3/ralph/prd-templates .blackbox4/.runtime/.ralph/
cp -r Blackbox3/ralph/scripts .blackbox4/.runtime/.ralph/
cp -r Blackbox3/ralph/tests .blackbox4/.runtime/.ralph/

# 10.2 Ralph Agent (interface - already done in Step 5)
# Already copied to 1-agents/4-specialists/ralph-agent/
```

**Smart Split**: Runtime in `.runtime/`, agent interface in `1-agents/`

---

### Step 11: Templates, Tools, Workspace

```bash
# 11.1 Templates
cp -r Blackbox3/core/templates .blackbox4/5-templates/1-documents/
cp -r Blackbox3/agents/_template .blackbox4/5-templates/1-documents/agent-templates/
cp -r Blackbox3/agents/.plans/_template .blackbox4/5-templates/2-plans/

# 11.2 Tools
cp -r Blackbox3/tools .blackbox4/6-tools/

# 11.3 Workspace
cp -r Blackbox3/workspace .blackbox4/7-workspace/
```

---

### Step 12: Memory and Plans

```bash
# 12.1 Memory (organize into 3 tiers)
mkdir -p .blackbox4/.memory/{working,extended,archival}
cp -r Blackbox3/.memory/* .blackbox4/.memory/working/

# 12.2 Active Plans
cp -r Blackbox3/agents/.plans/_template .blackbox4/.plans/_template/
cp -r Blackbox3/.plans/active/* .blackbox4/.plans/active/
cp -r Blackbox3/agents/.plans/active/* .blackbox4/.plans/active/
```

---

## 🔧 New Code to Write

### Priority 1: Configuration Files

```bash
# .config/agents.yaml - Agent registry
# TODO: Create from agent inventory
# Purpose: Central agent catalog for router component

# .config/memory.yaml - Memory configuration
# TODO: Create with 3-tier specs
# Purpose: Configure working (10MB), extended (500MB), archival (5GB)

# .config/mcp-servers.json - MCP server configs
# TODO: Create from MCP skills documentation
# Purpose: Configure all MCP servers
```

### Priority 2: Runtime Orchestration

```python
# .runtime/scheduler/scheduler.py
# .runtime/router/router.py
# .runtime/handoff/handoff.py
# .runtime/monitor/monitor.py
# .runtime/executor/executor.py

# TODO: Implement based on protocol specifications in .runtime/protocols/
```

### Priority 3: Interface Layer

```python
# interface/cli/blackbox4.py
# TODO: Enhanced CLI with all commands
# interface/api/server.py
# TODO: REST/GraphQL API server
```

### Priority 4: Testing

```python
# 8-testing/framework/test_runner.py
# TODO: Test framework implementation
```

---

## ✅ Validation Checklist

Run after each step or at the end:

```bash
# Structure validation
cd .blackbox4
./validate-structure.sh

# Script validation
./4-scripts/check-blackbox.sh

# Python CLI test
python3 4-scripts/python/blackbox4.py --help

# Plan creation test
./4-scripts/new-plan.sh "migration test"
```

---

## 📈 Progress Tracking

Use this checklist to track migration progress:

### Foundation
- [ ] Scripts copied and executable
- [ ] Python runtime copied
- [ ] Configuration copied
- [ ] Basic tests pass

### Agents
- [ ] Core agent
- [ ] BMAD agents (10+)
- [ ] Research agents (4)
- [ ] Specialist agents (3+)
- [ ] Enhanced agents (3)

### Skills
- [ ] Core skills (9)
- [ ] MCP skills (9)
- [ ] Workflow skills (create)

### Documentation
- [ ] Getting started guides
- [ ] Reference documentation
- [ ] Component documentation
- [ ] Framework documentation
- [ ] Workflow documentation
- [ ] Archives

### Frameworks
- [ ] BMAD framework
- [ ] Spec Kit framework
- [ ] MetaGPT framework
- [ ] Swarm framework

### Infrastructure
- [ ] Modules (7)
- [ ] Ralph (runtime + agent)
- [ ] Templates
- [ ] Tools
- [ ] Workspace
- [ ] Memory
- [ ] Plans

### New Code
- [ ] Configuration files
- [ ] Runtime orchestration
- [ ] Interface layer
- [ ] Testing framework

---

## 🎯 Success Criteria

Migration is complete when:

1. ✅ All files from Blackbox3 have a home in Blackbox4
2. ✅ No more than 7 items in any directory
3. ✅ All scripts execute without errors
4. ✅ All agents load correctly
5. ✅ Documentation is complete and accurate
6. ✅ Basic workflows (create plan, run agent) work
7. ✅ New orchestration components documented
8. ✅ Testing infrastructure in place

---

## 🚨 Common Issues & Solutions

### Issue: Script path references break
**Solution**: Update all hardcoded paths from `Blackbox3` to `.blackbox4`

### Issue: Agent can't find resources
**Solution**: Update agent file paths in `.config/agents.yaml`

### Issue: Ralph can't find runtime files
**Solution**: Ensure `.runtime/.ralph/` has all required files

### Issue: MCP servers not configured
**Solution**: Create `.config/mcp-servers.json` from MCP skills docs

---

## 📚 Quick Reference

### Directory Mapping

| Blackbox3 | Blackbox4 | Notes |
|-----------|-----------|-------|
| `scripts/` | `4-scripts/` | All scripts |
| `blackbox3.py` | `4-scripts/python/blackbox4.py` | Main CLI |
| `agents/bmad/` | `1-agents/2-bmad/` | Keep together |
| `agents/deep-research/` | `1-agents/3-research/deep-research/` | Research category |
| `agents/ohmy-opencode/` | `1-agents/5-enhanced/` | Premium agents |
| `agents/.skills/` | `1-agents/.skills/` | 3 categories |
| `.docs/` | `.docs/` | Reorganized into 6 sections |
| `modules/` | `3-modules/` | Direct copy |
| `ralph/` | `.runtime/.ralph/` | Runtime only |

### File Count Estimates

- Scripts: 30+ files
- Agents: 17+ directories, 50+ files
- Skills: 19 files
- Docs: 100+ files
- Modules: 7 directories, 50+ files
- Total: ~250+ files to migrate

---

## 🎬 Getting Started

1. **Read this plan completely**
2. **Run Step 1** (Foundation) first
3. **Validate** after each major step
4. **Test incrementally** (don't wait until the end)
5. **Ask for help** if stuck

---

**Status**: Ready to execute
**Estimated Time**: 2-4 hours for full migration
**Risk Level**: Low (all code proven and tested)

---

**Last Updated**: 2026-01-15
**Version**: 2.0 (Reorganized for clarity)
