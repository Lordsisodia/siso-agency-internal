#!/usr/bin/env bash

# Pre-tool hook: Validate file changes
# Runs before Write/Edit operations

set -e

FILE="$1"
BLACKBOX4_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [ ! -f "$FILE" ]; then
    exit 0  # File doesn't exist yet, skip validation
fi

# Check for sensitive data patterns
sensitive_patterns=(
    "password\s*=\s*['\"][^'\"]*"
    "api[_-]?key\s*=\s*['\"][^'\"]*"
    "secret[_-]?key\s*=\s*['\"][^'\"]*"
    "token\s*=\s*['\"][^'\"]*"
)

for pattern in "${sensitive_patterns[@]}"; do
    if grep -qE "$pattern" "$FILE" 2>/dev/null; then
        echo "⚠️  Warning: Potential sensitive data detected in $FILE"
    fi
done

# Check for debug statements
extension="${FILE##*.}"
if [[ "$extension" =~ ^(js|jsx|ts|tsx)$ ]]; then
    if grep -q "console.log" "$FILE" 2>/dev/null; then
        echo "⚠️  Warning: Debug console.log found in $FILE"
    fi
fi

if [[ "$extension" =~ ^(py|java|go|rs)$ ]]; then
    if grep -qE "TODO|FIXME|XXX|HACK" "$FILE" 2>/dev/null; then
        echo "⚠️  Warning: TODO/FIXME comments found in $FILE"
    fi
fi

exit 0
