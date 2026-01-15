#!/usr/bin/env python3
"""
Response Analyzer - Analyze agent responses for Ralph Runtime

This module provides the core response analysis functionality for the Ralph
autonomous agent system, enabling real-time quality assessment and pattern
detection.
"""

from typing import Any, Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime
import re
import json


@dataclass
class AnalysisResult:
    """Result of response analysis"""
    is_valid: bool
    quality_score: float
    confidence: float
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    extracted_info: Dict[str, Any] = field(default_factory=dict)
    patterns_found: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


class ResponseAnalyzer:
    """
    Core response analyzer for agent outputs.

    Analyzes responses for quality, errors, patterns, and extracts key
    information to inform autonomous decision-making.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize the response analyzer.

        Args:
            config: Optional configuration dictionary
        """
        self.config = config or {}
        self.min_quality_threshold = self.config.get('min_quality_threshold', 0.5)
        self.min_confidence_threshold = self.config.get('min_confidence_threshold', 0.6)
        self.analysis_history: List[Dict[str, Any]] = []

        # Pattern definitions
        self.error_patterns = [
            r'error[:\s]+(?!not)',
            r'exception[:\s]+',
            r'failed[:\s]+to',
            r'unable[:\s]+to',
            r'cannot[:\s]+',
            r'timeout',
            r'not[:\s]+found',
            r'unauthorized',
            r'forbidden',
            r'invalid[:\s]+(?:token|credential|auth)',
        ]

        self.success_patterns = [
            r'successfully',
            r'completed',
            r'finished',
            r'done',
            r'achieved',
            r'accomplished',
        ]

    def analyze(self,
                response: str,
                context: Optional[Dict[str, Any]] = None) -> AnalysisResult:
        """
        Main analysis entry point.

        Args:
            response: The agent response to analyze
            context: Optional execution context

        Returns:
            AnalysisResult object with analysis findings
        """
        result = AnalysisResult(
            is_valid=True,
            quality_score=0.0,
            confidence=0.0,
            metadata={
                'timestamp': datetime.now().isoformat(),
                'response_length': len(response),
                'context': context or {}
            }
        )

        # Check quality
        quality_score = self.check_quality(response)
        result.quality_score = quality_score

        # Detect errors
        errors = self.detect_errors(response)
        result.errors.extend(errors)

        # Extract information
        info = self.extract_info(response)
        result.extracted_info.update(info)

        # Detect patterns
        patterns = self._detect_patterns(response)
        result.patterns_found.extend(patterns)

        # Calculate overall confidence
        confidence = self._calculate_confidence(result)
        result.confidence = confidence

        # Determine validity
        result.is_valid = (
            quality_score >= self.min_quality_threshold and
            confidence >= self.min_confidence_threshold and
            len(result.errors) == 0
        )

        # Generate recommendations
        result.recommendations = self._generate_recommendations(result)

        # Store in history
        self.analysis_history.append({
            'timestamp': result.metadata['timestamp'],
            'quality_score': quality_score,
            'confidence': confidence,
            'is_valid': result.is_valid,
            'errors': errors,
        })

        return result

    def check_quality(self, response: str) -> float:
        """
        Assess response quality.

        Args:
            response: The response to assess

        Returns:
            Quality score from 0.0 to 1.0
        """
        score = 1.0

        # Check length (responses that are too short or too long are lower quality)
        length = len(response)
        if length < 50:
            score -= 0.3
        elif length > 10000:
            score -= 0.1

        # Check for structure (has some organization)
        has_structure = any([
            '```' in response,  # Code blocks
            response.count('\n\n') >= 2,  # Paragraphs
            bool(re.search(r'^#+\s', response, re.MULTILINE)),  # Headers
        ])
        if has_structure:
            score += 0.1

        # Check for error indicators
        error_count = sum(1 for pattern in self.error_patterns
                         if re.search(pattern, response, re.IGNORECASE))
        score -= min(error_count * 0.15, 0.5)

        # Check for success indicators
        success_count = sum(1 for pattern in self.success_patterns
                           if re.search(pattern, response, re.IGNORECASE))
        score += min(success_count * 0.05, 0.15)

        return max(0.0, min(1.0, score))

    def detect_errors(self, response: str) -> List[str]:
        """
        Detect error patterns in response.

        Args:
            response: The response to check

        Returns:
            List of error descriptions
        """
        errors = []

        for pattern in self.error_patterns:
            matches = re.finditer(pattern, response, re.IGNORECASE)
            for match in matches:
                # Get context around the match
                start = max(0, match.start() - 30)
                end = min(len(response), match.end() + 30)
                context = response[start:end].strip()

                errors.append(f"Error pattern detected: '{match.group()}' in context: '{context}'")

        return errors

    def extract_info(self, response: str) -> Dict[str, Any]:
        """
        Extract key information from response.

        Args:
            response: The response to extract from

        Returns:
            Dictionary of extracted information
        """
        info = {}

        # Extract file paths
        file_pattern = r'[\w\-./]+\.(?:py|js|ts|json|yaml|yml|md|txt|sh)'
        info['file_paths'] = list(set(re.findall(file_pattern, response)))

        # Extract URLs
        url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
        info['urls'] = list(set(re.findall(url_pattern, response)))

        # Extract code blocks
        code_pattern = r'```(?:python|javascript|typescript|bash|json|yaml)?\n(.*?)```'
        info['code_blocks'] = re.findall(code_pattern, response, re.DOTALL)

        # Extract command references
        command_pattern = r'(?:`|")(?:npm|pip|python|node|git|docker|kubectl)[^\s`"]+'
        info['commands'] = list(set(re.findall(command_pattern, response)))

        # Extract entities (capitalized words that might be important)
        entity_pattern = r'\b[A-Z][a-zA-Z0-9]+\b'
        entities = list(set(re.findall(entity_pattern, response)))
        info['entities'] = [e for e in entities if len(e) > 2]

        return info

    def compare_with_expectation(self,
                                 response: str,
                                 expectation: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        Compare response with expected outcome.

        Args:
            response: The actual response
            expectation: Expected outcome specification

        Returns:
            Tuple of (matches, list of differences)
        """
        differences = []

        # Check for expected keywords
        if 'keywords' in expectation:
            missing_keywords = []
            for keyword in expectation['keywords']:
                if keyword.lower() not in response.lower():
                    missing_keywords.append(keyword)

            if missing_keywords:
                differences.append(f"Missing expected keywords: {', '.join(missing_keywords)}")

        # Check for expected patterns
        if 'patterns' in expectation:
            missing_patterns = []
            for pattern in expectation['patterns']:
                if not re.search(pattern, response, re.IGNORECASE):
                    missing_patterns.append(pattern)

            if missing_patterns:
                differences.append(f"Missing expected patterns: {', '.join(missing_patterns)}")

        # Check for excluded keywords
        if 'exclude' in expectation:
            found_excluded = []
            for keyword in expectation['exclude']:
                if keyword.lower() in response.lower():
                    found_excluded.append(keyword)

            if found_excluded:
                differences.append(f"Found excluded keywords: {', '.join(found_excluded)}")

        # Check length constraints
        if 'min_length' in expectation:
            if len(response) < expectation['min_length']:
                differences.append(f"Response too short: {len(response)} < {expectation['min_length']}")

        if 'max_length' in expectation:
            if len(response) > expectation['max_length']:
                differences.append(f"Response too long: {len(response)} > {expectation['max_length']}")

        matches = len(differences) == 0
        return matches, differences

    def generate_report(self, result: AnalysisResult) -> str:
        """
        Generate a human-readable analysis report.

        Args:
            result: The analysis result

        Returns:
            Formatted report string
        """
        lines = [
            "# Response Analysis Report",
            "",
            f"Generated: {result.metadata['timestamp']}",
            f"Response Length: {result.metadata['response_length']} characters",
            "",
            "## Quality Assessment",
            f"- Quality Score: {result.quality_score:.2%}",
            f"- Confidence: {result.confidence:.2%}",
            f"- Valid: {result.is_valid}",
            "",
        ]

        if result.errors:
            lines.extend([
                "## Errors",
                ""
            ])
            for error in result.errors:
                lines.append(f"- {error}")
            lines.append("")

        if result.warnings:
            lines.extend([
                "## Warnings",
                ""
            ])
            for warning in result.warnings:
                lines.append(f"- {warning}")
            lines.append("")

        if result.extracted_info:
            lines.extend([
                "## Extracted Information",
                ""
            ])
            for key, value in result.extracted_info.items():
                if isinstance(value, list):
                    lines.append(f"- {key}: {len(value)} items")
                    if value:
                        for item in value[:5]:  # Show first 5
                            lines.append(f"  - {item[:100]}")
                        if len(value) > 5:
                            lines.append(f"  - ... and {len(value) - 5} more")
                else:
                    lines.append(f"- {key}: {str(value)[:100]}")
            lines.append("")

        if result.patterns_found:
            lines.extend([
                "## Patterns Detected",
                ""
            ])
            for pattern in result.patterns_found:
                lines.append(f"- {pattern}")
            lines.append("")

        if result.recommendations:
            lines.extend([
                "## Recommendations",
                ""
            ])
            for rec in result.recommendations:
                lines.append(f"- {rec}")
            lines.append("")

        return "\n".join(lines)

    def _detect_patterns(self, response: str) -> List[str]:
        """Detect patterns in response"""
        patterns = []

        # Check for common patterns
        if re.search(r'```(?:python|js|javascript|typescript)', response, re.IGNORECASE):
            patterns.append('code_block_present')

        if re.search(r'#[Tt]ODO|#FIXME|#XXX', response):
            patterns.append('todo_markers_present')

        if re.search(r'>>>|\.\.\.|In \[\d+\]:', response):
            patterns.append('interactive_session_present')

        if re.search(r'(?i)debugging|debug|traceback', response):
            patterns.append('debugging_content')

        return patterns

    def _calculate_confidence(self, result: AnalysisResult) -> float:
        """Calculate overall confidence in the analysis"""
        confidence = 1.0

        # Reduce confidence if errors found
        if result.errors:
            confidence -= 0.3

        # Increase confidence with extracted info
        if result.extracted_info:
            info_richness = sum(1 for v in result.extracted_info.values() if v)
            confidence += min(info_richness * 0.05, 0.15)

        # Adjust based on quality score
        confidence = (confidence + result.quality_score) / 2

        return max(0.0, min(1.0, confidence))

    def _generate_recommendations(self, result: AnalysisResult) -> List[str]:
        """Generate recommendations based on analysis"""
        recommendations = []

        if result.quality_score < 0.5:
            recommendations.append("Response quality is below threshold - consider reviewing")

        if len(result.errors) > 0:
            recommendations.append(f"Found {len(result.errors)} error patterns - investigate")

        if result.confidence < 0.6:
            recommendations.append("Low confidence in analysis - additional verification needed")

        if not result.extracted_info.get('file_paths'):
            recommendations.append("No file paths detected - verify file operations if expected")

        return recommendations

    def get_analysis_stats(self) -> Dict[str, Any]:
        """Get statistics from analysis history"""
        if not self.analysis_history:
            return {'message': 'No analysis history available'}

        recent = self.analysis_history[-100:]  # Last 100 analyses

        return {
            'total_analyses': len(self.analysis_history),
            'recent_quality_avg': sum(r['quality_score'] for r in recent) / len(recent),
            'recent_confidence_avg': sum(r['confidence'] for r in recent) / len(recent),
            'validity_rate': sum(1 for r in recent if r['is_valid']) / len(recent),
            'error_rate': sum(1 for r in recent if r['errors']) / len(recent),
        }
