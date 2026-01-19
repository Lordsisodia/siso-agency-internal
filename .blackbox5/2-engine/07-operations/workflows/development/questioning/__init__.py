"""
Questioning Workflow Module for Blackbox4 Phase 3

This module provides a comprehensive sequential questioning system
to identify gaps, clarify ambiguities, and improve specification quality.

Main Components:
- QuestioningWorkflow: Main workflow orchestrator
- QuestioningSession: Session state management
- Question: Individual question representation
- GapAnalyzer: Gap identification and analysis
- QuestioningStrategy: Base class for questioning strategies
- InteractiveQuestions: Interactive CLI interface

Usage:
    from questioning import QuestioningWorkflow

    workflow = QuestioningWorkflow()
    session = workflow.start_session('spec.json', spec_type='webapp')

    # Run interactive session
    from questioning import InteractiveQuestions
    interactive = InteractiveQuestions(workflow)
    interactive.run_session()
"""

__version__ = '1.0.0'
__author__ = 'Blackbox4 Team'

from .questioning_workflow import (
    QuestioningWorkflow,
    QuestioningSession,
    Question,
    SessionStatus
)

from .question_strategies import (
    QuestioningStrategy,
    WebAppQuestioningStrategy,
    MobileAppQuestioningStrategy,
    APIQuestioningStrategy,
    GeneralQuestioningStrategy,
    get_strategy,
    list_strategies
)

from .gap_analysis import (
    GapAnalyzer,
    Gap,
    GapSeverity,
    GapCategory
)

from .interactive_questions import (
    InteractiveQuestions,
    start_interactive_session,
    continue_interactive_session
)

__all__ = [
    # Workflow
    'QuestioningWorkflow',
    'QuestioningSession',
    'Question',
    'SessionStatus',

    # Strategies
    'QuestioningStrategy',
    'WebAppQuestioningStrategy',
    'MobileAppQuestioningStrategy',
    'APIQuestioningStrategy',
    'GeneralQuestioningStrategy',
    'get_strategy',
    'list_strategies',

    # Gap Analysis
    'GapAnalyzer',
    'Gap',
    'GapSeverity',
    'GapCategory',

    # Interactive
    'InteractiveQuestions',
    'start_interactive_session',
    'continue_interactive_session'
]
