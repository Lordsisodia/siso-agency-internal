# Autonomous Loop Frameworks

**Status:** 🔥 Highest Priority (Critical Integration)
**Count:** 1 Framework
**Purpose:** Autonomous AI execution loops with parallel execution capabilities

---

## Overview

This category contains frameworks that implement autonomous AI execution loops. These frameworks continuously run AI agents in loops until all tasks are complete, with a focus on parallel execution and performance optimization.

---

## 1. Ralph-y (Ralphy)

**Type:** Autonomous AI Coding Loop
**Status:** 📚 Researched (Ready for Integration)
**Priority:** 🔥🔥🔥🔥🔥 (HIGHEST PRIORITY)
**Repository:** https://github.com/michaelshimeles/ralphy
**Version:** 3.1.0

### Purpose

Autonomous bash script that runs AI assistants (Claude Code, OpenCode, Codex, or Cursor) in a loop until all tasks in a PRD are complete.

### Key Insight

Ralph-y is **remarkably similar** to BlackBox5's RALPH Runtime, but with a different implementation approach:

| Aspect | Ralph-y | RALPH Runtime |
|--------|---------|---------------|
| **Language** | Bash | Python |
| **Complexity** | Simple | Sophisticated |
| **Parallel Strategy** | Git worktrees ✅ | Planned |
| **Multi-AI Support** | 4 engines ✅ | Claude only |
| **Task Sources** | PRD/YAML/GitHub | Plan files |
| **Decision Making** | Linear | Decision Engine ✅ |
| **State Management** | Minimal | Comprehensive ✅ |

**Conclusion:** Complementary frameworks, not competitive. Ralph-y provides git worktree execution, RALPH provides decision engine.

### Critical Features

#### 1. Git Worktree Parallel Execution ⭐⭐⭐⭐⭐
**Priority:** HIGHEST

Run multiple AI agents simultaneously, each in its own isolated git worktree:

```bash
./ralphy.sh --parallel                    # 3 agents (default)
./ralphy.sh --parallel --max-parallel 5   # 5 agents
```

**How It Works:**
- Each agent gets its own git worktree (separate directory)
- Each agent gets its own branch (`ralphy/agent-1-task-name`, etc.)
- Complete isolation from other agents

```
Agent 1 ─► worktree: /tmp/xxx/agent-1 ─► branch: ralphy/agent-1-create-user-model
Agent 2 ─► worktree: /tmp/xxx/agent-2 ─► branch: ralphy/agent-2-add-api-endpoints
Agent 3 ─► worktree: /tmp/xxx/agent-3 ─► branch: ralphy/agent-3-setup-database
```

**After Completion:**
- **Without `--create-pr`:** Branches auto-merged, AI resolves conflicts
- **With `--create-pr`:** Each task gets its own PR

**Benefits:**
- True parallel execution (no file conflicts)
- Isolated testing environments
- Easy cleanup on failure
- Merge conflict detection

#### 2. Multi-AI Engine Support
Support for 4 different AI engines:

| Engine | CLI Command | Permissions | Output |
|--------|-------------|-------------|--------|
| **Claude Code** | `claude` | `--dangerously-skip-permissions` | Tokens + cost estimate |
| **OpenCode** | `opencode` | `OPENCODE_PERMISSION='{\"*\":\"allow\"}'` | Tokens + actual cost |
| **Codex** | `codex` | N/A | Token usage (if provided) |
| **Cursor** | `agent` | `--force` | API duration (no tokens) |

#### 3. PRD-Driven Task Format
Natural task format using checkboxes:

```markdown
# My Project

## Tasks
- [ ] Create user authentication
- [ ] Add dashboard page
- [ ] Build API endpoints
```

**Alternative:**
- **YAML:** Structured task definitions with parallel groups
- **GitHub Issues:** Fetch from repository

#### 4. Branch Per Task Workflow
Create a separate branch for each task:

```bash
./ralphy.sh --branch-per-task                        # Feature branches
./ralphy.sh --branch-per-task --base-branch main     # From main
./ralphy.sh --branch-per-task --create-pr            # Auto PRs
./ralphy.sh --branch-per-task --create-pr --draft-pr # Draft PRs
```

Branch naming: `ralphy/<task-name-slug>`
- "Add user authentication" → `ralphy/add-user-authentication`

#### 5. YAML Parallel Groups
Control which tasks can run together:

```yaml
tasks:
  - title: Create User model
    parallel_group: 1
  - title: Create Post model
    parallel_group: 1  # Runs with User model (same group)
  - title: Add relationships
    parallel_group: 2  # Runs after group 1 completes
```

#### 6. Cost Tracking
Different metrics per engine:
- **Claude Code:** Input/output tokens, estimated cost
- **OpenCode:** Input/output tokens, actual cost
- **Codex:** Input/output tokens (if provided)
- **Cursor:** Total API duration (tokens not available)

### Integration Recommendations

#### Phase 0: Git Worktree Integration (Week 1) 🔥🔥🔥🔥🔥
**Priority:** HIGHEST

**Actions:**
1. Implement `GitWorktreeManager` class in RALPH Runtime
2. Add parallel execution support
3. Update RALPH Runtime to use worktrees
4. Test with 3-5 parallel agents

**Implementation:**
```python
# Add to RALPH Runtime
import git
import tempfile
import shutil

class GitWorktreeManager:
    def __init__(self, repo_path):
        self.repo = git.Repo(repo_path)
        self.worktrees = []

    def create_worktree(self, branch_name, task_id):
        # Create isolated worktree
        worktree_path = tempfile.mkdtemp(prefix=f"ralph-{task_id}-")
        self.repo.git.worktree('add', worktree_path, f'ralph/{branch_name}')
        self.worktrees.append((worktree_path, branch_name))
        return worktree_path

    def merge_worktree(self, worktree_path, branch_name):
        # Merge branch back to main
        self.repo.git.merge(f'ralph/{branch_name}')
        self.cleanup_worktree(worktree_path)

    def cleanup_worktree(self, worktree_path):
        # Remove worktree
        self.repo.git.worktree('remove', worktree_path)
        shutil.rmtree(worktree_path)
```

**Expected Benefits:**
- True parallel execution
- No file conflicts
- 3-5x speedup on parallelizable tasks

#### Phase 1: Multi-AI Engine Support (Week 2) ⭐⭐⭐⭐
**Priority:** HIGH

**Actions:**
1. Create `AIEngineAdapter` interface
2. Implement OpenCode, Codex, Cursor engines
3. Add engine selection to config
4. Test cost optimization

#### Phase 2: PRD Format Support (Week 3) ⭐⭐⭐⭐
**Priority:** HIGH

**Actions:**
1. Add PRD parser
2. Support checkbox tasks
3. Auto-update PRD on completion
4. GitHub Issues integration

#### Phase 3: Branch & PR Workflow (Week 4) ⭐⭐⭐
**Priority:** MEDIUM

**Actions:**
1. Implement branch-per-task
2. Add auto-create PR
3. Implement merge conflict resolution
4. Add draft PR support

### Analysis Documentation

**Comprehensive Analysis:** `.blackbox5/engine/development/framework-research/ralphy-ANALYSIS.md`

**Key Sections:**
- Executive Summary
- What It Does
- Key Features
- Architecture
- Comparison with RALPH Runtime
- Key Patterns to Adopt
- Integration Recommendations (4-week roadmap)
- Pros & Cons
- Code Quality Assessment

### Code References

**Original Repository:** https://github.com/michaelshimeles/ralphy

**Analysis Location:** `.blackbox5/engine/development/framework-research/ralphy-ANALYSIS.md`

**Implementation Pattern:** Lines 194-232 (Git Worktree Manager)

### Why Ralph-y is Critical

1. **Git Worktree Pattern** - Most important pattern to adopt
   - Enables true parallel execution
   - Solves file conflict issues
   - Better than current RALPH approach

2. **Proven in Production** - Version 3.1.0, actively used
   - Battle-tested implementation
   - Real-world usage patterns
   - Known edge cases

3. **Complementary to RALPH** - Not competitive, but synergistic
   - RALPH provides decision engine
   - Ralph-y provides git worktree execution
   - Best of both worlds

4. **Quick to Integrate** - 1-2 weeks for git worktree pattern
   - Simple implementation
   - High impact
   - Low risk

### Expected Impact

- **Performance:** 3-5x speedup on parallelizable tasks
- **User Experience:** Better task management through PRD format
- **Flexibility:** Multi-AI engine support for cost optimization
- **Workflow:** GitHub integration with automated PRs

---

## Next Steps

### Immediate (This Week)
- [ ] Study Ralph-y git worktree implementation
- [ ] Design GitWorktreeManager class for RALPH Runtime
- [ ] Plan parallel execution architecture

### Short-term (Weeks 1-2)
- [ ] Implement GitWorktreeManager
- [ ] Add parallel execution support
- [ ] Test with 3-5 parallel agents
- [ ] Document usage patterns

### Long-term (Weeks 3-4)
- [ ] Implement multi-AI engine support
- [ ] Add PRD format support
- [ ] Implement branch-per-task workflow

---

**Last Updated:** 2026-01-19
**Status:** 🔥 Critical Priority (Week 1 Integration)
**Maintainer:** BlackBox5 Engine Team
