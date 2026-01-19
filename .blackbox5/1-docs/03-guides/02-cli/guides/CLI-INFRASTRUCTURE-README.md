# BlackBox5 CLI Infrastructure

## Overview

The BlackBox5 CLI infrastructure provides a robust, extensible command-line interface for the spec-driven development pipeline. It features automatic command discovery, comprehensive error handling, and a clean architecture for adding new commands.

## Architecture

### Core Components

1. **Base Command Class** (`engine/cli/base.py`)
   - Abstract base class for all commands
   - Provides common execution interface
   - Includes error handling decorator
   - Logging setup and lifecycle hooks

2. **Command Registry** (`engine/cli/router.py`)
   - Manages command registration and discovery
   - Routes command execution
   - Supports command aliases
   - Automatic command discovery from directories

3. **Configuration System** (`engine/spec_driven/config.py`)
   - Hierarchical configuration with dataclasses
   - YAML file loading
   - Environment variable overrides
   - Validation and defaults

4. **Exception System** (`engine/spec_driven/exceptions.py`)
   - Custom exception hierarchy
   - Detailed error context
   - Specific exceptions for different failure modes

5. **CLI Entry Point** (`cli/bb5`)
   - Argument parsing
   - Command routing
   - Help system
   - Error handling

## File Structure

```
.blackbox5/
├── cli/
│   ├── bb5                          # Main CLI entry point (executable)
│   ├── __init__.py
│   └── commands/
│       ├── __init__.py
│       └── hello.py                 # Example command
├── engine/
│   ├── cli/
│   │   ├── __init__.py
│   │   ├── base.py                  # BaseCommand class
│   │   └── router.py                # CommandRegistry and routing
│   └── spec_driven/
│       ├── __init__.py
│       ├── config.py                # Configuration management
│       └── exceptions.py            # Custom exceptions
└── tests/
    └── spec_driven/
        └── __init__.py
```

## Creating New Commands

### Step 1: Create Command File

Create a new file in `cli/commands/` (e.g., `my_command.py`):

```python
from typing import Dict, Any
from engine.cli import BaseCommand

class MyCommand(BaseCommand):
    """Description of what this command does."""

    name = "my-command"          # Command name
    description = "Does something useful"
    aliases = ["mc", "my-cmd"]   # Optional aliases

    def execute(self, args: Dict[str, Any]) -> int:
        """Execute the command."""
        # Your command logic here
        print("Executing my command!")

        # Access configuration
        if self.config:
            print(f"Environment: {self.config.environment}")

        return 0  # Exit code (0 = success)
```

### Step 2: Command Discovery

Commands are automatically discovered from the `cli/commands/` directory. No manual registration required!

### Step 3: Use Your Command

```bash
bb5 my-command
bb5 mc                    # Using alias
bb5 my-command --help     # Show help
```

## Command Lifecycle

Every command goes through this lifecycle:

1. **Instantiation**: Command is created with config
2. **Validation**: `validate_args()` is called
3. **Pre-execution**: `pre_execute()` hook runs
4. **Execution**: `execute()` method runs
5. **Post-execution**: `post_execute()` hook runs
6. **Error Handling**: Errors are caught and logged

## Argument Parsing

Commands receive arguments as a dictionary. The CLI automatically parses:

- Long options: `--name value`
- Short options: `-n value`
- Flags: `--flag` (becomes `True`)
- Positionals: Available in `_positionals` list

Example:
```bash
bb5 my-command --name Alice --flag positional1 positional2
```

Becomes:
```python
{
    "name": "Alice",
    "flag": True,
    "_positionals": ["positional1", "positional2"]
}
```

## Configuration

Configuration is loaded from `.blackbox5/config.yml` and can be overridden by environment variables.

### Config Structure

```yaml
github:
  token: null
  default_branch: main
  repo_owner: null
  repo_name: null
  enable_auto_sync: false
  create_draft_prs: true

validation:
  strict_mode: false
  require_estimates: true
  require_acceptance_criteria: true
  max_task_duration_hours: 40
  min_task_duration_hours: 1

agent:
  model: claude-opus-4-5-20251101
  temperature: 0.7
  max_tokens: 4096
  timeout_seconds: 300

logging:
  level: INFO
  format: "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
  file: null
  console: true

environment: development
debug: false
```

### Environment Variables

- `GITHUB_TOKEN`: GitHub authentication token
- `GITHUB_REPO`: Repository in format `owner/name`
- `CLAUDE_MODEL`: Claude model to use
- `CLAUDE_TEMPERATURE`: Temperature for generation
- `ENVIRONMENT`: Environment name
- `DEBUG`: Enable debug mode

## Error Handling

The CLI provides comprehensive error handling:

### Custom Exceptions

```python
from engine.spec_driven import PRDValidationError

# In your command
raise PRDValidationError(
    "Invalid PRD structure",
    field="requirements",
    value="missing"
)
```

### Command Errors

```python
from engine.cli import CommandError

# In your command
raise CommandError(
    "Something went wrong",
    exit_code=1,
    details={"context": "additional info"}
)
```

## Logging

Commands automatically get a logger instance:

```python
class MyCommand(BaseCommand):
    def execute(self, args: Dict[str, Any]) -> int:
        self.logger.info("Starting execution")
        self.logger.debug("Detailed debug info")
        self.logger.warning("Warning message")
        self.logger.error("Error occurred")
        return 0
```

Log levels are controlled by `-v` flag:
- No flag: ERROR only
- `-v`: WARNING and above
- `-vv`: INFO and above
- `-vvv` or `--debug`: DEBUG and above

## Testing the Infrastructure

The `hello` command demonstrates the CLI is working:

```bash
# Basic usage
bb5 hello

# With arguments
bb5 hello --name "World" --wave

# Using alias
bb5 hi --name "Alice"

# Get help
bb5 hello --help
bb5 --help
```

## Next Steps

1. **Create PRD Commands**: Implement commands for PRD creation, validation, and management
2. **Create Epic Commands**: Implement commands for Epic generation and tracking
3. **Create Task Commands**: Implement commands for Task breakdown and execution
4. **Add GitHub Integration**: Implement commands for syncing with GitHub issues/PRs
5. **Add Testing**: Create comprehensive tests for all components

## Benefits

- **Modular**: Each command is independent and self-contained
- **Extensible**: Easy to add new commands without modifying core infrastructure
- **Discoverable**: Commands are automatically discovered and registered
- **Robust**: Comprehensive error handling and validation
- **Configurable**: Flexible configuration with validation
- **Testable**: Clean interfaces make testing straightforward
- **Production-Ready**: Logging, error handling, and documentation built-in

## Troubleshooting

### Command Not Found

If your command isn't discovered:
1. Check file is in `cli/commands/`
2. Ensure class inherits from `BaseCommand`
3. Verify `name` attribute is set
4. Check for import errors in the command file

### Import Errors

If you get import errors:
1. Ensure `blackbox_root` is in Python path (handled by `cli/bb5`)
2. Check imports use `from engine.cli import ...` syntax
3. Verify all dependencies are installed

### Configuration Issues

If configuration fails to load:
1. Check YAML syntax in `.blackbox5/config.yml`
2. Verify required fields for enabled features
3. Use `--debug` flag for detailed error messages
4. Check environment variable overrides

## Summary

The BlackBox5 CLI infrastructure is now fully operational and ready for extension. The `hello` command demonstrates that all core components are working correctly:

- Command discovery and registration ✓
- Argument parsing ✓
- Configuration loading ✓
- Error handling ✓
- Logging ✓
- Help system ✓
- Command lifecycle ✓

You can now focus on implementing the actual spec-driven pipeline commands!
