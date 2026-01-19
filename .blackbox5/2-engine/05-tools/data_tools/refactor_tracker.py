"""
Refactor Tracker - Extracts refactor history from git and documentation

Analyzes git history and refactor documentation to extract:
- What changed in each refactor
- Lessons learned
- Gotchas discovered
- Patterns that emerged

Usage:
    from engine.tools.data_tools import RefactorTracker
    tracker = RefactorTracker()
    tracker.extract()
"""

import re
import yaml
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime


class RefactorTracker:
    """
    Tracks and analyzes refactors across the codebase

    Extracts refactor history from:
    - Git commit messages
    - Refactor documentation in memory/
    - Domain-specific refactor files
    """

    def __init__(self, project_root: Optional[Path] = None):
        """
        Initialize the refactor tracker.

        Args:
            project_root: Root of the project (default: current directory)
        """
        self.project_root = project_root or Path.cwd()
        self.memory_root = (
            self.project_root / ".blackbox5" / "memory" / "project-memory" / "siso-internal"
        )
        if not self.memory_root.exists():
            self.memory_root = self.project_root / ".project-memory"

    def extract(self) -> List[Dict[str, Any]]:
        """
        Extract refactor history from all sources.

        Returns:
            List of refactor records with lessons and gotchas
        """
        print("🔍 Tracking refactors...")

        refactors = []

        # Load from CODE-INDEX if exists
        code_index_path = self.memory_root / "CODE-INDEX.yaml"
        if code_index_path.exists():
            with open(code_index_path) as f:
                code_index = yaml.safe_load(f)
                refactors.extend(code_index.get("refactors", []))

        # Scan domain-specific refactor files
        domain_refactors = self._scan_domain_refactors()
        refactors.extend(domain_refactors)

        # Sort by date (newest first)
        refactors.sort(key=lambda r: r.get("date", ""), reverse=True)

        print(f"✅ Found {len(refactors)} refactors")

        return refactors

    def _scan_domain_refactors(self) -> List[Dict[str, Any]]:
        """Scan domain-specific refactor files"""
        refactors = []

        domains_dir = self.memory_root / "context" / "domains"
        if not domains_dir.exists():
            return refactors

        for domain_dir in domains_dir.iterdir():
            if not domain_dir.is_dir():
                continue

            refactor_file = domain_dir / "REFACTOR-HISTORY.md"
            if refactor_file.exists():
                domain_refactors = self._parse_refactor_file(domain_dir.name, refactor_file)
                refactors.extend(domain_refactors)

        return refactors

    def _parse_refactor_file(self, domain: str, refactor_file: Path) -> List[Dict[str, Any]]:
        """Parse a domain's REFACTOR-HISTORY.md file"""
        refactors = []

        try:
            content = refactor_file.read_text()

            # Split by refactor entries (assuming markdown headers)
            sections = re.split(r"\n##+\s+", content)

            for section in sections[1:]:  # Skip intro section
                if not section.strip():
                    continue

                refactor = self._parse_refactor_section(domain, section)
                if refactor:
                    refactors.append(refactor)

        except Exception as e:
            print(f"⚠️  Error parsing {refactor_file}: {e}")

        return refactors

    def _parse_refactor_section(self, domain: str, section: str) -> Optional[Dict[str, Any]]:
        """Parse a single refactor section"""
        lines = section.strip().split("\n")

        if not lines:
            return None

        # Extract date from first line (assumes format: ## YYYY-MM-DD - Description)
        first_line = lines[0]
        date_match = re.search(r"(\d{4}-\d{2}-\d{2})", first_line)

        # Extract description
        description = first_line
        if date_match:
            description = description.split(date_match)[0].strip("- ")
        description = re.sub(r"^##+\s*", "", description)

        # Extract lessons and gotchas
        lessons = []
        gotchas = []

        current_section = None
        for line in lines[1:]:
            line = line.strip()

            if line.startswith("### Lessons") or line.startswith("## Lessons"):
                current_section = "lessons"
            elif line.startswith("### Gotchas") or line.startswith("## Gotchas"):
                current_section = "gotchas"
            elif line.startswith("-") or line.startswith("*"):
                content = line.lstrip("-*").strip()
                if current_section == "lessons":
                    lessons.append(content)
                elif current_section == "gotchas":
                    gotchas.append(content)

        return {
            "id": f"REFACTOR-{domain}-{first_line[:10].replace(' ', '-').lower()}",
            "date": date_match.group(1) if date_match else "unknown",
            "domain": domain,
            "description": description,
            "lessons": lessons,
            "gotchas": gotchas,
            "affected_domains": [domain]
        }

    def generate_domain_files(self) -> None:
        """
        Generate REFACTOR-HISTORY.md files for each domain.

        Creates refactor history files based on CODE-INDEX data.
        """
        print("📝 Generating domain refactor files...")

        # Load CODE-INDEX
        code_index_path = self.memory_root / "CODE-INDEX.yaml"
        if not code_index_path.exists():
            print("❌ CODE-INDEX.yaml not found")
            return

        with open(code_index_path) as f:
            code_index = yaml.safe_load(f)

        refactors = code_index.get("refactors", [])

        # Group by domain
        domain_refactors: Dict[str, List[Dict]] = {}
        for refactor in refactors:
            for domain in refactor.get("affected_domains", []):
                if domain == "all":
                    continue  # Skip global refactors for domain-specific files
                if domain not in domain_refactors:
                    domain_refactors[domain] = []
                domain_refactors[domain].append(refactor)

        # Write domain files
        for domain, domain_refs in domain_refactors.items():
            domain_file = self.memory_root / "context" / "domains" / domain / "REFACTOR-HISTORY.md"
            domain_file.parent.mkdir(parents=True, exist_ok=True)

            with open(domain_file, "w") as f:
                f.write(f"# Refactor History: {domain}\n\n")
                f.write(f"This document tracks all refactors affecting the **{domain}** domain.\n\n")
                f.write(f"---\n\n")

                for refactor in domain_refs:
                    f.write(f"## {refactor['date']} - {refactor['description']}\n\n")

                    if refactor.get("lessons"):
                        f.write(f"### Lessons Learned\n\n")
                        for lesson in refactor["lessons"]:
                            f.write(f"- {lesson}\n")
                        f.write("\n")

                    if refactor.get("gotchas"):
                        f.write(f"### Gotchas\n\n")
                        for gotcha in refactor["gotchas"]:
                            f.write(f"- {gotcha}\n")
                        f.write("\n")

                    f.write("---\n\n")

            print(f"✅ Created: {domain_file}")

    def record_refactor(
        self,
        description: str,
        affected_domains: List[str],
        lessons: List[str],
        gotchas: List[str] = None
    ) -> Dict[str, Any]:
        """
        Record a new refactor.

        Args:
            description: What was refactored
            affected_domains: Which domains were affected
            lessons: Lessons learned
            gotchas: Gotchas discovered (optional)

        Returns:
            The refactor record
        """
        refactor_id = f"REFACTOR-{datetime.now().strftime('%Y%m%d-%H%M%S')}"

        refactor = {
            "id": refactor_id,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "description": description,
            "affected_domains": affected_domains,
            "lessons": lessons,
            "gotchas": gotchas or []
        }

        # Append to domain files
        for domain in affected_domains:
            domain_file = self.memory_root / "context" / "domains" / domain / "REFACTOR-HISTORY.md"
            domain_file.parent.mkdir(parents=True, exist_ok=True)

            with open(domain_file, "a") as f:
                f.write(f"## {refactor['date']} - {description}\n\n")
                f.write(f"### Lessons Learned\n\n")
                for lesson in lessons:
                    f.write(f"- {lesson}\n")
                f.write("\n")
                if gotchas:
                    f.write(f"### Gotchas\n\n")
                    for gotcha in gotchas:
                        f.write(f"- {gotcha}\n")
                    f.write("\n")
                f.write("---\n\n")

        print(f"✅ Recorded refactor: {refactor_id}")

        return refactor


def main():
    """CLI entry point for refactor tracker"""
    import sys

    project_root = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    tracker = RefactorTracker(project_root)

    if len(sys.argv) > 2 and sys.argv[2] == "generate":
        tracker.generate_domain_files()
    else:
        refactors = tracker.extract()
        for refactor in refactors:
            print(f"\n{refactor['date']}: {refactor['description']}")
            for lesson in refactor.get("lessons", []):
                print(f"  - {lesson}")


if __name__ == "__main__":
    main()
