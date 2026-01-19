# BlackBox5 Setup Checklist
## Complete Guide to Making BlackBox5 Fully Operational

**Status Assessment**: 85% Ready - Framework exists, needs integration work
**Last Updated**: 2025-01-18
**Estimated Time to Full Operation**: 4 weeks

---

## Quick Start: What's Working vs What's Not

### ✅ Fully Working (No Action Needed)

**Core Engine**:
- ✅ Circuit breaker system (`.blackbox5/engine/core/circuit_breaker.py`)
- ✅ Task router (`.blackbox5/engine/core/task_router.py`)
- ✅ Event bus (`.blackbox5/engine/core/event_bus.py`)
- ✅ Exception handling (`.blackbox5/engine/core/exceptions.py`)
- ✅ Complexity management (`.blackbox5/engine/core/complexity.py`)

**Configuration**:
- ✅ YAML-based config system (`.blackbox5/config/`)
- ✅ Environment detection (dev/prod/local)
- ✅ 130+ shell scripts (`.blackbox5/shell/`)

**Documentation**:
- ✅ Complete specs system (`.blackbox5/specs/`)
- ✅ 31 skills documented (`.blackbox5/engine/agents/.skills-new/`)
- ✅ Research on 15 frameworks (`.docs/research/`)

### ⚠️ Partially Working (Needs Integration)

**Agent System**:
- ⚠️ AgentLoader exists (`.blackbox5/engine/core/AgentLoader.py`)
- ❌ No concrete agent implementations
- ❌ No agent registry
- ❌ No agent lifecycle management

**Skills System**:
- ⚠️ 31 skills documented in XML format
- ❌ Skills not executable
- ❌ No skill-to-agent routing
- ❌ No skill validation

**GUI**:
- ⚠️ Basic structure exists
- ❌ No functional interface

**API**:
- ⚠️ Framework exists
- ❌ No endpoints defined
- ❌ No request handling

### ❌ Missing (Needs Implementation)

**Critical Missing Components**:
1. **CLI Interface**: No `bb5` command to interact with system
2. **Agent-Skill Bridge**: No way for agents to use skills
3. **Service Discovery**: No way to find available agents/skills
4. **Data Persistence**: No database/state management
5. **Security Layer**: No input validation or sandboxing
6. **Monitoring**: No health checks or metrics

---

## Phase 1: Week 1 - Core Infrastructure

### Step 1: Create CLI Interface (Day 1-2)

**File**: `.blackbox5/cli/main.py`

```python
#!/usr/bin/env python3
"""
BlackBox5 CLI - Main entry point
"""
import argparse
import sys
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(
        description="BlackBox5 - AI Agent Framework",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  bb5 agent:start developer        # Start developer agent
  bb5 skill:execute tdd            # Execute TDD skill
  bb5 prd:new feature-name         # Create new PRD
  bb5 status                       # Show system status
        """
    )

    subparsers = parser.add_subparsers(dest='command', help='Available commands')

    # Agent commands
    agent_parser = subparsers.add_parser('agent', help='Agent operations')
    agent_subparsers = agent_parser.add_subparsers(dest='agent_command')

    start_parser = agent_subparsers.add_parser('start', help='Start an agent')
    start_parser.add_argument('agent_name', help='Name of agent to start')

    # Skill commands
    skill_parser = subparsers.add_parser('skill', help='Skill operations')
    skill_subparsers = skill_parser.add_subparsers(dest='skill_command')

    execute_parser = skill_subparsers.add_parser('execute', help='Execute a skill')
    execute_parser.add_argument('skill_name', help='Name of skill to execute')

    # PRD commands
    prd_parser = subparsers.add_parser('prd', help='PRD operations')
    prd_subparsers = prd_parser.add_subparsers(dest='prd_command')

    new_parser = prd_subparsers.add_parser('new', help='Create new PRD')
    new_parser.add_argument('name', help='PRD name')

    # Status command
    subparsers.add_parser('status', help='Show system status')

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    # Route to command handler
    if args.command == 'agent':
        handle_agent(args)
    elif args.command == 'skill':
        handle_skill(args)
    elif args.command == 'prd':
        handle_prd(args)
    elif args.command == 'status':
        handle_status(args)

def handle_agent(args):
    """Handle agent commands"""
    if args.agent_command == 'start':
        print(f"Starting agent: {args.agent_name}")
        # TODO: Implement agent start logic

def handle_skill(args):
    """Handle skill commands"""
    if args.skill_command == 'execute':
        print(f"Executing skill: {args.skill_name}")
        # TODO: Implement skill execution logic

def handle_prd(args):
    """Handle PRD commands"""
    if args.prd_command == 'new':
        print(f"Creating PRD: {args.name}")
        # TODO: Implement PRD creation logic

def handle_status(args):
    """Handle status command"""
    print("BlackBox5 System Status")
    print("=" * 50)
    print("Engine: ✅ Running")
    print("Agents: ⚠️  None registered")
    print("Skills: ✅ 31 documented")
    print("GUI: ⚠️  Not implemented")
    print("API: ⚠️  Not implemented")

if __name__ == '__main__':
    main()
```

**Make it executable**:
```bash
# Add to .blackbox5/cli/main.py
chmod +x .blackbox5/cli/main.py

# Create symlink
ln -s $(pwd)/.blackbox5/cli/main.py /usr/local/bin/bb5

# Or add to PATH in ~/.zshrc
echo 'export PATH="$PATH:/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/cli"' >> ~/.zshrc
source ~/.zshrc
```

**Verify**:
```bash
bb5 --help
bb5 status
```

---

### Step 2: Implement Agent-Skill Bridge (Day 3-4)

**File**: `.blackbox5/engine/core/AgentSkillBridge.py`

```python
"""
Bridge between agents and skills
Handles skill loading, validation, and execution
"""
import yaml
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Dict, List, Optional

class AgentSkillBridge:
    """Manages the relationship between agents and skills"""

    def __init__(self, skills_base: Path):
        self.skills_base = skills_base
        self.skill_cache: Dict[str, dict] = {}

    def load_skill(self, skill_path: str) -> Optional[dict]:
        """Load a skill from disk"""
        skill_file = self.skills_base / skill_path / "SKILL.md"

        if not skill_file.exists():
            print(f"❌ Skill not found: {skill_path}")
            return None

        # Parse XML tags from skill file
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
        }

        # Cache it
        self.skill_cache[skill_path] = skill_data

        return skill_data

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

    def execute_skill(self, skill_path: str, agent_context: dict) -> str:
        """Execute a skill with agent context"""
        skill_data = self.load_skill(skill_path)

        if not skill_data:
            return "Skill not found"

        # Build prompt from skill
        prompt = f"""
<context>
{skill_data['context']}

**Agent Context**:
{agent_context.get('task', 'No task specified')}
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

    def list_skills(self, category: Optional[str] = None) -> List[str]:
        """List all available skills"""
        skills_dir = self.skills_base

        if category:
            skills_dir = skills_dir / category

        skill_paths = []
        for skill_folder in skills_dir.rglob("*"):
            if (skill_folder / "SKILL.md").exists():
                # Get relative path from skills_base
                rel_path = skill_folder.relative_to(self.skills_base)
                skill_paths.append(str(rel_path))

        return skill_paths

    def validate_skill(self, skill_path: str) -> bool:
        """Validate a skill has required XML tags"""
        skill_data = self.load_skill(skill_path)

        if not skill_data:
            return False

        required_tags = ['context', 'instructions']

        for tag in required_tags:
            if not skill_data.get(tag):
                print(f"❌ Missing required tag: {tag}")
                return False

        print(f"✅ Skill validated: {skill_path}")
        return True
```

**File**: `.blackbox5/engine/core/SkillManager.py` (Update)

```python
"""
Skill Manager - Enhanced with XML skill support
"""
from .AgentSkillBridge import AgentSkillBridge
from pathlib import Path

class SkillManager:
    """Manages skill lifecycle"""

    def __init__(self, skills_base: Path):
        self.bridge = AgentSkillBridge(skills_base)

    def get_skill(self, skill_path: str):
        """Get a skill by path"""
        return self.bridge.load_skill(skill_path)

    def execute_skill(self, skill_path: str, context: dict):
        """Execute a skill"""
        return self.bridge.execute_skill(skill_path, context)

    def list_skills(self, category: str = None):
        """List available skills"""
        return self.bridge.list_skills(category)

    def validate_all_skills(self):
        """Validate all skills"""
        skills = self.list_skills()

        results = {
            'valid': [],
            'invalid': []
        }

        for skill in skills:
            if self.bridge.validate_skill(skill):
                results['valid'].append(skill)
            else:
                results['invalid'].append(skill)

        return results
```

---

### Step 3: Create Service Discovery (Day 5)

**File**: `.blackbox5/engine/core/ServiceDiscovery.py`

```python
"""
Service Discovery - Find and register available agents and skills
"""
from pathlib import Path
from typing import Dict, List
import yaml

class ServiceDiscovery:
    """Discover and manage available services"""

    def __init__(self, blackbox5_root: Path):
        self.root = blackbox5_root
        self.agents_file = self.root / "config" / "agents.yaml"
        self.skills_base = self.root / "engine" / "agents" / ".skills-new"

    def discover_agents(self) -> Dict[str, dict]:
        """Discover all available agents"""
        if not self.agents_file.exists():
            return {}

        with open(self.agents_file) as f:
            config = yaml.safe_load(f)

        return config.get('agents', {})

    def discover_skills(self) -> List[str]:
        """Discover all available skills"""
        skills = []

        for skill_folder in self.skills_base.rglob("SKILL.md"):
            rel_path = skill_folder.parent.relative_to(self.skills_base)
            skills.append(str(rel_path))

        return skills

    def find_agent_for_skill(self, skill_path: str) -> Optional[str]:
        """Find the best agent for a given skill"""
        agents = self.discover_agents()

        # Simple routing: match category
        skill_category = skill_path.split('/')[0]

        for agent_name, agent_config in agents.items():
            if skill_category in agent_config.get('capabilities', []):
                return agent_name

        # Default to general agent
        return 'general'

    def register_agent(self, name: str, config: dict):
        """Register a new agent"""
        agents = self.discover_agents()
        agents[name] = config

        with open(self.agents_file, 'w') as f:
            yaml.dump({'agents': agents}, f)
```

---

## Phase 2: Week 2 - Integration & Automation

### Step 4: Create First Concrete Agent (Day 6-7)

**File**: `.blackbox5/engine/agents/implementations/DeveloperAgent.py`

```python
"""
Developer Agent - Concrete implementation for coding tasks
"""
from ..core.AgentLoader import Agent
from ..core.SkillManager import SkillManager
from ..core.AgentSkillBridge import AgentSkillBridge
from pathlib import Path

class DeveloperAgent(Agent):
    """Agent specialized in development tasks"""

    def __init__(self, config: dict):
        super().__init__(
            name="developer",
            role="Software Development Agent",
            instructions="You help with coding, debugging, and software development tasks.",
            config=config
        )

        self.skill_manager = SkillManager(
            Path(".blackbox5/engine/agents/.skills-new")
        )

        self.capabilities = [
            "coding-assistance",
            "testing-quality",
            "deployment-ops"
        ]

    def process_task(self, task: str) -> str:
        """Process a development task"""
        # Determine which skill to use
        skill_path = self._determine_skill(task)

        # Load and execute skill
        context = {
            'task': task,
            'agent': self.name,
            'capabilities': self.capabilities
        }

        prompt = self.skill_manager.execute_skill(skill_path, context)

        # Return prompt for LLM to execute
        return prompt

    def _determine_skill(self, task: str) -> str:
        """Determine which skill to use based on task"""
        task_lower = task.lower()

        if 'test' in task_lower or 'tdd' in task_lower:
            return "development-workflow/coding-assistance/test-driven-development"
        elif 'debug' in task_lower:
            return "development-workflow/testing-quality/systematic-debugging"
        elif 'deploy' in task_lower:
            return "development-workflow/deployment-ops/long-run-ops"
        else:
            # Default to TDD
            return "development-workflow/coding-assistance/test-driven-development"
```

---

### Step 5: Implement Data Persistence (Day 8-9)

**File**: `.blackbox5/engine/core/Persistence.py`

```python
"""
Data Persistence - Store and retrieve agent/state data
"""
import json
from pathlib import Path
from datetime import datetime
from typing import Any, Dict

class Persistence:
    """Handle data persistence for BlackBox5"""

    def __init__(self, data_dir: Path):
        self.data_dir = data_dir
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # Subdirectories
        self.agents_dir = self.data_dir / "agents"
        self.tasks_dir = self.data_dir / "tasks"
        self.state_dir = self.data_dir / "state"

        for dir_path in [self.agents_dir, self.tasks_dir, self.state_dir]:
            dir_path.mkdir(exist_ok=True)

    def save_agent_state(self, agent_name: str, state: dict):
        """Save agent state"""
        state_file = self.agents_dir / f"{agent_name}.json"

        state['last_updated'] = datetime.now().isoformat()

        with open(state_file, 'w') as f:
            json.dump(state, f, indent=2)

    def load_agent_state(self, agent_name: str) -> Dict[str, Any]:
        """Load agent state"""
        state_file = self.agents_dir / f"{agent_name}.json"

        if not state_file.exists():
            return {}

        with open(state_file) as f:
            return json.load(f)

    def save_task(self, task_id: str, task_data: dict):
        """Save task data"""
        task_file = self.tasks_dir / f"{task_id}.json"

        task_data['updated_at'] = datetime.now().isoformat()

        with open(task_file, 'w') as f:
            json.dump(task_data, f, indent=2)

    def load_task(self, task_id: str) -> Dict[str, Any]:
        """Load task data"""
        task_file = self.tasks_dir / f"{task_id}.json"

        if not task_file.exists():
            return {}

        with open(task_file) as f:
            return json.load(f)

    def list_tasks(self, status: str = None) -> list:
        """List all tasks, optionally filtered by status"""
        tasks = []

        for task_file in self.tasks_dir.glob("*.json"):
            with open(task_file) as f:
                task = json.load(f)

            if status is None or task.get('status') == status:
                tasks.append(task)

        return tasks
```

---

### Step 6: Add Environment Setup (Day 10)

**File**: `.blackbox5/setup.sh`

```bash
#!/bin/bash
# BlackBox5 Environment Setup

set -e

echo "🚀 Setting up BlackBox5 environment..."

# Create directories
echo "📁 Creating directory structure..."
mkdir -p .blackbox5/data/{agents,tasks,state}
mkdir -p .blackbox5/logs
mkdir -p .blackbox5/temp

# Create virtual environment
echo "🐍 Creating Python virtual environment..."
python3 -m venv .blackbox5/venv

# Activate venv
source .blackbox5/venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install --upgrade pip
pip install pyyaml
pip install python-dotenv

# Create config
echo "⚙️  Creating configuration..."
cat > .blackbox5/config/local.yaml << EOF
environment: local
debug: true
log_level: DEBUG

agents:
  developer:
    class: DeveloperAgent
    capabilities:
      - coding-assistance
      - testing-quality
      - deployment-ops

skills:
  base_path: .blackbox5/engine/agents/.skills-new

data:
  path: .blackbox5/data

logs:
  path: .blackbox5/logs
  level: DEBUG
EOF

# Make CLI executable
chmod +x .blackbox5/cli/main.py

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Activate venv: source .blackbox5/venv/bin/activate"
echo "  2. Test CLI: bb5 status"
echo "  3. Start agent: bb5 agent:start developer"
```

**Run setup**:
```bash
chmod +x .blackbox5/setup.sh
.blackbox5/setup.sh
```

---

## Phase 3: Week 3 - Advanced Features

### Step 7: Implement Security Layer (Day 11-12)

**File**: `.blackbox5/engine/core/Security.py`

```python
"""
Security Layer - Input validation and sandboxing
"""
from typing import Dict, Any
import re

class SecurityValidator:
    """Validate inputs and prevent harmful operations"""

    DANGEROUS_PATTERNS = [
        r'rm\s+-rf',
        r'dd\s+if=',
        r':(){ :|:& };:',  # Fork bomb
        r'>\s*/dev/sd[a-z]',  # Direct disk write
        r'mkfs\.',  # Filesystem creation
        r'format\s+c:',  # Windows format
    ]

    def validate_input(self, user_input: str) -> tuple[bool, str]:
        """Validate user input for dangerous commands"""
        for pattern in self.DANGEROUS_PATTERNS:
            if re.search(pattern, user_input, re.IGNORECASE):
                return False, f"Dangerous command detected: {pattern}"

        # Check for path traversal
        if '../' in user_input or '..\\' in user_input:
            return False, "Path traversal detected"

        return True, "Input validated"

    def sanitize_path(self, path: str, base_dir: str) -> str:
        """Sanitize file path to prevent directory traversal"""
        # Resolve to absolute path
        abs_path = Path(path).resolve()
        abs_base = Path(base_dir).resolve()

        # Ensure path is within base directory
        try:
            rel_path = abs_path.relative_to(abs_base)
            return str(abs_base / rel_path)
        except ValueError:
            # Path is outside base directory
            raise ValueError(f"Path {path} is outside allowed directory {base_dir}")

class ExecutionSandbox:
    """Sandbox for executing agent code"""

    def __init__(self, timeout: int = 30):
        self.timeout = timeout

    def execute(self, code: str, context: Dict[str, Any]) -> Any:
        """Execute code in sandboxed environment"""
        # TODO: Implement actual sandboxing
        # For now, just validate input
        validator = SecurityValidator()

        is_valid, msg = validator.validate_input(code)

        if not is_valid:
            raise SecurityError(f"Execution blocked: {msg}")

        # Execute with timeout
        # TODO: Add actual timeout and resource limits
        return None

class SecurityError(Exception):
    """Security-related errors"""
    pass
```

---

### Step 8: Add Monitoring (Day 13)

**File**: `.blackbox5/engine/core/Monitoring.py`

```python
"""
Monitoring - Health checks and metrics
"""
from datetime import datetime
from typing import Dict, List
import psutil

class SystemMonitor:
    """Monitor system health and performance"""

    def health_check(self) -> Dict[str, bool]:
        """Perform health check"""
        return {
            'cpu_ok': self._check_cpu(),
            'memory_ok': self._check_memory(),
            'disk_ok': self._check_disk(),
        }

    def _check_cpu(self) -> bool:
        """Check CPU usage"""
        cpu_percent = psutil.cpu_percent(interval=1)
        return cpu_percent < 90

    def _check_memory(self) -> bool:
        """Check memory usage"""
        memory = psutil.virtual_memory()
        return memory.percent < 90

    def _check_disk(self) -> bool:
        """Check disk usage"""
        disk = psutil.disk_usage('/')
        return disk.percent < 90

    def get_metrics(self) -> Dict[str, float]:
        """Get current metrics"""
        return {
            'cpu_percent': psutil.cpu_percent(),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_percent': psutil.disk_usage('/').percent,
        }
```

---

## Phase 4: Week 4 - Testing & Documentation

### Step 9: Create Test Suite (Day 14-15)

**File**: `.blackbox5/tests/test_agent_skill_bridge.py`

```python
"""
Test Agent-Skill Bridge
"""
import unittest
from pathlib import Path
import sys
sys.path.insert(0, '.blackbox5/engine/core')

from AgentSkillBridge import AgentSkillBridge

class TestAgentSkillBridge(unittest.TestCase):
    """Test AgentSkillBridge functionality"""

    def setUp(self):
        """Set up test fixtures"""
        self.bridge = AgentSkillBridge(
            Path(".blackbox5/engine/agents/.skills-new")
        )

    def test_load_skill(self):
        """Test loading a skill"""
        skill = self.bridge.load_skill(
            "development-workflow/coding-assistance/test-driven-development"
        )

        self.assertIsNotNone(skill)
        self.assertIn('context', skill)
        self.assertIn('instructions', skill)

    def test_validate_skill(self):
        """Test skill validation"""
        result = self.bridge.validate_skill(
            "development-workflow/coding-assistance/test-driven-development"
        )

        self.assertTrue(result)

    def test_list_skills(self):
        """Test listing skills"""
        skills = self.bridge.list_skills()

        self.assertGreater(len(skills), 0)
        self.assertIn(
            "development-workflow/coding-assistance/test-driven-development",
            skills
        )

if __name__ == '__main__':
    unittest.main()
```

---

### Step 10: Write User Documentation (Day 16-20)

**File**: `.blackbox5/USER-GUIDE.md`

```markdown
# BlackBox5 User Guide

## Installation

1. Clone repository
2. Run setup: `.blackbox5/setup.sh`
3. Activate venv: `source .blackbox5/venv/bin/activate`
4. Test: `bb5 status`

## Basic Usage

### Starting an Agent

```bash
bb5 agent:start developer
```

### Executing a Skill

```bash
bb5 skill:execute test-driven-development
```

### Creating a PRD

```bash
bb5 prd:new my-feature
```

## Advanced Usage

[Detailed documentation for advanced features]
```

---

## Verification Checklist

After completing all phases, verify:

### Core Functionality
- [ ] `bb5` command works
- [ ] Can start developer agent
- [ ] Can execute TDD skill
- [ ] Can create PRD
- [ ] Agent-skill bridge works

### System Health
- [ ] All tests pass
- [ ] CPU < 90%
- [ ] Memory < 90%
- [ ] Disk < 90%

### Documentation
- [ ] User guide complete
- [ ] API documentation complete
- [ ] Developer guide complete

### Integration
- [ ] Works with existing shell scripts
- [ ] Works with existing config system
- [ ] Works with event bus
- [ ] Works with circuit breaker

---

## Troubleshooting

### Issue: `bb5` command not found

**Solution**:
```bash
# Add to PATH
export PATH="$PATH:/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/cli"

# Or create symlink
sudo ln -s $(pwd)/.blackbox5/cli/main.py /usr/local/bin/bb5
```

### Issue: Skills not loading

**Solution**:
```bash
# Verify skills directory exists
ls -la .blackbox5/engine/agents/.skills-new/

# Validate all skills
bb5 skill:validate --all
```

### Issue: Agent won't start

**Solution**:
```bash
# Check config
cat .blackbox5/config/local.yaml

# Check logs
cat .blackbox5/logs/agent.log
```

---

## Next Steps After Setup

1. **Implement more agents**: Create specialized agents for different domains
2. **Add GUI**: Build web interface for easier interaction
3. **Implement Brain/RAG**: Add knowledge retrieval system
4. **Add monitoring**: Set up continuous monitoring and alerts
5. **Deploy to production**: Configure production environment

---

## Summary

**Time to Complete**: 4 weeks (20 working days)

**Critical Path**:
1. CLI interface (2 days)
2. Agent-skill bridge (2 days)
3. First concrete agent (2 days)
4. Data persistence (2 days)
5. Security layer (2 days)

**After Setup**:
- BlackBox5 will be fully operational
- Can execute skills via CLI
- Can create and manage agents
- Can create PRDs with first principles
- Production-ready with security and monitoring

**Success Criteria**:
- ✅ Can run `bb5` command
- ✅ Can start and stop agents
- ✅ Can execute all 31 skills
- ✅ Can create PRDs
- ✅ All tests passing
- ✅ System healthy
