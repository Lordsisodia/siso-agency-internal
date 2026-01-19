#!/usr/bin/env python3
"""
Validation Report Generator for Blackbox4
Generates reports in multiple formats (HTML, Markdown, JSON)
"""

import sys
import os
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
from dataclasses import dataclass, field
from enum import Enum

# Add lib to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'lib', 'spec-creation'))

from validation import ValidationResult, ValidationError


class ReportFormat(Enum):
    """Supported report formats."""
    HTML = "html"
    MARKDOWN = "markdown"
    JSON = "json"


class IssueLevel(Enum):
    """Issue severity levels."""
    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"


@dataclass
class IssueCategory:
    """Category for grouping issues."""
    name: str
    description: str
    critical_count: int = 0
    warning_count: int = 0
    info_count: int = 0

    @property
    def total_count(self) -> int:
        return self.critical_count + self.warning_count + self.info_count


class ValidationReport:
    """Generate validation reports in multiple formats."""

    def __init__(self, project_name: str = "Unknown Project"):
        self.project_name = project_name
        self.generated_at = datetime.now().isoformat()
        self.issues: List[ValidationError] = []
        self.scores: Dict[str, float] = {}
        self.categories: Dict[str, IssueCategory] = {}
        self.traceability_data: Optional[Dict[str, Any]] = None

    def add_issue(self, issue: ValidationError) -> None:
        """Add an issue to the report."""
        self.issues.append(issue)

        # Update category counts
        if issue.category not in self.categories:
            self.categories[issue.category] = IssueCategory(
                name=issue.category,
                description=f"Issues related to {issue.category}"
            )

        category = self.categories[issue.category]
        if issue.level == 'critical':
            category.critical_count += 1
        elif issue.level == 'warning':
            category.warning_count += 1
        else:
            category.info_count += 1

    def set_scores(self, scores: Dict[str, float]) -> None:
        """Set validation scores."""
        self.scores = scores

    def set_traceability(self, traceability_data: Dict[str, Any]) -> None:
        """Set traceability matrix data."""
        self.traceability_data = traceability_data

    def calculate_score(self) -> float:
        """
        Calculate overall validation score.
        Based on issue severity and completeness.
        """
        if not self.scores:
            # Calculate from issues
            total_issues = len(self.issues)
            if total_issues == 0:
                return 100.0

            critical = len([i for i in self.issues if i.level == 'critical'])
            warnings = len([i for i in self.issues if i.level == 'warning'])

            # Score formula: 100 - (critical * 20 + warnings * 5)
            score = max(0, 100 - (critical * 20 + warnings * 5))
            return score

        return self.scores.get('overall', 0)

    def get_summary(self) -> Dict[str, Any]:
        """Get report summary."""
        critical = len([i for i in self.issues if i.level == 'critical'])
        warnings = len([i for i in self.issues if i.level == 'warning'])
        info = len([i for i in self.issues if i.level == 'info'])

        return {
            'project_name': self.project_name,
            'generated_at': self.generated_at,
            'total_issues': len(self.issues),
            'critical': critical,
            'warnings': warnings,
            'info': info,
            'score': self.calculate_score(),
            'categories': {name: cat.total_count for name, cat in self.categories.items()}
        }

    def generate_html(self, output_path: str = None) -> str:
        """
        Generate HTML report.
        Returns HTML string and optionally writes to file.
        """
        summary = self.get_summary()

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Validation Report - {self.project_name}</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }}

        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }}

        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
        }}

        .header h1 {{
            font-size: 28px;
            margin-bottom: 10px;
        }}

        .header .meta {{
            opacity: 0.9;
            font-size: 14px;
        }}

        .summary {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #fafafa;
            border-bottom: 1px solid #e0e0e0;
        }}

        .summary-card {{
            background: white;
            padding: 20px;
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            text-align: center;
        }}

        .summary-card .value {{
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 5px;
        }}

        .summary-card .label {{
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}

        .score-excellent {{ color: #4caf50; }}
        .score-good {{ color: #ff9800; }}
        .score-poor {{ color: #f44336; }}

        .critical {{ color: #f44336; }}
        .warning {{ color: #ff9800; }}
        .info {{ color: #2196f3; }}

        .issues {{
            padding: 30px;
        }}

        .category-section {{
            margin-bottom: 30px;
        }}

        .category-header {{
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e0e0e0;
        }}

        .issue {{
            background: #f9f9f9;
            border-left: 4px solid #ccc;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 4px;
        }}

        .issue.critical {{
            border-left-color: #f44336;
            background: #ffebee;
        }}

        .issue.warning {{
            border-left-color: #ff9800;
            background: #fff3e0;
        }}

        .issue.info {{
            border-left-color: #2196f3;
            background: #e3f2fd;
        }}

        .issue-header {{
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }}

        .issue-level {{
            font-weight: bold;
            text-transform: uppercase;
            font-size: 12px;
            padding: 2px 8px;
            border-radius: 3px;
        }}

        .issue.critical .issue-level {{
            background: #f44336;
            color: white;
        }}

        .issue.warning .issue-level {{
            background: #ff9800;
            color: white;
        }}

        .issue.info .issue-level {{
            background: #2196f3;
            color: white;
        }}

        .issue-category {{
            font-size: 12px;
            color: #666;
            font-weight: 500;
        }}

        .issue-message {{
            margin-bottom: 8px;
        }}

        .issue-suggestion {{
            font-size: 14px;
            color: #666;
            font-style: italic;
            padding-left: 15px;
            border-left: 2px solid #ddd;
        }}

        .traceability {{
            padding: 30px;
            background: #f9f9f9;
            border-top: 1px solid #e0e0e0;
        }}

        .traceability h2 {{
            margin-bottom: 20px;
            font-size: 20px;
        }}

        .trace-matrix {{
            display: grid;
            gap: 10px;
        }}

        .trace-link {{
            background: white;
            padding: 10px 15px;
            border-radius: 4px;
            border-left: 3px solid #667eea;
        }}

        @media print {{
            body {{
                background: white;
                padding: 0;
            }}
            .container {{
                box-shadow: none;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Validation Report</h1>
            <div class="meta">
                Project: {self.project_name}<br>
                Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
            </div>
        </div>

        <div class="summary">
            <div class="summary-card">
                <div class="value {self._get_score_class(summary['score'])}">{summary['score']:.0f}%</div>
                <div class="label">Overall Score</div>
            </div>
            <div class="summary-card">
                <div class="value critical">{summary['critical']}</div>
                <div class="label">Critical Issues</div>
            </div>
            <div class="summary-card">
                <div class="value warning">{summary['warnings']}</div>
                <div class="label">Warnings</div>
            </div>
            <div class="summary-card">
                <div class="value info">{summary['info']}</div>
                <div class="label">Info</div>
            </div>
        </div>

        <div class="issues">
"""

        # Group issues by category
        for category_name, category in self.categories.items():
            if category.total_count == 0:
                continue

            html += f"""
            <div class="category-section">
                <div class="category-header">
                    {category_name.replace('_', ' ').title()}
                    <span style="font-size: 14px; font-weight: normal; color: #666;">
                        ({category.total_count} issues)
                    </span>
                </div>
"""

            # Add issues for this category
            category_issues = [i for i in self.issues if i.category == category_name]
            for issue in category_issues:
                html += f"""
                <div class="issue {issue.level}">
                    <div class="issue-header">
                        <span class="issue-level">{issue.level}</span>
                        <span class="issue-category">{issue.category}</span>
                    </div>
                    <div class="issue-message">{issue.message}</div>
"""
                if issue.suggestion:
                    html += f'<div class="issue-suggestion">Suggestion: {issue.suggestion}</div>'

                html += """
                </div>
"""

            html += """
            </div>
"""

        html += """
        </div>
"""

        # Add traceability section if available
        if self.traceability_data:
            html += """
        <div class="traceability">
            <h2>Traceability Matrix</h2>
            <div class="trace-matrix>
"""
            for source, targets in self.traceability_data.items():
                if isinstance(targets, list) and targets:
                    html += f'<div class="trace-link">{source} -> {", ".join(targets)}</div>'

            html += """
            </div>
        </div>
"""

        html += """
    </div>
</body>
</html>
"""

        # Write to file if path provided
        if output_path:
            with open(output_path, 'w') as f:
                f.write(html)

        return html

    def generate_markdown(self, output_path: str = None) -> str:
        """
        Generate Markdown report.
        Returns markdown string and optionally writes to file.
        """
        summary = self.get_summary()

        md = f"""# Validation Report: {self.project_name}

**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Summary

| Metric | Value |
|--------|-------|
| **Overall Score** | **{summary['score']:.0f}%** |
| Critical Issues | {summary['critical']} |
| Warnings | {summary['warnings']} |
| Info | {summary['info']} |
| Total Issues | {summary['total_issues']} |

---

## Scores by Category

"""

        if self.scores:
            md += "| Category | Score |\n"
            md += "|----------|-------|\n"
            for category, score in self.scores.items():
                md += f"| {category.title()} | {score:.0f}% |\n"
            md += "\n"

        md += "## Issues\n\n"

        # Group issues by category
        for category_name, category in self.categories.items():
            if category.total_count == 0:
                continue

            md += f"### {category_name.replace('_', ' ').title()}\n\n"

            # Add issues for this category
            category_issues = [i for i in self.issues if i.category == category_name]
            for issue in category_issues:
                level_icon = {
                    'critical': '🔴',
                    'warning': '⚠️',
                    'info': 'ℹ️'
                }.get(issue.level, '•')

                md += f"{level_icon} **[{issue.level.upper()}]** {issue.message}\n\n"

                if issue.suggestion:
                    md += f"   💡 *Suggestion: {issue.suggestion}*\n\n"

                md += "\n"

        # Add traceability section if available
        if self.traceability_data:
            md += "## Traceability Matrix\n\n"
            for source, targets in self.traceability_data.items():
                if isinstance(targets, list) and targets:
                    md += f"- **{source}** → {', '.join(targets)}\n"

        md += f"\n---\n*Generated by Blackbox4 Validation System*"

        # Write to file if path provided
        if output_path:
            with open(output_path, 'w') as f:
                f.write(md)

        return md

    def generate_json(self, output_path: str = None) -> str:
        """
        Generate JSON report.
        Returns JSON string and optionally writes to file.
        """
        report_data = {
            'project_name': self.project_name,
            'generated_at': self.generated_at,
            'summary': self.get_summary(),
            'scores': self.scores,
            'issues': [
                {
                    'level': issue.level,
                    'category': issue.category,
                    'message': issue.message,
                    'suggestion': issue.suggestion
                }
                for issue in self.issues
            ],
            'categories': {
                name: {
                    'total': cat.total_count,
                    'critical': cat.critical_count,
                    'warning': cat.warning_count,
                    'info': cat.info_count
                }
                for name, cat in self.categories.items()
            },
            'traceability': self.traceability_data
        }

        json_str = json.dumps(report_data, indent=2)

        # Write to file if path provided
        if output_path:
            with open(output_path, 'w') as f:
                f.write(json_str)

        return json_str

    def _get_score_class(self, score: float) -> str:
        """Get CSS class for score."""
        if score >= 80:
            return 'score-excellent'
        elif score >= 60:
            return 'score-good'
        else:
            return 'score-poor'


def main():
    """Command-line interface for report generation."""
    import argparse

    parser = argparse.ArgumentParser(description='Validation Report Generator')
    parser.add_argument('--project', '-p', default='Unknown Project', help='Project name')
    parser.add_argument('--issues', '-i', help='Path to issues JSON file')
    parser.add_argument('--format', '-f', choices=['html', 'markdown', 'json', 'all'],
                       default='html', help='Report format')
    parser.add_argument('--output', '-o', help='Output file or directory')
    parser.add_argument('--scores', help='Scores JSON string')

    args = parser.parse_args()

    # Create report
    report = ValidationReport(args.project)

    # Load issues if provided
    if args.issues:
        with open(args.issues, 'r') as f:
            issues_data = json.load(f)
            for issue_dict in issues_data:
                from validation import ValidationError
                report.add_issue(ValidationError(**issue_dict))

    # Load scores if provided
    if args.scores:
        report.set_scores(json.loads(args.scores))

    # Generate reports
    if args.format == 'all':
        # Generate all formats
        base_name = args.output or f"validation_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        html_path = f"{base_name}.html"
        md_path = f"{base_name}.md"
        json_path = f"{base_name}.json"

        report.generate_html(html_path)
        report.generate_markdown(md_path)
        report.generate_json(json_path)

        print(f"Generated reports:")
        print(f"  HTML: {html_path}")
        print(f"  Markdown: {md_path}")
        print(f"  JSON: {json_path}")

    else:
        # Generate single format
        output_path = args.output or f"validation_report.{args.format}"

        if args.format == 'html':
            report.generate_html(output_path)
        elif args.format == 'markdown':
            report.generate_markdown(output_path)
        elif args.format == 'json':
            report.generate_json(output_path)

        print(f"Report saved to: {output_path}")


if __name__ == '__main__':
    main()
