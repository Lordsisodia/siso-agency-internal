#!/usr/bin/env python3
"""
Test script for LLMLingua integration in BlackBox5 GLMClient.

This script verifies:
1. LLMLingua compressor initialization
2. Message compression functionality
3. Integration with GLMClient
4. Compression statistics
"""

import sys
import logging
from pathlib import Path

# Add engine/core to path
script_dir = Path(__file__).parent
if str(script_dir) not in sys.path:
    sys.path.insert(0, str(script_dir))

logging.basicConfig(
    level=logging.DEBUG,
    format='%(levelname)s - %(name)s - %(message)s'
)

logger = logging.getLogger(__name__)


def test_llmlingua_import():
    """Test if LLMLingua can be imported."""
    print("\n=== Test 1: LLMLingua Import ===")
    try:
        from llmlingua import PromptCompressor
        print("✅ LLMLingua imported successfully")
        return True
    except ImportError as e:
        print(f"❌ LLMLingua import failed: {e}")
        print("   Install with: pip3 install llmlingua")
        return False


def test_compressor_init():
    """Test LLMLinguaCompressor initialization."""
    print("\n=== Test 2: Compressor Initialization ===")
    try:
        from LLMLinguaCompressor import LLMLinguaCompressor

        compressor = LLMLinguaCompressor(
            compression_ratio=0.1,
            quality_threshold=0.95,
            enable_compression=True,
            device="cpu"
        )

        if compressor.compressor is not None:
            print("✅ Compressor initialized successfully")
            return True
        else:
            print("❌ Compressor is None (LLMLingua may not be available)")
            return False
    except Exception as e:
        print(f"❌ Compressor initialization failed: {e}")
        return False


def test_message_compression():
    """Test basic message compression."""
    print("\n=== Test 3: Message Compression ===")
    try:
        from LLMLinguaCompressor import LLMLinguaCompressor

        compressor = LLMLinguaCompressor(
            compression_ratio=0.1,
            enable_compression=True
        )

        # Create test messages
        messages = [
            {
                "role": "system",
                "content": "You are a helpful AI assistant that provides accurate and concise answers."
            },
            {
                "role": "user",
                "content": "I need help understanding how prompt compression works with LLMLingua. Can you explain the key concepts and benefits? This is a longer message to test the compression capabilities more thoroughly."
            }
        ]

        print(f"Original messages: {len(messages)} messages")
        print(f"Original content length: {sum(len(m['content']) for m in messages)} chars")

        # Compress messages
        compressed, stats = compressor.compress_messages(messages)

        print(f"Compressed messages: {len(compressed)} messages")
        print(f"Compressed content length: {sum(len(m['content']) for m in compressed)} chars")
        print(f"Compression ratio: {stats['compression_ratio']:.1%}")
        print(f"Original tokens: {stats['original_length']}")
        print(f"Compressed tokens: {stats['compressed_length']}")

        if stats['success']:
            print("✅ Message compression successful")
            return True
        else:
            print("❌ Message compression failed")
            return False
    except Exception as e:
        print(f"❌ Message compression error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_glm_client_integration():
    """Test GLMClient with LLMLingua integration."""
    print("\n=== Test 4: GLMClient Integration ===")
    try:
        # Add parent directories to path
        script_dir = Path(__file__).parent
        client_dir = script_dir.parent.parent.parent / "2-engine" / "01-core" / "client"
        if str(client_dir) not in sys.path:
            sys.path.insert(0, str(client_dir))

        from GLMClient import GLMClient, GLMClientMock

        # Test with mock client
        print("Creating GLMClient with LLMLingua enabled...")
        client = GLMClientMock(
            enable_prompt_compression=True,
            compression_config={
                "compression_ratio": 0.1,
                "quality_threshold": 0.95
            }
        )

        print("✅ GLMClient mock created successfully")

        # Test message creation with compression
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Test message for compression."}
        ]

        response = client.create(messages)
        print(f"✅ Mock response received: {response.content[:50]}...")
        return True
    except Exception as e:
        print(f"❌ GLMClient integration error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_compression_disabled():
    """Test that compression can be disabled."""
    print("\n=== Test 5: Disable Compression ===")
    try:
        from LLMLinguaCompressor import LLMLinguaCompressor

        # Create compressor with compression disabled
        compressor = LLMLinguaCompressor(
            enable_compression=False
        )

        messages = [{"role": "user", "content": "Test message"}]
        compressed, stats = compressor.compress_messages(messages)

        if not stats['compression_enabled']:
            print("✅ Compression disabled successfully")
            return True
        else:
            print("❌ Compression should be disabled")
            return False
    except Exception as e:
        print(f"❌ Disable compression test failed: {e}")
        return False


def main():
    """Run all tests."""
    print("=" * 60)
    print("LLMLingua Integration Test Suite")
    print("=" * 60)

    results = []
    results.append(("LLMLingua Import", test_llmlingua_import()))
    results.append(("Compressor Init", test_compressor_init()))
    results.append(("Message Compression", test_message_compression()))
    results.append(("GLMClient Integration", test_glm_client_integration()))
    results.append(("Disable Compression", test_compression_disabled()))

    print("\n" + "=" * 60)
    print("Test Results Summary")
    print("=" * 60)

    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")

    passed = sum(1 for _, r in results if r)
    total = len(results)
    print(f"\nTotal: {passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 All tests passed! LLMLingua integration is working.")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please check the errors above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
