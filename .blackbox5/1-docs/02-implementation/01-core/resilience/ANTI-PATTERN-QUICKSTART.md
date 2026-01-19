# Anti-Pattern Detector - Quick Start Guide

Get started with the Anti-Pattern Detection System in 5 minutes.

## Installation

The detector is included in BlackBox5 core. No additional installation needed.

## Basic Usage

### 1. Scan Your Codebase

```python
from pathlib import Path
from engine.core.anti_pattern_detector import AntiPatternDetector

# Create detector
detector = AntiPatternDetector()

# Scan directory
violations = detector.scan(Path("."))

# Print report
print(detector.get_report(violations))
```

### 2. Find Critical Issues

```python
# Get only critical and high severity issues
critical = detector.filter_by_severity(violations, Severity.HIGH)

for v in critical:
    print(f"{v.file_path}:{v.line_number} - {v.pattern_name}")
    print(f"  {v.suggestion}")
```

### 3. Get Statistics

```python
stats = detector.get_statistics(violations)

print(f"Total issues: {stats['total']}")
print(f"Critical: {stats['by_severity']['critical']}")
print(f"High: {stats['by_severity']['high']}")
print(f"Problematic files: {stats['top_files']}")
```

## Common Patterns Detected

| Pattern | Severity | Example |
|---------|----------|---------|
| `hardcoded_secret` | CRITICAL | `password = "secret123"` |
| `fixme` | HIGH | `# FIXME: broken` |
| `not_implemented` | HIGH | `raise NotImplementedError` |
| `bare_except` | MEDIUM | `except: pass` |
| `todo` | LOW | `# TODO: implement` |
| `debug_print` | INFO | `print("debug")` |

## Command Line Usage

```bash
# Scan current directory
python .blackbox5/engine/core/anti_pattern_detector.py

# Scan specific path
python .blackbox5/engine/core/anti_pattern_detector.py /path/to/code

# Show only high+ severity
python .blackbox5/engine/core/anti_pattern_detector.py --severity high
```

## Next Steps

- Read full documentation: `docs/ANTI-PATTERN-DETECTION.md`
- Run tests: `pytest .blackbox5/tests/test_anti_pattern_detection.py`
- Add custom patterns for your project
- Integrate into CI/CD pipeline

## Example Output

```
# Anti-Pattern Detection Report

**Total Violations:** 15

## CRITICAL (1)
### .blackbox5/engine/core/auth.py:42
**Pattern:** hardcoded_secret
**Suggestion:** Use environment variables or config files
```
password = "admin123"
```

## HIGH (3)
### .blackbox5/engine/core/api.py:15
**Pattern:** fixme
**Suggestion:** Fix the issue or document why it exists
```
# FIXME: handle edge case
```
...
```

## Need Help?

- Check API reference in documentation
- Review test files for examples
- Open an issue on GitHub
