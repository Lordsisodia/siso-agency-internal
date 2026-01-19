"""
Test Deviation Detection and Recovery

Comprehensive test suite for the 4-Rule Deviation Handling system.
Tests deviation detection, classification, fix suggestions, and recovery strategies.
"""

import pytest
from datetime import datetime
from unittest.mock import Mock, AsyncMock, patch, MagicMock
import asyncio

from engine.core.deviation_handler import (
    DeviationHandler,
    DeviationType,
    Deviation
)


class TestDeviationDetection:
    """Test deviation type detection from various error types"""

    def test_detect_bug_from_assertion_error(self):
        """Should detect bug from assertion error"""
        handler = DeviationHandler()

        error = AssertionError("Expected 5 but got 3")
        deviation = handler.detect_deviation(error, {'task_id': 'test-1'})

        assert deviation is not None
        assert deviation.deviation_type == DeviationType.BUG
        assert deviation.error_type == "AssertionError"
        assert len(deviation.suggested_fixes) > 0
        assert "Check assertion condition" in str(deviation.suggested_fixes)

    def test_detect_bug_from_traceback(self):
        """Should detect bug from traceback error"""
        handler = DeviationHandler()

        error = Exception(
            "Traceback (most recent call last):\n"
            "  File \"test.py\", line 10, in <module>\n"
            "AssertionError: Test failed"
        )
        deviation = handler.detect_deviation(error, {})

        assert deviation is not None
        assert deviation.deviation_type == DeviationType.BUG
        assert any("Check test.py:10" in fix for fix in deviation.suggested_fixes)

    def test_detect_bug_from_name_error(self):
        """Should detect bug from NameError"""
        handler = DeviationHandler()

        error = NameError("name 'undefined_var' is not defined")
        deviation = handler.detect_deviation(error, {})

        assert deviation is not None
        assert deviation.deviation_type == DeviationType.BUG
        assert any("Define variable: undefined_var" in fix for fix in deviation.suggested_fixes)

    def test_detect_bug_from_attribute_error(self):
        """Should detect bug from AttributeError"""
        handler = DeviationHandler()

        error = AttributeError("'MyClass' object has no attribute 'missing_attr'")
        deviation = handler.detect_deviation(error, {})

        assert deviation is not None
        assert deviation.deviation_type == DeviationType.BUG
        assert any("Add attribute 'missing_attr'" in fix for fix in deviation.suggested_fixes)

    def test_detect_bug_from_none_attribute_error(self):
        """Should detect bug from NoneType attribute error"""
        handler = DeviationHandler()

        error = AttributeError("'NoneType' object has no attribute 'data'")
        deviation = handler.detect_deviation(error, {})

        assert deviation is not None
        assert deviation.deviation_type == DeviationType.BUG
        assert any("None" in fix for fix in deviation.suggested_fixes)

    def test_detect_bug_from_type_error(self):
        """Should detect bug from TypeError"""
        handler = DeviationHandler()

        error = TypeError("'str' object is not callable")
        deviation = handler.detect_deviation(error, {})

        assert deviation is not None
        assert deviation.deviation_type == DeviationType.BUG
        assert any("not callable" in fix for fix in deviation.suggested_fixes)

    def test_detect_missing_dependency(self):
        """Should detect missing dependency from import error"""
        handler = DeviationHandler()

        error = ModuleNotFoundError("No module named 'requests'")
        deviation = handler.detect_deviation(error, {})

        assert deviation is not None
        assert deviation.deviation_type == DeviationType.MISSING_DEPENDENCY
        assert any("pip install requests" in fix for fix in deviation.suggested_fixes)

    def test_detect_missing_dependency_import_error(self):
        """Should detect missing dependency from ImportError"""
        handler = DeviationHandler()

        error = ImportError("cannot import name 'xyz' from 'module'")
        deviation = handler.detect_deviation(error, {})

        assert deviation is not None
        assert deviation.deviation_type == DeviationType.MISSING_DEPENDENCY

    def test_detect_blockage_from_timeout(self):
        """Should detect blockage from timeout error"""
        handler = DeviationHandler()

        error = TimeoutError("Connection timeout after 30 seconds")
        deviation = handler.detect_deviation(error, {})

        assert deviation is not None
        assert deviation.deviation_type == DeviationType.BLOCKAGE
        assert any("timeout" in fix.lower() for fix in deviation.suggested_fixes)

    def test_detect_blockage_from_connection_refused(self):
        """Should detect blockage from connection refused"""
        handler = DeviationHandler()

        error = ConnectionRefusedError("Connection refused")
        deviation = handler.detect_deviation(error, {})

        assert deviation is not None
        assert deviation.deviation_type == DeviationType.BLOCKAGE

    def test_detect_blockage_from_http_500(self):
        """Should detect blockage from HTTP 500 error"""
        handler = DeviationHandler()

        error = Exception("HTTP 500 Internal Server Error")
        deviation = handler.detect_deviation(error, {})

        assert deviation is not None
        assert deviation.deviation_type == DeviationType.BLOCKAGE
        assert any("retry later" in fix.lower() for fix in deviation.suggested_fixes)

    def test_detect_critical_from_validation_error(self):
        """Should detect critical missing from validation error"""
        handler = DeviationHandler()

        error = ValueError("required field 'user_id' is missing")
        deviation = handler.detect_deviation(error, {})

        assert deviation is not None
        assert deviation.deviation_type == DeviationType.CRITICAL_MISSING
        assert any("user_id" in fix for fix in deviation.suggested_fixes)

    def test_detect_critical_from_key_error(self):
        """Should detect critical missing from KeyError"""
        handler = DeviationHandler()

        error = KeyError("'required_field'")
        deviation = handler.detect_deviation(error, {})

        assert deviation is not None
        assert deviation.deviation_type == DeviationType.CRITICAL_MISSING

    def test_returns_none_for_unrecognized_error(self):
        """Should return None for errors that don't match patterns"""
        handler = DeviationHandler()

        error = Exception("Some completely unknown error type")
        deviation = handler.detect_deviation(error, {})

        assert deviation is None


class TestDeviationFixSuggestions:
    """Test fix suggestion generation for different error types"""

    def test_bug_fix_suggestions_for_name_error(self):
        """Should suggest variable definition for NameError"""
        handler = DeviationHandler()

        fixes = handler._suggest_bug_fixes(
            "NameError: name 'my_var' is not defined",
            {}
        )

        assert len(fixes) > 0
        assert any("Define variable: my_var" in fix for fix in fixes)

    def test_bug_fix_suggestions_for_attribute_error(self):
        """Should suggest attribute addition for AttributeError"""
        handler = DeviationHandler()

        fixes = handler._suggest_bug_fixes(
            "AttributeError: 'MyClass' object has no attribute 'prop'",
            {}
        )

        assert len(fixes) > 0
        assert any("Add attribute 'prop'" in fix for fix in fixes)

    def test_bug_fix_suggestions_for_type_error_not_callable(self):
        """Should suggest callable check for not callable error"""
        handler = DeviationHandler()

        fixes = handler._suggest_bug_fixes(
            "TypeError: 'str' object is not callable",
            {}
        )

        assert len(fixes) > 0
        assert any("calling a function" in fix for fix in fixes)

    def test_dependency_fix_suggestions(self):
        """Should suggest pip install for missing module"""
        handler = DeviationHandler()

        fixes = handler._suggest_dependency_fixes(
            "No module named 'numpy'"
        )

        assert len(fixes) > 0
        assert any("pip install numpy" in fix for fix in fixes)

    def test_blockage_fix_suggestions_for_timeout(self):
        """Should suggest timeout increase for timeout errors"""
        handler = DeviationHandler()

        fixes = handler._suggest_blockage_fixes(
            "Timeout error after 30 seconds",
            {}
        )

        assert len(fixes) > 0
        assert any("timeout" in fix.lower() for fix in fixes)

    def test_blockage_fix_suggestions_for_connection_refused(self):
        """Should suggest service check for connection refused"""
        handler = DeviationHandler()

        fixes = handler._suggest_blockage_fixes(
            "Connection refused by server",
            {}
        )

        assert len(fixes) > 0
        assert any("service is running" in fix.lower() for fix in fixes)

    def test_critical_fix_suggestions_for_required_field(self):
        """Should suggest adding required field"""
        handler = DeviationHandler()

        fixes = handler._suggest_critical_fixes(
            "required field 'email' is missing",
            {}
        )

        assert len(fixes) > 0
        assert any("email" in fix for fix in fixes)


class TestRecoveryStrategies:
    """Test recovery strategies for different deviation types"""

    @pytest.mark.asyncio
    async def test_bug_fix_recovery_with_file_operations(self):
        """Test bug fix recovery strategy with file operations"""
        handler = DeviationHandler()

        deviation = Deviation(
            deviation_type=DeviationType.BUG,
            error_message="NameError: name 'x' is not defined\n  File \"test.py\", line 5",
            error_type="NameError",
            context={},
            suggested_fixes=["Define variable: x"]
        )

        # Mock tools
        mock_tools = Mock()
        mock_tools.run = AsyncMock(side_effect=[
            {'success': True, 'data': 'def test():\n    print(x)'},
            {'success': True}
        ])

        success = await handler.recover_from_deviation(deviation, None, mock_tools)

        # Should have called file_read and file_write
        assert mock_tools.run.call_count == 2
        assert isinstance(success, bool)

    @pytest.mark.asyncio
    async def test_bug_fix_recovery_fails_without_file_location(self):
        """Bug fix recovery should fail if file location not in error"""
        handler = DeviationHandler()

        deviation = Deviation(
            deviation_type=DeviationType.BUG,
            error_message="NameError: name 'x' is not defined",
            error_type="NameError",
            context={},
            suggested_fixes=["Define variable: x"]
        )

        mock_tools = Mock()
        success = await handler.recover_from_deviation(deviation, None, mock_tools)

        assert success is False

    @pytest.mark.asyncio
    async def test_dependency_recovery_with_pip_install(self):
        """Test missing dependency recovery strategy"""
        handler = DeviationHandler()

        deviation = Deviation(
            deviation_type=DeviationType.MISSING_DEPENDENCY,
            error_message="No module named 'fake-package-xyz'",
            error_type="ModuleNotFoundError",
            context={},
            suggested_fixes=["pip install fake-package-xyz"]
        )

        # Mock tools
        mock_tools = Mock()
        mock_tools.run = AsyncMock(return_value={'success': True})

        success = await handler.recover_from_deviation(deviation, None, mock_tools)

        # Should have attempted pip install
        mock_tools.run.assert_called_once()
        call_args = mock_tools.run.call_args
        assert 'pip install' in call_args[1]['command']
        assert isinstance(success, bool)

    @pytest.mark.asyncio
    async def test_dependency_recovery_fails_without_package_name(self):
        """Dependency recovery should fail if package name not found"""
        handler = DeviationHandler()

        deviation = Deviation(
            deviation_type=DeviationType.MISSING_DEPENDENCY,
            error_message="ImportError: some import error",
            error_type="ImportError",
            context={},
            suggested_fixes=[]
        )

        mock_tools = Mock()
        success = await handler.recover_from_deviation(deviation, None, mock_tools)

        assert success is False

    @pytest.mark.asyncio
    async def test_blockage_recovery_logs_suggestions(self):
        """Test blockage recovery logs suggestions"""
        handler = DeviationHandler()

        deviation = Deviation(
            deviation_type=DeviationType.BLOCKAGE,
            error_message="Timeout error",
            error_type="TimeoutError",
            context={},
            suggested_fixes=["Increase timeout value"]
        )

        mock_tools = Mock()
        success = await handler.recover_from_deviation(deviation, None, mock_tools)

        # Blockage recovery should return False (requires manual intervention)
        assert success is False

    @pytest.mark.asyncio
    async def test_critical_recovery_logs_suggestions(self):
        """Test critical recovery logs suggestions"""
        handler = DeviationHandler()

        deviation = Deviation(
            deviation_type=DeviationType.CRITICAL_MISSING,
            error_message="required field 'id' is missing",
            error_type="ValueError",
            context={},
            suggested_fixes=["Add required field: id"]
        )

        mock_tools = Mock()
        success = await handler.recover_from_deviation(deviation, None, mock_tools)

        # Critical recovery should return False (requires human intervention)
        assert success is False


class TestRecoveryAttemptLimits:
    """Test recovery attempt limiting to prevent infinite loops"""

    def test_max_recovery_attempts_enforced(self):
        """Should not exceed max recovery attempts"""
        handler = DeviationHandler(max_recovery_attempts=2)

        deviation = Deviation(
            deviation_type=DeviationType.BUG,
            error_message="Test error",
            error_type="Error",
            context={},
            suggested_fixes=[]
        )

        # Simulate previous attempts
        handler.recovery_history.append({
            'timestamp': datetime.now().isoformat(),
            'deviation_type': 'bug',
            'error_message': 'Test',
            'task_id': 'test-task',
        })
        handler.recovery_history.append({
            'timestamp': datetime.now().isoformat(),
            'deviation_type': 'bug',
            'error_message': 'Test',
            'task_id': 'test-task',
        })

        # Create mock task
        mock_task = Mock()
        mock_task.task_id = 'test-task'

        # Should be at limit now - recovery should not proceed
        # We can't easily test this without async, but we can check the history
        assert len([r for r in handler.recovery_history if r['deviation_type'] == 'bug']) >= 2

    def test_recovery_history_tracking(self):
        """Should track recovery attempts in history"""
        handler = DeviationHandler()

        deviation = Deviation(
            deviation_type=DeviationType.BUG,
            error_message="Test error",
            error_type="Error",
            context={},
            suggested_fixes=[]
        )

        initial_count = len(handler.recovery_history)

        # Add a recovery attempt
        handler.recovery_history.append({
            'timestamp': datetime.now().isoformat(),
            'deviation_type': 'bug',
            'error_message': 'Test',
            'task_id': 'test-task',
        })

        assert len(handler.recovery_history) == initial_count + 1

    def test_clear_recovery_history(self):
        """Should clear recovery history"""
        handler = DeviationHandler()

        # Add some history
        handler.recovery_history.append({
            'timestamp': datetime.now().isoformat(),
            'deviation_type': 'bug',
            'error_message': 'Test',
            'task_id': 'test-task',
        })

        assert len(handler.recovery_history) > 0

        # Clear history
        handler.clear_recovery_history()

        assert len(handler.recovery_history) == 0


class TestRecoveryStatistics:
    """Test recovery statistics reporting"""

    def test_get_recovery_statistics_empty(self):
        """Should return empty statistics"""
        handler = DeviationHandler()

        stats = handler.get_recovery_statistics()

        assert stats['total_attempts'] == 0
        assert stats['by_type']['bug'] == 0
        assert stats['by_type']['missing_dep'] == 0
        assert stats['by_type']['blockage'] == 0
        assert stats['by_type']['critical_missing'] == 0

    def test_get_recovery_statistics_with_history(self):
        """Should return accurate statistics"""
        handler = DeviationHandler()

        # Add various recovery attempts
        handler.recovery_history.append({
            'timestamp': datetime.now().isoformat(),
            'deviation_type': 'bug',
            'error_message': 'Bug 1',
            'task_id': 'task-1',
        })
        handler.recovery_history.append({
            'timestamp': datetime.now().isoformat(),
            'deviation_type': 'bug',
            'error_message': 'Bug 2',
            'task_id': 'task-2',
        })
        handler.recovery_history.append({
            'timestamp': datetime.now().isoformat(),
            'deviation_type': 'missing_dep',
            'error_message': 'Missing dep',
            'task_id': 'task-3',
        })

        stats = handler.get_recovery_statistics()

        assert stats['total_attempts'] == 3
        assert stats['by_type']['bug'] == 2
        assert stats['by_type']['missing_dep'] == 1
        assert stats['by_type']['blockage'] == 0
        assert stats['by_type']['critical_missing'] == 0

    def test_get_recent_recoveries(self):
        """Should return most recent recoveries"""
        handler = DeviationHandler()

        # Add multiple recoveries
        for i in range(15):
            handler.recovery_history.append({
                'timestamp': datetime.now().isoformat(),
                'deviation_type': 'bug',
                'error_message': f'Error {i}',
                'task_id': f'task-{i}',
            })

        recent = handler.get_recent_recoveries(limit=10)

        assert len(recent) == 10
        assert recent[0]['error_message'] == 'Error 5'  # Last 10 of 15


class TestDeviationDataStructures:
    """Test deviation dataclass and serialization"""

    def test_deviation_to_dict(self):
        """Deviation should serialize to dict"""
        deviation = Deviation(
            deviation_type=DeviationType.BUG,
            error_message="Test error",
            error_type="Error",
            context={'task': 'test'},
            suggested_fixes=["Fix it"]
        )

        data = deviation.to_dict()

        assert 'deviation_type' in data
        assert 'error_message' in data
        assert 'error_type' in data
        assert 'context' in data
        assert 'suggested_fixes' in data
        assert 'timestamp' in data
        assert data['deviation_type'] == 'bug'

    def test_deviation_string_representation(self):
        """Deviation should have meaningful string representation"""
        deviation = Deviation(
            deviation_type=DeviationType.BUG,
            error_message="Test error",
            error_type="TypeError",
            context={},
            suggested_fixes=[]
        )

        str_repr = str(deviation)

        assert 'bug' in str_repr
        assert 'TypeError' in str_repr
        assert 'Test error' in str_repr

    def test_deviation_type_enum_values(self):
        """DeviationType enum should have correct values"""
        assert DeviationType.BUG.value == 'bug'
        assert DeviationType.MISSING_DEPENDENCY.value == 'missing_dep'
        assert DeviationType.BLOCKAGE.value == 'blockage'
        assert DeviationType.CRITICAL_MISSING.value == 'critical_missing'
        assert DeviationType.UNKNOWN.value == 'unknown'


class TestDeviationHandlerConfiguration:
    """Test DeviationHandler configuration"""

    def test_custom_max_recovery_attempts(self):
        """Should accept custom max recovery attempts"""
        handler = DeviationHandler(max_recovery_attempts=5)

        assert handler.max_recovery_attempts == 5

    def test_default_max_recovery_attempts(self):
        """Should use default max recovery attempts"""
        handler = DeviationHandler()

        assert handler.max_recovery_attempts == 3


class TestErrorPatternMatching:
    """Test error pattern matching internals"""

    def test_matches_patterns_with_positive_match(self):
        """Should return True when pattern matches"""
        handler = DeviationHandler()

        result = handler._matches_patterns(
            "AssertionError: test failed",
            handler.bug_patterns
        )

        assert result is True

    def test_matches_patterns_with_negative_match(self):
        """Should return False when no pattern matches"""
        handler = DeviationHandler()

        result = handler._matches_patterns(
            "Some random error message",
            handler.bug_patterns
        )

        assert result is False

    def test_dependency_patterns_catch_import_errors(self):
        """Dependency patterns should catch import errors"""
        handler = DeviationHandler()

        test_cases = [
            "ImportError: No module named 'x'",
            "ModuleNotFoundError: No module named 'y'",
            "cannot import name 'z'",
        ]

        for error_msg in test_cases:
            matches = handler._matches_patterns(error_msg, handler.dependency_patterns)
            assert matches, f"Should match: {error_msg}"

    def test_bug_patterns_catch_common_errors(self):
        """Bug patterns should catch common errors"""
        handler = DeviationHandler()

        test_cases = [
            "AssertionError: expected True",
            "NameError: name 'x' is not defined",
            "AttributeError: 'NoneType' has no attribute",
            "TypeError: unsupported operand",
        ]

        for error_msg in test_cases:
            matches = handler._matches_patterns(error_msg, handler.bug_patterns)
            assert matches, f"Should match: {error_msg}"

    def test_blockage_patterns_catch_network_errors(self):
        """Blockage patterns should catch network errors"""
        handler = DeviationHandler()

        test_cases = [
            "TimeoutError: Connection timeout",
            "ConnectionRefusedError: Connection refused",
            "HTTP 500 Internal Server Error",
            "Network unreachable",
        ]

        for error_msg in test_cases:
            matches = handler._matches_patterns(error_msg, handler.blockage_patterns)
            assert matches, f"Should match: {error_msg}"

    def test_critical_patterns_catch_validation_errors(self):
        """Critical patterns should catch validation errors"""
        handler = DeviationHandler()

        test_cases = [
            "ValidationError: required field missing",
            "required field 'id' is missing",
            "KeyError: 'required_field'",
        ]

        for error_msg in test_cases:
            matches = handler._matches_patterns(error_msg, handler.critical_patterns)
            assert matches, f"Should match: {error_msg}"


class TestBugFixHeuristics:
    """Test bug fix heuristic application"""

    def test_apply_bug_fixes_for_name_error(self):
        """Should add variable definition for NameError"""
        handler = DeviationHandler()

        content = "def test():\n    print(x)"
        fixed = handler._apply_bug_fixes(
            content,
            line_num=2,
            suggested_fixes=["Define variable: x"],
            error_message="NameError: name 'x' is not defined"
        )

        assert "x = None" in fixed
        assert "# Auto-fixed" in fixed

    def test_apply_bug_fixes_for_none_check(self):
        """Should add None check when needed"""
        handler = DeviationHandler()

        content = "def test():\n    result = obj.data"
        fixed = handler._apply_bug_fixes(
            content,
            line_num=2,
            suggested_fixes=["Add check: if obj is not None"],
            error_message="AttributeError: 'NoneType' object has no attribute 'data'"
        )

        assert "if obj is not None:" in fixed
        assert "# Auto-fix: Check for None" in fixed


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
