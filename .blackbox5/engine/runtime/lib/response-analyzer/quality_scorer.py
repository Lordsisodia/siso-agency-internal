#!/usr/bin/env python3
"""
Quality Scorer - Score response quality across multiple dimensions

This module provides comprehensive quality scoring for agent responses,
evaluating completeness, accuracy, relevance, and clarity.
"""

from typing import Any, Dict, List, Optional
from dataclasses import dataclass
import re


@dataclass
class QualityScores:
    """Quality scores across dimensions"""
    completeness: float
    accuracy: float
    relevance: float
    clarity: float
    overall: float


class QualityScorer:
    """
    Score response quality across multiple dimensions.

    Evaluates responses for completeness, accuracy, relevance, and clarity
    to provide a comprehensive quality assessment.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize quality scorer.

        Args:
            config: Optional configuration dictionary
        """
        self.config = config or {}
        self.weights = self.config.get('weights', {
            'completeness': 0.3,
            'accuracy': 0.3,
            'relevance': 0.2,
            'clarity': 0.2,
        })

    def score_completeness(self,
                          response: str,
                          expected_elements: Optional[List[str]] = None) -> float:
        """
        Score response completeness.

        Args:
            response: The response to score
            expected_elements: Optional list of expected elements

        Returns:
            Completeness score from 0.0 to 1.0
        """
        score = 0.5  # Base score

        # Check length
        length = len(response)
        if length < 100:
            score -= 0.3
        elif length > 500:
            score += 0.2
        elif length > 1000:
            score += 0.3

        # Check for expected elements
        if expected_elements:
            found_elements = sum(1 for elem in expected_elements
                               if elem.lower() in response.lower())
            expected_coverage = found_elements / len(expected_elements)
            score += expected_coverage * 0.3

        # Check for structural completeness
        has_intro = bool(re.search(r'^(?:The|This|Here|I)', response, re.IGNORECASE))
        has_body = response.count('\n\n') >= 1
        has_conclusion = bool(re.search(r'(?:In summary|To conclude|Finally|Done)', response, re.IGNORECASE))

        structure_score = sum([has_intro, has_body, has_conclusion]) / 3
        score += structure_score * 0.2

        return max(0.0, min(1.0, score))

    def score_accuracy(self,
                      response: str,
                      reference_info: Optional[Dict[str, Any]] = None) -> float:
        """
        Score response accuracy.

        Args:
            response: The response to score
            reference_info: Optional reference information for validation

        Returns:
            Accuracy score from 0.0 to 1.0
        """
        score = 0.7  # Base score (assume mostly accurate)

        # Check for error indicators
        error_indicators = [
            r'error[:\s]+(?!not found)',
            r'exception[:\s]+',
            r'failed[:\s]+to',
            r'crash',
            r'bug',
            r'issue',
        ]

        found_errors = sum(1 for pattern in error_indicators
                          if re.search(pattern, response, re.IGNORECASE))
        score -= min(found_errors * 0.15, 0.5)

        # Check for uncertainty markers that might indicate inaccuracy
        uncertainty_markers = [
            r'(?:I think|maybe|possibly|might be)',
            r'(?:not sure|uncertain|guess)',
        ]

        found_uncertainty = sum(1 for pattern in uncertainty_markers
                               if re.search(pattern, response, re.IGNORECASE))
        score -= min(found_uncertainty * 0.05, 0.15)

        # Check for code blocks (usually indicates more concrete, accurate response)
        if '```' in response:
            score += 0.1

        # Check against reference info if provided
        if reference_info:
            if 'expected_commands' in reference_info:
                expected = reference_info['expected_commands']
                found = sum(1 for cmd in expected if cmd in response)
                coverage = found / len(expected) if expected else 0
                score += coverage * 0.1

            if 'expected_files' in reference_info:
                expected = reference_info['expected_files']
                found = sum(1 for file in expected if file in response)
                coverage = found / len(expected) if expected else 0
                score += coverage * 0.1

        return max(0.0, min(1.0, score))

    def score_relevance(self,
                       response: str,
                       query: Optional[str] = None,
                       context: Optional[Dict[str, Any]] = None) -> float:
        """
        Score response relevance.

        Args:
            response: The response to score
            query: Optional original query/request
            context: Optional context information

        Returns:
            Relevance score from 0.0 to 1.0
        """
        score = 0.6  # Base score

        # Extract key terms from response
        words = re.findall(r'\b\w+\b', response.lower())
        unique_words = set(words)

        # Check vocabulary richness (more unique words = potentially more relevant)
        vocabulary_richness = len(unique_words) / max(len(words), 1)
        score += min(vocabulary_richness * 0.2, 0.2)

        # Check for domain-relevant patterns
        technical_indicators = [
            r'\b\w+\.\w+\b',  # Dotted notation (e.g., package.module)
            r'\b(?:def|function|class|import|from)\b',  # Code keywords
            r'\b(?:npm|pip|docker|git)\b',  # Tool names
            r'https?://\S+',  # URLs
        ]

        found_technical = sum(1 for pattern in technical_indicators
                             if re.search(pattern, response))
        score += min(found_technical * 0.05, 0.15)

        # Check relevance to query if provided
        if query:
            query_words = set(re.findall(r'\b\w+\b', query.lower()))
            overlap = len(query_words & unique_words)
            overlap_ratio = overlap / max(len(query_words), 1)
            score += overlap_ratio * 0.3

        # Check for action-oriented content
        action_indicators = [
            r'(?:will|shall|going to)\s+\w+',
            r'(?:create|implement|deploy|test|fix)\s+\w+',
        ]

        found_actions = sum(1 for pattern in action_indicators
                           if re.search(pattern, response, re.IGNORECASE))
        score += min(found_actions * 0.05, 0.1)

        return max(0.0, min(1.0, score))

    def score_clarity(self, response: str) -> float:
        """
        Score response clarity.

        Args:
            response: The response to score

        Returns:
            Clarity score from 0.0 to 1.0
        """
        score = 0.6  # Base score

        # Check sentence structure
        sentences = re.split(r'[.!?]+', response)
        avg_sentence_length = sum(len(s.split()) for s in sentences) / max(len(sentences), 1)

        # Optimal sentence length is 15-25 words
        if 15 <= avg_sentence_length <= 25:
            score += 0.15
        elif avg_sentence_length < 10:
            score -= 0.1  # Too choppy
        elif avg_sentence_length > 35:
            score -= 0.15  # Too long

        # Check for clear structure
        has_structure = any([
            '```' in response,  # Code blocks
            response.count('\n\n') >= 2,  # Paragraph breaks
            bool(re.search(r'^#+\s', response, re.MULTILINE)),  # Headers
        ])

        if has_structure:
            score += 0.15

        # Check for clarity indicators
        clarity_indicators = [
            r'(?:specifically|exactly|precisely)',
            r'(?:for example|such as|including)',
            r'(?:first|second|finally|next)',
        ]

        found_clarity = sum(1 for pattern in clarity_indicators
                           if re.search(pattern, response, re.IGNORECASE))
        score += min(found_clarity * 0.05, 0.15)

        # Penalize ambiguity
        ambiguity_indicators = [
            r'(?:maybe|possibly|might|could be)',
            r'(?:sort of|kind of|rather)',
            r'(?:I guess|I think|probably)',
        ]

        found_ambiguity = sum(1 for pattern in ambiguity_indicators
                             if re.search(pattern, response, re.IGNORECASE))
        score -= min(found_ambiguity * 0.08, 0.2)

        # Check for explanation markers
        if re.search(r'(?:because|therefore|thus|so|means)', response, re.IGNORECASE):
            score += 0.1

        return max(0.0, min(1.0, score))

    def calculate_overall_score(self,
                               completeness: float,
                               accuracy: float,
                               relevance: float,
                               clarity: float) -> float:
        """
        Calculate overall quality score.

        Args:
            completeness: Completeness score
            accuracy: Accuracy score
            relevance: Relevance score
            clarity: Clarity score

        Returns:
            Overall quality score from 0.0 to 1.0
        """
        weights = self.weights

        overall = (
            completeness * weights['completeness'] +
            accuracy * weights['accuracy'] +
            relevance * weights['relevance'] +
            clarity * weights['clarity']
        )

        return round(overall, 3)

    def score_response(self,
                      response: str,
                      query: Optional[str] = None,
                      expected_elements: Optional[List[str]] = None,
                      reference_info: Optional[Dict[str, Any]] = None) -> QualityScores:
        """
        Score response across all dimensions.

        Args:
            response: The response to score
            query: Optional original query
            expected_elements: Optional expected elements
            reference_info: Optional reference information

        Returns:
            QualityScores object with all dimension scores
        """
        completeness = self.score_completeness(response, expected_elements)
        accuracy = self.score_accuracy(response, reference_info)
        relevance = self.score_relevance(response, query, reference_info)
        clarity = self.score_clarity(response)
        overall = self.calculate_overall_score(completeness, accuracy, relevance, clarity)

        return QualityScores(
            completeness=completeness,
            accuracy=accuracy,
            relevance=relevance,
            clarity=clarity,
            overall=overall,
        )

    def get_quality_breakdown(self, scores: QualityScores) -> str:
        """
        Get human-readable quality breakdown.

        Args:
            scores: QualityScores object

        Returns:
            Formatted breakdown string
        """
        lines = [
            "Quality Score Breakdown:",
            f"  Completeness: {scores.completeness:.1%}",
            f"  Accuracy:     {scores.accuracy:.1%}",
            f"  Relevance:    {scores.relevance:.1%}",
            f"  Clarity:      {scores.clarity:.1%}",
            f"",
            f"  Overall:      {scores.overall:.1%}",
        ]

        # Add interpretation
        lines.append("\nInterpretation:")

        if scores.overall >= 0.8:
            lines.append("  Excellent quality - Response meets all criteria")
        elif scores.overall >= 0.6:
            lines.append("  Good quality - Response meets most criteria")
        elif scores.overall >= 0.4:
            lines.append("  Fair quality - Response needs improvement")
        else:
            lines.append("  Poor quality - Response requires significant improvement")

        # Add dimension-specific feedback
        lines.append("\nDimension Analysis:")

        if scores.completeness < 0.5:
            lines.append("  - Completeness is low - response may be missing key elements")
        if scores.accuracy < 0.5:
            lines.append("  - Accuracy is low - response may contain errors")
        if scores.relevance < 0.5:
            lines.append("  - Relevance is low - response may not address the query")
        if scores.clarity < 0.5:
            lines.append("  - Clarity is low - response may be hard to understand")

        return "\n".join(lines)
