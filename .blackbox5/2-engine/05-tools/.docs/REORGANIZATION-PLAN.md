# 05-Tools Reorganization Plan

## Current State Analysis

### Problem: Too Many Loose Files

The tools folder has **10 loose Python files** at the root level, making it hard to find and understand what each tool does.

### Current Structure

```
05-tools/
├── __init__.py              # Package init
├── base.py                  # Base tool class
├── registry.py              # Tool registration
├── bash_tool.py             # Bash execution
├── search_tool.py           # Code search
├── file_tools.py            # File operations
├── git_ops.py               # Git operations
├── indexer.py               # Indexing
├── context_manager.py       # Context management
├── tui_logger.py            # Terminal UI logger
│
├── data_tools/              # ✅ Good: Already grouped
├── maintenance/             # ✅ Good: Scripts grouped
├── experiments/             # ✅ Good: Experimental stuff
├── migration/               # ⚠️ Empty except README
└── validation/              # ⚠️ Empty except README
```

### Issues

1. **10 loose Python files** - No clear organization
2. **Hard to find tools** - Must scan through all files
3. **No logical grouping** - All tools mixed together
4. **Empty folders** - migration/ and validation/ only have READMEs

## Proposed Organization

### Option A: Organize by Purpose (RECOMMENDED) ✅

Group tools by WHAT THEY DO:

```
05-tools/
├── __init__.py              # Package init
├── README.md                # User guide
│
├── core/                    # Core infrastructure
│   ├── __init__.py
│   ├── base.py             # Base tool class
│   └── registry.py         # Tool registration
│
├── execution/               # Running code/commands
│   ├── __init__.py
│   ├── bash_tool.py        # Execute bash
│   └── indexer.py          # Generic indexing
│
├── file-ops/               # File operations
│   ├── __init__.py
│   ├── file_tools.py       # File read/write
│   └── search_tool.py      # Search files
│
├── git/                    # Git operations
│   ├── __init__.py
│   └── git_ops.py          # Git repository operations
│
├── utils/                  # Utilities
│   ├── __init__.py
│   ├── context_manager.py  # Context management
│   └── tui_logger.py       # Terminal UI logger
│
├── data_tools/             # ✅ Keep as-is
├── maintenance/            # ✅ Keep as-is
└── experiments/            # ✅ Keep as-is
```

**Benefits:**
- ✅ Logical grouping by purpose
- ✅ Easy to find what you need
- ✅ Scalable for new tools
- ✅ Clear separation of concerns

### Option B: Organize by Layer (Alternative)

Group by abstraction level:

```
05-tools/
├── infrastructure/          # Base stuff
│   ├── base.py
│   ├── registry.py
│   └── context_manager.py
│
├── tools/                  # Actual tools
│   ├── bash_tool.py
│   ├── file_tools.py
│   ├── search_tool.py
│   ├── git_ops.py
│   ├── indexer.py
│   └── tui_logger.py
│
└── data_tools/             # Keep as-is
```

**Why NOT recommended:**
- Less intuitive
- Harder to find specific tools
- "tools/tools" naming issue again

### Option C: Minimal Change (Not Recommended)

Just move 2-3 files into folders:

```
05-tools/
├── infrastructure/
│   ├── base.py
│   └── registry.py
├── git/
│   └── git_ops.py
└── (everything else stays loose)
```

**Why NOT recommended:**
- Still has loose files
- Incomplete organization
- Doesn't solve the real problem

## Implementation Plan (Option A)

### Phase 1: Create Folders

```bash
mkdir -p core execution file-ops git utils
```

### Phase 2: Move Files

```bash
# Core infrastructure
mv base.py core/
mv registry.py core/

# Execution tools
mv bash_tool.py execution/
mv indexer.py execution/

# File operations
mv file_tools.py file-ops/
mv search_tool.py file-ops/

# Git operations
mv git_ops.py git/

# Utilities
mv context_manager.py utils/
mv tui_logger.py utils/
```

### Phase 3: Create __init__.py Files

Each folder needs an `__init__.py`:

```python
# core/__init__.py
from .base import BaseTool
from .registry import ToolRegistry

__all__ = ['BaseTool', 'ToolRegistry']
```

### Phase 4: Update Root __init__.py

```python
# 05-tools/__init__.py
from .core import BaseTool, ToolRegistry
from .execution import BashTool, Indexer
from .file_ops import FileTools, SearchTool
from .git import GitOps
from .utils import ContextManager, TUILogger

__all__ = [
    'BaseTool',
    'ToolRegistry',
    'BashTool',
    'Indexer',
    'FileTools',
    'SearchTool',
    'GitOps',
    'ContextManager',
    'TUILogger',
]
```

### Phase 5: Update Imports

Find and update imports throughout codebase:

```python
# OLD
from blackbox5.engine.tools.base import BaseTool
from blackbox5.engine.tools.registry import ToolRegistry
from blackbox5.engine.tools.file_tools import FileTools
from blackbox5.engine.tools.git_ops import GitOps

# NEW
from blackbox5.engine.tools.core import BaseTool, ToolRegistry
from blackbox5.engine.tools.file_ops import FileTools
from blackbox5.engine.tools.git import GitOps
```

## File Mapping

| Current Location | New Location | Category |
|-----------------|--------------|----------|
| `base.py` | `core/base.py` | Core Infrastructure |
| `registry.py` | `core/registry.py` | Core Infrastructure |
| `bash_tool.py` | `execution/bash_tool.py` | Execution |
| `indexer.py` | `execution/indexer.py` | Execution |
| `file_tools.py` | `file-ops/file_tools.py` | File Operations |
| `search_tool.py` | `file-ops/search_tool.py` | File Operations |
| `git_ops.py` | `git/git_ops.py` | Git |
| `context_manager.py` | `utils/context_manager.py` | Utilities |
| `tui_logger.py` | `utils/tui_logger.py` | Utilities |

## Categories Explained

### Core Infrastructure (2 files)
**Purpose**: Foundation for all tools
- `base.py` - Base class that all tools inherit from
- `registry.py` - Registration and discovery mechanism

### Execution (2 files)
**Purpose**: Running code and commands
- `bash_tool.py` - Execute bash commands
- `indexer.py` - Generic indexing/execution utilities

### File Operations (2 files)
**Purpose**: Working with files
- `file_tools.py` - Read, write, manipulate files
- `search_tool.py` - Search through files

### Git (1 file)
**Purpose**: Git repository operations
- `git_ops.py` - All git-related operations

### Utilities (2 files)
**Purpose**: Helper utilities
- `context_manager.py` - Manage execution context
- `tui_logger.py` - Terminal UI logging

## Before vs After

### Before: Confusing
```
05-tools/
├── __init__.py
├── base.py
├── registry.py
├── bash_tool.py
├── search_tool.py
├── file_tools.py
├── git_ops.py
├── indexer.py
├── context_manager.py
├── tui_logger.py
├── data_tools/
├── maintenance/
└── experiments/
```

**Problems:**
- 10 loose files to scan through
- No logical grouping
- Hard to find specific tools

### After: Organized
```
05-tools/
├── __init__.py
├── README.md
├── core/              # 2 files
├── execution/         # 2 files
├── file-ops/          # 2 files
├── git/               # 1 file
├── utils/             # 2 files
├── data_tools/        # (unchanged)
├── maintenance/       # (unchanged)
└── experiments/       # (unchanged)
```

**Benefits:**
- ✅ 0 loose files (except __init__.py and README.md)
- ✅ Clear logical grouping
- ✅ Easy to find tools
- ✅ Scalable structure

## Verification Steps

After implementation, verify:

```bash
# 1. Check structure
tree -L 2 05-tools/

# 2. Count loose files (should be 2: __init__.py, README.md)
ls -1 05-tools/*.py 05-tools/*.md 2>/dev/null | wc -l

# 3. Verify all folders have __init__.py
for dir in core execution file-ops git utils; do
  ls 05-tools/$dir/__init__.py || echo "Missing: $dir/__init__.py"
done

# 4. Test imports
python3 -c "from blackbox5.engine.tools.core import BaseTool"
python3 -c "from blackbox5.engine.tools.execution import BashTool"
python3 -c "from blackbox5.engine.tools.file_ops import FileTools"
python3 -c "from blackbox5.engine.tools.git import GitOps"
```

## Empty Folder Cleanup

After reorganization, consider:

1. **migration/** - Delete if empty (only has README)
2. **validation/** - Delete if empty (only has README)

Or add content if needed.

## Rollback Plan

If something goes wrong:

```bash
cd 05-tools
git checkout HEAD -- .
# Or restore from backup if created
```

## Recommendation

**Implement Option A** - Organize by purpose

This is the cleanest approach that:
- Groups tools logically
- Eliminates loose files
- Scales well for future additions
- Follows first principles (WHAT do I want to DO?)

## Questions?

1. Do you approve Option A?
2. Should I implement it now?
3. Any concerns about the categorization?
