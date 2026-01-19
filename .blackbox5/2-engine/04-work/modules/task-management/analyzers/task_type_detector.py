"""
Task Type Detector - Detect what kind of work a task is

Analyzes task content to determine if it's UI, Refactor, Research,
Planning, Brainstorming, Implementation, Testing, Documentation,
Infrastructure, or Data work.
"""

from typing import Dict
from .utils import TaskType, TaskTypeResult


class TaskTypeDetector:
    """Detect task type from content with confidence scoring"""

    def detect(self, task) -> TaskTypeResult:
        """
        Detect task type with confidence.

        Returns:
            TaskTypeResult with detected type and confidence
        """
        type_scores = {}

        # Score each type
        type_scores[TaskType.UI] = self._score_ui_type(task)
        type_scores[TaskType.REFACTOR] = self._score_refactor_type(task)
        type_scores[TaskType.RESEARCH] = self._score_research_type(task)
        type_scores[TaskType.PLANNING] = self._score_planning_type(task)
        type_scores[TaskType.BRAINSTORMING] = self._score_brainstorming_type(task)
        type_scores[TaskType.IMPLEMENTATION] = self._score_implementation_type(task)
        type_scores[TaskType.TESTING] = self._score_testing_type(task)
        type_scores[TaskType.DOCUMENTATION] = self._score_documentation_type(task)
        type_scores[TaskType.INFRASTRUCTURE] = self._score_infrastructure_type(task)
        type_scores[TaskType.DATA] = self._score_data_type(task)

        # Get highest score
        detected_type = max(type_scores, key=type_scores.get)
        confidence = type_scores[detected_type]

        return TaskTypeResult(
            type=detected_type,
            confidence=min(confidence, 1.0),
            all_scores=type_scores
        )

    def _score_ui_type(self, task) -> float:
        """Score UI type indicators (0-1 scale)"""
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        ui_keywords = [
            ("ui", 0.15),
            ("user interface", 0.2),
            ("frontend", 0.2),
            ("component", 0.1),
            ("design", 0.1),
            ("visual", 0.15),
            ("responsive", 0.15),
            ("mobile", 0.1),
            ("web", 0.1),
            ("button", 0.1),
            ("form", 0.1),
            ("layout", 0.1),
            ("style", 0.1),
            ("css", 0.15),
            ("react", 0.15),
            ("vue", 0.15),
            ("angular", 0.15),
        ]

        for keyword, weight in ui_keywords:
            if keyword in text:
                score += weight

        # Check domain
        if task.domain == "frontend" or task.domain == "design":
            score += 0.3

        # Check category
        if task.category == "feature":
            score += 0.1

        return min(score, 1.0)

    def _score_refactor_type(self, task) -> float:
        """Score refactor type indicators"""
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        refactor_keywords = [
            ("refactor", 0.2),
            ("restructure", 0.2),
            ("reorganize", 0.2),
            ("cleanup", 0.15),
            ("technical debt", 0.2),
            ("improve code", 0.15),
            ("code quality", 0.15),
            ("simplify", 0.15),
            ("optimize", 0.1),
            ("rework", 0.15),
            ("rewrite", 0.15),
        ]

        for keyword, weight in refactor_keywords:
            if keyword in text:
                score += weight

        # Check category
        if task.category == "refactor" or task.category == "cleanup":
            score += 0.4

        return min(score, 1.0)

    def _score_research_type(self, task) -> float:
        """Score research type indicators"""
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        research_keywords = [
            ("research", 0.15),
            ("investigate", 0.15),
            ("analyze", 0.1),
            ("study", 0.1),
            ("explore", 0.15),
            ("evaluate", 0.1),
            ("compare", 0.1),
            ("find", 0.1),
            ("discovery", 0.15),
            ("investigation", 0.15),
            ("analysis", 0.1),
        ]

        for keyword, weight in research_keywords:
            if keyword in text:
                score += weight

        # Check category
        if task.category == "research":
            score += 0.4

        return min(score, 1.0)

    def _score_planning_type(self, task) -> float:
        """Score planning type indicators"""
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        planning_keywords = [
            ("plan", 0.12),
            ("design", 0.1),
            ("architecture", 0.15),
            ("spec", 0.1),
            ("roadmap", 0.12),
            ("strategy", 0.12),
            ("approach", 0.1),
            ("technical design", 0.15),
            ("system design", 0.15),
        ]

        for keyword, weight in planning_keywords:
            if keyword in text:
                score += weight

        # Check subcategory
        if task.subcategory == "architecture":
            score += 0.3

        return min(score, 1.0)

    def _score_brainstorming_type(self, task) -> float:
        """Score brainstorming type indicators"""
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        brainstorm_keywords = [
            ("brainstorm", 0.18),
            ("ideate", 0.15),
            ("ideas", 0.1),
            ("creative", 0.12),
            ("explore options", 0.15),
            ("alternatives", 0.12),
            ("possibilities", 0.12),
            ("concept", 0.1),
            ("innovate", 0.12),
            ("think", 0.1),
            ("envision", 0.1),
        ]

        for keyword, weight in brainstorm_keywords:
            if keyword in text:
                score += weight

        return min(score, 1.0)

    def _score_implementation_type(self, task) -> float:
        """Score implementation type indicators"""
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        impl_keywords = [
            ("implement", 0.1),
            ("build", 0.1),
            ("create", 0.1),
            ("develop", 0.1),
            ("add feature", 0.12),
            ("functionality", 0.1),
            ("endpoint", 0.1),
            ("api", 0.1),
            ("service", 0.1),
            ("module", 0.1),
            ("class", 0.1),
            ("function", 0.1),
        ]

        for keyword, weight in impl_keywords:
            if keyword in text:
                score += weight

        # Check category
        if task.category == "feature" or task.category == "enhancement":
            score += 0.2

        return min(score, 1.0)

    def _score_testing_type(self, task) -> float:
        """Score testing type indicators"""
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        testing_keywords = [
            ("test", 0.15),
            ("testing", 0.15),
            ("qa", 0.12),
            ("validate", 0.12),
            ("verify", 0.1),
            ("unit test", 0.15),
            ("integration test", 0.15),
            ("e2e", 0.1),
            ("test coverage", 0.12),
            ("test case", 0.12),
        ]

        for keyword, weight in testing_keywords:
            if keyword in text:
                score += weight

        # Check category
        if task.category == "testing":
            score += 0.4

        return min(score, 1.0)

    def _score_documentation_type(self, task) -> float:
        """Score documentation type indicators"""
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        doc_keywords = [
            ("document", 0.15),
            ("documentation", 0.15),
            ("guide", 0.12),
            ("readme", 0.12),
            ("wiki", 0.1),
            ("comment", 0.1),
            ("explain", 0.1),
            ("write", 0.1),
            ("manual", 0.1),
        ]

        for keyword, weight in doc_keywords:
            if keyword in text:
                score += weight

        # Check category
        if task.category == "documentation":
            score += 0.4

        return min(score, 1.0)

    def _score_infrastructure_type(self, task) -> float:
        """Score infrastructure type indicators"""
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        infra_keywords = [
            ("deploy", 0.12),
            ("deployment", 0.12),
            ("ci/cd", 0.12),
            ("pipeline", 0.1),
            ("infrastructure", 0.15),
            ("devops", 0.15),
            ("docker", 0.12),
            ("kubernetes", 0.12),
            ("aws", 0.1),
            ("gcp", 0.1),
            ("azure", 0.1),
            ("server", 0.1),
            ("hosting", 0.1),
        ]

        for keyword, weight in infra_keywords:
            if keyword in text:
                score += weight

        # Check category
        if task.category == "infrastructure" or task.category == "devops":
            score += 0.4

        return min(score, 1.0)

    def _score_data_type(self, task) -> float:
        """Score data type indicators"""
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        data_keywords = [
            ("migration", 0.12),
            ("etl", 0.12),
            ("data", 0.1),
            ("database", 0.12),
            ("schema", 0.1),
            ("sql", 0.1),
            ("query", 0.1),
            ("analytics", 0.12),
            ("report", 0.1),
            ("dashboard", 0.1),
            ("metrics", 0.1),
        ]

        for keyword, weight in data_keywords:
            if keyword in text:
                score += weight

        # Check subcategory
        if task.subcategory == "database" or task.subcategory == "analytics":
            score += 0.3

        return min(score, 1.0)
