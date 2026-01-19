# 05-Tools

Reusable utilities and tools for the BlackBox5 Engine.

## Overview

This folder contains **utility tools** organized by purpose:
- **Core infrastructure** - Base classes and registry
- **Execution** - Running code and commands
- **File operations** - Reading, writing, searching files
- **Git** - Git repository operations
- **Utilities** - Helper utilities
- **Data tools** - Data processing tools
- **Maintenance** - Maintenance scripts

## Structure

```
05-tools/
├── __init__.py            # Package exports
├── README.md              # This file
│
├── core/                  # Core infrastructure (2 files)
│   ├── base.py           # Base tool class
│   └── registry.py       # Tool registration
│
├── execution/             # Execution tools (2 files)
│   ├── bash_tool.py      # Bash execution
│   └── indexer.py        # Generic indexing
│
├── file-ops/              # File operations (2 files)
│   ├── file_tools.py     # File read/write
│   └── search_tool.py    # Search files
│
├── git/                   # Git operations (1 file)
│   └── git_ops.py        # Git repository operations
│
├── utils/                 # Utilities (2 files)
│   ├── context_manager.py # Context management
│   └── tui_logger.py     # Terminal UI logger
│
├── data_tools/            # Data processing (3 files)
│   ├── code_indexer.py   # Code indexing
│   ├── domain_scanner.py # Domain scanning
│   └── refactor_tracker.py # Refactoring tracking
│
├── maintenance/           # Maintenance scripts (3 files)
│   ├── build-structure.sh
│   ├── validate-structure.sh
│   └── validate.sh
│
└── experiments/           # Experimental features
    └── legacy/           # Legacy protocols
```

## Categories

### Core Infrastructure (2 files)

| File | Purpose |
|------|---------|
| `base.py` | Base class for all tools |
| `registry.py` | Tool registration and discovery |

**Usage:**
```python
from blackbox5.engine.tools.core import BaseTool, ToolRegistry

class MyTool(BaseTool):
    name = "my_tool"
    def run(self, **kwargs):
        return result

registry = ToolRegistry()
registry.register(MyTool)
```

### Execution (2 files)

| File | Purpose |
|------|---------|
| `bash_tool.py` | Execute bash commands |
| `indexer.py` | Generic indexing utilities |

**Usage:**
```python
from blackbox5.engine.tools.execution import BashTool

bash = BashTool()
result = bash.run(command="ls -la")
```

### File Operations (2 files)

| File | Purpose |
|------|---------|
| `file_tools.py` | Read, write, manipulate files |
| `search_tool.py` | Search through files |

**Usage:**
```python
from blackbox5.engine.tools.file_ops import FileTools, SearchTool

tools = FileTools()
content = tools.read_file("README.md")

search = SearchTool()
results = search.search("keyword", path="src/")
```

### Git (1 file)

| File | Purpose |
|------|---------|
| `git_ops.py` | Git repository operations |

**Usage:**
```python
from blackbox5.engine.tools.git import GitOps

git = GitOps()
status = git.status()
```

### Utilities (2 files)

| File | Purpose |
|------|---------|
| `context_manager.py` | Execution context management |
| `tui_logger.py` | Terminal UI logger |

**Usage:**
```python
from blackbox5.engine.tools.utils import ContextManager, TUILogger

ctx = ContextManager()
logger = TUILogger()
```

### Data Tools (3 files)

| File | Purpose |
|------|---------|
| `code_indexer.py` | Index code for fast search |
| `domain_scanner.py` | Scan domain structure |
| `refactor_tracker.py` | Track refactoring changes |

**Usage:**
```python
from blackbox5.engine.tools.data_tools import CodeIndexer

indexer = CodeIndexer()
index = indexer.index_directory("src/")
```

## Quick Reference

| I want to... | Use this |
|--------------|----------|
| Create a tool | `from blackbox5.engine.tools.core import BaseTool` |
| Execute bash | `from blackbox5.engine.tools.execution import BashTool` |
| Read files | `from blackbox5.engine.tools.file_ops import FileTools` |
| Search files | `from blackbox5.engine.tools.file_ops import SearchTool` |
| Git operations | `from blackbox5.engine.tools.git import GitOps` |
| Log to terminal | `from blackbox5.engine.tools.utils import TUILogger` |
| Index code | `from blackbox5.engine.tools.data_tools import CodeIndexer` |

## Statistics

- **Total tools**: 14 Python modules
- **Maintenance scripts**: 3 Shell scripts
- **Categories**: 7 (core, execution, file-ops, git, utils, data_tools, maintenance)
- **Total files**: 25
- **Loose files**: 0 (all organized!)

## Standards

All tools should:

1. ✅ Inherit from `BaseTool`
2. ✅ Implement `run()` method
3. ✅ Have `name` and `description` attributes
4. ✅ Be registerable in `ToolRegistry`
5. ✅ Handle errors gracefully

## Creating New Tools

### Step 1: Choose Category

Decide which folder your tool belongs in:
- `core/` - Infrastructure
- `execution/` - Running code
- `file-ops/` - File operations
- `git/` - Git operations
- `utils/` - Utilities

### Step 2: Create Tool Class

```python
from blackbox5.engine.tools.core import BaseTool

class MyNewTool(BaseTool):
    """Description of what this tool does."""

    name = "my_new_tool"
    description = "A helpful description"

    def run(self, **kwargs):
        # Implementation
        return result
```

### Step 3: Save to Category Folder

Save in appropriate folder (e.g., `execution/my_new_tool.py`)

### Step 4: Export in __init__.py

```python
# execution/__init__.py
from .my_new_tool import MyNewTool

__all__ = ['BashTool', 'Indexer', 'MyNewTool']
```

### Step 5: Register (optional)

```python
from blackbox5.engine.tools.core import ToolRegistry

registry = ToolRegistry()
registry.register(MyNewTool)
```

## Related

- Engine core: `../01-core/`
- Integrations: `../06-integrations/`
- Operations: `../07-operations/`

## Documentation

- Reorganization plan: `REORGANIZATION-PLAN.md`
- Analysis: `ANALYSIS.md`
- Engine docs: `../../engine/docs/tools/`
