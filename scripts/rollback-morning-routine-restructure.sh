#!/bin/bash
# 🔄 ROLLBACK SCRIPT - Morning Routine Restructure
# Emergency rollback if restructure breaks something

set -e  # Exit on any error

echo "🚨 EMERGENCY ROLLBACK - Morning Routine Restructure"
echo "=================================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Confirm rollback
echo -e "${YELLOW}⚠️  This will UNDO all morning routine restructure changes${NC}"
echo -e "${YELLOW}⚠️  You will lose any work since branching${NC}"
echo ""
read -p "Are you sure you want to rollback? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${GREEN}✅ Rollback cancelled${NC}"
    exit 0
fi

echo ""
echo "Starting rollback process..."
echo ""

# Step 1: Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" = "feature/morning-routine-domain-structure" ]; then
    echo -e "${YELLOW}🔄 Switching back to emergency-directory-restructure branch${NC}"
    git checkout emergency-directory-restructure
    echo -e "${GREEN}✅ Switched branches${NC}"
else
    echo -e "${YELLOW}⚠️  Not on feature branch, proceeding with caution${NC}"
fi

echo ""

# Step 2: Delete feature branch if exists
if git show-ref --verify --quiet refs/heads/feature/morning-routine-domain-structure; then
    echo "🗑️  Deleting feature branch..."
    git branch -D feature/morning-routine-domain-structure
    echo -e "${GREEN}✅ Feature branch deleted${NC}"
fi

echo ""

# Step 3: Verify backup exists
BACKUP_DIR="backups/before-morning-routine-restructure-2025-10-12"
if [ -d "$BACKUP_DIR" ]; then
    echo "📦 Backup found: $BACKUP_DIR"
    du -sh "$BACKUP_DIR"
    echo -e "${GREEN}✅ Backup available if needed${NC}"
else
    echo -e "${RED}❌ WARNING: Backup directory not found!${NC}"
    echo "Backup should be at: $BACKUP_DIR"
fi

echo ""

# Step 4: Show status
echo "📊 Current git status:"
git status --short

echo ""

# Step 5: Final verification
echo -e "${GREEN}✅ ROLLBACK COMPLETE${NC}"
echo ""
echo "You are now back on: $(git branch --show-current)"
echo "All changes from feature branch have been discarded"
echo ""
echo "To restore from local backup if needed:"
echo "  rm -rf src/ecosystem/internal/lifelock"
echo "  cp -r $BACKUP_DIR/lifelock-complete/ src/ecosystem/internal/lifelock/"
echo ""
echo "Recommend: Test the app to ensure everything works"
echo "  npm run dev"
echo ""
