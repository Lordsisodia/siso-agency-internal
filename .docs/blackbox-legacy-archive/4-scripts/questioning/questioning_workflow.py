#!/usr/bin/env python3
"""
Questioning Workflow for Blackbox4 Phase 3
Sequential questioning system to identify gaps and improve specs
"""

import sys
import os
import json
import uuid
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional, Any
from dataclasses import dataclass, field, asdict
from enum import Enum

# Add parent lib to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'lib', 'spec-creation'))

try:
    from spec_types import StructuredSpec
    from questioning import QuestioningEngine, QuestionArea
except ImportError:
    print("Error: spec_creation modules not found")
    sys.exit(1)


class SessionStatus(Enum):
    """Status of a questioning session."""
    CREATED = "created"
    IN_PROGRESS = "in_progress"
    PAUSED = "paused"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


@dataclass
class Question:
    """A question in the questioning workflow."""
    id: str
    text: str
    area: str
    priority: str
    category: str
    context: Dict[str, Any] = field(default_factory=dict)
    dependencies: List[str] = field(default_factory=list)
    answered: bool = False
    answer: Optional[str] = None
    skipped: bool = False
    skip_reason: Optional[str] = None
    timestamp: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        data = asdict(self)
        data['timestamp'] = self.timestamp or datetime.now().isoformat()
        return data

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Question':
        """Create from dictionary."""
        return cls(**data)


@dataclass
class QuestioningSession:
    """A questioning session for a spec."""
    session_id: str
    spec_path: str
    spec: StructuredSpec
    status: SessionStatus = SessionStatus.CREATED
    questions: List[Question] = field(default_factory=list)
    current_question_index: int = 0
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: Dict[str, Any] = field(default_factory=dict)

    def add_question(self, question: Question) -> None:
        """Add a question to the session."""
        self.questions.append(question)
        self.updated_at = datetime.now().isoformat()

    def get_current_question(self) -> Optional[Question]:
        """Get the current question."""
        if 0 <= self.current_question_index < len(self.questions):
            return self.questions[self.current_question_index]
        return None

    def answer_current_question(self, answer: str) -> None:
        """Answer the current question."""
        question = self.get_current_question()
        if question:
            question.answered = True
            question.answer = answer
            question.timestamp = datetime.now().isoformat()
            self.current_question_index += 1
            self.updated_at = datetime.now().isoformat()

    def skip_current_question(self, reason: str = "User skipped") -> None:
        """Skip the current question."""
        question = self.get_current_question()
        if question:
            question.skipped = True
            question.skip_reason = reason
            question.timestamp = datetime.now().isoformat()
            self.current_question_index += 1
            self.updated_at = datetime.now().isoformat()

    def get_progress(self) -> Dict[str, Any]:
        """Get session progress."""
        total = len(self.questions)
        answered = sum(1 for q in self.questions if q.answered)
        skipped = sum(1 for q in self.questions if q.skipped)
        remaining = total - self.current_question_index

        return {
            'total': total,
            'answered': answered,
            'skipped': skipped,
            'remaining': remaining,
            'percentage': round((answered / total * 100) if total > 0 else 0, 1)
        }

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            'session_id': self.session_id,
            'spec_path': self.spec_path,
            'status': self.status.value,
            'questions': [q.to_dict() for q in self.questions],
            'current_question_index': self.current_question_index,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'metadata': self.metadata,
            'progress': self.get_progress()
        }

    def save(self, filepath: str) -> None:
        """Save session to file."""
        with open(filepath, 'w') as f:
            json.dump(self.to_dict(), f, indent=2)

    @classmethod
    def load(cls, filepath: str, spec: StructuredSpec) -> 'QuestioningSession':
        """Load session from file."""
        with open(filepath, 'r') as f:
            data = json.load(f)

        session = cls(
            session_id=data['session_id'],
            spec_path=data['spec_path'],
            spec=spec,
            status=SessionStatus(data['status']),
            current_question_index=data['current_question_index'],
            created_at=data['created_at'],
            updated_at=data['updated_at'],
            metadata=data.get('metadata', {})
        )

        # Load questions
        for q_data in data['questions']:
            session.questions.append(Question.from_dict(q_data))

        return session


class QuestioningWorkflow:
    """Main workflow orchestrator for questioning sessions."""

    def __init__(self, sessions_dir: Optional[str] = None):
        """
        Initialize the questioning workflow.

        Args:
            sessions_dir: Directory to store session state files
        """
        if sessions_dir is None:
            sessions_dir = os.path.join(
                os.path.dirname(__file__),
                'sessions'
            )

        self.sessions_dir = Path(sessions_dir)
        self.sessions_dir.mkdir(parents=True, exist_ok=True)

        self.engine = QuestioningEngine()
        self.active_session: Optional[QuestioningSession] = None

    def start_session(
        self,
        spec_path: str,
        spec_type: str = "general",
        strategy: Optional[str] = None
    ) -> QuestioningSession:
        """
        Start a new questioning session for a spec.

        Args:
            spec_path: Path to the spec file
            spec_type: Type of spec (webapp, mobile, api, general)
            strategy: Questioning strategy to use

        Returns:
            QuestioningSession: The created session
        """
        # Load spec
        spec = StructuredSpec.load(spec_path)

        # Create session
        session_id = str(uuid.uuid4())[:8]
        session = QuestioningSession(
            session_id=session_id,
            spec_path=spec_path,
            spec=spec,
            status=SessionStatus.CREATED,
            metadata={
                'spec_type': spec_type,
                'strategy': strategy or 'default'
            }
        )

        # Import strategy module
        try:
            from question_strategies import get_strategy

            strat_cls = get_strategy(spec_type)
            strategy_obj = strat_cls()

            # Generate questions using strategy
            questions = strategy_obj.generate_questions(spec)
            for q_data in questions:
                question = Question(
                    id=str(uuid.uuid4())[:8],
                    text=q_data['question'],
                    area=q_data['area'],
                    priority=q_data['priority'],
                    category=q_data['category'],
                    context=q_data.get('context', {}),
                    dependencies=q_data.get('dependencies', [])
                )
                session.add_question(question)

        except ImportError:
            # Fallback to basic questioning engine
            gaps = self.engine.analyze_gaps(spec)

            for gap in gaps:
                question = Question(
                    id=str(uuid.uuid4())[:8],
                    text=f"Gap identified: {gap['description']}. {gap['recommendation']}",
                    area=gap['area'],
                    priority=gap['severity'],
                    category='gap_analysis',
                    context={'gap': gap}
                )
                session.add_question(question)

        # Save session
        session_file = self.sessions_dir / f"{session_id}.json"
        session.save(str(session_file))

        self.active_session = session
        return session

    def next_question(self) -> Optional[Question]:
        """
        Get the next question in the sequence.

        Returns:
            Next Question or None if no more questions
        """
        if not self.active_session:
            return None

        return self.active_session.get_current_question()

    def record_answer(self, answer: str) -> bool:
        """
        Record user's answer to current question.

        Args:
            answer: User's answer

        Returns:
            True if answer was recorded, False if no active question
        """
        if not self.active_session:
            return False

        self.active_session.answer_current_question(answer)
        self._save_active_session()
        return True

    def skip_question(self, reason: str = "User skipped") -> bool:
        """
        Skip the current question.

        Args:
            reason: Reason for skipping

        Returns:
            True if question was skipped, False if no active question
        """
        if not self.active_session:
            return False

        self.active_session.skip_current_question(reason)
        self._save_active_session()
        return True

    def get_gaps(self) -> List[Dict[str, Any]]:
        """
        Get list of identified gaps from the spec.

        Returns:
            List of gap dictionaries
        """
        if not self.active_session:
            return []

        return self.engine.analyze_gaps(self.active_session.spec)

    def update_spec(self) -> bool:
        """
        Update spec with answers from the session.

        Returns:
            True if spec was updated, False otherwise
        """
        if not self.active_session:
            return False

        spec = self.active_session.spec

        # Add clarifications for answered questions
        for question in self.active_session.questions:
            if question.answered and question.answer:
                spec.add_clarification(question.text, question.answer)

        # Save updated spec
        spec.save(self.active_session.spec_path)

        return True

    def export_transcript(self, output_path: str) -> bool:
        """
        Export questioning session transcript.

        Args:
            output_path: Path to save transcript

        Returns:
            True if export was successful
        """
        if not self.active_session:
            return False

        # Generate markdown transcript
        lines = [
            f"# Questioning Session Transcript",
            f"",
            f"**Session ID:** {self.active_session.session_id}",
            f"**Spec:** {self.active_session.spec.project_name}",
            f"**Status:** {self.active_session.status.value}",
            f"**Created:** {self.active_session.created_at}",
            f"",
            f"## Progress",
            f"",
        ]

        progress = self.active_session.get_progress()
        lines.extend([
            f"- Total Questions: {progress['total']}",
            f"- Answered: {progress['answered']}",
            f"- Skipped: {progress['skipped']}",
            f"- Remaining: {progress['remaining']}",
            f"- Completion: {progress['percentage']}%",
            f"",
            f"## Questions & Answers",
            f""
        ])

        for i, question in enumerate(self.active_session.questions, 1):
            status = "✓" if question.answered else "⊘" if question.skipped else "○"
            lines.append(f"### {status} Q{i}: {question.text}")
            lines.append(f"")
            lines.append(f"**Area:** {question.area}")
            lines.append(f"**Priority:** {question.priority}")
            lines.append(f"**Category:** {question.category}")

            if question.answered:
                lines.append(f"**Answer:** {question.answer}")
            elif question.skipped:
                lines.append(f"**Skipped:** {question.skip_reason}")

            lines.append(f"")
            lines.append(f"---")
            lines.append(f"")

        # Write transcript
        with open(output_path, 'w') as f:
            f.write('\n'.join(lines))

        return True

    def _save_active_session(self) -> None:
        """Save the active session to disk."""
        if self.active_session:
            session_file = self.sessions_dir / f"{self.active_session.session_id}.json"
            self.active_session.save(str(session_file))

    def load_session(self, session_id: str, spec_path: str) -> bool:
        """
        Load an existing questioning session.

        Args:
            session_id: ID of session to load
            spec_path: Path to spec file

        Returns:
            True if session was loaded successfully
        """
        session_file = self.sessions_dir / f"{session_id}.json"

        if not session_file.exists():
            return False

        spec = StructuredSpec.load(spec_path)
        self.active_session = QuestioningSession.load(str(session_file), spec)
        return True

    def list_sessions(self) -> List[Dict[str, Any]]:
        """
        List all questioning sessions.

        Returns:
            List of session summaries
        """
        sessions = []

        for session_file in self.sessions_dir.glob("*.json"):
            try:
                with open(session_file, 'r') as f:
                    data = json.load(f)

                sessions.append({
                    'session_id': data['session_id'],
                    'spec_path': data['spec_path'],
                    'status': data['status'],
                    'created_at': data['created_at'],
                    'updated_at': data['updated_at'],
                    'progress': data.get('progress', {})
                })
            except (json.JSONDecodeError, KeyError):
                continue

        return sorted(sessions, key=lambda x: x['created_at'], reverse=True)


def main():
    """CLI entry point for questioning workflow."""
    import argparse

    parser = argparse.ArgumentParser(
        description='Blackbox4 Questioning Workflow'
    )
    parser.add_argument(
        'command',
        choices=['start', 'continue', 'list', 'export'],
        help='Command to execute'
    )
    parser.add_argument(
        '--spec',
        help='Path to spec file'
    )
    parser.add_argument(
        '--session',
        help='Session ID (for continue command)'
    )
    parser.add_argument(
        '--type',
        default='general',
        choices=['webapp', 'mobile', 'api', 'general'],
        help='Spec type'
    )
    parser.add_argument(
        '--output',
        help='Output file for export'
    )

    args = parser.parse_args()

    workflow = QuestioningWorkflow()

    if args.command == 'start':
        if not args.spec:
            print("Error: --spec is required for start command")
            return 1

        session = workflow.start_session(args.spec, args.type)
        print(f"Started session: {session.session_id}")
        print(f"Questions generated: {len(session.questions)}")

    elif args.command == 'continue':
        if not args.session or not args.spec:
            print("Error: --session and --spec required for continue command")
            return 1

        if workflow.load_session(args.session, args.spec):
            print(f"Resumed session: {args.session}")
        else:
            print(f"Error: Could not load session {args.session}")
            return 1

    elif args.command == 'list':
        sessions = workflow.list_sessions()
        print(f"Found {len(sessions)} sessions:\n")
        for session in sessions:
            print(f"  {session['session_id']}: {session['status']}")
            print(f"    Spec: {session['spec_path']}")
            print(f"    Progress: {session['progress'].get('percentage', 0)}%")
            print()

    elif args.command == 'export':
        if not workflow.active_session and not (args.session and args.spec):
            print("Error: No active session or --session/--spec not provided")
            return 1

        if args.session and args.spec:
            workflow.load_session(args.session, args.spec)

        if not workflow.active_session:
            print("Error: No session to export")
            return 1

        output = args.output or f"transcript-{workflow.active_session.session_id}.md"
        if workflow.export_transcript(output):
            print(f"Transcript exported to: {output}")
        else:
            print("Error: Failed to export transcript")
            return 1

    return 0


if __name__ == '__main__':
    sys.exit(main())
