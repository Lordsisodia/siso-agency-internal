#!/usr/bin/env python3
"""
Context Management for SISO-Internal Autonomous System

Manages context windows, token budgets, and context compression.
Provides utilities for tracking context usage and triggering actions
at specific thresholds.

Adapted from BlackBox5 RALF-Core context budget system.
"""

import re
from pathlib import Path
from typing import Dict, List, Optional, Any, Callable, Tuple
from dataclasses import dataclass, field
from enum import Enum


class ContextThreshold(Enum):
    """Context usage thresholds with associated actions."""
    GREEN = 50  # Normal operation
    YELLOW = 70  # Start summarizing
    ORANGE = 85  # Complete current task, exit
    RED = 95  # Force checkpoint, exit immediately


class ContextAction(Enum):
    """Actions to take at context thresholds."""
    CONTINUE = "continue"  # Normal operation
    SUMMARIZE = "summarize"  # Summarize THOUGHTS.md
    COMPLETE_EXIT = "complete_exit"  # Complete task, exit with PARTIAL
    FORCE_EXIT = "force_exit"  # Force checkpoint, exit immediately


@dataclass
class ContextBudget:
    """Tracks context usage and available budget."""
    max_tokens: int = 200000  # Default max context window
    used_tokens: int = 0
    reserved_tokens: int = 10000  # Reserve for response
    critical_threshold: float = 0.95
    warning_threshold: float = 0.70

    @property
    def available_tokens(self) -> int:
        """Calculate available tokens."""
        return self.max_tokens - self.used_tokens - self.reserved_tokens

    @property
    def usage_percentage(self) -> float:
        """Calculate usage percentage."""
        return (self.used_tokens / self.max_tokens) * 100

    @property
    def is_critical(self) -> bool:
        """Check if context usage is critical."""
        return self.usage_percentage >= (self.critical_threshold * 100)

    @property
    def is_warning(self) -> bool:
        """Check if context usage is at warning level."""
        return self.usage_percentage >= (self.warning_threshold * 100)

    def can_add(self, tokens: int) -> bool:
        """Check if we can add N tokens without exceeding budget."""
        return (self.used_tokens + tokens) < (self.max_tokens - self.reserved_tokens)

    def add_usage(self, tokens: int):
        """Add to used token count."""
        self.used_tokens += tokens

    def get_action(self) -> ContextAction:
        """Determine action based on current usage."""
        pct = self.usage_percentage

        if pct >= ContextThreshold.RED.value:
            return ContextAction.FORCE_EXIT
        elif pct >= ContextThreshold.ORANGE.value:
            return ContextAction.COMPLETE_EXIT
        elif pct >= ContextThreshold.YELLOW.value:
            return ContextAction.SUMMARIZE
        else:
            return ContextAction.CONTINUE


class TokenEstimator:
    """Estimates token count for text."""

    # Approximate tokens per character ratios for different models
    TOKENS_PER_CHAR = {
        "claude": 0.25,  # Claude models
        "gpt4": 0.25,   # GPT-4
        "gpt3": 0.3,    # GPT-3.5
        "default": 0.25,
    }

    def __init__(self, model: str = "default"):
        """Initialize estimator for a specific model."""
        self.model = model
        self.ratio = self.TOKENS_PER_CHAR.get(model, self.TOKENS_PER_CHAR["default"])

    def estimate(self, text: str) -> int:
        """Estimate token count for text."""
        return int(len(text) * self.ratio)

    def estimate_file(self, file_path: Path) -> int:
        """Estimate token count for a file."""
        try:
            content = file_path.read_text()
            return self.estimate(content)
        except Exception:
            return 0


class ContextCompressor:
    """Compresses context to fit within budget."""

    def __init__(self, estimator: Optional[TokenEstimator] = None):
        """Initialize compressor."""
        self.estimator = estimator or TokenEstimator()

    def compress_thoughts(self, thoughts_content: str, target_tokens: int) -> str:
        """Compress THOUGHTS.md content to target token count.

        Strategy:
        1. Keep first 20% (initial assessment)
        2. Keep last 30% (recent decisions)
        3. Summarize middle 50%
        """
        lines = thoughts_content.split("\n")
        total_lines = len(lines)

        if total_lines < 20:
            return thoughts_content

        # Split into sections
        first_section = lines[:int(total_lines * 0.2)]
        middle_section = lines[int(total_lines * 0.2):int(total_lines * 0.8)]
        last_section = lines[int(total_lines * 0.8):]

        # Summarize middle section
        middle_summary = self._summarize_lines(middle_section)

        # Combine
        compressed = (
            "\n".join(first_section) + "\n\n" +
            "## [COMPRESSED] Middle Section Summary\n\n" +
            middle_summary + "\n\n" +
            "## [RESUMED] Recent Thoughts\n\n" +
            "\n".join(last_section)
        )

        return compressed

    def _summarize_lines(self, lines: List[str]) -> str:
        """Create a summary of lines."""
        # Extract key points (lines starting with - or containing decisions)
        key_points = []
        for line in lines:
            stripped = line.strip()
            if stripped.startswith(("- ", "* ", "## ", "### ")):
                key_points.append(stripped)
            elif "decision" in stripped.lower() or "conclusion" in stripped.lower():
                key_points.append(stripped)

        if not key_points:
            return "[No key points extracted]"

        # Limit to most important points
        return "\n".join(key_points[:20])

    def compress_files_list(self, files: List[Path], max_files: int = 50) -> List[Path]:
        """Compress a list of files to most important ones."""
        if len(files) <= max_files:
            return files

        # Priority order
        priority_patterns = [
            r"README",
            r"CLAUDE",
            r"STATE",
            r"ACTIVE",
            r"\.md$",
            r"config",
            r"\.yaml$",
            r"\.json$",
        ]

        scored_files = []
        for file in files:
            score = 0
            file_str = str(file)

            for i, pattern in enumerate(priority_patterns):
                if re.search(pattern, file_str, re.IGNORECASE):
                    score += len(priority_patterns) - i
                    break

            scored_files.append((score, file))

        # Sort by score descending
        scored_files.sort(key=lambda x: x[0], reverse=True)

        # Take top files
        return [f for _, f in scored_files[:max_files]]


class ContextManager:
    """Manages context for autonomous runs."""

    def __init__(
        self,
        autonomous_root: Optional[Path] = None,
        max_tokens: int = 200000,
        model: str = "default",
    ):
        """Initialize context manager."""
        if autonomous_root is None:
            autonomous_root = Path(__file__).parent.parent

        self.autonomous_root = Path(autonomous_root)
        self.budget = ContextBudget(max_tokens=max_tokens)
        self.estimator = TokenEstimator(model)
        self.compressor = ContextCompressor(self.estimator)

        # Threshold handlers
        self._handlers: Dict[ContextThreshold, List[Callable]] = {
            threshold: [] for threshold in ContextThreshold
        }

    def register_handler(self, threshold: ContextThreshold, handler: Callable):
        """Register a handler for a specific threshold."""
        self._handlers[threshold].append(handler)

    def check_thresholds(self) -> Tuple[ContextThreshold, ContextAction]:
        """Check current context usage and trigger handlers if needed."""
        pct = self.budget.usage_percentage

        # Determine which threshold we're at
        if pct >= ContextThreshold.RED.value:
            threshold = ContextThreshold.RED
        elif pct >= ContextThreshold.ORANGE.value:
            threshold = ContextThreshold.ORANGE
        elif pct >= ContextThreshold.YELLOW.value:
            threshold = ContextThreshold.YELLOW
        else:
            threshold = ContextThreshold.GREEN

        action = self.budget.get_action()

        # Trigger handlers
        for handler in self._handlers.get(threshold, []):
            try:
                handler(self.budget, action)
            except Exception as e:
                print(f"Error in threshold handler: {e}")

        return threshold, action

    def add_content(self, content: str) -> bool:
        """Add content to context, checking budget.

        Returns:
            True if added successfully, False if would exceed budget
        """
        tokens = self.estimator.estimate(content)

        if not self.budget.can_add(tokens):
            return False

        self.budget.add_usage(tokens)
        return True

    def add_file(self, file_path: Path) -> bool:
        """Add file content to context.

        Returns:
            True if added successfully, False if would exceed budget
        """
        tokens = self.estimator.estimate_file(file_path)

        if not self.budget.can_add(tokens):
            return False

        self.budget.add_usage(tokens)
        return True

    def get_status(self) -> Dict[str, Any]:
        """Get current context status."""
        threshold, action = self.check_thresholds()

        return {
            "max_tokens": self.budget.max_tokens,
            "used_tokens": self.budget.used_tokens,
            "available_tokens": self.budget.available_tokens,
            "usage_percentage": self.budget.usage_percentage,
            "threshold": threshold.value,
            "threshold_name": threshold.name,
            "action": action.value,
            "is_critical": self.budget.is_critical,
            "is_warning": self.budget.is_warning,
        }

    def should_delegate(self, threshold_pct: float = 40.0) -> bool:
        """Check if we should delegate to sub-agents.

        This implements the 40% sub-agent threshold from BlackBox5.
        """
        return self.budget.usage_percentage >= threshold_pct

    def compress_if_needed(self, thoughts_file: Path) -> Optional[str]:
        """Compress thoughts file if context is getting full.

        Returns:
            Compressed content if compression was performed, None otherwise
        """
        if self.budget.usage_percentage < ContextThreshold.YELLOW.value:
            return None

        if not thoughts_file.exists():
            return None

        content = thoughts_file.read_text()
        target_tokens = int(self.budget.max_tokens * 0.1)  # Target 10% of budget

        compressed = self.compressor.compress_thoughts(content, target_tokens)

        return compressed


def get_context_manager(
    autonomous_root: Optional[Path] = None,
    max_tokens: int = 200000,
) -> ContextManager:
    """Get the default context manager instance."""
    return ContextManager(autonomous_root, max_tokens)


if __name__ == "__main__":
    # Simple CLI for testing
    import sys

    if len(sys.argv) < 2:
        print("Usage: python context_management.py [test|status|estimate <file>]")
        sys.exit(1)

    if sys.argv[1] == "test":
        print("Testing context management...")

        manager = ContextManager(max_tokens=10000)

        # Test budget tracking
        manager.add_content("This is some test content " * 100)
        status = manager.get_status()
        print(f"✓ Usage: {status['usage_percentage']:.1f}%")
        print(f"✓ Action: {status['action']}")

        # Test threshold detection
        manager.budget.used_tokens = 7500  # 75%
        threshold, action = manager.check_thresholds()
        print(f"✓ At {threshold.name} threshold, action: {action.value}")

        # Test compression
        long_content = "Line of thoughts\n" * 100
        compressed = manager.compressor.compress_thoughts(long_content, 500)
        print(f"✓ Compressed {len(long_content)} chars to {len(compressed)} chars")

        # Test delegation threshold
        manager.budget.used_tokens = 4000  # 40%
        should_delegate = manager.should_delegate()
        print(f"✓ Should delegate at 40%: {should_delegate}")

        print("\nAll tests passed!")

    elif sys.argv[1] == "status":
        manager = get_context_manager()
        status = manager.get_status()
        print("\nContext Status:")
        print(f"  Max Tokens: {status['max_tokens']:,}")
        print(f"  Used Tokens: {status['used_tokens']:,}")
        print(f"  Available: {status['available_tokens']:,}")
        print(f"  Usage: {status['usage_percentage']:.1f}%")
        print(f"  Threshold: {status['threshold_name']}")
        print(f"  Action: {status['action']}")

    elif sys.argv[1] == "estimate" and len(sys.argv) > 2:
        file_path = Path(sys.argv[2])
        estimator = TokenEstimator()
        tokens = estimator.estimate_file(file_path)
        print(f"\nEstimated tokens for {file_path}:")
        print(f"  ~{tokens:,} tokens")
