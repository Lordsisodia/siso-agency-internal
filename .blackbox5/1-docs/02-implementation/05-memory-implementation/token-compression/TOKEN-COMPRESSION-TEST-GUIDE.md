# Token Compression Testing Guide

## Quick Test

Run the comprehensive test suite:

```bash
python3 tests/test_token_compression.py
```

Expected output:
```
================================================================================
🧪 TOKEN COMPRESSION TEST SUITE
================================================================================
...
Tests passed: 11/11 (100.0%)
Tests failed: 0/11

🎉 ALL TOKEN COMPRESSION TESTS PASSED!
================================================================================
```

## Real-World Testing

### Test 1: Large Codebase Compression

Create a test script:

```bash
cat > test_compression_real.py << 'EOF'
#!/usr/bin/env python3
"""Test token compression on real codebase"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "engine"))

from core.context_extractor import ContextExtractor

async def test_real_codebase():
    """Test compression on actual BlackBox5 codebase"""

    extractor = ContextExtractor(
        codebase_path=Path(__file__).parent,
        max_context_tokens=500  # Very small to force compression
    )

    # Extract context for a real task
    context = await extractor.extract_context_compressed(
        task_id="test_001",
        task_description="Add authentication to the orchestrator with token compression support",
        max_tokens=500
    )

    print(f"✅ Compression successful!")
    print(f"   Files: {len(context.relevant_files)}")
    print(f"   Docs: {len(context.relevant_docs)}")
    print(f"   Tokens: {context.total_tokens}")
    print(f"   Under limit: {context.total_tokens <= 500}")

    return context

if __name__ == "__main__":
    asyncio.run(test_real_codebase())
EOF

python3 test_compression_real.py
```

### Test 2: GSD Workflow with Compression

```bash
cat > test_gsd_compression.py << 'EOF'
#!/usr/bin/env python3
"""Test GSD workflow with token compression"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "engine"))

from core.Orchestrator import AgentOrchestrator, GSDTask
from core.agents.BaseAgent import BaseAgent

# Create a simple test agent
class TestAgent(BaseAgent):
    async def process(self, task, context):
        return f"Processed: {task}"

async def test_gsd_with_compression():
    """Test GSD execution with token compression"""

    # Create agents
    agents = {
        "developer": TestAgent(
            name="Developer",
            role="Code generation"
        ),
        "tester": TestAgent(
            name="Tester",
            role="Testing"
        ),
    }

    # Create orchestrator with compression enabled
    orchestrator = AgentOrchestrator(
        agents=agents,
        enable_token_compression=True,
        max_tokens_per_task=1000  # Force compression
    )

    # Define tasks
    tasks = [
        GSDTask(
            agent_type="developer",
            task="Implement authentication function",
            depends_on=[]
        ),
        GSDTask(
            agent_type="tester",
            task="Write tests for authentication",
            depends_on=["developer"]
        ),
    ]

    # Execute with compression
    result = await orchestrator.execute_wave_based(tasks)

    print(f"✅ GSD with compression complete!")
    print(f"   Tasks completed: {len(result.completed_tasks)}")
    print(f"   Waves executed: {result.metadata.get('waves_executed', 'N/A')}")
    print(f"   Total time: {result.metadata.get('total_time_seconds', 'N/A')}s")

    return result

if __name__ == "__main__":
    asyncio.run(test_gsd_with_compression())
EOF

python3 test_gsd_compression.py
```

### Test 3: Manual Compression Test

```bash
cat > test_manual_compression.py << 'EOF'
#!/usr/bin/env python3
"""Manual compression test"""

import sys
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent / "engine"))

from core.token_compressor import TokenCompressor, CompressionStrategy
from core.context_extractor import TaskContext, FileContext

def test_manual_compression():
    """Test compression with manually created context"""

    # Create large context
    files = []
    for i in range(20):
        file = FileContext(
            file_path=f"module_{i}.py",
            language="python",
            relevant_lines=[
                f"{j}: def function_{j}():" for j in range(50)
            ],
            summary=f"Module {i} with authentication and security features",
            size_bytes=5000,
            last_modified=datetime.now()
        )
        files.append(file)

    context = TaskContext(
        task_id="manual_test",
        task_description="Test compression with many files",
        relevant_files=files,
        relevant_docs=[],
        conversation_context=None,
        total_tokens=50000,
        extraction_time=1.0,
        sources_searched=20,
        keywords=["authentication", "security"]
    )

    # Test each strategy
    strategies = [
        CompressionStrategy.RELEVANCE,
        CompressionStrategy.EXTRACTIVE,
        CompressionStrategy.CODE_SUMMARY,
        CompressionStrategy.DEDUPLICATE,
        CompressionStrategy.HYBRID,
    ]

    print("\n🔢 Testing compression strategies:")
    print("=" * 60)

    for strategy in strategies:
        compressor = TokenCompressor(max_tokens=1000)
        result = compressor.compress(context, ["auth", "security"], strategy)

        print(f"\n{strategy.value}:")
        print(f"  Original: {result.metrics.original_tokens} tokens")
        print(f"  Compressed: {result.metrics.compressed_tokens} tokens")
        print(f"  Ratio: {result.metrics.compression_ratio:.1%}")
        print(f"  Quality: {result.metrics.quality_score:.2f}")

if __name__ == "__main__":
    test_manual_compression()
EOF

python3 test_manual_compression.py
```

### Test 4: Integration Test

Test that compression integrates properly with the orchestrator:

```bash
cat > test_integration.py << 'EOF'
#!/usr/bin/env python3
"""Integration test for token compression"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "engine"))

from core.token_compressor import TokenCompressor, TokenEstimator

def test_token_estimator():
    """Test token estimation"""
    print("\n🔢 Token Estimator Test")
    print("-" * 40)

    tests = [
        ("Python code", "def hello():\n    print('world')", "python"),
        ("JavaScript", "function hello() { console.log('world'); }", "javascript"),
        ("Markdown", "# Header\n\nSome text here", "markdown"),
        ("Plain text", "Hello world, this is a test", "default"),
    ]

    for name, text, lang in tests:
        tokens = TokenEstimator.estimate(text, lang)
        print(f"✅ {name}: {tokens} tokens")

def test_compression_flow():
    """Test full compression flow"""
    print("\n🔄 Compression Flow Test")
    print("-" * 40)

    compressor = TokenCompressor(max_tokens=100)

    # Test that compressor is properly configured
    assert compressor.max_tokens == 100, "Max tokens not set correctly"
    assert compressor.target_tokens == 90, "Target tokens should be 90% of max"
    print("✅ Compressor configured correctly")

    # Test strategy enum
    from core.token_compressor import CompressionStrategy
    strategies = [s.value for s in CompressionStrategy]
    expected = ["relevance", "extractive", "abstractive", "code_summary", "deduplicate", "hybrid"]
    assert strategies == expected, f"Strategies mismatch: {strategies}"
    print(f"✅ All {len(strategies)} strategies available")

if __name__ == "__main__":
    test_token_estimator()
    test_compression_flow()
    print("\n✅ All integration tests passed!")
EOF

python3 test_integration.py
```

## Test All Compression Strategies

```bash
cat > test_all_strategies.py << 'EOF'
#!/usr/bin/env python3
"""Test all compression strategies"""

import sys
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent / "engine"))

from core.token_compressor import (
    TokenCompressor,
    CompressionStrategy,
    TokenEstimator,
    RelevanceScorer,
    ExtractiveSummarizer,
    CodeSummarizer,
    Deduplicator
)
from core.context_extractor import TaskContext, FileContext

def test_all_components():
    """Test all compression components"""

    print("\n" + "="*80)
    print("🧪 COMPREHENSIVE COMPRESSION TEST")
    print("="*80)

    # Test 1: Token Estimator
    print("\n1️⃣ Token Estimator")
    print("-" * 40)
    text = "def authenticate(username, password): return user"
    tokens = TokenEstimator.estimate(text, "python")
    print(f"✅ Estimated {tokens} tokens for Python code")

    # Test 2: Relevance Scorer
    print("\n2️⃣ Relevance Scorer")
    print("-" * 40)
    scorer = RelevanceScorer()
    file = FileContext(
        file_path="auth.py",
        language="python",
        relevant_lines=["def authenticate(): pass"],
        summary="Authentication module",
        size_bytes=1000,
        last_modified=datetime.now()
    )
    score = scorer.score_file_context(file, ["auth", "security"])
    print(f"✅ Relevance score: {score:.2f}")

    # Test 3: Extractive Summarizer
    print("\n3️⃣ Extractive Summarizer")
    print("-" * 40)
    summarizer = ExtractiveSummarizer(max_sentences=2)
    text = "Authentication is critical. Security is important. Testing helps quality."
    summary = summarizer.summarize_text(text, ["authentication"])
    print(f"✅ Summary: '{summary}' ({len(summary)} chars)")

    # Test 4: Code Summarizer
    print("\n4️⃣ Code Summarizer")
    print("-" * 40)
    code_summarizer = CodeSummarizer()
    code = "def auth(): pass\n\ndef login(): pass\n\n# More comments..."
    summary = code_summarizer.summarize_code(code, "python")
    print(f"✅ Code summary: {len(summary.split(chr(10)))} lines")

    # Test 5: Deduplicator
    print("\n5️⃣ Deduplicator")
    print("-" * 40)
    dedup = Deduplicator()
    files = [
        FileContext(
            file_path="auth.py",
            language="python",
            relevant_lines=["def auth(): pass"],
            summary="Auth",
            size_bytes=100,
            last_modified=datetime.now()
        ),
        FileContext(  # Duplicate
            file_path="auth.py",
            language="python",
            relevant_lines=["def auth(): pass"],
            summary="Auth",
            size_bytes=100,
            last_modified=datetime.now()
        ),
    ]
    deduplicated = dedup.deduplicate_file_contexts(files)
    print(f"✅ Deduplicated: {len(files)} -> {len(deduplicated)} files")

    # Test 6: Full Compression
    print("\n6️⃣ Full Compression")
    print("-" * 40)
    compressor = TokenCompressor(max_tokens=500)

    context = TaskContext(
        task_id="test",
        task_description="Test compression",
        relevant_files=[
            FileContext(
                file_path=f"file_{i}.py",
                language="python",
                relevant_lines=[f"{j}: Line {j}" for j in range(50)],
                summary=f"File {i}",
                size_bytes=2000,
                last_modified=datetime.now()
            )
            for i in range(10)
        ],
        relevant_docs=[],
        conversation_context=None,
        total_tokens=10000,
        extraction_time=1.0,
        sources_searched=10,
        keywords=["test"]
    )

    result = compressor.compress(context, ["test"], CompressionStrategy.HYBRID)
    print(f"✅ Compressed: {result.metrics.original_tokens} -> {result.metrics.compressed_tokens} tokens")
    print(f"✅ Compression ratio: {result.metrics.compression_ratio:.1%}")
    print(f"✅ Quality score: {result.metrics.quality_score:.2f}")

    print("\n" + "="*80)
    print("✅ ALL COMPONENTS TESTED SUCCESSFULLY")
    print("="*80 + "\n")

if __name__ == "__main__":
    test_all_components()
EOF

python3 test_all_strategies.py
```

## Performance Test

Test compression performance on large contexts:

```bash
cat > test_performance.py << 'EOF'
#!/usr/bin/env python3
"""Performance test for token compression"""

import time
import sys
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent / "engine"))

from core.token_compressor import TokenCompressor, CompressionStrategy
from core.context_extractor import TaskContext, FileContext

def create_large_context(num_files=100, lines_per_file=100):
    """Create a large context for performance testing"""
    files = []
    for i in range(num_files):
        file = FileContext(
            file_path=f"module_{i}.py",
            language="python",
            relevant_lines=[f"{j}: def function_{j}(): return {j}" for j in range(lines_per_file)],
            summary=f"Module {i} with authentication features",
            size_bytes=10000,
            last_modified=datetime.now()
        )
        files.append(file)

    return TaskContext(
        task_id="perf_test",
        task_description="Performance test",
        relevant_files=files,
        relevant_docs=[],
        conversation_context=None,
        total_tokens=1000000,
        extraction_time=1.0,
        sources_searched=num_files,
        keywords=["authentication"]
    )

def test_performance():
    """Test compression performance"""

    print("\n" + "="*80)
    print("⚡ PERFORMANCE TEST")
    print("="*80)

    test_cases = [
        (10, 50, "Small"),
        (50, 100, "Medium"),
        (100, 200, "Large"),
    ]

    for num_files, lines_per_file, size in test_cases:
        print(f"\n{size} Context: {num_files} files, {lines_per_file} lines each")
        print("-" * 40)

        context = create_large_context(num_files, lines_per_file)

        for strategy in [CompressionStrategy.RELEVANCE, CompressionStrategy.HYBRID]:
            compressor = TokenCompressor(max_tokens=5000)

            start = time.time()
            result = compressor.compress(context, ["auth"], strategy)
            elapsed = time.time() - start

            print(f"\n{strategy.value}:")
            print(f"  Time: {elapsed:.2f}s")
            print(f"  Tokens: {result.metrics.original_tokens} -> {result.metrics.compressed_tokens}")
            print(f"  Ratio: {result.metrics.compression_ratio:.1%}")

    print("\n" + "="*80)
    print("✅ PERFORMANCE TEST COMPLETE")
    print("="*80 + "\n")

if __name__ == "__main__":
    test_performance()
EOF

python3 test_performance.py
```

## Verify Integration

Check that compression is integrated into the orchestrator:

```bash
# Verify Orchestrator has compression enabled
grep -n "enable_token_compression" engine/core/Orchestrator.py

# Verify context_extractor has compression method
grep -n "extract_context_compressed" engine/core/context_extractor.py

# Verify token_compressor module exists
ls -lh engine/core/token_compressor.py

# Run tests
python3 tests/test_token_compression.py
```

## Clean Up Test Files

After testing:

```bash
rm -f test_compression_real.py
rm -f test_gsd_compression.py
rm -f test_manual_compression.py
rm -f test_integration.py
rm -f test_all_strategies.py
rm -f test_performance.py
```

## Summary

To test token compression:

1. **Quick test:** `python3 tests/test_token_compression.py`
2. **Real-world test:** Create and run `test_compression_real.py`
3. **GSD integration test:** Create and run `test_gsd_compression.py`
4. **Manual compression test:** Create and run `test_manual_compression.py`
5. **All components test:** Create and run `test_all_strategies.py`
6. **Performance test:** Create and run `test_performance.py`

All tests should pass and show successful compression with good quality scores.
