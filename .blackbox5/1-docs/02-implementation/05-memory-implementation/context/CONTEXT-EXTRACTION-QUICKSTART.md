# Context Extraction Quick Start Guide

**Component 5 of the GSD Framework**

## Overview

The Context Extraction system extracts relevant information from your codebase, documentation, and conversation history to provide better context for task planning.

## Installation

The ContextExtractor is part of BlackBox5. No additional installation needed.

```python
from pathlib import Path
from core.context_extractor import ContextExtractor
```

## Basic Usage

### 1. Initialize

```python
extractor = ContextExtractor(
    codebase_path=Path("/path/to/your/code"),
    docs_path=Path("/path/to/your/docs"),  # Optional
    max_context_tokens=10000,  # Maximum tokens to extract
    max_files=10,              # Maximum files to include
    max_docs=5                 # Maximum docs to include
)
```

### 2. Extract Context

```python
context = await extractor.extract_context(
    task_id="task-001",
    task_description="Add JWT authentication to API endpoints",
    conversation_history=[...]  # Optional
)
```

### 3. Use Context

```python
# Format for LLM
prompt = extractor.format_context_for_llm(context)

# Or use compact format
summary = extractor.format_context_compact(context)
```

## Examples

### Example 1: Basic Extraction

```python
# Simple task without conversation
context = await extractor.extract_context(
    task_id="task-001",
    task_description="Add rate limiting to API"
)

print(f"Found {len(context.relevant_files)} relevant files")
print(f"Found {len(context.relevant_docs)} relevant docs")
print(f"Keywords: {context.keywords}")
```

### Example 2: With Conversation

```python
conversation = [
    {"role": "user", "content": "Add caching"},
    {"role": "assistant", "content": "I'll use Redis"}
]

context = await extractor.extract_context(
    task_id="task-002",
    task_description="Implement caching layer",
    conversation_history=conversation
)

print(f"Conversation: {context.conversation_context.summary}")
```

### Example 3: Custom Search

```python
# Search only Python files
files = await extractor.search_codebase(
    keywords=["auth", "JWT"],
    file_patterns=["*.py"]
)

# Search documentation
docs = await extractor.search_docs(keywords=["authentication"])
```

### Example 4: LLM Integration

```python
# Extract context
context = await extractor.extract_context(
    task_id="task-003",
    task_description="Refactor user service"
)

# Format for LLM
system_prompt = extractor.format_context_for_llm(context)

# Use in LLM call
response = await llm.complete(
    prompt=f"{system_prompt}\n\nPlease create a plan for this task."
)
```

## Output Structure

### TaskContext

```python
TaskContext(
    task_id="task-001",
    task_description="Add JWT auth",
    relevant_files=[FileContext, ...],  # 10 files max
    relevant_docs=[DocSection, ...],    # 5 docs max
    conversation_context=ConversationContext,
    total_tokens=2500,
    extraction_time=0.15,
    sources_searched=15,
    keywords=["JWT", "authentication", ...],
    extracted_at=datetime(...)
)
```

### FileContext

```python
FileContext(
    file_path="src/auth.py",
    language="python",
    relevant_lines=["1: import jwt", "5: def auth()"],
    summary="Authentication module with JWT",
    size_bytes=1234,
    last_modified=datetime(...)
)
```

### DocSection

```python
DocSection(
    section_path="README.md",
    title="Authentication",
    content="## Authentication\nThis uses JWT...",
    relevance_score=0.85,
    heading_level=2
)
```

## Configuration

### Adjust Context Limits

```python
extractor = ContextExtractor(
    codebase_path=Path("/code"),
    max_context_tokens=15000,  # More tokens
    max_files=15,              # More files
    max_docs=8                 # More docs
)
```

### Add Language Support

Edit `context_extractor.py`:

```python
LANGUAGE_EXTENSIONS = {
    # ... existing
    '.ext': 'new_language',
}
```

### Skip Directories

Edit `context_extractor.py`:

```python
SKIP_DIRECTORIES = {
    # ... existing
    'custom_dir',
}
```

## Best Practices

### 1. Choose Good File Patterns

```python
# Good - specific
file_patterns=['src/**/*.py', 'lib/**/*.py']

# Avoid - too broad
file_patterns=['*']  # Searches everything
```

### 2. Monitor Token Count

```python
context = await extractor.extract_context(...)

if context.total_tokens > 10000:
    # Reduce limits
    extractor.max_files = 5
    extractor.max_docs = 2
```

### 3. Use Conversation History

```python
# Provides important context
context = await extractor.extract_context(
    task_id="task-001",
    task_description="Fix bug",
    conversation_history=previous_discussion
)
```

### 4. Serialize for Caching

```python
# Save context
data = context.to_dict()
cache.set(task_id, data)

# Restore context
data = cache.get(task_id)
context = TaskContext.from_dict(data)
```

## Troubleshooting

### No Files Found

**Problem:** `len(context.relevant_files) == 0`

**Solutions:**
- Check file patterns
- Verify keywords
- Check directory paths
- Ensure files exist

```python
# Debug
keywords = extractor.extract_keywords(description)
print(f"Keywords: {keywords}")

files = await extractor.search_codebase(keywords, file_patterns=['*'])
print(f"Files: {files}")
```

### Too Many Tokens

**Problem:** `context.total_tokens` is too high

**Solutions:**
- Reduce `max_files` and `max_docs`
- Use more specific file patterns
- Filter results manually

```python
# Reduce limits
extractor = ContextExtractor(
    codebase_path=Path("/code"),
    max_files=5,
    max_docs=2
)
```

### Slow Extraction

**Problem:** Extraction takes too long

**Solutions:**
- Narrow codebase path
- Use specific file patterns
- Reduce max_files

```python
# Faster extraction
extractor = ContextExtractor(
    codebase_path=Path("/code/src"),  # Narrower path
    max_files=5  # Fewer files
)
```

## Performance

| Operation | Time | Notes |
|-----------|------|-------|
| Keyword extraction | < 1ms | Very fast |
| Codebase search | 50-200ms | Depends on codebase size |
| Documentation search | 20-100ms | Depends on doc count |
| Full extraction | 100-500ms | Typical use case |

## Integration with Task Router

```python
from core.context_extractor import ContextExtractor
from core.task_router import TaskRouter

# Initialize both
extractor = ContextExtractor(codebase_path=Path("/code"))
router = TaskRouter()

# Use together
async def process_task(description, conversation=None):
    # Extract context
    context = await extractor.extract_context(
        task_id="task-001",
        task_description=description,
        conversation_history=conversation
    )

    # Create task with context
    task = Task(
        description=description,
        context=extractor.format_context_for_llm(context)
    )

    # Route and execute
    routing = await router.route_task(task)
    return routing
```

## Testing

Run the test suite:

```bash
pytest .blackbox5/tests/test_context_extraction.py -v
```

Run demo:

```bash
python3 .blackbox5/examples/context_extraction_demo.py
```

## Next Steps

- Read [CONTEXT-EXTRACTION-IMPLEMENTATION.md](./CONTEXT-EXTRACTION-IMPLEMENTATION.md) for details
- Check [task_types.py](../engine/core/task_types.py) for data structures
- See [task_router.py](../engine/core/task_router.py) for integration

## Support

For issues or questions:
- Check the test suite for examples
- Review the implementation doc
- Examine the demo script

---

**Status:** ✅ Production Ready
**Version:** 1.0.0
**Date:** 2025-01-19
