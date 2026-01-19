# BlackBox5 CLI Guide

## Quick Start

The BlackBox5 CLI (`bb5.py`) provides a simple interface to interact with the GLM-powered multi-agent system.

## Installation & Setup

1. Make sure the CLI is executable:
```bash
chmod +x .blackbox5/bb5.py
```

2. Set your GLM API key (optional - will use mock mode without it):
```bash
export GLM_API_KEY="your-api-key-here"
```

## Usage

### Basic Commands

```bash
# Run a single task (uses mock mode if no API key)
python .blackbox5/bb5.py "Say hello"

# Run with explicit mock mode (no API calls)
python .blackbox5/bb5.py --mock "Test the system"

# Interactive mode
python .blackbox5/bb5.py --interactive

# Show help
python .blackbox5/bb5.py --help
```

### Interactive Mode

```bash
python .blackbox5/bb5.py --interactive
```

In interactive mode, you can use:
- `<task>` - Execute any task
- `info` - Show project information and capabilities
- `help` - Show available commands
- `quit` or `exit` - Exit the CLI

### Examples

```bash
# Analyze the codebase
python .blackbox5/bb5.py "Explain the gamification system architecture"

# Get information
python .blackbox5/bb5.py --interactive
bb5> info

# Ask questions
bb5> How does the reward catalog work?
bb5> What are the main components in the analytics domain?
```

## Features

### Project Detection
The CLI automatically detects project capabilities:
- Web frontend frameworks (React, Vue, Next.js, etc.)
- Desktop frameworks (Electron, Tauri)
- Mobile frameworks (Expo, React Native)
- Backend capabilities (API routes, databases)

### Tool Configuration
Automatically configures available tools based on:
- Agent type (coder, planner, qa_reviewer)
- Project capabilities
- Security permissions

### Mock Mode
Use `--mock` flag to test without API calls:
```bash
python .blackbox5/bb5.py --mock "Test task"
```

## Architecture

The CLI integrates several BlackBox5 components:

1. **GLMClient** (`core.GLMClient`)
   - Handles GLM API communication
   - Supports sync and async operations
   - Includes retry logic and error handling

2. **AgentClient** (`core.AgentClient`)
   - Configures agent behavior
   - Detects project capabilities
   - Manages tool permissions

3. **Project Index**
   - Loads from `.blackbox5/project_index.json`
   - Caches with 5-minute TTL
   - Provides project context to agents

## Error Handling

The CLI gracefully handles:
- Missing API keys (falls back to mock mode)
- Network errors (with retries)
- Invalid project directories
- Missing project index (uses empty config)

## Development

### File Structure
```
.blackbox5/
├── bb5.py              # Main CLI script
├── engine/
│   ├── core/
│   │   ├── GLMClient.py
│   │   ├── AgentClient.py
│   │   └── task_types.py
│   └── agents/
│       └── core/
│           └── AgentLoader.py
└── project_index.json  # Project metadata (optional)
```

### Testing
```bash
# Test basic functionality
python .blackbox5/bb5.py --mock "Say hello"

# Test info command
echo "info" | python .blackbox5/bb5.py --mock

# Test with real API (requires GLM_API_KEY)
python .blackbox5/bb5.py "Explain the system"
```

## Troubleshooting

### "GLM API key not found"
- Set `GLM_API_KEY` environment variable, or
- Use `--mock` flag to test without API

### Import errors
- Ensure you're running from the correct directory
- Check that `.blackbox5/engine/core` exists
- Verify Python 3.7+ is installed

### Project capabilities not detected
- Create `.blackbox5/project_index.json`
- Or let the CLI run with empty capabilities

## Future Enhancements

Planned features:
- [ ] Multi-agent workflow support
- [ ] Agent specialization (frontend, backend, analytics)
- [ ] Task breakdown and planning
- [ ] Integration with Git workflows
- [ ] Streaming responses
- [ ] Task history and logging
