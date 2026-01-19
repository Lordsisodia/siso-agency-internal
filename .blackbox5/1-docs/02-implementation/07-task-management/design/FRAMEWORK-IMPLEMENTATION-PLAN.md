# BlackBox5 Framework Implementation Action Plan
## Day-by-Day Roadmap Using Production Code from 15 Frameworks

**Created**: 2025-01-18
**Status**: Ready to Execute
**Timeline**: 4 weeks (20 working days)
**Approach**: Adapt production-tested code from researched frameworks

---

## Executive Summary

This action plan provides a **day-by-day implementation roadmap** to make BlackBox5 fully operational by adapting **production-tested code** from the 15 frameworks we researched.

**Key Strategy**:
- **Reuse**: 25-36 days of development saved by copying existing code
- **Adapt**: Modify framework code for BlackBox5's architecture
- **Test**: Each component tested before moving to next
- **Integrate**: Connect all components into cohesive system

**Success Criteria**:
- ✅ CLI commands work (`bb5 agent:start`, `bb5 skill:execute`, etc.)
- ✅ Agents can execute skills
- ✅ Security layer prevents dangerous operations
- ✅ Workspace isolation for safe development
- ✅ Context management improves agent performance

---

## Framework Code Sources

### Primary Sources (High Value)
1. **Auto-Claude** - Agent SDK client, security layer, workspace management
2. **OpenSpec** - CLI infrastructure, command registry, configuration
3. **CCPM** - PRD/Epic/Task templates (already adapted)
4. **Cognee** - Context/memory management

### Code Inventory
See `.docs/research/FRAMEWORK-CODE-INVENTORY.md` for complete inventory of 10 most valuable components.

---

## Week 1: Foundation (Days 1-7)

### Day 1-2: CLI Infrastructure

**Source**: OpenSpec CLI (`.docs/research/specifications/openspec/src/cli/index.ts`)

**Objective**: Create command-line interface for BlackBox5

**Deliverables**:
1. `.blackbox5/cli/main.py` - Main CLI entry point
2. Command routing system
3. Help system
4. Error handling

**Implementation Steps**:

**Step 1**: Create CLI directory structure
```bash
mkdir -p .blackbox5/cli
```

**Step 2**: Create main CLI file (adapted from OpenSpec)
- Copy structure from `.docs/research/specifications/openspec/src/cli/index.ts`
- Convert TypeScript to Python
- Use argparse instead of Commander.js
- Implement command routing

**Step 3**: Register commands
```python
# Agent commands
- agent:start <name>
- agent:stop <name>
- agent:list

# Skill commands
- skill:execute <name>
- skill:list
- skill:validate <name>

# PRD commands
- prd:new <name>
- prd:list
- prd:parse <name>

# System commands
- status
```

**Step 4**: Add to PATH
```bash
# Add to ~/.zshrc
export PATH="$PATH:/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/cli"
```

**Testing**:
```bash
python .blackbox5/cli/main.py --help
python .blackbox5/cli/main.py status
python .blackbox5/cli/main.py agent:list
python .blackbox5/cli/main.py skill:list
```

**Acceptance Criteria**:
- [ ] `--help` shows all commands
- [ ] `status` shows system status
- [ ] All commands route correctly
- [ ] Error messages are clear

**Time Investment**: 2 days
**Code Reused**: ~70% from OpenSpec
**Time Saved**: 2-3 days

---

### Day 3-4: Agent SDK Client

**Source**: Auto-Claude (`.docs/research/agents/auto-claude/apps/backend/core/client.py` - 2000+ lines)

**Objective**: Create client for agent interactions with caching and capabilities

**Deliverables**:
1. `.blackbox5/engine/core/AgentClient.py` - Agent client factory
2. Project index caching (5-minute TTL)
3. Capability detection system
4. Tool permission management

**Implementation Steps**:

**Step 1**: Copy core client code from Auto-Claude
- Source: `.docs/research/agents/auto-claude/apps/backend/core/client.py`
- Adapt: Remove Claude SDK dependencies, use generic structure
- Keep: Caching logic, capability detection, tool permissions

**Step 2**: Implement project index scanning
```python
def _load_project_index(self) -> dict:
    """Scan project directory and create index"""
    files = []
    for file_path in self.project_dir.rglob("*"):
        if file_path.is_file():
            files.append(str(file_path.relative_to(self.project_dir)))

    return {
        'files': files,
        'dependencies': self._detect_dependencies()
    }
```

**Step 3**: Add capability detection
```python
def _detect_capabilities(self, project_index: dict) -> dict:
    """Detect what project can do"""
    return {
        'is_python': any(f.endswith('.py') for f in files),
        'is_node': any('package.json' in f for f in files),
        'has_tests': any('test' in f.lower() for f in files)
    }
```

**Step 4**: Implement tool permissions
```python
TOOL_PERMISSIONS = {
    'developer': ['read', 'write', 'bash', 'search'],
    'tester': ['read', 'bash', 'test'],
    'planner': ['read', 'search']
}
```

**Testing**:
```bash
python .blackbox5/tests/test_agent_client.py
```

**Acceptance Criteria**:
- [ ] Client creates successfully
- [ ] Project index caches correctly (5-minute TTL)
- [ ] Capabilities detected (Python, Node, etc.)
- [ ] Tool permissions vary by agent type
- [ ] Session prompt includes context

**Time Investment**: 2 days
**Code Reused**: ~80% from Auto-Claude
**Time Saved**: 5-7 days

---

### Day 5-7: Security Layer

**Source**: Auto-Claude (`.docs/research/agents/auto-claude/apps/backend/core/security.py`)

**Objective**: Implement 3-layer security (input validation, sandbox, output verification)

**Deliverables**:
1. `.blackbox5/engine/core/Security.py` - Security validators
2. Command pattern validation
3. Filesystem sandbox
4. Operation validation

**Implementation Steps**:

**Step 1**: Copy security code from Auto-Claude
- Source: `.docs/research/agents/auto-claude/apps/backend/core/security.py`
- Keep: Dangerous pattern detection, path validation, sandbox
- Adapt: Simplify for BlackBox5 needs

**Step 2**: Implement dangerous pattern detection
```python
DANGEROUS_PATTERNS = [
    r'rm\s+-rf\s+/',     # Delete root
    r'dd\s+if=',          # Direct disk write
    r':\(\)\{\s*:\|:&\s*;\s*\}',  # Fork bomb
    r'>\s*/dev/sd[a-z]',  # Direct disk manipulation
]
```

**Step 3**: Add filesystem sandbox
```python
class FilesystemSandbox:
    def __init__(self, allowed_base: Path):
        self.allowed_base = allowed_base.resolve()

    def validate_path(self, path: str) -> tuple[bool, Path]:
        """Ensure path is within allowed directory"""
        abs_path = Path(path).resolve()
        try:
            abs_path.relative_to(self.allowed_base)
            return True, abs_path
        except ValueError:
            return False, self.allowed_base
```

**Step 4**: Create operation validation
```python
def validate_operation(self, operation: str, params: dict) -> tuple[bool, str]:
    """Validate an agent operation"""
    if operation == 'bash':
        return self.validator.validate_command(params['command'])
    elif operation in ['write', 'delete']:
        return self.sandbox.validate_path(params['path'])
    return True, ""
```

**Testing**:
```bash
python .blackbox5/tests/test_security.py
# Should block: rm -rf /, dd if=, fork bombs
# Should allow: ls, cat, grep, python, npm
```

**Acceptance Criteria**:
- [ ] Dangerous commands blocked
- [ ] Path traversal prevented
- [ ] Sandbox restricts file operations
- [ ] Safe operations allowed
- [ ] Clear error messages

**Time Investment**: 3 days
**Code Reused**: ~85% from Auto-Claude
**Time Saved**: 3-4 days

---

## Week 2: Integration (Days 8-14)

### Day 8-10: Agent-Skill Bridge

**Source**: Custom implementation based on Auto-Claude patterns

**Objective**: Connect agents with XML-structured skills

**Deliverables**:
1. `.blackbox5/engine/core/AgentSkillBridge.py` - Skill loader and executor
2. XML tag extraction
3. Skill validation
4. Skill execution with context

**Implementation Steps**:

**Step 1**: Create skill loader
```python
def load_skill(self, skill_path: str) -> Optional[dict]:
    """Load a skill from disk"""
    skill_file = self.skills_base / skill_path / "SKILL.md"
    if not skill_file.exists():
        return None

    with open(skill_file) as f:
        content = f.read()

    return {
        'context': self._extract_tag(content, 'context'),
        'instructions': self._extract_tag(content, 'instructions'),
        'workflow': self._extract_tag(content, 'workflow'),
        'examples': self._extract_tag(content, 'examples'),
    }
```

**Step 2**: Add XML tag extraction
```python
def _extract_tag(self, content: str, tag: str) -> str:
    """Extract content between XML tags"""
    start_tag = f"<{tag}>"
    end_tag = f"</{tag}>"

    start_idx = content.find(start_tag)
    if start_idx == -1:
        return ""

    end_idx = content.find(end_tag, start_idx)
    if end_idx == -1:
        return ""

    return content[start_idx + len(start_tag):end_idx].strip()
```

**Step 3**: Implement skill execution
```python
def execute_skill(self, skill_path: str, agent_context: dict) -> str:
    """Execute a skill with agent context"""
    skill_data = self.load_skill(skill_path)

    prompt = f"""<context>
{skill_data['context']}

**Agent Context**:
{agent_context}
</context>

<instructions>
{skill_data['instructions']}
</instructions>

<worflow>
{skill_data['workflow']}
</workflow>
"""
    return prompt
```

**Testing**:
```bash
python .blackbox5/tests/test_skill_bridge.py
```

**Acceptance Criteria**:
- [ ] Skills load from disk
- [ ] XML tags extracted correctly
- [ ] Skills validate (context, instructions required)
- [ ] Execution generates proper prompts
- [ ] Search finds relevant skills

**Time Investment**: 3 days
**Code Reused**: ~40% from Auto-Claude patterns
**Time Saved**: 2-3 days

---

### Day 11-12: Skill Manager Enhancement

**Source**: Existing `.blackbox5/engine/core/SkillManager.py`

**Objective**: Update SkillManager to use AgentSkillBridge

**Deliverables**:
1. Enhanced SkillManager with XML support
2. Skill validation methods
3. Batch validation

**Implementation Steps**:

**Step 1**: Update SkillManager
```python
from .AgentSkillBridge import AgentSkillBridge

class SkillManager:
    def __init__(self, skills_base: Path):
        self.bridge = AgentSkillBridge(skills_base)

    def get_skill(self, skill_path: str):
        return self.bridge.load_skill(skill_path)

    def execute_skill(self, skill_path: str, context: dict):
        return self.bridge.execute_skill(skill_path, context)
```

**Step 2**: Add validation
```python
def validate_all_skills(self):
    """Validate all skills"""
    skills = self.list_skills()
    results = {'valid': [], 'invalid': []}

    for skill in skills:
        if self.bridge.validate_skill(skill):
            results['valid'].append(skill)
        else:
            results['invalid'].append(skill)

    return results
```

**Acceptance Criteria**:
- [ ] SkillManager uses AgentSkillBridge
- [ ] All 31 skills validate successfully
- [ ] Validation reports are accurate
- [ ] Performance is acceptable (< 5 seconds)

**Time Investment**: 2 days
**Code Reused**: ~30% existing, ~70% new
**Time Saved**: 1-2 days

---

### Day 13-14: Developer Agent Implementation

**Source**: Custom based on Auto-Claude agent patterns

**Objective**: Create first concrete agent implementation

**Deliverables**:
1. `.blackbox5/engine/agents/implementations/DeveloperAgent.py`
2. Task processing logic
3. Skill routing
4. Security integration

**Implementation Steps**:

**Step 1**: Create DeveloperAgent class
```python
from ..core.AgentClient import BlackBox5AgentClient
from ..core.AgentSkillBridge import AgentSkillBridge
from ..core.Security import SecurityLayer

class DeveloperAgent:
    def __init__(self, project_dir: Path):
        self.client = BlackBox5AgentClient('developer', project_dir)
        self.skill_bridge = AgentSkillBridge(skills_dir)
        self.security = SecurityLayer(project_dir)
```

**Step 2**: Implement skill routing
```python
def _determine_skill(self, task: str) -> str:
    """Determine which skill to use"""
    if 'test' in task.lower():
        return "development-workflow/coding-assistance/test-driven-development"
    elif 'debug' in task.lower():
        return "development-workflow/testing-quality/systematic-debugging"
    # ... more routing
```

**Step 3**: Process task with security
```python
def process_task(self, task: str) -> str:
    """Process a development task"""
    # Validate through security
    is_safe, msg = self.security.validate_operation('task', {'task': task})
    if not is_safe:
        raise SecurityError(msg)

    # Execute skill
    skill_path = self._determine_skill(task)
    return self.skill_bridge.execute_skill(skill_path, agent_context)
```

**Testing**:
```bash
python .blackbox5/tests/test_developer_agent.py
```

**Acceptance Criteria**:
- [ ] Agent processes tasks correctly
- [ ] Skills route based on task keywords
- [ ] Security validates operations
- [ ] Prompts include context and skill
- [ ] Performance is acceptable

**Time Investment**: 2 days
**Code Reused**: ~50% from Auto-Claude patterns
**Time Saved**: 2-3 days

---

## Week 3: Core Features (Days 15-21)

### Day 15-17: Context Manager

**Source**: Cognee (`.docs/research/context-engineering/cognee/`)

**Objective**: Implement context management for better agent performance

**Deliverables**:
1. `.blackbox5/engine/core/ContextManager.py`
2. Keyword extraction
3. Relevant file discovery
4. Pattern detection

**Implementation Steps**:

**Step 1**: Create context manager
```python
class ContextManager:
    def __init__(self, project_dir: Path):
        self.project_dir = project_dir
        self.context_cache = {}
```

**Step 2**: Implement keyword extraction
```python
def _extract_keywords(self, task: str) -> list[str]:
    """Extract keywords from task"""
    import re
    words = re.findall(r'\b[a-z]{3,}\b', task.lower())
    return list(set(words))
```

**Step 3**: Add relevant file discovery
```python
def _find_relevant_files(self, keywords: list[str]) -> list[str]:
    """Find files containing keywords"""
    relevant_files = []

    for file_path in self.project_dir.rglob("*.py"):
        content = file_path.read_text()
        for keyword in keywords:
            if keyword in content.lower():
                relevant_files.append(str(file_path))
                break

    return relevant_files[:10]  # Limit to 10
```

**Acceptance Criteria**:
- [ ] Context finds relevant files
- [ ] Patterns detected correctly
- [ ] Session caching works
- [ ] Performance is acceptable

**Time Investment**: 3 days
**Code Reused**: ~60% from Cognee
**Time Saved**: 3-4 days

---

### Day 18-19: Service Discovery

**Source**: Custom based on OpenSpec patterns

**Objective**: Create system to discover agents and skills

**Deliverables**:
1. `.blackbox5/engine/core/ServiceDiscovery.py`
2. Agent discovery
3. Skill discovery
4. Agent-skill matching

**Implementation Steps**:

**Step 1**: Implement discovery
```python
class ServiceDiscovery:
    def discover_agents(self) -> dict:
        """Discover all available agents"""
        # Read from config
        pass

    def discover_skills(self) -> list[str]:
        """Discover all available skills"""
        # Scan skills directory
        pass

    def find_agent_for_skill(self, skill_path: str) -> str:
        """Find best agent for a skill"""
        # Match skill category to agent capabilities
        pass
```

**Acceptance Criteria**:
- [ ] All agents discovered
- [ ] All skills discovered
- [ ] Matching works correctly

**Time Investment**: 2 days
**Code Reused**: ~40% from OpenSpec
**Time Saved**: 1-2 days

---

### Day 20-21: Workspace Manager

**Source**: Auto-Claude (`.docs/research/agents/auto-claude/apps/backend/cli/worktree.py`)

**Objective**: Implement git worktree management for isolated development

**Deliverables**:
1. `.blackbox5/engine/core/WorkspaceManager.py`
2. Worktree creation
3. Worktree merging
4. Worktree cleanup

**Implementation Steps**:

**Step 1**: Copy worktree code from Auto-Claude
```python
class WorkspaceManager:
    def create_workspace(self, spec_name: str) -> tuple[Path, str]:
        """Create isolated workspace"""
        branch_name = f"blackbox5/{spec_name}"
        workspace_path = self.worktrees_dir / spec_name

        subprocess.run(['git', 'worktree', 'add', '-b', branch_name, str(workspace_path)])
        return workspace_path, branch_name
```

**Acceptance Criteria**:
- [ ] Workspaces create successfully
- [ ] Merging works correctly
- [ ] Cleanup removes all traces

**Time Investment**: 2 days
**Code Reused**: ~90% from Auto-Claude
**Time Saved**: 2-3 days

---

## Week 4: Polish & Integration (Days 22-28)

### Day 22-23: Configuration Management

**Source**: OpenSpec (`.docs/research/specifications/openspec/src/core/configurators/`)

**Objective**: Implement robust configuration system

**Deliverables**:
1. `.blackbox5/engine/core/ConfigManager.py`
2. YAML-based config
3. Environment detection

**Time Investment**: 2 days
**Code Reused**: ~70% from OpenSpec
**Time Saved**: 1-2 days

---

### Day 24-25: Template System

**Source**: OpenSpec (`.docs/research/specifications/openspec/src/core/templates/`)

**Objective**: Create template management system

**Deliverables**:
1. `.blackbox5/engine/core/TemplateManager.py`
2. Template rendering
3. Variable substitution

**Time Investment**: 2 days
**Code Reused**: ~80% from OpenSpec
**Time Saved**: 1 day

---

### Day 26-27: Testing Framework

**Source**: Auto-Claude (`.docs/research/agents/auto-claude/tests/`)

**Objective**: Create comprehensive test suite

**Deliverables**:
1. `.blackbox5/tests/conftest.py` - Test fixtures
2. Unit tests for all components
3. Integration tests

**Time Investment**: 2 days
**Code Reused**: ~60% from Auto-Claude
**Time Saved**: 2-3 days

---

### Day 28: Documentation & Polish

**Objective**: Complete documentation

**Deliverables**:
1. User guide
2. CLI reference
3. API documentation
4. Setup instructions

**Time Investment**: 1 day
**Code Reused**: ~30% from existing docs
**Time Saved**: 1 day

---

## Summary

### Total Time Investment: 28 days (4 weeks)
### Total Time Saved: 25-36 days
### Net Value: 8-12 weeks of work completed in 4 weeks

### Framework Code Usage:
- **Auto-Claude**: ~40% of code (agent client, security, workspaces)
- **OpenSpec**: ~30% of code (CLI, config, templates)
- **Cognee**: ~10% of code (context management)
- **Custom**: ~20% of code (agent-skill bridge, specific implementations)

### Success Metrics:
- ✅ CLI operational with all commands
- ✅ Agents executing skills
- ✅ Security layer active
- ✅ Workspace isolation working
- ✅ Context management improving performance
- ✅ Test coverage > 80%

---

## Next Steps

1. **Start Day 1-2**: Begin CLI infrastructure
2. **Follow daily tasks**: Each day has clear deliverables
3. **Test continuously**: Each component tested before moving on
4. **Document progress**: Track what's working and what needs adjustment

**Ready to begin implementation!**