#!/usr/bin/env python3
"""
Analyze ai-first directory to identify:
1. Files with ecosystem equivalents (can redirect)
2. Unique files worth salvaging
3. Dead code to delete
"""

import os
from pathlib import Path
from collections import defaultdict

AI_FIRST = Path("ai-first")
ECOSYSTEM = Path("src/ecosystem/internal")
SRC_COMPONENTS = Path("src/components")

def get_component_name(file_path):
    """Extract component name from path"""
    return file_path.name

def scan_directory(base_path):
    """Get all .tsx files in directory"""
    if not base_path.exists():
        return set()
    return {f.name for f in base_path.rglob("*.tsx")}

# Scan all directories
ai_first_files = scan_directory(AI_FIRST)
ecosystem_files = scan_directory(ECOSYSTEM)
src_component_files = scan_directory(SRC_COMPONENTS)

print("🔍 AI-First Directory Analysis")
print("=" * 60)
print(f"Total ai-first files: {len(ai_first_files)}")
print(f"Total ecosystem files: {len(ecosystem_files)}")
print(f"Total src/components files: {len(src_component_files)}")
print()

# Find duplicates
ai_first_in_ecosystem = ai_first_files & ecosystem_files
ai_first_in_src = ai_first_files & src_component_files
unique_to_ai_first = ai_first_files - ecosystem_files - src_component_files

print(f"✅ ai-first files also in /ecosystem: {len(ai_first_in_ecosystem)}")
print(f"✅ ai-first files also in /src/components: {len(ai_first_in_src)}")
print(f"🆕 Unique to ai-first: {len(unique_to_ai_first)}")
print()

# Show unique files
print("🆕 UNIQUE FILES (potential salvage targets):")
print("-" * 60)
for name in sorted(unique_to_ai_first)[:30]:
    print(f"  - {name}")
if len(unique_to_ai_first) > 30:
    print(f"  ... and {len(unique_to_ai_first) - 30} more")

