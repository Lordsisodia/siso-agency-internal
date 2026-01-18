#!/bin/bash

# Script to delete 31 unused duplicate component files
# Based on comprehensive duplicate analysis performed on 2026-01-18

set -e  # Exit on error

echo "=========================================="
echo "  Deleting 31 Unused Duplicate Files"
echo "=========================================="
echo ""
echo "This will delete files that have ZERO imports."
echo "These are confirmed dead code and safe to remove."
echo ""

# Ask for confirmation
read -p "Continue with deletion? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "Creating backup stash..."
git stash push -m "backup before deleting 31 unused duplicates" || echo "No git repo or nothing to stash"

echo ""
echo "Deleting files..."
echo ""

# Counter
deleted=0

# Array of files to delete
files=(
    "src/components/ui/dashboard/pages/AffiliateLeaderboard.tsx"
    "src/components/ui/dashboard/pages/dashboard/AppPlanGenerator.tsx"
    "src/components/ui/dashboard/pages/dashboard/Clients.tsx"
    "src/components/ui/dashboard/ComingSoonSection.tsx"
    "src/components/ui/dashboard/layout/DashboardLayout.tsx"
    "src/components/ui/dashboard/DashboardStats.tsx"
    "src/components/ui/dashboard/pages/dashboard/EducationHub.tsx"
    "src/components/ui/dashboard/EnhancedProgressCard.tsx"
    "src/components/ui/dashboard/pages/dashboard/IncidentReportDemo.tsx"
    "src/components/ui/dashboard/LeaderboardFilters.tsx"
    "src/components/ui/dashboard/LeaderboardPreviewCard.tsx"
    "src/components/ui/dashboard/LeaderboardStats.tsx"
    "src/components/ui/dashboard/LeaderboardTable.tsx"
    "src/components/ui/dashboard/MainProjectCard.tsx"
    "src/components/ui/dashboard/MasonryDashboard.tsx"
    "src/components/ui/dashboard/pages/dashboard/OutlineGenerator.tsx"
    "src/components/ui/dashboard/pages/dashboard/components/PartnerAdvancement.tsx"
    "src/components/ui/dashboard/PartnerBreadcrumbs.tsx"
    "src/components/ui/dashboard/PartnerHeader.tsx"
    "src/components/ui/dashboard/PartnerLayout.tsx"
    "src/components/ui/dashboard/PartnerOnboarding.tsx"
    "src/components/ui/dashboard/PartnerSidebar.tsx"
    "src/components/ui/dashboard/pages/dashboard/PortfolioSection.tsx"
    "src/components/ui/dashboard/cards/PriorityTasksCard.tsx"
    "src/components/ui/dashboard/cards/ProjectsOverviewCard.tsx"
    "src/components/ui/dashboard/pages/dashboard/ReferralsManagement.tsx"
    "src/components/ui/dashboard/pages/dashboard/Support.tsx"
    "src/components/TaskManager.tsx"
    "src/components/ui/dashboard/pages/dashboard/TrainingHub.tsx"
    "src/components/ui/dashboard-greeting-card.tsx"
    "src/components/ui/dashboard-templates.tsx"
)

# Delete each file
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "  ✓ Deleted: $file"
        ((deleted++))
    else
        echo "  ⚠ Skipped (not found): $file"
    fi
done

echo ""
echo "=========================================="
echo "  Deleted $deleted files"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Run tests: npm test"
echo "  2. If tests pass, commit changes"
echo "  3. If issues arise, restore from git stash"
echo ""
