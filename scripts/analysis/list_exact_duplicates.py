#!/usr/bin/env python3
"""
List ALL exact duplicates with their locations and canonical path
"""

from pathlib import Path
from collections import defaultdict
import hashlib

def get_file_hash(file_path):
    """Get MD5 hash"""
    try:
        return hashlib.md5(file_path.read_bytes()).hexdigest()
    except:
        return None

def get_canonical_path(paths):
    """
    Determine canonical (prefer non-dashboard, then shortest path)
    Logic:
    1. Prefer NOT in /dashboard/components/ (likely duplicates)
    2. Prefer in domain-specific directory (admin/clients vs dashboard)
    3. Prefer shorter path
    """
    # Remove dashboard/components duplicates first
    non_dashboard = [p for p in paths if '/dashboard/components/' not in str(p)]
    if non_dashboard:
        candidates = non_dashboard
    else:
        candidates = paths
    
    # Prefer domain-specific paths
    domain_specific = [p for p in candidates if any(domain in str(p) for domain in ['/clients/', '/financials/', '/tasks/', '/outreach/', '/teams/'])]
    if domain_specific:
        return sorted(domain_specific, key=lambda p: len(str(p)))[0]
    
    # Otherwise shortest path
    return sorted(candidates, key=lambda p: len(str(p)))[0]

def main():
    # Find all tsx files
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
    duplicates = {name: paths for name, paths in files_by_name.items() if len(paths) == 2}
    
    exact_dupes = []
    
    for name, paths in sorted(duplicates.items()):
        hash1 = get_file_hash(paths[0])
        hash2 = get_file_hash(paths[1])
        
        if hash1 and hash2 and hash1 == hash2:
            canonical = get_canonical_path(paths)
            duplicate = [p for p in paths if p != canonical][0]
            exact_dupes.append((name, canonical, duplicate, hash1))
    
    # Print results
    print(f"📋 EXACT DUPLICATES TO FIX")
    print("=" * 70)
    print(f"Total found: {len(exact_dupes)}")
    print()
    
    for i, (name, canonical, duplicate, md5) in enumerate(exact_dupes, 1):
        print(f"{i}. {name}")
        print(f"   ✅ KEEP:   {canonical}")
        print(f"   ❌ DELETE: {duplicate}")
        print(f"   MD5: {md5[:12]}")
        print()
    
    # Create fix commands
    print("=" * 70)
    print("🔧 FIX COMMANDS (run one at a time, verify build after each)")
    print("=" * 70)
    print()
    
    for i, (name, canonical, duplicate, md5) in enumerate(exact_dupes, 1):
        import_path = str(canonical).replace('src/', '@/').replace('.tsx', '')
        
        print(f"# {i}. Fix {name}")
        print(f"cat > '{duplicate}' << 'EOF'")
        print(f"// 🔄 DUPLICATE REDIRECT")
        print(f"// Canonical: {canonical}")
        print(f"// MD5: {md5[:16]}")
        print(f"export * from '{import_path}';")
        print(f"export {{ default }} from '{import_path}';")
        print(f"EOF")
        print(f"npm run build && echo '✅ {name} fixed' || echo '❌ FAILED - revert'")
        print()

if __name__ == "__main__":
    main()

