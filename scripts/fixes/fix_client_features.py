#!/usr/bin/env python3
"""
Fix all client-facing and external feature imports
"""

from pathlib import Path

SRC = Path("src")

# Client and external feature mappings
CLIENT_MAPPINGS = {
    '@/features/client/earn': '@/ecosystem/client/earn',
    '@/features/client/crypto': '@/ecosystem/client/crypto',
    '@/features/client/instagram': '@/ecosystem/client/instagram',
    '@/features/client/client-app': '@/ecosystem/client/client-app',
    '@/features/client/client': '@/ecosystem/client/client',
    '@/features/portfolio': '@/ecosystem/client/portfolio',
    '@/features/profile': '@/ecosystem/internal/profile',
    '@/features/feedback': '@/ecosystem/internal/feedback',
    '@/features/partnerships': '@/ecosystem/external/partnerships',
    '@/features/services': '@/ecosystem/internal/services',
}

def fix_file(file_path):
    """Fix imports in a single file"""
    try:
        content = file_path.read_text()
        original = content
        
        # Sort by length to avoid partial replacements
        sorted_mappings = sorted(CLIENT_MAPPINGS.items(), key=lambda x: len(x[0]), reverse=True)
        
        for old_path, new_path in sorted_mappings:
            content = content.replace(old_path, new_path)
        
        if content != original:
            file_path.write_text(content)
            return True
        return False
    except:
        return False

def main():
    print("🔧 Fixing client/external feature imports...")
    print("=" * 60)
    
    fixed = 0
    
    for ext in ["*.ts", "*.tsx"]:
        for file_path in SRC.rglob(ext):
            if "node_modules" not in str(file_path):
                if fix_file(file_path):
                    fixed += 1
                    print(f"✅ {file_path.relative_to(SRC)}")
    
    print()
    print("=" * 60)
    print(f"✅ Fixed: {fixed} files")
    print("=" * 60)

if __name__ == "__main__":
    main()

