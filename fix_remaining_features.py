#!/usr/bin/env python3
"""
Fix remaining @/features imports for additional feature domains
"""

import os
from pathlib import Path

SRC = Path("src")

# Additional feature domains that exist in ecosystem
ADDITIONAL_IMPORTS = {
    '@/features/leaderboard': '@/ecosystem/internal/leaderboard',
    '@/features/tools': '@/ecosystem/internal/tools',
    '@/features/automations': '@/ecosystem/internal/automations',
    '@/features/xp-store': '@/ecosystem/internal/xp-store',
    '@/features/client/crypto': '@/ecosystem/client/crypto',
    '@/features/claudia': '@/ecosystem/internal/claudia',
}

def fix_file(file_path):
    """Fix imports in a single file"""
    try:
        content = file_path.read_text()
        original = content
        
        for old_path, new_path in ADDITIONAL_IMPORTS.items():
            content = content.replace(old_path, new_path)
        
        if content != original:
            file_path.write_text(content)
            return True
        return False
    except Exception as e:
        return False

def main():
    print("🔧 Fixing remaining @/features imports...")
    print("=" * 60)
    
    fixed = 0
    
    for ext in ["*.ts", "*.tsx"]:
        for file_path in SRC.rglob(ext):
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

