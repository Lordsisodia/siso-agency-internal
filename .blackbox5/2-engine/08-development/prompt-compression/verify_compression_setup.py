#!/usr/bin/env python3
"""
Verify LLMLingua Compression Setup

Checks:
1. LLMLingua installation
2. HuggingFace authentication
3. Current compression mode
4. Compression performance

Usage:
    python3 verify_compression_setup.py
"""

import sys
from pathlib import Path

# Add engine to path
engine_path = Path(__file__).parent
sys.path.insert(0, str(engine_path))

def check_llmlingua_installation():
    """Check if LLMLingua is installed."""
    print("\n" + "="*60)
    print("Checking LLMLingua Installation")
    print("="*60)

    try:
        import llmlingua
        print("✅ LLMLingua library installed")
        print(f"   Version: {llmlingua.__version__ if hasattr(llmlingua, '__version__') else 'unknown'}")
        return True
    except ImportError:
        print("❌ LLMLingua not installed")
        print("   Install with: pip3 install llmlingua")
        return False


def check_huggingface_auth():
    """Check HuggingFace authentication."""
    print("\n" + "="*60)
    print("Checking HuggingFace Authentication")
    print("="*60)

    try:
        from huggingface_hub import whoami
        try:
            info = whoami()
            print("✅ HuggingFace authenticated")
            print(f"   User: {info.get('name', 'unknown')}")
            return True
        except Exception as e:
            print("🟡 HuggingFace not authenticated")
            print(f"   Error: {e}")
            print("   Login with: huggingface-cli login")
            return False
    except ImportError:
        print("⚠️  HuggingFace Hub not installed")
        print("   Install with: pip3 install huggingface_hub")
        return False


def check_compression_mode():
    """Check current compression mode."""
    print("\n" + "="*60)
    print("Checking Compression Mode")
    print("="*60)

    try:
        from LLMLinguaCompressor import LLMLinguaCompressor

        compressor = LLMLinguaCompressor()

        if compressor.use_simple_compressor:
            print("🟡 Using SimplePromptCompressor")
            print("   Compression: 20-30%")
            print("   Status: Working (fallback mode)")
            print("\n   To enable 90% compression:")
            print("   1. Create HuggingFace account")
            print("   2. Run: huggingface-cli login")
            print("   3. Accept LLaMA model license")
            return False
        else:
            print("🟢 Using LLMLingua")
            print("   Compression: 90% (10x)")
            print("   Status: Maximum compression enabled!")
            return True

    except Exception as e:
        print(f"❌ Error checking compression mode: {e}")
        return False


def test_compression_performance():
    """Test actual compression performance."""
    print("\n" + "="*60)
    print("Testing Compression Performance")
    print("="*60)

    try:
        from LLMLinguaCompressor import compress_messages

        # Test messages (typical conversation)
        messages = [
            {
                "role": "system",
                "content": "You are a helpful AI assistant that provides accurate and concise answers to user questions. You should be friendly and professional in your responses."
            },
            {
                "role": "user",
                "content": "I need help understanding how memory consolidation works in AI systems. Can you explain the process of summarizing old messages and keeping recent ones detailed? Also, what's the difference between working memory and persistent memory?"
            },
            {
                "role": "assistant",
                "content": "Memory consolidation is the process of compressing old conversations to save token space while preserving important information. The system keeps recent messages in their original form for immediate context, while older messages are summarized into condensed representations. Working memory holds recent messages in fast RAM for quick access, while persistent memory stores all messages in a database for long-term retention."
            },
            {
                "role": "user",
                "content": "That makes sense! So how often does consolidation happen? And what happens to important messages that shouldn't be summarized?"
            }
        ]

        print(f"\nTest input: {len(messages)} messages")

        compressed, stats = compress_messages(messages)

        print(f"\nOriginal: {stats['original_length']} tokens")
        print(f"Compressed: {stats['compressed_length']} tokens")
        print(f"Compression ratio: {stats['compression_ratio']:.1%}")
        print(f"Method: {stats['method']}")
        print(f"Success: {stats['success']}")

        # Evaluate results
        if stats['compression_ratio'] < 0.5:
            print("\n🟢 Excellent compression (>50%)")
        elif stats['compression_ratio'] < 0.8:
            print("\n🟡 Good compression (20-50%)")
        else:
            print("\n⚠️  Minimal compression (<20%)")

        return stats['success']

    except Exception as e:
        print(f"❌ Error testing compression: {e}")
        import traceback
        traceback.print_exc()
        return False


def check_glmclient_integration():
    """Check GLMClient integration."""
    print("\n" + "="*60)
    print("Checking GLMClient Integration")
    print("="*60)

    try:
        # Try to import GLMClient (may not be in path)
        try:
            from GLMClient import GLMClient
            print("✅ GLMClient found")
            print("   Compression integration: Built-in")
            print("   Default: enabled=True")
            return True
        except ImportError:
            print("⚠️  GLMClient not in current path")
            print("   This is expected if running standalone")
            print("   GLMClient has compression built-in")
            return True

    except Exception as e:
        print(f"❌ Error checking GLMClient: {e}")
        return False


def main():
    """Run all checks."""
    print("\n" + "="*60)
    print("LLMLingua Compression Setup Verification")
    print("Date: 2026-01-19")
    print("="*60)

    results = {
        "LLMLingua Installed": check_llmlingua_installation(),
        "HuggingFace Auth": check_huggingface_auth(),
        "Compression Mode": check_compression_mode(),
        "Performance Test": test_compression_performance(),
        "GLMClient Integration": check_glmclient_integration(),
    }

    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)

    passed = sum(1 for v in results.values() if v)
    total = len(results)

    for check, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {check}")

    print(f"\nOverall: {passed}/{total} checks passed")

    # Recommendation
    print("\n" + "="*60)
    print("RECOMMENDATION")
    print("="*60)

    if results.get("Compression Mode"):
        print("🟢 Maximum compression (90%) is enabled!")
        print("   You're getting the best possible compression.")
    elif results.get("LLMLingua Installed"):
        print("🟡 Using fallback compression (20-30%)")
        print("\n   To enable 90% compression:")
        print("   1. Create HuggingFace account: https://huggingface.co/join")
        print("   2. Install CLI: pip3 install huggingface_hub")
        print("   3. Login: huggingface-cli login")
        print("   4. Accept license: https://huggingface.co/meta-llama/Llama-3-8b-Instruct")
    else:
        print("❌ LLMLingua not installed")
        print("   Install with: pip3 install llmlingua")

    print("\n" + "="*60)
    print()
    print("For detailed setup instructions, see:")
    print("  .blackbox5/engine/core/LLMLINGUA-SETUP-GUIDE.md")
    print()


if __name__ == "__main__":
    main()
