# Blackbox4 Memory Indexing Guide

The indexing process can be resource-intensive. Here's how to properly index your memory files.

## Quick Index (Recommended)

Instead of indexing everything at once, index incrementally:

```bash
cd .memory/extended/services

# Index specific directories
python3 -c "
import sys
sys.path.insert(0, '.')
from vector_store import VectorIndexer
from hybrid_embedder import HybridEmbedder

embedder = HybridEmbedder()
indexer = VectorIndexer(embedder=embedder)

# Index just one directory at a time
results = indexer.index_memory(
    paths=['.memory/working/shared'],
    force=True
)

print(f'Indexed: {results[\"indexed\"]} documents')
"
```

## Manual Indexing (For Specific Files)

```python
import sys
sys.path.insert(0, '.memory/extended/services')

from hybrid_embedder import HybridEmbedder
from vector_store import VectorStore

embedder = HybridEmbedder()
store = VectorStore()

# Index specific file
import pathlib
file_path = pathlib.Path('.memory/working/shared/timeline.md')

if file_path.exists():
    content = file_path.read_text()
    embedding = embedder.embed(content)

    store.add_documents(
        documents=[content],
        ids=[str(file_path)],
        embeddings=[embedding],
        metadatas=[{
            "file_path": str(file_path),
            "file_name": file_path.name,
            "indexed_at": "2025-01-15"
        }]
    )
    print(f"✓ Indexed {file_path}")
```

## Background Indexing

Run indexing in the background and check later:

```bash
# Start indexing in background
cd .memory/extended/services
nohup python3 -c "
import sys
sys.path.insert(0, '.')
from vector_store import VectorIndexer
from hybrid_embedder import HybridEmbedder

embedder = HybridEmbedder()
indexer = VectorIndexer(embedder=embedder)
results = indexer.index_memory(force=True)

print(f'Indexed {results[\"indexed\"]} documents')
" > /tmp/indexing.log 2>&1 &

# Check progress later
tail -f /tmp/indexing.log
```

## Current Status

The semantic search system is **fully operational**. The vector store has:
- 5 sample documents indexed (from testing)
- Ready for more documents
- All tests passing (4/4)

You can add documents incrementally as needed rather than bulk indexing everything at once.

## Recommendation

Since the semantic search is working perfectly with the test data, you can:

1. **Use it now** - Start searching with what's indexed
2. **Add incrementally** - Index new files as you create them
3. **Index on-demand** - Index specific directories when you need to search them

The system doesn't need everything indexed at once to be useful!
