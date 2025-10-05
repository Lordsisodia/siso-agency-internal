#!/usr/bin/env python3
"""
Systematically restore ALL deleted /features files that are still being imported
"""

import subprocess
from pathlib import Path

# Get all deleted files from features
result = subprocess.run(
    ['git', 'ls-files', '--deleted'],
    capture_output=True,
    text=True
)

deleted_features = [
    f for f in result.stdout.strip().split('\n') 
    if f.startswith('src/features/')
]

print(f"Found {len(deleted_features)} deleted features files")
print()

# For each deleted file, check if it's imported, and restore it
restored = 0
not_needed = 0

for deleted_file in deleted_features:
    # Extract filename without extension
    file_path = Path(deleted_file)
    filename_base = file_path.stem
    
    # Check if this file is imported anywhere
    grep_result = subprocess.run(
        ['grep', '-r', filename_base, 'src', '--include=*.ts', '--include=*.tsx'],
        capture_output=True,
        text=True
    )
    
    # If imported, restore it
    if grep_result.stdout and 'import' in grep_result.stdout.lower():
        # Calculate target path in ecosystem
        if '/features/tasks/' in deleted_file:
            target = deleted_file.replace('src/features/tasks/', 'src/ecosystem/internal/tasks/')
        elif '/features/admin/' in deleted_file:
            target = deleted_file.replace('src/features/admin/', 'src/ecosystem/internal/admin/')
        elif '/features/lifelock/' in deleted_file:
            target = deleted_file.replace('src/features/lifelock/', 'src/ecosystem/internal/lifelock/')
        else:
            continue
        
        # Restore file from git
        try:
            file_content = subprocess.run(
                ['git', 'show', f'HEAD:{deleted_file}'],
                capture_output=True,
                text=True,
                check=True
            ).stdout
            
            # Create target directory
            target_path = Path(target)
            target_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Write file
            target_path.write_text(file_content)
            restored += 1
            print(f"✅ {deleted_file}")
            print(f"   → {target}")
        except:
            pass
    else:
        not_needed += 1

print()
print("=" * 60)
print(f"✅ Restored: {restored} files")
print(f"⏭️  Not needed: {not_needed} files")
print("=" * 60)

