# Questioning Workflow for Blackbox4 Phase 3

A comprehensive sequential questioning system to identify gaps, clarify ambiguities, and improve specification quality through interactive dialog.

## Overview

The questioning workflow provides an interactive system for systematically improving specifications by:

- **Gap Analysis**: Automatically identifying missing or incomplete information
- **Strategic Questioning**: Tailored questions based on spec type (webapp, mobile, API, general)
- **Interactive Sessions**: User-friendly CLI for guided questioning
- **Progress Tracking**: Session state management with save/resume capabilities
- **Transcript Export**: Generate detailed Q&A transcripts for documentation

## Features

### 1. Questioning Strategies

Different spec types require different questioning approaches:

#### WebAppQuestioningStrategy
For web applications, covers:
- User authentication & authorization
- Data management & persistence
- UI/UX requirements
- API integrations
- Performance targets
- Security & compliance
- Deployment & scaling

#### MobileAppQuestioningStrategy
For mobile apps, covers:
- Platform support (iOS, Android, cross-platform)
- Device features & permissions
- Offline support
- App distribution
- Mobile-specific UX patterns

#### APIQuestioningStrategy
For API services, covers:
- API design (REST, GraphQL, gRPC)
- Authentication & authorization
- Data validation & serialization
- Error handling
- Rate limiting
- API documentation

#### GeneralQuestioningStrategy
Default/fallback strategy, covers:
- Project scope & boundaries
- Requirements prioritization
- Constraints & limitations
- Success criteria
- Risk assessment
- Timeline & milestones

### 2. Gap Analysis

The `GapAnalyzer` class identifies:

- **Missing Content**: Sections that are absent
- **Insufficient Detail**: Areas needing more information
- **Inconsistencies**: Contradictory requirements
- **Ambiguities**: Vague or unclear language
- **Feasibility Concerns**: Potential implementation issues
- **Testability Issues**: Requirements that can't be verified

#### Completeness Scoring

Calculates a 0-100 completeness score based on:
- Overview quality (20 points)
- User story coverage (25 points)
- Functional requirement detail (25 points)
- Constitution completeness (15 points)
- Clarification documentation (15 points)

### 3. Interactive CLI

Features a user-friendly terminal interface with:
- Color-coded output for better readability
- Progress tracking (answered, skipped, remaining)
- Context display for each question
- Keyboard shortcuts for common actions
- Session state persistence
- Help system

## Installation

Located at: `.blackbox4/4-scripts/questioning/`

## Usage

### Starting a Questioning Session

```bash
# Using the wrapper script (recommended)
cd .blackbox4
./questioning-workflow.sh start --spec .plans/my-project/spec.json

# Or directly with Python
python 4-scripts/questioning/interactive_questions.py start \
  --spec .plans/my-project/spec.json \
  --type webapp
```

### Continuing a Session

```bash
# Resume a previous session
./questioning-workflow.sh continue \
  --session abc123 \
  --spec .plans/my-project/spec.json

# Or with Python
python 4-scripts/questioning/interactive_questions.py continue \
  --session abc123 \
  --spec .plans/my-project/spec.json
```

### Listing Sessions

```bash
# List all questioning sessions
./questioning-workflow.sh list

# Or with Python
python 4-scripts/questioning/questioning_workflow.py list
```

### Exporting Transcripts

```bash
# Export session transcript
./questioning-workflow.sh export \
  --session abc123 \
  --spec .plans/my-project/spec.json \
  --output transcript.md

# Or with Python
python 4-scripts/questioning/questioning_workflow.py export \
  --session abc123 \
  --spec .plans/my-project/spec.json \
  --output transcript.md
```

### Running Gap Analysis

```bash
# Analyze spec for gaps
python 4-scripts/questioning/gap_analysis.py \
  .plans/my-project/spec.json

# Save analysis to JSON
python 4-scripts/questioning/gap_analysis.py \
  .plans/my-project/spec.json \
  --output gap-analysis.json

# Generate suggested questions
python 4-scripts/questioning/gap_analysis.py \
  .plans/my-project/spec.json \
  --questions
```

## Interactive Commands

During an interactive session, you can use:

| Command | Alias | Description |
|---------|-------|-------------|
| `<your answer>` | - | Type your answer and press Enter |
| `skip` | `s` | Skip the current question |
| `defer` | `d` | Defer the current question for later |
| `progress` | `p` | Show current progress |
| `gaps` | `g` | Show identified gaps |
| `help` | `h` | Show help message |
| `quit` | `q` | Save and exit |

## File Structure

```
questioning/
├── questioning_workflow.py      # Main workflow orchestrator
├── question_strategies.py       # Questioning strategies by spec type
├── gap_analysis.py              # Gap identification and analysis
├── interactive_questions.py     # Interactive CLI
├── README.md                    # This file
├── questioning-workflow.sh      # Wrapper script (at parent level)
└── sessions/                    # Session state files
    ├── abc123.json
    └── def456.json
```

## API Reference

### QuestioningWorkflow

Main orchestrator for questioning sessions.

```python
from questioning_workflow import QuestioningWorkflow

workflow = QuestioningWorkflow()

# Start a new session
session = workflow.start_session(
    spec_path='spec.json',
    spec_type='webapp',
    strategy='default'
)

# Get next question
question = workflow.next_question()

# Record answer
workflow.record_answer('User answer')

# Skip question
workflow.skip_question('Reason for skipping')

# Get gaps
gaps = workflow.get_gaps()

# Update spec with answers
workflow.update_spec()

# Export transcript
workflow.export_transcript('transcript.md')

# List all sessions
sessions = workflow.list_sessions()
```

### QuestioningSession

Represents a questioning session.

```python
from questioning_workflow import QuestioningSession, SessionStatus

# Create session
session = QuestioningSession(
    session_id='abc123',
    spec_path='spec.json',
    spec=spec,
    status=SessionStatus.CREATED
)

# Get current question
question = session.get_current_question()

# Answer current question
session.answer_current_question('Answer')

# Skip current question
session.skip_current_question('Reason')

# Get progress
progress = session.get_progress()
# Returns: {'total': 10, 'answered': 5, 'skipped': 1, 'remaining': 4, 'percentage': 50.0}

# Save session
session.save('sessions/abc123.json')

# Load session
session = QuestioningSession.load('sessions/abc123.json', spec)
```

### GapAnalyzer

Analyzes specs for gaps and missing information.

```python
from gap_analysis import GapAnalyzer

analyzer = GapAnalyzer()

# Analyze completeness
score = analyzer.analyze_completeness(spec)
# Returns: 75.5 (percentage)

# Identify missing sections
gaps = analyzer.identify_missing_sections(spec)

# Identify detail gaps
gaps = analyzer.identify_detail_gaps(spec)

# Prioritize gaps
prioritized = analyzer.prioritize_gaps(gaps)

# Suggest questions
questions = analyzer.suggest_questions(gaps)

# Full analysis
analysis = analyzer.analyze(spec)
# Returns: {
#   'completeness_score': 75.5,
#   'total_gaps': 12,
#   'gaps_by_severity': {...},
#   'gaps_by_category': {...},
#   'prioritized_gaps': [...],
#   'suggested_questions': [...]
# }
```

### Questioning Strategies

```python
from question_strategies import (
    WebAppQuestioningStrategy,
    MobileAppQuestioningStrategy,
    APIQuestioningStrategy,
    GeneralQuestioningStrategy,
    get_strategy
)

# Get strategy for spec type
strategy_cls = get_strategy('webapp')
strategy = strategy_cls()

# Get categories
categories = strategy.get_question_categories()

# Generate questions
questions = strategy.generate_questions(spec)
```

## Session State Format

Sessions are saved as JSON in the `sessions/` directory:

```json
{
  "session_id": "abc123",
  "spec_path": ".plans/my-project/spec.json",
  "status": "in_progress",
  "questions": [
    {
      "id": "q1",
      "text": "What authentication methods are required?",
      "area": "completeness",
      "priority": "high",
      "category": "user_authentication",
      "context": {},
      "dependencies": [],
      "answered": true,
      "answer": "Email/password and OAuth",
      "skipped": false,
      "skip_reason": null,
      "timestamp": "2025-01-15T10:30:00"
    }
  ],
  "current_question_index": 5,
  "created_at": "2025-01-15T10:00:00",
  "updated_at": "2025-01-15T10:35:00",
  "metadata": {
    "spec_type": "webapp",
    "strategy": "default"
  },
  "progress": {
    "total": 20,
    "answered": 5,
    "skipped": 0,
    "remaining": 15,
    "percentage": 25.0
  }
}
```

## Examples

### Example 1: Web App Spec Questioning

```bash
# Start questioning session for a web app
./questioning-workflow.sh start \
  --spec .plans/ecommerce/spec.json \
  --type webapp

# Output:
# Session started: abc123
# Generated 25 questions
#
# Question 1 of 25
# Priority: !!! HIGH
# Area:     user_authentication
# Category: user_authentication
#
# What authentication methods are required (e.g., email/password, OAuth, SSO)?
#
# Your answer (or command): We'll use email/password for now, with OAuth (Google, GitHub) planned for v2
#
# Answer recorded.
```

### Example 2: Gap Analysis

```python
from gap_analysis import GapAnalyzer
from spec_creation import StructuredSpec

# Load spec
spec = StructuredSpec.load('.plans/my-project/spec.json')

# Analyze gaps
analyzer = GapAnalyzer()
analysis = analyzer.analyze(spec)

print(f"Completeness: {analysis['completeness_score']}%")
print(f"Total gaps: {analysis['total_gaps']}")
print(f"Critical gaps: {analysis['gaps_by_severity']['critical']}")

# Review gaps
for gap in analysis['prioritized_gaps']:
    if gap['severity'] == 'critical':
        print(f"CRITICAL: {gap['description']}")
        print(f"  Recommendation: {gap['recommendation']}")
```

### Example 3: Custom Questioning Strategy

```python
from question_strategies import QuestioningStrategy
from typing import List, Dict, Any

class CustomStrategy(QuestioningStrategy):
    """Custom questioning strategy for specific use case."""

    def get_question_categories(self) -> List[str]:
        return ['custom_category_1', 'custom_category_2']

    def generate_questions(self, spec) -> List[Dict[str, Any]]:
        return [
            {
                'question': 'Custom question 1?',
                'area': 'completeness',
                'priority': 'high',
                'category': 'custom_category_1',
                'context': {}
            }
        ]

# Use custom strategy
strategy = CustomStrategy()
questions = strategy.generate_questions(spec)
```

## Integration with Blackbox4

The questioning workflow integrates with:

- **Spec Creation**: Uses `StructuredSpec` from spec-creation library
- **Context Variables**: Can access Phase 1 context variables
- **Planning Module**: Gap-informed planning decisions
- **Documentation**: Transcripts become part of project docs
- **Validation**: Cross-check with domain rules

## Best Practices

1. **Start Early**: Begin questioning as soon as you have a basic spec draft
2. **Be Specific**: Provide detailed answers, not just "yes" or "no"
3. **Use Strategies**: Choose the right strategy for your spec type
4. **Review Gaps**: Check gap analysis before starting questioning
5. **Save Often**: Sessions auto-save, but export transcripts regularly
6. **Iterate**: Run multiple questioning sessions as spec evolves
7. **Track Progress**: Monitor completeness score over time
8. **Document Decisions**: Use clarifications to capture decisions

## Troubleshooting

### Session won't load
- Verify spec file exists at the stored path
- Check session file isn't corrupted
- Ensure spec-creation library is available

### No questions generated
- Spec may already be complete (check gap analysis)
- Try a different questioning strategy
- Verify spec type matches actual project

### Completeness score seems wrong
- Adjust thresholds in `GapAnalyzer.completeness_thresholds`
- Check that spec sections are properly populated
- Review scoring weights in `analyze_completeness()`

## Contributing

When extending the questioning workflow:

1. Add new strategies by inheriting from `QuestioningStrategy`
2. Implement all abstract methods
3. Update strategy registry in `question_strategies.py`
4. Add tests for new functionality
5. Update this README with examples

## License

Part of Blackbox4 - Internal use only.
