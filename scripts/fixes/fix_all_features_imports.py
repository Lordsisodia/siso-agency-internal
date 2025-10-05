#!/usr/bin/env python3
"""
Fix ALL remaining @/features imports - comprehensive update
"""

import os
from pathlib import Path
import re

SRC = Path("src")

# Comprehensive mapping of all @/features to @/ecosystem
IMPORT_MAP = {
    # Projects
    '@/features/projects': '@/ecosystem/internal/projects',
    
    # Planning
    '@/features/planning': '@/ecosystem/internal/planning',
    '@/features/app-plan': '@/ecosystem/internal/app-plan',
    
    # Dashboard layout (might be in admin/dashboard)
    '@/features/dashboard/layout': '@/ecosystem/internal/admin/dashboard/layout',
    '@/features/dashboard': '@/ecosystem/internal/dashboard',
}

def fix_file(file_path):
    """Fix imports in a single file"""
    try:
        content = file_path.read_text()
        original = content
        
        # Sort by length (longest first) to avoid partial replacements
        sorted_mappings = sorted(IMPORT_MAP.items(), key=lambda x: len(x[0]), reverse=True)
        
        for old_path, new_path in sorted_mappings:
            content = content.replace(old_path, new_path)
        
        if content != original:
            file_path.write_text(content)
            return True
        return False
    except Exception as e:
        return False

def main():
    print("🔧 Fixing ALL remaining @/features imports...")
    print("=" * 60)
    
    fixed = 0
    
    for ext in ["*.ts", "*.tsx"]:
        for file_path in SRC.rglob(ext):
            if "node_modules" in str(file_path):
                continue
            if fix_file(file_path):
                fixed += 1
                print(f"✅ {file_path.relative_to(SRC)}")
    
    print()
    print("=" * 60)
    print(f"✅ Fixed: {fixed} files")
    print("=" * 60)
    
    return 0

if __name__ == "__main__":
    import sys
    sys.exit(main())

