#!/usr/bin/env python3
"""
Spec Analysis Tool for Blackbox4
Analyzes existing specs and generates insights
"""

import sys
import os
import json
import argparse
from pathlib import Path
from collections import Counter

# Add lib to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'lib', 'spec-creation'))

try:
    from spec_types import StructuredSpec
except ImportError:
    print("Error: spec_types module not found")
    sys.exit(1)


def analyze_spec_from_json(json_file: str) -> dict:
    """Analyze a spec from JSON file."""
    with open(json_file) as f:
        data = json.load(f)

    analysis = {
        'project_name': data.get('project_name', 'Unknown'),
        'version': data.get('version', '1.0'),
        'created_at': data.get('created_at', ''),
        'stats': {
            'user_stories': len(data.get('user_stories', [])),
            'functional_requirements': len(data.get('functional_requirements', [])),
            'assumptions': len(data.get('assumptions', [])),
            'success_criteria': len(data.get('success_criteria', [])),
            'clarifications': len(data.get('clarifications', []))
        },
        'priorities': {
            'user_stories': Counter(
                s.get('priority', 'medium')
                for s in data.get('user_stories', [])
            ),
            'functional_requirements': Counter(
                r.get('priority', 'medium')
                for r in data.get('functional_requirements', [])
            )
        },
        'completeness': {
            'has_overview': bool(data.get('overview', '').strip()),
            'has_constitution': data.get('constitution') is not None,
            'has_assumptions': len(data.get('assumptions', [])) > 0,
            'has_success_criteria': len(data.get('success_criteria', [])) > 0
        }
    }

    return analysis


def generate_analysis_report(analysis: dict) -> str:
    """Generate a formatted analysis report."""
    report = "# Spec Analysis Report\n\n"
    report += f"**Project:** {analysis['project_name']}\n"
    report += f"**Version:** {analysis['version']}\n"
    report += f"**Created:** {analysis['created_at']}\n\n"

    report += "## Statistics\n\n"
    stats = analysis['stats']
    report += f"- User Stories: {stats['user_stories']}\n"
    report += f"- Functional Requirements: {stats['functional_requirements']}\n"
    report += f"- Assumptions: {stats['assumptions']}\n"
    report += f"- Success Criteria: {stats['success_criteria']}\n"
    report += f"- Clarifications: {stats['clarifications']}\n\n"

    report += "## Priority Distribution\n\n"
    report += "User Stories:\n"
    for priority, count in analysis['priorities']['user_stories'].items():
        bar = "█" * count
        report += f"- {priority.capitalize()}: {count} {bar}\n"

    report += "\nFunctional Requirements:\n"
    for priority, count in analysis['priorities']['functional_requirements'].items():
        bar = "█" * count
        report += f"- {priority.capitalize()}: {count} {bar}\n"

    report += "\n## Completeness Check\n\n"
    completeness = analysis['completeness']
    checks = [
        ('Overview', completeness['has_overview']),
        ('Constitution', completeness['has_constitution']),
        ('Assumptions', completeness['has_assumptions']),
        ('Success Criteria', completeness['has_success_criteria'])
    ]

    for check_name, passed in checks:
        icon = "✅" if passed else "❌"
        status = "Present" if passed else "Missing"
        report += f"- {icon} {check_name}: {status}\n"

    return report


def main():
    parser = argparse.ArgumentParser(description='Analyze Blackbox4 specifications')
    parser.add_argument('spec_file', help='Path to spec JSON file')
    parser.add_argument('--output', '-o', help='Output analysis report file')

    args = parser.parse_args()

    # Analyze spec
    analysis = analyze_spec_from_json(args.spec_file)

    # Generate report
    report = generate_analysis_report(analysis)

    # Output report
    if args.output:
        with open(args.output, 'w') as f:
            f.write(report)
        print(f"✅ Analysis report saved to: {args.output}")
    else:
        print(report)


if __name__ == '__main__':
    main()
