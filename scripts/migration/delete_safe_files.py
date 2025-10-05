#!/usr/bin/env python3
"""
Delete safe ai-first files:
- Auth files (8) - Clerk is canonical in src/shared/
- Generic UI components (shadcn duplicates)
- Unused test/demo files
"""

import os
from pathlib import Path

AI_FIRST = Path("ai-first")

# SAFE TO DELETE - Auth files (Clerk is canonical)
auth_to_delete = [
    "features/auth/pages/Auth.tsx",
    "shared/types/AuthGuard.tsx",
    "shared/types/ClerkAuthGuard.tsx",
    "features/auth/components/ClerkProvider.tsx",
    "features/partnerships/components/PartnerAuthForm.tsx",
    "shared/types/PartnerAuthGuard.tsx",
    "features/partnerships/pages/PartnerLogin.tsx",
    "features/auth/auth.component.tsx"
]

# SAFE TO DELETE - Generic components (shadcn duplicates)
generic_to_delete = [
    "shared/ui/Button.component.tsx",  # shadcn has Button
    "shared/ui/Modal.component.tsx",  # shadcn has Dialog
    "shared/ui/FormField.component.tsx",  # shadcn has Form
    "shared/types/card.tsx",  # shadcn has Card
    "shared/types/animated-card.tsx",  # custom variant
    "shared/types/glass-card.tsx",  # custom variant
    "shared/types/glowing-card.tsx",  # custom variant
    "shared/types/hover-card.tsx",  # shadcn has HoverCard
    "shared/types/pricing-card.tsx",  # custom variant
    "shared/types/command.tsx",  # shadcn has Command
]

# SAFE TO DELETE - Unused test/demo files
unused_to_delete = [
    "shared/types/AppPlanTestingDashboard.tsx",  # Not imported
    "shared/types/MCPTestingDashboard.tsx",  # Not imported
    "features/partnerships/components/PartnerApplicationFormDemo.tsx",  # Demo
    "features/partnerships/components/PartnershipIntegrationTest.tsx",  # Test
    "features/partnerships/components/PartnershipTestimonials.tsx",  # Not imported
    "shared/types/TestimonialCard.tsx",  # Not imported
]

# SAFE TO DELETE - Unused feature files
feature_to_delete = [
    "features/admin/admin.component.tsx",  # Not imported
    "features/clients/clients.component.tsx",  # Not imported
    "features/lifelock/lifelock.component.tsx",  # Not imported
    "features/tasks/tasks.component.tsx",  # Not imported
    "features/partnerships/partnerships.component.tsx",  # Not imported
]

# SAFE TO DELETE - Unused type/card files
type_to_delete = [
    "shared/types/NFTCard.tsx",
    "shared/types/NFTGalleryGrid.tsx",
    "shared/types/PortfolioCard.tsx",
    "shared/types/SkillPathCard.tsx",
    "shared/types/UpcomingTaskCard.tsx",
    "shared/types/CommunityMemberCard.tsx",
    "shared/types/NetworkingGrid.tsx",
    "shared/types/ParticlesBackground.tsx",
    "shared/types/ThinkingDots.tsx",
    "shared/types/waves-background.tsx",
    "shared/types/feature-section-with-bento-grid.tsx",
]

# SAFE TO DELETE - Unused dashboard files
dashboard_to_delete = [
    "shared/types/ClientDashboard.tsx",
    "shared/types/RealUsageDashboard.tsx",
    "shared/types/SupervisorDashboard.tsx",
    "shared/types/SwarmDashboard.tsx",
    "shared/types/TeamWorkflowDashboard.tsx",
    "shared/types/UsageDashboard.tsx",
]

# SAFE TO DELETE - Template/misc
misc_to_delete = [
    "ai-tools/templates/component.template.tsx",
    "features/auth/components/ClientRoute.tsx",
    "features/auth/components/ProtectedRoute.tsx",
    "features/auth/components/EmailSignInButton.tsx",
    "features/auth/components/GoogleSignInButton.tsx",
    "features/auth/components/SignOutButton.tsx",
    "features/auth/components/SocialMediaModal.tsx",
]

def delete_files():
    all_to_delete = (
        auth_to_delete +
        generic_to_delete +
        unused_to_delete +
        feature_to_delete +
        type_to_delete +
        dashboard_to_delete +
        misc_to_delete
    )
    
    print(f"🗑️  Deleting {len(all_to_delete)} safe files...")
    print("=" * 60)
    
    deleted = 0
    not_found = 0
    
    for rel_path in all_to_delete:
        file_path = AI_FIRST / rel_path
        if file_path.exists():
            file_path.unlink()
            deleted += 1
            print(f"✅ {rel_path}")
        else:
            not_found += 1
    
    print()
    print("=" * 60)
    print(f"✅ Deleted: {deleted}")
    print(f"⚠️  Not found: {not_found}")
    print("=" * 60)
    
    return deleted

if __name__ == "__main__":
    deleted = delete_files()

