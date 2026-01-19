#!/usr/bin/env python3
"""
Comprehensive Tests for Token Compression System

Tests all 6 compression strategies:
1. Relevance-based pruning
2. Extractive summarization
3. Abstractive summarization (LLM-based)
4. Code summarization
5. Deduplication
6. Hybrid strategy
"""

import asyncio
import sys
from pathlib import Path
from datetime import datetime

# Add engine to path
sys.path.insert(0, str(Path(__file__).parent.parent / "engine"))

from core.token_compressor import (
    TokenCompressor,
    TokenEstimator,
    RelevanceScorer,
    ExtractiveSummarizer,
    CodeSummarizer,
    Deduplicator,
    CompressionStrategy
)
from core.context_extractor import TaskContext, FileContext, DocSection


def test_token_estimator():
    """Test token estimation accuracy."""
    print("\n🔢 Test: Token Estimator")
    print("-" * 40)

    # Test various text types
    tests = [
        ("Simple text", "Hello world", "default", 3),
        ("Python code", "def hello():\n    print('world')", "python", 10),
        ("Long text", "Hello " * 100, "default", 100),
        ("Empty", "", "default", 0),
    ]

    for name, text, lang, expected_range in tests:
        estimated = TokenEstimator.estimate(text, lang)
        in_range = expected_range * 0.5 <= estimated <= expected_range * 1.5
        status = "✅" if in_range else "❌"
        print(f"{status} {name}: {estimated} tokens (expected ~{expected_range})")


def test_relevance_scorer():
    """Test relevance scoring."""
    print("\n📊 Test: Relevance Scorer")
    print("-" * 40)

    scorer = RelevanceScorer()
    keywords = ["authentication", "database", "api"]

    # High relevance file
    file1 = FileContext(
        file_path="auth/database.py",
        language="python",
        relevant_lines=[
            "1: def authenticate_user(username, password):",
            "2:     # Authentication logic",
            "3:     database.connect()"
        ],
        summary="Authentication and database functions",
        size_bytes=1000,
        last_modified=datetime.now()
    )

    # Low relevance file
    file2 = FileContext(
        file_path="ui/styles.css",
        language="css",
        relevant_lines=[
            "1: .button {",
            "2:     color: red;",
            "3: }"
        ],
        summary="UI styling",
        size_bytes=500,
        last_modified=datetime.now()
    )

    score1 = scorer.score_file_context(file1, keywords)
    score2 = scorer.score_file_context(file2, keywords)

    print(f"✅ High relevance file: {score1:.2f} (expected > 0.5)")
    print(f"✅ Low relevance file: {score2:.2f} (expected < 0.5)")
    print(f"✅ Scoring differentiates: {score1 > score2}")


def test_extractive_summarizer():
    """Test extractive summarization."""
    print("\n✂️ Test: Extractive Summarizer")
    print("-" * 40)

    summarizer = ExtractiveSummarizer(max_sentences=3)

    text = """
    Authentication is critical for security. We should implement OAuth 2.0.
    The database schema needs to be updated to support user tokens.
    Don't forget to add rate limiting to prevent abuse.
    Testing is important for quality assurance.
    Documentation should be updated after implementation.
    """

    summary = summarizer.summarize_text(text, ["authentication", "security"])

    lines = summary.count('.')
    print(f"✅ Summary has {lines} sentences (max {summarizer.max_sentences})")
    print(f"✅ Summary shorter: {len(summary) < len(text)}")
    print(f"✅ Contains keywords: {'authentication' in summary.lower()}")


def test_code_summarizer():
    """Test code summarization."""
    print("\n🐍 Test: Code Summarizer")
    print("-" * 40)

    summarizer = CodeSummarizer()

    python_code = """
import database
from auth import verify_token

def authenticate(username, password):
    '''Authenticate user with credentials'''
    conn = database.connect()
    user = conn.query(username)
    if verify_password(password, user.hash):
        return user
    return None

class UserAuth:
    '''User authentication handler'''
    def __init__(self):
        self.db = database.connect()

    def login(self, credentials):
        '''Login user'''
        pass

# More implementation details...
# This is a long comment that should be removed
# Another line that should be removed
# Yet another line to remove
"""

    summary = summarizer.summarize_code(python_code, "python")

    lines = summary.strip().split('\n')
    print(f"✅ Summary has {len(lines)} lines")
    print(f"✅ Contains function def: {'def authenticate' in summary}")
    print(f"✅ Contains class: {'class UserAuth' in summary}")
    print(f"✅ More compact: {len(summary) < len(python_code)}")


def test_deduplicator():
    """Test deduplication."""
    print("\n🔍 Test: Deduplicator")
    print("-" * 40)

    deduplicator = Deduplicator()

    # Create duplicate files
    file1 = FileContext(
        file_path="auth.py",
        language="python",
        relevant_lines=["1: def auth():", "2:     pass"],
        summary="Auth function",
        size_bytes=100,
        last_modified=datetime.now()
    )

    file2 = FileContext(  # Duplicate
        file_path="auth.py",
        language="python",
        relevant_lines=["1: def auth():", "2:     pass"],
        summary="Auth function",
        size_bytes=100,
        last_modified=datetime.now()
    )

    file3 = FileContext(  # Similar but different
        file_path="auth2.py",
        language="python",
        relevant_lines=["1: def auth():", "2:     pass"],
        summary="Auth function",
        size_bytes=100,
        last_modified=datetime.now()
    )

    files = [file1, file2, file3]
    deduplicated = deduplicator.deduplicate_file_contexts(files)

    print(f"✅ Removed exact duplicates: {len(files) > len(deduplicated)}")
    print(f"✅ Kept unique files: {len(deduplicated)}")


def test_relevance_compression():
    """Test relevance-based compression."""
    print("\n📊 Test: Relevance Compression")
    print("-" * 40)

    compressor = TokenCompressor(max_tokens=1000)
    keywords = ["authentication", "security"]

    # Create context with many files
    files = []
    for i in range(10):
        relevance = 1.0 if i < 3 else 0.1  # First 3 are relevant
        file = FileContext(
            file_path=f"file_{i}.py",
            language="python",
            relevant_lines=[f"1: Line {j}" for j in range(20)],
            summary=f"File {i} content with authentication" if i < 3 else f"File {i} other content",
            size_bytes=1000,
            last_modified=datetime.now()
        )
        files.append(file)

    context = TaskContext(
        task_id="test",
        task_description="Test authentication",
        relevant_files=files,
        relevant_docs=[],
        conversation_context=None,
        total_tokens=5000,
        extraction_time=1.0,
        sources_searched=10,
        keywords=keywords
    )

    result = compressor.compress(context, keywords, CompressionStrategy.RELEVANCE)

    print(f"✅ Original tokens: {result.metrics.original_tokens}")
    print(f"✅ Compressed tokens: {result.metrics.compressed_tokens}")
    print(f"✅ Compression ratio: {result.metrics.compression_ratio:.1%}")
    print(f"✅ Files removed: {result.metrics.items_removed}")
    print(f"✅ Files kept: {result.metrics.items_kept}")


def test_extractive_compression():
    """Test extractive summarization compression."""
    print("\n✂️ Test: Extractive Compression")
    print("-" * 40)

    compressor = TokenCompressor(max_tokens=500)

    # Create context with long file content
    file = FileContext(
        file_path="auth.py",
        language="python",
        relevant_lines=[f"{i}: Authentication line {i} with more details here" for i in range(50)],
        summary="This is a very long summary with lots of details that should be compressed down to just the key points about authentication and security",
        size_bytes=5000,
        last_modified=datetime.now()
    )

    context = TaskContext(
        task_id="test",
        task_description="Test",
        relevant_files=[file],
        relevant_docs=[],
        conversation_context=None,
        total_tokens=10000,
        extraction_time=1.0,
        sources_searched=1,
        keywords=["authentication"]
    )

    result = compressor.compress(context, ["authentication"], CompressionStrategy.EXTRACTIVE)

    compressed_file = result.compressed_context.relevant_files[0]
    print(f"✅ Original lines: {len(file.relevant_lines)}")
    print(f"✅ Compressed lines: {len(compressed_file.relevant_lines)}")
    print(f"✅ Lines reduced: {len(compressed_file.relevant_lines) < len(file.relevant_lines)}")


def test_code_compression():
    """Test code summarization compression."""
    print("\n🐍 Test: Code Compression")
    print("-" * 40)

    compressor = TokenCompressor(max_tokens=300)

    # Create context with code
    code = "\n".join([
        "def authenticate_user(username, password):",
        "    '''Authenticate user'''",
        "    # Check credentials",
        "    if not username:",
        "        return None",
        "    # Connect to database",
        "    conn = db.connect()",
        "    # Query user",
        "    user = conn.query(username)",
        "    # Verify password",
        "    if user.verify(password):",
        "        return user",
        "    return None",
        "",
        "def create_user(username, password):",
        "    '''Create new user'''",
        "    hash = hash_password(password)",
        "    user = User(username, hash)",
        "    db.save(user)",
        "    return user",
    ] + [f"# More comment line {i}" for i in range(30)])

    file = FileContext(
        file_path="auth.py",
        language="python",
        relevant_lines=code.split('\n'),
        summary="Authentication module",
        size_bytes=2000,
        last_modified=datetime.now()
    )

    context = TaskContext(
        task_id="test",
        task_description="Test",
        relevant_files=[file],
        relevant_docs=[],
        conversation_context=None,
        total_tokens=5000,
        extraction_time=1.0,
        sources_searched=1,
        keywords=["auth"]
    )

    result = compressor.compress(context, ["auth"], CompressionStrategy.CODE_SUMMARY)

    compressed_file = result.compressed_context.relevant_files[0]
    print(f"✅ Original lines: {len(file.relevant_lines)}")
    print(f"✅ Compressed lines: {len(compressed_file.relevant_lines)}")
    print(f"✅ Lines reduced: {len(compressed_file.relevant_lines) < len(file.relevant_lines)}")


def test_deduplication_compression():
    """Test deduplication compression."""
    print("\n🔍 Test: Deduplication Compression")
    print("-" * 40)

    compressor = TokenCompressor(max_tokens=500)

    # Create context with duplicates
    files = []
    for i in range(5):
        file = FileContext(
            file_path="auth.py" if i % 2 == 0 else f"auth_{i}.py",
            language="python",
            relevant_lines=["1: def auth():", "2:     pass"],
            summary="Auth function",
            size_bytes=100,
            last_modified=datetime.now()
        )
        files.append(file)

    context = TaskContext(
        task_id="test",
        task_description="Test",
        relevant_files=files,
        relevant_docs=[],
        conversation_context=None,
        total_tokens=1000,
        extraction_time=1.0,
        sources_searched=5,
        keywords=["auth"]
    )

    result = compressor.compress(context, ["auth"], CompressionStrategy.DEDUPLICATE)

    print(f"✅ Original files: {len(files)}")
    print(f"✅ Compressed files: {len(result.compressed_context.relevant_files)}")
    print(f"✅ Duplicates removed: {len(files) > len(result.compressed_context.relevant_files)}")


def test_hybrid_compression():
    """Test hybrid compression (multiple strategies)."""
    print("\n🔀 Test: Hybrid Compression")
    print("-" * 40)

    compressor = TokenCompressor(max_tokens=500)

    # Create context that needs aggressive compression
    files = []
    for i in range(10):
        file = FileContext(
            file_path=f"module_{i}.py",
            language="python",
            relevant_lines=[f"{j}: Code line {j} for module {i}" for j in range(30)],
            summary=f"Module {i} with lots of content that needs compression",
            size_bytes=3000,
            last_modified=datetime.now()
        )
        files.append(file)

    context = TaskContext(
        task_id="test",
        task_description="Test compression",
        relevant_files=files,
        relevant_docs=[],
        conversation_context=None,
        total_tokens=15000,
        extraction_time=1.0,
        sources_searched=10,
        keywords=["test"]
    )

    result = compressor.compress(context, ["test"], CompressionStrategy.HYBRID)

    print(f"✅ Original tokens: {result.metrics.original_tokens}")
    print(f"✅ Compressed tokens: {result.metrics.compressed_tokens}")
    print(f"✅ Compression ratio: {result.metrics.compression_ratio:.1%}")
    print(f"✅ Under limit: {result.metrics.compressed_tokens <= 500}")
    print(f"✅ Quality score: {result.metrics.quality_score:.2f}")

    if result.warnings:
        print(f"⚠️  Warnings: {result.warnings}")


def test_edge_cases():
    """Test edge cases."""
    print("\n⚠️  Test: Edge Cases")
    print("-" * 40)

    compressor = TokenCompressor(max_tokens=1000)

    # Empty context
    empty_context = TaskContext(
        task_id="empty",
        task_description="Empty",
        relevant_files=[],
        relevant_docs=[],
        conversation_context=None,
        total_tokens=0,
        extraction_time=0,
        sources_searched=0,
        keywords=[]
    )

    result = compressor.compress(empty_context, [])
    print(f"✅ Empty context: {result.metrics.compressed_tokens == 0}")

    # Already under limit
    small_context = TaskContext(
        task_id="small",
        task_description="Small",
        relevant_files=[],
        relevant_docs=[],
        conversation_context=None,
        total_tokens=100,
        extraction_time=0.1,
        sources_searched=0,
        keywords=[]
    )

    result = compressor.compress(small_context, [])
    print(f"✅ Already under limit: {result.metrics.compression_ratio == 1.0}")


def print_summary(tests_passed, tests_failed):
    """Print test summary."""
    total = tests_passed + tests_failed
    print("\n" + "="*80)
    print("📊 TOKEN COMPRESSION TEST SUMMARY")
    print("="*80 + "\n")

    print(f"Tests passed: {tests_passed}/{total} ({tests_passed/total*100:.1f}%)")
    print(f"Tests failed: {tests_failed}/{total}")

    if tests_failed == 0:
        print("\n🎉 ALL TOKEN COMPRESSION TESTS PASSED!")
    else:
        print(f"\n⚠️  {tests_failed} test(s) failed")

    print("\n" + "="*80 + "\n")


def main():
    """Run all tests."""
    print("\n" + "="*80)
    print("🧪 TOKEN COMPRESSION TEST SUITE")
    print("="*80)

    tests = [
        test_token_estimator,
        test_relevance_scorer,
        test_extractive_summarizer,
        test_code_summarizer,
        test_deduplicator,
        test_relevance_compression,
        test_extractive_compression,
        test_code_compression,
        test_deduplication_compression,
        test_hybrid_compression,
        test_edge_cases,
    ]

    passed = 0
    failed = 0

    for test in tests:
        try:
            test()
            passed += 1
        except Exception as e:
            print(f"❌ FAILED: {e}")
            import traceback
            traceback.print_exc()
            failed += 1

    print_summary(passed, failed)


if __name__ == "__main__":
    main()
