"""
Logarithmic Complexity Analyzer - Analyzes task complexity with log₁₀ scoring

Scores 6 dimensions:
- Scope (25%): Files, components, modules affected
- Technical (30%): Technical depth, expertise required
- Dependencies (15%): External/internal dependencies
- Risk (15%): Potential for breaking changes
- Uncertainty (10%): Unknowns, research needed
- Cross-Domain (5%): Multiple domains/teams
"""

import math
import re
from typing import Dict
from .utils import log_score, TaskType


class LogComplexityAnalyzer:
    """Analyze task complexity using logarithmic scoring"""

    def __init__(self):
        """Initialize analyzer"""
        pass

    def analyze(self, task) -> Dict:
        """
        Analyze task complexity across all dimensions.

        Returns:
            Dict with:
                - magnitude: Total complexity magnitude (multiplicative)
                - score: Overall complexity score (0-100)
                - scope_multiplier: Scope complexity (1-10,000x)
                - technical_multiplier: Technical depth (1-100x)
                - dependency_multiplier: Dependencies (1-100x)
                - risk_multiplier: Risk level (1-100x)
                - uncertainty_multiplier: Uncertainty (1-100x)
                - cross_domain_multiplier: Cross-domain (1-10x)
        """
        # Calculate each dimension
        scope_mult = self._calculate_scope_multiplier(task)
        tech_mult = self._calculate_technical_multiplier(task)
        dep_mult = self._calculate_dependency_multiplier(task)
        risk_mult = self._calculate_risk_multiplier(task)
        uncertain_mult = self._calculate_uncertainty_multiplier(task)
        cross_domain_mult = self._calculate_cross_domain_multiplier(task)

        # Total magnitude (multiplicative)
        magnitude = (
            scope_mult *
            tech_mult *
            dep_mult *
            risk_mult *
            uncertain_mult *
            cross_domain_mult
        )

        # Convert to score (0-100)
        # Max reasonable magnitude: 10,000 * 100 * 100 * 100 * 100 * 10 = 10^15
        score = log_score(magnitude, min_val=1, max_val=10**15)

        return {
            "magnitude": magnitude,
            "score": score,
            "scope_multiplier": scope_mult,
            "technical_multiplier": tech_mult,
            "dependency_multiplier": dep_mult,
            "risk_multiplier": risk_mult,
            "uncertainty_multiplier": uncertain_mult,
            "cross_domain_multiplier": cross_domain_mult,
        }

    def _calculate_scope_multiplier(self, task) -> float:
        """
        Calculate scope complexity (1-10,000x)

        Factors:
        - Number of files mentioned
        - Number of components/modules
        - Lines of code estimate
        - Breadth of changes
        """
        multiplier = 1.0
        text = f"{task.title} {task.description} {task.content}".lower()

        # Count file mentions
        file_count = len(re.findall(r'\.(py|js|ts|jsx|tsx|css|html|md|yaml|yml|json)', text))
        if file_count > 0:
            # Each file adds scope: 1-100x range
            # log10(1) = 0, log10(100) = 2, so 10^file_count gives exponential growth
            multiplier *= min(10 ** (file_count * 0.3), 100)

        # Count component/module mentions
        components = len(re.findall(r'(component|module|class|function|service|endpoint)', text))
        if components > 0:
            multiplier *= min(10 ** (components * 0.2), 50)

        # Lines of code indicators
        loc_keywords = {
            "large": 100,
            "huge": 500,
            "massive": 1000,
            "extensive": 200,
            "comprehensive": 150,
            "simple": 10,
            "small": 20,
            "minor": 5,
            "single file": 2,
            "multiple files": 50,
        }

        for keyword, loc_multiplier in loc_keywords.items():
            if keyword in text:
                multiplier *= loc_multiplier
                break

        # Check tier/category
        if hasattr(task, 'tier'):
            tier_multipliers = {
                1: 2,      # Quick fix
                2: 10,     # Simple
                3: 100,    # Standard
                4: 500,    # Complex
            }
            multiplier *= tier_multipliers.get(task.tier, 100)

        return min(multiplier, 10000)

    def _calculate_technical_multiplier(self, task) -> float:
        """
        Calculate technical depth multiplier (1-100x)

        Factors:
        - Technical complexity keywords
        - Tech stack mentioned
        - Domain knowledge required
        - Algorithms/data structures
        """
        multiplier = 1.0
        text = f"{task.title} {task.description} {task.content}".lower()

        # Technical complexity indicators
        tech_keywords = {
            # High complexity (50-100x)
            "machine learning": 80,
            "ai": 60,
            "neural network": 90,
            "distributed system": 70,
            "microservices": 60,
            "cryptography": 80,
            "blockchain": 70,
            "optimization": 50,
            "algorithm": 40,

            # Medium complexity (10-40x)
            "async": 20,
            "concurrent": 25,
            "parallel": 20,
            "database": 15,
            "api": 12,
            "authentication": 20,
            "authorization": 20,
            "security": 30,
            "performance": 25,

            # Lower complexity (2-8x)
            "ui": 5,
            "frontend": 5,
            "css": 3,
            "html": 2,
            "form": 4,
            "validation": 8,
        }

        for keyword, tech_mult in tech_keywords.items():
            if keyword in text:
                multiplier *= tech_mult

        # Cap at 100x
        return min(multiplier, 100)

    def _calculate_dependency_multiplier(self, task) -> float:
        """
        Calculate dependency multiplier (1-100x)

        Factors:
        - External dependencies mentioned
        - Internal dependencies
        - Third-party services
        - Database changes
        """
        multiplier = 1.0
        text = f"{task.title} {task.description} {task.content}".lower()

        # Dependency keywords
        dependency_keywords = {
            # External dependencies
            "third-party": 20,
            "external": 15,
            "api": 10,
            "service": 10,
            "library": 8,
            "package": 5,

            # Internal dependencies
            "depends on": 15,
            "requires": 10,
            "integration": 20,
            "interface": 10,

            # Database changes
            "migration": 25,
            "schema": 20,
            "database": 15,
            "sql": 12,

            # Infrastructure
            "deploy": 10,
            "infrastructure": 15,
            "devops": 12,
        }

        for keyword, dep_mult in dependency_keywords.items():
            if keyword in text:
                multiplier *= dep_mult

        # Check for blocking/blocked relationships
        if hasattr(task, 'blocks') and task.blocks:
            multiplier *= len(task.blocks) * 5

        if hasattr(task, 'blocked_by') and task.blocked_by:
            multiplier *= len(task.blocked_by) * 5

        return min(multiplier, 100)

    def _calculate_risk_multiplier(self, task) -> float:
        """
        Calculate risk multiplier (1-100x)

        Factors:
        - Breaking changes potential
        - Production impact
        - Data loss potential
        - Security implications
        """
        multiplier = 1.0
        text = f"{task.title} {task.description} {task.content}".lower()

        # Risk indicators
        risk_keywords = {
            # Critical risk (50-100x)
            "breaking change": 100,
            "breaking": 80,
            "data loss": 100,
            "security": 80,
            "production": 60,
            "critical": 70,
            "urgent": 50,

            # High risk (20-40x)
            "deprecated": 30,
            "remove": 25,
            "delete": 30,
            "replace": 20,
            "rewrite": 25,
            "refactor": 15,

            # Medium risk (5-15x)
            "modify": 10,
            "change": 8,
            "update": 5,
            "improve": 5,
        }

        for keyword, risk_mult in risk_keywords.items():
            if keyword in text:
                multiplier *= risk_mult

        # Check category
        if hasattr(task, 'category'):
            if task.category == "hotfix":
                multiplier *= 50
            elif task.category == "refactor":
                multiplier *= 15

        return min(multiplier, 100)

    def _calculate_uncertainty_multiplier(self, task) -> float:
        """
        Calculate uncertainty multiplier (1-100x)

        Factors:
        - Research needed
        - Unknown requirements
        - Proof of concept
        - Exploration
        """
        multiplier = 1.0
        text = f"{task.title} {task.description} {task.content}".lower()

        # Uncertainty indicators
        uncertainty_keywords = {
            # High uncertainty (50-100x)
            "research": 60,
            "investigate": 50,
            "explore": 40,
            "prototype": 50,
            "proof of concept": 70,
            "poc": 60,
            "unknown": 80,
            "uncertain": 70,
            "figure out": 50,

            # Medium uncertainty (20-40x)
            "evaluate": 30,
            "analyze": 25,
            "study": 30,
            "experiment": 40,
            "test": 20,

            # Lower uncertainty (5-15x)
            "implement": 10,
            "build": 8,
            "create": 8,
            "add": 5,
        }

        for keyword, uncertain_mult in uncertainty_keywords.items():
            if keyword in text:
                multiplier *= uncertain_mult

        # Check task type
        # Task type detector would set this
        if hasattr(task, 'detected_type'):
            if task.detected_type == TaskType.RESEARCH:
                multiplier *= 50
            elif task.detected_type == TaskType.BRAINSTORMING:
                multiplier *= 30
            elif task.detected_type == TaskType.PLANNING:
                multiplier *= 20

        return min(multiplier, 100)

    def _calculate_cross_domain_multiplier(self, task) -> float:
        """
        Calculate cross-domain multiplier (1-10x)

        Factors:
        - Multiple tech stacks
        - Frontend + backend
        - Multiple teams
        - Infrastructure + code
        """
        multiplier = 1.0
        text = f"{task.title} {task.description} {task.content}".lower()

        # Domain indicators
        domains = set()

        # Check for different domains
        if "frontend" in text or "ui" in text or "react" in text or "vue" in text:
            domains.add("frontend")
        if "backend" in text or "api" in text or "server" in text:
            domains.add("backend")
        if "database" in text or "sql" in text or "migration" in text:
            domains.add("database")
        if "deploy" in text or "devops" in text or "infrastructure" in text:
            domains.add("infrastructure")
        if "design" in text or "css" in text or "style" in text:
            domains.add("design")
        if "test" in text or "testing" in text or "qa" in text:
            domains.add("testing")

        # Each additional domain beyond the first adds multiplier
        domain_count = len(domains)
        if domain_count > 1:
            multiplier = domain_count * 2

        # Check tech_stack attribute
        if hasattr(task, 'tech_stack') and task.tech_stack:
            tech_count = len(task.tech_stack)
            if tech_count > 2:
                multiplier *= min(tech_count / 2, 5)

        return min(multiplier, 10)
