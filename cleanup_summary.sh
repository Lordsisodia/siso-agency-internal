#!/bin/bash

echo "🧹 CLEANUP SUMMARY"
echo "=================="
echo ""

echo "Files Organized:"
echo "----------------"
echo "docs/migration-reports/: $(find docs/migration-reports -type f 2>/dev/null | wc -l | tr -d ' ') files"
echo "docs/decisions/: $(find docs/decisions -type f 2>/dev/null | wc -l | tr -d ' ') files"
echo "docs/guides/: $(find docs/guides -type f 2>/dev/null | wc -l | tr -d ' ') files"
echo "scripts/migration/: $(find scripts/migration -type f 2>/dev/null | wc -l | tr -d ' ') files"
echo "scripts/analysis/: $(find scripts/analysis -type f 2>/dev/null | wc -l | tr -d ' ') files"
echo "scripts/fixes/: $(find scripts/fixes -type f 2>/dev/null | wc -l | tr -d ' ') files"
echo "scripts/verification/: $(find scripts/verification -type f 2>/dev/null | wc -l | tr -d ' ') files"
echo "scripts/utils/: $(find scripts/utils -type f 2>/dev/null | wc -l | tr -d ' ') files"
echo ".archive/legacy-config/: $(find .archive/legacy-config -type d -maxdepth 1 2>/dev/null | wc -l | tr -d ' ') directories"
echo "tests/manual/: $(find tests/manual -type f 2>/dev/null | wc -l | tr -d ' ') files"

echo ""
echo "Root Directory Status:"
echo "---------------------"
echo "Total visible items: $(ls -1 | wc -l | tr -d ' ')"
echo "Hidden config dirs: $(ls -1a | grep '^\.' | grep -v '^\.$\|^\.\.$\|^\.git$' | wc -l | tr -d ' ')"

