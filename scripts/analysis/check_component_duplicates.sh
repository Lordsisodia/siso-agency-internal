#!/bin/bash

echo "🔍 CHECKING FOR DUPLICATE COMPONENTS"
echo "====================================="
echo ""

echo "Component locations:"
echo "-------------------"
echo "1. src/components/: $(find src/components -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ') files"
echo "2. src/shared/components/: $(find src/shared/components -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ') files"
echo "3. src/ecosystem/*/components/: $(find src/ecosystem -path "*/components/*.tsx" 2>/dev/null | wc -l | tr -d ' ') files"

echo ""
echo "Looking for duplicate component names:"
echo "--------------------------------------"

# Get all .tsx files from the 3 locations
all_components=$(find src/components src/shared/components src/ecosystem -name "*.tsx" -type f 2>/dev/null)

# Extract basenames and find duplicates
echo "$all_components" | xargs -n1 basename | sort | uniq -d | head -20

echo ""
echo "Checking services complexity:"
echo "-----------------------------"
ls -1 src/services/ 2>/dev/null | head -20

echo ""
echo "Task services subdirectories:"
if [ -d "src/services/tasks" ]; then
    ls -1 src/services/tasks/ | wc -l | xargs echo "  Count:"
    ls -1 src/services/tasks/
fi

