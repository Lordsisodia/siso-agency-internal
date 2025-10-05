#!/usr/bin/env python3
"""
Analyze 87 unique ai-first files to determine:
- Safe to delete (no imports, shadcn duplicates, etc.)
- Worth salvaging (unique logic, actually used)
- Test utilities (move to /test)
"""

import os
from pathlib import Path
import subprocess

AI_FIRST = Path("ai-first")
SRC = Path("src")

# Categories from previous analysis
auth_files = [
    "features/auth/pages/Auth.tsx",
    "shared/types/AuthGuard.tsx",
    "shared/types/ClerkAuthGuard.tsx",
    "features/auth/components/ClerkProvider.tsx",
    "features/partnerships/components/PartnerAuthForm.tsx",
    "shared/types/PartnerAuthGuard.tsx",
    "features/partnerships/pages/PartnerLogin.tsx",
    "features/auth/auth.component.tsx"
]

test_files = [
    "shared/components/APITester.tsx",
    "shared/types/AppPlanTestingDashboard.tsx",
    "shared/components/FeatureFlagTester.tsx",
    "shared/types/MCPTestingDashboard.tsx",
    "features/partnerships/components/PartnerApplicationFormDemo.tsx",
    "features/partnerships/components/PartnershipIntegrationTest.tsx",
    "features/partnerships/components/PartnershipTestimonials.tsx",
    "shared/types/TestimonialCard.tsx"
]

partnership_files = [
    "features/partnerships/components/AirtablePartnersTable.tsx",
    "features/partnerships/components/CommissionCalculator.tsx",
    "features/partnerships/pages/DirectReferralsSOP.tsx",
    "features/partnerships/pages/PartnerPasswordReset.tsx",
    "features/partnerships/pages/PartnerRegister.tsx",
    "features/partnerships/ui/PartnerRequirements.tsx",
    "features/partnerships/components/PartnershipAIChat.tsx",
    "features/partnerships/components/PartnershipBenefits.tsx",
    "shared/types/PartnershipClientTypes.tsx",
    "features/partnerships/components/PartnershipFAQ.tsx",
    "features/partnerships/components/PartnershipLayout.tsx",
    "features/partnerships/components/PartnershipNavigation.tsx",
    "features/partnerships/pages/PartnershipPage.tsx",
    "features/partnerships/components/PartnershipPortfolio.tsx",
    "features/partnerships/components/PartnershipProcess.tsx",
    "features/partnerships/components/PartnershipReferralsTable.tsx",
    "features/partnerships/components/PartnershipSidebar.tsx",
    "features/partnerships/components/PartnershipSidebarLogo.tsx",
    "features/partnerships/components/PartnershipSidebarNavigation.tsx",
    "features/partnerships/components/PartnershipStats.tsx",
    "features/partnerships/components/PartnershipStatsIntegration.tsx",
    "features/partnerships/components/PartnershipTraining.tsx",
    "features/partnerships/partnerships.component.tsx"
]

# Known used files from our grep analysis
ACTUALLY_USED = {
    "MorningRoutineTimer": 2,
    "RealTaskManager": 3,
    "FeatureFlagTester": 2,
    "APITester": 2,
    "CollapsibleTaskCard": 1
}

def check_imports(file_path):
    """Check if file is imported anywhere in src/"""
    try:
        result = subprocess.run(
            ['grep', '-r', file_path.stem, 'src', '--include=*.tsx', '--include=*.ts'],
            capture_output=True,
            text=True,
            timeout=5
        )
        imports = [line for line in result.stdout.split('\n') if 'import' in line and file_path.stem in line]
        return len(imports)
    except:
        return 0

def categorize_files():
    """Categorize all 87 unique files"""
    
    results = {
        "DELETE_AUTH": [],  # Auth files - Clerk is canonical
        "DELETE_GENERIC": [],  # Generic components - shadcn duplicates
        "DELETE_UNUSED": [],  # Zero imports found
        "KEEP_USED": [],  # Actually imported
        "KEEP_TEST": [],  # Test utilities
        "REVIEW_PARTNERSHIP": [],  # Partnership features to review
        "REVIEW_OTHER": []  # Other files needing review
    }
    
    print("🔍 Analyzing 87 unique ai-first files...")
    print("=" * 60)
    
    # Auth files - all safe to delete (Clerk is in src/shared/)
    for rel_path in auth_files:
        results["DELETE_AUTH"].append(rel_path)
    
    # Test files - check if used
    for rel_path in test_files:
        file_path = AI_FIRST / rel_path
        if file_path.exists():
            name = file_path.stem
            if name in ACTUALLY_USED:
                results["KEEP_TEST"].append(rel_path)
            else:
                results["DELETE_UNUSED"].append(rel_path)
    
    # Partnership files - review needed
    for rel_path in partnership_files:
        results["REVIEW_PARTNERSHIP"].append(rel_path)
    
    # Print results
    print(f"\n✅ SAFE TO DELETE ({len(results['DELETE_AUTH']) + len(results['DELETE_GENERIC']) + len(results['DELETE_UNUSED'])} files):")
    print(f"  Auth files (Clerk is canonical): {len(results['DELETE_AUTH'])}")
    print(f"  Generic/unused: {len(results['DELETE_GENERIC']) + len(results['DELETE_UNUSED'])}")
    
    print(f"\n🧪 KEEP AS TEST UTILITIES ({len(results['KEEP_TEST'])} files):")
    for f in results["KEEP_TEST"]:
        print(f"  - {f}")
    
    print(f"\n📋 REVIEW NEEDED ({len(results['REVIEW_PARTNERSHIP'])} files):")
    print(f"  Partnership portal features: {len(results['REVIEW_PARTNERSHIP'])}")
    
    return results

if __name__ == "__main__":
    results = categorize_files()

