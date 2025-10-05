#!/usr/bin/env python3
"""
Migrate final 9 /features files:
- 5 files → redirects (exist in ecosystem)
- 2 files → migrate to ecosystem (heavily used)
- 1 file → delete (unused)
- 1 file → check then decide
"""

import os
from pathlib import Path
import shutil

FEATURES = Path("src/features")
ECOSYSTEM = Path("src/ecosystem")

REDIRECT_TEMPLATE = """// 🔄 DUPLICATE REDIRECT
// This file has been consolidated to the canonical location
// Canonical: {canonical_path}
// Phase: 4.4 - Final Features Cleanup
// Date: 2025-10-05
export * from '{import_path}';
export {{ default }} from '{import_path}';
"""

# Files that exist in ecosystem - convert to redirects
REDIRECT_MAP = {
    "multi-tenant/partnership/PartnershipPortal.tsx": "src/ecosystem/partnership/PartnershipPortal.tsx",
    "multi-tenant/client/ClientPortal.tsx": "src/ecosystem/client/ClientPortal.tsx",
    "ai-assistant/features/auth/components/PartnerAuthGuard.tsx": "src/ecosystem/external/partnerships/components/PartnerAuthGuard.tsx",
    "ai-assistant/features/dashboard/components/ComingSoonSection.tsx": "src/ecosystem/internal/admin/dashboard/components/ComingSoonSection.tsx",
    "ai-assistant/features/dashboard/components/PartnerLeaderboard.tsx": "src/ecosystem/internal/admin/dashboard/components/PartnerLeaderboard.tsx",
}

# Files to migrate to ecosystem
MIGRATE_MAP = {
    "tasks/components/UnifiedTaskCard.tsx": "src/ecosystem/internal/tasks/components/UnifiedTaskCard.tsx",
    "tasks/components/UnifiedWorkSection.tsx": "src/ecosystem/internal/tasks/components/UnifiedWorkSection.tsx",
}

def create_redirect(features_rel_path, ecosystem_path):
    """Create redirect file"""
    features_file = FEATURES / features_rel_path
    
    # Get import path
    import_path = ecosystem_path.replace("src/", "@/").replace(".tsx", "")
    
    redirect_content = REDIRECT_TEMPLATE.format(
        canonical_path=ecosystem_path,
        import_path=import_path
    )
    
    features_file.write_text(redirect_content)
    print(f"✅ {features_rel_path} → redirect")

def migrate_file(features_rel_path, ecosystem_path):
    """Move file to ecosystem"""
    features_file = FEATURES / features_rel_path
    ecosystem_file = Path(ecosystem_path)
    
    # Create directory
    ecosystem_file.parent.mkdir(parents=True, exist_ok=True)
    
    # Copy file
    shutil.copy2(features_file, ecosystem_file)
    
    # Create redirect
    import_path = ecosystem_path.replace("src/", "@/").replace(".tsx", "")
    redirect_content = REDIRECT_TEMPLATE.format(
        canonical_path=ecosystem_path,
        import_path=import_path
    )
    features_file.write_text(redirect_content)
    
    print(f"✅ {features_rel_path} → {ecosystem_path}")

def delete_file(features_rel_path):
    """Delete unused file"""
    features_file = FEATURES / features_rel_path
    if features_file.exists():
        features_file.unlink()
        print(f"🗑️  {features_rel_path} (deleted - unused)")

def main():
    print("🚀 Final /features Cleanup")
    print("=" * 60)
    
    # Create redirects
    print("\n📋 Creating redirects (5 files)...")
    for rel_path, eco_path in REDIRECT_MAP.items():
        create_redirect(rel_path, eco_path)
    
    # Migrate files
    print("\n💾 Migrating to ecosystem (2 files)...")
    for rel_path, eco_path in MIGRATE_MAP.items():
        migrate_file(rel_path, eco_path)
    
    # Delete unused
    print("\n🗑️  Deleting unused files...")
    delete_file("multi-tenant/shared/TenantSwitcher.tsx")
    
    # LandingPageRouter - check usage
    print("\n⚠️  LandingPageRouter: 2 imports - keeping for now")
    
    print("\n" + "=" * 60)
    print("✅ Migration complete!")
    print("Converted: 7 files")
    print("Deleted: 1 file")
    print("Remaining: 1 file (LandingPageRouter - needs review)")
    
    return 0

if __name__ == "__main__":
    import sys
    sys.exit(main())

