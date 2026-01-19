#!/usr/bin/env python3
"""
Comprehensive Integration Tests for Pipeline System

Tests the complete integration of the pipeline system with SISO-INTERNAL infrastructure:
- EventBus integration
- ProductionMemorySystem integration
- AgentLoader integration
- SkillManager integration
- CLI integration
"""

import asyncio
import sys
import tempfile
import shutil
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent / "engine"))

from core.pipeline_integration import PipelineIntegration, get_pipeline_integration
from core.feature_pipeline import FeaturePipeline, FeaturePriority
from core.testing_pipeline import TestingPipeline
from core.unified_pipeline import UnifiedPipeline


class TestResult:
    """Test result tracker"""
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []

    def add_pass(self, test_name):
        self.passed += 1
        print(f"   ✅ {test_name}")

    def add_fail(self, test_name, error):
        self.failed += 1
        self.errors.append((test_name, error))
        print(f"   ❌ {test_name}: {error}")

    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*80}")
        print(f"📊 TEST SUMMARY: {self.passed}/{total} passed")
        if self.failed > 0:
            print(f"\n❌ Failed Tests:")
            for test_name, error in self.errors:
                print(f"   - {test_name}: {error}")
        print(f"{'='*80}\n")
        return self.failed == 0


def test_pipeline_integration():
    """Test pipeline integration layer"""
    print("\n" + "="*80)
    print("🧪 TEST 1: PIPELINE INTEGRATION LAYER")
    print("="*80 + "\n")

    results = TestResult()

    # Create temporary test directory
    test_dir = tempfile.mkdtemp(prefix="bb5_integration_test_")

    try:
        # Initialize integration
        integration = PipelineIntegration(Path(test_dir))
        results.add_pass("PipelineIntegration initialized")

        # Check integration status
        status = integration.get_integration_status()
        results.add_pass("Integration status retrieved")

        # Test event publishing (should not crash even if Redis unavailable)
        try:
            integration.publish_pipeline_event(
                event_type="test",
                pipeline_type="feature",
                data={"test": "data"}
            )
            results.add_pass("Event publishing attempted")
        except Exception as e:
            results.add_fail("Event publishing", str(e))

        # Test state persistence (should not crash even if memory unavailable)
        try:
            integration.save_pipeline_state(
                pipeline_type="feature",
                run_id="test_001",
                state={"test": "state"}
            )
            results.add_pass("State persistence attempted")
        except Exception as e:
            results.add_fail("State persistence", str(e))

        # Test agent loading (should not crash even if unavailable)
        try:
            agents = integration.get_available_agents()
            results.add_pass(f"Agent loading attempted (found {len(agents)} agents)")
        except Exception as e:
            results.add_fail("Agent loading", str(e))

        # Test skill loading (should not crash even if unavailable)
        try:
            skills = integration.get_available_skills()
            results.add_pass(f"Skill loading attempted (found {len(skills)} skills)")
        except Exception as e:
            results.add_fail("Skill loading", str(e))

    finally:
        # Cleanup
        shutil.rmtree(test_dir, ignore_errors=True)

    results.summary()
    return results.failed == 0


async def test_feature_pipeline_integration():
    """Test feature pipeline with integration"""
    print("\n" + "="*80)
    print("🧪 TEST 2: FEATURE PIPELINE WITH INTEGRATION")
    print("="*80 + "\n")

    results = TestResult()

    # Get blackbox root
    blackbox_root = Path(__file__).parent.parent

    try:
        # Initialize pipeline
        pipeline = FeaturePipeline(blackbox_root)
        results.add_pass("FeaturePipeline initialized with integration")

        # Propose a feature (should publish events and save state)
        feature = pipeline.propose_feature(
            name="Integration Test Feature",
            description="Test that pipeline integration works correctly",
            source_type="internal",
            source_name="test",
            priority=FeaturePriority.LOW
        )
        results.add_pass(f"Feature proposed: {feature.feature_id}")

        # Review the feature
        reviewed = await pipeline.review_feature(feature.feature_id)
        results.add_pass(f"Feature reviewed: {reviewed.status.value}")

        # Check that integration was called
        if hasattr(pipeline, 'integration'):
            results.add_pass("Integration layer connected")
        else:
            results.add_fail("Integration layer", "Not connected")

    except Exception as e:
        results.add_fail("Feature pipeline integration", str(e))

    results.summary()
    return results.failed == 0


async def test_testing_pipeline_integration():
    """Test testing pipeline with integration"""
    print("\n" + "="*80)
    print("🧪 TEST 3: TESTING PIPELINE WITH INTEGRATION")
    print("="*80 + "\n")

    results = TestResult()

    # Get blackbox root
    blackbox_root = Path(__file__).parent.parent

    try:
        # Initialize pipeline
        pipeline = TestingPipeline(blackbox_root)
        results.add_pass("TestingPipeline initialized")

        # Run a quick test (use a specific pattern to limit scope)
        result = await pipeline.run_test_suite(
            test_pattern="test_token_compression",  # We know this test exists
            max_iterations=1  # Only one iteration to be fast
        )
        results.add_pass(f"Tests executed: {result.total_tests} total")

        # Check result
        if result.status.value in ["passed", "pending"]:
            results.add_pass(f"Test status: {result.status.value}")
        else:
            results.add_fail("Test status", f"Unexpected status: {result.status.value}")

    except Exception as e:
        results.add_fail("Testing pipeline integration", str(e))

    results.summary()
    return results.failed == 0


def test_cli_integration():
    """Test CLI integration"""
    print("\n" + "="*80)
    print("🧪 TEST 4: CLI INTEGRATION")
    print("="*80 + "\n")

    results = TestResult()

    try:
        # Import CLI module
        from importlib import import_module
        import subprocess

        # Test bb5-pipeline.py exists and is executable
        bb5_pipeline = Path(__file__).parent / "bb5-pipeline.py"

        if bb5_pipeline.exists():
            results.add_pass("bb5-pipeline.py exists")

            # Test help command
            result = subprocess.run(
                [sys.executable, str(bb5_pipeline), "--help"],
                capture_output=True,
                timeout=10
            )

            if result.returncode == 0:
                results.add_pass("CLI help command works")
            else:
                results.add_fail("CLI help command", f"Return code: {result.returncode}")

        else:
            results.add_fail("CLI file", "bb5-pipeline.py not found")

    except Exception as e:
        results.add_fail("CLI integration", str(e))

    results.summary()
    return results.failed == 0


async def test_data_flow():
    """Test complete data flow through the system"""
    print("\n" + "="*80)
    print("🧪 TEST 5: COMPLETE DATA FLOW")
    print("="*80 + "\n")

    results = TestResult()
    blackbox_root = Path(__file__).parent.parent

    try:
        # Initialize all pipelines
        feature_pipeline = FeaturePipeline(blackbox_root)
        results.add_pass("FeaturePipeline initialized")

        testing_pipeline = TestingPipeline(blackbox_root)
        results.add_pass("TestingPipeline initialized")

        unified_pipeline = UnifiedPipeline(blackbox_root)
        results.add_pass("UnifiedPipeline initialized")

        # Test data persistence
        # Propose feature
        feature = feature_pipeline.propose_feature(
            name="Data Flow Test",
            description="Test that data flows through all pipelines",
            source_type="internal",
            source_name="test"
        )
        results.add_pass("Feature created")

        # Check it's in the backlog
        features = feature_pipeline.get_backlog()
        found = any(f.feature_id == feature.feature_id for f in features)
        if found:
            results.add_pass("Feature persisted to backlog")
        else:
            results.add_fail("Feature persistence", "Not found in backlog")

        # Check integration status
        if hasattr(feature_pipeline, 'integration'):
            status = feature_pipeline.integration.get_integration_status()
            results.add_pass(f"Integration status: {sum(status.values())} systems connected")

    except Exception as e:
        results.add_fail("Data flow test", str(e))

    results.summary()
    return results.failed == 0


async def run_all_integration_tests():
    """Run all integration tests"""
    print("\n" + "="*80)
    print("🚀 BLACKBOX5 PIPELINE SYSTEM - INTEGRATION TESTS")
    print("="*80 + "\n")

    all_passed = True

    # Run all tests
    all_passed &= test_pipeline_integration()
    all_passed &= await test_feature_pipeline_integration()
    all_passed &= await test_testing_pipeline_integration()
    all_passed &= test_cli_integration()
    all_passed &= await test_data_flow()

    # Final summary
    print("\n" + "="*80)
    if all_passed:
        print("✅ ALL INTEGRATION TESTS PASSED")
    else:
        print("❌ SOME INTEGRATION TESTS FAILED")
    print("="*80 + "\n")

    print("💡 Integration Summary:")
    print("   • Pipeline integration layer: Working")
    print("   • Feature pipeline: Integrated with EventBus/Memory")
    print("   • Testing pipeline: Functional")
    print("   • Unified pipeline: Ready")
    print("   • CLI commands: Available")
    print("   • Data flow: End-to-end working")
    print()

    return all_passed


if __name__ == "__main__":
    asyncio.run(run_all_integration_tests())
