"""
Anti-Pattern Detection Tests

Tests for the anti-pattern detector that scans code for quality issues.
Run with: python -m pytest tests/test_anti_pattern_detection.py -v
"""

import pytest
import tempfile
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from engine.core.anti_pattern_detector import (
    AntiPatternDetector,
    Severity,
    Violation
)


class TestViolation:
    """Test Violation dataclass"""

    def test_create_violation(self):
        """Test violation creation"""
        violation = Violation(
            file_path="test.py",
            line_number=42,
            pattern_name="todo",
            severity=Severity.LOW,
            line_content="# TODO: implement this",
            suggestion="Implement the feature"
        )

        assert violation.file_path == "test.py"
        assert violation.line_number == 42
        assert violation.pattern_name == "todo"
        assert violation.severity == Severity.LOW
        assert "TODO" in violation.line_content

    def test_violation_to_dict(self):
        """Test violation serialization"""
        violation = Violation(
            file_path="test.py",
            line_number=1,
            pattern_name="fixme",
            severity=Severity.HIGH,
            line_content="# FIXME: broken",
            suggestion="Fix it"
        )

        data = violation.to_dict()
        assert data["file_path"] == "test.py"
        assert data["line_number"] == 1
        assert data["pattern_name"] == "fixme"
        assert data["severity"] == "high"


class TestAntiPatternDetector:
    """Test AntiPatternDetector"""

    def test_initialization(self):
        """Test detector initialization"""
        detector = AntiPatternDetector()

        assert detector.patterns is not None
        assert 'todo' in detector.patterns
        assert 'fixme' in detector.patterns
        assert 'hardcoded_secret' in detector.patterns

    def test_custom_patterns(self):
        """Test custom pattern addition"""
        custom = {
            'custom_pattern': {
                'regex': r'CUSTOM',
                'severity': Severity.MEDIUM,
                'suggestion': 'Fix custom issue'
            }
        }

        detector = AntiPatternDetector(custom_patterns=custom)
        assert 'custom_pattern' in detector.patterns

    @pytest.fixture
    def temp_code_dir(self):
        """Create temporary directory with test code"""
        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir = Path(tmpdir)

            # Create Python files with various anti-patterns
            (tmpdir / "todo_file.py").write_text('''
def process_data(data):
    # TODO: implement proper validation
    return data

# FIXME: this is broken
def deprecated_function():
    pass
''')

            (tmpdir / "secrets.py").write_text('''
# Bad practice
password = "supersecret123"
api_key = "key_abc123def456"

def connect():
    pass
''')

            (tmpdir / "exceptions.py").write_text('''
def risky_function():
    try:
        do_something()
    except:
        pass  # Bare except

def do_something():
    raise NotImplementedError
''')

            (tmpdir / "debug.py").write_text('''
def debug_function():
    print("Debugging here")
    print(f"Variable: {x}")
    return x
''')

            (tmpdir / "clean.py").write_text('''
def clean_function(x, y):
    """This is clean code"""
    return x + y

class CleanClass:
    def method(self):
        return self.value
''')

            # Create subdirectory to test exclusion
            bad_dir = tmpdir / "venv" / "lib"
            bad_dir.mkdir(parents=True)
            (bad_dir / "bad.py").write_text('''
# TODO: should be excluded
password = "excluded"
''')

            yield tmpdir

    def test_scan_todo_pattern(self, temp_code_dir):
        """Test TODO detection"""
        detector = AntiPatternDetector()
        violations = detector.scan(temp_code_dir, file_patterns=['*.py'])

        todo_violations = [v for v in violations if v.pattern_name == 'todo']
        assert len(todo_violations) >= 1

        # Check that the TODO was found
        assert any('implement proper validation' in v.line_content for v in todo_violations)

    def test_scan_fixme_pattern(self, temp_code_dir):
        """Test FIXME detection"""
        detector = AntiPatternDetector()
        violations = detector.scan(temp_code_dir, file_patterns=['*.py'])

        fixme_violations = [v for v in violations if v.pattern_name == 'fixme']
        assert len(fixme_violations) >= 1

    def test_scan_hardcoded_secrets(self, temp_code_dir):
        """Test hardcoded secret detection"""
        detector = AntiPatternDetector()
        violations = detector.scan(temp_code_dir, file_patterns=['*.py'])

        secret_violations = [v for v in violations if v.pattern_name == 'hardcoded_secret']
        assert len(secret_violations) >= 2  # password and api_key

        # Check severity
        assert all(v.severity == Severity.CRITICAL for v in secret_violations)

    def test_scan_bare_except(self, temp_code_dir):
        """Test bare exception detection"""
        detector = AntiPatternDetector()
        violations = detector.scan(temp_code_dir, file_patterns=['*.py'])

        bare_violations = [v for v in violations if v.pattern_name == 'bare_except']
        assert len(bare_violations) >= 1

    def test_scan_not_implemented(self, temp_code_dir):
        """Test NotImplementedError detection"""
        detector = AntiPatternDetector()
        violations = detector.scan(temp_code_dir, file_patterns=['*.py'])

        not_impl_violations = [v for v in violations if v.pattern_name == 'not_implemented']
        assert len(not_impl_violations) >= 1

    def test_scan_print_debug(self, temp_code_dir):
        """Test print statement detection"""
        detector = AntiPatternDetector()
        violations = detector.scan(temp_code_dir, file_patterns=['*.py'])

        print_violations = [v for v in violations if v.pattern_name == 'debug_print']
        assert len(print_violations) >= 2  # Two print statements

    def test_exclude_directories(self, temp_code_dir):
        """Test that venv directory is excluded"""
        detector = AntiPatternDetector()
        violations = detector.scan(temp_code_dir, file_patterns=['*.py'])

        # Should not find violations in venv
        venv_violations = [v for v in violations if 'venv' in v.file_path]
        assert len(venv_violations) == 0

    def test_get_report(self, temp_code_dir):
        """Test report generation"""
        detector = AntiPatternDetector()
        violations = detector.scan(temp_code_dir, file_patterns=['*.py'])

        report = detector.get_report(violations)

        assert isinstance(report, str)
        assert "Anti-Pattern Detection Report" in report
        assert "Total Violations" in report

        if violations:
            assert any(sev in report for sev in ["CRITICAL", "HIGH", "MEDIUM"])

    def test_get_statistics(self, temp_code_dir):
        """Test statistics generation"""
        detector = AntiPatternDetector()
        violations = detector.scan(temp_code_dir, file_patterns=['*.py'])

        stats = detector.get_statistics(violations)

        assert 'total' in stats
        assert 'by_pattern' in stats
        assert 'by_severity' in stats
        assert 'top_files' in stats

        assert stats['total'] == len(violations)

    def test_filter_by_severity(self, temp_code_dir):
        """Test filtering by severity"""
        detector = AntiPatternDetector()
        violations = detector.scan(temp_code_dir, file_patterns=['*.py'])

        # Filter to only HIGH and above
        high_plus = detector.filter_by_severity(violations, Severity.HIGH)

        # Should not have LOW or INFO
        assert not any(v.severity == Severity.LOW for v in high_plus)
        assert not any(v.severity == Severity.INFO for v in high_plus)

        # Should have at least CRITICAL or HIGH
        assert len(high_plus) >= 2  # At least the secrets

    def test_filter_by_pattern(self, temp_code_dir):
        """Test filtering by pattern name"""
        detector = AntiPatternDetector()
        violations = detector.scan(temp_code_dir, file_patterns=['*.py'])

        # Filter to only TODO
        todos = detector.filter_by_pattern(violations, ['todo'])

        assert all(v.pattern_name == 'todo' for v in todos)

    def test_filter_by_file(self, temp_code_dir):
        """Test filtering by file path"""
        detector = AntiPatternDetector()
        violations = detector.scan(temp_code_dir, file_patterns=['*.py'])

        # Filter to secrets.py
        secret_violations = detector.filter_by_file(violations, 'secrets.py')

        assert all('secrets.py' in v.file_path for v in secret_violations)

    def test_empty_scan(self):
        """Test scanning empty directory"""
        with tempfile.TemporaryDirectory() as tmpdir:
            detector = AntiPatternDetector()
            violations = detector.scan(Path(tmpdir), file_patterns=['*.py'])

            assert len(violations) == 0

    def test_clean_code_no_violations(self, temp_code_dir):
        """Test that clean code produces no violations"""
        detector = AntiPatternDetector()

        # Scan only clean.py
        violations = detector.scan(
            temp_code_dir / "clean.py",
            file_patterns=['clean.py']
        )

        # Should have no violations (or only print_debug if we had prints)
        assert len(violations) == 0


class TestSeverityOrdering:
    """Test severity level ordering"""

    def test_severity_hierarchy(self):
        """Test that severity levels are properly ordered"""
        detector = AntiPatternDetector()

        # Create mock violations with different severities
        violations = [
            Violation("f1.py", 1, "p1", Severity.INFO, "info"),
            Violation("f2.py", 2, "p2", Severity.LOW, "low"),
            Violation("f3.py", 3, "p3", Severity.MEDIUM, "med"),
            Violation("f4.py", 4, "p4", Severity.HIGH, "high"),
            Violation("f5.py", 5, "p5", Severity.CRITICAL, "crit"),
        ]

        # Filter by MEDIUM should get MEDIUM, HIGH, CRITICAL
        filtered = detector.filter_by_severity(violations, Severity.MEDIUM)
        assert len(filtered) == 3
        assert all(v.severity in [Severity.MEDIUM, Severity.HIGH, Severity.CRITICAL] for v in filtered)

        # Filter by CRITICAL should get only CRITICAL
        critical = detector.filter_by_severity(violations, Severity.CRITICAL)
        assert len(critical) == 1
        assert critical[0].severity == Severity.CRITICAL


class TestMultipleFilePatterns:
    """Test scanning multiple file patterns"""

    @pytest.fixture
    def mixed_lang_dir(self):
        """Create directory with multiple file types"""
        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir = Path(tmpdir)

            (tmpdir / "script.py").write_text('''
# TODO: Python todo
password = "secret"
''')

            (tmpdir / "code.js").write_text('''
// TODO: JavaScript todo
var password = "secret";
''')

            (tmpdir / "code.ts").write_text('''
// TODO: TypeScript todo
const password = "secret";
''')

            yield tmpdir

    def test_scan_py_only(self, mixed_lang_dir):
        """Test scanning only Python files"""
        detector = AntiPatternDetector()
        violations = detector.scan(mixed_lang_dir, file_patterns=['*.py'])

        # Should only find violations in .py file
        assert len(violations) == 2  # TODO and password in Python

    def test_scan_multiple_patterns(self, mixed_lang_dir):
        """Test scanning multiple file patterns"""
        detector = AntiPatternDetector()
        violations = detector.scan(
            mixed_lang_dir,
            file_patterns=['*.py', '*.js', '*.ts']
        )

        # Should find violations in all files
        assert len(violations) >= 3  # At least one per file


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
