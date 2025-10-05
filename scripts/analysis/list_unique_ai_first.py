#!/usr/bin/env python3
"""List all unique ai-first files for manual review"""

import os
from pathlib import Path

AI_FIRST = Path("ai-first")
ECOSYSTEM = Path("src/ecosystem/internal")
SRC_COMPONENTS = Path("src/components")

def scan_directory(base_path):
    """Get all .tsx files with full paths"""
    if not base_path.exists():
        return {}
    return {f.name: f for f in base_path.rglob("*.tsx")}

# Scan all directories
ai_first_files = scan_directory(AI_FIRST)
ecosystem_files = scan_directory(ECOSYSTEM)
src_component_files = scan_directory(SRC_COMPONENTS)

# Find unique files
ecosystem_names = set(ecosystem_files.keys())
src_names = set(src_component_files.keys())
ai_first_names = set(ai_first_files.keys())

unique_names = ai_first_names - ecosystem_names - src_names

print(f"📋 ALL {len(unique_names)} UNIQUE AI-FIRST FILES")
print("=" * 60)

# Group by category
categories = {
    "Auth": [],
    "Testing/Debug": [],
    "Partnership": [],
    "Components": [],
    "Other": []
}

for name in sorted(unique_names):
    file_path = ai_first_files[name]
    relative_path = str(file_path.relative_to(AI_FIRST))
    
    if any(x in name.lower() for x in ['auth', 'clerk', 'login', 'guard']):
        categories["Auth"].append(relative_path)
    elif any(x in name.lower() for x in ['test', 'debug', 'demo', 'tester']):
        categories["Testing/Debug"].append(relative_path)
    elif any(x in name.lower() for x in ['partner', 'affiliate', 'commission', 'referral']):
        categories["Partnership"].append(relative_path)
    elif any(x in name.lower() for x in ['.component.', 'button', 'modal', 'card', 'form']):
        categories["Components"].append(relative_path)
    else:
        categories["Other"].append(relative_path)

for category, files in categories.items():
    if files:
        print(f"\n{category} ({len(files)}):")
        for f in files:
            print(f"  - {f}")

