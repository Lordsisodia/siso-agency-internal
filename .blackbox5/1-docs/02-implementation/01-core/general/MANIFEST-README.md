# Manifest System - Documentation

**Created:** 2026-01-18
**Version:** 1.0.0
**Location:** `.blackbox5/engine/core/manifest.py`

---

## Overview

The Manifest System provides comprehensive tracking and audit trails for all operations in Blackbox 5. It creates detailed markdown files for each operation, capturing metadata, execution steps, results, and errors with precise timestamps.

## Features

- **Automatic Tracking**: Captures all operations without manual intervention
- **Step-by-Step Logging**: Records each execution step with details
- **Markdown Output**: Human-readable manifest files
- **UUID-Based Identification**: Unique IDs for each operation
- **ISO Timestamps**: Precise timing information
- **Status Tracking**: PENDING → IN_PROGRESS → COMPLETED/FAILED
- **CLI Tool**: Easy viewing and management

## Components

### 1. ManifestStatus Enum

```python
class ManifestStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
```

### 2. ManifestStep Dataclass

Represents a single step in an operation:

```python
@dataclass
class ManifestStep:
    step: str              # Step description
    timestamp: str         # ISO timestamp
    details: Dict[str, Any]  # Step details
    status: str = "completed"  # Step status
```

### 3. Manifest Dataclass

Represents a complete operation manifest:

```python
@dataclass
class Manifest:
    id: str                           # UUID
    type: str                         # Operation type
    started_at: str                   # ISO timestamp
    status: ManifestStatus            # Current status
    steps: List[ManifestStep]         # Execution steps
    completed_at: Optional[str]       # Completion timestamp
    result: Optional[Dict[str, Any]]  # Operation result
    error: Optional[str]              # Error message if failed
    metadata: Dict[str, Any]          # Additional metadata
```

### 4. ManifestSystem Class

Main interface for creating and managing manifests.

## Usage

### Basic Usage

```python
from blackbox5.engine.core import ManifestSystem

# Initialize the system
manifest_system = ManifestSystem()

# Create a manifest for an operation
manifest = manifest_system.create_manifest(
    operation_type="task_execution",
    metadata={
        "task_id": "task-123",
        "description": "Build user API",
        "agent": "coder"
    }
)

# Add execution steps
manifest_system.start_step(
    manifest,
    "analysis",
    {"complexity": 0.7, "tools": ["code_gen"]}
)

manifest_system.start_step(
    manifest,
    "execution",
    {"files": 5, "lines": 250}
)

# Complete the operation
manifest_system.complete_manifest(
    manifest,
    result={"success": True, "files": ["user.py"]}
)
```

### Error Handling

```python
# Mark operation as failed
try:
    # ... perform operation ...
    pass
except Exception as e:
    manifest_system.fail_manifest(
        manifest,
        error=f"Operation failed: {str(e)}"
    )
```

### Querying Manifests

```python
# List all manifests
all_manifests = manifest_system.list_manifests()

# Filter by type
task_manifests = manifest_system.list_manifests(
    operation_type="task_execution"
)

# Filter by status
completed = manifest_system.list_manifests(
    status=ManifestStatus.COMPLETED
)

# Get specific manifest
manifest = manifest_system.get_manifest(manifest_id)
```

## CLI Tool

### view-manifest.sh

View operation manifests from the command line.

**List recent manifests:**
```bash
.blackbox5/engine/runtime/view-manifest.sh
```

**View specific manifest:**
```bash
.blackbox5/engine/runtime/view-manifest.sh <manifest_id>
```

**List all manifests:**
```bash
.blackbox5/engine/runtime/view-manifest.sh --all
```

## Manifest File Format

Manifests are stored as markdown files with the following structure:

```markdown
# Operation Manifest: task_execution

## Metadata
- **ID:** `a753abac-e158-4499-a06f-9154b6ba76e9`
- **Type:** task_execution
- **Started:** 2026-01-18T13:06:29.520650
- **Status:** completed
- **Completed:** 2026-01-18T13:06:31.524386

### Additional Metadata
- **task_id:** task-123
- **agent:** coder

## Execution Steps

### Step 1: task_analysis
- **Time:** 2026-01-18T13:06:29.520800
- **Status:** completed

**Details:**
  - complexity_score: 0.6
  - estimated_steps: 15

### Step 2: code_generation
- **Time:** 2026-01-18T13:06:30.523315
- **Status:** completed

**Details:**
  - files_created: 5
  - lines_of_code: 250

## Result
```json
{
  "success": true,
  "files": ["user_controller.py"]
}
```
```

## Storage

- **Directory:** `.blackbox5/scratch/manifests/`
- **Format:** Markdown files (`.md`)
- **Naming:** `{manifest_id}.md`
- **Auto-created:** Directory created automatically on first use

## Integration Points

### With Task Router

```python
from blackbox5.engine.core import TaskRouter, ManifestSystem

manifest_system = ManifestSystem()
task_router = TaskRouter(agents, skills)

# Route task and create manifest
task = Task(...)
strategy = task_router.route(task)

manifest = manifest_system.create_manifest(
    "task_execution",
    {"task_id": task.id, "strategy": strategy.type}
)
```

### With Multi-Agent Coordinator

```python
from blackbox5.engine.core import ManifestSystem

manifest_system = ManifestSystem()

manifest = manifest_system.create_manifest(
    "multi_agent_coordination",
    {"task_id": task.id, "subtasks": len(subtasks)}
)

# Track each subtask
for subtask in subtasks:
    manifest_system.start_step(
        manifest,
        f"subtask_{subtask.id}",
        {"specialist": subtask.specialist}
    )
```

### With Structured Logging

```python
from blackbox5.engine.core import get_operation_logger, ManifestSystem

manifest_system = ManifestSystem()
manifest = manifest_system.create_manifest("operation_type")
logger = get_operation_logger(manifest.id)

# Log and track together
manifest_system.start_step(manifest, "step1", {"detail": "value"})
logger.operation_step("step1", detail="value")
```

## Best Practices

### 1. Always Create Manifests for Long Operations

```python
# Good
manifest = manifest_system.create_manifest("complex_task")
try:
    # ... perform operation ...
    manifest_system.complete_manifest(manifest, result)
except Exception as e:
    manifest_system.fail_manifest(manifest, str(e))

# Bad - no tracking
perform_operation()
```

### 2. Include Relevant Metadata

```python
manifest = manifest_system.create_manifest(
    "task_execution",
    {
        "task_id": task.id,
        "agent": agent.name,
        "complexity": complexity.score,
        "estimated_steps": complexity.steps,
        "user_request": task.description[:100]
    }
)
```

### 3. Log Detailed Step Information

```python
manifest_system.start_step(
    manifest,
    "code_generation",
    {
        "files_created": len(files),
        "lines_written": sum(len(f.content) for f in files),
        "languages": list(set(f.language for f in files)),
        "duration_seconds": 5.2
    }
)
```

### 4. Handle Errors Gracefully

```python
try:
    result = perform_operation()
    manifest_system.complete_manifest(manifest, {
        "success": True,
        "result": result
    })
except ValidationError as e:
    manifest_system.fail_manifest(manifest, f"Validation error: {e}")
    raise
except Exception as e:
    manifest_system.fail_manifest(manifest, f"Unexpected error: {e}")
    raise
```

## Use Cases

### 1. Task Execution Tracking

Track individual agent task execution:

```python
manifest = manifest_system.create_manifest(
    "agent_task",
    {"agent": "coder", "task": task_id}
)

manifest_system.start_step(manifest, "planning")
manifest_system.start_step(manifest, "execution")
manifest_system.start_step(manifest, "validation")
```

### 2. Multi-Agent Coordination

Track complex multi-agent workflows:

```python
manifest = manifest_system.create_manifest(
    "multi_agent_coordination",
    {"manager": "manager", "subtasks": 5}
)

for subtask in subtasks:
    manifest_system.start_step(
        manifest,
        f"delegate_{subtask.specialist}",
        {"subtask_id": subtask.id}
    )
```

### 3. Error Investigation

Debug failed operations:

```bash
# List failed manifests
.blackbox5/engine/runtime/view-manifest.sh | grep "✗"

# View specific failed manifest
.blackbox5/engine/runtime/view-manifest.sh <failed_id>
```

### 4. Performance Analysis

Analyze operation timing:

```python
manifest = manifest_system.create_manifest("operation")

# Each step gets a timestamp
manifest_system.start_step(manifest, "step1")
# ... do work ...
manifest_system.start_step(manifest, "step2")

# Calculate duration from timestamps
```

## Examples

See `.blackbox5/engine/core/test_manifest.py` for a complete working example.

Run it with:
```bash
python3 .blackbox5/engine/core/test_manifest.py
```

## API Reference

### ManifestSystem.__init__(manifest_dir: Path = None)

Initialize the manifest system.

**Parameters:**
- `manifest_dir` (optional): Directory to store manifests. Defaults to `.blackbox5/scratch/manifests`

### ManifestSystem.create_manifest(operation_type: str, metadata: Dict = None) -> Manifest

Create a new operation manifest.

**Parameters:**
- `operation_type`: Type of operation (e.g., "task_execution")
- `metadata`: Additional metadata to attach

**Returns:** Manifest object

### ManifestSystem.start_step(manifest: Manifest, step: str, details: Dict = None) -> None

Add a step to the manifest.

**Parameters:**
- `manifest`: Manifest to add step to
- `step`: Step description
- `details`: Step details (dict)

### ManifestSystem.complete_manifest(manifest: Manifest, result: Dict = None) -> None

Mark manifest as completed.

**Parameters:**
- `manifest`: Manifest to complete
- `result`: Operation result (dict)

### ManifestSystem.fail_manifest(manifest: Manifest, error: str) -> None

Mark manifest as failed.

**Parameters:**
- `manifest`: Manifest that failed
- `error`: Error message

### ManifestSystem.get_manifest(manifest_id: str) -> Optional[Manifest]

Get manifest by ID.

**Parameters:**
- `manifest_id`: UUID of the manifest

**Returns:** Manifest object or None

### ManifestSystem.list_manifests(operation_type: str = None, status: ManifestStatus = None) -> List[Manifest]

List manifests with optional filtering.

**Parameters:**
- `operation_type` (optional): Filter by operation type
- `status` (optional): Filter by status

**Returns:** List of Manifest objects (sorted newest first)

## Status

- **Implemented:** Phase 1.4 of Implementation Action Plan
- **Status:** Production Ready
- **Coverage:** All operations should use manifests
- **Next:** Integration with all long-running operations

## Related Components

- **Structured Logging:** `.blackbox5/engine/core/logging.py`
- **Task Router:** `.blackbox5/engine/core/task_router.py`
- **Event Bus:** `.blackbox5/engine/core/event_bus.py`
- **Circuit Breaker:** `.blackbox5/engine/core/circuit_breaker.py`
