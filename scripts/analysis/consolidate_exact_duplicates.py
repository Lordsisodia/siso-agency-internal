#!/usr/bin/env python3
"""
Convert exact duplicate components to redirects
"""

from pathlib import Path
import hashlib

def get_file_hash(file_path):
    """Get MD5 hash"""
    try:
        return hashlib.md5(file_path.read_bytes()).hexdigest()
    except:
        return None

def get_canonical_path(paths):
    """Determine canonical path (prefer ecosystem/internal/, then shortest path)"""
    # Prefer files NOT in /dashboard/components (likely duplicates)
    non_dashboard = [p for p in paths if '/dashboard/components/' not in str(p)]
    if non_dashboard:
        # Prefer shorter path (likely more general)
        return sorted(non_dashboard, key=lambda p: len(str(p)))[0]
    return sorted(paths, key=lambda p: len(str(p)))[0]

REDIRECT_TEMPLATE = """// 🔄 DUPLICATE REDIRECT
// This file is an exact duplicate (MD5: {md5})
// Canonical: {canonical}
// Phase: Post-consolidation cleanup
// Date: 2025-10-05
export * from '{import_path}';
export {{ default }} from '{import_path}';
"""

def main():
    # Get all tsx files from the 3 locations
    from collections import defaultdict
    
    locations = [
        Path("src/components"),
        Path("src/shared/components"),
        Path("src/ecosystem")
    ]
    
    files_by_name = defaultdict(list)
    
    for location in locations:
        if location.exists():
            for file_path in location.rglob("*.tsx"):
                if "node_modules" not in str(file_path):
                    files_by_name[file_path.name].append(file_path)
    
    # Find exact duplicates
    duplicates = {name: paths for name, paths in files_by_name.items() if len(paths) > 1}
    
    exact_dupes = 0
    converted = 0
    
    print("🔄 Converting exact duplicates to redirects...")
    print("=" * 60)
    
    for name, paths in duplicates.items():
        if len(paths) != 2:
            continue
            
        hash1 = get_file_hash(paths[0])
        hash2 = get_file_hash(paths[1])
        
        if hash1 and hash2 and hash1 == hash2:
            exact_dupes += 1
            
            # Determine canonical
            canonical_path = get_canonical_path(paths)
            duplicate_path = [p for p in paths if p != canonical_path][0]
            
            # Create redirect
            import_path = str(canonical_path).replace('src/', '@/').replace('.tsx', '')
            
            redirect_content = REDIRECT_TEMPLATE.format(
                md5=hash1[:16],
                canonical=str(canonical_path),
                import_path=import_path
            )
            
            duplicate_path.write_text(redirect_content)
            converted += 1
            print(f"✅ {duplicate_path.name}")
            print(f"   {duplicate_path}")
            print(f"   → {canonical_path}")
            print()
    
    print("=" * 60)
    print(f"✅ Exact duplicates found: {exact_dupes}")
    print(f"✅ Converted to redirects: {converted}")
    print("=" * 60)

if __name__ == "__main__":
    main()

