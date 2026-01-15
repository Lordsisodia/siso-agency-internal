# Blackbox3 Context Module

Advanced context tracking and management for AI-assisted development sessions.

## Features

### ContextManager
- **Automatic Context Compaction**: Manages memory with automatic cleanup when size limits approached
- **Semantic Indexing**: Tag-based and entity-based search capabilities
- **Multi-threaded Access**: Thread-safe operations with RLock
- **Persistent Storage**: JSON-based persistent storage
- **Context Versioning**: Track changes over time
- **Import/Export**: Portable context data

### SnapshotManager
- **Versioned Snapshots**: SHA256-based snapshot IDs
- **Automatic Rotation**: Keeps configurable number of snapshots (default: 10)
- **Delta Compression**: Efficient storage with delta-based compression
- **Import/Export**: Archive snapshots as tar.gz files
- **Tag-based Organization**: Organize snapshots with tags and descriptions

### ContextStorage
- **Multiple Backends**:
  - FileSystemBackend: Compressed file storage with hash-based sharding
  - MemoryBackend: In-memory storage for caching
- **Multi-format Support**: JSON and pickle serialization
- **TTL Support**: Automatic expiration with time-to-live
- **Version Tracking**: Track data versions over time
- **CacheLayer**: Two-level caching with automatic eviction

## Installation

```bash
# Install from requirements
pip install -r modules/context/requirements.txt

# Or install with optional features
pip install -r modules/context/requirements.txt  # Basic
pip install chromadb sentence-transformers  # Advanced features
```

## Quick Start

### Context Management

```python
from modules.context import ContextManager

# Initialize
ctx = ContextManager(max_size_mb=10.0)

# Add context
ctx.add_context(
    "project_goal",
    "Build a scalable web application",
    tags=["planning", "high-level"]
)

# Retrieve context
goal = ctx.get_context("project_goal")

# Search by tag
planning_items = ctx.search_by_tag("planning")

# Get statistics
stats = ctx.get_context_summary()
```

### Snapshot Management

```python
from modules.context import SnapshotManager

# Initialize
snap = SnapshotManager(max_snapshots=10)

# Create snapshot
snapshot_id = snap.create_snapshot(
    context_data,
    description="Before major refactor",
    tags=["refactor", "milestone"]
)

# Restore snapshot
restored = snap.restore_snapshot(snapshot_id)

# List snapshots
snapshots = snap.list_snapshots(tag="refactor")
```

### Advanced Storage

```python
from modules.context import ContextStorage, CacheLayer

# Initialize storage
storage = ContextStorage(enable_compression=True)

# Store with TTL
storage.store(
    "session_data",
    {"user": "alice", "status": "active"},
    ttl=3600  # 1 hour
)

# Retrieve
data = storage.retrieve("session_data")

# Use cache layer for performance
cache = CacheLayer(storage, max_l1_items=1000)
data = cache.get("session_data")
```

## CLI Usage

### Context Manager CLI

```bash
# View context statistics
python -m modules.context.manager status

# Add context item
python -m modules.context.manager add --key "goal" --value '{"text": "build app"}'

# Get context item
python -m modules.context.manager get --key "goal"

# Search by tag
python -m modules.context.manager search --tag "planning"

# Export context
python -m modules.context.manager export --file context_backup.json

# Import context
python -m modules.context.manager import --file context_backup.json
```

### Snapshot Manager CLI

```bash
# List snapshots
python -m modules.context.snapshot list

# Create snapshot
python -m modules.context.snapshot create --description "Before refactor" --tag "milestone"

# Restore snapshot
python -m modules.context.snapshot restore --id abc123...

# Delete snapshot
python -m modules.context.snapshot delete --id abc123...

# Export snapshot
python -m modules.context.snapshot export --id abc123... --file backup.tar.gz

# Import snapshot
python -m modules.context.snapshot import --file backup.tar.gz
```

### Storage CLI

```bash
# View storage statistics
python -m modules.context.storage stats

# Clean up expired entries
python -m modules.context.storage cleanup

# Export all data
python -m modules.context.storage export --file backup.json

# Import data
python -m modules.context.storage import --file backup.json

# View cache statistics
python -m modules.context.storage cache-stats
```

## Architecture

### Memory Management

```
Working Memory (10MB)
    ↓ Auto-compaction
Extended Memory (500MB)
    ↓ Archival
Archival Memory (5GB)
```

### Storage Backends

```
ContextStorage
    ↓
    ├─ FileSystemBackend (default)
    │   ├─ Hash-based sharding
    │   ├─ Gzip compression
    │   └─ Persistent storage
    │
    └─ MemoryBackend (optional)
        ├─ In-memory
        └─ Fast access

CacheLayer
    ├─ L1: Memory cache (fastest)
    └─ L2: Storage backend (persistent)
```

## Configuration

### Context Manager

```python
ctx = ContextManager(
    context_root=Path(".memory/context"),  # Storage location
    max_size_mb=10.0,                      # Max size before compaction
    enable_compression=True,               # Enable compression
    enable_semantic_index=True             # Enable semantic search
)
```

### Snapshot Manager

```python
snap = SnapshotManager(
    snapshot_dir=Path(".memory/snapshots"),
    max_snapshots=10,                      # Keep 10 snapshots
    enable_deltas=True                     # Enable delta compression
)
```

### Storage

```python
storage = ContextStorage(
    backend=FileSystemBackend(),           # Custom backend
    default_format="json",                 # Serialization format
    enable_compression=True,               # Enable compression
    enable_versioning=True                 # Track versions
)
```

## Advanced Features

### Semantic Search (with ChromaDB)

```python
from modules.context import ContextManager

# Enable semantic search
ctx = ContextManager(enable_semantic_index=True)

# Add context with embeddings
ctx.add_context(
    "feature_idea",
    "User authentication system",
    tags=["feature", "security"]
)

# Semantic similarity search (requires ChromaDB)
results = ctx.search_semantic("login system", top_k=5)
```

### Custom Storage Backend

```python
from modules.context.storage import StorageBackend

class CustomBackend(StorageBackend):
    def store(self, key: str, data: bytes) -> bool:
        # Custom storage logic
        pass

    # Implement other methods...

# Use custom backend
storage = ContextStorage(backend=CustomBackend())
```

### Multi-level Caching

```python
from modules.context import CacheLayer

# Configure cache
cache = CacheLayer(
    storage=storage,
    max_l1_items=1000,      # Max items in memory
    l1_ttl=300              # 5 minute TTL
)

# Use like normal storage
cache.set("key", {"data": "value"})
data = cache.get("key")

# View cache stats
stats = cache.get_cache_stats()
print(f"L1 utilization: {stats['l1_utilization_percent']:.1f}%")
```

## File Structure

```
modules/context/
├── __init__.py           # Module initialization
├── manager.py            # ContextManager class
├── snapshot.py           # SnapshotManager class
├── storage.py            # ContextStorage & backends
├── requirements.txt      # Dependencies
├── README.md            # This file
├── agents/              # Context management agents
├── data/                # Default data directory
├── runtime/             # Runtime scripts
└── workflows/           # Context workflows
```

## Use Cases

1. **Session Management**: Track AI session context across multiple conversations
2. **Project Memory**: Maintain project knowledge and decisions
3. **Snapshot Recovery**: Rollback to previous states before major changes
4. **Semantic Search**: Find relevant context using semantic similarity
5. **Multi-level Caching**: Optimize performance with intelligent caching
6. **Portable Context**: Export/import context for backup or sharing

## Performance Tips

1. **Use CacheLayer**: Enable two-level caching for frequently accessed data
2. **Adjust max_size_mb**: Tune based on available memory
3. **Enable compression**: Save disk space with gzip compression
4. **Use hash sharding**: FileSystemBackend automatically shards for performance
5. **Set appropriate TTLs**: Use TTL to automatically expire stale data
6. **Monitor cache stats**: Regularly check cache utilization

## Error Handling

All modules include comprehensive error handling:

- Failed operations return `False` or `None`
- Errors are logged with descriptive messages
- Thread-safe operations prevent race conditions
- Graceful degradation for optional features

## License

MIT License - See LICENSE file for details

## Contributing

Contributions welcome! Please read CONTRIBUTING.md for guidelines.

## Support

For issues and questions:
- GitHub: https://github.com/Lordsisodia/blackbox3
- Documentation: See `.docs/` directory
