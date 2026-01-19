#!/usr/bin/env python3
"""
Operation and Step definitions.

These are the building blocks of the guide system.
"""

from typing import List, Optional, Dict, Any
from dataclasses import dataclass


@dataclass
class Step:
    """A single step in an operation."""
    name: str
    description: str
    action: str
    command: Optional[str] = None
    expected_result: Optional[str] = None
    timeout: int = 60
    can_retry: bool = True
    auto_fix: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "name": self.name,
            "description": self.description,
            "action": self.action,
            "command": self.command,
            "expected_result": self.expected_result,
            "timeout": self.timeout,
            "can_retry": self.can_retry,
            "auto_fix": self.auto_fix
        }


@dataclass
class Trigger:
    """When to offer an operation."""
    event: str
    pattern: Optional[str] = None
    min_confidence: float = 0.5

    def matches(self, event: str, context: Dict[str, Any]) -> bool:
        """Check if trigger matches."""
        if self.event != event:
            return False

        if self.pattern and "file_path" in context:
            import re
            return bool(re.match(self.pattern, context["file_path"]))

        return True

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "event": self.event,
            "pattern": self.pattern,
            "min_confidence": self.min_confidence
        }
