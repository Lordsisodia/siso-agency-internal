#!/usr/bin/env python3
"""
Blackbox v1 → v3 Migration Tool
Migrates production-tested components from Lumelle-Blackbox to Blackbox3
"""

import os
import shutil
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional

class BlackboxMigrator:
    """Handles migration from Lumelle v1 to Blackbox3"""

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
        print(f"{'✅' if status == 'success' else '⚠️'} {component}: {status}")
        if details:
            print(f"   {details}")

    def migrate_plan_templates(self, dry_run: bool = False):
        """
        Phase 1: Migrate Plan Template System
        Copies the comprehensive 15-file plan structure
        """
        print("\n🔄 Migrating Plan Template System...")

        v1_template = self.v1_path / ".plans" / "_template"
        v3_templates = self.v3_path / "core" / "templates" / "plans"

        if not v1_template.exists():
            self.log_migration("Plan Templates", "skipped", "Source template not found")
            return

        if dry_run:
            self.log_migration("Plan Templates", "dry-run", f"Would copy {v1_template} to {v3_templates}")
            return

        # Create destination
        v3_templates.mkdir(parents=True, exist_ok=True)

        # Copy template
        dest = v3_templates / "_template"
        if dest.exists():
            shutil.rmtree(dest)
        shutil.copytree(v1_template, dest)

        # Also create simple and research variants
        simple_template = v3_templates / "simple"
        research_template = v3_templates / "research"

        # For now, just copy full template
        # TODO: Create simplified variants later

        self.log_migration("Plan Templates", "success",
                          f"Copied {len(list(dest.rglob('*')))} files")

    def migrate_core_prompt(self, dry_run: bool = False):
        """
        Phase 1: Migrate Core Prompt
        The essential agent behavior rules
        """
        print("\n🔄 Migrating Core Prompt...")

        v1_core_prompt = self.v1_path / "agents" / "_core" / "prompt.md"
        v3_core_prompt = self.v3_path / "core" / "agents" / "_core" / "prompt.md"

        if not v1_core_prompt.exists():
            self.log_migration("Core Prompt", "skipped", "Source not found")
            return

        if dry_run:
            self.log_migration("Core Prompt", "dry-run", f"Would copy to {v3_core_prompt}")
            return

        # Create destination
        v3_core_prompt.parent.mkdir(parents=True, exist_ok=True)

        # Copy prompt
        shutil.copy2(v1_core_prompt, v3_core_prompt)

        self.log_migration("Core Prompt", "success", "Copied core agent prompt")

    def migrate_protocols(self, dry_run: bool = False):
        """
        Phase 1: Migrate Protocol Documentation
        Essential documentation for how agents work
        """
        print("\n🔄 Migrating Protocol Documentation...")

        protocols = {
            "protocol.md": "PROTOCOL.md",
            "RUN-NOW.md": "RUN-NOW.md",
            "context.md": "CONFIG.md"
        }

        v3_protocols = self.v3_path / "core" / "protocols"

        if dry_run:
            for src, dest in protocols.items():
                v1_file = self.v1_path / src
                v3_file = self.v3_path / dest
                if v1_file.exists():
                    self.log_migration(f"Protocol: {src}", "dry-run",
                                     f"Would copy to {v3_file}")
            return

        # Copy to both core/protocols and root
        for src, dest in protocols.items():
            v1_file = self.v1_path / src

            if not v1_file.exists():
                self.log_migration(f"Protocol: {src}", "skipped", "Source not found")
                continue

            # Copy to root
            v3_root_file = self.v3_path / dest
            shutil.copy2(v1_file, v3_root_file)

            # Also copy to core/protocols
            v3_protocols.mkdir(parents=True, exist_ok=True)
            v3_proto_file = v3_protocols / src
            shutil.copy2(v1_file, v3_proto_file)

            self.log_migration(f"Protocol: {src}", "success",
                             f"Copied to root and core/protocols")

    def migrate_skills(self, dry_run: bool = False):
        """
        Phase 3: Migrate Skills System
        Reusable playbooks and workflows
        """
        print("\n🔄 Migrating Skills System...")

        v1_skills = self.v1_path / ".skills"
        v3_skills = self.v3_path / "core" / "skills"

        if not v1_skills.exists():
            self.log_migration("Skills", "skipped", "Source not found")
            return

        if dry_run:
            self.log_migration("Skills", "dry-run",
                             f"Would copy {v1_skills} to {v3_skills}")
            return

        # Create destination
        if v3_skills.exists():
            shutil.rmtree(v3_skills)
        shutil.copytree(v1_skills, v3_skills)

        skill_count = len(list(v3_skills.rglob("*.md")))
        self.log_migration("Skills", "success",
                          f"Copied {skill_count} skill files")

    def migrate_agents(self, agent_list: List[str] = None, dry_run: bool = False):
        """
        Phase 2: Migrate Agent Packages
        Copies complete agent definitions
        """
        print("\n🔄 Migrating Agent Packages...")

        if agent_list is None:
            # Default: migrate all production agents
            agent_list = [
                "deep-research",
                "feature-research",
                "oss-discovery",
                "docs-feedback"
            ]

        v1_agents = self.v1_path / "agents"
        v3_agents = self.v3_path / "core" / "agents"

        for agent_name in agent_list:
            v1_agent = v1_agents / agent_name

            if not v1_agent.exists():
                self.log_migration(f"Agent: {agent_name}", "skipped",
                                 "Source not found")
                continue

            if dry_run:
                self.log_migration(f"Agent: {agent_name}", "dry-run",
                                 f"Would copy to {v3_agents / agent_name}")
                continue

            # Copy agent
            v3_agent = v3_agents / agent_name
            if v3_agent.exists():
                shutil.rmtree(v3_agent)
            shutil.copytree(v1_agent, v3_agent)

            file_count = len(list(v3_agent.rglob("*")))
            self.log_migration(f"Agent: {agent_name}", "success",
                              f"Copied {file_count} files")

    def migrate_research_tools(self, dry_run: bool = False):
        """
        Phase 4: Migrate Python Research Tools
        Automation scripts for research workflows
        """
        print("\n🔄 Migrating Research Tools...")

        v1_scripts = self.v1_path / "scripts"
        v3_tools = self.v3_path / "modules" / "research" / "tools"

        python_tools = [
            "snapshot_urls.py",
            "generate_url_variants.py",
            "generate_competitor_evidence_batch.py",
            "suggest_workflows_from_evidence.py",
            "generate_evidence_index.py",
            "validate-feature-research-run.py"
        ]

        if dry_run:
            for tool in python_tools:
                v1_tool = v1_scripts / tool
                if v1_tool.exists():
                    self.log_migration(f"Tool: {tool}", "dry-run",
                                     f"Would copy to {v3_tools}")
            return

        # Create destination
        v3_tools.mkdir(parents=True, exist_ok=True)

        for tool in python_tools:
            v1_tool = v1_scripts / tool
            if not v1_tool.exists():
                self.log_migration(f"Tool: {tool}", "skipped", "Source not found")
                continue

            shutil.copy2(v1_tool, v3_tools / tool)
            self.log_migration(f"Tool: {tool}", "success", "Copied")

    def migrate_oss_catalog(self, dry_run: bool = False):
        """
        Phase 4: Migrate OSS Catalog System
        Open source discovery and tracking
        """
        print("\n🔄 Migrating OSS Catalog...")

        v1_catalog = self.v1_path / "oss-catalog"
        v3_catalog = self.v3_path / "modules" / "research" / "oss-catalog"

        if not v1_catalog.exists():
            self.log_migration("OSS Catalog", "skipped", "Source not found")
            return

        if dry_run:
            self.log_migration("OSS Catalog", "dry-run",
                             f"Would copy to {v3_catalog}")
            return

        # Create destination
        if v3_catalog.exists():
            shutil.rmtree(v3_catalog)
        shutil.copytree(v1_catalog, v3_catalog)

        file_count = len(list(v3_catalog.rglob("*")))
        self.log_migration("OSS Catalog", "success",
                          f"Copied {file_count} files")

    def migrate_deepresearch(self, dry_run: bool = False):
        """
        Phase 4: Migrate Deep Research Knowledge Base
        Evergreen research outputs
        """
        print("\n🔄 Migrating Deep Research Knowledge...")

        v1_research = self.v1_path / "deepresearch"
        v3_research = self.v3_path / "shared" / "knowledge" / "research"

        if not v1_research.exists():
            self.log_migration("Deep Research", "skipped", "Source not found")
            return

        if dry_run:
            self.log_migration("Deep Research", "dry-run",
                             f"Would copy to {v3_research}")
            return

        # Create destination
        if v3_research.exists():
            shutil.rmtree(v3_research)
        shutil.copytree(v1_research, v3_research)

        file_count = len(list(v3_research.rglob("*.md")))
        self.log_migration("Deep Research", "success",
                          f"Copied {file_count} research files")

    def run_phase(self, phase: int, dry_run: bool = False):
        """
        Run a complete migration phase

        Phases:
        1 - Foundation (plans, core prompt, protocols)
        2 - Agents
        3 - Context & Skills
        4 - Research Tools & Knowledge
        5 - Polish & Integration
        """
        print(f"\n{'='*60}")
        print(f"🚀 MIGRATION PHASE {phase}")
        print(f"{'='*60}")
        print(f"Mode: {'DRY RUN' if dry_run else 'LIVE'}")
        print(f"{'='*60}\n")

        if phase == 1:
            self.migrate_plan_templates(dry_run)
            self.migrate_core_prompt(dry_run)
            self.migrate_protocols(dry_run)

        elif phase == 2:
            self.migrate_agents(dry_run=dry_run)

        elif phase == 3:
            self.migrate_skills(dry_run)

        elif phase == 4:
            self.migrate_research_tools(dry_run)
            self.migrate_oss_catalog(dry_run)
            self.migrate_deepresearch(dry_run)

        elif phase == 5:
            print("\n⚠️  Phase 5 is manual integration and testing")
            print("    Please run integration tests and update documentation")

        else:
            print(f"❌ Invalid phase: {phase}")
            return

        # Summary
        print(f"\n{'='*60}")
        print("📊 MIGRATION SUMMARY")
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
            log_file = self.v3_path / "migration_log.json"
            with open(log_file, 'w') as f:
                json.dump(self.migration_log, f, indent=2)
            print(f"\n📝 Migration log saved to: {log_file}")

    def run_all_phases(self, dry_run: bool = False):
        """Run all migration phases"""
        for phase in range(1, 5):
            self.run_phase(phase, dry_run)
            self.migration_log.clear()  # Clear log between phases


def main():
    """CLI interface"""
    import argparse

    parser = argparse.ArgumentParser(
        description="Migrate Lumelle-Blackbox v1 to Blackbox3"
    )
    parser.add_argument(
        "--phase",
        type=int,
        choices=[1, 2, 3, 4, 5],
        help="Migration phase to run (1-5)"
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Run all phases"
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

    migrator = BlackboxMigrator(
        v1_path=args.v1_path,
        v3_path=args.v3_path
    )

    if args.all:
        migrator.run_all_phases(dry_run=args.dry_run)
    elif args.phase:
        migrator.run_phase(args.phase, dry_run=args.dry_run)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
