# Anti-Pattern Detection System

**Version:** 1.0.0
**Last Updated:** 2026-01-19
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Supported Anti-Patterns](#supported-anti-patterns)
4. [Usage](#usage)
5. [Configuration](#configuration)
6. [Integration](#integration)
7. [API Reference](#api-reference)
8. [Examples](#examples)

---

## Overview

The Anti-Pattern Detection System provides automated code quality scanning for the BlackBox5 codebase. It identifies common anti-patterns, security issues, and code quality problems with actionable suggestions for improvement.

### Key Features

- **Pattern-Based Detection:** Regex-based scanning for common code issues
- **Severity Classification:** Issues categorized by severity (CRITICAL, HIGH, MEDIUM, LOW, INFO)
- **Multi-Language Support:** Python, JavaScript, TypeScript, and more
- **Configurable Patterns:** Add custom patterns for project-specific needs
- **Comprehensive Reporting:** Text, Markdown, and JSON output formats
- **Fast Scanning:** Efficient recursive directory traversal with exclusion support

---

## Features

### Detection Patterns

The detector identifies the following anti-patterns:

| Pattern | Severity | Description |
|---------|----------|-------------|
| `todo` | LOW | Unimplemented features marked with TODO |
| `fixme` | HIGH | Known issues requiring fixes |
| `hack` | MEDIUM | Temporary workarounds that should be refactored |
| `xxx` | HIGH | Critical issues requiring attention |
| `not_implemented` | HIGH | Methods raising NotImplementedError |
| `hardcoded_secret` | CRITICAL | Hardcoded passwords, API keys, tokens |
| `debug_print` | INFO | Print statements that should use logging |
| `bare_except` | MEDIUM | Bare exception handlers (except:) |
| `global_variable` | LOW | Global variables that should be constants |
| `noqa_comment` | INFO | Pytest noqa comments (review needed) |
| `pytest_todo` | MEDIUM | Skipped or xfailed tests |

### Filtering & Analysis

- **Filter by Severity:** Show only issues above a certain severity level
- **Filter by Pattern:** Focus on specific anti-pattern types
- **Filter by File:** Analyze specific files or directories
- **Statistics:** Get summary reports and top problematic files

---

## Supported Anti-Patterns

### CRITICAL Severity

#### Hardcoded Secrets
```python
# BAD
password = "supersecret123"
api_key = "key_abc123def456"

# GOOD
import os
password = os.getenv('PASSWORD')
api_key = os.getenv('API_KEY')
```

### HIGH Severity

#### NotImplemented Errors
```python
# BAD
def process_data(data):
    raise NotImplementedError

# GOOD
def process_data(data):
    # Implement actual logic
    return transform(data)
```

#### FIXME Comments
```python
# BAD
# FIXME: This breaks with empty lists
def process(items):
    return items[0]

# GOOD
def process(items):
    """Process first item safely."""
    if not items:
        return None
    return items[0]
```

### MEDIUM Severity

#### Bare Exception Handlers
```python
# BAD
try:
    risky_operation()
except:
    pass

# GOOD
try:
    risky_operation()
except ValueError as e:
    logger.warning(f"Invalid value: {e}")
```

#### HACK Comments
```python
# BAD
# HACK: Quick fix for the race condition
time.sleep(1)

# GOOD
# Use proper synchronization
with lock:
    shared_resource.update()
```

---

## Usage

### Command Line Interface

```bash
# Scan current directory (Python files only)
python -m engine.core.anti_pattern_detector

# Scan specific path
python -m engine.core.anti_pattern_detector /path/to/code

# Specify output format
python -m engine.core.anti_pattern_detector --format markdown

# Filter by severity
python -m engine.core.anti_pattern_detector --severity high
```

### Python API

#### Basic Scanning

```python
from pathlib import Path
from engine.core.anti_pattern_detector import AntiPatternDetector

# Create detector
detector = AntiPatternDetector()

# Scan codebase
violations = detector.scan(
    path=Path("."),
    file_patterns=["*.py"],  # Optional: specific file patterns
    exclude_dirs=["venv", "node_modules"]  # Optional: directories to exclude
)

# Generate report
report = detector.get_report(violations)
print(report)
```

#### Get Statistics

```python
detector = AntiPatternDetector()
violations = detector.scan(Path("."))

# Get summary statistics
stats = detector.get_statistics(violations)
print(f"Total violations: {stats['total']}")
print(f"By pattern: {stats['by_pattern']}")
print(f"By severity: {stats['by_severity']}")
print(f"Top files: {stats['top_files']}")
```

#### Filter Results

```python
detector = AntiPatternDetector()
violations = detector.scan(Path("."))

# Filter by severity
critical_issues = detector.filter_by_severity(
    violations,
    Severity.CRITICAL
)

# Filter by pattern
todos = detector.filter_by_pattern(violations, ['todo', 'fixme'])

# Filter by file
file_issues = detector.filter_by_file(violations, 'auth.py')
```

---

## Configuration

### Custom Patterns

Add project-specific patterns:

```python
from engine.core.anti_pattern_detector import AntiPatternDetector, Severity

custom_patterns = {
    'deprecated_function': {
        'regex': r'deprecated_function\(',
        'severity': Severity.HIGH,
        'suggestion': 'Replace with new_function()'
    },
    'legacy_import': {
        'regex': r'from old_module import',
        'severity': Severity.MEDIUM,
        'suggestion': 'Update to new_module imports'
    }
}

detector = AntiPatternDetector(custom_patterns=custom_patterns)
```

### File Patterns

Scan specific file types:

```python
# Only Python files
detector.scan(path, file_patterns=['*.py'])

# Multiple languages
detector.scan(path, file_patterns=['*.py', '*.js', '*.ts'])

# All files
detector.scan(path, file_patterns=['*'])
```

### Directory Exclusion

Exclude directories from scanning:

```python
detector.scan(
    path,
    exclude_dirs=[
        'venv', '.venv', 'env',
        'node_modules',
        '.git',
        '__pycache__',
        'dist', 'build'
    ]
)
```

---

## Integration

### Pre-Commit Hook

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
echo "Running anti-pattern detection..."

python -m engine.core.anti_pattern_detector --severity high

if [ $? -ne 0 ]; then
    echo "Code quality issues found. Please fix before committing."
    exit 1
fi
```

### CI/CD Pipeline

Add to GitHub Actions (`.github/workflows/quality.yml`):

```yaml
name: Code Quality

on: [push, pull_request]

jobs:
  anti-patterns:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - run: pip install -r requirements.txt
      - run: python -m engine.core.anti_pattern_detector --severity high
```

### Agent Integration

Use within BlackBox5 agents:

```python
from engine.core.anti_pattern_detector import AntiPatternDetector

class CodeQualityAgent(BaseAgent):
    def analyze_codebase(self, path):
        detector = AntiPatternDetector()
        violations = detector.scan(path)
        
        critical = detector.filter_by_severity(
            violations,
            Severity.CRITICAL
        )
        
        if critical:
            return self.create_action_plan(critical)
        
        return {"status": "clean", "violations": len(violations)}
```

---

## API Reference

### AntiPatternDetector

Main detector class for scanning codebases.

#### Methods

##### `__init__(custom_patterns=None)`

Initialize detector with optional custom patterns.

**Parameters:**
- `custom_patterns` (dict, optional): Custom patterns to add/override

**Example:**
```python
detector = AntiPatternDetector(custom_patterns={
    'custom': {'regex': r'PATTERN', 'severity': Severity.HIGH}
})
```

##### `scan(path, file_patterns=None, exclude_dirs=None)`

Scan directory for anti-patterns.

**Parameters:**
- `path` (Path): Root directory to scan
- `file_patterns` (list, optional): Glob patterns (default: `['*.py', '*.js', '*.ts']`)
- `exclude_dirs` (list, optional): Directories to exclude

**Returns:**
- `List[Violation]`: List of violations found

**Example:**
```python
violations = detector.scan(
    Path("src"),
    file_patterns=["*.py"],
    exclude_dirs=["tests"]
)
```

##### `get_report(violations, max_per_severity=10)`

Generate human-readable report.

**Parameters:**
- `violations` (List[Violation]): Violations to report
- `max_per_severity` (int): Max violations per severity level

**Returns:**
- `str`: Formatted report

##### `get_statistics(violations)`

Get violation statistics.

**Parameters:**
- `violations` (List[Violation]): Violations to analyze

**Returns:**
- `dict`: Statistics dictionary with keys:
  - `total`: Total violations
  - `by_pattern`: Count by pattern type
  - `by_severity`: Count by severity level
  - `top_files`: Files with most violations

##### `filter_by_severity(violations, min_severity)`

Filter violations by minimum severity.

**Parameters:**
- `violations` (List[Violation]): Violations to filter
- `min_severity` (Severity): Minimum severity to include

**Returns:**
- `List[Violation]`: Filtered violations

##### `filter_by_pattern(violations, pattern_names)`

Filter violations by pattern names.

**Parameters:**
- `violations` (List[Violation]): Violations to filter
- `pattern_names` (List[str]): Pattern names to include

**Returns:**
- `List[Violation]`: Filtered violations

##### `filter_by_file(violations, file_path)`

Filter violations by file path.

**Parameters:**
- `violations` (List[Violation]): Violations to filter
- `file_path` (str): File path to match (partial)

**Returns:**
- `List[Violation]`: Filtered violations

### Violation

Dataclass representing a single violation.

#### Attributes

- `file_path` (str): Path to file with violation
- `line_number` (int): Line number of violation
- `pattern_name` (str): Name of the pattern matched
- `severity` (Severity): Severity level
- `line_content` (str): The actual line of code
- `suggestion` (str, optional): Suggested fix

#### Methods

##### `to_dict()`

Convert violation to dictionary.

**Returns:**
- `dict`: Violation data as dictionary

### Severity

Enum of severity levels.

#### Values

- `Severity.CRITICAL`: Critical security/functional issues
- `Severity.HIGH`: Important issues that should be fixed
- `Severity.MEDIUM`: Code quality issues
- `Severity.LOW`: Minor issues
- `Severity.INFO`: Informational findings

---

## Examples

### Example 1: Scan and Report

```python
from pathlib import Path
from engine.core.anti_pattern_detector import AntiPatternDetector

# Scan current directory
detector = AntiPatternDetector()
violations = detector.scan(Path("."))

# Print report
print(detector.get_report(violations))

# Print statistics
stats = detector.get_statistics(violations)
print(f"Found {stats['total']} violations")
print(f"Top file: {list(stats['top_files'].keys())[0]}")
```

### Example 2: Find Security Issues

```python
detector = AntiPatternDetector()
violations = detector.scan(Path("."))

# Get only critical issues
secrets = detector.filter_by_severity(
    violations,
    Severity.CRITICAL
)

for violation in secrets:
    print(f"Secret in {violation.file_path}:{violation.line_number}")
    print(f"  {violation.line_content}")
```

### Example 3: Track Progress

```python
from datetime import datetime

def track_quality_over_time():
    detector = AntiPatternDetector()
    violations = detector.scan(Path("."))
    
    stats = detector.get_statistics(violations)
    
    with open('quality_log.csv', 'a') as f:
        f.write(f"{datetime.now()},{stats['total']},")
        f.write(f"{stats['by_severity'].get('critical', 0)},")
        f.write(f"{stats['by_severity'].get('high', 0)}\n")
```

### Example 4: Custom Quality Gate

```python
def quality_gate(max_critical=0, max_high=5):
    detector = AntiPatternDetector()
    violations = detector.scan(Path("."))
    
    stats = detector.get_statistics(violations)
    
    critical = stats['by_severity'].get('critical', 0)
    high = stats['by_severity'].get('high', 0)
    
    if critical > max_critical:
        raise Exception(f"Too many critical issues: {critical}")
    
    if high > max_high:
        raise Exception(f"Too many high issues: {high}")
    
    print("Quality gate passed!")
    return True
```

---

## Best Practices

1. **Run Regularly:** Integrate into CI/CD pipeline
2. **Start Critical:** Focus on CRITICAL and HIGH severity first
3. **Customize:** Add project-specific patterns
4. **Track Trends:** Monitor violation counts over time
5. **Fix Systematically:** Address issues by severity, not file
6. **Document:** Add suppression comments with reasons when necessary

---

## Testing

Run the test suite:

```bash
# Run all tests
python -m pytest .blackbox5/tests/test_anti_pattern_detection.py -v

# Run specific test
python -m pytest .blackbox5/tests/test_anti_pattern_detection.py::TestAntiPatternDetector::test_scan_hardcoded_secrets -v

# Run with coverage
python -m pytest .blackbox5/tests/test_anti_pattern_detection.py --cov=engine.core.anti_pattern_detector
```

---

## Contributing

To add new detection patterns:

1. Update `DEFAULT_PATTERNS` in `anti_pattern_detector.py`
2. Add tests in `test_anti_pattern_detection.py`
3. Update this documentation
4. Run tests to verify

Example:

```python
'new_pattern': {
    'regex': re.compile(r'YOUR_REGEX_HERE'),
    'severity': Severity.MEDIUM,
    'suggestion': 'Your suggestion text'
}
```

---

## License

MIT License - See LICENSE file for details
