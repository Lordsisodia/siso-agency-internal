#!/usr/bin/env python3
"""
Context Extraction Demo

This script demonstrates the usage of the ContextExtractor
for extracting relevant context before task planning.
"""

import asyncio
from pathlib import Path
import sys

# Add engine to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'engine'))

from core.context_extractor import ContextExtractor


async def main():
    """Run context extraction demo."""

    # Initialize the extractor
    print("Initializing ContextExtractor...")
    extractor = ContextExtractor(
        codebase_path=Path(__file__).parent.parent / 'engine' / 'core',
        docs_path=Path(__file__).parent.parent / 'docs',
        max_context_tokens=10000,
        max_files=10,
        max_docs=5
    )
    print("✓ ContextExtractor initialized\n")

    # Example 1: Basic context extraction
    print("=" * 70)
    print("EXAMPLE 1: Basic Context Extraction")
    print("=" * 70)

    task_description = "Add JWT authentication to the API endpoints"

    print(f"\nTask: {task_description}\n")

    context = await extractor.extract_context(
        task_id="demo-001",
        task_description=task_description
    )

    print(f"Extracted Keywords: {', '.join(context.keywords[:10])}")
    print(f"Files Found: {len(context.relevant_files)}")
    print(f"Docs Found: {len(context.relevant_docs)}")
    print(f"Total Tokens: {context.total_tokens:,}")
    print(f"Extraction Time: {context.extraction_time:.3f}s")

    # Example 2: With conversation history
    print("\n" + "=" * 70)
    print("EXAMPLE 2: Context with Conversation History")
    print("=" * 70)

    conversation = [
        {"role": "user", "content": "We need to implement rate limiting"},
        {"role": "assistant", "content": "I can help with that. Which endpoints need rate limiting?"},
        {"role": "user", "content": "Focus on the API authentication endpoints"},
        {"role": "assistant", "content": "I'll add rate limiting to the AuthService class"}
    ]

    task_description_2 = "Implement rate limiting for authentication endpoints"

    print(f"\nTask: {task_description_2}\n")
    print("Conversation:")
    for msg in conversation:
        print(f"  {msg['role']}: {msg['content']}")

    print()

    context2 = await extractor.extract_context(
        task_id="demo-002",
        task_description=task_description_2,
        conversation_history=conversation
    )

    print(f"\nExtracted Keywords: {', '.join(context2.keywords[:10])}")
    print(f"Files Found: {len(context2.relevant_files)}")
    print(f"Docs Found: {len(context2.relevant_docs)}")

    if context2.conversation_context:
        print(f"Conversation Context: {context2.conversation_context.summary[:100]}...")

    # Example 3: LLM-formatted output
    print("\n" + "=" * 70)
    print("EXAMPLE 3: LLM-Formatted Context")
    print("=" * 70)

    llm_prompt = extractor.format_context_for_llm(context)
    print("\n" + llm_prompt[:500] + "...\n")

    # Example 4: Compact format
    print("=" * 70)
    print("EXAMPLE 4: Compact Format")
    print("=" * 70)

    compact = extractor.format_context_compact(context2)
    print("\n" + compact + "\n")

    # Example 5: Serialization
    print("=" * 70)
    print("EXAMPLE 5: Serialization")
    print("=" * 70)

    # Serialize
    data = context.to_dict()
    print(f"\nSerialized context keys: {list(data.keys())}")
    print(f"Task ID: {data['task_id']}")
    print(f"Number of files: {len(data['relevant_files'])}")

    # Deserialize
    restored = context.__class__.from_dict(data)
    print(f"\nRestored context:")
    print(f"  Task ID: {restored.task_id}")
    print(f"  Files: {len(restored.relevant_files)}")
    print(f"  Docs: {len(restored.relevant_docs)}")

    print("\n" + "=" * 70)
    print("DEMO COMPLETE")
    print("=" * 70)
    print("\nThe ContextExtractor successfully extracted relevant context from:")
    print("  • Codebase files")
    print("  • Documentation")
    print("  • Conversation history")
    print("\nThis context can now be used for better task planning!")


if __name__ == "__main__":
    asyncio.run(main())
