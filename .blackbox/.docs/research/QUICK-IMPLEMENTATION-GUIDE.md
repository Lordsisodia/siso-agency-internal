# Blackbox4 Memory Upgrade - Quick Implementation Guide

## TL;DR Decision Matrix

| Need | Recommendation | Quality | Cost | Setup Time |
|------|----------------|---------|------|------------|
| **Best Overall** | GLM Embedding-3 | 8/10 | $0.07/1M | 5 min |
| **Best Quality** | E5-large-v2 | 9.5/10 | Free | 10 min |
| **Multilingual** | BGE-M3 | 9/10 | Free | 15 min |
| **Long Context** | Nomic Embed v1 | 8.5/10 | Free | 5 min |
| **Fastest** | all-MiniLM-L6-v2 | 5/10 | Free | 2 min |

---

## 5-Minute Setup: GLM Embedding-3 (Recommended)

### Step 1: Install SDK

```bash
pip install zhipuai
```

### Step 2: Set API Key

```bash
export ZHIPUAI_API_KEY="your-api-key-here"
```

### Step 3: Use It

```python
from zhipuai import ZhipuAI

client = ZhipuAI(api_key="your-api-key")

# Single embedding
response = client.embeddings.create(
    model="embedding-3",
    input="Blackbox4 memory system",
    dimensions=1024
)

embedding = response.data[0].embedding
print(f"Dimension: {len(embedding)}")  # 1024

# Batch (up to 64 texts)
response = client.embeddings.create(
    model="embedding-3",
    input=["text1", "text2", "text3"],
    dimensions=1024
)
```

---

## 10-Minute Setup: Local Models (Free)

### Option A: Nomic Embed v1 (Recommended - Fast + Good Quality)

```bash
pip install sentence-transformers
```

```python
from sentence_transformers import SentenceTransformer

# Auto-downloads model (400MB)
model = SentenceTransformer('nomic-ai/nomic-embed-text-v1')

# Use it
embedding = model.encode("Your text here", normalize_embeddings=True)
print(f"Dimension: {len(embedding)}")  # 768
```

### Option B: E5-large-v2 (Best Quality - English)

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('intfloat/e5-large-v2')

# Note: Add "query: " or "passage: " prefix
text = "query: Your text here"
embedding = model.encode(text, normalize_embeddings=True)
print(f"Dimension: {len(embedding)}")  # 1024
```

### Option C: BGE-M3 (Best Multilingual)

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('BAAI/bge-m3')

embedding = model.encode("Your text here", normalize_embeddings=True)
print(f"Dimension: {len(embedding)}")  # 1024
```

---

## Cost Comparison

### Scenario: Embed 1M documents (avg 100 tokens each)

| Provider | Cost | Time (API) | Time (Local) |
|----------|------|------------|--------------|
| **GLM** | **$0.70** | ~2 hours | - |
| OpenAI | $10.00 | ~2 hours | - |
| Cohere | $10.00 | ~2 hours | - |
| **Local** | **$0.00** | - | ~10 hours (CPU) / ~1 hour (GPU) |

**Savings with GLM**: 14x cheaper than OpenAI!

---

## Recommended Implementation for Blackbox4

### Phase 1: Quick Start (Day 1)

```python
# File: blackbox4/memory/embeddings.py

from sentence_transformers import SentenceTransformer

class EmbeddingEngine:
    def __init__(self):
        # Start with Nomic (fast, good quality, free)
        self.model = SentenceTransformer('nomic-ai/nomic-embed-text-v1')
        self.dimension = 768

    def embed(self, text: str) -> list:
        return self.model.encode(text, normalize_embeddings=True).tolist()

    def embed_batch(self, texts: list) -> list:
        return self.model.encode(texts, normalize_embeddings=True).tolist()

# Usage
engine = EmbeddingEngine()
embedding = engine.embed("Blackbox4 semantic search")
```

### Phase 2: Add GLM API (Week 1)

```python
# File: blackbox4/memory/embeddings_hybrid.py

import os
from zhipuai import ZhipuAI
from sentence_transformers import SentenceTransformer

class HybridEmbedding:
    def __init__(self):
        # GLM API
        self.api_key = os.getenv("ZHIPUAI_API_KEY")
        if self.api_key:
            self.api_client = ZhipuAI(api_key=self.api_key)

        # Local fallback
        self.local_model = SentenceTransformer('nomic-ai/nomic-embed-text-v1')

    def embed(self, text: str, use_api: bool = True) -> list:
        # Try API first
        if use_api and self.api_key:
            try:
                response = self.api_client.embeddings.create(
                    model="embedding-3",
                    input=text,
                    dimensions=1024
                )
                return response.data[0].embedding
            except:
                pass  # Fall back to local

        # Local fallback
        return self.local_model.encode(text, normalize_embeddings=True).tolist()

# Usage
engine = HybridEmbedding()

# Production (API)
embedding = engine.embed("production query", use_api=True)

# Development (Local)
embedding = engine.embed("test query", use_api=False)
```

### Phase 3: Add Vector Database (Week 2)

```bash
pip install chromadb
```

```python
# File: blackbox4/memory/semantic_memory.py

import chromadb
from chromadb.config import Settings

class SemanticMemory:
    def __init__(self, embedding_engine):
        self.engine = embedding_engine
        self.client = chromadb.PersistentClient(
            path="./.blackbox4/.memory/vector_db",
            settings=Settings(anonymized_telemetry=False)
        )
        self.collection = self.client.get_or_create_collection(
            name="blackbox4_memories",
            metadata={"hnsw:space": "cosine"}
        )

    def add(self, text: str, metadata: dict = None) -> str:
        import hashlib
        memory_id = hashlib.sha256(text.encode()).hexdigest()[:16]

        embedding = self.engine.embed(text)

        self.collection.add(
            ids=[memory_id],
            embeddings=[embedding],
            documents=[text],
            metadatas=[metadata or {}]
        )
        return memory_id

    def search(self, query: str, n_results: int = 5) -> list:
        query_embedding = self.engine.embed(query)

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )

        return [
            {
                "id": results["ids"][0][i],
                "text": results["documents"][0][i],
                "score": results["distances"][0][i],
                "metadata": results["metadatas"][0][i]
            }
            for i in range(len(results["ids"][0]))
        ]

# Usage
from blackbox4.memory.embeddings_hybrid import HybridEmbedding

engine = HybridEmbedding()
memory = SemanticMemory(engine)

# Store
memory.add("Blackbox4 uses GLM embeddings for semantic search")

# Search
results = memory.search("search system")
for r in results:
    print(f"[{r['score']:.3f}] {r['text']}")
```

---

## Performance Quick Reference

### Latency (Single Text)

| Model | CPU | GPU | API |
|-------|-----|-----|-----|
| Nomic v1 | ~50ms | ~16ms | ~100ms |
| E5-large | ~150ms | ~40ms | N/A |
| BGE-M3 | ~200ms | ~50ms | N/A |
| MiniLM | ~20ms | ~5ms | N/A |
| GLM API | N/A | N/A | ~100-200ms |

### Quality (MTEB Benchmark)

| Model | English | Multilingual | Retrieval |
|-------|---------|--------------|-----------|
| E5-large | 9.5/10 | 8/10 | 9.5/10 |
| BGE-M3 | 8.5/10 | 9/10 | 9/10 |
| Nomic v1 | 8/10 | 7/10 | 8.5/10 |
| GLM-3 | 8/10 | 8.5/10 | 8/10 |
| MiniLM | 5/10 | 4/10 | 5/10 |

---

## Key Recommendations

### For Blackbox4:

1. **Start**: Nomic Embed v1 (free, fast, good quality)
2. **Scale**: Add GLM API ($0.07/1M tokens)
3. **Optimize**: Hybrid approach (API + local fallback)
4. **Enhance**: Add ChromaDB for vector storage

### Cost Optimization:

- Development: Use local models (free)
- Production: Use GLM API ($0.70 for 1M docs)
- Hybrid: 50% local, 50% API = ~$0.35 for 1M docs

### Quality Optimization:

- English content: E5-large-v2
- Multilingual: BGE-M3
- Long documents: Nomic Embed v1 (8K tokens)
- Production: GLM Embedding-3 (reliable, scalable)

---

## Installation Commands

```bash
# Option 1: Local only (free)
pip install sentence-transformers chromadb

# Option 2: GLM API only
pip install zhipuai chromadb

# Option 3: Hybrid (recommended)
pip install sentence-transformers zhipuai chromadb

# Set API key for hybrid
export ZHIPUAI_API_KEY="your-key-here"
```

---

## Get GLM API Key

1. Visit: https://open.bigmodel.cn/
2. Register/Login
3. Go to Console → API Keys
4. Create new API key
5. Set environment variable: `export ZHIPUAI_API_KEY="your-key"`

**Pricing**: 0.5 RMB ($0.07 USD) per million tokens

---

## Next Steps

1. **Day 1**: Install and test Nomic Embed v1
2. **Day 2**: Add ChromaDB for persistent storage
3. **Day 3**: Get GLM API key and test API
4. **Day 4**: Implement hybrid system
5. **Day 5**: Deploy and benchmark

---

## Support & Resources

- **GLM Docs**: https://docs.bigmodel.cn/
- **MTEB Leaderboard**: https://huggingface.co/spaces/mteb/leaderboard
- **Full Research**: See `BLACKBOX4-MEMORY-SYSTEM-UPGRADE.md`

---

**Quick Reference Card**

```
┌─────────────────────────────────────────────────────────┐
│  EMBEDDING MODEL QUICK GUIDE                            │
├─────────────────────────────────────────────────────────┤
│  SPEED:     MiniLM > Nomic > E5 > BGE-M3                │
│  QUALITY:   E5 > BGE-M3 > GLM > Nomic > MiniLM          │
│  COST:      Local (free) > GLM ($0.07/M) > OpenAI ($1)  │
│  CONTEXT:   BGE-M3 (8K) = Nomic (8K) > E5 (512)         │
│  LANGUAGES: BGE-M3 (100+) > E5 > GLM > Nomic            │
├─────────────────────────────────────────────────────────┤
│  RECOMMENDED:                                           │
│  - Start: Nomic Embed v1                                │
│  - Scale: GLM Embedding-3                               │
│  - Hybrid: Both with fallback                           │
└─────────────────────────────────────────────────────────┘
```
