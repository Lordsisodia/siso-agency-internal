# BlackBox5 Improvement Quick Start Guide

> Get started immediately with practical improvements
> Based on analysis of 15 research frameworks

## Week 1: Context Requirements Schema

### Goal
Every skill specifies explicit context requirements for systematic context assembly.

### What to Implement

#### 1. Create Context Schema

Create `.blackbox5/engine/modules/context/schema/`:

```yaml
# skill-context.yml template
context_requirements:
  global:
    - project: README.md
    - architecture: docs/architecture.md
    - domains: src/domains/**/README.md

  epic:
    - feature: docs/features/{epic}.md
    - technical: docs/technical/{epic}.md

  task:
    - implementation: src/{task}/**
    - tests: tests/{task}/**
    - related: docs/related/{task}.md

  runtime:
    - environment: .env.local
    - session: .claude/session.json
    - git: .git/HEAD

quality_metrics:
  relevance: 0.9      # Context matches task
  completeness: 0.95  # All necessary info
  conciseness: 0.8     # No unnecessary info
  clarity: 0.9        # Well-structured

assembly:
  strategy: dynamic    # Build per task
  optimization: true   # Remove redundancy
  caching: true        # Pre-compute when possible
```

#### 2. Update Skills

Add `context.yml` to each skill:

```bash
# Example: .blackbox5/engine/agents/.skills/core/test-driven-development/context.yml
context_requirements:
  global:
    - project: README.md
    - testing: docs/testing-playbook.md

  task:
    - implementation: src/**
    - tests: tests/**
    - related: docs/tdd/**/*.md

quality_metrics:
  relevance: 0.95
  completeness: 0.9
```

#### 3. Create Context Loader

Create `.blackbox5/engine/modules/context/loader.py`:

```python
class ContextLoader:
    def __init__(self, skill_path):
        self.skill_path = skill_path
        self.context_config = self._load_context_config()

    def load_context(self, task_type="task"):
        """Load context based on task type"""
        requirements = self.context_config[f"context_requirements"][task_type]
        context = {}

        for req in requirements:
            for key, path in req.items():
                context[key] = self._load_file(path)

        return context

    def optimize_context(self, context):
        """Remove redundancy, optimize tokens"""
        # Implement context optimization
        pass

    def measure_quality(self, context):
        """Measure context quality metrics"""
        # Implement quality measurement
        pass
```

#### 4. Test It

```bash
# Test context loading
cd .blackbox5/engine/modules/context
python loader.py

# Should output:
# Loading context for skill: test-driven-development
# - Global: README.md, testing-playbook.md
# - Task: src/**, tests/**
# Quality: relevance=0.95, completeness=0.9
```

---

## Week 2: GitHub Integration

### Goal
GitHub Issues as single source of truth with progress updates.

### What to Implement

#### 1. Create GitHub Module

Create `.blackbox5/engine/modules/github/`:

```python
# github.py
import github3

class GitHubIntegration:
    def __init__(self, token, repo):
        self.gh = github3.login(token=token)
        self.repo = self.gh.repository(repo)

    def create_issue(self, title, body, labels=None):
        """Create GitHub issue"""
        return self.repo.create_issue(title, body, labels)

    def update_progress(self, issue_number, message):
        """Post progress update to issue"""
        issue = self.repo.issue(issue_number)
        issue.create_comment(message)

    def close_issue(self, issue_number):
        """Close issue"""
        issue = self.repo.issue(issue_number)
        issue.close()

    def get_issue_context(self, issue_number):
        """Get issue details for context"""
        issue = self.repo.issue(issue_number)
        return {
            "title": issue.title,
            "body": issue.body,
            "labels": [l.name for l in issue.labels],
            "comments": [c.body for c in issue.comments()]
        }
```

#### 2. Create Commands

Create `.claude/commands/github/`:

```markdown
<!-- create-issue.md -->
Create a GitHub issue for the current task.

Usage:
/github:create-issue "Issue title"

Output:
- Issue number
- Issue URL
```

```markdown
<!-- update-progress.md -->
Post progress update to GitHub issue.

Usage:
/github:update-progress <issue-number> "Progress message"

Output:
- Comment posted
- Issue URL
```

#### 3. Integrate with Skills

Update skills to use GitHub:

```python
# In skill execution
def execute_skill(skill_name, task):
    # Get context
    context = context_loader.load_context(skill_name)

    # Create GitHub issue
    issue = github.create_issue(
        title=f"[{skill_name}] {task}",
        body=f"Context: {context}"
    )

    # Execute skill
    result = execute(task, context)

    # Update progress
    github.update_progress(issue.number, f"Completed: {result}")

    return result
```

#### 4. Test It

```bash
# Test GitHub integration
/github:create-issue "Test TDD skill"
# Should create issue and return number

/github:update-progress 123 "Test completed successfully"
# Should post comment to issue
```

---

## Week 3: Skill Metadata Standardization

### Goal
All skills have consistent metadata for discovery and orchestration.

### What to Implement

#### 1. Create Metadata Schema

Create `.blackbox5/engine/modules/skills/metadata.yml`:

```yaml
# Metadata template
name: skill-name
category: core | mcp | workflow | collaboration | thinking | automation | mcp-integrations
version: 1.0.0
description: Brief description (1-2 sentences)
author: author-name
verified: true | false
tags: [tag1, tag2, tag3]

dependencies:
  skills: [skill1, skill2]
  mcp: [mcp1, mcp2]
  system: [python, node]

context_requirements:
  file: context.yml

execution:
  timeout: 300  # seconds
  retry_count: 3
  fallback_skill: skill-name

quality:
  success_rate: 0.95
  avg_duration: 60  # seconds
  last_updated: 2026-01-18
```

#### 2. Update All Skills

Add `metadata.yml` to each skill folder:

```yaml
# Example: test-driven-development/metadata.yml
name: test-driven-development
category: core
version: 1.0.0
description: RED-GREEN-REFACTOR cycle for bulletproof code
author: obra/superpowers
verified: true
tags: [testing, tdd, quality, development]

dependencies:
  skills: []
  mcp: []
  system: [python]

context_requirements:
  file: context.yml

execution:
  timeout: 600
  retry_count: 3
  fallback_skill: systematic-debugging

quality:
  success_rate: 0.95
  avg_duration: 120
  last_updated: 2026-01-18
```

#### 3. Create Skill Registry

Create `.blackbox5/engine/modules/skills/registry.py`:

```python
class SkillRegistry:
    def __init__(self):
        self.skills = self._load_all_skills()

    def _load_all_skills(self):
        """Load all skill metadata"""
        skills = {}
        for skill_dir in Path(".skills").rglob("metadata.yml"):
            metadata = yaml.safe_load(skill_dir.read_text())
            skills[metadata["name"]] = metadata
        return skills

    def find_skill(self, name):
        """Find skill by name"""
        return self.skills.get(name)

    def find_skills_by_tag(self, tag):
        """Find skills by tag"""
        return [s for s in self.skills.values() if tag in s["tags"]]

    def find_skills_by_category(self, category):
        """Find skills by category"""
        return [s for s in self.skills.values() if s["category"] == category]

    def get_skill_dependencies(self, skill_name):
        """Get skill dependencies"""
        skill = self.find_skill(skill_name)
        return skill.get("dependencies", {})
```

#### 4. Test It

```bash
# Test skill registry
python .blackbox5/engine/modules/skills/registry.py

# Should output:
# Loaded 31 skills
# Categories: core, mcp, workflow, collaboration, thinking, automation, mcp-integrations
# Tags: testing, tdd, github, debugging, ...
```

---

## Week 4: Extended Thinking Mode Detection

### Goal
Auto-detect thinking mode from prompts for optimal token allocation.

### What to Implement

#### 1. Create Thinking Mode Detector

Create `.blackbox5/engine/modules/thinking/detector.py`:

```python
import re

class ThinkingModeDetector:
    PATTERNS = {
        "think": r"\bthink\b",
        "think hard": r"\bthink\s+hard\b",
        "think harder": r"\bthink\s+harder\b",
        "deep": r"\bdeep\s+(think|thinking|analysis)\b",
        "careful": r"\bcareful(ly)?\b"
    }

    TOKEN_ALLOCATIONS = {
        "think": 4000,
        "think hard": 10000,
        "think harder": 31999,
        "deep": 20000,
        "careful": 15000,
        "default": 2000
    }

    def detect_mode(self, prompt):
        """Detect thinking mode from prompt"""
        for mode, pattern in self.PATTERNS.items():
            if re.search(pattern, prompt, re.IGNORECASE):
                return mode
        return "default"

    def get_token_allocation(self, mode):
        """Get token allocation for mode"""
        return self.TOKEN_ALLOCATIONS.get(mode, self.TOKEN_ALLOCATIONS["default"])

    def optimize_prompt(self, prompt, mode):
        """Optimize prompt for thinking mode"""
        if mode == "think harder":
            prompt = f"Think step by step, considering multiple approaches:\n\n{prompt}"
        elif mode == "think hard":
            prompt = f"Think carefully through this:\n\n{prompt}"
        elif mode == "think":
            prompt = f"Think through this:\n\n{prompt}"

        return prompt
```

#### 2. Integrate with Skills

Update skill execution to use thinking mode:

```python
def execute_skill(skill_name, task):
    # Detect thinking mode
    detector = ThinkingModeDetector()
    mode = detector.detect_mode(task)
    tokens = detector.get_token_allocation(mode)

    # Optimize prompt
    optimized_task = detector.optimize_prompt(task, mode)

    # Execute with token allocation
    result = execute(optimized_task, max_thinking_tokens=tokens)

    return result
```

#### 3. Test It

```bash
# Test thinking mode detection
python .blackbox5/engine/modules/thinking/detector.py

# Test cases:
# "Implement feature" → default (2000 tokens)
# "Think about this feature" → think (4000 tokens)
# "Think hard about this" → think hard (10000 tokens)
# "Think harder" → think harder (31999 tokens)
```

---

## Success Criteria

### Week 1
✅ All skills have `context.yml`
✅ Context loader functional
✅ Quality metrics measurable

### Week 2
✅ GitHub integration working
✅ Issues created/updated
✅ Progress visible

### Week 3
✅ All skills have `metadata.yml`
✅ Skill registry functional
✅ Dependencies tracked

### Week 4
✅ Thinking mode detection working
✅ Token allocation optimized
✅ Prompts enhanced

---

## Next Steps

After Week 4, move to Phase 2:

1. **Knowledge Graph Memory System** (8 weeks)
2. **Mayor Pattern Orchestrator** (6 weeks)
3. **Security Model** (2 weeks)

See `BLACKBOX5-RECOMMENDATIONS.md` for complete roadmap.

---

## Troubleshooting

### Context Loading Issues

**Problem**: Context files not found
**Solution**: Check path patterns in `context.yml`, use relative paths from project root

### GitHub Authentication

**Problem**: API rate limits
**Solution**: Use personal access token with appropriate scope

### Skill Registry

**Problem**: Skills not loading
**Solution**: Check `metadata.yml` syntax, ensure YAML is valid

### Thinking Mode

**Problem**: Mode not detected
**Solution**: Check prompt keywords, ensure patterns match

---

## Resources

- Full Recommendations: `BLACKBOX5-RECOMMENDATIONS.md`
- Executive Summary: `BLACKBOX5-EXECUTIVE-SUMMARY.md`
- Comparison Matrix: `BLACKBOX5-COMPARISON-MATRIX.md`
- Framework Analyses: `framework-analysis/`

---

**Get started today! Pick one feature and implement it this week.**

---

*Version: 1.0 | Last Updated: 2026-01-18 | Maintainer: BlackBox5 Team*
