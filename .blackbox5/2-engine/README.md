# Blackbox 5 Engine

Multi-agent orchestration system with intelligent task routing, wave-based parallelization, and proactive guide suggestions.

## Quick Start

### CLI Usage

```bash
# Ask a question
bb5 ask "What is 2+2?"

# Build something
bb5 ask "Create a REST API for user management"

# Use specific agent
bb5 ask --agent testing-agent "Write unit tests"

# Multi-agent strategy
bb5 ask --strategy multi_agent "Design and implement a payment system"

# JSON output
bb5 ask --json "Analyze this codebase"
```

### Python API

```python
from main import get_blackbox5
import asyncio

async def main():
    bb5 = await get_blackbox5()
    result = await bb5.process_request("What is 2+2?")
    print(result['result'])

asyncio.run(main())
```

### REST API

```bash
# Start server
python -m interface.api.main

# Make request
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is 2+2?"}'
```

## Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Optional: Copy and customize configuration
cp config.example.yml config.yml

# Initialize (optional - happens automatically on first use)
python -c "from main import get_blackbox5; import asyncio; asyncio.run(get_blackbox5())"
```

## Architecture

Blackbox 5 consists of:

- **Main Bootstrap** (`main.py`) - Central orchestration
- **TaskRouter** - Intelligent complexity-based routing
- **Orchestrator** - Wave-based parallelization
- **AgentLoader** - Multi-format agent loading
- **SkillManager** - Composable skill system
- **Guide System** - 3-layer discovery and proactive suggestions
- **EventBus** - Redis-based event communication
- **Agent Memory** - Session persistence

### Request Pipeline

1. Parse request into Task
2. Route to single or multi-agent based on complexity
3. Execute with orchestration
4. Check for guide suggestions
5. Return result with metadata

### Initialization Order

1. EventBus (RedisEventBus) - other components depend on it
2. AgentLoader - load all agents
3. SkillManager - load all skills
4. Wire skills to agents
5. TaskRouter - register all agents
6. Orchestrator - for multi-agent coordination
7. Guide system - for proactive suggestions

## CLI Commands

### ask

Ask Blackbox 5 a question or give it a task.

```bash
bb5 ask "Your question or task"
bb5 ask --agent testing-agent "Write tests"
bb5 ask --strategy multi_agent "Complex task"
bb5 ask --session abc123 "Follow-up question"
bb5 ask --json "Output as JSON"
bb5 ask --verbose "Show detailed output"
```

Options:
- `--agent, -a`: Force specific agent
- `--strategy, -st`: Execution strategy (auto, single_agent, multi_agent)
- `--session, -s`: Session ID for continuity
- `--json, -j`: Output as JSON
- `--verbose, -v`: Show detailed output

### agents

List all available agents.

```bash
bb5 agents
```

### inspect

Inspect an agent's capabilities.

```bash
bb5 inspect orchestrator
bb5 inspect testing-agent
```

### skills

List all available skills.

```bash
bb5 skills
bb5 skills --category testing
```

### guide

Find a guide for your task.

```bash
bb5 guide "test this code"
bb5 guide "deploy to production"
```

## API Reference

### POST /chat

Process a chat message.

**Request:**
```json
{
  "message": "Your message",
  "session_id": "optional-session",
  "context": {}
}
```

**Response:**
```json
{
  "result": {...},
  "routing": {
    "strategy": "single_agent|multi_agent",
    "agent": "agent-name",
    "complexity": 0.5,
    "reasoning": "...",
    "estimated_duration": 60.0,
    "confidence": 0.9
  },
  "guide_suggestions": [...],
  "session_id": "uuid",
  "timestamp": "2024-01-19T10:00:00"
}
```

### GET /agents

List all available agents.

**Response:**
```json
[
  {
    "name": "orchestrator",
    "role": "orchestrator",
    "description": "Coordinates multi-agent workflows",
    "category": "1-core"
  }
]
```

### GET /agents/{agent_name}

Get detailed information about a specific agent.

**Response:**
```json
{
  "name": "orchestrator",
  "role": "orchestrator",
  "description": "Coordinates multi-agent workflows"
}
```

### GET /skills

List all available skills, optionally filtered by category.

**Query Parameters:**
- `category` (optional): Filter by skill category

**Response:**
```json
[
  {
    "name": "write-tests",
    "description": "Write unit tests",
    "type": "action",
    "category": "testing"
  }
]
```

### GET /guides/search

Search for guides by keyword.

**Query Parameters:**
- `q`: Search query

**Response:**
```json
{
  "results": [...]
}
```

### GET /guides/intent

Find guides by natural language intent.

**Query Parameters:**
- `intent`: Natural language description of intent

**Response:**
```json
{
  "matches": [...]
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "version": "5.0.0"
}
```

## Decorators

### Register a Tool

```python
from agents.core.decorators import tool

@tool(name="calculator", description="Performs math operations")
def calculate(a: int, b: int) -> int:
    return a + b
```

### Register an Agent

```python
from agents.core.decorators import agent
from agents.core.BaseAgent import BaseAgent

@agent(
    name="my-agent",
    role="specialist",
    category="5-enhanced",
    domains=["mathematics"],
    capabilities=["calculation"]
)
class MyAgent(BaseAgent):
    pass
```

## Configuration

Blackbox 5 can be configured via `config.yml`:

```yaml
engine:
  name: "Black Box 5"
  version: "5.0.0"
  log_level: "INFO"
  shutdown_timeout: 30

api:
  enabled: true
  host: "127.0.0.1"
  port: 8000
  cors:
    enabled: true
    origins: ["*"]

websocket:
  enabled: true
  host: "127.0.0.1"
  port: 8001

health:
  enabled: true
  check_interval: 30
  failure_threshold: 3
  critical_threshold: 5

services:
  brain:
    enabled: true
    lazy: true
    auto_recover: true
    max_retries: 3

  agents:
    enabled: true
    lazy: true
    auto_recover: true
    max_retries: 3

  tools:
    enabled: true
    lazy: true
    auto_recover: true
    max_retries: 3
```

### Environment Variables

- `BLACKBOX5_CONFIG_PATH`: Path to configuration file
- `BLACKBOX5_LOG_LEVEL`: Override log level
- `BLACKBOX5_API_HOST`: Override API host
- `BLACKBOX5_API_PORT`: Override API port
- `REDIS_HOST`: Redis host for EventBus
- `REDIS_PORT`: Redis port for EventBus

## Testing

```bash
# Run all tests
pytest tests/

# Run integration tests
pytest tests/integration/

# Run specific test
pytest tests/integration/test_full_pipeline.py::test_simple_query

# Run with coverage
pytest --cov=. tests/

# Run with verbose output
pytest -v tests/
```

### Test Structure

```
tests/
├── integration/
│   ├── __init__.py
│   └── test_full_pipeline.py
└── __init__.py
```

## Performance

- **Initialization**: < 5 seconds
- **Simple queries**: < 2 seconds
- **Memory baseline**: < 500MB
- **Concurrent agents**: Up to 5 by default

## Project Structure

```
.blackbox5/engine/
├── main.py                 # Central entry point
├── config.yml              # Configuration
├── requirements.txt        # Python dependencies
├── agents/                 # Agent system
│   ├── core/              # Core agent framework
│   │   ├── BaseAgent.py
│   │   ├── AgentLoader.py
│   │   ├── SkillManager.py
│   │   └── decorators.py
│   └── .skills/           # Skill definitions
├── core/                  # Core orchestration
│   ├── Orchestrator.py
│   ├── task_router.py
│   ├── event_bus.py
│   └── complexity.py
├── guides/                # Guide system
│   ├── catalog.py
│   ├── guide.py
│   ├── recipe.py
│   └── registry.py
├── interface/             # User interfaces
│   ├── api/              # REST API
│   │   └── main.py
│   └── cli/              # CLI tool
│       └── bb5.py
├── memory/                # Memory system
├── tools/                 # Tool integrations
├── tests/                 # Test suite
└── README.md             # This file
```

## Advanced Usage

### Custom Agent

```python
from agents.core.BaseAgent import BaseAgent
from agents.core import Task

class CustomAgent(BaseAgent):
    """My custom agent."""

    def __init__(self):
        super().__init__(
            name="custom-agent",
            role="specialist",
            category="5-enhanced",
            description="Does custom things"
        )

    async def execute(self, task: Task) -> Task.Result:
        # Custom execution logic
        result = f"Processed: {task.description}"
        return Task.Result(
            success=True,
            output=result,
            artifacts=[],
            metadata={}
        )
```

### Multi-Agent Workflow

```python
from core.Orchestrator import WorkflowStep

# Define workflow steps
steps = [
    WorkflowStep(
        agent_type="developer",
        task="Implement feature",
        agent_id=None,
        timeout=300
    ),
    WorkflowStep(
        agent_type="tester",
        task="Write tests",
        agent_id=None,
        timeout=180
    )
]

# Execute via orchestrator
result = await orchestrator.execute_wave_based(
    tasks=steps,
    workflow_id="my-workflow"
)
```

### Session Management

```python
# First request
result1 = await bb5.process_request(
    "Create a user model",
    session_id="session-123"
)

# Follow-up request (uses context)
result2 = await bb5.process_request(
    "Add email validation",
    session_id="session-123"
)
```

## Troubleshooting

### Redis Connection Failed

```
Failed to connect to Redis EventBus: ...
```

**Solution**: Ensure Redis is running:
```bash
redis-server
```

Or disable EventBus by setting `enabled: false` in config.

### Agent Not Found

```
ProcessingError: Agent not found: xyz
```

**Solution**: Check available agents with `bb5 agents` or use `--agent` flag with correct name.

### Import Errors

```
ModuleNotFoundError: No module named 'xxx'
```

**Solution**: Install dependencies:
```bash
pip install -r requirements.txt
```

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues, questions, or contributions, please visit the main repository.

## Version

Current version: 5.0.0

## Changelog

### Version 5.0.0
- Multi-agent orchestration system
- Intelligent task routing
- Wave-based parallelization
- Proactive guide suggestions
- REST API and CLI interfaces
- Redis-based event bus
- Agent memory system
