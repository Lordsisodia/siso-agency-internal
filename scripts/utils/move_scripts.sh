#!/bin/bash

echo "🔧 Moving scripts..."
echo "==================="

# Migration scripts
echo "Migration scripts → scripts/migration/"
mv migrate_*.py scripts/migration/ 2>/dev/null
mv delete_safe_files.py scripts/migration/ 2>/dev/null
mv salvage_*.py scripts/migration/ 2>/dev/null
mv restore_*.py scripts/migration/ 2>/dev/null
mv restore_*.sh scripts/migration/ 2>/dev/null
mv quick_restore.sh scripts/migration/ 2>/dev/null
echo "  ✅ Moved migration scripts"

# Analysis scripts
echo "Analysis scripts → scripts/analysis/"
mv analyze_*.py scripts/analysis/ 2>/dev/null
mv analyze_*.sh scripts/analysis/ 2>/dev/null
mv check_*.sh scripts/analysis/ 2>/dev/null
mv list_*.py scripts/analysis/ 2>/dev/null
mv comprehensive_check.sh scripts/analysis/ 2>/dev/null
mv deep_verification.sh scripts/analysis/ 2>/dev/null
echo "  ✅ Moved analysis scripts"

# Fix scripts
echo "Fix scripts → scripts/fixes/"
mv fix_*.py scripts/fixes/ 2>/dev/null
mv fix_*.sh scripts/fixes/ 2>/dev/null
mv update_imports.sh scripts/fixes/ 2>/dev/null
echo "  ✅ Moved fix scripts"

# Verification scripts
echo "Verification scripts → scripts/verification/"
mv verify_*.sh scripts/verification/ 2>/dev/null
mv test_*.sh scripts/verification/ 2>/dev/null
mv runtime_check.sh scripts/verification/ 2>/dev/null
mv final_analysis.sh scripts/verification/ 2>/dev/null
echo "  ✅ Moved verification scripts"

# Utility scripts
echo "Utility scripts → scripts/utils/"
mv emergency-rollback.sh scripts/utils/ 2>/dev/null
mv find_*.sh scripts/utils/ 2>/dev/null
mv honest_analysis.sh scripts/utils/ 2>/dev/null
mv move_docs.sh scripts/utils/ 2>/dev/null
echo "  ✅ Moved utility scripts"

echo ""
echo "==================="
echo "✅ Scripts organized"

