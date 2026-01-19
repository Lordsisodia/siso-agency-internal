# AgentClient Quick Start Guide

## Installation

The AgentClient module is now available in BlackBox5:

```python
from pathlib import Path
from engine.core.AgentClient import create_client
```

## Basic Usage

### 1. Create a Client Configuration

```python
config = create_client(
    project_dir=Path("/path/to/your/project"),
    model="claude-sonnet-4-5-20250929",
    agent_type="coder",
)
```

### 2. Access Configuration

```python
# Model configuration
model = config["model"]

# System prompt
system_prompt = config["system_prompt"]

# Allowed tools for this agent
tools = config["allowed_tools"]

# Project capabilities (detected automatically)
capabilities = config["project_capabilities"]

# Extended thinking tokens (if configured)
max_thinking = config["max_thinking_tokens"]
```

## Agent Types

### Available Agent Types

1. **`planner`** - Creates implementation plans
   - Tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch, WebFetch

2. **`coder`** - Implements features
   - Tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch, WebFetch

3. **`qa_reviewer`** - Reviews and validates
   - Tools: Read, Glob, Grep, Bash, WebSearch, WebFetch
   - Adds browser tools for web/electron projects

4. **`qa_fixer`** - Fixes issues
   - Tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch, WebFetch
   - Adds browser tools for web/electron projects

## Project Capabilities

The client automatically detects project capabilities from `.blackbox5/project_index.json`:

### Detected Capabilities

- `is_electron` - Electron desktop app
- `is_tauri` - Tauri desktop app
- `is_expo` - Expo mobile app
- `is_react_native` - React Native mobile app
- `is_web_frontend` - Web frontend (React, Vue, etc.)
- `is_nextjs` - Next.js framework
- `is_nuxt` - Nuxt.js framework
- `has_api` - Backend API routes
- `has_database` - Database connections

### Example project_index.json

```json
{
  "services": {
    "frontend": {
      "framework": "react",
      "dependencies": ["react", "react-dom", "vite"],
      "dev_dependencies": ["vite", "@types/react"]
    },
    "backend": {
      "framework": "express",
      "dependencies": ["express", "pg"],
      "api": {"routes": ["/api/users", "/api/posts"]},
      "database": {"type": "postgresql"}
    }
  }
}
```

## Caching

Project data is cached for 5 minutes to improve performance:

### Automatic Caching

```python
# First call - loads from disk
index1, caps1 = load_project_index(project_dir)

# Second call within 5 minutes - uses cache
index2, caps2 = load_project_index(project_dir)
```

### Manual Cache Invalidation

```python
from engine.core.AgentClient import invalidate_project_cache

# Invalidate specific project
invalidate_project_cache(project_dir)

# Invalidate all projects
invalidate_project_cache(None)
```

## Advanced Usage

### Custom Model

```python
config = create_client(
    project_dir=Path("/path/to/project"),
    model="claude-opus-4-5-20250929",
    agent_type="planner",
)
```

### Extended Thinking

```python
config = create_client(
    project_dir=Path("/path/to/project"),
    agent_type="planner",
    max_thinking_tokens=10000,  # Enable extended thinking
)
```

### Access Project Index Directly

```python
from engine.core.AgentClient import load_project_index

index = load_project_index(project_dir)
```

### Detect Capabilities Manually

```python
from engine.core.AgentClient import detect_project_capabilities

capabilities = detect_project_capabilities(project_index)
```

### Get Tools for Agent

```python
from engine.core.AgentClient import get_tools_for_agent

tools = get_tools_for_agent(
    agent_type="qa_reviewer",
    project_capabilities=capabilities,
)
```

## Running Tests

```bash
# Run all tests
python3 -m pytest .blackbox5/tests/test_agent_client.py -v

# Run specific test class
python3 -m pytest .blackbox5/tests/test_agent_client.py::TestCreateClient -v

# Run specific test
python3 -m pytest .blackbox5/tests/test_agent_client.py::TestCreateClient::test_create_basic_client -v
```

## Architecture

### Module Structure

```
AgentClient.py
├── Cache Management
│   ├── _get_cached_project_data()
│   └── invalidate_project_cache()
├── Project Analysis
│   ├── load_project_index()
│   └── detect_project_capabilities()
├── Tool Permissions
│   └── get_tools_for_agent()
└── Client Factory
    └── create_client()
```

### Data Flow

```
1. create_client()
   ↓
2. _get_cached_project_data()
   ↓
3. load_project_index() → detect_project_capabilities()
   ↓
4. get_tools_for_agent()
   ↓
5. Return configuration dict
```

## Best Practices

1. **Always use Path objects** for project directories
2. **Let the client detect capabilities** automatically
3. **Choose appropriate agent types** for your use case
4. **Enable extended thinking** for complex planning tasks
5. **Use caching** to improve performance in loops

## Troubleshooting

### Cache Issues

```python
# Clear cache if project changes
invalidate_project_cache(project_dir)
```

### Missing Capabilities

```python
# Ensure .blackbox5/project_index.json exists
# Check file format and structure
```

### Tool Permissions

```python
# Verify agent type is correct
# Check project capabilities are detected
# Review get_tools_for_agent() output
```

## Future Enhancements

- Anthropic API direct integration
- MCP server support (Context7, Graphiti)
- Security hooks and command allowlist
- Filesystem permissions
- Subagent support

## References

- Full documentation: `AGENTCLIENT-ADAPTATION-SUMMARY.md`
- Source tests: `.blackbox5/tests/test_agent_client.py`
- Auto-Claude source: `.docs/research/agents/auto-claude/apps/backend/core/client.py`
