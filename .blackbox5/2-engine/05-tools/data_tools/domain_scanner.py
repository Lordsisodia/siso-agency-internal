"""
Domain Scanner - Scans domains and generates domain context files

Analyzes domain structure and generates:
- DOMAIN-CONTEXT.md (purpose, patterns, gotchas)
- FEATURES.md (feature inventory)
- PAGES.md (page inventory)
- COMPONENTS.md (component list)

Usage:
    from engine.tools.data_tools import DomainScanner
    scanner = DomainScanner()
    scanner.scan_all()
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime


class DomainScanner:
    """
    Scans domains and generates domain context documentation

    Automatically discovers and documents:
    - Domain purpose and organization
    - Features and pages within the domain
    - Components and their dependencies
    - Patterns and gotchas specific to the domain
    """

    def __init__(self, project_root: Optional[Path] = None):
        """
        Initialize the domain scanner.

        Args:
            project_root: Root of the project (default: current directory)
        """
        self.project_root = project_root or Path.cwd()
        self.src_root = self.project_root / "src"
        self.domains_root = self.src_root / "domains"
        self.memory_root = (
            self.project_root / ".blackbox5" / "memory" / "project-memory" / "siso-internal"
        )
        if not self.memory_root.exists():
            self.memory_root = self.project_root / ".project-memory"

    def scan_all(self) -> Dict[str, Dict[str, Any]]:
        """
        Scan all domains and generate context files.

        Returns:
            Dictionary mapping domain names to their scanned data
        """
        print("🔍 Scanning domains...")

        if not self.domains_root.exists():
            print("❌ Domains directory not found")
            return {}

        domains = {}

        for domain_dir in self.domains_root.iterdir():
            if not domain_dir.is_dir() or domain_dir.name.startswith("_"):
                continue

            print(f"  📁 Scanning {domain_dir.name}...")

            domain_data = self._scan_domain(domain_dir)
            domains[domain_dir.name] = domain_data

            # Generate context files
            self._generate_domain_context(domain_dir.name, domain_data)

        print(f"✅ Scanned {len(domains)} domains")

        return domains

    def _scan_domain(self, domain_dir: Path) -> Dict[str, Any]:
        """Scan a single domain"""
        domain_name = domain_dir.name

        # Determine domain type
        domain_type = self._determine_domain_type(domain_dir)

        # Scan features/pages
        items = self._scan_domain_items(domain_dir, domain_type)

        # Scan components
        components = self._scan_domain_components(domain_dir)

        # Read existing README if present
        readme = self._read_readme(domain_dir)

        return {
            "name": domain_name,
            "path": f"src/domains/{domain_name}/",
            "type": domain_type,
            "description": self._extract_description(readme),
            "purpose": self._extract_purpose(readme),
            "items": items,
            "components": components,
            "patterns": self._identify_patterns(domain_dir),
            "gotchas": self._identify_gotchas(domain_dir)
        }

    def _determine_domain_type(self, domain_dir: Path) -> str:
        """Determine domain organization type"""
        # Check for numbered directories
        numbered = list(domain_dir.glob("[0-9]-*"))
        if numbered:
            return "numbered-flow"

        # Check for features directory
        if (domain_dir / "features").exists():
            return "feature-based"

        return "unknown"

    def _scan_domain_items(self, domain_dir: Path, domain_type: str) -> List[Dict[str, Any]]:
        """Scan features or pages within a domain"""
        items = []

        if domain_type == "numbered-flow":
            for item_dir in sorted(domain_dir.glob("[0-9]-*")):
                if not item_dir.is_dir():
                    continue

                items.append({
                    "id": item_dir.name,
                    "name": self._extract_item_name(item_dir.name),
                    "type": "page",
                    "path": f"src/domains/{domain_dir.name}/{item_dir.name}/",
                    "pages": self._list_pages(item_dir),
                    "components": self._list_components(item_dir),
                    "description": self._extract_item_description(item_dir)
                })

        elif domain_type == "feature-based":
            features_dir = domain_dir / "features"
            if features_dir.exists():
                for feature_dir in features_dir.iterdir():
                    if not feature_dir.is_dir() or feature_dir.name.startswith("_"):
                        continue

                    items.append({
                        "id": feature_dir.name,
                        "name": self._extract_item_name(feature_dir.name),
                        "type": "feature",
                        "path": f"src/domains/{domain_dir.name}/features/{feature_dir.name}/",
                        "pages": self._list_pages(feature_dir),
                        "components": self._list_components(feature_dir),
                        "description": self._extract_item_description(feature_dir)
                    })

        return items

    def _scan_domain_components(self, domain_dir: Path) -> List[Dict[str, Any]]:
        """Scan all components in a domain"""
        components = []

        # Scan _shared components
        shared_dir = domain_dir / "_shared" / "ui" / "components"
        if shared_dir.exists():
            for comp_file in shared_dir.glob("*.tsx"):
                components.append({
                    "name": comp_file.stem,
                    "path": f"src/domains/{domain_dir.name}/_shared/ui/components/{comp_file.name}",
                    "type": "shared",
                    "props": self._extract_component_props(comp_file)
                })

        # Scan item-specific components
        for item_dir in domain_dir.iterdir():
            if not item_dir.is_dir() or item_dir.name.startswith("_"):
                continue

            comp_dir = item_dir / "ui" / "components"
            if comp_dir.exists():
                for comp_file in comp_dir.glob("*.tsx"):
                    components.append({
                        "name": comp_file.stem,
                        "path": f"src/domains/{domain_dir.name}/{item_dir.name}/ui/components/{comp_file.name}",
                        "type": "specific",
                        "parent": item_dir.name,
                        "props": self._extract_component_props(comp_file)
                    })

        return components

    def _generate_domain_context(self, domain_name: str, domain_data: Dict[str, Any]) -> None:
        """Generate domain context files"""
        domain_context_dir = self.memory_root / "context" / "domains" / domain_name
        domain_context_dir.mkdir(parents=True, exist_ok=True)

        # Generate DOMAIN-CONTEXT.md
        self._generate_domain_context_file(domain_name, domain_data, domain_context_dir)

        # Generate FEATURES.md
        self._generate_features_file(domain_name, domain_data, domain_context_dir)

        # Generate PAGES.md
        self._generate_pages_file(domain_name, domain_data, domain_context_dir)

        # Generate COMPONENTS.md
        self._generate_components_file(domain_name, domain_data, domain_context_dir)

        # Generate REFACTOR-HISTORY.md (if doesn't exist)
        refactor_file = domain_context_dir / "REFACTOR-HISTORY.md"
        if not refactor_file.exists():
            self._generate_refactor_history_file(domain_name, domain_context_dir)

    def _generate_domain_context_file(self, domain_name: str, domain_data: Dict, output_dir: Path) -> None:
        """Generate DOMAIN-CONTEXT.md"""
        output_file = output_dir / "DOMAIN-CONTEXT.md"

        content = f"""# Domain Context: {domain_name}

## Overview

**Path**: `{domain_data['path']}`

**Type**: {domain_data['type']}

**Description**: {domain_data.get('description', 'N/A')}

## Purpose

{domain_data.get('purpose', 'N/A')}

## Organization

This domain uses the **{domain_data['type']}** pattern.

"""

        if domain_data['type'] == 'numbered-flow':
            content += """
The numbered flow pattern organizes the domain into sequential steps:
- Each numbered directory (`1-step-name`, `2-step-name`, etc.) represents a step in the workflow
- Steps are executed in order
- Each step has its own UI components and pages
"""
        elif domain_data['type'] == 'feature-based':
            content += """
The feature-based pattern organizes the domain into distinct features:
- Each subdirectory in `features/` represents a standalone feature
- Features are independent but can share components via `_shared/`
- Each feature has its own UI components and pages
"""

        content += f"""

## Items

"""

        for item in domain_data.get('items', []):
            content += f"### {item['id']} - {item['name']}\n"
            content += f"- **Path**: `{item['path']}`\n"
            content += f"- **Description**: {item.get('description', 'N/A')}\n"
            content += f"- **Pages**: {len(item.get('pages', []))}\n"
            content += f"- **Components**: {len(item.get('components', []))}\n\n"

        if domain_data.get('patterns'):
            content += """## Patterns

Common patterns used in this domain:

"""
            for pattern in domain_data['patterns']:
                content += f"- **{pattern['name']}**: {pattern['description']}\n"
            content += "\n"

        if domain_data.get('gotchas'):
            content += """## Gotchas

Things to watch out for in this domain:

"""
            for gotcha in domain_data['gotchas']:
                content += f"- ⚠️ {gotcha['description']}\n"
            content += "\n"

        output_file.write_text(content)

    def _generate_features_file(self, domain_name: str, domain_data: Dict, output_dir: Path) -> None:
        """Generate FEATURES.md"""
        output_file = output_dir / "FEATURES.md"

        content = f"""# Features: {domain_name}

This document catalogs all features in the **{domain_name}** domain.

## Feature Inventory

"""

        for item in domain_data.get('items', []):
            content += f"### {item['id']} - {item['name']}\n\n"
            content += f"**Path**: `{item['path']}`\n\n"
            content += f"{item.get('description', 'No description available.')}\n\n"

            # List pages
            if item.get('pages'):
                content += "**Pages**:\n"
                for page in item['pages']:
                    content += f"- `{page}`\n"
                content += "\n"

            # List components
            if item.get('components'):
                content += "**Components**:\n"
                for comp in item['components']:
                    content += f"- `{comp}`\n"
                content += "\n"

            content += "---\n\n"

        output_file.write_text(content)

    def _generate_pages_file(self, domain_name: str, domain_data: Dict, output_dir: Path) -> None:
        """Generate PAGES.md"""
        output_file = output_dir / "PAGES.md"

        content = f"""# Pages: {domain_name}

This document catalogs all pages in the **{domain_name}** domain.

## Page Inventory

"""

        for item in domain_data.get('items', []):
            for page in item.get('pages', []):
                content += f"### {page}\n"
                content += f"**Parent**: {item['id']}\n"
                content += f"**Path**: `{item['path']}{page}`\n\n"

        output_file.write_text(content)

    def _generate_components_file(self, domain_name: str, domain_data: Dict, output_dir: Path) -> None:
        """Generate COMPONENTS.md"""
        output_file = output_dir / "COMPONENTS.md"

        content = f"""# Components: {domain_name}

This document catalogs all components in the **{domain_name}** domain.

## Component Inventory

"""

        # Shared components
        shared_comps = [c for c in domain_data.get('components', []) if c.get('type') == 'shared']
        if shared_comps:
            content += "### Shared Components\n\n"
            content += "These components are shared across all items in the domain:\n\n"
            for comp in shared_comps:
                content += f"#### {comp['name']}\n"
                content += f"- **Path**: `{comp['path']}`\n"
                if comp.get('props'):
                    content += f"- **Props**: {', '.join(comp['props'])}\n"
                content += "\n"

        # Item-specific components
        specific_comps = [c for c in domain_data.get('components', []) if c.get('type') == 'specific']
        if specific_comps:
            content += "### Item-Specific Components\n\n"
            content += "These components belong to specific items:\n\n"
            for comp in specific_comps:
                content += f"#### {comp['name']}\n"
                content += f"- **Parent**: {comp.get('parent', 'N/A')}\n"
                content += f"- **Path**: `{comp['path']}`\n"
                if comp.get('props'):
                    content += f"- **Props**: {', '.join(comp['props'])}\n"
                content += "\n"

        output_file.write_text(content)

    def _generate_refactor_history_file(self, domain_name: str, output_dir: Path) -> None:
        """Generate REFACTOR-HISTORY.md"""
        output_file = output_dir / "REFACTOR-HISTORY.md"

        content = f"""# Refactor History: {domain_name}

This document tracks all refactors affecting the **{domain_name}** domain.

## Recent Refactors

---

## Lessons Learned

As refactors are performed, lessons learned will be documented here.

## Gotchas

Common pitfalls and issues discovered during refactors will be tracked here.
"""

        output_file.write_text(content)

    def _read_readme(self, domain_dir: Path) -> Optional[str]:
        """Read domain README if present"""
        readme_file = domain_dir / "README.md"
        if readme_file.exists():
            return readme_file.read_text()
        return None

    def _extract_description(self, readme: Optional[str]) -> str:
        """Extract domain description from README"""
        if not readme:
            return "Domain"

        # First paragraph
        match = re.search(r"#.*?\n\n(.*?)(?:\n\n|$)", readme)
        if match:
            return match.group(1).strip()

        return "Domain"

    def _extract_purpose(self, readme: Optional[str]) -> str:
        """Extract domain purpose from README"""
        if not readme:
            return "Provides domain-specific functionality"

        # Look for "Purpose" or "Why" sections
        for pattern in [r"## Purpose\s*\n(.*?)(?=\n##|\n\n|$)", r"## Why.*?\s*\n(.*?)(?=\n##|\n\n|$)"]:
            match = re.search(pattern, readme, re.DOTALL)
            if match:
                return match.group(1).strip()[:500]

        return "Provides domain-specific functionality"

    def _extract_item_name(self, item_id: str) -> str:
        """Extract readable name from item id"""
        # Remove number prefix and convert to title case
        name = re.sub(r"^\d+-", "", item_id)
        return name.replace("-", " ").replace("_", " ").title()

    def _extract_item_description(self, item_dir: Path) -> str:
        """Extract description from item directory"""
        # Try to read from README
        readme = item_dir / "README.md"
        if readme.exists():
            content = readme.read_text()
            # Get first paragraph
            match = re.search(r"#.*?\n\n(.*?)(?:\n\n|$)", content)
            if match:
                return match.group(1).strip()

        return f"{self._extract_item_name(item_dir.name)} functionality"

    def _list_pages(self, item_dir: Path) -> List[str]:
        """List pages in an item directory"""
        pages_dir = item_dir / "ui" / "pages"
        if pages_dir.exists():
            return [f.name for f in pages_dir.glob("*.tsx")]
        return []

    def _list_components(self, item_dir: Path) -> List[str]:
        """List components in an item directory"""
        components_dir = item_dir / "ui" / "components"
        if components_dir.exists():
            return [f.name for f in components_dir.glob("*.tsx")]
        return []

    def _extract_component_props(self, comp_file: Path) -> List[str]:
        """Extract component props from TSX file"""
        try:
            content = comp_file.read_text()

            # Extract interface definition
            interface_match = re.search(r"interface\s+(\w+Props)\s*\{([^}]+)\}", content)
            if interface_match:
                props_block = interface_match.group(2)
                # Extract property names
                props = re.findall(r"(\w+)\s*:", props_block)
                return props

            # Extract from FC or functional component
            props_match = re.search(r"(\w+Props)", content)
            if props_match:
                return [props_match.group(1)]

        except Exception:
            pass

        return []

    def _identify_patterns(self, domain_dir: Path) -> List[Dict[str, str]]:
        """Identify common patterns in the domain"""
        patterns = []

        # Check for hooks directory
        if (domain_dir / "_shared" / "hooks").exists():
            patterns.append({
                "name": "Custom Hooks",
                "description": "Domain uses custom hooks for shared logic"
            })

        # Check for stores directory
        if (domain_dir / "_shared" / "stores").exists():
            patterns.append({
                "name": "State Management",
                "description": "Domain uses centralized state management"
            })

        # Check for services directory
        if (domain_dir / "_shared" / "services").exists():
            patterns.append({
                "name": "Service Layer",
                "description": "Domain uses service layer for business logic"
            })

        return patterns

    def _identify_gotchas(self, domain_dir: Path) -> List[Dict[str, str]]:
        """Identify potential gotchas in the domain"""
        gotchas = []

        # Check for TODO comments
        for ts_file in domain_dir.rglob("*.tsx"):
            try:
                content = ts_file.read_text()
                if "TODO" in content or "FIXME" in content:
                    gotchas.append({
                        "name": "Unresolved TODOs",
                        "description": f"Found TODO/FIXME in {ts_file.name}"
                    })
                    break
            except Exception:
                pass

        return gotchas


def main():
    """CLI entry point for domain scanner"""
    import sys

    project_root = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    scanner = DomainScanner(project_root)
    scanner.scan_all()


if __name__ == "__main__":
    main()
