# Guide Middleware

## Overview

The **Guide Middleware** is the integration layer that brings the Guide System into agent execution flows. It implements the "inverted intelligence" pattern where the system is smart and proactive, while agents can remain simple and reactive.

### Key Principle

> **"The system is smart, the agent can be dumb."**

Instead of requiring agents to discover, plan, and diagnose issues, the middleware proactively offers guidance at key points in the workflow.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Agent Action                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Guide Middleware (This Layer)                   │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  Before Action   │         │  After Action    │         │
│  │  - High Conf.    │         │  - Medium Conf.  │         │
│  │  - Proactive     │         │  - Follow-ups    │         │
│  │  - Threshold 0.7 │         │  - Threshold 0.5 │         │
│  └────────┬─────────┘         └────────┬─────────┘         │
│           │                            │                     │
│           └────────────┬───────────────┘                     │
│                        ▼                                     │
│           ┌──────────────────────────┐                      │
│           │  Execute if Accepted     │                      │
│           │  - Auto-run recipe       │                      │
│           │  - All steps             │                      │
│           └──────────────────────────┘                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Guide System                               │
│  - Registry (available operations)                          │
│  - Catalog (context matching)                               │
│  - Executor (step-by-step execution)                        │
└─────────────────────────────────────────────────────────────┘
```

## Features

### 1. Proactive Guidance (Before Actions)

The middleware monitors events **before** agent actions and offers high-confidence suggestions (≥ 0.7).

**Example:**
```python
context = {"file_path": "test.py", "file_name": "test.py"}
suggestion = await middleware.before_agent_action("file_written", context)

# Returns:
# {
#     "action": "offer_guide",
#     "guide": "test_python_code",
#     "suggestion": "Would you like me to test python code?",
#     "confidence": 0.9,
#     "estimated_time": "3 minutes",
#     "difficulty": "basic"
# }
```

### 2. Follow-up Suggestions (After Actions)

After an agent completes an action, the middleware suggests relevant next steps with medium confidence (≥ 0.5).

**Example:**
```python
suggestions = await middleware.after_agent_action("agent_complete", context)

# Returns list of suggestions for:
# - Running tests
# - Validating changes
# - Documenting results
# etc.
```

### 3. Automatic Execution

When an agent accepts a suggestion, the middleware executes the entire guide automatically:

```python
result = await middleware.execute_guide_if_accepted("test_python_code", context)

# System executes all steps:
# 1. Validate syntax
# 2. Run linter
# 3. Check types
# 4. Generate tests
# 5. Run tests
```

### 4. Confidence Thresholds

- **Before actions**: 0.7 (high confidence) - Only interrupt for highly relevant suggestions
- **After actions**: 0.5 (medium confidence) - Offer multiple follow-up options

## Monitored Events

The middleware monitors these events:

| Event | Description | Example |
|-------|-------------|---------|
| `agent_execute` | Before agent executes an action | Offer testing before deployment |
| `agent_complete` | After agent completes an action | Suggest validation after code changes |
| `file_written` | When files are written to disk | Offer to test new Python files |
| `git_stage` | When files are staged for commit | Suggest pre-commit hooks |
| `command_execute` | When commands are executed | Offer to retry failed commands |
| `test_run` | When tests are run | Suggest coverage analysis |
| `deployment_start` | Before deployment | Offer pre-deployment checks |

## Usage

### Basic Usage

```python
from core import get_guide_middleware

# Get singleton instance
middleware = get_guide_middleware("/path/to/project")

# Check for suggestions before action
suggestion = await middleware.before_agent_action("file_written", {
    "file_path": "app.py"
})

if suggestion:
    # Agent accepts suggestion
    result = await middleware.execute_guide_if_accepted(
        suggestion['guide'],
        {"file_path": "app.py"}
    )
```

### Convenience Functions

```python
from core import offer_guidance_before, offer_guidance_after, execute_guide

# Quick guidance check
suggestion = await offer_guidance_before("file_written", context)

# Quick follow-up check
suggestions = await offer_guidance_after("agent_complete", context)

# Quick guide execution
result = await execute_guide("test_python_code", context)
```

### Discovery

```python
# List all available guides
guides = middleware.list_available_guides()

# List by category
testing_guides = middleware.list_available_guides(category="testing")

# Search for guides
results = middleware.search_guides("database")

# List categories
categories = middleware.list_categories()
```

### Statistics

```python
stats = middleware.get_statistics()

# {
#     "enabled": True,
#     "suggestions_offered": 42,
#     "suggestions_accepted": 15,
#     "guides_executed": 12,
#     "errors": 0,
#     "acceptance_rate": 0.357
# }
```

## Integration Examples

### 1. Agent Integration

```python
class SimpleAgent:
    def __init__(self):
        self.middleware = get_guide_middleware()

    async def write_file(self, path, content):
        # Check for guidance first
        suggestion = await self.middleware.before_agent_action(
            "file_written",
            {"file_path": path}
        )

        if suggestion and self.should_accept(suggestion):
            # Let system handle it
            result = await self.middleware.execute_guide_if_accepted(
                suggestion['guide'],
                {"file_path": path}
            )
            return result

        # Otherwise, proceed normally
        with open(path, 'w') as f:
            f.write(content)

        # Check for follow-up suggestions
        suggestions = await self.middleware.after_agent_action(
            "file_written",
            {"file_path": path}
        )

        return {"status": "success", "suggestions": suggestions}
```

### 2. CLI Integration

```python
import click
from core import get_guide_middleware

@click.command()
@click.argument('file', type=click.Path())
def test_file(file):
    """Test a file with automatic guide execution."""
    middleware = get_guide_middleware()

    # Get suggestion
    suggestion = asyncio.run(middleware.before_agent_action(
        "file_written",
        {"file_path": file}
    ))

    if suggestion:
        click.echo(f"Suggestion: {suggestion['suggestion']}")
        if click.confirm("Accept?", default=True):
            result = asyncio.run(middleware.execute_guide_if_accepted(
                suggestion['guide'],
                {"file_path": file}
            ))
            click.echo(f"Result: {result}")
```

### 3. Event Bus Integration

```python
from core import get_event_bus, get_guide_middleware

async def setup_guide_integration():
    bus = get_event_bus()
    middleware = get_guide_middleware()

    @bus.subscribe("agent.file_written")
    async def on_file_written(event):
        # Offer guidance
        suggestion = await middleware.before_agent_action(
            "file_written",
            event.data
        )

        if suggestion:
            # Publish suggestion back to agent
            await bus.publish("guide.suggested", suggestion)

    @bus.subscribe("guide.accepted")
    async def on_guide_accepted(event):
        # Execute guide
        result = await middleware.execute_guide_if_accepted(
            event.data['guide'],
            event.data['context']
        )

        # Publish result
        await bus.publish("guide.completed", result)
```

## API Reference

### GuideMiddleware

#### Methods

##### `__init__(project_path: str = ".")`
Initialize the middleware for a project.

##### `async before_agent_action(event: str, context: Dict) -> Optional[Dict]`
Check for suggestions before an action. Returns only high-confidence suggestions (≥ 0.7).

##### `async after_agent_action(event: str, context: Dict) -> List[Dict]`
Check for follow-up suggestions after an action. Returns medium-confidence suggestions (≥ 0.5).

##### `async execute_guide_if_accepted(guide_name: str, context: Dict) -> Dict`
Execute a guide automatically when accepted by agent.

##### `enable() / disable()`
Enable or disable the middleware.

##### `is_enabled() -> bool`
Check if middleware is enabled.

##### `get_statistics() -> Dict`
Get usage statistics.

##### `list_available_guides(category: Optional[str] = None) -> List[Dict]`
List all available guides, optionally filtered by category.

##### `search_guides(query: str) -> List[Dict]`
Search for guides by keyword.

##### `list_categories() -> List[str]`
List all guide categories.

### Singleton Functions

##### `get_guide_middleware(project_path: str = ".") -> GuideMiddleware`
Get or create the singleton middleware instance.

##### `reset_guide_middleware()`
Reset the singleton (useful for testing).

##### `async offer_guidance_before(event: str, context: Dict) -> Optional[Dict]`
Convenience function for before-action guidance.

##### `async offer_guidance_after(event: str, context: Dict) -> List[Dict]`
Convenience function for after-action guidance.

##### `async execute_guide(guide_name: str, context: Dict) -> Dict`
Convenience function for guide execution.

## Best Practices

### 1. Use Singleton Pattern

Always use `get_guide_middleware()` instead of creating instances directly:

```python
# Good
middleware = get_guide_middleware()

# Avoid
middleware = GuideMiddleware()  # Creates multiple instances
```

### 2. Check Confidence Scores

Always check confidence scores before presenting suggestions:

```python
suggestion = await middleware.before_agent_action(event, context)
if suggestion and suggestion['confidence'] >= 0.8:
    # High confidence - auto-accept
    await execute_guide(suggestion['guide'], context)
elif suggestion:
    # Medium confidence - ask user
    if user_confirms():
        await execute_guide(suggestion['guide'], context)
```

### 3. Handle Errors Gracefully

Always handle potential errors:

```python
try:
    result = await middleware.execute_guide_if_accepted(guide, context)
    if "error" in result:
        logger.error(f"Guide execution failed: {result['error']}")
        # Fallback to manual handling
except Exception as e:
    logger.error(f"Middleware error: {e}")
    # Continue without guidance
```

### 4. Monitor Statistics

Regularly check statistics to understand usage patterns:

```python
stats = middleware.get_statistics()
if stats['acceptance_rate'] < 0.3:
    # Suggestions not relevant - tune thresholds
    logger.warning("Low acceptance rate - consider adjusting confidence thresholds")
```

## Testing

Run the test suite:

```bash
cd .blackbox5/engine
python3 core/test_guide_middleware.py
```

Expected output:
```
============================================================
Guide Middleware Test Suite
============================================================

=== Test 1: Before Agent Action ===
✓ System suggests: Would you like me to test python code?
  Guide: test_python_code
  Confidence: 0.9
  Time: 3 minutes
  Difficulty: basic

=== Test 2: After Agent Action ===
✓ No follow-up suggestions

=== Test 4: Statistics ===
Middleware Statistics:
  Enabled: True
  Suggestions Offered: 1
  Suggestions Accepted: 0
  Guides Executed: 0
  Errors: 0
  Acceptance Rate: 0.0%

=== Test 5: Guide Discovery ===
✓ Available guides: 3
  - test_python_code: Validate and test Python code
  - test_javascript_code: Validate and test JavaScript/TypeScript code
  - validate_database_migration: Validate database migration

✓ Categories: database, deployment, testing, validation

============================================================
All tests completed successfully!
============================================================
```

## Files

- **Implementation**: `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/engine/core/guide_middleware.py`
- **Tests**: `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/engine/core/test_guide_middleware.py`
- **Documentation**: This file

## Dependencies

- `guides.Guide` - Main guide system interface
- `guides.OperationRegistry` - Operation registry
- `guides.GuideCatalog` - Context matching
- `asyncio` - Async support
- `logging` - Logging
- `pathlib` - Path handling
