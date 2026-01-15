# Questioning Guide

**Version:** 1.0.0
**Last Updated:** 2026-01-15
**Phase:** 3 - Structured Spec Creation

---

## Table of Contents

1. [Overview](#overview)
2. [How Questioning Works](#how-questioning-works)
3. [Question Strategies](#question-strategies)
4. [Gap Analysis](#gap-analysis)
5. [Interactive Workflow](#interactive-workflow)
6. [Examples](#examples)

---

## Overview

The QuestioningEngine in Blackbox4 provides intelligent, sequential questioning to identify gaps and improve specifications. It generates context-aware questions across five key areas.

### What is Sequential Questioning?

Sequential questioning is an iterative process where:
1. Analyze current specification
2. Identify gaps and ambiguities
3. Generate targeted questions
4. Get answers and clarifications
5. Update specification
6. Repeat until complete

### Five Questioning Areas

1. **Completeness** - Are all necessary components present?
2. **Clarity** - Is the language unambiguous?
3. **Consistency** - Are there contradictions?
4. **Feasibility** - Can this be built given constraints?
5. **Testability** - Can success be measured?

---

## How Questioning Works

### Questioning Flow

```
Current Spec
    ↓
Analyze Gaps
    ↓
Generate Questions
    ↓
Prioritize by Area/Severity
    ↓
Present Questions (Sequential or Batch)
    ↓
Collect Answers
    ↓
Update Spec
    ↓
Re-analyze
```

### Question Structure

Each question has:
```python
{
    "question": "What is the question?",
    "area": "completeness|clarity|consistency|feasibility|testability",
    "priority": "critical|high|medium|low",
    "section": "user_stories|requirements|constitution|overview",
    "context": {},  # Additional context
    "recommendation": "Suggested answer or approach"
}
```

### Initialization

```python
from spec_creation import QuestioningEngine

engine = QuestioningEngine()

# Optional: Customize questioning areas
engine = QuestioningEngine(
    areas=["completeness", "clarity"],  # Focus on specific areas
    priority_threshold="high"           # Only high+ priority
)
```

---

## Question Strategies

### Strategy 1: Sequential Questioning

Ask questions one at a time, using answers to inform next questions.

```python
engine = QuestioningEngine()

# Get first question
questions = engine.generate_questions("overview", context={})
if questions:
    first_question = questions[0]

    # Get answer (from user, client, stakeholder)
    answer = get_answer(first_question['question'])

    # Add clarification to spec
    spec.add_clarification(
        first_question['question'],
        answer
    )

    # Generate next question based on updated context
    next_questions = engine.generate_questions(
        "overview",
        context={"previous_answer": answer}
    )
```

**When to Use:**
- Client interviews
- Stakeholder workshops
- Deep requirement gathering
- Complex specifications

**Advantages:**
- Context-aware questions
- Builds understanding progressively
- Natural conversation flow

**Disadvantages:**
- Time-intensive
- Requires synchronous interaction

### Strategy 2: Batch Questioning

Generate all questions at once, answer in any order.

```python
engine = QuestioningEngine()

# Generate all questions
all_questions = []
for section in ["overview", "user_stories", "requirements"]:
    questions = engine.generate_questions(section, context={})
    all_questions.extend(questions)

# Prioritize
all_questions.sort(key=lambda q: q['priority'], reverse=True)

# Create questionnaire
questionnaire = {
    "spec_id": spec.project_name,
    "questions": all_questions,
    "answers": {}
}

# Save for client/stakeholder
import json
with open("questionnaire.json", "w") as f:
    json.dump(questionnaire, f, indent=2)

# Client fills in answers
# Later, load and apply answers
with open("questionnaire-filled.json", "r") as f:
    filled = json.load(f)

for qa in filled['questions']:
    if qa.get('answer'):
        spec.add_clarification(qa['question'], qa['answer'])
```

**When to Use:**
- Distributed teams
- Async communication
- Email reviews
- Documentation

**Advantages:**
- Efficient for large specs
- Flexible answering order
- Creates audit trail

**Disadvantages:**
- Less context-aware
- May miss follow-up questions

### Strategy 3: Area-Focused Questioning

Focus on specific questioning area.

```python
engine = QuestioningEngine()

# Focus on completeness first
gaps = engine.analyze_gaps(spec)
completeness_gaps = [g for g in gaps if g['area'] == 'completeness']

print(f"Found {len(completeness_gaps)} completeness gaps:")
for gap in completeness_gaps:
    if gap['severity'] == 'critical':
        print(f"  - {gap['description']}")
        print(f"    Recommendation: {gap['recommendation']}")

# Then focus on testability
testability_questions = engine.generate_questions(
    "user_stories",
    context={"area": "testability"}
)
```

**When to Use:**
- Iterative refinement
- Specific concern areas
- Time-constrained reviews

**Advantages:**
- Targeted improvement
- Manageable question sets
- Focus on priorities

**Disadvantages:**
- May miss cross-area issues
- Multiple passes needed

### Strategy 4: Context-Aware Questioning

Use context variables to generate relevant questions.

```python
engine = QuestioningEngine()

# MVP context - focus on essential features
mvp_context = {
    "phase": "mvp",
    "timeline": "3 months",
    "team_size": 5
}

mvp_questions = engine.generate_questions(
    "requirements",
    context=mvp_context
)
# Questions will focus on MVP feasibility and prioritization

# Enterprise context - focus on scalability and security
enterprise_context = {
    "phase": "enterprise",
    "scale": "1M users",
    "compliance": ["SOC2", "GDPR"]
}

enterprise_questions = engine.generate_questions(
    "requirements",
    context=enterprise_context
)
# Questions will focus on scalability, security, compliance
```

**When to Use:**
- Multi-phase projects
- Different deployment scenarios
- Tenant-specific requirements

**Advantages:**
- Highly relevant questions
- Reduces noise
- Context-specific guidance

**Disadvantages:**
- Requires good context setup
- Context management overhead

---

## Gap Analysis

### What are Gaps?

Gaps are missing or incomplete elements in your specification:
- Missing user stories
- Undefined requirements
- Ambiguous descriptions
- Contradictory statements
- Untestable criteria

### Analyzing Gaps

```python
from spec_creation import QuestioningEngine

engine = QuestioningEngine()

# Comprehensive gap analysis
gaps = engine.analyze_gaps(spec)

# Group by severity
critical_gaps = [g for g in gaps if g['severity'] == 'critical']
high_gaps = [g for g in gaps if g['severity'] == 'high']
medium_gaps = [g for g in gaps if g['severity'] == 'medium']

print(f"Gap Analysis Summary:")
print(f"  Critical: {len(critical_gaps)}")
print(f"  High: {len(high_gaps)}")
print(f"  Medium: {len(medium_gaps)}")

# Address critical gaps first
for gap in critical_gaps:
    print(f"\n[{gap['area']}] {gap['description']}")
    print(f"  Location: {gap['location']}")
    print(f"  Recommendation: {gap['recommendation']}")

    # Take action
    if gap['type'] == 'missing_user_story':
        # Add missing user story
        pass
    elif gap['type'] == 'missing_requirement':
        # Add missing requirement
        pass
    elif gap['type'] == 'ambiguous':
        # Add clarification
        spec.add_clarification(
            gap['description'],
            gap['recommendation']
        )
```

### Gap Types

#### 1. Completeness Gaps

Missing components or incomplete sections.

```python
# Example: Missing user stories for key user type
{
    "type": "missing_user_story",
    "area": "completeness",
    "severity": "high",
    "description": "No user stories for 'admin' user type",
    "location": "user_stories",
    "recommendation": "Add stories for admin user type focusing on user management, permissions, and analytics"
}
```

#### 2. Clarity Gaps

Ambiguous language or undefined terms.

```python
# Example: Ambiguous performance requirement
{
    "type": "ambiguous",
    "area": "clarity",
    "severity": "medium",
    "description": "Requirement states 'fast performance' without specific metrics",
    "location": "requirements.FR-003.description",
    "recommendation": "Specify exact performance metrics (e.g., 'API response time < 200ms for 95th percentile')"
}
```

#### 3. Consistency Gaps

Contradictory statements or conflicting requirements.

```python
# Example: Contradictory constraints
{
    "type": "contradiction",
    "area": "consistency",
    "severity": "high",
    "description": "Constitution states 'launch in 3 months' but requirements suggest 6-month timeline",
    "location": "constitution.constraints vs requirements.timeline",
    "recommendation": "Either adjust timeline to 6 months or reduce scope to fit 3-month target"
}
```

#### 4. Feasibility Gaps

Unrealistic requirements given constraints.

```python
# Example: Infeasible with current team
{
    "type": "infeasible",
    "area": "feasibility",
    "severity": "critical",
    "description": "Requirements call for AI/ML features but constitution lists no ML expertise on team",
    "location": "requirements.FR-010 vs constitution.team_size",
    "recommendation": "Either add ML team member or outsource AI/ML components"
}
```

#### 5. Testability Gaps

Requirements that can't be tested or measured.

```python
# Example: Untestable acceptance criteria
{
    "type": "untestable",
    "area": "testability",
    "severity": "high",
    "description": "Acceptance criteria 'user-friendly interface' is subjective",
    "location": "user_stories.US-005.acceptance_criteria[2]",
    "recommendation": "Replace with measurable criteria: '90% of test users complete task in under 2 minutes'"
}
```

---

## Interactive Workflow

### Complete Interactive Session

```python
from spec_creation import (
    StructuredSpec,
    QuestioningEngine,
    SpecValidator
)

def interactive_questioning_session(spec_path):
    """Run interactive questioning session"""

    # Load spec
    spec = StructuredSpec.load(spec_path)

    # Initialize engine
    engine = QuestioningEngine()

    # Analyze initial gaps
    gaps = engine.analyze_gaps(spec)
    print(f"Found {len(gaps)} initial gaps")

    # Iterate through sections
    sections = ["overview", "user_stories", "requirements", "constitution"]

    for section in sections:
        print(f"\n{'='*60}")
        print(f"Section: {section.upper()}")
        print(f"{'='*60}")

        # Generate questions for section
        questions = engine.generate_questions(
            section,
            context={"previous_answers": spec.clarifications}
        )

        if not questions:
            print(f"No questions for {section}")
            continue

        # Ask questions sequentially
        for i, q in enumerate(questions, 1):
            print(f"\n[{i}/{len(questions)}] Priority: {q['priority'].upper()}")
            print(f"Area: {q['area']}")
            print(f"Question: {q['question']}")

            if q.get('recommendation'):
                print(f"Suggestion: {q['recommendation']}")

            # Get answer
            answer = input("\nYour answer (or press Enter to skip): ").strip()

            if answer:
                spec.add_clarification(q['question'], answer)
                print("✓ Answer recorded")

            # Ask if they want to continue
            if i < len(questions):
                cont = input("\nContinue to next question? (Y/n): ").strip().lower()
                if cont == 'n':
                    break

        # Re-analyze after section
        new_gaps = engine.analyze_gaps(spec)
        print(f"\nGaps remaining: {len(new_gaps)} (was {len(gaps)})")
        gaps = new_gaps

    # Final validation
    print(f"\n{'='*60}")
    print("FINAL VALIDATION")
    print(f"{'='*60}")

    validator = SpecValidator()
    result = validator.validate(spec)

    print(f"\nValidation Results:")
    print(f"  Valid: {result.is_valid}")
    print(f"  Completeness: {result.completeness_score}%")
    print(f"  Clarity: {result.clarity_score}%")
    print(f"  Consistency: {result.consistency_score}%")

    if not result.is_valid:
        print(f"\nRemaining Issues: {len(result.errors)}")
        for error in result.errors[:5]:
            print(f"  - {error['message']}")

    # Save updated spec
    base, ext = os.path.splitext(spec_path)
    updated_path = f"{base}-updated{ext}"
    spec.save(updated_path)
    print(f"\n✓ Updated spec saved to: {updated_path}")

    return spec

# Run session
spec = interactive_questioning_session("specs/ecommerce.json")
```

### Client Questionnaire Workflow

```python
def create_client_questionnaire(spec_path, output_path):
    """Create questionnaire for client to fill out"""

    spec = StructuredSpec.load(spec_path)
    engine = QuestioningEngine()

    # Generate all questions
    all_questions = []
    for section in ["overview", "user_stories", "requirements"]:
        questions = engine.generate_questions(section, context={})
        all_questions.extend(questions)

    # Prioritize: critical first
    all_questions.sort(key=lambda q: {
        'critical': 0,
        'high': 1,
        'medium': 2,
        'low': 3
    }.get(q['priority'], 4))

    # Create questionnaire document
    questionnaire = {
        "project": spec.project_name,
        "created": datetime.now().isoformat(),
        "instructions": """
Please answer the following questions to help us clarify your requirements.
Focus on the 'critical' and 'high' priority questions first.
For each question, provide as much detail as possible.
If you're unsure about a question, mark it as 'needs discussion'.
        """.strip(),
        "questions": [
            {
                "number": i + 1,
                "question": q['question'],
                "area": q['area'],
                "priority": q['priority'],
                "suggestion": q.get('recommendation', ''),
                "answer": "",
                "needs_discussion": False
            }
            for i, q in enumerate(all_questions)
        ]
    }

    # Save questionnaire
    import json
    with open(output_path, 'w') as f:
        json.dump(questionnaire, f, indent=2)

    print(f"✓ Questionnaire created with {len(all_questions)} questions")
    print(f"  Critical: {len([q for q in all_questions if q['priority'] == 'critical'])}")
    print(f"  High: {len([q for q in all_questions if q['priority'] == 'high'])}")

    return questionnaire

# Create questionnaire
create_client_questionnaire(
    "specs/ecommerce.json",
    "questionnaire/ecommerce-client-questions.json"
)
```

### Apply Questionnaire Answers

```python
def apply_questionnaire_answers(spec_path, questionnaire_path, output_path):
    """Apply answers from filled questionnaire"""

    spec = StructuredSpec.load(spec_path)

    # Load questionnaire
    import json
    with open(questionnaire_path, 'r') as f:
        questionnaire = json.load(f)

    # Apply answers
    applied = 0
    for qa in questionnaire['questions']:
        answer = qa.get('answer', '').strip()
        if answer and not qa.get('needs_discussion', False):
            spec.add_clarification(qa['question'], answer)
            applied += 1
            print(f"✓ Applied answer for Q{qa['number']}")

    # Save updated spec
    spec.save(output_path)
    print(f"\n✓ Applied {applied} answers to spec")
    print(f"✓ Updated spec saved to: {output_path}")

    return spec

# Apply answers
apply_questionnaire_answers(
    "specs/ecommerce.json",
    "questionnaire/ecommerce-client-questions-filled.json",
    "specs/ecommerce-updated.json"
)
```

---

## Examples

### Example 1: E-commerce Platform Questioning

```python
from spec_creation import StructuredSpec, QuestioningEngine

# Load spec
spec = StructuredSpec.load("specs/ecommerce.json")

# Initialize engine
engine = QuestioningEngine()

# Generate questions for user stories section
questions = engine.generate_questions("user_stories")

# Sample questions generated:
for q in questions[:5]:
    print(f"[{q['priority'].upper()}] {q['area']}")
    print(f"Q: {q['question']}")
    if q.get('recommendation'):
        print(f"   Suggestion: {q['recommendation']}")
    print()
```

**Output:**
```
[CRITICAL] completeness
Q: You have no user stories for the 'admin' user type. Admin users typically need to manage products, orders, and customers. Should we add admin user stories?
   Suggestion: Add stories for: product management, order fulfillment, customer management, analytics dashboard

[HIGH] testability
Q: User story US-003 states 'easy checkout process' but this is subjective. How do we define 'easy'?
   Suggestion: Define measurable criteria: '90% of users complete checkout in under 3 minutes with < 2 clicks'

[MEDIUM] clarity
Q: Requirement FR-007 mentions 'payment integration' but doesn't specify which payment providers. Which providers should we integrate?
   Suggestion: Start with Stripe (most common), add PayPal later if needed

[HIGH] feasibility
Q: Constitution states 'launch in 3 months' but requirements suggest custom AI recommendation engine. Is this feasible?
   Suggestion: Either defer AI features to post-MVP or use third-party recommendation service

[MEDIUM] consistency
Q: User story US-010 mentions 'multi-currency support' but constitution doesn't list this in MVP scope. Is this essential?
   Suggestion: Defer multi-currency to post-MVP, focus on single currency for launch
```

### Example 2: Gap Analysis for SaaS Feature

```python
spec = StructuredSpec.load("specs/analytics-dashboard.json")
engine = QuestioningEngine()

# Analyze gaps
gaps = engine.analyze_gaps(spec)

# Print critical gaps
critical = [g for g in gaps if g['severity'] == 'critical']
print(f"Found {len(critical)} critical gaps:\n")

for gap in critical:
    print(f"[{gap['area'].upper()}]")
    print(f"  {gap['description']}")
    print(f"  Location: {gap['location']}")
    print(f"  Recommendation: {gap['recommendation']}")
    print()
```

**Output:**
```
Found 3 critical gaps:

[COMPLETENESS]
  No user stories for data export functionality. Analytics dashboards typically need export capabilities for reports and deeper analysis.
  Location: user_stories
  Recommendation: Add story: "As a product manager, I want to export analytics data to CSV, so that I can create custom reports"

[TESTABILITY]
  Requirement FR-003 states 'real-time data updates' but doesn't define what 'real-time' means.
  Location: requirements.FR-003.description
  Recommendation: Specify: "Data updates within 5 seconds of event occurring" or "Use WebSockets for sub-second updates"

[FEASIBILITY]
  Constitution specifies 'budget: $10k' but requirements suggest third-party analytics API integration which typically costs $500+/month.
  Location: constitution.constraints vs requirements.FR-005
  Recommendation: Either increase budget or use open-source analytics solution (e.g., build on top of PostgreSQL + custom dashboard)
```

### Example 3: Context-Aware Questioning

```python
spec = StructuredSpec.load("specs/mobile-app.json")
engine = QuestioningEngine()

# Generate questions for MVP context
mvp_questions = engine.generate_questions(
    "requirements",
    context={
        "phase": "mvp",
        "timeline": "2 months",
        "focus": "core features only"
    }
)

print("MVP-Focused Questions:\n")
for q in mvp_questions[:3]:
    print(f"Q: {q['question']}")
    print(f"  Context: MVP phase, focus on core features\n")

# Generate questions for enterprise context
enterprise_questions = engine.generate_questions(
    "requirements",
    context={
        "phase": "enterprise",
        "scale": "100k users",
        "compliance": ["SOC2", "GDPR"]
    }
)

print("\nEnterprise-Focused Questions:\n")
for q in enterprise_questions[:3]:
    print(f"Q: {q['question']}")
    print(f"  Context: Enterprise scale, compliance required\n")
```

---

## Best Practices

### 1. Start with Completeness

Focus on completeness gaps first:
```python
gaps = engine.analyze_gaps(spec)
completeness_gaps = [g for g in gaps if g['area'] == 'completeness']
# Address these first
```

### 2. Prioritize Critical Issues

Always tackle critical gaps before high/medium:
```python
critical = [g for g in gaps if g['severity'] == 'critical']
if critical:
    # Address critical gaps first
    pass
```

### 3. Iterate and Re-Analyze

Questioning is iterative:
```python
while True:
    gaps = engine.analyze_gaps(spec)
    critical_gaps = [g for g in gaps if g['severity'] == 'critical']

    if not critical_gaps:
        break

    # Address gaps
    # ...

    # Re-analyze
```

### 4. Use Context Variables

Leverage context for better questions:
```python
questions = engine.generate_questions(
    "requirements",
    context={"phase": "mvp", "timeline": "3 months"}
)
```

### 5. Document Decisions

Always add clarifications:
```python
spec.add_clarification(
    "Question that was asked",
    "Decision that was made and why"
)
```

---

## Conclusion

The QuestioningEngine provides a systematic approach to identifying and addressing gaps in specifications. By using sequential questioning, gap analysis, and context-aware generation, you can create more complete, clear, and validated specs.

**Key Takeaways:**
- Questioning is iterative - analyze, question, improve, repeat
- Focus on completeness first, then clarity, then other areas
- Use context to generate relevant questions
- Always document decisions as clarifications
- Re-validate after addressing gaps

**Next Steps:**
- Read [Validation Guide](VALIDATION-GUIDE.md)
- Read [Integration Guide](INTEGRATION-GUIDE.md)
- Explore [Examples](EXAMPLES.md)
