# Advanced Hooks System for Blackbox3
**Status**: Planning Phase

## Overview

Add Oh-My-OpenCode\'s powerful hooks system to Blackbox3. Hooks run before/after every tool execution - enabling code quality checks, automated testing, validation, and workflow automation.

## What You Get

1. **PreToolUse Hooks**: Run before tool execution (validation, linting)
2. **PostToolUse Hooks**: Run after tool execution (analysis, notifications)
3. **UserPromptSubmit Hooks**: Validate and enhance user prompts
4. **Stop Hooks**: Handle session termination

## Why This Matters

**Current**: Basic workflow hooks only
**After**: Full Claude Code compatibility with production-quality hooks

## Files to Create

### 1. Hooks Configuration

**File**: `.opencode/hooks.json`

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "pre-commit --file $FILE",
            "description": "Run pre-commit hooks before file changes"
          },
          {
            "type": "python",
            "script": "scripts/hooks/validate-changes.py",
            "args": ["$FILE"],
            "description": "Validate changes against project rules"
          }
        ]
      },
      {
        "matcher": "Read",
        "hooks": [
          {
            "type": "python",
            "script": "scripts/hooks/inject-context.py",
            "description": "Inject AGENTS.md context on file reads"
          }
        ]
      }
    ],
    
    "PostToolUse": [
      {
        "matcher": "bash",
        "hooks": [
          {
            "type": "python",
            "script": "scripts/hooks/analyze-command.py",
            "args": ["$COMMAND", "$OUTPUT"],
            "description": "Analyze bash commands for security patterns"
          }
        ]
      }
    ],
    
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python scripts/hooks/enhance-prompt.py",
            "description": "Enhance user prompt with context and best practices"
          }
        ]
      }
    ],
    
    "Stop": [
      {
        "hooks": [
          {
            "type": "python",
            "script": "scripts/hooks/session-summary.py",
            "description": "Generate session summary with next steps"
          }
        ]
      }
    ]
  }
}
```

### 2. Hook Scripts

**File**: `scripts/hooks/validate-changes.py`

```python
#!/usr/bin/env python3
"""
Pre-tool hook for validating file changes
Runs before Write/Edit operations
"""

import os
import sys
import json

def validate_changes(file_path: str, change_type: str):
    """
    Validates file changes against project rules
    """
    
    # Check for common issues
    issues = []
    
    # Check if file exists
    if not os.path.exists(file_path):
        issues.append(f"File does not exist: {file_path}")
        return False, issues
    
    # Check for sensitive data patterns
    sensitive_patterns = [
        r"password\s*=\s*['\"][^'\"]*",
        r"api[_-]?key\s*=\s*['\"][^'\"]*",
        r"secret[_-]?key\s*=\s*['\"][^'\"]*"
    ]
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    for pattern in sensitive_patterns:
        if pattern.search(content):
            issues.append(f"Potential sensitive data detected: {pattern}")
    
    # Check for file type conventions (simplified)
    ext = os.path.splitext(file_path)[1]
    
    if ext in ['.ts', '.tsx', '.js', '.jsx']:
        # TypeScript/React files should have certain patterns
        if 'console.log' in content:
            issues.append("Debug console.log found - remove before committing")
    
    if ext in ['.py', '.java', '.go']:
        # Language-specific checks
        if 'TODO' in content or 'FIXME' in content:
            issues.append(f"TODO/FIXME comments found in {file_path}")
    
    return len(issues) == 0, issues

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({
            "valid": False,
            "error": "Usage: validate-changes.py <file_path> <change_type>"
        }))
        sys.exit(1)
    
    file_path = sys.argv[1]
    change_type = sys.argv[2]
    
    valid, issues = validate_changes(file_path, change_type)
    
    print(json.dumps({
        "valid": valid,
        "issues": issues,
        "file": file_path
    }))
    sys.exit(0 if valid else 1)
```

**File**: `scripts/hooks/inject-context.py`

```python
#!/usr/bin/env python3
"""
Pre-tool hook for injecting AGENTS.md context
Runs when reading files to provide additional context
"""

import os
import sys

def inject_context(file_path: str):
    """
    Injects relevant AGENTS.md files into context when reading a file
    """
    
    if not os.path.exists(file_path):
        return None
    
    # Walk up directory tree to find all AGENTS.md files
    current_dir = os.path.dirname(file_path)
    context_parts = []
    
    while current_dir and current_dir != os.path.expanduser('~'):
        agents_file = os.path.join(current_dir, 'AGENTS.md')
        if os.path.exists(agents_file):
            with open(agents_file, 'r') as f:
                content = f.read()
                if content.strip():
                    context_parts.append(f"\n--- Context from {current_dir} ---\n{content}")
        
        parent_dir = os.path.dirname(current_dir)
        current_dir = parent_dir
    
    return '\\n'.join(context_parts) if context_parts else None

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: inject-context.py <file_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    context = inject_context(file_path)
    
    print(json.dumps({
        "context": context,
        "file": file_path
    }))
```

### 3. Integration Points

1. **Update `blackbox3` main command** to load hooks config
2. **Add hooks directory structure** to `.opencode/`
3. **Test all hook types**: PreToolUse, PostToolUse, UserPromptSubmit, Stop
4. **Document hook examples** in README

## Usage Examples

```bash
# Before editing files, validation runs automatically
blackbox3 edit README.md
# validate-changes.py runs automatically
# Checks for sensitive data, TODOs, console.logs

# After bash commands, security analysis runs
blackbox3 exec npm install
# analyze-command.py checks for security patterns

# Session summary when stopping
blackbox3 quit
# session-summary.py generates summary with next steps
```
