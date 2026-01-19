#!/usr/bin/env python3
"""
Test GLM API with Real Call

This script tests the GLM API integration with a real API call.
"""

import os
import sys
from pathlib import Path

# Add engine to path
engine_path = Path(__file__).parent.parent / "engine"
sys.path.insert(0, str(engine_path))

from core.GLMClient import create_glm_client

def test_glm_api():
    """Test GLM API with a real call"""
    print("="*60)
    print("Testing GLM API with Real Call")
    print("="*60)

    # Check API key
    api_key = os.getenv("GLM_API_KEY")
    if not api_key:
        print("\n❌ GLM_API_KEY not found!")
        print("Please set it with: export GLM_API_KEY='your-key-here'")
        return False

    print(f"\n✅ API Key found: {api_key[:20]}...")

    # Create client
    print("\n📞 Creating GLM client...")
    client = create_glm_client()

    # Test 1: Simple chat
    print("\n" + "="*60)
    print("Test 1: Simple Chat")
    print("="*60)

    try:
        response = client.create([
            {"role": "user", "content": "Say 'Hello from GLM!' in one sentence."}
        ])

        print(f"\n✅ Success!")
        print(f"Model: {response.model}")
        print(f"Response: {response.content}")
        print(f"Tokens: {response.usage}")
        print(f"Finish reason: {response.finish_reason}")

    except Exception as e:
        print(f"\n❌ Failed: {e}")
        return False

    # Test 2: Code generation
    print("\n" + "="*60)
    print("Test 2: Code Generation")
    print("="*60)

    try:
        response = client.create([
            {
                "role": "system",
                "content": "You are a helpful coding assistant."
            },
            {
                "role": "user",
                "content": "Write a Python function to calculate the nth fibonacci number."
            }
        ])

        print(f"\n✅ Success!")
        print(f"Response:\n{response.content}")
        print(f"\nTokens used: {response.usage['total_tokens']}")

    except Exception as e:
        print(f"\n❌ Failed: {e}")
        return False

    # Test 3: Multi-turn conversation
    print("\n" + "="*60)
    print("Test 3: Multi-turn Conversation")
    print("="*60)

    try:
        conversation = [
            {"role": "user", "content": "My name is Alice and I love Python."}
        ]

        # First turn
        response1 = client.create(conversation)
        print(f"\n👤 User: My name is Alice and I love Python.")
        print(f"🤖 GLM: {response1.content}")

        # Add assistant response to conversation
        conversation.append({
            "role": "assistant",
            "content": response1.content
        })

        # Second turn
        conversation.append({
            "role": "user",
            "content": "What's my name?"
        })

        response2 = client.create(conversation)
        print(f"\n👤 User: What's my name?")
        print(f"🤖 GLM: {response2.content}")

        # Check if it remembers
        if "Alice" in response2.content:
            print("\n✅ GLM remembered the context!")
        else:
            print("\n⚠️  GLM didn't remember the context")

    except Exception as e:
        print(f"\n❌ Failed: {e}")
        return False

    print("\n" + "="*60)
    print("All tests passed! ✅")
    print("="*60)
    return True

if __name__ == "__main__":
    success = test_glm_api()
    sys.exit(0 if success else 1)
