# Integration Guide

**Version:** 1.0.0
**Last Updated:** 2026-01-15
**Phase:** 3 - Structured Spec Creation

---

## Table of Contents

1. [Overview](#overview)
2. [Integration with Existing Blackbox4](#integration-with-existing-blackbox4)
3. [Migration Guide](#migration-guide)
4. [Context Variables Usage](#context-variables-usage)
5. [Agent Handoff Patterns](#agent-handoff-patterns)
6. [Plan to Spec Conversion](#plan-to-spec-conversion)
7. [Backward Compatibility](#backward-compatibility)
8. [Examples](#examples)

---

## Overview

Phase 3 (Structured Spec Creation) integrates seamlessly with existing Blackbox4 components and previous phases. This guide explains how to use spec creation with context variables (Phase 1), hierarchical tasks (Phase 2), and other Blackbox4 systems.

### Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Blackbox4                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Phase 1    │    │   Phase 2    │    │   Phase 3    │  │
│  │   Context    │───→│  Hierarchical│───→│  Structured  │  │
│  │  Variables   │    │    Tasks     │    │     Specs    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         ↓                    ↓                    ↓          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Shared Integration Points               │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  • Planning Module  • Kanban Module  • Documentation  │   │
│  │  • Agent Handoff    • Validation     • CLI Tools      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Integration with Existing Blackbox4

### Planning Module Integration

Specs inform and are informed by project planning.

```python
from spec_creation import StructuredSpec, spec_from_plan
from spec_creation.validation import SpecValidator

# 1. Create spec from plan
spec = spec_from_plan(".plans/ecommerce-project")

# Plan checklist.md structure:
# - [ ] Setup project structure
# - [ ] Design database schema
# - [ ] Implement user authentication
# ↓
# Spec structure:
# - User stories
# - Functional requirements
# - Technical constraints

# 2. Validate spec completeness
validator = SpecValidator()
result = validator.validate(spec)

# 3. Export spec back to plan
spec.export_to_plan(".plans/ecommerce-project-updated")

# 4. Create hierarchical tasks from spec
from hierarchical_tasks import create_task_tree

tasks = create_task_tree(
    [(req['title'], req['description']) for req in spec.functional_requirements]
)
```

**Planning Workflow:**
```
Plan (checklist.md)
    ↓
Spec (structured requirements)
    ↓
Validate (check completeness)
    ↓
Hierarchical Tasks (breakdown)
    ↓
Kanban Cards (execution)
```

### Kanban Module Integration

User stories and requirements become kanban cards.

```python
from spec_creation import StructuredSpec
from kanban import create_card, update_card_status

# Load spec
spec = StructuredSpec.load("specs/ecommerce.json")

# Create kanban cards from user stories
for story in spec.user_stories:
    card = create_card(
        title=story.i_want,
        description=story.so_that,
        type="user_story",
        priority=story.priority,
        story_points=story.story_points,
        acceptance_criteria=story.acceptance_criteria
    )

    # Link card to story
    story.kanban_card_id = card.id

# Create kanban cards from requirements
for req in spec.functional_requirements:
    card = create_card(
        title=req.title,
        description=req.description,
        type="requirement",
        priority=req.priority,
        dependencies=req.dependencies
    )

    # Link card to requirement
    req.kanban_card_id = card.id

# Update card status as work progresses
story.kanban_card_id = update_card_status(
    story.kanban_card_id,
    status="in_progress"
)

# Sync progress back to spec
spec.update_kanban_progress()
```

**Kanban Workflow:**
```
Spec User Story
    ↓
Kanban Card Created
    ↓
Work in Progress
    ↓
Card Completed
    ↓
Story Marked Complete
```

### Documentation Module Integration

PRDs become part of project documentation.

```python
from spec_creation import StructuredSpec
from documentation import generate_docs, index_document

# Load spec
spec = StructuredSpec.load("specs/ecommerce.json")

# Generate PRD
prd_path = spec.save("specs/ecommerce.json")
# Creates:
# - specs/ecommerce.json (machine-readable)
# - specs/ecommerce-prd.md (human-readable)

# Add to documentation index
index_document(
    title="E-commerce Platform PRD",
    path=prd_path,
    type="prd",
    tags=["requirements", "ecommerce", "v1.0"]
)

# Auto-generate API documentation from requirements
api_docs = generate_api_docs(spec.functional_requirements)
generate_docs("api", api_docs)

# Update project README with spec overview
update_readme(
    section="overview",
    content=spec.overview
)
```

**Documentation Workflow:**
```
Spec Created
    ↓
PRD Generated
    ↓
Indexed in Docs
    ↓
Linked to Project
    ↓
Auto-Updated on Changes
```

### Validation Module Integration

Specs integrate with Blackbox4's validation framework.

```python
from spec_creation import StructuredSpec
from spec_creation.validation import SpecValidator
from validation import validate_domain_rules

# Load spec
spec = StructuredSpec.load("specs/ecommerce.json")

# Spec-level validation
spec_validator = SpecValidator()
spec_result = spec_validator.validate(spec)

# Domain-level validation
domain_result = validate_domain_rules(
    spec.to_dict(),
    domain="ecommerce",
    rules={
        "required_features": ["user_auth", "product_catalog", "checkout"],
        "security_level": "high",
        "performance": {"response_time": "< 200ms"}
    }
)

# Cross-validation
if spec_result.is_valid and domain_result.is_valid:
    print("✅ Spec and domain validation passed")
else:
    print("❌ Validation failed")
    if not spec_result.is_valid:
        print(f"  Spec errors: {len(spec_result.errors)}")
    if not domain_result.is_valid:
        print(f"  Domain errors: {len(domain_result.errors)}")
```

---

## Migration Guide

### Migrating from Existing Plans

Convert existing Blackbox4 plans to structured specs.

```python
from spec_creation import spec_from_plan

# Convert plan to spec
spec = spec_from_plan(".plans/existing-project")

# Plan structure:
# .plans/existing-project/
#   ├── plan.md
#   ├── checklist.md
#   ├── notes.md
#   └── artifacts/

# Spec structure:
# {
#   "project_name": "Existing Project",
#   "overview": "Extracted from plan.md",
#   "user_stories": [...],  # Extracted from checklist.md
#   "functional_requirements": [...],
#   "constitution": {...}  # Extracted from notes.md
# }

# Save spec
spec.save("specs/existing-project.json")

# Compare plan vs spec
print(f"Plan tasks: {len(plan.checklist_items)}")
print(f"Spec stories: {len(spec.user_stories)}")
print(f"Spec requirements: {len(spec.functional_requirements)}")
```

### Migrating from Manual Specs

Convert manual markdown specs to structured specs.

```python
from spec_creation import StructuredSpec, UserStory, FunctionalRequirement
import re

# Load manual spec
with open("docs/manual-spec.md", "r") as f:
    manual_spec = f.read()

# Parse user stories
story_pattern = r"### (.*?)\nAs a (.*?), I want (.*?), so that (.*?)"
for match in re.finditer(story_pattern, manual_spec):
    story_id, as_a, i_want, so_that = match.groups()
    spec.add_user_story(UserStory(
        id=story_id,
        as_a=as_a.strip(),
        i_want=i_want.strip(),
        so_that=so_that.strip()
    ))

# Parse requirements
req_pattern = r"## (.*?)\n(.*?)\n\n- (.*)"
for match in re.finditer(req_pattern, manual_spec):
    title, description, acceptance = match.groups()
    spec.add_requirement(FunctionalRequirement(
        title=title.strip(),
        description=description.strip(),
        acceptance_tests=acceptance.strip().split("\n- ")
    ))

# Save structured spec
spec.save("specs/migrated-spec.json")
```

### Migrating from Other Tools

Convert from JIRA, GitHub Projects, etc.

```python
from spec_creation import StructuredSpec, UserStory
from jira import JIRA

# Connect to JIRA
jira = JIRA(server="https://jira.example.com")

# Get issues from project
issues = jira.search_issues("project=ECOM AND type=Story")

# Convert to spec
spec = StructuredSpec(
    project_name="E-commerce Platform",
    overview="Migrated from JIRA project ECOM"
)

for issue in issues:
    # Parse JIRA story format
    # "As a {role}, I want {feature}, so that {benefit}"
    description = issue.fields.description

    spec.add_user_story(UserStory(
        id=f"US-{issue.key}",
        as_a=extract_role(description),
        i_want=extract_feature(description),
        so_that=extract_benefit(description),
        acceptance_criteria=extract_acceptance(issue)
    ))

# Save migrated spec
spec.save("specs/jira-migration.json")
```

---

## Context Variables Usage

Context variables from Phase 1 integrate with spec creation.

### Multi-Tenant Specs

Create specs for different tenants/clients.

```python
from spec_creation import StructuredSpec, UserStory

# Tenant-specific spec
spec = StructuredSpec(
    project_name="E-commerce Platform",
    overview="Platform for small businesses",
    context_variables={
        "tenant": "acme",
        "tier": "enterprise",
        "region": "us-east"
    }
)

# Context-aware stories
if spec.context_variables.get("tier") == "enterprise":
    # Add enterprise features
    spec.add_user_story(UserStory(
        id="US-ENT-001",
        as_a="enterprise admin",
        i_want="advanced analytics",
        so_that="I can track business metrics"
    ))

# Save tenant-specific spec
tenant_id = spec.context_variables["tenant"]
spec.save(f"specs/{tenant_id}-ecommerce.json")
```

### Dynamic Questioning

Use context in questioning engine.

```python
from spec_creation import QuestioningEngine

engine = QuestioningEngine()

# Generate questions based on context
context = {
    "phase": "mvp",
    "timeline": "3 months",
    "team_size": 5
}

questions = engine.generate_questions(
    "requirements",
    context=context
)

# Questions will be context-aware:
# - "Given 3-month timeline, is AI recommendation engine feasible?"
# - "With 5-person team, should we use managed services?"
```

### Context-Aware Validation

Validate with context rules.

```python
from spec_creation.validation import SpecValidator

validator = SpecValidator()

# MVP context - strict validation
mvp_context = {
    "phase": "mvp",
    "max_stories": 10,
    "max_requirements": 15,
    "forbidden_features": ["ai", "ml", "blockchain"]
}

result = validator.validate_with_context(
    spec,
    context=mvp_context
)

# Checks:
# - Story count <= 10
# - Requirement count <= 15
# - No AI/ML/blockchain features
```

---

## Agent Handoff Patterns

Specs integrate with agent handoff system.

### Spec Creation Agent Handoff

```python
from agents import handoff_with_context
from spec_creation import StructuredSpec

# Analyst agent creates initial spec
analyst_context = {
    "agent": "analyst",
    "task": "spec_creation",
    "spec_type": "ecommerce"
}

# Analyst gathers requirements
spec = analyst_agent.create_spec(
    requirements=gather_requirements(),
    context=analyst_context
)

# Handoff to architect for technical review
handoff_with_context(
    from_agent="analyst",
    to_agent="architect",
    context_vars=analyst_context,
    message="Spec created, please review technical feasibility"
)

# Architect reviews and adds technical requirements
architect_context = analyst_context.copy()
architect_context["agent"] = "architect"

spec = architect_agent.review_spec(
    spec=spec,
    context=architect_context
)

# Handoff to validator
handoff_with_context(
    from_agent="architect",
    to_agent="validator",
    context_vars=architect_context,
    message="Technical review complete, please validate"
)

# Validator validates
validator_context = architect_context.copy()
validator_context["agent"] = "validator"

result = validator_agent.validate_spec(
    spec=spec,
    context=validator_context
)
```

### Progressive Spec Refinement

Multiple agents collaborate on spec.

```python
# 1. Product Manager creates initial spec
spec = pm_agent.create_spec(
    project_name="E-commerce",
    context={"phase": "initial"}
)

# Handoff to Business Analyst
handoff_with_context(
    "product_manager",
    "business_analyst",
    context={"spec": spec.to_dict()},
    message="Gather detailed requirements"
)

# 2. Business Analyst adds user stories
spec = ba_agent.add_user_stories(
    spec=spec,
    stories=interview_stakeholders(),
    context={"phase": "analysis"}
)

# Handoff to Technical Lead
handoff_with_context(
    "business_analyst",
    "tech_lead",
    context={"spec": spec.to_dict()},
    message="Add technical requirements"
)

# 3. Technical Lead adds requirements
spec = tech_lead.add_requirements(
    spec=spec,
    requirements=design_architecture(),
    context={"phase": "design"}
)

# Handoff to QA Engineer
handoff_with_context(
    "tech_lead",
    "qa_engineer",
    context={"spec": spec.to_dict()},
    message="Add acceptance criteria"
)

# 4. QA adds acceptance criteria
spec = qa.add_acceptance_criteria(
    spec=spec,
    criteria=define_tests(),
    context={"phase": "testing"}
)

# Final spec ready
spec.save("specs/final-spec.json")
```

---

## Plan to Spec Conversion

Convert hierarchical plans to structured specs.

### Full Conversion Pipeline

```python
from spec_creation import StructuredSpec, spec_from_plan
from hierarchical_tasks import HierarchicalPlanManager

# 1. Load hierarchical plan
plan_manager = HierarchicalPlanManager(".plans/ecommerce")
plan_manager.load_from_checklist()

# 2. Convert to spec
spec = spec_from_plan(".plans/ecommerce")

# 3. Enhance with questions
from spec_creation import QuestioningEngine
engine = QuestioningEngine()

gaps = engine.analyze_gaps(spec)
for gap in gaps:
    if gap['severity'] == 'critical':
        # Address gap or add clarification
        pass

# 4. Validate
from spec_creation.validation import SpecValidator
validator = SpecValidator()
result = validator.validate(spec)

# 5. Save
if result.is_valid:
    spec.save("specs/ecommerce-from-plan.json")
    print("✅ Plan converted to spec successfully")
else:
    print(f"❌ Validation failed: {len(result.errors)} errors")
```

### Bidirectional Sync

Keep plans and specs in sync.

```python
# Plan changes → Spec updates
plan_manager.update_task(task_id, status="complete")
spec.sync_from_plan(".plans/ecommerce")

# Spec changes → Plan updates
spec.add_user_story(new_story)
spec.sync_to_plan(".plans/ecommerce")

# Bi-directional sync
spec.sync_bidirectional(".plans/ecommerce")
```

---

## Backward Compatibility

Phase 3 maintains backward compatibility with existing Blackbox4 workflows.

### Existing Planning Workflows

All existing planning scripts continue to work.

```bash
# These still work exactly as before
cd .blackbox4
./new-plan.sh "my-project"
./new-step.sh .plans/my-project "Add new feature"
./hierarchical-plan.sh .plans/my-project validate

# New spec creation is additive
./spec-create.sh import --plan .plans/my-project --output specs/my-spec.json
```

### Context Variables (Phase 1)

Phase 3 fully supports Phase 1 context variables.

```python
# Context variables work exactly as in Phase 1
from context_variables import create_tenant_context
from spec_creation import StructuredSpec

# Create tenant context
context = create_tenant_context(
    tenant_id="acme_001",
    tenant_data={"name": "Acme Corp", "tier": "enterprise"}
)

# Use in spec
spec = StructuredSpec(
    project_name="E-commerce",
    context_variables=context
)

# Context preserved in handoffs
handoff_with_context(
    "analyst",
    "architect",
    context_vars=context,  # Phase 1 context
    message="Review spec"
)
```

### Hierarchical Tasks (Phase 2)

Phase 3 integrates with Phase 2 hierarchical tasks.

```python
from hierarchical_tasks import HierarchicalTask, create_task
from spec_creation import StructuredSpec

# Create spec
spec = StructuredSpec(project_name="E-commerce")

# Convert requirements to hierarchical tasks
for req in spec.functional_requirements:
    task = create_task(
        req['title'],
        parent=None,
        metadata={"requirement_id": req['id']}
    )

    # Add subtasks for acceptance tests
    for test in req['acceptance_tests']:
        subtask = create_task(
            test,
            parent=task,
            metadata={"test_case": True}
        )

# Save both spec and tasks
spec.save("specs/ecommerce.json")
save_tasks_to_checklist(tasks, ".plans/ecommerce/checklist.md")
```

### No Breaking Changes

All existing functionality preserved:

```python
# ✓ Old way still works
plan = create_plan("my-project")
add_task(plan, "Task 1")
add_task(plan, "Task 2")

# ✓ New way is additive
spec = StructuredSpec(project_name="My Project")
spec.add_user_story(...)
spec.add_requirement(...)

# ✓ Can use both together
spec = spec_from_plan(".plans/my-project")
enhanced_spec = enhance_spec(spec)
enhanced_spec.export_to_plan(".plans/my-project-enhanced")
```

---

## Examples

### Example 1: Complete Workflow

```python
# Complete Phase 1 + 2 + 3 workflow

from context_variables import create_tenant_context
from hierarchical_tasks import HierarchicalPlanManager
from spec_creation import StructuredSpec, spec_from_plan
from spec_creation.validation import SpecValidator
from spec_creation import QuestioningEngine

# 1. Create tenant context (Phase 1)
context = create_tenant_context(
    tenant_id="acme_001",
    tenant_data={
        "name": "Acme Corp",
        "tier": "enterprise",
        "phase": "mvp"
    }
)

# 2. Load hierarchical plan (Phase 2)
plan_manager = HierarchicalPlanManager(".plans/ecommerce")
plan_manager.load_from_checklist()

# 3. Convert to spec (Phase 3)
spec = spec_from_plan(".plans/ecommerce")
spec.context_variables = context

# 4. Generate questions
engine = QuestioningEngine()
gaps = engine.analyze_gaps(spec)

# 5. Address gaps
for gap in gaps:
    if gap['severity'] == 'critical':
        answer = get_stakeholder_input(gap['description'])
        spec.add_clarification(gap['description'], answer)

# 6. Validate
validator = SpecValidator()
result = validator.validate_with_context(
    spec,
    context=context
)

# 7. Save
if result.is_valid:
    spec.save("specs/ecommerce-final.json")
    print("✅ Complete workflow successful")
```

### Example 2: Multi-Agent Collaboration

```python
# Multi-agent spec creation with handoffs

# Agent 1: Business Analyst
spec = ba_agent.create_initial_spec(
    project="E-commerce",
    context={"phase": "analysis"}
)

handoff_with_context(
    "business_analyst",
    "product_manager",
    context={"spec": spec.to_dict()},
    message="Initial spec created, please review"
)

# Agent 2: Product Manager
spec = pm_agent.review_and_refine(
    spec=spec,
    feedback=gather_feedback(),
    context={"phase": "review"}
)

handoff_with_context(
    "product_manager",
    "architect",
    context={"spec": spec.to_dict()},
    message="Spec reviewed, add technical requirements"
)

# Agent 3: Architect
spec = architect.add_technical_requirements(
    spec=spec,
    tech_stack={"frontend": "Next.js", "backend": "FastAPI"},
    context={"phase": "design"}
)

handoff_with_context(
    "architect",
    "validator",
    context={"spec": spec.to_dict()},
    message="Technical requirements added, validate spec"
)

# Agent 4: Validator
result = validator.validate(spec)
if result.is_valid:
    spec.save("specs/final-spec.json")
    handoff_with_context(
        "validator",
        "kanban",
        context={"spec": spec.to_dict()},
        message="Spec validated, create kanban cards"
    )
```

### Example 3: Continuous Improvement

```python
# Iterative spec improvement

spec = StructuredSpec.load("specs/ecommerce.json")

# Iteration 1
engine = QuestioningEngine()
gaps = engine.analyze_gaps(spec)
print(f"Iteration 1: {len(gaps)} gaps")

address_critical_gaps(spec, gaps)
spec.save("specs/ecommerce-v2.json")

# Iteration 2
spec = StructuredSpec.load("specs/ecommerce-v2.json")
gaps = engine.analyze_gaps(spec)
print(f"Iteration 2: {len(gaps)} gaps")

address_all_gaps(spec, gaps)
spec.save("specs/ecommerce-v3.json")

# Iteration 3
spec = StructuredSpec.load("specs/ecommerce-v3.json")
validator = SpecValidator()
result = validator.validate(spec)
print(f"Iteration 3: {result.overall_score:.0f}%")

if result.overall_score >= 90:
    print("✅ Spec is excellent!")
    spec.save("specs/ecommerce-final.json")
```

---

## Conclusion

Phase 3 integrates seamlessly with existing Blackbox4 components and previous phases. By following this integration guide, you can leverage spec creation with context variables, hierarchical tasks, and other Blackbox4 systems.

**Key Takeaways:**
- Specs integrate with planning, kanban, and documentation
- Full backward compatibility maintained
- Context variables work across all phases
- Agent handoffs preserve spec context
- Plans and specs can be bidirectionally synced

**Next Steps:**
- Read [API Reference](API-REFERENCE.md)
- Explore [Examples](EXAMPLES.md)
- Read [Phase 3 Complete](PHASE3-COMPLETE.md)
