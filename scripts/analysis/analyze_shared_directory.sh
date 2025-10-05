#!/bin/bash

echo "🔍 ANALYZING /shared DIRECTORY"
echo "=============================="
echo ""

echo "Subdirectories in /shared:"
echo "-------------------------"
ls -1 src/shared/ | head -30

echo ""
echo "Potentially misplaced (domain-specific) directories:"
echo "---------------------------------------------------"

# Check for domain-specific code in shared
for dir in ai chat notion-editor features; do
    if [ -d "src/shared/$dir" ]; then
        files=$(find "src/shared/$dir" -name "*.tsx" -o -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
        echo "  ⚠️  /shared/$dir/ - $files files (domain-specific?)"
    fi
done

echo ""
echo "What SHOULD be in /shared:"
echo "-------------------------"
echo "  ✅ /hooks - Truly reusable hooks"
echo "  ✅ /ui - Generic UI components (shadcn)"
echo "  ✅ /lib - Utility functions"
echo "  ✅ /utils - General utilities"
echo "  ✅ /types - Shared type definitions"
echo "  ✅ /services - Generic services (auth, database)"

echo ""
echo "What should NOT be in /shared:"
echo "------------------------------"
echo "  ❌ /ai - Domain feature (move to ecosystem/internal/ai)"
echo "  ❌ /chat - Domain feature (move to ecosystem/internal/chat)"
echo "  ❌ /features - Specific features (move to ecosystem)"
echo "  ❌ /notion-editor - External integration (move to integrations)"

