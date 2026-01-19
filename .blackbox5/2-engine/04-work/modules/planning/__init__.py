"""
Blackbox3 Planning Module

Provides epic/story management, PRD workflows, and architecture
planning for AI-assisted development projects.
"""

__version__ = "1.0.0"
__author__ = "Blackbox3"

from .epic import EpicManager
from .story import StoryManager
from .prd import PRDManager
from .architecture import ArchitectureManager

__all__ = [
    "EpicManager",
    "StoryManager",
    "PRDManager",
    "ArchitectureManager",
]
