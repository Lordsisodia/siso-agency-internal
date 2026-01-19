# Blackbox 5 Guide System

**"Make the system smart so the agent can be dumb."**

## Overview

The Guide System makes Blackbox 5 usable by ANY agent - from GPT-4 to a simple rule-based system. It works by inverting the intelligence requirement: the system provides all the intelligence, and the agent just follows instructions.

### The Core Insight

Traditional systems require smart agents:
```
Agent: "I need to test this code"
Agent: [Figures out how to test]
Agent: [Chooses testing strategy]
Agent: [Executes tests]
Agent: [Interprets results]
Agent: [Decides what to do next]
```

The Guide System works with any agent:
```
Agent: "I just wrote code"
System: "Here's step 1: Run this command"
Agent: [runs command]
System: "Good. Step 2: Run this command"
Agent: [runs command]
System: "Good. Step 3: Run this command"
...
```

## Quick Start

### As an Agent (Simple API)

```python
from blackbox5.engine.guides import Guide

# Create guide
guide = Guide()

# 1. Check what's available
operations = guide.list_operations()
# Returns: [{name, description, category, steps_count}, ...]

# 2. Check if help is available
suggestions = guide.check_context("file_written", {"file_path": "main.py"})
# Returns: [{operation, suggestion}, ...]

# 3. Start an operation
result = guide.start_operation("test_python_code", {"file_path": "main.py"})
# Returns: {recipe_id, operation, step, summary}

# 4. Execute the step
result = guide.execute_step(result["recipe_id"], execute_for_me=True)
# Returns: {action, message, step, summary}

# 5. Continue until complete
while result["action"] not in ["complete", "abort"]:
    result = guide.execute_step(result["recipe_id"], execute_for_me=True)
```

### As a Human (CLI)

```bash
# Interactive demo
python .blackbox5/engine/guides/cli.py interactive

# Automated execution
python .blackbox5/engine/guides/cli.py automated

# See how a dumb agent uses it
python .blackbox5/engine/guides/cli.py dumb
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     AGENT (any level)                       │
│  - Reads instructions                                       │
│  - Executes commands                                        │
│  - Returns results                                          │
└────────────────────┬────────────────────────────────────────┘
                     │ Simple Protocol
                     │
┌────────────────────▼────────────────────────────────────────┐
│                      GUIDE                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Operation Registry (What can I do?)                  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Context Detector (What should I offer?)              │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Recipe Engine (What are the steps?)                  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Step Executor (Do the step)                          │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ State Manager (Where are we?)                        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Available Operations

The system announces what it can do - no discovery required.

### Testing Operations

| Operation | Trigger | Steps |
|-----------|---------|-------|
| `test_python_code` | `*.py` file written | Syntax → Lint → Type check → Generate tests → Run tests |
| `test_javascript_code` | `*.{js,jsx,ts,tsx}` file written | Syntax → ESLint → Type check → Generate tests → Run Jest |
| `validate_database_migration` | Migration SQL written | Validate syntax → Test on copy → Verify rollback |

### Adding New Operations

Operations are defined in `registry.py`:

```python
registry.register(Operation(
    name="my_operation",
    description="What it does",
    category="testing",
    triggers=[
        TriggerCondition(
            event="file_written",
            pattern=r".*\.ext$"
        )
    ],
    steps=[
        StepDefinition(
            name="step_1",
            description="What this step does",
            action="run_command",
            command_template="command {file_path}",
            expected_output="What to expect"
        )
    ]
))
```

## Agent Protocol

The agent only needs to support 4 operations:

### 1. Discovery
```python
operations = guide.list_operations()
suggestions = guide.check_context(event, context)
```

### 2. Start
```python
result = guide.start_operation(operation_name, context)
```

### 3. Execute
```python
result = guide.execute_step(recipe_id, output, execute_for_me=True/False)
```

### 4. Status
```python
status = guide.get_recipe_status(recipe_id)
```

## Example: Dumb Agent

```python
class DumbAgent:
    """An agent that just follows instructions."""

    def work(self):
        guide = Guide()

        # 1. Report what I did
        print("I just wrote main.py")

        # 2. Check for help
        suggestions = guide.check_context("file_written", {
            "file_path": "main.py"
        })

        if suggestions:
            print(f"System: {suggestions[0]['suggestion']}")

            # 3. Accept help
            result = guide.start_operation("test_python_code", {
                "file_path": "main.py"
            })

            # 4. Follow instructions until done
            while True:
                step = result["step"]
                print(f"System: {step['instruction']}")

                # Execute the command
                output = self.run_command(step["command"])

                # Report result
                result = guide.execute_step(
                    result["recipe_id"],
                    output=output
                )

                print(f"System: {result['message']}")

                if result["action"] in ["complete", "abort"]:
                    break

    def run_command(self, command):
        """Execute a command and return output."""
        import subprocess
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        return result.stdout
```

## Benefits

1. **Agent Agnostic**: Works with any agent, regardless of capability
2. **No Discovery**: System announces capabilities
3. **No Planning**: System provides step-by-step guide
4. **No Error Diagnosis**: System provides exact fixes
5. **Stateless Agent**: System tracks all state
6. **Deterministic**: Same input = same output
7. **Observable**: Clear progress and status

## Design Principles

1. **Invert the Intelligence**: System makes decisions, agent executes
2. **Make State Explicit**: System says "you are here" and "go here next"
3. **Atomic Operations**: One step = one action
4. **Immediate Verification**: Every step is verified before proceeding
5. **Exact Error Recovery**: When things fail, provide exact fix
6. **Capability Broadcasting**: System announces what it can do
7. **Reactive Guidance**: System detects and offers help proactively

## Use Cases

### Smart Agent (Claude Opus)
- Can skip steps it knows
- Can parallelize independent operations
- Can optimize based on experience
- Still benefits from guided error recovery

### Medium Agent (GPT-4)
- Follows guides reliably
- Benefits from step-by-step structure
- Can handle moderate error recovery

### Dumb Agent (GPT-3.5 / Rule-based)
- Just follows instructions
- System provides all intelligence
- Works reliably within constraints

## Files

- `guide.py` - Main Guide interface (what agents use)
- `registry.py` - Operation registry (what's available)
- `recipe.py` - Recipe engine (step-by-step guides)
- `executor.py` - Step executor (runs commands)
- `cli.py` - CLI interface and demos
- `DESIGN.md` - Detailed design documentation

## See Also

- [DESIGN.md](./DESIGN.md) - Detailed design documentation
- [Testing Agent](../agents/5-enhanced/testing-agent/) - Uses guide system
