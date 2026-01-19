# BlackBox5 Setup Guide

**Version:** 5.0.0
**Last Updated:** 2026-01-18
**Status:** Production Ready

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Usage Examples](#usage-examples)
5. [Multi-Agent Workflows](#multi-agent-workflows)
6. [Troubleshooting](#troubleshooting)
7. [Advanced Configuration](#advanced-configuration)

---

## Prerequisites

### System Requirements

- **Operating System:** Linux, macOS, or Windows (WSL2 recommended)
- **Python:** 3.12 or higher
- **RAM:** 8GB minimum (16GB recommended)
- **Disk:** 10GB free space
- **Network:** Internet connection for API calls

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Python | 3.12+ | Runtime environment |
| Redis | 7.0+ | Event bus, procedural memory |
| ChromaDB | 0.4+ | Vector storage (episodic memory) |
| Neo4j | 5.0+ (optional) | Knowledge graph (semantic memory) |
| Git | Latest | Version control |

### API Keys Required

| Service | Purpose | How to Get |
|---------|---------|------------|
| **Anthropic API** | Claude LLM | https://console.anthropic.com/ |
| **GitHub Token** | GitHub integration | GitHub Settings → Developer settings → Personal access tokens |
| **Vibe Kanban API** | Kanban board sync | Contact Vibe Kanban admin |
| **OpenAI API** (optional) | Embeddings | https://platform.openai.com/api-keys |

---

## Installation

### Step 1: Clone and Navigate

```bash
# Navigate to your project
cd /path/to/your/project

# Verify BlackBox5 exists
ls .blackbox5/
```

### Step 2: Install Python Dependencies

```bash
# Create virtual environment
python3 -m venv .blackbox5/venv

# Activate virtual environment
# On Linux/macOS:
source .blackbox5/venv/bin/activate
# On Windows:
# .blackbox5\venv\Scripts\activate

# Install dependencies
pip install --upgrade pip
pip install -r .blackbox5/engine/requirements.txt
```

**Dependencies include:**
- `fastapi` - REST API
- `uvicorn` - ASGI server
- `redis` - Event bus
- `chromadb` - Vector storage
- `neo4j` - Graph database (optional)
- `anthropic` - Claude API
- `pydantic` - Data validation
- `pyyaml` - Config parsing
- `structlog` - Structured logging
- `pytest` - Testing

### Step 3: Install Redis

**On macOS:**
```bash
brew install redis
brew services start redis
```

**On Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis
```

**On Windows:**
```bash
# Using WSL2 (recommended)
wsl
sudo apt-get install redis-server
sudo systemctl start redis
```

**Verify Redis:**
```bash
redis-cli ping
# Should return: PONG
```

### Step 4: Install ChromaDB

```bash
# ChromaDB is installed via pip
pip install chromadb

# Verify installation
python -c "import chromadb; print(chromadb.__version__)"
```

### Step 5: Install Neo4j (Optional)

**For semantic memory features:**

```bash
# On macOS
brew install neo4j

# On Linux
wget -O - https://debian.neo4j.com/neotechnology.gpg.key | sudo apt-key add -
echo 'deb https://debian.neo4j.com stable latest' | sudo tee /etc/apt/sources.list.d/neo4j.list
sudo apt-get update
sudo apt-get install neo4j

# Start Neo4j
neo4j start
```

**Verify Neo4j:**
```bash
# Open browser to: http://localhost:7474
# Default credentials: neo4j / neo4j
# You'll be prompted to change password
```

### Step 6: Create Configuration File

```bash
# Copy example config
cp .blackbox5/engine/config.example.yml .blackbox5/config.yml

# Edit config with your settings
nano .blackbox5/config.yml
```

---

## Configuration

### Basic Configuration (`.blackbox5/config.yml`)

```yaml
# BlackBox5 Configuration

engine:
  name: "BlackBox5"
  version: "5.0.0"
  log_level: "INFO"
  # Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL

# Anthropic Claude API
anthropic:
  api_key: "${ANTHROPIC_API_KEY}"  # Set via environment variable
  model: "claude-sonnet-4-5-20250929"
  max_tokens: 200000
  temperature: 0.7

# Event Bus (Redis)
event_bus:
  enabled: true
  host: "localhost"
  port: 6379
  db: 0
  # Leave password empty if not set
  password: "${REDIS_PASSWORD}"

# Memory Systems
memory:
  # Working memory (in-memory)
  working:
    enabled: true
    capacity_tokens: 100000

  # Episodic memory (ChromaDB)
  episodic:
    enabled: true
    path: "./.blackbox5/data/chroma"
    collection_name: "episodic"

  # Semantic memory (Neo4j)
  semantic:
    enabled: false  # Set to true if Neo4j installed
    uri: "bolt://localhost:7687"
    user: "neo4j"
    password: "${NEO4J_PASSWORD}"

  # Procedural memory (Redis)
  procedural:
    enabled: true
    redis_db: 1  # Separate from event bus

# Agent System
agents:
  loader:
    agent_dir: "./.blackbox5/engine/agents"
    skill_dir: "./.blackbox5/engine/agents/skills"
    hot_reload: true

  # Task routing
  router:
    simple_threshold: 0.3
    moderate_threshold: 0.6
    enable_caching: true

# Task Router
task_router:
  # Complexity thresholds
  simple_max_steps: 10
  moderate_max_steps: 20
  min_tools_for_multi: 3

  # Complex domains
  complex_domains:
    - system_architecture
    - security
    - distributed_systems
    - database_migration

# Integrations
github:
  enabled: true
  token: "${GITHUB_TOKEN}"
  default_repo: "auto-detected"  # Or "owner/repo"

vibe_kanban:
  enabled: false
  api_url: "https://your-vibe-instance.com/api"
  api_key: "${VIBE_API_KEY}"

# API Server (FastAPI)
api:
  enabled: true
  host: "127.0.0.1"
  port: 8000
  workers: 1

websocket:
  enabled: true
  host: "127.0.0.1"
  port: 8001

# Health Monitoring
health:
  enabled: true
  check_interval: 30  # seconds

# Manifests (Operation Tracking)
manifests:
  enabled: true
  output_dir: "./.blackbox5/scratch/manifests"
  retain_days: 30

# Logging
logging:
  level: "INFO"
  format: "json"  # json or console
  file: "./.blackbox5/logs/blackbox5.log"
  rotation: "10 MB"
```

### Environment Variables (`.env` file)

Create `.blackbox5/.env`:

```bash
# Anthropic API
ANTHROPIC_API_KEY=sk-ant-your-key-here

# GitHub
GITHUB_TOKEN=ghp_your_token_here

# Redis (if password protected)
REDIS_PASSWORD=your_redis_password

# Neo4j (if using)
NEO4J_PASSWORD=your_neo4j_password

# Vibe Kanban (if using)
VIBE_API_KEY=your_vibe_api_key
```

**Load environment variables:**

```bash
# On Linux/macOS
source .blackbox5/.env

# Or use dotenv in Python
pip install python-dotenv
```

---

## Usage Examples

### Example 1: Boot the System

```bash
# Navigate to project root
cd /path/to/your/project

# Activate virtual environment
source .blackbox5/venv/bin/activate

# Boot BlackBox5
python .blackbox5/engine/core/boot.py
```

**Expected output:**
```
🔌 Black Box 5 Kernel Booting...
✅ Schema Loaded (v5.0.0)
📂 Container: blackbox5
🏠 Project: your-project
🛠️  Verifying Memory Structure...
   . Found memory/working
   . Found memory/episodic
   + Creating memory/procedural...
Checking System Files...
   . Found config.yml
   + Generating code_index.md...
     ✅ Generated code_index.md
🟢 Kernel Ready.
```

### Example 2: Load Agents

```python
#!/usr/bin/env python3
"""Load and list available agents"""

from pathlib import Path
import sys

# Add engine to path
sys.path.insert(0, str(Path(__file__).parent / ".blackbox5" / "engine"))

from agents.core.AgentLoader import AgentLoader

# Create loader
loader = AgentLoader()

# Load all agents
agents = loader.load_all()

# List agents
print("Available Agents:")
print("=" * 50)
for name, agent in agents.items():
    print(f"  • {name}: {agent.__class__.__name__}")
    print(f"    - Type: {agent.type}")
    print(f"    - Capabilities: {len(agent.capabilities)}")
    print()
```

**Run it:**
```bash
python load_agents.py
```

### Example 3: Execute Single Agent Task

```python
#!/usr/bin/env python3
"""Execute a task with a single agent"""

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent / ".blackbox5" / "engine"))

from agents.core.AgentLoader import AgentLoader
from core.task_router import Task, TaskRouter
from core.config import ConfigManager

# Load configuration
config = ConfigManager.load()

# Create agent loader
loader = AgentLoader(config=config)
agents = loader.load_all()

# Create task router
router = TaskRouter(agents, loader.skills)

# Define task
task = Task(
    id="task-1",
    description="Fix authentication bug",
    prompt="The login form is not submitting. Please investigate and fix the issue.",
    required_tools=["file_read", "file_write", "bash_execute"],
    domain="general",
    context={}
)

# Route task
strategy = router.route(task)
print(f"Routing decision: {strategy.type}")
print(f"Reason: {strategy.reason}")
print(f"Estimated steps: {strategy.estimated_steps}")

# Execute task
if strategy.type == 'single':
    agent = agents.get(strategy.agent)
    result = agent.execute(task.prompt)
    print(f"\nResult:\n{result}")
```

### Example 4: Multi-Agent Coordination

```python
#!/usr/bin/env python3
"""Execute a complex task with multi-agent coordination"""

import asyncio
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent / ".blackbox5" / "engine"))

from agents.core.AgentLoader import AgentLoader
from core.task_router import Task, TaskRouter
from core.coordination import MultiAgentCoordinator
from core.event_bus import RedisEventBus, EventBusConfig
from core.circuit_breaker import CircuitBreaker
from core.manifest import ManifestSystem
from core.config import ConfigManager

async def main():
    # Load configuration
    config = ConfigManager.load()

    # Create agent loader
    loader = AgentLoader(config=config)
    agents = loader.load_all()

    # Create event bus
    event_bus = RedisEventBus(EventBusConfig())
    await event_bus.connect()

    # Create circuit breaker
    circuit_breaker = CircuitBreaker()

    # Create manifest system
    manifests = ManifestSystem()

    # Create coordinator
    coordinator = MultiAgentCoordinator(
        event_bus=event_bus,
        agent_registry=agents,
        circuit_breaker=circuit_breaker,
        manifest_system=manifests
    )

    # Define complex task
    task = Task(
        id="task-2",
        description="Build REST API for user management",
        prompt="""
        Create a REST API for user management with the following features:
        - User registration with email verification
        - Login with JWT authentication
        - Profile management
        - Password reset flow

        Include proper error handling, validation, and documentation.
        """,
        required_tools=["file_read", "file_write", "bash_execute", "web_search"],
        domain="system_architecture",
        context={}
    )

    # Route task
    router = TaskRouter(agents, loader.skills)
    strategy = router.route(task)

    print(f"Task complexity score: {strategy.estimated_steps}")
    print(f"Routing to: {strategy.type}")

    # Execute with coordination
    if strategy.type == 'multi':
        result = await coordinator.execute(task, strategy)
        print(f"\nFinal Result:\n{result}")

    # Cleanup
    await event_bus.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
```

### Example 5: Memory Access

```python
#!/usr/bin/env python3
"""Access memory systems"""

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent / ".blackbox5" / "engine"))

from memory.integrated import IntegratedMemory

# Create memory
memory = IntegratedMemory()

# Store in working memory
memory.store(
    "The user prefers dark mode",
    memory_type="working",
    metadata={"important": True, "tags": ["preference"]}
)

# Store in episodic memory
memory.store(
    "Implemented authentication feature with JWT tokens",
    memory_type="episodic",
    metadata={"task": "auth", "date": "2026-01-18"}
)

# Retrieve information
results = memory.retrieve("authentication", max_results=5)

print("Retrieved Information:")
print("=" * 50)
for i, result in enumerate(results, 1):
    print(f"{i}. [{result.source}] {result.content}")
    print(f"   Relevance: {result.relevance:.2f}")
    print()
```

### Example 6: Brain Query

```python
#!/usr/bin/env python3
"""Query the brain system"""

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent / ".blackbox5" / "engine"))

from brain.api.brain_api import BrainAPI

# Create brain API
brain = BrainAPI()

# Natural language query
query = "Find all authentication-related code in the codebase"

results = brain.query(query)

print(f"Query: {query}")
print(f"Results: {len(results)} items found")
print()

for result in results:
    print(f"• {result['type']}: {result['name']}")
    print(f"  Path: {result['path']}")
    print(f"  Relevance: {result['score']:.2f}")
    print()
```

---

## Multi-Agent Workflows

### Workflow 1: Feature Development (BMAD)

```python
#!/usr/bin/env python3
"""Complete feature development using BMAD methodology"""

import asyncio
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent / ".blackbox5" / "engine"))

from agents.core.AgentLoader import AgentLoader
from core.coordination import MultiAgentCoordinator
from core.event_bus import RedisEventBus, EventBusConfig
from core.config import ConfigManager

async def develop_feature(feature_description: str):
    """Develop a feature using BMAD methodology"""

    # Load configuration
    config = ConfigManager.load()
    loader = AgentLoader(config=config)
    agents = loader.load_all()

    # Create coordinator
    coordinator = MultiAgentCoordinator(...)

    # BMAD 4-Phase Workflow
    phases = [
        {"agent": "mary", "phase": "elicitation",
         "task": f"Elicit requirements for: {feature_description}"},

        {"agent": "mary", "phase": "analysis",
         "task": "Analyze requirements and create PRD"},

        {"agent": "winston", "phase": "solutioning",
         "task": "Design system architecture"},

        {"agent": "arthur", "phase": "implementation",
         "task": "Implement the feature"}
    ]

    results = {}

    # Execute phases sequentially
    for phase in phases:
        print(f"\n📋 Phase: {phase['phase'].upper()}")
        print(f"🤖 Agent: {phase['agent']}")

        result = await coordinator.execute_agent(
            agent_name=phase["agent"],
            task=phase["task"]
        )

        results[phase["phase"]] = result
        print(f"✅ Complete")

    return results

# Run workflow
if __name__ == "__main__":
    feature = "User authentication with OAuth2"
    results = asyncio.run(develop_feature(feature))
```

### Workflow 2: Bug Fix (Multi-Agent)

```python
#!/usr/bin/env python3
"""Debug and fix bug with multi-agent coordination"""

async def fix_bug(bug_description: str):
    """Fix bug using specialist coordination"""

    # Create coordinator
    coordinator = MultiAgentCoordinator(...)

    # Decompose bug fix task
    subtasks = [
        {
            "specialist": "analyst",
            "task": f"Analyze bug: {bug_description}",
            "dependencies": []
        },
        {
            "specialist": "researcher",
            "task": "Research similar issues and solutions",
            "dependencies": []
        },
        {
            "specialist": "coder",
            "task": "Implement fix based on analysis",
            "dependencies": ["analyst", "researcher"]
        },
        {
            "specialist": "tester",
            "task": "Test the fix",
            "dependencies": ["coder"]
        }
    ]

    # Execute with wave-based coordination
    result = await coordinator.execute_wave(subtasks)

    return result
```

### Workflow 3: Research and Documentation

```python
#!/usr/bin/env python3
"""Research topic and create documentation"""

async def research_and_document(topic: str):
    """Research and document a topic"""

    # Create coordinator
    coordinator = MultiAgentCoordinator(...)

    # Research workflow
    workflow = [
        {"agent": "researcher", "task": f"Research {topic}"},
        {"agent": "analyst", "task": "Analyze research findings"},
        {"agent": "writer", "task": "Create documentation"},
        {"agent": "tester", "task": "Validate documentation"}
    ]

    # Execute sequentially (each builds on previous)
    result = await coordinator.execute_sequential(workflow)

    return result
```

### Workflow 4: Code Review

```python
#!/usr/bin/env python3
"""Automated code review with specialists"""

async def code_review(pr_url: str):
    """Review pull request with multiple specialists"""

    # Create coordinator
    coordinator = MultiAgentCoordinator(...)

    # Parallel review tasks
    review_tasks = [
        {
            "specialist": "architect",
            "task": f"Review architecture in {pr_url}",
            "dependencies": []
        },
        {
            "specialist": "coder",
            "task": f"Review code quality in {pr_url}",
            "dependencies": []
        },
        {
            "specialist": "tester",
            "task": f"Review test coverage in {pr_url}",
            "dependencies": []
        },
        {
            "specialist": "analyst",
            "task": "Compile review findings",
            "dependencies": ["architect", "coder", "tester"]
        }
    ]

    # Execute with wave coordination (first 3 parallel, then sequential)
    result = await coordinator.execute_wave(review_tasks)

    return result
```

---

## Troubleshooting

### Issue 1: Redis Connection Failed

**Symptom:**
```
RedisConnectionError: Could not connect to Redis
```

**Solution:**
```bash
# Check if Redis is running
redis-cli ping

# If not running, start Redis
# macOS:
brew services start redis

# Linux:
sudo systemctl start redis

# Check Redis logs
# macOS:
brew services redis

# Linux:
sudo journalctl -u redis
```

### Issue 2: Agent Loading Failed

**Symptom:**
```
AgentLoadError: Failed to load agent 'manager'
```

**Solution:**
```bash
# Check agent definition exists
ls .blackbox5/engine/agents/1-core/manager/

# Validate agent YAML
python -c "import yaml; print(yaml.safe_load(open('.blackbox5/engine/agents/1-core/manager/agent.md')))"

# Check for syntax errors
python .blackbox5/engine/agents/core/AgentLoader.py --validate
```

### Issue 3: Memory System Error

**Symptom:**
```
MemoryError: Failed to connect to ChromaDB
```

**Solution:**
```bash
# Check ChromaDB directory exists
ls .blackbox5/data/chroma

# Reinitialize ChromaDB
python -c "import chromadb; chromadb.Client()"

# Check permissions
chmod -R 755 .blackbox5/data/
```

### Issue 4: API Key Not Found

**Symptom:**
```
ConfigError: ANTHROPIC_API_KEY not found
```

**Solution:**
```bash
# Check environment variable
echo $ANTHROPIC_API_KEY

# Set environment variable
export ANTHROPIC_API_KEY="sk-ant-your-key-here"

# Or add to .env file
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" >> .blackbox5/.env

# Reload .env
source .blackbox5/.env
```

### Issue 5: Event Bus Not Receiving Events

**Symptom:**
```
Event not received by subscriber
```

**Solution:**
```bash
# Check Redis pub/sub
redis-cli
> SUBSCRIBE agent.task.started

# In another terminal, publish event
redis-cli
> PUBLISH agent.task.started '{"test": "data"}'

# Check event bus logs
tail -f .blackbox5/logs/blackbox5.log | grep event_bus
```

### Issue 6: Multi-Agent Coordination Hanging

**Symptom:**
```
Coordinator hangs during execution
```

**Solution:**
```bash
# Check circuit breaker state
python -c "from blackbox5.engine.core import CircuitBreaker; print(CircuitBreaker().state)"

# Reset circuit breaker if open
redis-cli FLUSHALL

# Check agent health
.blackbox5/engine/runtime/agent-status.sh
```

---

## Advanced Configuration

### Enable Semantic Memory (Neo4j)

```yaml
# .blackbox5/config.yml

memory:
  semantic:
    enabled: true  # Change from false to true
    uri: "bolt://localhost:7687"
    user: "neo4j"
    password: "your_neo4j_password"
```

### Custom Agent Definitions

Create custom agent in `.blackbox5/engine/agents/custom/`:

```yaml
---
name: "specialist"
full_name: "Custom Specialist"
type: "specialist"
category: "custom"
version: "1.0.0"

icon: "🔧"

description: |
  Custom specialist for domain-specific tasks.

capabilities:
  - custom_capability_1
  - custom_capability_2

tools:
  - custom_tool_1
  - custom_tool_2

communication_style: "professional and direct"

context_budget: 50000
artifacts: []
---

# Custom Specialist Agent

You are a **Custom Specialist** with expertise in domain-specific tasks.

## Your Role

When tasks require specialized knowledge in your domain, you provide expert analysis and solutions.

## Capabilities

- Custom capability 1
- Custom capability 2

## Best Practices

✅ Always provide expert-level analysis
✅ Use domain-specific terminology appropriately
✅ Explain complex concepts clearly
```

### Custom Skills

Add custom skill in `.blackbox5/engine/agents/skills/custom/`:

```markdown
---
name: "custom-skill"
category: "custom"
version: "1.0.0"
description: "Custom skill for specific task"
required_tools: ["tool1", "tool2"]
estimated_time: "5 minutes"
---

# Custom Skill

## Purpose

This skill performs a specific custom task.

## Usage

Invoke this skill when you need to:
- Task 1
- Task 2

## Steps

1. Perform step 1
2. Perform step 2
3. Validate results

## Expected Output

- Result 1
- Result 2
```

### Integration with Existing Systems

**GitHub Integration:**

```python
from integrations.github import GitHubIssuesIntegration

# Create integration
github = GitHubIssuesIntegration(
    repo="owner/repo",
    memory_path="./memory/working"
)

# Create task from issue
issue = await github.create_task(spec)

# Sync progress
await github.sync_progress(task_id)
```

**Vibe Kanban Integration:**

```python
from integrations.vibe import VibeKanbanManager

# Create integration
vibe = VibeKanbanManager(
    api_url="https://vive.example.com/api",
    api_key="your-api-key"
)

# Create card
card = vibe.create_card(
    title="Task title",
    description="Task description"
)

# Update status
vibe.update_card_status(card_id, "in_progress")
```

---

## Next Steps

1. **Complete installation**
2. **Configure API keys**
3. **Run boot sequence**
4. **Test with single agent task**
5. **Explore multi-agent workflows**
6. **Integrate with existing systems**

---

## Support

For issues and questions:
- Check logs: `.blackbox5/logs/blackbox5.log`
- Run health check: `.blackbox5/engine/runtime/agent-status.sh`
- View manifests: `.blackbox5/engine/runtime/view-manifest.sh <id>`
- Documentation: `.blackbox5/EXTRACTION-SUMMARY.md`
- Architecture: `.blackbox5/ARCHITECTURE.md`

---

**Status:** Production Ready
**Version:** 5.0.0
**Last Updated:** 2026-01-18
**Maintainer:** BlackBox5 Core Team
