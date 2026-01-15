#!/usr/bin/env python3
"""
Cross-Artifact Validator for Blackbox4
Validates consistency and traceability across multiple documents
"""

import sys
import os
import re
import json
from pathlib import Path
from typing import List, Dict, Any, Optional, Set, Tuple
from dataclasses import dataclass, field

# Add lib to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'lib', 'spec-creation'))

from spec_types import StructuredSpec


@dataclass
class CrossArtifactIssue:
    """Represents a cross-artifact validation issue."""
    level: str  # 'critical', 'warning', 'info'
    source_artifact: str  # 'prd', 'architecture', 'plan', etc.
    target_artifact: str
    message: str
    suggestion: str = ""
    source_id: str = ""
    target_id: str = ""


@dataclass
class TraceabilityLink:
    """Represents a traceability link between artifacts."""
    source_type: str
    source_id: str
    target_type: str
    target_id: str
    link_type: str  # 'implements', 'derives_from', 'depends_on', etc.


class CrossArtifactValidator:
    """Validates consistency and traceability across project artifacts."""

    def __init__(self):
        self.artifacts: Dict[str, Dict[str, Any]] = {}
        self.issues: List[CrossArtifactIssue] = []
        self.traceability_links: List[TraceabilityLink] = []

    def load_artifact(self, artifact_type: str, artifact_path: str) -> None:
        """
        Load an artifact for validation.
        artifact_type: 'prd', 'architecture', 'plan', 'stories', etc.
        """
        path = Path(artifact_path)
        if not path.exists():
            self.issues.append(CrossArtifactIssue(
                level='critical',
                source_artifact='system',
                target_artifact=artifact_type,
                message=f'Artifact file not found: {artifact_path}',
                suggestion='Check file path and ensure artifact exists'
            ))
            return

        # Load based on file type
        if path.suffix == '.json':
            with open(path, 'r') as f:
                self.artifacts[artifact_type] = json.load(f)
        elif path.suffix in ['.md', '.txt']:
            with open(path, 'r') as f:
                self.artifacts[artifact_type] = {'content': f.read(), 'format': 'markdown'}
        else:
            with open(path, 'r') as f:
                self.artifacts[artifact_type] = {'raw': f.read()}

    def validate_prd_vs_stories(self, prd_path: str = None, stories_path: str = None) -> List[CrossArtifactIssue]:
        """
        Validate that PRD requirements match user stories.
        Each PRD requirement should be traceable to one or more user stories.
        """
        issues = []

        # Use loaded artifacts or load from paths
        if prd_path and 'prd' not in self.artifacts:
            self.load_artifact('prd', prd_path)
        if stories_path and 'stories' not in self.artifacts:
            self.load_artifact('stories', stories_path)

        if 'prd' not in self.artifacts:
            issues.append(CrossArtifactIssue(
                level='critical',
                source_artifact='system',
                target_artifact='prd',
                message='PRD artifact not loaded',
                suggestion='Load PRD using load_artifact() or provide prd_path'
            ))
            return issues

        if 'stories' not in self.artifacts:
            issues.append(CrossArtifactIssue(
                level='warning',
                source_artifact='system',
                target_artifact='stories',
                message='Stories artifact not loaded',
                suggestion='Load stories using load_artifact() or provide stories_path'
            ))
            return issues

        prd = self.artifacts['prd']
        stories = self.artifacts['stories']

        # Extract requirements from PRD
        prd_requirements = self._extract_requirements_from_prd(prd)

        # Extract user stories
        user_stories = self._extract_user_stories_from_artifact(stories)

        # Check for traceability
        for req in prd_requirements:
            req_id = req.get('id', 'unknown')
            req_text = req.get('text', '').lower()

            # Find stories that implement this requirement
            implementing_stories = []
            for story in user_stories:
                story_text = f"{story.get('as_a', '')} {story.get('i_want', '')} {story.get('so_that', '')}".lower()
                # Check if story references requirement
                if req_id.lower() in story_text or req.get('id', '').lower() in story.get('id', '').lower():
                    implementing_stories.append(story.get('id', 'unknown'))

            if not implementing_stories:
                issues.append(CrossArtifactIssue(
                    level='warning',
                    source_artifact='prd',
                    target_artifact='stories',
                    message=f'PRD requirement {req_id} has no implementing user story',
                    suggestion=f'Add a user story that implements requirement {req_id}',
                    source_id=req_id
                ))
            else:
                # Add traceability link
                for story_id in implementing_stories:
                    self.traceability_links.append(TraceabilityLink(
                        source_type='prd',
                        source_id=req_id,
                        target_type='story',
                        target_id=story_id,
                        link_type='implements'
                    ))

        # Check for orphan stories (not traceable to any requirement)
        for story in user_stories:
            story_id = story.get('id', 'unknown')
            is_traceable = any(link.source_id == story_id for link in self.traceability_links)

            if not is_traceable:
                issues.append(CrossArtifactIssue(
                    level='info',
                    source_artifact='stories',
                    target_artifact='prd',
                    message=f'User story {story_id} not traceable to any PRD requirement',
                    suggestion='Ensure story derives from a requirement or add explicit traceability',
                    source_id=story_id
                ))

        return issues

    def validate_requirements_vs_architecture(self, req_path: str = None, arch_path: str = None) -> List[CrossArtifactIssue]:
        """
        Validate that requirements are addressed in architecture.
        Each functional requirement should map to architecture components.
        """
        issues = []

        if req_path and 'requirements' not in self.artifacts:
            self.load_artifact('requirements', req_path)
        if arch_path and 'architecture' not in self.artifacts:
            self.load_artifact('architecture', arch_path)

        if 'requirements' not in self.artifacts or 'architecture' not in self.artifacts:
            issues.append(CrossArtifactIssue(
                level='warning',
                source_artifact='system',
                target_artifact='architecture',
                message='Missing requirements or architecture artifact',
                suggestion='Load both requirements and architecture artifacts'
            ))
            return issues

        requirements = self.artifacts['requirements']
        architecture = self.artifacts['architecture']

        # Extract requirements
        req_list = self._extract_requirements_from_prd(requirements)

        # Extract architecture components
        components = self._extract_components_from_architecture(architecture)

        # Check traceability
        for req in req_list:
            req_id = req.get('id', 'unknown')
            req_text = req.get('text', '').lower()

            # Find components that address this requirement
            addressing_components = []
            for comp in components:
                comp_text = f"{comp.get('name', '')} {comp.get('description', '')}".lower()
                if req_id.lower() in comp_text or any(word in comp_text for word in req_text.split()[:3]):
                    addressing_components.append(comp.get('name', 'unknown'))

            if not addressing_components:
                issues.append(CrossArtifactIssue(
                    level='warning',
                    source_artifact='requirements',
                    target_artifact='architecture',
                    message=f'Requirement {req_id} not addressed in architecture',
                    suggestion=f'Ensure architecture includes components to satisfy {req_id}',
                    source_id=req_id
                ))
            else:
                # Add traceability link
                for comp_name in addressing_components:
                    self.traceability_links.append(TraceabilityLink(
                        source_type='requirement',
                        source_id=req_id,
                        target_type='component',
                        target_id=comp_name,
                        link_type='addressed_by'
                    ))

        return issues

    def validate_plan_vs_requirements(self, plan_path: str = None, req_path: str = None) -> List[CrossArtifactIssue]:
        """
        Validate that implementation plan covers all requirements.
        Each requirement should be addressed in the plan.
        """
        issues = []

        if plan_path and 'plan' not in self.artifacts:
            self.load_artifact('plan', plan_path)
        if req_path and 'requirements' not in self.artifacts:
            self.load_artifact('requirements', req_path)

        if 'plan' not in self.artifacts or 'requirements' not in self.artifacts:
            issues.append(CrossArtifactIssue(
                level='warning',
                source_artifact='system',
                target_artifact='plan',
                message='Missing plan or requirements artifact',
                suggestion='Load both plan and requirements artifacts'
            ))
            return issues

        plan = self.artifacts['plan']
        requirements = self.artifacts['requirements']

        # Extract requirements
        req_list = self._extract_requirements_from_prd(requirements)

        # Extract plan tasks
        tasks = self._extract_tasks_from_plan(plan)

        # Check coverage
        for req in req_list:
            req_id = req.get('id', 'unknown')
            req_text = req.get('text', '').lower()

            # Find tasks that implement this requirement
            implementing_tasks = []
            for task in tasks:
                task_text = f"{task.get('title', '')} {task.get('description', '')}".lower()
                if req_id.lower() in task_text or any(word in task_text for word in req_text.split()[:3]):
                    implementing_tasks.append(task.get('id', 'unknown'))

            if not implementing_tasks:
                issues.append(CrossArtifactIssue(
                    level='critical',
                    source_artifact='requirements',
                    target_artifact='plan',
                    message=f'Requirement {req_id} not covered in implementation plan',
                    suggestion=f'Add plan tasks to implement requirement {req_id}',
                    source_id=req_id
                ))
            else:
                # Add traceability link
                for task_id in implementing_tasks:
                    self.traceability_links.append(TraceabilityLink(
                        source_type='requirement',
                        source_id=req_id,
                        target_type='task',
                        target_id=task_id,
                        link_type='implemented_by'
                    ))

        # Check for orphan tasks (not traceable to any requirement)
        for task in tasks:
            task_id = task.get('id', 'unknown')
            is_traceable = any(link.target_id == task_id for link in self.traceability_links if link.link_type == 'implemented_by')

            if not is_traceable:
                issues.append(CrossArtifactIssue(
                    level='info',
                    source_artifact='plan',
                    target_artifact='requirements',
                    message=f'Task {task_id} not traceable to any requirement',
                    suggestion='Ensure task derives from a requirement or mark as infrastructure/enabling',
                    source_id=task_id
                ))

        return issues

    def validate_traceability(self) -> List[CrossArtifactIssue]:
        """
        Validate end-to-end traceability across all artifacts.
        Ensures dependencies are properly tracked and traceable.
        """
        issues = []

        if not self.traceability_links:
            issues.append(CrossArtifactIssue(
                level='warning',
                source_artifact='system',
                target_artifact='traceability',
                message='No traceability links found',
                suggestion='Run individual validation checks first to establish traceability'
            ))
            return issues

        # Check for broken chains
        story_ids = set(link.target_id for link in self.traceability_links if link.target_type == 'story')
        requirement_ids = set(link.source_id for link in self.traceability_links if link.source_type == 'prd')
        task_ids = set(link.target_id for link in self.traceability_links if link.target_type == 'task')

        # Stories should trace to requirements
        for story_id in story_ids:
            has_trace = any(link.target_id == story_id for link in self.traceability_links if link.source_type == 'prd')
            if not has_trace:
                issues.append(CrossArtifactIssue(
                    level='info',
                    source_artifact='traceability',
                    target_artifact='stories',
                    message=f'Story {story_id} has incomplete traceability chain',
                    suggestion='Ensure story traces back to a PRD requirement',
                    source_id=story_id
                ))

        # Tasks should trace to requirements
        for task_id in task_ids:
            has_trace = any(link.target_id == task_id for link in self.traceability_links if link.source_type == 'requirement')
            if not has_trace:
                issues.append(CrossArtifactIssue(
                    level='warning',
                    source_artifact='traceability',
                    target_artifact='plan',
                    message=f'Task {task_id} not traceable to requirement',
                    suggestion='Link task to implementing requirement',
                    source_id=task_id
                ))

        return issues

    def validate_all(self, artifacts_dir: str = None) -> List[CrossArtifactIssue]:
        """
        Run all cross-artifact validations.
        """
        all_issues = []

        if artifacts_dir:
            # Auto-discover artifacts
            base_path = Path(artifacts_dir)
            prd_path = base_path / 'prd.json' if (base_path / 'prd.json').exists() else None
            stories_path = base_path / 'stories.json' if (base_path / 'stories.json').exists() else None
            arch_path = base_path / 'architecture.json' if (base_path / 'architecture.json').exists() else None
            plan_path = base_path / 'plan.json' if (base_path / 'plan.json').exists() else None

            # Run validations
            all_issues.extend(self.validate_prd_vs_stories(prd_path, stories_path))
            all_issues.extend(self.validate_requirements_vs_architecture(stories_path, arch_path))
            all_issues.extend(self.validate_plan_vs_requirements(plan_path, stories_path))
            all_issues.extend(self.validate_traceability())

        self.issues.extend(all_issues)
        return all_issues

    def get_traceability_matrix(self) -> Dict[str, Any]:
        """
        Generate a traceability matrix showing relationships between artifacts.
        """
        matrix = {
            'prd_to_stories': {},
            'requirements_to_components': {},
            'requirements_to_tasks': {}
        }

        for link in self.traceability_links:
            if link.link_type == 'implements':
                if link.source_id not in matrix['prd_to_stories']:
                    matrix['prd_to_stories'][link.source_id] = []
                matrix['prd_to_stories'][link.source_id].append(link.target_id)

            elif link.link_type == 'addressed_by':
                if link.source_id not in matrix['requirements_to_components']:
                    matrix['requirements_to_components'][link.source_id] = []
                matrix['requirements_to_components'][link.source_id].append(link.target_id)

            elif link.link_type == 'implemented_by':
                if link.source_id not in matrix['requirements_to_tasks']:
                    matrix['requirements_to_tasks'][link.source_id] = []
                matrix['requirements_to_tasks'][link.source_id].append(link.target_id)

        return matrix

    # Helper methods

    def _extract_requirements_from_prd(self, prd: Dict[str, Any]) -> List[Dict[str, str]]:
        """Extract requirements from PRD artifact."""
        requirements = []

        # Handle JSON spec format
        if 'functional_requirements' in prd:
            for req in prd['functional_requirements']:
                requirements.append({
                    'id': req.get('id', 'unknown'),
                    'text': req.get('requirement', ''),
                    'priority': req.get('priority', 'medium')
                })

        # Handle markdown format
        elif 'content' in prd:
            # Extract requirements from markdown
            content = prd['content']
            pattern = r'(?:^|\n)#{1,3}\s*(?:Requirement|FR)\s*:?\s*(\d+(?:\.\d+)*)[:\s]*([^\n]+)'
            matches = re.findall(pattern, content, re.MULTILINE)
            for match in matches:
                requirements.append({
                    'id': f'FR-{match[0]}',
                    'text': match[1].strip(),
                    'priority': 'medium'
                })

        return requirements

    def _extract_user_stories_from_artifact(self, artifact: Dict[str, Any]) -> List[Dict[str, str]]:
        """Extract user stories from artifact."""
        stories = []

        # Handle JSON spec format
        if 'user_stories' in artifact:
            for story in artifact['user_stories']:
                stories.append({
                    'id': story.get('id', 'unknown'),
                    'as_a': story.get('as_a', ''),
                    'i_want': story.get('i_want', ''),
                    'so_that': story.get('so_that', ''),
                    'acceptance_criteria': story.get('acceptance_criteria', [])
                })

        # Handle markdown format
        elif 'content' in artifact:
            content = artifact['content']
            # Extract stories from markdown
            pattern = r'(?:As an?\s+([^,\n]+),?\s*I want\s+([^,\n]+),?\s*(?:so that|to)\s+([^\n]+))'
            matches = re.findall(pattern, content, re.IGNORECASE)
            for i, match in enumerate(matches, 1):
                stories.append({
                    'id': f'US-{i:03d}',
                    'as_a': match[0].strip(),
                    'i_want': match[1].strip(),
                    'so_that': match[2].strip(),
                    'acceptance_criteria': []
                })

        return stories

    def _extract_components_from_architecture(self, arch: Dict[str, Any]) -> List[Dict[str, str]]:
        """Extract components from architecture artifact."""
        components = []

        # Handle JSON format
        if 'components' in arch:
            for comp in arch['components']:
                components.append({
                    'name': comp.get('name', 'unknown'),
                    'description': comp.get('description', ''),
                    'responsibilities': comp.get('responsibilities', [])
                })

        # Handle markdown format
        elif 'content' in arch:
            content = arch['content']
            # Extract component sections
            pattern = r'#{3,4}\s*Component\s*:?\s*([^\n]+)\n+(.*?)(?=\n#{3,4}|\Z)'
            matches = re.findall(pattern, content, re.MULTILINE | re.DOTALL)
            for match in matches:
                components.append({
                    'name': match[0].strip(),
                    'description': match[1].strip()[:200],
                    'responsibilities': []
                })

        return components

    def _extract_tasks_from_plan(self, plan: Dict[str, Any]) -> List[Dict[str, str]]:
        """Extract tasks from plan artifact."""
        tasks = []

        # Handle JSON format
        if 'tasks' in plan:
            for task in plan['tasks']:
                tasks.append({
                    'id': task.get('id', 'unknown'),
                    'title': task.get('title', ''),
                    'description': task.get('description', ''),
                    'status': task.get('status', 'pending')
                })

        # Handle markdown format
        elif 'content' in plan:
            content = plan['content']
            # Extract task items
            pattern = r'-\s*\[([ x])\]\s*(?:Task\s+)?(\d+(?:\.\d+)*)[:\s]*([^\n]+)'
            matches = re.findall(pattern, content, re.MULTILINE)
            for match in matches:
                tasks.append({
                    'id': f'T-{match[1]}',
                    'title': match[2].strip(),
                    'description': '',
                    'status': 'done' if match[0].lower() == 'x' else 'pending'
                })

        return tasks


def main():
    """Command-line interface for cross-artifact validation."""
    import argparse

    parser = argparse.ArgumentParser(description='Cross-Artifact Validator')
    parser.add_argument('--artifacts-dir', '-a', help='Directory containing all artifacts')
    parser.add_argument('--prd', help='Path to PRD file')
    parser.add_argument('--stories', '-s', help='Path to user stories file')
    parser.add_argument('--architecture', help='Path to architecture file')
    parser.add_argument('--plan', '-p', help='Path to implementation plan file')
    parser.add_argument('--validate', choices=['prd-stories', 'req-arch', 'plan-req', 'trace', 'all'],
                       default='all', help='Validation to run')
    parser.add_argument('--output', '-o', help='Output file for report')

    args = parser.parse_args()

    validator = CrossArtifactValidator()

    # Run requested validation
    if args.validate == 'all':
        issues = validator.validate_all(args.artifacts_dir)
    elif args.validate == 'prd-stories':
        issues = validator.validate_prd_vs_stories(args.prd, args.stories)
    elif args.validate == 'req-arch':
        issues = validator.validate_requirements_vs_architecture(args.stories, args.architecture)
    elif args.validate == 'plan-req':
        issues = validator.validate_plan_vs_requirements(args.plan, args.stories)
    elif args.validate == 'trace':
        issues = validator.validate_traceability()

    # Generate report
    report = f"""
Cross-Artifact Validation Report
{'=' * 60}

Total Issues: {len(issues)}
  Critical: {len([i for i in issues if i.level == 'critical'])}
  Warnings: {len([i for i in issues if i.level == 'warning'])}
  Info: {len([i for i in issues if i.level == 'info'])}

Traceability Links: {len(validator.traceability_links)}

Issues:
"""
    for issue in issues:
        report += f"\n  [{issue.level.upper()}] {issue.source_artifact} -> {issue.target_artifact}\n"
        report += f"    {issue.message}\n"
        if issue.suggestion:
            report += f"    Suggestion: {issue.suggestion}\n"

    # Add traceability matrix if available
    if validator.traceability_links:
        matrix = validator.get_traceability_matrix()
        report += "\n\nTraceability Matrix:\n"
        for source, targets in matrix['prd_to_stories'].items():
            report += f"  {source} -> Stories: {', '.join(targets)}\n"

    # Output report
    if args.output:
        with open(args.output, 'w') as f:
            f.write(report)
        print(f"Report saved to: {args.output}")
    else:
        print(report)

    # Exit with appropriate code
    critical_count = len([i for i in issues if i.level == 'critical'])
    sys.exit(0 if critical_count == 0 else 1)


if __name__ == '__main__':
    main()
