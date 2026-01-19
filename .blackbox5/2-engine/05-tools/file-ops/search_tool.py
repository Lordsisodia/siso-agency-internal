"""
Black Box 5 Engine - Search Tool

Tool for searching text in files.
"""

from pathlib import Path
from typing import Optional, Dict, Any, List
import re
import logging

from .base import BaseTool, ToolResult, ToolParameter, ToolRisk

logger = logging.getLogger("SearchTool")


class SearchTool(BaseTool):
    """
    Tool for searching text in files.

    Supports:
    - Simple text search
    - Regular expression patterns
    - File pattern filtering
    - Directory recursion
    - Case-sensitive/insensitive search
    """

    name = "search"
    description = "Search for text or patterns in files"
    risk = ToolRisk.LOW
    parameters = [
        ToolParameter(
            name="pattern",
            type="str",
            description="Text or regex pattern to search for",
            required=True,
            min_length=1
        ),
        ToolParameter(
            name="path",
            type="str",
            description="Directory to search in (default: current directory)",
            required=False,
            default="."
        ),
        ToolParameter(
            name="file_pattern",
            type="str",
            description="Glob pattern for files to search (e.g., '*.py')",
            required=False,
            default="*"
        ),
        ToolParameter(
            name="use_regex",
            type="bool",
            description="Treat pattern as regular expression",
            required=False,
            default=False
        ),
        ToolParameter(
            name="case_sensitive",
            type="bool",
            description="Case-sensitive search",
            required=False,
            default=False
        ),
        ToolParameter(
            name="recursive",
            type="bool",
            description="Search recursively in subdirectories",
            required=False,
            default=True
        ),
        ToolParameter(
            name="max_results",
            type="int",
            description="Maximum number of results to return",
            required=False,
            default=100
        ),
        ToolParameter(
            name="context_lines",
            type="int",
            description="Number of context lines to show around matches",
            required=False,
            default=0
        )
    ]

    async def run(self, **kwargs) -> ToolResult:
        """
        Search for text in files.

        Args:
            pattern: Text or regex pattern to search for
            path: Directory to search in
            file_pattern: Glob pattern for files
            use_regex: Whether to use regex
            case_sensitive: Case-sensitive search
            recursive: Recursive search
            max_results: Maximum results
            context_lines: Context lines around matches

        Returns:
            ToolResult with search results
        """
        # Validate parameters
        error = self.validate_parameters(kwargs)
        if error:
            return ToolResult(success=False, error=error)

        pattern = kwargs["pattern"]
        path_str = kwargs.get("path", ".")
        file_pattern = kwargs.get("file_pattern", "*")
        use_regex = kwargs.get("use_regex", False)
        case_sensitive = kwargs.get("case_sensitive", False)
        recursive = kwargs.get("recursive", True)
        max_results = kwargs.get("max_results", 100)
        context_lines = kwargs.get("context_lines", 0)

        try:
            search_path = Path(path_str).resolve()

            # Security check
            if not self._is_path_allowed(search_path):
                return ToolResult(
                    success=False,
                    error=f"Access to path '{search_path}' is not allowed"
                )

            if not search_path.exists():
                return ToolResult(
                    success=False,
                    error=f"Search path does not exist: {path_str}"
                )

            # Compile regex pattern
            if use_regex:
                try:
                    flags = 0 if case_sensitive else re.IGNORECASE
                    regex = re.compile(pattern, flags)
                except re.error as e:
                    return ToolResult(
                        success=False,
                        error=f"Invalid regex pattern: {str(e)}"
                    )
            else:
                # Simple text search
                flags = 0 if case_sensitive else re.IGNORECASE
                # Escape special regex characters for literal search
                regex = re.compile(re.escape(pattern), flags)

            # Collect files to search
            files = self._collect_files(search_path, file_pattern, recursive)

            if not files:
                return ToolResult(
                    success=True,
                    data=[],
                    metadata={
                        "pattern": pattern,
                        "path": str(search_path),
                        "files_searched": 0,
                        "matches": 0
                    }
                )

            # Search in files
            results = []
            total_matches = 0

            for file_path in files:
                if len(results) >= max_results:
                    break

                try:
                    file_results = await self._search_in_file(
                        file_path,
                        regex,
                        context_lines,
                        max_results - len(results)
                    )

                    if file_results:
                        results.extend(file_results)
                        total_matches += sum(r["match_count"] for r in file_results)

                except Exception as e:
                    logger.warning(f"Error searching in {file_path}: {e}")
                    continue

            # Prepare metadata
            metadata = {
                "pattern": pattern,
                "path": str(search_path),
                "file_pattern": file_pattern,
                "use_regex": use_regex,
                "case_sensitive": case_sensitive,
                "recursive": recursive,
                "files_searched": len(files),
                "files_with_matches": len(results),
                "total_matches": total_matches,
                "max_results_reached": len(results) >= max_results
            }

            return ToolResult(
                success=True,
                data=results,
                metadata=metadata
            )

        except Exception as e:
            logger.exception(f"Error during search")
            return ToolResult(
                success=False,
                error=f"Error during search: {str(e)}"
            )

    def _collect_files(
        self,
        search_path: Path,
        file_pattern: str,
        recursive: bool
    ) -> List[Path]:
        """Collect files to search"""
        files = []

        if search_path.is_file():
            return [search_path]

        # Use glob to find files
        if recursive:
            files = list(search_path.rglob(file_pattern))
        else:
            files = list(search_path.glob(file_pattern))

        # Filter to files only (not directories)
        files = [f for f in files if f.is_file()]

        return files

    async def _search_in_file(
        self,
        file_path: Path,
        regex: re.Pattern,
        context_lines: int,
        max_results: int
    ) -> List[Dict[str, Any]]:
        """Search for pattern in a single file"""
        try:
            content = file_path.read_text(encoding='utf-8', errors='ignore')
            lines = content.splitlines(keepends=True)

            matches = []

            for line_num, line in enumerate(lines, 1):
                # Find all matches in this line
                for match in regex.finditer(line):
                    if len(matches) >= max_results:
                        break

                    match_data = {
                        "file": str(file_path),
                        "line_number": line_num,
                        "line_content": line.rstrip('\n\r'),
                        "match_text": match.group(0),
                        "match_start": match.start(),
                        "match_end": match.end(),
                        "match_count": 1
                    }

                    # Add context if requested
                    if context_lines > 0:
                        context_start = max(0, line_num - context_lines - 1)
                        context_end = min(len(lines), line_num + context_lines)

                        match_data["context_before"] = [
                            lines[i].rstrip('\n\r')
                            for i in range(context_start, line_num - 1)
                        ]
                        match_data["context_after"] = [
                            lines[i].rstrip('\n\r')
                            for i in range(line_num, context_end)
                        ]

                    matches.append(match_data)

            return matches

        except Exception as e:
            logger.warning(f"Error reading file {file_path}: {e}")
            return []

    def _is_path_allowed(self, path: Path) -> bool:
        """Check if path is within allowed directories"""
        # TODO: Implement proper path filtering
        return True
