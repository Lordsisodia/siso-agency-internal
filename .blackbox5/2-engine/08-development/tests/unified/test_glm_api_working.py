#!/usr/bin/env python3
"""
Comprehensive test suite for GLM API Client

This script tests:
1. Mock client functionality
2. Real GLM API calls (if API key is available)
3. Error handling
4. Async operations
5. Message formatting
6. Model validation
"""

import os
import sys
import asyncio
import json
from pathlib import Path

# Add parent directory to path to import GLMClient
sys.path.insert(0, str(Path(__file__).parent.parent))

from engine.core.GLMClient import (
    GLMClient,
    GLMClientMock,
    GLMResponse,
    GLMAPIError,
    GLMClientError,
    create_glm_client,
    chat,
    GLMMessage
)


class TestResults:
    """Track test results"""
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.tests = []

    def add_result(self, test_name: str, passed: bool, message: str = ""):
        self.tests.append({
            "name": test_name,
            "passed": passed,
            "message": message
        })
        if passed:
            self.passed += 1
        else:
            self.failed += 1

    def print_summary(self):
        print("\n" + "="*70)
        print("TEST SUMMARY")
        print("="*70)
        for test in self.tests:
            status = "✓ PASS" if test["passed"] else "✗ FAIL"
            print(f"{status}: {test['name']}")
            if test["message"]:
                print(f"  → {test['message']}")
        print("="*70)
        print(f"Total: {self.passed + self.failed} | Passed: {self.passed} | Failed: {self.failed}")
        print("="*70)


def test_mock_client_basic(results: TestResults):
    """Test basic mock client functionality"""
    print("\n[TEST] Mock Client - Basic Functionality")
    try:
        client = GLMClientMock()
        response = client.create([
            {"role": "user", "content": "Hello, GLM!"}
        ])

        assert isinstance(response, GLMResponse), "Response should be GLMResponse instance"
        assert response.content is not None, "Response content should not be None"
        assert "MOCK GLM RESPONSE" in response.content, "Response should contain mock marker"
        assert response.model == "glm-4.7-mock", "Model should be glm-4.7-mock"
        assert response.usage["total_tokens"] == 30, "Usage should show 30 total tokens"
        assert response.finish_reason == "stop", "Finish reason should be 'stop'"

        results.add_result("Mock Client - Basic Functionality", True)
        print(f"  ✓ Mock response: {response.content}")
        print(f"  ✓ Model: {response.model}")
        print(f"  ✓ Tokens: {response.usage}")
        return True
    except Exception as e:
        results.add_result("Mock Client - Basic Functionality", False, str(e))
        print(f"  ✗ Error: {e}")
        return False


def test_mock_client_multiple_calls(results: TestResults):
    """Test mock client tracks multiple calls"""
    print("\n[TEST] Mock Client - Multiple Calls Tracking")
    try:
        client = GLMClientMock()

        # Make multiple calls
        client.create([{"role": "user", "content": "First message"}])
        client.create([{"role": "user", "content": "Second message"}])
        client.create([{"role": "user", "content": "Third message"}])

        assert len(client.calls) == 3, "Should track 3 calls"
        assert client.calls[0]["messages"][0]["content"] == "First message"
        assert client.calls[1]["messages"][0]["content"] == "Second message"
        assert client.calls[2]["messages"][0]["content"] == "Third message"

        results.add_result("Mock Client - Multiple Calls Tracking", True)
        print(f"  ✓ Tracked {len(client.calls)} calls successfully")
        return True
    except Exception as e:
        results.add_result("Mock Client - Multiple Calls Tracking", False, str(e))
        print(f"  ✗ Error: {e}")
        return False


def test_mock_client_async(results: TestResults):
    """Test mock client async functionality"""
    print("\n[TEST] Mock Client - Async Functionality")
    try:
        client = GLMClientMock()

        async def run_async_test():
            response = await client.acreate([
                {"role": "user", "content": "Async test"}
            ])
            return response

        response = asyncio.run(run_async_test())
        assert isinstance(response, GLMResponse), "Async response should be GLMResponse"
        assert "MOCK GLM RESPONSE" in response.content, "Async response should work"

        results.add_result("Mock Client - Async Functionality", True)
        print(f"  ✓ Async response: {response.content}")
        return True
    except Exception as e:
        results.add_result("Mock Client - Async Functionality", False, str(e))
        print(f"  ✗ Error: {e}")
        return False


def test_create_glm_client_factory(results: TestResults):
    """Test the factory function"""
    print("\n[TEST] Factory Function - create_glm_client")
    try:
        # Test mock creation
        mock_client = create_glm_client(mock=True)
        assert isinstance(mock_client, GLMClientMock), "Should create mock client"
        print("  ✓ Mock client created via factory")

        results.add_result("Factory Function - create_glm_client", True)
        return True
    except Exception as e:
        results.add_result("Factory Function - create_glm_client", False, str(e))
        print(f"  ✗ Error: {e}")
        return False


def test_glm_message_dataclass(results: TestResults):
    """Test GLMMessage dataclass"""
    print("\n[TEST] GLMMessage Dataclass")
    try:
        msg = GLMMessage(role="user", content="Test message")
        assert msg.role == "user", "Role should be 'user'"
        assert msg.content == "Test message", "Content should match"

        results.add_result("GLMMessage Dataclass", True)
        print(f"  ✓ GLMMessage created: {msg.role}: {msg.content}")
        return True
    except Exception as e:
        results.add_result("GLMMessage Dataclass", False, str(e))
        print(f"  ✗ Error: {e}")
        return False


def test_model_validation(results: TestResults):
    """Test model validation"""
    print("\n[TEST] Model Validation")
    try:
        client = create_glm_client(mock=True)

        # Test valid models
        valid_models = ["glm-4.7", "glm-4-plus", "glm-4-air", "glm-4-flash", "glm-4-long"]
        for model in valid_models:
            validated = client._validate_model(model)
            assert validated in GLMClient.MODELS.values(), f"Model {model} should validate"

        print(f"  ✓ All {len(valid_models)} valid models validated")

        # Test invalid model (should default to glm-4.7)
        invalid_model = client._validate_model("invalid-model")
        assert invalid_model == "glm-4.7", "Invalid model should default to glm-4.7"
        print(f"  ✓ Invalid model defaults to glm-4.7")

        results.add_result("Model Validation", True)
        return True
    except Exception as e:
        results.add_result("Model Validation", False, str(e))
        print(f"  ✗ Error: {e}")
        return False


def test_message_formatting(results: TestResults):
    """Test message formatting"""
    print("\n[TEST] Message Formatting")
    try:
        client = create_glm_client(mock=True)

        # Test dict messages
        dict_messages = [
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": "Hi there"}
        ]
        formatted = client._format_messages(dict_messages)
        assert len(formatted) == 2, "Should format 2 messages"
        assert formatted[0]["role"] == "user", "First role should be 'user'"
        print(f"  ✓ Dict messages formatted correctly")

        # Test GLMMessage objects
        glm_messages = [
            GLMMessage(role="user", content="Test")
        ]
        formatted = client._format_messages(glm_messages)
        assert len(formatted) == 1, "Should format 1 GLMMessage"
        assert formatted[0]["content"] == "Test", "GLMMessage should format correctly"
        print(f"  ✓ GLMMessage objects formatted correctly")

        results.add_result("Message Formatting", True)
        return True
    except Exception as e:
        results.add_result("Message Formatting", False, str(e))
        print(f"  ✗ Error: {e}")
        return False


def test_real_client_initialization(results: TestResults):
    """Test real client initialization (with or without API key)"""
    print("\n[TEST] Real Client Initialization")
    try:
        api_key = os.getenv("GLM_API_KEY")

        if not api_key:
            print("  ⚠ No GLM_API_KEY found, testing error handling...")

            # Test that it raises error without API key
            try:
                client = GLMClient(api_key=None)
                results.add_result("Real Client Initialization", False,
                                   "Should have raised error without API key")
                print(f"  ✗ Should have raised GLMClientError without API key")
                return False
            except GLMClientError as e:
                print(f"  ✓ Correctly raises error without API key: {e}")
                results.add_result("Real Client Initialization", True,
                                   "Correctly handles missing API key")
                return True
        else:
            # Test with real API key
            print(f"  ✓ GLM_API_KEY found (length: {len(api_key)})")
            client = GLMClient(api_key=api_key)
            assert client.api_key == api_key, "API key should be set"
            print(f"  ✓ Client initialized successfully")
            results.add_result("Real Client Initialization", True)
            return True

    except Exception as e:
        results.add_result("Real Client Initialization", False, str(e))
        print(f"  ✗ Error: {e}")
        return False


def test_real_api_call(results: TestResults):
    """Test real GLM API call"""
    print("\n[TEST] Real API Call")
    api_key = os.getenv("GLM_API_KEY")

    if not api_key:
        print("  ⚠ Skipping (no GLM_API_KEY set)")
        results.add_result("Real API Call", True, "Skipped (no API key)")
        return True

    try:
        print("  Initializing GLM client...")
        client = GLMClient(api_key=api_key)

        print("  Sending test request...")
        response = client.create(
            messages=[
                {"role": "user", "content": "Say 'Hello from GLM API!' in exactly one sentence."}
            ],
            model="glm-4.7",
            temperature=0.7,
            max_tokens=100
        )

        assert isinstance(response, GLMResponse), "Response should be GLMResponse"
        assert response.content is not None, "Response content should not be None"
        assert len(response.content) > 0, "Response content should not be empty"
        assert response.model == "glm-4.7", "Model should match"
        assert response.usage["total_tokens"] > 0, "Should have token usage"

        print(f"  ✓ Response received: {response.content[:100]}...")
        print(f"  ✓ Model: {response.model}")
        print(f"  ✓ Tokens: {response.usage}")
        print(f"  ✓ Finish reason: {response.finish_reason}")

        results.add_result("Real API Call", True, "Successfully called GLM API")
        return True

    except GLMAPIError as e:
        error_msg = str(e)
        print(f"  ✗ API Error: {error_msg}")

        # Check for common errors
        if "401" in error_msg or "authentication" in error_msg.lower():
            results.add_result("Real API Call", False, "Authentication failed - check API key")
        elif "429" in error_msg or "rate limit" in error_msg.lower():
            results.add_result("Real API Call", False, "Rate limit exceeded")
        elif "timeout" in error_msg.lower():
            results.add_result("Real API Call", False, "Request timeout")
        else:
            results.add_result("Real API Call", False, error_msg)
        return False

    except Exception as e:
        results.add_result("Real API Call", False, f"Unexpected error: {e}")
        print(f"  ✗ Unexpected error: {e}")
        return False


def test_real_api_conversation(results: TestResults):
    """Test real API with multi-turn conversation"""
    print("\n[TEST] Real API - Multi-turn Conversation")
    api_key = os.getenv("GLM_API_KEY")

    if not api_key:
        print("  ⚠ Skipping (no GLM_API_KEY set)")
        results.add_result("Real API - Multi-turn Conversation", True, "Skipped (no API key)")
        return True

    try:
        client = GLMClient(api_key=api_key)

        messages = [
            {"role": "user", "content": "What is 2 + 2?"},
            {"role": "assistant", "content": "2 + 2 equals 4."},
            {"role": "user", "content": "Now what is 4 + 4?"}
        ]

        response = client.create(messages=messages, model="glm-4.7")

        assert response.content is not None, "Response should not be None"
        assert len(response.content) > 0, "Response should not be empty"

        print(f"  ✓ Multi-turn response: {response.content[:100]}...")
        print(f"  ✓ Tokens used: {response.usage['total_tokens']}")

        results.add_result("Real API - Multi-turn Conversation", True)
        return True

    except Exception as e:
        results.add_result("Real API - Multi-turn Conversation", False, str(e))
        print(f"  ✗ Error: {e}")
        return False


def test_real_api_async(results: TestResults):
    """Test real API async call"""
    print("\n[TEST] Real API - Async Call")
    api_key = os.getenv("GLM_API_KEY")

    if not api_key:
        print("  ⚠ Skipping (no GLM_API_KEY set)")
        results.add_result("Real API - Async Call", True, "Skipped (no API key)")
        return True

    try:
        client = GLMClient(api_key=api_key)

        async def make_async_call():
            response = await client.acreate(
                messages=[{"role": "user", "content": "Say 'Async works!' in one sentence."}],
                model="glm-4.7"
            )
            return response

        response = asyncio.run(make_async_call())

        assert isinstance(response, GLMResponse), "Async response should be GLMResponse"
        assert response.content is not None, "Async response should not be None"

        print(f"  ✓ Async response: {response.content[:100]}...")
        print(f"  ✓ Tokens: {response.usage['total_tokens']}")

        results.add_result("Real API - Async Call", True)
        return True

    except Exception as e:
        results.add_result("Real API - Async Call", False, str(e))
        print(f"  ✗ Error: {e}")
        return False


def test_chat_convenience_function(results: TestResults):
    """Test the chat() convenience function"""
    print("\n[TEST] Chat Convenience Function")
    try:
        # Test with mock
        response = chat("Test prompt", mock=True)
        assert "MOCK GLM RESPONSE" in response, "Chat function should work with mock"
        print(f"  ✓ Chat function with mock: {response[:50]}...")

        results.add_result("Chat Convenience Function", True)
        return True
    except Exception as e:
        results.add_result("Chat Convenience Function", False, str(e))
        print(f"  ✗ Error: {e}")
        return False


def test_error_handling(results: TestResults):
    """Test error handling"""
    print("\n[TEST] Error Handling")
    try:
        # Test creating client without API key
        # Temporarily unset the env var
        original_key = os.environ.get("GLM_API_KEY")
        if "GLM_API_KEY" in os.environ:
            del os.environ["GLM_API_KEY"]

        try:
            client = GLMClient()
            results.add_result("Error Handling", False,
                               "Should have raised error without API key")
            print(f"  ✗ Should have raised GLMClientError")
            return False
        except GLMClientError:
            print(f"  ✓ Correctly raises GLMClientError without API key")
        finally:
            # Restore original key
            if original_key:
                os.environ["GLM_API_KEY"] = original_key

        results.add_result("Error Handling", True)
        return True
    except Exception as e:
        results.add_result("Error Handling", False, str(e))
        print(f"  ✗ Error: {e}")
        return False


def main():
    """Run all tests"""
    print("="*70)
    print("GLM API CLIENT TEST SUITE")
    print("="*70)

    results = TestResults()

    # Always run mock tests
    print("\n" + "="*70)
    print("MOCK CLIENT TESTS (Always Run)")
    print("="*70)

    test_mock_client_basic(results)
    test_mock_client_multiple_calls(results)
    test_mock_client_async(results)
    test_create_glm_client_factory(results)
    test_glm_message_dataclass(results)
    test_model_validation(results)
    test_message_formatting(results)
    test_chat_convenience_function(results)
    test_error_handling(results)

    # Real API tests (run if API key available)
    print("\n" + "="*70)
    print("REAL API TESTS (Requires GLM_API_KEY)")
    print("="*70)

    api_key = os.getenv("GLM_API_KEY")
    if api_key:
        print(f"\n✓ GLM_API_KEY found (length: {len(api_key)})")
        print("Running real API tests...\n")
        test_real_client_initialization(results)
        test_real_api_call(results)
        test_real_api_conversation(results)
        test_real_api_async(results)
    else:
        print("\n⚠ GLM_API_KEY not found in environment")
        print("Skipping real API tests")
        print("To run real API tests, set GLM_API_KEY environment variable:")
        print("  export GLM_API_KEY='your-api-key-here'")
        print("\nMarking real API tests as skipped...\n")
        test_real_client_initialization(results)

    # Print summary
    results.print_summary()

    # Exit code based on results
    return 0 if results.failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
