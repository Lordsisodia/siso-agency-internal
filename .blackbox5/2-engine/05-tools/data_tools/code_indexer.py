"""
Code Indexer - Scans codebase and generates CODE-INDEX.yaml

Automatically discovers and catalogs:
- All domains and their structure
- Pages and components within domains
- Shared components and their usage
- File counts and statistics

Usage:
    from engine.tools.data_tools import CodeIndexer
    indexer = CodeIndexer()
    indexer.generate()
"""

import os
import yaml
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime


class CodeIndexer:
    """
    Scans the codebase and generates CODE-INDEX.yaml

    The CODE-INDEX provides a centralized registry of:
    - Domain structure and organization
    - Pages and their locations
    - Components and their dependencies
    - Refactor history
    """

    def __init__(self, project_root: Optional[Path] = None):
        """
        Initialize the code indexer.

        Args:
            project_root: Root of the project (default: current directory)
        """
        self.project_root = project_root or Path.cwd()
        self.src_root = self.project_root / "src"
        self.domains_root = self.src_root / "domains"
        self.components_root = self.src_root / "components"

    def generate(self, output_path: Optional[Path] = None) -> Dict[str, Any]:
        """
        Generate CODE-INDEX.yaml by scanning the codebase.

        Args:
            output_path: Where to write the file (default: project memory)

        Returns:
            The generated CODE-INDEX data
        """
        print("🔍 Scanning codebase...")

        # Scan all domains
        domains = self._scan_domains()

        # Scan shared components
        components = self._scan_components()

        # Scan refactor history (from git)
        refactors = self._scan_refactors()

        # Build index
        index = {
            "version": "1.0",
            "last_updated": datetime.now().isoformat(),
            "total_files": self._count_files(),
            "domains": len(domains),
            "domains": domains,
            "components": components,
            "refactors": refactors,
            "quick_find": {
                "by_domain": {name: f"See domains.{name}" for name in domains.keys()},
                "by_component": {name: f"See components.{name}" for name in components.keys()},
                "by_status": self._group_by_status(domains)
            }
        }

        # Write to file
        if output_path is None:
            output_path = self.project_root / ".blackbox5" / "memory" / "project-memory" / "siso-internal" / "CODE-INDEX.yaml"

        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, "w") as f:
            yaml.dump(index, f, default_flow_style=False, sort_keys=False)

        print(f"✅ Generated CODE-INDEX.yaml: {output_path}")
        print(f"   Domains: {len(domains)}")
        print(f"   Components: {len(components)}")
        print(f"   Total Files: {index['total_files']}")

        # Also create symlink at memory root
        memory_root = output_path.parent
        symlink_path = memory_root / "CODE-INDEX.yaml"
        if not symlink_path.exists():
            relative_path = os.path.relpath(output_path, memory_root)
            os.symlink(relative_path, symlink_path)
            print(f"✅ Created symlink: {symlink_path}")

        return index

    def _scan_domains(self) -> Dict[str, Dict[str, Any]]:
        """Scan all domains in src/domains/"""
        domains = {}

        if not self.domains_root.exists():
            return domains

        for domain_dir in self.domains_root.iterdir():
            if not domain_dir.is_dir() or domain_dir.name.startswith("_"):
                continue

            domain_data = self._scan_domain(domain_dir)
            if domain_data:
                domains[domain_dir.name] = domain_data

        return domains

    def _scan_domain(self, domain_dir: Path) -> Optional[Dict[str, Any]]:
        """Scan a single domain"""
        domain_name = domain_dir.name

        # Determine domain type
        domain_type = self._determine_domain_type(domain_dir)

        # Scan pages/features
        pages = self._scan_domain_pages(domain_dir, domain_type)

        # Count components
        components = self._count_domain_components(domain_dir)

        return {
            "path": f"src/domains/{domain_name}/",
            "type": domain_type,
            "pages": len(pages) if domain_type == "numbered-flow" else len(pages),
            "features": len(pages) if domain_type == "feature-based" else None,
            "components": components,
            "last_refactor": self._get_last_refactor(domain_name),
            "status": self._determine_status(domain_dir, pages, components),
            "pages": pages
        }

    def _determine_domain_type(self, domain_dir: Path) -> str:
        """Determine if domain is numbered-flow or feature-based"""
        # Check for numbered directories
        numbered_dirs = list(domain_dir.glob("[0-9]-*"))
        if numbered_dirs:
            return "numbered-flow"

        # Check for features directory
        if (domain_dir / "features").exists():
            return "feature-based"

        # Default
        return "unknown"

    def _scan_domain_pages(self, domain_dir: Path, domain_type: str) -> List[Dict[str, Any]]:
        """Scan pages within a domain"""
        pages = []

        if domain_type == "numbered-flow":
            # Scan numbered directories
            for page_dir in sorted(domain_dir.glob("[0-9]-*")):
                if not page_dir.is_dir():
                    continue

                page_id = page_dir.name
                pages.append({
                    "id": page_id,
                    "path": f"src/domains/{domain_dir.name}/{page_id}/ui/pages/",
                    "components": f"src/domains/{domain_dir.name}/{page_id}/ui/components/",
                    "status": self._get_page_status(page_dir),
                    "files": self._list_page_files(page_dir),
                    "task_id": self._infer_task_id(domain_dir.name, page_id)
                })

        elif domain_type == "feature-based":
            # Scan features directory
            features_dir = domain_dir / "features"
            if features_dir.exists():
                for feature_dir in features_dir.iterdir():
                    if not feature_dir.is_dir() or feature_dir.name.startswith("_"):
                        continue

                    pages.append({
                        "id": feature_dir.name,
                        "path": f"src/domains/{domain_dir.name}/features/{feature_dir.name}/ui/pages/",
                        "components": f"src/domains/{domain_dir.name}/features/{feature_dir.name}/ui/components/",
                        "status": self._get_page_status(feature_dir),
                        "files": self._list_page_files(feature_dir),
                        "task_id": self._infer_task_id(domain_dir.name, feature_dir.name)
                    })

        return pages

    def _count_domain_components(self, domain_dir: Path) -> int:
        """Count components in a domain"""
        count = 0

        # Count in _shared/ui/components
        shared_components = domain_dir / "_shared" / "ui" / "components"
        if shared_components.exists():
            count += len(list(shared_components.glob("*.tsx")))
            count += len(list(shared_components.glob("*.ts")))

        # Count in subdirectories
        for item in domain_dir.rglob("ui/components/*.tsx"):
            if "_shared" not in str(item):
                count += 1

        return count

    def _get_page_status(self, page_dir: Path) -> str:
        """Determine status of a page"""
        # Check for page files
        pages_dir = page_dir / "ui" / "pages"
        if not pages_dir.exists():
            return "pending"

        page_files = list(pages_dir.glob("*.tsx"))
        if not page_files:
            return "empty"

        # Check for components
        components_dir = page_dir / "ui" / "components"
        if components_dir.exists():
            component_count = len(list(components_dir.glob("*.tsx")))
            if component_count > 0:
                return "in_progress"

        return "complete"

    def _list_page_files(self, page_dir: Path) -> List[str]:
        """List all files in a page"""
        files = []

        # Page files
        pages_dir = page_dir / "ui" / "pages"
        if pages_dir.exists():
            for f in pages_dir.glob("*.tsx"):
                files.append(str(f.relative_to(self.project_root)))

        # Component files
        components_dir = page_dir / "ui" / "components"
        if components_dir.exists():
            for f in components_dir.glob("*.tsx"):
                files.append(str(f.relative_to(self.project_root)))

        return files

    def _infer_task_id(self, domain: str, page: str) -> str:
        """Infer task ID from domain and page"""
        page_slug = page.split("-")[1] if "-" in page else page
        return f"TASK-{domain}-{page_slug}"

    def _scan_components(self) -> Dict[str, Dict[str, Any]]:
        """Scan shared components"""
        components = {}

        if not self.components_root.exists():
            return components

        # Scan ui directory
        ui_root = self.components_root / "ui"
        if ui_root.exists():
            for component_dir in ui_root.iterdir():
                if not component_dir.is_dir():
                    continue

                comp_name = component_dir.name

                # Determine where this component is used
                used_by = self._scan_component_usage(comp_name)

                components[comp_name] = {
                    "path": f"src/components/ui/{comp_name}/",
                    "used_by": used_by,
                    "last_modified": self._get_last_modified(component_dir)
                }

        return components

    def _scan_component_usage(self, component_name: str) -> List[str]:
        """Scan which domains use a component"""
        used_by = []

        # Simple heuristic: check for imports in domain files
        if not self.domains_root.exists():
            return used_by

        for domain_dir in self.domains_root.iterdir():
            if not domain_dir.is_dir() or domain_dir.name.startswith("_"):
                continue

            # Search for component imports in domain
            for tsx_file in domain_dir.rglob("*.tsx"):
                try:
                    content = tsx_file.read_text()
                    if component_name in content:
                        used_by.append(domain_dir.name)
                        break
                except Exception:
                    pass

        return used_by

    def _get_last_modified(self, directory: Path) -> str:
        """Get last modified date for a directory"""
        files = list(directory.rglob("*"))
        if not files:
            return "unknown"

        latest = max(f.stat().st_mtime for f in files)
        return datetime.fromtimestamp(latest).strftime("%Y-%m-%d")

    def _scan_refactors(self) -> List[Dict[str, Any]]:
        """Scan refactor history from git logs"""
        refactors = []

        # This is a placeholder - would integrate with git in production
        # For now, return known refactors from documentation
        known_refactors = [
            {
                "id": "REFACTOR-2026-01-15-domain-reorg",
                "date": "2026-01-15",
                "description": "Comprehensive domain restructuring to standardized patterns",
                "affected_domains": ["all"],
                "files_changed": 500,
                "lessons": [
                    "Domain organization improved discoverability",
                    "Shared components reduced duplication",
                    "Need better documentation for new patterns"
                ]
            },
            {
                "id": "REFACTOR-2026-01-10-tasks-domain",
                "date": "2026-01-10",
                "description": "Converted tasks domain to feature-based pattern",
                "affected_domains": ["tasks"],
                "files_changed": 50,
                "lessons": [
                    "Feature-based pattern works better for complex domains",
                    "Numbered flow too restrictive for task management"
                ]
            }
        ]

        return known_refactors

    def _count_files(self) -> int:
        """Count total TypeScript/React files"""
        count = 0

        if self.src_root.exists():
            count += len(list(self.src_root.rglob("*.tsx")))
            count += len(list(self.src_root.rglob("*.ts")))

        return count

    def _get_last_refactor(self, domain: str) -> Optional[str]:
        """Get last refactor date for a domain"""
        # Placeholder - would query refactor history
        refactors = self._scan_refactors()

        for refactor in refactors:
            if "all" in refactor.get("affected_domains", []) or domain in refactor.get("affected_domains", []):
                return refactor["date"]

        return None

    def _determine_status(self, domain_dir: Path, pages: List[Dict], components: int) -> str:
        """Determine overall domain status"""
        if not pages:
            return "empty"

        complete_pages = sum(1 for p in pages if p.get("status") == "complete")
        total_pages = len(pages)

        if complete_pages == total_pages:
            return "complete"
        elif complete_pages > 0:
            return "partially_complete"
        elif components > 0:
            return "in_progress"
        else:
            return "pending"

    def _group_by_status(self, domains: Dict[str, Dict]) -> Dict[str, List[str]]:
        """Group domains by status"""
        grouped = {
            "complete": [],
            "partially_complete": [],
            "in_progress": [],
            "pending": [],
            "empty": []
        }

        for domain_name, domain_data in domains.items():
            status = domain_data.get("status", "pending")
            if status in grouped:
                grouped[status].append(domain_name)

        return grouped


def main():
    """CLI entry point for code indexer"""
    import sys

    project_root = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    indexer = CodeIndexer(project_root)
    indexer.generate()


if __name__ == "__main__":
    main()
