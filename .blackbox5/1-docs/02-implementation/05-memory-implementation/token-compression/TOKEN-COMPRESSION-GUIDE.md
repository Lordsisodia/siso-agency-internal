# Token Compression Guide

**Feature:** Automatic token compression for context management
**Status:** Implemented and tested (11/11 tests passing)
**Location:** `engine/core/token_compressor.py`

## Overview

Token compression automatically reduces context size to fit within token limits while preserving important information. This is critical when:

- Agents make multiple tool calls returning large data (e.g., web search)
- Context grows beyond model token limits
- Long-running workflows accumulate context
- Working with large codebases

## Features

### 6 Compression Strategies

1. **Relevance** - Remove least relevant files/docs based on keyword matching
2. **Extractive** - Keep key sentences using extractive summarization
3. **Abstractive** - LLM-based summarization (requires API key)
4. **Code Summary** - Reduce code to function/class signatures
5. **Deduplicate** - Remove duplicate files/docs
6. **Hybrid** - Combine multiple strategies (default)

### Key Components

- **TokenEstimator** - Estimate token count for text/code
- **RelevanceScorer** - Score relevance of context items (0-1)
- **ExtractiveSummarizer** - Extractive text summarization
- **CodeSummarizer** - Code summarization to signatures
- **Deduplicator** - Remove duplicate content
- **TokenCompressor** - Main compression engine

## Usage

### Basic Usage

```python
from core.token_compressor import TokenCompressor, CompressionStrategy
from core.context_extractor import TaskContext

# Create compressor with token limit
compressor = TokenCompressor(max_tokens=8000)

# Compress context
result = compressor.compress(
    task_context=context,
    keywords=["authentication", "security"],
    strategy=CompressionStrategy.HYBRID
)

# Access results
compressed_context = result.compressed_context
print(f"Original: {result.metrics.original_tokens} tokens")
print(f"Compressed: {result.metrics.compressed_tokens} tokens")
print(f"Ratio: {result.metrics.compression_ratio:.1%}")
print(f"Quality: {result.metrics.quality_score:.2f}")
```

### With Context Extractor

```python
from core.context_extractor import ContextExtractor

extractor = ContextExtractor(
    codebase_path="/path/to/code",
    max_context_tokens=8000
)

# Extract and compress in one step
context = await extractor.extract_context_compressed(
    task_id="task_001",
    task_description="Implement authentication",
    max_tokens=8000
)
```

### With GSD Workflow

```python
from core.Orchestrator import AgentOrchestrator

# Create orchestrator with token compression enabled
orchestrator = AgentOrchestrator(
    agents=agents,
    enable_token_compression=True,  # Enable compression
    max_tokens_per_task=8000  # Token limit per task
)

# Token compression is automatically applied during wave execution
result = await orchestrator.execute_wave_based(tasks)
```

## Compression Strategies

### Relevance-Based Pruning

Removes least relevant files/docs based on keyword matching.

```python
result = compressor.compress(
    context,
    keywords=["auth", "security"],
    strategy=CompressionStrategy.RELEVANCE
)
```

**Best for:** Reducing context when some items are clearly irrelevant

### Extractive Summarization

Keeps key sentences using extractive summarization.

```python
result = compressor.compress(
    context,
    keywords=["auth"],
    strategy=CompressionStrategy.EXTRACTIVE
)
```

**Best for:** Long text documents, summaries

### Abstractive Summarization

Uses LLM to rewrite content more concisely.

```python
result = compressor.compress(
    context,
    keywords=["auth"],
    strategy=CompressionStrategy.ABSTRACTIVE
)
```

**Best for:** Severe compression needs, requires LLM API

**Note:** Requires `OPENAI_API_KEY` or similar env variable

### Code Summarization

Reduces code to function/class signatures.

```python
result = compressor.compress(
    context,
    keywords=["auth"],
    strategy=CompressionStrategy.CODE_SUMMARY
)
```

**Best for:** Large code files, preserves structure

### Deduplication

 Removes duplicate files/docs.

```python
result = compressor.compress(
    context,
    keywords=[],
    strategy=CompressionStrategy.DEDUPLICATE
)
```

**Best for:** Removing redundant content

### Hybrid (Recommended)

Combines multiple strategies for optimal compression.

```python
result = compressor.compress(
    context,
    keywords=["auth"],
    strategy=CompressionStrategy.HYBRID
)
```

**Process:**
1. Deduplicate
2. Relevance pruning
3. Code summarization
4. Extractive summarization
5. Repeat until under limit

**Best for:** Aggressive compression with quality preservation

## Compression Result

The `CompressionResult` contains:

```python
@dataclass
class CompressionResult:
    compressed_context: TaskContext  # Compressed context
    metrics: CompressionMetrics  # Compression statistics
    warnings: List[str]  # Any warnings

@dataclass
class CompressionMetrics:
    original_tokens: int  # Original token count
    compressed_tokens: int  # Compressed token count
    compression_ratio: float  # Compressed/Original ratio
    items_removed: int  # Number of items removed
    items_kept: int  # Number of items kept
    quality_score: float  # Quality score (0-1)
    strategy_used: CompressionStrategy  # Strategy used
```

## Configuration

### Token Limits

```python
# Set different limits for different use cases
compressor = TokenCompressor(max_tokens=4000)  # For smaller models
compressor = TokenCompressor(max_tokens=8000)  # For medium models
compressor = TokenCompressor(max_tokens=32000)  # For larger models
```

### Quality Thresholds

```python
# Get warnings if quality is low
result = compressor.compress(context, keywords, strategy)
if result.metrics.quality_score < 0.3:
    print(f"Warning: Low quality score {result.metrics.quality_score}")
```

## Integration Points

### Orchestrator Integration

Token compression is integrated into `AgentOrchestrator` wave execution:

```python
# In Orchestrator.py, around line 1267
if self.enable_token_compression and wave_tasks:
    wave_context = await extractor.extract_context_compressed(
        task_id=f"{workflow_id}_wave{wave_num}",
        task_description=wave_description,
        max_tokens=self.max_tokens_per_task
    )
```

### Context Extractor Integration

```python
# In context_extractor.py
async def extract_context_compressed(
    self,
    task_id: str,
    task_description: str,
    max_tokens: int = 8000
) -> TaskContext:
    """Extract and compress context to fit within token limits"""
    context = await self.extract_context(task_id, task_description)
    compressor = TokenCompressor(max_tokens=max_tokens)
    result = compressor.compress(context, keywords=context.keywords)
    return result.compressed_context
```

## Examples

### Example 1: Compress Large Codebase

```python
from core.context_extractor import ContextExtractor

extractor = ContextExtractor(
    codebase_path="/path/to/large/codebase",
    max_context_tokens=8000
)

# This will extract and compress to 8000 tokens
context = await extractor.extract_context_compressed(
    task_id="task_001",
    task_description="Add authentication to API",
    max_tokens=8000
)

print(f"Files: {len(context.relevant_files)}")
print(f"Docs: {len(context.relevant_docs)}")
print(f"Tokens: {context.total_tokens}")
```

### Example 2: Manual Compression

```python
from core.token_compressor import TokenCompressor

compressor = TokenCompressor(max_tokens=2000)

# Assume we have a large context
original_tokens = 15000
result = compressor.compress(
    large_context,
    keywords=["api", "endpoint"],
    strategy=CompressionStrategy.HYBRID
)

print(f"Compressed from {original_tokens} to {result.metrics.compressed_tokens}")
print(f"Ratio: {result.metrics.compression_ratio:.1%}")
```

### Example 3: GSD Workflow with Compression

```python
from core.Orchestrator import AgentOrchestrator

orchestrator = AgentOrchestrator(
    agents={
        "developer": developer_agent,
        "tester": tester_agent,
    },
    enable_token_compression=True,  # Enable compression
    max_tokens_per_task=8000
)

tasks = [
    GSDTask(
        agent_type="developer",
        task="Implement authentication API",
        depends_on=[]
    ),
    GSDTask(
        agent_type="tester",
        task="Write tests for authentication API",
        depends_on=["developer"]
    ),
]

# Token compression automatically applied during execution
result = await orchestrator.execute_wave_based(tasks)
```

## Performance

### Compression Ratios

Typical compression ratios by strategy:

- Relevance: 20-40% reduction
- Extractive: 30-50% reduction
- Code Summary: 60-80% reduction
- Deduplicate: 10-30% reduction
- Hybrid: 70-90% reduction

### Quality Scores

Quality scores indicate how much important information was preserved:

- 0.9-1.0: Excellent (minimal information loss)
- 0.7-0.9: Good (some loss but acceptable)
- 0.5-0.7: Fair (moderate information loss)
- 0.3-0.5: Poor (significant information loss)
- 0.0-0.3: Very poor (consider reviewing)

## Troubleshooting

### Low Quality Score

**Problem:** Quality score < 0.3

**Solutions:**
- Use less aggressive strategy
- Increase max_tokens limit
- Review keywords to ensure they match important content
- Consider manual review of compressed context

### No Compression Applied

**Problem:** compression_ratio == 1.0

**Solutions:**
- Check if context is already under token limit
- Verify keywords are relevant to content
- Try more aggressive strategy

### Important Content Removed

**Problem:** Critical information lost during compression

**Solutions:**
- Add more specific keywords
- Use different strategy (e.g., CODE_SUMMARY for code)
- Increase max_tokens limit
- Use RELEVANCE strategy with better keywords

## Testing

Run the test suite:

```bash
python3 tests/test_token_compression.py
```

Expected output:
```
Tests passed: 11/11 (100.0%)
Tests failed: 0/11

🎉 ALL TOKEN COMPRESSION TESTS PASSED!
```

## References

- Implementation: `engine/core/token_compressor.py`
- Tests: `tests/test_token_compression.py`
- Context Extractor: `engine/core/context_extractor.py`
- Orchestrator: `engine/core/Orchestrator.py`
- Framework Analysis: `docs/FRAMEWORK-FEATURES-ANALYSIS.md`
