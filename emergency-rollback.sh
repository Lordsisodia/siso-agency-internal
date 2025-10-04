#!/bin/bash

# 🚨 EMERGENCY ROLLBACK SCRIPT
# Use this if component consolidation breaks anything

echo "🚨 EMERGENCY ROLLBACK INITIATED"
echo "This will restore your codebase to the state before component cleanup"
echo ""

# Get current commit for reference
CURRENT_COMMIT=$(git rev-parse HEAD)
echo "📍 Current commit: $CURRENT_COMMIT"

# Show the backup commit we're rolling back to
BACKUP_COMMIT="317dab0"
echo "📦 Rolling back to backup commit: $BACKUP_COMMIT"
echo ""

# Confirm with user
read -p "⚠️  Are you sure you want to rollback? This will lose all changes since the backup. (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Rollback cancelled"
    exit 1
fi

echo "🔄 Performing rollback..."

# Stash any current changes
echo "💾 Stashing current changes..."
git stash push -m "Emergency stash before rollback - $(date)"

# Reset to backup commit
echo "⏪ Resetting to backup commit..."
git reset --hard $BACKUP_COMMIT

# Verify we're on the right commit
CURRENT_AFTER_RESET=$(git rev-parse HEAD)
if [ "$CURRENT_AFTER_RESET" = "$BACKUP_COMMIT" ]; then
    echo "✅ Successfully rolled back to $BACKUP_COMMIT"
    echo ""
    echo "🎯 Your codebase is now restored to the pre-cleanup state"
    echo "📁 All component duplicates are restored"
    echo "🚀 Your app should work exactly as before"
    echo ""
    echo "🔧 Next steps:"
    echo "   1. Test your app: npm run dev"
    echo "   2. Verify all LifeLock workflows work"
    echo "   3. If issues persist, check git stash list for additional changes"
    echo ""
    echo "📋 If you want to re-attempt cleanup:"
    echo "   1. Review the BMAD plan: COMPONENT-CONSOLIDATION-BMAD-PLAN.md"
    echo "   2. Start with smaller, incremental changes"
    echo "   3. Test after each step"
else
    echo "❌ Rollback failed - commit mismatch"
    echo "Expected: $BACKUP_COMMIT"
    echo "Actual: $CURRENT_AFTER_RESET"
    exit 1
fi