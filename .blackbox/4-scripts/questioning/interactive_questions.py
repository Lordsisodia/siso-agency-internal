#!/usr/bin/env python3
"""
Interactive CLI for Questioning Workflow
Provides user-friendly interface for questioning sessions
"""

import sys
import os
from typing import Optional, Dict, Any
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

try:
    from questioning_workflow import QuestioningWorkflow, QuestioningSession, Question, SessionStatus
    from gap_analysis import GapAnalyzer
except ImportError as e:
    print(f"Error importing modules: {e}")
    sys.exit(1)


class InteractiveQuestions:
    """Interactive CLI for questioning sessions."""

    # Color codes for terminal output
    COLORS = {
        'reset': '\033[0m',
        'bold': '\033[1m',
        'red': '\033[91m',
        'green': '\033[92m',
        'yellow': '\033[93m',
        'blue': '\033[94m',
        'magenta': '\033[95m',
        'cyan': '\033[96m',
        'white': '\033[97m'
    }

    def __init__(self, workflow: QuestioningWorkflow):
        """
        Initialize interactive questions.

        Args:
            workflow: QuestioningWorkflow instance
        """
        self.workflow = workflow
        self.session: Optional[QuestioningSession] = None

    def colorize(self, text: str, color: str) -> str:
        """Add color to text."""
        if color in self.COLORS:
            return f"{self.COLORS[color]}{text}{self.COLORS['reset']}"
        return text

    def display_header(self) -> None:
        """Display session header."""
        if not self.session:
            return

        print()
        print("=" * 70)
        print(self.colorize("Blackbox4 Questioning Session", 'bold'))
        print("=" * 70)
        print(f"Session ID: {self.session.session_id}")
        print(f"Spec: {self.session.spec.project_name}")
        print(f"Status: {self.session.status.value}")
        print()

    def display_progress(self) -> None:
        """Display current progress."""
        if not self.session:
            return

        progress = self.session.get_progress()

        print("-" * 70)
        print(self.colorize("Progress", 'bold'))
        print(f"  Answered:   {self.colorize(str(progress['answered']), 'green')} / {progress['total']}")
        print(f"  Skipped:    {self.colorize(str(progress['skipped']), 'yellow')} / {progress['total']}")
        print(f"  Remaining:  {self.colorize(str(progress['remaining']), 'cyan')} / {progress['total']}")
        print(f"  Completion: {self.colorize(f'{progress['percentage']}%', 'blue')}")
        print("-" * 70)
        print()

    def display_question(self, question: Question) -> None:
        """
        Display a question with context.

        Args:
            question: Question to display
        """
        # Question number
        q_num = self.session.current_question_index + 1
        total = len(self.session.questions)

        # Question header
        print(self.colorize(f"Question {q_num} of {total}", 'bold'))
        print()

        # Priority indicator
        priority_color = {
            'high': 'red',
            'medium': 'yellow',
            'low': 'green'
        }.get(question.priority, 'white')

        priority_icon = {
            'high': '!!!',
            'medium': '!!',
            'low': '!'
        }.get(question.priority, '!')

        print(f"Priority: {self.colorize(f'{priority_icon} {question.priority.upper()}', priority_color)}")
        print(f"Area:     {question.area}")
        print(f"Category: {question.category}")
        print()

        # Question text
        print(self.colorize(question.text, 'bold'))
        print()

        # Context if available
        if question.context:
            print(self.colorize("Context:", 'cyan'))
            for key, value in question.context.items():
                print(f"  {key}: {value}")
            print()

    def display_help(self) -> None:
        """Display help information."""
        print()
        print(self.colorize("Available Commands:", 'bold'))
        print()
        print("  <your answer>    - Type your answer and press Enter")
        print("  s, skip          - Skip this question")
        print("  d, defer         - Defer this question for later")
        print("  p, progress      - Show current progress")
        print("  g, gaps          - Show identified gaps")
        print("  h, help          - Show this help message")
        print("  q, quit          - Save and exit")
        print()

    def display_gaps(self) -> None:
        """Display identified gaps."""
        gaps = self.workflow.get_gaps()

        if not gaps:
            print(self.colorize("No gaps identified.", 'green'))
            return

        print()
        print(self.colorize(f"Identified Gaps ({len(gaps)})", 'bold'))
        print()

        for i, gap in enumerate(gaps, 1):
            severity_color = {
                'critical': 'red',
                'high': 'red',
                'medium': 'yellow',
                'low': 'green'
            }.get(gap['severity'], 'white')

            print(f"{i}. {self.colorize(f'[{gap['severity'].upper()}]', severity_color)} {gap['area']}")
            print(f"   {gap['description']}")
            print(f"   {self.colorize('Recommendation:', 'cyan')} {gap['recommendation']}")
            print()

    def get_user_input(self) -> str:
        """
        Get and validate user input.

        Returns:
            User's input or command
        """
        try:
            user_input = input(self.colorize("Your answer (or command): ", 'cyan')).strip()
            return user_input
        except (EOFError, KeyboardInterrupt):
            return 'quit'

    def handle_command(self, command: str) -> bool:
        """
        Handle user commands.

        Args:
            command: Command to handle

        Returns:
            True to continue, False to exit
        """
        cmd = command.lower()

        if cmd in ['q', 'quit']:
            print()
            confirm = input(self.colorize("Save progress and exit? (y/n): ", 'yellow')).strip().lower()
            if confirm in ['y', 'yes']:
                return False
            return True

        elif cmd in ['s', 'skip']:
            self.workflow.skip_question("User skipped")
            print(self.colorize("Question skipped.", 'yellow'))
            return True

        elif cmd in ['d', 'defer']:
            self.workflow.skip_question("Deferred for later")
            print(self.colorize("Question deferred.", 'yellow'))
            return True

        elif cmd in ['p', 'progress']:
            self.display_progress()
            return True

        elif cmd in ['g', 'gaps']:
            self.display_gaps()
            return True

        elif cmd in ['h', 'help']:
            self.display_help()
            return True

        else:
            # Treat as answer
            if command:
                self.workflow.record_answer(command)
                print(self.colorize("Answer recorded.", 'green'))
                return True
            else:
                print(self.colorize("Please provide an answer or command.", 'yellow'))
                return True

    def run_session(self) -> None:
        """Run interactive questioning session."""
        if not self.workflow.active_session:
            print(self.colorize("No active session. Use start_session() first.", 'red'))
            return

        self.session = self.workflow.active_session
        self.session.status = SessionStatus.IN_PROGRESS
        self._save_session()

        self.display_header()
        self.display_help()

        while True:
            # Display progress every few questions
            if self.session.current_question_index > 0 and self.session.current_question_index % 3 == 0:
                self.display_progress()

            # Get next question
            question = self.workflow.next_question()

            if not question:
                print()
                print(self.colorize("All questions completed!", 'green'))
                self.session.status = SessionStatus.COMPLETED
                self._save_session()
                self.display_final_summary()
                break

            # Display question
            print()
            self.display_question(question)

            # Get user input
            user_input = self.get_user_input()

            # Handle command/answer
            if not self.handle_command(user_input):
                # User chose to quit
                break

        # Offer to update spec and export transcript
        self._offer_post_session_actions()

    def display_final_summary(self) -> None:
        """Display final session summary."""
        progress = self.session.get_progress()

        print()
        print("=" * 70)
        print(self.colorize("Session Complete!", 'bold'))
        print("=" * 70)
        print(f"Questions Answered: {progress['answered']}")
        print(f"Questions Skipped:  {progress['skipped']}")
        print(f"Completion:         {progress['percentage']}%")
        print()

    def _offer_post_session_actions(self) -> None:
        """Offer post-session actions."""
        print()
        print(self.colorize("Post-Session Actions:", 'bold'))
        print()

        # Update spec
        update = input(self.colorize("Update spec with answers? (y/n): ", 'yellow')).strip().lower()
        if update in ['y', 'yes']:
            if self.workflow.update_spec():
                print(self.colorize("Spec updated successfully!", 'green'))
            else:
                print(self.colorize("Failed to update spec.", 'red'))

        # Export transcript
        export = input(self.colorize("Export session transcript? (y/n): ", 'yellow')).strip().lower()
        if export in ['y', 'yes']:
            default_path = f"transcript-{self.session.session_id}.md"
            path = input(f"Output path [{default_path}]: ").strip() or default_path

            if self.workflow.export_transcript(path):
                print(self.colorize(f"Transcript exported to: {path}", 'green'))
            else:
                print(self.colorize("Failed to export transcript.", 'red'))

        print()

    def _save_session(self) -> None:
        """Save current session state."""
        if self.session:
            self.workflow._save_active_session()


def start_interactive_session(
    spec_path: str,
    spec_type: str = "general"
) -> None:
    """
    Start an interactive questioning session.

    Args:
        spec_path: Path to spec file
        spec_type: Type of spec (webapp, mobile, api, general)
    """
    workflow = QuestioningWorkflow()

    # Start session
    print("Starting questioning session...")
    session = workflow.start_session(spec_path, spec_type)

    if not session or len(session.questions) == 0:
        print("No questions generated. Spec may be complete.")
        return

    print(f"Session started: {session.session_id}")
    print(f"Generated {len(session.questions)} questions")

    # Run interactive session
    interactive = InteractiveQuestions(workflow)
    interactive.run_session()


def continue_interactive_session(
    session_id: str,
    spec_path: str
) -> None:
    """
    Continue an existing questioning session.

    Args:
        session_id: Session ID to continue
        spec_path: Path to spec file
    """
    workflow = QuestioningWorkflow()

    # Load session
    if not workflow.load_session(session_id, spec_path):
        print(f"Failed to load session: {session_id}")
        return

    print(f"Resumed session: {session_id}")

    # Run interactive session
    interactive = InteractiveQuestions(workflow)
    interactive.run_session()


def main():
    """CLI entry point for interactive questions."""
    import argparse

    parser = argparse.ArgumentParser(
        description='Interactive questioning for Blackbox4 specs'
    )
    parser.add_argument(
        'command',
        choices=['start', 'continue'],
        help='Command to execute'
    )
    parser.add_argument(
        '--spec',
        required=True,
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
        help='Spec type (for start command)'
    )

    args = parser.parse_args()

    if args.command == 'start':
        start_interactive_session(args.spec, args.type)
    elif args.command == 'continue':
        if not args.session:
            print("Error: --session is required for continue command")
            return 1
        continue_interactive_session(args.session, args.spec)


if __name__ == '__main__':
    sys.exit(main() or 0)
