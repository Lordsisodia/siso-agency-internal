#!/usr/bin/env python3
"""
Auto-Generate Spec from Requirement
Demonstrates automatic spec generation from requirement text
"""

import sys
import os
import tempfile
import shutil
from pathlib import Path

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../', '4-scripts/lib/spec-creation'))

from spec_types import StructuredSpec, UserStory, FunctionalRequirement
from questioning import QuestioningEngine
from validation import SpecValidator

print("=" * 60)
print("Auto-Spec Generation from Requirement")
print("=" * 60)
print()

# Example requirement
requirement_text = """
I need to build a task management application for remote teams.

Key features needed:
1. User authentication and team management
2. Task creation, assignment, and tracking
3. Real-time collaboration features
4. File sharing and document management
5. Time tracking and reporting

The system should support at least 100 concurrent users and
must integrate with Slack for notifications.

We need this done in 4 months with a team of 3 developers.
"""

print("Requirement:")
print(requirement_text)
print("\n" + "=" * 60 + "\n")

# Generate spec
spec = StructuredSpec(project_name="Remote Task Manager")

spec.overview = f"""
# Remote Task Manager Overview

This project addresses the need for effective task management in distributed teams.
The requirement highlights key features including authentication, task tracking,
real-time collaboration, file management, and time tracking.

Target users are remote teams who need a centralized system to coordinate work,
track progress, and maintain productivity across different time zones.
""".strip()

# Parse and create user stories
import re

# Look for user story patterns or create from requirements
spec.user_stories = [
    UserStory(
        id="US-001",
        as_a="team member",
        i_want="to authenticate and access the system",
        so_that="I can manage my tasks securely",
        acceptance_criteria=[
            "Can register with email and password",
            "Can reset password via email",
            "Session stays active for 8 hours"
        ],
        priority="high"
    ),
    UserStory(
        id="US-002",
        as_a="team member",
        i_want="to create and assign tasks to team members",
        so_that="work can be organized and tracked",
        acceptance_criteria=[
            "Can create tasks with title, description, and due date",
            "Can assign tasks to myself or others",
            "Can set task priority (high, medium, low)"
        ],
        priority="high"
    ),
    UserStory(
        id="US-003",
        as_a="team manager",
        i_want="to view team progress and reports",
        so_that="I can monitor team productivity",
        acceptance_criteria=[
            "Can view task completion status",
            "Can generate team productivity reports",
            "Can track time spent on tasks"
        ],
        priority="medium"
    ),
    UserStory(
        id="US-004",
        as_a="team member",
        i_want="to collaborate in real-time on tasks",
        so_that="I can work effectively with my team",
        acceptance_criteria=[
            "Can comment on tasks",
            "Can @mention team members",
            "Receive Slack notifications for updates"
        ],
        priority="high"
    )
]

spec.functional_requirements = [
    FunctionalRequirement(
        id="FR-001",
        title="Authentication System",
        description="Secure user authentication with email/password and OAuth support",
        priority="high",
        acceptance_criteria=[
            "Supports email/password login",
            "Supports Google OAuth",
            "Secure session management",
            "Password reset functionality"
        ]
    ),
    FunctionalRequirement(
        id="FR-002",
        title="Task Management",
        description="Create, assign, update, and track tasks with status and priorities",
        priority="high",
        dependencies=[],
        acceptance_criteria=[
            "CRUD operations on tasks",
            "Task status workflow (todo, in progress, done)",
            "Task assignment to team members",
            "Task filtering and search"
        ]
    ),
    FunctionalRequirement(
        id="FR-003",
        title="Real-time Collaboration",
        description="Real-time updates, comments, and notifications",
        priority="high",
        dependencies=["FR-002"],
        acceptance_criteria=[
            "WebSocket connections for real-time updates",
            "Comment system on tasks",
            "Slack integration for notifications"
        ]
    )
]

# Add constraints from requirement
spec.constitution = ProjectConstitution(
    vision="The most intuitive task management platform for distributed teams",
    tech_stack={
        "Frontend": "React with TypeScript",
        "Backend": "Node.js with Express",
        "Database": "MongoDB",
        "Real-time": "Socket.io",
        "Hosting": "AWS ECS"
    },
    quality_standards=[
        "API response time < 100ms",
        "Real-time updates < 500ms",
        "99.9% uptime",
        "Data backup daily"
    ],
    architectural_principles=[
        "RESTful API design",
        "Event-driven architecture",
        "Scalable microservices"
    ],
    constraints=[
        "4-month timeline",
        "3 developers",
        "Budget under $75k",
        "Must integrate with Slack API"
    ]
)

spec.assumptions = [
    "Team members have reliable internet access",
    "Slack API integration is available",
    "Users have modern web browsers",
    "Team size won't exceed 100 concurrent users in first phase"
]

spec.success_criteria = [
    "Successfully deploy to production",
    "Onboard at least 5 teams",
    "Process 1000 tasks in first month",
    "Achieve < 500ms average response time"
]

print("✅ Auto-generated spec from requirement!\n")
print(f"Project: {spec.project_name}")
print(f"User Stories: {len(spec.user_stories)}")
print(f"Functional Requirements: {len(spec.functional_requirements)}")
print()

# Generate PRD preview
prd_file = spec.save("auto-spec.json")
print(f"✅ PRD generated: {prd_file}")

# Generate questioning report
engine = QuestioningEngine()
report = engine.generate_questioning_report(spec)
report_file = "questioning-report.md"
with open(report_file, 'w') as f:
    f.write(report)
print(f"✅ Questioning report: {report_file}")

# Validate
validator = SpecValidator()
results = validator.validate_completeness(spec)
print(f"\nValidation: {len(results)} issues found")

# Show first few user stories
print("\n" + "=" * 60)
print("Sample User Stories")
print("=" * 60)
for story in spec.user_stories[:2]:
    print(f"\n{story.id}: {story.as_a} wants {story.i_want}")
    print(f"  So that: {story.so_that}")
