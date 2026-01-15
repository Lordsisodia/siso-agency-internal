"""
Sequential Questioning System for Blackbox4
Based on Spec Kit clarify workflow
"""

from typing import List, Dict, Optional, Tuple
from enum import Enum


class QuestionArea(Enum):
    """Areas to cover in sequential questioning."""
    COMPLETENESS = "completeness"
    CLARITY = "clarity"
    CONSISTENCY = "consistency"
    FEASIBILITY = "feasibility"
    TESTABILITY = "testability"


class QuestioningEngine:
    """Guide structured questioning to identify gaps and ambiguities."""

    def __init__(self):
        self.questions_asked = []
        self.answers = {}
        self.gaps_identified = []

    def generate_questions(self, spec_section: str, context: Dict = None) -> List[Dict]:
        """
        Generate relevant questions for a spec section.

        Args:
            spec_section: Section being questioned (overview, user_stories, etc.)
            context: Additional context about the project

        Returns:
            List of question dicts with question_text, area, priority
        """
        questions = []

        if spec_section == "overview":
            questions = [
                {
                    'question': 'What is the primary problem this project solves?',
                    'area': QuestionArea.COMPLETENESS.value,
                    'priority': 'high',
                    'category': 'problem_definition'
                },
                {
                    'question': 'Who are the target users or customers?',
                    'area': QuestionArea.COMPLETENESS.value,
                    'priority': 'high',
                    'category': 'audience'
                },
                {
                    'question': 'What are the success metrics for this project?',
                    'area': QuestionArea.TESTABILITY.value,
                    'priority': 'high',
                    'category': 'metrics'
                },
                {
                    'question': 'What are the constraints or limitations?',
                    'area': QuestionArea.FEASIBILITY.value,
                    'priority': 'medium',
                    'category': 'constraints'
                }
            ]

        elif spec_section == "user_stories":
            questions = [
                {
                    'question': 'Do we have sufficient user stories to cover all major use cases?',
                    'area': QuestionArea.COMPLETENESS.value,
                    'priority': 'high',
                    'category': 'coverage'
                },
                {
                    'question': 'Are the user stories sufficiently detailed for implementation?',
                    'area': QuestionArea.CLARITY.value,
                    'priority': 'high',
                    'category': 'detail'
                },
                {
                    'question': 'Do all user stories have clear acceptance criteria?',
                    'area': QuestionArea.TESTABILITY.value,
                    'priority': 'high',
                    'category': 'acceptance'
                }
            ]

        elif spec_section == "functional_requirements":
            questions = [
                {
                    'question': 'Are all requirements clearly defined and unambiguous?',
                    'area': QuestionArea.CLARITY.value,
                    'priority': 'high',
                    'category': 'clarity'
                },
                {
                    'question': 'Do we have acceptance criteria for each requirement?',
                    'area': QuestionArea.TESTABILITY.value,
                    'priority': 'high',
                    'category': 'testing'
                },
                {
                    'question': 'Are dependencies between requirements clearly documented?',
                    'area': QuestionArea.CONSISTENCY.value,
                    'priority': 'medium',
                    'category': 'dependencies'
                },
                {
                    'question': 'Is each requirement feasible given our constraints?',
                    'area': QuestionArea.FEASIBILITY.value,
                    'priority': 'medium',
                    'category': 'feasibility'
                }
            ]

        return questions

    def analyze_gaps(self, spec: 'StructuredSpec') -> List[Dict]:
        """
        Analyze spec for gaps and missing information.

        Returns:
            List of gap dicts with area, description, severity
        """
        gaps = []

        # Check completeness
        if not spec.overview or len(spec.overview) < 50:
            gaps.append({
                'area': 'overview',
                'description': 'Overview is too brief or missing',
                'severity': 'high',
                'recommendation': 'Add a detailed project overview (at least 2-3 paragraphs)'
            })

        if not spec.user_stories:
            gaps.append({
                'area': 'user_stories',
                'description': 'No user stories defined',
                'severity': 'high',
                'recommendation': 'Add user stories following the "As a... I want... So that..." format'
            })

        if not spec.functional_requirements:
            gaps.append({
                'area': 'functional_requirements',
                'description': 'No functional requirements defined',
                'severity': 'high',
                'recommendation': 'Break down user stories into functional requirements'
            })

        # Check clarity
        for story in spec.user_stories:
            if not story.acceptance_criteria:
                gaps.append({
                    'area': 'user_stories',
                    'description': f'User story "{story.id}" lacks acceptance criteria',
                    'severity': 'medium',
                    'recommendation': f'Add acceptance criteria for {story.id}'
                })

        # Check consistency
        if spec.constitution:
            # Check if tech stack choices are consistent with requirements
            if 'backend' in spec.constitution.tech_stack:
                backend = spec.constitution.tech_stack['backend']
                # Verify requirements align with backend choice
                pass  # Would implement detailed consistency checks

        return gaps

    def generate_questioning_report(self, spec: 'StructuredSpec') -> str:
        """Generate a comprehensive questioning report."""
        report = "# Spec Questioning Report\n\n"

        # Analyze gaps
        gaps = self.analyze_gaps(spec)

        report += f"## Gap Analysis\n"
        report += f"Found {len(gaps)} gaps requiring attention\n\n"

        for gap in gaps:
            severity_icon = "🔴" if gap['severity'] == 'high' else "🟡"
            report += f"{severity_icon} **{gap['area'].replace('_', ' ').title()}**\n"
            report += f"   {gap['description']}\n"
            report += f"   *Recommendation:* {gap['recommendation']}\n\n"

        # Generate questions for each section
        sections = ['overview', 'user_stories', 'functional_requirements']

        report += "## Suggested Questions\n\n"
        for section in sections:
            questions = self.generate_questions(section)
            if questions:
                report += f"### {section.replace('_', ' ').title()}\n\n"
                for i, q in enumerate(questions, 1):
                    report += f"{i}. **{q['question']}**\n"
                    report += f"   - Area: {q['area']}\n"
                    report += f"   - Priority: {q['priority']}\n\n"

        return report


class SequentialQuestioner:
    """
    Advanced sequential questioning system for structured spec refinement.

    This class provides a more sophisticated approach to questioning, with:
    - Adaptive questioning based on spec type
    - Question prioritization
    - Answer processing and integration
    - State tracking across questioning sessions
    """

    def __init__(self):
        self.question_history = []
        self.answered_questions = {}
        self.current_focus_areas = []
        self.spec_context = {}

    def identify_gaps(self, spec: 'StructuredSpec') -> List[Dict]:
        """
        Identify gaps in the spec requiring clarification.

        Returns:
            List of gap dicts with area, description, severity, questions
        """
        gaps = []
        engine = QuestioningEngine()

        # Get basic gaps
        basic_gaps = engine.analyze_gaps(spec)

        # Enhance with specific questions
        for gap in basic_gaps:
            area = gap['area']
            questions = engine.generate_questions(area, self.spec_context)

            gap['questions'] = [
                q['question'] for q in questions
                if q['category'] == area or q['area'] == area
            ]

            gaps.append(gap)

        # Check for additional gaps based on spec type
        project_type = spec.metadata.get('project_type', 'generic')

        if project_type == 'web_app':
            gaps.extend(self._check_web_app_gaps(spec))
        elif project_type == 'mobile_app':
            gaps.extend(self._check_mobile_app_gaps(spec))
        elif project_type == 'api':
            gaps.extend(self._check_api_gaps(spec))

        return gaps

    def _check_web_app_gaps(self, spec: 'StructuredSpec') -> List[Dict]:
        """Check web app specific gaps."""
        gaps = []

        if spec.constitution and spec.constitution.tech_stack:
            if 'frontend' not in spec.constitution.tech_stack:
                gaps.append({
                    'area': 'constitution',
                    'description': 'Frontend framework not specified',
                    'severity': 'medium',
                    'recommendation': 'Specify frontend framework (React, Vue, etc.)'
                })

            if 'backend' not in spec.constitution.tech_stack:
                gaps.append({
                    'area': 'constitution',
                    'description': 'Backend framework not specified',
                    'severity': 'medium',
                    'recommendation': 'Specify backend framework (Node, Python, etc.)'
                })

        return gaps

    def _check_mobile_app_gaps(self, spec: 'StructuredSpec') -> List[Dict]:
        """Check mobile app specific gaps."""
        gaps = []

        if spec.constitution and spec.constitution.tech_stack:
            if 'platform' not in spec.constitution.tech_stack:
                gaps.append({
                    'area': 'constitution',
                    'description': 'Target platforms not specified',
                    'severity': 'high',
                    'recommendation': 'Specify target platforms (iOS, Android, or both)'
                })

        return gaps

    def _check_api_gaps(self, spec: 'StructuredSpec') -> List[Dict]:
        """Check API specific gaps."""
        gaps = []

        # Check if authentication requirements are defined
        has_auth = any(
            'auth' in req.title.lower() or 'authentication' in req.title.lower()
            for req in spec.functional_requirements
        )

        if not has_auth:
            gaps.append({
                'area': 'functional_requirements',
                'description': 'Authentication requirements not defined',
                'severity': 'high',
                'recommendation': 'Define authentication mechanism (API keys, OAuth, etc.)'
            })

        return gaps

    def generate_questions(self, spec: 'StructuredSpec', focus_areas: List[str] = None) -> List[Dict]:
        """
        Generate clarifying questions for the spec.

        Args:
            spec: The spec to question
            focus_areas: Optional list of areas to focus on

        Returns:
            List of question dicts with priority, area, and metadata
        """
        gaps = self.identify_gaps(spec)

        # Filter by focus areas if specified
        if focus_areas:
            gaps = [g for g in gaps if g['area'] in focus_areas]

        # Prioritize questions by severity
        gaps.sort(key=lambda g: 0 if g['severity'] == 'high' else 1)

        questions = []
        for gap in gaps[:5]:  # Top 5 gaps
            questions.append({
                'question': gap['description'],
                'area': gap['area'],
                'priority': gap['severity'],
                'follow_up': gap.get('questions', []),
                'recommendation': gap['recommendation']
            })

        return questions

    def process_answers(self, spec: 'StructuredSpec', answers: List[Dict]) -> 'StructuredSpec':
        """
        Process answers and integrate them into the spec.

        Args:
            spec: The spec to update
            answers: List of answer dicts with question_id, answer, and impact

        Returns:
            Updated spec
        """
        for answer in answers:
            question_id = answer.get('question_id')
            answer_text = answer.get('answer')
            impact = answer.get('impact', 'clarification')

            # Track the answer
            self.answered_questions[question_id] = answer_text

            # Apply answer to spec based on impact
            if impact == 'clarification':
                spec.add_clarification(
                    answer.get('question', question_id),
                    answer_text
                )
            elif impact == 'user_story':
                # Parse answer into user story
                # This would need more sophisticated parsing
                pass
            elif impact == 'requirement':
                # Parse answer into requirement
                # This would need more sophisticated parsing
                pass

        return spec

    def get_questioning_strategy(self, spec: 'StructuredSpec') -> Dict:
        """
        Get the questioning strategy based on spec characteristics.

        Returns:
            Dict with strategy recommendations
        """
        project_type = spec.metadata.get('project_type', 'generic')
        completion_score = self._calculate_completion_score(spec)

        strategy = {
            'project_type': project_type,
            'completion_score': completion_score,
            'recommended_approach': self._get_approach(completion_score),
            'focus_areas': self._get_focus_areas(spec, completion_score),
            'questioning_style': self._get_questioning_style(completion_score)
        }

        return strategy

    def _calculate_completion_score(self, spec: 'StructuredSpec') -> float:
        """Calculate spec completion score (0.0 to 1.0)."""
        score = 0.0
        max_score = 5.0

        # Has overview
        if spec.overview and len(spec.overview) >= 50:
            score += 1.0

        # Has user stories
        if spec.user_stories:
            score += 1.0

        # Has functional requirements
        if spec.functional_requirements:
            score += 1.0

        # Has constitution
        if spec.constitution:
            score += 1.0

        # Has clarifications
        if spec.clarifications:
            score += 1.0

        return score / max_score

    def _get_approach(self, completion_score: float) -> str:
        """Get recommended questioning approach."""
        if completion_score < 0.3:
            return "comprehensive"
        elif completion_score < 0.7:
            return "focused"
        else:
            return "refinement"

    def _get_focus_areas(self, spec: 'StructuredSpec', completion_score: float) -> List[str]:
        """Get recommended focus areas."""
        if completion_score < 0.3:
            return ['overview', 'user_stories', 'constitution']
        elif completion_score < 0.7:
            return ['functional_requirements', 'acceptance_criteria']
        else:
            return ['consistency', 'traceability', 'edge_cases']

    def _get_questioning_style(self, completion_score: float) -> str:
        """Get questioning style."""
        if completion_score < 0.3:
            return "exploratory"
        elif completion_score < 0.7:
            return "clarifying"
        else:
            return "validating"
