# Lib Directory

**Purpose:** Python utilities for the autonomous system.

---

## Modules

### task_utils.py

Task management with states, priorities, and transitions.

```python
from lib.task_utils import TaskManager, TaskStatus

manager = TaskManager()
task = manager.load_task("TASK-001")
manager.transition_status("TASK-001", TaskStatus.IN_PROGRESS)
```

### storage_backends.py

Storage abstraction with file, memory, and hybrid backends.

```python
from lib.storage_backends import StorageManager

storage = StorageManager()
key = storage.store_insight("testing", {"finding": "it works!"})
```

### event_logging.py

Structured event logging and telemetry.

```python
from lib.event_logging import EventLogger

logger = EventLogger()
logger.start_run()
logger.log_task_start("TASK-001")
```

### context_management.py

Token budget tracking and context compression.

```python
from lib.context_management import ContextManager

context = ContextManager(max_tokens=200000)
context.add_content("Some content...")
status = context.get_status()
```

### state_machine.py

Finite state machines for tasks, agents, and runs.

```python
from lib.state_machine import TaskStateMachine

sm = TaskStateMachine()
sm.transition("start")
print(sm.current_state)  # TaskState.IN_PROGRESS
```

### skill_router.py

Automatic skill selection based on task keywords.

```python
from lib.skill_router import SkillRouter

router = SkillRouter()
match = router.get_best_skill("Create a PRD")
print(match.skill)  # SkillType.PM
```

---

## Testing

Each module includes CLI testing:

```bash
python lib/task_utils.py test
python lib/storage_backends.py test
python lib/event_logging.py test
python lib/context_management.py test
python lib/state_machine.py test
python lib/skill_router.py test
```

---

## Architecture

All modules follow these principles:
- Self-contained
- Well-documented
- CLI testable
- Error handling
- Type hints
