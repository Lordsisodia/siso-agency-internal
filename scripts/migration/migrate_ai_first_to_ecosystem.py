#!/usr/bin/env python3
"""
Migrate ai-first files to ecosystem redirects
Similar to Phase 1, but for ai-first directory
"""

import os
from pathlib import Path

AI_FIRST = Path("ai-first")
ECOSYSTEM = Path("src/ecosystem/internal")

REDIRECT_TEMPLATE = """// 🔄 DUPLICATE REDIRECT
// This file has been consolidated to the canonical location
// Canonical: src/ecosystem/internal/{relative_path}
// Phase: 4.3 - ai-first→Ecosystem Migration (automated)
// Date: 2025-10-05
export * from '@/ecosystem/internal/{module_path}';{default_export}
"""

def get_module_path(relative_path):
    """Convert file path to module import path"""
    return str(relative_path).replace('.tsx', '').replace('.ts', '')

def should_include_default_export(file_path):
    """Check if file likely has default export"""
    name = file_path.name.lower()
    if any(x in name for x in ['context', 'type', 'hook', 'util', 'service', 'config']):
        return False
    return True

def find_in_ecosystem(ai_first_file):
    """Find corresponding file in ecosystem"""
    name = ai_first_file.name
    for eco_file in ECOSYSTEM.rglob(name):
        return eco_file
    return None

def create_redirect(ai_first_file):
    """Convert ai-first file to redirect"""
    # Check if already a redirect
    content = ai_first_file.read_text()
    if "🔄 DUPLICATE REDIRECT" in content:
        return False, "Already redirect"
    
    # Find ecosystem equivalent
    eco_file = find_in_ecosystem(ai_first_file)
    if not eco_file:
        return False, "No ecosystem equivalent"
    
    # Get relative path from ecosystem/internal
    relative_path = eco_file.relative_to(ECOSYSTEM)
    module_path = get_module_path(relative_path)
    
    # Generate redirect
    default_export = ""
    if should_include_default_export(ai_first_file):
        default_export = f"\nexport {{ default }} from '@/ecosystem/internal/{module_path}';"
    
    redirect_content = REDIRECT_TEMPLATE.format(
        relative_path=relative_path,
        module_path=module_path,
        default_export=default_export
    )
    
    # Write redirect
    ai_first_file.write_text(redirect_content)
    return True, "Converted"

def main():
    print("🚀 ai-first→Ecosystem Migration")
    print("=" * 60)
    
    converted = 0
    skipped = 0
    
    for file_path in AI_FIRST.rglob("*.tsx"):
        if file_path.is_file():
            success, message = create_redirect(file_path)
            if success:
                converted += 1
                print(f"✅ {file_path.relative_to(AI_FIRST)}")
            else:
                skipped += 1
                if "Already redirect" not in message:
                    pass  # Silent skip
    
    print()
    print("=" * 60)
    print(f"✅ Converted: {converted}")
    print(f"⏭️  Skipped: {skipped}")
    print("=" * 60)
    
    return 0

if __name__ == "__main__":
    import sys
    sys.exit(main())
