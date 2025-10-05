#!/usr/bin/env python3
"""
Safe batch fix: Convert 263 exact duplicates to redirects
Tests after EACH conversion, reverts on failure
"""

from pathlib import Path
from collections import defaultdict
import hashlib
import subprocess
import sys

REDIRECT_TEMPLATE = """// 🔄 DUPLICATE REDIRECT
// This file is an exact duplicate (MD5: {md5})
// Canonical: {canonical}
// Phase: Duplicate cleanup batch
// Date: 2025-10-05
export * from '{import_path}';
export {{ default }} from '{import_path}';
"""

def get_file_hash(file_path):
    try:
        return hashlib.md5(file_path.read_bytes()).hexdigest()
    except:
        return None

def get_canonical_path(paths):
    """Prefer domain-specific over dashboard/components"""
    non_dashboard = [p for p in paths if '/dashboard/components/' not in str(p)]
    if non_dashboard:
        return sorted(non_dashboard, key=lambda p: len(str(p)))[0]
    return sorted(paths, key=lambda p: len(str(p)))[0]

def test_build():
    """Quick TypeScript check (faster than full build)"""
    try:
        result = subprocess.run(
            ['npx', 'tsc', '--noEmit'],
            capture_output=True,
            timeout=60,
            text=True
        )
        return result.returncode == 0
    except:
        return False

def convert_to_redirect(duplicate_path, canonical_path, md5):
    """Convert file to redirect"""
    # Save original
    original_content = duplicate_path.read_text()
    
    # Create redirect
    import_path = str(canonical_path).replace('src/', '@/').replace('.tsx', '')
    redirect_content = REDIRECT_TEMPLATE.format(
        md5=md5[:16],
        canonical=str(canonical_path),
        import_path=import_path
    )
    
    # Write redirect
    duplicate_path.write_text(redirect_content)
    
    return original_content

def main():
    print("🔧 SAFE BATCH DUPLICATE FIX")
    print("=" * 70)
    print("Strategy: Convert one at a time, test after each")
    print()
    
    # Find all duplicates
    locations = [Path("src/components"), Path("src/shared/components"), Path("src/ecosystem")]
    files_by_name = defaultdict(list)
    
    for location in locations:
        if location.exists():
            for file_path in location.rglob("*.tsx"):
                if "node_modules" not in str(file_path):
                    files_by_name[file_path.name].append(file_path)
    
    duplicates = {name: paths for name, paths in files_by_name.items() if len(paths) == 2}
    
    # Find exact duplicates
    exact_dupes = []
    for name, paths in sorted(duplicates.items()):
        hash1 = get_file_hash(paths[0])
        hash2 = get_file_hash(paths[1])
        if hash1 and hash2 and hash1 == hash2:
            canonical = get_canonical_path(paths)
            duplicate = [p for p in paths if p != canonical][0]
            exact_dupes.append((name, canonical, duplicate, hash1))
    
    print(f"Found {len(exact_dupes)} exact duplicates to fix")
    print()
    
    # Process each duplicate
    success_count = 0
    failure_count = 0
    failed_files = []
    
    for i, (name, canonical, duplicate, md5) in enumerate(exact_dupes, 1):
        print(f"[{i}/{len(exact_dupes)}] {name}...")
        
        # Convert to redirect
        original_content = convert_to_redirect(duplicate, canonical, md5)
        
        # Test TypeScript (fast check)
        if test_build():
            success_count += 1
            print(f"  ✅ Success")
        else:
            # Revert
            duplicate.write_text(original_content)
            failure_count += 1
            failed_files.append(name)
            print(f"  ❌ Failed - reverted")
        
        # Progress update every 25
        if i % 25 == 0:
            print()
            print(f"  Progress: {i}/{len(exact_dupes)}")
            print(f"  Success: {success_count}, Failed: {failure_count}")
            print()
    
    # Final summary
    print()
    print("=" * 70)
    print("FINAL RESULTS:")
    print(f"  ✅ Successfully converted: {success_count}")
    print(f"  ❌ Failed (reverted): {failure_count}")
    print(f"  Total processed: {len(exact_dupes)}")
    print(f"  Success rate: {(success_count/len(exact_dupes)*100):.1f}%")
    
    if failed_files:
        print()
        print(f"Failed files (need manual review):")
        for f in failed_files[:20]:
            print(f"  - {f}")
        if len(failed_files) > 20:
            print(f"  ... and {len(failed_files)-20} more")
    
    print("=" * 70)

if __name__ == "__main__":
    main()

