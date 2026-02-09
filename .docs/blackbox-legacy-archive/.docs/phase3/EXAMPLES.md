# Examples

**Version:** 1.0.0
**Last Updated:** 2026-01-15
**Phase:** 3 - Structured Spec Creation

---

## Table of Contents

1. [Real-World Spec Examples](#real-world-spec-examples)
2. [Questioning Session Examples](#questioning-session-examples)
3. [Validation Examples](#validation-examples)
4. [Integration Examples](#integration-examples)

---

## Real-World Spec Examples

### Example 1: E-commerce Platform

Complete spec for a small business e-commerce platform.

```python
from spec_creation import (
    StructuredSpec,
    UserStory,
    FunctionalRequirement,
    ProjectConstitution
)

# Create spec
spec = StructuredSpec(
    project_name="Small Business E-commerce Platform",
    overview="An affordable, easy-to-use e-commerce platform designed specifically for small businesses that need professional online stores without enterprise complexity.",
    context_variables={"tenant": "acme", "phase": "mvp"}
)

# Add user stories
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

spec.add_user_story(UserStory(
    id="US-002",
    as_a="customer",
    i_want="to browse products",
    so_that="I can find items to purchase",
    acceptance_criteria=[
        "Can view product listings",
        "Can filter by category",
        "Can search by name",
        "Can view product details"
    ],
    priority="critical",
    story_points=8
))

spec.add_user_story(UserStory(
    id="US-003",
    as_a="customer",
    i_want="to add items to cart",
    so_that="I can purchase multiple items",
    acceptance_criteria=[
        "Can add product to cart",
        "Can view cart contents",
        "Can update quantities",
        "Can remove items"
    ],
    priority="critical",
    story_points=5
))

spec.add_user_story(UserStory(
    id="US-004",
    as_a="customer",
    i_want="to checkout securely",
    so_that="I can complete my purchase",
    acceptance_criteria=[
        "Can enter shipping address",
        "Can enter payment information",
        "Can review order before submitting",
        "Receive order confirmation"
    ],
    priority="critical",
    story_points=8
))

# Add requirements
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
        "Images are compressed and stored",
        "Product changes persist to database"
    ]
))

spec.add_requirement(FunctionalRequirement(
    id="FR-002",
    title="User Authentication",
    description="JWT-based authentication for shop owners and customers",
    priority="critical",
    dependencies=[],
    acceptance_tests=[
        "Users can register with email/password",
        "Users can login with valid credentials",
        "Invalid credentials return error",
        "Passwords are hashed using bcrypt",
        "JWT tokens expire after 7 days"
    ]
))

spec.add_requirement(FunctionalRequirement(
    id="FR-003",
    title="Shopping Cart",
    description="Session-based shopping cart with persistence",
    priority="critical",
    dependencies=["FR-002"],
    acceptance_tests=[
        "Cart persists across sessions",
        "Can add multiple items",
        "Can update quantities",
        "Can remove items",
        "Cart calculates total correctly"
    ]
))

spec.add_requirement(FunctionalRequirement(
    id="FR-004",
    title="Payment Processing",
    description="Integration with Stripe for payment processing",
    priority="critical",
    dependencies=["FR-002", "FR-003"],
    acceptance_tests=[
        "Can process valid payment",
        "Handles declined payments",
        "Payment confirmation sent",
        "Order created after payment"
    ]
))

# Set constitution
spec.constitution = ProjectConstitution(
    vision="Democratize e-commerce for small businesses by providing an affordable, easy-to-use platform",
    tech_stack={
        "frontend": "Next.js 14 (React)",
        "backend": "Python 3.11 + FastAPI",
        "database": "PostgreSQL 15",
        "orm": "SQLAlchemy 2.0",
        "auth": "JWT (PyJWT)",
        "payments": "Stripe API",
        "storage": "AWS S3",
        "hosting": "AWS EC2",
        "cdn": "Cloudflare"
    },
    quality_standards=[
        "Test coverage > 80%",
        "API response time < 200ms (95th percentile)",
        "Page load time < 2 seconds",
        "Mobile-responsive design",
        "WCAG 2.1 AA accessibility compliance",
        "Zero critical security vulnerabilities",
        "All code reviewed before merge"
    ],
    architectural_principles=[
        "RESTful API design",
        "Server-side rendering for SEO",
        "Component-based frontend architecture",
        "Database normalization",
        "Stateless authentication",
        "Event-driven updates where appropriate"
    ],
    constraints=[
        "Launch MVP in 90 days",
        "Budget: $50,000 for Q1",
        "Team: 5 developers (2 frontend, 2 backend, 1 full-stack)",
        "Support 1,000 concurrent users at launch",
        "Single currency (USD) for MVP",
        "English language only for MVP"
    ]
)

# Save spec
prd_path = spec.save("specs/ecommerce-platform.json")
print(f"✅ E-commerce spec created: {prd_path}")
```

---

### Example 2: SaaS Analytics Dashboard

Spec for a user analytics dashboard feature.

```python
from spec_creation import (
    StructuredSpec,
    UserStory,
    FunctionalRequirement,
    ProjectConstitution
)

spec = StructuredSpec(
    project_name="User Analytics Dashboard",
    overview="Real-time analytics dashboard for SaaS users to track product usage, engagement metrics, and user behavior.",
    context_variables={"tenant": "saas-platform", "feature": "analytics"}
)

# User stories
spec.add_user_story(UserStory(
    id="US-001",
    as_a="product manager",
    i_want="to view daily active users",
    so_that="I can track engagement trends",
    acceptance_criteria=[
        "DAU chart shows last 30 days",
        "Can filter by date range",
        "Can segment by user type",
        "Data updates every 5 minutes"
    ],
    priority="high",
    story_points=5
))

spec.add_user_story(UserStory(
    id="US-002",
    as_a="product manager",
    i_want="to view feature usage",
    so_that="I can understand which features are popular",
    acceptance_criteria=[
        "See usage count per feature",
        "See usage trend over time",
        "Can compare multiple features",
        "Can drill down to user level"
    ],
    priority="high",
    story_points=8
))

spec.add_user_story(UserStory(
    id="US-003",
    as_a="product manager",
    i_want="to export analytics data",
    so_that="I can create custom reports",
    acceptance_criteria=[
        "Can export to CSV",
        "Can export to JSON",
        "Can select date range",
        "Can select metrics to export"
    ],
    priority="medium",
    story_points=3
))

# Requirements
spec.add_requirement(FunctionalRequirement(
    id="FR-001",
    title="Metrics Aggregation",
    description="Real-time calculation of key metrics from event data",
    priority="high",
    dependencies=[],
    acceptance_tests=[
        "DAU calculated within 5 minutes of event",
        "Metrics are accurate within 1%",
        "Can handle 1M events per hour",
        "Aggregation queries complete in < 100ms"
    ]
))

spec.add_requirement(FunctionalRequirement(
    id="FR-002",
    title="Data Visualization",
    description="Interactive charts and graphs for metric display",
    priority="high",
    dependencies=["FR-001"],
    acceptance_tests=[
        "Charts render in < 1 second",
        "Supports line, bar, and pie charts",
        "Responsive design",
        "Can export chart as image"
    ]
))

# Constitution
spec.constitution = ProjectConstitution(
    vision="Provide actionable insights to SaaS product managers through real-time analytics",
    tech_stack={
        "frontend": "React + D3.js",
        "backend": "Python + FastAPI",
        "database": "PostgreSQL + TimescaleDB",
        "cache": "Redis",
        "queue": "RabbitMQ"
    },
    constraints=[
        "Must handle 1M events/hour",
        "Data retention: 90 days",
        "Dashboard load time < 2 seconds"
    ]
)

spec.save("specs/analytics-dashboard.json")
```

---

### Example 3: Internal Deployment Tool

Spec for an internal DevOps tool.

```python
from spec_creation import (
    StructuredSpec,
    UserStory,
    FunctionalRequirement,
    ProjectConstitution
)

spec = StructuredSpec(
    project_name="Internal Deployment Tool",
    overview="Automated deployment tool for internal services with pre-deployment checks and automatic rollback.",
    context_variables={"tenant": "internal", "department": "devops"}
)

# Stories
spec.add_user_story(UserStory(
    id="US-001",
    as_a="devops engineer",
    i_want="to deploy services with one command",
    so_that="I can deploy quickly and safely",
    acceptance_criteria=[
        "Single command triggers deployment",
        "Deploys to specified environment",
        "Shows deployment progress",
        "Notifies on completion"
    ],
    priority="critical",
    story_points=8
))

spec.add_user_story(UserStory(
    id="US-002",
    as_a="devops engineer",
    i_want="automatic rollback on failure",
    so_that="I can quickly recover from bad deployments",
    acceptance_criteria=[
        "Detects deployment failures",
        "Automatically rolls back to previous version",
        "Notifies team of rollback",
        "Preserves failure logs"
    ],
    priority="critical",
    story_points=5
))

# Requirements
spec.add_requirement(FunctionalRequirement(
    id="FR-001",
    title="Pre-Deployment Checks",
    description="Automated validation before deployment",
    priority="critical",
    dependencies=[],
    acceptance_tests=[
        "Runs unit tests",
        "Runs integration tests",
        "Checks configuration validity",
        "Verifies dependencies",
        "Blocks deployment if checks fail"
    ]
))

spec.add_requirement(FunctionalRequirement(
    id="FR-002",
    title="Zero-Downtime Deployment",
    description="Deploy without service interruption",
    priority="high",
    dependencies=["FR-001"],
    acceptance_tests=[
        "Uses blue-green deployment",
        "Health checks pass before switch",
        "No dropped connections during switch",
        "Can revert within 30 seconds"
    ]
))

# Constitution
spec.constitution = ProjectConstitution(
    vision="Streamline deployments with automation and safety checks",
    tech_stack={
        "language": "Python 3.11",
        "framework": "Custom CLI + Click",
        "orchestration": "Kubernetes",
        "ci_cd": "GitHub Actions",
        "monitoring": "Prometheus + Grafana"
    },
    quality_standards=[
        "100% test coverage required",
        "Type hints mandatory",
        "Deployment success rate > 99%",
        "Rollback < 30 seconds"
    ]
)

spec.save("specs/deployment-tool.json")
```

---

## Questioning Session Examples

### Example 1: E-commerce Questioning

```python
from spec_creation import StructuredSpec, QuestioningEngine

# Load spec
spec = StructuredSpec.load("specs/ecommerce-platform.json")

# Initialize engine
engine = QuestioningEngine()

# Generate questions for user stories
questions = engine.generate_questions("user_stories")

print("=" * 60)
print("USER STORIES QUESTIONING")
print("=" * 60)

for i, q in enumerate(questions, 1):
    print(f"\nQ{i}: [{q['priority'].upper()}] {q['question']}")
    if q.get('recommendation'):
        print(f"💡 {q['recommendation']}")

# Simulate adding answers
answers = {
    questions[0]['question']: "Admin features will be added in Phase 2",
    questions[1]['question']: "We'll support guest checkout for MVP"
}

for question, answer in answers.items():
    spec.add_clarification(question, answer)
    print(f"\n✓ Added clarification for: {question[:50]}...")

# Analyze gaps
gaps = engine.analyze_gaps(spec)

print(f"\n{'='*60}")
print("GAP ANALYSIS")
print(f"{'='*60}")

critical_gaps = [g for g in gaps if g['severity'] == 'critical']
print(f"\nCritical Gaps: {len(critical_gaps)}")

for gap in critical_gaps:
    print(f"\n[{gap['area']}] {gap['description']}")
    print(f"  Location: {gap['location']}")
    print(f"  Recommendation: {gap['recommendation']}")
```

**Output:**
```
============================================================
USER STORIES QUESTIONING
============================================================

Q1: [CRITICAL] You have no user stories for the 'admin' user type. Admin users typically need to manage products, orders, and customers. Should we add admin user stories?
💡 Consider adding stories for: product management, order fulfillment, customer management, and analytics dashboard.

Q2: [HIGH] Do we need guest checkout functionality, or should all users be required to create an account?
💡 For MVP, consider requiring account creation to simplify the checkout process. Guest checkout can be added later based on user feedback.

Q3: [MEDIUM] Should we include product reviews and ratings in the MVP?
💡 Product reviews can increase conversion but add complexity. Consider deferring to post-MVP unless competitors have this feature.

✓ Added clarification for: You have no user stories for the 'admin' user type...
✓ Added clarification for: Do we need guest checkout functionality...

============================================================
GAP ANALYSIS
============================================================

Critical Gaps: 2

[completeness] No user stories for order management functionality. Customers need to view order history and track orders.
  Location: user_stories
  Recommendation: Add story: "As a customer, I want to view my order history, so that I can track my purchases"

[feasibility] Constitution states 90-day timeline but requirements suggest complex features like real-time inventory management.
  Location: constitution.constraints vs requirements
  Recommendation: Either extend timeline to 120 days or defer real-time inventory to post-MVP
```

---

### Example 2: Interactive Questioning Session

```python
def interactive_questioning(spec_path):
    """Run interactive questioning session"""
    from spec_creation import StructuredSpec, QuestioningEngine

    spec = StructuredSpec.load(spec_path)
    engine = QuestioningEngine()

    sections = ["overview", "user_stories", "requirements", "constitution"]

    for section in sections:
        print(f"\n{'='*60}")
        print(f"SECTION: {section.upper()}")
        print(f"{'='*60}")

        questions = engine.generate_questions(section)

        if not questions:
            print("No questions for this section. ✓")
            continue

        for i, q in enumerate(questions, 1):
            print(f"\n[{i}/{len(questions)}] {q['priority'].upper()}")
            print(f"Q: {q['question']}")

            if q.get('recommendation'):
                print(f"Suggestion: {q['recommendation']}")

            answer = input("\nYour answer (or press Enter to skip): ").strip()

            if answer:
                spec.add_clarification(q['question'], answer)
                print("✓ Clarification added")

            if i < len(questions):
                cont = input("\nNext question? (Y/n): ").strip().lower()
                if cont == 'n':
                    break

    # Save updated spec
    base, ext = spec_path.rsplit('.', 1)
    updated_path = f"{base}-updated.{ext}"
    spec.save(updated_path)
    print(f"\n✓ Updated spec saved to: {updated_path}")

# Run session
# interactive_questioning("specs/ecommerce-platform.json")
```

---

## Validation Examples

### Example 1: Basic Validation

```python
from spec_creation import StructuredSpec
from spec_creation.validation import SpecValidator

# Load spec
spec = StructuredSpec.load("specs/ecommerce-platform.json")

# Validate
validator = SpecValidator()
result = validator.validate(spec)

# Print results
print("=" * 60)
print("VALIDATION RESULTS")
print("=" * 60)

print(f"\nOverall Score: {result.overall_score:.0f}%")
print(f"Valid: {'✅ Yes' if result.is_valid else '❌ No'}")

print("\nScore Breakdown:")
scores = {
    "Completeness": result.completeness_score,
    "Clarity": result.clarity_score,
    "Consistency": result.consistency_score,
    "Feasibility": result.feasibility_score,
    "Testability": result.testability_score
}

for category, score in scores.items():
    bar = "█" * int(score / 5)
    status = "✅" if score >= 80 else "⚠️" if score >= 60 else "❌"
    print(f"  {status} {category:15} {score:5.0f}% {bar}")

# Errors
if result.errors:
    print(f"\n❌ ERRORS ({len(result.errors)}):")
    for error in result.errors[:5]:
        print(f"  • {error['message']}")
        print(f"    Location: {error['location']}")

# Warnings
if result.warnings:
    print(f"\n⚠️  WARNINGS ({len(result.warnings)}):")
    for warning in result.warnings[:3]:
        print(f"  • {warning['message']}")
```

**Output:**
```
============================================================
VALIDATION RESULTS
============================================================

Overall Score: 82%
Valid: ✅ Yes

Score Breakdown:
  ✅ Completeness         85% ███████████████████
  ✅ Clarity              90% ████████████████████
  ⚠️  Consistency          75% ███████████████
  ✅ Feasibility          80% ███████████████
  ⚠️  Testability         78% ██████████████

❌ ERRORS (2):
  • No user stories for admin user type
    Location: user_stories
  • Missing acceptance criteria for US-005
    Location: user_stories.US-005

⚠️  WARNINGS (3):
  • Consider adding performance requirements
  • Some acceptance criteria are vague
  • Missing non-functional requirements
```

---

### Example 2: Auto-Fix Validation Issues

```python
from spec_creation import StructuredSpec
from spec_creation.validation import SpecValidator

# Load spec with issues
spec = StructuredSpec.load("specs/incomplete-spec.json")

# Validate
validator = SpecValidator()
result = validator.validate(spec)

print(f"Initial Score: {result.overall_score:.0f}%")
print(f"Errors: {len(result.errors)}")

# Auto-fix what we can
auto_fixable = [e for e in result.errors if e.get('auto_fixable')]
print(f"\nCan auto-fix {len(auto_fixable)} errors")

if auto_fixable:
    fixed_spec = validator.auto_fix(spec, result.errors)

    # Re-validate
    new_result = validator.validate(fixed_spec)
    print(f"\nAfter Auto-Fix:")
    print(f"  Score: {new_result.overall_score:.0f}% (was {result.overall_score:.0f}%)")
    print(f"  Errors: {len(new_result.errors)} (was {len(result.errors)})")

    # Save fixed version
    fixed_spec.save("specs/spec-fixed.json")
    print("✓ Fixed spec saved")

# Manual fixes still needed
manual = [e for e in new_result.errors if not e.get('auto_fixable')]
if manual:
    print(f"\nStill requires manual review: {len(manual)} issues")
    for issue in manual:
        print(f"  • {issue['message']}")
```

---

### Example 3: Domain-Specific Validation

```python
from spec_creation import StructuredSpec
from spec_creation.validation import SpecValidator

# Define e-commerce domain rules
ecommerce_rules = {
    "required_user_types": ["customer", "admin", "guest"],
    "required_sections": ["user_stories", "functional_requirements", "constitution"],
    "min_user_stories": 5,
    "min_requirements": 3,
    "required_tech_stack": ["frontend", "backend", "database"],
    "required_security": ["authentication", "authorization", "data_protection"],
    "required_performance": ["response_time", "concurrent_users"]
}

# Load spec
spec = StructuredSpec.load("specs/ecommerce-platform.json")

# Validate with domain rules
validator = SpecValidator()
result = validator.validate_with_domain_rules(
    spec,
    context={"domain": "ecommerce", "rules": ecommerce_rules}
)

print(f"E-commerce Compliance: {result.domain_compliance:.0f}%")

if result.missing_required_items:
    print(f"\nMissing Required Items:")
    for item in result.missing_required_items:
        print(f"  • {item}")

if result.rule_violations:
    print(f"\nRule Violations:")
    for violation in result.rule_violations:
        print(f"  • {violation['rule']}: {violation['issue']}")
```

---

## Integration Examples

### Example 1: Plan to Spec Conversion

```python
from spec_creation import spec_from_plan
from spec_creation.validation import SpecValidator
from spec_creation import QuestioningEngine

# Convert plan to spec
print("Converting plan to spec...")
spec = spec_from_plan(".plans/ecommerce-project")

print(f"✓ Spec created from plan")
print(f"  User Stories: {len(spec.user_stories)}")
print(f"  Requirements: {len(spec.functional_requirements)}")

# Validate
validator = SpecValidator()
result = validator.validate(spec)
print(f"\nValidation Score: {result.overall_score:.0f}%")

# Generate questions for improvement
engine = QuestioningEngine()
gaps = engine.analyze_gaps(spec)
print(f"Gaps Found: {len(gaps)}")

# Address critical gaps
for gap in gaps:
    if gap['severity'] == 'critical':
        print(f"\nCritical Gap: {gap['description']}")
        print(f"  Recommendation: {gap['recommendation']}")

# Save improved spec
spec.save("specs/ecommerce-from-plan.json")
print("\n✓ Improved spec saved")
```

---

### Example 2: Multi-Phase Integration

```python
# Phase 1: Context Variables
from context_variables import create_tenant_context

# Phase 2: Hierarchical Tasks
from hierarchical_tasks import create_task_tree

# Phase 3: Structured Specs
from spec_creation import StructuredSpec, spec_from_plan
from spec_creation.validation import SpecValidator

# Create tenant context
context = create_tenant_context(
    tenant_id="acme_001",
    tenant_data={"name": "Acme Corp", "tier": "enterprise"}
)

# Convert plan to spec with context
spec = spec_from_plan(".plans/ecommerce")
spec.context_variables = context

# Validate with context
validator = SpecValidator()
result = validator.validate_with_context(
    spec,
    context={"tier": "enterprise"}
)

# Create hierarchical tasks from spec
tasks = create_task_tree(
    [(req.title, req.description) for req in spec.functional_requirements]
)

print(f"Created {len(tasks)} hierarchical tasks from spec")

# Save everything
spec.save("specs/ecommerce-integrated.json")
save_tasks(tasks, ".plans/ecommerce/checklist.md")

print("✓ Integration complete")
```

---

### Example 3: Agent Handoff with Spec

```python
from agents import handoff_with_context
from spec_creation import StructuredSpec

# Analyst creates spec
spec = analyst_agent.create_spec(
    project_name="E-commerce",
    context={"phase": "analysis"}
)

# Handoff to architect
handoff_with_context(
    from_agent="analyst",
    to_agent="architect",
    context_vars={
        "spec": spec.to_dict(),
        "phase": "technical_review"
    },
    message="Spec created, please review technical feasibility"
)

# Architect reviews and enhances
spec = architect_agent.enhance_spec(
    spec=spec,
    tech_stack={"frontend": "Next.js", "backend": "FastAPI"}
)

# Handoff to validator
handoff_with_context(
    from_agent="architect",
    to_agent="validator",
    context_vars={
        "spec": spec.to_dict(),
        "phase": "validation"
    },
    message="Technical review complete, please validate"
)

# Validator validates
from spec_creation.validation import SpecValidator
validator = SpecValidator()
result = validator.validate(spec)

if result.is_valid:
    # Handoff to implementation
    handoff_with_context(
        from_agent="validator",
        to_agent="developer",
        context_vars={"spec": spec.to_dict()},
        message="Spec validated, ready for implementation"
    )
else:
    print(f"Validation failed: {len(result.errors)} errors")
```

---

## Conclusion

These examples demonstrate real-world usage of Phase 3 (Structured Spec Creation) in various scenarios:

**Key Examples:**
1. **E-commerce Platform** - Complete spec with stories, requirements, constitution
2. **SaaS Analytics** - Feature-focused spec for existing platform
3. **Internal Tool** - DevOps automation tool with strict quality standards
4. **Questioning Sessions** - Interactive and automated gap analysis
5. **Validation** - Basic, auto-fix, and domain-specific validation
6. **Integration** - Plan-to-spec conversion and multi-phase workflows

**Next Steps:**
- Try examples with your own projects
- Read [API Reference](API-REFERENCE.md)
- Read [Integration Guide](INTEGRATION-GUIDE.md)
