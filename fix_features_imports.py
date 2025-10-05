#!/usr/bin/env python3
"""
Fix all @/features imports to point to correct @/ecosystem locations
"""

import os
import re
from pathlib import Path

SRC = Path("src")

# Map of old @/features imports to new @/ecosystem imports
IMPORT_MAP = {
    # Migrated files in Phase 3
    '@/features/tasks/components/UnifiedTaskCard': '@/ecosystem/internal/tasks/components/UnifiedTaskCard',
    '@/features/tasks/components/UnifiedWorkSection': '@/ecosystem/internal/tasks/components/UnifiedWorkSection',
    '@/features/multi-tenant/shared/LandingPageRouter': '@/ecosystem/internal/admin/routing/LandingPageRouter',
    '@/features/multi-tenant/client/ClientPortal': '@/ecosystem/client/ClientPortal',
    '@/features/multi-tenant/partnership/PartnershipPortal': '@/ecosystem/partnership/PartnershipPortal',
    
    # Common redirected paths
    '@/features/admin/dashboard/components': '@/ecosystem/internal/admin/dashboard/components',
    '@/features/tasks/components': '@/ecosystem/internal/tasks/components',
    '@/features/tasks/ui': '@/ecosystem/internal/tasks/ui',
    '@/features/tasks/hooks': '@/ecosystem/internal/tasks/hooks',
    '@/features/tasks/pages': '@/ecosystem/internal/tasks/pages',
    '@/features/tasks/types': '@/ecosystem/internal/tasks/types',
    '@/features/tasks/utils': '@/ecosystem/internal/tasks/utils',
    '@/features/lifelock': '@/ecosystem/internal/lifelock',
    '@/features/admin': '@/ecosystem/internal/admin',
}

def fix_file(file_path):
    """Fix imports in a single file"""
    try:
        content = file_path.read_text()
        original = content
        
        # Replace each import pattern
        for old_path, new_path in IMPORT_MAP.items():
            # Match the old import path
            content = content.replace(old_path, new_path)
        
        if content != original:
            file_path.write_text(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    print("🔧 Fixing @/features imports...")
    print("=" * 60)
    
    fixed = 0
    skipped = 0
    
    # Process all TypeScript files
    for file_path in SRC.rglob("*.ts"):
        if fix_file(file_path):
            fixed += 1
            print(f"✅ {file_path.relative_to(SRC)}")
        else:
            skipped += 1
    
    for file_path in SRC.rglob("*.tsx"):
        if fix_file(file_path):
            fixed += 1
            print(f"✅ {file_path.relative_to(SRC)}")
        else:
            skipped += 1
    
    print()
    print("=" * 60)
    print(f"✅ Fixed: {fixed} files")
    print(f"⏭️  Skipped: {skipped} files (no changes needed)")
    print("=" * 60)
    
    return 0

if __name__ == "__main__":
    import sys
    sys.exit(main())

