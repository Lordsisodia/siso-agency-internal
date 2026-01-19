# Blackbox3 Planning Module

Comprehensive planning system for epics, stories, PRDs, and architecture management.

## Features

### EpicManager
- **Hierarchical Breakdown**: Epic → Story → Task hierarchy
- **Dependency Management**: Track dependencies with cycle detection
- **Progress Tracking**: Weighted estimates and completion percentages
- **Timeline Generation**: Automatic timeline based on estimates
- **Multi-format Export**: JSON, Markdown, CSV
- **Priority & Status**: Full workflow support

### StoryManager
- **Acceptance Criteria**: Track and validate story requirements
- **Definition of Done**: Checklist-based DoD tracking
- **Technical Tasks**: Break down stories into implementation tasks
- **Story Types**: Feature, bugfix, chore, spike, refactor
- **Readiness Checks**: Validate stories before sprint inclusion
- **Test Coverage**: Track testing progress
- **Peer Review**: Assign and track reviewers

### PRDManager
- **Template System**: Configurable PRD templates
- **Validation**: Automatic completeness validation
- **Approval Workflow**: Multi-step approval tracking
- **Versioning**: Create and track PRD versions
- **Stakeholder Management**: Track stakeholders and roles
- **Section Management**: granular section updates

### ArchitectureManager
- **Component Modeling**: Define system components and relationships
- **Dependency Graphs**: Generate and visualize dependencies
- **Technical Decision Records**: Track architectural decisions
- **Data Flow Documentation**: Map system data flows
- **Technology Stack**: Track technologies and interfaces

## Installation

```bash
# Install from requirements
pip install -r modules/planning/requirements.txt
```

## Quick Start

### Epic Management

```python
from modules.planning import EpicManager

# Initialize
epic_mgr = EpicManager()

# Create epic
epic_id = epic_mgr.create_epic(
    title="User Authentication System",
    description="Implement secure user authentication",
    priority=EpicPriority.HIGH,
    estimate_days=14
)

# Add story to epic
story_id = epic_mgr.add_story_to_epic(
    epic_id,
    title="Login page",
    description="Create user login interface",
    estimate_points=5
)

# Add task to story
task_id = epic_mgr.add_task_to_story(
    story_id,
    title="Design login form",
    description="Create responsive login form UI",
    estimate_hours=4.0
)

# Get progress
progress = epic_mgr.get_epic_progress(epic_id)
print(f"Progress: {progress['progress_percent']:.1f}%")
```

### Story Management

```python
from modules.planning import StoryManager

# Initialize
story_mgr = StoryManager()

# Create story
story_id = story_mgr.create_story(
    title="User registration",
    description="As a user, I want to register...",
    story_type=StoryType.FEATURE,
    estimate_points=8
)

# Add acceptance criteria
story_mgr.add_acceptance_criteria(story_id, [
    "User can register with email",
    "Email verification is sent",
    "Password validation works"
])

# Add definition of done
story_mgr.add_definition_of_done(story_id, [
    "Code reviewed",
    "Unit tests written",
    "Documentation updated"
])

# Check readiness
readiness = story_mgr.get_story_readiness(story_id)
print(f"Ready for sprint: {readiness['ready']}")
```

### PRD Management

```python
from modules.planning import PRDManager

# Initialize
prd_mgr = PRDManager()

# Create PRD
prd_id = prd_mgr.create_prd(
    title="Mobile App v2.0",
    template_name="default"
)

# Update sections
prd_mgr.update_section(prd_id, "executive_summary", "Summary...")
prd_mgr.update_section(prd_id, "goals", ["Goal 1", "Goal 2"])

# Validate
validation = prd_mgr.validate_prd(prd_id)
print(f"Valid: {validation['valid']}")

# Submit for approval
prd_mgr.submit_for_approval(prd_id)

# Approve
prd_mgr.approve_prd(prd_id, "product_manager", "John Doe")
```

### Architecture Management

```python
from modules.planning import ArchitectureManager

# Initialize
arch_mgr = ArchitectureManager()

# Create architecture
arch_id = arch_mgr.create_architecture(
    name="Microservices Architecture",
    description="System architecture overview",
    scope="system"
)

# Add components
auth_service = arch_mgr.add_component(
    arch_id,
    name="Auth Service",
    component_type="service",
    description="Authentication and authorization",
    technologies=["Node.js", "Express", "JWT"]
)

user_service = arch_mgr.add_component(
    arch_id,
    name="User Service",
    component_type="service",
    description="User management"
)

# Add dependency
arch_mgr.add_dependency(user_service, auth_service, "uses")

# Generate dependency graph
graph = arch_mgr.generate_dependency_graph(arch_id)

# Create TDR
tdr_id = arch_mgr.create_tdr(
    title="Use Microservices Architecture",
    context="Need scalable system...",
    decision="Adopt microservices...",
    consequences=["Increased complexity", "Better scalability"]
)
```

## CLI Usage

### Epic Manager CLI

```bash
# Create epic
python -m modules.planning.epic create \
  --title "User Auth" \
  --description "Implement authentication" \
  --priority high

# Add story to epic
python -m modules.planning.epic create \
  --epic-id abc123 \
  --title "Login page" \
  --description "Create login UI" \
  --estimate 5

# List epics
python -m modules.planning.epic list

# Show epic hierarchy
python -m modules.planning.epic show --id abc123

# Export to markdown
python -m modules.planning.epic export --id abc123 --output epic.md
```

### Story Manager CLI

```bash
# Create story
python -m modules.planning.story create \
  --title "User registration" \
  --description "As a user, I want to register..." \
  --type feature \
  --points 8

# Add technical task
python -m modules.planning.story task \
  --id abc123 \
  --task-title "Design form" \
  --task-desc "Create responsive form"

# Check readiness
python -m modules.planning.story readiness --id abc123

# Export story
python -m modules.planning.story export --id abc123 --output story.md
```

### PRD Manager CLI

```bash
# Create PRD
python -m modules.planning.prd create \
  --title "Mobile App v2.0"

# Update section
python -m modules.planning.prd update \
  --id abc123 \
  --section executive_summary \
  --content "Summary text..."

# Validate
python -m modules.planning.prd validate --id abc123

# Submit for approval
python -m modules.planning.prd submit --id abc123

# Approve
python -m modules.planning.prd approve \
  --id abc123 \
  --role product_manager \
  --approver "John Doe"
```

### Architecture Manager CLI

```bash
# Create architecture
python -m modules.planning.architecture create-arch \
  --name "Microservices" \
  --description "System architecture" \
  --scope system

# Add component
python -m modules.planning.architecture add-comp \
  --id abc123 \
  --name "Auth Service" \
  --type service \
  --description "Authentication service"

# Add dependency
python -m modules.planning.architecture add-dep \
  --id user_service_id \
  --depends-on auth_service_id

# Export
python -m modules.planning.architecture export-arch --id abc123
```

## Architecture

```
Epic (Project-level)
    ↓
    ├─ Stories (Feature-level)
    │   ↓
    │   └─ Tasks (Implementation-level)
    │
    ├─ PRD (Requirements document)
    │   ├─ Executive Summary
    │   ├─ Problem Statement
    │   ├─ Goals
    │   ├─ User Stories
    │   ├─ Requirements
    │   └─ Success Metrics
    │
    └─ Architecture
        ├─ Components
        ├─ Dependencies
        ├─ Data Flows
        └─ TDRs (Technical Decision Records)
```

## Workflows

### Epic Workflow

```
DRAFT → PLANNED → IN_PROGRESS → REVIEW → COMPLETED
                                  ↓
                              BLOCKED
```

### Story Workflow

```
BACKLOG → REFINED → ESTIMATED → IN_PROGRESS → IN_REVIEW → DONE
                                                      ↓
                                                  BLOCKED
```

### PRD Workflow

```
DRAFT → IN_REVIEW → APPROVED → IMPLEMENTED → ARCHIVED
           ↓
       REJECTED
```

## Advanced Features

### Dependency Cycle Detection

```python
# Automatically detects circular dependencies
story_id = epic_mgr.add_story_to_epic(
    epic_id,
    "Story A",
    "Description",
    dependencies=["story_b"]
)

# If story_b depends on story_a, this will fail
epic_mgr.add_story_to_epic(
    epic_id,
    "Story B",
    "Description",
    dependencies=["story_a"]  # Cycle detected!
)
```

### Custom PRD Templates

Create `templates/custom.json`:

```json
{
  "name": "Custom Template",
  "sections": {
    "vision": {"required": true, "type": "text"},
    "scope": {"required": true, "type": "text"},
    "assumptions": {"required": false, "type": "list"}
  }
}
```

Use it:

```python
prd = prd_mgr.create_prd("Title", template_name="custom")
```

### Story Spike Support

```python
# Create research spike
spike_id = story_mgr.create_story(
    title="Investigate technology X",
    description="Research spike for...",
    story_type=StoryType.SPIKE
)

# Record outcome
story_mgr.record_spike_outcome(spike_id, {
    "recommendation": "Use technology X",
    "pros": ["Fast", "Scalable"],
    "cons": ["Complex"],
    "proof_of_concept": "Link to repo..."
})
```

## File Structure

```
modules/planning/
├── __init__.py           # Module initialization
├── epic.py              # EpicManager class
├── story.py             # StoryManager class
├── prd.py               # PRDManager class
├── architecture.py      # ArchitectureManager class
├── requirements.txt     # Dependencies
├── README.md           # This file
├── agents/             # Planning agents
├── runtime/            # Runtime scripts
├── templates/          # PRD templates
└── workflows/          # Planning workflows
```

## Data Storage

All planning data is stored in `agents/.plans/` directory:

```
agents/.plans/
├── epics.json              # Epic data
├── stories.json            # Story data
├── stories_detailed.json   # Detailed story data
├── tasks.json              # Task data
├── dependencies.json       # Dependency graph
├── prds.json               # PRD data
├── prd_workflows.json      # Approval workflows
├── architectures.json      # Architecture data
├── components.json         # Component data
├── tdrs.json              # Technical Decision Records
└── arch_dependencies.json  # Architecture dependencies
```

## Use Cases

1. **Project Planning**: Break down large features into epics and stories
2. **Sprint Planning**: Validate stories and estimate effort
3. **Requirements Management**: Create and maintain PRDs with approval workflows
4. **Architecture Documentation**: Track system components and decisions
5. **Progress Tracking**: Monitor completion percentages and timelines
6. **Dependency Management**: Visualize and manage interdependencies
7. **Team Coordination**: Assign tasks and track peer reviews

## Best Practices

1. **Epic Size**: Keep epics to 1-4 weeks of work
2. **Story Size**: Target 3-8 story points per story
3. **DoD**: Always include definition of done checklist
4. **Acceptance Criteria**: Minimum 3 criteria per story
5. **Dependencies**: Minimize cross-story dependencies
6. **TDRs**: Record all significant architectural decisions
7. **Validation**: Always validate PRDs before submission

## License

MIT License - See LICENSE file for details

## Contributing

Contributions welcome! Please read CONTRIBUTING.md for guidelines.

## Support

For issues and questions:
- GitHub: https://github.com/Lordsisodia/blackbox3
- Documentation: See `.docs/` directory
