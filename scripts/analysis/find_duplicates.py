#!/usr/bin/env python3
"""
Find and analyze duplicate component names across:
1. src/components/
2. src/shared/components/
3. src/ecosystem/*/components/
"""

from pathlib import Path
from collections import defaultdict
import hashlib

def get_file_hash(file_path):
    """Get MD5 hash of file content"""
    try:
        return hashlib.md5(file_path.read_bytes()).hexdigest()
    except:
        return None

def analyze_duplicates():
    # Find all .tsx files in the 3 locations
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
    
    # Find duplicates
    duplicates = {name: paths for name, paths in files_by_name.items() if len(paths) > 1}
    
    print(f"🔍 COMPONENT DUPLICATE ANALYSIS")
    print("=" * 60)
    print(f"Total unique component names: {len(files_by_name)}")
    print(f"Duplicate component names: {len(duplicates)}")
    print()
    
    # Analyze duplicates
    exact_duplicates = []
    different_implementations = []
    
    for name, paths in sorted(duplicates.items())[:30]:
        if len(paths) == 2:
            hash1 = get_file_hash(paths[0])
            hash2 = get_file_hash(paths[1])
            
            if hash1 and hash2 and hash1 == hash2:
                exact_duplicates.append((name, paths))
                print(f"⚠️  EXACT DUPLICATE: {name}")
                for p in paths:
                    print(f"    - {p}")
                print()
            else:
                different_implementations.append((name, paths))
                print(f"✅ Different implementations: {name}")
                for p in paths:
                    lines = len(p.read_text().split('\n')) if p.exists() else 0
                    print(f"    - {p} ({lines} lines)")
                print()
    
    print("=" * 60)
    print(f"📊 SUMMARY:")
    print(f"  Exact duplicates (same MD5): {len(exact_duplicates)}")
    print(f"  Different implementations: {len(different_implementations)}")
    print(f"  Total duplicates analyzed: {min(30, len(duplicates))}")
    
    if len(duplicates) > 30:
        print(f"  (Showing first 30 of {len(duplicates)} total)")
    
    return exact_duplicates, different_implementations

if __name__ == "__main__":
    exact, different = analyze_duplicates()

