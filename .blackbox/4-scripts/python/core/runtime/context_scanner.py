#!/usr/bin/env python3
"""
Context Scanner - Scan codebase for relevant context before actions
Implements "context is king" - always scan before acting
"""

from pathlib import Path
from typing import Dict, Any, Optional, List
import fnmatch
from dataclasses import dataclass
from datetime import datetime
import json


@dataclass
class CodebaseContext:
    """Context gathered from codebase scan"""
    similar_features: List[Dict[str, Any]]
    patterns: List[Dict[str, Any]]
    relevant_code: List[Dict[str, Any]]
    lessons_learned: List[Dict[str, Any]]
    scan_metadata: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "similar_features": self.similar_features,
            "patterns": self.patterns,
            "relevant_code": self.relevant_code,
            "lessons_learned": self.lessons_learned,
            "scan_metadata": self.scan_metadata
        }


class ContextScanner:
    """
    Scans codebase for context before agent actions

    Purpose:
    - Find similar features we've built
    - Find reusable patterns
    - Find relevant code
    - Find lessons learned from past work
    """

    def __init__(self,
                 project_root: Path,
                 max_results: int = 10):
        """
        Initialize context scanner

        Args:
            project_root: Root directory of project
            max_results: Maximum results per category
        """
        self.project_root = Path(project_root)
        self.max_results = max_results

        # Cache for scans
        self.scan_cache = {}

    def scan_context(self,
                    task: Any,
                    force_rescan: bool = False) -> CodebaseContext:
        """
        Scan codebase for context relevant to task

        Args:
            task: Task (dict or Task object) with description, requirements, etc.
            force_rescan: Force fresh scan instead of using cache

        Returns:
            CodebaseContext with all relevant information
        """
        # Handle both dict and Task objects
        if hasattr(task, 'description'):
            task_description = task.description
            task_requirements = getattr(task, 'requirements', [])
        else:
            task_description = task.get("description", "")
            task_requirements = task.get("requirements", [])

        task_keywords = self._extract_keywords(task_description)

        # Check cache first
        cache_key = "_".join(sorted(task_keywords))
        if not force_rescan and cache_key in self.scan_cache:
            return self.scan_cache[cache_key]

        # Scan codebase
        context = CodebaseContext(
            similar_features=self._find_similar_features(task_keywords),
            patterns=self._find_patterns(task_keywords),
            relevant_code=self._find_relevant_code(task_keywords),
            lessons_learned=self._find_lessons_learned(task_keywords),
            scan_metadata={
                "scanned_at": datetime.now().isoformat(),
                "task_keywords": task_keywords,
                "project_root": str(self.project_root)
            }
        )

        # Cache result
        self.scan_cache[cache_key] = context

        return context

    def _extract_keywords(self, text: str) -> List[str]:
        """Extract keywords from text"""
        # Simple keyword extraction
        # Remove common words
        stop_words = {
            "the", "a", "an", "and", "or", "but", "in", "on", "at",
            "to", "for", "of", "with", "by", "from", "as", "is", "was",
            "are", "been", "be", "have", "has", "had", "do", "does", "did",
            "will", "would", "should", "could", "may", "might", "can",
            "create", "build", "make", "get", "implement", "add"
        }

        words = text.lower().split()
        keywords = [w for w in words if w not in stop_words and len(w) > 3]

        return keywords

    def _find_similar_features(self, keywords: List[str]) -> List[Dict[str, Any]]:
        """Find similar features in codebase"""
        similar = []

        # Look for feature directories
        potential_dirs = [
            self.project_root / "features",
            self.project_root / "src" / "features",
            self.project_root / "lib" / "features",
            self.project_root / "app" / "features"
        ]

        for base_dir in potential_dirs:
            if not base_dir.exists():
                continue

            for feature_dir in base_dir.iterdir():
                if not feature_dir.is_dir():
                    continue

                # Check README for relevance
                readme = feature_dir / "README.md"
                if readme.exists():
                    relevance = self._calculate_relevance(readme, keywords)

                    if relevance > 0.3:  # 30% relevance threshold
                        similar.append({
                            "path": str(feature_dir.relative_to(self.project_root)),
                            "name": feature_dir.name,
                            "relevance": relevance,
                            "description": self._extract_description(readme)
                        })

        # Sort by relevance
        similar.sort(key=lambda x: x["relevance"], reverse=True)

        return similar[:self.max_results]

    def _find_patterns(self, keywords: List[str]) -> List[Dict[str, Any]]:
        """Find reusable patterns in codebase"""
        patterns = []

        # Look for pattern files
        potential_files = [
            "patterns.json",
            "patterns.yaml",
            ".patterns",
            "docs/patterns.md",
            "docs/architecture/patterns.md"
        ]

        for pattern_file in potential_files:
            path = self.project_root / pattern_file
            if not path.exists():
                continue

            # Try to parse and find relevant patterns
            if path.suffix in [".json", ".yaml"]:
                try:
                    with open(path) as f:
                        data = json.load(f) if path.suffix == ".json" else {}

                        if isinstance(data, dict):
                            for pattern_name, pattern_data in data.items():
                                relevance = self._calculate_relevance_from_dict(pattern_data, keywords)

                                if relevance > 0.3:
                                    patterns.append({
                                        "name": pattern_name,
                                        "path": str(path),
                                        "relevance": relevance,
                                        "data": pattern_data
                                    })
                except Exception:
                    pass

        # Sort by relevance
        patterns.sort(key=lambda x: x["relevance"], reverse=True)

        return patterns[:self.max_results]

    def _find_relevant_code(self, keywords: List[str]) -> List[Dict[str, Any]]:
        """Find relevant code files"""
        relevant = []

        # Search common code directories
        search_dirs = [
            self.project_root / "src",
            self.project_root / "lib",
            self.project_root / "app",
            self.project_root / "features"
        ]

        for search_dir in search_dirs:
            if not search_dir.exists():
                continue

            # Search for code files
            for code_file in search_dir.rglob("*"):
                if code_file.suffix not in [".py", ".js", ".ts", ".jsx", ".tsx"]:
                    continue

                # Calculate relevance based on filename and content
                relevance = 0.0

                # Filename relevance
                filename = code_file.name.lower()
                for keyword in keywords:
                    if keyword in filename:
                        relevance += 0.5

                # Content relevance (sample check)
                if relevance > 0:
                    try:
                        content = code_file.read_text()[:1000]  # First 1000 chars

                        for keyword in keywords:
                            if keyword in content.lower():
                                relevance += 0.2

                        if relevance > 0.5:
                            relevant.append({
                                "path": str(code_file.relative_to(self.project_root)),
                                "name": code_file.name,
                                "relevance": min(relevance, 1.0)  # Cap at 1.0
                            })
                    except Exception:
                        pass

        # Sort by relevance
        relevant.sort(key=lambda x: x["relevance"], reverse=True)

        return relevant[:self.max_results]

    def _find_lessons_learned(self, keywords: List[str]) -> List[Dict[str, Any]]:
        """Find lessons learned from past work"""
        lessons = []

        # Look for lessons files
        potential_files = [
            "LESSONS.md",
            "lessons-learned.md",
            "docs/lessons.md",
            "docs/lessons-learned.md",
            ".plans"  # Check plan folders for lessons
        ]

        for lessons_file in potential_files:
            path = self.project_root / lessons_file
            if path.is_dir():
                # Search for lesson files in plans
                for plan_dir in path.iterdir():
                    if not plan_dir.is_dir():
                        continue

                    # Check for lessons in plan
                    lessons_doc = plan_dir / "context" / "lessons.md"
                    if lessons_doc.exists():
                        relevance = self._calculate_relevance(lessons_doc, keywords)

                        if relevance > 0.3:
                            lessons.append({
                                "path": str(lessons_doc.relative_to(self.project_root)),
                                "plan": plan_dir.name,
                                "relevance": relevance,
                                "description": self._extract_description(lessons_doc)
                            })

            elif path.exists():
                # Single lessons file
                relevance = self._calculate_relevance(path, keywords)

                if relevance > 0.3:
                    lessons.append({
                        "path": str(path.relative_to(self.project_root)),
                        "relevance": relevance,
                        "description": self._extract_description(path)
                    })

        # Sort by relevance
        lessons.sort(key=lambda x: x["relevance"], reverse=True)

        return lessons[:self.max_results]

    def _calculate_relevance(self, file_path: Path, keywords: List[str]) -> float:
        """Calculate relevance of file to keywords"""
        try:
            content = file_path.read_text().lower()

            # Count keyword matches
            matches = sum(1 for keyword in keywords if keyword in content)

            # Normalize by content length
            relevance = matches / len(keywords) if keywords else 0

            return min(relevance, 1.0)

        except Exception:
            return 0.0

    def _calculate_relevance_from_dict(self, data: Dict[str, Any], keywords: List[str]) -> float:
        """Calculate relevance from dictionary data"""
        # Convert dict to string and check keywords
        data_str = str(data).lower()

        matches = sum(1 for keyword in keywords if keyword in data_str)

        return matches / len(keywords) if keywords else 0.0

    def _extract_description(self, file_path: Path, max_lines: int = 5) -> str:
        """Extract description from file"""
        try:
            content = file_path.read_text()
            lines = content.split("\n")

            # Get first few non-empty lines
            description_lines = []
            for line in lines:
                line = line.strip()
                if line and not line.startswith("#"):
                    description_lines.append(line)
                    if len(description_lines) >= max_lines:
                        break

            return " ".join(description_lines)[:200]  # First 200 chars

        except Exception:
            return ""


# Singleton instance
_scanner_instance = None

def get_context_scanner(project_root: Optional[Path] = None) -> ContextScanner:
    """Get singleton context scanner instance"""
    global _scanner_instance
    if _scanner_instance is None:
        root = project_root or Path.cwd()
        _scanner_instance = ContextScanner(root)
    return _scanner_instance
