# Spec Creation Guide

**Version:** 1.0.0
**Last Updated:** 2026-01-15
**Phase:** 3 - Structured Spec Creation

---

## Table of Contents

1. [Overview](#overview)
2. [When to Use Structured Specs](#when-to-use-structured-specs)
3. [Spec Creation Workflow](#spec-creation-workflow)
4. [Best Practices](#best-practices)
5. [Common Patterns](#common-patterns)
6. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
7. [Examples](#examples)

---

## Overview

Structured specs in Blackbox4 provide a systematic approach to defining project requirements with type-safe data models, sequential questioning, and comprehensive validation.

### What are Structured Specs?

Structured specs are formal, machine-readable specifications that:
- Define project requirements clearly
- Support multiple output formats (JSON + PRD)
- Enable validation and gap analysis
- Integrate with planning and execution workflows

### Key Components

1. **StructuredSpec** - Main container for specifications
2. **UserStory** - User stories with acceptance criteria
3. **FunctionalRequirement** - Technical requirements
4. **ProjectConstitution** - Project vision and standards
5. **QuestioningEngine** - Gap analysis and question generation
6. **SpecValidator** - Validation and auto-fix

---

## When to Use Structured Specs

### Use Structured Specs When:

✅ **Starting a new project**
- Clear requirements definition
- Stakeholder alignment
- Foundation for planning

✅ **Complex features**
- Multiple user types
- Technical dependencies
- Integration points

✅ **Client projects**
- Formal requirements documentation
- Change management
- Scope validation

✅ **Team collaboration**
- Shared understanding
- Clear acceptance criteria
- Reduced ambiguity

✅ **Quality assurance**
- Testable requirements
- Validation framework
- Completeness checking

### Consider Alternative Approaches When:

⚠️ **Simple tasks**
- Straightforward bug fixes
- Minor enhancements
- Documentation updates

⚠️ **Exploratory work**
- Research projects
- Proof of concepts
- Prototyping

⚠️ **Time-critical fixes**
- Production emergencies
- Security patches
- Critical bugs

---

## Spec Creation Workflow

### Complete Workflow

```
1. Initialize Spec
   ↓
2. Add User Stories
   ↓
3. Add Requirements
   ↓
4. Set Constitution
   ↓
5. Validate Spec
   ↓
6. Generate Questions
   ↓
7. Address Gaps
   ↓
8. Save Spec
```

### Step 1: Initialize Spec

```python
from spec_creation import StructuredSpec

spec = StructuredSpec(
    project_name="E-commerce Platform",
    overview="Modern e-commerce platform for small businesses",
    context_variables={
        "tenant": "acme",
        "phase": "mvp",
        "team_size": 5
    }
)
```

### Step 2: Add User Stories

```python
from spec_creation import UserStory

spec.add_user_story(UserStory(
    id="US-001",
    as_a="shop owner",
    i_want="to manage my product catalog",
    so_that="customers can browse and purchase items",
    acceptance_criteria=[
        "Can add/edit/delete products",
        "Can upload product images",
        "Can set prices and inventory",
        "Can organize products into categories"
    ],
    priority="high",
    story_points=8
))

spec.add_user_story(UserStory(
    id="US-002",
    as_a="customer",
    i_want="to search for products",
    so_that="I can find what I'm looking for",
    acceptance_criteria=[
        "Can search by name",
        "Can filter by category",
        "Can sort by price",
        "Search results appear instantly"
    ],
    priority="high",
    story_points=5
))
```

### Step 3: Add Requirements

```python
from spec_creation import FunctionalRequirement

spec.add_requirement(FunctionalRequirement(
    id="FR-001",
    title="Product Catalog Management",
    description="CRUD operations for product catalog with image support",
    priority="high",
    dependencies=[],
    acceptance_tests=[
        "Shop owner can add product with name, description, price",
        "Shop owner can upload up to 5 images per product",
        "Shop owner can edit product details",
        "Shop owner can delete product",
        "Product changes are saved to database"
    ]
))

spec.add_requirement(FunctionalRequirement(
    id="FR-002",
    title="Product Search",
    description="Full-text search with filters and sorting",
    priority="high",
    dependencies=["FR-001"],
    acceptance_tests=[
        "Search returns matching products",
        "Filters narrow results correctly",
        "Sort orders products as expected",
        "Search performs under 100ms"
    ]
))
```

### Step 4: Set Constitution

```python
from spec_creation import ProjectConstitution

spec.constitution = ProjectConstitution(
    vision="Empower small businesses with affordable, easy-to-use e-commerce",
    tech_stack={
        "frontend": "Next.js 14",
        "backend": "Python/FastAPI",
        "database": "PostgreSQL",
        "hosting": "AWS",
        "cdn": "Cloudflare"
    },
    quality_standards=[
        "Test coverage > 80%",
        "API response time < 200ms",
        "Zero critical security vulnerabilities",
        "Mobile-responsive design",
        "WCAG 2.1 AA accessibility"
    ],
    architectural_principles=[
        "RESTful API design",
        "Server-side rendering for SEO",
        "Event-driven updates",
        "Microservices where appropriate"
    ],
    constraints=[
        "Launch MVP in 3 months",
        "Budget: $50k for Q1",
        "Team: 5 developers",
        "Support 1000 concurrent users"
    ]
)
```

### Step 5: Validate Spec

```python
from spec_creation.validation import SpecValidator

validator = SpecValidator()
result = validator.validate(spec)

print(f"Valid: {result.is_valid}")
print(f"Completeness: {result.completeness_score}%")
print(f"Clarity: {result.clarity_score}%")
print(f"Consistency: {result.consistency_score}%")

if not result.is_valid:
    for error in result.errors:
        print(f"[{error['severity']}] {error['message']}")
        print(f"  Location: {error['location']}")
        print(f"  Suggestion: {error['suggestion']}")
```

### Step 6: Generate Questions

```python
from spec_creation import QuestioningEngine

engine = QuestioningEngine()

# Analyze gaps
gaps = engine.analyze_gaps(spec)
print(f"Found {len(gaps)} gaps:")
for gap in gaps:
    print(f"\n[{gap['severity']}] {gap['description']}")
    print(f"  Recommendation: {gap['recommendation']}")

# Generate questions for specific section
questions = engine.generate_questions(
    "user_stories",
    context={"phase": "mvp"}
)
print(f"\n{len(questions)} questions generated:")
for q in questions:
    print(f"\n{q['question']}")
    print(f"  Priority: {q['priority']}")
    print(f"  Area: {q['area']}")
```

### Step 7: Address Gaps

```python
# Add clarifications for questions
spec.add_clarification(
    "Do we need multi-currency support?",
    "Not for MVP. Single currency (USD) for initial launch. Multi-currency planned for Q2."
)

spec.add_clarification(
    "What is the maximum file size for product images?",
    "Maximum 5MB per image. Automatic compression applied on upload."
)

# Add missing components based on gaps
for gap in gaps:
    if gap['severity'] == 'critical':
        # Add missing requirement or story
        pass
```

### Step 8: Save Spec

```python
# Save to both JSON and PRD
prd_path = spec.save("specs/ecommerce-spec.json")

print(f"Spec saved:")
print(f"  JSON: specs/ecommerce-spec.json")
print(f"  PRD:  specs/ecommerce-spec-prd.md")
```

---

## Best Practices

### 1. Start with Overview

Always begin with a clear project overview that answers:
- What are we building?
- Who is it for?
- Why are we building it?
- What problem does it solve?

```python
spec = StructuredSpec(
    project_name="Clear, descriptive name",
    overview="2-3 sentence summary that explains the what, who, and why"
)
```

### 2. User Stories First

Define user stories before functional requirements:
- User stories focus on value
- Requirements focus on implementation
- Stories drive requirements

```python
# Good: Story first, then requirement
spec.add_user_story(UserStory(
    as_a="user",
    i_want="to login",
    so_that="I can access my account"
))

spec.add_requirement(FunctionalRequirement(
    title="User Authentication",
    description="Implement JWT-based authentication"
))
```

### 3. Acceptance Criteria for Everything

Every user story and requirement needs acceptance criteria:
- Defines "done"
- Enables testing
- Reduces ambiguity

```python
story = UserStory(
    ...,
    acceptance_criteria=[
        "Specific, measurable condition 1",
        "Specific, measurable condition 2",
        "Specific, measurable condition 3"
    ]
)
```

### 4. Use Consistent ID Schemes

Maintain consistent ID prefixes:
- `US-XXX` for user stories
- `FR-XXX` for functional requirements
- `NFR-XXX` for non-functional requirements

```python
# Good: Consistent prefixes
UserStory(id="US-001", ...)
UserStory(id="US-002", ...)
FunctionalRequirement(id="FR-001", ...)
```

### 5. Prioritize Everything

Assign priorities to all items:
- `critical` - Must have for MVP
- `high` - Important but can defer
- `medium` - Nice to have
- `low` - Future consideration

```python
story = UserStory(
    ...,
    priority="high"  # Always prioritize
)
```

### 6. Link Dependencies

Explicitly declare dependencies:
- Requirements can depend on other requirements
- Creates clear build order
- Prevents blocking issues

```python
req = FunctionalRequirement(
    id="FR-002",
    ...,
    dependencies=["FR-001"]  # Depends on FR-001
)
```

### 7. Set Constitution Early

Define constitution early to guide decisions:
- Tech stack choices
- Quality standards
- Architectural principles
- Constraints

```python
spec.constitution = ProjectConstitution(
    vision="Clear vision statement",
    tech_stack={...},
    quality_standards=[...],
    constraints=[...]
)
```

### 8. Iterate with Questioning

Use questioning engine to identify gaps:
- Generate questions after initial draft
- Address gaps iteratively
- Re-validate after changes

```python
engine = QuestioningEngine()
gaps = engine.analyze_gaps(spec)
# Address gaps, then re-analyze
```

### 9. Version Control Specs

Save different versions as you refine:
- `project-spec-v1.json` - Initial draft
- `project-spec-v2.json` - After questioning
- `project-spec-final.json` - Approved version

### 10. Use Context Variables

Leverage context variables for multi-tenant scenarios:
```python
spec = StructuredSpec(
    ...,
    context_variables={
        "tenant": "acme",
        "phase": "mvp",
        "environment": "production"
    }
)
```

---

## Common Patterns

### Pattern 1: Epic Breakdown

Break large epics into user stories, then requirements:

```python
# Epic: User Management
for feature in ["Registration", "Login", "Profile", "Password Reset"]:
    spec.add_user_story(UserStory(
        id=f"US-{idx}",
        as_a="user",
        i_want=f"to {feature.lower()}",
        so_that="I can manage my account"
    ))

# Requirements for each story
spec.add_requirement(FunctionalRequirement(
    id="FR-001",
    title="User Registration",
    dependencies=[],
    ...
))
```

### Pattern 2: MVP vs Future

Track MVP vs future features:

```python
# MVP features
story_mvp = UserStory(
    id="US-001",
    ...,
    acceptance_criteria=[...],
    tags=["mvp", "phase-1"]
)

# Future features
story_future = UserStory(
    id="US-002",
    ...,
    tags=["future", "phase-2"]
)
```

### Pattern 3: Client Questioning

Generate questions for client review:

```python
engine = QuestioningEngine()
questions = engine.generate_questions("all")

# Create questionnaire
questionnaire = []
for q in questions:
    questionnaire.append({
        "question": q['question'],
        "priority": q['priority'],
        "answer": ""  # Client fills in
    })

# Save questionnaire for client
import json
with open("client-questionnaire.json", "w") as f:
    json.dump(questionnaire, f, indent=2)
```

### Pattern 4: Domain Validation

Validate with domain-specific rules:

```python
from spec_creation.validation import SpecValidator

validator = SpecValidator()

# Define domain rules
ecommerce_rules = {
    "required_sections": ["user_stories", "functional_requirements"],
    "min_user_stories": 5,
    "min_requirements": 3,
    "required_tech_stack": ["frontend", "backend", "database"]
}

# Validate with domain rules
result = validator.validate_with_domain_rules(
    spec,
    context={"domain": "ecommerce"}
)
```

### Pattern 5: Plan to Spec Conversion

Convert existing plan to spec:

```python
# Import from checklist.md
spec = spec_from_plan(".plans/ecommerce-project")

# Enhance with questioning
engine = QuestioningEngine()
gaps = engine.analyze_gaps(spec)

# Fill gaps and save
spec.save("specs/ecommerce-from-plan.json")
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Vague User Stories

❌ **Bad:**
```python
UserStory(
    as_a="user",
    i_want="to do stuff",
    so_that="it works"
)
```

✅ **Good:**
```python
UserStory(
    as_a="shop owner",
    i_want="to manage my product catalog",
    so_that="customers can browse and purchase items"
)
```

### Anti-Pattern 2: Missing Acceptance Criteria

❌ **Bad:**
```python
UserStory(
    ...,
    acceptance_criteria=[]  # Empty!
)
```

✅ **Good:**
```python
UserStory(
    ...,
    acceptance_criteria=[
        "Specific condition 1",
        "Specific condition 2",
        "Specific condition 3"
    ]
)
```

### Anti-Pattern 3: No Dependencies

❌ **Bad:**
```python
# FR-002 depends on FR-001, but not declared
spec.add_requirement(FunctionalRequirement(id="FR-001", ...))
spec.add_requirement(FunctionalRequirement(id="FR-002", ...))
```

✅ **Good:**
```python
# Explicit dependency
spec.add_requirement(FunctionalRequirement(id="FR-001", ...))
spec.add_requirement(FunctionalRequirement(
    id="FR-002",
    ...,
    dependencies=["FR-001"]
))
```

### Anti-Pattern 4: Skipping Constitution

❌ **Bad:**
```python
spec = StructuredSpec(...)
# No constitution set
```

✅ **Good:**
```python
spec.constitution = ProjectConstitution(
    vision="...",
    tech_stack={...},
    quality_standards=[...],
    constraints=[...]
)
```

### Anti-Pattern 5: No Validation

❌ **Bad:**
```python
spec.save("spec.json")  # Save without validating
```

✅ **Good:**
```python
validator = SpecValidator()
result = validator.validate(spec)
if result.is_valid:
    spec.save("spec.json")
else:
    # Fix issues first
    pass
```

### Anti-Pattern 6: Ignoring Questions

❌ **Bad:**
```python
engine = QuestioningEngine()
gaps = engine.analyze_gaps(spec)
# Ignore gaps and save anyway
spec.save("spec.json")
```

✅ **Good:**
```python
engine = QuestioningEngine()
gaps = engine.analyze_gaps(spec)
# Address critical gaps
for gap in gaps:
    if gap['severity'] == 'critical':
        # Fix or add clarification
        pass
spec.save("spec.json")
```

### Anti-Pattern 7: Inconsistent Priorities

❌ **Bad:**
```python
# Mix of priority values
story1 = UserStory(..., priority="high")
story2 = UserStory(..., priority="urgent")
story3 = UserStory(..., priority="important")
```

✅ **Good:**
```python
# Consistent priority values
story1 = UserStory(..., priority="high")
story2 = UserStory(..., priority="medium")
story3 = UserStory(..., priority="low")
```

---

## Examples

### Example 1: Complete E-commerce Spec

```python
from spec_creation import (
    StructuredSpec,
    UserStory,
    FunctionalRequirement,
    ProjectConstitution,
    QuestioningEngine,
    SpecValidator
)

# 1. Create spec
spec = StructuredSpec(
    project_name="Small Business E-commerce Platform",
    overview="An affordable, easy-to-use e-commerce platform designed specifically for small businesses that need professional online stores without enterprise complexity."
)

# 2. Add user stories
spec.add_user_story(UserStory(
    id="US-001",
    as_a="shop owner",
    i_want="to add products to my store",
    so_that="customers can see what I'm selling",
    acceptance_criteria=[
        "Can add product name, description, price",
        "Can upload up to 5 product images",
        "Can set stock quantity",
        "Can assign product to category"
    ],
    priority="critical",
    story_points=5
))

# 3. Add requirements
spec.add_requirement(FunctionalRequirement(
    id="FR-001",
    title="Product Management",
    description="CRUD operations for products with image upload",
    priority="critical",
    dependencies=[],
    acceptance_tests=[
        "Shop owner can create product",
        "Shop owner can edit product",
        "Shop owner can delete product",
        "Images are compressed and stored"
    ]
))

# 4. Set constitution
spec.constitution = ProjectConstitution(
    vision="Democratize e-commerce for small businesses",
    tech_stack={
        "frontend": "Next.js 14",
        "backend": "Python/FastAPI",
        "database": "PostgreSQL",
        "storage": "AWS S3"
    },
    quality_standards=[
        "Test coverage > 80%",
        "Page load < 2s",
        "Mobile-responsive"
    ],
    constraints=["Launch in 90 days"]
)

# 5. Validate
validator = SpecValidator()
result = validator.validate(spec)
print(f"Valid: {result.is_valid}")

# 6. Question and improve
engine = QuestioningEngine()
gaps = engine.analyze_gaps(spec)

# 7. Save
spec.save("specs/ecommerce.json")
```

### Example 2: SaaS Feature Spec

```python
spec = StructuredSpec(
    project_name="User Analytics Dashboard",
    overview="Real-time analytics dashboard for SaaS users to track product usage",
    context_variables={"tenant": "acme", "edition": "enterprise"}
)

# Analytics stories
spec.add_user_story(UserStory(
    id="US-001",
    as_a="product manager",
    i_want="to view daily active users",
    so_that="I can track engagement",
    acceptance_criteria=[
        "DAU chart shows last 30 days",
        "Can filter by date range",
        "Can segment by user type"
    ],
    priority="high"
))

# Analytics requirements
spec.add_requirement(FunctionalRequirement(
    id="FR-001",
    title="Metrics Aggregation",
    description="Real-time calculation of key metrics",
    priority="high",
    dependencies=[],
    acceptance_tests=[
        "DAU calculated within 5 minutes",
        "Metrics are accurate within 1%",
        "Can handle 1M events/hour"
    ]
))

spec.save("specs/analytics.json")
```

### Example 3: Internal Tool Spec

```python
spec = StructuredSpec(
    project_name="Internal Deployment Tool",
    overview="Automated deployment tool for internal services",
    constitution=ProjectConstitution(
        tech_stack={"language": "Python", "framework": "FastAPI"},
        quality_standards=["100% test coverage", "Type hints required"]
    )
)

spec.add_user_story(UserStory(
    id="US-001",
    as_a="devops engineer",
    i_want="to deploy services with one command",
    so_that="I can deploy quickly and safely",
    acceptance_criteria=[
        "Single command triggers deployment",
        "Pre-deployment checks run automatically",
        "Rollback available if deployment fails"
    ],
    priority="critical"
))

spec.save("specs/deployment-tool.json")
```

---

## Conclusion

Structured specs provide a systematic approach to requirements definition. By following these best practices and avoiding common anti-patterns, you can create clear, complete, and validated specifications that serve as a solid foundation for project success.

**Key Takeaways:**
- Start with clear overview and user stories
- Add acceptance criteria to everything
- Use validation and questioning to identify gaps
- Iterate and improve your specs
- Leverage context variables for flexibility

**Next Steps:**
- Read [Questioning Guide](QUESTIONING-GUIDE.md)
- Read [Validation Guide](VALIDATION-GUIDE.md)
- Explore [Examples](EXAMPLES.md)
- Check [API Reference](API-REFERENCE.md)
