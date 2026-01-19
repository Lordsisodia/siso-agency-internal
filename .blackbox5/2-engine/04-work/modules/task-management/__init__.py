"""
Task Management System for BlackBox5

Enhanced task management with:
- YAML frontmatter + markdown storage
- Multi-dimensional analysis (complexity, value, compute, speed, type)
- Logarithmic scoring for natural task distribution
- Intelligent workflow routing

Usage:
    from .parser import TaskParser, ParsedTask
    from .repository import TaskRepository
    from .analyzers.enhanced_analyzer import LogEnhancedTaskAnalyzer, LogTaskAnalysis

    # Create task
    repo = TaskRepository()
    task = repo.create_task(
        title="Implement user authentication",
        description="Add OAuth2 authentication flow",
        category="feature",
        priority="high"
    )

    # Analyze task
    analyzer = LogEnhancedTaskAnalyzer()
    analysis = analyzer.analyze(task)

    print(f"Tier: {analysis.recommended_tier}")
    print(f"Workflow: {analysis.recommended_workflow}")
    print(f"ROI: {analysis.roi_score}")
"""

from .parser import TaskParser, ParsedTask
from .repository import TaskRepository
from .analyzers.enhanced_analyzer import (
    LogEnhancedTaskAnalyzer,
    LogTaskAnalysis
)
from .analyzers.complexity_analyzer import LogComplexityAnalyzer
from .analyzers.value_analyzer import LogValueAnalyzer
from .analyzers.compute_analyzer import LogComputeAnalyzer
from .analyzers.speed_analyzer import LogSpeedAnalyzer
from .analyzers.task_type_detector import TaskTypeDetector, TaskType

__all__ = [
    'TaskParser',
    'ParsedTask',
    'TaskRepository',
    'LogEnhancedTaskAnalyzer',
    'LogTaskAnalysis',
    'LogComplexityAnalyzer',
    'LogValueAnalyzer',
    'LogComputeAnalyzer',
    'LogSpeedAnalyzer',
    'TaskTypeDetector',
    'TaskType',
]
