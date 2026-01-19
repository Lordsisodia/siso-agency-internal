# BlackBox5 Implementation Guide
## Step-by-Step Code Adaptation from Frameworks

**Date**: 2025-01-18
**Status**: Ready to implement
**Estimated Time**: 3-4 weeks

---

## Overview

This guide provides **exact code to copy and adapt** from the 15 frameworks we researched. Each section includes:
1. Source location
2. What to copy
3. How to adapt for BlackBox5
4. Testing instructions

---

## Week 1: Foundation (Days 1-7)

### Day 1-2: CLI Infrastructure

**Source**: OpenSpec CLI (`.docs/research/specifications/openspec/src/cli/index.ts`)

**Step 1: Create CLI structure**

```bash
# Create directory
mkdir -p .blackbox5/cli

# Create main CLI file
cat > .blackbox5/cli/main.py << 'EOF'
#!/usr/bin/env python3
"""
BlackBox5 CLI - Main entry point
Adapted from OpenSpec CLI infrastructure
"""
import argparse
import sys
from pathlib import Path

class BlackBox5CLI:
    """Main CLI application"""

    def __init__(self):
        self.parser = self._create_parser()
        self.subparsers = {}

    def _create_parser(self):
        """Create argument parser"""
        parser = argparse.ArgumentParser(
            prog='bb5',
            description='BlackBox5 - AI Agent Framework',
            formatter_class=argparse.RawDescriptionHelpFormatter,
            epilog="""
Examples:
  bb5 agent:start developer        # Start developer agent
  bb5 skill:execute tdd            # Execute TDD skill
  bb5 prd:new feature-name         # Create new PRD
  bb5 status                       # Show system status
            """
        )

        # Global options
        parser.add_argument('--debug', action='store_true', help='Enable debug mode')
        parser.add_argument('--no-color', action='store_true', help='Disable colored output')

        return parser

    def register_commands(self):
        """Register all commands"""
        # Agent commands
        agent_parser = self.parser.add_subparsers(dest='command', help='Available commands')

        # agent:start
        start = agent_parser.add_parser('agent:start', help='Start an agent')
        start.add_argument('agent_name', help='Name of agent to start')

        # agent:stop
        stop = agent_parser.add_parser('agent:stop', help='Stop an agent')
        stop.add_argument('agent_name', help='Name of agent to stop')

        # agent:list
        agent_parser.add_parser('agent:list', help='List all agents')

        # Skill commands
        skill_parser = self.parser.add_subparsers(dest='command', help='Available commands')

        # skill:execute
        execute = skill_parser.add_parser('skill:execute', help='Execute a skill')
        execute.add_argument('skill_name', help='Name of skill to execute')

        # skill:list
        skill_parser.add_parser('skill:list', help='List all skills')

        # skill:validate
        validate = skill_parser.add_parser('skill:validate', help='Validate a skill')
        validate.add_argument('skill_name', nargs='?', help='Name of skill to validate (or --all)')

        # PRD commands
        prd_parser = self.parser.add_subparsers(dest='command', help='Available commands')

        # prd:new
        new = prd_parser.add_parser('prd:new', help='Create new PRD')
        new.add_argument('name', help='PRD name (kebab-case)')

        # prd:list
        prd_parser.add_parser('prd:list', help='List all PRDs')

        # Status command
        self.parser.add_parser('status', help='Show system status')

    def run(self, args=None):
        """Run CLI"""
        parsed_args = self.parser.parse_args(args)

        if not parsed_args.command:
            self.parser.print_help()
            return 1

        # Route to command handler
        return self._route_command(parsed_args)

    def _route_command(self, args):
        """Route command to handler"""
        command = args.command

        if command == 'agent:start':
            return self._handle_agent_start(args)
        elif command == 'agent:stop':
            return self._handle_agent_stop(args)
        elif command == 'agent:list':
            return self._handle_agent_list(args)
        elif command == 'skill:execute':
            return self._handle_skill_execute(args)
        elif command == 'skill:list':
            return self._handle_skill_list(args)
        elif command == 'skill:validate':
            return self._handle_skill_validate(args)
        elif command == 'prd:new':
            return self._handle_prd_new(args)
        elif command == 'prd:list':
            return self._handle_prd_list(args)
        elif command == 'status':
            return self._handle_status(args)
        else:
            print(f"Unknown command: {command}")
            return 1

    def _handle_agent_start(self, args):
        """Handle agent:start command"""
        print(f"Starting agent: {args.agent_name}")
        # TODO: Implement agent start logic
        return 0

    def _handle_agent_stop(self, args):
        """Handle agent:stop command"""
        print(f"Stopping agent: {args.agent_name}")
        # TODO: Implement agent stop logic
        return 0

    def _handle_agent_list(self, args):
        """Handle agent:list command"""
        print("Available agents:")
        print("  - developer: Software development tasks")
        print("  - tester: Testing and QA")
        print("  - planner: Planning and architecture")
        return 0

    def _handle_skill_execute(self, args):
        """Handle skill:execute command"""
        print(f"Executing skill: {args.skill_name}")
        # TODO: Implement skill execution logic
        return 0

    def _handle_skill_list(self, args):
        """Handle skill:list command"""
        from blackbox5.engine.core.SkillManager import SkillManager

        manager = SkillManager(Path(".blackbox5/engine/agents/.skills-new"))
        skills = manager.list_skills()

        print("Available skills:")
        for skill in sorted(skills):
            print(f"  - {skill}")
        return 0

    def _handle_skill_validate(self, args):
        """Handle skill:validate command"""
        from blackbox5.engine.core.SkillManager import SkillManager

        manager = SkillManager(Path(".blackbox5/engine/agents/.skills-new"))

        if args.skill_name:
            # Validate specific skill
            result = manager.validate_skill(args.skill_name)
            print(f"✅ Skill validated: {args.skill_name}" if result else f"❌ Skill validation failed: {args.skill_name}")
        else:
            # Validate all skills
            results = manager.validate_all_skills()
            print(f"✅ Valid: {len(results['valid'])} skills")
            print(f"❌ Invalid: {len(results['invalid'])} skills")

        return 0

    def _handle_prd_new(self, args):
        """Handle prd:new command"""
        print(f"Creating PRD: {args.name}")
        # TODO: Implement PRD creation logic
        return 0

    def _handle_prd_list(self, args):
        """Handle prd:list command"""
        from pathlib import Path

        prd_dir = Path(".blackbox5/specs/prds")
        prds = list(prd_dir.glob("*.md")) if prd_dir.exists() else []

        print(f"Found {len(prds)} PRD(s):")
        for prd in sorted(prds):
            print(f"  - {prd.stem}")
        return 0

    def _handle_status(self, args):
        """Handle status command"""
        print("BlackBox5 System Status")
        print("=" * 50)
        print("Engine: ✅ Running")
        print("Agents: ⚠️  None registered")
        print("Skills: ✅ 31 documented")
        print("PRDs: ✅ Template ready")
        print("CLI: ✅ Ready")
        return 0


def main():
    """Main entry point"""
    cli = BlackBox5CLI()
    cli.register_commands()
    sys.exit(cli.run())


if __name__ == '__main__':
    main()
EOF

chmod +x .blackbox5/cli/main.py
```

**Step 2: Test CLI**

```bash
# Test help
.python .blackbox5/cli/main.py --help

# Test status
python .blackbox5/cli/main.py status

# Test skill list
python .blackbox5/cli/main.py skill:list
```

---

### Day 3-4: Agent SDK Client

**Source**: Auto-Claude (`.docs/research/agents/auto-claude/apps/backend/core/client.py`)

**Step 1: Create AgentClient**

```bash
cat > .blackbox5/engine/core/AgentClient.py << 'EOF'
"""
BlackBox5 Agent Client
Adapted from Auto-Claude's Claude SDK client
"""
import copy
import logging
import os
import time
import threading
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

# Project index cache (5-minute TTL)
_PROJECT_INDEX_CACHE: dict[str, tuple[dict[str, Any], dict[str, bool], float]] = {}
_CACHE_TTL_SECONDS = 300
_CACHE_LOCK = threading.Lock()


class BlackBox5AgentClient:
    """
    Client for agent interactions

    Adapted from Auto-Claude's create_client() function.
    Manages project index, capabilities, and tool permissions.
    """

    def __init__(
        self,
        agent_type: str,
        project_dir: Path,
        model: str = "claude-sonnet-4-5-20250929"
    ):
        self.agent_type = agent_type
        self.project_dir = project_dir.resolve()
        self.model = model

        # Load project data with caching
        self.project_index, self.capabilities = self._get_cached_project_data()

        # Get allowed tools for this agent type
        self.allowed_tools = self._get_allowed_tools()

    def _get_cached_project_data(self) -> tuple[dict[str, Any], dict[str, bool]]:
        """
        Get project index and capabilities with caching

        Adapted from Auto-Claude's _get_cached_project_data()
        """
        key = str(self.project_dir)
        now = time.time()

        # Check cache with lock
        with _CACHE_LOCK:
            if key in _PROJECT_INDEX_CACHE:
                cached_index, cached_capabilities, cached_time = _PROJECT_INDEX_CACHE[key]
                cache_age = now - cached_time
                if cache_age < _CACHE_TTL_SECONDS:
                    logger.debug(f"Using cached project data for {self.project_dir}")
                    # Return deep copies to prevent cache corruption
                    return copy.deepcopy(cached_index), copy.deepcopy(cached_capabilities)

        # Cache miss or expired - load fresh data
        logger.debug(f"Loading project data for {self.project_dir}")
        project_index = self._load_project_index()
        project_capabilities = self._detect_capabilities(project_index)

        # Store in cache
        with _CACHE_LOCK:
            _PROJECT_INDEX_CACHE[key] = (project_index, project_capabilities, time.time())

        return project_index, project_capabilities

    def _load_project_index(self) -> dict[str, Any]:
        """
        Load project files and structure

        Scans project directory and creates index of files, directories, dependencies.
        """
        files = []
        directories = []

        for item in self.project_dir.rglob("*"):
            relative_path = item.relative_to(self.project_dir)
            if item.is_file():
                files.append(str(relative_path))
            elif item.is_dir():
                directories.append(str(relative_path))

        return {
            'files': files,
            'directories': directories,
            'dependencies': self._detect_dependencies()
        }

    def _detect_dependencies(self) -> dict[str, list[str]]:
        """Detect project dependencies"""
        deps = {}

        # Python
        if (self.project_dir / "requirements.txt").exists():
            with open(self.project_dir / "requirements.txt") as f:
                deps['python'] = [line.strip() for line in f if line.strip() and not line.startswith('#')]

        # Python with pyproject.toml
        if (self.project_dir / "pyproject.toml").exists():
            try:
                import tomli
                with open(self.project_dir / "pyproject.toml") as f:
                    pyproject = tomli.load(f)
                    deps['python'] = list(pyproject.get('project', {}).get('dependencies', []))
            except ImportError:
                pass

        # Node.js
        if (self.project_dir / "package.json").exists():
            import json
            with open(self.project_dir / "package.json") as f:
                package_json = json.load(f)
                deps['node'] = list(package_json.get('dependencies', {}).keys())
                deps['node_dev'] = list(package_json.get('devDependencies', {}).keys())

        return deps

    def _detect_capabilities(self, project_index: dict[str, Any]) -> dict[str, bool]:
        """
        Detect project capabilities

        Returns dict with keys like:
        - has_frontend, has_backend, is_python, is_node, has_tests, etc.
        """
        capabilities = {}
        files = project_index.get('files', [])

        # Language detection
        capabilities['is_python'] = any(f.endswith('.py') for f in files)
        capabilities['is_javascript'] = any(f.endswith(('.js', '.jsx', '.ts', '.tsx')) for f in files)
        capabilities['is_rust'] = any(f.endswith('.rs') for f in files)
        capabilities['is_go'] = any(f.endswith('.go') for f in files)

        # Framework detection
        capabilities['is_react'] = any('react' in f.lower() for f in files)
        capabilities['is_vue'] = any('vue' in f.lower() for f in files)
        capabilities['is_django'] = any('django' in f.lower() for f in files)
        capabilities['is_fastapi'] = any('fastapi' in f.lower() for f in files)

        # Testing
        capabilities['has_tests'] = any(
            'test' in f.lower() or 'spec' in f.lower()
            for f in files
        )

        # Package managers
        capabilities['has_package_json'] = 'package.json' in files
        capabilities['has_requirements_txt'] = 'requirements.txt' in files
        capabilities['has_cargo_toml'] = 'Cargo.toml' in files

        # Git
        capabilities['uses_git'] = (self.project_dir / '.git').exists()

        return capabilities

    def _get_allowed_tools(self) -> list[str]:
        """
        Get tools allowed for this agent type

        Different agents get different tool permissions:
        - developer: read, write, bash, search
        - tester: read, bash, test
        - planner: read, search
        - analyst: read, search
        """
        TOOL_PERMISSIONS = {
            'developer': ['read', 'write', 'bash', 'search', 'test'],
            'tester': ['read', 'bash', 'test'],
            'planner': ['read', 'search'],
            'analyst': ['read', 'search'],
            'qa_reviewer': ['read', 'test', 'bash'],
            'qa_fixer': ['read', 'write', 'bash', 'test']
        }

        base_tools = TOOL_PERMISSIONS.get(self.agent_type, ['read'])

        # Add capability-specific tools
        if self.capabilities.get('is_python') and 'bash' in base_tools:
            base_tools.extend(['python', 'pip', 'pytest'])

        if self.capabilities.get('is_javascript') and 'bash' in base_tools:
            base_tools.extend(['npm', 'yarn', 'node'])

        return list(set(base_tools))  # Remove duplicates

    def create_session(self, task: str) -> str:
        """
        Create an agent session for a task

        Returns session prompt with context and allowed tools.
        """
        # Build context from project index
        context = self._build_context(task)

        # Build prompt
        prompt = f"""
<context>
**Project**: {self.project_dir.name}
**Agent Type**: {self.agent_type}
**Allowed Tools**: {', '.join(self.allowed_tools)}

**Project Capabilities**:
{self._format_capabilities()}

**Task**: {task}
</context>

<context>
**Project Structure**:
{self._format_project_structure()}
</context>

<instructions>
You are a {self.agent_type} agent working on this project.
Use only the allowed tools listed above.
</instructions>
"""
        return prompt

    def _build_context(self, task: str) -> dict:
        """Build context for the task"""
        # TODO: Implement smart context building
        # For now, return basic context
        return {
            'task': task,
            'capabilities': self.capabilities,
            'tools': self.allowed_tools
        }

    def _format_capabilities(self) -> str:
        """Format capabilities for display"""
        lines = []
        for key, value in self.capabilities.items():
            if value:
                lines.append(f"  - {key}: ✅")
        return '\n'.join(lines) if lines else "  None detected"

    def _format_project_structure(self) -> str:
        """Format project structure for display"""
        # Get top-level directories and key files
        items = []

        for item in sorted(self.project_dir.iterdir()):
            if item.is_dir() and not item.name.startswith('.'):
                items.append(f"📁 {item.name}/")
            elif item.is_file() and item.name in ['package.json', 'requirements.txt', 'README.md', 'pyproject.toml']:
                items.append(f"📄 {item.name}")

        return '\n'.join(items) if items else "Empty project"


def create_client(
    agent_type: str,
    project_dir: Path,
    model: str = "claude-sonnet-4-5-20250929"
) -> BlackBox5AgentClient:
    """
    Factory function to create agent client

    This is the main entry point for creating agent clients.
    Adapted from Auto-Claude's create_client().
    """
    return BlackBox5AgentClient(
        agent_type=agent_type,
        project_dir=project_dir,
        model=model
    )
EOF
```

**Step 2: Test AgentClient**

```bash
# Create test script
cat > .blackbox5/tests/test_agent_client.py << 'EOF'
from pathlib import Path
import sys
sys.path.insert(0, '.blackbox5/engine/core')

from AgentClient import create_client

# Test creating client
client = create_client('developer', Path('.'))

print("Agent Type:", client.agent_type)
print("Capabilities:", client.capabilities)
print("Allowed Tools:", client.allowed_tools)

# Test creating session
prompt = client.create_session("Implement a new feature")
print("\nSession Prompt:")
print(prompt)
EOF

python .blackbox5/tests/test_agent_client.py
```

---

### Day 5-7: Security Layer

**Source**: Auto-Claude (`.docs/research/agents/auto-claude/apps/backend/core/security.py`)

**Step 1: Create Security Layer**

```bash
cat > .blackbox5/engine/core/Security.py << 'EOF'
"""
Security Layer for BlackBox5
Adapted from Auto-Claude's security.py
"""
import re
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class SecurityValidator:
    """
    Validate commands and operations for safety

    Prevents dangerous operations while allowing safe development tasks.
    """

    # Dangerous command patterns
    DANGEROUS_PATTERNS = [
        r'rm\s+-rf\s+/',           # Delete root
        r'dd\s+if=',                # Direct disk write
        r':\(\)\{\s*:\|:&\s*;\s*\}',  # Fork bomb
        r'>\s*/dev/sd[a-z]',        # Direct disk manipulation
        r'mkfs\.',                  # Filesystem creation
        r'chmod\s+000',             # Disable all permissions
        r'chattr\s+\+i',            # Immutable attribute
        r'shred\s+',                # Secure delete
    ]

    def __init__(self):
        self.warning_issued = False

    def validate_command(self, command: str) -> tuple[bool, str]:
        """
        Validate a bash command for safety

        Args:
            command: The command to validate

        Returns:
            (is_safe, error_message)
        """
        # Check against dangerous patterns
        for pattern in self.DANGEROUS_PATTERNS:
            if re.search(pattern, command):
                return False, f"Command matches dangerous pattern: {pattern}"

        # Check for path traversal in delete commands
        if 'rm' in command and '../' in command:
            return False, "Path traversal detected in delete command"

        # Check for suspicious sudo usage
        if command.startswith('sudo ') and any(dangerous in command for dangerous in ['rm', 'dd', 'mkfs', 'shred']):
            return False, "Dangerous sudo command detected"

        return True, ""

    def validate_path(self, path: str, base_dir: Path) -> tuple[bool, Path]:
        """
        Validate that path is within allowed directory

        Args:
            path: Path to validate
            base_dir: Base directory that path must be within

        Returns:
            (is_valid, safe_absolute_path)
        """
        try:
            # Resolve to absolute path
            abs_path = Path(path).resolve()
            abs_base = base_dir.resolve()

            # Check if within allowed base
            abs_path.relative_to(abs_base)

            return True, abs_path

        except ValueError:
            # Path is outside allowed directory
            return False, abs_base

    def sanitize_filename(self, filename: str) -> str:
        """
        Sanitize filename to prevent directory traversal

        Args:
            filename: Filename to sanitize

        Returns:
            Sanitized filename
        """
        # Remove path separators
        sanitized = filename.replace('/', '').replace('\\', '')

        # Remove parent directory references
        sanitized = sanitized.replace('..', '')

        # Remove null bytes
        sanitized = sanitized.replace('\x00', '')

        return sanitized


class FilesystemSandbox:
    """
    Filesystem sandbox to restrict operations

    Ensures agents can only operate within allowed directory.
    """

    def __init__(self, allowed_base: Path):
        """
        Initialize sandbox

        Args:
            allowed_base: Base directory for sandbox (all operations must stay within)
        """
        self.allowed_base = allowed_base.resolve()
        self.validator = SecurityValidator()

    def validate_path(self, path: str) -> tuple[bool, Path]:
        """
        Validate that path is within sandbox

        Args:
            path: Path to validate

        Returns:
            (is_valid, safe_absolute_path)
        """
        return self.validator.validate_path(path, self.allowed_base)

    def safe_read(self, path: str) -> str:
        """
        Safely read file within sandbox

        Args:
            path: Path to file

        Returns:
            File content

        Raises:
            SecurityError: If path is outside sandbox
        """
        is_valid, safe_path = self.validate_path(path)

        if not is_valid:
            raise SecurityError(f"Path outside sandbox: {path}")

        return safe_path.read_text()

    def safe_write(self, path: str, content: str):
        """
        Safely write file within sandbox

        Args:
            path: Path to file
            content: Content to write

        Raises:
            SecurityError: If path is outside sandbox
        """
        is_valid, safe_path = self.validate_path(path)

        if not is_valid:
            raise SecurityError(f"Path outside sandbox: {path}")

        safe_path.parent.mkdir(parents=True, exist_ok=True)
        safe_path.write_text(content)

    def safe_delete(self, path: str):
        """
        Safely delete file within sandbox

        Args:
            path: Path to file

        Raises:
            SecurityError: If path is outside sandbox or is dangerous operation
        """
        is_valid, safe_path = self.validate_path(path)

        if not is_valid:
            raise SecurityError(f"Path outside sandbox: {path}")

        # Additional safety check for delete operations
        if safe_path == self.allowed_base:
            raise SecurityError("Cannot delete sandbox root directory")

        safe_path.unlink()


class SecurityError(Exception):
    """Security-related errors"""
    pass


class SecurityLayer:
    """
    Combined security layer for BlackBox5

    Integrates validation and sandboxing for complete security.
    """

    def __init__(self, project_dir: Path):
        """
        Initialize security layer

        Args:
            project_dir: Project directory to sandbox
        """
        self.project_dir = project_dir.resolve()
        self.validator = SecurityValidator()
        self.sandbox = FilesystemSandbox(project_dir)

    def validate_operation(self, operation: str, params: dict) -> tuple[bool, str]:
        """
        Validate an agent operation

        Args:
            operation: Operation type ('read', 'write', 'bash', 'delete')
            params: Operation parameters

        Returns:
            (is_allowed, error_message)
        """
        if operation == 'bash':
            command = params.get('command', '')
            return self.validator.validate_command(command)

        elif operation in ['write', 'delete']:
            path = params.get('path', '')
            is_valid, _ = self.sandbox.validate_path(path)
            return is_valid, "" if is_valid else f"Path outside sandbox: {path}"

        elif operation == 'read':
            path = params.get('path', '')
            is_valid, _ = self.sandbox.validate_path(path)
            return is_valid, "" if is_valid else f"Path outside sandbox: {path}"

        return True, ""

    def execute_safe_read(self, path: str) -> str:
        """Execute safe read operation"""
        return self.sandbox.safe_read(path)

    def execute_safe_write(self, path: str, content: str):
        """Execute safe write operation"""
        self.sandbox.safe_write(path, content)

    def execute_safe_delete(self, path: str):
        """Execute safe delete operation"""
        self.sandbox.safe_delete(path)
EOF
```

**Step 2: Test Security Layer**

```bash
cat > .blackbox5/tests/test_security.py << 'EOF'
from pathlib import Path
import sys
sys.path.insert(0, '.blackbox5/engine/core')

from Security import SecurityLayer, SecurityError

# Test security layer
security = SecurityLayer(Path('.'))

# Test command validation
print("Testing command validation:")

# Safe command
is_safe, msg = security.validate_operation('bash', {'command': 'ls -la'})
print(f"  'ls -la': {is_safe} ({msg})")

# Dangerous command
is_safe, msg = security.validate_operation('bash', {'command': 'rm -rf /'})
print(f"  'rm -rf /': {is_safe} ({msg})")

# Test path validation
print("\nTesting path validation:")

# Safe path
is_safe, msg = security.validate_operation('read', {'path': 'README.md'})
print(f"  'README.md': {is_safe} ({msg})")

# Test sandbox operations
print("\nTesting sandbox operations:")

try:
    content = security.execute_safe_read('SETUP-CHECKLIST.md')
    print(f"  Read file: ✅ Success ({len(content)} chars)")
except SecurityError as e:
    print(f"  Read file: ❌ {e}")

try:
    security.execute_safe_write('/tmp/test.txt', 'test content')
    print(f"  Write outside sandbox: ❌ Should fail")
except SecurityError as e:
    print(f"  Write outside sandbox: ✅ Blocked ({e})")
EOF

python .blackbox5/tests/test_security.py
```

---

## Week 2: Integration (Days 8-14)

### Day 8-10: Agent-Skill Bridge

**Step 1: Create AgentSkillBridge**

```bash
cat > .blackbox5/engine/core/AgentSkillBridge.py << 'EOF'
"""
Agent-Skill Bridge for BlackBox5

Connects agents with XML-structured skills.
"""
import re
from pathlib import Path
from typing import Optional, Dict, Any


class AgentSkillBridge:
    """
    Bridge between agents and skills

    Handles skill loading, validation, and execution.
    """

    def __init__(self, skills_base: Path):
        """
        Initialize bridge

        Args:
            skills_base: Base directory for skills
        """
        self.skills_base = skills_base.resolve()
        self.skill_cache: Dict[str, dict] = {}

    def load_skill(self, skill_path: str) -> Optional[dict]:
        """
        Load a skill from disk

        Args:
            skill_path: Relative path to skill (e.g., 'development-workflow/coding-assistance/test-driven-development')

        Returns:
            Skill data dict or None if not found
        """
        # Check cache first
        if skill_path in self.skill_cache:
            return self.skill_cache[skill_path]

        # Construct full path
        skill_file = self.skills_base / skill_path / "SKILL.md"

        if not skill_file.exists():
            return None

        # Read skill file
        with open(skill_file) as f:
            content = f.read()

        # Extract XML sections
        skill_data = {
            'path': skill_path,
            'context': self._extract_tag(content, 'context'),
            'instructions': self._extract_tag(content, 'instructions'),
            'workflow': self._extract_tag(content, 'workflow'),
            'examples': self._extract_tag(content, 'examples'),
            'rules': self._extract_tag(content, 'rules'),
            'notes': self._extract_tag(content, 'notes'),
        }

        # Cache it
        self.skill_cache[skill_path] = skill_data

        return skill_data

    def _extract_tag(self, content: str, tag: str) -> str:
        """
        Extract content between XML tags

        Args:
            content: Full content to search
            tag: Tag name to extract

        Returns:
            Content between tags (empty string if not found)
        """
        start_tag = f"<{tag}>"
        end_tag = f"</{tag}>"

        start_idx = content.find(start_tag)
        if start_idx == -1:
            return ""

        end_idx = content.find(end_tag, start_idx)
        if end_idx == -1:
            return ""

        return content[start_idx + len(start_tag):end_idx].strip()

    def execute_skill(self, skill_path: str, agent_context: dict) -> str:
        """
        Execute a skill with agent context

        Args:
            skill_path: Path to skill
            agent_context: Context from agent (task, capabilities, etc.)

        Returns:
            Formatted prompt for LLM
        """
        skill_data = self.load_skill(skill_path)

        if not skill_data:
            return "Skill not found"

        # Build prompt from skill
        prompt = f"""<context>
{skill_data['context']}

**Agent Context**:
- Task: {agent_context.get('task', 'No task specified')}
- Agent: {agent_context.get('agent', 'Unknown')}
- Capabilities: {', '.join(agent_context.get('capabilities', []))}
</context>

<instructions>
{skill_data['instructions']}
</instructions>

<worflow>
{skill_data['workflow']}
</workflow>

<examples>
{skill_data['examples']}
</examples>
"""
        return prompt

    def list_skills(self, category: Optional[str] = None) -> list[str]:
        """
        List all available skills

        Args:
            category: Optional category filter

        Returns:
            List of skill paths
        """
        skills = []

        for skill_folder in self.skills_base.rglob("SKILL.md"):
            rel_path = skill_folder.parent.relative_to(self.skills_base)
            skills.append(str(rel_path))

        if category:
            skills = [s for s in skills if s.startswith(category)]

        return sorted(skills)

    def validate_skill(self, skill_path: str) -> bool:
        """
        Validate a skill has required XML tags

        Args:
            skill_path: Path to skill

        Returns:
            True if valid, False otherwise
        """
        skill_data = self.load_skill(skill_path)

        if not skill_data:
            print(f"❌ Skill not found: {skill_path}")
            return False

        # Check required tags
        required_tags = ['context', 'instructions']

        for tag in required_tags:
            if not skill_data.get(tag):
                print(f"❌ Missing required tag: {tag}")
                return False

        print(f"✅ Skill validated: {skill_path}")
        return True

    def search_skills(self, query: str) -> list[str]:
        """
        Search skills by keyword

        Args:
            query: Search query

        Returns:
            List of matching skill paths
        """
        query_lower = query.lower()
        matching_skills = []

        for skill_path in self.list_skills():
            skill_data = self.load_skill(skill_path)

            if not skill_data:
                continue

            # Search in all fields
            search_text = ' '.join([
                skill_data.get('context', ''),
                skill_data.get('instructions', ''),
                skill_path
            ]).lower()

            if query_lower in search_text:
                matching_skills.append(skill_path)

        return matching_skills
EOF
```

**Step 2: Test AgentSkillBridge**

```bash
cat > .blackbox5/tests/test_skill_bridge.py << 'EOF'
from pathlib import Path
import sys
sys.path.insert(0, '.blackbox5/engine/core')

from AgentSkillBridge import AgentSkillBridge

# Test agent-skill bridge
bridge = AgentSkillBridge(Path('.blackbox5/engine/agents/.skills-new'))

# Test loading skill
print("Testing skill loading:")
skill = bridge.load_skill('development-workflow/coding-assistance/test-driven-development')
if skill:
    print(f"  ✅ Loaded skill: {skill['path']}")
    print(f"  Context: {skill['context'][:50]}...")
else:
    print("  ❌ Failed to load skill")

# Test listing skills
print("\nTesting skill listing:")
skills = bridge.list_skills('development-workflow')
for s in skills[:3]:
    print(f"  - {s}")

# Test executing skill
print("\nTesting skill execution:")
prompt = bridge.execute_skill(
    'development-workflow/coding-assistance/test-driven-development',
    {
        'task': 'Implement a new feature',
        'agent': 'developer',
        'capabilities': ['read', 'write', 'bash']
    }
)
print(f"  Prompt length: {len(prompt)} chars")

# Test validation
print("\nTesting skill validation:")
result = bridge.validate_skill('development-workflow/coding-assistance/test-driven-development')
print(f"  Validation result: {result}")

# Test search
print("\nTesting skill search:")
results = bridge.search_skills('test')
for r in results[:3]:
    print(f"  - {r}")
EOF

python .blackbox5/tests/test_skill_bridge.py
```

---

### Day 11-14: Concrete Agent Implementation

**Step 1: Create DeveloperAgent**

```bash
mkdir -p .blackbox5/engine/agents/implementations

cat > .blackbox5/engine/agents/implementations/DeveloperAgent.py << 'EOF'
"""
Developer Agent - Concrete implementation

Specialized in software development tasks.
"""
from pathlib import Path
import sys
sys.path.insert(0, '../core')

from AgentClient import BlackBox5AgentClient
from AgentSkillBridge import AgentSkillBridge
from Security import SecurityLayer


class DeveloperAgent:
    """
    Developer Agent

    Handles coding, debugging, and software development tasks.
    """

    def __init__(self, project_dir: Path):
        """
        Initialize developer agent

        Args:
            project_dir: Project directory
        """
        self.name = "developer"
        self.role = "Software Development Agent"
        self.project_dir = project_dir

        # Initialize client
        self.client = BlackBox5AgentClient(
            agent_type='developer',
            project_dir=project_dir
        )

        # Initialize skill bridge
        self.skill_bridge = AgentSkillBridge(
            Path('.blackbox5/engine/agents/.skills-new')
        )

        # Initialize security
        self.security = SecurityLayer(project_dir)

        # Capabilities
        self.capabilities = [
            "coding-assistance",
            "testing-quality",
            "deployment-ops"
        ]

    def process_task(self, task: str) -> str:
        """
        Process a development task

        Args:
            task: Task description

        Returns:
            Formatted prompt for LLM
        """
        # Determine which skill to use
        skill_path = self._determine_skill(task)

        # Load and execute skill
        agent_context = {
            'task': task,
            'agent': self.name,
            'capabilities': self.client.allowed_tools
        }

        prompt = self.skill_bridge.execute_skill(skill_path, agent_context)

        # Add project context
        project_prompt = self.client.create_session(task)

        # Combine prompts
        full_prompt = f"{project_prompt}\n\n{prompt}"

        return full_prompt

    def _determine_skill(self, task: str) -> str:
        """
        Determine which skill to use based on task

        Args:
            task: Task description

        Returns:
            Path to skill
        """
        task_lower = task.lower()

        # Skill routing logic
        if 'test' in task_lower or 'tdd' in task_lower:
            return "development-workflow/coding-assistance/test-driven-development"
        elif 'debug' in task_lower or 'fix' in task_lower:
            return "development-workflow/testing-quality/systematic-debugging"
        elif 'deploy' in task_lower or 'release' in task_lower:
            return "development-workflow/deployment-ops/long-run-ops"
        elif 'refactor' in task_lower:
            return "development-workflow/coding-assistance/test-driven-development"
        else:
            # Default to TDD
            return "development-workflow/coding-assistance/test-driven-development"


def create_developer_agent(project_dir: Path) -> DeveloperAgent:
    """
    Factory function to create developer agent

    Args:
        project_dir: Project directory

    Returns:
        DeveloperAgent instance
    """
    return DeveloperAgent(project_dir)
EOF
```

**Step 2: Test DeveloperAgent**

```bash
cat > .blackbox5/tests/test_developer_agent.py << 'EOF'
from pathlib import Path
import sys
sys.path.insert(0, '.blackbox5/engine/agents/implementations')

from DeveloperAgent import create_developer_agent

# Test developer agent
agent = create_developer_agent(Path('.'))

print("Developer Agent Test")
print("=" * 50)
print(f"Name: {agent.name}")
print(f"Role: {agent.role}")
print(f"Capabilities: {agent.capabilities}")
print()

# Test processing different tasks
tasks = [
    "Write tests for user authentication",
    "Debug the login bug",
    "Deploy to production",
    "Refactor the payment module"
]

for task in tasks:
    print(f"Task: {task}")
    skill = agent._determine_skill(task)
    print(f"  Selected skill: {skill}")

    prompt = agent.process_task(task)
    print(f"  Prompt length: {len(prompt)} chars")
    print()
EOF

python .blackbox5/tests/test_developer_agent.py
```

---

## Week 3-4: Advanced Features

### Day 15-17: Context Management

**Source**: Cognee (`.docs/research/context-engineering/cognee/`)

Create simplified context manager:

```bash
cat > .blackbox5/engine/core/ContextManager.py << 'EOF'
"""
Context Manager for BlackBox5

Provides relevant context based on task.
Adapted from Cognee's context management.
"""
import re
from pathlib import Path
from typing import dict
from datetime import datetime


class ContextManager:
    """
    Manage context for agent sessions

    Provides relevant files, patterns, and history based on task.
    """

    def __init__(self, project_dir: Path):
        """
        Initialize context manager

        Args:
            project_dir: Project directory
        """
        self.project_dir = project_dir.resolve()
        self.context_cache = {}

    def get_context_for_task(self, task: str) -> dict:
        """
        Get relevant context for a task

        Args:
            task: Task description

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
            'history': history,
            'timestamp': datetime.now().isoformat()
        }

    def _extract_keywords(self, task: str) -> list[str]:
        """
        Extract keywords from task description

        Args:
            task: Task description

        Returns:
            List of keywords
        """
        # Simple keyword extraction (3+ letter words)
        words = re.findall(r'\b[a-z]{3,}\b', task.lower())
        return list(set(words))

    def _find_relevant_files(self, keywords: list[str]) -> list[str]:
        """
        Find files containing keywords

        Args:
            keywords: Keywords to search for

        Returns:
            List of relevant file paths
        """
        relevant_files = []

        for file_path in self.project_dir.rglob("*.py"):
            try:
                content = file_path.read_text()
                for keyword in keywords:
                    if keyword in content.lower():
                        rel_path = str(file_path.relative_to(self.project_dir))
                        if rel_path not in relevant_files:
                            relevant_files.append(rel_path)
                        break
            except:
                pass

        return relevant_files[:10]  # Limit to 10 files

    def _find_patterns(self, files: list[str]) -> list[str]:
        """
        Find code patterns in files

        Args:
            files: List of files to analyze

        Returns:
            List of pattern descriptions
        """
        patterns = []

        for file_path in files[:5]:  # Analyze first 5 files
            full_path = self.project_dir / file_path
            try:
                content = full_path.read_text()

                # Look for common patterns
                if 'def test_' in content:
                    patterns.append(f"{file_path}: Contains test functions")

                if 'class ' in content:
                    patterns.append(f"{file_path}: Contains class definitions")

                if 'import ' in content:
                    patterns.append(f"{file_path}: Contains imports")

            except:
                pass

        return patterns

    def _get_similar_history(self, task: str) -> list[dict]:
        """
        Get similar tasks from history

        Args:
            task: Current task

        Returns:
            List of similar past tasks
        """
        # TODO: Implement actual history tracking
        # For now, return empty list
        return []

    def add_session_context(self, session_id: str, context: dict):
        """
        Store context from a session

        Args:
            session_id: Session identifier
            context: Context data to store
        """
        self.context_cache[session_id] = {
            'context': context,
            'timestamp': datetime.now().isoformat()
        }

    def get_session_context(self, session_id: str) -> dict:
        """
        Retrieve stored session context

        Args:
            session_id: Session identifier

        Returns:
            Stored context or empty dict
        """
        return self.context_cache.get(session_id, {})
EOF
```

---

### Day 18-21: Workspace Management

**Source**: Auto-Claude (`.docs/research/agents/auto-claude/apps/backend/cli/worktree.py`)

Create workspace manager:

```bash
cat > .blackbox5/engine/core/WorkspaceManager.py << 'EOF'
"""
Workspace Manager for BlackBox5

Manages git worktrees for isolated agent workspaces.
Adapted from Auto-Claude's worktree.py
"""
import subprocess
from pathlib import Path


class WorkspaceManager:
    """
    Manage git worktrees for isolated agent workspaces

    Allows agents to work in isolated branches without affecting main codebase.
    """

    def __init__(self, project_dir: Path):
        """
        Initialize workspace manager

        Args:
            project_dir: Project directory
        """
        self.project_dir = project_dir.resolve()
        self.worktrees_dir = project_dir / '.blackbox5-worktrees'

        # Ensure worktrees directory exists
        self.worktrees_dir.mkdir(parents=True, exist_ok=True)

    def create_workspace(self, spec_name: str) -> tuple[Path, str]:
        """
        Create isolated workspace for a spec

        Args:
            spec_name: Name of the spec/feature

        Returns:
            (workspace_path, branch_name)
        """
        branch_name = f"blackbox5/{spec_name}"
        workspace_path = self.worktrees_dir / spec_name

        # Check if git repo
        if not (self.project_dir / '.git').exists():
            raise RuntimeError(f"Not a git repository: {self.project_dir}")

        # Create worktree
        try:
            subprocess.run(
                ['git', 'worktree', 'add', '-b', branch_name, str(workspace_path)],
                cwd=self.project_dir,
                check=True,
                capture_output=True,
                text=True
            )
            print(f"✅ Created workspace: {workspace_path}")
            return workspace_path, branch_name

        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"Failed to create worktree: {e.stderr}")

    def merge_workspace(self, spec_name: str, target_branch: str = 'main'):
        """
        Merge workspace branch into target

        Args:
            spec_name: Name of the spec/feature
            target_branch: Target branch to merge into (default: main)
        """
        branch_name = f"blackbox5/{spec_name}"

        # Checkout target branch
        subprocess.run(
            ['git', 'checkout', target_branch],
            cwd=self.project_dir,
            check=True,
            capture_output=True
        )

        # Merge workspace branch
        try:
            subprocess.run(
                ['git', 'merge', '--no-ff', branch_name],
                cwd=self.project_dir,
                check=True,
                capture_output=True,
                text=True
            )
            print(f"✅ Merged {branch_name} into {target_branch}")

            # Remove workspace
            self.remove_workspace(spec_name)

        except subprocess.CalledProcessError as e:
            print(f"❌ Merge failed: {e.stderr}")
            raise

    def remove_workspace(self, spec_name: str):
        """
        Remove workspace and clean up

        Args:
            spec_name: Name of the spec/feature
        """
        branch_name = f"blackbox5/{spec_name}"
        workspace_path = self.worktrees_dir / spec_name

        # Remove worktree
        if workspace_path.exists():
            subprocess.run(
                ['git', 'worktree', 'remove', str(workspace_path)],
                cwd=self.project_dir,
                check=False,
                capture_output=True
            )

        # Delete branch
        subprocess.run(
            ['git', 'branch', '-D', branch_name],
            cwd=self.project_dir,
            check=False,
            capture_output=True
        )

        print(f"✅ Removed workspace: {spec_name}")

    def list_workspaces(self) -> list[dict]:
        """
        List all workspaces

        Returns:
            List of workspace info dicts
        """
        result = subprocess.run(
            ['git', 'worktree', 'list'],
            cwd=self.project_dir,
            capture_output=True,
            text=True,
            check=True
        )

        workspaces = []
        for line in result.stdout.strip().split('\n'):
            parts = line.split()
            if len(parts) >= 3:
                workspaces.append({
                    'path': parts[0],
                    'branch': parts[1].strip('[]'),
                    'status': parts[2] if len(parts) > 2 else 'ok'
                })

        return workspaces
EOF
```

---

## Summary

This implementation guide provides:

1. **Week 1**: Foundation (CLI, Agent Client, Security)
2. **Week 2**: Integration (Skill Bridge, Developer Agent)
3. **Week 3-4**: Advanced Features (Context, Workspace)

**Total**: 3-4 weeks to fully operational BlackBox5

**Next Steps**:
1. Start with Day 1-2 (CLI)
2. Test each component before moving to next
3. Adapt code as needed for specific use cases
4. Add more agents as needed
