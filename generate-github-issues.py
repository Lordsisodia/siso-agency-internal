#!/usr/bin/env python3
"""
Convert Ralph's analysis output into GitHub issue templates
"""

import json
from pathlib import Path
from datetime import datetime

def parse_analysis_file(filepath: Path) -> dict:
    """Parse an analysis file and extract improvement recommendations"""
    content = filepath.read_text()

    return {
        'title': filepath.stem.replace('-', ' ').title(),
        'file': str(filepath),
        'content': content
    }

def generate_github_issue(analysis: dict, priority: int) -> dict:
    """Generate a GitHub issue from analysis"""

    # Extract recommendations
    lines = analysis['content'].split('\n')

    # Find recommendations section
    in_recommendations = False
    recommendations = []

    for line in lines:
        if '### Actionable Recommendations' in line or '### Recommended Actions' in line:
            in_recommendations = True
            continue

        if in_recommendations:
            if line.startswith('- ') or line.startswith('* '):
                recommendations.append(line.strip())
            elif line.startswith('####'):
                break

    # Build issue
    title = f"[{analysis['file'].split('/')[-1]}] {analysis['title']}"

    body = f"""## Analysis Report

**Source:** `{analysis['file']}`
**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Priority:** {priority}

### Context

This issue was automatically generated from Ralph Runtime's continuous analysis of Blackbox5.

### Recommended Actions

"""

    for rec in recommendations[:5]:  # Top 5 recommendations
        body += f"{rec}\n"

    body += """
### Implementation

1. Review the analysis document for full context
2. Prioritize the recommended actions
3. Create subtasks for implementation
4. Track progress with pull requests

### Related

- Ralph Runtime Analysis: Ralph Continuous Blackbox5 Analysis
- Analysis File: `{analysis['file']}`
"""

    return {
        'title': title,
        'body': body,
        'labels': ['automated', 'ralph-analysis', f'priority-{priority}']
    }

def main():
    """Generate GitHub issues from all analysis files"""

    continuous_dir = Path('.blackbox5/engine/runtime/ralph/continuous')

    if not continuous_dir.exists():
        print(f"Analysis directory not found: {continuous_dir}")
        return

    # Find all analysis files
    analysis_files = list(continuous_dir.glob('ANALYSIS-*.md'))

    if not analysis_files:
        print("No analysis files found")
        return

    print(f"Found {len(analysis_files)} analysis files")

    # Generate issues for each
    issues = []
    for i, analysis_file in enumerate(analysis_files, 1):
        print(f"\n[{i}/{len(analysis_files)}] Processing {analysis_file.name}")

        analysis = parse_analysis_file(analysis_file)
        priority = i  # Earlier files get higher priority
        issue = generate_github_issue(analysis, priority)
        issues.append(issue)

    # Write issues to file
    output_file = Path('.blackbox5/engine/runtime/ralph/continuous/GITHUB-ISSUES.json')
    with open(output_file, 'w') as f:
        json.dump(issues, f, indent=2)

    print(f"\n✓ Generated {len(issues)} GitHub issues")
    print(f"✓ Saved to: {output_file}")

    # Print first issue as example
    if issues:
        print("\n--- Example Issue ---")
        print(f"Title: {issues[0]['title']}")
        print(f"Labels: {', '.join(issues[0]['labels'])}")
        print(f"\nBody Preview (first 500 chars):")
        print(issues[0]['body'][:500] + "...")

if __name__ == '__main__':
    main()
