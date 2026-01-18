#!/bin/bash

echo "=== FINAL ACCURATE DUPLICATE ANALYSIS ===" > /tmp/final-accurate-report.txt
echo "Generated: $(date)" >> /tmp/final-accurate-report.txt
echo "" >> /tmp/final-accurate-report.txt

# Script to check each duplicate accurately
cat > /tmp/accurate-check.sh << 'ACCURATEEOF'
#!/bin/bash
name=$1
comp_path=$2
dom_path=$3

# Full paths
comp_full="src/$comp_path"
dom_full="src/$dom_path"

# Check if files exist
comp_exists=0
dom_exists=0

[ -f "$comp_full" ] && comp_exists=1
[ -f "$dom_full" ] && dom_exists=1

if [ $comp_exists -eq 0 ] && [ $dom_exists -eq 0 ]; then
    echo "SKIP|$name|Both files not found"
    exit 0
fi

if [ $comp_exists -eq 0 ]; then
    echo "INFO|$name|Component file not found: $comp_path"
    exit 0
fi

if [ $dom_exists -eq 0 ]; then
    echo "INFO|$name|Domains file not found: $dom_path"
    exit 0
fi

# Check if domains file is a re-export
dom_content=$(cat "$dom_full" 2>/dev/null)
if echo "$dom_content" | grep -q "export.*from.*@/components/"; then
    echo "RE-EXPORT-DOMAINS|$name|$comp_path|$dom_path|Domains re-exports from components"
    exit 0
fi

# Check if components file is a re-export
comp_content=$(cat "$comp_full" 2>/dev/null)
if echo "$comp_content" | grep -q "export.*from.*@/domains/"; then
    echo "RE-EXPORT-COMP|$name|$comp_path|$dom_path|Components re-exports from domains"
    exit 0
fi

# Count exact imports - EXCLUDING the duplicate files themselves
comp_basename=$(basename "$comp_path" .tsx)
comp_imports=$(grep -r "from '@/components/${comp_path#components/}'" src/ 2>/dev/null | \
    grep -v "node_modules" | \
    grep -v "$comp_full" | \
    grep -v "$dom_full" | \
    wc -l | tr -d ' ')

dom_imports=$(grep -r "from '@/domains/${dom_path#domains/}'" src/ 2>/dev/null | \
    grep -v "node_modules" | \
    grep -v "$comp_full" | \
    grep -v "$dom_full" | \
    wc -l | tr -d ' ')

# Categorize
if [ "$comp_imports" -eq 0 ] && [ "$dom_imports" -eq 0 ]; then
    echo "SAFE-DELETE-BOTH|$name|$comp_path|$dom_path|Both unused (dead code)"
elif [ "$comp_imports" -eq 0 ] && [ "$dom_imports" -gt 0 ]; then
    echo "SAFE-DELETE-COMP|$name|$comp_path|$dom_path|Component unused (0 imports), Domains used ($dom_imports imports)"
elif [ "$comp_imports" -gt 0 ] && [ "$dom_imports" -eq 0 ]; then
    echo "SAFE-DELETE-DOM|$name|$comp_path|$dom_path|Component used ($comp_imports imports), Domains unused"
else
    echo "NEEDS-REVIEW|$name|$comp_path|$dom_path|Both used (component: $comp_imports, domains: $dom_imports)"
fi
ACCURATEEOF

chmod +x /tmp/accurate-check.sh

# List of all 61 duplicates
duplicates=(
    "AffiliateLayout:components/ui/dashboard/AffiliateLayout.tsx:domains/admin/dashboard/components/AffiliateLayout.tsx"
    "AffiliateLeaderboard:components/ui/dashboard/pages/AffiliateLeaderboard.tsx:domains/admin/dashboard/pages/AffiliateLeaderboard.tsx"
    "AppPlanGenerator:components/ui/dashboard/pages/dashboard/AppPlanGenerator.tsx:domains/admin/dashboard/pages/AppPlanGenerator.tsx"
    "AppPlanMicroChat:components/ui/dashboard/AppPlanMicroChat.tsx:domains/admin/dashboard/components/AppPlanMicroChat.tsx"
    "Clients:components/ui/dashboard/pages/dashboard/Clients.tsx:domains/admin/dashboard/pages/Clients.tsx"
    "ClientsOverviewCard:components/ui/dashboard/cards/ClientsOverviewCard.tsx:domains/admin/dashboard/components/ClientsOverviewCard.tsx"
    "ComingSoonSection:components/ui/dashboard/ComingSoonSection.tsx:domains/admin/dashboard/components/ComingSoonSection.tsx"
    "CustomCalendar:components/ui/calendar/CustomCalendar.tsx:domains/lifelock/1-daily/_shared/components/ui/CustomCalendar.tsx"
    "DashboardCard:components/ui/dashboard/DashboardCard.tsx:domains/admin/dashboard/components/DashboardCard.tsx"
    "DashboardHeader:components/ui/dashboard/DashboardHeader.tsx:domains/admin/dashboard/components/DashboardHeader.tsx"
    "DashboardHelpCenter:components/ui/dashboard/DashboardHelpCenter.tsx:domains/admin/dashboard/components/DashboardHelpCenter.tsx"
    "DashboardLayout:components/ui/dashboard/layout/DashboardLayout.tsx:domains/admin/dashboard/components/DashboardLayout.tsx"
    "DashboardNavbar:components/ui/dashboard/layout/DashboardNavbar.tsx:domains/admin/dashboard/components/DashboardNavbar.tsx"
    "DashboardStats:components/ui/dashboard/DashboardStats.tsx:domains/admin/dashboard/components/DashboardStats.tsx"
    "EducationHub:components/ui/dashboard/pages/dashboard/EducationHub.tsx:domains/admin/dashboard/pages/EducationHub.tsx"
    "EnhancedActivityFeed:components/ui/dashboard/EnhancedActivityFeed.tsx:domains/admin/dashboard/components/EnhancedActivityFeed.tsx"
    "EnhancedProgressCard:components/ui/dashboard/EnhancedProgressCard.tsx:domains/admin/dashboard/components/EnhancedProgressCard.tsx"
    "FutureIsHereHero:components/ui/dashboard/FutureIsHereHero.tsx:domains/admin/dashboard/components/FutureIsHereHero.tsx"
    "HelpSupportCard:components/ui/dashboard/HelpSupportCard.tsx:domains/admin/dashboard/components/HelpSupportCard.tsx"
    "IncidentReportDemo:components/ui/dashboard/pages/dashboard/IncidentReportDemo.tsx:domains/admin/dashboard/pages/IncidentReportDemo.tsx"
    "LeaderboardFilters:components/ui/dashboard/LeaderboardFilters.tsx:domains/admin/dashboard/components/LeaderboardFilters.tsx"
    "LeaderboardPreviewCard:components/ui/dashboard/LeaderboardPreviewCard.tsx:domains/admin/dashboard/components/LeaderboardPreviewCard.tsx"
    "LeaderboardStats:components/ui/dashboard/LeaderboardStats.tsx:domains/admin/dashboard/components/LeaderboardStats.tsx"
    "LeaderboardTable:components/ui/dashboard/LeaderboardTable.tsx:domains/admin/dashboard/components/LeaderboardTable.tsx"
    "MainProjectCard:components/ui/dashboard/MainProjectCard.tsx:domains/admin/dashboard/components/MainProjectCard.tsx"
    "MasonryDashboard:components/ui/dashboard/MasonryDashboard.tsx:domains/admin/dashboard/components/MasonryDashboard.tsx"
    "NotificationBell:components/ui/dashboard/NotificationBell.tsx:domains/admin/dashboard/components/NotificationBell.tsx"
    "NotificationsCard:components/ui/dashboard/NotificationsCard.tsx:domains/admin/dashboard/components/NotificationsCard.tsx"
    "OutlineGenerator:components/ui/dashboard/pages/dashboard/OutlineGenerator.tsx:domains/admin/dashboard/pages/OutlineGenerator.tsx"
    "PartnerAdvancement:components/ui/dashboard/pages/dashboard/components/PartnerAdvancement.tsx:domains/agency/partners/pages/PartnerAdvancement.tsx"
    "PartnerBreadcrumbs:components/ui/dashboard/PartnerBreadcrumbs.tsx:domains/admin/dashboard/components/PartnerBreadcrumbs.tsx"
    "PartnerHeader:components/ui/dashboard/PartnerHeader.tsx:domains/admin/dashboard/components/PartnerHeader.tsx"
    "PartnerLayout:components/ui/dashboard/PartnerLayout.tsx:domains/admin/dashboard/components/PartnerLayout.tsx"
    "PartnerLeaderboard:components/ui/dashboard/PartnerLeaderboard.tsx:domains/admin/dashboard/components/PartnerLeaderboard.tsx"
    "PartnerOnboarding:components/ui/dashboard/PartnerOnboarding.tsx:domains/admin/dashboard/components/PartnerOnboarding.tsx"
    "PartnerSidebar:components/ui/dashboard/PartnerSidebar.tsx:domains/admin/dashboard/components/PartnerSidebar.tsx"
    "PlanBuilderCard:components/ui/dashboard/PlanBuilderCard.tsx:domains/admin/dashboard/ui/PlanBuilderCard.tsx"
    "PortfolioSection:components/ui/dashboard/pages/dashboard/PortfolioSection.tsx:domains/admin/dashboard/pages/PortfolioSection.tsx"
    "PreviewSectionsDashboard:components/ui/dashboard/PreviewSectionsDashboard.tsx:domains/admin/dashboard/components/PreviewSectionsDashboard.tsx"
    "PriorityTasksCard:components/ui/dashboard/cards/PriorityTasksCard.tsx:domains/admin/dashboard/components/PriorityTasksCard.tsx"
    "ProgressTracker:components/ui/dashboard/ProgressTracker.tsx:domains/admin/dashboard/components/ProgressTracker.tsx"
    "ProjectProgressCards:components/ui/dashboard/ProjectProgressCards.tsx:domains/admin/dashboard/components/ProjectProgressCards.tsx"
    "ProjectsOverviewCard:components/ui/dashboard/cards/ProjectsOverviewCard.tsx:domains/admin/dashboard/components/ProjectsOverviewCard.tsx"
    "QuickActions:components/ui/dashboard/QuickActions.tsx:domains/admin/dashboard/ui/QuickActions.tsx"
    "QuickActionsGrid:components/ui/dashboard/QuickActionsGrid.tsx:domains/admin/dashboard/ui/QuickActionsGrid.tsx"
    "RecentActivityCard:components/ui/dashboard/cards/RecentActivityCard.tsx:domains/admin/dashboard/components/RecentActivityCard.tsx"
    "ReferralsManagement:components/ui/dashboard/pages/dashboard/ReferralsManagement.tsx:domains/admin/dashboard/pages/ReferralsManagement.tsx"
    "RevenueCard:components/ui/dashboard/cards/RevenueCard.tsx:domains/admin/dashboard/components/RevenueCard.tsx"
    "StatCard:components/ui/dashboard/StatCard.tsx:domains/admin/dashboard/components/StatCard.tsx"
    "StatCards:components/ui/dashboard/cards/StatCards.tsx:domains/admin/dashboard/components/StatCards.tsx"
    "StatsCard:components/ui/dashboard/StatsCard.tsx:domains/admin/dashboard/components/StatsCard.tsx"
    "StatsRow:components/ui/dashboard/StatsRow.tsx:domains/admin/dashboard/components/StatsRow.tsx"
    "Support:components/ui/dashboard/pages/dashboard/Support.tsx:domains/admin/dashboard/pages/Support.tsx"
    "SupportShowcase:components/ui/dashboard/SupportShowcase.tsx:domains/admin/dashboard/components/SupportShowcase.tsx"
    "TaskManager:components/TaskManager.tsx:domains/task-ui/management/TaskManager.tsx"
    "TrainingHub:components/ui/dashboard/pages/dashboard/TrainingHub.tsx:domains/admin/dashboard/pages/TrainingHub.tsx"
    "TrainingHubShowcase:components/ui/dashboard/TrainingHubShowcase.tsx:domains/admin/dashboard/components/TrainingHubShowcase.tsx"
    "UnifiedSidebar:components/ui/dashboard/UnifiedSidebar.tsx:domains/admin/dashboard/components/UnifiedSidebar.tsx"
    "WelcomeHeader:components/ui/dashboard/WelcomeHeader.tsx:domains/admin/dashboard/components/WelcomeHeader.tsx"
    "dashboard-greeting-card:components/ui/dashboard-greeting-card.tsx:domains/admin/dashboard/ui/dashboard-greeting-card.tsx"
    "dashboard-templates:components/ui/dashboard-templates.tsx:domains/admin/dashboard/ui/dashboard-templates.tsx"
)

# Process duplicates
declare -a category_safe_delete_comp
declare -a category_safe_delete_both
declare -a category_reexport_domains
declare -a category_reexport_comp
declare -a category_review

for duplicate in "${duplicates[@]}"; do
    IFS=':' read -r name comp_path dom_path <<< "$duplicate"
    result=$(/tmp/accurate-check.sh "$name" "$comp_path" "$dom_path")

    IFS='|' read -r category n c p reason <<< "$result"

    case "$category" in
        "SAFE-DELETE-COMP")
            category_safe_delete_comp+=("$n|$c|$p|$reason")
            ;;
        "SAFE-DELETE-BOTH")
            category_safe_delete_both+=("$n|$c|$p|$reason")
            ;;
        "RE-EXPORT-DOMAINS")
            category_reexport_domains+=("$n|$c|$p|$reason")
            ;;
        "RE-EXPORT-COMP")
            category_reexport_comp+=("$n|$c|$p|$reason")
            ;;
        "NEEDS-REVIEW")
            category_review+=("$n|$c|$p|$reason")
            ;;
        "SKIP"|"INFO")
            ;;
    esac
done

# Generate report
echo "=== EXECUTIVE SUMMARY ===" >> /tmp/final-accurate-report.txt
echo "Total Duplicates Analyzed: ${#duplicates[@]}" >> /tmp/final-accurate-report.txt
echo "" >> /tmp/final-accurate-report.txt

total_safe=$((${#category_safe_delete_comp[@]} + ${#category_safe_delete_both[@]}))
total_reexport=$((${#category_reexport_domains[@]} + ${#category_reexport_comp[@]}))

echo "CATEGORY A: Safe to Delete - COMPONENT VERSION ($total_safe files)" >> /tmp/final-accurate-report.txt
echo "  These component versions are unused and can be safely deleted" >> /tmp/final-accurate-report.txt
echo "  The domains version is the canonical source (or re-exports from components)" >> /tmp/final-accurate-report.txt
echo "" >> /tmp/final-accurate-report.txt

echo "  A1: Component unused, Domains used (${#category_safe_delete_comp[@]} files)" >> /tmp/final-accurate-report.txt
for item in "${category_safe_delete_comp[@]}"; do
    IFS='|' read -r n c p reason <<< "$item"
    echo "    DELETE: src/$c" >> /tmp/final-accurate-report.txt
done

echo "" >> /tmp/final-accurate-report.txt
echo "  A2: Both unused - dead code (${#category_safe_delete_both[@]} files)" >> /tmp/final-accurate-report.txt
for item in "${category_safe_delete_both[@]}"; do
    IFS='|' read -r n c p reason <<< "$item"
    echo "    DELETE: src/$c (also consider: src/$p)" >> /tmp/final-accurate-report.txt
done

echo "" >> /tmp/final-accurate-report.txt
echo "CATEGORY B: Re-export Pattern ($total_reexport files)" >> /tmp/final-accurate-report.txt
echo "  These are intentional re-exports - KEEP both files" >> /tmp/final-accurate-report.txt
echo "" >> /tmp/final-accurate-report.txt

echo "  B1: Domains re-exports from Components (${#category_reexport_domains[@]} files)" >> /tmp/final-accurate-report.txt
echo "  (Components is canonical, Domains is a redirect)" >> /tmp/final-accurate-report.txt
for item in "${category_reexport_domains[@]}"; do
    IFS='|' read -r n c p reason <<< "$item"
    echo "    KEEP BOTH: src/$c <- src/$p" >> /tmp/final-accurate-report.txt
done

echo "" >> /tmp/final-accurate-report.txt
echo "  B2: Components re-exports from Domains (${#category_reexport_comp[@]} files)" >> /tmp/final-accurate-report.txt
echo "  (Domains is canonical, Components is a redirect)" >> /tmp/final-accurate-report.txt
for item in "${category_reexport_comp[@]}"; do
    IFS='|' read -r n c p reason <<< "$item"
    echo "    KEEP BOTH: src/$c <- src/$p" >> /tmp/final-accurate-report.txt
done

echo "" >> /tmp/final-accurate-report.txt
echo "CATEGORY C: Needs Manual Review (${#category_review[@]} files)" >> /tmp/final-accurate-report.txt
echo "  Both versions are imported - need to determine source of truth" >> /tmp/final-accurate-report.txt
echo "" >> /tmp/final-accurate-report.txt
for item in "${category_review[@]}"; do
    IFS='|' read -r n c p reason <<< "$item"
    echo "    REVIEW: $n" >> /tmp/final-accurate-report.txt
    echo "      Component: src/$c" >> /tmp/final-accurate-report.txt
    echo "      Domains:   src/$p" >> /tmp/final-accurate-report.txt
    echo "      Reason:   $reason" >> /tmp/final-accurate-report.txt
done

echo "" >> /tmp/final-accurate-report.txt
echo "=== RECOMMENDATION ===" >> /tmp/final-accurate-report.txt
echo "" >> /tmp/final-accurate-report.txt
echo "1. Delete $total_safe component files (CATEGORY A)" >> /tmp/final-accurate-report.txt
echo "2. Keep $total_reexport re-export files (CATEGORY B)" >> /tmp/final-accurate-report.txt
echo "3. Manually review ${#category_review[@]} files (CATEGORY C)" >> /tmp/final-accurate-report.txt

cat /tmp/final-accurate-report.txt
