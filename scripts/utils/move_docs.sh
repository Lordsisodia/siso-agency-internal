#!/bin/bash

echo "📚 Moving documentation files..."
echo "================================"

# Migration reports
echo "Migration reports → docs/migration-reports/"
mv PHASE-*.md docs/migration-reports/ 2>/dev/null
mv CONSOLIDATION-COMPLETE.md docs/migration-reports/ 2>/dev/null
mv CODEBASE-HEALTH-REPORT.md docs/migration-reports/ 2>/dev/null
mv DEEP-VERIFICATION-REPORT.md docs/migration-reports/ 2>/dev/null
mv ACTUAL-COMPLETION-REPORT.md docs/migration-reports/ 2>/dev/null
mv VERIFICATION-SUMMARY.md docs/migration-reports/ 2>/dev/null
mv README-CONSOLIDATION.md docs/migration-reports/ 2>/dev/null
mv README-FINAL.md docs/migration-reports/ 2>/dev/null
echo "  ✅ Moved 10 migration reports"

# Decision records
echo "Decision records → docs/decisions/"
mv COMPLETION-PLAN.md docs/decisions/ 2>/dev/null
mv WHATS-LEFT-TODO.md docs/decisions/ 2>/dev/null
mv codebase_honest_review.md docs/decisions/ 2>/dev/null
mv ROOT-CLEANUP-PLAN.md docs/decisions/ 2>/dev/null
echo "  ✅ Moved 4 decision records"

# Guides
echo "Guides → docs/guides/"
mv AI-AGENT-GUIDE.md docs/guides/ 2>/dev/null
mv CODEBASE.md docs/guides/ 2>/dev/null
mv COMPONENT-REGISTRY.md docs/guides/ 2>/dev/null
echo "  ✅ Moved 3 guides"

echo ""
echo "================================"
echo "✅ Documentation organized"

