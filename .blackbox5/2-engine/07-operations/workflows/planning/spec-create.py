#!/usr/bin/env python3
"""
Structured Spec Creation Tool for Blackbox4
Based on GitHub Spec Kit specify workflow
"""

import sys
import os
import json
import argparse
from pathlib import Path
from datetime import datetime

# Add lib to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'lib', 'spec-creation'))

from spec_types import StructuredSpec, UserStory, FunctionalRequirement, ProjectConstitution
from questioning import QuestioningEngine


def create_spec_interactive(project_name: str) -> StructuredSpec:
    """Interactively create a structured spec."""
    print(f"📝 Creating spec for: {project_name}\n")
    
    spec = StructuredSpec(project_name=project_name)
    
    # Collect overview
    print("=== Project Overview ===")
    print("Enter a brief project overview (press Enter when done):\n")
    overview_lines = []
    while True:
        try:
            line = input("> ")
            if not line:
                break
            overview_lines.append(line)
        except EOFError:
            break
    spec.overview = "\n".join(overview_lines)
    
    # Collect user stories
    print("\n=== User Stories ===")
    print("Add user stories (format: As a <role>, I want <goal>, So that <benefit>)")
    print("Leave blank to finish\n")
    
    story_count = 0
    while True:
        story_count += 1
        print(f"\nUser Story #{story_count}:")
        
        role = input("As a: ").strip() or None
        if not role:
            break
        
        goal = input("I want: ").strip()
        benefit = input("So that: ").strip()
        
        story = UserStory(
            id=f"US-{story_count:03d}",
            as_a=role,
            i_want=goal,
            so_that=benefit
        )
        
        # Acceptance criteria
        print("\nAcceptance criteria (one per line, blank to finish):")
        criteria_count = 0
        while True:
            criteria = input(f"  AC{criteria_count + 1}: ").strip()
            if not criteria:
                break
            story.acceptance_criteria.append(criteria)
            criteria_count += 1
        
        spec.user_stories.append(story)
    
    # Ask about constitution
    print("\n=== Project Constitution ===")
    create_constitution = input("Create project constitution? (y/n): ").strip().lower() == 'y'
    
    if create_constitution:
        print("\nVision:")
        vision = input("> ").strip()
        
        print("\nTech Stack (key:value pairs, blank to finish):")
        tech_stack = {}
        while True:
            tech = input("  Technology: ").strip()
            if not tech:
                break
            choice = input("  Choice: ").strip()
            tech_stack[tech] = choice
        
        print("\nQuality Standards (one per line, blank to finish):")
        standards = []
        while True:
            standard = input("  Standard: ").strip()
            if not standard:
                break
            standards.append(standard)
        
        print("\nArchitectural Principles (one per line, blank to finish):")
        principles = []
        while True:
            principle = input("  Principle: ").strip()
            if not principle:
                break
            principles.append(principle)
        
        spec.constitution = ProjectConstitution(
            vision=vision,
            tech_stack=tech_stack,
            quality_standards=standards,
            architectural_principles=principles,
            constraints=[]
        )
    
    return spec


def generate_spec_from_requirement(requirement_text: str, project_name: str) -> StructuredSpec:
    """Generate a spec from requirement text using AI patterns."""
    spec = StructuredSpec(project_name=project_name)
    
    # Parse requirement (simplified - would use LLM in production)
    spec.overview = f"Project based on requirement: {requirement_text[:200]}..."
    
    # Extract user stories from requirement
    # Look for "As a... I want... So that..." pattern
    import re
    story_pattern = r'(?:As an?|I am a?)\s+([^,]+),?\s*I want\s+([^,.]+),?\s*(?:so that|to)\s+([^.]+)'
    matches = re.findall(story_pattern, requirement_text, re.IGNORECASE)
    
    for i, match in enumerate(matches, 1):
        story = UserStory(
            id=f"US-{i:03d}",
            as_a=match[0].strip(),
            i_want=match[1].strip(),
            so_that=match[2].strip()
        )
        spec.user_stories.append(story)
    
    # If no user stories found, create a generic one
    if not spec.user_stories:
        story = UserStory(
            id="US-001",
            as_a="user",
            i_want="the described functionality",
            so_that="I can achieve the project goals"
        )
        spec.user_stories.append(story)
    
    return spec


def main():
    parser = argparse.ArgumentParser(description='Structured Spec Creation')
    parser.add_argument('project', help='Project name')
    parser.add_argument('--interactive', '-i', action='store_true', help='Interactive spec creation')
    parser.add_argument('--requirement', '-r', help='Requirement text to convert to spec')
    parser.add_argument('--output', '-o', help='Output directory')
    parser.add_argument('--question', '-q', action='store_true', help='Run questioning workflow')
    parser.add_argument('--template', '-t', choices=['basic', 'full'], default='basic', help='Spec template')
    
    args = parser.parse_args()
    
    # Set output directory
    if args.output:
        output_dir = Path(args.output)
    else:
        # Create in .plans directory
        timestamp = datetime.now().strftime('%Y%m%d_%H%M')
        output_dir = Path(f".plans/{timestamp}_{args.project.lower().replace(' ', '_')}_spec")
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Create spec
    if args.interactive:
        spec = create_spec_interactive(args.project)
    elif args.requirement:
        spec = generate_spec_from_requirement(args.requirement, args.project)
    else:
        # Load from template or create basic
        spec = StructuredSpec(project_name=args.project)
        spec.overview = f"Specification for {args.project}"
    
    # Run questioning workflow if requested
    if args.question:
        print("\n🔍 Running Questioning Workflow...\n")
        engine = QuestioningEngine()
        report = engine.generate_questioning_report(spec)
        
        # Save questioning report
        report_file = output_dir / "questioning-report.md"
        with open(report_file, 'w') as f:
            f.write(report)
        
        print(f"Questioning report saved to: {report_file}")
        
        # Ask if user wants to add clarifications
        print("\nWould you like to add clarifications to address the gaps? (y/n)")
        try:
            if input().strip().lower() == 'y':
                print("\nAdd clarifications (Q: <question>, A: <answer>, blank to finish):")
                while True:
                    q = input("Q: ").strip()
                    if not q:
                        break
                    a = input("A: ").strip()
                    spec.clarifications.append({'question': q, 'answer': a})
        except EOFError:
            pass
    
    # Save spec
    spec_file = output_dir / f"{args.project.lower().replace(' ', '_')}-spec.json"
    prd_file = spec.save(str(spec_file))
    
    print(f"\n✅ Specification created!")
    print(f"   PRD: {prd_file}")
    print(f"   JSON: {spec_file}")
    print(f"   Directory: {output_dir}")


if __name__ == '__main__':
    main()
