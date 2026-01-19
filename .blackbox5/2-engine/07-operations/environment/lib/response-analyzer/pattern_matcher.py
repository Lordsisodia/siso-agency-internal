#!/usr/bin/env python3
"""
Pattern Matcher - Match response patterns for automated analysis

This module provides pattern matching capabilities to detect success,
error, confusion, and completion indicators in agent responses.
"""

from typing import Any, Dict, List, Optional, Tuple
import re
from dataclasses import dataclass


@dataclass
class PatternMatch:
    """Result of pattern matching"""
    pattern_type: str
    pattern: str
    matched_text: str
    confidence: float
    position: Tuple[int, int]


class PatternMatcher:
    """
    Match patterns in agent responses.

    Detects success, error, confusion, and completion patterns to
    inform automated analysis and decision-making.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize pattern matcher.

        Args:
            config: Optional configuration dictionary
        """
        self.config = config or {}

        # Success patterns
        self.success_patterns = [
            r'successfully\s+(?:completed|finished|done|implemented|created)',
            r'(?:completed|finished|done|implemented|executed)\s+successfully',
            r'(?:task|goal|objective)\s+(?:was|has been)\s+(?:achieved|completed|accomplished)',
            r'all\s+(?:tests|checks|requirements)\s+(?:passed|satisfied)',
            r'(?:deployment|installation|setup)\s+(?:completed|successful)',
            r'build\s+(?:passed|succeeded)',
            r'no\s+errors?\s+(?:found|detected)',
            r'everything\s+(?:works?|is\s+working)',
            r'ready\s+(?:to\s+use|for\s+(?:production|deployment))',
        ]

        # Error patterns
        self.error_patterns = [
            r'(?:error|exception|failure)[:\s]+(?!not found)',
            r'(?:failed|unable|cannot|could\s+not)\s+to',
            r'(?:crash|bug|issue|problem)',
            r'timeout|timed\s+out',
            r'(?:access\s+)?denied|forbidden|unauthorized',
            r'not\s+found|missing|does\s+not\s+exist',
            r'(?:invalid|incorrect|bad)\s+(?:input|argument|parameter|credential)',
            r'(?:compilation|syntax|runtime)\s+error',
            r'segmentation\s+fault|stack\s+overflow',
        ]

        # Confusion patterns
        self.confusion_patterns = [
            r'(?:unclear|unsure|not\s+certain|confused|uncertain)',
            r'(?:need|require)\s+(?:more|additional)\s+(?:information|context|clarification)',
            r'(?:don\'t|do\s+not)\s+(?:know|understand)',
            r'(?:what|how)\s+(?:do|should|to)\s+(?:I|we)',
            r'(?:perhaps|maybe|possibly|might\s+be)',
            r'(?:not\s+sure|uncertain)\s+(?:about|how|what)',
            r'(?:can\s+you|please)\s+(?:clarify|explain)',
            r'(?:ambiguous|unclear|vague)',
            r'(?:stuck|blocked|unsure)\s+(?:on|at|with)',
        ]

        # Completion patterns
        self.completion_patterns = [
            r'(?:finished|completed|done)\s+(?:with|the)?\s*(?:task|step|phase)?',
            r'(?:all\s+)?(?:tasks?|steps?|items?)\s+(?:completed|finished|done)',
            r'(?:implementation|development|work)\s+(?:complete|finished)',
            r'(?:no\s+)?(?:remaining|left)\s+(?:to\s+do|tasks?|steps?)',
            r'(?:ready\s+for|proceed\s+to)\s+(?:next|testing|review)',
            r'(?:里程碑|milestone)\s+(?:reached|achieved)',
            r'(?:phase|stage|step)\s+\d+\s+complete',
        ]

        # Compile patterns for performance
        self._compiled_patterns = {
            'success': [re.compile(p, re.IGNORECASE) for p in self.success_patterns],
            'error': [re.compile(p, re.IGNORECASE) for p in self.error_patterns],
            'confusion': [re.compile(p, re.IGNORECASE) for p in self.confusion_patterns],
            'completion': [re.compile(p, re.IGNORECASE) for p in self.completion_patterns],
        }

    def match_pattern(self,
                     text: str,
                     pattern_type: str,
                     return_all: bool = False) -> List[PatternMatch]:
        """
        Match patterns of a specific type in text.

        Args:
            text: The text to search
            pattern_type: Type of pattern ('success', 'error', 'confusion', 'completion')
            return_all: If True, return all matches; if False, return first match

        Returns:
            List of PatternMatch objects
        """
        if pattern_type not in self._compiled_patterns:
            return []

        matches = []
        patterns = self._compiled_patterns[pattern_type]

        for pattern in patterns:
            for match in pattern.finditer(text):
                pattern_match = PatternMatch(
                    pattern_type=pattern_type,
                    pattern=pattern.pattern,
                    matched_text=match.group(),
                    confidence=self.get_match_confidence(match, text),
                    position=(match.start(), match.end())
                )
                matches.append(pattern_match)

                if not return_all:
                    return [pattern_match]

        return matches

    def match_all_patterns(self, text: str) -> Dict[str, List[PatternMatch]]:
        """
        Match all pattern types in text.

        Args:
            text: The text to search

        Returns:
            Dictionary mapping pattern types to matches
        """
        results = {}

        for pattern_type in self._compiled_patterns.keys():
            matches = self.match_pattern(text, pattern_type, return_all=True)
            if matches:
                results[pattern_type] = matches

        return results

    def get_match_confidence(self, match: re.Match, full_text: str) -> float:
        """
        Calculate confidence score for a pattern match.

        Args:
            match: The regex match object
            full_text: The full text being searched

        Returns:
            Confidence score from 0.0 to 1.0
        """
        confidence = 0.5  # Base confidence

        matched_text = match.group()

        # Higher confidence for explicit keywords
        explicit_keywords = ['error', 'exception', 'success', 'completed', 'failed']
        if any(keyword in matched_text.lower() for keyword in explicit_keywords):
            confidence += 0.2

        # Higher confidence for longer matches
        if len(matched_text) > 20:
            confidence += 0.1

        # Higher confidence if match contains context
        if len(matched_text.split()) >= 3:
            confidence += 0.1

        # Lower confidence if match is in quoted text (might be example)
        start_pos = match.start()
        # Check if within quotes (simple check)
        before_text = full_text[:start_pos]
        if before_text.count('"') % 2 == 1 or before_text.count("'") % 2 == 1:
            confidence -= 0.2

        return max(0.0, min(1.0, confidence))

    def has_pattern(self, text: str, pattern_type: str) -> bool:
        """
        Check if text contains any pattern of a specific type.

        Args:
            text: The text to check
            pattern_type: Type of pattern to check

        Returns:
            True if any pattern of the type is found
        """
        matches = self.match_pattern(text, pattern_type, return_all=False)
        return len(matches) > 0

    def count_patterns(self, text: str) -> Dict[str, int]:
        """
        Count patterns of each type in text.

        Args:
            text: The text to analyze

        Returns:
            Dictionary mapping pattern types to counts
        """
        counts = {
            'success': 0,
            'error': 0,
            'confusion': 0,
            'completion': 0,
        }

        all_matches = self.match_all_patterns(text)
        for pattern_type, matches in all_matches.items():
            counts[pattern_type] = len(matches)

        return counts

    def get_dominant_pattern(self, text: str) -> Optional[str]:
        """
        Get the dominant pattern type in text.

        Args:
            text: The text to analyze

        Returns:
            The pattern type with the most matches, or None
        """
        counts = self.count_patterns(text)

        if not any(counts.values()):
            return None

        return max(counts, key=counts.get)

    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """
        Analyze sentiment based on pattern matches.

        Args:
            text: The text to analyze

        Returns:
            Dictionary with sentiment analysis results
        """
        counts = self.count_patterns(text)
        total_matches = sum(counts.values())

        if total_matches == 0:
            return {
                'sentiment': 'neutral',
                'confidence': 0.5,
                'counts': counts,
            }

        # Calculate sentiment score
        positive_score = counts['success'] + counts['completion']
        negative_score = counts['error'] + counts['confusion']

        if positive_score > negative_score:
            sentiment = 'positive'
            confidence = positive_score / total_matches
        elif negative_score > positive_score:
            sentiment = 'negative'
            confidence = negative_score / total_matches
        else:
            sentiment = 'neutral'
            confidence = 0.5

        return {
            'sentiment': sentiment,
            'confidence': confidence,
            'counts': counts,
            'total_matches': total_matches,
        }

    def get_pattern_context(self,
                           text: str,
                           match: PatternMatch,
                           context_size: int = 50) -> str:
        """
        Get context around a pattern match.

        Args:
            text: The full text
            match: The pattern match
            context_size: Number of characters for context

        Returns:
            Context string around the match
        """
        start = max(0, match.position[0] - context_size)
        end = min(len(text), match.position[1] + context_size)

        context = text[start:end]

        # Add ellipsis if truncated
        if start > 0:
            context = '...' + context
        if end < len(text):
            context = context + '...'

        return context

    def get_pattern_summary(self, text: str) -> str:
        """
        Get a human-readable pattern summary.

        Args:
            text: The text to analyze

        Returns:
            Formatted summary string
        """
        lines = ["Pattern Analysis Summary:", ""]

        counts = self.count_patterns(text)
        total = sum(counts.values())

        lines.append(f"Total patterns found: {total}")
        lines.append("")

        for pattern_type, count in counts.items():
            if count > 0:
                lines.append(f"  {pattern_type.capitalize()}: {count}")

        # Get dominant pattern
        dominant = self.get_dominant_pattern(text)
        if dominant:
            lines.append("")
            lines.append(f"Dominant pattern: {dominant}")

        # Get sentiment
        sentiment_analysis = self.analyze_sentiment(text)
        lines.append(f"Overall sentiment: {sentiment_analysis['sentiment']}")
        lines.append(f"Sentiment confidence: {sentiment_analysis['confidence']:.1%}")

        return "\n".join(lines)

    def add_custom_pattern(self,
                          pattern_type: str,
                          pattern: str) -> bool:
        """
        Add a custom pattern to a pattern type.

        Args:
            pattern_type: Type of pattern ('success', 'error', 'confusion', 'completion')
            pattern: The regex pattern string

        Returns:
            True if pattern was added successfully
        """
        if pattern_type not in self._compiled_patterns:
            return False

        try:
            compiled = re.compile(pattern, re.IGNORECASE)
            self._compiled_patterns[pattern_type].append(compiled)

            # Also add to the source list for reference
            if pattern_type == 'success':
                self.success_patterns.append(pattern)
            elif pattern_type == 'error':
                self.error_patterns.append(pattern)
            elif pattern_type == 'confusion':
                self.confusion_patterns.append(pattern)
            elif pattern_type == 'completion':
                self.completion_patterns.append(pattern)

            return True
        except re.error:
            return False
