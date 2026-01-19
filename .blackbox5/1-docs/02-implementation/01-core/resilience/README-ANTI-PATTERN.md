# Anti-Pattern Detector Module

**Automated code quality scanning for BlackBox5**

---

## Overview

The Anti-Pattern Detector module provides comprehensive code quality analysis through pattern-based scanning. It identifies common anti-patterns, security issues, and code quality problems with actionable suggestions.

**Location:** `.blackbox5/engine/core/anti_pattern_detector.py`

**Tests:** `.blackbox5/tests/test_anti_pattern_detection.py`

**Documentation:** `.blackbox5/docs/ANTI-PATTERN-DETECTION.md`

---

## Quick Start

```python
from pathlib import Path
from engine.core.anti_pattern_detector import AntiPatternDetector, Severity

# Scan codebase
detector = AntiPatternDetector()
violations = detector.scan(Path("."))

# Get critical issues
critical = detector.filter_by_severity(violations, Severity.CRITICAL)

# Generate report
print(detector.get_report(critical))
```

---

## Key Features

### Detection Capabilities

- **Security Issues:** Hardcoded secrets, credentials
- **Code Quality:** TODO/FIXME comments, hacks
- **Error Handling:** Bare exceptions, NotImplementedError
- **Best Practices:** Print statements, global variables
- **Testing:** Skipped tests, placeholder assertions

### Severity Levels

1. **CRITICAL** - Security vulnerabilities, data exposure
2. **HIGH** - Broken functionality, missing implementations
3. **MEDIUM** - Code quality issues, technical debt
4. **LOW** - Minor issues, nice-to-have improvements
5. **INFO** - Informational findings, style suggestions

### Analysis Features

- Pattern-based regex scanning
- Multi-language support (Python, JS, TS, etc.)
- Configurable detection rules
- Comprehensive filtering options
- Statistical analysis and reporting
- Multiple output formats (text, markdown, JSON)

---

## API Reference

### Main Classes

#### `AntiPatternDetector`

```python
detector = AntiPatternDetector(custom_patterns=None)
```

**Methods:**

- `scan(path, file_patterns=None, exclude_dirs=None)` - Scan directory for violations
- `get_report(violations, max_per_severity=10)` - Generate formatted report
- `get_statistics(violations)` - Get violation statistics
- `filter_by_severity(violations, min_severity)` - Filter by severity level
- `filter_by_pattern(violations, pattern_names)` - Filter by pattern names
- `filter_by_file(violations, file_path)` - Filter by file path

#### `Violation`

```python
@dataclass
class Violation:
    file_path: str
    line_number: int
    pattern_name: str
    severity: Severity
    line_content: str
    suggestion: str = ""
```

**Methods:**

- `to_dict()` - Convert to dictionary for serialization

#### `Severity`

```python
class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"
```

---

## Default Patterns

### Security (CRITICAL)

```python
'hardcoded_secret': {
    'regex': r'(password|secret|api_key|token)\s*=\s*["\'][^"\']+["\']',
    'severity': Severity.CRITICAL,
    'suggestion': 'Use environment variables or config files'
}
```

### Code Quality (HIGH/MEDIUM)

```python
'fixme': {
    'regex': r'#\s*FIXME\s*:?\s*(.+)',
    'severity': Severity.HIGH,
    'suggestion': 'Fix the issue or document why it exists'
}

'bare_except': {
    'regex': r'except\s*:',
    'severity': Severity.MEDIUM,
    'suggestion': 'Catch specific exceptions'
}
```

### Placeholders (LOW/INFO)

```python
'todo': {
    'regex': r'#\s*TODO\s*:?\s*(.+)',
    'severity': Severity.LOW,
    'suggestion': 'Implement or remove TODO'
}

'debug_print': {
    'regex': r'print\(.+\)',
    'severity': Severity.INFO,
    'suggestion': 'Use proper logging'
}
```

---

## Usage Examples

### Example 1: Basic Scan

```python
from pathlib import Path
from engine.core.anti_pattern_detector import AntiPatternDetector

detector = AntiPatternDetector()
violations = detector.scan(Path("src"))
print(f"Found {len(violations)} issues")
```

### Example 2: Security Audit

```python
detector = AntiPatternDetector()
violations = detector.scan(Path("."))

# Find security issues
secrets = [v for v in violations if v.severity == Severity.CRITICAL]

for secret in secrets:
    print(f"SECRET: {secret.file_path}:{secret.line_number}")
    print(f"  {secret.line_content}")
```

### Example 3: Quality Gate

```python
def check_quality(max_critical=0, max_high=5):
    detector = AntiPatternDetector()
    violations = detector.scan(Path("."))
    stats = detector.get_statistics(violations)
    
    if stats['by_severity']['critical'] > max_critical:
        raise Exception("Too many critical issues!")
    
    if stats['by_severity']['high'] > max_high:
        raise Exception("Too many high issues!")
    
    print("Quality check passed!")
```

### Example 4: Custom Patterns

```python
custom_patterns = {
    'deprecated_api': {
        'regex': r'old_api\.call\(',
        'severity': Severity.HIGH,
        'suggestion': 'Use new_api.call() instead'
    }
}

detector = AntiPatternDetector(custom_patterns=custom_patterns)
violations = detector.scan(Path("."))
```

### Example 5: Track Progress

```python
import json
from datetime import datetime

detector = AntiPatternDetector()
violations = detector.scan(Path("."))
stats = detector.get_statistics(violations)

report = {
    'timestamp': datetime.now().isoformat(),
    'total': stats['total'],
    'by_severity': stats['by_severity'],
    'top_files': stats['top_files']
}

with open('quality-report.json', 'w') as f:
    json.dump(report, f, indent=2)
```

---

## Testing

### Run Tests

```bash
# All tests
pytest .blackbox5/tests/test_anti_pattern_detection.py -v

# Specific test class
pytest .blackbox5/tests/test_anti_pattern_detection.py::TestAntiPatternDetector -v

# With coverage
pytest .blackbox5/tests/test_anti_pattern_detection.py --cov=.blackbox5/engine/core/anti_pattern_detector
```

### Test Coverage

The test suite includes:
- 21 tests covering all major functionality
- Pattern detection tests for each anti-pattern
- Filtering and reporting tests
- Multi-language support tests
- Edge cases and error handling

---

## Integration

### Pre-Commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

python3 << 'EOF'
from pathlib import Path
from engine.core.anti_pattern_detector import AntiPatternDetector, Severity

detector = AntiPatternDetector()
violations = detector.scan(Path("."))

critical = detector.filter_by_severity(violations, Severity.HIGH)
if critical:
    print("Found critical/high issues:")
    for v in critical[:5]:
        print(f"  {v.file_path}:{v.line_number} - {v.pattern_name}")
    exit(1)
