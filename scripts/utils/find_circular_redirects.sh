#!/bin/bash

echo "🔍 Finding circular redirects..."
echo "================================"

# Find all files with redirect pattern
for file in $(find src/ecosystem -name "*.tsx" -exec grep -l "🔄 DUPLICATE REDIRECT" {} \;); do
    # Get the canonical path from the redirect comment
    canonical=$(grep "Canonical:" "$file" | sed 's/.*Canonical: //' | tr -d ' ')
    
    # Get the actual file path
    actual=$(echo "$file" | sed 's|^\./||')
    
    # Check if they're the same (circular)
    if [ "$canonical" = "$actual" ]; then
        echo "⚠️ CIRCULAR: $actual"
    fi
done

echo ""
echo "Done"

