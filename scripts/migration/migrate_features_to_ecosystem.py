#!/usr/bin/env python3
"""
Automated migration script: /features/admin → /ecosystem/internal/admin
Converts remaining files to redirect exports
"""

import os
import sys
from pathlib import Path

# Base paths
FEATURES_ADMIN = Path("src/features/admin")
ECOSYSTEM_ADMIN = Path("src/ecosystem/internal/admin")

# Redirect template
REDIRECT_TEMPLATE = """// 🔄 DUPLICATE REDIRECT
// This file has been consolidated to the canonical location
// Canonical: src/ecosystem/internal/admin/{relative_path}
// Phase: 4.1 - Features→Ecosystem Migration (automated)
// Date: 2025-10-05
export * from '@/ecosystem/internal/admin/{module_path}';{default_export}
"""

def get_module_path(relative_path):
    """Convert file path to module import path"""
    return str(relative_path).replace('.tsx', '').replace('.ts', '')

def should_include_default_export(file_path):
    """Check if file likely has default export (component files usually do)"""
    # Context files, type files usually don't have default exports
    name = file_path.name.lower()
    if 'context' in name or 'type' in name or 'hook' in name or 'util' in name:
        return False
    return True

def create_redirect(features_file):
    """Convert a features file to a redirect"""
    relative_path = features_file.relative_to(FEATURES_ADMIN)
    module_path = get_module_path(relative_path)

    # Check if already a redirect
    content = features_file.read_text()
    if "🔄 DUPLICATE REDIRECT" in content:
        return False, "Already redirect"

    # Check if ecosystem equivalent exists
    ecosystem_file = ECOSYSTEM_ADMIN / relative_path
    if not ecosystem_file.exists():
        return False, f"No ecosystem equivalent: {ecosystem_file}"

    # Generate redirect content
    default_export = ""
    if should_include_default_export(features_file):
        default_export = f"\nexport {{ default }} from '@/ecosystem/internal/admin/{module_path}';"

    redirect_content = REDIRECT_TEMPLATE.format(
        relative_path=relative_path,
        module_path=module_path,
        default_export=default_export
    )

    # Write redirect
    features_file.write_text(redirect_content)
    return True, "Converted"

def main():
    """Process all .tsx and .ts files in features/admin"""
    print("🚀 Starting automated migration...")
    print(f"Source: {FEATURES_ADMIN}")
    print(f"Target: {ECOSYSTEM_ADMIN}")
    print()

    converted = 0
    skipped = 0
    errors = 0

    # Find all TypeScript files
    for file_path in FEATURES_ADMIN.rglob("*.tsx"):
        if file_path.is_file():
            success, message = create_redirect(file_path)
            if success:
                converted += 1
                print(f"✅ {file_path.relative_to(FEATURES_ADMIN)}")
            else:
                skipped += 1
                if "Already redirect" not in message:
                    print(f"⚠️  {file_path.relative_to(FEATURES_ADMIN)}: {message}")

    print()
    print("="*60)
    print(f"✅ Converted: {converted}")
    print(f"⏭️  Skipped: {skipped}")
    print(f"❌ Errors: {errors}")
    print("="*60)
    print()
    print("Next step: npm run build")

    return 0 if errors == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
