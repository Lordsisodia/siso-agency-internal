# Framework Code Inventory for BlackBox5
## Reusable Code from 15 Researched Frameworks

**Date**: 2025-01-18
**Purpose**: Identify existing code that can be adapted for BlackBox5

---

## Executive Summary

After examining all 15 frameworks, I've identified **production-ready code** that can be directly adapted for BlackBox5. The most valuable frameworks are:

1. **OpenSpec** - CLI infrastructure, spec management, command registry
2. **Auto-Claude** - Agent SDK client, security layer, workspace management
3. **CCPM** - PRD/Epic/Task templates, command structure
4. **Cognee** - Context/memory management

**Key Finding**: These frameworks have **thousands of lines of production-tested code** that we can adapt rather than writing from scratch.

---

## Top 10 Most Valuable Code Components

### 1. CLI Infrastructure (OpenSpec)

**Source**: `.docs/research/specifications/openspec/src/cli/index.ts`

**What it provides**:
- Complete CLI framework using Commander.js
- Command routing and subcommands
- Telemetry tracking
- Global option handling
- Pre/post-action hooks
- Error handling

**Code to adapt**:
```typescript
// Full CLI structure with:
// - Command registration
// - Argument parsing
// - Help system
// - Error handling
// - Telemetry hooks
```

**How to adapt for BlackBox5**:
```python
# Convert to Python with argparse
# .blackbox5/cli/main.py
import argparse
from pathlib import Path

class BlackBox5CLI:
    def __init__(self):
        self.parser = argparse.ArgumentParser(
            description="BlackBox5 - AI Agent Framework"
        )
        self.subparsers = self.parser.add_subparsers(dest='command')
        self._register_commands()

    def _register_commands(self):
        # Agent commands
        agent_parser = self.subparsers.add_parser('agent')
        agent_subparsers = agent_parser.add_subparsers(dest='agent_command')
        agent_subparsers.add_parser('start')
        agent_subparsers.add_parser('stop')
        agent_subparsers.add_parser('list')

        # Skill commands
        skill_parser = self.subparsers.add_parser('skill')
        skill_subparsers = skill_parser.add_subparsers(dest='skill_command')
        skill_subparsers.add_parser('execute')
        skill_subparsers.add_parser('list')
        skill_subparsers.add_parser('validate')

        # PRD commands
        prd_parser = self.subparsers.add_parser('prd')
        prd_subparsers = prd_parser.add_subparsers(dest='prd_command')
        prd_subparsers.add_parser('new')
        prd_subparsers.add_parser('parse')
        prd_subparsers.add_parser('list')

    def run(self):
        args = self.parser.parse_args()
        # Route to appropriate handler
        self._route_command(args)

    def _route_command(self, args):
        if args.command == 'agent':
            self._handle_agent(args)
        elif args.command == 'skill':
            self._handle_skill(args)
        elif args.command == 'prd':
            self._handle_prd(args)
```

**Value**: Saves 2-3 days of CLI development

---

### 2. Agent SDK Client (Auto-Claude)

**Source**: `.docs/research/agents/auto-claude/apps/backend/core/client.py` (2000+ lines)

**What it provides**:
- Claude Agent SDK integration
- Project index caching
- CLI path detection (cross-platform)
- OAuth authentication
- MCP server integration
- Tool permissions by agent type
- Security hooks

**Key functions to adapt**:

```python
# From core/client.py

def create_client(
    project_dir: Path,
    spec_dir: Path,
    model: str,
    agent_type: str,
    max_thinking_tokens: int | None = None
):
    """
    Create configured Claude SDK client

    This is the PRIMARY entry point for all AI interactions.
    Handles security, MCP servers, tool permissions.
    """
    # 1. Load project index with caching
    project_index = load_project_index(project_dir)

    # 2. Detect capabilities
    capabilities = detect_project_capabilities(project_index)

    # 3. Configure tools based on agent type
    tools = get_tools_for_agent(agent_type, capabilities)

    # 4. Configure MCP servers
    mcp_servers = get_mcp_servers_for_project(capabilities)

    # 5. Create client with security hooks
    client = ClaudeSDKClient(
        model=model,
        tools=tools,
        mcp_servers=mcp_servers,
        security_hooks=get_security_hooks()
    )

    return client


def load_project_index(project_dir: Path) -> dict:
    """
    Load and cache project index

    Uses 5-minute TTL cache to avoid reloading on every client creation.
    """
    # Check cache first
    cache_key = str(project_dir.resolve())

    if cache_key in _PROJECT_INDEX_CACHE:
        cached_index, cached_time = _PROJECT_INDEX_CACHE[cache_key]
        if time.time() - cached_time < _CACHE_TTL_SECONDS:
            return cached_index

    # Load fresh data
    project_index = {
        'files': scan_files(project_dir),
        'dependencies': detect_dependencies(project_dir),
        'capabilities': detect_capabilities(project_dir)
    }

    # Store in cache
    _PROJECT_INDEX_CACHE[cache_key] = (project_index, time.time())

    return project_index


def detect_project_capabilities(project_index: dict) -> dict:
    """
    Detect project capabilities from index

    Returns dict like:
    {
        'has_frontend': True,
        'has_backend': True,
        'is_react': True,
        'is_python': True,
        'has_tests': True,
        'uses_git': True
    }
    """
    capabilities = {}

    # Detect frontend frameworks
    capabilities['is_react'] = any(
        f.endswith('package.json') and 'react' in f
        for f in project_index['files']
    )

    # Detect backend
    capabilities['is_python'] = any(
        f.endswith('requirements.txt') or f.endswith('pyproject.toml')
        for f in project_index['files']
    )

    # Detect testing
    capabilities['has_tests'] = any(
        'test' in f.lower()
        for f in project_index['files']
    )

    return capabilities


def get_tools_for_agent(agent_type: str, capabilities: dict) -> list:
    """
    Get tools allowed for specific agent type

    Different agents get different tool permissions:
    - planner: read-only tools
    - coder: read + write tools
    - qa_reviewer: read + test tools
    - qa_fixer: read + write + test tools
    """
    TOOL_PERMISSIONS = {
        'planner': ['read', 'search', 'list'],
        'coder': ['read', 'write', 'bash', 'search'],
        'qa_reviewer': ['read', 'test', 'bash'],
        'qa_fixer': ['read', 'write', 'bash', 'test']
    }

    allowed_tools = TOOL_PERMISSIONS.get(agent_type, ['read'])

    # Filter by project capabilities
    available_tools = []

    if 'bash' in allowed_tools and capabilities.get('has_backend'):
        available_tools.append('bash')

    if 'test' in allowed_tools and capabilities.get('has_tests'):
        available_tools.append('pytest')

    return available_tools
```

**How to adapt for BlackBox5**:

```python
# .blackbox5/engine/core/AgentClient.py

class BlackBox5AgentClient:
    """
    Adapted from Auto-Claude's create_client()
    """

    def __init__(self, agent_type: str, project_dir: Path):
        self.agent_type = agent_type
        self.project_dir = project_dir
        self.project_index = self._load_project_index()
        self.capabilities = self._detect_capabilities()
        self.allowed_tools = self._get_allowed_tools()

    def _load_project_index(self) -> dict:
        """Load project files and structure"""
        # Scan project directory
        files = list(self.project_dir.rglob("*"))

        return {
            'files': [str(f.relative_to(self.project_dir)) for f in files if f.is_file()],
            'directories': [str(f.relative_to(self.project_dir)) for f in self.project_dir.rglob("*") if f.is_dir()],
            'dependencies': self._detect_dependencies()
        }

    def _detect_dependencies(self) -> dict:
        """Detect project dependencies"""
        deps = {}

        # Python
        if (self.project_dir / "requirements.txt").exists():
            with open(self.project_dir / "requirements.txt") as f:
                deps['python'] = [line.strip() for line in f if line.strip()]

        # Node.js
        if (self.project_dir / "package.json").exists():
            import json
            with open(self.project_dir / "package.json") as f:
                package_json = json.load(f)
                deps['node'] = list(package_json.get('dependencies', {}).keys())

        return deps

    def _detect_capabilities(self) -> dict:
        """Detect what project can do"""
        capabilities = {}

        files = self.project_index.get('files', [])

        # Frontend detection
        capabilities['has_frontend'] = any(
            'package.json' in f or 'tsconfig.json' in f
            for f in files
        )

        # Backend detection
        capabilities['has_backend'] = any(
            f.endswith('.py') or 'requirements.txt' in f
            for f in files
        )

        # Testing
        capabilities['has_tests'] = any(
            'test' in f.lower()
            for f in files
        )

        return capabilities

    def _get_allowed_tools(self) -> list:
        """Get tools based on agent type"""
        TOOL_PERMISSIONS = {
            'developer': ['read', 'write', 'bash', 'search'],
            'tester': ['read', 'bash', 'test'],
            'planner': ['read', 'search'],
            'analyst': ['read', 'search']
        }

        return TOOL_PERMISSIONS.get(self.agent_type, ['read'])
```

**Value**: Saves 5-7 days of client development

---

### 3. Security Layer (Auto-Claude)

**Source**: `.docs/research/agents/auto-claude/apps/backend/core/security.py`

**What it provides**:
- Dynamic command allowlisting
- Bash command validation
- Filesystem sandboxing
- Security profiles

**Code to adapt**:

```python
# From core/security.py

class SecurityValidator:
    """
    Security validation for agent commands

    Prevents dangerous operations while allowing safe commands.
    """

    DANGEROUS_PATTERNS = [
        r'rm\s+-rf\s+/',  # Delete root
        r'dd\s+if=',      # Direct disk write
        r':\(\)\{\s*:\|:&\s*;\s*\}',  # Fork bomb
        r'>\s*/dev/sd[a-z]',  # Direct disk manipulation
        r'mkfs\.',        # Filesystem creation
        r'chmod\s+000',   # Disable all permissions
    ]

    def validate_command(self, command: str) -> tuple[bool, str]:
        """
        Validate a bash command for safety

        Returns:
            (is_safe, error_message)
        """
        import re

        # Check against dangerous patterns
        for pattern in self.DANGEROUS_PATTERNS:
            if re.search(pattern, command):
                return False, f"Command matches dangerous pattern: {pattern}"

        # Check for path traversal
        if '../' in command and 'rm' in command:
            return False, "Path traversal detected in delete command"

        # Check for suspicious sudo usage
        if command.startswith('sudo ') and 'rm' in command:
            return False, "Dangerous sudo command detected"

        return True, ""

    def get_allowed_commands(self, project_capabilities: dict) -> list:
        """
        Get list of allowed commands based on project

        Different projects need different commands:
        - Python projects: python, pip, pytest
        - Node projects: npm, yarn, node
        - Rust projects: cargo, rustc
        """
        allowed = ['ls', 'cat', 'grep', 'find', 'echo']

        if project_capabilities.get('is_python'):
            allowed.extend(['python', 'python3', 'pip', 'pytest'])

        if project_capabilities.get('is_node'):
            allowed.extend(['npm', 'yarn', 'node'])

        if project_capabilities.get('is_rust'):
            allowed.extend(['cargo', 'rustc'])

        return allowed


class FilesystemSandbox:
    """
    Filesystem sandbox to restrict operations

    Ensures agents can only operate within project directory.
    """

    def __init__(self, allowed_base: Path):
        self.allowed_base = allowed_base.resolve()

    def validate_path(self, path: str) -> tuple[bool, Path]:
        """
        Validate that path is within allowed directory

        Returns:
            (is_valid, safe_absolute_path)
        """
        try:
            # Resolve to absolute path
            abs_path = Path(path).resolve()

            # Check if within allowed base
            abs_path.relative_to(self.allowed_base)

            return True, abs_path

        except ValueError:
            # Path is outside allowed directory
            return False, self.allowed_base

    def safe_write(self, path: str, content: str):
        """Safely write file within sandbox"""
        is_valid, safe_path = self.validate_path(path)

        if not is_valid:
            raise SecurityError(f"Path outside sandbox: {path}")

        safe_path.parent.mkdir(parents=True, exist_ok=True)
        safe_path.write_text(content)


class SecurityError(Exception):
    """Security-related errors"""
    pass
```

**How to adapt for BlackBox5**:

```python
# .blackbox5/engine/core/Security.py

class BlackBox5Security:
    """Security layer for BlackBox5 agents"""

    def __init__(self, project_dir: Path):
        self.project_dir = project_dir.resolve()
        self.sandbox = FilesystemSandbox(self.project_dir)
        self.validator = SecurityValidator()

    def validate_operation(self, operation: str, params: dict) -> tuple[bool, str]:
        """
        Validate an agent operation

        Operations: 'read', 'write', 'bash', 'delete'
        """
        if operation == 'bash':
            command = params.get('command', '')
            return self.validator.validate_command(command)

        elif operation in ['write', 'delete']:
            path = params.get('path', '')
            is_valid, safe_path = self.sandbox.validate_path(path)
            return is_valid, "" if is_valid else f"Path outside sandbox: {path}"

        elif operation == 'read':
            path = params.get('path', '')
            is_valid, _ = self.sandbox.validate_path(path)
            return is_valid, "" if is_valid else f"Path outside sandbox: {path}"

        return True, ""
```

**Value**: Saves 3-4 days of security implementation

---

### 4. Workspace Management (Auto-Claude)

**Source**: `.docs/research/agents/auto-claude/apps/backend/cli/worktree.py`

**What it provides**:
- Git worktree management
- Isolated workspace creation
- Branch management
- Safe merging

**Code to adapt**:

```python
# From cli/worktree.py

class WorkspaceManager:
    """
    Manage git worktrees for isolated agent workspaces

    Allows agents to work in isolated branches without affecting main codebase.
    """

    def __init__(self, project_dir: Path):
        self.project_dir = project_dir.resolve()
        self.worktrees_dir = project_dir / '.worktrees'

    def create_workspace(self, spec_name: str) -> tuple[Path, str]:
        """
        Create isolated workspace for a spec

        Returns:
            (workspace_path, branch_name)
        """
        branch_name = f"blackbox5/{spec_name}"
        workspace_path = self.worktrees_dir / spec_name

        # Create worktrees directory if needed
        self.worktrees_dir.mkdir(parents=True, exist_ok=True)

        # Create worktree
        subprocess.run(
            ['git', 'worktree', 'add', '-b', branch_name, str(workspace_path)],
            cwd=self.project_dir,
            check=True
        )

        return workspace_path, branch_name

    def merge_workspace(self, spec_name: str, target_branch: str = 'main'):
        """Merge workspace branch into target"""
        branch_name = f"blackbox5/{spec_name}"

        # Checkout target branch
        subprocess.run(
            ['git', 'checkout', target_branch],
            cwd=self.project_dir,
            check=True
        )

        # Merge workspace branch
        subprocess.run(
            ['git', 'merge', '--no-ff', branch_name],
            cwd=self.project_dir,
            check=True
        )

        # Remove worktree
        self.remove_workspace(spec_name)

    def remove_workspace(self, spec_name: str):
        """Remove workspace and clean up"""
        workspace_path = self.worktrees_dir / spec_name
        branch_name = f"blackbox5/{spec_name}"

        # Remove worktree
        subprocess.run(
            ['git', 'worktree', 'remove', str(workspace_path)],
            cwd=self.project_dir,
            check=False
        )

        # Delete branch
        subprocess.run(
            ['git', 'branch', '-D', branch_name],
            cwd=self.project_dir,
            check=False
        )
```

**Value**: Saves 2-3 days of workspace management

---

### 5. PRD/Epic/Task Templates (CCPM)

**Source**: `.docs/research/development-tools/ccpm/ccpm/commands/pm/`

**What it provides**:
- PRD creation with first principles
- Epic generation from PRDs
- Task decomposition
- GitHub sync

**Already adapted**: `.blackbox5/specs/prds/TEMPLATE.md`, `.blackbox5/specs/epics/TEMPLATE.md`, `.blackbox5/specs/tasks/TEMPLATE.md`

**Additional code to adapt**:

```python
# From CCPM prd-new.md - convert to Python

class PRDCreator:
    """Create PRDs with first principles analysis"""

    def create_prd(self, feature_name: str) -> dict:
        """
        Guide user through PRD creation

        Returns:
            PRD dictionary with all sections
        """
        prd = {
            'name': feature_name,
            'created': datetime.now().isoformat(),
            'status': 'backlog'
        }

        # Phase 1: Discovery
        print(f"Creating PRD for: {feature_name}")
        print("\n=== DISCOVERY ===")

        prd['problem'] = input("What problem are we solving? ")
        prd['why_now'] = input("Why is this important now? ")
        prd['target_users'] = input("Who are the target users? ")

        # Phase 2: First Principles Analysis
        print("\n=== FIRST PRINCIPLES ===")

        prd['fundamental_truths'] = self._get_truths()
        prd['assumptions'] = self._get_assumptions()
        prd['constraints'] = self._get_constraints()

        # Phase 3: Requirements
        print("\n=== REQUIREMENTS ===")

        prd['functional_requirements'] = self._get_functional_requirements()
        prd['non_functional_requirements'] = self._get_non_functional_requirements()

        # Phase 4: Success Criteria
        print("\n=== SUCCESS CRITERIA ===")

        prd['success_metrics'] = self._get_success_metrics()
        prd['acceptance_criteria'] = self._get_acceptance_criteria()

        return prd

    def _get_truths(self) -> list:
        """Get fundamental truths"""
        truths = []
        print("\nWhat do we know to be TRUE? (one per line, empty to finish)")
        while True:
            truth = input("> ")
            if not truth:
                break
            truths.append(truth)
        return truths

    def _get_assumptions(self) -> list:
        """Get assumptions and verify them"""
        assumptions = []
        print("\nWhat are our ASSUMPTIONS? (one per line, empty to finish)")
        while True:
            assumption = input("> ")
            if not assumption:
                break
            verified = input(f"  Verified? (y/n): ").lower() == 'y'
            assumptions.append({
                'statement': assumption,
                'verified': verified
            })
        return assumptions

    def save_prd(self, prd: dict, output_dir: Path):
        """Save PRD to markdown file"""
        output_dir.mkdir(parents=True, exist_ok=True)

        filename = output_dir / f"{prd['name']}.md"

        with open(filename, 'w') as f:
            f.write(f"# PRD: {prd['name']}\n\n")
            f.write(f"**Created**: {prd['created']}\n")
            f.write(f"**Status**: {prd['status']}\n\n")

            f.write("## Problem Statement\n\n")
            f.write(f"{prd['problem']}\n\n")
            f.write(f"**Why Now**: {prd['why_now']}\n\n")

            f.write("## First Principles Analysis\n\n")
            f.write("### Fundamental Truths\n\n")
            for truth in prd['fundamental_truths']:
                f.write(f"- {truth}\n")

            f.write("\n### Assumptions\n\n")
            for assumption in prd['assumptions']:
                verified = "✅" if assumption['verified'] else "❌"
                f.write(f"- {verified} {assumption['statement']}\n")

        print(f"✅ PRD saved: {filename}")


class EpicGenerator:
    """Generate technical epics from PRDs"""

    def generate_epic(self, prd_file: Path) -> dict:
        """
        Transform PRD into technical epic

        Extracts requirements and creates technical decisions
        """
        # Read PRD
        with open(prd_file) as f:
            prd_content = f.read()

        # Parse requirements
        requirements = self._extract_requirements(prd_content)

        # Create technical decisions
        decisions = self._make_technical_decisions(requirements)

        # Define components
        components = self._define_components(requirements, decisions)

        epic = {
            'name': prd_file.stem + "-epic",
            'prd_source': str(prd_file),
            'requirements': requirements,
            'technical_decisions': decisions,
            'components': components,
            'created': datetime.now().isoformat()
        }

        return epic

    def _extract_requirements(self, prd_content: str) -> list:
        """Extract functional requirements from PRD"""
        # Parse markdown sections
        # Find "## Requirements" section
        # Extract functional requirements
        requirements = []

        lines = prd_content.split('\n')
        in_requirements = False

        for line in lines:
            if '## Requirements' in line or '## Functional Requirements' in line:
                in_requirements = True
                continue

            if in_requirements and line.startswith('-'):
                # Extract requirement
                req = line.lstrip('-').strip()
                requirements.append(req)

            if in_requirements and line.startswith('##'):
                # End of requirements section
                break

        return requirements


class TaskDecomposer:
    """Decompose epics into tasks"""

    def decompose(self, epic: dict) -> list[dict]:
        """
        Break epic into actionable tasks

        Each task has:
        - Description
        - Acceptance criteria
        - File changes
        - Dependencies
        """
        tasks = []

        for component in epic['components']:
            # Create task for each component
            task = {
                'name': f"Implement {component['name']}",
                'description': component['description'],
                'acceptance_criteria': component.get('acceptance_criteria', []),
                'files': component.get('files', []),
                'dependencies': component.get('dependencies', []),
                'status': 'todo'
            }
            tasks.append(task)

        return tasks
```

**Value**: Already adapted, saves 5-7 days

---

### 6. Context/Memory Management (Cognee)

**Source**: `.docs/research/context-engineering/cognee/`

**What it provides**:
- Graph-based memory
- Context assembly
- Semantic search
- Pattern discovery

**Code to adapt**:

```python
# From Cognee - simplified version

class ContextManager:
    """
    Manage context for agent sessions

    Provides relevant context based on task.
    """

    def __init__(self, project_dir: Path):
        self.project_dir = project_dir
        self.context_cache = {}

    def get_context_for_task(self, task: str) -> dict:
        """
        Get relevant context for a task

        Returns:
            {
                'files': list of relevant files,
                'patterns': list of code patterns,
                'history': list of similar past tasks
            }
        """
        # Analyze task
        task_keywords = self._extract_keywords(task)

        # Find relevant files
        relevant_files = self._find_relevant_files(task_keywords)

        # Find similar patterns
        patterns = self._find_patterns(relevant_files)

        # Get history
        history = self._get_similar_history(task)

        return {
            'files': relevant_files,
            'patterns': patterns,
            'history': history
        }

    def _extract_keywords(self, task: str) -> list[str]:
        """Extract keywords from task description"""
        # Simple keyword extraction
        import re
        words = re.findall(r'\b[a-z]{3,}\b', task.lower())
        return list(set(words))

    def _find_relevant_files(self, keywords: list[str]) -> list[str]:
        """Find files containing keywords"""
        relevant_files = []

        for file_path in self.project_dir.rglob("*.py"):
            try:
                content = file_path.read_text()
                for keyword in keywords:
                    if keyword in content.lower():
                        relevant_files.append(str(file_path.relative_to(self.project_dir)))
                        break
            except:
                pass

        return relevant_files

    def add_session_context(self, session_id: str, context: dict):
        """Store context from a session"""
        self.context_cache[session_id] = {
            'context': context,
            'timestamp': datetime.now().isoformat()
        }
```

**Value**: Saves 3-4 days of context management

---

### 7. Command Registry (OpenSpec)

**Source**: `.docs/research/specifications/openspec/src/core/completions/command-registry.ts`

**What it provides**:
- Dynamic command registration
- Command completion
- Shell integration

**Code to adapt**:

```python
# .blackbox5/engine/core/CommandRegistry.py

class CommandRegistry:
    """Registry for all BlackBox5 commands"""

    def __init__(self):
        self.commands = {}
        self.aliases = {}

    def register_command(self, name: str, handler: callable, aliases: list = None):
        """Register a command"""
        self.commands[name] = handler

        if aliases:
            for alias in aliases:
                self.aliases[alias] = name

    def execute_command(self, command_name: str, *args, **kwargs):
        """Execute a command"""
        # Resolve alias
        actual_command = self.aliases.get(command_name, command_name)

        if actual_command not in self.commands:
            raise ValueError(f"Unknown command: {command_name}")

        handler = self.commands[actual_command]
        return handler(*args, **kwargs)

    def list_commands(self) -> list[str]:
        """List all registered commands"""
        return list(self.commands.keys())

    def get_command_help(self, command_name: str) -> str:
        """Get help for a command"""
        actual_command = self.aliases.get(command_name, command_name)

        if actual_command not in self.commands:
            return f"Unknown command: {command_name}"

        handler = self.commands[actual_command]
        return handler.__doc__ or "No help available"


# Global registry
command_registry = CommandRegistry()


def register_command(name: str, aliases: list = None):
    """Decorator to register commands"""
    def decorator(func):
        command_registry.register_command(name, func, aliases)
        return func
    return decorator


# Usage
@register_command('agent:start', aliases=['as'])
def start_agent(agent_name: str):
    """Start an agent"""
    print(f"Starting agent: {agent_name}")
```

**Value**: Saves 1-2 days of command infrastructure

---

### 8. Configuration Management (OpenSpec)

**Source**: `.docs/research/specifications/openspec/src/core/configurators/`

**What it provides**:
- Multiple tool configuration
- Template management
- File system updates with markers

**Code to adapt**:

```python
# .blackbox5/engine/core/ConfigManager.py

import yaml
from pathlib import Path

class ConfigManager:
    """Manage BlackBox5 configuration"""

    def __init__(self, config_dir: Path):
        self.config_dir = config_dir
        self.config_file = config_dir / "config.yaml"
        self.config = self._load_config()

    def _load_config(self) -> dict:
        """Load configuration from file"""
        if not self.config_file.exists():
            return self._create_default_config()

        with open(self.config_file) as f:
            return yaml.safe_load(f)

    def _create_default_config(self) -> dict:
        """Create default configuration"""
        default_config = {
            'environment': 'local',
            'debug': True,
            'log_level': 'INFO',
            'agents': {},
            'skills': {
                'base_path': '.blackbox5/engine/agents/.skills-new'
            },
            'data': {
                'path': '.blackbox5/data'
            },
            'logs': {
                'path': '.blackbox5/logs',
                'level': 'INFO'
            }
        }

        # Save default
        self.config_dir.mkdir(parents=True, exist_ok=True)
        with open(self.config_file, 'w') as f:
            yaml.dump(default_config, f)

        return default_config

    def get(self, key: str, default=None):
        """Get config value"""
        keys = key.split('.')
        value = self.config

        for k in keys:
            if isinstance(value, dict):
                value = value.get(k)
            else:
                return default

        return value if value is not None else default

    def set(self, key: str, value):
        """Set config value"""
        keys = key.split('.')
        config = self.config

        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]

        config[keys[-1]] = value
        self._save_config()

    def _save_config(self):
        """Save configuration to file"""
        with open(self.config_file, 'w') as f:
            yaml.dump(self.config, f)
```

**Value**: Saves 1-2 days of config management

---

### 9. Template System (OpenSpec)

**Source**: `.docs/research/specifications/openspec/src/core/templates/`

**What it provides**:
- Template management
- Variable substitution
- Multi-format support

**Code to adapt**:

```python
# .blackbox5/engine/core/TemplateManager.py

from string import Template
from pathlib import Path

class TemplateManager:
    """Manage templates for PRDs, epics, tasks"""

    def __init__(self, templates_dir: Path):
        self.templates_dir = templates_dir
        self.template_cache = {}

    def get_template(self, template_name: str) -> str:
        """Get template content"""
        if template_name in self.template_cache:
            return self.template_cache[template_name]

        template_file = self.templates_dir / f"{template_name}.md"

        if not template_file.exists():
            raise FileNotFoundError(f"Template not found: {template_name}")

        with open(template_file) as f:
            content = f.read()

        self.template_cache[template_name] = content
        return content

    def render_template(self, template_name: str, variables: dict) -> str:
        """Render template with variables"""
        template = Template(self.get_template(template_name))
        return template.safe_substitute(variables)

    def render_template_to_file(self, template_name: str, variables: dict, output_path: Path):
        """Render template and save to file"""
        content = self.render_template(template_name, variables)

        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w') as f:
            f.write(content)
```

**Value**: Saves 1 day of template implementation

---

### 10. Testing Framework (Auto-Claude)

**Source**: `.docs/research/agents/auto-claude/tests/`

**What it provides**:
- Comprehensive test suite
- Test fixtures
- Test helpers

**Code to adapt**:

```python
# .blackbox5/tests/conftest.py

import pytest
from pathlib import Path

@pytest.fixture
def temp_project(tmp_path):
    """Create a temporary project for testing"""
    project_dir = tmp_path / "test_project"
    project_dir.mkdir()

    # Create basic project structure
    (project_dir / "src").mkdir()
    (project_dir / "tests").mkdir()
    (project_dir / "README.md").write_text("# Test Project")

    return project_dir


@pytest.fixture
def mock_agent_config():
    """Mock agent configuration"""
    return {
        'name': 'test-agent',
        'type': 'developer',
        'capabilities': ['read', 'write', 'bash']
    }


# .blackbox5/tests/test_agent_skill_bridge.py

def test_load_skill(temp_project):
    """Test loading a skill"""
    from blackbox5.engine.core.AgentSkillBridge import AgentSkillBridge

    bridge = AgentSkillBridge(temp_project / ".blackbox5/engine/agents/.skills-new")
    skill = bridge.load_skill("development-workflow/coding-assistance/test-driven-development")

    assert skill is not None
    assert 'context' in skill
    assert 'instructions' in skill


def test_validate_skill(temp_project):
    """Test skill validation"""
    from blackbox5.engine.core.AgentSkillBridge import AgentSkillBridge

    bridge = AgentSkillBridge(temp_project / ".blackbox5/engine/agents/.skills-new")
    result = bridge.validate_skill("development-workflow/coding-assistance/test-driven-development")

    assert result is True
```

**Value**: Saves 2-3 days of test framework setup

---

## Summary Table

| # | Component | Source | Complexity | Time Saved | Priority |
|---|-----------|--------|------------|------------|----------|
| 1 | CLI Infrastructure | OpenSpec | Medium | 2-3 days | HIGH |
| 2 | Agent SDK Client | Auto-Claude | High | 5-7 days | CRITICAL |
| 3 | Security Layer | Auto-Claude | Medium | 3-4 days | HIGH |
| 4 | Workspace Management | Auto-Claude | Medium | 2-3 days | MEDIUM |
| 5 | PRD/Epic/Task Templates | CCPM | Low | 5-7 days | CRITICAL |
| 6 | Context/Memory Management | Cognee | High | 3-4 days | MEDIUM |
| 7 | Command Registry | OpenSpec | Low | 1-2 days | MEDIUM |
| 8 | Configuration Management | OpenSpec | Low | 1-2 days | LOW |
| 9 | Template System | OpenSpec | Low | 1 day | LOW |
| 10 | Testing Framework | Auto-Claude | Low | 2-3 days | MEDIUM |

**Total Time Saved**: 25-36 days of development

---

## Implementation Priority

### Week 1: Critical Components
1. **Agent SDK Client** (Auto-Claude) - Foundation for all AI interactions
2. **CLI Infrastructure** (OpenSpec) - User interface
3. **PRD Templates** (CCPM) - Already adapted, just integrate

### Week 2: Core Features
4. **Security Layer** (Auto-Claude) - Safety
5. **Command Registry** (OpenSpec) - Extensibility
6. **Agent-Skill Bridge** - Custom implementation

### Week 3: Advanced Features
7. **Context Management** (Cognee) - Performance
8. **Workspace Management** (Auto-Claude) - Isolation
9. **Testing Framework** (Auto-Claude) - Quality

### Week 4: Polish
10. **Configuration Management** (OpenSpec) - Usability
11. **Template System** (OpenSpec) - DX

---

## Next Steps

1. **Copy Agent SDK Client code** from Auto-Claude to `.blackbox5/engine/core/AgentClient.py`
2. **Adapt CLI code** from OpenSpec to `.blackbox5/cli/main.py`
3. **Integrate templates** already in `.blackbox5/specs/`
4. **Add security layer** from Auto-Claude
5. **Build agent-skill bridge** (custom implementation)

**Total implementation time**: 3-4 weeks (vs 8-12 weeks from scratch)
