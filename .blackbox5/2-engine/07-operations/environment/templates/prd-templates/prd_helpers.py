#!/usr/bin/env python3
"""
PRD Helper Functions for Blackbox4
Provides helper functions for PRD generation and manipulation.
"""

import re
import json
from typing import List, Dict, Any, Optional
from datetime import datetime


def extract_user_stories(spec_data: Dict[str, Any]) -> List[Dict[str, str]]:
    """
    Extract user stories from spec data.

    Args:
        spec_data: Dictionary containing spec information

    Returns:
        List of user story dictionaries with role, action, and benefit
    """
    stories = []

    # Try to get user stories from different possible locations
    user_stories_data = spec_data.get('user_stories', [])

    if not user_stories_data:
        user_stories_data = spec_data.get('stories', [])

    if not user_stories_data:
        # Extract from spec text if structured data not available
        spec_text = spec_data.get('description', '') + ' ' + spec_data.get('scope', '')
        stories = parse_user_stories_from_text(spec_text)
    else:
        # Process structured user stories
        for story in user_stories_data:
            if isinstance(story, dict):
                stories.append({
                    'role': story.get('role', story.get('as_a', 'User')),
                    'action': story.get('action', story.get('i_want', '')),
                    'benefit': story.get('benefit', story.get('so_that', ''))
                })
            elif isinstance(story, str):
                parsed = parse_user_story(story)
                if parsed:
                    stories.append(parsed)

    return stories


def parse_user_stories_from_text(text: str) -> List[Dict[str, str]]:
    """
    Parse user stories from free-form text.

    Args:
        text: Text containing user stories

    Returns:
        List of parsed user story dictionaries
    """
    stories = []

    # Pattern to match: "As a [role], I want [action], so that [benefit]"
    pattern = r'(?:As a|As an)\s+([^,]+),?\s*(?:I want|I would like)\s+([^,]+),?\s*(?:so that|in order to)\s+([^.\n]+)'

    matches = re.findall(pattern, text, re.IGNORECASE)

    for match in matches:
        stories.append({
            'role': match[0].strip(),
            'action': match[1].strip(),
            'benefit': match[2].strip()
        })

    return stories


def parse_user_story(story_text: str) -> Optional[Dict[str, str]]:
    """
    Parse a single user story from text.

    Args:
        story_text: Text containing a user story

    Returns:
        Dictionary with role, action, benefit or None
    """
    pattern = r'(?:As a|As an)\s+([^,]+),?\s*(?:I want|I would like)\s+([^,]+),?\s*(?:so that|in order to)\s+([^.\n]+)'
    match = re.search(pattern, story_text, re.IGNORECASE)

    if match:
        return {
            'role': match.group(1).strip(),
            'action': match.group(2).strip(),
            'benefit': match.group(3).strip()
        }
    return None


def extract_requirements(spec_data: Dict[str, Any]) -> Dict[str, List[Dict[str, str]]]:
    """
    Extract functional requirements from spec data.

    Args:
        spec_data: Dictionary containing spec information

    Returns:
        Dictionary with categorized requirements
    """
    requirements = {
        'core': [],
        'optional': [],
        'technical': []
    }

    # Try to get requirements from different locations
    reqs_data = spec_data.get('requirements', {})

    if not reqs_data:
        reqs_data = spec_data.get('functional_requirements', {})

    if reqs_data:
        # Process structured requirements
        for category in requirements.keys():
            category_reqs = reqs_data.get(category, [])
            for req in category_reqs:
                if isinstance(req, dict):
                    requirements[category].append({
                        'title': req.get('title', req.get('name', '')),
                        'description': req.get('description', ''),
                        'priority': req.get('priority', 'medium')
                    })
                elif isinstance(req, str):
                    requirements[category].append({
                        'title': req[:50] + '...' if len(req) > 50 else req,
                        'description': req,
                        'priority': 'medium'
                    })
    else:
        # Extract from scope/description
        text = spec_data.get('scope', '') + ' ' + spec_data.get('description', '')
        requirements['core'] = parse_requirements_from_text(text)

    return requirements


def parse_requirements_from_text(text: str) -> List[Dict[str, str]]:
    """
    Parse requirements from free-form text.

    Args:
        text: Text containing requirements

    Returns:
        List of requirement dictionaries
    """
    requirements = []

    # Split by common delimiters
    lines = re.split(r'[;\n•\-\*]', text)

    for line in lines:
        line = line.strip()
        if len(line) > 10:  # Filter out short/empty lines
            requirements.append({
                'title': line[:50] + '...' if len(line) > 50 else line,
                'description': line,
                'priority': 'medium'
            })

    return requirements[:10]  # Limit to top 10 requirements


def format_acceptance_criteria(criteria: List[str]) -> str:
    """
    Format acceptance criteria into markdown.

    Args:
        criteria: List of acceptance criterion strings

    Returns:
        Formatted markdown string
    """
    if not criteria:
        return "- [ ] To be defined"

    formatted = []
    for i, criterion in enumerate(criteria, 1):
        criterion = criterion.strip()
        if not criterion.startswith('-'):
            criterion = f"- [ ] {criterion}"
        formatted.append(f"{i}. {criterion}")

    return '\n'.join(formatted)


def build_tech_stack_section(tech_stack: Dict[str, Any]) -> str:
    """
    Build a formatted tech stack section for PRD.

    Args:
        tech_stack: Dictionary containing technology choices

    Returns:
        Formatted markdown string
    """
    if not tech_stack:
        return "To be determined"

    sections = []

    for category, technologies in tech_stack.items():
        if isinstance(technologies, dict):
            items = []
            for key, value in technologies.items():
                if value:
                    items.append(f"- **{key}:** {value}")
            if items:
                sections.append(f"### {category.title()}\n" + '\n'.join(items))
        elif isinstance(technologies, str):
            sections.append(f"- **{category}:** {technologies}")

    return '\n\n'.join(sections) if sections else "To be determined"


def extract_success_metrics(spec_data: Dict[str, Any]) -> List[Dict[str, str]]:
    """
    Extract success metrics from spec data.

    Args:
        spec_data: Dictionary containing spec information

    Returns:
        List of metric dictionaries
    """
    metrics = []

    metrics_data = spec_data.get('success_metrics', [])
    if not metrics_data:
        metrics_data = spec_data.get('metrics', [])
    if not metrics_data:
        metrics_data = spec_data.get('kpi', [])

    for metric in metrics_data:
        if isinstance(metric, dict):
            metrics.append({
                'name': metric.get('name', metric.get('metric', '')),
                'target': metric.get('target', metric.get('goal', '')),
                'measurement': metric.get('measurement', metric.get('how_to_measure', ''))
            })
        elif isinstance(metric, str):
            metrics.append({
                'name': metric,
                'target': 'To be defined',
                'measurement': 'To be defined'
            })

    return metrics


def generate_project_context(spec_data: Dict[str, Any]) -> Dict[str, str]:
    """
    Generate project context variables for template rendering.

    Args:
        spec_data: Dictionary containing spec information

    Returns:
        Dictionary of context variables
    """
    user_stories = extract_user_stories(spec_data)
    requirements = extract_requirements(spec_data)
    metrics = extract_success_metrics(spec_data)

    # Format user stories
    formatted_stories = []
    for story in user_stories:
        formatted_stories.append(
            f"- **As a** {story['role']}\n"
            f"- **I want** {story['action']}\n"
            f"- **So that** {story['benefit']}\n"
        )

    return {
        'PROJECT_NAME': spec_data.get('name', spec_data.get('title', 'Project Name')),
        'VERSION': spec_data.get('version', '1.0.0'),
        'DATE': datetime.now().strftime('%Y-%m-%d'),
        'STATUS': spec_data.get('status', 'Draft'),
        'PROJECT_DESCRIPTION': spec_data.get('description', spec_data.get('overview', '')),
        'VISION_STATEMENT': spec_data.get('vision', spec_data.get('mission', '')),
        'PROJECT_GOALS': spec_data.get('goals', spec_data.get('objectives', '')),
        'TARGET_AUDIENCE': spec_data.get('target_audience', spec_data.get('users', '')),
        'USER_STORIES': '\n\n'.join(formatted_stories) if formatted_stories else 'To be defined',
        'CORE_FEATURES': format_requirements_list(requirements['core']),
        'TECH_STACK': build_tech_stack_section(spec_data.get('tech_stack', {})),
        'KEY_METRICS': format_metrics_list(metrics),
        'SUCCESS_CRITERIA': format_success_criteria(spec_data.get('success_criteria', [])),
        'OUT_OF_SCOPE': spec_data.get('out_of_scope', spec_data.get('exclusions', '')),
        'OPEN_QUESTIONS': spec_data.get('open_questions', ''),
    }


def format_requirements_list(requirements: List[Dict[str, str]]) -> str:
    """Format requirements list into markdown."""
    if not requirements:
        return "To be defined"

    formatted = []
    for i, req in enumerate(requirements, 1):
        formatted.append(
            f"#### {i}. {req['title']}\n"
            f"- **Description:** {req['description']}\n"
            f"- **Priority:** {req['priority']}\n"
        )

    return '\n'.join(formatted)


def format_metrics_list(metrics: List[Dict[str, str]]) -> str:
    """Format metrics list into markdown."""
    if not metrics:
        return "To be defined"

    formatted = []
    for metric in metrics:
        formatted.append(
            f"- **{metric['name']}:** {metric['target']}\n"
            f"  - *Measurement:* {metric['measurement']}"
        )

    return '\n'.join(formatted)


def format_success_criteria(criteria: List[str]) -> str:
    """Format success criteria into markdown."""
    if not criteria:
        return "- [ ] To be defined"

    formatted = []
    for criterion in criteria:
        formatted.append(f"- [ ] {criterion}")

    return '\n'.join(formatted)


def load_spec_from_json(json_path: str) -> Dict[str, Any]:
    """
    Load spec data from JSON file.

    Args:
        json_path: Path to JSON file

    Returns:
        Dictionary containing spec data
    """
    try:
        with open(json_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        raise FileNotFoundError(f"Spec file not found: {json_path}")
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in spec file: {e}")


def load_spec_from_directory(spec_dir: str) -> Dict[str, Any]:
    """
    Load and merge spec data from directory containing spec files.

    Args:
        spec_dir: Path to directory containing spec.md or spec.json

    Returns:
        Dictionary containing merged spec data
    """
    import os

    spec_data = {}

    # Try JSON first
    json_path = os.path.join(spec_dir, 'spec.json')
    if os.path.exists(json_path):
        return load_spec_from_json(json_path)

    # Try parsing spec.md
    md_path = os.path.join(spec_dir, 'spec.md')
    if os.path.exists(md_path):
        return parse_spec_markdown(md_path)

    raise FileNotFoundError(f"No spec file found in {spec_dir}")


def parse_spec_markdown(md_path: str) -> Dict[str, Any]:
    """
    Parse spec data from markdown file.

    Args:
        md_path: Path to spec.md file

    Returns:
        Dictionary containing parsed spec data
    """
    spec_data = {
        'name': '',
        'description': '',
        'user_stories': [],
        'requirements': {},
        'tech_stack': {}
    }

    with open(md_path, 'r') as f:
        content = f.read()

    # Extract sections using regex
    sections = re.split(r'^#+\s+', content, flags=re.MULTILINE)

    for section in sections:
        if not section.strip():
            continue

        lines = section.strip().split('\n')
        title = lines[0].strip().lower().replace(' ', '_')
        content_lines = lines[1:] if len(lines) > 1 else []

        if 'overview' in title:
            spec_data['description'] = '\n'.join(content_lines)
        elif 'user_stor' in title:
            spec_data['user_stories'] = parse_user_stories_from_text(content)
        elif 'requirement' in title:
            spec_data['requirements'] = {'core': parse_requirements_from_text(content)}

    return spec_data


if __name__ == '__main__':
    # Test the helpers
    test_spec = {
        'name': 'Test Project',
        'description': 'A test project for PRD generation',
        'user_stories': [
            'As a user, I want to login, so that I can access my account',
            'As an admin, I want to manage users, so that I can control access'
        ],
        'tech_stack': {
            'frontend': {'framework': 'React', 'ui': 'Material-UI'},
            'backend': {'framework': 'Express', 'database': 'PostgreSQL'}
        }
    }

    context = generate_project_context(test_spec)
    print("Generated Context:")
    for key, value in context.items():
        print(f"{key}: {value[:50]}...")
