"""
Task Parser - Parse YAML frontmatter + markdown task files

Extracts structured metadata from YAML frontmatter and markdown body.
"""

import yaml
import re
from pathlib import Path
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from datetime import datetime


@dataclass
class ParsedTask:
    """
    Parsed task with all metadata from YAML frontmatter.

    This is the primary data structure for tasks in the system.
    """
    # Core identifiers
    id: str
    title: str
    description: str

    # Classification
    category: str
    subcategory: str
    domain: str
    tech_stack: List[str]

    # Current state
    status: str
    tier: Optional[int]
    workflow: Optional[str]

    # Priority & Risk
    priority: str
    risk_level: str
    confidence: float

    # Semantic relationships
    relates_to: List[str]
    blocks: List[str]
    blocked_by: List[str]
    depends_on: List[str]
    parent_prd: Optional[str]
    parent_epic: Optional[str]

    # Metadata
    tags: List[str]
    created_at: str
    created_by: str
    metadata: Dict[str, Any]

    # Content
    content: str  # Markdown body


class TaskParser:
    """
    Parse task files with YAML frontmatter + markdown body.

    Format:
    ---
    # YAML frontmatter (structured metadata)
    id: TASK-2026-01-18-001
    title: Task Title
    status: proposed
    ...

    ---

    # Markdown body (human-readable content)
    ## Overview

    Task description...
    """

    def parse(self, task_path: Path) -> ParsedTask:
        """
        Parse task file into structured data.

        Args:
            task_path: Path to task .md file

        Returns:
            ParsedTask with all metadata and content

        Raises:
            ValueError: If file format is invalid
        """
        if not task_path.exists():
            raise FileNotFoundError(f"Task not found: {task_path}")

        content = task_path.read_text()

        # Split on ---
        parts = content.split('---', 2)

        if len(parts) < 3:
            raise ValueError(
                f"Invalid task format: {task_path}\n"
                f"Expected: YAML frontmatter + markdown body"
            )

        # Parse YAML frontmatter
        try:
            frontmatter = yaml.safe_load(parts[1])
        except yaml.YAMLError as e:
            raise ValueError(f"Invalid YAML in frontmatter: {e}")

        if not isinstance(frontmatter, dict):
            raise ValueError("Frontmatter must be a YAML dictionary")

        markdown_body = parts[2]

        # Extract description (first paragraph)
        description = self._extract_description(markdown_body)

        # Build ParsedTask
        return ParsedTask(
            id=frontmatter.get('id', task_path.stem),
            title=frontmatter.get('title', 'Untitled'),
            description=description,

            category=frontmatter.get('category', 'feature'),
            subcategory=frontmatter.get('subcategory', ''),
            domain=frontmatter.get('domain', ''),
            tech_stack=frontmatter.get('tech_stack', []),

            status=frontmatter.get('status', 'proposed'),
            tier=frontmatter.get('tier'),
            workflow=frontmatter.get('workflow'),

            priority=frontmatter.get('priority', 'medium'),
            risk_level=frontmatter.get('risk_level', 'medium'),
            confidence=frontmatter.get('confidence', 0.5),

            relates_to=frontmatter.get('relates_to', []),
            blocks=frontmatter.get('blocks', []),
            blocked_by=frontmatter.get('blocked_by', []),
            depends_on=frontmatter.get('depends_on', []),
            parent_prd=frontmatter.get('parent_prd'),
            parent_epic=frontmatter.get('parent_epic'),

            tags=frontmatter.get('tags', []),
            created_at=frontmatter.get('created_at', datetime.now().isoformat()),
            created_by=frontmatter.get('created_by', 'unknown'),
            metadata=frontmatter.get('metadata', {}),

            content=markdown_body
        )

    def _extract_description(self, markdown: str) -> str:
        """
        Extract first paragraph as description.

        Looks for first non-header, non-empty line and takes
        that paragraph as the description.
        """
        lines = markdown.strip().split('\n')

        for i, line in enumerate(lines):
            stripped = line.strip()

            # Skip empty lines and headers
            if not stripped or stripped.startswith('#'):
                continue

            # Found first content line - get paragraph
            desc_lines = [stripped]

            for j in range(i + 1, len(lines)):
                next_line = lines[j].strip()
                if next_line:
                    desc_lines.append(next_line)
                else:
                    break  # Empty line ends paragraph

            return ' '.join(desc_lines)

        return "No description"

    def update_frontmatter(
        self,
        task_path: Path,
        updates: Dict[str, Any]
    ) -> None:
        """
        Update YAML frontmatter fields.

        Args:
            task_path: Path to task file
            updates: Dictionary of fields to update
        """
        content = task_path.read_text()
        parts = content.split('---', 2)

        if len(parts) < 3:
            raise ValueError("Invalid task format")

        # Parse existing frontmatter
        frontmatter = yaml.safe_load(parts[1])

        # Apply updates
        frontmatter.update(updates)

        # Reconstruct file
        new_frontmatter = yaml.dump(frontmatter, default_flow_style=False)
        new_content = f"---{new_frontmatter}---{parts[2]}"

        task_path.write_text(new_content)
