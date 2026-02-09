# Questioning Workflow - Usage Examples

This document provides practical examples of using the questioning workflow system.

## Example 1: Starting a New Questioning Session

### Step 1: Create a Basic Spec

First, create a basic spec JSON file:

```json
{
  "project_name": "E-commerce Dashboard",
  "overview": "A dashboard for e-commerce store owners to track sales, inventory, and customer metrics.",
  "user_stories": [
    {
      "id": "US-001",
      "as_a": "store owner",
      "i_want": "to view daily sales metrics",
      "so_that": "I can make informed business decisions",
      "acceptance_criteria": [
        "Can view total sales for today",
        "Can see sales compared to yesterday"
      ],
      "priority": "high"
    }
  ],
  "functional_requirements": [
    {
      "id": "FR-001",
      "title": "Sales Metrics Display",
      "description": "Display sales metrics on dashboard",
      "priority": "high",
      "dependencies": [],
      "acceptance_tests": []
    }
  ],
  "constitution": null,
  "clarifications": [],
  "metadata": {},
  "created_at": "2025-01-15T10:00:00"
}
```

### Step 2: Start Questioning Session

```bash
cd /Users/shaansisodia/DEV/AI-HUB/Black Box Factory/current/.blackbox4

./questioning-workflow.sh start \
  --spec .plans/ecommerce-dashboard/spec.json \
  --type webapp
```

### Step 3: Interactive Session

```
╔════════════════════════════════════════════════════════════╗
║     Blackbox4 Questioning Workflow                        ║
║     Sequential Questioning for Spec Improvement           ║
╚════════════════════════════════════════════════════════════╝

Session started: abc123
Generated 25 questions

Available Commands:

  <your answer>    - Type your answer and press Enter
  s, skip          - Skip this question
  d, defer         - Defer this question for later
  p, progress      - Show current progress
  g, gaps          - Show identified gaps
  h, help          - Show this help message
  q, quit          - Save and exit

----------------------------------------------------------------------
Progress
  Answered:   0 / 25
  Skipped:    0 / 25
  Remaining:  25 / 25
  Completion: 0.0%
----------------------------------------------------------------------

Question 1 of 25
Priority: !!! HIGH
Area:     user_authentication
Category: user_authentication

What authentication methods are required (e.g., email/password, OAuth, SSO)?

Your answer (or command): We'll use email/password with JWT tokens, and plan to add Google OAuth in phase 2
```

## Example 2: Running Gap Analysis

```bash
# Analyze spec for gaps
./questioning-workflow.sh analyze --spec .plans/ecommerce-dashboard/spec.json

# Output:
# Gap Analysis for: E-commerce Dashboard
# Completeness Score: 35.0%
# Total Gaps: 8
#
# Gaps by Severity:
#   Critical: 2
#   High: 4
#   Medium: 2
#   Low: 0
#
# Gaps by Category:
#   Missing Content: 3
#   Insufficient Detail: 3
#   Testability Issue: 2
```

## Example 3: Programmatic Usage

```python
#!/usr/bin/env python3
import sys
sys.path.append('4-scripts/lib')

from spec_creation import StructuredSpec, UserStory, FunctionalRequirement
from questioning import QuestioningWorkflow, GapAnalyzer

# Create a spec
spec = StructuredSpec(
    project_name="Task Management App",
    overview="A simple task management application for teams"
)

# Add user story
spec.add_user_story(UserStory(
    id="US-001",
    as_a="team member",
    i_want="to create tasks",
    so_that="I can track my work",
    acceptance_criteria=[
        "Can create task with title and description",
        "Can assign task to team member"
    ],
    priority="high"
))

# Save spec
spec.save(".plans/task-app/spec.json")

# Analyze gaps
analyzer = GapAnalyzer()
analysis = analyzer.analyze(spec)

print(f"Completeness: {analysis['completeness_score']}%")
print(f"Total gaps: {analysis['total_gaps']}")

# Review critical gaps
for gap in analysis['prioritized_gaps']:
    if gap['severity'] == 'critical':
        print(f"\nCRITICAL: {gap['description']}")
        print(f"  Fix: {gap['recommendation']}")

# Start questioning workflow
workflow = QuestioningWorkflow()
session = workflow.start_session(".plans/task-app/spec.json", spec_type="webapp")

print(f"\nSession started: {session.session_id}")
print(f"Questions generated: {len(session.questions)}")
```

## Example 4: Continuing a Previous Session

```bash
# List all sessions
./questioning-workflow.sh list

# Output:
# Found 3 sessions:
#
#   abc123: in_progress
#     Spec: .plans/ecommerce-dashboard/spec.json
#     Progress: 40.0%
#
#   def456: completed
#     Spec: .plans/task-app/spec.json
#     Progress: 100.0%
#
#   ghi789: paused
#     Spec: .plans/api-service/spec.json
#     Progress: 25.0%

# Continue a session
./questioning-workflow.sh continue \
  --session abc123 \
  --spec .plans/ecommerce-dashboard/spec.json
```

## Example 5: Exporting Session Transcript

```bash
# Export transcript
./questioning-workflow.sh export \
  --session abc123 \
  --spec .plans/ecommerce-dashboard/spec.json \
  --output docs/questioning-session-abc123.md

# Output:
# Transcript exported to: docs/questioning-session-abc123.md
```

## Example 6: Using Different Strategies

### Web App Strategy
```bash
./questioning-workflow.sh start \
  --spec my-webapp/spec.json \
  --type webapp
```

Covers: authentication, UI, API integration, performance, security, deployment

### Mobile App Strategy
```bash
./questioning-workflow.sh start \
  --spec my-mobileapp/spec.json \
  --type mobile
```

Covers: platform support, device features, offline support, app distribution

### API Strategy
```bash
./questioning-workflow.sh start \
  --spec my-api/spec.json \
  --type api
```

Covers: API design, authentication, validation, error handling, documentation

### General Strategy
```bash
./questioning-workflow.sh start \
  --spec my-project/spec.json \
  --type general
```

Covers: project scope, requirements, constraints, success criteria, risks

## Example 7: Custom Questioning Strategy

```python
from question_strategies import QuestioningStrategy
from typing import List, Dict, Any
from spec_creation import StructuredSpec

class DataScienceProjectStrategy(QuestioningStrategy):
    """Custom strategy for data science projects."""

    def get_question_categories(self) -> List[str]:
        return [
            'data_sources',
            'data_processing',
            'model_training',
            'deployment',
            'monitoring'
        ]

    def generate_questions(self, spec: StructuredSpec) -> List[Dict[str, Any]]:
        return [
            {
                'question': 'What are the primary data sources?',
                'area': 'completeness',
                'priority': 'high',
                'category': 'data_sources',
                'context': {'section': 'overview'}
            },
            {
                'question': 'What data preprocessing steps are required?',
                'area': 'clarity',
                'priority': 'high',
                'category': 'data_processing',
                'context': {'section': 'functional_requirements'}
            },
            {
                'question': 'What machine learning models will be used?',
                'area': 'completeness',
                'priority': 'high',
                'category': 'model_training',
                'context': {'section': 'functional_requirements'}
            },
            {
                'question': 'How will the model be deployed and served?',
                'area': 'feasibility',
                'priority': 'high',
                'category': 'deployment',
                'context': {'section': 'constitution', 'key': 'tech_stack'}
            },
            {
                'question': 'How will model performance be monitored?',
                'area': 'completeness',
                'priority': 'medium',
                'category': 'monitoring',
                'context': {'section': 'functional_requirements'}
            }
        ]

# Use custom strategy
from questioning import QuestioningWorkflow

workflow = QuestioningWorkflow()
spec = StructuredSpec.load("my-data-science-project/spec.json")

# Generate questions using custom strategy
strategy = DataScienceProjectStrategy()
questions = strategy.generate_questions(spec)

print(f"Generated {len(questions)} questions for data science project")
```

## Example 8: Integration with Planning

```python
from questioning import QuestioningWorkflow, GapAnalyzer
from spec_creation import StructuredSpec

# Load spec
spec = StructuredSpec.load(".plans/my-project/spec.json")

# Analyze gaps
analyzer = GapAnalyzer()
analysis = analyzer.analyze(spec)

# Use gap analysis to inform planning
if analysis['completeness_score'] < 50:
    print("Spec is incomplete. Consider:")
    print("1. Running questioning session")
    print("2. Addressing critical gaps")
    print("3. Adding more user stories")

    # Start questioning workflow
    workflow = QuestioningWorkflow()
    session = workflow.start_session(".plans/my-project/spec.json")

    print(f"\nStarted session {session.session_id} to improve spec")
else:
    print("Spec is reasonably complete. Ready for planning phase.")
```

## Tips for Best Results

1. **Be Specific**: Provide detailed answers, not just "yes" or "no"
2. **Think Ahead**: Consider future requirements when answering
3. **Ask Why**: Understand the reasoning behind questions
4. **Document Decisions**: Use clarifications to capture decisions
5. **Iterate**: Run multiple sessions as spec evolves
6. **Review Gaps**: Check gap analysis before starting
7. **Use Right Strategy**: Match strategy to project type
8. **Save Progress**: Sessions auto-save, but export regularly

## Common Workflows

### Workflow 1: New Project Spec
```bash
# 1. Create basic spec
# 2. Run gap analysis
./questioning-workflow.sh analyze --spec spec.json

# 3. Start questioning session
./questioning-workflow.sh start --spec spec.json --type webapp

# 4. Export transcript
./questioning-workflow.sh export --session <id> --spec spec.json

# 5. Update spec with answers
# (done automatically during session)
```

### Workflow 2: Improve Existing Spec
```bash
# 1. Analyze current state
./questioning-workflow.sh analyze --spec spec.json

# 2. Start targeted questioning
./questioning-workflow.sh start --spec spec.json

# 3. Continue as needed
./questioning-workflow.sh continue --session <id> --spec spec.json

# 4. Export final transcript
./questioning-workflow.sh export --session <id> --spec spec.json
```

### Workflow 3: Team Collaboration
```bash
# 1. Team member A starts session
./questioning-workflow.sh start --spec spec.json

# 2. Export transcript for review
./questioning-workflow.sh export --session <id> --spec spec.json --output team-review.md

# 3. Team reviews transcript and adds more clarifications

# 4. Team member B continues session
./questioning-workflow.sh continue --session <id> --spec spec.json
```
