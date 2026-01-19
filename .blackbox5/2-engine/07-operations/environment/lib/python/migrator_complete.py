#!/usr/bin/env python3
"""
Enhanced Blackbox v1 → v3 Migration Tool
COMPLETE VERSION - Migrates ALL components from Lumelle-Blackbox to Blackbox3

This version handles:
- All original migrator features
- .prompts/ directory (12 prompt packs)
- _template/ directory (canonical blackbox template)
- Root-level files (tasks.md, journal.md, etc.)
- snippets/ directory (reusable code)
- .timeline/ directory (activity feed)
- experiments/ directory
- schemas/ directory
"""

import os
import shutil
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional

class CompleteBlackboxMigrator:
    """Handles COMPLETE migration from Lumelle v1 to Blackbox3"""

    def __init__(self,
                 v1_path: str = "/Users/shaansisodia/DEV/AI-HUB/lumelle-blackbox",
                 v3_path: str = "/Users/shaansisodia/DEV/AI-HUB/.blackbox3"):
        self.v1_path = Path(v1_path)
        self.v3_path = Path(v3_path)
        self.migration_log = []

        self.validate_paths()

    def validate_paths(self):
        """Ensure source and destination paths exist"""
        if not self.v1_path.exists():
            raise FileNotFoundError(f"v1 path not found: {self.v1_path}")
        if not self.v3_path.exists():
            raise FileNotFoundError(f"v3 path not found: {self.v3_path}")

        print(f"✅ v1 source: {self.v1_path}")
        print(f"✅ v3 target: {self.v3_path}")

    def log_migration(self, component: str, status: str, details: str = ""):
        """Log migration activity"""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "component": component,
            "status": status,
            "details": details
        }
        self.migration_log.append(entry)
        print(f"{'✅' if status == 'success' else '⚠️' if status == 'skipped' else '👀'} {component}: {status}")
        if details:
            print(f"   {details}")

    # ========== PHASE 5: MISSING COMPONENTS ==========

    def migrate_prompts(self, dry_run: bool = False):
        """
        Phase 5: Migrate .prompts/ Directory
        Copy/paste prompt packs for common workflows
        """
        print("\n🔄 Migrating .prompts/ Directory...")

        v1_prompts = self.v1_path / ".prompts"
        v3_prompts = self.v3_path / "core" / "prompts"

        if not v1_prompts.exists():
            self.log_migration(".prompts/", "skipped", "Source not found")
            return

        if dry_run:
            file_count = len(list(v1_prompts.rglob("*.md")))
            self.log_migration(".prompts/", "dry-run",
                             f"Would copy {file_count} prompt packs to {v3_prompts}")
            return

        # Create destination
        if v3_prompts.exists():
            shutil.rmtree(v3_prompts)
        shutil.copytree(v1_prompts, v3_prompts)

        file_count = len(list(v3_prompts.rglob("*.md")))
        self.log_migration(".prompts/", "success",
                          f"Copied {file_count} prompt packs")

    def migrate_blackbox_template(self, dry_run: bool = False):
        """
        Phase 5: Migrate _template/ Directory
        Canonical template for spawning new .blackbox instances
        """
        print("\n🔄 Migrating _template/ (Canonical Blackbox Template)...")

        v1_template = self.v1_path / "_template"
        v3_template = self.v3_path / "core" / "blackbox-template" / "_template"

        if not v1_template.exists():
            self.log_migration("_template/", "skipped", "Source not found")
            return

        if dry_run:
            file_count = len(list(v1_template.rglob("*")))
            self.log_migration("_template/", "dry-run",
                             f"Would copy {file_count} files to {v3_template}")
            return

        # Create destination
        v3_template.parent.mkdir(parents=True, exist_ok=True)
        if v3_template.exists():
            shutil.rmtree(v3_template)
        shutil.copytree(v1_template, v3_template)

        file_count = len(list(v3_template.rglob("*")))
        self.log_migration("_template/", "success",
                          f"Copied {file_count} template files")

    def migrate_root_files(self, dry_run: bool = False):
        """
        Phase 5: Migrate Root-Level Files
        Core documentation files
        """
        print("\n🔄 Migrating Root-Level Files...")

        root_files = {
            "tasks.md": "TASKS.md",
            "journal.md": "JOURNAL.md",
            "scratchpad.md": "SCRATCHPAD.md",
            "docs-ledger.md": "DOCS-LEDGER.md",
            "information-routing.md": "INFORMATION-ROUTING.md",
            "MAINTENANCE.md": "MAINTENANCE.md",
            "manifest.yaml": "MANIFEST.yaml"
        }

        for src_name, dest_name in root_files.items():
            v1_file = self.v1_path / src_name
            v3_file = self.v3_path / dest_name

            if not v1_file.exists():
                self.log_migration(f"Root file: {src_name}", "skipped", "Source not found")
                continue

            if dry_run:
                self.log_migration(f"Root file: {src_name}", "dry-run",
                                 f"Would copy to {v3_file.name}")
                continue

            shutil.copy2(v1_file, v3_file)
            self.log_migration(f"Root file: {src_name}", "success", "Copied")

    def migrate_snippets(self, dry_run: bool = False):
        """
        Phase 5: Migrate snippets/ Directory
        Reusable code blocks and copy/paste snippets
        """
        print("\n🔄 Migrating snippets/ Directory...")

        v1_snippets = self.v1_path / "snippets"
        v3_snippets = self.v3_path / "core" / "snippets"

        if not v1_snippets.exists():
            self.log_migration("snippets/", "skipped", "Source not found")
            return

        if dry_run:
            file_count = len(list(v1_snippets.rglob("*")))
            self.log_migration("snippets/", "dry-run",
                             f"Would copy {file_count} files to {v3_snippets}")
            return

        # Create destination
        if v3_snippets.exists():
            shutil.rmtree(v3_snippets)
        shutil.copytree(v1_snippets, v3_snippets)

        file_count = len(list(v3_snippets.rglob("*")))
        self.log_migration("snippets/", "success",
                          f"Copied {file_count} snippet files")

    def migrate_timeline(self, dry_run: bool = False):
        """
        Phase 5: Migrate .timeline/ Directory
        Activity feed system
        """
        print("\n🔄 Migrating .timeline/ Directory...")

        v1_timeline = self.v1_path / ".timeline"
        v3_timeline = self.v3_path / ".timeline"

        if not v1_timeline.exists():
            self.log_migration(".timeline/", "skipped", "Source not found")
            return

        if dry_run:
            file_count = len(list(v1_timeline.rglob("*")))
            self.log_migration(".timeline/", "dry-run",
                             f"Would copy {file_count} files to {v3_timeline}")
            return

        # Create destination
        if v3_timeline.exists():
            shutil.rmtree(v3_timeline)
        shutil.copytree(v1_timeline, v3_timeline)

        file_count = len(list(v3_timeline.rglob("*")))
        self.log_migration(".timeline/", "success",
                          f"Copied {file_count} timeline files")

    def migrate_experiments(self, dry_run: bool = False):
        """
        Phase 5: Migrate experiments/ Directory
        Safe space for failed experiments and alternatives
        """
        print("\n🔄 Migrating experiments/ Directory...")

        v1_experiments = self.v1_path / "experiments"
        v3_experiments = self.v3_path / "experiments"

        if not v1_experiments.exists():
            self.log_migration("experiments/", "skipped", "Source not found")
            return

        if dry_run:
            file_count = len(list(v1_experiments.rglob("*")))
            self.log_migration("experiments/", "dry-run",
                             f"Would copy {file_count} files to {v3_experiments}")
            return

        # Create destination
        if v3_experiments.exists():
            shutil.rmtree(v3_experiments)
        shutil.copytree(v1_experiments, v3_experiments)

        file_count = len(list(v3_experiments.rglob("*")))
        self.log_migration("experiments/", "success",
                          f"Copied {file_count} experiment files")

    def migrate_schemas(self, dry_run: bool = False):
        """
        Phase 5: Migrate schemas/ Directory
        Data structure definitions and schemas
        """
        print("\n🔄 Migrating schemas/ Directory...")

        v1_schemas = self.v1_path / "schemas"
        v3_schemas = self.v3_path / "shared" / "schemas"

        if not v1_schemas.exists():
            self.log_migration("schemas/", "skipped", "Source not found")
            return

        if dry_run:
            file_count = len(list(v1_schemas.rglob("*")))
            self.log_migration("schemas/", "dry-run",
                             f"Would copy {file_count} files to {v3_schemas}")
            return

        # Create destination
        v3_schemas.mkdir(parents=True, exist_ok=True)
        if (v3_schemas / "schemas").exists():
            shutil.rmtree(v3_schemas)
        shutil.copytree(v1_schemas, v3_schemas)

        file_count = len(list(v3_schemas.rglob("*")))
        self.log_migration("schemas/", "success",
                          f"Copied {file_count} schema files")

    # ========== COMPLETE MIGRATION ==========

    def run_phase_5(self, dry_run: bool = False):
        """Run Phase 5: Missing Components"""
        print(f"\n{'='*60}")
        print(f"🚀 MIGRATION PHASE 5: MISSING COMPONENTS")
        print(f"{'='*60}")
        print(f"Mode: {'DRY RUN' if dry_run else 'LIVE'}")
        print(f"{'='*60}\n")

        self.migrate_prompts(dry_run)
        self.migrate_blackbox_template(dry_run)
        self.migrate_root_files(dry_run)
        self.migrate_snippets(dry_run)
        self.migrate_timeline(dry_run)
        self.migrate_experiments(dry_run)
        self.migrate_schemas(dry_run)

        # Summary
        print(f"\n{'='*60}")
        print("📊 PHASE 5 MIGRATION SUMMARY")
        print(f"{'='*60}")
        print(f"Total operations: {len(self.migration_log)}")

        successes = sum(1 for log in self.migration_log if log['status'] == 'success')
        skipped = sum(1 for log in self.migration_log if log['status'] == 'skipped')
        dry_runs = sum(1 for log in self.migration_log if log['status'] == 'dry-run')

        print(f"✅ Successes: {successes}")
        print(f"⏭️  Skipped: {skipped}")
        if dry_run:
            print(f"👀 Dry Runs: {dry_runs}")

        # Save log
        if not dry_run:
            log_file = self.v3_path / "migration_phase5_log.json"
            with open(log_file, 'w') as f:
                json.dump(self.migration_log, f, indent=2)
            print(f"\n📝 Migration log saved to: {log_file}")

    def run_complete_migration(self, dry_run: bool = False):
        """Run complete migration including Phase 5"""
        print(f"\n{'='*60}")
        print(f"🚀 COMPLETE MIGRATION: ALL PHASES")
        print(f"{'='*60}")
        print(f"This will run phases 1-5")
        print(f"Mode: {'DRY RUN' if dry_run else 'LIVE'}")
        print(f"{'='*60}\n")

        # Import original migrator
        import sys
        sys.path.insert(0, str(self.v3_path / "scripts" / "python"))

        try:
            from migrator import BlackboxMigrator

            # Run phases 1-4
            for phase in range(1, 5):
                print(f"\n{'='*60}")
                print(f"Running Phase {phase}...")
                print(f"{'='*60}")
                original_migrator = BlackboxMigrator(
                    v1_path=str(self.v1_path),
                    v3_path=str(self.v3_path)
                )
                original_migrator.run_phase(phase, dry_run=dry_run)
        except Exception as e:
            print(f"⚠️  Error running phases 1-4: {e}")
            print("Proceeding with Phase 5 only...")

        # Run phase 5
        self.run_phase_5(dry_run)


def main():
    """CLI interface"""
    import argparse

    parser = argparse.ArgumentParser(
        description="Complete Migration: Lumelle-Blackbox v1 to Blackbox3 (ALL Components)"
    )
    parser.add_argument(
        "--phase-5",
        action="store_true",
        help="Only run Phase 5 (missing components)"
    )
    parser.add_argument(
        "--complete",
        action="store_true",
        help="Run complete migration (phases 1-5)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be done without making changes"
    )
    parser.add_argument(
        "--v1-path",
        default="/Users/shaansisodia/DEV/AI-HUB/lumelle-blackbox",
        help="Path to Lumelle v1 blackbox"
    )
    parser.add_argument(
        "--v3-path",
        default="/Users/shaansisodia/DEV/AI-HUB/.blackbox3",
        help="Path to Blackbox3"
    )

    args = parser.parse_args()

    migrator = CompleteBlackboxMigrator(
        v1_path=args.v1_path,
        v3_path=args.v3_path
    )

    if args.complete:
        migrator.run_complete_migration(dry_run=args.dry_run)
    elif args.phase_5:
        migrator.run_phase_5(dry_run=args.dry_run)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
