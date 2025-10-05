#!/usr/bin/env python3
"""
Complete /features → /ecosystem/internal migration
Handles all subdirectories (admin, tasks, lifelock, etc.)
"""

import os
import sys
from pathlib import Path

FEATURES_BASE = Path("src/features")
ECOSYSTEM_BASE = Path("src/ecosystem/internal")

REDIRECT_TEMPLATE = """// 🔄 DUPLICATE REDIRECT
// This file has been consolidated to the canonical location
// Canonical: src/ecosystem/internal/{relative_path}
// Phase: 4.2 - Complete Features→Ecosystem Migration
// Date: 2025-10-05
export * from '@/ecosystem/internal/{module_path}';{default_export}
"""

def get_module_path(relative_path):
    """Convert file path to module import path"""
    return str(relative_path).replace('.tsx', '').replace('.ts', '')

def should_include_default_export(file_path):
    """Check if file likely has default export"""
    name = file_path.name.lower()
    if 'context' in name or 'type' in name or 'hook' in name or 'util' in name:
        return False
    return True

def create_redirect(features_file, domain):
    """Convert a features file to a redirect"""
    # Get path relative to features/domain
    relative_to_domain = features_file.relative_to(FEATURES_BASE / domain)
    # Full path from ecosystem/internal/domain
    relative_path = Path(domain) / relative_to_domain
    module_path = get_module_path(relative_path)

    # Check if already a redirect
    content = features_file.read_text()
    if "🔄 DUPLICATE REDIRECT" in content:
        return False, "Already redirect"

    # Check if ecosystem equivalent exists
    ecosystem_file = ECOSYSTEM_BASE / domain / relative_to_domain
    if not ecosystem_file.exists():
        return False, f"No ecosystem equivalent"

    # Generate redirect content
    default_export = ""
    if should_include_default_export(features_file):
        default_export = f"\nexport {{ default }} from '@/ecosystem/internal/{module_path}';"

    redirect_content = REDIRECT_TEMPLATE.format(
        relative_path=relative_path,
        module_path=module_path,
        default_export=default_export
    )

    # Write redirect
    features_file.write_text(redirect_content)
    return True, "Converted"

def process_domain(domain):
    """Process all files in a domain (tasks, lifelock, etc.)"""
    domain_path = FEATURES_BASE / domain
    if not domain_path.exists():
        return 0, 0

    print(f"\n📁 Processing: {domain}/")
    print("="*60)

    converted = 0
    skipped = 0

    for file_path in domain_path.rglob("*.tsx"):
        if file_path.is_file():
            success, message = create_redirect(file_path, domain)
            if success:
                converted += 1
                print(f"✅ {file_path.relative_to(FEATURES_BASE)}")
            else:
                skipped += 1
                if "Already redirect" not in message and "No ecosystem" not in message:
                    print(f"⚠️  {file_path.relative_to(FEATURES_BASE)}: {message}")

    print(f"\n{domain}: ✅ {converted} converted, ⏭️ {skipped} skipped")
    return converted, skipped

def main():
    """Process all domains in /features"""
    print("🚀 Complete Features→Ecosystem Migration")
    print("="*60)

    domains = ['tasks', 'lifelock', 'multi-tenant', 'ai-assistant']

    total_converted = 0
    total_skipped = 0

    for domain in domains:
        converted, skipped = process_domain(domain)
        total_converted += converted
        total_skipped += skipped

    print("\n" + "="*60)
    print(f"✅ Total Converted: {total_converted}")
    print(f"⏭️  Total Skipped: {total_skipped}")
    print("="*60)
    print("\nNext step: npm run typecheck")

    return 0

if __name__ == "__main__":
    sys.exit(main())
